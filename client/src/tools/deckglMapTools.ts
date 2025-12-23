import type { MapConfig } from '../pages/DeckGLMap/types';
import { queryClickHouse } from '../pages/DashboardPage/utils/queryClickHouse';

type SetState<T> = (updater: T | ((prev: T) => T)) => void;

export type ToolResponse = {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
};

const asRecord = (v: unknown): Record<string, unknown> => {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
};

const isRecord = (v: unknown): v is Record<string, unknown> => {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
};

const stripTrailingSemicolon = (sql: string) => sql.replace(/;\s*$/, '').trim();

const toMsTimeout = (timeout?: number) => {
  if (typeof timeout !== 'number' || !Number.isFinite(timeout) || timeout <= 0) return undefined;
  if (timeout < 1000) return Math.floor(timeout * 1000);
  return Math.floor(timeout);
};

type LayerValidation = {
  id: string;
  ok: boolean;
  rowCount: number;
  durationMs?: number;
  error?: string;
  sampleRow?: unknown;
  bounds?: { minLon: number; minLat: number; maxLon: number; maxLat: number };
};

const getLonLatFromRow = (row: Record<string, unknown>, mapping: unknown): { lon?: number; lat?: number } => {
  if (!isRecord(mapping)) return {};
  const pos = mapping.position;
  if (typeof pos === 'string') {
    const v = row[pos];
    if (Array.isArray(v) && v.length >= 2) {
      const lon = Number(v[0]);
      const lat = Number(v[1]);
      return {
        lon: Number.isFinite(lon) ? lon : undefined,
        lat: Number.isFinite(lat) ? lat : undefined,
      };
    }
    return {};
  }
  if (Array.isArray(pos) && pos.length >= 2) {
    const lon = Number(row[String(pos[0])] ?? NaN);
    const lat = Number(row[String(pos[1])] ?? NaN);
    return {
      lon: Number.isFinite(lon) ? lon : undefined,
      lat: Number.isFinite(lat) ? lat : undefined,
    };
  }
  return {};
};

const validateLayerClickhouse = async (layer: Record<string, unknown>): Promise<LayerValidation> => {
  const id = typeof layer.id === 'string' ? layer.id : 'unknown';
  const dataSource = isRecord(layer.dataSource) ? layer.dataSource : undefined;
  const mapping = layer.mapping;

  const query = dataSource && typeof dataSource.query === 'string' ? dataSource.query : undefined;
  if (!query) {
    return { id, ok: false, rowCount: 0, error: 'Missing ClickHouse query' };
  }

  const timeoutMs = toMsTimeout(typeof dataSource.timeout === 'number' ? dataSource.timeout : undefined);
  const wrapped = `SELECT * FROM (${stripTrailingSemicolon(query)}) LIMIT 5`;
  const result = await queryClickHouse(wrapped, { timeout: timeoutMs });

  const sampleRow = result.data?.[0];
  let bounds: LayerValidation['bounds'] | undefined;
  if (sampleRow && typeof sampleRow === 'object' && !Array.isArray(sampleRow)) {
    const rows = result.data as Record<string, unknown>[];
    let minLon = Infinity;
    let maxLon = -Infinity;
    let minLat = Infinity;
    let maxLat = -Infinity;
    let any = false;
    for (const r of rows) {
      const { lon, lat } = getLonLatFromRow(r, mapping);
      if (typeof lon === 'number' && typeof lat === 'number') {
        any = true;
        minLon = Math.min(minLon, lon);
        maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
      }
    }
    if (any) bounds = { minLon, minLat, maxLon, maxLat };
  }

  return {
    id,
    ok: result.success,
    rowCount: result.rowCount,
    durationMs: result.meta?.durationMs,
    error: result.success ? undefined : result.error,
    sampleRow,
    bounds,
  };
};

function safeParseJSON(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function deepMerge(target: unknown, patch: unknown): unknown {
  if (!isRecord(target) || !isRecord(patch)) return patch;

  const out: Record<string, unknown> = { ...target };
  for (const [k, v] of Object.entries(patch)) {
    const cur = out[k];
    if (isRecord(cur) && isRecord(v)) {
      out[k] = deepMerge(cur, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function navigateToPath(obj: unknown, path: string): {
  parent: unknown;
  key: string | number;
  exists: boolean;
  value?: unknown;
} {
  if (!path || path === '$' || path === '') {
    return { parent: null, key: '', exists: true, value: obj };
  }

  const cleanPath = path.startsWith('$.') ? path.slice(2) : path.startsWith('$') ? path.slice(1) : path;
  if (!cleanPath) {
    return { parent: null, key: '', exists: true, value: obj };
  }

  const parts = cleanPath.split(/\.|\[|\]/).filter((p) => p !== '');

  let current: unknown = obj;
  let parent: unknown = null;
  let key: string | number = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    parent = current;

    const arrayIndex = Number.isInteger(Number(part)) ? Number(part) : NaN;

    if (!Number.isNaN(arrayIndex) && Array.isArray(current)) {
      key = arrayIndex;
      const exists = arrayIndex >= 0 && arrayIndex < current.length;
      const value = exists ? current[arrayIndex] : undefined;
      if (i === parts.length - 1) {
        return { parent, key, exists, value };
      }
      current = value;
    } else if (isRecord(current)) {
      key = part;
      const exists = Object.prototype.hasOwnProperty.call(current, key);
      const value = exists ? current[key] : undefined;
      if (i === parts.length - 1) {
        return { parent, key, exists, value };
      }
      current = value;
    } else {
      return { parent, key, exists: false };
    }

    if (current == null && i < parts.length - 1) {
      return { parent, key, exists: false };
    }
  }

  return { parent, key, exists: false };
}

function setValueAtPath(obj: unknown, path: string, value: unknown): unknown {
  if (!path || path === '$' || path === '') {
    return value;
  }

  const result = JSON.parse(JSON.stringify(obj)) as unknown;
  const { parent, key } = navigateToPath(result, path);

  if (parent === null) {
    return value;
  }

  if (Array.isArray(parent) && typeof key === 'number') {
    parent[key] = value;
    return result;
  }

  if (isRecord(parent) && typeof key === 'string') {
    parent[key] = value;
    return result;
  }

  return result;
}

export const createDeckGLMapTools = (getMapConfig: () => MapConfig, setMapConfig: SetState<MapConfig>) => {
  return {
    set_map_config: async (input: unknown): Promise<ToolResponse> => {
      try {
        const parsed = safeParseJSON(input);
        const params = asRecord(parsed);
        const configRaw = params.config ?? parsed;
        const validate = Boolean(params.validate || params.debug || params.validateQueries);

        if (!configRaw || typeof configRaw !== 'object') {
          return { success: false, error: 'config must be an object' };
        }

        const config = configRaw as MapConfig;
        if (!config.initialViewState || typeof config.initialViewState !== 'object') {
          return { success: false, error: 'config.initialViewState is required' };
        }
        if (!Array.isArray(config.layers)) {
          return { success: false, error: 'config.layers must be an array' };
        }

        const warnings: string[] = [];
        const validations: LayerValidation[] = [];

        config.layers.forEach((layer: any) => {
          const layerId = typeof layer?.id === 'string' ? layer.id : 'unknown';
          const style = layer?.style;
          if (style && typeof style === 'object') {
            if ('getFillColor' in style && !('color' in style)) {
              warnings.push(
                `Layer "${layerId}": style.getFillColor is not used by this renderer. Use style.color instead (RGBA array).`
              );
            }
            if ('getRadius' in style && !('radius' in style)) {
              warnings.push(
                `Layer "${layerId}": style.getRadius is not used by this renderer. Use style.radius instead (number).`
              );
            }
            if ('getLineColor' in style) {
              warnings.push(
                `Layer "${layerId}": style.getLineColor is not used by this renderer (ignored).`
              );
            }
          }

          const ds = layer?.dataSource;
          if (ds && typeof ds === 'object' && typeof ds.timeout === 'number' && ds.timeout > 0 && ds.timeout < 1000) {
            warnings.push(
              `Layer "${layerId}": dataSource.timeout looks like seconds (${ds.timeout}). This code expects milliseconds. Use e.g. 60000 for 60s.`
            );
          }
        });

        if (validate) {
          for (const layer of config.layers as any[]) {
            const dataSource = layer?.dataSource;
            if (dataSource?.type === 'clickhouse') {
              const v = await validateLayerClickhouse(layer as Record<string, unknown>);
              validations.push(v);
            }
          }
        }

        setMapConfig(config);

        return {
          success: true,
          message: `Map config set (${config.layers.length} layer(s))`,
          data: {
            applied: true,
            layersCount: config.layers.length,
            title: config.title,
            warnings,
            validation: validate
              ? {
                  ok: validations.every((v) => v.ok && v.rowCount > 0),
                  layers: validations,
                }
              : undefined,
          },
        };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to set map config' };
      }
    },

    update_map_config: async (input: unknown): Promise<ToolResponse> => {
      try {
        const parsed = safeParseJSON(input);
        const params = asRecord(parsed);
        const operation = typeof params.operation === 'string' ? params.operation : 'merge';
        const path = typeof params.path === 'string' ? params.path : undefined;

        const current = getMapConfig();

        if (path) {
          const next = setValueAtPath(current, path, params.value) as MapConfig;
          setMapConfig(next);
          return {
            success: true,
            message: `Updated map config at path ${path}`,
            data: { path, operation: 'set' },
          };
        }

        const patch = params.patch ?? params.updates ?? params.configPatch;
        if (!patch || typeof patch !== 'object') {
          return { success: false, error: 'Provide either {path,value} or {patch} object' };
        }

        const next = operation === 'set' ? (patch as MapConfig) : (deepMerge(current, patch) as MapConfig);
        setMapConfig(next);

        return {
          success: true,
          message: 'Map config updated',
          data: { operation, updated: true },
        };
      } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update map config' };
      }
    },

    read_map_config: async (): Promise<ToolResponse> => {
      const current = getMapConfig();
      return {
        success: true,
        message: 'Map config retrieved',
        data: { config: current },
      };
    },
  };
};
