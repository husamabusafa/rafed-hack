# Handlebars Quoting Rules - CRITICAL ⚠️

The AI must follow strict quoting rules for Handlebars variables in JSON.

---

## 🎯 The Rule

### String Values → MUST Quote
```json
{"name": "{{region}}", "gender": "{{gender}}"}
```
✅ Strings are quoted

### Number Values → NO Quotes
```json
{"value": {{count}}, "total": {{sum}}}
```
✅ Numbers are not quoted

### Mixed (Common in Charts)
```json
{"name": "{{region}}", "value": {{count}}}
```
✅ String quoted, number not quoted

---

## ❌ Common Mistakes

### Mistake 1: Unquoted Strings
```json
{"name": {{region}}, "value": {{count}}}
```
❌ **WRONG** - `{{region}}` is a string, needs quotes!

**Correct:**
```json
{"name": "{{region}}", "value": {{count}}}
```

### Mistake 2: Quoted Numbers
```json
{"value": "{{count}}"}
```
❌ **WRONG** - `{{count}}` is a number, don't quote it!

**Correct:**
```json
{"value": {{count}}}
```

---

## 📊 Examples by Component Type

### KPI Card (Stat-Card)

**Numbers - No Quotes:**
```json
{
  "value": {{total_students}},
  "label": "Total Students",
  "icon": "lucide:users"
}
```

**With Trend (also a number):**
```json
{
  "value": {{total_routes}},
  "label": "Total Routes",
  "trend": {
    "value": {{avg_util}},
    "direction": "up"
  }
}
```

---

### Bar Chart

**xAxis data (strings) - Quoted:**
```json
{
  "xAxis": {
    "type": "category",
    "data": [
      {{#each data}}"{{region_ar}}"{{#unless @last}},{{/unless}}{{/each}}
    ]
  },
  "series": [{
    "type": "bar",
    "data": [
      {{#each data}}{{count}}{{#unless @last}},{{/unless}}{{/each}}
    ]
  }]
}
```

**Breakdown:**
- `"{{region_ar}}"` - String (region name) → Quoted ✅
- `{{count}}` - Number → Not quoted ✅

---

### Pie Chart

**Mixed strings and numbers:**
```json
{
  "series": [{
    "type": "pie",
    "data": [
      {{#each data}}
      {"name": "{{gender}}", "value": {{count}}}{{#unless @last}},{{/unless}}
      {{/each}}
    ]
  }]
}
```

**Breakdown:**
- `"{{gender}}"` - String (male/female) → Quoted ✅
- `{{count}}` - Number → Not quoted ✅

---

### Table

**Special Rule: Quote EVERYTHING in tables**
```json
{
  "columns": [
    {"key": "reason", "label": "Reason"},
    {"key": "count", "label": "Count"}
  ],
  "rows": [
    {{#each data}}
    {"reason": "{{reason}}", "count": "{{count}}"}{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

**Why?** Tables display everything as text, so for consistency, quote all values (even numbers).

---

## 🔍 How to Know What to Quote

### Ask These Questions:

1. **Is it a name, label, or category?** → Quote it
   - Examples: region, gender, reason, vehicle_type
   - `"{{region}}"` ✅

2. **Is it a number, count, or metric?** → Don't quote it
   - Examples: count, total, sum, avg, utilization
   - `{{count}}` ✅

3. **Is it in a table?** → Quote everything
   - All table values: `"{{field}}"` ✅

---

## 📋 Complete Examples

### Example 1: Student Count KPI
```json
{
  "id": "total_students_card",
  "type": "stat-card",
  "query": {
    "sql": "SELECT count() as total_students FROM students",
    "handlebarsTemplate": "{\"value\": {{total_students}}, \"label\": \"Total Students\", \"icon\": \"lucide:users\"}",
    "sourceType": "clickhouse"
  }
}
```
✅ `{{total_students}}` is a number → Not quoted

---

### Example 2: Students by Region Chart
```json
{
  "id": "students_by_region",
  "type": "chart",
  "query": {
    "sql": "SELECT region_ar, count() as count FROM students GROUP BY region_ar LIMIT 6",
    "handlebarsTemplate": "{\"xAxis\": {\"type\": \"category\", \"data\": [{{#each data}}\"{{region_ar}}\"{{#unless @last}},{{/unless}}{{/each}}]}, \"yAxis\": {\"type\": \"value\"}, \"series\": [{\"type\": \"bar\", \"data\": [{{#each data}}{{count}}{{#unless @last}},{{/unless}}{{/each}}]}]}",
    "sourceType": "clickhouse"
  }
}
```
✅ `"{{region_ar}}"` is a string (region name) → Quoted  
✅ `{{count}}` is a number → Not quoted

---

### Example 3: Students by Gender Pie
```json
{
  "id": "students_by_gender",
  "type": "chart",
  "query": {
    "sql": "SELECT gender, count() as count FROM students GROUP BY gender",
    "handlebarsTemplate": "{\"series\": [{\"type\": \"pie\", \"data\": [{{#each data}}{\"name\": \"{{gender}}\", \"value\": {{count}}}{{#unless @last}},{{/unless}}{{/each}}]}]}",
    "sourceType": "clickhouse"
  }
}
```
✅ `"{{gender}}"` is a string (male/female) → Quoted  
✅ `{{count}}` is a number → Not quoted

---

### Example 4: Unassigned Students Table
```json
{
  "id": "unassigned_table",
  "type": "table",
  "query": {
    "sql": "SELECT reason, count() as count FROM unassigned_students GROUP BY reason LIMIT 10",
    "handlebarsTemplate": "{\"columns\": [{\"key\": \"reason\", \"label\": \"Reason\"}, {\"key\": \"count\", \"label\": \"Count\"}], \"rows\": [{{#each data}}{\"reason\": \"{{reason}}\", \"count\": \"{{count}}\"}{{#unless @last}},{{/unless}}{{/each}}]}",
    "sourceType": "clickhouse"
  }
}
```
✅ `"{{reason}}"` is quoted (table rule)  
✅ `"{{count}}"` is quoted (table rule - even though it's a number)

---

## 🎯 Quick Reference

| Data Type | Example Field | How to Write | Result |
|-----------|---------------|--------------|--------|
| **String** | region, gender, name | `"{{region}}"` | `"Riyadh"` |
| **Number** | count, total, sum | `{{count}}` | `1234` |
| **Table (any)** | any field | `"{{field}}"` | `"value"` |

---

## ⚠️ Common Errors

### Error 1: Unquoted String
```
{"name": {{region}}}
```
**Problem:** Handlebars outputs `Riyadh` but JSON expects `"Riyadh"`  
**Result:** Invalid JSON

**Fix:**
```
{"name": "{{region}}"}
```
**Result:** Valid JSON with `"Riyadh"`

### Error 2: Quoted Number
```
{"value": "{{count}}"}
```
**Problem:** Handlebars outputs `"1234"` as a string, not a number  
**Result:** ECharts treats it as text, not a numeric value

**Fix:**
```
{"value": {{count}}}
```
**Result:** Valid JSON with number `1234`

---

## 🧪 Testing

### Test 1: KPI Card
```
"Create a KPI showing total students"
```

**Expected:**
```json
"handlebarsTemplate": "{\"value\": {{total_students}}, \"label\": \"Total Students\"}"
```
✅ Number not quoted

### Test 2: Bar Chart
```
"Create a bar chart of students by region"
```

**Expected:**
```json
"handlebarsTemplate": "...{{#each data}}\"{{region_ar}}\"...{{count}}..."
```
✅ String quoted, number not quoted

### Test 3: Pie Chart
```
"Create a pie chart of students by gender"
```

**Expected:**
```json
"handlebarsTemplate": "...{\"name\": \"{{gender}}\", \"value\": {{count}}}..."
```
✅ String quoted, number not quoted

---

## 📝 Summary

**The Golden Rule:**
- **Strings** (names, labels, categories) → `"{{variable}}"`
- **Numbers** (counts, totals, metrics) → `{{variable}}`
- **Tables** (everything) → `"{{variable}}"`

**Remember:**
- ECharts needs numbers as numbers (not strings)
- JSON needs strings as strings (with quotes)
- Handlebars fills in the value, you provide the quotes

**Updated in:**
- ✅ System prompt (CRITICAL RULES section)
- ✅ Tool descriptions (create_component)
- ✅ Zod schemas (handlebarsTemplate parameter)
- ✅ All 8 examples

**The AI now knows to quote strings and not quote numbers!** 🎉
