/**
 * Integration Test Setup
 * 
 * Configures the test environment for integration tests
 * with real database connections and minimal mocking.
 */

import { jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { TextEncoder, TextDecoder } from 'util';
import fs from 'fs/promises';
import path from 'path';

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'integration-test-secret';
process.env.OPENAI_API_KEY = 'test-api-key';

// Use test database
const testDbPath = path.join(process.cwd(), 'tests', 'test-integration.db');
process.env.DATABASE_URL = `file:${testDbPath}`;

// Configure Jest for integration tests
jest.setTimeout(15000); // 15 second timeout for integration tests

// Still mock expensive external services
jest.mock('openai');
jest.mock('@aws-sdk/client-s3');
jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

// Create test database connection pool
let prismaClient: PrismaClient | null = null;

/**
 * Get or create Prisma client for tests
 */
export function getTestPrismaClient(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.DEBUG_TESTS === 'true' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prismaClient;
}

/**
 * Setup test database
 */
async function setupTestDatabase() {
  const prisma = getTestPrismaClient();
  
  try {
    // Ensure database directory exists
    const dbDir = path.dirname(testDbPath);
    await fs.mkdir(dbDir, { recursive: true });
    
    // Run migrations
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'TEACHER',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Student" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "gradeLevel" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "LessonPlan" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "gradeLevel" TEXT NOT NULL,
        "duration" INTEGER NOT NULL,
        "date" DATETIME NOT NULL,
        "content" TEXT,
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "CurriculumExpectation" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "code" TEXT NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "gradeLevel" TEXT NOT NULL,
        "strand" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "UnitPlan" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "gradeLevel" TEXT NOT NULL,
        "startDate" DATETIME NOT NULL,
        "endDate" DATETIME NOT NULL,
        "description" TEXT,
        "userId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);
    
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
}

/**
 * Clean test database
 */
async function cleanTestDatabase() {
  const prisma = getTestPrismaClient();
  
  try {
    // Clean all tables in reverse dependency order
    await prisma.$executeRawUnsafe('DELETE FROM "LessonPlan"');
    await prisma.$executeRawUnsafe('DELETE FROM "UnitPlan"');
    await prisma.$executeRawUnsafe('DELETE FROM "Student"');
    await prisma.$executeRawUnsafe('DELETE FROM "CurriculumExpectation"');
    await prisma.$executeRawUnsafe('DELETE FROM "User"');
  } catch (error) {
    console.error('Failed to clean test database:', error);
  }
}

// Global setup - run once before all tests
beforeAll(async () => {
  await setupTestDatabase();
});

// Clean database before each test for isolation
beforeEach(async () => {
  await cleanTestDatabase();
});

// Global teardown - run once after all tests
afterAll(async () => {
  if (prismaClient) {
    await prismaClient.$disconnect();
  }
  
  // Remove test database file
  try {
    await fs.unlink(testDbPath);
    await fs.unlink(`${testDbPath}-journal`);
  } catch {
    // Ignore errors
  }
});

// Integration test helpers
global.integrationTestHelpers = {
  /**
   * Create a test app instance
   */
  createTestApp: async () => {
    // Import app without starting the server
    const { app } = await import('../../src/app');
    return app;
  },
  
  /**
   * Seed basic test data
   */
  seedTestData: async () => {
    const prisma = getTestPrismaClient();
    const bcrypt = await import('bcryptjs');
    
    // Create test user
    const user = await prisma.user.create({
      data: {
        id: 'test-user-id',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Test Teacher',
        role: 'TEACHER',
      },
    });
    
    // Create test students
    const students = await Promise.all([
      prisma.student.create({
        data: {
          id: 'student-1',
          name: 'Alice Johnson',
          gradeLevel: '3',
          userId: user.id,
        },
      }),
      prisma.student.create({
        data: {
          id: 'student-2',
          name: 'Bob Smith',
          gradeLevel: '3',
          userId: user.id,
        },
      }),
    ]);
    
    // Create test curriculum expectations
    const expectations = await Promise.all([
      prisma.curriculumExpectation.create({
        data: {
          id: 'expect-1',
          code: 'MATH-3-NS-1',
          description: 'Read, represent, compare, and order whole numbers to 1000',
          subject: 'Math',
          gradeLevel: '3',
          strand: 'Number Sense',
        },
      }),
      prisma.curriculumExpectation.create({
        data: {
          id: 'expect-2',
          code: 'SCI-3-UE-1',
          description: 'Investigate the physical properties of soil',
          subject: 'Science',
          gradeLevel: '3',
          strand: 'Understanding Earth',
        },
      }),
    ]);
    
    return { user, students, expectations };
  },
  
  /**
   * Wait for async operations
   */
  waitForAsync: async (ms: number = 100) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};

// Export test configuration
export const integrationTestConfig = {
  timeout: 15000,
  retries: 1,
  bail: false,
};