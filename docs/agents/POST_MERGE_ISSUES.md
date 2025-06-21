# Post-Merge Issues and Deferred Fixes

This document captures issues identified during the merge of all agent PRs that require attention but were outside the scope of the merge task.

## Date: 2025-01-21

### 1. Jest Module Resolution in CI

**Issue**: Jest setup files in the server use CommonJS require() but tests expect ESM imports
**Location**: `server/jest.setup.js`
**Impact**: May cause CI failures
**Recommended Fix**:

- Convert jest.setup.js to use ESM imports consistently
- Update Jest configuration to properly handle ESM modules
- Add proper setupFilesAfterEnv configuration

### 2. OpenAI API Key Management

**Issue**: Tests require OPENAI_API_KEY even when mocked
**Current Workaround**: Added dummy key to `.env.test`
**Recommended Fix**:

- Implement proper environment variable handling for tests
- Consider using a test configuration that doesn't require API keys
- Add documentation about required environment variables for testing

### 3. Service Registry Type Mismatch

**Issue**: NotificationService doesn't extend BaseService but service registry expects it
**Current Workaround**: Removed NotificationService from service registry
**Recommended Fix**:

- Either make NotificationService extend BaseService
- Or create a separate registry for non-BaseService services
- Update service initialization documentation

### 4. Duplicate Test Mock Properties

**Issue**: TanStack Query mock objects had duplicate `isLoading` properties
**Fixed**: Removed duplicates during merge
**Recommendation**:

- Create shared test utilities for consistent query mocks
- Add linting rule to catch duplicate object properties

### 5. Contract Tests Mixed with E2E Tests

**Issue**: Vitest contract tests in `/tests/contract/` were being picked up by Playwright
**Fixed**: Added `testMatch` pattern to playwright.config.ts
**Recommendation**:

- Reorganize test structure to clearly separate:
  - Unit tests (Vitest)
  - Integration tests (Vitest)
  - Contract tests (Vitest)
  - E2E tests (Playwright)

### 6. Missing Prisma Schema Documentation

**Issue**: Multiple agents added new models without documenting relationships
**Models affected**:

- CurriculumImport
- SmartMaterial
- ParentContact
- ParentMessage
- ImportedOutcome
  **Recommendation**: Add comprehensive schema documentation

### 7. Inconsistent Error Handling

**Issue**: Different agents implemented error handling differently
**Examples**:

- Some use try/catch with logger
- Some throw directly
- Some return error objects
  **Recommendation**: Establish and document error handling standards

### 8. Test Database Cleanup

**Issue**: Some tests don't properly clean up test data
**Impact**: Tests may fail when run in sequence
**Recommendation**:

- Implement consistent beforeEach/afterEach cleanup
- Use database transactions for test isolation

### 9. API Route Naming Inconsistencies

**Issue**: Different naming conventions across agent implementations
**Examples**:

- `/api/curriculum-import` vs `/api/curriculumImport`
- `/api/parent-messages` vs `/api/parentMessages`
  **Recommendation**: Standardize on one naming convention (kebab-case recommended)

### 10. Missing Integration Tests

**Issue**: New features lack comprehensive integration tests
**Affected features**:

- AI curriculum import workflow
- Parent communication system
- Analytics dashboard
  **Recommendation**: Add integration tests for critical user workflows

## Action Items

1. **High Priority**:

   - Fix Jest ESM configuration for CI
   - Add missing integration tests
   - Standardize error handling

2. **Medium Priority**:

   - Document Prisma schema relationships
   - Create shared test utilities
   - Standardize API naming conventions

3. **Low Priority**:
   - Reorganize test directory structure
   - Add environment variable documentation
   - Implement database transaction testing

## Notes for Future Merges

1. Agents should coordinate on shared resources (schema, routes, services)
2. Each agent should follow established patterns for error handling and testing
3. Contract tests should be clearly separated from E2E tests
4. All new models should include relationship documentation
5. API routes should follow consistent naming conventions

---

_This document should be reviewed by the team lead and converted into actionable tickets._
