/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * TDD Unit Test Setup
 * Uses real SQLite in-memory database for fast unit tests
 * No mocking of core functionality
 */

import { beforeAll, afterAll, afterEach } from '@jest/globals';
import { RealTestDatabase } from '../database/real-test-database';
import { PrismaClient } from '@teaching-engine/database';

// Create test database instance
const testDb = new RealTestDatabase({
  type: 'sqlite-memory', // Fast in-memory database for unit tests
});

let testClient: PrismaClient;
const workerId = process.env.JEST_WORKER_ID || 'unit-test';

beforeAll(async () => {
  console.log(`[TDD Unit Setup] Initializing real database for worker ${workerId}`);
  
  try {
    // Initialize real database
    testClient = await testDb.initialize(workerId);
    
    // Set global test client for app to use
    const globalForPrisma = globalThis as unknown as {
      testPrismaClient: PrismaClient | undefined;
    };
    globalForPrisma.testPrismaClient = testClient;
    
    // Verify database is working
    await testClient.$queryRaw`SELECT 1`;
    
    console.log(`[TDD Unit Setup] Database ready for worker ${workerId}`);
  } catch (_error) {
    console.error('[TDD Unit Setup] Failed to initialize database:', error);
    throw error;
  }
});

afterEach(async () => {
  // Clean data after each test for isolation
  await testDb.cleanData(workerId);
});

afterAll(async () => {
  console.log(`[TDD Unit Setup] Cleaning up for worker ${workerId}`);
  
  try {
    await testDb.cleanup(workerId);
    
    // Clear global test client
    const globalForPrisma = globalThis as unknown as {
      testPrismaClient: PrismaClient | undefined;
    };
    globalForPrisma.testPrismaClient = undefined;
  } catch (_error) {
    console.error('[TDD Unit Setup] Cleanup error:', error);
  }
});

// Export test utilities
export function getTestClient(): PrismaClient {
  if (!testClient) {
    throw new Error('Test client not initialized. Make sure this is called within a test.');
  }
  return testClient;
}

// Helper to seed basic test data
export async function seedBasicTestData() {
  const user = await testClient.user.create({
    data: {
      email: 'test@example.com',
      password: '$2b$10$K8KpV4kPL5M6RjJmSWHPe.qVUkjAGkGpVwMfKjWpRGsRkMm8TmDZm', // "password"
      name: 'Test User',
    },
  });

  const subject = await testClient.subject.create({
    data: {
      name: 'Mathematics',
      code: 'MATH',
      userId: user.id,
    },
  });

  return { user, subject };
}