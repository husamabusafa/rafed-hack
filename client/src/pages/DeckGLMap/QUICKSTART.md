# Quick Start Guide - Dynamic DeckGL Map

Get started with the dynamic DeckGL map in 5 minutes!

## Step 1: Import the Component

```typescript
import DeckGLMap from './pages/DeckGLMap/DeckGLMap';
import type { MapConfig } from './pages/DeckGLMap/types';
```

## Step 2: Create or Load a Configuration

### Option A: Use an Example Configuration

```typescript
import hexagonConfig from './pages/DeckGLMap/examples/hexagon-density.json';

function MyMap() {
  return <DeckGLMap config={hexagonConfig} />;
}
```

### Option B: Create Your Own Configuration

```typescript
const myConfig: MapConfig = {
  title: 'My Map',
  initialViewState: {
    longitude: 46.7,
    latitude: 24.7,
    zoom: 10,
  },
  layers: [
    {
      id: 'my-layer',
      type: 'scatterplot',
      dataSource: {
        type: 'clickhouse',
        query: 'SELECT toFloat64(lat) as lat, toFloat64(lon) as lon FROM my_table LIMIT 10000',
      },
      mapping: {
        position: ['lon', 'lat'],
      },
      style: {
        radius: 50,
        color: [249, 115, 22, 180],
      },
    },
  ],
};

function MyMap() {
  return <DeckGLMap config={myConfig} />;
}
```

## Step 3: Update the Query to Match Your Data

The most important step is matching field names in your ClickHouse query to the `mapping` configuration:

```typescript
// Your ClickHouse table
// Table: students
// Columns: latitude, longitude, name, grade

// Your query
"SELECT toFloat64(latitude) as lat, toFloat64(longitude) as lon, name, grade FROM students LIMIT 5000"

// Your mapping
mapping: {
  position: ['lon', 'lat']  // Maps to 'lon' and 'lat' from query results
}
```

**Critical**: Always cast numeric fields with `toFloat64()` in ClickHouse!

## Common Patterns

### Pattern 1: Simple Point Map

```json
{
  "type": "scatterplot",
  "dataSource": {
    "type": "clickhouse",
    "query": "SELECT toFloat64(lat) as lat, toFloat64(lon) as lon, name FROM locations"
  },
  "mapping": {
    "position": ["lon", "lat"]
  },
  "style": {
    "radius": 50,
    "color": [249, 115, 22, 180]
  }
}
```

### Pattern 2: Density Heatmap

```json
{
  "type": "hexagon",
  "dataSource": {
    "type": "clickhouse",
    "query": "SELECT toFloat64(lat) as lat, toFloat64(lon) as lon FROM high_volume_table LIMIT 50000"
  },
  "mapping": {
    "position": ["lon", "lat"]
  },
  "style": {
    "radius": 500,
    "elevationScale": 100,
    "extruded": true
  }
}
```

### Pattern 3: Route Lines

```json
{
  "type": "path",
  "dataSource": {
    "type": "clickhouse",
    "query": "SELECT route_id, name, path FROM routes"
  },
  "mapping": {
    "path": "path"
  },
  "style": {
    "widthScale": 5,
    "color": [249, 115, 22, 200]
  }
}
```

## Testing Your Configuration

1. **Test the Query First**: Run your query directly in ClickHouse to verify it returns data
2. **Check Field Names**: Make sure `mapping` field names match your query's column aliases
3. **Verify Data Types**: Ensure lat/lon are cast to Float64
4. **Start Small**: Use `LIMIT 1000` while testing, increase later

## Troubleshooting

### "No data showing on map"
- ✅ Verify ClickHouse connection (check `.env` file)
- ✅ Run query directly in ClickHouse to confirm it returns data
- ✅ Check that field names in `mapping` match query column names exactly
- ✅ Ensure lat/lon values are valid (not NULL, within valid ranges)

### "Layer not rendering"
- ✅ Check browser console for errors
- ✅ Verify `toFloat64()` is used for numeric fields
- ✅ Ensure `position` mapping uses correct field names

### "Performance is slow"
- ✅ Reduce `maxRows` in dataSource
- ✅ Use hexagon/grid layers instead of scatterplot for large datasets
- ✅ Add database indexes on frequently queried columns

## Next Steps

- 📖 Read the full [README.md](./README.md) for all layer types and options
- 👀 Check out [usage examples](./examples/usage-example.tsx) for more patterns
- 🎨 Explore the [example configurations](./examples/) directory
- 🔧 Customize styling and tooltips for your use case

## Need Help?

Common issues and solutions are in the main [README.md](./README.md#troubleshooting).
