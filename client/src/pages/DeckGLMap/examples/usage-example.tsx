/**
 * Usage Examples for Dynamic DeckGL Map
 * 
 * This file shows different ways to use the DeckGLMap component
 */

import { useState, useEffect } from 'react';
import DeckGLMap from '../DeckGLMap';
import type { MapConfig } from '../types';

// Example 1: Load configuration from JSON file
export function Example1_LoadFromFile() {
  const [config, setConfig] = useState<MapConfig | null>(null);

  useEffect(() => {
    fetch('/src/pages/DeckGLMap/examples/hexagon-density.json')
      .then(res => res.json())
      .then(data => setConfig(data as MapConfig))
      .catch(err => console.error('Failed to load config:', err));
  }, []);

  if (!config) return <div>Loading configuration...</div>;

  return <DeckGLMap config={config} onError={(err) => console.error(err)} />;
}

// Example 2: Inline configuration
export function Example2_InlineConfig() {
  const config: MapConfig = {
    title: 'Student Locations',
    description: 'Live data from ClickHouse',
    initialViewState: {
      longitude: 46.7,
      latitude: 24.7,
      zoom: 11,
      pitch: 0,
      bearing: 0,
    },
    layers: [
      {
        id: 'students',
        type: 'scatterplot',
        dataSource: {
          type: 'clickhouse',
          query: `
            SELECT 
              toFloat64(lat) as lat, 
              toFloat64(lon) as lon,
              student_name,
              bus_elig
            FROM students 
            WHERE lat IS NOT NULL AND lon IS NOT NULL
            LIMIT 10000
          `,
          maxRows: 10000,
        },
        mapping: {
          position: ['lon', 'lat'],
        },
        style: {
          radius: 50,
          radiusMinPixels: 2,
          radiusMaxPixels: 10,
          color: [249, 115, 22, 180],
          pickable: true,
        },
        tooltip: {
          enabled: true,
          fields: ['student_name', 'bus_elig'],
        },
      },
    ],
  };

  return <DeckGLMap config={config} />;
}

// Example 3: Dynamic configuration with user controls
export function Example3_DynamicConfig() {
  const [layerType, setLayerType] = useState<'hexagon' | 'heatmap' | 'scatterplot'>('hexagon');
  const [maxRows, setMaxRows] = useState(50000);

  const config: MapConfig = {
    title: `Student Density - ${layerType}`,
    initialViewState: {
      longitude: 46.7,
      latitude: 24.7,
      zoom: 10,
      pitch: layerType === 'hexagon' ? 50 : 0,
      bearing: 0,
    },
    layers: [
      {
        id: 'students-layer',
        type: layerType,
        dataSource: {
          type: 'clickhouse',
          query: `SELECT toFloat64(lat) as lat, toFloat64(lon) as lon FROM students WHERE lat IS NOT NULL LIMIT ${maxRows}`,
          maxRows,
        },
        mapping: {
          position: ['lon', 'lat'],
        },
        style:
          layerType === 'hexagon'
            ? {
                radius: 500,
                elevationScale: 100,
                extruded: true,
              }
            : layerType === 'heatmap'
            ? {
                radius: 30,
              }
            : {
                radius: 50,
                radiusMinPixels: 2,
                color: [249, 115, 22, 180],
              },
      },
    ],
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Controls */}
      <div className="bg-slate-800 p-4 flex gap-4 items-center">
        <label className="text-white">
          Layer Type:
          <select
            value={layerType}
            onChange={(e) => setLayerType(e.target.value as typeof layerType)}
            className="ml-2 bg-slate-700 text-white px-3 py-1 rounded"
          >
            <option value="hexagon">Hexagon</option>
            <option value="heatmap">Heatmap</option>
            <option value="scatterplot">Scatterplot</option>
          </select>
        </label>

        <label className="text-white">
          Max Rows:
          <input
            type="number"
            value={maxRows}
            onChange={(e) => setMaxRows(Number(e.target.value))}
            className="ml-2 bg-slate-700 text-white px-3 py-1 rounded w-24"
            step={1000}
            min={1000}
            max={100000}
          />
        </label>
      </div>

      {/* Map */}
      <div className="flex-1">
        <DeckGLMap config={config} />
      </div>
    </div>
  );
}

// Example 4: Multi-layer with different data sources
export function Example4_MultiLayer() {
  const config: MapConfig = {
    title: 'Students & Schools',
    description: 'Combined visualization',
    initialViewState: {
      longitude: 46.7,
      latitude: 24.7,
      zoom: 10,
    },
    layers: [
      // Layer 1: Student heatmap
      {
        id: 'student-heatmap',
        type: 'heatmap',
        dataSource: {
          type: 'clickhouse',
          query: 'SELECT toFloat64(lat) as lat, toFloat64(lon) as lon FROM students WHERE lat IS NOT NULL LIMIT 30000',
        },
        mapping: {
          position: ['lon', 'lat'],
        },
        style: {
          radius: 30,
          opacity: 0.6,
        },
      },
      // Layer 2: Schools
      {
        id: 'schools',
        type: 'scatterplot',
        dataSource: {
          type: 'clickhouse',
          query: 'SELECT toFloat64(latitude) as lat, toFloat64(longitude) as lon, name FROM schools WHERE latitude IS NOT NULL',
        },
        mapping: {
          position: ['lon', 'lat'],
        },
        style: {
          radius: 150,
          radiusMinPixels: 8,
          color: [34, 197, 94, 220],
          pickable: true,
        },
        tooltip: {
          enabled: true,
          fields: ['name'],
        },
      },
    ],
  };

  return <DeckGLMap config={config} />;
}

// Example 5: Static data (no ClickHouse)
export function Example5_StaticData() {
  const config: MapConfig = {
    title: 'Static Markers',
    initialViewState: {
      longitude: 46.7,
      latitude: 24.7,
      zoom: 12,
    },
    layers: [
      {
        id: 'markers',
        type: 'scatterplot',
        dataSource: {
          type: 'static',
          data: [
            { lat: 24.7, lon: 46.7, name: 'Location 1' },
            { lat: 24.71, lon: 46.71, name: 'Location 2' },
            { lat: 24.69, lon: 46.69, name: 'Location 3' },
          ],
        },
        mapping: {
          position: ['lon', 'lat'],
        },
        style: {
          radius: 100,
          color: [249, 115, 22, 220],
          pickable: true,
        },
        tooltip: {
          enabled: true,
          fields: ['name'],
        },
      },
    ],
  };

  return <DeckGLMap config={config} />;
}
