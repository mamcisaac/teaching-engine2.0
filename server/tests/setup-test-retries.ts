import { afterEach } from '@jest/globals';

// Configuration for test retries
const RETRY_CONFIG = {
  maxRetries: process.env.CI ? 3 : 2, // More retries in CI
  retryableErrors: [
    'SQLITE_BUSY',
    'SQLITE_LOCKED',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'timeout',
    'Network',
  ],
  slowTestThreshold: 5000, // 5 seconds
};

// Track test performance
const testPerformance = new Map<string, number[]>();

// Global retry state
let currentTestRetries = 0;
let testStartTime = 0;

// Override Jest's test runner to add retry logic
const originalIt = global.it;
const originalTest = global.test;

function createRetryableTest(testFn: typeof it) {
  return (testName: string, fn: jest.TestFn, timeout?: number) => {
    const wrappedFn: jest.TestFn = async () => {
      testStartTime = Date.now();
      currentTestRetries = 0;
      
      let lastError: Error | null = null;
      
      for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            console.warn(`Retrying test "${testName}" (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1})`);
            
            // Add delay between retries
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
          
          // Run the actual test
          await fn();
          
          // Test passed, record performance
          const duration = Date.now() - testStartTime;
          recordTestPerformance(testName, duration);
          
          if (attempt > 0) {
            console.info(`Test "${testName}" passed after ${attempt} retries`);
          }
          
          return; // Success
        } catch (error) {
          lastError = error as Error;
          
          // Check if error is retryable
          const isRetryable = RETRY_CONFIG.retryableErrors.some(retryableError =>
            lastError?.message?.includes(retryableError) ||
            lastError?.stack?.includes(retryableError)
          );
          
          if (!isRetryable || attempt === RETRY_CONFIG.maxRetries) {
            // Not retryable or last attempt
            throw lastError;
          }
          
          currentTestRetries = attempt + 1;
        }
      }
      
      // Should never reach here, but throw last error just in case
      throw lastError;
    };
    
    return testFn(testName, wrappedFn, timeout);
  };
}

// Replace global test functions with retryable versions
global.it = createRetryableTest(originalIt) as typeof it;
global.test = createRetryableTest(originalTest) as typeof test;

// Also handle it.skip, it.only, etc.
global.it.skip = originalIt.skip;
global.it.only = createRetryableTest(originalIt.only as typeof it) as typeof it.only;
global.it.concurrent = originalIt.concurrent;
global.it.each = originalIt.each;
global.it.failing = originalIt.failing;

global.test.skip = originalTest.skip;
global.test.only = createRetryableTest(originalTest.only as typeof test) as typeof test.only;
global.test.concurrent = originalTest.concurrent;
global.test.each = originalTest.each;
global.test.failing = originalTest.failing;

// Record test performance
function recordTestPerformance(testName: string, duration: number) {
  if (!testPerformance.has(testName)) {
    testPerformance.set(testName, []);
  }
  
  const times = testPerformance.get(testName)!;
  times.push(duration);
  
  // Keep only last 10 runs
  if (times.length > 10) {
    times.shift();
  }
  
  // Warn about slow tests
  if (duration > RETRY_CONFIG.slowTestThreshold) {
    console.warn(`Slow test detected: "${testName}" took ${duration}ms`);
  }
}

// After each test, check for performance issues
afterEach(() => {
  const testName = expect.getState().currentTestName;
  if (testName && testPerformance.has(testName)) {
    const times = testPerformance.get(testName)!;
    if (times.length >= 3) {
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      if (avgTime > RETRY_CONFIG.slowTestThreshold) {
        console.warn(`Test "${testName}" is consistently slow: avg ${Math.round(avgTime)}ms`);
      }
    }
  }
});

// Export utilities for test monitoring
export function getTestPerformanceReport(): Record<string, { avg: number; min: number; max: number; runs: number }> {
  const report: Record<string, { avg: number; min: number; max: number; runs: number }> = {};
  
  testPerformance.forEach((times, testName) => {
    if (times.length > 0) {
      report[testName] = {
        avg: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        min: Math.min(...times),
        max: Math.max(...times),
        runs: times.length,
      };
    }
  });
  
  return report;
}

export function getSlowTests(threshold = RETRY_CONFIG.slowTestThreshold): string[] {
  const slowTests: string[] = [];
  
  testPerformance.forEach((times, testName) => {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    if (avgTime > threshold) {
      slowTests.push(testName);
    }
  });
  
  return slowTests;
}

export function getCurrentTestRetries(): number {
  return currentTestRetries;
}

// Log performance report at the end of test run
if (process.env.TEST_PERFORMANCE === 'true') {
  process.on('beforeExit', () => {
    const report = getTestPerformanceReport();
    const slowTests = getSlowTests();
    
    if (Object.keys(report).length > 0) {
      console.log('\n=== Test Performance Report ===');
      console.log('Slow tests:', slowTests.length);
      
      // Sort by average time descending
      const sorted = Object.entries(report)
        .sort(([, a], [, b]) => b.avg - a.avg)
        .slice(0, 10); // Top 10 slowest
      
      console.log('\nTop 10 slowest tests:');
      sorted.forEach(([name, stats]) => {
        console.log(`  ${name}: avg=${stats.avg}ms, min=${stats.min}ms, max=${stats.max}ms (${stats.runs} runs)`);
      });
    }
  });
}