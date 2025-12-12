import { useState, useEffect, useRef, useCallback } from 'react';
import { DeckGL } from '@deck.gl/react';
import MapGL from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Icon } from '@iconify/react';
import type { MapConfig, TooltipInfo } from './types';
import { fetchData } from './utils/dataFetcher';
import { createLayer } from './utils/layerFactory';

interface DeckGLMapProps {
  config?: MapConfig;
  onError?: (error: string) => void;
}

const DEFAULT_VIEW_STATE = {
  longitude: 46.7,
  latitude: 24.7,
  zoom: 10,
  pitch: 50,
  bearing: 0,
};

export default function DeckGLMap({ config, onError }: DeckGLMapProps) {
  const [viewState, setViewState] = useState(config?.initialViewState || DEFAULT_VIEW_STATE);
  const [layers, setLayers] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ totalLayers: 0, totalDataPoints: 0 });
  const dataMapRef = useRef<Map<string, unknown[]>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Load data and create layers
  const loadLayers = useCallback(async () => {
    if (!config || !config.layers || config.layers.length === 0) {
      setError('No layer configuration provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch data for all layers
      const layerConfigs = config.layers;
      const dataResults = await Promise.all(
        layerConfigs.map((layerConfig) => fetchData(layerConfig.dataSource))
      );

      // Build data map
      const newDataMap = new Map<string, unknown[]>();
      let totalPoints = 0;

      layerConfigs.forEach((layerConfig, index) => {
        const result = dataResults[index];
        if (result.success) {
          newDataMap.set(layerConfig.id, result.data);
          totalPoints += result.data.length;
          console.log(`[DeckGLMap] Loaded ${result.data.length} points for layer: ${layerConfig.id}`);
        } else {
          console.error(`[DeckGLMap] Failed to load data for layer ${layerConfig.id}:`, result.error);
        }
      });

      dataMapRef.current = newDataMap;

      // Create layers
      const newLayers = layerConfigs
        .map((layerConfig) => {
          const data = newDataMap.get(layerConfig.id) || [];
          return createLayer(layerConfig, data);
        })
        .filter((layer) => layer !== null);

      setLayers(newLayers);
      setStats({
        totalLayers: newLayers.length,
        totalDataPoints: totalPoints,
      });
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[DeckGLMap] Error loading layers:', err);
      setError(errorMessage);
      onError?.(errorMessage);
      setLoading(false);
    }
  }, [config, onError]);

  // Load layers on mount and config change
  useEffect(() => {
    loadLayers();
  }, [loadLayers]);

  // Tooltip handler
  const getTooltip = useCallback(
    ({ object, layer }: TooltipInfo) => {
      if (!object || !layer) return null;

      // Find layer config
      const layerConfig = config?.layers.find((l) => l.id === (layer as { id?: string }).id);
      if (!layerConfig?.tooltip?.enabled) return null;

      const obj = object as Record<string, unknown>;

      // Generate tooltip content
      let html = '';
      if (layerConfig.tooltip.template) {
        // Use template
        html = layerConfig.tooltip.template.replace(/\{(\w+)\}/g, (_, key) => {
          return String(obj[key] ?? '');
        });
      } else if (layerConfig.tooltip.fields) {
        // Use fields list
        html = layerConfig.tooltip.fields
          .map((field) => `<div><strong>${field}:</strong> ${obj[field] ?? 'N/A'}</div>`)
          .join('');
      } else {
        // Default: show all fields
        html = Object.entries(obj)
          .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
          .join('');
      }

      return {
        html,
        style: {
          backgroundColor: '#1e293b',
          border: '1px solid #475569',
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '12px',
          color: '#f1f5f9',
          maxWidth: '300px',
        },
      };
    },
    [config]
  );

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Icon icon="solar:map-bold" className="text-xl text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {config?.title || 'Dynamic DeckGL Map'}
              </h1>
              <p className="text-xs text-slate-400">
                {config?.description || 'Configurable map visualization'}
              </p>
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <div className="bg-slate-700 px-3 py-2 rounded">
              <span className="text-slate-400">Layers:</span>{' '}
              <span className="text-white font-semibold">{stats.totalLayers}</span>
            </div>
            <div className="bg-slate-700 px-3 py-2 rounded">
              <span className="text-slate-400">Data Points:</span>{' '}
              <span className="text-white font-semibold">{stats.totalDataPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden bg-slate-900" ref={containerRef}>
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 flex items-center justify-center">
            <div className="text-center">
              <Icon
                icon="solar:spinner-bold"
                className="text-5xl text-orange-500 animate-spin mx-auto"
              />
              <p className="text-slate-400 mt-4">Loading map data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-50 bg-slate-900/95 flex items-center justify-center">
            <div className="text-center max-w-md">
              <Icon
                icon="solar:danger-triangle-bold"
                className="text-5xl text-red-500 mx-auto"
              />
              <p className="text-red-400 mt-4 font-semibold">Failed to load map</p>
              <p className="text-slate-400 text-sm mt-2">{error}</p>
              <button
                onClick={loadLayers}
                className="mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && layers.length > 0 && (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)',
                zIndex: 0,
              }}
            />
            
            {/* DeckGL Canvas */}
            <DeckGL
              viewState={viewState}
              onViewStateChange={({ viewState: newViewState }) => setViewState(newViewState as typeof viewState)}
              controller={true}
              layers={layers as []}
              getTooltip={getTooltip as never}
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                width: '100%',
                height: '100%',
              }}
            >
              <MapGL
                reuseMaps
                mapLib={maplibregl}
                mapStyle={config?.mapStyle ?? '/martin/style-dark.json'}
                style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0' }}
              />
            </DeckGL>
          </div>
        )}
        
        {!loading && !error && layers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Icon icon="mdi:map-marker-off" className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No data to display</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
