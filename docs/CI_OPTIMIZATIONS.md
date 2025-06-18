# CI-Specific Playwright Optimizations

This document outlines the CI-specific optimizations implemented in our Playwright configuration to improve test stability and reliability in CI environments.

## Configuration Optimizations

### 1. Increased Timeouts

- **Action Timeout**: 45s in CI vs 30s locally
- **Navigation Timeout**: 90s in CI vs 60s locally
- **Expect Timeout**: 30s in CI vs 15s locally
- **Test Timeout**: 3 minutes in CI vs 2 minutes locally
- **Global Timeout**: 30 minutes for entire test run in CI

### 2. Enhanced Error Reporting

- **Screenshots**: Always captured in CI (`on` vs `only-on-failure`)
- **Traces**: Retained on failure (`retain-on-failure`)
- **Videos**: Retained on failure with dedicated directory
- **JUnit Reporter**: Added for CI integration
- **GitHub Reporter**: Added for GitHub Actions annotations

### 3. Stability Features

- **Retries**: 2 retries in CI vs 0 locally
- **Workers**: Single worker (serial execution) in CI
- **Slow Motion**: 100ms delay between actions in CI
- **Animations**: Disabled for consistent visual testing
- **HTTPS Errors**: Ignored in CI environments

### 4. Browser Launch Options

- `--disable-blink-features=AutomationControlled`: Prevents detection of automation
- `--disable-dev-shm-usage`: Prevents shared memory issues in containers
- `reducedMotion: 'reduce'`: Reduces animations in browser

### 5. Test Organization

- **Forbid Only**: Prevents accidental `.only` tests in CI
- **Shard Support**: Allows splitting tests across multiple CI jobs
- **No Global Setup**: Servers managed manually in CI

## CI Stability Helpers

The `tests/e2e/helpers/ci-stability.ts` module provides additional helpers:

### Functions

- `waitForNetworkIdle()`: CI-aware network idle waiting
- `clickWithRetry()`: Retry logic for click actions
- `fillWithRetry()`: Retry logic for form fills
- `waitForElement()`: CI-specific element waiting
- `navigateWithRetry()`: Navigation with automatic retries
- `waitForAPI()`: API response waiting with CI timeouts
- `ciDelay()`: Add delays only in CI
- `debugCI()`: CI-specific debug logging
- `takeDebugScreenshot()`: Debug screenshots in CI

## Usage in Tests

```typescript
import { test } from '@playwright/test';
import { clickWithRetry, waitForNetworkIdle, navigateWithRetry } from './helpers/ci-stability';

test('example test', async ({ page }) => {
  // Navigate with retry in CI
  await navigateWithRetry(page, '/login');

  // Wait for network to settle
  await waitForNetworkIdle(page);

  // Click with retry logic
  await clickWithRetry(page.locator('button[type="submit"]'));
});
```

## Environment Variables

The configuration responds to these environment variables:

- `CI`: Activates all CI-specific optimizations
- `SHARD`: Enables test sharding
- `SHARD_INDEX`: Current shard number
- `TOTAL_SHARDS`: Total number of shards

## Best Practices for CI

1. **Use stability helpers** for critical actions
2. **Add explicit waits** for dynamic content
3. **Avoid time-based waits** in favor of condition-based waits
4. **Use data-testid** attributes for reliable selectors
5. **Mock external services** when possible
6. **Keep tests independent** and idempotent

## Debugging CI Failures

When tests fail in CI:

1. Check the **playwright-report** artifact
2. Review **video recordings** of failures
3. Examine **trace files** for detailed execution
4. Look for **screenshots** at failure points
5. Check **JUnit XML** for structured error data

## Future Improvements

- [ ] Implement automatic retry for flaky tests
- [ ] Add performance monitoring
- [ ] Create CI-specific test fixtures
- [ ] Add network condition simulation
- [ ] Implement test result caching
