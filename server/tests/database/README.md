# Real Database Test Infrastructure

This directory contains the enhanced test database infrastructure that supports real database operations in tests while maintaining proper isolation.

## Overview

The new infrastructure provides:

- **Real Database Operations**: Tests use actual Prisma operations against real databases
- **Multiple Isolation Strategies**: Transaction-based, table-clearing, schema-based isolation
- **Multi-Database Support**: SQLite for local development, PostgreSQL for CI
- **Test Data Factories**: Easy creation of realistic test data
- **Performance Monitoring**: Database metrics and query tracking
- **Migration Support**: Automatic schema setup and migrations

## Architecture

```
tests/database/
├── test-database-config.ts      # Database configuration
├── test-database-manager.ts     # Core database management
├── test-data-factory.ts         # Test data creation
├── test-database-setup.ts       # Main setup interface
└── README.md                    # This file
```

## Key Components

### 1. Test Database Manager (`test-database-manager.ts`)

Central component that manages:
- Database connections per worker
- Schema initialization
- Test isolation strategies
- Performance monitoring
- Connection pooling

### 2. Test Database Configuration (`test-database-config.ts`)

Handles:
- Environment-specific database URLs
- Isolation strategy selection
- Connection pool configuration
- Provider-specific settings

### 3. Test Data Factory (`test-data-factory.ts`)

Provides:
- High-level test data creation
- Pre-built test scenarios
- Realistic data generation
- Relationship management

### 4. Test Database Setup (`test-database-setup.ts`)

Main interface offering:
- Easy setup functions
- Jest lifecycle hooks
- Helper utilities
- Database operations

## Usage Patterns

### Basic Unit Test

```typescript
import { getTestContext, createTestData, getTestPrismaClient } from '../setup/enhanced-jest-setup';

describe('User Service', () => {
  let testData: ReturnType<typeof createTestData>;
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(() => {
    testData = createTestData();
    prisma = getTestPrismaClient();
  });

  it('should create a user', async () => {
    const user = await testData.user({
      email: 'test@school.ca',
      name: 'Test Teacher',
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@school.ca');
  });
});
```

### Integration Test with Scenarios

```typescript
import { testScenarios } from '../setup/enhanced-jest-setup';

describe('Planning Workflow', () => {
  it('should support complete ETFO planning', async () => {
    const scenario = await testScenarios.teacherWithPlans({
      grade: 4,
      subject: 'Mathematics',
    });

    expect(scenario.teacher).toBeDefined();
    expect(scenario.longRangePlan).toBeDefined();
    expect(scenario.unitPlans).toHaveLength(3);
    expect(scenario.lessonPlans).toHaveLength(5);
  });
});
```

### Performance Testing

```typescript
import { getTestContext } from '../setup/enhanced-jest-setup';

describe('Performance Tests', () => {
  it('should handle large datasets efficiently', async () => {
    const context = getTestContext();
    const data = await context.factory.createPerformanceTestData('medium');

    expect(data.users).toHaveLength(50);
    expect(data.expectations).toHaveLength(200);
  });
});
```

## Test Isolation Strategies

The infrastructure supports multiple isolation levels:

### 1. Transaction Isolation (PostgreSQL)
- Each test runs in a transaction
- Rollback at test end
- Best for unit tests
- Fastest execution

### 2. Table Clearing (SQLite/PostgreSQL)
- Clear all tables before each test
- Preserves schema
- Good for integration tests
- Medium performance

### 3. Schema Isolation (PostgreSQL)
- Each worker gets own schema
- Full isolation between workers
- Best for concurrent execution
- Slower setup

### 4. Database Isolation
- Each test gets own database
- Maximum isolation
- Slowest but most reliable

## Configuration

### Environment Variables

```bash
# Database provider (sqlite or postgresql)
TEST_DATABASE_PROVIDER=sqlite

# PostgreSQL connection (if using PostgreSQL)
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/test_db

# Test type affects isolation strategy
TEST_TYPE=unit|integration|performance

# Debug mode for detailed logging
DEBUG_TESTS=true
```

### Jest Configuration

The infrastructure integrates with Jest through:

```javascript
// jest.config.js
export default {
  setupFilesAfterEnv: ['<rootDir>/tests/setup/enhanced-jest-setup.ts'],
  globalSetup: '<rootDir>/tests/database/test-database-setup.ts',
  // ... other config
};
```

## Test Data Factories

### Core Factories

- **UserFactory**: Creates teachers, admins, principals
- **CurriculumFactory**: Creates curriculum expectations
- **LongRangePlanFactory**: Creates yearly plans
- **UnitPlanFactory**: Creates unit plans
- **LessonPlanFactory**: Creates ETFO lesson plans
- **DaybookFactory**: Creates reflection entries
- **SubstitutePlanFactory**: Creates substitute plans

### Factory Usage

```typescript
// Individual creation
const user = await testData.user();
const expectation = await testData.expectation();

// Batch creation
const users = await testData.users(10);
const expectations = await testData.expectations(20);

// Relationship creation
const plan = await testData.longRangePlan({
  userId: user.id,
  expectations: expectations.slice(0, 5),
});
```

### Pre-built Scenarios

```typescript
// Complete teacher scenario
const scenario = await testScenarios.teacherWithPlans();

// Minimal test data
const minimal = await testScenarios.minimal();

// Integration test data
const integration = await testScenarios.integration();

// Bilingual data
const bilingual = await testScenarios.bilingual();
```

## Performance Considerations

### Optimization Strategies

1. **Use Appropriate Isolation**: 
   - Transaction for unit tests
   - Table clearing for integration tests
   - Schema isolation for parallel execution

2. **Batch Operations**:
   - Use factory batch methods
   - Leverage scenarios for complex setups
   - Avoid individual creation in loops

3. **Connection Pooling**:
   - Automatic connection management
   - Worker-specific connections
   - Connection health monitoring

4. **Schema Caching**:
   - Cached schema initialization
   - Incremental migrations
   - Skip redundant operations

### Performance Monitoring

```typescript
import { getTestDatabaseMetrics } from '../database/test-database-setup';

// Get performance metrics
const metrics = getTestDatabaseMetrics();
console.log(`Total queries: ${metrics.totalQueries}`);
console.log(`Active transactions: ${metrics.activeTransactions}`);
console.log(`Uptime: ${metrics.uptime}ms`);
```

## Troubleshooting

### Common Issues

1. **"Database locked" errors**
   - Ensure proper isolation strategy
   - Check for concurrent access
   - Use retry mechanisms

2. **"Foreign key constraint" errors**
   - Create parent records first
   - Use factory relationships
   - Check cascade rules

3. **Slow test execution**
   - Use appropriate isolation level
   - Optimize test data creation
   - Check connection pooling

4. **"Test client not initialized"**
   - Verify setup file imports
   - Check Jest configuration
   - Ensure proper beforeAll/beforeEach

### Debug Mode

Enable debug mode for detailed logging:

```bash
DEBUG_TESTS=true npm test
```

This provides:
- Query execution details
- Performance metrics
- Connection statistics
- Error stack traces

## Migration from Mocks

See `../migration/test-migration-guide.md` for detailed migration instructions from mock-based tests to real database tests.

## Best Practices

1. **Always use test data factories** instead of manual Prisma calls
2. **Leverage scenarios** for complex test setups
3. **Verify database state** in addition to service responses
4. **Use appropriate isolation** for test type
5. **Clean up properly** (automatic with infrastructure)
6. **Monitor performance** for large test suites
7. **Write realistic tests** with proper data relationships

## Future Enhancements

Planned improvements:
- Snapshot testing for database state
- Advanced transaction management
- Cross-database compatibility testing
- Automated performance regression detection
- Test data seeding from production snapshots