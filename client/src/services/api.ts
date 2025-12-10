/**
 * API Client for Rafed Dashboard
 * Connects directly to ClickHouse HTTP interface
 */

const CLICKHOUSE_HOST = import.meta.env.VITE_CLICKHOUSE_HOST || 'localhost';
const CLICKHOUSE_PORT = import.meta.env.VITE_CLICKHOUSE_PORT || '8155';
const CLICKHOUSE_DATABASE = import.meta.env.VITE_CLICKHOUSE_DATABASE || 'default';
const CLICKHOUSE_USER = import.meta.env.VITE_CLICKHOUSE_USER || 'default';
const CLICKHOUSE_PASSWORD = import.meta.env.VITE_CLICKHOUSE_PASSWORD || '';

const POSTGREST_URL = import.meta.env.VITE_POSTGREST_URL || 'http://localhost:3001';

interface QueryResponse<T = any> {
  success: boolean;
  data: T[];
  rowCount: number;
  meta: {
    durationMs: number;
    schema?: string;
    params?: any[];
  };
  error?: string;
}

export class ApiClient {
  private clickhouseUrl: string;
  private postgrestUrl: string;

  constructor() {
    this.clickhouseUrl = `http://${CLICKHOUSE_HOST}:${CLICKHOUSE_PORT}`;
    this.postgrestUrl = POSTGREST_URL;
  }

  /**
   * Execute a PostgreSQL query via PostgREST
   */
  async queryPostgres<T = any>(
    query: string,
    params?: any[],
    schema?: string
  ): Promise<QueryResponse<T>> {
    try {
      // PostgREST uses a different approach - you'll need to use its REST API
      // For now, keeping basic structure but this would need schema-specific endpoints
      const response = await fetch(`${this.postgrestUrl}/rpc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ query, params }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: Array.isArray(data) ? data : [data],
        rowCount: Array.isArray(data) ? data.length : 1,
        meta: { durationMs: 0, schema, params },
      };
    } catch (error) {
      console.error('PostgreSQL query error:', error);
      return {
        success: false,
        data: [],
        rowCount: 0,
        meta: { durationMs: 0 },
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute a ClickHouse query directly via HTTP interface
   */
  async queryClickHouse<T = any>(
    query: string,
    params?: Record<string, any>
  ): Promise<QueryResponse<T>> {
    const started = Date.now();
    
    try {
      // Replace params in query with ClickHouse format {param:Type}
      const processedQuery = query;
      const queryParams: Record<string, string> = {};
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          queryParams[`param_${key}`] = typeof value === 'string' 
            ? value 
            : JSON.stringify(value);
        });
      }

      const url = new URL(this.clickhouseUrl);
      url.searchParams.set('database', CLICKHOUSE_DATABASE);
      url.searchParams.set('default_format', 'JSONEachRow');
      
      // Add query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      const auth = CLICKHOUSE_USER + (CLICKHOUSE_PASSWORD ? `:${CLICKHOUSE_PASSWORD}` : '');
      const headers: HeadersInit = {
        'Content-Type': 'text/plain',
      };
      
      if (CLICKHOUSE_USER) {
        headers['Authorization'] = `Basic ${btoa(auth)}`;
      }

      const response = await fetch(url.toString(), {
        method: 'POST',
        headers,
        body: processedQuery,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ClickHouse error: ${errorText}`);
      }

      const text = await response.text();
      const data = text
        .trim()
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => JSON.parse(line));

      const durationMs = Date.now() - started;
      console.log(`ClickHouse query executed in ${durationMs}ms`);

      return {
        success: true,
        data: data as T[],
        rowCount: data.length,
        meta: { durationMs },
      };
    } catch (error) {
      const durationMs = Date.now() - started;
      console.error(`ClickHouse query failed after ${durationMs}ms:`, error);
      return {
        success: false,
        data: [],
        rowCount: 0,
        meta: { durationMs },
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get list of PostgreSQL tables via PostgREST
   */
  async getPostgresTables(): Promise<string[]> {
    try {
      // This would need to be implemented based on PostgREST's schema introspection
      // For now, return empty array
      console.warn('PostgreSQL table listing not yet implemented for direct PostgREST access');
      return [];
    } catch (error) {
      console.error('Error fetching tables:', error);
      return [];
    }
  }

  /**
   * Get list of ClickHouse tables
   */
  async getClickHouseTables(): Promise<string[]> {
    try {
      const result = await this.queryClickHouse<{ name: string }>(`
        SELECT name 
        FROM system.tables 
        WHERE database = currentDatabase() 
        AND engine NOT LIKE '%View%'
        ORDER BY name
      `);
      
      if (result.success) {
        return result.data.map((row) => row.name);
      }
      return [];
    } catch (error) {
      console.error('Error fetching tables:', error);
      return [];
    }
  }

  /**
   * Health check for databases
   */
  async healthCheck(): Promise<{
    postgres: { healthy: boolean; message?: string };
    clickhouse: { healthy: boolean; message?: string };
    overall: boolean;
  }> {
    try {
      // Check ClickHouse
      const clickhouseResult = await this.queryClickHouse('SELECT 1 as status');
      const clickhouseHealthy = clickhouseResult.success;

      // Check PostgREST
      let postgresHealthy = false;
      try {
        const pgResponse = await fetch(this.postgrestUrl);
        postgresHealthy = pgResponse.ok;
      } catch {
        postgresHealthy = false;
      }

      return {
        postgres: {
          healthy: postgresHealthy,
          message: postgresHealthy ? 'PostgREST is healthy' : 'PostgREST connection failed',
        },
        clickhouse: {
          healthy: clickhouseHealthy,
          message: clickhouseHealthy ? 'ClickHouse is healthy' : 'ClickHouse connection failed',
        },
        overall: clickhouseHealthy && postgresHealthy,
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        postgres: { healthy: false, message: 'Connection failed' },
        clickhouse: { healthy: false, message: 'Connection failed' },
        overall: false,
      };
    }
  }
}

// Export a singleton instance
export const api = new ApiClient();
