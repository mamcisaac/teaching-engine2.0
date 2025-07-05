# Real Implementation Testing Guide

This guide provides best practices and patterns for testing with real implementations instead of mocks in the Teaching Engine 2.0 project.

## Table of Contents

- [Overview](#overview)
- [Benefits of Real Implementation Testing](#benefits)
- [Migration Strategy](#migration-strategy)
- [Testing Patterns](#testing-patterns)
- [Performance Considerations](#performance-considerations)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## Overview

Real implementation testing involves using actual services, databases, and APIs in your tests instead of mocks or stubs. This approach provides higher confidence in your test results and catches integration issues early.

### Key Principles

1. **Use Real Services**: Test against actual database connections, API endpoints, and service implementations
2. **Maintain Test Isolation**: Each test should be independent and not affect others
3. **Performance Awareness**: Monitor and optimize test performance while maintaining realism
4. **Gradual Migration**: Move from mocks to real implementations progressively
5. **Comprehensive Coverage**: Test real workflows, data flows, and edge cases

## Benefits

### Advantages of Real Implementation Testing

- **Higher Confidence**: Tests reflect actual production behavior
- **Integration Coverage**: Catches issues at system boundaries
- **Real Data Validation**: Tests work with actual data structures and constraints
- **Performance Insights**: Identifies real performance bottlenecks
- **Dependency Discovery**: Reveals hidden dependencies and side effects

### When to Use Real Implementations

✅ **Use Real Implementations For:**
- Integration tests
- End-to-end workflows
- Database operations
- Service layer testing
- Performance critical paths
- Authentication flows
- Data validation

❌ **Consider Mocks For:**
- External API calls (payment, email services)
- Slow operations in unit tests
- Error simulation
- Resource-constrained environments

## Migration Strategy

### Phase 1: Assessment and Planning

1. **Audit Current Tests**
   ```bash
   # Find mock usage patterns
   grep -r "mock\|stub\|spy" src/**/*.test.ts
   ```

2. **Categorize Tests**
   - Unit tests → Keep some mocks
   - Integration tests → Migrate to real implementations
   - E2E tests → Use real implementations

3. **Identify Dependencies**
   - Database operations
   - External services
   - Authentication systems
   - File operations

### Phase 2: Infrastructure Setup

1. **Test Database Configuration**
   ```typescript
   // Use real test database with transactions
   export const testDb = new TestDatabaseManager({
     useTransactions: true,
     isolationLevel: 'READ_COMMITTED',
     cleanupStrategy: 'rollback'
   });
   ```

2. **Environment Configuration**
   ```bash
   # .env.test
   DATABASE_URL="postgresql://test:test@localhost:5433/teaching_engine_test"
   USE_REAL_SERVICES=true
   MOCK_EXTERNAL_APIS=true
   ```

### Phase 3: Gradual Migration

1. **Start with Service Layer**
   ```typescript
   // Before: Mock-based test
   const mockUserService = {
     createUser: jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com' })
   };

   // After: Real implementation test
   const userService = new UserService(testDb.getPrismaClient());
   const user = await userService.createUser({
     email: 'test@example.com',
     name: 'Test User'
   });
   ```

2. **Use Migration Utilities**
   ```typescript
   import { migrationUtils } from './test-utils/migration-utilities';
   
   const migrationTest = migrationUtils.createMigrationTest({
     phase: 'hybrid', // Test both mock and real
     enableComparison: true
   });
   ```

## Testing Patterns

### 1. Database Testing Pattern

```typescript
import { testUtils } from '../test-utils';

describe('User Service - Real Implementation', () => {
  let prisma: PrismaClient;
  let userService: UserService;
  let utils: ReturnType<typeof testUtils.createTestUtils>;

  beforeEach(async () => {
    prisma = testDb.getPrismaClient();
    userService = new UserService(prisma);
    utils = testUtils.createTestUtils(prisma, {
      enablePerformanceMonitoring: true,
      enableDataValidation: true
    });
  });

  it('should create user with real database', async () => {
    // Arrange
    const userData = utils.real.createRealisticTestData({
      users: 1
    });

    // Act
    const user = await userService.createUser(userData.users[0]);

    // Assert
    expect(user).toMatchObject({
      email: userData.users[0].email,
      name: userData.users[0].name
    });

    // Verify in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });
    expect(dbUser).toBeTruthy();
  });
});
```

### 2. API Integration Testing Pattern

```typescript
import { testUtils } from '../test-utils';
import { setupTestServer } from '../test-server';

describe('Auth API - Real Implementation', () => {
  let server: TestServer;
  let authUtils: AuthTestUtils;

  beforeAll(async () => {
    server = await setupTestServer({
      useRealDatabase: true,
      mockExternalServices: true
    });
  });

  beforeEach(async () => {
    authUtils = new AuthTestUtils(server.baseUrl);
  });

  it('should authenticate user with real JWT', async () => {
    // Arrange
    const testUser = await authUtils.createTestUser({
      email: 'test@example.com',
      password: 'ValidPassword123!'
    });

    // Act
    const authResult = await authUtils.loginUser(
      testUser.email, 
      testUser.password
    );

    // Assert
    expect(authResult.accessToken).toBeTruthy();
    expect(authResult.user.email).toBe(testUser.email);

    // Verify token is valid
    const verificationResult = await authUtils.verifyToken(authResult.accessToken);
    expect(verificationResult.valid).toBe(true);
  });
});
```

### 3. Component Testing with Real Providers

```typescript
import { renderWithProviders } from '../test-utils/test-providers';
import { UserProfile } from './UserProfile';

describe('UserProfile Component - Real Implementation', () => {
  it('should load and display user data from real API', async () => {
    // Arrange
    const { user, authContext } = await setupRealAuthenticatedUser();

    // Act
    const { getByText, waitForLoadingToFinish } = renderWithProviders(
      <UserProfile userId={user.id} />,
      {
        useRealAuth: true,
        authContext,
        testConfig: {
          useRealApi: true,
          enableCache: false
        }
      }
    );

    await waitForLoadingToFinish();

    // Assert
    expect(getByText(user.name)).toBeInTheDocument();
    expect(getByText(user.email)).toBeInTheDocument();
  });
});
```

### 4. Performance Testing Pattern

```typescript
import { performanceTestUtils } from '../test-utils/performance-test-utilities';

describe('Curriculum Import - Performance', () => {
  it('should import large curriculum dataset within acceptable time', async () => {
    const performanceManager = performanceTestUtils.createOptimizedTestEnvironment({
      maxExecutionTime: 10000, // 10 seconds
      enableQueryOptimization: true
    });

    const { result, metrics } = await performanceManager.measureTestPerformance(
      'curriculum-import-large',
      async () => {
        const curriculum = await curriculumService.importCurriculum({
          file: largeCurriculumFile,
          format: 'csv'
        });
        return curriculum;
      }
    );

    expect(result.expectations).toHaveLength(1000);
    expect(metrics.isAcceptable).toBe(true);
    expect(metrics.executionTime).toBeLessThan(10000);
  });
});
```

## Performance Considerations

### 1. Test Database Optimization

```typescript
// Use transactions for test isolation
const testDb = new TestDatabaseManager({
  useTransactions: true,
  poolSize: 5,
  commandTimeout: 30000
});

// Batch operations for better performance
await testUtils.batchDatabaseOperations(
  largeDataset,
  async (batch) => {
    return prisma.outcome.createMany({
      data: batch,
      skipDuplicates: true
    });
  },
  100 // batch size
);
```

### 2. Query Optimization

```typescript
// Use selective includes to reduce data transfer
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    lessons: {
      select: {
        id: true,
        title: true,
        // Only include necessary fields
      }
    }
  }
});
```

### 3. Connection Management

```typescript
// Proper cleanup to prevent connection leaks
afterEach(async () => {
  await testDb.cleanup();
});

afterAll(async () => {
  await testDb.disconnect();
});
```

### 4. Caching Strategies

```typescript
// Enable caching for read-heavy operations
const testQueryClient = createTestQueryClient({
  enableCache: true,
  networkDelay: 0 // Remove artificial delays in tests
});
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Slow Test Execution

**Problem**: Tests take too long to run
```
✗ User creation test (5.2s)
```

**Solutions**:
- Use database transactions instead of cleanup
- Implement connection pooling
- Batch database operations
- Use performance monitoring utilities

```typescript
// Enable performance monitoring
const utils = createTestUtils(prisma, {
  enablePerformanceMonitoring: true
});
```

#### 2. Test Data Contamination

**Problem**: Tests affect each other
```
Expected 1 user, but found 3
```

**Solutions**:
- Use transactions for isolation
- Implement proper cleanup
- Use unique test data

```typescript
beforeEach(async () => {
  await testDb.startTransaction();
});

afterEach(async () => {
  await testDb.rollbackTransaction();
});
```

#### 3. Memory Leaks

**Problem**: High memory usage in test runs
```
FATAL ERROR: Reached heap limit Allocation failed
```

**Solutions**:
- Implement proper cleanup
- Monitor memory usage
- Use performance utilities

```typescript
const memoryUsage = performanceTestUtils.monitorMemoryUsage();
console.log(`Heap used: ${memoryUsage.heapUsed}MB`);
```

#### 4. Connection Pool Exhaustion

**Problem**: Database connection errors
```
Error: Connection pool exhausted
```

**Solutions**:
- Configure connection limits
- Implement proper cleanup
- Use connection pooling

```typescript
const testDb = new TestDatabaseManager({
  poolSize: 10,
  maxConnections: 50
});
```

## Examples

### Complete Test Example

```typescript
import { 
  renderWithProviders,
  testUtils,
  migrationUtils,
  performanceTestUtils 
} from '../test-utils';

describe('ETFO Lesson Plan - Real Implementation', () => {
  let prisma: PrismaClient;
  let lessonPlanService: ETFOLessonPlanService;
  let authContext: AuthTestContext;
  let performanceManager: PerformanceTestManager;

  beforeAll(async () => {
    performanceManager = performanceTestUtils.createOptimizedTestEnvironment();
  });

  beforeEach(async () => {
    // Setup real database connection
    prisma = testDb.getPrismaClient();
    lessonPlanService = new ETFOLessonPlanService(prisma);
    
    // Setup real authentication
    authContext = await createAuthenticatedTestUser({
      email: 'teacher@school.ca',
      role: 'TEACHER'
    });
  });

  afterEach(async () => {
    await authContext.cleanup();
  });

  it('should create and render lesson plan with real data', async () => {
    // Performance monitoring
    const { result: lessonPlan, metrics } = await performanceManager.measureTestPerformance(
      'create-lesson-plan',
      async () => {
        // Create real test data
        const curriculum = await testUtils.createRealisticTestData({
          subjects: 1,
          outcomes: 5,
          withRelationships: true
        });

        // Create lesson plan with real service
        return lessonPlanService.createLessonPlan({
          title: 'Real Math Lesson',
          subject: curriculum.subjects[0].name,
          outcomes: curriculum.outcomes.map(o => o.id),
          teacherId: authContext.user.id
        });
      }
    );

    // Render component with real providers
    const { getByText, waitForLoadingToFinish } = renderWithProviders(
      <ETFOLessonPlanPage lessonPlanId={lessonPlan.id} />,
      {
        useRealAuth: true,
        authContext,
        testConfig: {
          useRealApi: true,
          enableCache: false
        }
      }
    );

    await waitForLoadingToFinish();

    // Assertions with real data
    expect(getByText('Real Math Lesson')).toBeInTheDocument();
    expect(getByText(/5 outcomes/)).toBeInTheDocument();
    
    // Performance assertions
    expect(metrics.isAcceptable).toBe(true);
    expect(metrics.executionTime).toBeLessThan(3000);

    // Database verification
    const dbLessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: lessonPlan.id },
      include: { outcomes: true }
    });
    
    expect(dbLessonPlan).toBeTruthy();
    expect(dbLessonPlan!.outcomes).toHaveLength(5);
  });

  it('should handle concurrent lesson plan creation', async () => {
    const concurrentTests = Array.from({ length: 5 }, (_, i) => ({
      name: `concurrent-lesson-${i}`,
      fn: async () => {
        return lessonPlanService.createLessonPlan({
          title: `Concurrent Lesson ${i}`,
          subject: 'Mathematics',
          teacherId: authContext.user.id
        });
      }
    }));

    const results = await performanceManager.runParallelTests(
      concurrentTests,
      3 // max concurrency
    );

    // All tests should succeed
    expect(results.filter(r => r.error)).toHaveLength(0);
    expect(results.filter(r => r.result)).toHaveLength(5);

    // Verify all lesson plans were created
    const lessonPlans = await prisma.lessonPlan.findMany({
      where: {
        title: { startsWith: 'Concurrent Lesson' }
      }
    });
    
    expect(lessonPlans).toHaveLength(5);
  });
});
```

### Migration Example

```typescript
describe('User Service Migration', () => {
  const migrationTest = migrationUtils.createMigrationTest({
    phase: 'hybrid',
    enableComparison: true,
    logDifferences: true
  });

  it('should create user - migration test', async () => {
    const userData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'TestPassword123!'
    };

    // Test with migration utilities
    const result = await migrationTest.testApi(
      // Real implementation
      () => realUserService.createUser(userData),
      'create-user',
      // Mock implementation (for comparison)
      () => Promise.resolve({
        id: 1,
        email: userData.email,
        name: userData.name,
        createdAt: new Date()
      })
    );

    expect(result.email).toBe(userData.email);
    expect(result.id).toBeTruthy();

    // Generate migration report
    const report = migrationTest.report();
    console.log('Migration test results:', report);
  });
});
```

## Best Practices Summary

1. **Start Small**: Begin migration with service layer tests
2. **Use Transactions**: Ensure test isolation with database transactions
3. **Monitor Performance**: Use performance utilities to track test speed
4. **Gradual Migration**: Use hybrid testing during transition
5. **Real Data**: Create realistic test data that matches production patterns
6. **Proper Cleanup**: Implement comprehensive cleanup to prevent test pollution
7. **Documentation**: Document any deviations from production configuration
8. **CI/CD Integration**: Ensure real implementation tests work in CI environment

## Resources

- [Migration Utilities](../client/src/test-utils/migration-utilities.ts)
- [Performance Test Utilities](../server/tests/performance-test-utilities.ts)
- [Real Test Providers](../client/src/test-utils/test-providers.tsx)
- [Enhanced Test Utils](../server/tests/test-utils.ts)