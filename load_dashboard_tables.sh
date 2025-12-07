#!/bin/bash

set -e

BACKUP_FILE="clickhouse_backup_20251202_223436.sql"
CONTAINER="dev-env-isolated-clickhouse-1"

# Critical dashboard tables
TABLES=(
    "vw_region_rafed_performance"
    "vw_region_private_transport_market"
    "vw_region_transport_costs"
    "support_data_report10_cost_per_student_structure"
    "support_data_report11b_willingness_to_pay"
    "support_data_report1_education_statistics_students_schools_by_region"
    "support_data_report2_rafed_performance_beneficiaries_waiting_list"
    "support_data_report3_student_growth_forecast_to_2030"
    "support_data_report4_uncovered_waiting_list_students"
    "support_data_report5_schools_geographic_distribution_density"
    "support_data_report6_average_home_to_school_distance"
    "support_data_report7_household_car_ownership_working_mothers"
    "support_data_report8_official_complaints_937_rafed"
    "support_data_report9_private_informal_transport_market"
    "support_data_report11a_parent_satisfaction_survey"
    "support_data_report12_private_international_schools_growth"
)

echo "=== Loading Dashboard Tables ==="
echo "Total: ${#TABLES[@]} tables"
echo ""

load_table() {
    local table=$1
    local num=$2
    
    echo "[$num/${#TABLES[@]}] $table"
    
    # Find CREATE TABLE line
    local create_line=$(grep -n "^CREATE TABLE default\.$table\\\\n" "$BACKUP_FILE" | head -1 | cut -d: -f1)
    
    if [ -z "$create_line" ]; then
        echo "  ⚠ CREATE TABLE not found"
        return 0
    fi
    
    # Find data start
    local data_start=$(awk -v start=$create_line 'NR>start && /^"[^"]+","/{print NR; exit}' "$BACKUP_FILE")
    
    if [ -z "$data_start" ]; then
        echo "  ✓ Table created (no data)"
        return 0
    fi
    
    # Find data end
    local data_end=$(awk -v start=$data_start 'NR>=start && (/^CREATE TABLE/ || /^--/){print NR-1; exit}' "$BACKUP_FILE")
    
    if [ -z "$data_end" ] || [ "$data_end" -lt "$data_start" ]; then
        echo "  ⚠ Could not determine data range"
        return 0
    fi
    
    local row_count=$((data_end - data_start))
    
    # Load data
    sed -n "${data_start},${data_end}p" "$BACKUP_FILE" | \
        docker exec -i $CONTAINER clickhouse-client \
        --query "INSERT INTO default.$table FORMAT CSV" 2>&1 | \
        grep -i "error\|exception" | head -2 || true
    
    # Verify
    local loaded=$(docker exec $CONTAINER clickhouse-client \
        --query "SELECT COUNT(*) FROM default.$table" 2>/dev/null || echo "0")
    
    echo "  ✓ $loaded rows loaded"
}

# Load each table
for i in "${!TABLES[@]}"; do
    table_num=$((i + 1))
    load_table "${TABLES[$i]}" $table_num
done

echo ""
echo "=== Complete ==="
echo ""
echo "Loaded tables summary:"
docker exec $CONTAINER clickhouse-client --query "
SELECT name, total_rows 
FROM system.tables 
WHERE database = 'default' 
  AND (name LIKE 'vw_region_%' OR name LIKE 'support_data_report%')
  AND total_rows > 0
ORDER BY total_rows DESC
LIMIT 20
" --format=PrettyCompact
