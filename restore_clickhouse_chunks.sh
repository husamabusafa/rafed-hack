#!/bin/bash

set -e

BACKUP_FILE="clickhouse_backup_20251202_223436.sql"
CONTAINER="dev-env-isolated-clickhouse-1"
CHUNK_SIZE=50000
TOTAL_LINES=$(wc -l < "$BACKUP_FILE")
CURRENT_LINE=1

echo "Total lines: $TOTAL_LINES"
echo "Chunk size: $CHUNK_SIZE lines"
echo "Starting restore..."

while [ $CURRENT_LINE -le $TOTAL_LINES ]; do
    END_LINE=$((CURRENT_LINE + CHUNK_SIZE - 1))
    if [ $END_LINE -gt $TOTAL_LINES ]; then
        END_LINE=$TOTAL_LINES
    fi
    
    echo "Processing lines $CURRENT_LINE to $END_LINE..."
    
    sed -n "${CURRENT_LINE},${END_LINE}p" "$BACKUP_FILE" | \
        docker exec -i "$CONTAINER" clickhouse-client --multiquery 2>&1 | \
        grep -v "^$" || true
    
    CURRENT_LINE=$((END_LINE + 1))
    
    # Show progress every 10 chunks
    CHUNK_NUM=$(( (CURRENT_LINE - 1) / CHUNK_SIZE ))
    if [ $((CHUNK_NUM % 10)) -eq 0 ]; then
        PROGRESS=$(awk "BEGIN {printf \"%.2f\", ($CURRENT_LINE / $TOTAL_LINES) * 100}")
        echo "Progress: $PROGRESS%"
    fi
done

echo "ClickHouse restore completed!"
