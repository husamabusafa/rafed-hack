# ClickHouse Integration - Complete Guide

## ✅ What's Been Done

Your dashboard builder now fully supports ClickHouse! Here's what was added:

### 1. Backend Support ✅
- **New endpoint**: `/data/query-clickhouse` in NestJS server
- **Environment variables**: ClickHouse URL, user, password in `.env`
- **Fetch utility**: Direct HTTP API calls to ClickHouse

### 2. Frontend Support ✅
- **Query utility**: `queryClickHouse.ts` for client-side queries
- **Data fetcher**: ClickHouse source type in DataFetcher
- **Type system**: `ClickHouseQuery` type added
- **Default source**: Components now default to ClickHouse (not PostgreSQL)

### 3. AI System Prompt ✅
- **ClickHouse-specific prompt**: `CLICKHOUSE_SYSTEM_PROMPT.md`
- **8 real examples**: Using actual tables from `/apps`
- **ClickHouse syntax**: Functions like `count()`, `toFloat64()`, etc.
- **All real tables**: students, schools, school_routes, complaints, etc.

---

## 🚀 Quick Start (5 Steps)

### Step 1: Start ClickHouse Database

```bash
# Make sure Docker is running
cd /Users/Husam/Dev/rafed-hack
docker-compose -f docker/docker-compose.yml up -d clickhouse
```

**Verify it's running:**
```bash
curl "http://localhost:8155/?query=SELECT+1"
```

Expected output: `1`

---

### Step 2: Update Agent System Prompt

Replace the system prompt in `agent-flow-Chart_Builder-2025-11-10.json` (line 55) with the contents of:

**`CLICKHOUSE_SYSTEM_PROMPT.md`**

This new prompt:
- ✅ Uses ClickHouse syntax (`count()` not `COUNT(*)`)
- ✅ Has 8 real examples from your `/apps` dashboards  
- ✅ Lists all available ClickHouse tables
- ✅ Shows ClickHouse vs PostgreSQL differences
- ✅ Defaults to `"sourceType": "clickhouse"`

---

### Step 3: Verify .env Configuration

Check `/Users/Husam/Dev/rafed-hack/dashboard-builder/server/.env`:

```env
# ClickHouse Configuration (already added)
CLICKHOUSE_URL=http://localhost:8155
CLICKHOUSE_USER=viewer
CLICKHOUSE_PASSWORD=rafed_view
```

These match your `docker-compose.yml` and `/apps/shared.js` configuration.

---

### Step 4: Start Dashboard Builder

```bash
cd /Users/Husam/Dev/rafed-hack/dashboard-builder
pnpm dev
```

Opens at:
- Server: http://localhost:2100
- Client: http://localhost:2200

---

### Step 5: Test with Real Data

Open http://localhost:2200 and try:

**Test 1: Student Count KPI**
```
"Create a stat card showing total number of students from the students table"
```

Expected: AI uses ClickHouse query:
```sql
SELECT count() as total_students FROM students
```

**Test 2: Students by Region Chart**
```
"Create a bar chart showing top 5 regions by student count"
```

Expected: AI uses:
```sql
SELECT region_ar, count() as count FROM students GROUP BY region_ar ORDER BY count DESC LIMIT 5
```

**Test 3: Complete Dashboard**
```
"Create a transport analytics dashboard with KPIs showing total students, total routes, and average utilization, plus charts for students by region and route distribution"
```

---

## 📊 Available ClickHouse Tables

### From `/apps` Dashboards

| Table | Description | Used In |
|-------|-------------|---------|
| `students` | Student data with demographics | rafed_dashboard.html |
| `schools` | School information | rafed_dashboard.html |
| `school_routes` | Bus routes with capacity | operational_dashboard.html |
| `unassigned_students` | Students without routes | capacity_demand_dashboard.html |
| `support_data_report8_official_complaints_937_rafed` | Complaints | cx_dashboard.html |
| `support_data_report10_cost_per_student_structure` | Cost data | financial_dashboard.html |
| `support_data_report11b_willingness_to_pay` | Payment data | financial_dashboard.html |
| `vw_transport_demand_hotspots` | Demand view | capacity_demand_dashboard.html |

### Common Queries from `/apps`

#### Student Stats
```sql
-- Total students
SELECT count() as total FROM students

-- By gender
SELECT gender, count() as count FROM students GROUP BY gender

-- By region
SELECT region_ar, count() as count FROM students GROUP BY region_ar ORDER BY count DESC LIMIT 5
```

#### Route Analytics
```sql
-- Route summary
SELECT 
  count() as total_routes,
  round(avg(utilization), 1) as avg_util,
  sum(student_count) as total_students
FROM school_routes

-- By vehicle type
SELECT 
  vehicle_type,
  count() as routes,
  sum(capacity) as capacity
FROM school_routes 
GROUP BY vehicle_type
```

#### Complaints
```sql
-- Total complaints
SELECT sum(total_complaints) as total FROM support_data_report8_official_complaints_937_rafed

-- By region
SELECT region, sum(total_complaints) as count 
FROM support_data_report8_official_complaints_937_rafed 
GROUP BY region 
ORDER BY count DESC
```

---

## 🔧 Architecture

### Data Flow

```
User Request
    ↓
AI Agent (with CLICKHOUSE_SYSTEM_PROMPT.md)
    ↓
create_component tool
    ↓
{
  "query": {
    "sql": "SELECT count() FROM students",
    "handlebarsTemplate": "...",
    "sourceType": "clickhouse"  ← Defaults to this now
  }
}
    ↓
DataFetcher.fetchData()
    ↓
queryClickHouse() utility
    ↓
POST http://localhost:2100/data/query-clickhouse
    ↓
NestJS Server (DataService.executeClickHouseQuery)
    ↓
POST http://localhost:8155/?default_format=JSON
    ↓
ClickHouse Database
    ↓
Results → Handlebars transform → ECharts component
```

### Code Changes Summary

#### Backend
1. **server/src/data/data.controller.ts**
   - Added `/data/query-clickhouse` endpoint

2. **server/src/data/data.service.ts**
   - Added `executeClickHouseQuery()` method
   - Fetches from ClickHouse HTTP API

3. **server/.env**
   - Added `CLICKHOUSE_URL`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`

#### Frontend
1. **client/src/utils/queryClickHouse.ts** ✨ NEW
   - Utility to query ClickHouse via backend

2. **client/src/types/types.ts**
   - Added `ClickHouseQuery` type
   - Updated `DataSource` union type

3. **client/src/utils/dataFetcher.ts**
   - Added `fetchFromClickHouse()` method
   - Added `fetchFromClickHouseRaw()` method
   - Updated `fetchFromSource()` to handle ClickHouse

4. **client/src/components/DashboardBuilderTools.tsx**
   - Default source type changed to `'clickhouse'`
   - DataFetcher initialized with `clickhouseEnabled: true`

---

## 📝 Usage Examples

### Example 1: Simple KPI Card

**User Request:**
```
"Show me total number of students"
```

**AI Generated Component:**
```json
{
  "id": "total_students",
  "type": "stat-card",
  "gridArea": "kpi1",
  "title": "Total Students",
  "data": {},
  "query": {
    "sql": "SELECT count() as total FROM students",
    "handlebarsTemplate": "{\"value\": {{total}}, \"label\": \"Total Students\", \"icon\": \"lucide:users\"}",
    "sourceType": "clickhouse"
  }
}
```

---

### Example 2: Bar Chart

**User Request:**
```
"Create a bar chart of students by region"
```

**AI Generated Component:**
```json
{
  "id": "students_by_region",
  "type": "chart",
  "gridArea": "chart1",
  "title": "Students by Region",
  "data": {},
  "query": {
    "sql": "SELECT region_ar, count() as count FROM students GROUP BY region_ar ORDER BY count DESC LIMIT 6",
    "handlebarsTemplate": "{\n  \"xAxis\": {\"type\": \"category\", \"data\": [{{#each data}}\"{{region_ar}}\"{{#unless @last}},{{/unless}}{{/each}}]},\n  \"yAxis\": {\"type\": \"value\"},\n  \"series\": [{\"type\": \"bar\", \"data\": [{{#each data}}{{count}}{{#unless @last}},{{/unless}}{{/each}}]}]\n}",
    "sourceType": "clickhouse"
  }
}
```

---

### Example 3: Data Table

**User Request:**
```
"Show me unassigned students grouped by reason"
```

**AI Generated Component:**
```json
{
  "id": "unassigned_reasons",
  "type": "table",
  "gridArea": "table1",
  "title": "Unassigned Students by Reason",
  "data": {},
  "query": {
    "sql": "SELECT reason, count() as count FROM unassigned_students GROUP BY reason ORDER BY count DESC LIMIT 10",
    "handlebarsTemplate": "{\n  \"columns\": [{\"key\": \"reason\", \"label\": \"Reason\"}, {\"key\": \"count\", \"label\": \"Count\", \"align\": \"right\"}],\n  \"rows\": [{{#each data}}{\"reason\": \"{{reason}}\", \"count\": \"{{count}}\"}{{#unless @last}},{{/unless}}{{/each}}]\n}",
    "sourceType": "clickhouse"
  }
}
```

---

## ⚠️ Important Notes

### ClickHouse vs PostgreSQL Syntax

The AI now knows the differences:

| Feature | PostgreSQL | ClickHouse |
|---------|-----------|------------|
| Count all | `COUNT(*)` | `count()` |
| Count distinct | `COUNT(DISTINCT col)` | `uniq(col)` |
| To float | `col::numeric` | `toFloat64(col)` |
| To string | `col::text` | `toString(col)` |
| Upper case | `UPPER(col)` | `upper(col)` |

### Default Behavior Change

**Before:** Components defaulted to PostgreSQL
**Now:** Components default to ClickHouse

To use PostgreSQL explicitly:
```json
{
  "query": {
    "sql": "SELECT * FROM table",
    "sourceType": "postgresql"  // Override default
  }
}
```

---

## 🧪 Testing Checklist

- [ ] ClickHouse container is running (`docker ps`)
- [ ] Can query ClickHouse directly (`curl "http://localhost:8155/?query=SELECT+1"`)
- [ ] Dashboard builder server is running (port 2100)
- [ ] Dashboard builder client is running (port 2200)
- [ ] System prompt updated to `CLICKHOUSE_SYSTEM_PROMPT.md`
- [ ] Test query: "Show me total students" works
- [ ] Test chart: "Create a bar chart of students by region" works
- [ ] Test table: "Show unassigned students by reason" works

---

## 🐛 Troubleshooting

### Issue: "ClickHouse error: Connection refused"

**Check:**
```bash
# Is ClickHouse running?
docker ps | grep clickhouse

# Start it if not
cd /Users/Husam/Dev/rafed-hack
docker-compose -f docker/docker-compose.yml up -d clickhouse
```

---

### Issue: "Table doesn't exist"

**Verify tables:**
```bash
curl "http://localhost:8155/?query=SHOW+TABLES"
```

**Expected tables:**
- students
- schools
- school_routes
- unassigned_students
- support_data_report8_official_complaints_937_rafed

If tables are missing, you need to restore your ClickHouse data.

---

### Issue: AI uses PostgreSQL instead of ClickHouse

**Check:**
1. System prompt updated to `CLICKHOUSE_SYSTEM_PROMPT.md`?
2. Prompt clearly states "use ClickHouse" and defaults to it?
3. Examples in prompt use `"sourceType": "clickhouse"`?

---

### Issue: Query syntax error

**Check ClickHouse syntax:**
- Use `count()` not `COUNT(*)`
- Use `toFloat64()` not `::numeric`
- Use `toString()` not `::text`

See `CLICKHOUSE_SYSTEM_PROMPT.md` → "ClickHouse vs PostgreSQL Differences"

---

## 📖 Additional Resources

### Files Created/Modified

**New Files:**
- `CLICKHOUSE_SYSTEM_PROMPT.md` - AI instructions with real examples
- `CLICKHOUSE_INTEGRATION.md` - This file
- `client/src/utils/queryClickHouse.ts` - Query utility

**Modified Files:**
- `server/src/data/data.controller.ts` - Added endpoint
- `server/src/data/data.service.ts` - Added ClickHouse method
- `server/.env` - Added ClickHouse config
- `client/src/types/types.ts` - Added ClickHouse type
- `client/src/utils/dataFetcher.ts` - Added ClickHouse support
- `client/src/components/DashboardBuilderTools.tsx` - Default to ClickHouse

### Related Documentation
- `IMPROVED_SYSTEM_PROMPT.md` - Original PostgreSQL version
- `SIMPLE_CHART_EXAMPLES.md` - Chart examples (now work with ClickHouse too)
- `MCP_CONFIGURATION_GUIDE.md` - PostgreSQL MCP guide

---

## 🎯 Next Steps

1. **Update System Prompt**
   - Copy `CLICKHOUSE_SYSTEM_PROMPT.md` to agent flow

2. **Start Services**
   ```bash
   # ClickHouse
   docker-compose -f docker/docker-compose.yml up -d clickhouse
   
   # Dashboard Builder
   cd dashboard-builder && pnpm dev
   ```

3. **Test Examples**
   - Try: "Show me total students"
   - Try: "Create a bar chart of students by region"
   - Try: "Build a transport analytics dashboard"

4. **Recreate `/apps` Dashboards**
   - Use AI to recreate cx_dashboard.html
   - Use AI to recreate operational_dashboard.html
   - Use AI to recreate capacity_demand_dashboard.html

---

## 🎉 Summary

**You can now:**
✅ Query ClickHouse from dashboard builder
✅ Use real tables from `/apps` dashboards
✅ Create components with ClickHouse data
✅ AI understands ClickHouse syntax
✅ Recreate any `/apps` dashboard using the builder

**The AI knows:**
✅ All available ClickHouse tables
✅ ClickHouse vs PostgreSQL syntax differences
✅ 8 real examples from your `/apps` dashboards
✅ Proper Handlebars templates for each component type
✅ To default to ClickHouse (not PostgreSQL)

**Start building dashboards with real Rafed data! 🚀**
