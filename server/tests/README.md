# Test Infrastructure Documentation

This directory contains the unified test infrastructure for Teaching Engine 2.0 server.

## Directory Structure

```
tests/
├── utils/                     # Shared test utilities
│   ├── index.ts              # Main export file
│   ├── mockFactories.ts      # Mock creation utilities
│   ├── testHelpers.ts        # General test helpers
│   ├── databaseHelpers.ts    # Database test utilities
│   ├── assertionHelpers.ts   # Custom assertion helpers
│   └── setup-*-mocks.ts      # Test type specific setups
├── unit/                     # Unit tests (fast, isolated)
├── integration/              # Integration tests (real DB, mocked external APIs)
├── e2e/                      # End-to-end tests (minimal mocking)
├── performance/              # Performance tests
└── temp/                     # Temporary files and caches
```

## Test Types

### Unit Tests (`tests/unit/`)
- **Purpose**: Test individual functions and classes in isolation
- **Speed**: Very fast (< 5 seconds per test)
- **Database**: Mocked
- **External APIs**: Mocked
- **Parallelization**: High (up to 8 workers)

### Integration Tests (`tests/integration/`)
- **Purpose**: Test service interactions with real database
- **Speed**: Moderate (5-30 seconds per test)
- **Database**: Real SQLite database
- **External APIs**: Mocked
- **Parallelization**: Sequential (database isolation)

### E2E Tests (`tests/e2e/`)
- **Purpose**: Test full user workflows
- **Speed**: Slow (30-60 seconds per test)
- **Database**: Real database
- **External APIs**: Minimal mocking (only expensive operations)
- **Parallelization**: Sequential

### Performance Tests (`tests/performance/`)
- **Purpose**: Measure and benchmark performance
- **Speed**: Variable
- **Database**: Real database
- **External APIs**: Mocked for consistency
- **Parallelization**: Single worker for consistent measurements

## Configuration

### Unified Jest Configuration
All test types use `jest.config.unified.js` with environment-specific settings:

```bash
# Run specific test type
TEST_TYPE=unit pnpm test
TEST_TYPE=integration pnpm test
TEST_TYPE=e2e pnpm test
TEST_TYPE=performance pnpm test
```

### Environment Variables
- `TEST_TYPE`: Determines which configuration to use
- `DEBUG_TESTS`: Enables verbose logging
- `DATABASE_URL`: Test database connection (auto-managed)
- `TEST_WORKERS`: Number of parallel workers

## Usage

### Quick Commands
```bash
# Run unit tests (fast)
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run all tests
pnpm test:all

# Smart test runner (with caching)
pnpm test:smart unit
pnpm test:changed
```

### Smart Test Runner
The smart test runner provides:
- Test result caching
- Change-based test selection
- Optimized parallel execution
- Performance monitoring

```bash
# Run only tests affected by changes
pnpm test:changed

# Check cache status
pnpm test:cache:status

# Clear cache
pnpm test:cache:clear
```

## Writing Tests

### Test File Naming
- Unit tests: `*.test.ts` in `tests/unit/`
- Integration tests: `*.test.ts` in `tests/integration/`
- E2E tests: `*.test.ts` in `tests/e2e/`
- Performance tests: `*.test.ts` in `tests/performance/`

### Using Test Utilities
```typescript
import {
  createMockPrismaClient,
  createMockLogger,
  testDataFactories,
  assertDefined,
  waitForCondition,
  createTestCleanup
} from '../utils';

describe('MyService', () => {
  const cleanup = createTestCleanup();
  
  afterEach(async () => {
    await cleanup.run();
  });

  it('should do something', async () => {
    const mockPrisma = createMockPrismaClient();
    const testUser = testDataFactories.user();
    
    mockPrisma.user.findUnique.mockResolvedValue(testUser);
    
    const result = await myService.getUser(testUser.id);
    
    assertDefined(result);
    expect(result.id).toBe(testUser.id);
  });
});
```

### Performance Testing
```typescript
import { measurePerformance, performanceBenchmark } from '../utils/setup-performance-mocks';

describe('Performance Tests', () => {
  it('should process data within time limit', async () => {
    const { result, duration } = await measurePerformance(
      'data-processing',
      () => myService.processLargeDataset(data)
    );
    
    expect(duration).toBeLessThan(1000); // Less than 1 second
    expect(result).toBeDefined();
  });

  it('should handle bulk operations efficiently', async () => {
    const { stats } = await performanceBenchmark.run(
      'bulk-operation',
      () => myService.bulkInsert(records),
      5 // Run 5 times
    );
    
    expect(stats.avg).toBeLessThan(500); // Average less than 500ms
    expect(stats.p95).toBeLessThan(1000); // 95th percentile less than 1s
  });
});
```

## Optimization Features

### Database Optimization
- In-memory SQLite for unit tests
- Connection pooling for integration tests
- Optimized schema setup with caching
- Automated cleanup

### Test Result Caching
- Caches test results based on source file changes
- Skips tests when no relevant changes detected
- Configurable cache expiration (1 hour default)

### Parallel Execution
- Intelligent worker allocation based on test type
- Database isolation for integration tests
- Optimized for different system configurations

### Change Detection
- Monitors source file modifications
- Runs only relevant tests for changed files
- Supports git-based change detection

## Troubleshooting

### Common Issues

#### "Cannot find module" errors
```bash
# Regenerate Prisma client
pnpm db:generate

# Clear test cache
pnpm test:cache:clear
```

#### Database connection issues
```bash
# Reset test database
rm -rf tests/temp/*.db*

# Validate test environment
pnpm test:validate
```

#### Slow test execution
```bash
# Check cache status
pnpm test:cache:status

# Use smart runner for optimized execution
pnpm test:smart unit --force
```

#### Flaky tests
- Check for race conditions in async operations
- Ensure proper test isolation
- Use `waitForCondition` for timing-dependent assertions
- Review mock implementations for consistency

### Performance Monitoring
Monitor test execution times and identify bottlenecks:

```bash
# Run with performance monitoring
TEST_PERFORMANCE=true pnpm test:performance

# Analyze test timing
pnpm test:debug
```

## Contributing

When adding new tests:

1. Choose the appropriate test type (unit/integration/e2e/performance)
2. Use shared utilities from `tests/utils/`
3. Follow naming conventions
4. Include proper cleanup
5. Add performance assertions for critical paths
6. Update this documentation if adding new patterns

For questions or issues, refer to the project's main documentation or create an issue.