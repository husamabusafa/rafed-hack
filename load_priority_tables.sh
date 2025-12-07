#!/bin/bash

set -e

BACKUP_FILE="clickhouse_backup_20251202_223436.sql"
CONTAINER="dev-env-isolated-clickhouse-1"

# Priority tables for dashboards
PRIORITY_TABLES=(
    "schools"
    "students"
    "unassigned_students"
    "support_data_saudi_population_regions_2022"
    "support_data_rafed_special_ed_beneficiaries_kinetic"
    "support_data_rafed_special_ed_beneficiaries_non_kinetic"
    "support_data_report3_student_growth_forecast_to_2030"
    "support_data_report8_official_complaints_937_rafed"
    "support_data_report10_cost_per_student_structure"
    "support_data_report11b_willingness_to_pay"
)

echo "=== Loading Priority Dashboard Tables ==="
echo ""

load_table() {
    local table=$1
    local num=$2
    local total=$3
    
    echo "[$num/$total] Loading: $table"
    
    # Find CREATE TABLE line
    local create_line=$(grep -n "^CREATE TABLE default\.$table\\\\n" "$BACKUP_FILE" | head -1 | cut -d: -f1)
    
    if [ -z "$create_line" ]; then
        echo "  ERROR: CREATE TABLE not found"
        return 1
    fi
    
    # Find data start
    local data_start=$(awk -v start=$create_line 'NR>start && /^"[^"]+","/{print NR; exit}' "$BACKUP_FILE")
    
    if [ -z "$data_start" ]; then
        echo "  SKIP: No data found"
        return 0
    fi
    
    # Find data end
    local data_end=$(awk -v start=$data_start 'NR>=start && (/^CREATE TABLE/ || /^--/){print NR-1; exit}' "$BACKUP_FILE")
    
    if [ -z "$data_end" ] || [ "$data_end" -lt "$data_start" ]; then
        echo "  ERROR: Could not determine data range"
        return 1
    fi
    
    local row_count=$((data_end - data_start))
    echo "  Extracting $row_count rows..."
    
    # Load data
    sed -n "${data_start},${data_end}p" "$BACKUP_FILE" | \
        docker exec -i $CONTAINER clickhouse-client \
        --query "INSERT INTO default.$table FORMAT CSV" 2>&1 | \
        grep -i "error\|exception" | head -3 || true
    
    # Verify
    local loaded=$(docker exec $CONTAINER clickhouse-client \
        --query "SELECT COUNT(*) FROM default.$table" 2>/dev/null || echo "0")
    
    echo "  ✓ Loaded: $loaded rows"
    echo ""
}

# Load each priority table
for i in "${!PRIORITY_TABLES[@]}"; do
    table_num=$((i + 1))
    load_table "${PRIORITY_TABLES[$i]}" $table_num ${#PRIORITY_TABLES[@]}
done

echo "=== Priority Tables Loaded ==="
