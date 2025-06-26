# Developer Testing Guide

A comprehensive guide to testing in Teaching Engine 2.0, designed to make testing efficient and developer-friendly.

## 🚀 Quick Start

### Installation and Setup

```bash
# Install dependencies
pnpm install

# Validate test environment
pnpm test:validate

# Auto-fix common issues
pnpm test:validate --fix

# Run all tests
pnpm test:all
```

### Smart Test Runner

Use our intelligent test runner for the best developer experience:

```bash
# Quick commands
pnpm test:unit           # Unit tests only
pnpm test:integration    # Integration tests
pnpm test:e2e           # End-to-end tests
pnpm test:watch         # Watch mode
pnpm test:coverage      # With coverage

# Feature-specific
pnpm test:etfo          # ETFO lesson planning
pnpm test:analytics     # Analytics features

# Debugging
pnpm test:debug         # Detailed output
pnpm test:validate      # Environment check
```

## 🏗️ Test Architecture

### Test Types

| Type | Purpose | Location | Framework |
|------|---------|----------|-----------|
| **Unit** | Individual functions/components | `*/src/__tests__/unit/` | Jest/Vitest |
| **Integration** | API endpoints, services | `*/src/__tests__/integration/` | Jest/Vitest |
| **Contract** | API contracts | `tests/contract/` | Vitest |
| **E2E** | Full user workflows | `tests/e2e/` | Playwright |

### Project Structure

```
teaching-engine2.0/
├── server/
│   ├── src/__tests__/
│   │   ├── unit/              # Unit tests
│   │   └── integration/       # Integration tests
│   └── jest.*.config.js       # Jest configurations
├── client/
│   ├── src/__tests__/
│   │   ├── unit/              # Component tests
│   │   └── integration/       # Integration tests
│   └── vitest.config.ts       # Vitest configuration
├── tests/
│   ├── contract/              # API contract tests
│   └── e2e/                   # Playwright E2E tests
└── docs/testing/              # Testing documentation
```

## 🔧 Environment Configuration

### Environment Files

```
# Test environment files
.env.test.example          # Template with safe defaults
.env.test                  # Root environment (optional)
server/.env.test           # Server-specific config
packages/database/.env.test # Database configuration
```

### Key Variables

```bash
# Database (SQLite for tests)
DATABASE_URL="file:./test.db"

# Authentication
JWT_SECRET="test-jwt-secret"
NODE_ENV="test"

# Feature flags
MOCK_EXTERNAL_APIS=true
MOCK_AI_RESPONSES=true
```

### Validation

```bash
# Check environment setup
pnpm test:validate

# Auto-fix common issues
pnpm test:validate --fix

# Manual setup
cp .env.test.example .env.test
cp server/.env.test.example server/.env.test
```

## 📝 Writing Tests

### Unit Test Example

```typescript
// server/src/__tests__/unit/myService.test.ts
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { myService } from '../../services/myService';

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process data correctly', async () => {
    // Arrange
    const input = { id: 1, name: 'test' };
    
    // Act
    const result = await myService.processData(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.processed).toBe(true);
  });
});
```

### Integration Test Example

```typescript
// server/src/__tests__/integration/api.test.ts
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../../app';
import { setupTestDatabase, cleanupTestDatabase } from '../helpers/database';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should create a new resource', async () => {
    const response = await request(app)
      .post('/api/resources')
      .send({ name: 'Test Resource' })
      .expect(201);

    expect(response.body.name).toBe('Test Resource');
  });
});
```

### E2E Test Example

```typescript
// tests/e2e/workflow.spec.ts
import { test, expect } from '@playwright/test';

test('complete user workflow', async ({ page }) => {
  // Navigate to app
  await page.goto('/');
  
  // Login
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
  
  // Verify dashboard
  await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
});
```

## 🔍 Debugging Tests

### VS Code Integration

Use the built-in VS Code debugging configurations:

1. **Debug Server Unit Tests** - Debug server unit tests
2. **Debug Client Tests** - Debug client tests  
3. **Debug Current Test File** - Debug the currently open test file
4. **Debug ETFO Tests** - Debug ETFO-specific tests
5. **Debug Smart Test Runner** - Debug the test runner itself

### Command Line Debugging

```bash
# Debug with verbose output
pnpm test:debug

# Debug specific tests
pnpm test:debug --server
pnpm test:debug --client

# Run with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Playwright debugging
PWDEBUG=1 pnpm test:e2e
```

### Common Debug Scenarios

```bash
# Database issues
pnpm test:validate
pnpm db:push --force-reset

# Port conflicts
lsof -ti:3000 | xargs kill -9

# Module resolution
pnpm db:generate
pnpm install

# Memory issues
NODE_OPTIONS="--max-old-space-size=4096" pnpm test
```

## 🎯 Best Practices

### Test Organization

1. **Group Related Tests**: Use `describe` blocks for logical grouping
2. **Clear Test Names**: Use descriptive test names that explain the scenario
3. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and validation
4. **Test Isolation**: Each test should be independent and clean up after itself

### Mocking Guidelines

```typescript
// Mock external dependencies
jest.mock('../../services/externalApi', () => ({
  fetchData: jest.fn().mockResolvedValue({ data: 'mocked' })
}));

// Mock database calls in unit tests
jest.mock('@teaching-engine/database', () => ({
  prisma: {
    user: {
      findMany: jest.fn().mockResolvedValue([])
    }
  }
}));
```

### Database Testing

```typescript
// Use test database isolation
beforeEach(async () => {
  await cleanDatabase();
  await seedTestData();
});

// Clean up after tests
afterAll(async () => {
  await prisma.$disconnect();
});
```

### Async Testing

```typescript
// Always await async operations
it('should handle async operations', async () => {
  const result = await myAsyncFunction();
  expect(result).toBeDefined();
});

// Use proper timeouts for slow operations
it('should handle slow operations', async () => {
  // Test implementation
}, 30000); // 30 second timeout
```

## 📊 Coverage and Quality

### Coverage Requirements

- **Unit Tests**: 90%+ coverage for business logic
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user paths covered

### Running Coverage

```bash
# Generate coverage reports
pnpm test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Quality Gates

Before committing:
1. All tests pass
2. Coverage requirements met
3. No TypeScript errors
4. Linting passes
5. Documentation updated

## 🚨 Troubleshooting

### Common Issues

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Module not found** | Import errors | `pnpm install && pnpm db:generate` |
| **Port in use** | EADDRINUSE | `lsof -ti:3000 \| xargs kill -9` |
| **Database errors** | Connection failures | Check `.env.test` files |
| **Test timeouts** | Hanging tests | Add proper cleanup and timeouts |
| **Memory issues** | Out of memory | Use `--max-old-space-size=4096` |

### Getting Help

1. Check this guide and the debugging guide
2. Run `pnpm test:validate` to check environment
3. Use VS Code debugging configurations
4. Check test logs for specific error messages
5. Consult the troubleshooting guide

## 🔄 CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Scheduled nightly runs

### Local CI Simulation

```bash
# Run tests like CI
pnpm test:ci

# With coverage
COVERAGE=true pnpm test:ci
```

## 📚 Additional Resources

- [Debugging Guide](./debugging-guide.md) - Detailed debugging techniques
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library](https://testing-library.com/docs/)

---

**Remember**: Testing is not just about finding bugs—it's about building confidence in your code and enabling fearless refactoring. Write tests that help you and your team succeed! 🎯