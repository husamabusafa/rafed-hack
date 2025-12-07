#!/bin/bash

set -e

BACKUP_FILE="clickhouse_backup_20251202_223436.sql"
CONTAINER="dev-env-isolated-clickhouse-1"

echo "=== Loading ClickHouse Table Data ==="
echo ""

# Get all empty tables
EMPTY_TABLES=($(docker exec $CONTAINER clickhouse-client --query \
    "SELECT name FROM system.tables WHERE database = 'default' AND total_rows = 0 ORDER BY name" | grep -v "^$"))

echo "Found ${#EMPTY_TABLES[@]} tables needing data"
echo ""

# Function to load data for a table
load_table_data() {
    local table=$1
    local table_num=$2
    local total=$3
    
    echo "[$table_num/$total] Loading: $table"
    
    # Find the CREATE TABLE line number
    local create_line=$(grep -n "^CREATE TABLE default\.$table\\\\n" "$BACKUP_FILE" | head -1 | cut -d: -f1)
    
    if [ -z "$create_line" ]; then
        echo "  SKIP: CREATE TABLE not found"
        return
    fi
    
    # Find data start (first CSV line after CREATE)
    local data_start=$(awk -v start=$create_line 'NR>start && /^"[^"]+","/{print NR; exit}' "$BACKUP_FILE")
    
    if [ -z "$data_start" ]; then
        echo "  SKIP: No data found"
        return
    fi
    
    # Find data end (next CREATE TABLE or comment)
    local data_end=$(awk -v start=$data_start 'NR>=start && (/^CREATE TABLE/ || /^--/){print NR-1; exit}' "$BACKUP_FILE")
    
    if [ -z "$data_end" ] || [ "$data_end" -lt "$data_start" ]; then
        echo "  SKIP: Could not determine data range"
        return
    fi
    
    local row_count=$((data_end - data_start))
    echo "  Extracting $row_count rows (lines $data_start-$data_end)..."
    
    # Extract and load data
    sed -n "${data_start},${data_end}p" "$BACKUP_FILE" | \
        docker exec -i $CONTAINER clickhouse-client \
        --query "INSERT INTO default.$table FORMAT CSV" 2>&1 | \
        grep -v "^$" | head -5 || true
    
    # Verify
    local loaded=$(docker exec $CONTAINER clickhouse-client \
        --query "SELECT COUNT(*) FROM default.$table" 2>/dev/null || echo "0")
    
    echo "  ✓ Loaded: $loaded rows"
    echo ""
}

# Process each empty table
for i in "${!EMPTY_TABLES[@]}"; do
    table_num=$((i + 1))
    load_table_data "${EMPTY_TABLES[$i]}" $table_num ${#EMPTY_TABLES[@]}
done

echo ""
echo "=== Summary ==="
docker exec $CONTAINER clickhouse-client --query \
    "SELECT COUNT(*) as tables_with_data FROM system.tables WHERE database = 'default' AND total_rows > 0"
echo ""
echo "=== Done ===" 
