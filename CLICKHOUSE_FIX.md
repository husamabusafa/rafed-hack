# ClickHouse Authentication Fix

## Problem
ClickHouse 25.x requires authentication by default, causing connection errors:
```
Authentication failed: password is incorrect, or there is no user with such name
```

## Solution Applied

### 1. Updated docker-compose.yml
Added environment variables to disable password authentication for local development:

```yaml
clickhouse:
  environment:
    - CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1
    - CLICKHOUSE_PASSWORD=
```

### 2. Created custom users configuration
File: `/docker/clickhouse-users.xml`

This sets the default user with an empty password for local development.

### 3. Recreated ClickHouse container
```bash
cd docker
docker compose down clickhouse
docker compose up -d clickhouse
```

## Verification

### Test ClickHouse directly:
```bash
curl "http://localhost:8155/?query=SELECT%20version()"
# Should return: 25.11.2.24
```

### Test through the NestJS server:
```bash
curl http://localhost:9200/data/health
# Should show both databases healthy
```

### Test a query:
```bash
curl -X POST http://localhost:9200/data/clickhouse/query \
  -H "Content-Type: application/json" \
  -d '{"query": "SHOW TABLES"}'
```

## Security Note

⚠️ **This configuration is for LOCAL DEVELOPMENT ONLY**

For production, you should:
1. Set a strong password for the default user
2. Create specific users with limited permissions
3. Use TLS/SSL for connections
4. Restrict network access

## Current Configuration

- **Server:** `/server/.env`
  - `CLICKHOUSE_USER=default`
  - `CLICKHOUSE_PASSWORD=` (empty)

- **Docker:** Port 8155 (HTTP), 9055 (TCP)

## If Issues Persist

1. **Restart ClickHouse:**
   ```bash
   cd docker
   docker compose restart clickhouse
   ```

2. **Check ClickHouse logs:**
   ```bash
   docker compose logs clickhouse
   ```

3. **Verify ClickHouse is running:**
   ```bash
   docker compose ps clickhouse
   ```

4. **Restart the NestJS server:**
   ```bash
   cd server
   # Stop the server (Ctrl+C)
   pnpm run dev
   ```

## References

- [ClickHouse Documentation - Users and Roles](https://clickhouse.com/docs/en/operations/access-rights)
- [ClickHouse Docker Image](https://hub.docker.com/r/clickhouse/clickhouse-server/)
