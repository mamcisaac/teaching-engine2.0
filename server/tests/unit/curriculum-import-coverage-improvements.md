# Curriculum Import Coverage Improvements

## Current State
- Overall coverage: ~9.69% (needs improvement)
- Curriculum Import Service: ~85% (good but needs boost to 90%)

## Priority Improvements Needed

### 1. Add Missing Test Files
```bash
# Create these test files to improve coverage:
tests/unit/services/curriculumImportService.full.test.ts
tests/integration/curriculum-file-upload.test.ts
tests/performance/curriculum-import-load.test.ts
```

### 2. Test Missing Methods
The following methods need test coverage:

```typescript
// In curriculumImportService.ts
- detectLanguage()
- determineExpectationType()
- chunkText()
- parseTextWithAI() // Currently mocked, needs real test
- processFile() // File upload handling
- validateImportData()
```

### 3. Integration Test Gaps
```typescript
// Add these integration tests:
- Real PDF file parsing with fixtures
- Real DOCX file parsing with fixtures
- Large file upload scenarios (>10MB)
- Concurrent import handling
- Import cancellation mid-process
- Import resume after failure
```

### 4. Edge Cases to Add
```typescript
describe('Additional Edge Cases', () => {
  it('should handle curriculum with 1000+ expectations')
  it('should handle files with mixed encodings')
  it('should handle curriculum in multiple languages')
  it('should handle network interruption during upload')
  it('should handle database connection loss during import')
  it('should handle AI service unavailability')
});
```

### 5. Performance Tests
```typescript
describe('Performance Benchmarks', () => {
  it('should import 10,000 expectations in under 30 seconds')
  it('should handle 100MB CSV file')
  it('should process 50 concurrent imports')
  it('should maintain <500ms response time under load')
});
```

## Quick Wins for Coverage

### 1. Test All Error Paths
```typescript
// Add tests for every throw statement
it('should throw when import not found')
it('should throw when user unauthorized')
it('should throw when file too large')
it('should throw when invalid file type')
```

### 2. Test All Branches
```typescript
// Ensure all if/else branches are covered
it('should handle both French and English content')
it('should handle with and without OpenAI')
it('should handle all import status transitions')
```

### 3. Test Private Methods
```typescript
// Use reflection to test private methods
const privateMethod = (service as any).methodName;
expect(privateMethod(args)).toBe(expected);
```

## Coverage Target Achievement Plan

1. **Run coverage report**: `pnpm test:coverage`
2. **Identify gaps**: Look for red lines in coverage report
3. **Write targeted tests**: Focus on uncovered lines
4. **Iterate**: Run coverage again until 90%+ achieved

## Estimated Effort
- 2-3 hours to reach 90% coverage
- Focus on high-impact areas first
- Use production validation test as template

## Command to Run All Tests
```bash
# Run with coverage
pnpm test -- --coverage --testPathPattern="curriculum"

# Run specific test file
pnpm test -- tests/unit/curriculumImportService.production.test.ts --coverage

# Generate HTML coverage report
pnpm test -- --coverage --coverageReporters=html
```