# Development Setup

## Quick Start

Run both client and server with one command:

```bash
pnpm dev
```

This will start:
- **Client** on http://localhost:5173
- **Server** on http://localhost:9200

## Individual Commands

Run client only:
```bash
pnpm dev:client
```

Run server only:
```bash
pnpm dev:server
```

Install all dependencies:
```bash
pnpm install:all
```

## Environment Variables

### Client (.env in /client)

All environment variables are configured in `/client/.env`:

```env
# Server Configuration
VITE_SERVER_URL=http://localhost:9200

# Hsafa Configuration  
VITE_HSAFA_BASE_URL=http://localhost:3900
VITE_HSAFA_SERVER_ENDPOINT=http://localhost:3900

# Agent IDs for different pages
VITE_AGENT_ID_DASHBOARD=cmiqj4p0w0004qgg4g71gza8w
VITE_AGENT_ID_ANALYTICS=cmiqj4p0w0004qgg4g71gza8w
VITE_AGENT_ID_INFOGRAPH=cmiqj4p0w0004qgg4g71gza8w
VITE_AGENT_ID_PRESENTATION=cmiqj4p0w0004qgg4g71gza8w
```

### Server (.env in /server)

Server configuration in `/server/.env`:

```env
PORT=9200

DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=dashboard-builder

DATABASE_URL=postgres://postgres:postgres@localhost:5432/dashboard-builder

# ClickHouse Configuration
CLICKHOUSE_URL=http://localhost:8155
CLICKHOUSE_USER=viewer
CLICKHOUSE_PASSWORD=rafed_view
```

## Project Structure

```
/Users/Husam/Dev/rafed-hack/
├── client/                           # React frontend
│   ├── src/
│   │   └── pages/
│   │       └── DashboardPage/        # Dashboard builder (moved from dashboard-builder/client)
│   │           ├── components/
│   │           ├── utils/
│   │           └── types/
│   └── .env                          # Client environment variables
├── server/                           # NestJS backend (moved from dashboard-builder/server)
│   └── .env                          # Server environment variables
└── package.json                      # Root package with dev command
```

## Notes

- The server port has been changed from **2100** to **9200**
- All pages now use environment variables for agent IDs and API endpoints
- The dashboard builder components are now integrated into the main client app
