#!/bin/bash

# Restore script for PostgreSQL and ClickHouse backups
# Created: 2025-12-02

set -e  # Exit on error

POSTGRES_CONTAINER="dev-env-isolated-postgres-1"
CLICKHOUSE_CONTAINER="dev-env-isolated-clickhouse-1"
POSTGRES_USER="user"

echo "=== Database Restore Script ==="
echo ""

# Check if containers are running
if ! docker ps | grep -q "$POSTGRES_CONTAINER"; then
    echo "Error: PostgreSQL container ($POSTGRES_CONTAINER) is not running"
    exit 1
fi

if ! docker ps | grep -q "$CLICKHOUSE_CONTAINER"; then
    echo "Error: ClickHouse container ($CLICKHOUSE_CONTAINER) is not running"
    exit 1
fi

# Restore PostgreSQL
echo "Restoring PostgreSQL..."
if [ -f "postgres_backup_20251202_223243.sql.gz" ]; then
    echo "Decompressing and restoring PostgreSQL backup..."
    gunzip -c postgres_backup_20251202_223243.sql.gz | docker exec -i $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d postgres
elif [ -f "postgres_backup_20251202_223243.sql" ]; then
    echo "Restoring PostgreSQL backup..."
    docker exec -i $POSTGRES_CONTAINER psql -U $POSTGRES_USER -d postgres < postgres_backup_20251202_223243.sql
else
    echo "Error: PostgreSQL backup file not found"
    exit 1
fi
echo "PostgreSQL restore completed!"
echo ""

# Restore ClickHouse
echo "Restoring ClickHouse..."
if [ -f "clickhouse_backup_20251202_223436.sql.gz" ]; then
    echo "Decompressing and restoring ClickHouse backup..."
    gunzip -c clickhouse_backup_20251202_223436.sql.gz | docker exec -i $CLICKHOUSE_CONTAINER clickhouse-client --multiquery
elif [ -f "clickhouse_backup_20251202_223436.sql" ]; then
    echo "Restoring ClickHouse backup..."
    docker exec -i $CLICKHOUSE_CONTAINER clickhouse-client --multiquery < clickhouse_backup_20251202_223436.sql
else
    echo "Error: ClickHouse backup file not found"
    exit 1
fi
echo "ClickHouse restore completed!"
echo ""

echo "=== All databases restored successfully ==="
