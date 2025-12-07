# School Transport Data Product: Documentation & Visualizations

## 1. Executive Summary

**Project Title:** Synthetic Student Population & Transport Demand Model for KSA  
**Primary Stakeholder:** Rafed (School Transport Services)  
**Version:** 1.1  

### 1.1 Purpose
This project provides a comprehensive data foundation for modeling school transport demand across the Kingdom of Saudi Arabia. By generating a realistic synthetic population of students linked to actual school locations and road networks, it enables:
- **Precision Planning:** moving from region-level estimates to building-level demand modeling.
- **Gap Analysis:** Identifying exactly where current fleet capacity falls short of eligible student demand.
- **Equity Assessment:** Ensuring service coverage for remote areas and special needs students.
- **Scenario Testing:** Simulating the impact of new routes, policy changes (e.g., eligibility distance), or fleet expansions.

### 1.2 Business Value
- **Operational Efficiency:** Optimize route planning to increase utilization and reduce deadhead mileage.
- **Cost Optimization:** Target subsidies and fleet expansion where demand density is highest.
- **Strategic Growth:** Forecast future demand based on demographic trends (2024-2030).

---

## 2. Methodology & Data Generation

To overcome privacy constraints and data fragmentation, we utilize a **Synthetic Population Generation** approach (`generate_students_fast.py`).

### 2.1 Generation Logic
1.  **Household Synthesis:**
    - We apply Saudi demographic priors (household size, sibling age gaps) to generate realistic family units.
    - Families are assigned shared attributes (Income, Transport Willingness).
2.  **Geospatial Placement:**
    - Households are placed into **actual building footprints** (`shapefiles/buildings.*`).
    - Locations are validated against administrative boundaries (Region -> City -> District).
3.  **School Assignment:**
    - Students are matched to schools based on **Grade**, **Gender**, and **Proximity**.
    - Logic handles complex rules (e.g., mixed-gender kindergartens vs. single-gender high schools).
4.  **Transport Modeling:**
    - **Eligibility:** Calculated based on distance (>250m for KG, >800m for others).
    - **Willingness:** Modeled using income levels, car ownership rates, and distance decay functions.
    - **Routing:** Uses OSRM/GraphHopper to calculate real road-network distances, not just straight-line buffers.

---

## 3. Technical Architecture

The platform uses a dual-database architecture to balance geospatial capabilities with analytical performance.

### 3.1 Data Flow
1.  **Ingest:** Raw Shapefiles & CSV Reports -> Python Generators.
2.  **Storage (OLTP/GIS):** **PostgreSQL + PostGIS**
    - Handles complex spatial joins (`ST_Within`), geometry validity, and view definitions.
    - Source of Truth for all generated entities.
3.  **Analysis (OLAP):** **ClickHouse**
    - High-speed columnar store for dashboarding.
    - Geometry columns are converted to `Lat/Lon` pairs or H3 indexes for rapid aggregation.
    - Used by BI tools (Superset/Metabase) for sub-second slicing of millions of records.

---

## 4. Data Dictionary

### 4.1 Core Geospatial Tables (Schema: `public`)

#### `students` (Point Layer)
Represents individual synthetic students.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Unique Student ID. |
| `age` | Int | Age in years. |
| `gender` | String | 'M' or 'F'. |
| `grade` | Int | Grade level (1-12). |
| `school_id` | UUID | Assigned school. |
| `dist_m` | Float | Network distance to assigned school (meters). |
| `bus_elig` | Bool | 1 if eligible for transport, 0 otherwise. |
| `bus_will` | Float | Probability (0-1) of using bus if offered. |
| `income_sar` | Float | Estimated household monthly income. |
| `spec_needs` | String | Type of disability (if any). |
| `geom` | Point | Exact residential location. |

#### `schools` (Point Layer)
Represents school facilities.
| Column | Type | Description |
| :--- | :--- | :--- |
| `school_id` | UUID | Unique School ID. |
| `capacity` | Int | Max student capacity. |
| `gender` | String | School gender policy (Boys/Girls/Mixed). |
| `stage` | String | Education Stage (Primary/Intermediate/Secondary). |
| `region` | String | Administrative Region. |

#### `school_routes` (Linestring Layer)
Represents bus routes.
| Column | Type | Description |
| :--- | :--- | :--- |
| `route_id` | UUID | Unique Route ID. |
| `utilization` | Float | Current load / Capacity (e.g., 0.85 = 85% full). |
| `duration_s` | Int | Total route duration in seconds. |
| `distance_m` | Float | Total route length. |

### 4.2 Support Intelligence (Schema: `support_data`)
These 12 reports provide the context for the synthetic data.

| Report ID | Dataset Name | Purpose |
| :--- | :--- | :--- |
| **R1** | `education_statistics` | Baselines for student/school counts per region. |
| **R2** | `rafed_performance` | Current official coverage & waiting list numbers. |
| **R3** | `student_growth` | 2024-2030 forecast for capacity planning. |
| **R4** | `uncovered_demand` | Detailed gap analysis of unserved students. |
| **R5** | `school_density` | Urban vs. Rural density metrics. |
| **R6** | `home_school_distance` | Distance benchmarks (avg km per region). |
| **R7** | `household_cars` | Car ownership stats (inverse correlation to bus demand). |
| **R8** | `complaints` | 937/App complaint logs for quality analysis. |
| **R9** | `private_market` | Uber/Careem/Private bus market share. |
| **R10** | `cost_structure` | Cost per seat, subsidy, and pricing tiers. |
| **R11** | `satisfaction` | Parent willingness-to-pay surveys. |
| **R12** | `private_schools` | Growth trends in non-public education. |

---

## 5. Analytics & Dashboards

We have designed 5 strategic dashboards backed by **22 optimized SQL Views**.

### 5.1 Strategic Executive Dashboard
**Audience:** C-Suite, Ministry Leadership  
**Goal:** High-level health check of the transport network.  

**Key Business Questions:**
- What is our national coverage rate?
- Which regions are under-performing?
- Are we efficiently utilizing our fleet?

**Visualizations:**
1.  **Kpi Metric:** Total Students Served vs. Eligible Demand.
2.  **Choropleth Map (`vw_region_transport_summary`):**
    - *Color:* Bus Eligibility Rate %.
    - *Tooltip:* School count, Total Fleet Size.
3.  **Bar Chart:** Top 5 Regions by Waiting List Volume (`vw_region_rafed_performance`).

### 5.2 Demand & Capacity Gap Dashboard
**Audience:** Network Planners, Operations Managers  
**Goal:** Pinpoint specific neighborhoods needing new routes.

**Key Business Questions:**
- Where is the demand significantly higher than capacity?
- Which schools have the longest waiting lists?
- Identify "Desert" areas with no coverage.

**Visualizations:**
1.  **Bivariate Map (`vw_demand_capacity_gap`):**
    - *Size:* Total Demand.
    - *Color:* Gap Category (Red=Severe Shortage, Green=Surplus).
2.  **Heatmap (`vw_unassigned_students_heatmap`):**
    - Density of students who are eligible but not assigned to a bus.
    - *Filter:* By Education Stage (Prioritize Primary).

### 5.3 Operational Efficiency Dashboard
**Audience:** Fleet Managers, Route Optimizers  
**Goal:** Reduce costs and improve ride quality.

**Key Business Questions:**
- Which routes are driving empty (<50% utilization)?
- Are students spending too long on the bus (>60 mins)?
- How walkable are our schools?

**Visualizations:**
1.  **Route Flow Map (`vw_bus_routes_statistics`):**
    - *Color:* Utilization (Red < 50%, Green > 80%, Purple > 100%).
    - *Width:* Bus Capacity.
2.  **Isochrone Layer (`vw_schools_coverage_analysis`):**
    - Shows 1km/3km/5km drive-time polygons around schools.
    - Overlay with student points to see who *could* walk but is being bussed.

### 5.4 Equity & Inclusion Dashboard
**Audience:** Policy Makers, Social Services  
**Goal:** Ensure no student is left behind due to disability or poverty.

**Key Business Questions:**
- Do special needs students have access to adapted transport?
- Are low-income neighborhoods receiving adequate subsidies?
- Are remote villages being served?

**Visualizations:**
1.  **Point Map (`vw_special_needs_students`):**
    - Locations of students with `spec_needs != NULL`.
    - Differentiated by disability type (Wheelchair vs. Non-Kinetic).
2.  **Choropleth (`vw_student_income_distribution`):**
    - Neighborhoods colored by average household income.
    - *Correlation:* Scatter plot of Income vs. Transport Dependence.

### 5.5 Customer Experience (CX) Dashboard
**Audience:** Quality Assurance, Customer Service  
**Goal:** Address pain points and improve satisfaction.

**Key Business Questions:**
- What are the top complaints in Riyadh vs. Jeddah?
- Is driver behavior a growing issue?
- How does "Distance to School" correlate with "Satisfaction"?

**Visualizations:**
1.  **Cluster Map (`vw_region_complaints_analysis`):**
    - Clusters of complaints.
    - *Drill-down:* Click cluster to see breakdown by category (Delay, Safety, AC).
2.  **Trend Line:** Complaints over time (Monthly) vs. Fleet Growth.

---

## 6. SQL Cheatsheet for Analysts

### Find "Transport Deserts" (High Demand, Zero Capacity)
```sql
SELECT region_name, total_demand, capacity_gap
FROM vw_demand_capacity_gap
WHERE capacity_gap > 500
ORDER BY capacity_gap DESC;
```

### Analyze Bus Utilization by Region
```sql
SELECT region_name, avg_bus_utilization, total_buses
FROM vw_region_transport_summary
WHERE avg_bus_utilization < 0.6; -- Underutilized regions
```

### Identify Schools with High Walking Potential
```sql
-- Find schools where >50% of students are within 1km
SELECT school_name, students_within_1km, 
       (students_within_1km::float / (students_within_1km + students_within_3km)) * 100 as walk_share
FROM vw_schools_coverage_analysis
WHERE students_within_1km > 100
ORDER BY walk_share DESC;
```
