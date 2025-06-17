# Test Reliability & Execution Guide

This document outlines the comprehensive test reliability improvements implemented for the Teaching Engine server.

## Overview

The test suite has been enhanced with:
- **Automatic retries** for flaky tests
- **Pre-test data validation** to ensure consistent test environment
- **Performance monitoring** to identify slow tests
- **Comprehensive reporting** with HTML/JSON/JUnit outputs
- **Coverage thresholds** enforced per module
- **Parallel execution optimization** with proper test isolation

## Key Features

### 1. No More Conditional Test Execution

Previously, tests would skip if data wasn't available:
```typescript
// ❌ OLD: Conditional execution
if (!outcome) {
  console.warn('No outcomes found in database.');
  return;
}
```

Now, all tests have guaranteed data:
```typescript
// ✅ NEW: Always available test data
beforeAll(async () => {
  // Import test curriculum data
  const testOutcomes = getAllTestOutcomes();
  // Data is always created, tests always run
});
```

### 2. Automatic Test Retries

Flaky tests are automatically retried with exponential backoff:
- **Local**: 2 retries max
- **CI**: 3 retries max
- Only retries on specific errors (SQLITE_BUSY, network timeouts)
- Tracks which tests needed retries for analysis

### 3. Test Data Management

#### Guaranteed Test Data
- `curriculum-test-data.ts`: Provides consistent test outcomes
- Always creates minimum required data (55+ French outcomes)
- Validates all data before insertion

#### Data Isolation
- Each test runs in a transaction/savepoint
- Automatic rollback after each test
- No test contamination

### 4. Performance Monitoring

Tests are monitored for performance issues:
- Tracks execution time for each test
- Identifies consistently slow tests
- Reports top 10 slowest tests
- Warns when tests exceed 5-second threshold

### 5. Comprehensive Test Reporting

Multiple report formats generated:
- **Console**: Real-time progress and summary
- **HTML**: Visual report with charts and tables
- **JSON**: Machine-readable for CI integration
- **JUnit XML**: Compatible with CI tools

Reports include:
- Pass/fail/skip counts
- Failure reasons
- Flaky test identification
- Performance metrics
- Memory usage

### 6. Coverage Thresholds

Enforced coverage requirements:
```javascript
// Global thresholds
global: {
  branches: 70%,
  functions: 75%,
  lines: 80%,
  statements: 80%
}

// Higher thresholds for critical code
services: { branches: 80%, functions: 85%, lines: 85% }
validation: { branches: 90%, functions: 90%, lines: 90% }
```

### 7. Test Environment Setup

#### Setup Script (`pnpm test:setup`)
- Verifies Node.js version (≥18)
- Sets up test database with migrations
- Seeds consistent test data
- Optimizes SQLite for testing (WAL mode, etc.)

#### Validation Script (`pnpm test:validate`)
- Checks all prerequisites
- Verifies database schema
- Validates test data presence
- Reports disk space and memory
- Non-zero exit on failures

### 8. Optimized Test Execution

#### Smart Test Sequencing
- Critical tests (auth, security) run first
- Tests grouped by feature for cache efficiency
- Faster tests prioritized for quick feedback
- Dependencies respected (auth before integration)

#### Parallel Execution
- Automatic worker count optimization
- CI limited to 2 workers for stability
- Each worker gets isolated database
- Load balancing across workers

## Usage

### Running Tests

```bash
# Standard test run
pnpm test

# With coverage
pnpm test:coverage

# CI mode (with validation and reporting)
pnpm test:ci

# Performance analysis
pnpm test:performance

# Debug mode (verbose output)
pnpm test:debug
```

### Setting Up Test Environment

```bash
# Full setup (clean + seed)
pnpm test:setup

# Setup without cleaning
pnpm test:setup --no-clean

# Setup without seeding
pnpm test:setup --no-seed

# CI setup (optimized)
pnpm test:setup --ci
```

### Validating Environment

```bash
# Run validation
pnpm test:validate

# Returns 0 if valid, 1 if issues found
```

## Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=file:./test.db
JWT_SECRET=test-secret-key

# Optional
JWT_EXPIRES_IN=1h
TEST_PERFORMANCE=true    # Enable performance tracking
COVERAGE=true           # Enable coverage collection
CI=true                 # CI mode (more retries, less parallelism)
```

### Jest Configuration

The `jest.config.ts` includes:
- TypeScript support with ts-jest
- ESM module support
- Custom test sequencer
- Retry mechanism
- Coverage thresholds
- Custom reporter

## Monitoring & Debugging

### Test Reports

After test runs, check:
- `test-results/test-report.html` - Visual report
- `test-results/test-report.json` - Raw data
- `test-results/junit.xml` - CI integration
- `coverage/lcov-report/index.html` - Coverage report

### Identifying Issues

#### Slow Tests
```bash
# Run performance analysis
pnpm test:performance

# Check report for slow tests
cat test-results/test-report.json | jq '.performance.slowestTests'
```

#### Flaky Tests
```bash
# Report shows tests that required retries
cat test-results/test-report.json | jq '.flaky'
```

#### Failed Tests
```bash
# Detailed failure reasons in reports
cat test-results/test-report.json | jq '.failures'
```

## Best Practices

### Writing Reliable Tests

1. **Always use test data helpers**
   ```typescript
   import { generateTestEmail, getAllTestOutcomes } from './test-data';
   ```

2. **Avoid hardcoded waits**
   ```typescript
   // ❌ Bad
   await new Promise(resolve => setTimeout(resolve, 5000));
   
   // ✅ Good
   await waitForCondition(() => someCondition, { timeout: 5000 });
   ```

3. **Clean up after tests**
   ```typescript
   afterEach(async () => {
     // Cleanup is automatic with transactions
     // But clean up external resources if used
   });
   ```

4. **Use descriptive test names**
   ```typescript
   it('should validate email format and reject invalid addresses', ...)
   ```

### Debugging Failed Tests

1. **Run single test in debug mode**
   ```bash
   DEBUG_TESTS=true pnpm test -- --testNamePattern="test name"
   ```

2. **Check test isolation**
   ```bash
   # Run test alone
   pnpm test -- path/to/test.ts
   
   # Run with others to check for interference
   pnpm test
   ```

3. **Examine retry behavior**
   - Check console output for "Retrying test" messages
   - Review flaky test report
   - Consider if test has race conditions

## Maintenance

### Updating Test Data

1. Edit `tests/test-data/curriculum-test-data.ts`
2. Run validation: `pnpm test:validate`
3. Update affected tests
4. Commit changes

### Adding New Test Scripts

1. Create script in `scripts/`
2. Add npm script to `package.json`
3. Update CI workflow if needed
4. Document in this file

### Monitoring CI Performance

1. Check GitHub Actions artifacts for test reports
2. Monitor trends in test duration
3. Review flaky test patterns
4. Adjust retry counts if needed

## Troubleshooting

### Common Issues

#### "No test data found"
```bash
pnpm test:setup
```

#### "Database locked" errors
- Increase busy timeout in test setup
- Check for hanging test processes
- Reduce parallel workers: `pnpm test:serial`

#### Coverage threshold failures
- Run `pnpm test:coverage` to see detailed report
- Add tests for uncovered code
- Adjust thresholds if justified (with team agreement)

#### Memory issues in CI
- Reduce workers: Already configured for CI
- Check for memory leaks in tests
- Use `--logHeapUsage` flag

### Getting Help

1. Run validation first: `pnpm test:validate`
2. Check test reports in `test-results/`
3. Enable debug logging: `DEBUG_TESTS=true`
4. Review this documentation
5. Check recent test changes in git history