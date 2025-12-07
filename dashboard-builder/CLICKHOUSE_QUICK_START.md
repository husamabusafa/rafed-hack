# ClickHouse Dashboard Builder - Quick Start

## ✅ Integration Complete!

Your dashboard builder now works with ClickHouse using the same data as `/apps` dashboards.

---

## 🚀 Start in 3 Commands

### 1. Start ClickHouse
```bash
cd /Users/Husam/Dev/rafed-hack
docker-compose -f docker/docker-compose.yml up -d clickhouse
```

### 2. Update Agent System Prompt
Replace the system prompt in `agent-flow-Chart_Builder-2025-11-10.json` (line 55) with:

**File:** `CLICKHOUSE_SYSTEM_PROMPT.md`

### 3. Start Dashboard Builder
```bash
cd dashboard-builder
pnpm dev
```

Visit: http://localhost:2200

---

## 🧪 Test It Works

Try these commands in the UI:

**Test 1:**
```
"Show me total number of students"
```
✅ Expected: KPI card with count from `students` table

**Test 2:**
```
"Create a bar chart of students by region"
```
✅ Expected: Bar chart using `students` table grouped by `region_ar`

**Test 3:**
```
"Build a transport dashboard with route statistics"
```
✅ Expected: Multiple components using `school_routes` table

---

## 📊 Available Tables (Same as /apps)

| Table | What It Has | Example Query |
|-------|-------------|---------------|
| `students` | Student demographics | `SELECT count() FROM students` |
| `schools` | School data | `SELECT count() FROM schools` |
| `school_routes` | Bus routes | `SELECT avg(utilization) FROM school_routes` |
| `unassigned_students` | Students without routes | `SELECT reason, count() FROM unassigned_students GROUP BY reason` |
| `support_data_report8_official_complaints_937_rafed` | Complaints | `SELECT region, sum(total_complaints) FROM ... GROUP BY region` |

---

## 🎯 Key Changes

### What Changed
1. ✅ **Backend**: Added `/data/query-clickhouse` endpoint
2. ✅ **Frontend**: Added ClickHouse query utility
3. ✅ **Default**: Components now use ClickHouse (not PostgreSQL)
4. ✅ **AI Prompt**: New `CLICKHOUSE_SYSTEM_PROMPT.md` with 8 real examples

### What to Know
- **ClickHouse syntax**: Use `count()` not `COUNT(*)`
- **Type casting**: Use `toFloat64()` not `::numeric`
- **Source type**: Defaults to `"clickhouse"` automatically
- **Real tables**: Same tables as your `/apps` dashboards

---

## 📝 Example: Create Student Dashboard

**User:**
```
"Create a dashboard with 3 KPIs showing total students, total schools, and average route utilization, plus a bar chart of students by region"
```

**AI will:**
1. Create grid layout (3 columns, 2 rows)
2. Create KPI cards using ClickHouse queries:
   - `SELECT count() FROM students`
   - `SELECT count() FROM schools`
   - `SELECT round(avg(utilization), 1) FROM school_routes`
3. Create bar chart:
   - `SELECT region_ar, count() FROM students GROUP BY region_ar`

**All using real data from ClickHouse!**

---

## 🔧 Configuration

### ClickHouse Connection (Already Set)

**server/.env:**
```env
CLICKHOUSE_URL=http://localhost:8155
CLICKHOUSE_USER=viewer
CLICKHOUSE_PASSWORD=rafed_view
```

These match your `docker-compose.yml` and `/apps/shared.js`.

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **CLICKHOUSE_QUICK_START.md** | This file - get started fast |
| **CLICKHOUSE_SYSTEM_PROMPT.md** | AI prompt with real examples |
| **CLICKHOUSE_INTEGRATION.md** | Technical details & architecture |
| **SIMPLE_CHART_EXAMPLES.md** | Chart examples (work with ClickHouse too) |

---

## ⚠️ Troubleshooting

### ClickHouse not responding?
```bash
# Check if running
docker ps | grep clickhouse

# Restart if needed
docker restart $(docker ps -q --filter "ancestor=clickhouse/clickhouse-server")
```

### Tables missing?
```bash
# List tables
curl "http://localhost:8155/?query=SHOW+TABLES"
```

If tables are empty, restore your ClickHouse backup.

### AI uses PostgreSQL instead?
1. Check system prompt is updated to `CLICKHOUSE_SYSTEM_PROMPT.md`
2. Verify examples show `"sourceType": "clickhouse"`

---

## 🎉 You're Ready!

**Next:** Open http://localhost:2200 and start building dashboards with real Rafed data from ClickHouse! 🚀

**Try:** "Create a transport analytics dashboard" and watch the AI build it using your actual data.
