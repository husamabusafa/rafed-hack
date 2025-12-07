/**
 * ClickHouse Query Utility
 * Queries ClickHouse database via the NestJS backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:2100';

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
 * Execute a ClickHouse query
 * @param query - SQL query string
 * @param options - Query options (maxRows, timeout)
 * @returns Query result with data, success status, and metadata
 */
export async function queryClickHouse(
  query: string,
  options?: { maxRows?: number; timeout?: number }
): Promise<ClickHouseQueryResult> {
  try {
    const response = await fetch(`${API_URL}/data/query-clickhouse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        maxRows: options?.maxRows || 0,
        timeout: options?.timeout || 30000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('[queryClickHouse] Error:', error);
    return {
      success: false,
      data: [],
      rowCount: 0,
      error: error?.message || String(error),
      meta: {
        durationMs: 0,
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
