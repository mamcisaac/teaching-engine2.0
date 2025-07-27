/**
 * Standardized Test Framework for Teaching Engine 2.0
 * 
 * Provides consistent patterns and utilities for all test types:
 * - Unit tests
 * - Integration tests
 * - Performance tests
 * 
 * Goals:
 * - Eliminate test flakiness
 * - Improve test isolation
 * - Standardize mocking patterns
 * - Simplify setup/teardown
 */

import { jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import type { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import { performance } from 'perf_hooks';

// Re-export commonly used testing utilities
export { describe, it, test, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
export { jest };

/**
 * Base test suite class for consistent test structure
 */
export abstract class TestSuite {
  protected prisma: PrismaClient;
  protected app: Express;
  protected testStartTime: number;
  protected cleanupFunctions: Array<() => Promise<void>> = [];

  /**
   * Setup test environment
   */
  async setup(): Promise<void> {
    this.testStartTime = performance.now();
    this.prisma = await this.createPrismaClient();
    this.app = await this.createApp();
    await this.seedData();
  }

  /**
   * Teardown test environment
   */
  async teardown(): Promise<void> {
    // Run all cleanup functions in reverse order
    for (const cleanupFn of this.cleanupFunctions.reverse()) {
      await cleanupFn();
    }
    
    await this.cleanup();
    await this.prisma.$disconnect();
    
    const duration = performance.now() - this.testStartTime;
    if (duration > 5000) {
      console.warn(`⚠️  Long test duration: ${duration.toFixed(0)}ms`);
    }
  }

  /**
   * Register a cleanup function to be called during teardown
   */
  protected registerCleanup(fn: () => Promise<void>): void {
    this.cleanupFunctions.push(fn);
  }

  /**
   * Create isolated Prisma client for testing
   */
  protected abstract createPrismaClient(): Promise<PrismaClient>;

  /**
   * Create test application instance
   */
  protected abstract createApp(): Promise<Express>;

  /**
   * Seed initial test data
   */
  protected abstract seedData(): Promise<void>;

  /**
   * Clean up test data
   */
  protected abstract cleanup(): Promise<void>;
}

/**
 * Test context for isolated test execution
 */
export interface TestContext {
  prisma: PrismaClient;
  app: Express;
  auth: AuthHelper;
  factories: MockFactory;
  cleanup: () => Promise<void>;
}

/**
 * Create isolated test context
 */
export async function createIsolatedContext(): Promise<TestContext> {
  const testId = faker.string.uuid();
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:./test-${testId}.db`
      }
    }
  });

  await prisma.$connect();

  const auth = new AuthHelper();
  const factories = new MockFactory(prisma);
  
  const cleanup = async () => {
    await prisma.$disconnect();
    // Clean up test database file
    const fs = await import('fs/promises');
    try {
      await fs.unlink(`./test-${testId}.db`);
      await fs.unlink(`./test-${testId}.db-journal`);
    } catch {
      // Ignore cleanup errors
    }
  };

  return {
    prisma,
    app: null as any, // Will be set by test
    auth,
    factories,
    cleanup
  };
}

/**
 * Isolated test wrapper for automatic cleanup
 */
export function isolatedTest(
  name: string,
  fn: (context: TestContext) => Promise<void>
): void {
  test(name, async () => {
    const context = await createIsolatedContext();
    try {
      await fn(context);
    } finally {
      await context.cleanup();
    }
  });
}

/**
 * Authentication helper for tests
 */
export class AuthHelper {
  private defaultSecret = 'test-secret';

  /**
   * Create a valid JWT token
   */
  createToken(userId: string, options?: jwt.SignOptions): string {
    const secret = process.env.JWT_SECRET || this.defaultSecret;
    return jwt.sign({ userId }, secret, {
      expiresIn: '1h',
      ...options
    });
  }

  /**
   * Create an expired token
   */
  createExpiredToken(userId: string): string {
    return this.createToken(userId, {
      expiresIn: '-1h'
    });
  }

  /**
   * Create authorization header
   */
  createAuthHeader(userId: string): { Authorization: string } {
    return {
      Authorization: `Bearer ${this.createToken(userId)}`
    };
  }

  /**
   * Create authenticated request
   */
  authenticatedRequest(app: Express, userId: string) {
    const token = this.createToken(userId);
    return {
      get: (url: string) => request(app).get(url).set('Authorization', `Bearer ${token}`),
      post: (url: string) => request(app).post(url).set('Authorization', `Bearer ${token}`),
      put: (url: string) => request(app).put(url).set('Authorization', `Bearer ${token}`),
      patch: (url: string) => request(app).patch(url).set('Authorization', `Bearer ${token}`),
      delete: (url: string) => request(app).delete(url).set('Authorization', `Bearer ${token}`)
    };
  }
}

/**
 * Mock factory for creating test data
 */
export class MockFactory {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a test user
   */
  async createUser(overrides?: Partial<any>): Promise<any> {
    const user = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: await this.hashPassword('password123'),
      role: 'TEACHER',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return this.prisma.user.create({ data: user });
  }

  /**
   * Create a test student
   */
  async createStudent(userId: string, overrides?: Partial<any>): Promise<any> {
    const student = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      gradeLevel: faker.helpers.arrayElement(['K', '1', '2', '3', '4', '5', '6']),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return this.prisma.student.create({ data: student });
  }

  /**
   * Create a test curriculum expectation
   */
  async createExpectation(overrides?: Partial<any>): Promise<any> {
    const expectation = {
      id: faker.string.uuid(),
      code: faker.string.alphanumeric(6).toUpperCase(),
      description: faker.lorem.sentence(),
      subject: faker.helpers.arrayElement(['Math', 'Science', 'English', 'Social Studies']),
      gradeLevel: faker.helpers.arrayElement(['1', '2', '3', '4', '5', '6']),
      strand: faker.lorem.word(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return this.prisma.curriculumExpectation.create({ data: expectation });
  }

  /**
   * Create a test lesson plan
   */
  async createLessonPlan(userId: string, overrides?: Partial<any>): Promise<any> {
    const lessonPlan = {
      id: faker.string.uuid(),
      title: faker.lorem.sentence(),
      subject: faker.helpers.arrayElement(['Math', 'Science', 'English', 'Social Studies']),
      gradeLevel: faker.helpers.arrayElement(['1', '2', '3', '4', '5', '6']),
      duration: faker.number.int({ min: 30, max: 120 }),
      date: faker.date.future(),
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    };

    return this.prisma.lessonPlan.create({ data: lessonPlan });
  }

  /**
   * Hash password for test users
   */
  private async hashPassword(password: string): Promise<string> {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, 10);
  }
}

/**
 * Performance test utilities
 */
export class PerformanceTestHelper {
  private measurements: Map<string, number[]> = new Map();

  /**
   * Measure execution time of a function
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;

    if (!this.measurements.has(name)) {
      this.measurements.set(name, []);
    }
    this.measurements.get(name)!.push(duration);

    return result;
  }

  /**
   * Get performance statistics
   */
  getStats(name: string): {
    count: number;
    min: number;
    max: number;
    avg: number;
    p95: number;
  } | null {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) {
      return null;
    }

    const sorted = [...measurements].sort((a, b) => a - b);
    const p95Index = Math.floor(sorted.length * 0.95);

    return {
      count: measurements.length,
      min: Math.min(...measurements),
      max: Math.max(...measurements),
      avg: measurements.reduce((sum, val) => sum + val, 0) / measurements.length,
      p95: sorted[p95Index]
    };
  }

  /**
   * Assert performance threshold
   */
  assertPerformance(name: string, maxDuration: number): void {
    const stats = this.getStats(name);
    if (!stats) {
      throw new Error(`No measurements found for ${name}`);
    }

    if (stats.p95 > maxDuration) {
      throw new Error(
        `Performance threshold exceeded for ${name}: ` +
        `p95=${stats.p95.toFixed(0)}ms, max=${maxDuration}ms`
      );
    }
  }
}

/**
 * Test data builders for complex scenarios
 */
export class TestDataBuilder {
  constructor(private factories: MockFactory) {}

  /**
   * Build a complete classroom setup
   */
  async buildClassroom(userId: string, studentCount: number = 20): Promise<{
    teacher: any;
    students: any[];
    subjects: any[];
    expectations: any[];
  }> {
    const teacher = await this.factories.createUser({ id: userId });
    
    const students = await Promise.all(
      Array.from({ length: studentCount }, () =>
        this.factories.createStudent(userId)
      )
    );

    const subjects = ['Math', 'Science', 'English', 'Social Studies'];
    
    const expectations = await Promise.all(
      subjects.flatMap(subject =>
        Array.from({ length: 5 }, () =>
          this.factories.createExpectation({ subject })
        )
      )
    );

    return { teacher, students, subjects, expectations };
  }

  /**
   * Build a week of lesson plans
   */
  async buildWeekOfLessons(userId: string, startDate: Date): Promise<any[]> {
    const lessons = [];
    const subjects = ['Math', 'Science', 'English', 'Social Studies', 'Art'];

    for (let day = 0; day < 5; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);

      for (const subject of subjects) {
        const lesson = await this.factories.createLessonPlan(userId, {
          subject,
          date,
          duration: 45
        });
        lessons.push(lesson);
      }
    }

    return lessons;
  }
}

/**
 * Assertion helpers for common test scenarios
 */
export class AssertionHelpers {
  /**
   * Assert API response structure
   */
  static assertApiResponse(response: any, expectedStatus: number, expectedShape?: object): void {
    expect(response.status).toBe(expectedStatus);
    
    if (expectedShape) {
      expect(response.body).toMatchObject(expectedShape);
    }
  }

  /**
   * Assert error response
   */
  static assertErrorResponse(response: any, expectedStatus: number, expectedMessage?: string): void {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('error');
    
    if (expectedMessage) {
      expect(response.body.error).toContain(expectedMessage);
    }
  }

  /**
   * Assert pagination response
   */
  static assertPaginatedResponse(response: any, expectedProperties: string[] = []): void {
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('pageSize');
    expect(Array.isArray(response.body.data)).toBe(true);

    if (expectedProperties.length > 0 && response.body.data.length > 0) {
      expectedProperties.forEach(prop => {
        expect(response.body.data[0]).toHaveProperty(prop);
      });
    }
  }
}

/**
 * Wait utilities for async operations
 */
export class WaitUtils {
  /**
   * Wait for a condition to be true
   */
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
  }

  /**
   * Wait for a specific duration
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export all utilities
export {
  isolatedTest,
  createIsolatedContext,
  AuthHelper,
  MockFactory,
  PerformanceTestHelper,
  TestDataBuilder,
  AssertionHelpers,
  WaitUtils
};