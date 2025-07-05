# Migration Guide: From Mock-Based to Real Implementation Testing

**Last Updated**: January 2025  
**Version**: 1.0  
**Purpose**: Step-by-step guide for migrating existing mock-based tests to real implementation testing

## Table of Contents

- [Overview](#overview)
- [Migration Strategy](#migration-strategy)
- [Assessment and Planning](#assessment-and-planning)
- [Migration Process](#migration-process)
- [Common Patterns and Transformations](#common-patterns-and-transformations)
- [Validation and Quality Assurance](#validation-and-quality-assurance)
- [Performance Optimization](#performance-optimization)
- [Team Coordination](#team-coordination)
- [Troubleshooting Migration Issues](#troubleshooting-migration-issues)

## Overview

This guide provides a systematic approach for migrating from mock-based testing to real implementation testing. The migration ensures improved test reliability and better integration coverage while maintaining development velocity.

### Migration Goals

🎯 **Reliability**: Replace brittle mocks with robust real implementations  
🔗 **Integration**: Catch real integration issues early  
📊 **Performance**: Identify actual performance bottlenecks  
🧹 **Maintainability**: Reduce mock maintenance overhead  
🚀 **Confidence**: Deploy with higher confidence in code quality

### Migration Principles

1. **Gradual Migration**: Migrate incrementally to avoid disruption
2. **Hybrid Testing**: Use both approaches during transition
3. **Performance Focus**: Maintain acceptable test execution times
4. **Quality Gates**: Enforce quality standards throughout migration
5. **Team Alignment**: Coordinate migration across team members

## Migration Strategy

### Phase 1: Assessment and Planning (Week 1-2)

```bash
# Assess current test suite
pnpm --filter server run test:assess-migration

# Generate migration plan
pnpm --filter server run test:migration-plan

# Identify quick wins and complex cases
pnpm --filter server run test:categorize-tests
```

### Phase 2: Infrastructure Setup (Week 2-3)

- Set up test database infrastructure
- Implement test utilities and helpers
- Create migration templates and patterns
- Establish quality gates and CI integration

### Phase 3: Incremental Migration (Week 3-8)

- Start with simple service tests
- Migrate integration tests
- Update API endpoint tests
- Address complex workflow tests

### Phase 4: Validation and Optimization (Week 8-10)

- Performance optimization
- Quality validation
- Documentation updates
- Team training and knowledge transfer

## Assessment and Planning

### 1. Analyze Current Test Suite

Create a comprehensive assessment of your existing tests:

```typescript
// scripts/assess-test-migration.ts
import { TestMigrationAssessment } from './migration-assessment';

const assessment = new TestMigrationAssessment();

async function analyzeTestSuite() {
  const results = await assessment.analyze({
    testPattern: '**/*.{test,spec}.ts',
    includePatterns: [
      'jest.mock',
      'mockReturnValue',
      'mockResolvedValue',
      '.mock.'
    ],
    excludePatterns: [
      '__mocks__',
      'test-utils'
    ]
  });

  console.log('Migration Assessment Results:');
  console.log(`Total test files: ${results.totalFiles}`);
  console.log(`Mock-based tests: ${results.mockBasedTests}`);
  console.log(`Integration ready: ${results.integrationReady}`);
  console.log(`Complex migrations: ${results.complexMigrations}`);
  
  return results;
}
```

### 2. Categorize Tests by Migration Complexity

#### Low Complexity (Quick Wins)
```typescript
// Example: Simple service test with database mocks
// Before (Mock-based)
jest.mock('@prisma/client');
const mockPrisma = {
  user: {
    create: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' })
  }
};

// After (Real Implementation) - Easy migration
const testDb = new TestDatabaseManager({ useTransactions: true });
const userService = new UserService(testDb.getPrismaClient());
const user = await userService.create({ email: 'test@example.com' });
```

#### Medium Complexity (Moderate Effort)
```typescript
// Example: Service with multiple dependencies
// Before (Mock-based)
jest.mock('@/services/EmailService');
jest.mock('@/services/UserService');

// After (Real Implementation) - Some setup required
const emailService = new EmailService(mockSMTPProvider); // Keep external mock
const userService = new UserService(realPrisma); // Use real implementation
const notificationService = new NotificationService(userService, emailService);
```

#### High Complexity (Significant Effort)
```typescript
// Example: Complex workflow with multiple services and external APIs
// Before (Mock-based)
jest.mock('@/services/PaymentProvider');
jest.mock('@/services/EmailService');
jest.mock('@/services/CurriculumService');

// After (Real Implementation) - Requires careful planning
// Strategy: Mock external services, use real internal services
```

### 3. Create Migration Plan

```typescript
interface MigrationPlan {
  phase: number;
  description: string;
  files: string[];
  estimatedEffort: string;
  dependencies: string[];
  risks: string[];
}

const migrationPlan: MigrationPlan[] = [
  {
    phase: 1,
    description: 'Simple service tests with database operations',
    files: [
      'UserService.test.ts',
      'LessonPlanService.test.ts',
      'CurriculumService.test.ts'
    ],
    estimatedEffort: '1-2 days',
    dependencies: ['Test database setup', 'Basic test utilities'],
    risks: ['Low - straightforward migration']
  },
  {
    phase: 2,
    description: 'Integration tests with multiple services',
    files: [
      'ETFOWorkflow.test.ts',
      'PlanningService.test.ts',
      'AuthService.test.ts'
    ],
    estimatedEffort: '3-5 days',
    dependencies: ['Phase 1 completion', 'Advanced test utilities'],
    risks: ['Medium - complex service interactions']
  },
  {
    phase: 3,
    description: 'API endpoint tests with authentication',
    files: [
      'auth-routes.test.ts',
      'lesson-plan-routes.test.ts',
      'curriculum-routes.test.ts'
    ],
    estimatedEffort: '2-3 days',
    dependencies: ['Test server setup', 'Authentication utilities'],
    risks: ['Medium - HTTP testing complexity']
  }
];
```

## Migration Process

### 1. Infrastructure Setup

#### Test Database Configuration

```typescript
// test-utils/database/TestDatabaseManager.ts
export class TestDatabaseManager {
  private prisma: PrismaClient;
  private currentTransaction?: PrismaTransaction;

  constructor(private config: TestDatabaseConfig = {}) {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || 'file:./test.db'
        }
      }
    });
  }

  async setup(): Promise<void> {
    // Ensure database is ready
    await this.prisma.$connect();
    
    // Run migrations if needed
    if (this.config.runMigrations) {
      await this.runMigrations();
    }
    
    // Seed test data if needed
    if (this.config.seedData) {
      await this.seedTestData();
    }
  }

  async startTransaction(): Promise<void> {
    this.currentTransaction = await this.prisma.$begin();
  }

  async rollbackTransaction(): Promise<void> {
    if (this.currentTransaction) {
      await this.currentTransaction.$rollback();
      this.currentTransaction = undefined;
    }
  }

  getPrismaClient(): PrismaClient | PrismaTransaction {
    return this.currentTransaction || this.prisma;
  }

  async cleanup(): Promise<void> {
    await this.rollbackTransaction();
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
```

#### Test Data Generators

```typescript
// test-utils/data/RealisticDataGenerator.ts
export class RealisticDataGenerator {
  constructor(private faker: Faker) {}

  createUser(overrides: Partial<User> = {}): User {
    return {
      id: this.faker.datatype.uuid(),
      email: this.faker.internet.email(),
      firstName: this.faker.name.firstName(),
      lastName: this.faker.name.lastName(),
      role: 'TEACHER',
      createdAt: this.faker.date.recent(),
      ...overrides
    };
  }

  createLessonPlan(overrides: Partial<LessonPlan> = {}): LessonPlan {
    return {
      id: this.faker.datatype.uuid(),
      title: `${this.faker.hacker.adjective()} ${this.faker.hacker.noun()} Lesson`,
      subject: this.faker.helpers.arrayElement(['Math', 'Science', 'English']),
      grade: this.faker.datatype.number({ min: 1, max: 12 }),
      duration: this.faker.datatype.number({ min: 30, max: 120 }),
      objectives: this.generateObjectives(),
      activities: this.generateActivities(),
      materials: this.generateMaterials(),
      assessment: this.generateAssessment(),
      createdAt: this.faker.date.recent(),
      ...overrides
    };
  }

  createRealisticDataset(options: DatasetOptions): RealisticDataset {
    const users = Array.from({ length: options.users || 10 }, () => this.createUser());
    const lessonPlans = Array.from({ length: options.lessonPlans || 20 }, () => 
      this.createLessonPlan({ teacherId: this.faker.helpers.arrayElement(users).id })
    );
    
    return { users, lessonPlans };
  }
}
```

### 2. Step-by-Step Migration Process

#### Step 1: Simple Service Migration

```typescript
// Before: UserService.test.ts (Mock-based)
describe('UserService', () => {
  let userService: UserService;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrisma = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      }
    } as any;
    
    userService = new UserService(mockPrisma);
  });

  it('should create user', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };
    mockPrisma.user.create.mockResolvedValue({ id: 1, ...userData });

    const result = await userService.createUser(userData);

    expect(mockPrisma.user.create).toHaveBeenCalledWith({ data: userData });
    expect(result).toEqual({ id: 1, ...userData });
  });
});
```

```typescript
// After: UserService.real.test.ts (Real Implementation)
import { TestDatabaseManager } from '@/test-utils/database';
import { testUtils, performanceTestUtils } from '@/test-utils';
import { UserService } from '../UserService';

describe('UserService - Real Implementation', () => {
  let testDb: TestDatabaseManager;
  let userService: UserService;
  let performanceManager: PerformanceTestManager;

  beforeAll(async () => {
    performanceManager = performanceTestUtils.createOptimizedTestEnvironment({
      maxExecutionTime: 3000,
      enableQueryOptimization: true
    });
  });

  beforeEach(async () => {
    testDb = new TestDatabaseManager({
      useTransactions: true,
      isolationLevel: 'READ_COMMITTED'
    });
    
    await testDb.setup();
    const prisma = testDb.getPrismaClient();
    userService = new UserService(prisma);
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.disconnect();
    await performanceManager.cleanup();
  });

  it('should create user when valid data provided', async () => {
    // Performance monitoring
    const { result: user, metrics } = await performanceManager.measureTestPerformance(
      'create-user',
      async () => {
        // Use realistic test data
        const userData = testUtils.createRealisticTestData({
          users: 1
        }).users[0];

        // Test real implementation
        return userService.createUser(userData);
      }
    );

    // Comprehensive assertions
    expect(user).toMatchObject({
      email: expect.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      name: expect.stringContaining(' '),
      id: expect.any(String)
    });

    // Performance assertions
    expect(metrics.isAcceptable).toBe(true);
    expect(metrics.executionTime).toBeLessThan(1000);

    // Database verification
    const dbUser = await testDb.getPrismaClient().user.findUnique({
      where: { id: user.id }
    });
    expect(dbUser).toBeTruthy();
    expect(dbUser!.email).toBe(user.email);
  });

  it('should handle duplicate email error when user already exists', async () => {
    // Create initial user
    const userData = testUtils.createRealisticTestData({ users: 1 }).users[0];
    await userService.createUser(userData);

    // Attempt to create duplicate
    await expect(
      userService.createUser({ ...userData })
    ).rejects.toThrow(/unique constraint/i);

    // Verify only one user exists
    const users = await testDb.getPrismaClient().user.findMany({
      where: { email: userData.email }
    });
    expect(users).toHaveLength(1);
  });
});
```

#### Step 2: Integration Test Migration

```typescript
// Before: ETFOWorkflow.test.ts (Mock-based)
describe('ETFOWorkflow', () => {
  let workflow: ETFOWorkflow;
  let mockLessonPlanService: jest.Mocked<LessonPlanService>;
  let mockCurriculumService: jest.Mocked<CurriculumService>;

  beforeEach(() => {
    mockLessonPlanService = {
      createLessonPlan: jest.fn(),
      findByTeacher: jest.fn()
    } as any;

    mockCurriculumService = {
      getExpectations: jest.fn(),
      findByGrade: jest.fn()
    } as any;

    workflow = new ETFOWorkflow(mockLessonPlanService, mockCurriculumService);
  });

  it('should create lesson plan with curriculum', async () => {
    mockCurriculumService.getExpectations.mockResolvedValue([{ id: 1, text: 'Math' }]);
    mockLessonPlanService.createLessonPlan.mockResolvedValue({ id: 1, title: 'Test' });

    const result = await workflow.createLessonPlan({ teacherId: 1, grade: 3 });

    expect(result).toEqual({ id: 1, title: 'Test' });
  });
});
```

```typescript
// After: ETFOWorkflow.real.test.ts (Real Implementation)
import { TestDatabaseManager } from '@/test-utils/database';
import { testUtils, performanceTestUtils } from '@/test-utils';
import { ETFOWorkflow } from '../ETFOWorkflow';
import { LessonPlanService } from '../LessonPlanService';
import { CurriculumService } from '../CurriculumService';

describe('ETFOWorkflow - Real Implementation', () => {
  let testDb: TestDatabaseManager;
  let workflow: ETFOWorkflow;
  let lessonPlanService: LessonPlanService;
  let curriculumService: CurriculumService;
  let performanceManager: PerformanceTestManager;
  let testData: any;

  beforeAll(async () => {
    performanceManager = performanceTestUtils.createOptimizedTestEnvironment({
      maxExecutionTime: 5000,
      enableQueryOptimization: true
    });
  });

  beforeEach(async () => {
    testDb = new TestDatabaseManager({
      useTransactions: true,
      isolationLevel: 'READ_COMMITTED'
    });
    
    await testDb.setup();
    const prisma = testDb.getPrismaClient();
    
    // Create real service instances
    lessonPlanService = new LessonPlanService(prisma);
    curriculumService = new CurriculumService(prisma);
    workflow = new ETFOWorkflow(lessonPlanService, curriculumService);

    // Setup realistic test data
    testData = await testUtils.createRealisticTestData({
      users: 1,
      subjects: ['Mathematics'],
      grade: 3,
      outcomes: 5,
      withRelationships: true
    });
    
    // Seed database with test data
    await testDb.seedData(testData);
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.disconnect();
    await performanceManager.cleanup();
  });

  it('should create lesson plan with curriculum when teacher and grade provided', async () => {
    const { result: lessonPlan, metrics } = await performanceManager.measureTestPerformance(
      'create-lesson-plan-with-curriculum',
      async () => {
        return workflow.createLessonPlan({
          teacherId: testData.users[0].id,
          grade: 3,
          subject: 'Mathematics',
          title: 'Fractions Introduction'
        });
      }
    );

    // Comprehensive validation
    expect(lessonPlan).toMatchObject({
      id: expect.any(String),
      title: 'Fractions Introduction',
      teacherId: testData.users[0].id,
      grade: 3,
      outcomes: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          description: expect.any(String)
        })
      ])
    });

    // Performance validation
    expect(metrics.isAcceptable).toBe(true);
    expect(metrics.executionTime).toBeLessThan(3000);
    expect(metrics.queryCount).toBeLessThan(10);

    // Database verification
    const dbLessonPlan = await testDb.getPrismaClient().lessonPlan.findUnique({
      where: { id: lessonPlan.id },
      include: { outcomes: true }
    });
    
    expect(dbLessonPlan).toBeTruthy();
    expect(dbLessonPlan!.outcomes).toHaveLength(lessonPlan.outcomes.length);
  });

  it('should handle invalid grade gracefully when no curriculum available', async () => {
    await expect(
      workflow.createLessonPlan({
        teacherId: testData.users[0].id,
        grade: 99, // Invalid grade
        subject: 'Mathematics'
      })
    ).rejects.toThrow(/no curriculum found for grade 99/i);

    // Verify no lesson plan was created
    const lessonPlans = await testDb.getPrismaClient().lessonPlan.findMany({
      where: { teacherId: testData.users[0].id }
    });
    expect(lessonPlans).toHaveLength(0);
  });
});
```

#### Step 3: API Endpoint Migration

```typescript
// Before: auth-routes.test.ts (Mock-based)
describe('Auth Routes', () => {
  let app: Express;
  let mockAuthService: jest.Mocked<AuthService>;

  beforeEach(() => {
    mockAuthService = {
      login: jest.fn(),
      register: jest.fn(),
      validateToken: jest.fn()
    } as any;

    app = createTestApp({ authService: mockAuthService });
  });

  it('should login user', async () => {
    mockAuthService.login.mockResolvedValue({
      user: { id: 1, email: 'test@example.com' },
      token: 'jwt-token'
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: { id: 1, email: 'test@example.com' },
      token: 'jwt-token'
    });
  });
});
```

```typescript
// After: auth-routes.real.test.ts (Real Implementation)
import { TestDatabaseManager } from '@/test-utils/database';
import { testUtils, performanceTestUtils, AuthTestUtils } from '@/test-utils';
import { setupTestServer } from '@/test-utils/test-server';
import request from 'supertest';

describe('Auth Routes - Real Implementation', () => {
  let testDb: TestDatabaseManager;
  let server: TestServer;
  let performanceManager: PerformanceTestManager;
  let authUtils: AuthTestUtils;

  beforeAll(async () => {
    performanceManager = performanceTestUtils.createOptimizedTestEnvironment({
      maxExecutionTime: 10000,
      enableQueryOptimization: true
    });

    // Setup real test server
    server = await setupTestServer({
      useRealDatabase: true,
      useRealAuth: true,
      mockExternalServices: true
    });

    authUtils = new AuthTestUtils(server.baseUrl);
  });

  beforeEach(async () => {
    testDb = new TestDatabaseManager({
      useTransactions: true,
      isolationLevel: 'READ_COMMITTED'
    });
    
    await testDb.setup();
  });

  afterEach(async () => {
    await testDb.cleanup();
  });

  afterAll(async () => {
    await testDb.disconnect();
    await server.close();
    await performanceManager.cleanup();
  });

  it('should authenticate user when valid credentials provided', async () => {
    // Create real test user
    const password = 'SecurePassword123!';
    const userData = testUtils.createRealisticTestData({ users: 1 }).users[0];
    const testUser = await authUtils.createTestUser({
      ...userData,
      password
    });

    const { result: response, metrics } = await performanceManager.measureTestPerformance(
      'auth-login',
      async () => {
        return request(server.app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password
          });
      }
    );

    // Response validation
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      user: {
        id: testUser.id,
        email: testUser.email,
        firstName: testUser.firstName,
        lastName: testUser.lastName
      },
      accessToken: expect.stringMatching(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/)
    });

    // JWT validation
    const decodedToken = jwt.verify(response.body.accessToken, process.env.JWT_SECRET!);
    expect(decodedToken).toMatchObject({
      userId: testUser.id,
      email: testUser.email
    });

    // Performance validation
    expect(metrics.isAcceptable).toBe(true);
    expect(metrics.executionTime).toBeLessThan(2000);

    // Database verification - check login was logged
    const loginLog = await testDb.getPrismaClient().loginLog.findFirst({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    });
    expect(loginLog).toBeTruthy();
    expect(loginLog!.success).toBe(true);
  });

  it('should reject authentication when invalid credentials provided', async () => {
    const testUser = await authUtils.createTestUser({
      email: 'test@example.com',
      password: 'CorrectPassword123!'
    });

    const response = await request(server.app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword123!'
      });

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      error: 'Invalid credentials'
    });

    // Verify failed login was logged
    const loginLog = await testDb.getPrismaClient().loginLog.findFirst({
      where: { 
        userId: testUser.id,
        success: false
      },
      orderBy: { createdAt: 'desc' }
    });
    expect(loginLog).toBeTruthy();
  });

  it('should handle concurrent login attempts efficiently', async () => {
    const users = await Promise.all(
      Array.from({ length: 5 }, async (_, i) => {
        return authUtils.createTestUser({
          email: `user${i}@example.com`,
          password: 'Password123!'
        });
      })
    );

    const loginPromises = users.map(user => 
      request(server.app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'Password123!'
        })
    );

    const { result: responses, metrics } = await performanceManager.measureTestPerformance(
      'concurrent-logins',
      () => Promise.all(loginPromises)
    );

    // All logins should succeed
    responses.forEach(response => {
      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeTruthy();
    });

    // Performance validation for concurrent operations
    expect(metrics.executionTime).toBeLessThan(5000);
    
    // Verify all logins were logged
    const loginLogs = await testDb.getPrismaClient().loginLog.findMany({
      where: { success: true }
    });
    expect(loginLogs).toHaveLength(5);
  });
});
```

### 3. Hybrid Testing During Migration

Use hybrid testing to validate migration accuracy:

```typescript
// test-utils/migration/HybridTestRunner.ts
export class HybridTestRunner {
  constructor(private config: HybridTestConfig) {}

  async runHybridTest<T>(
    testName: string,
    realImplementation: () => Promise<T>,
    mockImplementation: () => Promise<T>,
    options: HybridTestOptions = {}
  ): Promise<HybridTestResult<T>> {
    const startTime = Date.now();
    
    try {
      // Run both implementations
      const [realResult, mockResult] = await Promise.all([
        this.runWithTimeout(realImplementation, options.realTimeout || 10000),
        this.runWithTimeout(mockImplementation, options.mockTimeout || 5000)
      ]);

      // Compare results
      const comparison = this.compareResults(realResult, mockResult, options.compareOptions);
      
      // Log differences if enabled
      if (options.logDifferences && comparison.differences.length > 0) {
        this.logDifferences(testName, comparison.differences);
      }

      return {
        testName,
        realResult,
        mockResult,
        comparison,
        executionTime: Date.now() - startTime,
        success: true
      };
    } catch (error) {
      return {
        testName,
        realResult: null,
        mockResult: null,
        comparison: null,
        executionTime: Date.now() - startTime,
        success: false,
        error: error.message
      };
    }
  }

  private compareResults<T>(real: T, mock: T, options: CompareOptions = {}): ComparisonResult {
    const differences: Difference[] = [];
    
    // Deep comparison with configurable tolerance
    const realJson = JSON.stringify(real, null, 2);
    const mockJson = JSON.stringify(mock, null, 2);
    
    if (realJson !== mockJson) {
      // Detailed diff analysis
      const diff = this.createDetailedDiff(real, mock, options);
      differences.push(...diff);
    }

    return {
      identical: differences.length === 0,
      differences,
      similarity: this.calculateSimilarity(real, mock)
    };
  }

  generateMigrationReport(results: HybridTestResult[]): MigrationReport {
    const totalTests = results.length;
    const successfulTests = results.filter(r => r.success).length;
    const identicalResults = results.filter(r => r.comparison?.identical).length;
    
    return {
      totalTests,
      successfulTests,
      identicalResults,
      successRate: successfulTests / totalTests,
      accuracyRate: identicalResults / successfulTests,
      averageExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0) / totalTests,
      recommendations: this.generateRecommendations(results)
    };
  }
}

// Usage example
describe('UserService Migration - Hybrid Testing', () => {
  const hybridRunner = new HybridTestRunner({
    enableLogging: true,
    generateReport: true
  });

  it('should create user - hybrid validation', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };

    const result = await hybridRunner.runHybridTest(
      'create-user',
      // Real implementation
      () => realUserService.createUser(userData),
      // Mock implementation
      () => Promise.resolve({ id: 1, ...userData, createdAt: new Date() }),
      {
        logDifferences: true,
        compareOptions: {
          ignoreFields: ['id', 'createdAt'], // Expected differences
          tolerateTypeCoercion: true
        }
      }
    );

    expect(result.success).toBe(true);
    expect(result.comparison.similarity).toBeGreaterThan(0.8);
    
    // Use real result for assertions
    expect(result.realResult.email).toBe(userData.email);
    expect(result.realResult.id).toBeTruthy();
  });
});
```

## Common Patterns and Transformations

### 1. Database Mock to Real Database

```typescript
// Pattern: Database operation mocking
// Before
jest.mock('@prisma/client');
const mockPrisma = {
  user: {
    create: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' }),
    findUnique: jest.fn().mockResolvedValue(null),
    update: jest.fn().mockResolvedValue({ id: 1, email: 'updated@example.com' })
  }
};

// After
const testDb = new TestDatabaseManager({ useTransactions: true });
const prisma = testDb.getPrismaClient();

// Real operations with automatic cleanup
const user = await prisma.user.create({ data: { email: 'test@example.com' } });
const foundUser = await prisma.user.findUnique({ where: { id: user.id } });
const updatedUser = await prisma.user.update({ 
  where: { id: user.id }, 
  data: { email: 'updated@example.com' } 
});
```

### 2. Service Mock to Real Service

```typescript
// Pattern: Service dependency mocking
// Before
jest.mock('@/services/EmailService');
const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
};

const userService = new UserService(mockPrisma, mockEmailService);

// After
// Keep external service mocked, use real internal services
const mockEmailProvider = {
  send: jest.fn().mockResolvedValue({ messageId: 'test-id' })
};
const emailService = new EmailService(mockEmailProvider); // Real service, mock provider
const userService = new UserService(realPrisma, emailService); // Real services
```

### 3. Simple Data Mock to Realistic Data

```typescript
// Pattern: Test data generation
// Before
const userData = { id: 1, email: 'test@example.com', name: 'Test User' };
const lessonPlan = { id: 1, title: 'Test Lesson', teacherId: 1 };

// After
const userData = testUtils.createRealisticTestData({
  users: 1,
  withProfile: true,
  respectConstraints: true
}).users[0];

const lessonPlan = testUtils.createRealisticTestData({
  lessonPlans: 1,
  teacherId: userData.id,
  subject: 'Mathematics',
  grade: 3
}).lessonPlans[0];
```

### 4. HTTP Mock to Real HTTP Testing

```typescript
// Pattern: API endpoint testing
// Before
const mockRequest = {
  post: jest.fn().mockResolvedValue({
    status: 200,
    body: { id: 1, message: 'Success' }
  })
};

// After
const server = await setupTestServer({ useRealDatabase: true });
const response = await request(server.app)
  .post('/api/endpoint')
  .send(testData)
  .expect(200);

expect(response.body).toMatchObject({
  id: expect.any(String),
  message: 'Success'
});
```

### 5. Error Simulation to Real Error Handling

```typescript
// Pattern: Error condition testing
// Before
mockService.method.mockRejectedValue(new Error('Database connection failed'));

// After
// Test real error conditions
await expect(
  service.performOperation(invalidData)
).rejects.toThrow(/validation failed/i);

// Test database constraint violations
await service.createUser(validUserData);
await expect(
  service.createUser(validUserData) // Duplicate email
).rejects.toThrow(/unique constraint/i);
```

## Validation and Quality Assurance

### 1. Migration Quality Checklist

```markdown
## Pre-Migration Checklist
- [ ] Test database infrastructure is set up
- [ ] Test utilities and helpers are available
- [ ] Performance monitoring is configured
- [ ] Migration plan is reviewed and approved

## During Migration Checklist
- [ ] Real implementation tests pass
- [ ] Performance is within acceptable limits
- [ ] Database cleanup is working properly
- [ ] Test isolation is maintained
- [ ] Error scenarios are tested

## Post-Migration Checklist
- [ ] All tests pass consistently
- [ ] Performance benchmarks are met
- [ ] Code coverage is maintained or improved
- [ ] No mock-related code remains
- [ ] Documentation is updated
```

### 2. Automated Quality Validation

```bash
# Run migration validation
pnpm --filter server run test:validate-migration

# Performance regression check
pnpm --filter server run test:performance-compare

# Quality gate validation
pnpm --filter server run test:quality-gate

# Coverage validation
pnpm --filter server run test:coverage:validate
```

### 3. Performance Benchmarking

```typescript
// scripts/benchmark-migration.ts
import { PerformanceBenchmark } from './performance-benchmark';

async function benchmarkMigration() {
  const benchmark = new PerformanceBenchmark();
  
  // Baseline measurements (before migration)
  const baseline = await benchmark.measureBaseline([
    'UserService.createUser',
    'LessonPlanService.createLessonPlan',
    'AuthService.login'
  ]);
  
  // Post-migration measurements
  const postMigration = await benchmark.measureCurrent([
    'UserService.createUser',
    'LessonPlanService.createLessonPlan', 
    'AuthService.login'
  ]);
  
  // Compare and report
  const comparison = benchmark.compare(baseline, postMigration);
  
  console.log('Performance Impact Report:');
  comparison.forEach(({ operation, baselineTime, currentTime, change }) => {
    const impact = change > 0 ? 'SLOWER' : 'FASTER';
    const percentage = Math.abs(change * 100).toFixed(1);
    console.log(`${operation}: ${impact} by ${percentage}%`);
  });
  
  return comparison;
}
```

## Performance Optimization

### 1. Database Query Optimization

```typescript
// Optimize database queries for test performance
class OptimizedTestQueries {
  static async batchCreateUsers(prisma: PrismaClient, users: User[]): Promise<User[]> {
    // Use batch operations for better performance
    await prisma.user.createMany({
      data: users,
      skipDuplicates: true
    });
    
    // Return created users efficiently
    return prisma.user.findMany({
      where: {
        email: { in: users.map(u => u.email) }
      }
    });
  }

  static async optimizedCleanup(prisma: PrismaClient): Promise<void> {
    // Delete in proper order to respect foreign key constraints
    await prisma.lessonPlan.deleteMany();
    await prisma.user.deleteMany();
    // Add other tables as needed
  }
}
```

### 2. Connection Pool Management

```typescript
// Optimize database connections for test performance
export class OptimizedTestDatabaseManager extends TestDatabaseManager {
  private static connectionPool: PrismaClient[] = [];
  private static readonly MAX_CONNECTIONS = 5;

  static async getOptimizedConnection(): Promise<PrismaClient> {
    if (this.connectionPool.length > 0) {
      return this.connectionPool.pop()!;
    }
    
    const prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.TEST_DATABASE_URL }
      }
    });
    
    await prisma.$connect();
    return prisma;
  }

  static async returnConnection(prisma: PrismaClient): Promise<void> {
    if (this.connectionPool.length < this.MAX_CONNECTIONS) {
      // Clean the connection before returning to pool
      await this.cleanConnection(prisma);
      this.connectionPool.push(prisma);
    } else {
      await prisma.$disconnect();
    }
  }

  private static async cleanConnection(prisma: PrismaClient): Promise<void> {
    // Reset connection state without disconnecting
    await prisma.$executeRaw`ROLLBACK`;
    await prisma.$executeRaw`BEGIN`;
  }
}
```

### 3. Test Data Caching

```typescript
// Cache test data to improve performance
export class TestDataCache {
  private static cache = new Map<string, any>();
  private static readonly TTL = 5 * 60 * 1000; // 5 minutes

  static async getOrCreate<T>(
    key: string,
    generator: () => Promise<T>,
    ttl: number = this.TTL
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < ttl) {
      return cached.data;
    }
    
    const data = await generator();
    this.cache.set(key, { data, timestamp: Date.now() });
    
    return data;
  }

  static clear(): void {
    this.cache.clear();
  }
}

// Usage in tests
const testData = await TestDataCache.getOrCreate(
  'basic-curriculum-data',
  () => testUtils.createRealisticTestData({
    subjects: ['Math', 'Science'],
    outcomes: 10
  }),
  10 * 60 * 1000 // 10 minutes
);
```

## Team Coordination

### 1. Migration Timeline and Phases

```typescript
interface MigrationPhase {
  name: string;
  duration: string;
  owner: string;
  dependencies: string[];
  deliverables: string[];
  criteria: string[];
}

const migrationPhases: MigrationPhase[] = [
  {
    name: 'Infrastructure Setup',
    duration: '1 week',
    owner: 'DevOps + Test Infrastructure Team',
    dependencies: [],
    deliverables: [
      'Test database infrastructure',
      'Test utilities library',
      'CI/CD pipeline updates',
      'Performance monitoring setup'
    ],
    criteria: [
      'Test database can be setup and torn down reliably',
      'Performance monitoring captures metrics accurately',
      'CI pipeline validates test quality'
    ]
  },
  {
    name: 'Service Layer Migration',
    duration: '2 weeks',
    owner: 'Backend Team',
    dependencies: ['Infrastructure Setup'],
    deliverables: [
      'Migrated service tests',
      'Real implementation patterns',
      'Performance benchmarks'
    ],
    criteria: [
      'All service tests use real implementations',
      'Performance is within 20% of baseline',
      '90%+ test coverage maintained'
    ]
  },
  {
    name: 'Integration Test Migration',
    duration: '2 weeks', 
    owner: 'Full Stack Team',
    dependencies: ['Service Layer Migration'],
    deliverables: [
      'Migrated integration tests',
      'Workflow testing patterns',
      'Error handling validation'
    ],
    criteria: [
      'End-to-end workflows tested with real implementations',
      'Error scenarios properly validated',
      'Performance acceptable for integration tests'
    ]
  },
  {
    name: 'API and Frontend Migration',
    duration: '1.5 weeks',
    owner: 'Frontend + API Team',
    dependencies: ['Integration Test Migration'],
    deliverables: [
      'API endpoint tests with real backend',
      'Frontend tests with real API calls',
      'Authentication flow testing'
    ],
    criteria: [
      'API tests use real HTTP requests',
      'Frontend tests interact with real backend',
      'Authentication flows tested end-to-end'
    ]
  }
];
```

### 2. Communication Plan

```markdown
## Daily Standups
- Migration progress updates
- Blockers and dependencies
- Performance concerns
- Quality issues

## Weekly Migration Reviews
- Phase completion assessment
- Performance benchmark review
- Quality metrics evaluation
- Next phase planning

## Ad-hoc Communication
- Slack #real-implementation-migration channel
- GitHub issues for tracking specific migration tasks
- Documentation updates in real-time
```

### 3. Training and Knowledge Transfer

```typescript
// Training materials and exercises
const trainingPlan = {
  week1: {
    title: 'Real Implementation Testing Fundamentals',
    activities: [
      'Review testing standards documentation',
      'Complete onboarding guide exercises',
      'Set up local test environment',
      'Write first real implementation test'
    ],
    deliverables: [
      'Working test environment',
      'Sample real implementation test',
      'Understanding of core concepts'
    ]
  },
  week2: {
    title: 'Migration Techniques and Patterns',
    activities: [
      'Learn migration patterns',
      'Practice hybrid testing',
      'Work on actual migration tasks',
      'Participate in code reviews'
    ],
    deliverables: [
      'Migrated test files',
      'Performance optimization examples',
      'Code review participation'
    ]
  },
  week3: {
    title: 'Advanced Patterns and Performance',
    activities: [
      'Advanced testing patterns',
      'Performance optimization techniques',
      'Complex workflow testing',
      'Mentoring newer team members'
    ],
    deliverables: [
      'Complex test scenarios',
      'Performance optimization contributions',
      'Knowledge sharing sessions'
    ]
  }
};
```

## Troubleshooting Migration Issues

### Common Migration Problems and Solutions

#### 1. Performance Degradation

**Problem**: Tests running significantly slower after migration

**Diagnosis**:
```typescript
// Measure performance before and after
const performanceDiagnostic = new PerformanceDiagnostic();

const issues = await performanceDiagnostic.analyze({
  testFiles: ['UserService.real.test.ts'],
  baseline: 'mock-based-performance.json',
  tolerance: 0.2 // 20% tolerance
});

console.log('Performance Issues:', issues);
```

**Solutions**:
- Use database transactions for test isolation
- Implement connection pooling
- Optimize database queries
- Cache test data when appropriate
- Use batch operations for data setup

#### 2. Test Flakiness

**Problem**: Tests passing/failing inconsistently

**Diagnosis**:
```typescript
// Run flakiness detection
const flakinessDetector = new FlakinessDetector();

const results = await flakinessDetector.runMultiple({
  testFile: 'UserService.real.test.ts',
  iterations: 10,
  parallel: true
});

console.log('Flakiness Report:', results.getFlakinessReport());
```

**Solutions**:
- Ensure proper test isolation with transactions
- Fix race conditions in async operations
- Use deterministic test data
- Add proper wait conditions for async operations
- Implement retry mechanisms for external dependencies

#### 3. Memory Issues

**Problem**: Memory usage growing during test execution

**Diagnosis**:
```typescript
// Memory leak detection
const memoryProfiler = new MemoryProfiler();

await memoryProfiler.profileTestSuite({
  pattern: '**/*.real.test.ts',
  checkpoints: ['beforeEach', 'afterEach', 'afterAll']
});

console.log('Memory Profile:', memoryProfiler.getReport());
```

**Solutions**:
- Implement proper cleanup in afterEach/afterAll
- Disconnect database connections
- Clear large objects and caches
- Use WeakMap/WeakSet for temporary references
- Force garbage collection in test environment

#### 4. Database Connection Issues

**Problem**: Connection pool exhaustion or timeouts

**Diagnosis**:
```bash
# Check database connections
pnpm --filter server run test:db-connections-debug

# Monitor connection pool
pnpm --filter server run test:db-pool-monitor
```

**Solutions**:
- Configure appropriate connection pool size
- Implement connection cleanup
- Use connection timeouts
- Monitor active connections
- Implement connection health checks

### Migration Validation Tools

```typescript
// Migration validation suite
export class MigrationValidator {
  async validateMigration(testFile: string): Promise<ValidationResult> {
    const results = [];
    
    // Check for real implementation patterns
    results.push(await this.checkRealImplementationPatterns(testFile));
    
    // Validate performance
    results.push(await this.validatePerformance(testFile));
    
    // Check test quality
    results.push(await this.validateTestQuality(testFile));
    
    // Verify cleanup
    results.push(await this.validateCleanup(testFile));
    
    return {
      file: testFile,
      passed: results.every(r => r.passed),
      results
    };
  }

  async generateMigrationReport(files: string[]): Promise<MigrationReport> {
    const validations = await Promise.all(
      files.map(file => this.validateMigration(file))
    );
    
    return {
      totalFiles: files.length,
      passedFiles: validations.filter(v => v.passed).length,
      validations,
      recommendations: this.generateRecommendations(validations)
    };
  }
}
```

## Conclusion

The migration from mock-based to real implementation testing is a significant undertaking that requires careful planning, systematic execution, and continuous validation. By following this guide and using the provided tools and techniques, teams can successfully migrate their test suites while maintaining quality, performance, and development velocity.

### Key Success Factors

1. **Gradual Approach**: Migrate incrementally to minimize risk
2. **Team Coordination**: Ensure all team members are aligned and trained
3. **Quality Gates**: Maintain quality standards throughout migration
4. **Performance Focus**: Monitor and optimize performance continuously
5. **Documentation**: Keep documentation updated and comprehensive

### Next Steps After Migration

1. **Continuous Improvement**: Regularly review and optimize test performance
2. **Knowledge Sharing**: Share learnings and best practices with other teams
3. **Tool Development**: Develop additional tools and utilities based on experience
4. **Monitoring**: Implement ongoing monitoring of test quality and performance
5. **Training**: Provide ongoing training for new team members

The investment in real implementation testing pays dividends in improved code quality, reduced production issues, and increased development confidence. The migration may be challenging, but the long-term benefits make it worthwhile.

---

*This migration guide is a living document. Please contribute improvements and lessons learned as you complete your migration journey.*