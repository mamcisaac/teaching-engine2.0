/**
 * General test helper functions and utilities
 */

import { randomBytes } from 'crypto';
import { jest } from '@jest/globals';

/**
 * Sets up common test environment variables
 */
export const setupTestEnvironment = () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'file:./test.db';
  process.env.JWT_SECRET = randomBytes(32).toString('hex');
  process.env.OPENAI_API_KEY = 'test-api-key';
  
  // Suppress console warnings in tests unless debugging
  if (!process.env.DEBUG_TESTS) {
    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      // Only show warnings that might be important for tests
      const message = args.join(' ');
      if (message.includes('deprecated') || message.includes('experimental')) {
        return; // Suppress these warnings
      }
      originalConsoleWarn.apply(console, args);
    };
  }
};

/**
 * Creates a mock logger instance for testing
 */
export const createMockLogger = () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn(() => createMockLogger()),
});

/**
 * Creates a test timeout wrapper that fails tests that run too long
 */
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Test timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
};

/**
 * Waits for a condition to be true within a timeout period
 */
export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> => {
  const { timeout = 5000, interval = 100 } = options;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

/**
 * Creates a spy on console methods for testing log output
 */
export const createConsoleSpy = () => {
  const originalConsole = { ...console };
  const spies = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  };

  // Replace console methods
  Object.assign(console, spies);

  return {
    spies,
    restore: () => Object.assign(console, originalConsole),
  };
};

/**
 * Generates random test data
 */
export const generateTestData = {
  randomId: () => `test-${randomBytes(8).toString('hex')}`,
  randomEmail: () => `test-${randomBytes(4).toString('hex')}@example.com`,
  randomString: (length: number = 10) => randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length),
  randomNumber: (min: number = 0, max: number = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
  randomDate: () => new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
};

/**
 * Utility to clean up async operations in tests
 */
export class TestCleanup {
  private cleanupTasks: Array<() => Promise<void> | void> = [];

  add(task: () => Promise<void> | void) {
    this.cleanupTasks.push(task);
  }

  async run() {
    for (const task of this.cleanupTasks.reverse()) {
      try {
        await task();
      } catch (error) {
        console.error('Cleanup task failed:', error);
      }
    }
    this.cleanupTasks = [];
  }
}

/**
 * Creates a test cleanup instance for use in tests
 */
export const createTestCleanup = () => new TestCleanup();

/**
 * Deep comparison utility for test assertions
 */
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
};

/**
 * Retries a test function with exponential backoff
 */
export const retryTest = async <T>(
  testFn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number } = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelay = 100 } = options;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await testFn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw new Error(`Test failed after ${maxRetries} attempts. Last error: ${lastError.message}`);
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};