/**
 * Performance Test Utilities for Real Implementation Testing
 * 
 * Provides utilities for optimizing test performance when using real implementations
 * while maintaining test reliability and developer experience.
 */

import { PrismaClient } from '@teaching-engine/database';
import { createTestUtils } from './test-utils';

// Performance monitoring interfaces
interface PerformanceMetrics {
  testName: string;
  setupTime: number;
  executionTime: number;
  teardownTime: number;
  totalTime: number;
  databaseQueries: number;
  memoryUsage: {
    before: number;
    after: number;
    delta: number;
  };
  isAcceptable: boolean;
}

interface OptimizationConfig {
  enableCaching?: boolean;
  maxExecutionTime?: number;
  maxMemoryUsage?: number;
  enableQueryOptimization?: boolean;
  enableConnectionPooling?: boolean;
  batchSize?: number;
}

/**
 * Performance test manager for real implementations
 */
export class PerformanceTestManager {
  private metrics: PerformanceMetrics[] = [];
  private config: OptimizationConfig;
  private queryCache = new Map<string, any>();
  private connectionPool: PrismaClient[] = [];

  constructor(config: OptimizationConfig = {}) {
    this.config = {
      enableCaching: false, // Disabled by default for test isolation
      maxExecutionTime: 5000, // 5 seconds
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      enableQueryOptimization: true,
      enableConnectionPooling: false, // Use transactions instead
      batchSize: 100,
      ...config,
    };
  }

  /**
   * Measure test performance with detailed metrics
   */
  async measureTestPerformance<T>(
    testName: string,
    testFn: () => Promise<T>,
    setupFn?: () => Promise<void>,
    teardownFn?: () => Promise<void>
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const startTime = performance.now();
    const initialMemory = this.getMemoryUsage();

    // Setup phase
    const setupStart = performance.now();
    if (setupFn) {
      await setupFn();
    }
    const setupTime = performance.now() - setupStart;

    // Execution phase
    const executionStart = performance.now();
    const result = await testFn();
    const executionTime = performance.now() - executionStart;

    // Teardown phase
    const teardownStart = performance.now();
    if (teardownFn) {
      await teardownFn();
    }
    const teardownTime = performance.now() - teardownStart;

    const totalTime = performance.now() - startTime;
    const finalMemory = this.getMemoryUsage();

    const metrics: PerformanceMetrics = {
      testName,
      setupTime,
      executionTime,
      teardownTime,
      totalTime,
      databaseQueries: 0, // Would need query counting mechanism
      memoryUsage: {
        before: initialMemory,
        after: finalMemory,
        delta: finalMemory - initialMemory,
      },
      isAcceptable: this.isPerformanceAcceptable(totalTime, finalMemory - initialMemory),
    };

    this.metrics.push(metrics);
    this.logPerformanceWarnings(metrics);

    return { result, metrics };
  }

  /**
   * Optimized database operation wrapper
   */
  async optimizedDatabaseOperation<T>(
    prisma: PrismaClient,
    operation: (utils: ReturnType<typeof createTestUtils>) => Promise<T>,
    operationName: string
  ): Promise<T> {
    const utils = createTestUtils(prisma, {
      enablePerformanceMonitoring: true,
      enableDataValidation: this.config.enableQueryOptimization,
    });

    if (this.config.enableCaching) {
      const cacheKey = `${operationName}-${JSON.stringify(arguments)}`;
      if (this.queryCache.has(cacheKey)) {
        return this.queryCache.get(cacheKey);
      }
    }

    const result = await operation(utils);

    if (this.config.enableCaching) {
      const cacheKey = `${operationName}-${JSON.stringify(arguments)}`;
      this.queryCache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Batch operations for better performance
   */
  async batchDatabaseOperations<T, R>(
    items: T[],
    operation: (batch: T[]) => Promise<R[]>,
    batchSize: number = this.config.batchSize || 100
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await operation(batch);
      results.push(...batchResults);
      
      // Small delay to prevent overwhelming the database
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }

  /**
   * Parallel test execution with resource management
   */
  async runParallelTests<T>(
    tests: Array<{ name: string; fn: () => Promise<T> }>,
    maxConcurrency: number = 5
  ): Promise<Array<{ name: string; result?: T; error?: Error; metrics: PerformanceMetrics }>> {
    const results: Array<{ name: string; result?: T; error?: Error; metrics: PerformanceMetrics }> = [];
    
    // Process tests in chunks to control concurrency
    for (let i = 0; i < tests.length; i += maxConcurrency) {
      const batch = tests.slice(i, i + maxConcurrency);
      
      const batchPromises = batch.map(async test => {
        try {
          const { result, metrics } = await this.measureTestPerformance(
            test.name,
            test.fn
          );
          return { name: test.name, result, metrics };
        } catch (error) {
          const errorMetrics: PerformanceMetrics = {
            testName: test.name,
            setupTime: 0,
            executionTime: 0,
            teardownTime: 0,
            totalTime: 0,
            databaseQueries: 0,
            memoryUsage: { before: 0, after: 0, delta: 0 },
            isAcceptable: false,
          };
          return { name: test.name, error: error as Error, metrics: errorMetrics };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Brief pause between batches
      if (i + maxConcurrency < tests.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return results;
  }

  /**
   * Memory-aware test data creation
   */
  async createOptimizedTestData(
    prisma: PrismaClient,
    config: {
      users?: number;
      subjects?: number;
      outcomes?: number;
      chunkSize?: number;
    }
  ) {
    const { users = 1, subjects = 2, outcomes = 10, chunkSize = 50 } = config;
    
    const utils = createTestUtils(prisma);
    const created: any = {
      users: [],
      subjects: [],
      outcomes: [],
    };

    // Create users in chunks for better memory management
    if (users > 0) {
      const userBatches = Math.ceil(users / chunkSize);
      for (let batch = 0; batch < userBatches; batch++) {
        const batchSize = Math.min(chunkSize, users - batch * chunkSize);
        const userPromises = Array.from({ length: batchSize }, (_, i) => {
          const userIndex = batch * chunkSize + i;
          return prisma.user.create({
            data: {
              email: `test-user-${Date.now()}-${userIndex}@example.com`,
              name: `Test User ${userIndex}`,
              password: 'hashedPassword123',
              role: 'USER',
            }
          });
        });
        
        const batchUsers = await Promise.all(userPromises);
        created.users.push(...batchUsers);
        
        // Force garbage collection hint
        if (global.gc) {
          global.gc();
        }
      }
    }

    // Create other entities similarly...
    // (Similar pattern for subjects and outcomes)

    return created;
  }

  /**
   * Test data cleanup optimization
   */
  async optimizedCleanup(
    prisma: PrismaClient,
    strategy: 'cascade' | 'reverse-order' | 'parallel' = 'reverse-order'
  ): Promise<void> {
    const startTime = performance.now();

    try {
      switch (strategy) {
        case 'cascade':
          // Let database handle cascading deletes
          await prisma.user.deleteMany({});
          break;
          
        case 'reverse-order':
          // Delete in reverse dependency order
          await prisma.activity.deleteMany({});
          await prisma.outcome.deleteMany({});
          await prisma.subject.deleteMany({});
          await prisma.user.deleteMany({});
          break;
          
        case 'parallel':
          // Delete independent entities in parallel
          await Promise.all([
            prisma.activity.deleteMany({}),
            // Add other independent entities
          ]);
          await prisma.outcome.deleteMany({});
          await prisma.subject.deleteMany({});
          await prisma.user.deleteMany({});
          break;
      }
    } catch (error) {
      console.warn('Cleanup optimization failed, falling back to basic cleanup:', error);
      // Fallback to basic cleanup
      const utils = createTestUtils(prisma);
      await utils.cleanTables(['Activity', 'Outcome', 'Subject', 'User']);
    }

    const cleanupTime = performance.now() - startTime;
    if (cleanupTime > 1000) {
      console.warn(`Slow cleanup detected: ${cleanupTime}ms`);
    }
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    summary: {
      totalTests: number;
      averageExecutionTime: number;
      slowestTest: string | null;
      fastestTest: string | null;
      memoryLeaks: number;
      failedTests: number;
    };
    recommendations: string[];
    detailedMetrics: PerformanceMetrics[];
  } {
    if (this.metrics.length === 0) {
      return {
        summary: {
          totalTests: 0,
          averageExecutionTime: 0,
          slowestTest: null,
          fastestTest: null,
          memoryLeaks: 0,
          failedTests: 0,
        },
        recommendations: ['No performance data available'],
        detailedMetrics: [],
      };
    }

    const executionTimes = this.metrics.map(m => m.executionTime);
    const averageExecutionTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
    
    const slowestTest = this.metrics.reduce((prev, curr) => 
      prev.executionTime > curr.executionTime ? prev : curr
    );
    
    const fastestTest = this.metrics.reduce((prev, curr) => 
      prev.executionTime < curr.executionTime ? prev : curr
    );

    const memoryLeaks = this.metrics.filter(m => m.memoryUsage.delta > 50 * 1024 * 1024).length;
    const failedTests = this.metrics.filter(m => !m.isAcceptable).length;

    const recommendations: string[] = [];
    
    if (averageExecutionTime > 2000) {
      recommendations.push('Consider enabling query optimization or reducing test data size');
    }
    
    if (memoryLeaks > 0) {
      recommendations.push('Memory leaks detected - review test cleanup procedures');
    }
    
    if (failedTests > this.metrics.length * 0.1) {
      recommendations.push('High number of performance failures - review test thresholds');
    }

    return {
      summary: {
        totalTests: this.metrics.length,
        averageExecutionTime,
        slowestTest: slowestTest.testName,
        fastestTest: fastestTest.testName,
        memoryLeaks,
        failedTests,
      },
      recommendations,
      detailedMetrics: this.metrics,
    };
  }

  /**
   * Clear performance data and caches
   */
  cleanup(): void {
    this.metrics = [];
    this.queryCache.clear();
    this.connectionPool.forEach(client => client.$disconnect());
    this.connectionPool = [];
  }

  // Private helper methods
  private getMemoryUsage(): number {
    return process.memoryUsage().heapUsed;
  }

  private isPerformanceAcceptable(totalTime: number, memoryDelta: number): boolean {
    return totalTime <= this.config.maxExecutionTime! && 
           memoryDelta <= this.config.maxMemoryUsage!;
  }

  private logPerformanceWarnings(metrics: PerformanceMetrics): void {
    if (!metrics.isAcceptable) {
      console.warn(`⚠️ Performance warning for ${metrics.testName}:`);
      
      if (metrics.totalTime > this.config.maxExecutionTime!) {
        console.warn(`  - Slow execution: ${metrics.totalTime}ms (max: ${this.config.maxExecutionTime}ms)`);
      }
      
      if (metrics.memoryUsage.delta > this.config.maxMemoryUsage!) {
        console.warn(`  - High memory usage: ${(metrics.memoryUsage.delta / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }
}

/**
 * Global performance test utilities
 */
export const performanceTestUtils = {
  /**
   * Create a performance-optimized test environment
   */
  createOptimizedTestEnvironment: (config?: OptimizationConfig) => {
    return new PerformanceTestManager(config);
  },

  /**
   * Quick performance test wrapper
   */
  withPerformanceMonitoring: async <T>(
    testName: string,
    testFn: () => Promise<T>,
    maxTime: number = 5000
  ): Promise<T> => {
    const manager = new PerformanceTestManager({ maxExecutionTime: maxTime });
    const { result } = await manager.measureTestPerformance(testName, testFn);
    return result;
  },

  /**
   * Batch operation helper
   */
  batchProcess: async <T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 50
  ): Promise<R[]> => {
    const manager = new PerformanceTestManager({ batchSize });
    return manager.batchDatabaseOperations(items, async (batch) => {
      return Promise.all(batch.map(processor));
    }, batchSize);
  },

  /**
   * Memory usage monitor
   */
  monitorMemoryUsage: () => {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      rss: Math.round(usage.rss / 1024 / 1024), // MB
    };
  },
};

/**
 * Performance test setup helper
 */
export function setupPerformanceTests(config?: OptimizationConfig) {
  const manager = new PerformanceTestManager(config);
  
  afterAll(() => {
    const report = manager.generatePerformanceReport();
    if (report.summary.totalTests > 0) {
      console.log('\n📊 Performance Test Report:');
      console.log(`Tests: ${report.summary.totalTests}`);
      console.log(`Average execution time: ${report.summary.averageExecutionTime.toFixed(2)}ms`);
      console.log(`Slowest test: ${report.summary.slowestTest}`);
      console.log(`Memory leaks: ${report.summary.memoryLeaks}`);
      
      if (report.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        report.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
    }
    
    manager.cleanup();
  });
  
  return manager;
}