# Real Implementation Testing Standards

**Last Updated**: January 2025  
**Version**: 1.0  
**Purpose**: Establish comprehensive standards and enforcement for real implementation testing approach

## Table of Contents

- [Overview](#overview)
- [Core Standards](#core-standards)
- [Implementation Requirements](#implementation-requirements)
- [Code Quality Standards](#code-quality-standards)
- [Performance Standards](#performance-standards)
- [CI/CD Integration](#cicd-integration)
- [Enforcement Mechanisms](#enforcement-mechanisms)
- [Migration Guidelines](#migration-guidelines)
- [Monitoring and Reporting](#monitoring-and-reporting)

## Overview

Real implementation testing is the primary testing approach for Teaching Engine 2.0. This document establishes comprehensive standards, requirements, and enforcement mechanisms to ensure all development teams follow this approach consistently.

### Key Principles

1. **Real Over Mock**: Use real implementations whenever possible
2. **Performance Aware**: Maintain acceptable test performance without sacrificing realism
3. **Quality Gates**: Enforce minimum quality standards through automation
4. **Continuous Monitoring**: Track test quality and performance metrics
5. **Developer Education**: Provide clear guidance and tooling support

### Scope

This document applies to:
- All new test development
- Test migration from mock-based approaches
- CI/CD pipeline configuration
- Code review processes
- Quality assessment and reporting

## Core Standards

### 1. Real Implementation Requirements

#### MANDATORY: Use Real Implementations For

```typescript
// ✅ REQUIRED: Database operations
describe('User Service', () => {
  let prisma: PrismaClient;
  let userService: UserService;

  beforeEach(async () => {
    prisma = testDb.getPrismaClient(); // Real database connection
    userService = new UserService(prisma); // Real service instance
  });

  it('should create user with real database', async () => {
    const userData = createRealisticUserData();
    const user = await userService.createUser(userData); // Real implementation
    
    // Verify in real database
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    expect(dbUser).toBeTruthy();
  });
});
```

#### Required Real Implementation Areas

- **Service Layer Testing**: All business logic services
- **Database Operations**: CRUD operations, transactions, constraints
- **Authentication/Authorization**: JWT validation, permission checks
- **API Integration**: Internal API endpoint testing
- **File Operations**: Upload, processing, storage
- **Template Rendering**: PDF generation, email templates
- **Data Validation**: Schema validation, business rule validation

#### Acceptable Mock Usage

```typescript
// ✅ ACCEPTABLE: External service dependencies
jest.mock('@/services/emailProvider', () => ({
  sendEmail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
}));

// ✅ ACCEPTABLE: Slow external APIs in unit tests
jest.mock('@/services/openaiClient', () => ({
  generateText: jest.fn().mockResolvedValue('Generated content')
}));

// ✅ ACCEPTABLE: Error simulation for edge cases
const throwError = () => { throw new Error('Simulated failure'); };
```

### 2. Test Structure Standards

#### Required Test Organization

```typescript
import { testUtils, performanceTestUtils } from '@/test-utils';
import { TestDatabaseManager } from '@/test-utils/database';

describe('Service Name - Real Implementation', () => {
  // REQUIRED: Performance monitoring
  let performanceManager: PerformanceTestManager;
  let testDb: TestDatabaseManager;
  let service: ServiceClass;

  beforeAll(async () => {
    // REQUIRED: Initialize performance monitoring
    performanceManager = performanceTestUtils.createOptimizedTestEnvironment({
      maxExecutionTime: 5000,
      enableQueryOptimization: true
    });
  });

  beforeEach(async () => {
    // REQUIRED: Real database setup
    testDb = new TestDatabaseManager({
      useTransactions: true,
      isolationLevel: 'READ_COMMITTED'
    });
    
    const prisma = testDb.getPrismaClient();
    service = new ServiceClass(prisma);
  });

  afterEach(async () => {
    // REQUIRED: Proper cleanup
    await testDb.cleanup();
  });

  afterAll(async () => {
    // REQUIRED: Resource cleanup
    await testDb.disconnect();
    await performanceManager.cleanup();
  });

  it('should perform operation with real implementation', async () => {
    // REQUIRED: Performance measurement
    const { result, metrics } = await performanceManager.measureTestPerformance(
      'operation-name',
      async () => {
        // REQUIRED: Use realistic test data
        const testData = testUtils.createRealisticTestData({
          users: 1,
          withRelationships: true
        });

        // Test real implementation
        return service.performOperation(testData);
      }
    );

    // REQUIRED: Comprehensive assertions
    expect(result).toMatchObject(expectedResult);
    expect(metrics.isAcceptable).toBe(true);
    expect(metrics.executionTime).toBeLessThan(3000);

    // REQUIRED: Database verification
    const dbRecord = await testDb.verifyInDatabase('tableName', result.id);
    expect(dbRecord).toBeTruthy();
  });
});
```

#### Test Naming Conventions

```typescript
// ✅ REQUIRED FORMAT
describe('ServiceName - Real Implementation', () => {
  it('should perform operation when condition is met', async () => {});
  it('should handle error when invalid input provided', async () => {});
  it('should process concurrent requests efficiently', async () => {});
});

// ❌ FORBIDDEN FORMATS
describe('ServiceName', () => {}); // Missing "Real Implementation"
it('test operation', () => {}); // Non-descriptive
it('should work', () => {}); // Vague description
```

### 3. Data Standards

#### Realistic Test Data Requirements

```typescript
// ✅ REQUIRED: Use realistic data generators
const testData = testUtils.createRealisticTestData({
  users: 10,
  lessons: 5,
  curriculum: 'ontario-grade-3',
  withRelationships: true,
  respectConstraints: true
});

// ✅ REQUIRED: Production-like data volumes
const performanceData = testUtils.createLargeDataset({
  users: 1000,
  lessonPlans: 500,
  outcomes: 2000
});

// ❌ FORBIDDEN: Minimal test data
const user = { id: 1, name: 'test' }; // Too simple
const lesson = {}; // Empty objects
```

#### Data Validation Standards

```typescript
// REQUIRED: Validate data integrity
it('should maintain data integrity across operations', async () => {
  const testData = createRealisticTestData();
  
  // Perform operations
  const result = await service.complexOperation(testData);
  
  // REQUIRED: Comprehensive data validation
  const validationResult = await testUtils.validateDataIntegrity({
    tables: ['users', 'lessons', 'outcomes'],
    relationships: ['user_lessons', 'lesson_outcomes'],
    constraints: 'all'
  });
  
  expect(validationResult.isValid).toBe(true);
  expect(validationResult.violations).toHaveLength(0);
});
```

## Implementation Requirements

### 1. Database Testing Standards

#### Connection Management

```typescript
// REQUIRED: Transaction-based isolation
export class TestDatabaseManager {
  private prisma: PrismaClient;
  private currentTransaction?: PrismaTransaction;

  async startTransaction(): Promise<void> {
    this.currentTransaction = await this.prisma.$begin();
  }

  async rollbackTransaction(): Promise<void> {
    if (this.currentTransaction) {
      await this.currentTransaction.$rollback();
      this.currentTransaction = undefined;
    }
  }

  // REQUIRED: Connection pooling
  getPrismaClient(): PrismaClient {
    return this.currentTransaction || this.prisma;
  }
}
```

#### Query Optimization

```typescript
// REQUIRED: Monitor query performance
const queryMonitor = performanceTestUtils.createQueryMonitor({
  slowQueryThreshold: 100, // ms
  logSlowQueries: true,
  enableQueryPlan: true
});

// REQUIRED: Optimize data fetching
const optimizedQuery = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
    // Only select required fields
  },
  where: {
    active: true
  },
  orderBy: { createdAt: 'desc' },
  take: 10 // Limit results
});
```

### 2. Service Layer Testing

#### Dependency Injection

```typescript
// REQUIRED: Constructor injection for testability
export class LessonPlanService {
  constructor(
    private prisma: PrismaClient,
    private aiService: AIService,
    private authService: AuthService
  ) {}
}

// REQUIRED: Test with real dependencies
const lessonPlanService = new LessonPlanService(
  testDb.getPrismaClient(), // Real database
  new AIService(realOpenAIClient), // Real AI service
  new AuthService(testDb.getPrismaClient()) // Real auth service
);
```

#### Error Handling Testing

```typescript
// REQUIRED: Test real error conditions
it('should handle database constraint violation', async () => {
  // Create conflicting data
  await testDb.createUser({ email: 'test@example.com' });
  
  // Test real constraint violation
  await expect(
    userService.createUser({ email: 'test@example.com' })
  ).rejects.toThrow(/unique constraint/i);
  
  // Verify database state
  const users = await testDb.countUsers({ email: 'test@example.com' });
  expect(users).toBe(1); // Only one user should exist
});
```

### 3. API Testing Standards

#### Real HTTP Testing

```typescript
// REQUIRED: Use real HTTP server
import { setupTestServer } from '@/test-utils/test-server';

describe('Auth API - Real Implementation', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await setupTestServer({
      useRealDatabase: true,
      useRealAuth: true,
      mockExternalServices: true
    });
  });

  it('should authenticate user with real JWT flow', async () => {
    // Create real user
    const user = await server.createTestUser({
      email: 'teacher@school.ca',
      password: 'ValidPassword123!'
    });

    // Test real authentication
    const response = await server.request
      .post('/api/auth/login')
      .send({
        email: user.email,
        password: 'ValidPassword123!'
      });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeTruthy();

    // Verify real JWT
    const decodedToken = jwt.verify(response.body.accessToken, process.env.JWT_SECRET!);
    expect(decodedToken.userId).toBe(user.id);
  });
});
```

## Code Quality Standards

### 1. Linting Rules

#### ESLint Configuration

```json
{
  "rules": {
    // REQUIRED: Prevent inappropriate mocking
    "no-mock-in-integration": "error",
    "require-real-implementation": "error",
    "no-shallow-mocks": "error",
    
    // REQUIRED: Test quality rules
    "test-naming-convention": "error",
    "require-performance-monitoring": "warn",
    "require-database-cleanup": "error",
    "no-hardcoded-test-data": "warn"
  },
  "overrides": [
    {
      "files": ["**/*.test.ts", "**/*.spec.ts"],
      "rules": {
        "require-real-implementation": "error"
      }
    }
  ]
}
```

#### Custom ESLint Rules

```typescript
// Custom rule: no-mock-in-integration
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent mocking in integration tests'
    }
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.name === 'jest' &&
          node.callee.property &&
          node.callee.property.name === 'mock' &&
          context.getFilename().includes('.integration.test.')
        ) {
          context.report({
            node,
            message: 'Mocking is not allowed in integration tests. Use real implementations.'
          });
        }
      }
    };
  }
};
```

### 2. Pre-commit Hooks

#### Test Quality Validation

```typescript
// .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# REQUIRED: Validate test quality
npm run test:validate-quality

# REQUIRED: Check for forbidden patterns
npm run test:lint-rules

# REQUIRED: Performance validation
npm run test:performance-check
```

#### Quality Check Script

```typescript
// scripts/validate-test-quality.ts
import { glob } from 'glob';
import { readFileSync } from 'fs';

interface TestQualityResult {
  file: string;
  issues: string[];
  score: number;
}

async function validateTestQuality(): Promise<TestQualityResult[]> {
  const testFiles = await glob('**/*.test.ts');
  const results: TestQualityResult[] = [];

  for (const file of testFiles) {
    const content = readFileSync(file, 'utf-8');
    const issues: string[] = [];
    let score = 100;

    // REQUIRED: Check for real implementation usage
    if (!content.includes('Real Implementation')) {
      issues.push('Missing "Real Implementation" in describe block');
      score -= 25;
    }

    // REQUIRED: Check for performance monitoring
    if (!content.includes('performanceManager')) {
      issues.push('Missing performance monitoring');
      score -= 20;
    }

    // REQUIRED: Check for proper cleanup
    if (!content.includes('afterEach') || !content.includes('cleanup')) {
      issues.push('Missing proper cleanup in afterEach');
      score -= 20;
    }

    // REQUIRED: Check for realistic test data
    if (content.includes('{ id: 1') || content.includes('mockReturnValue')) {
      issues.push('Using simple mock data instead of realistic test data');
      score -= 15;
    }

    results.push({ file, issues, score });
  }

  return results;
}

// Fail if any test has score below threshold
const results = await validateTestQuality();
const failingTests = results.filter(r => r.score < 80);

if (failingTests.length > 0) {
  console.error('Test quality validation failed:');
  failingTests.forEach(test => {
    console.error(`${test.file}: Score ${test.score}/100`);
    test.issues.forEach(issue => console.error(`  - ${issue}`));
  });
  process.exit(1);
}
```

### 3. Code Review Standards

#### Required Review Checklist

```markdown
## Real Implementation Testing Review Checklist

### ✅ REQUIRED CHECKS

- [ ] Test uses real database connections (no database mocks)
- [ ] Test uses real service instances (no service mocks)
- [ ] Performance monitoring is implemented
- [ ] Proper cleanup in afterEach/afterAll
- [ ] Realistic test data (no simple mocks)
- [ ] Database verification for state changes
- [ ] Error scenarios test real error conditions
- [ ] Test name includes "Real Implementation"
- [ ] Transaction-based test isolation
- [ ] Query optimization considered

### ❌ BLOCKING ISSUES

- [ ] Uses jest.mock() for internal services
- [ ] No performance monitoring
- [ ] Missing cleanup procedures
- [ ] Hardcoded simple test data
- [ ] No database verification
- [ ] Vague or missing test descriptions

### 📊 QUALITY METRICS

- [ ] Test execution time < 5 seconds
- [ ] Memory usage within acceptable limits
- [ ] Database operations optimized
- [ ] Coverage of edge cases
- [ ] Comprehensive assertions

### 📝 DOCUMENTATION

- [ ] Complex test scenarios documented
- [ ] Performance considerations noted
- [ ] Dependencies clearly identified
- [ ] Migration notes (if applicable)
```

## Performance Standards

### 1. Execution Time Limits

#### Maximum Execution Times

```typescript
// REQUIRED: Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  UNIT_TEST: 1000,        // 1 second
  INTEGRATION_TEST: 5000,  // 5 seconds
  E2E_TEST: 30000,        // 30 seconds
  PERFORMANCE_TEST: 60000  // 60 seconds
};

// REQUIRED: Automatic performance validation
it('should complete within performance threshold', async () => {
  const startTime = Date.now();
  
  await serviceUnderTest.performOperation();
  
  const executionTime = Date.now() - startTime;
  expect(executionTime).toBeLessThan(PERFORMANCE_THRESHOLDS.INTEGRATION_TEST);
});
```

#### Performance Monitoring

```typescript
// REQUIRED: Built-in performance monitoring
const performanceManager = performanceTestUtils.createOptimizedTestEnvironment({
  maxExecutionTime: 5000,
  enableQueryOptimization: true,
  enableMemoryMonitoring: true,
  generatePerformanceReport: true
});

const { result, metrics } = await performanceManager.measureTestPerformance(
  'test-operation',
  async () => {
    return await service.performOperation(testData);
  }
);

// REQUIRED: Performance assertions
expect(metrics.isAcceptable).toBe(true);
expect(metrics.executionTime).toBeLessThan(3000);
expect(metrics.memoryUsage.heapUsed).toBeLessThan(50 * 1024 * 1024); // 50MB
expect(metrics.queryCount).toBeLessThan(10);
```

### 2. Resource Management

#### Database Connection Limits

```typescript
// REQUIRED: Connection pool configuration
const testDb = new TestDatabaseManager({
  poolSize: 5,
  maxConnections: 20,
  connectionTimeout: 10000,
  queryTimeout: 5000,
  enableConnectionMonitoring: true
});

// REQUIRED: Connection usage monitoring
beforeEach(async () => {
  const connectionInfo = await testDb.getConnectionInfo();
  expect(connectionInfo.activeConnections).toBeLessThan(15);
});
```

#### Memory Management

```typescript
// REQUIRED: Memory usage monitoring
afterEach(async () => {
  const memoryUsage = process.memoryUsage();
  const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
  
  // Fail if memory usage exceeds threshold
  if (heapUsedMB > 100) {
    throw new Error(`Memory usage too high: ${heapUsedMB}MB`);
  }
  
  // Force garbage collection in test environment
  if (global.gc) {
    global.gc();
  }
});
```

### 3. Query Optimization

#### Query Performance Standards

```typescript
// REQUIRED: Query performance monitoring
const queryMonitor = performanceTestUtils.createQueryMonitor({
  slowQueryThreshold: 100,
  logSlowQueries: true,
  failOnSlowQueries: true
});

// REQUIRED: Optimized queries
const optimizedResult = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    profile: {
      select: {
        firstName: true,
        lastName: true
      }
    }
  },
  where: {
    active: true,
    lastLoginAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
    }
  },
  orderBy: { lastLoginAt: 'desc' },
  take: 50
});

// REQUIRED: Query count validation
const queryStats = queryMonitor.getStats();
expect(queryStats.totalQueries).toBeLessThan(5);
expect(queryStats.slowQueries).toHaveLength(0);
```

## CI/CD Integration

### 1. GitHub Actions Configuration

#### Real Implementation Test Pipeline

```yaml
# .github/workflows/real-implementation-tests.yml
name: Real Implementation Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  real-implementation-tests:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_USER: test_user
          POSTGRES_DB: teaching_engine_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    env:
      DATABASE_URL: postgresql://test_user:test_password@localhost:5432/teaching_engine_test
      JWT_SECRET: test-jwt-secret-key
      NODE_ENV: test
      USE_REAL_IMPLEMENTATIONS: true

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Generate Prisma client
        run: pnpm --filter @teaching-engine/database db:generate

      - name: Run database migrations
        run: pnpm --filter @teaching-engine/database db:push

      - name: Validate test quality
        run: pnpm test:validate-quality

      - name: Run real implementation tests
        run: pnpm test:real-implementation
        timeout-minutes: 10

      - name: Performance validation
        run: pnpm test:performance-validation

      - name: Generate coverage report
        run: pnpm test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: real-implementation
```

### 2. Quality Gates

#### Coverage Requirements

```typescript
// jest.config.coverage.js
module.exports = {
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    },
    // Higher requirements for real implementation tests
    './src/services/': {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95
    }
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.mock.ts',
    '!src/**/__tests__/**',
    '!src/test-utils/**'
  ]
};
```

#### Performance Gates

```typescript
// scripts/performance-validation.ts
interface PerformanceThresholds {
  maxTestDuration: number;
  maxMemoryUsage: number;
  maxDatabaseConnections: number;
  maxSlowQueries: number;
}

const PERFORMANCE_GATES: PerformanceThresholds = {
  maxTestDuration: 300000, // 5 minutes total
  maxMemoryUsage: 200,     // 200MB
  maxDatabaseConnections: 10,
  maxSlowQueries: 0
};

async function validatePerformance(): Promise<void> {
  const performanceReport = await loadPerformanceReport();
  
  // Validate execution time
  if (performanceReport.totalDuration > PERFORMANCE_GATES.maxTestDuration) {
    throw new Error(`Test suite too slow: ${performanceReport.totalDuration}ms`);
  }
  
  // Validate memory usage
  if (performanceReport.peakMemoryUsage > PERFORMANCE_GATES.maxMemoryUsage) {
    throw new Error(`Memory usage too high: ${performanceReport.peakMemoryUsage}MB`);
  }
  
  // Validate database performance
  if (performanceReport.slowQueries.length > PERFORMANCE_GATES.maxSlowQueries) {
    throw new Error(`Slow queries detected: ${performanceReport.slowQueries.length}`);
  }
  
  console.log('✅ All performance gates passed');
}
```

### 3. Test Environment Configuration

#### Test Database Setup

```typescript
// scripts/setup-ci-database.ts
import { execSync } from 'child_process';

async function setupCIDatabase(): Promise<void> {
  // Create test database
  execSync('createdb teaching_engine_test', { stdio: 'inherit' });
  
  // Apply schema
  execSync('pnpm --filter @teaching-engine/database db:push', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: 'postgresql://test_user:test_password@localhost:5432/teaching_engine_test'
    }
  });
  
  // Seed with minimal test data
  execSync('pnpm --filter @teaching-engine/database db:seed:ci', { stdio: 'inherit' });
  
  console.log('✅ CI database setup complete');
}
```

#### Environment Validation

```typescript
// scripts/validate-ci-environment.ts
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NODE_ENV'
];

const REQUIRED_SERVICES = [
  { name: 'PostgreSQL', port: 5432 },
  { name: 'Redis', port: 6379, optional: true }
];

async function validateCIEnvironment(): Promise<void> {
  // Check environment variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Check service availability
  for (const service of REQUIRED_SERVICES) {
    try {
      await checkServiceHealth(service.name, service.port);
      console.log(`✅ ${service.name} is available`);
    } catch (error) {
      if (service.optional) {
        console.warn(`⚠️  Optional service ${service.name} is not available`);
      } else {
        throw new Error(`Required service ${service.name} is not available`);
      }
    }
  }
  
  console.log('✅ CI environment validation complete');
}
```

## Enforcement Mechanisms

### 1. Automated Code Analysis

#### Static Analysis Rules

```typescript
// scripts/analyze-test-code.ts
import { glob } from 'glob';
import { readFileSync } from 'fs';
import { parse } from '@typescript-eslint/parser';

interface CodeAnalysisResult {
  file: string;
  violations: Violation[];
  score: number;
}

interface Violation {
  type: string;
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

async function analyzeTestCode(): Promise<CodeAnalysisResult[]> {
  const testFiles = await glob('**/*.test.ts');
  const results: CodeAnalysisResult[] = [];

  for (const file of testFiles) {
    const content = readFileSync(file, 'utf-8');
    const ast = parse(content, { 
      sourceType: 'module',
      ecmaVersion: 2020 
    });
    
    const violations: Violation[] = [];
    let score = 100;

    // Check for forbidden patterns
    const forbiddenPatterns = [
      {
        pattern: /jest\.mock\([^)]*services/,
        message: 'Mocking internal services is not allowed',
        severity: 'error' as const,
        penalty: 30
      },
      {
        pattern: /mockReturnValue|mockResolvedValue/,
        message: 'Simple mocks detected, use real implementations',
        severity: 'warning' as const,
        penalty: 10
      },
      {
        pattern: /{ id: \d+, /,
        message: 'Hardcoded test data detected',
        severity: 'warning' as const,
        penalty: 5
      }
    ];

    for (const { pattern, message, severity, penalty } of forbiddenPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        violations.push({
          type: 'forbidden-pattern',
          line: getLineNumber(content, matches.index!),
          message,
          severity
        });
        if (severity === 'error') score -= penalty;
      }
    }

    results.push({ file, violations, score });
  }

  return results;
}
```

### 2. Git Hooks

#### Pre-commit Validation

```bash
#!/bin/sh
# .husky/pre-commit

echo "🔍 Validating real implementation test standards..."

# Run test quality validation
npm run test:validate-quality
if [ $? -ne 0 ]; then
  echo "❌ Test quality validation failed"
  exit 1
fi

# Check for forbidden patterns
npm run test:lint-enforcement
if [ $? -ne 0 ]; then
  echo "❌ Test linting enforcement failed"
  exit 1
fi

# Run performance check on modified test files
git diff --cached --name-only | grep -E "\.(test|spec)\.ts$" | xargs npm run test:performance-check
if [ $? -ne 0 ]; then
  echo "❌ Performance check failed for modified tests"
  exit 1
fi

echo "✅ All pre-commit validations passed"
```

#### Pre-push Validation

```bash
#!/bin/sh
# .husky/pre-push

echo "🚀 Running comprehensive test validation before push..."

# Run all real implementation tests
npm run test:real-implementation
if [ $? -ne 0 ]; then
  echo "❌ Real implementation tests failed"
  exit 1
fi

# Generate and validate coverage
npm run test:coverage
if [ $? -ne 0 ]; then
  echo "❌ Coverage requirements not met"
  exit 1
fi

# Performance regression check
npm run test:performance-regression
if [ $? -ne 0 ]; then
  echo "❌ Performance regression detected"
  exit 1
fi

echo "✅ All pre-push validations passed"
```

### 3. Pull Request Validation

#### GitHub Actions PR Check

```yaml
name: Real Implementation PR Validation

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  validate-real-implementation:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      
      - name: Get changed test files
        id: changed-tests
        run: |
          echo "files=$(git diff --name-only origin/main...HEAD | grep -E '\.(test|spec)\.ts$' | tr '\n' ' ')" >> $GITHUB_OUTPUT
      
      - name: Validate changed tests
        if: steps.changed-tests.outputs.files != ''
        run: |
          echo "Validating changed test files: ${{ steps.changed-tests.outputs.files }}"
          npm run test:validate-quality -- ${{ steps.changed-tests.outputs.files }}
      
      - name: Performance impact analysis
        if: steps.changed-tests.outputs.files != ''
        run: |
          npm run test:performance-impact -- ${{ steps.changed-tests.outputs.files }}
      
      - name: Comment PR with analysis
        uses: actions/github-script@v6
        with:
          script: |
            const analysis = require('./test-analysis-results.json');
            
            const comment = `
            ## Real Implementation Test Analysis
            
            ### Changed Test Files
            ${analysis.changedFiles.join(', ')}
            
            ### Quality Score
            **Average Score: ${analysis.averageQualityScore}/100**
            
            ### Performance Impact
            - Execution time change: ${analysis.performanceImpact.executionTime}
            - Memory usage change: ${analysis.performanceImpact.memoryUsage}
            
            ### Recommendations
            ${analysis.recommendations.map(r => `- ${r}`).join('\n')}
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

## Migration Guidelines

### 1. Assessment Phase

#### Migration Assessment Tool

```typescript
// scripts/assess-test-migration.ts
interface MigrationAssessment {
  totalTests: number;
  mockBasedTests: number;
  realImplementationTests: number;
  migrationCandidates: TestFile[];
  estimatedEffort: string;
}

interface TestFile {
  path: string;
  type: 'unit' | 'integration' | 'e2e';
  mockUsage: MockUsage[];
  migrationComplexity: 'low' | 'medium' | 'high';
  estimatedHours: number;
}

async function assessMigration(): Promise<MigrationAssessment> {
  const testFiles = await glob('**/*.{test,spec}.ts');
  const mockBasedTests: TestFile[] = [];
  const realImplementationTests: TestFile[] = [];

  for (const filePath of testFiles) {
    const content = readFileSync(filePath, 'utf-8');
    const testFile = analyzeTestFile(filePath, content);
    
    if (testFile.mockUsage.length > 0) {
      mockBasedTests.push(testFile);
    } else {
      realImplementationTests.push(testFile);
    }
  }

  return {
    totalTests: testFiles.length,
    mockBasedTests: mockBasedTests.length,
    realImplementationTests: realImplementationTests.length,
    migrationCandidates: mockBasedTests.filter(t => t.migrationComplexity !== 'high'),
    estimatedEffort: calculateMigrationEffort(mockBasedTests)
  };
}

function analyzeTestFile(filePath: string, content: string): TestFile {
  const mockUsage: MockUsage[] = [];
  
  // Detect jest.mock usage
  const mockMatches = content.match(/jest\.mock\([^)]+\)/g) || [];
  mockUsage.push(...mockMatches.map(m => ({ type: 'jest.mock', pattern: m })));
  
  // Detect mockReturnValue usage
  const returnValueMatches = content.match(/\.mock(Return|Resolved)Value/g) || [];
  mockUsage.push(...returnValueMatches.map(m => ({ type: 'return-value', pattern: m })));
  
  // Determine test type
  const type = filePath.includes('.integration.') ? 'integration' :
               filePath.includes('.e2e.') ? 'e2e' : 'unit';
  
  // Calculate migration complexity
  const complexity = calculateMigrationComplexity(mockUsage, type);
  
  return {
    path: filePath,
    type,
    mockUsage,
    migrationComplexity: complexity,
    estimatedHours: estimateMigrationHours(complexity, mockUsage.length)
  };
}
```

### 2. Migration Execution

#### Hybrid Testing Approach

```typescript
// test-utils/migration-test-utilities.ts
export class MigrationTestUtils {
  static createHybridTest(options: HybridTestOptions) {
    return {
      async testBoth<T>(
        realImplementation: () => Promise<T>,
        mockImplementation: () => Promise<T>,
        testName: string
      ): Promise<T> {
        if (options.phase === 'comparison') {
          // Run both and compare
          const [realResult, mockResult] = await Promise.all([
            realImplementation(),
            mockImplementation()
          ]);
          
          this.compareResults(realResult, mockResult, testName);
          return realResult;
        } else if (options.phase === 'real-only') {
          return realImplementation();
        } else {
          return mockImplementation();
        }
      },

      compareResults<T>(real: T, mock: T, testName: string): void {
        const differences = deepCompare(real, mock);
        if (differences.length > 0) {
          console.warn(`Differences found in ${testName}:`, differences);
          if (options.logDifferences) {
            this.logDifferencesToFile(testName, differences);
          }
        }
      }
    };
  }
}

// Usage example
describe('User Service Migration', () => {
  const hybridTest = MigrationTestUtils.createHybridTest({
    phase: 'comparison',
    logDifferences: true
  });

  it('should create user - hybrid test', async () => {
    const userData = { email: 'test@example.com', name: 'Test User' };

    const result = await hybridTest.testBoth(
      // Real implementation
      () => realUserService.createUser(userData),
      // Mock implementation
      () => Promise.resolve({ id: 1, ...userData, createdAt: new Date() }),
      'create-user'
    );

    expect(result.email).toBe(userData.email);
    expect(result.id).toBeTruthy();
  });
});
```

### 3. Migration Validation

#### Migration Success Criteria

```typescript
// scripts/validate-migration.ts
interface MigrationValidation {
  testFile: string;
  status: 'success' | 'failed' | 'partial';
  issues: string[];
  performanceComparison: PerformanceComparison;
  qualityScore: number;
}

async function validateMigration(testFile: string): Promise<MigrationValidation> {
  const content = readFileSync(testFile, 'utf-8');
  const issues: string[] = [];
  let qualityScore = 100;

  // Check for remaining mocks
  if (content.includes('jest.mock') && !content.includes('// APPROVED MOCK')) {
    issues.push('Unapproved mocks still present');
    qualityScore -= 30;
  }

  // Check for real implementation patterns
  if (!content.includes('Real Implementation')) {
    issues.push('Missing "Real Implementation" in test description');
    qualityScore -= 20;
  }

  // Check for performance monitoring
  if (!content.includes('performanceManager')) {
    issues.push('Missing performance monitoring');
    qualityScore -= 15;
  }

  // Run performance comparison
  const performanceComparison = await runPerformanceComparison(testFile);

  return {
    testFile,
    status: issues.length === 0 ? 'success' : 'partial',
    issues,
    performanceComparison,
    qualityScore
  };
}
```

## Monitoring and Reporting

### 1. Test Metrics Dashboard

#### Metrics Collection

```typescript
// test-utils/metrics-collector.ts
export class TestMetricsCollector {
  private metrics: TestMetrics[] = [];

  collectMetrics(testResult: TestResult): void {
    const metrics: TestMetrics = {
      testName: testResult.name,
      executionTime: testResult.duration,
      memoryUsage: testResult.memoryStats,
      databaseQueries: testResult.queryStats,
      timestamp: new Date(),
      type: this.getTestType(testResult.name),
      status: testResult.status
    };

    this.metrics.push(metrics);
  }

  generateReport(): TestMetricsReport {
    return {
      totalTests: this.metrics.length,
      averageExecutionTime: this.calculateAverage('executionTime'),
      averageMemoryUsage: this.calculateAverage('memoryUsage.heapUsed'),
      slowTests: this.metrics.filter(m => m.executionTime > 5000),
      memoryIntensiveTests: this.metrics.filter(m => m.memoryUsage.heapUsed > 100 * 1024 * 1024),
      performanceTrends: this.calculateTrends(),
      qualityScore: this.calculateQualityScore()
    };
  }

  async exportToFile(filename: string): Promise<void> {
    const report = this.generateReport();
    await writeFileSync(filename, JSON.stringify(report, null, 2));
  }
}
```

#### Dashboard Configuration

```typescript
// scripts/generate-test-dashboard.ts
interface DashboardData {
  overview: OverviewMetrics;
  performance: PerformanceMetrics;
  quality: QualityMetrics;
  trends: TrendData[];
}

async function generateTestDashboard(): Promise<void> {
  const metricsCollector = new TestMetricsCollector();
  const dashboardData: DashboardData = {
    overview: {
      totalTests: await countTests(),
      realImplementationTests: await countRealImplementationTests(),
      mockBasedTests: await countMockBasedTests(),
      migrationProgress: await calculateMigrationProgress()
    },
    performance: {
      averageExecutionTime: await calculateAverageExecutionTime(),
      slowestTests: await getSlowTests(10),
      memoryUsage: await getMemoryUsageStats(),
      queryPerformance: await getQueryPerformanceStats()
    },
    quality: {
      coverageMetrics: await getCoverageMetrics(),
      qualityScores: await getQualityScores(),
      violationCounts: await getViolationCounts()
    },
    trends: await getPerformanceTrends(30) // Last 30 days
  };

  // Generate HTML dashboard
  const dashboardHtml = generateDashboardHtml(dashboardData);
  await writeFileSync('./reports/test-dashboard.html', dashboardHtml);

  // Generate JSON for API consumption
  await writeFileSync('./reports/test-metrics.json', JSON.stringify(dashboardData, null, 2));

  console.log('✅ Test dashboard generated: ./reports/test-dashboard.html');
}
```

### 2. Performance Monitoring

#### Continuous Performance Tracking

```typescript
// test-utils/performance-monitor.ts
export class ContinuousPerformanceMonitor {
  private baselineMetrics: PerformanceBaseline;

  constructor(baselineFile: string) {
    this.baselineMetrics = this.loadBaseline(baselineFile);
  }

  async trackTestPerformance(testName: string, execution: () => Promise<any>): Promise<PerformanceResult> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();
    
    const result = await execution();
    
    const endTime = Date.now();
    const endMemory = process.memoryUsage();
    
    const performanceResult: PerformanceResult = {
      testName,
      executionTime: endTime - startTime,
      memoryDelta: endMemory.heapUsed - startMemory.heapUsed,
      timestamp: new Date(),
      baseline: this.baselineMetrics.tests[testName],
      isRegression: false
    };

    // Check for performance regression
    if (this.baselineMetrics.tests[testName]) {
      const baseline = this.baselineMetrics.tests[testName];
      const executionTimeIncrease = performanceResult.executionTime / baseline.executionTime;
      const memoryIncrease = performanceResult.memoryDelta / baseline.memoryDelta;

      performanceResult.isRegression = 
        executionTimeIncrease > 1.2 || // 20% slower
        memoryIncrease > 1.3; // 30% more memory
    }

    this.savePerformanceData(performanceResult);
    return performanceResult;
  }

  async generatePerformanceReport(): Promise<PerformanceReport> {
    const recentMetrics = await this.getRecentMetrics(7); // Last 7 days
    
    return {
      totalTests: recentMetrics.length,
      averageExecutionTime: this.calculateAverage(recentMetrics, 'executionTime'),
      performanceRegressions: recentMetrics.filter(m => m.isRegression),
      improvementOpportunities: this.identifyImprovementOpportunities(recentMetrics),
      recommendations: this.generateRecommendations(recentMetrics)
    };
  }
}
```

### 3. Quality Reporting

#### Automated Quality Reports

```typescript
// scripts/generate-quality-report.ts
async function generateQualityReport(): Promise<void> {
  const report: QualityReport = {
    overview: {
      timestamp: new Date(),
      totalTests: 0,
      qualityScore: 0,
      coverageMetrics: null,
      performanceMetrics: null
    },
    testQuality: await analyzeTestQuality(),
    performanceAnalysis: await analyzePerformance(),
    migrationStatus: await analyzeMigrationStatus(),
    recommendations: []
  };

  // Generate recommendations based on analysis
  report.recommendations = generateRecommendations(report);

  // Export to multiple formats
  await exportQualityReport(report, {
    json: './reports/quality-report.json',
    html: './reports/quality-report.html',
    markdown: './reports/quality-report.md'
  });

  // Send alerts if quality thresholds are not met
  if (report.overview.qualityScore < 80) {
    await sendQualityAlert(report);
  }

  console.log(`✅ Quality report generated with score: ${report.overview.qualityScore}/100`);
}

async function analyzeTestQuality(): Promise<TestQualityAnalysis> {
  const testFiles = await glob('**/*.{test,spec}.ts');
  const analyses: TestFileAnalysis[] = [];

  for (const file of testFiles) {
    const content = readFileSync(file, 'utf-8');
    const analysis = await analyzeTestFile(file, content);
    analyses.push(analysis);
  }

  return {
    totalFiles: analyses.length,
    averageQualityScore: analyses.reduce((sum, a) => sum + a.qualityScore, 0) / analyses.length,
    highQualityTests: analyses.filter(a => a.qualityScore >= 90).length,
    improvementNeeded: analyses.filter(a => a.qualityScore < 70),
    commonIssues: extractCommonIssues(analyses)
  };
}
```

### 4. Alerting System

#### Quality and Performance Alerts

```typescript
// scripts/alert-system.ts
interface AlertConfiguration {
  qualityThreshold: number;
  performanceRegressionThreshold: number;
  coverageThreshold: number;
  alertChannels: AlertChannel[];
}

interface AlertChannel {
  type: 'slack' | 'email' | 'github';
  config: Record<string, any>;
}

export class TestAlertSystem {
  constructor(private config: AlertConfiguration) {}

  async checkAndAlert(): Promise<void> {
    const metrics = await this.gatherMetrics();
    const alerts: Alert[] = [];

    // Quality alerts
    if (metrics.qualityScore < this.config.qualityThreshold) {
      alerts.push({
        type: 'quality',
        severity: 'warning',
        message: `Test quality score ${metrics.qualityScore} below threshold ${this.config.qualityThreshold}`,
        data: metrics.qualityDetails
      });
    }

    // Performance alerts
    if (metrics.performanceRegressions.length > 0) {
      alerts.push({
        type: 'performance',
        severity: 'error',
        message: `${metrics.performanceRegressions.length} performance regressions detected`,
        data: metrics.performanceRegressions
      });
    }

    // Coverage alerts
    if (metrics.coverage < this.config.coverageThreshold) {
      alerts.push({
        type: 'coverage',
        severity: 'warning',
        message: `Coverage ${metrics.coverage}% below threshold ${this.config.coverageThreshold}%`,
        data: metrics.coverageDetails
      });
    }

    // Send alerts
    for (const alert of alerts) {
      await this.sendAlert(alert);
    }
  }

  private async sendAlert(alert: Alert): Promise<void> {
    for (const channel of this.config.alertChannels) {
      switch (channel.type) {
        case 'slack':
          await this.sendSlackAlert(alert, channel.config);
          break;
        case 'email':
          await this.sendEmailAlert(alert, channel.config);
          break;
        case 'github':
          await this.createGitHubIssue(alert, channel.config);
          break;
      }
    }
  }
}
```

## Conclusion

This comprehensive testing standards document establishes the foundation for consistent, high-quality real implementation testing across the Teaching Engine 2.0 project. By following these standards and using the provided enforcement mechanisms, development teams can ensure:

1. **Consistent Quality**: All tests follow the same high standards
2. **Performance Awareness**: Tests are optimized for both realism and speed
3. **Automated Enforcement**: Quality gates prevent degradation
4. **Continuous Improvement**: Monitoring and reporting drive ongoing enhancement

### Next Steps

1. **Immediate Implementation**: Begin enforcing standards for all new tests
2. **Migration Planning**: Use assessment tools to plan mock-to-real migration
3. **Tool Development**: Implement custom linting rules and automation
4. **Team Training**: Conduct workshops on real implementation testing
5. **Monitoring Setup**: Deploy performance monitoring and quality dashboards

### Success Metrics

- **Quality Score**: Maintain average test quality score above 85/100
- **Performance**: Keep test execution times within defined thresholds
- **Coverage**: Achieve and maintain 90%+ test coverage with real implementations
- **Migration Progress**: Complete migration of 80% of mock-based tests within 6 months

---

*This document is a living standard that should be updated as testing practices evolve and new requirements emerge.*