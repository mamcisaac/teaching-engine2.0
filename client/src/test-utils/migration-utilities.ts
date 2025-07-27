/**
 * Migration Utilities for Real Implementation Testing
 *
 * These utilities help developers migrate existing mock-based tests
 * to use real implementations while maintaining test reliability.
 */

import React from 'react';
import { renderWithProviders } from './test-providers';
import type { CustomRenderOptions } from './test-providers';
import { logger } from '../utils/logger';

// Migration configuration
export interface MigrationConfig {
  phase: 'mock' | 'hybrid' | 'real';
  enableComparison?: boolean;
  logDifferences?: boolean;
  tolerateSlowTests?: boolean;
  maxResponseTime?: number;
}

// Migration phase detector
export function detectMigrationPhase(): MigrationConfig['phase'] {
  const envPhase = process.env.VITE_MIGRATION_PHASE as MigrationConfig['phase'];
  if (envPhase) return envPhase;

  // Auto-detect based on environment
  if (process.env.NODE_ENV === 'test' && process.env.VITE_USE_REAL_API === 'true') {
    return 'real';
  }

  return 'mock'; // Default to mock for safety
}

/**
 * Progressive migration helper
 * Allows tests to gradually move from mock to real implementations
 */
export class TestMigrationHelper {
  private config: MigrationConfig;
  private testResults: Array<{
    testName: string;
    mockResult?: unknown;
    realResult?: unknown;
    differences?: Array<{
      path: string;
      mockValue: unknown;
      realValue: unknown;
    }>;
    performance?: { mock: number; real: number };
  }> = [];

  constructor(config: Partial<MigrationConfig> = {}) {
    this.config = {
      phase: detectMigrationPhase(),
      enableComparison: false,
      logDifferences: true,
      tolerateSlowTests: true,
      maxResponseTime: 5000,
      ...config,
    };
  }

  /**
   * Render component with migration-aware providers
   */
  async renderWithMigration(
    ui: React.ReactElement,
    testName: string,
    options: CustomRenderOptions = {},
  ) {
    const phase = this.config.phase;

    switch (phase) {
      case 'mock':
        return renderWithProviders(ui, {
          ...options,
          useMockProviders: true,
        });

      case 'hybrid':
        return this.renderWithComparison(ui, testName, options);

      case 'real':
        return renderWithProviders(ui, {
          ...options,
          useMockProviders: false,
          testConfig: {
            useRealApi: true,
            enableCache: false,
          },
        });

      default:
        throw new Error(`Unknown migration phase: ${phase}`);
    }
  }

  /**
   * Render with both mock and real implementations for comparison
   */
  private async renderWithComparison(
    ui: React.ReactElement,
    testName: string,
    options: CustomRenderOptions,
  ) {
    const results: {
      testName: string;
      mockResult?: unknown;
      realResult?: unknown;
      differences?: Array<{
        path: string;
        mockValue: unknown;
        realValue: unknown;
      }>;
      performance?: { mock: number; real: number };
    } = { testName };

    if (this.config.enableComparison) {
      // Test with mock first (faster)
      const mockStart = performance.now();
      const mockResult = renderWithProviders(ui, {
        ...options,
        useMockProviders: true,
      });
      const mockTime = performance.now() - mockStart;
      results.mockResult = mockResult;
      results.performance = { mock: mockTime, real: 0 };

      // Clean up mock result
      mockResult.unmount();

      // Test with real implementation
      const realStart = performance.now();
      const realResult = renderWithProviders(ui, {
        ...options,
        useMockProviders: false,
      });
      const realTime = performance.now() - realStart;
      results.realResult = realResult;
      results.performance.real = realTime;

      // Log performance comparison
      if (this.config.logDifferences) {
        this.logPerformanceComparison(testName, mockTime, realTime);
      }

      this.testResults.push(results);
      return realResult;
    }

    // Default to real implementation in hybrid mode
    return renderWithProviders(ui, {
      ...options,
      useMockProviders: false,
    });
  }

  /**
   * Test API calls with migration awareness
   */
  async testApiWithMigration<T>(
    apiCall: () => Promise<T>,
    testName: string,
    mockImplementation?: () => Promise<T>,
  ): Promise<T> {
    const phase = this.config.phase;

    switch (phase) {
      case 'mock':
        if (!mockImplementation) {
          throw new Error(`Mock implementation required for test: ${testName}`);
        }
        return mockImplementation();

      case 'hybrid':
        if (this.config.enableComparison && mockImplementation) {
          return this.compareApiImplementations(apiCall, mockImplementation, testName);
        }
      // Fall through to real implementation

      case 'real': {
        const start = performance.now();
        const result = await apiCall();
        const duration = performance.now() - start;

        if (duration > (this.config.maxResponseTime ?? 5000)) {
          console.warn(`Slow API call in ${testName}: ${duration}ms`);
        }

        return result;
      }

      default:
        throw new Error(`Unknown migration phase: ${phase}`);
    }
  }

  /**
   * Compare mock and real API implementations
   */
  private async compareApiImplementations<T>(
    realApi: () => Promise<T>,
    mockApi: () => Promise<T>,
    testName: string,
  ): Promise<T> {
    const mockStart = performance.now();
    const mockResult = await mockApi();
    const mockTime = performance.now() - mockStart;

    const realStart = performance.now();
    const realResult = await realApi();
    const realTime = performance.now() - realStart;

    // Compare results structure (not exact values)
    const differences = this.findDifferences(mockResult, realResult);

    if (differences.length > 0 && this.config.logDifferences) {
      console.warn(`API differences in ${testName}:`, differences);
    }

    this.testResults.push({
      testName,
      mockResult,
      realResult,
      differences,
      performance: { mock: mockTime, real: realTime },
    });

    this.logPerformanceComparison(testName, mockTime, realTime);
    return realResult;
  }

  /**
   * Find differences between mock and real results
   */
  private findDifferences(
    mock: unknown,
    real: unknown,
    path = '',
  ): Array<{
    path: string;
    mockValue: unknown;
    realValue: unknown;
  }> {
    const differences: Array<{
      path: string;
      mockValue: unknown;
      realValue: unknown;
    }> = [];

    // Type comparison
    if (typeof mock != typeof real) {
      differences.push({
        path: path ?? 'root',
        mockValue: mock,
        realValue: real,
      });
      return differences;
    }

    // Array comparison
    if (Array.isArray(mock) && Array.isArray(real)) {
      if (mock.length != real.length) {
        differences.push({
          path: `${path}.length`,
          mockValue: mock.length,
          realValue: real.length,
        });
      }
      return differences;
    }

    // Object property comparison
    if (mock && real && typeof mock === 'object') {
      const mockObj = mock as Record<string, unknown>;
      const realObj = real as Record<string, unknown>;
      const mockKeys = Object.keys(mockObj);
      const realKeys = Object.keys(realObj);

      const missingInReal = mockKeys.filter((key) => !realKeys.includes(key));
      const extraInReal = realKeys.filter((key) => !mockKeys.includes(key));

      missingInReal.forEach((key) => {
        differences.push({
          path: `${path}.${key}`,
          mockValue: mockObj[key],
          realValue: undefined,
        });
      });

      extraInReal.forEach((key) => {
        differences.push({
          path: `${path}.${key}`,
          mockValue: undefined,
          realValue: realObj[key],
        });
      });
    }

    return differences;
  }

  /**
   * Log performance comparison
   */
  private logPerformanceComparison(testName: string, mockTime: number, realTime: number) {
    const ratio = realTime / mockTime;
    let status = '✅';
    if (ratio > 10) {
      status = '⚠️';
    } else if (ratio > 3) {
      status = '⏳';
    }

    logger.info(
      `${status} ${testName} - Mock: ${mockTime.toFixed(1)}ms, Real: ${realTime.toFixed(1)}ms (${ratio.toFixed(1)}x)`,
    );
  }

  /**
   * Generate migration report
   */
  generateReport(): {
    summary: {
      totalTests: number;
      averageSlowdown: number;
      slowTests: string[];
      testsWithDifferences: string[];
    };
    recommendations: string[];
  } {
    if (this.testResults.length === 0) {
      return {
        summary: {
          totalTests: 0,
          averageSlowdown: 0,
          slowTests: [],
          testsWithDifferences: [],
        },
        recommendations: ['No migration tests run yet'],
      };
    }

    const performanceData = this.testResults
      .filter((r) => r.performance)
      .map((r) => r.performance!);

    const slowdowns = performanceData.map((p) => p.real / p.mock);
    const averageSlowdown = slowdowns.reduce((a, b) => a + b, 0) / slowdowns.length;

    const slowTests = this.testResults
      .filter((r) => r.performance && r.performance.real > 1000)
      .map((r) => r.testName);

    const testsWithDifferences = this.testResults
      .filter((r) => r.differences && r.differences.length > 0)
      .map((r) => r.testName);

    const recommendations: string[] = [];

    if (averageSlowdown > 5) {
      recommendations.push('Consider optimizing real API performance or using selective mocking');
    }

    if (slowTests.length > 0) {
      recommendations.push(`Investigate slow tests: ${slowTests.join(', ')}`);
    }

    if (testsWithDifferences.length > 0) {
      recommendations.push('Review and align mock implementations with real API responses');
    }

    return {
      summary: {
        totalTests: this.testResults.length,
        averageSlowdown,
        slowTests,
        testsWithDifferences,
      },
      recommendations,
    };
  }

  /**
   * Clean up migration data
   */
  cleanup() {
    this.testResults = [];
  }
}

/**
 * Simple migration utilities for common scenarios
 */
export const migrationUtils = {
  /**
   * Create a migration-aware test function
   */
  createMigrationTest: (config?: Partial<MigrationConfig>) => {
    const helper = new TestMigrationHelper(config);

    return {
      render: (ui: React.ReactElement, testName: string, options?: CustomRenderOptions) =>
        helper.renderWithMigration(ui, testName, options),

      testApi: <T>(apiCall: () => Promise<T>, testName: string, mockImpl?: () => Promise<T>) =>
        helper.testApiWithMigration(apiCall, testName, mockImpl),

      report: () => helper.generateReport(),
      cleanup: () => helper.cleanup(),
    };
  },

  /**
   * Detect if test should use real implementations
   */
  shouldUseRealImplementations: (): boolean => {
    return detectMigrationPhase() === 'real';
  },

  /**
   * Conditional test skipping based on migration phase
   */
  skipIfNotReal: (testFn: () => void, reason?: string) => {
    if (detectMigrationPhase() != 'real') {
      return test.skip(`Skipped - not in real mode: ${reason ?? 'requires real implementation'}`);
    }
    return testFn();
  },

  /**
   * Performance-aware test wrapper
   */
  expectPerformance: async <T>(
    operation: () => Promise<T>,
    maxTime: number = 1000,
    operationName: string = 'operation',
  ): Promise<T> => {
    const start = performance.now();
    const result = await operation();
    const duration = performance.now() - start;

    if (duration > maxTime) {
      console.warn(`Performance warning: ${operationName} took ${duration}ms (max: ${maxTime}ms)`);
    }

    return result;
  },
};

/**
 * Environment setup for migration testing
 */
export function setupMigrationEnvironment(phase: MigrationConfig['phase']) {
  // Set environment variables
  if (typeof process != 'undefined') {
    process.env.VITE_MIGRATION_PHASE = phase;
    process.env.VITE_USE_REAL_API = phase === 'real' ? 'true' : 'false';
  }

  // Configure global test settings
  const globalConfig = {
    testTimeout: phase === 'real' ? 15000 : 5000,
    retryCount: phase === 'real' ? 2 : 0,
  };

  return globalConfig;
}

/**
 * Migration-aware test setup
 */
export function setupMigrationTest(config?: Partial<MigrationConfig>) {
  const helper = new TestMigrationHelper(config);

  // Setup before each test
  beforeEach(() => {
    helper.cleanup();
  });

  // Cleanup after all tests
  afterAll(() => {
    const report = helper.generateReport();
    if (report.summary.totalTests > 0) {
      logger.info('Migration Test Report:', report);
    }
  });

  return helper;
}
