# Handlebars Normal Syntax - Updated ✅

AI now uses **normal Handlebars syntax** without backslash escaping.

---

## ✅ What Changed

### Before (With Backslashes):
```json
{
  "handlebarsTemplate": "{\"value\": \\{\\{total_students\\}\\}, \"label\": \"Total Students\"}"
}
```

### After (Normal Syntax):
```json
{
  "handlebarsTemplate": "{\"value\": {{total_students}}, \"label\": \"Total Students\"}"
}
```

---

## 📝 Updated Rules

### CRITICAL RULES (Normal Handlebars)
1. **ALWAYS** wrap variables: `{{variable}}`
2. **Single-row** (stat-card): Use `{{field}}` directly
3. **Multi-row** (table/chart): Use `{{#each data}}{{field}}{{/each}}`
4. **Quote table values**: `"{{field}}"` even for numbers
5. **Commas**: Use `{{#unless @last}},{{/unless}}`

**No backslashes needed!**

---

## 📊 Examples

### Example 1: KPI Card (Stat-Card)

**Correct:**
```json
{
  "id": "total_students_card",
  "type": "stat-card",
  "gridArea": "kpi1",
  "query": {
    "sql": "SELECT count() as total_students FROM students",
    "handlebarsTemplate": "{\"value\": {{total_students}}, \"label\": \"Total Students\", \"icon\": \"lucide:users\"}",
    "sourceType": "clickhouse"
  }
}
```

### Example 2: Bar Chart

**Correct:**
```json
{
  "id": "students_by_region",
  "type": "chart",
  "gridArea": "chart1",
  "query": {
    "sql": "SELECT region_ar, count() as count FROM students GROUP BY region_ar LIMIT 6",
    "handlebarsTemplate": "{\"xAxis\": {\"type\": \"category\", \"data\": [{{#each data}}\"{{region_ar}}\"{{#unless @last}},{{/unless}}{{/each}}]}, \"series\": [{\"type\": \"bar\", \"data\": [{{#each data}}{{count}}{{#unless @last}},{{/unless}}{{/each}}]}]}",
    "sourceType": "clickhouse"
  }
}
```

### Example 3: Pie Chart

**Correct:**
```json
{
  "id": "students_by_gender_pie",
  "type": "chart",
  "gridArea": "chart2",
  "query": {
    "sql": "SELECT gender, count() as count FROM students GROUP BY gender",
    "handlebarsTemplate": "{\"title\": {\"text\": \"Students by Gender\", \"left\": \"center\", \"textStyle\": {\"color\": \"#FFFFFF\", \"fontSize\": 14}}, \"tooltip\": {\"trigger\": \"item\"}, \"legend\": {\"orient\": \"vertical\", \"right\": \"10%\", \"top\": \"center\", \"textStyle\": {\"color\": \"#94a3b8\"}}, \"series\": [{\"name\": \"Students\", \"type\": \"pie\", \"radius\": [\"40%\", \"70%\"], \"data\": [{{#each data}}{\"name\": \"{{gender}}\", \"value\": {{count}}}{{#unless @last}},{{/unless}}{{/each}}], \"itemStyle\": {\"borderRadius\": 8, \"borderColor\": \"#17181C\", \"borderWidth\": 2}}]}",
    "sourceType": "clickhouse"
  }
}
```

### Example 4: Table

**Correct:**
```json
{
  "id": "unassigned_students_table",
  "type": "table",
  "gridArea": "table1",
  "query": {
    "sql": "SELECT reason, count() as count FROM unassigned_students GROUP BY reason LIMIT 10",
    "handlebarsTemplate": "{\"columns\": [{\"key\": \"reason\", \"label\": \"Reason\"}, {\"key\": \"count\", \"label\": \"Count\"}], \"rows\": [{{#each data}}{\"reason\": \"{{reason}}\", \"count\": \"{{count}}\"}{{#unless @last}},{{/unless}}{{/each}}]}",
    "sourceType": "clickhouse"
  }
}
```

---

## 🎯 What AI Will Generate Now

**For KPI Card:**
```json
"handlebarsTemplate": "{\"value\": {{total_students}}, \"label\": \"Total Students\"}"
```

**For Charts with Loops:**
```json
"handlebarsTemplate": "{\"data\": [{{#each data}}{\"name\": \"{{region}}\", \"value\": {{count}}}{{#unless @last}},{{/unless}}{{/each}}]}"
```

**For Tables:**
```json
"handlebarsTemplate": "{\"rows\": [{{#each data}}{\"name\": \"{{name}}\", \"count\": \"{{count}}\"}{{#unless @last}},{{/unless}}{{/each}}]}"
```

---

## 📁 Files Updated

1. ✅ **CLICKHOUSE_SYSTEM_PROMPT.md** - Rules + all 8 examples reverted
2. ✅ **agent-flow-Chart_Builder-2025-11-10.json** - System prompt + tool descriptions updated
3. ✅ **HANDLEBARS_NORMAL_SYNTAX.md** - This documentation

---

## 🔄 Processing Flow

```
1. AI generates:
   "handlebarsTemplate": "{\"value\": {{total_students}}}"
                                       ↓
2. Frontend stores as string:
   {"value": {{total_students}}}
                                       ↓
3. Handlebars processes:
   {"value": 12500}
```

**Simple and straightforward!**

---

## ✅ Verification

### Check System Prompt
```bash
grep "ALWAYS wrap variables" /Users/Husam/Dev/rafed-hack/dashboard-builder/CLICKHOUSE_SYSTEM_PROMPT.md
# Expected: Should find the rule without backslashes
```

### Check Examples
```bash
grep "{{total_students}}" /Users/Husam/Dev/rafed-hack/dashboard-builder/CLICKHOUSE_SYSTEM_PROMPT.md
# Expected: Should find normal {{}} syntax
```

### Test Component Creation
When the AI creates a component, the JSON should have:
```json
"handlebarsTemplate": "{...{{variable}}...}"
```

**No backslashes!**

---

## 🚀 Impact

✅ **Simpler syntax** - No escaping needed  
✅ **Easier to read** - Standard Handlebars  
✅ **All examples updated** - 8 real examples use normal syntax  
✅ **Tool descriptions updated** - All mention normal {{}}  
✅ **Agent knows** - System prompt emphasizes standard syntax  

---

## 📝 Summary

**AI will now generate:**
- `{{variable}}` instead of `\{\{variable\}\}`
- `{{#each data}}` instead of `\{\{#each data\}\}`
- `{{/each}}` instead of `\{\{/each\}\}`
- `{{#unless @last}}` instead of `\{\{#unless @last\}\}`

**The AI returns normal, standard Handlebars syntax!** ✅

---

## 🧪 Test After Update

Try asking the AI:
```
"Create a KPI card showing total students"
```

**Expected JSON:**
```json
{
  "query": {
    "sql": "SELECT count() as total_students FROM students",
    "handlebarsTemplate": "{\"value\": {{total_students}}, \"label\": \"Total Students\"}",
    "sourceType": "clickhouse"
  }
}
```

**Should see:** Normal `{{total_students}}` syntax  
**Should NOT see:** Escaped `\{\{total_students\}\}` syntax

---

**All set! AI now uses clean, normal Handlebars syntax.** 🎉
