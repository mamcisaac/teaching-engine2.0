# TDD Refactoring Guide

**Last Updated**: 2025-07-03  
**Version**: 1.0

## Overview

This guide outlines the comprehensive refactoring required to bring our test suite into compliance with strict Test-Driven Development (TDD) principles. Currently, many tests violate TDD by using mocks instead of real implementations.

## Current Issues

### 1. Mock Database Usage
- **Problem**: Tests use `database.mock.ts` instead of real database connections
- **Impact**: Tests don't verify actual database behavior, constraints, or performance
- **Example**: Unit tests mock all Prisma operations

### 2. Service Mocking
- **Problem**: Services are mocked entirely instead of using real implementations
- **Impact**: Business logic is not actually tested
- **Example**: AI services, auth services completely mocked

### 3. Missing Edge Cases
- **Problem**: Tests focus on happy paths with mocked data
- **Impact**: Real-world failures not caught
- **Example**: Database constraints, concurrent operations not tested

## TDD Principles to Follow

### RED-GREEN-REFACTOR Cycle

1. **RED**: Write failing test FIRST
   - Test must fail before implementation exists
   - Test defines expected behavior
   - NO implementation until test is written

2. **GREEN**: Write minimal code to pass
   - Only implement what's needed for test
   - No extra features
   - Focus on making test pass

3. **REFACTOR**: Improve while keeping tests green
   - Clean up implementation
   - Optimize performance
   - Tests must stay passing

## Refactoring Strategy

### Phase 1: Test Infrastructure (COMPLETED)

✅ Created real test database utilities:
- `tests/database/real-test-database.ts` - Real database management
- `tests/utils/tdd-test-utilities.ts` - TDD-compliant test helpers
- `jest.config.tdd.js` - TDD-enforcing Jest configuration

### Phase 2: Unit Test Migration

Replace mocked unit tests with real implementations:

```typescript
// ❌ OLD: Mocked approach
import { mockPrisma } from '../mocks/database.mock';
mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

// ✅ NEW: Real database
import { setupRealTestLifecycle } from '../utils/tdd-test-utilities';
const { getClient } = setupRealTestLifecycle();
const user = await getClient().user.create({ data: {...} });
```

### Phase 3: Integration Test Enhancement

Ensure integration tests use real services:

```typescript
// ❌ OLD: Mocked service
jest.mock('../services/aiService');

// ✅ NEW: Real service with test config
import { createRealService } from '../utils/tdd-test-utilities';
const aiService = await createRealService(AIService, testConfig);
```

### Phase 4: E2E Test Creation

Add comprehensive end-to-end tests:

```typescript
// Real user workflows
describe('Teacher Planning Workflow', () => {
  it('should create complete lesson plan hierarchy', async () => {
    // 1. Login as teacher
    // 2. Create long-range plan
    // 3. Create unit plan
    // 4. Create lesson plan
    // 5. Verify all relationships
  });
});
```

## Migration Checklist

### For Each Test File:

- [ ] Remove all database mocks
- [ ] Remove service mocks (except external APIs)
- [ ] Use real test database (SQLite/PostgreSQL)
- [ ] Write tests that fail first (RED)
- [ ] Implement minimal code to pass (GREEN)
- [ ] Refactor with confidence (REFACTOR)
- [ ] Add edge case tests
- [ ] Test error conditions
- [ ] Verify database constraints
- [ ] Test concurrent operations

## Test Categories

### 1. Unit Tests
- **Database**: SQLite in-memory
- **Speed**: Fast (<100ms per test)
- **Isolation**: Clean data between tests
- **Focus**: Single function/method behavior

### 2. Integration Tests
- **Database**: SQLite file or PostgreSQL
- **Speed**: Medium (<1s per test)
- **Isolation**: Clean between test suites
- **Focus**: Service interactions

### 3. E2E Tests
- **Database**: PostgreSQL (production-like)
- **Speed**: Slower (1-5s per test)
- **Isolation**: Full reset between tests
- **Focus**: Complete user workflows

### 4. Security Tests
- **Database**: PostgreSQL with constraints
- **Speed**: Medium
- **Focus**: Real attack scenarios
- **Examples**: SQL injection, XSS, auth bypass

### 5. Performance Tests
- **Database**: PostgreSQL with real data volumes
- **Speed**: Varies
- **Focus**: Response times, throughput
- **Data**: Production-scale datasets

## External API Mocking

Only mock these external services:
- OpenAI API (costs money)
- SendGrid (email service)
- Stripe (payments)
- AWS S3 (file storage)

Everything else must use real implementations.

## Running TDD Tests

```bash
# Run all TDD tests
npm run test:tdd

# Run specific test type
TEST_TYPE=unit npm run test:tdd
TEST_TYPE=integration npm run test:tdd
TEST_TYPE=e2e npm run test:tdd

# Use PostgreSQL for tests
TEST_DATABASE=postgresql npm run test:tdd

# Debug mode
DEBUG_TESTS=true npm run test:tdd
```

## Common Patterns

### Test User Creation
```typescript
const user = await createTestUser({
  email: 'test@example.com',
  password: 'SecurePass123!',
  role: 'TEACHER'
});
```

### Real Service Testing
```typescript
const service = await createRealService(NewsletterService);
const result = await service.generate(params);
expect(result).toHaveProperty('content');
```

### Database Assertions
```typescript
await realTestAssertions.assertDatabaseState(
  'lessonPlan',
  { id: planId },
  { status: 'PUBLISHED' }
);
```

## Benefits of TDD Approach

1. **Confidence**: Tests verify actual behavior
2. **Reliability**: Catch real bugs, not mock issues
3. **Performance**: Identify slow queries early
4. **Security**: Test real attack vectors
5. **Refactoring**: Safe changes with real tests

## Migration Timeline

1. **Week 1**: Core infrastructure and utilities ✅
2. **Week 2**: Auth and user management tests
3. **Week 3**: Planning features (LRP, Unit, Lesson)
4. **Week 4**: AI services and generators
5. **Week 5**: Integration and E2E tests
6. **Week 6**: Performance and security tests

## Success Metrics

- 90%+ statement coverage with REAL tests
- All tests use real database
- No service mocks (except external APIs)
- All tests follow RED-GREEN-REFACTOR
- E2E tests cover all user workflows

## Questions?

Consult the following resources:
- `/tests/utils/tdd-test-utilities.ts` - Test helpers
- `/tests/database/real-test-database.ts` - Database utilities
- Example: `/src/middleware/__tests__/auth.tdd.test.ts`