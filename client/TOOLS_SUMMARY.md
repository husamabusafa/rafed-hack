# Dashboard Builder Tools - Quick Reference

## 🛠️ All 5 Tools

### 1. **set_dashboard_code**
Create or completely replace dashboard HTML code.

**Parameters:**
- `htmlCode` (required): Complete HTML document
- `title` (optional): Dashboard title
- `description` (optional): Dashboard description

---

### 2. **get_dashboard_code**
Retrieve current dashboard HTML code.

**Parameters:** None

---

### 3. **update_dashboard_code**
Make surgical edits to existing dashboard code.

**Parameters:**
- `oldCode` (required): Exact text to find
- `newCode` (required): Replacement text
- `description` (optional): What changed

---

### 4. **list_dashboard_examples** ⭐ NEW
Get list of 22+ example dashboards from /apps directory.

**Parameters:** None

**Returns:**
```json
{
  "examples": [
    {
      "name": "cx_dashboard.html",
      "title": "Customer Experience Dashboard",
      "description": "Complaint monitoring with regional map hotspots..."
    }
  ],
  "categories": {
    "operations": ["operational_dashboard.html", ...],
    "analytics": ["cx_dashboard.html", ...],
    "planning": ["demand_gap_dashboard.html", ...],
    "visualization": ["deckgl_3d_analytics.html", ...]
  }
}
```

**Available Examples:**
1. cx_dashboard.html - Customer Experience
2. market_intelligence_dashboard.html - Market Analysis
3. operational_dashboard.html - Fleet Management
4. equity_dashboard.html - Equity & Inclusion
5. demand_gap_dashboard.html - Demand Analysis
6. environmental_dashboard.html - Environmental Impact
7. network_coverage_dashboard.html - Coverage Analysis
8. financial_dashboard.html - Financial Metrics
9. rafed_dashboard.html - Executive Dashboard
10. rafed_dashboard_ar.html - Arabic Interface
11. routes_dashboard.html - Route Visualization
12. regional_scorecard.html - Regional Metrics
13. route_planning_workbench.html - Route Planning
14. growth_forecast_dashboard.html - Growth Projections
15. capacity_demand_dashboard.html - Capacity Analysis
16. rafed_coverage_dashboard.html - Coverage Maps
17. special_needs_dashboard.html - Special Needs Transport
18. deckgl_3d_analytics.html - 3D Visualizations
19. deckgl_animated_routes.html - Animated Routes
20. deckgl_density_heatmap.html - Density Heatmap
21. data_catalog_dashboard.html - Data Catalog
22. data_insights_explorer.html - Data Explorer

---

### 5. **read_dashboard_example** ⭐ NEW
Read complete HTML code of an example dashboard.

**Parameters:**
- `filename` (required): Exact filename (e.g., "cx_dashboard.html")

**Returns:**
```json
{
  "filename": "cx_dashboard.html",
  "htmlCode": "<!DOCTYPE html>...",
  "codeLength": 13090,
  "note": "You can now analyze this code..."
}
```

---

## 🎯 Usage Patterns

### Pattern 1: Create Dashboard from Example
```
1. list_dashboard_examples()
2. read_dashboard_example("cx_dashboard.html")
3. Study the code structure
4. set_dashboard_code(adaptedHTML)
```

### Pattern 2: Browse & Learn
```
1. list_dashboard_examples()
2. Find relevant example by category
3. read_dashboard_example(filename)
4. Extract patterns (queries, map setup, charts)
5. Create your own version
```

### Pattern 3: Multi-Example Learning
```
1. list_dashboard_examples()
2. read_dashboard_example("deckgl_3d_analytics.html")
3. read_dashboard_example("deckgl_density_heatmap.html")
4. Combine techniques from both
5. set_dashboard_code(combinedDashboard)
```

---

## 📊 Example Categories

### Operations
- operational_dashboard.html
- routes_dashboard.html
- route_planning_workbench.html

### Analytics
- cx_dashboard.html
- market_intelligence_dashboard.html
- data_insights_explorer.html

### Planning
- demand_gap_dashboard.html
- growth_forecast_dashboard.html
- capacity_demand_dashboard.html

### Visualization
- deckgl_3d_analytics.html
- deckgl_animated_routes.html
- deckgl_density_heatmap.html

---

## 💡 Agent Best Practices

1. **Always list examples first** when user asks for a new dashboard type
2. **Read relevant examples** to understand patterns before creating
3. **Adapt, don't copy** - learn the structure but customize for user needs
4. **Study multiple examples** if combining features (e.g., 3D + heatmap)
5. **Reference examples in responses** - tell user which example inspired the design

---

## 🚀 Quick Start for Agent

**User asks**: "Create a customer experience dashboard"

**Agent workflow**:
```
1. list_dashboard_examples()
   → Find "cx_dashboard.html - Customer Experience Dashboard"

2. read_dashboard_example("cx_dashboard.html")
   → Study structure: KPIs, map setup, chart types, ClickHouse queries

3. set_dashboard_code(adaptedCode)
   → Create similar dashboard with:
     - Same CDN libraries
     - Similar layout structure
     - Adapted queries for user's needs
     - Customized colors/styling

4. Respond:
   "✅ Created CX dashboard based on cx_dashboard.html example.
   Includes complaint map, KPI cards, and category charts."
```

---

## 🎨 Key Learnings from Examples

All examples follow these patterns:

### CDN Libraries
- TailwindCSS, Deck.gl, MapLibre, Chart.js, Iconify

### Structure
- Header (icon + title + actions)
- KPI cards grid (4 metrics)
- Main content (map + charts)
- Dark theme (#0f172a background)

### ClickHouse Query
```javascript
async function query(sql) {
    const res = await fetch('http://localhost:8155/?user=viewer&password=rafed_view', {
        method: 'POST',
        body: sql + ' FORMAT JSON'
    });
    return (await res.json()).data || [];
}
```

### Map Setup
```javascript
const map = new maplibregl.Map({
    container: 'map-container',
    style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    center: [45.0, 24.0],
    zoom: 5
});
```

---

## 🔍 When to Use Each Tool

| User Request | Tools to Use |
|--------------|--------------|
| "Create a dashboard like..." | `list_dashboard_examples` → `read_dashboard_example` → `set_dashboard_code` |
| "Create a new dashboard" | `list_dashboard_examples` (check options) → `set_dashboard_code` |
| "Show me examples" | `list_dashboard_examples` |
| "How does X dashboard work?" | `read_dashboard_example` |
| "Change color to blue" | `get_dashboard_code` → `update_dashboard_code` |
| "View current code" | `get_dashboard_code` |

---

## ✅ Success Criteria

Agent should:
- ✅ Reference example dashboards when creating new ones
- ✅ Study examples before implementing
- ✅ Explain which example inspired the design
- ✅ Adapt examples rather than copying verbatim
- ✅ Combine techniques from multiple examples when needed
