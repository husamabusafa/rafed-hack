# Dynamic DeckGL Map Component

A generic, configuration-driven DeckGL map component that can build any type of DeckGL visualization by reading JSON configurations and fetching data directly from ClickHouse.

## Features

- 🗺️ **Multiple Layer Types**: Supports 13+ layer types including hexagon, heatmap, scatterplot, path, arc, and more
- 📊 **ClickHouse Integration**: Direct data fetching from ClickHouse with optimized queries
- ⚙️ **JSON Configuration**: Fully configurable via JSON - no code changes needed
- 🎨 **Customizable Styling**: Control colors, sizes, elevations, and visual properties
- 💬 **Interactive Tooltips**: Configurable tooltips with templates or field lists
- 🔄 **Multi-Layer Support**: Combine multiple layers from different data sources
- 🎯 **Type-Safe**: Full TypeScript support with comprehensive type definitions

## Supported Layer Types

| Layer Type | Description | Use Case |
|------------|-------------|----------|
| `hexagon` | 3D hexagonal aggregation | Density visualization, heatmaps |
| `heatmap` | 2D gradient heatmap | Heat distribution, density |
| `scatterplot` | Point scatter visualization | Locations, markers |
| `arc` | Curved lines between points | Flow, connections, routes |
| `path` | Line paths | Routes, trajectories |
| `geojson` | GeoJSON geometries | Polygons, boundaries |
| `grid` | Square grid aggregation | Grid-based density |
| `screen-grid` | Screen-space grid | Performance-optimized density |
| `column` | 3D columns/bars | Vertical bar charts on map |
| `text` | Text labels | Labels, annotations |
| `h3-hexagon` | H3 hexagon cells | Uber H3 spatial index |
| `trips` | Animated paths | Animated routes, trips |

## Usage

### Basic Example

```typescript
import DeckGLMap from './pages/DeckGLMap/DeckGLMap';
import config from './pages/DeckGLMap/examples/hexagon-density.json';

function App() {
  return <DeckGLMap config={config} />;
}
```

### Loading Configuration from JSON

```typescript
import { useState, useEffect } from 'react';
import DeckGLMap from './pages/DeckGLMap/DeckGLMap';
import type { MapConfig } from './pages/DeckGLMap/types';

function DynamicMap() {
  const [config, setConfig] = useState<MapConfig | null>(null);

  useEffect(() => {
    // Load from file
    fetch('/path/to/config.json')
      .then(res => res.json())
      .then(setConfig);
  }, []);

  if (!config) return <div>Loading...</div>;
  
  return <DeckGLMap config={config} onError={(err) => console.error(err)} />;
}
```

## Configuration Format

### MapConfig Structure

```typescript
{
  "title": "Map Title",
  "description": "Map description",
  "mapStyle": "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  "initialViewState": {
    "longitude": 46.7,
    "latitude": 24.7,
    "zoom": 10,
    "pitch": 50,
    "bearing": 0
  },
  "layers": [
    // Layer configurations...
  ]
}
```

### Layer Configuration

```typescript
{
  "id": "unique-layer-id",
  "type": "hexagon",
  "dataSource": {
    "type": "clickhouse",
    "query": "SELECT lat, lon FROM table WHERE condition",
    "maxRows": 50000
  },
  "mapping": {
    "position": ["lon", "lat"]  // Maps data fields to layer properties
  },
  "style": {
    "radius": 500,
    "elevationScale": 100,
    "color": [249, 115, 22, 180]
  },
  "tooltip": {
    "enabled": true,
    "fields": ["field1", "field2"]
  }
}
```

## Data Source Types

### ClickHouse

```json
{
  "type": "clickhouse",
  "query": "SELECT toFloat64(lat) as lat, toFloat64(lon) as lon, name FROM students LIMIT 10000",
  "maxRows": 10000,
  "timeout": 30000
}
```

**Important**: Always cast numeric fields to Float64 in ClickHouse queries for proper rendering:
```sql
SELECT toFloat64(lat) as lat, toFloat64(lon) as lon, ...
```

### Static Data

```json
{
  "type": "static",
  "data": [
    { "lat": 24.7, "lon": 46.7, "value": 100 },
    { "lat": 24.8, "lon": 46.8, "value": 200 }
  ]
}
```

## Field Mapping

The `mapping` object tells the layer how to extract data from your query results:

### Position Mapping

**Separate fields:**
```json
{
  "position": ["lon", "lat"]
}
```

**Single field with array:**
```json
{
  "position": "coordinates"  // Data: { coordinates: [lon, lat] }
}
```

### Arc Layer (Start/End Points)

```json
{
  "startPosition": ["origin_lon", "origin_lat"],
  "endPosition": ["dest_lon", "dest_lat"]
}
```

### Path Layer

```json
{
  "path": "route_coordinates"  // Data: { route_coordinates: [[lon1, lat1], [lon2, lat2], ...] }
}
```

### Other Mappings

```json
{
  "position": ["lon", "lat"],
  "text": "label_field",
  "size": "radius_field",
  "color": "color_field",
  "elevation": "height_field",
  "weight": "weight_field"
}
```

## Styling Options

### Common Properties

```json
{
  "opacity": 0.8,
  "visible": true,
  "pickable": true,
  "color": [249, 115, 22, 180]  // [R, G, B, A]
}
```

### Size Properties

```json
{
  "radius": 500,
  "radiusMinPixels": 2,
  "radiusMaxPixels": 100,
  "widthScale": 5,
  "widthMinPixels": 1,
  "widthMaxPixels": 10
}
```

### 3D Properties

```json
{
  "elevationScale": 100,
  "elevationRange": [0, 3000],
  "extruded": true,
  "coverage": 0.9
}
```

### Color Ranges (for aggregation layers)

```json
{
  "colorRange": [
    [254, 240, 217],
    [253, 204, 138],
    [252, 141, 89],
    [227, 74, 51],
    [179, 0, 0]
  ]
}
```

## Tooltip Configuration

### Template-based

```json
{
  "tooltip": {
    "enabled": true,
    "template": "<div><strong>Name:</strong> {student_name}</div><div>Bus Eligible: {bus_elig}</div>"
  }
}
```

### Field list

```json
{
  "tooltip": {
    "enabled": true,
    "fields": ["student_name", "school_name", "bus_elig"]
  }
}
```

## Example Configurations

### 1. Hexagon Density Map

```json
{
  "title": "Student Density",
  "initialViewState": {
    "longitude": 46.7,
    "latitude": 24.7,
    "zoom": 10,
    "pitch": 50
  },
  "layers": [{
    "id": "density",
    "type": "hexagon",
    "dataSource": {
      "type": "clickhouse",
      "query": "SELECT toFloat64(lat) as lat, toFloat64(lon) as lon FROM students WHERE lat IS NOT NULL LIMIT 50000"
    },
    "mapping": {
      "position": ["lon", "lat"]
    },
    "style": {
      "radius": 500,
      "elevationScale": 100,
      "extruded": true
    }
  }]
}
```

### 2. Multi-Layer Visualization

```json
{
  "layers": [
    {
      "id": "heatmap",
      "type": "heatmap",
      "dataSource": { "type": "clickhouse", "query": "SELECT ..." },
      "mapping": { "position": ["lon", "lat"] }
    },
    {
      "id": "schools",
      "type": "scatterplot",
      "dataSource": { "type": "clickhouse", "query": "SELECT ..." },
      "mapping": { "position": ["lon", "lat"] },
      "style": {
        "color": [34, 197, 94, 220],
        "radius": 100
      }
    }
  ]
}
```

## API Reference

### DeckGLMap Props

```typescript
interface DeckGLMapProps {
  config?: MapConfig;           // Map configuration object
  onError?: (error: string) => void;  // Error callback
}
```

### MapConfig

```typescript
interface MapConfig {
  title?: string;
  description?: string;
  mapStyle?: string;
  initialViewState: ViewState;
  layers: LayerConfig[];
}
```

## Common Queries

### Students by Location
```sql
SELECT 
  toFloat64(lat) as lat, 
  toFloat64(lon) as lon, 
  student_name,
  bus_elig
FROM students 
WHERE lat IS NOT NULL AND lon IS NOT NULL 
LIMIT 50000
```

### Bus Routes
```sql
SELECT 
  route_id,
  route_name,
  path  -- Array of [lon, lat] coordinates
FROM routes 
WHERE path IS NOT NULL
```

### Schools
```sql
SELECT 
  toFloat64(latitude) as lat,
  toFloat64(longitude) as lon,
  name,
  type
FROM schools
WHERE latitude IS NOT NULL
```

## Performance Tips

1. **Limit Data**: Use `LIMIT` in queries and `maxRows` in data source config
2. **Filter Early**: Apply WHERE clauses in SQL, not in JavaScript
3. **Use Aggregation**: Use hexagon/grid layers for large datasets instead of scatterplot
4. **Cast Numbers**: Always use `toFloat64()` for lat/lon in ClickHouse
5. **Optimize Queries**: Add indexes on commonly queried columns

## Troubleshooting

### Map doesn't render
- Check browser console for errors
- Verify ClickHouse connection (check `.env` file)
- Ensure data query returns valid lat/lon values

### No data showing
- Verify query returns data (test in ClickHouse directly)
- Check that field names in `mapping` match query column names
- Ensure lat/lon are cast to Float64

### Performance issues
- Reduce `maxRows` in data source
- Use aggregation layers (hexagon, grid) instead of scatterplot
- Simplify queries and add database indexes

## File Structure

```
src/pages/DeckGLMap/
├── DeckGLMap.tsx           # Main component
├── types.ts                # TypeScript type definitions
├── utils/
│   ├── dataFetcher.ts      # Data fetching from ClickHouse
│   └── layerFactory.ts     # Dynamic layer creation
├── examples/
│   ├── hexagon-density.json
│   ├── scatterplot-simple.json
│   ├── routes-paths.json
│   └── multi-layer.json
└── README.md               # This file
```

## Next Steps

1. Load one of the example configurations
2. Modify the ClickHouse query to match your data
3. Adjust field mappings to your column names
4. Customize styling and tooltips
5. Save as a new JSON configuration file

## License

Part of the Rafed transportation analytics platform.
