/**
 * Integration Test Utilities
 * 
 * Common utilities and helpers for integration tests
 * focusing on real functionality without mocks
 */

import { PrismaClient } from '@prisma/client';
import { Server } from 'http';
import express, { Application } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test database client
let testPrisma: PrismaClient | null = null;

export interface TestContext {
  app: Application;
  server: Server;
  prisma: PrismaClient;
  baseUrl: string;
}

/**
 * Create a test application instance with real configuration
 */
export async function createTestApp(): Promise<TestContext> {
  const app = express();
  
  // Use real middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Initialize real database connection
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || 'file:./test.db'
      }
    }
  });
  
  testPrisma = prisma;
  
  // Connect to database
  await prisma.$connect();
  
  // Start server on random port
  const server = await new Promise<Server>((resolve) => {
    const srv = app.listen(0, () => {
      resolve(srv);
    });
  });
  
  const address = server.address();
  const port = typeof address === 'object' && address !== null ? address.port : 0;
  const baseUrl = `http://localhost:${port}`;
  
  return {
    app,
    server,
    prisma,
    baseUrl
  };
}

/**
 * Clean up test application
 */
export async function cleanupTestApp(context: TestContext): Promise<void> {
  // Close server
  await new Promise<void>((resolve, reject) => {
    context.server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
  
  // Disconnect database
  await context.prisma.$disconnect();
}

/**
 * Reset database between tests
 */
export async function resetTestDatabase(prisma: PrismaClient): Promise<void> {
  // Clear all tables in correct order to respect foreign keys
  const tablenames = ['User', 'LessonPlan', 'UnitPlan', 'Resource'];
  
  for (const tablename of tablenames.reverse()) {
    try {
      await prisma.$queryRawUnsafe(`DELETE FROM ${tablename}`);
    } catch (error) {
      // Table might not exist yet
      console.log(`Could not clear ${tablename}:`, error);
    }
  }
}

/**
 * Seed test data
 */
export async function seedTestData(prisma: PrismaClient): Promise<{
  user: any;
  lessonPlan: any;
  unitPlan: any;
}> {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'TEACHER'
    }
  });
  
  // Create test unit plan
  const unitPlan = await prisma.unitPlan.create({
    data: {
      title: 'Test Unit Plan',
      subject: 'Mathematics',
      grade: 7,
      userId: user.id
    }
  });
  
  // Create test lesson plan
  const lessonPlan = await prisma.lessonPlan.create({
    data: {
      title: 'Test Lesson',
      date: new Date(),
      duration: 60,
      subject: 'Mathematics',
      grade: 7,
      userId: user.id,
      unitPlanId: unitPlan.id
    }
  });
  
  return { user, lessonPlan, unitPlan };
}

/**
 * Wait for condition with timeout
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) return;
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Measure function execution time
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  return { result, duration };
}

/**
 * Create a test file
 */
export async function createTestFile(
  filePath: string,
  content: string
): Promise<void> {
  const fs = await import('fs/promises');
  const dir = path.dirname(filePath);
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Clean up test files
 */
export async function cleanupTestFiles(patterns: string[]): Promise<void> {
  const fs = await import('fs/promises');
  const glob = await import('glob');
  
  for (const pattern of patterns) {
    const files = await glob.glob(pattern);
    for (const file of files) {
      try {
        await fs.unlink(file);
      } catch (error) {
        // File might not exist
      }
    }
  }
}

/**
 * Assert no console errors during test
 */
export function captureConsoleErrors(): {
  errors: Array<{ message: string; args: any[] }>;
  restore: () => void;
} {
  const errors: Array<{ message: string; args: any[] }> = [];
  const originalError = console.error;
  
  console.error = (...args: any[]) => {
    errors.push({
      message: args[0]?.toString() || '',
      args
    });
  };
  
  return {
    errors,
    restore: () => {
      console.error = originalError;
    }
  };
}

/**
 * Performance benchmark helper
 */
export interface BenchmarkResult {
  name: string;
  runs: number;
  average: number;
  min: number;
  max: number;
  stdDev: number;
}

export async function benchmark(
  name: string,
  fn: () => Promise<void>,
  runs: number = 10
): Promise<BenchmarkResult> {
  const times: number[] = [];
  
  // Warm up
  await fn();
  
  // Actual runs
  for (let i = 0; i < runs; i++) {
    const { duration } = await measureExecutionTime(fn);
    times.push(duration);
  }
  
  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  const variance = times.reduce((sum, time) => {
    return sum + Math.pow(time - average, 2);
  }, 0) / times.length;
  
  const stdDev = Math.sqrt(variance);
  
  return {
    name,
    runs,
    average,
    min,
    max,
    stdDev
  };
}

/**
 * Memory usage helper
 */
export function getMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
} {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed / 1024 / 1024, // MB
    heapTotal: usage.heapTotal / 1024 / 1024, // MB
    external: usage.external / 1024 / 1024, // MB
    rss: usage.rss / 1024 / 1024 // MB
  };
}

// Export test database instance getter
export function getTestPrisma(): PrismaClient {
  if (!testPrisma) {
    throw new Error('Test database not initialized. Call createTestApp first.');
  }
  return testPrisma;
}