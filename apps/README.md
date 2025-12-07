# Rafed Analytics Dashboard Suite

## 1. Overview
This directory contains a suite of interactive dashboards designed for the **Rafed School Transport Hackathon**. These applications visualize synthetic student populations, transport demand, operational efficiency, and equity metrics across the Kingdom of Saudi Arabia.

All dashboards connect directly to a local **ClickHouse** instance for high-performance analytics and use **Deck.gl** for large-scale geospatial visualization (rendering 25,000+ points smoothly).

## 2. Dashboard Inventory

| File Name | Dashboard Title | Target Audience | Key Features |
| :--- | :--- | :--- | :--- |
| `rafed_dashboard.html` | **Rafed Command Center** | Executives / Ops Center | Dark mode, real-time KPIs, comprehensive student heatmap (Riyadh focus). |
| `rafed_dashboard_ar.html` | **Rafed Analytics (AR)** | Local Admins / Ministry | Arabic UI (RTL), light theme, regional breakdown charts. |
| `demand_gap_dashboard.html` | **Demand & Gap Analysis** | Network Planners | Unmet demand heatmap, waitlist reason analysis, critical school alerts. |
| `operational_dashboard.html` | **Operational Efficiency** | Fleet Managers | Fleet utilization histograms, empty/overloaded route identification. |
| `equity_dashboard.html` | **Equity & Inclusion** | Social Services | Special needs student locations, low-income transport mode analysis. |
| `cx_dashboard.html` | **Customer Experience** | Quality Assurance | Complaint hotspots by region, resolution rates, top issue categories. |
| `environmental_dashboard.html` | **Environmental Impact** | Sustainability Team | CO2/Fuel savings calculator, heatmap of high-impact commute reductions. |
| `network_coverage_dashboard.html` | **Network Coverage** | Strategic Planners | Distance distribution, long-commute analysis, walkability metrics. |
| `data_catalog_dashboard.html` | **Data Universe Infographic** | Data Engineers | Visual catalog of all 45+ datasets with record counts and volume treemap. |
| `data_insights_explorer.html` | **Data Insights Explorer** | Analysts | Interactive tabular browser for Reports, Views, and GIS attribute data. |
| `route_planning_workbench.html` | **Route Planner Workbench** | Operations | Split-screen tool for optimizing routes, viewing unassigned clusters, and managing fleet efficiency. |

## 3. Documentation & Specifications

We have created detailed documentation to support these implementations:

*   **`DATASETS_AND_VISUALIZATIONS.md`**: 
    *   Detailed Data Dictionary for Core GIS tables (`students`, `schools`, `routes`).
    *   Catalog of 12 Support Reports (Demographics, Market, Complaints).
    *   Strategic definitions for the dashboard concepts.
    
*   **`ANALYTICS_INDICATORS_AND_DECKGL.md`**:
    *   Library of calculated indicators (e.g., "Walkability Score", "Deadhead Ratio").
    *   Technical specifications for Deck.gl layers (`HexagonLayer`, `PathLayer`).

## 4. Technical Setup

### 4.1 Architecture
*   **Frontend:** Static HTML5/JS (No build step required).
*   **Libraries:** TailwindCSS (Styling), Deck.gl (Maps), MapLibre (Basemaps), Chart.js (Graphs).
*   **Backend:** ClickHouse (OLAP Database) running via Docker.
*   **API:** Native ClickHouse HTTP Interface (`http://localhost:8155`).

### 4.2 Authentication
The dashboards are pre-configured to use a read-only user created during this session:
*   **User:** `viewer`
*   **Password:** `rafed_view`

### 4.3 How to Run
1.  **Ensure Docker is running:**
    ```bash
    docker ps  # Check for dev-env-isolated-clickhouse-1
    ```
2.  **Open the files:**
    Simply double-click any `.html` file in this directory to open it in your browser.
    
    *Note: If you encounter CORS errors, run a local server:*
    ```bash
    # Run inside apps/ directory
    python3 -m http.server 8080
    # Then visit http://localhost:8080/rafed_dashboard.html
    ```

## 5. Recent Fixes & Improvements
*   **Auth:** Solved 401 errors by creating a dedicated DB user.
*   **Maps:** Fixed "blank map" issues by filtering queries to the **Riyadh** bounding box (lat 24.0-25.5) to match the map's initial view.
*   **Schema:** Corrected table references (e.g., `public_students` → `students`) to match the active ClickHouse schema.
