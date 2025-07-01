# Phase 2 Test Recovery Plan: Re-enabling Remaining Test Files

## Executive Summary

This plan outlines a systematic approach to re-enable the remaining disabled test files and bring them to production-ready status. Based on analysis of the current test state, we have identified 8 test categories that need attention, with AI services being the highest priority.

## Current Status Analysis

### Working Tests (Already Fixed)

- `materialGenerator.test.ts` - ✅ Working (stub implementation tested)
- `newsletterService.test.ts` - ✅ Working (comprehensive mocked tests)
- `llmService.test.ts` - ✅ Working (properly mocked OpenAI)
- `aiActivityGenerator.test.ts` - ✅ Working (stub implementation tested)
- `anthropicService.test.ts` - ✅ Working (stub implementation tested)
- `clusteringService.test.ts` - ✅ Working but SKIPPED (comprehensive real tests)

### Tests Needing Attention

1. `embeddingService.test.ts.disabled` - 🔄 Disabled but has comprehensive test
2. `aiParentSummaryService.test.ts` - 🔄 Working but needs real implementation
3. Various disabled integration and production tests
4. Multiple disabled comprehensive test suites

## Priority Matrix

| Priority      | Service Type      | Files                           | Complexity | Business Impact | Time Est. |
| ------------- | ----------------- | ------------------------------- | ---------- | --------------- | --------- |
| P1 - Critical | AI Services       | embeddingService                | High       | High            | 2-3 days  |
| P2 - High     | Production Tests  | \*.production.test.ts           | Medium     | High            | 3-4 days  |
| P3 - Medium   | Integration Tests | comprehensive/coverage tests    | Medium     | Medium          | 2-3 days  |
| P4 - Low      | Disabled Legacy   | auth.refactored, template tests | Low        | Low             | 1-2 days  |

## Phase 2 Implementation Strategy

### Week 1: AI Services Foundation (Priority 1)

#### Day 1-2: Embedding Service Recovery

**File:** `embeddingService.test.ts.disabled`

**Issues Identified:**

- Complex mocking of OpenAI embeddings API
- Prisma database interactions need real test database
- Similarity calculations require proper vector math

**Recovery Plan:**

```bash
# 1. Re-enable the test file
mv tests/unit/embeddingService.test.ts.disabled tests/unit/embeddingService.test.ts

# 2. Fix mocking issues
# - Update OpenAI mock to match current API
# - Set up proper Prisma test database
# - Fix import paths

# 3. Update test patterns
# - Use real test database for integration tests
# - Mock only external OpenAI API calls
# - Test with actual embeddings data
```

**Success Criteria:**

- All embedding service tests pass
- Real similarity calculations work
- Database operations tested with real data
- API error handling robust

#### Day 3: AI Parent Summary Service

**File:** `aiParentSummaryService.test.ts`

**Current State:** Working but stub implementation

**Enhancement Plan:**

- Add real LLM integration tests
- Test actual parent summary generation
- Add bilingual content validation
- Performance testing with realistic data

### Week 2: Production Test Suite (Priority 2)

#### Day 1-2: Production Integration Tests

**Files:**

- `clusteringService.production.test.ts`
- `embeddingService.production.test.ts`
- `curriculumImportService.production.test.ts`

**Recovery Strategy:**

- Enable real API calls with test API keys
- Set up production-like test environment
- Add comprehensive error handling tests
- Performance benchmarking

#### Day 3-4: Comprehensive Coverage Tests

**Files:**

- `curriculumImportService.comprehensive.test.ts`
- `reportGeneratorService.coverage.test.ts`
- `weeklyPlanExtractor.coverage.test.ts`

**Focus Areas:**

- Edge case testing
- Large data volume testing
- Memory usage validation
- Error recovery testing

### Week 3: Integration & Legacy Tests (Priority 3-4)

#### Day 1-2: Core Integration Tests

**Files:**

- `backupRoutes.test.ts.disabled`
- `connectors.test.ts.disabled`
- `discoveryServices.test.ts.disabled`

**Approach:**

- Update to current API patterns
- Fix deprecated service dependencies
- Add modern error handling

#### Day 3: Legacy Test Cleanup

**Files:**

- `auth.refactored.test.ts.disabled`
- `templateService.test.ts.disabled`
- `plannerStateValidation.test.ts.disabled`

**Strategy:**

- Evaluate if tests are still needed
- Migrate to current patterns or remove
- Document deprecation decisions

## Common Patterns for All Test Recovery

### 1. Mocking Strategy

```typescript
// ✅ CORRECT: Mock only external dependencies
jest.mock('openai');
jest.mock('@aws-sdk/client-s3');

// ✅ CORRECT: Use real database for integration tests
const testDb = new PrismaClient({
  datasources: { db: { url: process.env.TEST_DATABASE_URL } },
});

// ❌ INCORRECT: Don't mock internal services
// jest.mock('../../src/services/embeddingService');
```

### 2. Environment Setup

```typescript
// Test environment configuration
beforeAll(async () => {
  // Set up test database
  await setupTestDatabase();

  // Configure test API keys (mock or real test keys)
  process.env.OPENAI_API_KEY = process.env.TEST_OPENAI_API_KEY || 'test-key';

  // Initialize services with test configuration
  await initializeTestServices();
});
```

### 3. Error Handling Patterns

```typescript
// Test real error scenarios
it('should handle API rate limiting', async () => {
  // Mock rate limit error
  mockOpenAI.embeddings.create.mockRejectedValue(new Error('Rate limit exceeded'));

  // Test retry logic works
  const result = await service.generateEmbedding('test');
  expect(result).toBeDefined(); // Should succeed after retries
});
```

## API Key Management for AI Tests

### Test Environment Setup

```bash
# Development/Test API Keys (use minimal quotas)
TEST_OPENAI_API_KEY=sk-test-...
TEST_ANTHROPIC_API_KEY=sk-ant-test-...

# Production Integration Tests (use real but limited keys)
PROD_TEST_OPENAI_API_KEY=sk-prod-test-...
PROD_TEST_ANTHROPIC_API_KEY=sk-ant-prod-test-...
```

### Test Categories by API Usage

1. **Unit Tests**: Fully mocked, no real API calls
2. **Integration Tests**: Real API calls with test keys
3. **Production Tests**: Real API calls with production-like keys
4. **Performance Tests**: Real API calls with rate limiting

## Quality Gates

### Phase 2 Completion Criteria

- [ ] All disabled tests re-enabled and passing
- [ ] 95%+ test coverage maintained
- [ ] All tests complete in <10 minutes total
- [ ] No flaky or intermittent failures
- [ ] Real-world error scenarios covered
- [ ] Performance baselines established

### Per-Test-File Success Criteria

- [ ] All test cases pass consistently (3+ runs)
- [ ] Real functionality tested, not just stubs
- [ ] Error conditions properly handled
- [ ] Performance within acceptable bounds
- [ ] No memory leaks or resource cleanup issues

## Risk Mitigation

### High-Risk Areas

1. **AI API Rate Limits**: Implement proper retry logic and backoff
2. **Database State**: Ensure proper cleanup between tests
3. **Async Operations**: Handle timing issues and race conditions
4. **Memory Usage**: Monitor for leaks in large data tests

### Rollback Strategy

- Keep `.disabled` backups until 1 week after successful re-enabling
- Feature flags for problematic tests
- Gradual rollout: unit → integration → production tests

## Timeline Summary

| Week | Focus                | Deliverables                    | Success Metrics             |
| ---- | -------------------- | ------------------------------- | --------------------------- |
| 1    | AI Services          | Embedding service, AI summaries | 2 major services working    |
| 2    | Production Tests     | Real API integration            | Production-ready test suite |
| 3    | Integration & Legacy | Remaining disabled tests        | 100% test enablement        |

**Total Timeline:** 3 weeks
**Resources Required:** 1 senior developer full-time
**Dependencies:** Test database setup, API key access

## Next Steps

1. **Immediate (This Week)**:
   - Set up test API keys for AI services
   - Configure test database for real integration tests
   - Start with embeddingService.test.ts recovery

2. **Week 1 Deliverables**:
   - Embedding service fully tested with real functionality
   - AI parent summary service enhanced beyond stubs
   - Document patterns for other team members

3. **Ongoing**:
   - Daily test runs to catch regressions
   - Performance monitoring for AI service tests
   - Documentation updates for test patterns

This plan ensures systematic recovery of all disabled tests while maintaining code quality and establishing patterns for future AI service testing.
