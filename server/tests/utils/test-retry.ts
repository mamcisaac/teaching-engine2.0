/**
 * Test retry utilities for improving test reliability
 * Provides mechanisms to retry flaky tests, especially integration tests
 */

export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  exponentialBackoff?: boolean;
  retryCondition?: (error: Error) => boolean;
}

/**
 * Default retry condition - retry on common flaky test errors
 */
const defaultRetryCondition = (error: Error): boolean => {
  const message = error.message.toLowerCase();
  
  // Common flaky test patterns
  const retryPatterns = [
    'timeout',
    'connection',
    'network',
    'econnreset',
    'enotfound',
    'socket',
    'fetch failed',
    'request failed',
    'database connection',
    'lock',
    'deadlock',
    'constraint',
    'unique violation',
    'foreign key',
    'prisma',
    'timed out',
    'operation timed out',
  ];
  
  return retryPatterns.some(pattern => message.includes(pattern));
};

/**
 * Retry a test function with configurable options
 */
export async function retryTest<T>(
  testFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    exponentialBackoff = true,
    retryCondition = defaultRetryCondition,
  } = options;
  
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await testFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        break;
      }
      
      // Check if we should retry this error
      if (!retryCondition(lastError)) {
        throw lastError;
      }
      
      // Calculate delay with optional exponential backoff
      const delay = exponentialBackoff 
        ? delayMs * Math.pow(2, attempt - 1)
        : delayMs;
      
      console.warn(
        `Test attempt ${attempt}/${maxAttempts} failed: ${lastError.message}. Retrying in ${delay}ms...`
      );
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // If we get here, all attempts failed
  throw lastError || new Error('Test failed after all retry attempts');
}

/**
 * Jest/Vitest compatible retry wrapper
 * Can be used as a test wrapper: it('should work', retryIt(async () => { ... }))
 */
export function retryIt(
  testFn: () => Promise<void>,
  options?: RetryOptions
): () => Promise<void> {
  return () => retryTest(testFn, options);
}

/**
 * Retry specifically for database operations
 */
export async function retryDatabase<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  return retryTest(operation, {
    maxAttempts,
    delayMs: 500,
    exponentialBackoff: true,
    retryCondition: (error) => {
      const message = error.message.toLowerCase();
      return (
        message.includes('database') ||
        message.includes('prisma') ||
        message.includes('connection') ||
        message.includes('lock') ||
        message.includes('constraint') ||
        message.includes('timeout')
      );
    },
  });
}

/**
 * Retry specifically for network operations
 */
export async function retryNetwork<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  return retryTest(operation, {
    maxAttempts,
    delayMs: 1000,
    exponentialBackoff: true,
    retryCondition: (error) => {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('econnreset') ||
        message.includes('enotfound') ||
        message.includes('timeout') ||
        message.includes('socket')
      );
    },
  });
}

/**
 * Test helper for waiting with exponential backoff
 */
export async function waitWithBackoff(
  condition: () => Promise<boolean> | boolean,
  options: {
    maxAttempts?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    timeoutMs?: number;
  } = {}
): Promise<void> {
  const {
    maxAttempts = 10,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    timeoutMs = 30000,
  } = options;
  
  const startTime = Date.now();
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Check timeout
    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`waitWithBackoff timed out after ${timeoutMs}ms`);
    }
    
    // Check condition
    if (await condition()) {
      return;
    }
    
    // Don't wait after the last attempt
    if (attempt === maxAttempts) {
      break;
    }
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      initialDelayMs * Math.pow(2, attempt - 1),
      maxDelayMs
    );
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error(`Condition not met after ${maxAttempts} attempts`);
}

/**
 * Test stability checker - runs a test multiple times to check for flakiness
 */
export async function checkTestStability(
  testFn: () => Promise<void>,
  runs: number = 10
): Promise<{ passed: number; failed: number; errors: Error[] }> {
  let passed = 0;
  let failed = 0;
  const errors: Error[] = [];
  
  for (let i = 0; i < runs; i++) {
    try {
      await testFn();
      passed++;
    } catch (error) {
      failed++;
      errors.push(error as Error);
    }
  }
  
  return { passed, failed, errors };
}

/**
 * Parallel test runner with retry logic
 */
export async function runTestsWithRetry<T>(
  tests: Array<() => Promise<T>>,
  options: RetryOptions & { concurrency?: number } = {}
): Promise<T[]> {
  const { concurrency = 5, ...retryOptions } = options;
  const results: T[] = [];
  
  // Process tests in batches
  for (let i = 0; i < tests.length; i += concurrency) {
    const batch = tests.slice(i, i + concurrency);
    const batchPromises = batch.map(test => retryTest(test, retryOptions));
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}