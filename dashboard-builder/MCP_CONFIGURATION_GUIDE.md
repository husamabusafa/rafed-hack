# MCP (Model Context Protocol) Configuration Guide

This guide explains how to configure the PostgreSQL MCP server to give the AI agent access to your database schema.

## 📋 Overview

The PostgreSQL MCP provides the AI with tools to:
- **Explore database schema**: List tables, columns, and data types
- **Query data**: Execute SELECT queries
- **Understand structure**: Get table details, indexes, and relationships

## 🔧 MCP Server Configuration

### Connection URL Format

```
postgres://[username]:[password]@[host]:[port]/[database]
```

### Example Configuration

Based on your agent flow JSON, configure the MCP PostgreSQL server:

```json
{
  "mcpUrl": "postgres://postgres:postgres@localhost:5432/dashboard-builder",
  "mcpTransport": "http",
  "selectedPreset": "postgresql"
}
```

### Environment Variables (Recommended)

For security, use environment variables instead of hardcoding credentials:

**In your `.env` file:**
```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dashboard-builder
```

**In MCP configuration:**
```json
{
  "mcpUrl": "${DATABASE_URL}",
  "mcpTransport": "http",
  "selectedPreset": "postgresql"
}
```

## 🛠️ Available MCP Tools

The PostgreSQL MCP provides these tools to the AI:

### 1. list_schemas
Lists all schemas in the database.

**Usage by AI:**
```json
{}
```

**Returns:**
```json
["public", "analytics", "reporting"]
```

### 2. list_objects
Lists tables, views, sequences, or extensions in a schema.

**Usage by AI:**
```json
{
  "schema_name": "public",
  "object_type": "table"
}
```

**Returns:**
```json
["users", "orders", "products", "sales"]
```

### 3. get_object_details
Shows detailed information about a database object (columns, types, constraints).

**Usage by AI:**
```json
{
  "schema_name": "public",
  "object_name": "orders",
  "object_type": "table"
}
```

**Returns:**
```json
{
  "columns": [
    {"name": "id", "type": "integer", "nullable": false},
    {"name": "customer_id", "type": "integer", "nullable": false},
    {"name": "amount", "type": "numeric", "nullable": false},
    {"name": "status", "type": "varchar", "nullable": true},
    {"name": "created_at", "type": "timestamp", "nullable": false}
  ],
  "primary_key": ["id"],
  "indexes": ["idx_customer_id", "idx_created_at"]
}
```

### 4. execute_sql
Execute SELECT queries to fetch data.

**Usage by AI:**
```json
{
  "sql": "SELECT * FROM users LIMIT 5"
}
```

**Returns:**
```json
{
  "rows": [
    {"id": 1, "name": "John", "email": "john@example.com"},
    {"id": 2, "name": "Jane", "email": "jane@example.com"}
  ],
  "rowCount": 2
}
```

### 5. explain_query
Analyzes query execution plan for optimization.

**Usage by AI:**
```json
{
  "sql": "SELECT * FROM orders WHERE customer_id = 123",
  "analyze": true
}
```

### 6. get_top_queries
Reports slowest or most resource-intensive queries.

**Usage by AI:**
```json
{
  "sort_by": "total_time",
  "limit": 10
}
```

### 7. analyze_db_health
Checks database health (indexes, connections, vacuum, etc.).

**Usage by AI:**
```json
{
  "health_type": "all"
}
```

## 🎯 How AI Uses MCP Tools

### Scenario 1: User asks to create a dashboard

**User Request:**
> "Create a sales dashboard with revenue metrics"

**AI Workflow:**

1. **Explore schema** using `list_objects`:
   ```json
   {"schema_name": "public", "object_type": "table"}
   ```
   Returns: `["sales", "orders", "products"]`

2. **Get table details** using `get_object_details`:
   ```json
   {"schema_name": "public", "object_name": "sales", "object_type": "table"}
   ```
   Returns columns: `date, region, revenue, product_id, customer_id`

3. **Create component** with correct field names:
   ```sql
   SELECT 
     region,
     SUM(revenue)::numeric(10,2) as total_revenue
   FROM sales
   GROUP BY region
   ORDER BY total_revenue DESC
   ```

### Scenario 2: User has custom database

**User Request:**
> "Show me the top customers"

**AI Workflow:**

1. **List tables**:
   ```json
   {"schema_name": "public"}
   ```
   Finds: `customers` table

2. **Get structure**:
   ```json
   {"schema_name": "public", "object_name": "customers"}
   ```
   Discovers columns: `customer_id, name, email, total_spent, last_order_date`

3. **Create table component**:
   ```sql
   SELECT 
     name,
     email,
     total_spent::numeric(10,2) as spent,
     last_order_date::text as last_order
   FROM customers
   ORDER BY total_spent DESC
   LIMIT 10
   ```

## 🔐 Security Best Practices

### 1. Read-Only User (Recommended)

Create a read-only PostgreSQL user for the dashboard:

```sql
-- Create read-only role
CREATE ROLE dashboard_readonly WITH LOGIN PASSWORD 'secure_password';

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO dashboard_readonly;

-- Grant SELECT on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO dashboard_readonly;

-- Grant SELECT on future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO dashboard_readonly;
```

**MCP Configuration:**
```json
{
  "mcpUrl": "postgres://dashboard_readonly:secure_password@localhost:5432/your_database"
}
```

### 2. Connection Limits

Limit concurrent connections for the dashboard user:

```sql
ALTER ROLE dashboard_readonly CONNECTION LIMIT 5;
```

### 3. Network Security

- Use SSL/TLS for production: `postgres://user:pass@host:5432/db?sslmode=require`
- Restrict access by IP in `pg_hba.conf`
- Use connection pooling (PgBouncer) for better performance

## 📊 Sample Database Schema for Testing

If you don't have a database yet, here's a sample schema:

```sql
-- Create tables
CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(customer_id),
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  price NUMERIC(10,2) NOT NULL
);

-- Insert sample data
INSERT INTO customers (name, email) VALUES
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Bob Johnson', 'bob@example.com');

INSERT INTO products (name, category, price) VALUES
  ('Widget A', 'Electronics', 29.99),
  ('Widget B', 'Electronics', 49.99),
  ('Gadget C', 'Home', 19.99);

INSERT INTO orders (customer_id, amount, status) VALUES
  (1, 29.99, 'completed'),
  (1, 49.99, 'completed'),
  (2, 19.99, 'pending'),
  (3, 29.99, 'completed');
```

## 🔄 MCP Configuration in Agent Flow

Update the MCP node in your agent flow JSON:

```json
{
  "nodeType": "mcp_postgresql",
  "label": "PostgreSQL",
  "data": {
    "selectedPreset": "postgresql",
    "mcpUrl": "postgres://postgres:postgres@localhost:5432/dashboard-builder",
    "mcpTransport": "http",
    "description": "Production database connection",
    "connectionStatus": "connected"
  }
}
```

## 📝 Notes for AI Agent

When the AI has access to MCP tools, it should:

1. **Always explore first**: Use `list_objects` and `get_object_details` before writing queries
2. **Verify field names**: Check actual column names instead of assuming
3. **Handle data types**: Cast appropriately (e.g., `::text` for dates, `::numeric` for decimals)
4. **Use appropriate limits**: Don't fetch too much data
5. **Consider indexes**: Use `explain_query` for complex queries

## 🚀 Getting Started

### Step 1: Verify Database Connection

Test your connection string:
```bash
psql "postgres://postgres:postgres@localhost:5432/dashboard-builder"
```

### Step 2: Configure MCP in Agent

Update the agent flow JSON with your database URL.

### Step 3: Test Schema Discovery

Ask the AI:
> "What tables are in my database?"

The AI should use `list_objects` to respond.

### Step 4: Create Your First Component

Ask the AI:
> "Create a stat card showing total row count from [table_name]"

The AI should:
1. Use `get_object_details` to verify the table exists
2. Write a query: `SELECT COUNT(*) as total FROM table_name`
3. Create a stat-card component with the result

## 🎓 Example User Requests

Once MCP is configured, try these requests:

1. **"Show me all my tables"**
   - AI uses: `list_objects`

2. **"What columns does the orders table have?"**
   - AI uses: `get_object_details`

3. **"Create a chart of sales by region"**
   - AI uses: `get_object_details` → checks `sales` table
   - Creates chart component with appropriate query

4. **"Build a dashboard for customer analytics"**
   - AI explores schema
   - Creates multiple components based on available data

## 🔍 Troubleshooting

### Connection Refused
- Check PostgreSQL is running: `pg_isready`
- Verify host and port
- Check firewall settings

### Authentication Failed
- Verify username and password
- Check `pg_hba.conf` authentication method
- Ensure user has database access

### Permission Denied
- Grant SELECT permissions to user
- Verify schema access with `GRANT USAGE ON SCHEMA`

### No Schema Found
- Ensure database exists
- Check you're connecting to correct database
- Verify schema name (usually `public`)

---

**Next Steps:**
1. Configure your PostgreSQL connection URL
2. Update the MCP node in your agent flow
3. Test schema discovery with the AI
4. Start building dashboards!
