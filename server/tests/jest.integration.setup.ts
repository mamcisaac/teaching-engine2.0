import { beforeAll, afterAll } from '@jest/globals';
import { testDb } from './setup-test-db';
import { PrismaClient } from '@teaching-engine/database';

/**
 * Integration test setup - minimal isolation
 * Unlike unit tests, integration tests need data to persist across test cases
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
    console.error('Failed to setup integration test database:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Clean up after all integration tests
    const workerId = process.env.JEST_WORKER_ID || 'default';
    await testDb.resetDatabase(workerId);
    await testDb.cleanup();
  } catch (error) {
    console.warn('Failed to cleanup integration test database:', error);
  }
});

// Export test client getter for integration tests
export function getIntegrationTestPrismaClient(): PrismaClient {
  const workerId = process.env.JEST_WORKER_ID || 'default';
  return testDb.getPrismaClient(workerId);
}