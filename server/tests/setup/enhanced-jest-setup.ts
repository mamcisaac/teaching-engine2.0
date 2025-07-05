/**
 * Enhanced Jest Setup with Real Database Support
 * 
 * This setup provides:
 * - Real database connections for all tests
 * - Proper test isolation using transactions/schemas
 * - Test data factories for easy data creation
 * - Performance monitoring
 */

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { 
  setupTestDatabase, 
  setupIsolatedTest,
  cleanupIsolatedTest,
  TestDatabaseContext,
  isTestDatabaseHealthy,
  getTestDatabaseMetrics
} from '../database/test-database-setup';
import { resetRateLimiterState } from '../../src/middleware/rateLimiter';

// Global test context
let testContext: TestDatabaseContext | null = null;
let currentTestPrisma: any = null;

// Track test performance
let testStartTime: number;
let testStats = {
  totalTests: 0,
  failedTests: 0,
  totalDuration: 0,
};

/**
 * Setup before all tests in a file
 */
beforeAll(async () => {
  try {
    // Setup test database
    testContext = await setupTestDatabase({
      testType: process.env.TEST_TYPE,
    });
    
    // Set global test client for compatibility
    const globalForPrisma = globalThis as any;
    globalForPrisma.testPrismaClient = testContext.prisma;
    
    // Verify database health
    const isHealthy = await isTestDatabaseHealthy(testContext.workerId);
    if (!isHealthy) {
      throw new Error('Test database is not healthy');
    }
    
    console.log(`✅ Test database ready for worker ${testContext.workerId}`);
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
});

/**
 * Setup before each test
 */
beforeEach(async () => {
  if (!testContext) {
    throw new Error('Test context not initialized');
  }
  
  // Record test start time
  testStartTime = Date.now();
  testStats.totalTests++;
  
  try {
    // Reset rate limiter
    resetRateLimiterState();
    
    // Setup isolated test environment
    currentTestPrisma = await setupIsolatedTest(testContext);
    
    // Update global client for the test
    const globalForPrisma = globalThis as any;
    globalForPrisma.testPrismaClient = currentTestPrisma;
    
  } catch (error) {
    console.error('Failed to setup test isolation:', error);
    testStats.failedTests++;
    throw error;
  }
});

/**
 * Cleanup after each test
 */
afterEach(async () => {
  if (testContext) {
    try {
      // Record test duration
      const duration = Date.now() - testStartTime;
      testStats.totalDuration += duration;
      
      // Log slow tests
      if (duration > 5000) {
        console.warn(`⚠️ Slow test detected: ${duration}ms`);
      }
      
      // Cleanup test isolation
      await cleanupIsolatedTest(testContext);
      
      // Reset global client
      const globalForPrisma = globalThis as any;
      globalForPrisma.testPrismaClient = testContext.prisma;
      
    } catch (error) {
      console.error('Failed to cleanup test:', error);
      testStats.failedTests++;
    }
  }
  
  currentTestPrisma = null;
});

/**
 * Cleanup after all tests
 */
afterAll(async () => {
  if (testContext) {
    try {
      // Log test statistics
      if (process.env.DEBUG_TESTS === 'true') {
        console.log('\n📊 Test Statistics:');
        console.log(`- Total tests: ${testStats.totalTests}`);
        console.log(`- Failed tests: ${testStats.failedTests}`);
        console.log(`- Average duration: ${Math.round(testStats.totalDuration / testStats.totalTests)}ms`);
        console.log(`- Total duration: ${testStats.totalDuration}ms`);
        
        // Log database metrics
        const dbMetrics = getTestDatabaseMetrics();
        console.log('\n🗄️ Database Metrics:');
        console.log(`- Total queries: ${dbMetrics.totalQueries}`);
        console.log(`- Active transactions: ${dbMetrics.activeTransactions}`);
        console.log(`- Uptime: ${dbMetrics.uptime}ms`);
      }
      
      // Cleanup test data factory
      await testContext.factory.cleanup();
      
    } catch (error) {
      console.warn('Failed to cleanup test context:', error);
    }
  }
  
  // Reset test stats
  testStats = {
    totalTests: 0,
    failedTests: 0,
    totalDuration: 0,
  };
});

/**
 * Get current test context
 */
export function getTestContext(): TestDatabaseContext {
  if (!testContext) {
    throw new Error('Test context not initialized. Make sure tests are running with proper setup.');
  }
  return testContext;
}

/**
 * Get current test Prisma client
 */
export function getTestPrismaClient() {
  return currentTestPrisma || testContext?.prisma;
}

/**
 * Helper to create test data
 */
export function createTestData() {
  const context = getTestContext();
  return {
    user: (overrides?: any) => context.factory.userFactory.create(overrides),
    expectation: (overrides?: any) => context.factory.curriculumFactory.create(overrides),
    longRangePlan: (overrides?: any) => context.factory.longRangePlanFactory.create(overrides),
    unitPlan: (overrides?: any) => context.factory.unitPlanFactory.create(overrides),
    lessonPlan: (overrides?: any) => context.factory.lessonPlanFactory.create(overrides),
    daybookEntry: (overrides?: any) => context.factory.daybookFactory.create(overrides),
    substitutePlan: (overrides?: any) => context.factory.substitutePlanFactory.create(overrides),
    
    // Batch creation helpers
    users: (count: number, overrides?: any) => 
      context.factory.userFactory.createMany(count, overrides),
    expectations: (count: number, overrides?: any) => 
      context.factory.curriculumFactory.createMany(count, overrides),
  };
}

/**
 * Test scenario helpers
 */
export const testScenarios = {
  /**
   * Create a complete teacher planning scenario
   */
  teacherWithPlans: async (options?: any) => {
    const context = getTestContext();
    return context.factory.createTeacherScenario(options);
  },
  
  /**
   * Create minimal test data
   */
  minimal: async () => {
    const context = getTestContext();
    return context.factory.createMinimalTestData();
  },
  
  /**
   * Create integration test data
   */
  integration: async () => {
    const context = getTestContext();
    return context.factory.createIntegrationTestData();
  },
  
  /**
   * Create bilingual test data
   */
  bilingual: async () => {
    const context = getTestContext();
    return context.factory.createBilingualTestData();
  },
};

/**
 * Database operation helpers
 */
export const dbHelpers = {
  /**
   * Execute with retry logic
   */
  withRetry: async <T>(operation: () => Promise<T>) => {
    const context = getTestContext();
    return context.factory.executeWithRetry(operation);
  },
  
  /**
   * Clear all test data
   */
  clearAll: async () => {
    const context = getTestContext();
    await context.factory.cleanup();
  },
  
  /**
   * Check database health
   */
  isHealthy: async () => {
    const context = getTestContext();
    return isTestDatabaseHealthy(context.workerId);
  },
};

// Export for use in tests
export { TestDatabaseContext } from '../database/test-database-setup';