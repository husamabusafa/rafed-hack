import type { ReactNode } from 'react';
import { CreateComponentUI, FetchComponentDataUI, GenerateChartTemplateUI, GenerateTableTemplateUI, GetDashboardUI, GetGridInfoUI, QueryPostgresSchemaUI, RefreshAllComponentsUI, RemoveComponentUI, SetGraphQLEndpointUI, SetGridLayoutUI, SetPostgresSchemaUI, UpdateComponentUI, UiToolUI } from './HsafaUI';
import type { ToolUIProps } from './HsafaUITypes';

export const HsafaUI: Record<string, (props: ToolUIProps) => ReactNode> = {
  ui: UiToolUI,
  set_grid_layout: SetGridLayoutUI,
  create_component: CreateComponentUI,
  update_component: UpdateComponentUI,
  remove_component: RemoveComponentUI,
  fetch_component_data: FetchComponentDataUI,
  refresh_all_components: RefreshAllComponentsUI,
  get_grid_info: GetGridInfoUI,
  get_dashboard: GetDashboardUI,
  set_postgres_schema: SetPostgresSchemaUI,
  query_postgres_schema: QueryPostgresSchemaUI,
  set_graphql_endpoint: SetGraphQLEndpointUI,
  generate_chart_template: GenerateChartTemplateUI,
  generate_table_template: GenerateTableTemplateUI,
};
