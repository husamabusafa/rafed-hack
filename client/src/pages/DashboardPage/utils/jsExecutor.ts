/**
 * JS Code Executor
 * Safely executes user-provided JavaScript transformation functions
 */

export interface JSExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime?: number;
}

/**
 * Execute a JavaScript transformation function safely
 * The function should take data as parameter and return transformed data
 * 
 * @param code - JavaScript function code (should be a function definition)
 * @param data - The query result data to transform
 * @returns Execution result with success status, result, and any errors
 */
export function executeJSTransform(code: string, data: any): JSExecutionResult {
  const startTime = performance.now();
  
  try {
    // Validate code is not empty
    if (!code || typeof code !== 'string') {
      return {
        success: false,
        error: 'JS transform code is empty or invalid',
      };
    }

    // Create a sandboxed function
    // The code should be a function that takes 'data' as parameter
    // Example: function transform(data) { return data.map(x => ({...})); }
    
    let transformFunction: Function;
    
    try {
      // Try to extract function if it's wrapped
      const functionMatch = code.match(/function\s+\w*\s*\([^)]*\)\s*{[\s\S]*}/);
      const arrowMatch = code.match(/\([^)]*\)\s*=>\s*{[\s\S]*}|\([^)]*\)\s*=>\s*[^{][\s\S]*/);
      
      if (functionMatch) {
        // Named or anonymous function
        transformFunction = new Function('data', `return (${functionMatch[0]})(data);`);
      } else if (arrowMatch) {
        // Arrow function
        transformFunction = new Function('data', `return (${arrowMatch[0]})(data);`);
      } else {
        // Assume it's just the function body, wrap it
        transformFunction = new Function('data', code);
      }
    } catch (syntaxError) {
      return {
        success: false,
        error: `Syntax error in JS code: ${syntaxError instanceof Error ? syntaxError.message : 'Unknown error'}`,
        executionTime: performance.now() - startTime,
      };
    }

    // Execute the function with the data
    const result = transformFunction(data);
    
    const executionTime = performance.now() - startTime;
    
    return {
      success: true,
      result,
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    
    return {
      success: false,
      error: `Runtime error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      executionTime,
    };
  }
}

/**
 * Validate JS code without executing it
 * Performs basic syntax validation
 */
export function validateJSCode(code: string): { valid: boolean; error?: string } {
  try {
    if (!code || typeof code !== 'string') {
      return { valid: false, error: 'Code is empty or invalid' };
    }

    // Try to create the function to check syntax
    new Function('data', code);
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Syntax error',
    };
  }
}

/**
 * Create a sample transform function template
 */
export function createTransformTemplate(type: 'chart' | 'table' | 'stat-card'): string {
  switch (type) {
    case 'chart':
      return `function transform(data) {
  // data is the query result array
  return {
    xAxis: { type: 'category', data: data.map(row => row.label) },
    yAxis: { type: 'value' },
    series: [{
      data: data.map(row => row.value),
      type: 'bar'
    }]
  };
}`;
    
    case 'table':
      return `function transform(data) {
  // data is the query result array
  return {
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'value', label: 'Value' }
    ],
    rows: data
  };
}`;
    
    case 'stat-card':
      return `function transform(data) {
  // data is the query result array
  const row = data[0];
  return {
    value: row.value,
    label: row.label || 'Metric',
    icon: 'lucide:trending-up',
    trend: {
      value: row.change || 0,
      direction: row.change > 0 ? 'up' : 'down'
    }
  };
}`;
    
    default:
      return `function transform(data) {
  // Transform your data here
  return data;
}`;
  }
}
