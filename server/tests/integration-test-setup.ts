/**
 * Unified Integration Test Setup
 *
 * This file provides a unified setup system specifically designed for integration tests.
 * Unlike unit tests that use transactions per test for isolation, integration tests
 * need data persistence within test suites but isolation between test files.
 *
 * Key features:
 * - No per-test transactions (data persists within describe blocks)
 * - Manual cleanup between test files
 * - Proper database client initialization
 * - Error handling for database connection issues
 */

import { beforeAll, afterAll, beforeEach } from '@jest/globals';
import { testDb } from './setup-test-db';
import { PrismaClient } from '@teaching-engine/database';
import { resetRateLimiterState } from '../src/middleware/rateLimiter';

// Store the integration test client
let integrationTestClient: PrismaClient | null = null;
let workerId: string;

/**
 * Global setup for integration tests
 * Creates a test database and initializes the client
 */
beforeAll(async () => {
  workerId = process.env.JEST_WORKER_ID || 'integration-default';

  try {
    console.log(`[Integration Setup] Setting up database for worker ${workerId}`);

    // Create a unique test database for this worker
    await testDb.createTestDatabase(workerId);

    // Verify database is healthy
    const isHealthy = await testDb.isDatabaseHealthy(workerId);
    if (!isHealthy) {
      throw new Error('Integration test database is not healthy after creation');
    }

    // Get the test client (no transactions for integration tests)
    integrationTestClient = testDb.getPrismaClient(workerId);

    if (!integrationTestClient) {
      throw new Error('Failed to get integration test client');
    }

    // Verify the client has the expected properties
    if (
      !integrationTestClient.user ||
      typeof integrationTestClient.user.deleteMany !== 'function'
    ) {
      console.error('[Integration Setup] Client properties:', Object.keys(integrationTestClient));
      throw new Error('Integration test client does not have expected database models');
    }

    // Set the global test client so the prisma module can use it
    const globalForPrisma = globalThis as unknown as {
      testPrismaClient: PrismaClient | undefined;
    };
    globalForPrisma.testPrismaClient = integrationTestClient;

    console.log(`[Integration Setup] Database setup complete for worker ${workerId}`);
  } catch (error) {
    console.error('[Integration Setup] Failed to setup integration test database:', error);
    throw error;
  }
});

/**
 * Setup before each test - reset rate limiting only
 * No database transactions for integration tests
 */
beforeEach(async () => {
  try {
    // Reset rate limiter state for each test
    resetRateLimiterState();
  } catch (error) {
    console.error('[Integration Setup] Failed to reset rate limiter:', error);
  }
});

/**
 * Global cleanup after all integration tests
 * Cleans the database and closes connections
 */
afterAll(async () => {
  try {
    console.log(`[Integration Setup] Cleaning up for worker ${workerId}`);

    if (workerId) {
      // Reset the database after all tests
      await testDb.resetDatabase(workerId);
    }

    // Clean up the test database manager
    await testDb.cleanup();

    // Clear the global test client
    const globalForPrisma = globalThis as unknown as {
      testPrismaClient: PrismaClient | undefined;
    };
    globalForPrisma.testPrismaClient = undefined;

    integrationTestClient = null;

    console.log(`[Integration Setup] Cleanup complete for worker ${workerId}`);
  } catch (error) {
    console.warn('[Integration Setup] Failed to cleanup integration test database:', error);
  }
});

/**
 * Get the current integration test Prisma client
 * This client persists data across tests within a describe block
 */
export function getIntegrationTestPrismaClient(): PrismaClient {
  if (!integrationTestClient) {
    throw new Error(
      'Integration test client not initialized. Make sure this is called from within an integration test.',
    );
  }
  return integrationTestClient;
}

/**
 * Manual cleanup helper for integration tests
 * Call this in beforeEach if you need fresh data for each test case
 */
export async function cleanIntegrationTestData(): Promise<void> {
  if (!integrationTestClient) {
    throw new Error('Integration test client not initialized');
  }

  try {
    // Clean test data in dependency order (children first, then parents)
    // This order prevents foreign key constraint violations

    // 1. Clean junction tables first (many-to-many relationships)
    if (integrationTestClient.daybookEntryExpectation) {
      await integrationTestClient.daybookEntryExpectation.deleteMany({});
    }
    if (integrationTestClient.eTFOLessonPlanExpectation) {
      await integrationTestClient.eTFOLessonPlanExpectation.deleteMany({});
    }
    if (integrationTestClient.unitPlanExpectation) {
      await integrationTestClient.unitPlanExpectation.deleteMany({});
    }
    if (integrationTestClient.longRangePlanExpectation) {
      await integrationTestClient.longRangePlanExpectation.deleteMany({});
    }

    // 2. Clean deeply nested child records first
    if (integrationTestClient.studentGoal) {
      await integrationTestClient.studentGoal.deleteMany({});
    }
    if (integrationTestClient.studentReflection) {
      await integrationTestClient.studentReflection.deleteMany({});
    }
    if (integrationTestClient.studentArtifact) {
      await integrationTestClient.studentArtifact.deleteMany({});
    }
    if (integrationTestClient.parentSummary) {
      await integrationTestClient.parentSummary.deleteMany({});
    }

    // 3. Clean calendar and activity-related records
    if (integrationTestClient.calendarEvent) {
      await integrationTestClient.calendarEvent.deleteMany({});
    }
    if (integrationTestClient.unavailableBlock) {
      await integrationTestClient.unavailableBlock.deleteMany({});
    }
    if (integrationTestClient.activityRating) {
      await integrationTestClient.activityRating.deleteMany({});
    }
    if (integrationTestClient.activityCollection) {
      await integrationTestClient.activityCollection.deleteMany({});
    }
    if (integrationTestClient.activityImport) {
      await integrationTestClient.activityImport.deleteMany({});
    }

    // 4. Clean planning records (in dependency order)
    if (integrationTestClient.daybookEntry) {
      await integrationTestClient.daybookEntry.deleteMany({});
    }
    if (integrationTestClient.eTFOLessonPlanResource) {
      await integrationTestClient.eTFOLessonPlanResource.deleteMany({});
    }
    if (integrationTestClient.eTFOLessonPlan) {
      await integrationTestClient.eTFOLessonPlan.deleteMany({});
    }
    if (integrationTestClient.unitPlanResource) {
      await integrationTestClient.unitPlanResource.deleteMany({});
    }
    if (integrationTestClient.unitPlan) {
      await integrationTestClient.unitPlan.deleteMany({});
    }
    if (integrationTestClient.longRangePlan) {
      await integrationTestClient.longRangePlan.deleteMany({});
    }

    // 5. Clean other user-related records
    if (integrationTestClient.newsletter) {
      await integrationTestClient.newsletter.deleteMany({});
    }
    if (integrationTestClient.parentMessage) {
      await integrationTestClient.parentMessage.deleteMany({});
    }
    if (integrationTestClient.classRoutine) {
      await integrationTestClient.classRoutine.deleteMany({});
    }
    if (integrationTestClient.subPlanRecord) {
      await integrationTestClient.subPlanRecord.deleteMany({});
    }
    if (integrationTestClient.weeklyPlannerState) {
      await integrationTestClient.weeklyPlannerState.deleteMany({});
    }

    // 6. Clean curriculum and import records
    if (integrationTestClient.curriculumExpectationEmbedding) {
      await integrationTestClient.curriculumExpectationEmbedding.deleteMany({});
    }
    if (integrationTestClient.expectationCluster) {
      await integrationTestClient.expectationCluster.deleteMany({});
    }
    if (integrationTestClient.curriculumExpectation) {
      await integrationTestClient.curriculumExpectation.deleteMany({});
    }
    if (integrationTestClient.curriculumImport) {
      await integrationTestClient.curriculumImport.deleteMany({});
    }

    // 7. Clean students (depends on User)
    if (integrationTestClient.student) {
      await integrationTestClient.student.deleteMany({});
    }

    // 8. Clean subjects (depends on User)
    if (integrationTestClient.subject) {
      await integrationTestClient.subject.deleteMany({});
    }

    // 9. Finally clean users (parent table)
    if (integrationTestClient.user) {
      await integrationTestClient.user.deleteMany({});
    }

    console.log('[Integration Setup] Test data cleaned successfully');
  } catch (error) {
    console.error('[Integration Setup] Failed to clean test data:', error);
    console.error(
      '[Integration Setup] Available client properties:',
      Object.keys(integrationTestClient || {}),
    );
    throw error;
  }
}

/**
 * Execute a database operation with retry logic
 * Useful for operations that might fail due to busy database
 */
export async function executeWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  return testDb.executeWithRetry(fn, retries);
}

/**
 * Check if the integration test database is healthy
 */
export async function isIntegrationTestDatabaseHealthy(): Promise<boolean> {
  if (!workerId) {
    return false;
  }
  return testDb.isDatabaseHealthy(workerId);
}

/**
 * Seed integration test data helper
 * Use this to create common test data that persists across test cases
 */
interface IntegrationTestData {
  users?: Array<{ email: string; password: string; name: string; role?: string }>;
  subjects?: Array<{ name: string; code?: string }>;
  expectations?: Array<{
    code: string;
    description: string;
    subject: string;
    grade: number;
    strand: string;
    substrand?: string;
  }>;
}

export async function seedIntegrationTestData(data: IntegrationTestData) {
  const client = getIntegrationTestPrismaClient();

  return executeWithRetry(async () => {
    const created = {
      users: [] as Array<{ id: number; email: string; name: string }>,
      subjects: [] as Array<{ id: number; name: string; code?: string }>,
      expectations: [] as Array<{ id: string; code: string; description: string }>,
    };

    // Create users
    if (data.users) {
      for (const userData of data.users) {
        const user = await client.user.create({ data: userData });
        created.users.push(user);
      }
    }

    // Create subjects
    if (data.subjects) {
      for (const subjectData of data.subjects) {
        const subject = await client.subject.create({ data: subjectData });
        created.subjects.push(subject);
      }
    }

    // Create expectations
    if (data.expectations) {
      for (const expectationData of data.expectations) {
        const expectation = await client.curriculumExpectation.create({ data: expectationData });
        created.expectations.push(expectation);
      }
    }

    return created;
  });
}
