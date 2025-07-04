/**
 * TDD Test Utilities
 * Promotes real implementations over mocking to follow strict TDD principles
 * 
 * IMPORTANT: These utilities enforce the following TDD rules:
 * 1. Use real database connections (no mocks)
 * 2. Use real service implementations (no mocks)
 * 3. Mock only external APIs that cost money or are unreliable
 * 4. Every test must verify actual behavior, not mock behavior
 */

import { Express } from 'express';
import request from 'supertest';
import { PrismaClient } from '@teaching-engine/database';
import { RealTestDatabase } from '../database/real-test-database';
import { createServer } from '../../src/app';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Initialize real test database
const testDb = new RealTestDatabase();

/**
 * Create a real Express app instance for testing
 * This uses the actual server configuration, not mocks
 */
export async function createTestApp(): Promise<Express> {
  // Get real database client
  const workerId = process.env.JEST_WORKER_ID || 'test';
  const prismaClient = await testDb.getClient(workerId);

  // Set global test client so the app can use it
  const globalForPrisma = globalThis as unknown as {
    testPrismaClient: PrismaClient | undefined;
  };
  globalForPrisma.testPrismaClient = prismaClient;

  // Create real Express app
  const app = createServer();
  
  return app;
}

/**
 * Create a test user with real database and password hashing
 */
export interface TestUser {
  id: number;
  email: string;
  password: string;
  name: string;
  token: string;
  role?: string;
}

export async function createTestUser(
  userData?: Partial<TestUser>
): Promise<TestUser> {
  const workerId = process.env.JEST_WORKER_ID || 'test';
  const client = await testDb.getClient(workerId);

  const defaultData = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    name: 'Test User',
    role: 'USER',
    ...userData,
  };

  // Hash password with real bcrypt
  const hashedPassword = await bcrypt.hash(defaultData.password, 10);

  // Create user in real database
  const user = await client.user.create({
    data: {
      email: defaultData.email,
      password: hashedPassword,
      name: defaultData.name,
      role: defaultData.role,
    },
  });

  // Generate real JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );

  return {
    id: user.id,
    email: user.email,
    password: defaultData.password, // Original password for testing
    name: user.name,
    token,
    role: user.role || 'USER',
  };
}

/**
 * Create authenticated request helper
 * Uses real authentication, not mocked
 */
export function authenticatedRequest(
  app: Express,
  user: TestUser
): request.SuperTest<request.Test> {
  return request(app).auth(user.token, { type: 'bearer' });
}

/**
 * Test data factory for creating realistic test data
 * All data is created in the real database
 */
export class TestDataFactory {
  private client: PrismaClient;
  private workerId: string;

  constructor(workerId?: string) {
    this.workerId = workerId || process.env.JEST_WORKER_ID || 'test';
  }

  async initialize(): Promise<void> {
    this.client = await testDb.getClient(this.workerId);
  }

  async createSubject(userId: number, data?: Partial<any>) {
    return this.client.subject.create({
      data: {
        name: 'Test Subject',
        code: 'TEST',
        ...data,
        userId,
      },
    });
  }

  async createStudent(userId: number, data?: Partial<any>) {
    return this.client.student.create({
      data: {
        firstName: 'Test',
        lastName: 'Student',
        grade: 5,
        ...data,
        userId,
      },
    });
  }

  async createCurriculumExpectation(data?: Partial<any>) {
    return this.client.curriculumExpectation.create({
      data: {
        code: 'TEST.1',
        description: 'Test expectation',
        subject: 'Test',
        grade: 5,
        strand: 'Test Strand',
        ...data,
      },
    });
  }

  async createLongRangePlan(userId: number, data?: Partial<any>) {
    return this.client.longRangePlan.create({
      data: {
        title: 'Test Long Range Plan',
        subject: 'Test',
        grade: 5,
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        ...data,
        userId,
      },
    });
  }

  async createUnitPlan(userId: number, longRangePlanId: string, data?: Partial<any>) {
    return this.client.unitPlan.create({
      data: {
        title: 'Test Unit Plan',
        subject: 'Test',
        grade: 5,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        ...data,
        userId,
        longRangePlanId,
      },
    });
  }

  async createETFOLessonPlan(userId: number, unitPlanId: string, data?: Partial<any>) {
    return this.client.eTFOLessonPlan.create({
      data: {
        title: 'Test Lesson Plan',
        subject: 'Test',
        grade: 5,
        date: new Date(),
        duration: 60,
        threePartLesson: {
          minds_on: 'Test minds on',
          action: 'Test action',
          consolidation: 'Test consolidation',
        },
        learningGoals: ['Test goal 1', 'Test goal 2'],
        successCriteria: ['Test criteria 1', 'Test criteria 2'],
        materials: ['Test material 1', 'Test material 2'],
        accommodations: 'Test accommodations',
        assessmentStrategies: 'Test assessment',
        evaluationTools: 'Test evaluation',
        teachingStrategies: 'Test strategies',
        considerationsForPlanning: 'Test considerations',
        vocabularyAndTerminology: 'Test vocabulary',
        linksToPriorLearning: 'Test prior learning',
        ...data,
        userId,
        unitPlanId,
      },
    });
  }

  async cleanup() {
    // Cleanup is handled by test framework
  }
}

/**
 * Real service test helpers
 * Creates actual service instances with real dependencies
 */
export async function createRealService<T>(
  ServiceClass: new (...args: any[]) => T,
  ...args: any[]
): Promise<T> {
  const workerId = process.env.JEST_WORKER_ID || 'test';
  const client = await testDb.getClient(workerId);

  // Inject real database client if service needs it
  if (args.length === 0) {
    return new ServiceClass(client);
  }

  return new ServiceClass(...args);
}

/**
 * Test assertions for real implementations
 */
export const realTestAssertions = {
  /**
   * Assert database state matches expected
   */
  async assertDatabaseState(
    tableName: string,
    conditions: Record<string, any>,
    expected: Partial<any>
  ) {
    const workerId = process.env.JEST_WORKER_ID || 'test';
    const client = await testDb.getClient(workerId);

    const record = await (client as any)[tableName].findFirst({
      where: conditions,
    });

    expect(record).toBeTruthy();
    Object.entries(expected).forEach(([key, value]) => {
      expect(record[key]).toEqual(value);
    });
  },

  /**
   * Assert service method performs real work
   */
  async assertServiceMethodWorks<T>(
    service: any,
    methodName: string,
    args: any[],
    validator: (result: T) => void
  ) {
    const result = await service[methodName](...args);
    validator(result);
  },

  /**
   * Assert API endpoint returns real data
   */
  async assertApiEndpointWorks(
    app: Express,
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    options: {
      auth?: TestUser;
      body?: any;
      query?: any;
      expectedStatus?: number;
      validator?: (response: any) => void;
    } = {}
  ) {
    let req = request(app)[method](path);

    if (options.auth) {
      req = req.auth(options.auth.token, { type: 'bearer' });
    }

    if (options.body) {
      req = req.send(options.body);
    }

    if (options.query) {
      req = req.query(options.query);
    }

    const response = await req;

    expect(response.status).toBe(options.expectedStatus || 200);

    if (options.validator) {
      options.validator(response.body);
    }

    return response;
  },
};

/**
 * Performance test helpers for real implementations
 */
export const performanceHelpers = {
  /**
   * Measure real database query performance
   */
  async measureDatabasePerformance(
    operation: () => Promise<any>,
    maxDuration: number = 100
  ): Promise<number> {
    const start = Date.now();
    await operation();
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(maxDuration);
    return duration;
  },

  /**
   * Test with realistic data volumes
   */
  async createRealisticDataVolume(factory: TestDataFactory, userId: number) {
    await factory.initialize();

    // Create realistic amounts of data
    const subjects = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        factory.createSubject(userId, {
          name: `Subject ${i + 1}`,
          code: `SUB${i + 1}`,
        })
      )
    );

    const students = await Promise.all(
      Array.from({ length: 30 }, (_, i) =>
        factory.createStudent(userId, {
          firstName: `Student${i + 1}`,
          lastName: `Test`,
          grade: 5 + (i % 3),
        })
      )
    );

    const expectations = await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        factory.createCurriculumExpectation({
          code: `EXP.${i + 1}`,
          description: `Expectation ${i + 1}`,
          subject: subjects[i % subjects.length].name,
          grade: 5 + (i % 3),
          strand: `Strand ${(i % 5) + 1}`,
        })
      )
    );

    return { subjects, students, expectations };
  },
};

/**
 * Cleanup helper for tests
 */
export async function cleanupTest(workerId?: string) {
  const id = workerId || process.env.JEST_WORKER_ID || 'test';
  await testDb.cleanData(id);
}

/**
 * Cleanup test data - alias for cleanupTest for compatibility
 */
export async function cleanupTestData(workerId?: string) {
  return cleanupTest(workerId);
}

/**
 * Complete test lifecycle helper
 */
export function setupRealTestLifecycle() {
  const workerId = process.env.JEST_WORKER_ID || 'test';

  beforeAll(async () => {
    await testDb.initialize(workerId);
  });

  afterEach(async () => {
    await testDb.cleanData(workerId);
  });

  afterAll(async () => {
    await testDb.cleanup(workerId);
  });

  return {
    getClient: () => testDb.getClient(workerId),
    createUser: createTestUser,
    createApp: createTestApp,
  };
}