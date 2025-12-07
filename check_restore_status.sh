#!/bin/bash

echo "=== ClickHouse Restore Status ==="
echo ""

# Count total tables
TOTAL=$(docker exec dev-env-isolated-clickhouse-1 clickhouse-client --query \
    "SELECT COUNT(*) FROM system.tables WHERE database = 'default'")

# Count tables with data
WITH_DATA=$(docker exec dev-env-isolated-clickhouse-1 clickhouse-client --query \
    "SELECT COUNT(*) FROM system.tables WHERE database = 'default' AND total_rows > 0")

# Count empty tables
EMPTY=$((TOTAL - WITH_DATA))

echo "Total tables: $TOTAL"
echo "Tables with data: $WITH_DATA"
echo "Empty tables: $EMPTY"
echo ""

if [ $WITH_DATA -gt 0 ]; then
    echo "Tables with data:"
    docker exec dev-env-isolated-clickhouse-1 clickhouse-client --query \
        "SELECT name, formatReadableSize(total_bytes) as size, total_rows as rows 
         FROM system.tables 
         WHERE database = 'default' AND total_rows > 0 
         ORDER BY total_rows DESC 
         LIMIT 20" --format=PrettyCompact
fi

echo ""
echo "Progress: $(awk "BEGIN {printf \"%.1f%%\", ($WITH_DATA / $TOTAL) * 100}")"
