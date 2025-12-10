# Database Integration Guide

## Overview

The React map components now fetch real data from PostgreSQL and ClickHouse databases through the NestJS server API.

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────────┐
│  React Client   │─────▶│  NestJS Server  │─────▶│   PostgreSQL     │
│  (Port 5173)    │      │   (Port 9200)   │      │   (Port 5455)    │
└─────────────────┘      └─────────────────┘      └──────────────────┘
                                │
                                │
                                ▼
                         ┌──────────────────┐
                         │   ClickHouse     │
                         │   (Port 8155)    │
                         └──────────────────┘
```

## Setup

### 1. Start Database Services

```bash
# From the project root
cd docker
docker compose up -d
```

This starts:
- **PostgreSQL** (PostGIS) on port 5455
- **ClickHouse** on port 8155 (HTTP) and 9055 (TCP)
- **Martin** (tile server) on port 3055
- **PostgREST** on port 3001

### 2. Start the NestJS Server

```bash
cd server
pnpm install  # if not already done
pnpm run dev
```

Server runs on **http://localhost:9200**

### 3. Start the React Client

```bash
cd client
npm install  # if not already done
npm run dev
```

Client runs on **http://localhost:5173**

## API Integration

### API Client (`/client/src/services/api.ts`)

Central API client for all database operations:

```typescript
import { api } from '../services/api';

// Query ClickHouse
const result = await api.queryClickHouse('SELECT * FROM students LIMIT 100');

// Query PostgreSQL
const result = await api.queryPostgres('SELECT * FROM schools');

// Health check
const health = await api.healthCheck();
```

### Data Hooks (`/client/src/hooks/useMapData.ts`)

React hooks for fetching map-specific data:

- **`useStudentLocations()`** - Student coordinates for density maps
- **`useRouteGeometry()`** - Route paths for animated routes
- **`useSchoolLocations()`** - School positions
- **`useDistanceAnalysis()`** - Student-to-school distance data
- **`useRegionalAnalytics()`** - Regional statistics with GeoJSON
- **`useRouteUtilization()`** - Route capacity and utilization

## Updated Map Components

### ✅ DensityHeatmap
**File:** `/client/src/components/maps/DensityHeatmap.tsx`

- Fetches real student locations from ClickHouse
- Displays loading state while fetching
- Shows error messages if fetch fails
- Live statistics (total students, bus eligible count)

**Data Source:** `students` or `unassigned_students` table

### ✅ AnimatedRoutes
**File:** `/client/src/components/maps/AnimatedRoutes.tsx`

- Loads route geometries from ClickHouse
- Toggle between animated (TripsLayer) and static (PathLayer) views
- Multiple route colors for visual distinction
- Real-time route count display

**Data Source:** `routes` table

### ✅ DistanceAnalysis
**File:** `/client/src/components/maps/DistanceAnalysis.tsx`

- Shows student-to-school connections
- Distance-based filtering
- Arc visualization between locations
- Live statistics (total students, average distance)

**Data Source:** `student_school_distances` table

### ✅ RouteUtilization
**File:** `/client/src/components/maps/RouteUtilization.tsx`

- Displays route capacity utilization
- Color-coded by utilization level:
  - Cyan: < 50% (low)
  - Green: 50-80% (normal)
  - Amber: 80-100% (high)
  - Red: > 100% (overloaded)
- Filter routes by utilization category

**Data Source:** `routes` table

### 🔄 RegionalAnalytics3D
**File:** `/client/src/components/maps/RegionalAnalytics3D.tsx`

- Currently uses sample data
- Ready for PostgreSQL GeoJSON integration
- Hook available: `useRegionalAnalytics()`

### 🔄 SpecialNeedsMap
**File:** `/client/src/components/maps/SpecialNeedsMap.tsx`

- Currently uses sample data
- Can be integrated with student special needs data

## Database Tables Used

### ClickHouse Tables

| Table | Columns Used | Purpose |
|-------|-------------|---------|
| `students` | lat, lon, student_id, bus_eligible | Student locations |
| `unassigned_students` | lat, lon, student_id | Fallback student locations |
| `routes` | route_id, geometry, student_count, capacity | Route paths and utilization |
| `student_school_distances` | student_lat, student_lon, school_lat, school_lon, distance | Distance analysis |
| `schools` | school_id, school_name, lat, lon, student_count | School locations |

### PostgreSQL Tables

| Table | Columns Used | Purpose |
|-------|-------------|---------|
| `regions` | region_id, region_name, geom, student_count, school_count | Regional analytics |

## API Endpoints

### PostgreSQL
- `POST /data/postgres/query` - Execute PostgreSQL queries
- `GET /data/postgres/tables` - List tables
- `GET /data/postgres/tables/:tableName` - Table info

### ClickHouse
- `POST /data/clickhouse/query` - Execute ClickHouse queries
- `GET /data/clickhouse/tables` - List tables
- `GET /data/clickhouse/tables/:tableName` - Table info

### Health
- `GET /data/health` - Check database connections

## Environment Variables

### Server (`.env`)
```env
# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5455
DATABASE_USERNAME=user
DATABASE_PASSWORD=password
DATABASE_NAME=gis_db

# ClickHouse
CLICKHOUSE_HOST=localhost
CLICKHOUSE_HTTP_PORT=8155
CLICKHOUSE_TCP_PORT=9055
CLICKHOUSE_DATABASE=default
```

### Client (`.env`)
```env
VITE_API_URL=http://localhost:9200
```

## Common Issues

### 1. Connection Errors
**Problem:** Components show "Loading..." indefinitely

**Solutions:**
- Ensure Docker services are running: `docker compose ps`
- Check server is running: `curl http://localhost:9200/data/health`
- Verify database credentials in `/server/.env`

### 2. Empty Data
**Problem:** Components load but show no data

**Solutions:**
- Check if tables exist: `GET http://localhost:9200/data/clickhouse/tables`
- Verify data in tables using ClickHouse client
- Check browser console for query errors

### 3. CORS Errors
**Problem:** Browser blocks API requests

**Solutions:**
- Server has CORS enabled by default
- Verify server URL matches `VITE_API_URL`
- Check browser console for specific CORS errors

## Development Tips

### Adding New Data Sources

1. **Create a Hook** (`/client/src/hooks/useMapData.ts`):
```typescript
export function useMyNewData() {
  const { data, loading, error } = useState(/* ... */);
  
  useEffect(() => {
    // Fetch data using api.queryClickHouse() or api.queryPostgres()
  }, []);
  
  return { data, loading, error, refetch };
}
```

2. **Use in Component**:
```typescript
import { useMyNewData } from '../../hooks/useMapData';

export default function MyMap() {
  const { data, loading, error } = useMyNewData();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // Render with data
}
```

### Testing Queries

Use the server's query endpoints directly:

```bash
# Test ClickHouse query
curl -X POST http://localhost:9200/data/clickhouse/query \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT count() FROM students"}'

# Test PostgreSQL query
curl -X POST http://localhost:9200/data/postgres/query \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT count(*) FROM schools"}'
```

## Next Steps

- [ ] Integrate RegionalAnalytics3D with PostgreSQL GeoJSON data
- [ ] Add SpecialNeedsMap database integration
- [ ] Implement data caching for performance
- [ ] Add real-time data updates with WebSockets
- [ ] Create data export functionality
- [ ] Add query parameter support for filtering
