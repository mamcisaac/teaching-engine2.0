# Integration Test Setup Implementation Guide

This document outlines the comprehensive integration test fixes implemented following Agent 4's systematic plan to resolve database client initialization issues.

## Changes Implemented

### 1. Unified Integration Test Setup (Phase 1)

**File Created**: `/server/tests/integration-test-setup.ts`

**Purpose**: 
- Provides unified setup specifically for integration tests
- Eliminates per-test transactions that caused data isolation issues
- Ensures proper database client initialization and lifecycle management

**Key Features**:
- **No per-test transactions**: Data persists within test suites for proper integration testing
- **Proper client initialization**: Validates database client has expected models before use
- **Manual cleanup**: Provides `cleanIntegrationTestData()` for test data cleanup
- **Error handling**: Comprehensive error logging and client validation
- **Database health checks**: Ensures database is healthy before tests run

### 2. Jest Configuration Updates (Phase 2)

**File Modified**: `/server/jest.config.js`

**Changes**:
- Updated integration test project to use `integration-test-setup.ts` instead of `jest.setup.ts`
- Removed transaction-based setup that was incompatible with integration test needs
- Maintained separation between unit test setup (with mocks) and integration test setup (real database)

### 3. Integration Test Import Updates (Phase 4)

**Files Updated**:
- `/server/tests/integration/auth-routes.test.ts`
- `/server/tests/integration/curriculum-routes.test.ts` 
- `/server/tests/integration/lesson-routes.test.ts`

**Changes**:
- Replaced `getTestPrismaClient` from `jest.setup` with `getIntegrationTestPrismaClient` from `integration-test-setup`
- Updated database cleanup to use unified `cleanIntegrationTestData()` helper
- Fixed model schema mismatches (e.g., removed non-existent `curriculumStrand` model references)

### 4. Database Client Management Improvements

**Key Fixes**:
- **Client Validation**: Added checks to ensure Prisma client has expected models before use
- **Graceful Fallbacks**: Cleanup functions only attempt to clean tables that exist on the client
- **Better Error Messages**: Enhanced error logging with available client properties for debugging

## Root Causes Resolved

### 1. Import/Export Mismatch ✅
- **Problem**: Integration tests importing from wrong setup files with incompatible lifecycle
- **Solution**: Created dedicated `integration-test-setup.ts` with appropriate lifecycle for integration tests

### 2. Configuration Misalignment ✅
- **Problem**: Jest configuration using unit test setup for integration tests
- **Solution**: Updated Jest config to use correct setup file for each test type

### 3. Client Management Issues ✅
- **Problem**: Multiple conflicting client strategies causing undefined properties
- **Solution**: Unified client management with proper validation and error handling

### 4. Database Setup Sequence ✅
- **Problem**: Timing issues in database initialization
- **Solution**: Added health checks and proper initialization sequence with validation

## Usage Guidelines

### For Integration Tests

```typescript
import { getIntegrationTestPrismaClient, cleanIntegrationTestData } from '../integration-test-setup';

describe('Your Integration Test', () => {
  let prisma: ReturnType<typeof getIntegrationTestPrismaClient>;

  beforeAll(async () => {
    prisma = getIntegrationTestPrismaClient();
  });

  beforeEach(async () => {
    // Clean data between tests if needed
    await cleanIntegrationTestData();
  });

  // Your tests here...
});
```

### Key Differences from Unit Tests

| Aspect | Unit Tests | Integration Tests |
|--------|------------|-------------------|
| Setup File | `jest.setup.ts` | `integration-test-setup.ts` |
| Database | Mocked | Real SQLite |
| Transactions | Per-test rollback | Manual cleanup |
| Client Function | `getTestPrismaClient()` | `getIntegrationTestPrismaClient()` |
| Data Persistence | No (rolled back) | Yes (within describe blocks) |

## Validation Results

- ✅ **No more "Cannot read properties of undefined" errors**
- ✅ **Database client properly initialized**
- ✅ **Test isolation working correctly**
- ✅ **Multiple integration test files working**
- ✅ **Proper cleanup between test suites**

## Next Steps for Agent 6

1. **Review remaining integration test files** for any that still use old import patterns
2. **Add additional model cleanup** to `cleanIntegrationTestData()` as needed for new tests
3. **Monitor test performance** - integration tests are slower than unit tests due to real database operations
4. **Consider test data factories** for common test scenarios to reduce boilerplate

## Troubleshooting

### Common Issues and Solutions

**Error: "Integration test client not initialized"**
- Ensure test file imports from `integration-test-setup`
- Check that `beforeAll` calls `getIntegrationTestPrismaClient()`

**Error: "Cannot read properties of undefined (reading 'deleteMany')"**
- Check if the model exists in the current database schema
- Update `cleanIntegrationTestData()` to include the missing model

**Tests hanging or timing out**
- Check database health with `isIntegrationTestDatabaseHealthy()`
- Verify no open database connections or transactions

**Data pollution between tests**
- Call `cleanIntegrationTestData()` in `beforeEach`
- Check test cleanup is comprehensive for all models used

## Performance Notes

- Integration tests run with `maxWorkers: 2` to limit database contention
- Each worker gets its own SQLite database file
- Tests should complete within 30-second timeout
- Use `executeWithRetry()` for operations that might fail due to database locks