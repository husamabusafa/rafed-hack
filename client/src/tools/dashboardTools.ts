import type { Dispatch, SetStateAction } from 'react';

export interface DashboardState {
  htmlCode: string;
  metadata: {
    title?: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
  };
}

export interface ToolResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

const EMPTY_DASHBOARD: DashboardState = {
  htmlCode: '',
  metadata: {
    createdAt: new Date().toISOString(),
  },
};

export const createDashboardTools = (
  getDashboardState: () => DashboardState,
  setDashboardState: Dispatch<SetStateAction<DashboardState>>
) => {
  // Test tool to verify SDK is working
  const test_tool = {
    tool: async (): Promise<ToolResponse> => {
      console.log('[test_tool] Called!');
      const result = {
        success: true,
        message: 'Test tool works!',
        data: { test: 'This is test data', number: 42 }
      };
      console.log('[test_tool] Returning:', result);
      return result;
    }
  };

  return {
    test_tool,
    /**
     * Set dashboard HTML code
     * Tool Name: set_dashboard_code
     * Description: Sets the complete HTML code for the dashboard. This should be a full HTML document with embedded CSS and JavaScript. Use this to create a brand new dashboard or completely replace existing code. The dashboard will render with ClickHouse integration (http://localhost:8155), TailwindCSS, Chart.js, Deck.gl, and MapLibre libraries.
     * Input Schema:
     * {
     *   "type": "object",
     *   "properties": {
     *     "htmlCode": {
     *       "type": "string",
     *       "description": "Complete HTML code for the dashboard including <!DOCTYPE html>, <head>, <body>, CSS, and JavaScript"
     *     },
     *     "title": {
     *       "type": "string",
     *       "description": "Title of the dashboard (optional)"
     *     },
     *     "description": {
     *       "type": "string",
     *       "description": "Description of what the dashboard shows (optional)"
     *     }
     *   },
     *   "required": ["htmlCode"]
     * }
     */
    set_dashboard_code: {
      tool: async (params: {
        htmlCode: string;
        title?: string;
        description?: string;
      }): Promise<ToolResponse> => {
        try {
          if (!params.htmlCode || typeof params.htmlCode !== 'string') {
            return {
              success: false,
              error: 'htmlCode is required and must be a string',
            };
          }

          const currentState = getDashboardState();
          const updatedAt = new Date().toISOString();
          
          setDashboardState({
            htmlCode: params.htmlCode,
            metadata: {
              title: params.title,
              description: params.description,
              createdAt: currentState.metadata.createdAt,
              updatedAt,
            },
          });

          return {
            success: true,
            message: `Successfully set dashboard code${params.title ? ` for "${params.title}"` : ''}`,
            data: {
              approved: true,
              status: 'applied',
              codeLength: params.htmlCode.length,
              title: params.title,
              description: params.description,
              updatedAt,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to set dashboard code',
          };
        }
      }
    },

    /**
     * Get dashboard HTML code
     * Tool Name: get_dashboard_code
     * Description: Retrieves the current HTML code of the dashboard. Use this to inspect the existing code before making modifications or to understand what's currently displayed.
     * Input Schema:
     * {
     *   "type": "object",
     *   "properties": {}
     * }
     */
    get_dashboard_code: {
      tool: async (): Promise<ToolResponse> => {
        try {
          const currentState = getDashboardState();

          return {
            success: true,
            message: currentState.htmlCode ? 'Retrieved dashboard code' : 'No dashboard code found',
            data: {
              htmlCode: currentState.htmlCode,
              codeLength: currentState.htmlCode.length,
              metadata: currentState.metadata,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get dashboard code',
          };
        }
      }
    },

    /**
     * Update dashboard HTML code
     * Tool Name: update_dashboard_code
     * Description: Makes surgical edits to specific parts of the dashboard code without regenerating everything. Use this for targeted changes like updating colors, modifying queries, or adjusting specific sections. Provide the exact text to find (oldCode) and what to replace it with (newCode).
     * Input Schema:
     * {
     *   "type": "object",
     *   "properties": {
     *     "oldCode": {
     *       "type": "string",
     *       "description": "The exact code snippet to find and replace. Must match exactly including whitespace."
     *     },
     *     "newCode": {
     *       "type": "string",
     *       "description": "The new code to replace the old code with"
     *     },
     *     "description": {
     *       "type": "string",
     *       "description": "Optional description of what this update does"
     *     }
     *   },
     *   "required": ["oldCode", "newCode"]
     * }
     */
    update_dashboard_code: {
      tool: async (params: {
        oldCode: string;
        newCode: string;
        description?: string;
      }): Promise<ToolResponse> => {
        try {
          if (!params.oldCode || typeof params.oldCode !== 'string') {
            return {
              success: false,
              error: 'oldCode is required and must be a string',
            };
          }

          if (typeof params.newCode !== 'string') {
            return {
              success: false,
              error: 'newCode must be a string',
            };
          }

          const currentState = getDashboardState();
          
          if (!currentState.htmlCode) {
            return {
              success: false,
              error: 'No dashboard code exists. Use set_dashboard_code first.',
            };
          }

          if (!currentState.htmlCode.includes(params.oldCode)) {
            return {
              success: false,
              error: 'Could not find the specified oldCode in the current dashboard. Make sure it matches exactly including whitespace.',
            };
          }

          const updatedCode = currentState.htmlCode.replace(params.oldCode, params.newCode);
          const updatedAt = new Date().toISOString();
          
          setDashboardState({
            htmlCode: updatedCode,
            metadata: {
              ...currentState.metadata,
              updatedAt,
            },
          });

          return {
            success: true,
            message: `Successfully updated dashboard code${params.description ? `: ${params.description}` : ''}`,
            data: {
              approved: true,
              status: 'applied',
              oldCodeLength: params.oldCode.length,
              newCodeLength: params.newCode.length,
              description: params.description,
              updatedAt,
            },
          };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update dashboard code',
          };
        }
      }
    },

    /**
     * List dashboard examples
     * Tool Name: list_dashboard_examples
     * Description: Returns a list of all available example dashboards from the /apps directory with their descriptions. Use this to see what dashboard patterns and styles are available to learn from and replicate.
     * Input Schema:
     * {
     *   "type": "object",
     *   "properties": {}
     * }
     */
    list_dashboard_examples: {
      tool: async (): Promise<ToolResponse> => {
        try {
          const examples = [
            {
              name: "cx_dashboard.html",
              title: "Customer Experience Dashboard",
              description: "Complaint monitoring with regional map hotspots, pie chart of complaint categories, and resolution metrics. Uses ScatterplotLayer for geographic visualization."
            },
            {
              name: "market_intelligence_dashboard.html",
              title: "Market Intelligence Dashboard",
              description: "Private transport market analysis with market value KPIs, market composition doughnut chart, and regional market share visualization."
            },
            {
              name: "operational_dashboard.html",
              title: "Operational Efficiency Dashboard",
              description: "Fleet management with utilization rates, route efficiency metrics, histograms, and empty/overloaded route identification."
            },
            {
              name: "equity_dashboard.html",
              title: "Equity & Inclusion Dashboard",
              description: "Special needs student locations, low-income transport mode analysis, and accessibility metrics with map visualization."
            },
            {
              name: "demand_gap_dashboard.html",
              title: "Demand & Gap Analysis",
              description: "Unmet demand heatmap, waitlist reason analysis, and critical school alerts showing service coverage gaps."
            },
            {
              name: "environmental_dashboard.html",
              title: "Environmental Impact Dashboard",
              description: "CO2 and fuel savings calculator, environmental impact metrics, and heatmap of high-impact commute reductions."
            },
            {
              name: "network_coverage_dashboard.html",
              title: "Network Coverage Dashboard",
              description: "Distance distribution analysis, long-commute identification, and walkability metrics for strategic planning."
            },
            {
              name: "financial_dashboard.html",
              title: "Financial Dashboard",
              description: "Cost analysis, budget tracking, revenue projections, and financial KPIs with trend charts."
            },
            {
              name: "rafed_dashboard.html",
              title: "Rafed Command Center",
              description: "Executive dashboard with dark theme, real-time KPIs, comprehensive student heatmap focused on Riyadh region."
            },
            {
              name: "rafed_dashboard_ar.html",
              title: "Rafed Analytics (Arabic)",
              description: "Arabic RTL interface with light theme, regional breakdown charts, and localized metrics for local administrators."
            },
            {
              name: "routes_dashboard.html",
              title: "Routes Dashboard",
              description: "Bus route visualization with PathLayer, route statistics, stop locations, and route optimization insights."
            },
            {
              name: "regional_scorecard.html",
              title: "Regional Scorecard",
              description: "Performance metrics by region, comparative scorecards, and regional KPI tracking with charts."
            },
            {
              name: "route_planning_workbench.html",
              title: "Route Planning Workbench",
              description: "Split-screen tool for route optimization, unassigned student clusters, and fleet efficiency management."
            },
            {
              name: "growth_forecast_dashboard.html",
              title: "Growth Forecast Dashboard",
              description: "Demand projections, growth trend analysis, and future capacity planning with forecasting models."
            },
            {
              name: "capacity_demand_dashboard.html",
              title: "Capacity vs Demand Dashboard",
              description: "Supply-demand balance visualization, capacity utilization tracking, and shortage/surplus identification."
            },
            {
              name: "rafed_coverage_dashboard.html",
              title: "Rafed Coverage Dashboard",
              description: "Service coverage maps, coverage percentage by region, and accessibility analysis."
            },
            {
              name: "special_needs_dashboard.html",
              title: "Special Needs Dashboard",
              description: "Specialized transport for students with disabilities, accessibility features, and compliance tracking."
            },
            {
              name: "deckgl_3d_analytics.html",
              title: "3D Analytics (Deck.gl)",
              description: "Advanced 3D visualization with HexagonLayer, elevation data, and interactive 3D geographic analytics."
            },
            {
              name: "deckgl_animated_routes.html",
              title: "Animated Routes (Deck.gl)",
              description: "Animated route visualization showing bus movements, trip arcs, and dynamic path rendering with TripsLayer."
            },
            {
              name: "deckgl_density_heatmap.html",
              title: "Density Heatmap (Deck.gl)",
              description: "Student density heatmap using HexagonLayer with aggregation, showing population concentration patterns."
            },
            {
              name: "data_catalog_dashboard.html",
              title: "Data Universe Catalog",
              description: "Visual catalog of all 45+ datasets with record counts, volume treemap, and data lineage information."
            },
            {
              name: "data_insights_explorer.html",
              title: "Data Insights Explorer",
              description: "Interactive tabular browser for reports, views, and GIS attribute data with filtering and search."
            }
          ];

          const result = {
            success: true,
            message: `Found ${examples.length} example dashboards`,
            data: {
              examples,
              totalCount: examples.length,
              categories: {
                operations: ["operational_dashboard.html", "routes_dashboard.html", "route_planning_workbench.html"],
                analytics: ["cx_dashboard.html", "market_intelligence_dashboard.html", "data_insights_explorer.html"],
                planning: ["demand_gap_dashboard.html", "growth_forecast_dashboard.html", "capacity_demand_dashboard.html"],
                visualization: ["deckgl_3d_analytics.html", "deckgl_animated_routes.html", "deckgl_density_heatmap.html"]
              }
            },
          };
          
          console.log('[list_dashboard_examples] Returning:', JSON.stringify(result).substring(0, 200));
          return result;
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to list dashboard examples',
          };
        }
      }
    },

    /**
     * Read dashboard example
     * Tool Name: read_dashboard_example
     * Description: Reads the complete HTML code of a specific example dashboard from the /apps directory. Use this to study existing dashboard implementations and learn patterns for creating similar dashboards. Provide the exact filename from the list_dashboard_examples tool.
     * Input Schema:
     * {
     *   "type": "object",
     *   "properties": {
     *     "filename": {
     *       "type": "string",
     *       "description": "The exact filename of the example dashboard (e.g., 'cx_dashboard.html')"
     *     }
     *   },
     *   "required": ["filename"]
     * }
     */
    read_dashboard_example: {
      tool: async (params: {
        filename: string;
      }): Promise<ToolResponse> => {
        try {
          if (!params.filename || typeof params.filename !== 'string') {
            return {
              success: false,
              error: 'filename is required and must be a string',
            };
          }

          // Validate filename to prevent directory traversal
          if (params.filename.includes('..') || params.filename.includes('/')) {
            return {
              success: false,
              error: 'Invalid filename. Use only the filename without path separators.',
            };
          }

          // Fetch the file from /apps directory
          const response = await fetch(`/apps/${params.filename}`);
          
          if (!response.ok) {
            return {
              success: false,
              error: `Failed to read example: ${response.status} ${response.statusText}. Make sure the filename is correct.`,
            };
          }

          const htmlCode = await response.text();

          const result = {
            success: true,
            message: `Successfully read example dashboard: ${params.filename}`,
            data: {
              filename: params.filename,
              htmlCode,
              codeLength: htmlCode.length,
              note: 'You can now analyze this code and use it as a reference for creating similar dashboards.'
            },
          };
          
          console.log('[read_dashboard_example] Returning for:', params.filename, 'Code length:', htmlCode.length);
          return result;
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to read dashboard example',
          };
        }
      }
    },
  };
};

export { EMPTY_DASHBOARD };
