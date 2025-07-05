/**
 * Test Database Setup
 * 
 * Main entry point for test database configuration.
 * Provides easy-to-use functions for different test scenarios.
 */

import { PrismaClient } from '@teaching-engine/database';
import { testDbManager } from './test-database-manager';
import { createTestDataFactory, TestDataFactory } from './test-data-factory';
import { TestIsolationLevel, getRecommendedIsolationLevel } from './test-database-config';

export interface TestDatabaseContext {
  prisma: PrismaClient;
  factory: TestDataFactory;
  workerId: string;
  testId: string;
}

/**
 * Setup test database for a test suite
 */
export async function setupTestDatabase(options?: {
  workerId?: string;
  testType?: string;
  locale?: 'en' | 'fr';
  seed?: number;
}): Promise<TestDatabaseContext> {
  const workerId = options?.workerId || process.env.JEST_WORKER_ID || 'default';
  const testType = options?.testType || process.env.TEST_TYPE || 'unit';
  
  // Initialize database for worker
  await testDbManager.initializeDatabase(workerId);
  
  // Get Prisma client
  const prisma = testDbManager.getClient(workerId);
  
  // Create test data factory
  const factory = createTestDataFactory(prisma, {
    locale: options?.locale,
    seed: options?.seed,
  });
  
  // Generate test ID
  const testId = `${workerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    prisma,
    factory,
    workerId,
    testId,
  };
}

/**
 * Setup isolated test with transaction support
 */
export async function setupIsolatedTest(
  context: TestDatabaseContext,
  isolationLevel?: TestIsolationLevel
): Promise<PrismaClient> {
  const level = isolationLevel || getRecommendedIsolationLevel(process.env.TEST_TYPE || 'unit');
  
  return testDbManager.startTransaction(
    context.testId,
    context.workerId,
    level
  );
}

/**
 * Cleanup test isolation
 */
export async function cleanupIsolatedTest(context: TestDatabaseContext): Promise<void> {
  await testDbManager.rollbackTransaction(context.testId);
}

/**
 * Global setup for all tests
 */
export async function globalTestSetup(): Promise<void> {
  const workerId = process.env.JEST_WORKER_ID || 'global';
  
  console.log(`Setting up test database for worker ${workerId}...`);
  
  try {
    await testDbManager.initializeDatabase(workerId);
    console.log('Test database setup completed successfully');
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Global teardown for all tests
 */
export async function globalTestTeardown(): Promise<void> {
  console.log('Cleaning up test databases...');
  
  try {
    await testDbManager.cleanup();
    console.log('Test database cleanup completed');
  } catch (error) {
    console.error('Failed to cleanup test databases:', error);
  }
}

/**
 * Execute database operation with retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
  }
): Promise<T> {
  return testDbManager.executeWithRetry(operation, options);
}

/**
 * Check if test database is healthy
 */
export async function isTestDatabaseHealthy(workerId?: string): Promise<boolean> {
  const id = workerId || process.env.JEST_WORKER_ID || 'default';
  return testDbManager.isHealthy(id);
}

/**
 * Get database performance metrics
 */
export function getTestDatabaseMetrics() {
  return testDbManager.getPerformanceMetrics();
}

/**
 * Clear all data from test database
 */
export async function clearTestDatabase(context: TestDatabaseContext): Promise<void> {
  await testDbManager.clearAllTables(context.prisma);
}

/**
 * Seed test database with sample data
 */
export async function seedTestDatabase(
  context: TestDatabaseContext,
  scenario: 'minimal' | 'integration' | 'performance' | 'teacher' = 'minimal'
) {
  switch (scenario) {
    case 'minimal':
      return context.factory.createMinimalTestData();
      
    case 'integration':
      return context.factory.createIntegrationTestData();
      
    case 'performance':
      return context.factory.createPerformanceTestData('medium');
      
    case 'teacher':
      return context.factory.createTeacherScenario({
        includeSubPlans: true,
      });
      
    default:
      throw new Error(`Unknown seed scenario: ${scenario}`);
  }
}

/**
 * Helper for creating test data within a test
 */
export function createTestData(context: TestDatabaseContext) {
  return {
    user: (overrides?: any) => context.factory.userFactory.create(overrides),
    expectation: (overrides?: any) => context.factory.curriculumFactory.create(overrides),
    longRangePlan: (overrides?: any) => context.factory.longRangePlanFactory.create(overrides),
    unitPlan: (overrides?: any) => context.factory.unitPlanFactory.create(overrides),
    lessonPlan: (overrides?: any) => context.factory.lessonPlanFactory.create(overrides),
    daybookEntry: (overrides?: any) => context.factory.daybookFactory.create(overrides),
    substitutePlan: (overrides?: any) => context.factory.substitutePlanFactory.create(overrides),
  };
}

// Re-export commonly used items
export { TestIsolationLevel, TestDatabaseContext };
export { testDbManager };
export { createTestDataFactory, TestDataFactory };

/**
 * Jest lifecycle hooks helper
 */
export const testDatabaseHooks = {
  beforeAll: async (context: { db?: TestDatabaseContext }) => {
    context.db = await setupTestDatabase();
  },
  
  beforeEach: async (context: { db?: TestDatabaseContext; prisma?: PrismaClient }) => {
    if (context.db) {
      context.prisma = await setupIsolatedTest(context.db);
    }
  },
  
  afterEach: async (context: { db?: TestDatabaseContext }) => {
    if (context.db) {
      await cleanupIsolatedTest(context.db);
    }
  },
  
  afterAll: async (context: { db?: TestDatabaseContext }) => {
    if (context.db) {
      await context.db.factory.cleanup();
    }
  },
};