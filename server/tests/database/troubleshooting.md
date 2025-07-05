# Test Database Troubleshooting Guide

This guide helps resolve common issues with the real database test infrastructure.

## Quick Diagnostics

### 1. Check Test Environment
```bash
# Verify environment variables
echo "DATABASE_PROVIDER: $TEST_DATABASE_PROVIDER"
echo "TEST_TYPE: $TEST_TYPE"
echo "DEBUG_TESTS: $DEBUG_TESTS"

# Test database connectivity
npm run test -- --testNamePattern="database health"
```

### 2. Enable Debug Mode
```bash
DEBUG_TESTS=true npm test
```

### 3. Check Database Files (SQLite)
```bash
# List test database files
ls -la server/tests/databases/

# Check if database is locked
lsof server/tests/databases/test-*.db
```

## Common Issues and Solutions

### Issue: "Database is locked" (SQLite)

**Symptoms:**
```
Error: SQLITE_BUSY: database is locked
```

**Causes:**
- Multiple Jest workers accessing same database file
- Previous test didn't properly close connections
- System interruption left connections open

**Solutions:**

1. **Check for orphaned processes:**
```bash
# Kill any orphaned Node processes
pkill -f "jest\|node.*test"

# Remove lock files
rm -f server/tests/databases/*.db-*
```

2. **Use worker isolation:**
```bash
# Force single worker
npm test -- --maxWorkers=1

# Or use worker-specific databases (automatic)
npm test -- --maxWorkers=4
```

3. **Clean database files:**
```bash
# Remove all test databases
rm -rf server/tests/databases/
mkdir -p server/tests/databases/
```

### Issue: "Foreign key constraint failed"

**Symptoms:**
```
Error: Foreign key constraint failed
```

**Causes:**
- Creating child records before parent records
- Missing required relationships
- Cascade delete violations

**Solutions:**

1. **Use test data factories in correct order:**
```typescript
// ✅ Correct order
const user = await testData.user();
const longRangePlan = await testData.longRangePlan({ userId: user.id });
const unitPlan = await testData.unitPlan({ 
  userId: user.id, 
  longRangePlanId: longRangePlan.id 
});

// ❌ Wrong order
const unitPlan = await testData.unitPlan(); // Missing parent references
```

2. **Use test scenarios for complex relationships:**
```typescript
// ✅ Pre-built relationships
const scenario = await testScenarios.teacherWithPlans();
```

3. **Check factory dependencies:**
```typescript
// Ensure factory creates required parent records
const unitPlan = await testData.unitPlan({
  // Factory should create user and longRangePlan if not provided
});
```

### Issue: "Test client not initialized"

**Symptoms:**
```
Error: Test context not initialized. Make sure tests are running with proper setup.
```

**Causes:**
- Missing or incorrect Jest setup files
- Wrong import paths
- Jest configuration issues

**Solutions:**

1. **Verify Jest configuration:**
```javascript
// jest.config.js
export default {
  setupFilesAfterEnv: ['<rootDir>/tests/setup/enhanced-jest-setup.ts'],
  globalSetup: '<rootDir>/tests/setup/global-database-setup.ts',
  globalTeardown: '<rootDir>/tests/setup/global-database-teardown.ts',
};
```

2. **Check import paths:**
```typescript
// ✅ Correct import
import { getTestContext, createTestData } from '../setup/enhanced-jest-setup';

// ❌ Wrong import
import { getTestContext } from './old-setup-file';
```

3. **Verify test structure:**
```typescript
describe('My Tests', () => {
  // beforeEach is handled by setup file
  it('should work', async () => {
    const testData = createTestData(); // This should work
  });
});
```

### Issue: Slow test execution

**Symptoms:**
- Tests taking >30 seconds
- Timeouts in CI
- High memory usage

**Causes:**
- Inefficient test data creation
- Too many database operations
- Wrong isolation strategy

**Solutions:**

1. **Use appropriate isolation level:**
```typescript
// For unit tests - use transactions (fastest)
TEST_TYPE=unit

// For integration tests - use table clearing
TEST_TYPE=integration
```

2. **Use batch operations:**
```typescript
// ✅ Efficient batch creation
const users = await testData.users(100);

// ❌ Inefficient individual creation
const users = [];
for (let i = 0; i < 100; i++) {
  users.push(await testData.user());
}
```

3. **Use test scenarios:**
```typescript
// ✅ Pre-built complex setup
const scenario = await testScenarios.teacherWithPlans();

// ❌ Manual complex setup
const user = await testData.user();
const expectations = await testData.expectations(20);
// ... 50 more lines of setup
```

4. **Monitor performance:**
```typescript
// Add performance logging
const start = Date.now();
const scenario = await testScenarios.integration();
console.log(`Setup took: ${Date.now() - start}ms`);
```

### Issue: Connection pool exhaustion

**Symptoms:**
```
Error: Connection pool exhausted
Error: Too many connections
```

**Causes:**
- Not closing connections properly
- Too many concurrent operations
- Connection leaks

**Solutions:**

1. **Check connection pool configuration:**
```typescript
// In test-database-config.ts
export function getConnectionPoolConfig(config: TestDatabaseConfig) {
  return {
    max: 5, // Increase if needed
    min: 0,
    acquireTimeout: 30000, // Increase timeout
  };
}
```

2. **Reduce concurrency:**
```bash
# Reduce Jest workers
npm test -- --maxWorkers=2

# Or use sequential execution
npm test -- --runInBand
```

3. **Check for connection leaks:**
```typescript
// Enable connection debugging
DEBUG_TESTS=true npm test
```

### Issue: Schema mismatch errors

**Symptoms:**
```
Error: Table 'xyz' doesn't exist
Error: Column 'abc' not found
```

**Causes:**
- Outdated Prisma client
- Schema not applied
- Migration issues

**Solutions:**

1. **Regenerate Prisma client:**
```bash
cd packages/database
npm run db:generate
```

2. **Force schema reset:**
```bash
cd packages/database
npm run db:push -- --force-reset
```

3. **Check schema version:**
```typescript
// In test, verify schema
const tables = await prisma.$queryRaw`
  SELECT name FROM sqlite_master WHERE type='table'
`;
console.log('Available tables:', tables);
```

### Issue: Jest worker crashes

**Symptoms:**
```
Error: Worker process terminated unexpectedly
Error: Call retries were exceeded
```

**Causes:**
- Memory leaks in tests
- Uncaught exceptions
- Database connection issues

**Solutions:**

1. **Increase worker memory:**
```javascript
// jest.config.js
export default {
  workerIdleMemoryLimit: '1GB', // Increase limit
  maxWorkers: 2, // Reduce workers
};
```

2. **Add error handling:**
```typescript
// In test setup
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});
```

3. **Use sequential execution:**
```bash
npm test -- --runInBand
```

## Environment-Specific Issues

### GitHub Actions / CI

**Common Issues:**
- PostgreSQL service not started
- Connection timeout
- Insufficient resources

**Solutions:**

1. **Verify PostgreSQL service:**
```yaml
# .github/workflows/test.yml
services:
  postgres:
    image: postgres:13
    env:
      POSTGRES_PASSWORD: postgres
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

2. **Set appropriate timeouts:**
```javascript
// jest.config.js for CI
export default {
  testTimeout: process.env.CI ? 30000 : 15000,
  setupFilesAfterEnv: ['<rootDir>/tests/setup/enhanced-jest-setup.ts'],
};
```

3. **Use CI-specific configuration:**
```bash
# In CI environment
TEST_DATABASE_PROVIDER=postgresql
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db
```

### Local Development

**Common Issues:**
- SQLite permissions
- File system limits
- Port conflicts

**Solutions:**

1. **Check file permissions:**
```bash
# Ensure write permissions
chmod -R 755 server/tests/databases/
```

2. **Check disk space:**
```bash
df -h .
```

3. **Clean up regularly:**
```bash
# Add to package.json
"scripts": {
  "test:clean": "rm -rf server/tests/databases/test-*.db"
}
```

## Performance Optimization

### 1. Test Data Strategies

**Use appropriate data sizes:**
```typescript
// ✅ For unit tests
const users = await testData.users(5);

// ✅ For integration tests
const users = await testData.users(20);

// ❌ For performance tests (use dedicated performance data)
const scenario = await testScenarios.integration();
```

### 2. Database Configuration

**SQLite optimizations:**
```sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = memory;
```

**PostgreSQL optimizations:**
```sql
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';
SET work_mem = '4MB';
```

### 3. Test Structure

**Group related tests:**
```typescript
// ✅ Efficient test grouping
describe('User Management', () => {
  let scenario: any;
  
  beforeAll(async () => {
    scenario = await testScenarios.integration();
  });
  
  it('should create user', () => {
    // Use shared scenario
  });
  
  it('should update user', () => {
    // Use shared scenario
  });
});
```

## Debugging Tools

### 1. Database Inspection

```bash
# SQLite inspection
sqlite3 server/tests/databases/test-worker-1.db ".tables"
sqlite3 server/tests/databases/test-worker-1.db ".schema users"

# PostgreSQL inspection
psql -d test_db -c "\dt"
```

### 2. Performance Monitoring

```typescript
// Add to test file
import { getTestDatabaseMetrics } from '../database/test-database-setup';

afterAll(() => {
  const metrics = getTestDatabaseMetrics();
  console.log('Database Metrics:', metrics);
});
```

### 3. Query Logging

```typescript
// Enable in test
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Getting Help

If issues persist:

1. **Check the migration guide:** `../migration/test-migration-guide.md`
2. **Review example tests:** `../examples/`
3. **Enable debug mode:** `DEBUG_TESTS=true`
4. **Check Jest configuration:** Verify setup files are correct
5. **Test with minimal setup:** Start with basic unit tests

## Prevention

### 1. Regular Maintenance

```bash
# Weekly cleanup
npm run test:clean

# Regenerate client
cd packages/database && npm run db:generate
```

### 2. Monitoring

```typescript
// Add performance assertions
it('should complete within time limit', async () => {
  const start = Date.now();
  await testOperation();
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(5000);
});
```

### 3. Best Practices

- Use test data factories
- Leverage pre-built scenarios  
- Choose appropriate isolation levels
- Monitor test performance
- Clean up resources properly