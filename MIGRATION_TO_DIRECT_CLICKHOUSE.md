# Migration to Direct ClickHouse Connection

## Summary
The NestJS server has been removed and the client now connects directly to ClickHouse via its HTTP interface.

## Changes Made

### 1. **Removed NestJS Server**
- Deleted `/server` directory entirely
- Removed all server-related dependencies and configurations

### 2. **Updated Client API Service** (`client/src/services/api.ts`)
- Modified `ApiClient` to connect directly to ClickHouse HTTP interface (port 8155)
- Implemented direct HTTP POST requests to ClickHouse using `fetch`
- Updated PostgreSQL queries to use PostgREST (port 3001) instead of the NestJS server
- Maintained backward-compatible API interface for existing components

### 3. **Environment Configuration**
Updated `client/.env` with direct database connections:
```
VITE_CLICKHOUSE_HOST=localhost
VITE_CLICKHOUSE_PORT=8155
VITE_CLICKHOUSE_DATABASE=default
VITE_CLICKHOUSE_USER=default
VITE_CLICKHOUSE_PASSWORD=
VITE_POSTGREST_URL=http://localhost:3001
```

### 4. **Updated Scripts**
Modified root `package.json`:
- `dev` now runs only the client
- Removed `dev:server` references
- Updated `install:all` to skip server directory

## Architecture

### Before
```
Client (Vite) → NestJS Server (port 9200) → ClickHouse (port 8155)
                                         → PostgreSQL (port 5455)
```

### After
```
Client (Vite) → ClickHouse HTTP Interface (port 8155)
              → PostgREST (port 3001) → PostgreSQL (port 5455)
```

## Running the Application

1. **Start Docker services:**
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

2. **Start the client:**
   ```bash
   pnpm dev
   ```
   or
   ```bash
   cd client && pnpm dev
   ```

## Services

- **ClickHouse**: `http://localhost:8155` (HTTP interface)
- **PostgREST**: `http://localhost:3001` (PostgreSQL REST API)
- **Martin**: `http://localhost:3055` (Tile server)
- **Meilisearch**: `http://localhost:7755` (Search engine)
- **Client**: `http://localhost:5173` (Vite dev server)

## Notes

- The client now has zero server-side dependencies
- All database queries are made directly from the browser
- CORS is handled by ClickHouse and PostgREST directly
- No need for a separate backend server process
- The `api` singleton in `services/api.ts` provides the same interface as before

## Potential Considerations

- **Security**: Direct database access from the client means connection strings are visible in browser. Consider implementing:
  - Query allowlists
  - Rate limiting at the database level
  - Restricted database users with minimal permissions
  
- **PostgREST**: For advanced PostgreSQL queries, you may need to create custom RPC functions in PostgreSQL

## Lint Notes

The API client intentionally uses `any` types for generic parameters to maintain flexibility for various query response shapes. This is appropriate for a generic database client.
