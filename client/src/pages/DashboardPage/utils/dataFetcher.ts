import alasql from 'alasql';
import type {
  ComponentDataConfig,
  DataSource,
  PostgreSQLQuery,
  GraphQLQuery,
  StaticData,
  ClickHouseQuery,
  AlaSQLTransform,
} from '../types/types';
import { queryClickHouse as queryClickHouseUtil } from './queryClickHouse';
import { executeJSTransform } from './jsExecutor';

// Data Fetcher Class

export class DataFetcher {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private mcpPostgresEndpoint?: string;
  private graphqlEndpoint?: string;

  constructor(config?: {
    mcpPostgresEndpoint?: string;
    graphqlEndpoint?: string;
  }) {
    this.mcpPostgresEndpoint = config?.mcpPostgresEndpoint;
    this.graphqlEndpoint = config?.graphqlEndpoint;
  }

  /**
   * Fetch data based on the component's data configuration
   */
  async fetchData(
    componentId: string,
    config: ComponentDataConfig
  ): Promise<any> {
    try {
      // Check cache first
      if (config.cache?.enabled) {
        const cached = this.getFromCache(componentId, config.cache.ttl);
        if (cached !== null) {
          return cached;
        }
      }

      // Fetch from data source
      let rawData = await this.fetchFromSource(config.source);

      // Apply JS transformation if specified
      if (config.jsTransform) {
        const jsResult = executeJSTransform(config.jsTransform.code, rawData);
        if (!jsResult.success) {
          throw new Error(jsResult.error || 'JS transformation failed');
        }
        rawData = jsResult.result;
      }

      // Apply alasql transformation if specified
      if (config.alasqlTransform) {
        rawData = this.applyAlaSQLTransform(rawData, config.alasqlTransform);
      }

      // Cache the result
      if (config.cache?.enabled) {
        this.setCache(componentId, rawData);
      }

      return rawData;
    } catch (error) {
      console.error(`Error fetching data for component ${componentId}:`, error);
      throw error;
    }
  }

  async fetchDataWithTrace(
    componentId: string,
    config: ComponentDataConfig
  ): Promise<{
    final: any;
    trace: { source: string; raw: any; afterJS?: any; afterAlaSQL?: any; jsExecutionTime?: number };
    error?: string | any;
  }> {
    try {
      let raw: any;
      const sourceType = config.source.type;

      if (sourceType === 'postgresql') {
        raw = await this.fetchFromPostgreSQLRaw(config.source as PostgreSQLQuery);
      } else if (sourceType === 'clickhouse') {
        raw = await this.fetchFromClickHouseRaw(config.source as ClickHouseQuery);
      } else if (sourceType === 'graphql') {
        raw = await this.fetchFromGraphQL(config.source as GraphQLQuery);
      } else if (sourceType === 'static') {
        raw = await this.fetchFromStatic(config.source as StaticData);
      } else {
        throw new Error(`Unknown data source type: ${(config.source as any).type}`);
      }

      const rawForTransform = raw && typeof raw === 'object' && 'data' in raw ? (raw as any).data : raw;

      let afterJS: any = rawForTransform;
      let jsExecutionTime: number | undefined;
      if (config.jsTransform) {
        const jsResult = executeJSTransform(config.jsTransform.code, rawForTransform);
        if (!jsResult.success) {
          return {
            final: undefined,
            trace: { source: sourceType, raw, afterJS: undefined, jsExecutionTime: jsResult.executionTime },
            error: jsResult.error || 'JS transformation failed',
          };
        }
        afterJS = jsResult.result;
        jsExecutionTime = jsResult.executionTime;
      }

      let afterAlaSQL: any = afterJS;
      if (config.alasqlTransform) {
        try {
          afterAlaSQL = this.applyAlaSQLTransform(afterJS, config.alasqlTransform);
        } catch (error) {
          return {
            final: undefined,
            trace: { source: sourceType, raw, afterJS, jsExecutionTime },
            error: error instanceof Error ? error.message : 'AlaSQL transformation failed',
          };
        }
      }

      const final = afterAlaSQL;

      if (config.cache?.enabled) {
        this.setCache(componentId, final);
      }

      const possibleError = raw && typeof raw === 'object' && 'error' in raw ? (raw as any).error : undefined;

      return {
        final,
        trace: { 
          source: sourceType, 
          raw, 
          afterJS: config.jsTransform ? afterJS : undefined, 
          afterAlaSQL: config.alasqlTransform ? afterAlaSQL : undefined,
          jsExecutionTime 
        },
        error: possibleError,
      };
    } catch (error: any) {
      return {
        final: undefined,
        trace: { source: config.source.type, raw: undefined },
        error: error?.message || error,
      };
    }
  }

  /**
   * Fetch data from the specified source
   */
  private async fetchFromSource(source: DataSource): Promise<any> {
    switch (source.type) {
      case 'postgresql':
        return this.fetchFromPostgreSQL(source);
      case 'clickhouse':
        return this.fetchFromClickHouse(source);
      case 'graphql':
        return this.fetchFromGraphQL(source);
      case 'static':
        return this.fetchFromStatic(source);
      default:
        throw new Error(`Unknown data source type: ${(source as any).type}`);
    }
  }

  /**
   * Fetch data from PostgreSQL via MCP
   */
  private async fetchFromPostgreSQL(source: PostgreSQLQuery): Promise<any> {
    if (!this.mcpPostgresEndpoint) {
      console.warn('MCP PostgreSQL endpoint not configured');
      return { error: 'PostgreSQL endpoint not configured' };
    }

    // Check if fetch is available
    if (typeof fetch === 'undefined') {
      console.warn('fetch is not available in this context');
      return { error: 'fetch not available' };
    }

    try {
      const response = await fetch(this.mcpPostgresEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: source.query,
          params: source.params,
          schema: source.schema,
        }),
      });

      if (!response.ok) {
        console.warn(`PostgreSQL query failed: ${response.statusText}`);
        return { error: response.statusText };
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.warn('PostgreSQL fetch error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async fetchFromPostgreSQLRaw(source: PostgreSQLQuery): Promise<any> {
    if (!this.mcpPostgresEndpoint) {
      return { error: 'PostgreSQL endpoint not configured' };
    }

    if (typeof fetch === 'undefined') {
      return { error: 'fetch not available' };
    }

    try {
      const response = await fetch(this.mcpPostgresEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: source.query,
          params: source.params,
          schema: source.schema,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        return { error: result?.error || response.statusText, ...result };
      }
      return result;
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Fetch data from ClickHouse
   */
  private async fetchFromClickHouse(source: ClickHouseQuery): Promise<any> {
    try {
      const result = await queryClickHouseUtil(source.query, {
        maxRows: source.maxRows,
        timeout: source.timeout,
      });

      if (!result.success) {
        return { error: result.error };
      }

      return result.data || [];
    } catch (error) {
      console.warn('ClickHouse fetch error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async fetchFromClickHouseRaw(source: ClickHouseQuery): Promise<any> {
    try {
      const result = await queryClickHouseUtil(source.query, {
        maxRows: source.maxRows,
        timeout: source.timeout,
      });

      return result;
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Fetch data from GraphQL endpoint
   */
  private async fetchFromGraphQL(source: GraphQLQuery): Promise<any> {
    const endpoint = source.endpoint || this.graphqlEndpoint;
    
    if (!endpoint) {
      console.warn('GraphQL endpoint not configured');
      return { error: 'GraphQL endpoint not configured' };
    }

    // Check if fetch is available
    if (typeof fetch === 'undefined') {
      console.warn('fetch is not available in this context');
      return { error: 'fetch not available' };
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: source.query,
          variables: source.variables,
        }),
      });

      if (!response.ok) {
        console.warn(`GraphQL query failed: ${response.statusText}`);
        return { error: response.statusText };
      }

      const result = await response.json();
      
      if (result.errors) {
        console.warn(`GraphQL errors: ${JSON.stringify(result.errors)}`);
        return { error: result.errors };
      }

      return result.data;
    } catch (error) {
      console.warn('GraphQL fetch error:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Return static data
   */
  private async fetchFromStatic(source: StaticData): Promise<any> {
    return source.data;
  }


  /**
   * Apply alasql transformation
   */
  private applyAlaSQLTransform(
    data: any,
    transform: AlaSQLTransform
  ): any {
    try {
      // Ensure data is in array format for alasql
      const dataArray = Array.isArray(data) ? data : [data];
      
      // Execute alasql query
      const result = alasql(transform.query, [dataArray, transform.params]);
      
      return result;
    } catch (error) {
      console.error('AlaSQL transform error:', error);
      throw new Error(`AlaSQL transform failed: ${error}`);
    }
  }

  /**
   * Get data from cache
   */
  private getFromCache(componentId: string, ttl?: number): any | null {
    const cached = this.cache.get(componentId);
    
    if (!cached) {
      return null;
    }

    const age = Date.now() - cached.timestamp;
    const maxAge = ttl || 60000; // Default 60 seconds

    if (age > maxAge) {
      this.cache.delete(componentId);
      return null;
    }

    return cached.data;
  }

  /**
   * Set data in cache
   */
  private setCache(componentId: string, data: any): void {
    this.cache.set(componentId, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache for a specific component or all components
   */
  clearCache(componentId?: string): void {
    if (componentId) {
      this.cache.delete(componentId);
    } else {
      this.cache.clear();
    }
  }
}

