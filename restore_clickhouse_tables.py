#!/usr/bin/env python3

import subprocess
import re
import sys

BACKUP_FILE = "clickhouse_backup_20251202_223436.sql"
CONTAINER = "dev-env-isolated-clickhouse-1"

def get_loaded_tables():
    """Get list of currently loaded tables"""
    result = subprocess.run(
        ["docker", "exec", CONTAINER, "clickhouse-client", "--query", "SHOW TABLES FROM default"],
        capture_output=True, text=True
    )
    return set(result.stdout.strip().split('\n')) if result.stdout.strip() else set()

def get_table_count(table_name):
    """Get row count for a table"""
    result = subprocess.run(
        ["docker", "exec", CONTAINER, "clickhouse-client", "--query", 
         f"SELECT COUNT(*) FROM default.{table_name}"],
        capture_output=True, text=True
    )
    return result.stdout.strip() if result.returncode == 0 else "0"

def create_table(create_statement):
    """Create a table using the CREATE TABLE statement"""
    # Convert \n to actual newlines
    formatted_sql = create_statement.replace('\\n', '\n')
    
    # Execute the CREATE TABLE
    process = subprocess.Popen(
        ["docker", "exec", "-i", CONTAINER, "clickhouse-client", "--multiquery"],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    stdout, stderr = process.communicate(input=formatted_sql)
    
    return process.returncode == 0, stderr

def insert_data(table_name, data_lines):
    """Insert data into a table"""
    if not data_lines:
        return True, ""
    
    # Prepare INSERT command
    insert_cmd = f"INSERT INTO default.{table_name} FORMAT CSV"
    data = '\n'.join(data_lines)
    
    process = subprocess.Popen(
        ["docker", "exec", "-i", CONTAINER, "clickhouse-client", "--query", insert_cmd],
        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
    )
    stdout, stderr = process.communicate(input=data)
    
    return process.returncode == 0, stderr

def main():
    print("=== ClickHouse Full Table Restore ===\n")
    
    # Get loaded tables
    loaded_tables = get_loaded_tables()
    print(f"Currently loaded: {len(loaded_tables)} tables\n")
    
    stats = {'skipped': 0, 'restored': 0, 'failed': 0}
    
    print("Processing backup file...")
    
    with open(BACKUP_FILE, 'r', encoding='utf-8', errors='ignore') as f:
        current_table = None
        create_statement = None
        data_lines = []
        table_count = 0
        
        for line_num, line in enumerate(f, 1):
            # Check for CREATE TABLE
            if line.startswith('CREATE TABLE default.'):
                # Save previous table if exists
                if current_table and create_statement:
                    if current_table not in loaded_tables:
                        table_count += 1
                        print(f"[{table_count}] Restoring: {current_table}")
                        
                        # Create table
                        success, error = create_table(create_statement)
                        if not success:
                            print(f"  ERROR creating table: {error[:200]}")
                            stats['failed'] += 1
                        else:
                            # Insert data
                            if data_lines:
                                print(f"  Inserting {len(data_lines)} rows...")
                                success, error = insert_data(current_table, data_lines)
                                if not success:
                                    print(f"  WARNING: Data insert had errors")
                            
                            # Verify
                            count = get_table_count(current_table)
                            print(f"  ✓ Complete: {count} rows\n")
                            stats['restored'] += 1
                    else:
                        stats['skipped'] += 1
                
                # Start new table
                match = re.search(r'CREATE TABLE default\.(\w+)', line)
                if match:
                    current_table = match.group(1)
                    create_statement = line.rstrip()
                    data_lines = []
            
            # Check for data (CSV format)
            elif line.startswith('"') and current_table and '","' in line[:50]:
                # Skip header row
                if not line.startswith(f'"{current_table.split(".")[-1]}_'):
                    cols = line.split('","')
                    # Check if it looks like a header
                    if not any(c.strip('"').replace('_', '').isalpha() for c in cols[:3] if len(c.strip('"')) < 30):
                        data_lines.append(line.rstrip())
            
            # Check for comments or next table (end of data)
            elif (line.startswith('--') or line.startswith('CREATE ')) and current_table:
                # This marks end of current table's data
                pass
            
            # Progress indicator
            if line_num % 1000000 == 0:
                print(f"  Processed {line_num:,} lines...", flush=True)
        
        # Handle last table
        if current_table and create_statement and current_table not in loaded_tables:
            table_count += 1
            print(f"[{table_count}] Restoring: {current_table}")
            success, error = create_table(create_statement)
            if not success:
                print(f"  ERROR creating table: {error[:200]}")
                stats['failed'] += 1
            else:
                if data_lines:
                    print(f"  Inserting {len(data_lines)} rows...")
                    success, error = insert_data(current_table, data_lines)
                count = get_table_count(current_table)
                print(f"  ✓ Complete: {count} rows\n")
                stats['restored'] += 1
    
    print("\n=== Restore Summary ===")
    print(f"Skipped (already loaded): {stats['skipped']}")
    print(f"Restored: {stats['restored']}")
    print(f"Failed: {stats['failed']}")
    print("\n=== Done ===")

if __name__ == "__main__":
    main()
