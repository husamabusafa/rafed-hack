# Dashboard Builder - JS Transform Migration

## Overview

The dashboard builder has been refactored to use **JavaScript transformation functions** instead of Handlebars templates for data transformation. This provides more flexibility, better error handling, and a clearer feedback loop for the AI.

## What Changed?

### 1. **Handlebars → JavaScript Functions**

**Before (Handlebars):**
```json
{
  "query": {
    "sql": "SELECT name, value FROM table",
    "handlebarsTemplate": "{\"data\": [{{#each data}}{{value}}{{/each}}]}"
  }
}
```

**After (JavaScript):**
```json
{
  "query": {
    "sql": "SELECT name, value FROM table",
    "jsCode": "function transform(data) { return { data: data.map(r => r.value) }; }"
  }
}
```

### 2. **Enhanced Feedback Loop**

The AI now receives complete execution traces:

```json
{
  "success": true,
  "data": {
    "fetch": {
      "queryResponse": {...},      // Raw database response
      "finalData": {...},          // Final transformed data
      "transform": {
        "afterJS": {...},          // Output of JS transformation
        "afterAlaSQL": {...}       // Optional AlaSQL output
      },
      "jsExecutionTime": 2.5,      // Execution time in ms
      "error": null                // Error message if any
    }
  }
}
```

This allows the AI to:
- See the raw query results
- See the transformed data
- Identify transformation errors
- Iterate and fix issues

### 3. **Type System Updates**

**New Types:**
```typescript
export interface JSTransformFunction {
  code: string; // JavaScript function code
}

export interface ComponentDataConfig {
  source: DataSource;
  jsTransform?: JSTransformFunction;  // NEW: Replaces handlebarsTemplate
  alasqlTransform?: AlaSQLTransform;  // Optional, still available
  cache?: {...};
}
```

### 4. **Safe JS Execution**

New `jsExecutor.ts` utility provides:
- Sandboxed function execution
- Syntax validation
- Error handling with detailed messages
- Execution time tracking

## Files Modified

### Core Files
1. **`/client/src/types/types.ts`**
   - Removed `HandlebarsTemplate` interface
   - Added `JSTransformFunction` interface
   - Updated `ComponentDataConfig`

2. **`/client/src/utils/jsExecutor.ts`** (NEW)
   - Safe JS code execution
   - Syntax validation
   - Template generators

3. **`/client/src/utils/dataFetcher.ts`**
   - Removed Handlebars dependency
   - Removed all Handlebars helpers
   - Added JS transformation support
   - Enhanced trace results

4. **`/client/src/components/DashboardBuilderTools.tsx`**
   - Updated `create_component` tool
   - Updated `update_component` tool
   - Changed response format to include JS execution details

5. **`/agent-flow-Chart_Builder-2025-11-10.json`**
   - Updated system prompt with JS transformation guide
   - Updated tool schemas
   - Added comprehensive examples

## Migration Guide

### For Developers

If you have existing components with Handlebars templates, you need to migrate them:

**Old Handlebars:**
```handlebars
{
  "xAxis": {
    "data": [{{#each data}}"{{name}}"{{#unless @last}},{{/unless}}{{/each}}]
  },
  "series": [{
    "data": [{{#each data}}{{value}}{{#unless @last}},{{/unless}}{{/each}}]
  }]
}
```

**New JavaScript:**
```javascript
function transform(data) {
  return {
    xAxis: {
      data: data.map(row => row.name)
    },
    series: [{
      data: data.map(row => row.value)
    }]
  };
}
```

### For AI Agent

The AI agent now has access to:
1. JavaScript's full power (map, filter, reduce, etc.)
2. Execution feedback for debugging
3. Clear error messages
4. No quoting/escaping issues

**Example Workflow:**
```javascript
// 1. Write query
sql: "SELECT region, SUM(sales) as total FROM sales GROUP BY region"

// 2. Write transform
jsCode: `function transform(data) {
  return {
    xAxis: { type: 'category', data: data.map(r => r.region) },
    yAxis: { type: 'value' },
    series: [{
      data: data.map(r => r.total),
      type: 'bar'
    }]
  };
}`

// 3. Review response - if error, fix and retry
```

## Benefits

### 1. **More Powerful Transformations**
```javascript
// Complex grouping and calculations
function transform(data) {
  const grouped = data.reduce((acc, row) => {
    if (!acc[row.category]) {
      acc[row.category] = { total: 0, count: 0 };
    }
    acc[row.category].total += row.value;
    acc[row.category].count += 1;
    return acc;
  }, {});
  
  return {
    xAxis: { data: Object.keys(grouped) },
    series: [{
      data: Object.values(grouped).map(g => g.total / g.count)
    }]
  };
}
```

### 2. **Better Error Messages**
```
Before: "Handlebars template error at line 3"
After:  "Runtime error: Cannot read property 'value' of undefined at row 5"
```

### 3. **Debugging Support**
```javascript
function transform(data) {
  // You can add console-style debugging logic
  if (!data || data.length === 0) {
    return { error: 'No data received' };
  }
  
  // Transform with confidence
  return {...};
}
```

### 4. **No Template Syntax Issues**
- No need to escape quotes
- No `{{#each}}` vs `{{field}}` confusion
- Native JavaScript syntax

## Testing

To test the new system:

```bash
cd /Users/Husam/Dev/rafed-hack/dashboard-builder/client
pnpm install
pnpm dev
```

Then interact with the AI agent using the updated tools.

## Rollback

If you need to rollback to Handlebars:
```bash
cd /Users/Husam/Dev/rafed-hack/dashboard-builder
cp agent-flow-Chart_Builder-2025-11-10.backup.json agent-flow-Chart_Builder-2025-11-10.json
```

Then revert the code changes using git.

## Examples

### Stat Card
```javascript
function transform(data) {
  const row = data[0];
  return {
    value: row.total_students,
    label: 'Total Students',
    icon: 'lucide:users',
    trend: {
      value: row.month_change_percent,
      direction: row.month_change_percent > 0 ? 'up' : 'down'
    }
  };
}
```

### Table
```javascript
function transform(data) {
  return {
    columns: [
      { key: 'school_name', label: 'School', icon: 'lucide:school' },
      { key: 'student_count', label: 'Students', align: 'right' },
      { key: 'route_count', label: 'Routes', align: 'right' }
    ],
    rows: data
  };
}
```

### Complex Chart
```javascript
function transform(data) {
  // Group by region and category
  const series = {};
  const xAxisData = [...new Set(data.map(r => r.month))];
  
  data.forEach(row => {
    if (!series[row.category]) {
      series[row.category] = {
        name: row.category,
        type: 'line',
        data: new Array(xAxisData.length).fill(0)
      };
    }
    const index = xAxisData.indexOf(row.month);
    series[row.category].data[index] = row.value;
  });
  
  return {
    legend: { data: Object.keys(series) },
    xAxis: { type: 'category', data: xAxisData },
    yAxis: { type: 'value' },
    series: Object.values(series)
  };
}
```

## Support

For questions or issues, check:
1. `/client/src/utils/jsExecutor.ts` - JS execution implementation
2. `/client/src/utils/dataFetcher.ts` - Data fetching and transformation
3. Agent flow JSON - System prompt and tool definitions

## Future Enhancements

Potential improvements:
- TypeScript support in transform functions
- Built-in utility functions library
- Transform function caching
- Visual transform editor
- More template examples
