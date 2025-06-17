import { beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { testDb } from './setup-test-db';
import { randomBytes } from 'crypto';
import { PrismaClient } from '@teaching-engine/database';

// Store current test context
let currentTestId: string | null = null;
let currentTransactionClient: PrismaClient | null = null;

/**
 * Global setup for all tests
 */
beforeAll(async () => {
  const workerId = process.env.JEST_WORKER_ID || 'default';

  try {
    // Create a unique test database for this worker
    await testDb.createTestDatabase(workerId);

    // Verify database is healthy
    const isHealthy = await testDb.isDatabaseHealthy(workerId);
    if (!isHealthy) {
      throw new Error('Test database is not healthy after creation');
    }

    // Set the test client globally so the prisma module can use it
    const globalForPrisma = globalThis as unknown as {
      testPrismaClient: PrismaClient | undefined;
    };
    globalForPrisma.testPrismaClient = testDb.getPrismaClient(workerId);
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

/**
 * Setup before each test - start transaction
 */
beforeEach(async () => {
  // Generate unique test ID
  currentTestId = randomBytes(8).toString('hex');

  try {
    // Start a real transaction for this test
    currentTransactionClient = await testDb.startTransaction(currentTestId);

    // Update the global test client so services use the transaction
    const globalForPrisma = globalThis as unknown as {
      testPrismaClient: PrismaClient | undefined;
    };
    globalForPrisma.testPrismaClient = currentTransactionClient;
  } catch (error) {
    console.error('Failed to start transaction for test:', error);
    throw error;
  }
});

/**
 * Cleanup after each test - reset database
 */
afterEach(async () => {
  if (currentTestId) {
    try {
      // Reset the database after each test
      const workerId = process.env.JEST_WORKER_ID || 'default';
      await testDb.resetDatabase(workerId);

      // Reset the global test client
      const globalForPrisma = globalThis as unknown as {
        testPrismaClient: PrismaClient | undefined;
      };
      globalForPrisma.testPrismaClient = testDb.getPrismaClient(workerId);
    } catch (error) {
      console.error('Failed to reset database:', error);
    } finally {
      currentTestId = null;
      currentTransactionClient = null;
    }
  }
});

/**
 * Global cleanup after all tests
 */
afterAll(async () => {
  try {
    // Get connection stats for debugging if tests are in debug mode
    if (process.env.DEBUG_TESTS === 'true') {
      const workerId = process.env.JEST_WORKER_ID || 'default';
      const stats = await testDb.getConnectionStats(workerId);
      console.log('Final connection stats:', stats);
    }

    await testDb.cleanup();
  } catch (error) {
    console.warn('Failed to cleanup test database:', error);
  }
});

/**
 * Get the current test's Prisma client
 * This will return the transaction client if available, otherwise the base client
 */
export function getTestPrismaClient(): PrismaClient {
  // If we have an active transaction, use that client
  if (currentTransactionClient && currentTestId) {
    return currentTransactionClient;
  }

  // Otherwise, return the base client for the worker
  const workerId = process.env.JEST_WORKER_ID || 'default';
  return testDb.getPrismaClient(workerId);
}

/**
 * Execute a database operation with retry logic
 * Useful for operations that might fail due to busy database
 */
export async function executeWithRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  return testDb.executeWithRetry(fn, retries);
}

/**
 * Clean test database (for legacy compatibility)
 */
export async function cleanTestDatabase() {
  const workerId = process.env.JEST_WORKER_ID || 'default';
  await testDb.resetDatabase(workerId);
}

/**
 * Get current test ID (useful for debugging)
 */
export function getCurrentTestId(): string | null {
  return currentTestId;
}

/**
 * Check if we're in a transaction
 */
export function isInTransaction(): boolean {
  return currentTestId !== null && currentTransactionClient !== null;
}

/**
 * Create test data with automatic cleanup
 * The data will be automatically rolled back after the test
 */
export async function createTestData<T>(
  createFn: (prisma: PrismaClient) => Promise<T>,
): Promise<T> {
  const client = getTestPrismaClient();

  if (!isInTransaction()) {
    throw new Error('createTestData must be called within a test (transaction)');
  }

  return executeWithRetry(() => createFn(client));
}

/**
 * Seed test data for the current test
 * This is a helper for common test data patterns
 */
interface TestData {
  users?: Array<{ email: string; password: string; name: string; role?: string }>;
  subjects?: Array<{ name: string; code?: string }>;
  outcomes?: Array<{
    code: string;
    description: string;
    subject: string;
    grade: number;
    domain?: string;
  }>;
  activities?: Array<{
    title: string;
    milestoneId: number;
    description?: string;
    duration?: number;
  }>;
}

export async function seedTestData(data: TestData) {
  const client = getTestPrismaClient();

  if (!isInTransaction()) {
    throw new Error('seedTestData must be called within a test (transaction)');
  }

  return executeWithRetry(async () => {
    const created = {
      users: [] as Array<{ id: number; email: string; name: string }>,
      subjects: [] as Array<{ id: number; name: string; code?: string }>,
      outcomes: [] as Array<{ id: number; code: string; description: string }>,
      activities: [] as Array<{ id: number; title: string; milestoneId: number }>,
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

    // Create outcomes
    if (data.outcomes) {
      for (const outcomeData of data.outcomes) {
        const outcome = await client.outcome.create({ data: outcomeData });
        created.outcomes.push(outcome);
      }
    }

    // Create activities
    if (data.activities) {
      for (const activityData of data.activities) {
        const activity = await client.activity.create({ data: activityData });
        created.activities.push(activity);
      }
    }

    return created;
  });
}
