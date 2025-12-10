/**
 * Execute a PostgreSQL query via PostgREST
 * @param query - SQL query string
 * @returns Promise with query results
 */
const POSTGREST_URL = import.meta.env.VITE_POSTGREST_URL || 'http://localhost:3001';

export async function queryDatabase(query: string) {
  try {
    const response = await fetch(`${POSTGREST_URL}/rpc/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      data: Array.isArray(result) ? result : [result],
      rowCount: Array.isArray(result) ? result.length : 1,
    };
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}
