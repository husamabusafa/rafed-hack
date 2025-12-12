import DeckGLMap from './DeckGLMap';
import type { MapConfig } from './types';

/**
 * Test page for DeckGLMap component with comprehensive examples
 * Tests multiple layer types with substantial data
 */
export default function TestPage() {

  const testConfig: MapConfig = {
    title: 'Schools & Students (ClickHouse)',
    description: 'Real data from ClickHouse rendered with DeckGL',
    mapStyle: '/martin/style-dark.json',
    initialViewState: {
      longitude: 46.7,
      latitude: 24.7,
      zoom: 10.5,
      pitch: 45,
      bearing: 0,
    },
    layers: [
      {
        id: 'schools',
        type: 'scatterplot',
        dataSource: {
          type: 'clickhouse',
          query: `
            SELECT
              toFloat64(lon) AS lon,
              toFloat64(lat) AS lat,
              school_nam AS name,
              capacity,
              gender,
              stage
            FROM schools
            WHERE lat IS NOT NULL AND lon IS NOT NULL
            LIMIT 3000
          `,
          maxRows: 3000,
        },
        mapping: {
          position: ['lon', 'lat'],
        },
        style: {
          radius: 80,
          radiusMinPixels: 2,
          radiusMaxPixels: 16,
          color: [34, 197, 94, 200],
          pickable: true,
        },
        tooltip: {
          enabled: true,
          fields: ['name', 'stage', 'gender', 'capacity'],
        },
      },
      {
        id: 'students',
        type: 'scatterplot',
        dataSource: {
          type: 'clickhouse',
          query: `
            SELECT
              toFloat64(lon) AS lon,
              toFloat64(lat) AS lat,
              gender,
              age,
              grade
            FROM students
            WHERE lat IS NOT NULL AND lon IS NOT NULL
              AND lat BETWEEN 24.0 AND 25.5
              AND lon BETWEEN 46.0 AND 47.5
            LIMIT 50000
          `,
          maxRows: 50000,
        },
        mapping: {
          position: ['lon', 'lat'],
        },
        style: {
          radius: 30,
          radiusMinPixels: 1,
          radiusMaxPixels: 8,
          color: [59, 130, 246, 160],
          pickable: true,
        },
        tooltip: {
          enabled: true,
          fields: ['gender', 'age', 'grade'],
        },
      },
    ],
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <DeckGLMap 
        config={testConfig} 
        onError={(err) => console.error('DeckGL Error:', err)} 
      />
    </div>
  );
}
