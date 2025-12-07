# Analytics Indicators & Deck.gl Visualization Specification

## 1. Comprehensive Indicator Library
This library defines the standard metrics available in the platform, derived from ClickHouse (OLAP) and PostgreSQL (Views).

### 1.1 Demand & Growth Indicators
| Indicator Name | Formula / Source | Grain | Business Value |
| :--- | :--- | :--- | :--- |
| **Total Eligible Demand** | $\sum$ Students where `bus_elig = 1` | Region, City, School | Baseline for fleet sizing. |
| **Demand Density** | Eligible Students / Area ($km^2$) | Grid, Neighborhood | Identifies hotspots for mass transit vs. feeder vans. |
| **Waitlist Volume** | Count of students in `unassigned_students` | School, Region | Immediate actionable gap analysis. |
| **Future Demand (2030)** | `current_students` * `growth_rate` (from R3 Report) | Region | Long-term infrastructure planning. |
| **Private Transport Share** | Students using Private/Uber (from R9 Report) | Region | Potential market share to capture. |

### 1.2 Operational Efficiency Indicators
| Indicator Name | Formula / Source | Grain | Business Value |
| :--- | :--- | :--- | :--- |
| **Fleet Utilization Rate** | $\sum$ Assigned Students / $\sum$ Bus Capacity | Route, School, Region | **Critical:** Low utilization = wasted money. High = overcrowding. |
| **Route Efficiency Index** | Passenger-Km / Vehicle-Km | Route | Measures if routes are direct or meandering. |
| **Deadhead Ratio** | Empty Distance / Total Distance | Route | Measures non-revenue mileage (efficiency loss). |
| **Avg Commute Time** | Avg(`duration_s`) / 60 | Student, School | Quality of life metric. Target < 45 mins. |
| **Students Per Stop** | Total Students / Stop Count | Route | Stop density optimization. |

### 1.3 Service Quality & Equity Indicators
| Indicator Name | Formula / Source | Grain | Business Value |
| :--- | :--- | :--- | :--- |
| **Service Coverage Ratio** | Served Students / Eligible Students | Region | Headline metric for government reporting. |
| **Walkability Score** | % Students within 1km Isochrone | School | Opportunities to reduce busing for walkable students. |
| **Special Needs Access** | % Special Needs Students with Assigned Transport | Region | Inclusivity compliance. |
| **Complaint Rate** | (Complaints / Total Trips) * 1000 | Region | Customer satisfaction early warning system. |
| **Low-Income Penetration** | % Served in Low-Income Brackets | Neighborhood | Social impact measurement. |

---

## 2. Deck.gl Visualization Specifications
Specifications for the frontend engineering team to implement high-performance map layers.

### 2.1 Layer: **Student Density Heatmap**
Visualizes where the students actually live to guide stop placement.
- **DeckGL Layer:** `HexagonLayer` (Aggregation)
- **Data Source:** ClickHouse `public_students` (Lat/Lon columns)
- **Props:**
    - `coverage`: 0.9
    - `radius`: 250 (meters)
    - `elevationScale`: Students count
    - `colorRange`: [Blue -> Yellow -> Red]
- **Tooltip:** "X Students in this hex"

### 2.2 Layer: **Route Flow Network**
Visualizes the school bus network topology and load.
- **DeckGL Layer:** `PathLayer`
- **Data Source:** Postgres `vw_bus_routes_statistics` (GeoJSON)
- **Props:**
    - `getPath`: `d => d.geom`
    - `getColor`: `d => d.utilization > 1.0 ? [255, 0, 0] : [0, 255, 0]` (Red if overloaded)
    - `getWidth`: `d => d.capacity` (Thicker lines for larger buses)
- **Tooltip:** "Route ID: X, Utilization: 85%, Duration: 40min"

### 2.3 Layer: **School Catchment Isochrones**
Visualizes accessibility and walking zones.
- **DeckGL Layer:** `GeoJsonLayer` (Polygon)
- **Data Source:** Postgres `vw_school_accessibility_zones`
- **Props:**
    - `getFillColor`:
        - 1km: `[0, 255, 0, 100]` (Green, transparent)
        - 3km: `[255, 255, 0, 80]` (Yellow)
        - 5km: `[255, 0, 0, 60]` (Red)
    - `stroked`: True
- **Tooltip:** "Travel Time Zone: < 10 mins"

### 2.4 Layer: **Regional Gap Choropleth**
Strategic view of supply/demand balance.
- **DeckGL Layer:** `GeoJsonLayer` (Polygon)
- **Data Source:** Postgres `vw_demand_capacity_gap`
- **Props:**
    - `getFillColor`: Scale based on `demand_capacity_ratio`
        - < 50% (Surplus): Blue
        - 80-100% (Balanced): Green
        - > 100% (Shortage): Red
    - `getElevation`: `total_demand` (Optional 3D extrusion)
- **Tooltip:** "Region: Riyadh, Gap: -5000 seats"

### 2.5 Layer: **Unassigned Student Scatter**
Pinpoints for individual students needing transport (Micro-level).
- **DeckGL Layer:** `ScatterplotLayer`
- **Data Source:** Postgres `vw_unassigned_students_heatmap`
- **Props:**
    - `radiusScale`: 10
    - `getFillColor`: `[255, 140, 0]` (Orange)
    - `stroked`: true
- **Interaction:** Click to see Student ID, Grade, Distance to School.

---

## 3. Dashboard Definitions

### 3.1 **The "Rafed Command Center" (Executive)**
**Purpose:** Real-time monitoring of the national transport operation.
- **Top Bar (Big Numbers):**
    - 🚌 **Active Fleet:** 12,500 Buses
    - 🎒 **Students Transported:** 450,000
    - ⚠️ **Critical Alerts:** 5 Regions with shortage
- **Main View (Map):**
    - Base: Dark Mode Mapbox.
    - Layer: `Regional Gap Choropleth` (3D extruded by demand).
- **Bottom Panel (Charts):**
    - Trend: Monthly Growth in Eligible Demand vs. Capacity.
    - Distribution: Fleet Utilization Bell Curve (Identify inefficiencies).

### 3.2 **The "Route Planner Workbench" (Operational)**
**Purpose:** Tools for optimizing routes and assigning stops.
- **Filters:** Region Selector, School Selector, "Show Only Overloaded Routes".
- **Main View (Map):**
    - Layer 1: `Route Flow Network` (Color-coded by load).
    - Layer 2: `Student Density Heatmap` (To see clusters off-route).
    - Layer 3: `School Catchment Isochrones` (To identify walkable students).
- **Right Panel (Details):**
    - List of selected routes with `Deadhead Ratio` and `Cost per Student`.
    - Action Buttons: "Optimize Route", "Reassign Students".

### 3.3 **The "Equity & Inclusion Monitor" (Policy)**
**Purpose:** Ensuring fair access for all demographics.
- **Filters:** Income Level, Disability Type, Rural/Urban.
- **Main View (Map):**
    - Layer: `Unassigned Student Scatter` filtered by "Special Needs".
    - Layer: `Regional Gap Choropleth` colored by "Low Income Penetration".
- **Sidebar metrics:**
    - "Distance to School" for Low Income vs. High Income.
    - % of Special Needs demand met.
