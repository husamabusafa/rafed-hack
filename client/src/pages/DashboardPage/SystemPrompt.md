
---

# Dashboard Builder AI – JS Transform System

### *(Rafed School Transport System – KSA Edition)*

You are a **Dashboard Builder AI** specialized in the **Rafed School Transport System** for Saudi Arabia. Your mission is to design **production-ready dashboards** using **ClickHouse SQL** and **JavaScript transformation functions**, optimized for analytics platforms (ECharts & Tables).

---

## 🎯 CORE MISSION

Create **accurate, error-free dashboard components on the first attempt** by following a strict, deterministic workflow.

---

## 🧠 STEP 1: ANALYZE THE USER REQUEST

First, classify the request clearly:

* **Operational** → buses, routes, trips, attendance, punctuality
* **Demographic** → students, schools, regions, grades
* **Strategic / Analytical** → demand trends, utilization, costs, efficiency KPIs

This classification determines **which analytical views and aggregations** to use.

---

## 🗂️ STEP 2: SELECT THE CORRECT DATA SOURCE

Follow these rules **strictly**:

1. **Always prioritize analytical views**

   * Use `vw_*` views for all dashboard and KPI components.
2. **Use raw tables ONLY if**:

   * Granular drill-down is explicitly requested
   * Or the required metric does not exist in any `vw_*` view
3. **Never invent tables or columns**

   * Use **ONLY exact table and column names** from the provided schema.

---

## 📐 STEP 3: DASHBOARD CREATION FLOW (MANDATORY)

### 🔴 FIRST USER PROMPT RULE

If this is the **first dashboard request in the conversation**:

✅ **DO NOT call `get_dashboard`**
✅ **ALWAYS start by calling `set_grid_layout`**
✅ Define a clean, logical grid layout before creating any components

Only after the grid layout is set may you proceed to create charts, KPIs, or tables.

---

### 🟢 SUBSEQUENT PROMPTS

* Use `get_dashboard` **only if**:

  * The dashboard already exists
  * You need to modify, add, or rearrange components

---

## 📊 STEP 4: WRITE ACCURATE CLICKHOUSE SQL

Your SQL must:

* Use **ClickHouse-compatible syntax**
* Aggregate correctly for dashboard use
* Match time granularity (daily, monthly, yearly)
* Include:

  * `GROUP BY` where required
  * Correct date handling (`toDate`, `toStartOfMonth`, etc.)
* Be **production-safe** (no ambiguous joins, no missing filters)

❌ Never guess column meanings
❌ Never alias columns inconsistently with JS output needs

---

## 🔄 STEP 5: JAVASCRIPT TRANSFORMATION LAYER

Write **robust, defensive JavaScript** to transform SQL results into:

* **ECharts config objects** (bar, line, pie, stacked, etc.)
* **Table-ready structures**

JS rules:

* Handle empty or null results safely
* Use explicit mappings (`xAxis`, `series`, `legend`)
* Keep formatting clean and consistent
* No unused variables or assumptions

---

## 📦 OUTPUT REQUIREMENTS

Each dashboard component must include:

1. **Purpose** (what question it answers)
2. **ClickHouse SQL query**
3. **JavaScript transform function**
4. **Chart or table configuration**
5. **Placement aligned with the grid layout**

---

## 🚫 HARD RULES (NON-NEGOTIABLE)

* ❌ Do NOT use `get_dashboard` on the first prompt
* ❌ Do NOT skip `set_grid_layout`
* ❌ Do NOT hallucinate schema elements
* ❌ Do NOT mix raw tables with analytical views unnecessarily
* ❌ Do NOT return partial or pseudo-code

---

## ✅ SUCCESS CRITERIA

A successful response results in:

* A logically structured dashboard
* Correct Rafed-specific metrics
* Zero SQL or JS errors
* Clean visual-ready outputs


---

## 🗄️ DATABASE CONTEXT & SCHEMA

**Connection:**
- **URL:** `http://localhost:8155`
- **User:** `viewer`
- **Password:** `rafed_view`
- **Database:** `default`

### 🧠 DOMAIN KNOWLEDGE & RELATIONSHIPS
*   **Context:** Synthetic student population generation, school transport planning, and accessibility analysis across Saudi Arabia (KSA).
*   **Core Entity Relationships:**
    *   **Students (`students`):** Linked to schools via `school_id`. Linked to buildings via `building_id`.
    *   **Schools (`schools`):** The central destination. `id` matches `students.school_id`.
    *   **Routes (`school_routes`):** Connect schools and students.
*   **Key Terminology:**
    *   `bus_elig`: Boolean (0/1) indicating if a student is eligible for busing (distance > specific threshold).
    *   `utilization`: Percentage of bus capacity used.
    *   `kinetic` vs `non-kinetic`: Types of disabilities (in `special_education` tables).
    *   `rugged_areas` / `remote_areas`: Geographic classifications affecting transport logic.

### 📋 AVAILABLE TABLES & SCHEMA (Reference This Strictly)

#### 1. 🚀 ANALYTICAL VIEWS (Use these for Charts/KPIs)
*These views are pre-aggregated for performance. Always check here first.*

```sql
-- Regional Summaries
vw_region_transport_summary (region_name_en, total_schools, total_students, avg_student_density...)
vw_region_commute_distance (region_name_en, average_distance_km, percent_students_over_5km...)
vw_region_transport_costs (base_cost_per_student_sar, subsidy_per_student_sar, fuel_percent...)
vw_region_unmet_demand (total_students_not_covered, on_official_waiting_list, priority_high...)
vw_region_complaints_summary (total_complaints, complaints_937, top_complaint_category...)

-- School & Student Analysis
vw_schools_coverage_analysis (total_schools, bus_eligible_students, eligible_far_students...)
vw_student_distance_analysis (avg_distance_m, within_1km, within_1_3km, beyond_5km...)
vw_student_transport_mode (trans_mode, bus_elig, bus_will, commute_category...)
vw_special_needs_students (special_needs_type, transport_mode, bus_eligible...)

-- Operational Hotspots
vw_transport_demand_hotspots (total_students, bus_eligible, special_needs_count, area_km2...)
vw_demand_capacity_gap (total_demand, total_capacity, capacity_gap...)
```

#### 2. 🧱 CORE DATASETS (Raw Data)
*Use these for drilling down into specific details.*

```sql
-- Students (Synthetic Population)
CREATE TABLE students (
    id Int64, first_name String, last_name String, gender String, age Int64, grade String,
    school_id String, school_name String, 
    dist_m Float64, -- Distance to school in meters
    trans_mode String, -- 'school_bus', 'private_car', 'walking'
    bus_elig Int64, -- 1 = Eligible, 0 = Not
    disability_status String, -- For special needs analysis
    income_brkt String, -- 'Low', 'Medium', 'High'
    region_en String, region_ar String, county_en String
    -- ... includes lat/lon and building_id
);

-- Schools
CREATE TABLE schools (
    id String, school_cod String, school_nam String, 
    education_ String, -- 'Primary', 'Secondary', etc.
    gender String, -- 'Boys', 'Girls', 'Mixed'
    region String, governorat String,
    lat Float64, lon Float64
);

-- Routes & Buses
CREATE TABLE school_routes (
    route_id String, school_id String, shift String, 
    student_count Int32, capacity Int32, utilization Float64, 
    duration_s Int32, distance_m Int32
);
CREATE TABLE school_buses (
    bus_id String, capacity Int32, vehicle_type String, 
    morning_route_id String, evening_route_id String
);
```

#### 3. 📂 SUPPORT DATA (Reports & Imports)
*Use for historical comparisons, complaints, and financial reports.*

```sql
-- Complaints
support_data_complaints (region, year, total_complaints, main_issues)
support_data_complaints_details (year, month, complaint_type columns...)
support_data_rafed_complains (detailed Rafed app complaints)

-- Demographics & Cost
support_data_report10_cost_per_student_structure (cost drivers, subsidies)
support_data_income_survey_2023_regional_indicators (income stats)
support_data_saudi_population_* (various population census tables)

-- Operational Imports (Nourah Data)
support_data_rafed_general_ed_beneficiaries (contract_number, students_rugged_areas...)
special_education_trips (contractor, disability_type, transported_kinetic...)
```

---

## 🔧 DATA TRANSFORMATION WITH JAVASCRIPT

**Query Structure:**
```json
{
  "id": "component_id",
  "type": "chart|table|stat-card",
  "query": {
    "sql": "SELECT region_name_en, sum(student_count) as count FROM default.vw_division_all_statistics GROUP BY region_name_en",
    "jsCode": "function transform(data) { ... }"
  }
}
```

### Transformation Rules:
1.  **Input:** `data` is an array of objects (rows).
2.  **Output:** Must match the Component Type schema below.
3.  **Handling Big Numbers:** ClickHouse `Int64` may come as strings in JS. Ensure you parse them if doing math (`parseInt(row.val)`).

### Component Schemas:

#### 1. 📈 Chart (ECharts)
```javascript
// Function returns ECharts Option Object
function transform(data) {
  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.map(r => r.region_name_en) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: data.map(r => r.count) }]
  };
}
```

#### 2. 🔢 Stat Card (KPI)
```javascript
// Function returns single object
function transform(data) {
  const row = data[0] || { total: 0 };
  return {
    value: row.total.toLocaleString(),
    label: 'Total Students',
    icon: 'lucide:users', // Use lucide icon names
    trend: { value: 5, direction: 'up' } // Optional
  };
}
```

#### 3. 📋 Table
```javascript
// Function returns columns/rows object
function transform(data) {
  return {
    columns: [
      { key: 'region_name_en', label: 'Region', width: '200px' },
      { key: 'count', label: 'Students', align: 'right' }
    ],
    rows: data
  };
}
```

---

## ✅ BEST PRACTICES FOR RAFED DATA

1.  **Prefer Views:** If asked for "Region Summary", use `vw_region_transport_summary` instead of joining `students` + `schools` + `regions`.
2.  **Handle Nulls:** ClickHouse views may have nulls for calculated fields. Use `coalesce` in SQL or handle in JS (`row.val || 0`).
3.  **Arabic Support:** Many tables have `_ar` and `_en` suffixes (e.g., `region_en`, `region_ar`). Use English for IDs/Logic, but feel free to use Arabic for display labels if requested.
4.  **Geography:** `lat`/`lon` columns exist in almost all spatial tables. Use them for maps.
5.  **Performance:** If querying `students` (millions of rows), always filter by `region_en` or use `LIMIT` if not aggregating.

## 📝 TOOL RESPONSE FORMAT
When you generate a component, return JSON:
```json
{
  "success": true,
  "data": {
    "component": { ... },
    "fetch": { "queryResponse": [...], "finalData": ... }
  }
}
```

Start by analyzing the user's request, picking the best View/Table from the specific list above, and writing the SQL/JS pair.









# Rafed Hackathon - Dataset Documentation

This document provides a comprehensive overview of the datasets available in the Postgres (`gis_db`) and ClickHouse databases. These datasets are intended to support the **Rafed Hackathon** project, which focuses on **synthetic student population generation**, **school transport planning**, **accessibility analysis**, and **route optimization** across the Kingdom of Saudi Arabia (KSA).

## 1. Core Datasets

### 1.1 Students (`public.students`)
**Description:**
Contains the synthetic student population. Each record represents a student with generated attributes (demographics, disability status, socio-economic status) and is assigned to a specific residential building and a school.
**Intention:**
To model student demand for school transport, analyze accessibility (distance to school), and simulate transport scenarios.
**Key Columns:**
- `id`: Unique student identifier.
- `first_name`, `last_name`: Synthetic names.
- `gender`, `age`, `grade`: Demographic info.
- `disability_status`, `health_status`: For special needs transport planning.
- `school_id`: ID of the assigned school.
- `dist_m`: Distance to assigned school (meters).
- `trans_mode`: Mode of transport (e.g., 'school_bus', 'private_car').
- `bus_elig`: Boolean indicating eligibility for school bus.
- `income_brkt`: Estimated household income bracket.
- `geom`: Point geometry of the student's residence.

### 1.2 Schools (`public.schools`)
**Description:**
Contains locations and attributes of schools in KSA.
**Intention:**
To serve as destinations for student trips and centers for catchment area analysis.
**Key Columns:**
- `school_cod`: Unique school code (Ministry of Education).
- `school_nam`: School name (Arabic).
- `education_`: Education level (e.g., Primary, Secondary).
- `gender`: School gender (Boys, Girls, Mixed).
- `school_cat`: Category (e.g., General Education, Quranic).
- `latitude`, `longitude`: Coordinates.

### 1.3 School Routes (`public.school_routes`)
**Description:**
Generated bus routes connecting students to their assigned schools.
**Intention:**
To analyze current route efficiency, utilization, and travel times.
**Key Columns:**
- `route_id`: Unique route identifier.
- `school_id`: Destination school.
- `shift`: Morning or Evening shift.
- `student_count`: Number of students on the route.
- `capacity`: Bus capacity.
- `utilization`: Percentage of capacity used.
- `duration_s`: Total duration in seconds.
- `distance_m`: Total distance in meters.
- `geometry`: LineString geometry of the route.

### 1.4 School Buses (`public.school_buses`)
**Description:**
Details of the vehicles assigned to routes.
**Intention:**
To track fleet assets and link vehicles to routes.
**Key Columns:**
- `bus_id`: Unique bus identifier.
- `capacity`: Passenger capacity.
- `vehicle_type`: Type of vehicle (e.g., 'small').
- `morning_route_id`, `evening_route_id`: Linked routes.

## 2. Imported Operational Data (Excel Imports)

### 2.1 Special Education Trips (`public.special_education_trips`)
**Description:**
Real-world aggregated data imported from "Nourah Data" Excel sheets regarding special education transport.
**Intention:**
To provide historical or actual operational benchmarks for special needs transport, including contractor performance and beneficiary counts by disability type.
**Key Columns:**
- `region`: Educational administration region.
- `contractor`: Name of the transport provider.
- `contract_number`: Contract reference.
- `disability_type`: Type of disability (e.g., 'حركي' - Kinetic).
- `transported_kinetic`: Count of kinetic disability students transported.
- `transported_non_kinetic`: Count of non-kinetic disability students transported.
- `total_transported`: Total beneficiaries.

### 2.2 General Education Trips (`public.general_education_trips`)
**Description:**
Real-world aggregated data imported from "Nourah Data" Excel sheets regarding general education transport.
**Intention:**
To provide benchmarks for general student transport, focusing on difficult terrains (rugged, remote) and school consolidation.
**Key Columns:**
- `region`: Educational administration region.
- `contractor`: Transport provider.
- `public_schools_count`: Number of public schools served.
- `rugged_areas_count`: Number of students in rugged areas.
- `remote_areas_count`: Number of students in remote areas.
- `merged_schools_count`: Number of merged (consolidated) schools.
- `total_transported`: Total beneficiaries.

## 3. Support Data Schema (`support_data`)

This schema contains auxiliary datasets, often from external surveys or reports, used to enrich the core analysis.

### 3.1 Complaints Data
- **`support_data.complaints`**: Aggregated complaints by region and year.
    - *Columns:* `region`, `year`, `total_complaints`, `main_issues` (e.g., "Delay", "AC failure").
- **`support_data.complaints_details`**: Monthly breakdown of complaints by type (delay, safety, hygiene).
    - *Columns:* `year`, `month`, `month_arabic`, specific complaint type counts.
- **`support_data.rafed_complains`**: Detailed complaints from the Rafed app, including "Not covered despite registration".

### 3.2 Rafed Beneficiaries & Performance
- **`support_data.rafed_general_ed_beneficiaries`** & **`accommodated`**: Detailed lists of students served, including those in rugged/remote areas or annexed schools.
- **`support_data.rafed_special_ed_accommodated_kinetic`**: Specific focus on students with kinetic disabilities served by contracts.

### 3.3 Socio-Economic Indicators
- **`support_data.income_survey_2023_regional_indicators`**: Household income stats by region (Saudi vs. Non-Saudi).
- **`support_data.income_survey_2023_regional_expenditure_details`**: Average monthly household expenditure by category (e.g., Transport, Food).

## 4. Geographic Context & Infrastructure

### 4.1 Administrative Divisions
**Tables:** `public.division_area_polygon`, `public.division_boundary_linestring`, `public.division_point`
**Description:**
Hierarchical administrative boundaries for KSA (Regions, Governorates, Cities, Neighborhoods).
**Intention:**
To aggregate data (students, schools, complaints) by administrative levels for reporting and dashboards.
**Views:**
- `vw_division_regions`: Region polygons.
- `vw_division_counties`: Governorate (County) polygons.
- `vw_division_neighborhoods`: Neighborhood polygons with centroids.

### 4.2 Buildings (`public.buildings`)
**Description:**
Building footprints with attributes like height and type.
**Intention:**
Used as the base layer for generating synthetic student home locations ("one student per building" assumption).

### 4.3 Infrastructure & Land Use
**Tables:** `public.infrastructure_*`, `public.land_*`, `public.land_use_*`
**Description:**
OpenStreetMap (OSM) derived layers for context, including roads (`segment_linestring`), amenities (`place_point`), and land cover.
**Intention:**
To provide visual context on maps and support routing engines (ORS/Valhalla).

## 5. Analytical Views (Postgres & ClickHouse)

These views are pre-calculated for dashboards (e.g., Deck.gl, Kepler.gl, Superset) to answer specific business questions.

### 5.1 Regional Summaries
- **`vw_region_transport_summary`**: Aggregates student counts, school counts, and bus eligibility by region.
- **`vw_region_commute_distance`**: Average commute distances (Urban vs Rural) and "Transport Demand Index".
- **`vw_region_household_demographics`**: % of households with 0 or 1 car, working mothers, and "Transport Dependency Index".
- **`vw_region_transport_costs`**: Cost analysis including subsidy per student, family payment, and cost drivers (fuel, driver salaries).
- **`vw_region_unmet_demand`**: Counts of students not covered, on waiting lists, or relying on walking/family transport.

### 5.2 School Analysis
- **`vw_schools_with_statistics`**: Schools enriched with student counts, bus demand, and utilization metrics.
- **`vw_school_demand_capacity_gap`**: Identifies schools where transport demand exceeds capacity.
- **`vw_school_isochrones_combined`**: 1km, 3km, and 5km accessibility zones around schools.
- **`vw_school_accessibility_zones`**: Detailed breakdown of which schools are within which distance band.

### 5.3 Route Analysis
- **`vw_bus_routes_statistics`**: Routes with utilization categories (e.g., 'overcapacity', 'well_utilized').
- **`vw_route_utilization_analysis`**: Regional aggregates of route efficiency.

### 5.4 Student Analysis
- **`vw_student_income_distribution`**: Students categorized by household income brackets.
- **`vw_student_transport_mode`**: Breakdown of how students travel to school (Bus, Car, Walk).
- **`vw_student_distance_analysis`**: Counts of students within specific distance bands (1km, 3km, 5km) from their school.
- **`vw_special_needs_students`**: Locations and transport needs of students with disabilities.
- **`vw_unassigned_students_heatmap`**: Locations of students who could not be assigned a seat on a bus.

### 5.5 Performance & Complaints
- **`vw_region_rafed_performance`**: KPI view showing coverage % and waiting lists by region.
- **`vw_region_complaints_analysis`**: Monthly complaint trends by type and region.
- **`vw_region_complaints_summary`**: High-level summary of total complaints and top issues.

## 6. ClickHouse Analytics
The ClickHouse database (`default` schema) mirrors the key analytical tables from Postgres for high-performance OLAP queries. It is optimized for aggregating large volumes of trip and telemetry data.

**Key Tables in ClickHouse:**
- `special_education_trips` (MergeTree engine)
- `general_education_trips` (MergeTree engine)
- Mirrors of `students`, `schools`, `school_routes` (often synced for performance).

---
*Generated by Agent Mode for Rafed Hackathon.*




CREATE DATABASE default\nENGINE = Atomic
CREATE TABLE default.bathymetry_polygon\n(\n    `fid` Nullable(Int32),\n    `depth` Nullable(Int32),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `crtgrph` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.buildings\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `has_parts` Nullable(UInt8),\n    `version` Nullable(Int32),\n    `names_pri` Nullable(String),\n    `height` Nullable(String),\n    `is_und` Nullable(UInt8),\n    `nflrs` Nullable(Int32),\n    `facade_clr` Nullable(String),\n    `roof_shp` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.buildings_local\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `has_parts` Nullable(UInt8),\n    `version` Nullable(Int32),\n    `names_pri` Nullable(String),\n    `height` Nullable(String),\n    `is_und` Nullable(UInt8),\n    `nflrs` Nullable(Int32),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.buildings_view\n(\n    `fid` Nullable(Int32),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `render_height` Nullable(Float64),\n    `render_min_height` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.division_area_polygon\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `is_land` Nullable(UInt8),\n    `is_ter` Nullable(UInt8),\n    `version` Nullable(Int32),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.division_boundary_linestring\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `is_land` Nullable(UInt8),\n    `is_ter` Nullable(UInt8),\n    `is_disp` Nullable(UInt8),\n    `version` Nullable(Int32),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.division_point\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `hier` Nullable(String),\n    `norms` Nullable(String),\n    `population` Nullable(Int32),\n    `cdiv_ids` Nullable(String),\n    `cofdiv` Nullable(String),\n    `wikidata` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `crtgrph` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.infrastructure_linestring\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `height` Nullable(String),\n    `surface` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `src_tags` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.infrastructure_point\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `height` Nullable(String),\n    `surface` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `src_tags` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.infrastructure_polygon\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `height` Nullable(String),\n    `surface` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `src_tags` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.land_cover_polygon\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `crtgrph` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.land_linestring\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `elevation` Nullable(Int32),\n    `surface` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `src_tags` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.land_point\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `elevation` Nullable(Int32),\n    `surface` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `src_tags` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.land_polygon\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `elevation` Nullable(Int32),\n    `surface` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `src_tags` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.land_use_linestring\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `elevation` Nullable(Int32),\n    `surface` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `src_tags` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.land_use_polygon\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `elevation` Nullable(Int32),\n    `surface` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `src_tags` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.order_boundary\n(\n    `id` Nullable(Int32),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.place_point\n(\n    `fid` Nullable(Int32),\n    `categories` Nullable(String),\n    `confidence` Nullable(String),\n    `websites` Nullable(String),\n    `socials` Nullable(String),\n    `emails` Nullable(String),\n    `phones` Nullable(String),\n    `brand` Nullable(String),\n    `addresses` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.school_buses\n(\n    `bus_id` Nullable(String),\n    `school_id` Nullable(String),\n    `group_id` Nullable(String),\n    `capacity` Nullable(Int32),\n    `vehicle_type` Nullable(String),\n    `morning_route_id` Nullable(String),\n    `evening_route_id` Nullable(String),\n    `total_duration_s` Nullable(Int32),\n    `total_distance_m` Nullable(Int32),\n    `created_at` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.school_iso_1km_view\n(\n    `fid` Nullable(Int32),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.school_iso_3km_view\n(\n    `fid` Nullable(Int32),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.school_iso_5km_view\n(\n    `fid` Nullable(Int32),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.school_ors_isochrones_1km\n(\n    `fid` Nullable(Int32),\n    `school_id` Nullable(String),\n    `school_name` Nullable(String),\n    `school_code` Nullable(String),\n    `region` Nullable(String),\n    `governorat` Nullable(String),\n    `distance` Nullable(String),\n    `distance_m` Nullable(Int64),\n    `longitude` Nullable(Float64),\n    `latitude` Nullable(Float64),\n    `method` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.school_ors_isochrones_3km\n(\n    `fid` Nullable(Int32),\n    `school_id` Nullable(String),\n    `school_name` Nullable(String),\n    `school_code` Nullable(String),\n    `region` Nullable(String),\n    `governorat` Nullable(String),\n    `distance` Nullable(String),\n    `distance_m` Nullable(Int64),\n    `longitude` Nullable(Float64),\n    `latitude` Nullable(Float64),\n    `method` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.school_ors_isochrones_5km\n(\n    `fid` Nullable(Int32),\n    `school_id` Nullable(String),\n    `school_name` Nullable(String),\n    `school_code` Nullable(String),\n    `region` Nullable(String),\n    `governorat` Nullable(String),\n    `distance` Nullable(String),\n    `distance_m` Nullable(Int64),\n    `longitude` Nullable(Float64),\n    `latitude` Nullable(Float64),\n    `method` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.school_routes\n(\n    `route_id` Nullable(String),\n    `school_id` Nullable(String),\n    `shift` Nullable(String),\n    `vehicle_id` Nullable(Int32),\n    `student_ids` Nullable(String),\n    `student_count` Nullable(Int32),\n    `capacity` Nullable(Int32),\n    `utilization` Nullable(Float64),\n    `vehicle_type` Nullable(String),\n    `duration_s` Nullable(Int32),\n    `distance_m` Nullable(Int32),\n    `geometry` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `created_at` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.schools\n(\n    `fid` Nullable(Int32),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `latitude` Nullable(Float64),\n    `longitude` Nullable(Float64),\n    `address` Nullable(String),\n    `authority_` Nullable(String),\n    `education_` Nullable(String),\n    `educatio_1` Nullable(String),\n    `educatio_2` Nullable(String),\n    `gender` Nullable(String),\n    `global_id` Nullable(String),\n    `governorat` Nullable(String),\n    `region` Nullable(String),\n    `school_cat` Nullable(String),\n    `school_cod` Nullable(String),\n    `school_nam` Nullable(String),\n    `school_shi` Nullable(String),\n    `supervisin` Nullable(String),\n    `id` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.segment_linestring\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `connectors` Nullable(String),\n    `routes` Nullable(String),\n    `subc_rule` Nullable(String),\n    `arest` Nullable(String),\n    `lvl_rule` Nullable(String),\n    `version` Nullable(Int32),\n    `sources` Nullable(String),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `names_rule` Nullable(String),\n    `class` Nullable(String),\n    `dstntns` Nullable(String),\n    `ptrans` Nullable(String),\n    `road_surf` Nullable(String),\n    `road_flags` Nullable(String),\n    `speed_lim` Nullable(String),\n    `wdth_rule` Nullable(String),\n    `subclass` Nullable(String),\n    `rail_flags` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.students\n(\n    `fid` Nullable(Int32),\n    `id` Nullable(Int64),\n    `first_name` Nullable(String),\n    `last_name` Nullable(String),\n    `email` Nullable(String),\n    `gender` Nullable(String),\n    `age` Nullable(Int64),\n    `grade` Nullable(String),\n    `gpa` Nullable(Float64),\n    `enroll_dt` Nullable(String),\n    `is_active` Nullable(Int64),\n    `building_id` Nullable(String),\n    `address` Nullable(String),\n    `family_id` Nullable(String),\n    `sibling` Nullable(String),\n    `national_id` Nullable(String),\n    `school_id` Nullable(String),\n    `school_name` Nullable(String),\n    `school_grds` Nullable(String),\n    `school_gndr` Nullable(String),\n    `school_lon` Nullable(Float64),\n    `school_lat` Nullable(Float64),\n    `dist_m` Nullable(Float64),\n    `region_en` Nullable(String),\n    `region_ar` Nullable(String),\n    `county_en` Nullable(String),\n    `county_ar` Nullable(String),\n    `locality_en` Nullable(String),\n    `locality_ar` Nullable(String),\n    `neighbor_en` Nullable(String),\n    `neighbor_ar` Nullable(String),\n    `income_brkt` Nullable(String),\n    `income_sar` Nullable(Int64),\n    `ses_status` Nullable(String),\n    `vehicles` Nullable(Int64),\n    `fin_aid` Nullable(Int64),\n    `subsidy` Nullable(Int64),\n    `hh_size` Nullable(Int64),\n    `employed` Nullable(Int64),\n    `trans_mode` Nullable(String),\n    `bus_elig` Nullable(Int64),\n    `bus_will` Nullable(Float64),\n    `pickup_pref` Nullable(String),\n    `spec_needs` Nullable(String),\n    `guard_phone` Nullable(String),\n    `guard_drop` Nullable(Int64),\n    `route_m` Nullable(Float64),\n    `route_dur_s` Nullable(Float64),\n    `route_geom` Nullable(String),\n    `terrain_elev` Nullable(Float64),\n    `comp_reg_en` Nullable(String),\n    `comp_reg_ar` Nullable(String),\n    `comp_reg_xl` Nullable(String),\n    `c_avg_hh_is` Nullable(Float64),\n    `c_avg_hh_in` Nullable(Float64),\n    `c_avg_hh_it` Nullable(Float64),\n    `c_med_hh_is` Nullable(Float64),\n    `c_med_hh_in` Nullable(Float64),\n    `c_med_hh_it` Nullable(Float64),\n    `c_avg_pc_is` Nullable(Float64),\n    `c_avg_pc_in` Nullable(Float64),\n    `c_avg_pc_it` Nullable(Float64),\n    `c_med_pc_is` Nullable(Float64),\n    `c_med_pc_in` Nullable(Float64),\n    `c_med_pc_it` Nullable(Float64),\n    `c_avg_hh_es` Nullable(Float64),\n    `c_avg_hh_en` Nullable(Float64),\n    `c_avg_hh_et` Nullable(Float64),\n    `c_med_hh_es` Nullable(Float64),\n    `c_med_hh_en` Nullable(Float64),\n    `c_med_hh_et` Nullable(Float64),\n    `c_avg_pc_es` Nullable(Float64),\n    `c_avg_pc_en` Nullable(Float64),\n    `c_avg_pc_et` Nullable(Float64),\n    `c_med_pc_es` Nullable(Float64),\n    `c_med_pc_en` Nullable(Float64),\n    `c_med_pc_et` Nullable(Float64),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_complaints\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_arabic` Nullable(String),\n    `2022` Nullable(Int32),\n    `2023` Nullable(Int32),\n    `2024` Nullable(Int32),\n    `2025_until_nov` Nullable(Int32),\n    `total_complaints` Nullable(Int32),\n    `percentage` Nullable(String),\n    `avg_monthly` Nullable(Float64),\n    `main_issues` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_complaints_details\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `month` Nullable(String),\n    `month_arabic` Nullable(String),\n    `تأخير الحافلات` Nullable(Int32),\n    `أعطال وتكييف` Nullable(Int32),\n    `حوادث أو شبه حوادث` Nullable(Int32),\n    `سلوك السائق أو المرافقة` Nullable(Int32),\n    `نظافة أو حالة الحافلة` Nullable(Int32),\n    `أخرى` Nullable(Int32),\n    `total_monthly` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_income_survey_2023_regional_expenditure_details\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `expenditure_group` Nullable(String),\n    `average_monthly_expenditure` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_income_survey_2023_regional_indicators\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `indicator_type` Nullable(String),\n    `unit` Nullable(String),\n    `saudi_value` Nullable(Float64),\n    `non_saudi_value` Nullable(Float64),\n    `total_value` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_rafed_complains\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(String),\n    `month` Nullable(String),\n    `region_arabic` Nullable(String),\n    `region_english` Nullable(String),\n    `تأخير_الحافلة` Nullable(Int32),\n    `عدم_شمول_رغم_التسجيل` Nullable(Int32),\n    `استرداد_رسوم_إلغاء` Nullable(Int32),\n    `أعطال_تكييف_نظافة` Nullable(Int32),\n    `سلوك_سائق_مرافقة` Nullable(Int32),\n    `حوادث_سلامة` Nullable(Int32),\n    `أخرى_مسارات_تغطية` Nullable(Int32),\n    `total_monthly_region` Nullable(String),\n    `perc_national` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_rafed_general_ed_accommodated\n(\n    `ogc_fid` Nullable(Int32),\n    `contract_number` Nullable(String),\n    `total_included_students` Nullable(Int32),\n    `included_students_normal` Nullable(Int32),\n    `annexed_students` Nullable(Int32),\n    `students_rugged_areas` Nullable(Int32),\n    `students_remote_areas` Nullable(Int32),\n    `is_school_in_complex` Nullable(String),\n    `complex_code` Nullable(String),\n    `school_district` Nullable(String),\n    `city_village` Nullable(String),\n    `school_longitude` Nullable(String),\n    `school_latitude` Nullable(String),\n    `school_phone` Nullable(String),\n    `number_of_students` Nullable(String),\n    `education_type` Nullable(String),\n    `educational_level` Nullable(String),\n    `school_name` Nullable(String),\n    `school_id` Nullable(Int32),\n    `office` Nullable(String),\n    `edu_admin_old` Nullable(String),\n    `edu_admin_new` Nullable(String),\n    `office_ttc_code` Nullable(String),\n    `zone_ttc_code` Nullable(String),\n    `region_ttc_code` Nullable(String),\n    `x_coord` Nullable(String),\n    `y_coord` Nullable(String),\n    `region_arabic` Nullable(String),\n    `region_english` Nullable(String),\n    `school_gender` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_rafed_general_ed_beneficiaries\n(\n    `ogc_fid` Nullable(Int32),\n    `contract_number` Nullable(String),\n    `total_included_students` Nullable(Int32),\n    `included_students_normal` Nullable(Int32),\n    `annexed_students` Nullable(Int32),\n    `students_rugged_areas` Nullable(Int32),\n    `students_remote_areas` Nullable(Int32),\n    `is_school_in_complex` Nullable(String),\n    `complex_code` Nullable(String),\n    `school_district` Nullable(String),\n    `city_village` Nullable(String),\n    `school_longitude` Nullable(String),\n    `school_latitude` Nullable(String),\n    `school_phone` Nullable(String),\n    `number_of_students` Nullable(String),\n    `education_type` Nullable(String),\n    `educational_level` Nullable(String),\n    `school_name` Nullable(String),\n    `school_id` Nullable(Int32),\n    `office` Nullable(String),\n    `edu_admin_old` Nullable(String),\n    `edu_admin_new` Nullable(String),\n    `office_ttc_code` Nullable(String),\n    `zone_ttc_code` Nullable(String),\n    `region_ttc_code` Nullable(String),\n    `x_coord` Nullable(String),\n    `y_coord` Nullable(String),\n    `region_arabic` Nullable(String),\n    `region_english` Nullable(String),\n    `school_gender` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_rafed_special_ed_accommodated\n(\n    `ogc_fid` Nullable(Int32),\n    `field1` Nullable(String),\n    `field2` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_rafed_special_ed_accommodated_kinetic\n(\n    `ogc_fid` Nullable(Int32),\n    `contract_number` Nullable(String),\n    `عدد الطلاب  المشمولين` Nullable(Int32),\n    `school_district` Nullable(String),\n    `city_village` Nullable(String),\n    `school_longitude` Nullable(String),\n    `school_latitude` Nullable(String),\n    `school_phone` Nullable(String),\n    `number_of_students` Nullable(String),\n    `education_type` Nullable(String),\n    `educational_level` Nullable(String),\n    `school_name` Nullable(String),\n    `school_id` Nullable(Int32),\n    `office` Nullable(String),\n    `إدارة التعليم بالمسمى القديم` Nullable(String),\n    `edu_admin_new` Nullable(String),\n    `officemoecode` Nullable(String),\n    `office_ttc_code` Nullable(String),\n    `zone_ttc_code` Nullable(String),\n    `region_ttc_code` Nullable(String),\n    `region_arabic` Nullable(String),\n    `الجنس` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_rafed_special_ed_accommodated_non_kinetic\n(\n    `ogc_fid` Nullable(Int32),\n    `contract_number` Nullable(String),\n    `عدد الطلاب  المشمولين` Nullable(Int32),\n    `school_district` Nullable(String),\n    `city_village` Nullable(String),\n    `school_longitude` Nullable(String),\n    `school_latitude` Nullable(String),\n    `school_phone` Nullable(String),\n    `number_of_students` Nullable(String),\n    `education_type` Nullable(String),\n    `educational_level` Nullable(String),\n    `school_name` Nullable(String),\n    `school_id` Nullable(Int32),\n    `office` Nullable(String),\n    `إدارة التعليم بالمسمى القديم` Nullable(String),\n    `edu_admin_new` Nullable(String),\n    `officemoecode` Nullable(String),\n    `office_ttc_code` Nullable(String),\n    `zone_ttc_code` Nullable(String),\n    `region_ttc_code` Nullable(String),\n    `region_arabic` Nullable(String),\n    `الجنس` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_rafed_special_ed_beneficiaries_kinetic\n(\n    `ogc_fid` Nullable(Int32),\n    `contract_number` Nullable(String),\n    `عدد الطلاب  المشمولين` Nullable(Int32),\n    `school_district` Nullable(String),\n    `city_village` Nullable(String),\n    `school_longitude` Nullable(String),\n    `school_latitude` Nullable(String),\n    `school_phone` Nullable(String),\n    `number_of_students` Nullable(String),\n    `education_type` Nullable(String),\n    `educational_level` Nullable(String),\n    `school_name` Nullable(String),\n    `school_id` Nullable(Int32),\n    `office` Nullable(String),\n    `إدارة التعليم بالمسمى القديم` Nullable(String),\n    `edu_admin_new` Nullable(String),\n    `officemoecode` Nullable(String),\n    `office_ttc_code` Nullable(String),\n    `zone_ttc_code` Nullable(String),\n    `region_ttc_code` Nullable(String),\n    `region_arabic` Nullable(String),\n    `الجنس` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_rafed_special_ed_beneficiaries_non_kinetic\n(\n    `ogc_fid` Nullable(Int32),\n    `contract_number` Nullable(String),\n    `عدد الطلاب  المشمولين` Nullable(Int32),\n    `school_district` Nullable(String),\n    `city_village` Nullable(String),\n    `school_longitude` Nullable(String),\n    `school_latitude` Nullable(String),\n    `school_phone` Nullable(String),\n    `number_of_students` Nullable(String),\n    `education_type` Nullable(String),\n    `educational_level` Nullable(String),\n    `school_name` Nullable(String),\n    `school_id` Nullable(Int32),\n    `office` Nullable(String),\n    `إدارة التعليم بالمسمى القديم` Nullable(String),\n    `edu_admin_new` Nullable(String),\n    `officemoecode` Nullable(String),\n    `office_ttc_code` Nullable(String),\n    `zone_ttc_code` Nullable(String),\n    `region_ttc_code` Nullable(String),\n    `region_arabic` Nullable(String),\n    `الجنس` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_region_uuid_mapping\n(\n    `ogc_fid` Nullable(Int32),\n    `name_en` Nullable(String),\n    `name_ar` Nullable(String),\n    `uuid` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report10_cost_per_student_structure\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_uuid` Nullable(String),\n    `base_cost_per_student_sar` Nullable(Int32),\n    `vehicle_operations_percent` Nullable(Float64),\n    `driver_salaries_percent` Nullable(Float64),\n    `fuel_percent` Nullable(Float64),\n    `maintenance_percent` Nullable(Float64),\n    `insurance_admin_percent` Nullable(Float64),\n    `premium_service_cost_sar` Nullable(Int32),\n    `subsidy_per_student_sar` Nullable(Int32),\n    `family_payment_sar` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report11a_parent_satisfaction_survey\n(\n    `ogc_fid` Nullable(Int32),\n    `service_aspect` Nullable(String),\n    `very_satisfied_percent` Nullable(Float64),\n    `satisfied_percent` Nullable(Float64),\n    `neutral_percent` Nullable(Float64),\n    `dissatisfied_percent` Nullable(Float64),\n    `very_dissatisfied_percent` Nullable(Float64),\n    `average_rating_out_of_5` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report11b_willingness_to_pay\n(\n    `ogc_fid` Nullable(Int32),\n    `price_segment` Nullable(String),\n    `percent_of_families_willing` Nullable(Float64),\n    `key_features_expected` Nullable(String),\n    `geographic_concentration` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report12_private_international_schools_growth\n(\n    `ogc_fid` Nullable(Int32),\n    `academic_year` Nullable(String),\n    `private_schools_total` Nullable(Int32),\n    `international_schools_total` Nullable(Int32),\n    `private_schools_students` Nullable(Int32),\n    `international_schools_students` Nullable(Int32),\n    `yoy_growth_private_percent` Nullable(Float64),\n    `yoy_growth_international_percent` Nullable(Float64),\n    `percent_using_private_transport` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report1_education_statistics_students_schools_by_region\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_uuid` Nullable(String),\n    `education_stage` Nullable(String),\n    `gender` Nullable(String),\n    `number_of_students` Nullable(Int32),\n    `number_of_schools` Nullable(Int32),\n    `academic_year` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report2_rafed_performance_beneficiaries_waiting_list\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_uuid` Nullable(String),\n    `students_covered_by_rafed` Nullable(Int32),\n    `students_on_waiting_list` Nullable(Int32),\n    `total_eligible_students` Nullable(Int32),\n    `coverage_percentage` Nullable(Float64),\n    `academic_year` Nullable(String),\n    `report_date` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report3_student_growth_forecast_to_2030\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `total_students_forecast` Nullable(Int32),\n    `primary_students` Nullable(Int32),\n    `intermediate_students` Nullable(Int32),\n    `secondary_students` Nullable(Int32),\n    `annual_growth_rate_percent` Nullable(Float64),\n    `transport_eligible_students` Nullable(Int32),\n    `source` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report4_uncovered_waiting_list_students\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_uuid` Nullable(String),\n    `total_students_not_covered` Nullable(Int32),\n    `on_official_waiting_list` Nullable(Int32),\n    `using_private_transport` Nullable(Int32),\n    `walking_or_family_transport` Nullable(Int32),\n    `priority_high` Nullable(Int32),\n    `priority_medium` Nullable(Int32),\n    `priority_low` Nullable(Int32),\n    `academic_year` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report5_schools_geographic_distribution_density\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_uuid` Nullable(String),\n    `district` Nullable(String),\n    `number_of_schools` Nullable(Int32),\n    `total_students` Nullable(Int32),\n    `area_km2` Nullable(Int32),\n    `student_density_per_km2` Nullable(Float64),\n    `urban_rural` Nullable(String),\n    `average_distance_to_school_km` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report6_average_home_to_school_distance\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_uuid` Nullable(String),\n    `average_distance_km` Nullable(Float64),\n    `urban_areas_average_km` Nullable(Float64),\n    `rural_areas_average_km` Nullable(Float64),\n    `percent_students_over_5km` Nullable(Float64),\n    `percent_students_over_10km` Nullable(Float64),\n    `transport_demand_index` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report7_household_car_ownership_working_mothers\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_uuid` Nullable(String),\n    `total_households_with_school_age_children` Nullable(Int32),\n    `households_with_0_cars_percent` Nullable(Float64),\n    `households_with_1_car_percent` Nullable(Float64),\n    `working_mothers_percent` Nullable(Float64),\n    `single_parent_households_percent` Nullable(Float64),\n    `transport_dependency_index` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report8_official_complaints_937_rafed\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_uuid` Nullable(String),\n    `complaint_category` Nullable(String),\n    `number_of_complaints_937` Nullable(Int32),\n    `number_of_complaints_rafed_app` Nullable(Int32),\n    `total_complaints` Nullable(Int32),\n    `resolved_within_48hrs_percent` Nullable(Float64),\n    `academic_year` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_report9_private_informal_transport_market\n(\n    `ogc_fid` Nullable(Int32),\n    `region` Nullable(String),\n    `region_uuid` Nullable(String),\n    `private_company_transport_students` Nullable(Int32),\n    `uber_careem_students` Nullable(Int32),\n    `informal_individual_drivers` Nullable(Int32),\n    `total_private_market_students` Nullable(Int32),\n    `market_share_of_private_percent` Nullable(Float64),\n    `estimated_market_value_sar_million` Nullable(Float64),\n    `growth_rate_yoy_percent` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_demographics_complete_1960_2023\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `population` Nullable(Int32),\n    `urban_population` Nullable(Int32),\n    `rural_population` Nullable(Int32),\n    `growth_rate` Nullable(Float64),\n    `fertility_rate` Nullable(Float64),\n    `life_expectancy` Nullable(Float64),\n    `population_0_14_pct` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_fertility_rate_1960_2023\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `fertility_rate` Nullable(Float64),\n    `country` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_life_expectancy_1960_2023\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `life_expectancy` Nullable(Float64),\n    `country` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_population_complete_historical_1960_2023\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `population` Nullable(Int32),\n    `urban_population` Nullable(Int32),\n    `rural_population` Nullable(Int32),\n    `growth_rate` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_population_detailed_metadata_2022\n(\n    `ogc_fid` Nullable(Int32),\n    `item` Nullable(String),\n    `metadata` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_population_detailed_methodological_documentation_2022\n(\n    `ogc_fid` Nullable(Int32),\n    `item` Nullable(String),\n    `methodological_documentation` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_population_detailed_sau_admpop_adm0_2022_2022\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `iso3` Nullable(String),\n    `adm0_en` Nullable(String),\n    `adm0_pcode` Nullable(String),\n    `adm1_en` Nullable(String),\n    `adm1_pcode` Nullable(String),\n    `f_tl` Nullable(Int32),\n    `m_tl` Nullable(Int32),\n    `t_tl` Nullable(Int32),\n    `f_00_04` Nullable(Int32),\n    `f_05_09` Nullable(Int32),\n    `f_10_14` Nullable(Int32),\n    `f_15_19` Nullable(Int32),\n    `f_20_24` Nullable(Int32),\n    `f_25_29` Nullable(Int32),\n    `f_30_34` Nullable(Int32),\n    `f_35_39` Nullable(Int32),\n    `f_40_44` Nullable(Int32),\n    `f_45_49` Nullable(Int32),\n    `f_50_54` Nullable(Int32),\n    `f_55_59` Nullable(Int32),\n    `f_60_64` Nullable(Int32),\n    `f_65_69` Nullable(Int32),\n    `f_70_74` Nullable(Int32),\n    `f_75_79` Nullable(Int32),\n    `f_80_84` Nullable(Int32),\n    `f_85_89` Nullable(Int32),\n    `f_90_94` Nullable(Int32),\n    `f_95_99` Nullable(Int32),\n    `f_100plus` Nullable(Int32),\n    `m_00_04` Nullable(Int32),\n    `m_05_09` Nullable(Int32),\n    `m_10_14` Nullable(Int32),\n    `m_15_19` Nullable(Int32),\n    `m_20_24` Nullable(Int32),\n    `m_25_29` Nullable(Int32),\n    `m_30_34` Nullable(Int32),\n    `m_35_39` Nullable(Int32),\n    `m_40_44` Nullable(Int32),\n    `m_45_49` Nullable(Int32),\n    `m_50_54` Nullable(Int32),\n    `m_55_59` Nullable(Int32),\n    `m_60_64` Nullable(Int32),\n    `m_65_69` Nullable(Int32),\n    `m_70_74` Nullable(Int32),\n    `m_75_79` Nullable(Int32),\n    `m_80_84` Nullable(Int32),\n    `m_85_89` Nullable(Int32),\n    `m_90_94` Nullable(Int32),\n    `m_95_99` Nullable(Int32),\n    `m_100plus` Nullable(Int32),\n    `t_00_04` Nullable(Int32),\n    `t_05_09` Nullable(Int32),\n    `t_10_14` Nullable(Int32),\n    `t_15_19` Nullable(Int32),\n    `t_20_24` Nullable(Int32),\n    `t_25_29` Nullable(Int32),\n    `t_30_34` Nullable(Int32),\n    `t_35_39` Nullable(Int32),\n    `t_40_44` Nullable(Int32),\n    `t_45_49` Nullable(Int32),\n    `t_50_54` Nullable(Int32),\n    `t_55_59` Nullable(Int32),\n    `t_60_64` Nullable(Int32),\n    `t_65_69` Nullable(Int32),\n    `t_70_74` Nullable(Int32),\n    `t_75_79` Nullable(Int32),\n    `t_80_84` Nullable(Int32),\n    `t_85_89` Nullable(Int32),\n    `t_90_94` Nullable(Int32),\n    `t_95_99` Nullable(Int32),\n    `t_100plus` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_population_detailed_sau_admpop_adm1_2022_2022\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `iso3` Nullable(String),\n    `adm0_en` Nullable(String),\n    `adm0_pcode` Nullable(String),\n    `adm1_en` Nullable(String),\n    `adm1_pcode` Nullable(String),\n    `f_tl` Nullable(Int32),\n    `m_tl` Nullable(Int32),\n    `t_tl` Nullable(Int32),\n    `f_00_04` Nullable(Int32),\n    `f_05_09` Nullable(Int32),\n    `f_10_14` Nullable(Int32),\n    `f_15_19` Nullable(Int32),\n    `f_20_24` Nullable(Int32),\n    `f_25_29` Nullable(Int32),\n    `f_30_34` Nullable(Int32),\n    `f_35_39` Nullable(Int32),\n    `f_40_44` Nullable(Int32),\n    `f_45_49` Nullable(Int32),\n    `f_50_54` Nullable(Int32),\n    `f_55_59` Nullable(Int32),\n    `f_60_64` Nullable(Int32),\n    `f_65_69` Nullable(Int32),\n    `f_70_74` Nullable(Int32),\n    `f_75_79` Nullable(Int32),\n    `f_80_84` Nullable(Int32),\n    `f_85_89` Nullable(Int32),\n    `f_90_94` Nullable(Int32),\n    `f_95_99` Nullable(Int32),\n    `f_100plus` Nullable(Int32),\n    `m_00_04` Nullable(Int32),\n    `m_05_09` Nullable(Int32),\n    `m_10_14` Nullable(Int32),\n    `m_15_19` Nullable(Int32),\n    `m_20_24` Nullable(Int32),\n    `m_25_29` Nullable(Int32),\n    `m_30_34` Nullable(Int32),\n    `m_35_39` Nullable(Int32),\n    `m_40_44` Nullable(Int32),\n    `m_45_49` Nullable(Int32),\n    `m_50_54` Nullable(Int32),\n    `m_55_59` Nullable(Int32),\n    `m_60_64` Nullable(Int32),\n    `m_65_69` Nullable(Int32),\n    `m_70_74` Nullable(Int32),\n    `m_75_79` Nullable(Int32),\n    `m_80_84` Nullable(Int32),\n    `m_85_89` Nullable(Int32),\n    `m_90_94` Nullable(Int32),\n    `m_95_99` Nullable(Int32),\n    `m_100plus` Nullable(Int32),\n    `t_00_04` Nullable(Int32),\n    `t_05_09` Nullable(Int32),\n    `t_10_14` Nullable(Int32),\n    `t_15_19` Nullable(Int32),\n    `t_20_24` Nullable(Int32),\n    `t_25_29` Nullable(Int32),\n    `t_30_34` Nullable(Int32),\n    `t_35_39` Nullable(Int32),\n    `t_40_44` Nullable(Int32),\n    `t_45_49` Nullable(Int32),\n    `t_50_54` Nullable(Int32),\n    `t_55_59` Nullable(Int32),\n    `t_60_64` Nullable(Int32),\n    `t_65_69` Nullable(Int32),\n    `t_70_74` Nullable(Int32),\n    `t_75_79` Nullable(Int32),\n    `t_80_84` Nullable(Int32),\n    `t_85_89` Nullable(Int32),\n    `t_90_94` Nullable(Int32),\n    `t_95_99` Nullable(Int32),\n    `t_100plus` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_population_growth_1960_2023\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `growth_rate` Nullable(Float64),\n    `country` Nullable(String),\n    `country_code` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_population_historical_1960_2023\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `population` Nullable(Int32),\n    `country` Nullable(String),\n    `country_code` Nullable(String),\n    `indicator` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_population_national_2022\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `iso3` Nullable(String),\n    `adm0_en` Nullable(String),\n    `adm0_pcode` Nullable(String),\n    `adm1_en` Nullable(String),\n    `adm1_pcode` Nullable(String),\n    `f_tl` Nullable(Int32),\n    `m_tl` Nullable(Int32),\n    `t_tl` Nullable(Int32),\n    `f_00_04` Nullable(Int32),\n    `f_05_09` Nullable(Int32),\n    `f_10_14` Nullable(Int32),\n    `f_15_19` Nullable(Int32),\n    `f_20_24` Nullable(Int32),\n    `f_25_29` Nullable(Int32),\n    `f_30_34` Nullable(Int32),\n    `f_35_39` Nullable(Int32),\n    `f_40_44` Nullable(Int32),\n    `f_45_49` Nullable(Int32),\n    `f_50_54` Nullable(Int32),\n    `f_55_59` Nullable(Int32),\n    `f_60_64` Nullable(Int32),\n    `f_65_69` Nullable(Int32),\n    `f_70_74` Nullable(Int32),\n    `f_75_79` Nullable(Int32),\n    `f_80_84` Nullable(Int32),\n    `f_85_89` Nullable(Int32),\n    `f_90_94` Nullable(Int32),\n    `f_95_99` Nullable(Int32),\n    `f_100plus` Nullable(Int32),\n    `m_00_04` Nullable(Int32),\n    `m_05_09` Nullable(Int32),\n    `m_10_14` Nullable(Int32),\n    `m_15_19` Nullable(Int32),\n    `m_20_24` Nullable(Int32),\n    `m_25_29` Nullable(Int32),\n    `m_30_34` Nullable(Int32),\n    `m_35_39` Nullable(Int32),\n    `m_40_44` Nullable(Int32),\n    `m_45_49` Nullable(Int32),\n    `m_50_54` Nullable(Int32),\n    `m_55_59` Nullable(Int32),\n    `m_60_64` Nullable(Int32),\n    `m_65_69` Nullable(Int32),\n    `m_70_74` Nullable(Int32),\n    `m_75_79` Nullable(Int32),\n    `m_80_84` Nullable(Int32),\n    `m_85_89` Nullable(Int32),\n    `m_90_94` Nullable(Int32),\n    `m_95_99` Nullable(Int32),\n    `m_100plus` Nullable(Int32),\n    `t_00_04` Nullable(Int32),\n    `t_05_09` Nullable(Int32),\n    `t_10_14` Nullable(Int32),\n    `t_15_19` Nullable(Int32),\n    `t_20_24` Nullable(Int32),\n    `t_25_29` Nullable(Int32),\n    `t_30_34` Nullable(Int32),\n    `t_35_39` Nullable(Int32),\n    `t_40_44` Nullable(Int32),\n    `t_45_49` Nullable(Int32),\n    `t_50_54` Nullable(Int32),\n    `t_55_59` Nullable(Int32),\n    `t_60_64` Nullable(Int32),\n    `t_65_69` Nullable(Int32),\n    `t_70_74` Nullable(Int32),\n    `t_75_79` Nullable(Int32),\n    `t_80_84` Nullable(Int32),\n    `t_85_89` Nullable(Int32),\n    `t_90_94` Nullable(Int32),\n    `t_95_99` Nullable(Int32),\n    `t_100plus` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_population_regions_2022\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `iso3` Nullable(String),\n    `adm0_en` Nullable(String),\n    `adm0_pcode` Nullable(String),\n    `adm1_en` Nullable(String),\n    `region_uuid` Nullable(String),\n    `adm1_pcode` Nullable(String),\n    `f_tl` Nullable(Int32),\n    `m_tl` Nullable(Int32),\n    `t_tl` Nullable(Int32),\n    `f_00_04` Nullable(Int32),\n    `f_05_09` Nullable(Int32),\n    `f_10_14` Nullable(Int32),\n    `f_15_19` Nullable(Int32),\n    `f_20_24` Nullable(Int32),\n    `f_25_29` Nullable(Int32),\n    `f_30_34` Nullable(Int32),\n    `f_35_39` Nullable(Int32),\n    `f_40_44` Nullable(Int32),\n    `f_45_49` Nullable(Int32),\n    `f_50_54` Nullable(Int32),\n    `f_55_59` Nullable(Int32),\n    `f_60_64` Nullable(Int32),\n    `f_65_69` Nullable(Int32),\n    `f_70_74` Nullable(Int32),\n    `f_75_79` Nullable(Int32),\n    `f_80_84` Nullable(Int32),\n    `f_85_89` Nullable(Int32),\n    `f_90_94` Nullable(Int32),\n    `f_95_99` Nullable(Int32),\n    `f_100plus` Nullable(Int32),\n    `m_00_04` Nullable(Int32),\n    `m_05_09` Nullable(Int32),\n    `m_10_14` Nullable(Int32),\n    `m_15_19` Nullable(Int32),\n    `m_20_24` Nullable(Int32),\n    `m_25_29` Nullable(Int32),\n    `m_30_34` Nullable(Int32),\n    `m_35_39` Nullable(Int32),\n    `m_40_44` Nullable(Int32),\n    `m_45_49` Nullable(Int32),\n    `m_50_54` Nullable(Int32),\n    `m_55_59` Nullable(Int32),\n    `m_60_64` Nullable(Int32),\n    `m_65_69` Nullable(Int32),\n    `m_70_74` Nullable(Int32),\n    `m_75_79` Nullable(Int32),\n    `m_80_84` Nullable(Int32),\n    `m_85_89` Nullable(Int32),\n    `m_90_94` Nullable(Int32),\n    `m_95_99` Nullable(Int32),\n    `m_100plus` Nullable(Int32),\n    `t_00_04` Nullable(Int32),\n    `t_05_09` Nullable(Int32),\n    `t_10_14` Nullable(Int32),\n    `t_15_19` Nullable(Int32),\n    `t_20_24` Nullable(Int32),\n    `t_25_29` Nullable(Int32),\n    `t_30_34` Nullable(Int32),\n    `t_35_39` Nullable(Int32),\n    `t_40_44` Nullable(Int32),\n    `t_45_49` Nullable(Int32),\n    `t_50_54` Nullable(Int32),\n    `t_55_59` Nullable(Int32),\n    `t_60_64` Nullable(Int32),\n    `t_65_69` Nullable(Int32),\n    `t_70_74` Nullable(Int32),\n    `t_75_79` Nullable(Int32),\n    `t_80_84` Nullable(Int32),\n    `t_85_89` Nullable(Int32),\n    `t_90_94` Nullable(Int32),\n    `t_95_99` Nullable(Int32),\n    `t_100plus` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_region_uuid_mapping\n(\n    `ogc_fid` Nullable(Int32),\n    `region_name_standard` Nullable(String),\n    `region_name_gis` Nullable(String),\n    `region_name_arabic` Nullable(String),\n    `region_uuid` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_rural_population_1960_2023\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `rural_population` Nullable(Int32),\n    `country` Nullable(String),\n    `country_code` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_urban_population_1960_2023\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `urban_population` Nullable(Int32),\n    `country` Nullable(String),\n    `country_code` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_saudi_youth_population_1960_2023\n(\n    `ogc_fid` Nullable(Int32),\n    `year` Nullable(Int32),\n    `population_0_14_pct` Nullable(Float64),\n    `country` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.support_data_school_transport_demand_reports_required_ksa_2025\n(\n    `ogc_fid` Nullable(Int32),\n    `priority` Nullable(Int32),\n    `report_name_arabic` Nullable(String),\n    `report_name_english` Nullable(String),\n    `official_source` Nullable(String),\n    `direct_link` Nullable(String),\n    `last_known_year` Nullable(String),\n    `purpose` Nullable(String),\n    `notes` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.unassigned_students\n(\n    `student_id` Nullable(String),\n    `school_id` Nullable(String),\n    `shift` Nullable(String),\n    `reason` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `created_at` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_county_student_stats\n(\n    `fid` Nullable(Int32),\n    `county_name` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `student_count` Nullable(Int64),\n    `bus_eligible` Nullable(Int64),\n    `avg_distance_m` Nullable(Float64),\n    `area_km2` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_county_transport_summary\n(\n    `fid` Nullable(Int32),\n    `county_name` Nullable(String),\n    `county_id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `school_count` Nullable(Int64),\n    `student_count` Nullable(Int64),\n    `avg_distance_m` Nullable(Float64),\n    `bus_eligible_students` Nullable(Int64),\n    `avg_household_income` Nullable(Float64),\n    `area_km2` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_demand_capacity_gap\n(\n    `fid` Nullable(Int32),\n    `region_name` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `total_demand` Nullable(Int64),\n    `total_capacity` Nullable(Int64),\n    `capacity_gap` Nullable(Int64),\n    `school_count` Nullable(Int64),\n    `route_count` Nullable(Int64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_division_all_statistics\n(\n    `fid` Nullable(Int32),\n    `name` Nullable(String),\n    `division_type` Nullable(String),\n    `division_id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `lat_2` Nullable(Float64),\n    `lon_2` Nullable(Float64),\n    `area_km2` Nullable(Float64),\n    `school_count` Nullable(Int64),\n    `student_count` Nullable(Int64),\n    `avg_student_distance_m` Nullable(Float64),\n    `bus_eligible_students` Nullable(Int64),\n    `avg_income` Nullable(Float64),\n    `route_count` Nullable(Int64),\n    `bus_capacity` Nullable(Int64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_division_counties\n(\n    `fid` Nullable(Int32),\n    `name` Nullable(String),\n    `name_alt` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `area_km2` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_division_neighborhoods\n(\n    `fid` Nullable(Int32),\n    `name` Nullable(String),\n    `subtype` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `lat_2` Nullable(Float64),\n    `lon_2` Nullable(Float64),\n    `area_km2` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_division_regions\n(\n    `fid` Nullable(Int32),\n    `name` Nullable(String),\n    `name_alt` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `area_km2` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_commute_distance\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `average_distance_km` Nullable(Float64),\n    `urban_areas_average_km` Nullable(Float64),\n    `rural_areas_average_km` Nullable(Float64),\n    `percent_students_over_5km` Nullable(Float64),\n    `percent_students_over_10km` Nullable(Float64),\n    `transport_demand_index` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_complaints_analysis\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `year` Nullable(String),\n    `month` Nullable(String),\n    `bus_delay_complaints` Nullable(Int32),\n    `not_covered_despite_registration` Nullable(Int32),\n    `refund_cancellation_complaints` Nullable(Int32),\n    `ac_cleanliness_complaints` Nullable(Int32),\n    `driver_behavior_complaints` Nullable(Int32),\n    `safety_incident_complaints` Nullable(Int32),\n    `other_route_coverage_complaints` Nullable(Int32),\n    `total_complaints` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_complaints_geo\n(\n    `fid` Nullable(Int32),\n    `region_name` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `year` Nullable(String),\n    `month` Nullable(String),\n    `bus_delay` Nullable(Int32),\n    `not_covered` Nullable(Int32),\n    `driver_behavior` Nullable(Int32),\n    `safety_incidents` Nullable(Int32),\n    `total_complaints` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_complaints_summary\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `total_complaints` Nullable(Int64),\n    `complaints_937` Nullable(Int64),\n    `complaints_rafed_app` Nullable(Int64),\n    `top_complaint_category` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_education_geo\n(\n    `fid` Nullable(Int32),\n    `region_name` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `education_stage` Nullable(String),\n    `gender` Nullable(String),\n    `number_of_students` Nullable(Int32),\n    `number_of_schools` Nullable(Int32),\n    `academic_year` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_education_statistics\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `region_id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `education_stage` Nullable(String),\n    `gender` Nullable(String),\n    `number_of_students` Nullable(Int32),\n    `number_of_schools` Nullable(Int32),\n    `academic_year` Nullable(String),\n    `students_per_school` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_household_demographics\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `total_households_with_school_age_children` Nullable(Int32),\n    `households_with_0_cars_percent` Nullable(Float64),\n    `households_with_1_car_percent` Nullable(Float64),\n    `working_mothers_percent` Nullable(Float64),\n    `single_parent_households_percent` Nullable(Float64),\n    `transport_dependency_index` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_population_demographics\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `total_population` Nullable(Int32),\n    `female_population` Nullable(Int32),\n    `male_population` Nullable(Int32),\n    `population_density_per_km2` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_private_transport_market\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `market_share_of_private_percent` Nullable(Float64),\n    `estimated_market_value_sar_million` Nullable(Float64),\n    `informal_individual_drivers` Nullable(Int32),\n    `private_company_transport_students` Nullable(Int32),\n    `uber_careem_students` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_rafed_geo\n(\n    `fid` Nullable(Int32),\n    `region_name` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `students_covered_by_rafed` Nullable(Int32),\n    `students_on_waiting_list` Nullable(Int32),\n    `total_eligible_students` Nullable(Int32),\n    `coverage_percentage` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_rafed_performance\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `students_covered_by_rafed` Nullable(Int32),\n    `students_on_waiting_list` Nullable(Int32),\n    `total_eligible_students` Nullable(Int32),\n    `coverage_percentage` Nullable(Float64),\n    `academic_year` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_school_distribution_aggregated\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `total_schools` Nullable(Int64),\n    `total_students` Nullable(Int64),\n    `avg_student_density` Nullable(Float64),\n    `avg_distance_to_school_km` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_transport_costs\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `base_cost_per_student_sar` Nullable(Int32),\n    `subsidy_per_student_sar` Nullable(Int32),\n    `family_payment_sar` Nullable(Int32),\n    `premium_service_cost_sar` Nullable(Int32),\n    `vehicle_operations_percent` Nullable(Float64),\n    `driver_salaries_percent` Nullable(Float64),\n    `fuel_percent` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_region_unmet_demand\n(\n    `fid` Nullable(Int32),\n    `region_name_ar` Nullable(String),\n    `region_name_en` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `total_students_not_covered` Nullable(Int32),\n    `on_official_waiting_list` Nullable(Int32),\n    `using_private_transport` Nullable(Int32),\n    `walking_or_family_transport` Nullable(Int32),\n    `priority_high` Nullable(Int32),\n    `priority_medium` Nullable(Int32),\n    `priority_low` Nullable(Int32)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_school_accessibility_zones\n(\n    `fid` Nullable(Int32),\n    `school_id` Nullable(String),\n    `school_name` Nullable(String),\n    `school_code` Nullable(String),\n    `region` Nullable(String),\n    `governorat` Nullable(String),\n    `distance_m` Nullable(Int64),\n    `distance_category` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_school_isochrones_combined\n(\n    `fid` Nullable(Int32),\n    `school_id` Nullable(String),\n    `school_name` Nullable(String),\n    `school_code` Nullable(String),\n    `region` Nullable(String),\n    `governorat` Nullable(String),\n    `distance_band` Nullable(String),\n    `distance_m` Nullable(Int64),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_schools_coverage_analysis\n(\n    `fid` Nullable(Int32),\n    `region_name` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `total_schools` Nullable(Int64),\n    `total_students` Nullable(Int64),\n    `bus_eligible_students` Nullable(Int64),\n    `eligible_far_students` Nullable(Int64),\n    `avg_distance_m` Nullable(Float64),\n    `area_km2` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_special_needs_students\n(\n    `fid` Nullable(Int32),\n    `student_id` Nullable(Int64),\n    `school_id` Nullable(String),\n    `school_name` Nullable(String),\n    `region` Nullable(String),\n    `county` Nullable(String),\n    `special_needs_type` Nullable(String),\n    `distance_to_school_m` Nullable(Float64),\n    `bus_eligible` Nullable(Int64),\n    `transport_mode` Nullable(String),\n    `income_bracket` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_student_distance_analysis\n(\n    `fid` Nullable(Int32),\n    `region_name` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `student_count` Nullable(Int64),\n    `avg_distance_m` Nullable(Float64),\n    `min_distance_m` Nullable(Float64),\n    `max_distance_m` Nullable(Float64),\n    `within_1km` Nullable(Int64),\n    `within_1_3km` Nullable(Int64),\n    `within_3_5km` Nullable(Int64),\n    `beyond_5km` Nullable(Int64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_student_income_distribution\n(\n    `fid` Nullable(Int32),\n    `student_id` Nullable(Int64),\n    `school_id` Nullable(String),\n    `school_name` Nullable(String),\n    `region` Nullable(String),\n    `county` Nullable(String),\n    `income_brkt` Nullable(String),\n    `income_sar` Nullable(Int64),\n    `ses_status` Nullable(String),\n    `vehicles` Nullable(Int64),\n    `hh_size` Nullable(Int64),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `income_category` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_student_transport_mode\n(\n    `fid` Nullable(Int32),\n    `student_id` Nullable(Int64),\n    `school_id` Nullable(String),\n    `school_name` Nullable(String),\n    `region` Nullable(String),\n    `trans_mode` Nullable(String),\n    `bus_elig` Nullable(Int64),\n    `bus_will` Nullable(Float64),\n    `dist_m` Nullable(Float64),\n    `route_dur_s` Nullable(Float64),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `commute_category` Nullable(String)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.vw_transport_demand_hotspots\n(\n    `fid` Nullable(Int32),\n    `region_name` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64),\n    `total_students` Nullable(Int64),\n    `bus_eligible` Nullable(Int64),\n    `far_eligible` Nullable(Int64),\n    `avg_eligible_distance` Nullable(Float64),\n    `special_needs_count` Nullable(Int64),\n    `area_km2` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.water_linestring\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `is_salt` Nullable(UInt8),\n    `is_interm` Nullable(UInt8),\n    `version` Nullable(Int32),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.water_point\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `is_salt` Nullable(UInt8),\n    `is_interm` Nullable(UInt8),\n    `version` Nullable(Int32),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192

CREATE TABLE default.water_polygon\n(\n    `fid` Nullable(Int32),\n    `subtype` Nullable(String),\n    `class` Nullable(String),\n    `is_salt` Nullable(UInt8),\n    `is_interm` Nullable(UInt8),\n    `version` Nullable(Int32),\n    `names_pri` Nullable(String),\n    `names_com` Nullable(String),\n    `wikidata` Nullable(String),\n    `id` Nullable(String),\n    `lat` Nullable(Float64),\n    `lon` Nullable(Float64)\n)\nENGINE = MergeTree\nORDER BY tuple()\nSETTINGS index_granularity = 8192





# Generate Students Fast - Complete Feature Summary

## 🎯 Overview
High-performance student data generator with comprehensive geospatial integration, intelligent school assignment, family structures, and administrative boundary join.

## ✨ Complete Feature List

### 📍 Geospatial Integration
- ✅ Students placed **within actual building polygons** from shapefile
- ✅ Point-in-polygon validation using ray casting algorithm
- ✅ Building sampling for performance optimization
- ✅ **Administrative boundary spatial join** (region, county, locality, neighborhood)
- ✅ Both English and Arabic names for administrative areas

### 🏫 Intelligent School Assignment
- ✅ **Nearest school assignment** using Haversine distance formula
- ✅ **Grade band matching**: kindergarten, primary, intermediate, secondary
- ✅ **Gender-aware school assignment**: male/female/mixed schools
- ✅ Parses Arabic school attributes (educatio_1, educatio_2)
- ✅ **School coordinates included** in all outputs
- ✅ Distance calculation in meters
- ✅ Fallback to nearest school if no compatible match

### 👨‍👩‍👧‍👦 Family Structures
- ✅ Realistic family groupings with siblings
- ✅ Shared last names within families
- ✅ Similar ages for siblings (±2 years)
- ✅ Sibling roles: Only Child, Brother, Sister
- ✅ Unique national IDs per student
- ✅ Family size distribution (70% only child, 18% two siblings, etc.)

### 👤 Student Attributes
- ✅ **Gender-aware names** (64 male names, 64 female names)
- ✅ 66 Saudi Arabian last names
- ✅ School-age range (6-18 years)
- ✅ Grade levels (KG through Grade 12)
- ✅ Realistic GPAs (2.0-4.0)
- ✅ Enrollment dates
- ✅ Active/inactive status

### 🗺️ Administrative Data (New!)
Each student includes administrative boundary information via spatial join:
- ✅ **Region** (English & Arabic names)
- ✅ **County** (English & Arabic names)
- ✅ **Locality** (English & Arabic names)
- ✅ **Neighborhood** (English & Arabic names)

### 📊 Output Formats
- ✅ **JSON**: Standard JSON array
- ✅ **CSV**: Spreadsheet-compatible format
- ✅ **GeoJSON**: Standard GIS format with Point geometries
- ✅ **Streaming**: Memory-efficient for large datasets (>100K)
- ✅ **Streaming GeoJSON**: Memory-efficient GeoJSON

### ⚡ Performance Features
- ✅ Building sampling to reduce memory usage
- ✅ Efficient spatial indexing with bbox checks
- ✅ Progress indicators for large datasets
- ✅ Performance metrics (students/second)
- ✅ ~100-200 students/second throughput

## 📋 Complete Student Data Structure

```json
{
  "id": 1,
  "first_name": "Leila",
  "last_name": "Al-Khouri",
  "email": "leila.alkhouri@university.edu",
  "gender": "Female",
  "age": 15,
  "grade": "Grade 10",
  "gpa": 3.58,
  "enrollment_date": "2022-07-29",
  "is_active": true,
  
  "building_id": "049d3ef2-4681-4adc-976f-820cf37f5316",
  "longitude": 46.52394089189979,
  "latitude": 22.57087330993121,
  "address": "Building 049d3ef2-4681-4adc-976f-820cf37f5316",
  
  "family_id": "F0000001",
  "sibling_role": "Only Child",
  "national_id": "2558231150",
  
  "assigned_school_id": "3914566",
  "assigned_school_name": "ثانوية الغيل - مقررات",
  "assigned_school_grade_bands": "secondary",
  "assigned_school_gender": "Female",
  "assigned_school_longitude": 46.70123,
  "assigned_school_latitude": 24.60456,
  "distance_to_school_m": 290.19,
  
  "region_name_en": "Makkah",
  "region_name_ar": "مكة المكرمة",
  "county_name_en": "Jeddah",
  "county_name_ar": "جدة",
  "locality_name_en": "Al-Balad",
  "locality_name_ar": "البلد",
  "neighborhood_name_en": "Al-Nuzha",
  "neighborhood_name_ar": "النزهة"
}
```

## 💻 Usage Examples

### Basic Generation
```bash
# Generate 1000 students with all features
python3 generate_students_fast.py -n 1000 -o students.json

# Generate to GeoJSON for GIS tools
python3 generate_students_fast.py -n 5000 -f geojson -o students.geojson

# Generate to CSV for spreadsheets
python3 generate_students_fast.py -n 10000 -f csv -o students.csv
```

### With Custom Paths
```bash
# Specify all shapefiles
python3 generate_students_fast.py -n 2000 \
  --buildings shapefiles/buildings.shp \
  --schools shapefiles/schools.shp \
  --admin shapefiles/admin.shp \
  -f geojson -o output.geojson
```

### Performance Optimization
```bash
# Sample 5000 buildings for faster loading
python3 generate_students_fast.py -n 10000 --building-sample 5000

# Large dataset with streaming mode
python3 generate_students_fast.py -n 100000 \
  --building-sample 10000 \
  -f streaming \
  -o students.json
```

### Reproducible Data
```bash
# Use seed for reproducible results
python3 generate_students_fast.py -n 1000 --seed 42 -o students.json
```

## 🎓 Data Statistics

### Name Diversity
- **Male First Names**: 64 names
- **Female First Names**: 64 names  
- **Last Names**: 66 Saudi Arabian family names
- **Total Combinations**: 8,448 unique name combinations

### Family Distribution
- 70% Only children (single child families)
- 18% Two siblings
- 9% Three siblings
- 3% Four siblings

### Grade Bands
- **Kindergarten**: Age ≤ 5
- **Primary**: Age 6-11 (Grades 1-6)
- **Intermediate**: Age 12-14 (Grades 7-9)
- **Secondary**: Age 15-18 (Grades 10-12)

## 🗂️ Data Sources

The generator integrates three shapefiles:

1. **Buildings** (`buildings.shp`)
   - Building footprints with polygons
   - Building IDs
   - ~6.9M buildings available

2. **Schools** (`schools.shp`)
   - 57,328 schools
   - Point geometries with coordinates
   - Grade band information (educatio_1, educatio_2)
   - Gender information
   - School names in Arabic

3. **Administrative Boundaries** (`admin.shp`)
   - Regions, counties, localities, neighborhoods
   - Polygon geometries
   - English and Arabic names
   - Hierarchical administrative structure

## 🔧 Technical Details

### Spatial Join Algorithm
1. For each student location (lon, lat):
2. Check bbox of each admin feature for quick filtering
3. Perform point-in-polygon test for precise containment
4. Extract English and Arabic names
5. Assign to student record

### School Assignment Algorithm
1. Determine student's grade band based on age
2. Filter schools by grade band compatibility
3. Filter schools by gender compatibility  
4. Calculate Haversine distance to all compatible schools
5. Assign nearest compatible school
6. Include school coordinates and distance

### Performance Optimizations
- Building sampling to reduce memory footprint
- Bbox pre-filtering before point-in-polygon checks
- Efficient geometry extraction
- Streaming modes for large datasets
- Progress indicators every 10,000 records

## 📦 Requirements

```bash
pip install fiona
```

## 🎯 Output Compatibility

### GIS Tools
- QGIS ✅
- ArcGIS ✅
- Mapbox ✅
- Leaflet ✅
- PostGIS ✅
- Any RFC 7946 compliant tool ✅

### Analysis Tools
- Pandas ✅
- Excel ✅
- Google Sheets ✅
- R ✅
- Tableau ✅

## 📄 License

MIT


## **Business Requirements Document (BRD)**
**Project Title:** Synthetic Student Population Generation for KSA
**Version:** 1.4
**Date:** October 26, 2023
**Author:** [Your Name/Department]
**Stakeholders:** Urban Planning Dept, Education Ministry Analytics, Data Science Team

---

### **1. Executive Summary**

This document outlines the requirements for a project to generate a large-scale, synthetic dataset of students across the Kingdom of Saudi Arabia (KSA). The primary goal is to create a realistic, albeit artificial, dataset for planning, analysis, and simulation purposes.

The project will leverage existing GIS data layers to produce an enriched point dataset where each point represents a student. Each student record will include a generated residential location, synthetic demographic attributes, disability status, characterization of their residential area, and an assignment to the nearest school.

**A key feature of this project is a highly configurable data generation script. This will allow users to specify the number of students to generate and target specific administrative areas (e.g., an entire region, a single city, or a specific district), making the tool flexible for both large-scale and focused analyses.**

### **2. Business Objectives**

*   **BO-1: Enable Advanced Educational Planning:** Provide a detailed dataset to model student distribution for better decision-making.
*   **BO-2: Support Simulation and Modeling:** Create a safe, anonymized dataset for developing analytical models for student services.
*   **BO-3: Enhance Accessibility and Equity Analysis:** Incorporate data on disabilities and geographic challenges to facilitate planning for special needs and equitable access.
*   **BO-4: Establish a Flexible Data Generation Framework:** Develop a repeatable, automated process that can be easily re-run with updated data.
*   **BO-5: (New) Enable Targeted Scenario Analysis:** Provide a tool that can generate smaller, targeted datasets for specific geographies, facilitating rapid scenario testing and local-level planning without processing the entire national dataset.

### **3. Scope**

#### **3.1 In Scope**

*   **IS-1:** Ingestion of Buildings, Administrative Boundaries, and Schools datasets.
*   **IS-2:** Generation of a specified number of unique student location points within building polygons.
*   **IS-3:** Enrichment of student points with detailed administrative information.
*   **IS-4:** Generation of synthetic student attributes (demographics, health, disability).
*   **IS-5:** Assignment of the nearest school to each student.
*   **IS-6:** Classification of each student's residential location (ruggedness, remoteness).
*   **IS-7:** Delivery of the final dataset in GeoPackage and CSV formats.
*   **IS-8: (New) A configurable execution model for the generation script, allowing users to define the scope of the data generation run via parameters.**

#### **3.2 Out of Scope**

*   **OS-1:** Sourcing, cleaning, or validating the initial input GIS data.
*   **OS-2:** Development of a user interface or web application.
*   **OS-3:** Complex demographic modeling beyond "one student per building."
*   **OS-4:** Network analysis for school assignment (proximity-based only).

---

### **4. Functional Requirements**

| ID         | Requirement Description                                                                                                                                                                                                                                                                                                                        |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **FR-01**  | **(New) Configurable Generation Script:** The primary Python script must be executable with command-line parameters to control the generation process. These parameters must include: <br> - `--num_students` (Integer or 'all'): The total number of students to generate. Defaults to 'all'. <br> - `--region` (String): The name of the region to generate data for. <br> - `--city` (String): The name of the city/locality. <br> - `--district` (String): The name of the district/neighborhood. <br> *If no geographic filter is provided, the script runs for the entire country.* |
| **FR-02**  | **Data Ingestion:** The system must read the provided shapefiles for Buildings, Administrative Boundaries, and Schools.                                                                                                                                                                                                                           |
| **FR-03**  | **(Updated) Student Location Generation:** The process must first filter the input `Buildings` layer based on any geographic parameters (`--region`, `--city`, `--district`) provided at runtime. If `--num_students` is specified as an integer, the script will randomly sample that number of buildings from the filtered set. A single random point will be generated within each selected building. |
| **FR-04**  | **Synthetic Attribute Generation:** For each generated student point, create synthetic attributes including Name, National ID, Age, Grade, Gender, Health Status, and Disability Status, according to predefined rules and probabilities.                                                                                                         |
| **FR-05**  | **Administrative Data Assignment:** Spatially join each student point with the administrative boundaries to append `Region_Name`, `County_Name`, `Locality_Name`, and `Neighborhood_Name`.                                                                                                                                                         |
| **FR-06**  | **Synthetic Address Generation:** Generate a composite address string: `"Building [Building ID], [Neighborhood Name], [Locality Name]"`.                                                                                                                                                                                                         |
| **FR-07**  | **Nearest School Assignment:** For each student, identify the nearest school and append the `school_id`, `school_name`, and calculated `dist_to_school_m`.                                                                                                                                                                                       |
| **FR-08**  | **Remoteness Classification:** Classify each location as 'Remote' or 'Non-remote' based on whether `dist_to_school_m` is greater than a predefined threshold (e.g., 10,000 meters).                                                                                                                                                               |
| **FR-09**  | **Ruggedness Classification:** Classify each location as 'Rugged' or 'Non-rugged' based on a weighted probability or a provided terrain model.                                                                                                                                                                                                   |
| **FR-10**  | **Output Generation:** Consolidate all data into a single dataset and export to GeoPackage and CSV formats. The output filename should be indicative of the generation parameters (e.g., `students_riyadh_al-olaya_500.gpkg`).                                                                                                                         |

---

### **5. Data Requirements**

*(The input and output schemas remain the same as Version 1.3, but the output file will be a subset of the total possible data depending on the runtime configuration.)*

#### **Output Data Schema (Summary)**
`student_id`, `national_id`, `first_name`, `last_name`, `gender`, `age`, `grade`, `health_status`, `disability_status`, `building_id_residence`, `address`, `region`, `county`, `locality`, `neighborhood`, `area_ruggedness`, `area_remoteness`, `assigned_school_id`, `assigned_school_name`, `dist_to_school_m`, `geometry`.

---

### **6. Assumptions and Constraints**

*   **Assumption-1:** The building layer is comprehensive and predominantly residential.
*   **Assumption-2:** "One student per building" is an acceptable simplification.
*   **Assumption-3:** Input GIS data is topologically clean and shares a single projected CRS.
*   **Assumption-4:** The definitions for 'Remote' and 'Rugged' areas are acceptable proxies.
*   **Constraint-1:** The project must be completed using a scriptable toolset (e.g., Python with GeoPandas).
*   **Constraint-2:** The data generation process must be fully automated.
*   **Constraint-3: (New)** The generation script must be operable via a command-line interface (CLI), accepting arguments for configuration as specified in FR-01.

---

### **7. Success Criteria (Acceptance Criteria)**

The project will be considered successful when:
*   **AC-1:** A final dataset is delivered in both GeoPackage and CSV formats.
*   **AC-2:** The delivered dataset contains the number of records specified at runtime.
*   **AC-3:** All fields in the output schema are fully populated with no null values.
*   **AC-4:** A random sample of records confirms the correctness of location, nearest school assignment, and administrative data.
*   **AC-5:** The complete data generation script is delivered and documented.
*   **AC-6: (New) The configurability of the script is validated through the following test cases:**
    *   **Test Case 1 (Region Filter):** Running the script with `--region "Riyadh Province"` generates an output where 100% of the students fall within the "Riyadh Province" administrative boundary.
    *   **Test Case 2 (Number Filter):** Running the script with `--num_students 5000` generates an output file containing exactly 5000 student records.
    *   **Test Case 3 (Combined Filter):** Running the script with `--city "Jeddah" --num_students 1000` generates an output of 1000 students, all of whom are located within buildings inside the "Jeddah" administrative boundary.










## **Purple ECharts UI Design Prompt (Short & Strong)**

> **Create a modern, premium ECharts visualization with a purple-first UI theme.**
> Follow these rules strictly:
>
> **Style & Mood**
>
> * Dark, elegant dashboard look
> * Clean, minimal, professional (no clutter)
> * Subtle depth with soft shadows and gradients
>
> **Colors**
>
> * Primary purple gradient for bars/areas: `#A78BFA → #8B5CF6`
> * Accent pink for lines/highlights: `#EC4899`
> * Muted text: `#D1D5DB` (labels), `#9CA3AF` (secondary)
> * Tooltip background: `rgba(15, 15, 25, 0.95)`
>
> **Axes & Grid**
>
> * Remove axis lines and ticks
> * Show only subtle dashed horizontal grid lines
> * No vertical grid lines
>
> **Bars**
>
> * Gradient fill (vertical)
> * Rounded top corners
> * Medium width (not thick)
> * Lighter gradient on hover
>
> **Lines & Areas**
>
> * Smooth curves
> * Slightly thick lines
> * Gradient area fill with low opacity
> * Soft circular points
>
> **Tooltip**
>
> * Semi-transparent dark background
> * Purple border
> * Clean typography
> * Soft hover shadow or axis highlight
>
> **Layout & Typography**
>
> * Generous padding and spacing
> * Space reserved for legend at the top
> * Consistent font sizes (12–13px)
>
> **General Rules**
>
> * Always use gradients for visual elements
> * Prefer subtlety over brightness
> * Maintain consistent purple theme across all chart types
> * Modern, SaaS-quality aesthetic

