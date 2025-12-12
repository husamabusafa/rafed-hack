/**
 * Layer Factory
 * Creates DeckGL layers dynamically from configuration
 */

import type { Layer } from '@deck.gl/core';
import {
  ScatterplotLayer,
  ArcLayer,
  PathLayer,
  TextLayer,
  ColumnLayer,
  GeoJsonLayer,
} from '@deck.gl/layers';
import {
  HexagonLayer,
  HeatmapLayer,
  GridLayer,
  ScreenGridLayer,
} from '@deck.gl/aggregation-layers';
import { H3HexagonLayer, TripsLayer } from '@deck.gl/geo-layers';
import type { LayerConfig, LayerMapping } from '../types';

// Default color ranges for visualizations
const DEFAULT_COLOR_RANGE: [number, number, number][] = [
  [255, 255, 178],
  [254, 204, 92],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38],
];

const ORANGE_COLOR_RANGE: [number, number, number][] = [
  [254, 240, 217],
  [253, 204, 138],
  [252, 141, 89],
  [227, 74, 51],
  [179, 0, 0],
];

type PositionT = [number, number] | [number, number, number];
type ColorT = [number, number, number] | [number, number, number, number];

/**
 * Extract position from data item based on mapping
 */
function getPositionAccessor(mapping: LayerMapping) {
  return (d: Record<string, unknown>): PositionT => {
    if (!mapping.position) return [0, 0];
    
    if (typeof mapping.position === 'string') {
      // Field contains [lon, lat] array
      const pos = d[mapping.position];
      if (Array.isArray(pos) && pos.length >= 2) {
        const lon = Number(pos[0]) || 0;
        const lat = Number(pos[1]) || 0;
        // Optional altitude if present
        const z = pos.length > 2 ? Number(pos[2]) || 0 : undefined;
        return z !== undefined ? [lon, lat, z] : [lon, lat];
      }
      return [0, 0];
    } else {
      // Two separate fields [lonField, latField]
      const [lonField, latField] = mapping.position;
      const lon = Number(d[lonField]) || 0;
      const lat = Number(d[latField]) || 0;
      return [lon, lat];
    }
  };
}

/**
 * Extract start/end positions for Arc layers
 */
function getArcPositionAccessors(mapping: LayerMapping) {
  const getSourcePosition = (d: Record<string, unknown>): PositionT => {
    if (!mapping.startPosition) return [0, 0];
    
    if (typeof mapping.startPosition === 'string') {
      const pos = d[mapping.startPosition];
      if (Array.isArray(pos) && pos.length >= 2) {
        const lon = Number(pos[0]) || 0;
        const lat = Number(pos[1]) || 0;
        const z = pos.length > 2 ? Number(pos[2]) || 0 : undefined;
        return z !== undefined ? [lon, lat, z] : [lon, lat];
      }
      return [0, 0];
    } else {
      const [lonField, latField] = mapping.startPosition;
      return [Number(d[lonField]) || 0, Number(d[latField]) || 0];
    }
  };

  const getTargetPosition = (d: Record<string, unknown>): PositionT => {
    if (!mapping.endPosition) return [0, 0];
    
    if (typeof mapping.endPosition === 'string') {
      const pos = d[mapping.endPosition];
      if (Array.isArray(pos) && pos.length >= 2) {
        const lon = Number(pos[0]) || 0;
        const lat = Number(pos[1]) || 0;
        const z = pos.length > 2 ? Number(pos[2]) || 0 : undefined;
        return z !== undefined ? [lon, lat, z] : [lon, lat];
      }
      return [0, 0];
    } else {
      const [lonField, latField] = mapping.endPosition;
      return [Number(d[lonField]) || 0, Number(d[latField]) || 0];
    }
  };

  return { getSourcePosition, getTargetPosition };
}

/**
 * Extract path accessor for Path/Trips layers
 */
function getPathAccessor(mapping: LayerMapping) {
  return (d: Record<string, unknown>): PositionT[] => {
    if (!mapping.path) return [];
    const path = d[mapping.path];
    if (Array.isArray(path)) {
      // Normalize to [number, number] tuples
      return path
        .filter((p) => Array.isArray(p) && p.length >= 2)
        .map((p: unknown) => {
          const arr = p as number[];
          const lon = Number(arr[0]) || 0;
          const lat = Number(arr[1]) || 0;
          const z = arr.length > 2 ? Number(arr[2]) || 0 : undefined;
          return z !== undefined ? [lon, lat, z] : [lon, lat];
        });
    }
    return [];
  };
}

/**
 * Create dynamic color accessor from expression or field
 */
function getColorAccessor(mapping: LayerMapping, defaultColor: ColorT) {
  if (!mapping.color) {
    return () => defaultColor as ColorT;
  }

  return (d: Record<string, unknown>): ColorT => {
    const value = d[mapping.color as string];
    if (Array.isArray(value) && value.length >= 3) {
      const arr = value as number[];
      const r = Number(arr[0]) || 0;
      const g = Number(arr[1]) || 0;
      const b = Number(arr[2]) || 0;
      const a = arr.length > 3 ? Number(arr[3]) || 255 : undefined;
      return (a !== undefined ? [r, g, b, a] : [r, g, b]) as ColorT;
    }
    return defaultColor;
  };
}

/**
 * Create dynamic size/radius accessor from field
 */
function getSizeAccessor(mapping: LayerMapping, defaultSize: number) {
  if (!mapping.size) {
    return () => defaultSize;
  }

  return (d: Record<string, unknown>) => {
    const value = d[mapping.size as string];
    return typeof value === 'number' ? value : defaultSize;
  };
}

/**
 * Create layer from configuration
 */
export function createLayer(config: LayerConfig, data: unknown[]): Layer | null {
  const { id, type, mapping, style = {} } = config;
  const dataArray = data as Record<string, unknown>[];

  // Common properties
  const commonProps = {
    id,
    data: dataArray,
    pickable: style.pickable ?? true,
    opacity: style.opacity ?? 1,
    visible: style.visible ?? true,
  };

  try {
    switch (type) {
      case 'hexagon':
        return new HexagonLayer({
          ...commonProps,
          getPosition: getPositionAccessor(mapping) as any,
          radius: style.radius ?? 500,
          elevationScale: style.elevationScale ?? 100,
          elevationRange: style.elevationRange ?? [0, 3000],
          extruded: style.extruded ?? true,
          coverage: style.coverage ?? 0.9,
          colorRange: (style.colorRange || ORANGE_COLOR_RANGE) as [[number, number, number], [number, number, number], [number, number, number], [number, number, number], [number, number, number]],
        });

      case 'heatmap':
        return new HeatmapLayer({
          ...commonProps,
          getPosition: getPositionAccessor(mapping) as any,
          getWeight: mapping.weight 
            ? (d: Record<string, unknown>) => Number(d[mapping.weight as string]) || 1
            : () => 1,
          radiusPixels: style.radius ?? 30,
          intensity: 1,
          threshold: 0.03,
          colorRange: (style.colorRange || DEFAULT_COLOR_RANGE) as [[number, number, number], [number, number, number], [number, number, number], [number, number, number]],
        });

      case 'scatterplot':
        return new ScatterplotLayer({
          ...commonProps,
          getPosition: getPositionAccessor(mapping) as any,
          getFillColor: getColorAccessor(mapping, (style.color || [249, 115, 22, 180]) as ColorT) as any,
          getRadius: getSizeAccessor(mapping, style.radius ?? 50) as any,
          radiusMinPixels: style.radiusMinPixels ?? 2,
          radiusMaxPixels: style.radiusMaxPixels ?? 100,
        });

      case 'arc': {
        const { getSourcePosition, getTargetPosition } = getArcPositionAccessors(mapping);
        return new ArcLayer({
          ...commonProps,
          getSourcePosition: getSourcePosition as any,
          getTargetPosition: getTargetPosition as any,
          getSourceColor: (style.color || [249, 115, 22, 200]) as any,
          getTargetColor: (style.color || [249, 115, 22, 200]) as any,
          getWidth: (style.widthScale ?? 2) as any,
          widthMinPixels: style.widthMinPixels ?? 1,
          widthMaxPixels: style.widthMaxPixels ?? 10,
          greatCircle: style.greatCircle ?? false,
        });
      }

      case 'path':
        return new PathLayer({
          ...commonProps,
          getPath: getPathAccessor(mapping) as any,
          getColor: getColorAccessor(mapping, (style.color || [249, 115, 22, 200]) as ColorT) as any,
          getWidth: getSizeAccessor(mapping, style.widthScale ?? 5) as any,
          widthMinPixels: style.widthMinPixels ?? 1,
          widthMaxPixels: style.widthMaxPixels ?? 10,
          widthScale: 1,
          rounded: true,
          billboard: false,
        });

      case 'geojson':
        return new GeoJsonLayer({
          ...commonProps,
          data: dataArray as any,
          filled: true,
          stroked: true,
          getFillColor: (style.color || [249, 115, 22, 100]) as any,
          getLineColor: (style.color || [249, 115, 22, 255]) as any,
          getLineWidth: (style.widthScale ?? 1) as any,
          lineWidthMinPixels: style.widthMinPixels ?? 1,
        });

      case 'text':
        return new TextLayer({
          ...commonProps,
          getPosition: getPositionAccessor(mapping) as any,
          getText: mapping.text 
            ? (d: Record<string, unknown>) => String(d[mapping.text as string] || '')
            : () => '',
          getSize: (style.fontSize ?? 16) as any,
          getColor: (style.color || [255, 255, 255, 255]) as any,
          fontFamily: style.fontFamily || 'Arial, sans-serif',
          fontWeight: style.fontWeight || 'normal',
          getTextAnchor: 'middle',
          getAlignmentBaseline: 'center',
        });

      case 'grid':
        return new GridLayer({
          ...commonProps,
          getPosition: getPositionAccessor(mapping) as any,
          cellSize: style.radius ?? 500,
          elevationScale: style.elevationScale ?? 100,
          extruded: style.extruded ?? true,
          colorRange: (style.colorRange || ORANGE_COLOR_RANGE) as [[number, number, number], [number, number, number], [number, number, number], [number, number, number], [number, number, number], [number, number, number]],
        });

      case 'screen-grid':
        return new ScreenGridLayer({
          ...commonProps,
          getPosition: getPositionAccessor(mapping) as any,
          getWeight: mapping.weight 
            ? (d: Record<string, unknown>) => Number(d[mapping.weight as string]) || 1
            : () => 1,
          cellSizePixels: style.radius ?? 50,
          colorRange: (style.colorRange || ORANGE_COLOR_RANGE) as [[number, number, number], [number, number, number], [number, number, number], [number, number, number], [number, number, number], [number, number, number]],
        });

      case 'column':
        return new ColumnLayer({
          ...commonProps,
          getPosition: getPositionAccessor(mapping) as any,
          getElevation: mapping.elevation
            ? ((d: Record<string, unknown>) => Number(d[mapping.elevation as string]) || 0) as any
            : (() => 1000) as any,
          getFillColor: getColorAccessor(mapping, (style.color || [249, 115, 22, 200]) as ColorT) as any,
          radius: style.radius ?? 100,
          elevationScale: style.elevationScale ?? 1,
          extruded: true,
        });

      case 'h3-hexagon':
        return new H3HexagonLayer({
          ...commonProps,
          data: dataArray,
          getHexagon: (d: Record<string, unknown>) => d.hexagon as string,
          getFillColor: getColorAccessor(mapping, (style.color || [249, 115, 22, 200]) as ColorT) as any,
          getElevation: mapping.elevation
            ? ((d: Record<string, unknown>) => Number(d[mapping.elevation as string]) || 0) as any
            : (() => 0) as any,
          elevationScale: style.elevationScale ?? 1,
          extruded: style.extruded ?? true,
        });

      case 'trips':
        return new TripsLayer({
          ...commonProps,
          getPath: getPathAccessor(mapping) as any,
          getTimestamps: mapping.timestamp
            ? ((d: Record<string, unknown>) => {
                const timestamps = d[mapping.timestamp as string];
                return Array.isArray(timestamps) ? timestamps : [];
              }) as any
            : (() => []) as any,
          getColor: getColorAccessor(mapping, (style.color || [249, 115, 22, 200]) as ColorT) as any,
          widthMinPixels: style.widthMinPixels ?? 2,
          rounded: true,
          trailLength: style.trailLength ?? 120,
          currentTime: style.currentTime ?? 0,
        });

      default:
        console.warn(`[layerFactory] Unsupported layer type: ${type}`);
        return null;
    }
  } catch (error) {
    console.error(`[layerFactory] Error creating layer ${id}:`, error);
    return null;
  }
}

/**
 * Create multiple layers from configurations
 */
export function createLayers(
  configs: LayerConfig[],
  dataMap: Map<string, unknown[]>
): Layer[] {
  const layers: Layer[] = [];

  for (const config of configs) {
    const data = dataMap.get(config.id) || [];
    const layer = createLayer(config, data);
    if (layer) {
      layers.push(layer);
    }
  }

  return layers;
}
