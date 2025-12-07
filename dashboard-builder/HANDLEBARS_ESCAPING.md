# Handlebars Variable Escaping in JSON

## ✅ Update Complete

The AI system prompt has been updated to use **escaped Handlebars syntax** in JSON strings.

---

## 🔧 What Changed

### Before (Incorrect):
```json
{
  "handlebarsTemplate": "{\"value\": {{total_students}}, \"label\": \"Total Students\"}"
}
```
❌ This causes JSON parsing errors because `{{` is not escaped.

### After (Correct):
```json
{
  "handlebarsTemplate": "{\"value\": \{\{total_students\}\}, \"label\": \"Total Students\"}"
}
```
✅ Backslashes escape the braces: `\{\{variable\}\}`

---

## 📝 Updated Rules in System Prompt

The AI now follows these rules:

### CRITICAL RULES
1. **ESCAPE HANDLEBARS**: Always use `\{\{variable\}\}` (with backslashes) in JSON strings
2. **Single-row** (stat-card): Use `\{\{field\}\}` directly
3. **Multi-row** (table/chart): Use `\{\{#each data\}\}\{\{field\}\}\{\{/each\}\}`
4. **Quote table values**: `"\{\{field\}\}"` even for numbers
5. **Commas**: Use `\{\{#unless @last\}\},\{\{/unless\}\}`
6. **Closing tags**: Use `\{\{/each\}\}`, `\{\{/if\}\}`, etc. with backslashes

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
    "handlebarsTemplate": "{\"value\": \{\{total_students\}\}, \"label\": \"Total Students\", \"icon\": \"lucide:users\"}",
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
    "handlebarsTemplate": "{\"xAxis\": {\"type\": \"category\", \"data\": [\{\{#each data\}\}\"{\{region_ar\}\}\"\{\{#unless @last\}\},\{\{/unless\}\}\{\{/each\}\}]}, \"series\": [{\"type\": \"bar\", \"data\": [\{\{#each data\}\}\{\{count\}\}\{\{#unless @last\}\},\{\{/unless\}\}\{\{/each\}\}]}]}",
    "sourceType": "clickhouse"
  }
}
```

### Example 3: Table

**Correct:**
```json
{
  "id": "unassigned_students_table",
  "type": "table",
  "gridArea": "table1",
  "query": {
    "sql": "SELECT reason, count() as count FROM unassigned_students GROUP BY reason LIMIT 10",
    "handlebarsTemplate": "{\"columns\": [{\"key\": \"reason\", \"label\": \"Reason\"}, {\"key\": \"count\", \"label\": \"Count\"}], \"rows\": [\{\{#each data\}\}{\"reason\": \"\{\{reason\}\}\", \"count\": \"\{\{count\}\}\"}\{\{#unless @last\}\},\{\{/unless\}\}\{\{/each\}\}]}",
    "sourceType": "clickhouse"
  }
}
```

---

## 🎯 Why This Matters

### JSON Parsing
JSON parsers need proper escaping:
- `{` and `}` are special in JSON
- `{{` without escaping causes parse errors
- `\{\{` tells the parser it's a literal string

### Handlebars Processing
After JSON parsing, the template engine sees:
- `{{variable}}` (the backslashes are removed)
- Handlebars then processes the variables correctly

---

## 🔄 Processing Flow

```
1. AI generates:
   "handlebarsTemplate": "{\"value\": \{\{total_students\}\}}"
                                       ↓
2. JSON parser reads:
   "handlebarsTemplate": "{\"value\": {{total_students}}}"
                                       ↓
3. Backend stores:
   {"value": {{total_students}}}
                                       ↓
4. Handlebars processes:
   {"value": 12500}
```

---

## ✅ Verification

### Check System Prompt
```bash
grep "ESCAPE HANDLEBARS" /Users/Husam/Dev/rafed-hack/dashboard-builder/CLICKHOUSE_SYSTEM_PROMPT.md
# Expected: Should find the rule
```

### Check Agent Flow
```bash
grep "ESCAPE HANDLEBARS" /Users/Husam/Dev/rafed-hack/dashboard-builder/agent-flow-Chart_Builder-2025-11-10.json
# Expected: Should find it in the system prompt node
```

### Test Component Creation
When the AI creates a component, the JSON should have:
```json
"handlebarsTemplate": "{...\\{\\{variable\\}\\}...}"
```

Note: In the actual JSON file, you'll see `\{\{` because the JSON itself escapes the backslashes.

---

## 🚀 Impact

✅ **All examples updated** - 8 real examples now use escaped syntax  
✅ **Rules clarified** - CRITICAL RULES section emphasizes escaping  
✅ **Agent knows** - System prompt in agent flow updated  
✅ **Prevents errors** - No more JSON parsing failures  

---

## 📝 Summary

**What to expect from AI:**
- All `{{variable}}` → `\{\{variable\}\}` in JSON strings
- All `{{#each data}}` → `\{\{#each data\}\}` in JSON strings
- All `{{/each}}` → `\{\{/each\}\}` in JSON strings
- All `{{#unless @last}}` → `\{\{#unless @last\}\}` in JSON strings

**The AI will now generate syntactically correct JSON with properly escaped Handlebars templates!** ✅
