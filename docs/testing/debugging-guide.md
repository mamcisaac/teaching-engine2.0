# Testing Debugging Guide

A comprehensive guide to debugging tests in Teaching Engine 2.0, with practical solutions for common issues.

## 🔧 Quick Debugging Commands

```bash
# Environment validation
pnpm test:validate              # Check environment setup
pnpm test:validate --fix        # Auto-fix common issues

# Debug test runs
pnpm test:debug                 # Run with debug output
pnpm test:debug --server        # Server tests only
pnpm test:debug --client        # Client tests only

# Specific debugging
pnpm test:flaky                 # Run potentially flaky tests
pnpm test:isolation             # Test database isolation
```

## 🕵️ Debugging Strategies

### 1. Environment Issues

#### Symptoms
- Tests fail with "Module not found"
- Database connection errors
- "Cannot find Prisma client"

#### Diagnosis
```bash
# Check environment setup
pnpm test:validate

# Check Node version
node --version  # Should be 18+

# Check package manager
pnpm --version

# Verify Prisma client
ls packages/database/src/generated/client/
```

#### Solutions
```bash
# Fix environment
pnpm test:validate --fix

# Regenerate Prisma client
pnpm db:generate

# Fresh install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 2. Database Issues

#### Symptoms
- "Database locked" errors
- Test data contamination
- Connection pool exhausted

#### Diagnosis
```bash
# Check database files
ls packages/database/*.db*

# Check test isolation
pnpm test:isolation

# Verify database URL
grep DATABASE_URL packages/database/.env.test
```

#### Solutions
```bash
# Reset test database
rm -f packages/database/test.db*
pnpm db:push

# Fix database isolation
# In test files, ensure proper cleanup:
afterEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

### 3. Port Conflicts

#### Symptoms
- "EADDRINUSE: address already in use"
- Tests hanging on startup

#### Diagnosis
```bash
# Check what's using ports
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :5555  # Prisma Studio
```

#### Solutions
```bash
# Kill processes
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:5555 | xargs kill -9

# Or use the helper
pnpm run dev:clean
```

### 4. Memory Issues

#### Symptoms
- "JavaScript heap out of memory"
- Tests becoming progressively slower
- System freezing during tests

#### Diagnosis
```bash
# Check memory usage
ps aux | grep node
htop  # or similar system monitor

# Run with memory profiling
NODE_OPTIONS="--max-old-space-size=4096" pnpm test
```

#### Solutions
```bash
# Increase Node memory
export NODE_OPTIONS="--max-old-space-size=4096"

# Run tests serially (less memory)
pnpm test -- --maxWorkers=1

# Clean up test resources
# Ensure proper cleanup in tests:
afterEach(() => {
  jest.clearAllMocks();
  // Clean up any global state
});
```

## 🔍 VS Code Debugging

### Setup Debug Configuration

The project includes VS Code debug configurations in `.vscode/launch.json`:

1. **Debug Server Unit Tests** - Debug server unit tests with breakpoints
2. **Debug Client Tests** - Debug React component tests
3. **Debug Current Test File** - Debug the currently open test file
4. **Debug ETFO Tests** - Debug ETFO-specific functionality
5. **Debug E2E Tests** - Debug Playwright tests with browser

### Using Breakpoints

```typescript
// Set breakpoints in VS Code by clicking left margin
describe('MyService', () => {
  it('should process data', async () => {
    debugger; // Or use this for programmatic breakpoint
    const result = await myService.processData(input);
    expect(result).toBeDefined();
  });
});
```

### Debug Console Commands

In VS Code debug console:
```javascript
// Inspect variables
console.log(JSON.stringify(myVariable, null, 2));

// Execute code
await prisma.user.findMany();

// Check environment
process.env.NODE_ENV
```

## 🐛 Common Test Failures

### 1. Async/Await Issues

#### Problem
```typescript
// BAD: Missing await
it('should fetch data', () => {
  const result = myAsyncFunction(); // Returns Promise
  expect(result.data).toBe('expected'); // Fails!
});
```

#### Solution
```typescript
// GOOD: Proper async handling
it('should fetch data', async () => {
  const result = await myAsyncFunction();
  expect(result.data).toBe('expected');
});
```

### 2. Mock Issues

#### Problem
```typescript
// BAD: Mock not properly setup
jest.mock('./myModule');
// Mock doesn't work as expected
```

#### Solution
```typescript
// GOOD: Explicit mock setup
jest.mock('./myModule', () => ({
  myFunction: jest.fn().mockResolvedValue('mocked result')
}));

// Or use __mocks__ directory
// __mocks__/myModule.ts
export const myFunction = jest.fn();
```

### 3. Test Isolation Issues

#### Problem
```typescript
// BAD: Tests affect each other
let globalCounter = 0;

it('test 1', () => {
  globalCounter++;
  expect(globalCounter).toBe(1);
});

it('test 2', () => {
  globalCounter++;
  expect(globalCounter).toBe(1); // Fails! globalCounter is 2
});
```

#### Solution
```typescript
// GOOD: Isolated tests
describe('Counter tests', () => {
  let counter: number;
  
  beforeEach(() => {
    counter = 0; // Reset before each test
  });
  
  it('test 1', () => {
    counter++;
    expect(counter).toBe(1);
  });
  
  it('test 2', () => {
    counter++;
    expect(counter).toBe(1); // Now passes!
  });
});
```

### 4. Timeout Issues

#### Problem
```typescript
// BAD: No timeout handling
it('slow operation', async () => {
  await reallySlowOperation(); // Might timeout
});
```

#### Solution
```typescript
// GOOD: Explicit timeout
it('slow operation', async () => {
  await reallySlowOperation();
}, 30000); // 30 second timeout

// Or globally in Jest config
// jest.config.js
module.exports = {
  testTimeout: 30000
};
```

## 🔧 Advanced Debugging Techniques

### 1. Using Node Inspector

```bash
# Debug server tests with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand server/src/__tests__/unit/myTest.test.ts

# Open Chrome and go to chrome://inspect
```

### 2. Verbose Logging

```typescript
// Enable debug logging in tests
process.env.DEBUG = 'myapp:*';

// Use debug package
import Debug from 'debug';
const debug = Debug('myapp:test');

it('should work', () => {
  debug('Test starting with input:', input);
  const result = myFunction(input);
  debug('Result:', result);
  expect(result).toBeDefined();
});
```

### 3. Database Query Debugging

```typescript
// Enable Prisma query logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Check generated SQL
console.log('Generated SQL:', await prisma.$queryRaw`
  SELECT * FROM users WHERE id = 1
`);
```

### 4. Network Request Debugging

```typescript
// Mock and inspect HTTP calls
import nock from 'nock';

const scope = nock('https://api.example.com')
  .get('/data')
  .reply(200, { success: true });

// After test
if (!scope.isDone()) {
  console.error('Expected HTTP calls were not made:', scope.pendingMocks());
}
```

### 5. Performance Profiling

```bash
# Profile test performance
NODE_OPTIONS="--prof" pnpm test

# Analyze profile
node --prof-process isolate-*.log > profile.txt
```

## 🚨 Emergency Debugging

### When Everything is Broken

1. **Nuclear Reset**
```bash
# Stop all processes
pkill -f node

# Clean everything
rm -rf node_modules */node_modules pnpm-lock.yaml
rm -rf */dist */build coverage
rm -f packages/database/*.db*

# Fresh start
pnpm install
pnpm db:push
pnpm test:validate --fix
```

2. **Check System Resources**
```bash
# Memory usage
free -h  # Linux
vm_stat  # macOS

# Disk space
df -h

# Process count
ps aux | wc -l
```

3. **Environment Reset**
```bash
# Reset environment files
cp .env.test.example .env.test
cp server/.env.test.example server/.env.test

# Regenerate everything
pnpm db:generate
pnpm test:setup
```

## 📊 Test Performance Analysis

### Identify Slow Tests

```bash
# Run with performance reporting
TEST_PERFORMANCE=true pnpm test

# Find slowest tests
pnpm test -- --verbose | grep -E '\([0-9]+ms\)' | sort -n
```

### Optimize Test Performance

```typescript
// BAD: Creating database records in every test
beforeEach(async () => {
  await prisma.user.create({ data: testUser });
});

// GOOD: Use in-memory data when possible
beforeEach(() => {
  mockUsers = [{ id: 1, name: 'Test User' }];
  jest.spyOn(userService, 'getUsers').mockResolvedValue(mockUsers);
});
```

## 🔄 Continuous Debugging

### Monitor Test Health

```bash
# Run tests with monitoring
pnpm test -- --watch --verbose --coverage

# Track flaky tests
pnpm test:flaky

# Performance tracking
pnpm test:performance
```

### Log Analysis

```bash
# Search for error patterns
grep -r "Error:" server/src/__tests__/

# Find hanging tests
grep -r "timeout" test-output.log

# Memory leak detection
grep -r "heap out of memory" logs/
```

## 📚 Debugging Tools Reference

### Jest Debugging
- `--verbose` - Detailed test output
- `--detectOpenHandles` - Find memory leaks
- `--runInBand` - Run tests serially
- `--maxWorkers=1` - Single worker process

### Playwright Debugging
- `PWDEBUG=1` - Visual debugging mode
- `--debug` - Debug mode
- `--headed` - Run with browser UI
- `--slowMo=1000` - Slow down actions

### Node.js Debugging
- `--inspect` - Enable debugger
- `--inspect-brk` - Break on start
- `--max-old-space-size=4096` - Increase memory
- `--prof` - Performance profiling

## 🆘 Getting Help

### When to Ask for Help

1. You've tried the solutions in this guide
2. The issue persists after environment reset
3. You suspect a framework/tool bug
4. The error messages are unclear

### Information to Provide

When reporting issues:
- Exact error message
- Steps to reproduce
- Environment details (`node --version`, `pnpm --version`)
- Recent changes made
- Output of `pnpm test:validate`

### Resources

- [Testing Developer Guide](./developer-guide.md)
- [Project Documentation](../README.md)
- [Jest Documentation](https://jestjs.io/docs/troubleshooting)
- [Playwright Debugging](https://playwright.dev/docs/debug)

---

**Remember**: Debugging is a skill that improves with practice. Use these tools and techniques to become more effective at identifying and solving test issues quickly! 🔍