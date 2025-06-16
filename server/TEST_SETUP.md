# Test Environment Setup

This document explains how the test environment is configured to work consistently between local development and CI.

## Overview

We use a hybrid approach that provides consistency while maintaining flexibility:

1. **jest.setup.js** - Sets default environment variables for all tests
2. **CI workflow** - Explicitly sets the same environment variables in CI
3. **Individual tests** - Can override defaults when needed (e.g., for mocking)

## Environment Variables

The following environment variables are set by default in `jest.setup.js`:

- `NODE_ENV=test`
- `DATABASE_URL=file:../packages/database/prisma/test.db` (default, can be overridden)
- `JWT_SECRET=test-secret-key`
- `JWT_EXPIRES_IN=1h`
- `IS_CI=true/false` (detects CI environment)

## CI Configuration

The CI workflow (`.github/workflows/ci.yml`) explicitly sets the same environment variables to ensure consistency:

```yaml
env:
  DATABASE_URL: file:./test.db
  JWT_SECRET: test-secret-key
  JWT_EXPIRES_IN: 1h
```

## Test-Specific Overrides

Some tests may need to set `DATABASE_URL` before imports to prevent Prisma initialization errors when using mocks:

```javascript
// Set DATABASE_URL for test environment to avoid Prisma initialization errors
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';
```

This is necessary because Prisma validates the DATABASE_URL when the module is imported, even if the client will be mocked.

## Best Practices

1. **Use jest.setup.js defaults** - Most tests should rely on the default configuration
2. **Mock Prisma when possible** - To avoid database dependencies in unit tests
3. **Be explicit in CI** - Set all required environment variables in the CI workflow
4. **Document overrides** - If a test needs special configuration, document why

## Troubleshooting

### Test passes locally but fails in CI

- Check if DATABASE_URL is set correctly in both environments
- Verify that all required environment variables are set in CI
- Look for timing or race condition issues

### Prisma initialization errors

- Ensure DATABASE_URL is set before importing modules that use Prisma
- Check that mocks are defined before imports
- Verify the database file path is correct for the environment
