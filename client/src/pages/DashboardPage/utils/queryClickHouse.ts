/**
 * ClickHouse Query Utility
 * Queries ClickHouse database directly via HTTP interface
 */

const CLICKHOUSE_HOST = import.meta.env.VITE_CLICKHOUSE_HOST || 'localhost';
const CLICKHOUSE_PORT = import.meta.env.VITE_CLICKHOUSE_PORT || '8155';
const CLICKHOUSE_DATABASE = import.meta.env.VITE_CLICKHOUSE_DATABASE || 'default';
const CLICKHOUSE_USER = import.meta.env.VITE_CLICKHOUSE_USER || 'default';
const CLICKHOUSE_PASSWORD = import.meta.env.VITE_CLICKHOUSE_PASSWORD || '';

export interface ClickHouseQueryResult {
  success: boolean;
  data: any[];
  rowCount: number;
  error?: string;
  meta?: {
    durationMs: number;
    rows_before_limit_at_least?: number;
    statistics?: any;
  };
}

/**
 * Execute a ClickHouse query directly
 * @param query - SQL query string
 * @param options - Query options (maxRows, timeout)
 * @returns Query result with data, success status, and metadata
 */
export async function queryClickHouse(
  query: string,
  options?: { maxRows?: number; timeout?: number }
): Promise<ClickHouseQueryResult> {
  const started = Date.now();
  
  try {
    // Apply maxRows limit if specified
    let finalQuery = query.trim();
    if (options?.maxRows && options.maxRows > 0) {
      // Add LIMIT clause if not already present
      if (!finalQuery.match(/LIMIT\s+\d+/i)) {
        finalQuery += ` LIMIT ${options.maxRows}`;
      }
    }

    const clickhouseUrl = `http://${CLICKHOUSE_HOST}:${CLICKHOUSE_PORT}`;
    const url = new URL(clickhouseUrl);
    url.searchParams.set('database', CLICKHOUSE_DATABASE);
    url.searchParams.set('default_format', 'JSONEachRow');
    
    // Add timeout if specified
    if (options?.timeout) {
      url.searchParams.set('max_execution_time', String(Math.floor(options.timeout / 1000)));
    }

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
      body: finalQuery,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ClickHouse error (${response.status}): ${errorText}`);
    }

    const text = await response.text();
    const data = text
      .trim()
      .split('\n')
      .filter(line => line.length > 0)
      .map(line => JSON.parse(line));

    const durationMs = Date.now() - started;
    console.log(`[queryClickHouse] Query executed in ${durationMs}ms, returned ${data.length} rows`);

    return {
      success: true,
      data,
      rowCount: data.length,
      meta: {
        durationMs,
      },
    };
  } catch (error: any) {
    const durationMs = Date.now() - started;
    console.error(`[queryClickHouse] Query failed after ${durationMs}ms:`, error);
    return {
      success: false,
      data: [],
      rowCount: 0,
      error: error?.message || String(error),
      meta: {
        durationMs,
      },
    };
  }
}

/**
 * Execute multiple ClickHouse queries in parallel
 * @param queries - Array of query strings
 * @returns Array of query results
 */
export async function batchQueryClickHouse(
  queries: string[]
): Promise<ClickHouseQueryResult[]> {
  const promises = queries.map((query) => queryClickHouse(query));
  return Promise.all(promises);
}
