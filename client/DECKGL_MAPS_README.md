# Deck.GL Map Visualizations

This directory contains multiple interactive map visualizations built with deck.gl and React, inspired by the HTML visualizations in the `apps` and `mapview` directories.

## Maps Included

### 1. **3D Regional Analytics** 🗺️
- Extruded polygon visualization of regional metrics
- View students, schools, and population data
- Interactive 3D controls with extrusion scale and opacity
- Color-coded by metric values

### 2. **Animated Bus Routes** 🚌
- Real-time route flow visualization with TripsLayer
- Playback controls (play/pause, speed adjustment)
- Route utilization color coding
- Timeline scrubber for temporal navigation

### 3. **Student Density Heatmap** 🔥
- 3D hexagon aggregation of student locations
- Toggle between hexagon, heatmap, and scatter views
- Adjustable radius, elevation, and coverage
- Real-time statistics

### 4. **Distance Analysis** 📏
- Student to school distance mapping with arcs
- Filter by maximum distance
- Visual connections between students and schools
- Average distance calculations

### 5. **Route Utilization** 📊
- Route capacity and utilization analysis
- Filter by utilization levels (low, normal, high, overloaded)
- Color-coded routes by capacity usage
- Interactive tooltips with route details

## Installation

1. **Install dependencies:**
   ```bash
   cd client
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Navigate to the DeckGL Map page** in your application

## Dependencies Added

The following packages were added to `package.json`:
- `deck.gl`: Core deck.gl library
- `@deck.gl/core`: Deck.gl core
- `@deck.gl/layers`: Standard layers
- `@deck.gl/aggregation-layers`: Hexagon and heatmap layers
- `@deck.gl/react`: React bindings
- `react-map-gl`: React wrapper for maps
- `maplibre-gl`: Open-source map rendering

## Architecture

```
client/src/
├── pages/DeckGLMap/
│   └── DeckGLMap.tsx          # Main page with tab navigation
└── components/maps/
    ├── RegionalAnalytics3D.tsx    # 3D regional visualization
    ├── AnimatedRoutes.tsx          # Animated route trips
    ├── DensityHeatmap.tsx          # Student density hexagons
    ├── DistanceAnalysis.tsx        # Distance mapping
    └── RouteUtilization.tsx        # Route capacity analysis
```

## Features

- **Tab-based navigation**: Switch between different visualizations
- **Interactive controls**: Adjust visualization parameters in real-time
- **Responsive design**: Works on different screen sizes
- **Dark theme**: Consistent with the application design
- **Sample data**: Pre-loaded with representative data for demonstration
- **Tooltips**: Hover over elements for detailed information

## Data Integration

Currently using sample data for demonstration. To integrate with real data:

1. Connect to your ClickHouse database
2. Update the data fetching logic in each component
3. Replace sample data arrays with API calls
4. Add loading states and error handling

## Customization

Each map component is self-contained and can be customized independently:

- **Colors**: Modify color scales in each component
- **Data**: Replace sample data with real data sources
- **Controls**: Add or remove control panels
- **Layers**: Add additional deck.gl layers as needed

## Performance Tips

- Use data filtering to limit the number of rendered objects
- Implement virtualization for large datasets
- Cache computed values
- Use deck.gl's built-in picking for tooltips
- Consider server-side data aggregation for very large datasets

## Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari (with WebGL 2.0 support)

## Next Steps

1. Install dependencies with `npm install`
2. Start the dev server
3. Navigate to the DeckGL Map page
4. Explore each visualization tab
5. Integrate with your real data sources
6. Customize colors and styling to match your needs

## Resources

- [deck.gl Documentation](https://deck.gl/)
- [MapLibre GL JS](https://maplibre.org/)
- [React Map GL](https://visgl.github.io/react-map-gl/)
