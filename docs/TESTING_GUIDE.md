# Testing Guide - Teaching Engine 2.0

## Overview

This guide provides comprehensive testing best practices, current status, and maintenance guidelines for the Teaching Engine 2.0 project. Our testing strategy focuses on reliability, performance, and comprehensive coverage across all layers of the application.

## Current Test Status

### Test Coverage Summary

As of January 2025, our test coverage stands at:

- **Lines**: 49.88% (833/1670)
- **Statements**: 48.74% (871/1787)
- **Functions**: 51.47% (192/373)
- **Branches**: 41.7% (337/808)

### Test Suite Structure

#### Unit Tests (277 total)

- **Status**: 250 passed, 15 failed, 12 skipped
- **Location**: `server/tests/unit/`
- **Coverage**: Services, utilities, and business logic
- **Key Issues**: Database mock configuration needs fixing

#### Integration Tests

- **Status**: Active development, some database connection issues
- **Location**: `server/tests/integration/`
- **Coverage**: API endpoints, database operations, service interactions

#### E2E Tests (20+ test files)

- **Status**: Comprehensive coverage of user workflows
- **Location**: `tests/e2e/`
- **Coverage**: Full application workflows, UI interactions

## Testing Architecture

### Test Types and Their Purpose

#### 1. Unit Tests

**Purpose**: Test individual components in isolation
**Tools**: Jest, mocks, stubs
**Speed**: Fast (< 10s per test)
**Isolation**: Complete - no external dependencies

```typescript
// Example unit test structure
describe('Service', () => {
  beforeEach(() => {
    // Setup mocks
  });

  it('should handle specific scenario', async () => {
    // Test implementation
  });
});
```

#### 2. Integration Tests

**Purpose**: Test component interactions and data flow
**Tools**: Jest, real database, minimal mocks
**Speed**: Medium (< 30s per test)
**Isolation**: Partial - uses test database

#### 3. E2E Tests

**Purpose**: Test complete user workflows
**Tools**: Playwright, real browsers
**Speed**: Slow (< 60s per test)
**Isolation**: Full application stack

## Test Configuration

### Jest Configuration

Our Jest setup uses a unified configuration system with different projects:

- **Unit Tests**: Aggressive mocking, fastest execution
- **Integration Tests**: Database access, minimal mocking
- **AI Snapshot Tests**: Specialized for AI content validation
- **Performance Tests**: Single worker, timing measurements

### Key Configuration Features

```javascript
// Performance optimizations
maxWorkers: getOptimalWorkerCount(),
cache: true,
cacheDirectory: '<rootDir>/.jest-cache',

// Module resolution
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/src/$1',
  '^tests/(.*)$': '<rootDir>/tests/$1',
}
```

## Best Practices

### 1. Test Organization

#### File Naming Conventions

```
- unit tests: *.test.ts
- integration tests: *.integration.test.ts
- e2e tests: *.spec.ts
- mocks: *.mock.ts
```

#### Directory Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── e2e/           # E2E tests (Playwright)
├── mocks/         # Mock implementations
├── helpers/       # Test utilities
└── fixtures/      # Test data
```

### 2. Writing Effective Tests

#### Test Structure (AAA Pattern)

```typescript
describe('Feature', () => {
  it('should do something when condition is met', async () => {
    // Arrange
    const input = createTestData();

    // Act
    const result = await serviceUnderTest.process(input);

    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

#### Descriptive Test Names

- ✅ `should return user data when valid ID is provided`
- ❌ `test user fetch`

#### Test Independence

- Each test should be able to run in isolation
- Use `beforeEach` and `afterEach` for setup/cleanup
- Avoid test interdependencies

#### Mocking Strategy

```typescript
// Mock external dependencies
jest.mock('@/services/externalAPI', () => ({
  fetchData: jest.fn(),
}));

// Use dependency injection for better testability
class Service {
  constructor(private apiClient: APIClient) {}
}
```

### 3. Database Testing

#### Test Database Setup

```typescript
// Use separate test database
const testDb = new TestDatabaseManager();

beforeAll(async () => {
  await testDb.setup();
});

afterAll(async () => {
  await testDb.teardown();
});

beforeEach(async () => {
  await testDb.cleanup();
});
```

#### Data Factories

```typescript
// Use factories for test data
const userFactory = {
  build: (overrides = {}) => ({
    id: faker.datatype.uuid(),
    name: faker.name.fullName(),
    email: faker.internet.email(),
    ...overrides,
  }),
};
```

### 4. Async Testing

#### Proper Async Handling

```typescript
it('should handle async operations', async () => {
  const promise = service.asyncOperation();
  await expect(promise).resolves.toBe(expectedValue);
});

// Or
it('should handle async operations', async () => {
  const result = await service.asyncOperation();
  expect(result).toBe(expectedValue);
});
```

#### Timeout Configuration

```typescript
// For slow operations
it('should handle slow operation', async () => {
  // Test implementation
}, 30000); // 30 second timeout
```

## Current Issues and Fixes

### 1. Jest Configuration Issues

**Problem**: Unit tests failing due to missing `jest.config.optimized.js`
**Fix**: Updated Jest configuration to use environment-based config selection

### 2. Database Mock Issues

**Problem**: Unit tests can't locate database mocks
**Status**: Configuration mapping needs adjustment in moduleNameMapper

### 3. Integration Test Stability

**Problem**: Some integration tests timing out or failing due to database setup
**Solution**: Improved database cleanup and setup procedures

## Performance Optimization

### Test Performance Guidelines

1. **Parallel Execution**: Use Jest's worker system effectively
2. **Selective Testing**: Run only relevant tests during development
3. **Caching**: Leverage Jest's caching for faster re-runs
4. **Mock External Services**: Avoid network calls in tests

### Performance Metrics

- Unit tests: Target < 10 seconds total
- Integration tests: Target < 2 minutes total
- E2E tests: Target < 10 minutes total

## CI/CD Integration

### GitHub Actions Configuration

Our CI pipeline runs:

1. Linting and type checking
2. Unit and integration tests
3. Build verification
4. E2E smoke tests
5. Full E2E test suite

### Environment Setup

```yaml
env:
  DATABASE_URL: file:./packages/database/prisma/test.db
  JWT_SECRET: test-secret-key
  NODE_ENV: test
```

## Coverage Goals and Monitoring

### Coverage Targets

- **Lines**: 90% (Current: 49.88%)
- **Functions**: 85% (Current: 51.47%)
- **Branches**: 80% (Current: 41.7%)
- **Statements**: 90% (Current: 48.74%)

### Coverage Analysis

High coverage areas:

- Service Registry: 93.87% lines
- Base Service: 93.63% lines
- Scenario Template Extractor: 97.22% lines

Areas needing improvement:

- AI Draft Service: 16.12% lines
- Curriculum Import Service: 27.37% lines
- Contact Extractor: 33.92% lines

## Testing Commands

### Development Commands

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit      # Unit tests only
pnpm test:integration  # Integration tests only
pnpm test:e2e       # E2E tests only

# Coverage reporting
pnpm test:coverage

# Watch mode for development
pnpm test:watch

# Debug mode
pnpm test:debug
```

### Advanced Testing

```bash
# Run tests for specific service
pnpm test -- --grep "CurriculumService"

# Run tests with verbose output
DEBUG_TESTS=true pnpm test

# Run performance tests
TEST_TYPE=performance pnpm test
```

## Debugging Tests

### Common Debugging Techniques

#### 1. Console Logging

```typescript
it('should debug test', () => {
  console.log('Debug info:', data);
  // Test implementation
});
```

#### 2. Jest Debug Mode

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### 3. Playwright Debug Mode

```bash
# Run E2E tests in debug mode
pnpm test:e2e:debug
```

### Common Issues and Solutions

#### Test Isolation Issues

**Problem**: Tests affecting each other
**Solution**: Proper cleanup in `afterEach` blocks

#### Async Test Issues

**Problem**: Tests completing before async operations
**Solution**: Proper `await` usage and timeout configuration

#### Mock Issues

**Problem**: Mocks not resetting between tests
**Solution**: Use `jest.clearAllMocks()` in `afterEach`

## Testing Guidelines for Contributors

### Before Writing Tests

1. Understand the component's purpose and dependencies
2. Identify edge cases and error conditions
3. Plan test data and mocking strategy
4. Consider performance implications

### Writing Tests

1. Start with the happy path
2. Add edge cases and error scenarios
3. Ensure proper cleanup
4. Add descriptive assertions

### Code Review Checklist

- [ ] Tests cover the main functionality
- [ ] Edge cases are tested
- [ ] Error conditions are handled
- [ ] Tests are independent and isolated
- [ ] Proper cleanup is implemented
- [ ] Test names are descriptive
- [ ] No hardcoded values in tests
- [ ] Appropriate mocking strategy used

## Maintenance and Monitoring

### Regular Maintenance Tasks

1. **Weekly**: Review failing tests and fix issues
2. **Monthly**: Analyze coverage reports and identify gaps
3. **Quarterly**: Review and update testing strategy
4. **Before releases**: Full test suite validation

### Test Quality Metrics

- Test execution time trends
- Flaky test identification
- Coverage trend analysis
- Test maintenance overhead

### Tools and Monitoring

- **Coverage Reports**: Generated automatically with each test run
- **CI/CD Integration**: Automated testing in GitHub Actions
- **Performance Monitoring**: Test execution time tracking
- **Quality Gates**: Minimum coverage thresholds

## Advanced Testing Patterns

### Test Doubles

```typescript
// Stub - provides predetermined responses
const apiStub = {
  fetchUser: () => Promise.resolve(mockUser),
};

// Mock - records interactions
const apiMock = jest.fn();
apiMock.mockResolvedValue(mockUser);

// Spy - observes real implementation
const apiSpy = jest.spyOn(service, 'method');
```

### Test Data Builders

```typescript
class UserBuilder {
  private user: Partial<User> = {};

  withName(name: string): UserBuilder {
    this.user.name = name;
    return this;
  }

  build(): User {
    return { ...defaultUser, ...this.user };
  }
}

// Usage
const user = new UserBuilder().withName('John Doe').build();
```

### Parameterized Tests

```typescript
describe.each([
  ['admin', true],
  ['user', false],
  ['guest', false],
])('User permissions for %s', (role, canAccess) => {
  it(`should ${canAccess ? 'allow' : 'deny'} access`, () => {
    const result = checkPermission(role);
    expect(result).toBe(canAccess);
  });
});
```

## Future Improvements

### Short Term (Next Sprint)

1. Fix unit test database mocking issues
2. Improve integration test stability
3. Add missing test coverage for critical services
4. Implement test retry mechanism for flaky tests

### Medium Term (Next Quarter)

1. Implement visual regression testing
2. Add performance benchmarking tests
3. Enhance E2E test parallelization
4. Implement test impact analysis

### Long Term (Next Year)

1. Implement mutation testing
2. Add chaos engineering tests
3. Implement AI-assisted test generation
4. Create comprehensive test analytics dashboard

## Resources and Documentation

### Internal Documentation

- [Jest Configuration](../server/jest.config.js)
- [Test Utilities](../server/tests/utils/)
- [Playwright Configuration](../playwright.config.ts)

### External Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Team Communication

- **Slack Channel**: #testing-discussions
- **Weekly Meeting**: Testing Review (Fridays 2 PM)
- **Documentation**: Keep this guide updated with new patterns and discoveries

---

_Last updated: January 2025_
_Next review: February 2025_
