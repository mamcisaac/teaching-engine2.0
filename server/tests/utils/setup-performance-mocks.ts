/**
 * Mock setup for performance tests
 * Performance tests need real implementations but may mock expensive external calls
 */

import { jest } from '@jest/globals';
import { setupTestEnvironment } from './testHelpers';
import { createMockOpenAI } from './mockFactories';

// Set up test environment
setupTestEnvironment();

// Create mocks for external services that could affect performance measurements
const mockOpenAI = createMockOpenAI();

// Mock OpenAI to ensure consistent performance (no network latency)
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockOpenAI),
  OpenAI: jest.fn().mockImplementation(() => mockOpenAI),
}));

// Mock email service for performance tests
jest.mock('@/services/emailService', () => ({
  sendEmail: jest.fn().mockImplementation(async () => {
    // Simulate some processing time but keep it consistent
    await new Promise(resolve => setTimeout(resolve, 10));
    return true;
  }),
  sendBulkEmails: jest.fn().mockImplementation(async (emails) => {
    // Simulate bulk processing time
    await new Promise(resolve => setTimeout(resolve, emails.length * 2));
    return { sent: emails, failed: [] };
  }),
}));

// For performance tests, we want to measure real database operations
// so we don't mock the database layer

// Store mock instances globally for test access
const globalForTest = globalThis as unknown as {
  performanceMocks: {
    openai: typeof mockOpenAI;
  };
};

globalForTest.performanceMocks = {
  openai: mockOpenAI,
};

// Performance testing utilities
export const measurePerformance = async <T>(
  name: string,
  operation: () => Promise<T>
): Promise<{ result: T; duration: number; memory: NodeJS.MemoryUsage }> => {
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }

  const startMemory = process.memoryUsage();
  const startTime = process.hrtime.bigint();

  const result = await operation();

  const endTime = process.hrtime.bigint();
  const endMemory = process.memoryUsage();

  const duration = Number(endTime - startTime) / 1_000_000; // Convert to milliseconds
  const memoryDelta = {
    rss: endMemory.rss - startMemory.rss,
    heapTotal: endMemory.heapTotal - startMemory.heapTotal,
    heapUsed: endMemory.heapUsed - startMemory.heapUsed,
    external: endMemory.external - startMemory.external,
    arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
  };

  console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
  console.log(`Memory delta: ${JSON.stringify(memoryDelta, null, 2)}`);

  return { result, duration, memory: memoryDelta };
};

export const performanceBenchmark = {
  /**
   * Runs an operation multiple times and returns statistics
   */
  run: async <T>(
    name: string,
    operation: () => Promise<T>,
    iterations: number = 10
  ): Promise<{
    results: T[];
    stats: {
      min: number;
      max: number;
      avg: number;
      median: number;
      p95: number;
      p99: number;
    };
  }> => {
    const measurements: { result: T; duration: number }[] = [];

    for (let i = 0; i < iterations; i++) {
      const measurement = await measurePerformance(`${name}-${i + 1}`, operation);
      measurements.push({
        result: measurement.result,
        duration: measurement.duration,
      });
    }

    const durations = measurements.map(m => m.duration).sort((a, b) => a - b);
    const results = measurements.map(m => m.result);

    const stats = {
      min: Math.min(...durations),
      max: Math.max(...durations),
      avg: durations.reduce((a, b) => a + b, 0) / durations.length,
      median: durations[Math.floor(durations.length / 2)],
      p95: durations[Math.floor(durations.length * 0.95)],
      p99: durations[Math.floor(durations.length * 0.99)],
    };

    console.log(`Benchmark [${name}] (${iterations} iterations):`);
    console.log(`  Min: ${stats.min.toFixed(2)}ms`);
    console.log(`  Max: ${stats.max.toFixed(2)}ms`);
    console.log(`  Avg: ${stats.avg.toFixed(2)}ms`);
    console.log(`  Median: ${stats.median.toFixed(2)}ms`);
    console.log(`  P95: ${stats.p95.toFixed(2)}ms`);
    console.log(`  P99: ${stats.p99.toFixed(2)}ms`);

    return { results, stats };
  },
};

// Export for direct use in tests
export {
  mockOpenAI,
};