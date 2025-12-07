# Simple Chart Component Examples

These are production-ready examples extracted from the `/apps` dashboards, simplified for easy copy-paste into the Dashboard Builder.

## 📊 Chart.js vs ECharts

**Note**: The `/apps` dashboards use Chart.js, but the Dashboard Builder uses **ECharts**. The examples below are adapted to ECharts format.

---

## 1. 📈 Simple Bar Chart

**Use Case**: Compare values across categories (e.g., complaints by region, sales by product)

### Static Data Example

```json
{
  "id": "bar_chart",
  "type": "chart",
  "gridArea": "chart1",
  "title": "Complaints by Region",
  "data": {
    "title": {
      "text": "Complaints by Region",
      "textStyle": { "color": "#FFFFFF", "fontSize": 14 }
    },
    "tooltip": { "trigger": "axis" },
    "xAxis": {
      "type": "category",
      "data": ["Riyadh", "Makkah", "Eastern Province", "Madinah", "Asir", "Qassim"],
      "axisLabel": { "color": "#94a3b8" }
    },
    "yAxis": {
      "type": "value",
      "axisLabel": { "color": "#94a3b8" }
    },
    "series": [{
      "name": "Complaints",
      "type": "bar",
      "data": [5200, 4300, 3800, 2100, 1500, 1550],
      "itemStyle": {
        "color": "#06b6d4",
        "borderRadius": [4, 4, 0, 0]
      }
    }]
  }
}
```

### With PostgreSQL Query

**SQL:**
```sql
SELECT 
  region,
  COUNT(*) as complaint_count
FROM complaints
GROUP BY region
ORDER BY complaint_count DESC
LIMIT 6
```

**Handlebars Template:**
```handlebars
{
  "title": {
    "text": "Complaints by Region",
    "textStyle": { "color": "#FFFFFF", "fontSize": 14 }
  },
  "tooltip": { "trigger": "axis" },
  "xAxis": {
    "type": "category",
    "data": [{{#each data}}"{{region}}"{{#unless @last}},{{/unless}}{{/each}}],
    "axisLabel": { "color": "#94a3b8" }
  },
  "yAxis": {
    "type": "value",
    "axisLabel": { "color": "#94a3b8" }
  },
  "series": [{
    "name": "Complaints",
    "type": "bar",
    "data": [{{#each data}}{{complaint_count}}{{#unless @last}},{{/unless}}{{/each}}],
    "itemStyle": {
      "color": "#06b6d4",
      "borderRadius": [4, 4, 0, 0]
    }
  }]
}
```

---

## 2. 🥧 Simple Pie Chart

**Use Case**: Show distribution/breakdown (e.g., category percentages, status breakdown)

### Static Data Example

```json
{
  "id": "pie_chart",
  "type": "chart",
  "gridArea": "chart2",
  "title": "Complaints by Category",
  "data": {
    "title": {
      "text": "Complaints by Category",
      "left": "center",
      "textStyle": { "color": "#FFFFFF", "fontSize": 14 }
    },
    "tooltip": { "trigger": "item" },
    "legend": {
      "orient": "vertical",
      "right": "10%",
      "top": "center",
      "textStyle": { "color": "#94a3b8" }
    },
    "series": [{
      "name": "Category",
      "type": "pie",
      "radius": ["40%", "70%"],
      "data": [
        { "name": "Delay", "value": 7200 },
        { "name": "Vehicle Condition", "value": 6100 },
        { "name": "Driver Behavior", "value": 5150 }
      ],
      "itemStyle": {
        "borderRadius": 8,
        "borderColor": "#17181C",
        "borderWidth": 2
      },
      "label": {
        "color": "#FFFFFF"
      }
    }]
  }
}
```

### With PostgreSQL Query

**SQL:**
```sql
SELECT 
  category,
  COUNT(*) as count
FROM complaints
GROUP BY category
ORDER BY count DESC
```

**Handlebars Template:**
```handlebars
{
  "title": {
    "text": "Complaints by Category",
    "left": "center",
    "textStyle": { "color": "#FFFFFF", "fontSize": 14 }
  },
  "tooltip": { "trigger": "item" },
  "legend": {
    "orient": "vertical",
    "right": "10%",
    "top": "center",
    "textStyle": { "color": "#94a3b8" }
  },
  "series": [{
    "name": "Category",
    "type": "pie",
    "radius": ["40%", "70%"],
    "data": [
      {{#each data}}
      { "name": "{{category}}", "value": {{count}} }{{#unless @last}},{{/unless}}
      {{/each}}
    ],
    "itemStyle": {
      "borderRadius": 8,
      "borderColor": "#17181C",
      "borderWidth": 2
    },
    "label": {
      "color": "#FFFFFF"
    }
  }]
}
```

---

## 3. 📉 Simple Line Chart

**Use Case**: Show trends over time (e.g., daily sales, monthly users)

### Static Data Example

```json
{
  "id": "line_chart",
  "type": "chart",
  "gridArea": "chart3",
  "title": "Daily Sales Trend",
  "data": {
    "title": {
      "text": "Daily Sales (Last 7 Days)",
      "textStyle": { "color": "#FFFFFF", "fontSize": 14 }
    },
    "tooltip": { "trigger": "axis" },
    "xAxis": {
      "type": "category",
      "data": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "axisLabel": { "color": "#94a3b8" }
    },
    "yAxis": {
      "type": "value",
      "axisLabel": { "color": "#94a3b8" }
    },
    "series": [{
      "name": "Sales",
      "type": "line",
      "data": [1200, 1900, 1500, 2300, 2100, 2800, 3200],
      "smooth": true,
      "lineStyle": { "color": "#6366F1", "width": 2 },
      "areaStyle": {
        "color": {
          "type": "linear",
          "x": 0, "y": 0, "x2": 0, "y2": 1,
          "colorStops": [
            { "offset": 0, "color": "rgba(99, 102, 241, 0.3)" },
            { "offset": 1, "color": "rgba(99, 102, 241, 0.05)" }
          ]
        }
      },
      "itemStyle": { "color": "#6366F1" }
    }]
  }
}
```

### With PostgreSQL Query

**SQL:**
```sql
SELECT 
  TO_CHAR(date, 'Mon DD') as day,
  SUM(amount)::numeric(10,2) as total
FROM sales
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY date
ORDER BY date
```

**Handlebars Template:**
```handlebars
{
  "title": {
    "text": "Daily Sales (Last 7 Days)",
    "textStyle": { "color": "#FFFFFF", "fontSize": 14 }
  },
  "tooltip": { "trigger": "axis" },
  "xAxis": {
    "type": "category",
    "data": [{{#each data}}"{{day}}"{{#unless @last}},{{/unless}}{{/each}}],
    "axisLabel": { "color": "#94a3b8" }
  },
  "yAxis": {
    "type": "value",
    "axisLabel": { "color": "#94a3b8" }
  },
  "series": [{
    "name": "Sales",
    "type": "line",
    "data": [{{#each data}}{{total}}{{#unless @last}},{{/unless}}{{/each}}],
    "smooth": true,
    "lineStyle": { "color": "#6366F1", "width": 2 },
    "areaStyle": {
      "color": {
        "type": "linear",
        "x": 0, "y": 0, "x2": 0, "y2": 1,
        "colorStops": [
          { "offset": 0, "color": "rgba(99, 102, 241, 0.3)" },
          { "offset": 1, "color": "rgba(99, 102, 241, 0.05)" }
        ]
      }
    },
    "itemStyle": { "color": "#6366F1" }
  }]
}
```

---

## 4. 📊 Horizontal Bar Chart

**Use Case**: Rankings, comparisons with long labels

### Static Data Example

```json
{
  "id": "horizontal_bar",
  "type": "chart",
  "gridArea": "chart4",
  "title": "Top Routes by Utilization",
  "data": {
    "title": {
      "text": "Top 5 Routes",
      "textStyle": { "color": "#FFFFFF", "fontSize": 14 }
    },
    "tooltip": { "trigger": "axis" },
    "xAxis": {
      "type": "value",
      "axisLabel": { "color": "#94a3b8" }
    },
    "yAxis": {
      "type": "category",
      "data": ["Route A", "Route B", "Route C", "Route D", "Route E"],
      "axisLabel": { "color": "#94a3b8" }
    },
    "series": [{
      "name": "Utilization %",
      "type": "bar",
      "data": [95, 88, 76, 72, 68],
      "itemStyle": {
        "color": "#10b981",
        "borderRadius": [0, 4, 4, 0]
      }
    }]
  }
}
```

---

## 5. 📇 Simple Data Table

**Use Case**: List of records, detailed data

### Static Data Example

```json
{
  "id": "data_table",
  "type": "table",
  "gridArea": "table1",
  "title": "Recent Orders",
  "data": {
    "columns": [
      { "key": "id", "label": "Order ID", "icon": "lucide:hash", "width": "100px" },
      { "key": "customer", "label": "Customer", "icon": "lucide:user" },
      { "key": "amount", "label": "Amount", "icon": "lucide:dollar-sign", "align": "right" },
      { "key": "status", "label": "Status", "icon": "lucide:badge-check" }
    ],
    "rows": [
      { "id": "ORD-001", "customer": "John Doe", "amount": "$1,234", "status": "Completed" },
      { "id": "ORD-002", "customer": "Jane Smith", "amount": "$856", "status": "Pending" },
      { "id": "ORD-003", "customer": "Bob Johnson", "amount": "$2,100", "status": "Completed" }
    ]
  }
}
```

### With PostgreSQL Query

**SQL:**
```sql
SELECT 
  order_id,
  customer_name,
  '$' || amount::numeric(10,2)::text as amount,
  UPPER(status) as status
FROM orders
ORDER BY created_at DESC
LIMIT 10
```

**Handlebars Template:**
```handlebars
{
  "columns": [
    { "key": "order_id", "label": "Order ID", "icon": "lucide:hash", "width": "100px" },
    { "key": "customer_name", "label": "Customer", "icon": "lucide:user" },
    { "key": "amount", "label": "Amount", "icon": "lucide:dollar-sign", "align": "right" },
    { "key": "status", "label": "Status", "icon": "lucide:badge-check" }
  ],
  "rows": [
    {{#each data}}
    {
      "order_id": "{{order_id}}",
      "customer_name": "{{customer_name}}",
      "amount": "{{amount}}",
      "status": "{{status}}"
    }{{#unless @last}},{{/unless}}
    {{/each}}
  ]
}
```

---

## 6. 📊 KPI Stat Card

**Use Case**: Single metric display

### Static Data Example

```json
{
  "id": "revenue_card",
  "type": "stat-card",
  "gridArea": "kpi1",
  "title": "Total Revenue",
  "data": {
    "value": 18450,
    "label": "Total Revenue",
    "icon": "lucide:dollar-sign",
    "trend": {
      "value": 12.5,
      "direction": "up"
    }
  }
}
```

### With PostgreSQL Query

**SQL:**
```sql
SELECT 
  COALESCE(SUM(amount), 0) as total_revenue,
  ROUND(
    ((SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN amount ELSE 0 END) - 
      SUM(CASE WHEN created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' THEN amount ELSE 0 END)) / 
      NULLIF(SUM(CASE WHEN created_at >= NOW() - INTERVAL '14 days' AND created_at < NOW() - INTERVAL '7 days' THEN amount ELSE 0 END), 0) * 100), 1
  ) as trend_pct
FROM sales
```

**Handlebars Template:**
```handlebars
{
  "value": {{total_revenue}},
  "label": "Total Revenue",
  "icon": "lucide:dollar-sign",
  "trend": {
    "value": {{default trend_pct 0}},
    "direction": "{{#if (gt trend_pct 0)}}up{{else}}down{{/if}}"
  }
}
```

---

## 7. 📊 Multi-Series Line Chart

**Use Case**: Compare multiple metrics over time

### Static Data Example

```json
{
  "id": "multi_line",
  "type": "chart",
  "gridArea": "chart5",
  "title": "Revenue vs Costs",
  "data": {
    "title": {
      "text": "Revenue vs Costs",
      "textStyle": { "color": "#FFFFFF", "fontSize": 14 }
    },
    "tooltip": { "trigger": "axis" },
    "legend": {
      "data": ["Revenue", "Costs"],
      "textStyle": { "color": "#94a3b8" }
    },
    "xAxis": {
      "type": "category",
      "data": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      "axisLabel": { "color": "#94a3b8" }
    },
    "yAxis": {
      "type": "value",
      "axisLabel": { "color": "#94a3b8" }
    },
    "series": [
      {
        "name": "Revenue",
        "type": "line",
        "data": [1200, 1900, 1500, 2300, 2100, 2800],
        "smooth": true,
        "lineStyle": { "color": "#10b981", "width": 2 },
        "itemStyle": { "color": "#10b981" }
      },
      {
        "name": "Costs",
        "type": "line",
        "data": [800, 1100, 900, 1400, 1200, 1600],
        "smooth": true,
        "lineStyle": { "color": "#ef4444", "width": 2 },
        "itemStyle": { "color": "#ef4444" }
      }
    ]
  }
}
```

---

## 8. 📊 Stacked Bar Chart

**Use Case**: Show composition over categories

### Static Data Example

```json
{
  "id": "stacked_bar",
  "type": "chart",
  "gridArea": "chart6",
  "title": "Orders by Status",
  "data": {
    "title": {
      "text": "Orders by Region and Status",
      "textStyle": { "color": "#FFFFFF", "fontSize": 14 }
    },
    "tooltip": { "trigger": "axis" },
    "legend": {
      "data": ["Completed", "Pending", "Cancelled"],
      "textStyle": { "color": "#94a3b8" }
    },
    "xAxis": {
      "type": "category",
      "data": ["Riyadh", "Jeddah", "Dammam"],
      "axisLabel": { "color": "#94a3b8" }
    },
    "yAxis": {
      "type": "value",
      "axisLabel": { "color": "#94a3b8" }
    },
    "series": [
      {
        "name": "Completed",
        "type": "bar",
        "stack": "total",
        "data": [120, 200, 150],
        "itemStyle": { "color": "#10b981" }
      },
      {
        "name": "Pending",
        "type": "bar",
        "stack": "total",
        "data": [80, 100, 70],
        "itemStyle": { "color": "#f59e0b" }
      },
      {
        "name": "Cancelled",
        "type": "bar",
        "stack": "total",
        "data": [20, 30, 25],
        "itemStyle": { "color": "#ef4444" }
      }
    ]
  }
}
```

---

## 🎨 Color Palette

Use these colors for consistency with the theme:

```javascript
const COLORS = {
  primary: '#6366F1',    // Indigo
  accent: '#8B5CF6',     // Purple
  success: '#10b981',    // Green
  warning: '#f59e0b',    // Amber
  danger: '#ef4444',     // Red
  info: '#06b6d4',       // Cyan
  
  // Chart series
  series: [
    '#6366F1', // Indigo
    '#10b981', // Green
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#8B5CF6', // Purple
    '#ef4444'  // Red
  ]
}
```

---

## 🚀 Quick Start Templates

### Complete 2x2 Dashboard

```json
{
  "grid": {
    "columns": "1fr 1fr",
    "rows": "auto 1fr",
    "gap": "16px",
    "templateAreas": ["kpi1 kpi2", "chart1 chart2"]
  },
  "components": {
    "kpi1": { /* stat-card example #6 */ },
    "kpi2": { /* stat-card with different metric */ },
    "chart1": { /* bar chart example #1 */ },
    "chart2": { /* pie chart example #2 */ }
  }
}
```

### Sales Dashboard Layout

```json
{
  "grid": {
    "columns": "1fr 1fr 1fr",
    "rows": "auto 1fr 1fr",
    "gap": "16px",
    "templateAreas": [
      "kpi1 kpi2 kpi3",
      "chart1 chart1 chart2",
      "table1 table1 table1"
    ]
  }
}
```

---

**Tips:**
- Start with static data to test layout
- Then add PostgreSQL queries once structure is confirmed
- Always use `{{#unless @last}},{{/unless}}` for commas in arrays
- Quote all table values: `"{{field}}"`
- Cast numeric types in SQL: `::numeric(10,2)`
- Convert dates to text: `::text` or `TO_CHAR()`
