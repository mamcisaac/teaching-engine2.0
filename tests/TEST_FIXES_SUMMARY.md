# Test Suite Fixes Summary

## Date: 2025-07-03

This document summarizes the fixes applied to resolve test failures in the Teaching Engine 2.0 codebase.

## 1. E2E Smoke Test Failures

### Issue

- Smoke tests were failing with "Route POST /api/register not found" error
- The test was using incorrect API endpoint path

### Fix

- Updated the registration endpoint from `/api/register` to `/api/auth/register` in `tests/e2e/smoke-simple.spec.ts`
- The auth routes are mounted at `/api/auth` in the Express app

### Additional Issues Found

- Server connection issues during test runs due to concurrent processes
- Tailwind CSS dependency was missing in the client package

## 2. Visual Regression Test Failures

### Issue

- Visual regression tests were failing with "Cannot find module './tests/visual/global-setup.ts'"
- Missing required setup and teardown files for visual tests

### Fixes

- Created `tests/visual/global-setup.ts` to prepare visual testing environment
- Created `tests/visual/global-teardown.ts` to clean up after visual tests
- Fixed incorrect paths in `playwright-visual.config.ts`:
  - Changed `testDir` from `'./tests/visual'` to `'.'`
  - Updated globalSetup/globalTeardown paths to relative paths

### Features Added

- Automatic creation of necessary directories for visual test results
- Environment variable setup for consistent visual testing
- Post-test reporting of failed visual tests

## 3. Performance Test Database Setup Issues

### Issue

- Performance tests were using incorrect `timeout` property in fetch API calls
- This was causing errors in `measureServerStartupTime` and `measureDatabaseConnection` functions

### Fix

- Replaced invalid `timeout` property with proper AbortController implementation
- Added proper signal handling and timeout cleanup
- Updated both measurement functions in `tests/performance/global-setup.ts`

## Running the Test Suites

### E2E Tests

```bash
# Run all E2E tests
pnpm -w run test:e2e

# Run only smoke tests
pnpm -w run test:e2e:smoke
```

### Visual Regression Tests

```bash
# Run visual tests
pnpm -w run test:visual

# Update baseline screenshots
pnpm -w run test:visual:update
```

### Performance Tests

```bash
# Run performance test suite
pnpm -w run test:performance

# Quick performance check
pnpm -w run test:performance:quick
```

## Verification Steps

1. Ensure dev servers are not running before tests:

   ```bash
   pkill -f "node" || true
   ```

2. Install all dependencies:

   ```bash
   pnpm install
   ```

3. Run each test suite individually to verify fixes:
   ```bash
   pnpm -w run test:e2e:smoke
   pnpm -w run test:visual
   pnpm -w run test:performance
   ```

## Known Issues

- E2E tests may timeout on first run while servers are starting up
- Visual tests require baseline screenshots to be generated on first run
- Performance tests need the backend server to be running

## Recommendations

1. Consider adding a pre-test script that ensures servers are ready before running tests
2. Add retry logic to handle intermittent connection issues
3. Document required environment variables for test execution
4. Consider using a test database separate from development database
