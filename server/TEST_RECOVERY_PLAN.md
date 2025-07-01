# Test Recovery Plan - Teaching Engine 2.0 Server

## Executive Summary

Found **15 disabled test files** in the server directory, with an additional **26 active test files containing skipped tests**. These disabled tests represent critical functionality including authentication, curriculum import, AI services, and core infrastructure.

## Disabled Test Files Inventory

### 1. Unit Tests (12 files)

- `auth.refactored.test.ts.disabled` - Authentication service refactored tests
- `connectors.test.ts.disabled` - Database/API connector tests
- `curriculumImportService.test.ts.disabled` - Curriculum import functionality
- `curriculumImportService.coverage.test.ts.disabled` - Additional coverage for curriculum import
- `discoveryServices.test.ts.disabled` - Resource discovery service tests
- `embeddingService.test.ts.disabled` - AI embedding service tests
- `materialGenerator.unit.test.ts.disabled` - Material generation unit tests
- `notificationService.test.ts.disabled` - Notification system tests
- `plannerStateValidation.test.ts.disabled` - Planner state validation tests
- `reportGeneratorService.coverage.test.ts.disabled` - Report generation coverage tests
- `scenarioTemplateExtractor.unit.test.ts.disabled` - Template extraction unit tests
- `templateService.test.ts.disabled` - Template service tests
- `weeklyPlanExtractor.coverage.test.ts.disabled` - Weekly plan extraction coverage
- `workflowStateService.test.ts.disabled` - Workflow state management tests

### 2. Integration Tests (1 file)

- `backupRoutes.test.ts.disabled` - Backup API routes integration tests

## Test Categories Analysis

### AI/ML Services (4 files)

- `embeddingService.test.ts.disabled`
- `curriculumImportService.test.ts.disabled` (uses AI for parsing)
- `scenarioTemplateExtractor.unit.test.ts.disabled`
- `materialGenerator.unit.test.ts.disabled`

**Common Issue**: Mock configuration for OpenAI and embedding services

### Core Infrastructure (3 files)

- `auth.refactored.test.ts.disabled`
- `connectors.test.ts.disabled`
- `workflowStateService.test.ts.disabled`

**Common Issue**: Database mock/prisma configuration issues

### Business Logic Services (6 files)

- `discoveryServices.test.ts.disabled`
- `notificationService.test.ts.disabled`
- `plannerStateValidation.test.ts.disabled`
- `reportGeneratorService.coverage.test.ts.disabled`
- `templateService.test.ts.disabled`
- `weeklyPlanExtractor.coverage.test.ts.disabled`

**Common Issue**: Complex dependency chains and mock setup

### API/Routes (1 file)

- `backupRoutes.test.ts.disabled`

**Common Issue**: Express route testing setup

## Recovery Priority Levels

### Priority 1: Core Infrastructure (Critical Path)

1. **auth.refactored.test.ts.disabled** - Authentication is fundamental
2. **connectors.test.ts.disabled** - Database connectivity is essential
3. **workflowStateService.test.ts.disabled** - State management is core functionality

### Priority 2: Business Critical Features

4. **curriculumImportService.test.ts.disabled** - Key teacher feature
5. **notificationService.test.ts.disabled** - User communication
6. **plannerStateValidation.test.ts.disabled** - Data integrity

### Priority 3: AI/Advanced Features

7. **embeddingService.test.ts.disabled** - AI functionality
8. **materialGenerator.unit.test.ts.disabled** - Content generation
9. **scenarioTemplateExtractor.unit.test.ts.disabled** - Template extraction

### Priority 4: Additional Coverage

10. **curriculumImportService.coverage.test.ts.disabled**
11. **reportGeneratorService.coverage.test.ts.disabled**
12. **weeklyPlanExtractor.coverage.test.ts.disabled**
13. **templateService.test.ts.disabled**
14. **discoveryServices.test.ts.disabled**
15. **backupRoutes.test.ts.disabled**

## Common Patterns for Fix

### 1. Mock Configuration Issues

Most disabled tests fail due to improper mock setup. The current `jest.config.js` shows comprehensive mock configuration:

```javascript
moduleNameMapper: {
  '^openai$': '<rootDir>/src/__mocks__/openai.js',
  '^@teaching-engine/database$': '<rootDir>/tests/mocks/database.mock.ts',
  // ... other mocks
}
```

### 2. Import Path Resolution

Many tests use relative imports that need proper resolution:

- `../../src/prisma` → Should use mock
- `../../src/services/*` → Need proper path mapping

### 3. Test Environment Setup

Tests need proper setup files:

- Unit tests: `<rootDir>/tests/setup-all-mocks.ts`
- Integration tests: `<rootDir>/tests/integration-test-setup.ts`

## Batch Fix Strategy

### Phase 1: Infrastructure Setup (Days 1-2)

1. Verify all mock files exist:
   - `/src/__mocks__/openai.js`
   - `/tests/mocks/database.mock.ts`
   - `/tests/mocks/canvas.mock.ts`
   - `/tests/mocks/pdfkit.mock.ts`
   - `/tests/mocks/uuid.mock.ts`

2. Create missing setup files:
   - `/tests/setup-all-mocks.ts`
   - `/tests/integration-test-setup.ts`

### Phase 2: Core Services (Days 3-4)

3. Re-enable auth tests:
   - Update import paths
   - Fix JWT mock configuration
   - Add proper test database setup

4. Re-enable database connector tests:
   - Ensure Prisma mock is properly configured
   - Test with real test database for integration

### Phase 3: Business Logic (Days 5-6)

5. Re-enable service tests in order:
   - Start with services that have no dependencies
   - Progress to services with dependencies on fixed services
   - Use working services as templates

### Phase 4: AI Services (Days 7-8)

6. Re-enable AI-related tests:
   - Configure OpenAI mocks properly
   - Consider using snapshot testing for AI outputs
   - Add proper embedding mock responses

### Phase 5: Coverage & Routes (Days 9-10)

7. Re-enable coverage tests and route tests:
   - These should work once base services are fixed
   - Update route testing patterns to match current Express setup

## Implementation Commands

```bash
# Step 1: Check mock files exist
ls -la src/__mocks__/
ls -la tests/mocks/

# Step 2: Re-enable a test file
mv tests/unit/auth.refactored.test.ts.disabled tests/unit/auth.refactored.test.ts

# Step 3: Run specific test
pnpm test:unit -- auth.refactored.test.ts

# Step 4: Debug test issues
pnpm test:debug -- auth.refactored.test.ts

# Step 5: Run with coverage once fixed
pnpm test:coverage -- auth.refactored.test.ts
```

## Success Metrics

- **Phase 1 Complete**: All mock files verified/created, setup files in place
- **Phase 2 Complete**: Auth and database tests passing
- **Phase 3 Complete**: 50% of service tests re-enabled
- **Phase 4 Complete**: AI service tests working with mocks
- **Phase 5 Complete**: All tests re-enabled, coverage > 90%

## Risk Mitigation

1. **Create backups** before re-enabling: `git stash` or branch
2. **Test incrementally**: Re-enable one file at a time
3. **Document fixes**: Update this plan with solutions found
4. **Share patterns**: Create fix templates for common issues

## Next Steps

1. Verify current test infrastructure works: `pnpm test:unit`
2. Check all required mock files exist
3. Start with Priority 1 tests
4. Document each fix for pattern recognition
5. Create automated re-enabling script if patterns emerge
