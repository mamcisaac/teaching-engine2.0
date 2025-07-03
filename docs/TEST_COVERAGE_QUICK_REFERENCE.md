# Test Coverage Quick Reference

**Current Coverage**: 62% | **Target**: 90% | **Gap**: 28%

## 🚨 Critical Files with 0% Coverage

### MUST TEST IMMEDIATELY (Security/Financial Risk)
```
src/middleware/rateLimiter.ts          - API abuse prevention
src/utils/privacy.ts                   - PII handling
src/services/payment/                  - Payment processing
src/services/ai/openaiService.ts       - Cost center ($$$)
```

### CORE FEATURES UNTESTED
```
src/services/ai/lessonGenerationService.ts    - Main product feature
src/services/fileParsing/*.ts                 - User uploads
src/services/etfoIntegrationService.ts        - ETFO worksheets
```

## 📊 Coverage by Area

| Area | Current | Target | Files Affected |
|------|---------|--------|----------------|
| AI Services | 0% | 85% | 15 files |
| File Processing | 0% | 85% | 8 files |
| Auth/Security | 15% | 95% | 6 files |
| Business Logic | 8% | 90% | 12 files |
| Controllers | 70% | 95% | 8 files |
| Utilities | 30% | 100% | 10 files |

## 🎯 Quick Wins (1 Day Each)

### 1. Add Auth Middleware Tests (+3% coverage)
```typescript
// 5 tests needed:
- Valid token acceptance
- Missing token rejection  
- Expired token handling
- Invalid token format
- Role-based access
```

### 2. Test Utility Functions (+2% coverage)
```typescript
// Pure functions in:
src/utils/urlValidator.ts
src/utils/dateHelpers.ts
src/utils/stringHelpers.ts
```

### 3. Basic CRUD Tests (+5% coverage)
```typescript
// For each service:
- Create with valid data
- Create with invalid data
- Read existing
- Update existing
- Delete existing
```

## 🛠️ Test Commands

```bash
# Run all tests with coverage
pnpm --filter server test:coverage

# Test specific module
pnpm --filter server test:coverage src/services/ai

# Generate HTML report
pnpm --filter server test:coverage -- --coverageReporters=html

# Run only unit tests
pnpm --filter server test:unit

# Run with specific threshold check
pnpm --filter server test:coverage -- --coverageThreshold='{"global":{"statements":70}}'
```

## 📝 Test Template

```typescript
import { describe, test, expect, beforeEach, jest } from '@jest/globals';

describe('ServiceName', () => {
  let service: ServiceName;
  let mockDependency: jest.Mocked<Dependency>;

  beforeEach(() => {
    // Setup
    mockDependency = createMock<Dependency>();
    service = new ServiceName(mockDependency);
    jest.clearAllMocks();
  });

  describe('methodName', () => {
    test('should handle happy path', async () => {
      // Arrange
      const input = { /* test data */ };
      mockDependency.someMethod.mockResolvedValue(/* response */);

      // Act
      const result = await service.methodName(input);

      // Assert
      expect(result).toEqual(/* expected */);
      expect(mockDependency.someMethod).toHaveBeenCalledWith(/* args */);
    });

    test('should handle errors', async () => {
      // Arrange
      mockDependency.someMethod.mockRejectedValue(new Error('Test error'));

      // Act & Assert
      await expect(service.methodName({}))
        .rejects.toThrow('Expected error message');
    });
  });
});
```

## 🔍 Coverage Report Locations

- **HTML Report**: `server/coverage/lcov-report/index.html`
- **JSON Report**: `server/coverage/coverage-final.json`
- **Console Output**: Run `pnpm --filter server test:coverage`

## 📈 Weekly Goals

| Week | Target | Focus Area |
|------|--------|------------|
| 1 | 65% | Fix failing tests, basic CRUD |
| 2 | 70% | Auth & security |
| 3 | 75% | AI service mocks |
| 4 | 80% | File processing |
| 5 | 85% | Integration tests |
| 6 | 90% | Edge cases & cleanup |

## ⚡ Speed Tips

1. **Run tests in parallel**: `--maxWorkers=75%`
2. **Skip coverage in watch**: `--watch --coverage=false`
3. **Test single file**: `jest path/to/file.test.ts`
4. **Use .only for debugging**: `test.only('specific test')`
5. **Focused coverage**: `--collectCoverageFrom='src/services/**'`

## 🚫 Common Mistakes

1. **Testing implementation instead of behavior**
2. **Not testing error cases**
3. **Forgetting to test edge cases (null, undefined, empty)**
4. **Not cleaning up after tests (database, files)**
5. **Making tests dependent on execution order**

## 📞 Getting Help

- **Test failures**: Check `server/jest.setup.js` for environment setup
- **Mock issues**: See `server/tests/mocks/` for examples
- **Coverage gaps**: Run `--coverageReporters=html` for detailed view
- **Flaky tests**: Add `--runInBand` to run serially

## 🎯 Remember

> "Code without tests is broken by design" - Jacob Kaplan-Moss

Every line of untested code is a potential production bug. Prioritize testing:
1. Security-critical paths
2. Financial transactions  
3. Core business logic
4. User-facing features
5. Everything else