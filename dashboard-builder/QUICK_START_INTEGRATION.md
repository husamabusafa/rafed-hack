# Quick Start Integration Guide

## 🚀 5-Minute Setup

Follow these steps to integrate the improved dashboard builder with your agent.

---

## Step 1: Update System Prompt (2 minutes)

### Option A: Direct JSON Edit

Open `agent-flow-Chart_Builder-2025-11-10.json` and replace line 55 `systemPrompt` with:

```json
{
  "systemPrompt": "Dashboard Builder AI: You create production-ready dashboards with charts, tables, and stat-cards.\n\n## THEME & UX\n- Dark purple theme: primary #6366F1, accent #8B5CF6, background #17181C, border #2A2C33.\n- Use Iconify lucide icons like \"lucide:trending-up\". Never use emojis.\n\n## COMPONENT TYPES\n- stat-card: single KPI card with value, label, optional trend.\n- table: tabular data with columns and rows.\n- chart: ECharts options object (line, bar, pie, etc.).\n\n..."
}
```

### Option B: Copy from File

1. Open `IMPROVED_SYSTEM_PROMPT.md`
2. Copy entire content
3. Paste into system prompt node in your agent builder UI

**🔗 Full content in:** `IMPROVED_SYSTEM_PROMPT.md`

---

## Step 2: Configure PostgreSQL MCP (1 minute)

### Update Database URL

In `agent-flow-Chart_Builder-2025-11-10.json`, find the MCP node (around line 189) and update:

```json
{
  "nodeType": "mcp_postgresql",
  "data": {
    "mcpUrl": "postgres://postgres:postgres@localhost:5432/YOUR_DATABASE_NAME",
    "isConfigured": true
  }
}
```

**Replace:**
- `YOUR_DATABASE_NAME` with your actual database name
- Update credentials if needed

### Test Connection

```bash
# Verify database is accessible
psql "postgres://postgres:postgres@localhost:5432/YOUR_DATABASE_NAME"
```

**🔗 Full guide in:** `MCP_CONFIGURATION_GUIDE.md`

---

## Step 3: Start Dashboard Builder (1 minute)

```bash
cd dashboard-builder
pnpm dev
```

This starts:
- **Server**: http://localhost:2100
- **Client**: http://localhost:2200

---

## Step 4: Test with Preset Prompts (1 minute)

Open http://localhost:2200 and try these presets:

### 1️⃣ Test MCP Connection
Click **"🔍 Explore Database"**

**Expected:** AI lists your database tables and columns

### 2️⃣ Create Simple Grid
Click **"🎯 Simple Grid"**

**Expected:** AI creates a 2x2 grid layout

### 3️⃣ Build Complete Dashboard
Click **"📊 Sales Dashboard"**

**Expected:** AI creates KPIs, charts, and uses your database

---

## 📋 Component Quick Reference

### Create a KPI Card

**Ask AI:**
```
Create a stat card showing total row count from my users table
```

**Or use static data:**
```json
{
  "id": "total_users",
  "type": "stat-card",
  "gridArea": "kpi1",
  "data": {
    "value": 1234,
    "label": "Total Users",
    "icon": "lucide:users"
  }
}
```

### Create a Bar Chart

**Ask AI:**
```
Create a bar chart showing orders by region from my orders table
```

**Or copy from:** `SIMPLE_CHART_EXAMPLES.md` → Example #1

### Create a Data Table

**Ask AI:**
```
Show me the first 10 rows from my products table
```

**Or copy from:** `SIMPLE_CHART_EXAMPLES.md` → Example #5

---

## 🎯 Common Commands to Try

Once everything is running, try these:

```
# Explore database
"What tables are in my database?"
"Show me the columns in the orders table"

# Create layout
"Create a 3x3 grid layout"
"Set up a dashboard with header and sidebar"

# Add components
"Add a KPI card showing total sales"
"Create a pie chart of products by category"
"Show me recent orders in a table"

# Complete dashboards
"Build a sales analytics dashboard"
"Create a customer overview dashboard"
```

---

## 🔧 Troubleshooting

### Issue: MCP Not Connected

**Check:**
```bash
# Is PostgreSQL running?
pg_isready

# Can you connect manually?
psql "postgres://postgres:postgres@localhost:5432/your_db"
```

**Fix:** Update `mcpUrl` in agent flow JSON

---

### Issue: Charts Not Displaying

**Check:**
1. Browser console for errors
2. Component has valid `gridArea`
3. ECharts data structure is correct

**Fix:** Use examples from `SIMPLE_CHART_EXAMPLES.md`

---

### Issue: Handlebars Template Error

**Common mistakes:**
- ❌ `{value}` → ✅ `{{value}}`
- ❌ `"{{count}}"` → ✅ `{{count}}` (for numbers)
- ❌ Missing `{{#each data}}` → ✅ Add for multi-row

**Fix:** See `IMPROVED_SYSTEM_PROMPT.md` → "COMMON MISTAKES TO AVOID"

---

## 📚 Documentation Index

| File | Purpose | When to Use |
|------|---------|-------------|
| **IMPROVED_SYSTEM_PROMPT.md** | AI instructions with examples | Copy to system prompt node |
| **MCP_CONFIGURATION_GUIDE.md** | Database setup guide | Setting up PostgreSQL MCP |
| **SIMPLE_CHART_EXAMPLES.md** | Ready-to-use chart templates | Need chart code to customize |
| **IMPLEMENTATION_SUMMARY.md** | Complete overview | Understanding what changed |
| **QUICK_START_INTEGRATION.md** | This file | Getting started quickly |

---

## 🎨 Example Dashboards from `/apps`

Your improved system now supports these chart types from `/apps`:

| Dashboard | Charts Used | Adapted Example |
|-----------|-------------|-----------------|
| `cx_dashboard.html` | Pie chart, Bar chart | Examples #1, #2 |
| `operational_dashboard.html` | Bar chart, Line chart | Examples #1, #3 |
| `financial_dashboard.html` | Multi-line chart | Example #7 |
| `capacity_demand_dashboard.html` | Stacked bar | Example #8 |

All adapted to ECharts format in `SIMPLE_CHART_EXAMPLES.md`

---

## ✅ Validation Steps

Before deploying to production:

1. **Test MCP Connection**
   ```
   User: "What tables are in my database?"
   Expected: List of tables
   ```

2. **Test Static Component**
   ```
   User: "Create a 2x2 grid with 4 KPI cards showing random numbers"
   Expected: Grid with 4 stat cards
   ```

3. **Test Database Component**
   ```
   User: "Create a table showing the first 5 rows from [your_table]"
   Expected: Table with actual data
   ```

4. **Test Chart Creation**
   ```
   User: "Create a bar chart of [column] grouped by [another_column]"
   Expected: Chart with database data
   ```

---

## 🚀 Production Deployment

### Security Checklist

- [ ] Create read-only database user
- [ ] Use environment variables for DB credentials
- [ ] Enable SSL/TLS for database connection
- [ ] Set connection limits
- [ ] Restrict database access by IP

**See:** `MCP_CONFIGURATION_GUIDE.md` → "Security Best Practices"

### Environment Variables

Create `.env`:
```env
# Database
DATABASE_URL=postgres://readonly_user:secure_pass@localhost:5432/prod_db

# Server
PORT=2100

# Client
VITE_API_URL=http://localhost:2100
VITE_AGENT_ID=cmhijn9sv0007qggw7c4ipwm3
VITE_AGENT_BASE_URL=http://localhost:3900
```

---

## 💡 Pro Tips

### Tip 1: Start with Schema Exploration
Always ask AI to explore database first:
```
"What tables do I have? Show me their columns."
```

### Tip 2: Use Static Data for Prototyping
Test layouts with static data before connecting to database:
```
"Create a 3x3 grid with sample KPI cards"
```

### Tip 3: Copy-Paste Examples
Use `SIMPLE_CHART_EXAMPLES.md` as templates:
- Copy chart structure
- Replace field names with your columns
- Adjust colors/styling

### Tip 4: Incremental Building
Build dashboards step by step:
```
1. "Create a 2x3 grid layout"
2. "Add a KPI card in kpi1 showing total sales"
3. "Add a bar chart in chart1 showing sales by region"
4. "Add a table in table1 with recent orders"
```

---

## 📞 Next Steps

1. ✅ Complete Steps 1-4 above (5 minutes)
2. 📖 Read `IMPROVED_SYSTEM_PROMPT.md` to understand AI capabilities
3. 🎨 Browse `SIMPLE_CHART_EXAMPLES.md` for chart inspiration
4. 🔧 Configure MCP using `MCP_CONFIGURATION_GUIDE.md`
5. 🚀 Build your first dashboard!

---

## 🎓 Learning Path

### Beginner
1. Create a simple 2x2 grid
2. Add 4 stat cards with static data
3. Try one bar chart with static data

### Intermediate
1. Connect to your database
2. Create KPIs from database queries
3. Build a table showing database records
4. Create charts with database data

### Advanced
1. Build multi-component dashboards
2. Use complex SQL queries
3. Create multi-series charts
4. Optimize queries with MCP tools

---

**You're ready to build amazing dashboards! 🎉**

Start with `pnpm dev` and try the preset prompts to see the AI in action.
