/**
 * Data Fetcher Utility
 * Handles fetching data from ClickHouse or static sources
 */

import { queryClickHouse } from '../../DashboardPage/utils/queryClickHouse';
import type { DataSource } from '../types';

export interface FetchResult {
  success: boolean;
  data: unknown[];
  error?: string;
  meta?: {
    rowCount: number;
    durationMs?: number;
  };
}

/**
 * Fetch data based on data source configuration
 */
export async function fetchData(dataSource: DataSource): Promise<FetchResult> {
  try {
    if (dataSource.type === 'static') {
      // Return static data
      return {
        success: true,
        data: dataSource.data || [],
        meta: {
          rowCount: dataSource.data?.length || 0,
        },
      };
    }

    if (dataSource.type === 'clickhouse') {
      // Fetch from ClickHouse
      if (!dataSource.query) {
        return {
          success: false,
          data: [],
          error: 'ClickHouse query is required',
          meta: { rowCount: 0 },
        };
      }

      const result = await queryClickHouse(dataSource.query, {
        maxRows: dataSource.maxRows,
        timeout: dataSource.timeout,
      });

      if (!result.success) {
        return {
          success: false,
          data: [],
          error: result.error || 'Failed to fetch data from ClickHouse',
          meta: { rowCount: 0 },
        };
      }

      return {
        success: true,
        data: result.data,
        meta: {
          rowCount: result.rowCount,
          durationMs: result.meta?.durationMs,
        },
      };
    }

    return {
      success: false,
      data: [],
      error: `Unsupported data source type: ${dataSource.type}`,
      meta: { rowCount: 0 },
    };
  } catch (error) {
    console.error('[fetchData] Error:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : String(error),
      meta: { rowCount: 0 },
    };
  }
}

/**
 * Fetch data for multiple layers in parallel
 */
export async function fetchMultipleDataSources(
  dataSources: DataSource[]
): Promise<FetchResult[]> {
  const promises = dataSources.map((source) => fetchData(source));
  return Promise.all(promises);
}
