#!/bin/bash

set -e

BACKUP_FILE="clickhouse_backup_20251202_223436.sql"
CONTAINER="dev-env-isolated-clickhouse-1"

echo "=== ClickHouse Full Table Restore ==="
echo ""

# Get all table names from backup
echo "Extracting table list from backup..."
TABLES=($(grep "^CREATE TABLE" "$BACKUP_FILE" | sed 's/^CREATE TABLE //' | sed 's/\\n.*//' | sort))

echo "Found ${#TABLES[@]} tables in backup"
echo ""

# Get currently loaded tables
LOADED_TABLES=($(docker exec $CONTAINER clickhouse-client --query "SHOW TABLES FROM default" | sort))

echo "Currently loaded: ${#LOADED_TABLES[@]} tables"
echo ""

# Process each table
TABLE_NUM=0
SKIPPED=0
RESTORED=0
FAILED=0

for TABLE in "${TABLES[@]}"; do
    TABLE_NUM=$((TABLE_NUM + 1))
    TABLE_NAME=$(echo $TABLE | sed 's/default\.//')
    
    # Check if already loaded
    if [[ " ${LOADED_TABLES[@]} " =~ " ${TABLE_NAME} " ]]; then
        echo "[$TABLE_NUM/${#TABLES[@]}] SKIP: $TABLE_NAME (already loaded)"
        SKIPPED=$((SKIPPED + 1))
        continue
    fi
    
    echo "[$TABLE_NUM/${#TABLES[@]}] Processing: $TABLE_NAME"
    
    # Find CREATE TABLE statement line
    CREATE_LINE=$(grep -n "^CREATE TABLE $TABLE" "$BACKUP_FILE" | cut -d: -f1)
    
    if [ -z "$CREATE_LINE" ]; then
        echo "  ERROR: Could not find CREATE TABLE for $TABLE_NAME"
        FAILED=$((FAILED + 1))
        continue
    fi
    
    # Find the end of CREATE TABLE (next line starting with table name in quotes or next CREATE/comment)
    DATA_START=$(awk -v start=$CREATE_LINE 'NR>start && /^"[^"]+","[^"]+"/{ print NR; exit }' "$BACKUP_FILE")
    
    if [ -z "$DATA_START" ]; then
        echo "  No data found, creating empty table"
        # Extract just the CREATE TABLE statement
        sed -n "${CREATE_LINE}p" "$BACKUP_FILE" | sed 's/\\n/\n/g' | docker exec -i $CONTAINER clickhouse-client --multiquery 2>&1 | grep -v "^$" || true
        RESTORED=$((RESTORED + 1))
        continue
    fi
    
    # Find where data ends (next CREATE TABLE or comment line)
    DATA_END=$(awk -v start=$DATA_START 'NR>=start && (/^CREATE TABLE/ || /^--/){ print NR-1; exit } END { if (NR >= start) print NR }' "$BACKUP_FILE")
    
    # Create table
    echo "  Creating table..."
    sed -n "${CREATE_LINE}p" "$BACKUP_FILE" | sed 's/\\n/\n/g' | docker exec -i $CONTAINER clickhouse-client --multiquery 2>&1 | grep -v "^$" || {
        echo "  ERROR: Failed to create table"
        FAILED=$((FAILED + 1))
        continue
    }
    
    # Insert data if exists
    if [ "$DATA_START" -lt "$DATA_END" ]; then
        ROW_COUNT=$((DATA_END - DATA_START))
        echo "  Inserting $ROW_COUNT rows..."
        
        sed -n "${DATA_START},${DATA_END}p" "$BACKUP_FILE" | \
            docker exec -i $CONTAINER clickhouse-client --query "INSERT INTO $TABLE FORMAT CSV" 2>&1 | \
            grep -v "^$" || {
                echo "  WARNING: Some data may not have loaded"
            }
    fi
    
    # Verify
    COUNT=$(docker exec $CONTAINER clickhouse-client --query "SELECT COUNT(*) FROM $TABLE" 2>/dev/null || echo "0")
    echo "  ✓ Complete: $COUNT rows"
    RESTORED=$((RESTORED + 1))
    echo ""
done

echo ""
echo "=== Restore Summary ==="
echo "Total tables: ${#TABLES[@]}"
echo "Skipped (already loaded): $SKIPPED"
echo "Restored: $RESTORED"
echo "Failed: $FAILED"
echo ""
echo "=== Done ==="
