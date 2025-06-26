# Testing Guide for Teaching Engine 2.0

## 🚀 Quick Start

We've simplified testing from 20+ commands down to **8 intuitive commands**:

```bash
# Smart detection - runs the right tests automatically
pnpm test

# Watch mode for TDD
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Debug tests in Chrome DevTools
pnpm test:debug

# Quick smoke test (5 second timeout)
pnpm test:quick

# Fix common issues automatically
pnpm test:fix

# Run all tests for CI
pnpm test:ci

# Show help and examples
pnpm test:help
```

## 🧠 Smart Test Detection

The default `pnpm test` command automatically:
- Detects which files have changed
- Runs only the relevant tests
- Chooses the right test type (unit, integration, e2e)
- Provides clear, actionable error messages

### How It Works

```bash
# Example: You changed a service file
$ pnpm test
🧠 Smart Test Runner - Analyzing changes...

📝 Changed files:
  - server/src/services/userService.ts

🎯 Running: unit tests

✅ unit tests passed!
```

## 🔧 Fixing Common Issues

### Use the Interactive Fixer

```bash
$ pnpm test:fix

🧪 Teaching Engine 2.0 - Interactive Test Tool

What issue are you experiencing?
❯ Port conflicts (EADDRINUSE)
  Database connection errors
  Module import errors
  Test timeouts
  Memory issues
  Environment variable issues
```

### Enhanced Error Messages

When tests fail, you get actionable solutions:

```bash
❌ Database Connection Failed

🔧 Quick Fix:
  1. Ensure PostgreSQL is running: brew services start postgresql
  2. Check DATABASE_URL in .env
  3. Run migrations: pnpm db:migrate

💡 For tests, use the test database:
  DATABASE_URL="postgresql://test:test@localhost:5432/test" pnpm test
```

## 🎯 Test Categories

### Unit Tests (Fast, Isolated)
- Mock all dependencies
- Run in ~5 seconds
- Test individual functions/components

```bash
# Run only unit tests
pnpm test server/tests/unit
```

### Integration Tests (Real Dependencies)
- Use real database
- Test API endpoints
- Test service interactions

```bash
# Run integration tests
pnpm test server/tests/integration
```

### E2E Tests (Full Stack)
- Browser automation
- Complete user workflows
- Slowest but most thorough

```bash
# Run E2E tests
pnpm test:e2e
```

## 🔍 VSCode Integration

### Debugging Tests

1. Open any test file
2. Click the "Debug" lens above a test
3. Or use F5 with these debug configurations:
   - "Debug Current Test File"
   - "Debug All Unit Tests"
   - "Debug Integration Tests"

### Running Tests from VSCode

- Click the flask icon in the activity bar
- Tests appear with run/debug buttons
- Failed tests show inline in editor

## 📊 Test Organization

### Check Your Test Organization

```bash
$ pnpm test:categorize

📊 Test Categorization Report

Found 156 test files

UNIT Tests (98):
  Characteristics: mocked dependencies, isolated, fast
  • server/tests/unit/auth.test.ts [high]
  • server/tests/unit/userService.test.ts [high]
  ... and 96 more

INTEGRATION Tests (45):
  Characteristics: database access, multiple modules, slower
  • server/tests/integration/api.test.ts [high]
  ... and 44 more
```

### Generate Organization Script

```bash
# Generate suggestions for better test organization
pnpm test:categorize:organize

✅ Generated reorganization script: reorganize-tests.sh
   Review and uncomment lines before running!
```

## 🧹 Legacy Code Cleanup

### Find and Clean Legacy Code

```bash
# Dry run to see what would be cleaned
pnpm cleanup:legacy:dry

# Actually clean legacy code
pnpm cleanup:legacy

📊 Summary:
  Files processed: 45
  Legacy comments removed: 127
  Lines removed: 384
  TODOs found: 23
```

### TODO Tracking

After cleanup, check `docs/TODO-TRACKING.md` for:
- High priority TODOs
- TODOs organized by file
- Suggested GitHub issues

## 💡 Best Practices

### 1. Use Watch Mode for TDD

```bash
pnpm test:watch
```

Write test → See it fail → Write code → See it pass

### 2. Run Quick Tests Before Commits

```bash
pnpm test:quick
```

Fast smoke test that catches obvious issues

### 3. Debug Confusing Failures

```bash
pnpm test:debug
```

Opens Chrome DevTools for step-by-step debugging

### 4. Check Coverage Regularly

```bash
pnpm test:coverage
```

Aim for:
- 90%+ line coverage
- 85%+ function coverage
- 80%+ branch coverage

## 🛠️ Advanced Usage

### Test Specific Files

```bash
# Test a specific file
pnpm test server/tests/unit/auth.test.ts

# Test a directory
pnpm test server/tests/unit

# Test with pattern
pnpm test auth
```

### Update Snapshots

```bash
pnpm test -u
```

### Custom Timeout

```bash
pnpm test --testTimeout=30000
```

### Verbose Output

```bash
pnpm test --verbose
```

## 🚨 Troubleshooting

### Tests Running Slowly?

1. Check if you're running integration tests unnecessarily
2. Use `pnpm test:quick` for rapid feedback
3. Run `pnpm test:categorize` to identify slow tests

### Flaky Tests?

1. Look for missing `await` statements
2. Check for race conditions
3. Ensure proper test isolation
4. Add explicit waits for async operations

### Can't Find Tests?

1. Ensure test files match patterns: `*.test.ts`, `*.spec.ts`
2. Check test file location
3. Run `pnpm test:categorize` to see all tests

## 📝 Migration from Old Commands

| Old Command | New Command | Notes |
|------------|------------|-------|
| `pnpm test:unit` | `pnpm test` | Smart detection runs unit tests by default |
| `pnpm test:integration` | `pnpm test integration` | Specify test type if needed |
| `pnpm test:all` | `pnpm test:ci` | Comprehensive CI testing |
| `pnpm test:etfo` | `pnpm test etfo` | Pattern matching still works |
| `pnpm test:cache:clear` | Built-in | Cache managed automatically |

## 🎉 Summary

Testing is now simpler:
- **8 commands** instead of 20+
- **Smart detection** runs the right tests
- **Better errors** with solutions
- **VSCode integration** for debugging
- **Interactive tools** for fixing issues

Start with `pnpm test` and let the smart runner do the work!