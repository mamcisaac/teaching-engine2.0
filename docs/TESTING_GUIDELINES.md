# Testing Guidelines for Team - Teaching Engine 2.0

**Document Version**: 1.0  
**Last Updated**: January 27, 2025  
**Audience**: Development Team, QA Engineers, Code Reviewers

## Quick Reference

### Essential Commands

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm --filter server test:unit
pnpm --filter server test:integration
pnpm test:e2e

# Coverage and debugging
pnpm test:coverage
pnpm test:debug
pnpm test:watch
```

### Coverage Targets

- **Lines**: 90% (Current: 49.88%)
- **Functions**: 85% (Current: 51.47%)
- **Branches**: 80% (Current: 41.7%)
- **Statements**: 90% (Current: 48.74%)

## Testing Philosophy

### Core Principles

1. **Test-Driven Development**: Write tests before or alongside implementation
2. **Comprehensive Coverage**: Every feature needs corresponding tests
3. **Fast Feedback**: Tests should run quickly and provide immediate feedback
4. **Reliable Tests**: Tests should be deterministic and not flaky
5. **Maintainable Tests**: Tests should be easy to understand and modify

### Quality Standards

- **New code**: Minimum 80% coverage required
- **Critical paths**: Minimum 95% coverage required
- **Bug fixes**: Must include regression tests
- **Refactoring**: Maintain or improve existing coverage

## Test Types and When to Use Them

### 1. Unit Tests

**Use when**: Testing individual functions, classes, or components in isolation

```typescript
// ✅ Good unit test
describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate user email format', () => {
    const service = new UserService();
    const result = service.isValidEmail('test@example.com');
    expect(result).toBe(true);
  });
});
```

**Characteristics**:

- Fast execution (< 100ms per test)
- No external dependencies
- High isolation with mocks
- Focus on single responsibility

### 2. Integration Tests

**Use when**: Testing interactions between components or systems

```typescript
// ✅ Good integration test
describe('API Integration', () => {
  beforeEach(async () => {
    await testDb.cleanup();
  });

  it('should create user and return 201', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'John', email: 'john@example.com' });

    expect(response.status).toBe(201);
    expect(response.body.user.id).toBeDefined();
  });
});
```

**Characteristics**:

- Moderate execution time (< 5s per test)
- Real database or external services
- Tests actual integration points
- Validates API contracts

### 3. E2E Tests

**Use when**: Testing complete user workflows

```typescript
// ✅ Good E2E test
test('Teacher can create lesson plan', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('[data-testid="create-lesson"]');
  await page.fill('[data-testid="lesson-title"]', 'Math Lesson');
  await page.click('[data-testid="save-lesson"]');

  await expect(page.locator('[data-testid="lesson-list"]')).toContainText('Math Lesson');
});
```

**Characteristics**:

- Slow execution (10s - 2min per test)
- Full application stack
- Real user interactions
- Critical workflow validation

## Writing Effective Tests

### Test Structure (AAA Pattern)

```typescript
describe('Feature', () => {
  it('should do something when condition is met', async () => {
    // Arrange - Set up test data and conditions
    const user = createTestUser();
    const service = new UserService();

    // Act - Execute the functionality being tested
    const result = await service.processUser(user);

    // Assert - Verify the expected outcome
    expect(result.status).toBe('processed');
    expect(result.userId).toBe(user.id);
  });
});
```

### Descriptive Test Names

#### ✅ Good Test Names

```typescript
it('should return user profile when valid ID is provided');
it('should throw ValidationError when email format is invalid');
it('should create lesson plan with auto-generated standards');
it('should send notification when assignment is due tomorrow');
```

#### ❌ Poor Test Names

```typescript
it('tests user function');
it('should work');
it('email test');
it('creates stuff');
```

### Test Data Management

#### Use Factories for Test Data

```typescript
// factories/userFactory.ts
export const createUser = (overrides: Partial<User> = {}) => ({
  id: faker.datatype.uuid(),
  name: faker.name.fullName(),
  email: faker.internet.email(),
  role: 'teacher',
  ...overrides,
});

// Usage in tests
const teacher = createUser({ role: 'teacher' });
const admin = createUser({ role: 'admin', name: 'Admin User' });
```

#### Use Builders for Complex Objects

```typescript
class LessonPlanBuilder {
  private lessonPlan: Partial<LessonPlan> = {};

  withTitle(title: string): LessonPlanBuilder {
    this.lessonPlan.title = title;
    return this;
  }

  withSubject(subject: string): LessonPlanBuilder {
    this.lessonPlan.subject = subject;
    return this;
  }

  build(): LessonPlan {
    return { ...defaultLessonPlan, ...this.lessonPlan };
  }
}

// Usage
const lessonPlan = new LessonPlanBuilder()
  .withTitle('Fractions Introduction')
  .withSubject('Mathematics')
  .build();
```

## Mocking Guidelines

### When to Mock

- External APIs (OpenAI, SendGrid, etc.)
- File system operations
- Database operations (in unit tests)
- Time-dependent functions
- Random number generation

### Mocking Best Practices

#### ✅ Good Mocking

```typescript
// Mock external service
jest.mock('@/services/openaiService', () => ({
  generateContent: jest.fn().mockResolvedValue({
    content: 'Generated lesson content',
    tokens: 150,
  }),
}));

// Mock with different scenarios
describe('ContentService', () => {
  const mockOpenAI = jest.mocked(openaiService.generateContent);

  beforeEach(() => {
    mockOpenAI.mockClear();
  });

  it('should handle successful content generation', async () => {
    mockOpenAI.mockResolvedValueOnce({
      content: 'Test content',
      tokens: 100,
    });

    const result = await contentService.generate('prompt');
    expect(result.content).toBe('Test content');
  });

  it('should handle API errors gracefully', async () => {
    mockOpenAI.mockRejectedValueOnce(new Error('API Error'));

    await expect(contentService.generate('prompt')).rejects.toThrow('Content generation failed');
  });
});
```

#### ❌ Poor Mocking

```typescript
// Over-mocking (mocking things that don't need to be mocked)
jest.mock('./userUtils', () => ({
  formatName: jest.fn(),
}));

// Under-mocking (not mocking external dependencies)
// This will make real API calls in tests
const result = await openai.generateText(prompt);
```

## Database Testing

### Unit Tests - Mock Database

```typescript
// Mock Prisma for unit tests
jest.mock('@teaching-engine/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));
```

### Integration Tests - Real Database

```typescript
// Use real database for integration tests
describe('User API Integration', () => {
  beforeAll(async () => {
    await testDb.migrate();
  });

  beforeEach(async () => {
    await testDb.cleanup();
    await testDb.seed();
  });

  afterAll(async () => {
    await testDb.teardown();
  });
});
```

## Async Testing

### Promises and Async/Await

```typescript
// ✅ Proper async testing
it('should handle async operations', async () => {
  const result = await service.asyncOperation();
  expect(result).toBe(expectedValue);
});

// ✅ Testing promise rejections
it('should handle errors', async () => {
  await expect(service.failingOperation()).rejects.toThrow('Expected error message');
});

// ❌ Missing await
it('should handle async operations', () => {
  const result = service.asyncOperation(); // This returns a Promise!
  expect(result).toBe(expectedValue); // This will fail
});
```

### Testing Callbacks and Events

```typescript
// Testing event emitters
it('should emit event when processing completes', (done) => {
  service.on('complete', (data) => {
    expect(data.status).toBe('success');
    done();
  });

  service.processData(testData);
});

// Testing with promises
it('should emit event when processing completes', async () => {
  const eventPromise = new Promise((resolve) => {
    service.once('complete', resolve);
  });

  service.processData(testData);

  const result = await eventPromise;
  expect(result.status).toBe('success');
});
```

## Error Testing

### Testing Error Conditions

```typescript
describe('Error Handling', () => {
  it('should throw ValidationError for invalid input', () => {
    expect(() => service.process(invalidData)).toThrow(ValidationError);
  });

  it('should throw specific error message', () => {
    expect(() => service.process(invalidData)).toThrow('Email format is invalid');
  });

  it('should handle async errors', async () => {
    await expect(service.asyncProcess(invalidData)).rejects.toThrow(ValidationError);
  });
});
```

## Performance Testing

### Testing Response Times

```typescript
describe('Performance', () => {
  it('should process large dataset within time limit', async () => {
    const startTime = Date.now();
    const largeDataset = generateLargeDataset(10000);

    await service.processLargeDataset(largeDataset);

    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 seconds
  });
});
```

### Memory Usage Testing

```typescript
it('should not leak memory during processing', () => {
  const initialMemory = process.memoryUsage().heapUsed;

  // Process data multiple times
  for (let i = 0; i < 1000; i++) {
    service.processData(testData);
  }

  // Force garbage collection if available
  if (global.gc) global.gc();

  const finalMemory = process.memoryUsage().heapUsed;
  const memoryIncrease = finalMemory - initialMemory;

  expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB
});
```

## Common Anti-Patterns to Avoid

### ❌ Flaky Tests

```typescript
// Don't rely on timing
it('should update after delay', (done) => {
  service.updateAfterDelay();
  setTimeout(() => {
    expect(service.isUpdated()).toBe(true);
    done();
  }, 100); // This might fail on slow systems
});

// ✅ Use proper async handling
it('should update after delay', async () => {
  const updatePromise = service.updateAfterDelay();
  await updatePromise;
  expect(service.isUpdated()).toBe(true);
});
```

### ❌ Testing Implementation Details

```typescript
// Don't test private methods directly
it('should call private method', () => {
  const spy = jest.spyOn(service, '_privateMethod');
  service.publicMethod();
  expect(spy).toHaveBeenCalled();
});

// ✅ Test public behavior
it('should produce correct result', () => {
  const result = service.publicMethod();
  expect(result).toBe(expectedResult);
});
```

### ❌ Over-complicated Tests

```typescript
// Don't test multiple things in one test
it('should handle user creation and email sending and logging', async () => {
  const user = await service.createUser(userData);
  expect(user.id).toBeDefined();

  const emailSent = await emailService.wasEmailSent();
  expect(emailSent).toBe(true);

  const logEntry = await logger.getLastEntry();
  expect(logEntry.action).toBe('user_created');
});

// ✅ Split into focused tests
it('should create user with valid data', async () => {
  const user = await service.createUser(userData);
  expect(user.id).toBeDefined();
});

it('should send welcome email after user creation', async () => {
  await service.createUser(userData);
  expect(emailService.send).toHaveBeenCalledWith(expect.objectContaining({ type: 'welcome' }));
});
```

## Code Review Checklist

### For Test Authors

- [ ] Tests follow AAA pattern (Arrange, Act, Assert)
- [ ] Test names are descriptive and specific
- [ ] Tests are independent and can run in any order
- [ ] External dependencies are properly mocked
- [ ] Edge cases and error conditions are tested
- [ ] Tests are focused and test one thing at a time
- [ ] Async operations are properly handled
- [ ] Test data is properly cleaned up

### For Code Reviewers

- [ ] Test coverage is adequate for the changes
- [ ] Tests actually test the intended functionality
- [ ] Tests don't have obvious flaws or gaps
- [ ] Mocking strategy is appropriate
- [ ] Tests are maintainable and readable
- [ ] No test smells or anti-patterns
- [ ] Performance implications are considered
- [ ] Tests align with project conventions

## Debugging Tests

### Common Debugging Techniques

#### Add Debugging Output

```typescript
it('should process data correctly', () => {
  const input = createTestData();
  console.log('Input data:', JSON.stringify(input, null, 2));

  const result = service.process(input);
  console.log('Result:', JSON.stringify(result, null, 2));

  expect(result.status).toBe('success');
});
```

#### Use Jest Debugger

```bash
# Run single test in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand --no-cache tests/specific-test.test.ts
```

#### Isolate Failing Tests

```typescript
// Use .only to run single test
it.only('should handle specific case', () => {
  // Test implementation
});

// Use .skip to skip problematic tests temporarily
it.skip('should handle complex scenario', () => {
  // Test implementation
});
```

## Continuous Integration

### CI Test Requirements

- All tests must pass before merge
- Coverage must not decrease
- No flaky tests allowed
- Performance tests must meet thresholds

### Local Testing Before Push

```bash
# Run full test suite
pnpm test

# Check coverage
pnpm test:coverage

# Run linting
pnpm lint

# Type checking
pnpm typecheck
```

## Team Practices

### Daily Practices

- Run tests before committing code
- Write tests for new features
- Fix failing tests immediately
- Review test coverage regularly

### Weekly Practices

- Review flaky test reports
- Analyze test performance
- Update test documentation
- Share testing learnings

### Code Review Focus Areas

1. **Test Coverage**: Adequate coverage for changes
2. **Test Quality**: Well-written, maintainable tests
3. **Test Strategy**: Appropriate test types used
4. **Test Performance**: Tests run efficiently

## Resources and Tools

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

### Internal Resources

- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing practices
- [Coverage Analysis](./COVERAGE_ANALYSIS.md) - Current coverage status
- [Test Status Report](./TEST_STATUS_REPORT.md) - Current test health

### Useful Libraries

```json
{
  "jest": "Test framework",
  "@testing-library/jest-dom": "Jest DOM matchers",
  "playwright": "E2E testing",
  "faker": "Test data generation",
  "supertest": "API testing",
  "nock": "HTTP mocking"
}
```

## Getting Help

### When You're Stuck

1. **Check existing tests** for similar patterns
2. **Review documentation** for the testing tools
3. **Ask team members** for guidance
4. **Create minimal reproduction** of the issue
5. **Debug step by step** using console.log or debugger

### Common Questions

**Q: Should I mock this dependency?**
A: Mock external services, databases (in unit tests), and unpredictable functions. Don't mock your own code unless necessary.

**Q: How much should I test?**
A: Test all public interfaces, edge cases, and error conditions. Aim for 80%+ coverage on new code.

**Q: My test is flaky, what do I do?**
A: Identify the source of non-determinism (timing, randomness, external dependencies) and eliminate it through proper mocking or synchronization.

**Q: Tests are too slow, how to speed them up?**
A: Use proper mocking, run tests in parallel, optimize test data setup, and consider test categorization.

---

**Remember**: Good tests are an investment in code quality, team productivity, and user satisfaction. Take time to write them well, and they'll pay dividends throughout the project lifecycle.

**Guidelines Prepared By**: Agent 18 - Final Review and Documentation  
**Next Review**: February 27, 2025  
**Version**: 1.0
