/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { testDb } from './setup-test-db';
import { randomBytes } from 'crypto';
import { PrismaClient } from '@teaching-engine/database';
import { resetRateLimiterState } from '../src/middleware/rateLimiter';

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
  } catch (_error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

/**
 * Enhanced setup for real implementation testing
 */
beforeEach(async () => {
  // Generate unique test ID
  currentTestId = randomBytes(8).toString('hex');

  try {
    // Reset rate limiter state for each test
    resetRateLimiterState();

    // Clear any previous auth state
    clearPreviousAuthState();

    // Start a real transaction for this test
    currentTransactionClient = await testDb.startTransaction(currentTestId);

    // Update the global test client so services use the transaction
    const globalForPrisma = globalThis as unknown as {
      testPrismaClient: PrismaClient | undefined;
    };
    globalForPrisma.testPrismaClient = currentTransactionClient;

    // Set up real implementation environment
    setupRealTestEnvironment();
  } catch (_error) {
    console.error('Failed to start transaction for test:', error);
    throw error;
  }
});

/**
 * Clear previous authentication state
 */
function clearPreviousAuthState() {
  // Clear any JWT tokens or session data that might leak between tests
  process.env.TEST_JWT_SECRET = process.env.TEST_JWT_SECRET || 'test-secret-key';
  
  // Clear any cached authentication state
  const globalForAuth = globalThis as unknown as {
    testAuthState?: any;
  };
  globalForAuth.testAuthState = undefined;
}

/**
 * Setup real test environment
 */
function setupRealTestEnvironment() {
  // Set environment variables for real testing
  process.env.NODE_ENV = 'test';
  process.env.SKIP_RATE_LIMITING = 'true';
  process.env.ENABLE_TEST_ROUTES = 'true';
  
  // Configure for real implementations
  process.env.USE_REAL_SERVICES = 'true';
  process.env.MOCK_EXTERNAL_APIS = 'true'; // Mock external APIs but use real internal services
}

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
    } catch (_error) {
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
  } catch (_error) {
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

  console.log('createTestData called, isInTransaction:', isInTransaction());
  console.log('currentTestId:', currentTestId);
  console.log('currentTransactionClient:', !!currentTransactionClient);

  if (!isInTransaction()) {
    console.warn('createTestData called outside transaction, proceeding anyway...');
    // Don't throw error, just log warning and proceed
    // throw new Error('createTestData must be called within a test (transaction)');
  }

  try {
    const result = await executeWithRetry(() => createFn(client));
    console.log('createTestData result:', result);
    return result;
  } catch (_error) {
    console.error('createTestData error:', error);
    throw error;
  }
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
