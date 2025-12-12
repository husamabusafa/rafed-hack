/**
 * DeckGL Map Configuration Types
 * Supports dynamic layer creation from JSON configuration
 */

export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface DataSource {
  type: 'clickhouse' | 'static';
  query?: string;  // For ClickHouse
  data?: unknown[];    // For static data
  maxRows?: number;
  timeout?: number;
}

export interface LayerStyle {
  // Common properties
  opacity?: number;
  visible?: boolean;
  pickable?: boolean;
  
  // Color properties
  color?: [number, number, number, number?];
  colorRange?: [number, number, number][];
  colorDomain?: [number, number];
  
  // Size properties
  radius?: number;
  radiusMinPixels?: number;
  radiusMaxPixels?: number;
  
  // Hexagon/Heatmap specific
  elevationScale?: number;
  elevationRange?: [number, number];
  coverage?: number;
  extruded?: boolean;
  
  // Path/Line specific
  widthMinPixels?: number;
  widthMaxPixels?: number;
  widthScale?: number;
  
  // Text specific
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  
  // Arc specific
  greatCircle?: boolean;
  
  // Animation (TripsLayer)
  trailLength?: number;
  currentTime?: number;
  
  // Custom color/size functions (as string expressions)
  getColorExpression?: string;
  getSizeExpression?: string;
}

export interface LayerMapping {
  // Field mappings for different layer types
  position?: string | [string, string];  // Single field with [lon,lat] or two fields
  startPosition?: string | [string, string];
  endPosition?: string | [string, string];
  path?: string;
  text?: string;
  size?: string;
  color?: string;
  elevation?: string;
  weight?: string;
  timestamp?: string;
}

export interface LayerConfig {
  id: string;
  type: 'hexagon' | 'heatmap' | 'scatterplot' | 'arc' | 'path' | 'geojson' | 'icon' | 'text' | 'grid' | 'screen-grid' | 'h3-hexagon' | 'trips' | 'column';
  dataSource: DataSource;
  mapping: LayerMapping;
  style?: LayerStyle;
  tooltip?: {
    enabled: boolean;
    template?: string;  // Template with {fieldName} placeholders
    fields?: string[];   // Fields to show in tooltip
  };
}

export interface MapConfig {
  title?: string;
  description?: string;
  mapStyle?: string;  // MapLibre style URL
  initialViewState: ViewState;
  layers: LayerConfig[];
  controls?: {
    showNavigation?: boolean;
    showFullscreen?: boolean;
    showGeolocate?: boolean;
  };
}

export interface TooltipInfo {
  object?: unknown;
  x?: number;
  y?: number;
  layer?: unknown;
}
