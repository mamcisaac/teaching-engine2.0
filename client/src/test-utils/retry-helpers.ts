import { expect } from 'vitest';

/**
 * Retry Helpers for Integration Tests
 *
 * Provides utilities for implementing retry logic in tests,
 * particularly useful for integration tests with external dependencies.
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxAttempts?: number;

  /**
   * Delay between retry attempts in milliseconds
   * @default 1000
   */
  delay?: number;

  /**
   * Exponential backoff multiplier
   * @default 1.5
   */
  backoffMultiplier?: number;

  /**
   * Function to determine if error should trigger retry
   * @default () => true
   */
  shouldRetry?: (error: Error, attempt: number) => boolean;

  /**
   * Callback before each retry attempt
   */
  onRetry?: (error: Error, attempt: number) => void | Promise<void>;
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn Function to retry
 * @param options Retry configuration
 * @returns Result of successful function execution
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoffMultiplier = 1.5,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: Error;
  let currentDelay = delay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts || !shouldRetry(lastError, attempt)) {
        throw lastError;
      }

      if (onRetry) {
        await onRetry(lastError, attempt);
      }

      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay = Math.floor(currentDelay * backoffMultiplier);
    }
  }

  throw lastError!;
}

/**
 * Retry an assertion until it passes
 *
 * @param assertion Function containing assertions
 * @param options Retry configuration
 */
export async function retryAssertion(
  assertion: () => void | Promise<void>,
  options: RetryOptions = {},
): Promise<void> {
  return retry(
    async () => {
      await assertion();
    },
    {
      ...options,
      shouldRetry: (error, attempt) => {
        // Only retry assertion errors
        const isAssertionError =
          error.name === 'AssertionError' || (error instanceof Error ? error.message : String(error)).includes('expected');

        if (options.shouldRetry) {
          return isAssertionError && options.shouldRetry(error, attempt);
        }

        return isAssertionError;
      },
    },
  );
}

/**
 * Wait for a condition to be true with retries
 *
 * @param condition Function that returns true when condition is met
 * @param options Retry configuration
 */
export async function waitForWithRetry(
  condition: () => boolean | Promise<boolean>,
  options: RetryOptions = {},
): Promise<void> {
  return retry(async () => {
    const result = await condition();
    if (!result) {
      throw new Error('Condition not met');
    }
  }, options);
}

/**
 * Retry a test case
 *
 * @param testFn Test function to retry
 * @param options Retry configuration
 */
export function retryTest(testFn: () => void | Promise<void>, options: RetryOptions = {}) {
  return async () => {
    await retry(
      async () => {
        await testFn();
      },
      {
        maxAttempts: 3,
        delay: 500,
        ...options,
        onRetry: (error, attempt) => {
          // Test failed on attempt ${attempt}, retrying...
          if (options.onRetry) {
            return options.onRetry(error, attempt);
          }
        },
      },
    );
  };
}

/**
 * Create a flaky test handler that retries specific assertions
 *
 * @param options Retry configuration
 */
export function flakyTest(options: RetryOptions = {}) {
  return {
    /**
     * Expect with retry logic
     */
    expect: <T>(actual: T) => {
      const expectWrapper = {
        toBe: async (expected: T) => {
          await retryAssertion(() => {
            expect(actual).toBe(expected);
          }, options);
        },
        toEqual: async (expected: T) => {
          await retryAssertion(() => {
            expect(actual).toEqual(expected);
          }, options);
        },
        toContain: async (expected: unknown) => {
          await retryAssertion(() => {
            expect(actual).toContain(expected);
          }, options);
        },
        toHaveBeenCalled: async () => {
          await retryAssertion(() => {
            expect(actual).toHaveBeenCalled();
          }, options);
        },
        toHaveBeenCalledWith: async (...args: unknown[]) => {
          await retryAssertion(() => {
            expect(actual).toHaveBeenCalledWith(...args);
          }, options);
        },
      };

      return expectWrapper;
    },
  };
}

/**
 * Network-aware retry configuration
 *
 * @param baseOptions Base retry options
 * @returns Retry options configured for network operations
 */
export function networkRetryOptions(baseOptions: RetryOptions = {}): RetryOptions {
  return {
    maxAttempts: 5,
    delay: 2000,
    backoffMultiplier: 2,
    ...baseOptions,
    shouldRetry: (error, attempt) => {
      // Retry on network errors
      const isNetworkError =
        (error instanceof Error ? error.message : String(error)).includes('ECONNREFUSED') ||
        (error instanceof Error ? error.message : String(error)).includes('ETIMEDOUT') ||
        (error instanceof Error ? error.message : String(error)).includes('ENOTFOUND') ||
        (error instanceof Error ? error.message : String(error)).includes('network') ||
        (error instanceof Error ? error.message : String(error)).includes('fetch');

      if (baseOptions.shouldRetry) {
        return isNetworkError && baseOptions.shouldRetry(error, attempt);
      }

      return isNetworkError;
    },
  };
}

/**
 * Database-aware retry configuration
 *
 * @param baseOptions Base retry options
 * @returns Retry options configured for database operations
 */
export function databaseRetryOptions(baseOptions: RetryOptions = {}): RetryOptions {
  return {
    maxAttempts: 3,
    delay: 1000,
    backoffMultiplier: 1.5,
    ...baseOptions,
    shouldRetry: (error, attempt) => {
      // Retry on database errors
      const isDatabaseError =
        (error instanceof Error ? error.message : String(error)).includes('SQLITE_BUSY') ||
        (error instanceof Error ? error.message : String(error)).includes('deadlock') ||
        (error instanceof Error ? error.message : String(error)).includes('connection') ||
        (error instanceof Error ? error.message : String(error)).includes('timeout');

      if (baseOptions.shouldRetry) {
        return isDatabaseError && baseOptions.shouldRetry(error, attempt);
      }

      return isDatabaseError;
    },
  };
}

/**
 * Create a test suite with retry logic for all tests
 *
 * @param suiteName Name of the test suite
 * @param suiteFactory Function that defines the test suite
 * @param options Retry configuration
 */
export function retriableDescribe(
  suiteName: string,
  suiteFactory: () => void,
  options: RetryOptions = {},
) {
  describe(suiteName, () => {
    // Store original it function
    interface GlobalWithIt {
      it: (testName: string, testFn: () => void | Promise<void>) => void;
    }
    const globalWithIt = global as unknown as GlobalWithIt;
    const originalIt = globalWithIt.it;

    // Override it with retry logic
    beforeAll(() => {
      globalWithIt.it = (testName: string, testFn: () => void | Promise<void>) => {
        originalIt(testName, retryTest(testFn, options));
      };
    });

    // Restore original it function
    afterAll(() => {
      globalWithIt.it = originalIt;
    });

    // Run the test suite
    suiteFactory();
  });
}
