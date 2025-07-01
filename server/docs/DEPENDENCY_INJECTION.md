# Service Dependency Injection Guide

This guide explains how to use dependency injection with BaseService for proper testing and mocking.

## Overview

The BaseService class now supports dependency injection, allowing you to inject mock dependencies during testing while maintaining backward compatibility with production code.

## BaseService Changes

### ServiceDependencies Interface

```typescript
export interface ServiceDependencies {
  prisma?: PrismaClient;
  logger?: Logger;
}
```

### Updated Constructor

All services extending BaseService now accept optional dependencies:

```typescript
export class YourService extends BaseService {
  constructor(dependencies?: ServiceDependencies) {
    super('YourService', dependencies);
  }
}
```

## Creating Mock Dependencies

Use the `createMockDependencies` helper function in your tests:

```typescript
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { createMockDependencies } from '../utils/createServiceMocks';
import { YourService } from '../../src/services/yourService';

describe('YourService', () => {
  let mockDeps: ServiceDependencies;
  let service: YourService;

  beforeEach(() => {
    mockDeps = createMockDependencies(jest);
    service = new YourService(mockDeps);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use mock database', async () => {
    const mockPrisma = mockDeps.prisma as any;

    // Setup mock response
    mockPrisma.yourModel.findMany.mockResolvedValue([{ id: '1', name: 'Test' }]);

    // Your test logic here
    const result = await service.yourMethod();

    // Verify mock was called
    expect(mockPrisma.yourModel.findMany).toHaveBeenCalled();
  });
});
```

## Migration Guide

### Updating Existing Services

1. Update your service constructor to accept optional dependencies:

```typescript
// Before
export class MyService extends BaseService {
  constructor() {
    super('MyService');
  }
}

// After
export class MyService extends BaseService {
  constructor(dependencies?: ServiceDependencies) {
    super('MyService', dependencies);
  }
}
```

2. No changes needed to production code - services will use real dependencies when none are provided.

### Writing Tests with Mocks

1. Import required testing utilities:

```typescript
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { createMockDependencies } from '../utils/createServiceMocks';
```

2. Create mock dependencies in your test setup:

```typescript
let mockDeps: ServiceDependencies;

beforeEach(() => {
  mockDeps = createMockDependencies(jest);
});
```

3. Instantiate your service with mocks:

```typescript
const service = new MyService(mockDeps);
```

4. Configure mock responses as needed:

```typescript
const mockPrisma = mockDeps.prisma as any;
mockPrisma.user.findUnique.mockResolvedValue({ id: '1', name: 'John' });
```

## Available Mock Methods

### Prisma Mock

The mock Prisma client includes all standard methods:

- `$transaction`
- `$queryRaw`
- `$connect`
- `$disconnect`

And model-specific methods for each model:

- `create`
- `createMany`
- `findMany`
- `findUnique`
- `findFirst`
- `update`
- `delete`
- `deleteMany`
- `count`

### Logger Mock

The mock logger includes:

- `child`
- `info`
- `warn`
- `error`
- `debug`
- `trace`
- `fatal`

## Best Practices

1. **Always use dependency injection in tests** - Never rely on real database or external services.

2. **Reset mocks between tests** - Use `jest.clearAllMocks()` in `afterEach`.

3. **Validate mock setup** - Use `validateMockDependencies()` to ensure mocks are properly configured.

4. **Keep production code unchanged** - The dependency injection is optional, so production code doesn't need modification.

5. **Mock only what you need** - Configure mock responses only for the methods your test actually uses.

## Example: Complete Test Suite

```typescript
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { createMockDependencies, validateMockDependencies } from '../utils/createServiceMocks';
import { UserService } from '../../src/services/userService';

describe('UserService', () => {
  let mockDeps: ServiceDependencies;
  let service: UserService;

  beforeEach(() => {
    mockDeps = createMockDependencies(jest);
    service = new UserService(mockDeps);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Mock Validation', () => {
    it('should have valid mock dependencies', () => {
      expect(validateMockDependencies(mockDeps)).toBe(true);
    });
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const mockPrisma = mockDeps.prisma as any;
      const mockLogger = mockDeps.logger as any;

      // Setup mock
      mockPrisma.user.create.mockResolvedValue({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      });

      // Execute
      const result = await service.createUser({
        email: 'test@example.com',
        name: 'Test User',
      });

      // Verify
      expect(result.id).toBe('123');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ userId: '123' }),
        'User created successfully',
      );
    });

    it('should handle database errors', async () => {
      const mockPrisma = mockDeps.prisma as any;

      // Setup mock to fail
      mockPrisma.user.create.mockRejectedValue(new Error('Database connection failed'));

      // Execute and verify
      await expect(
        service.createUser({
          email: 'test@example.com',
          name: 'Test User',
        }),
      ).rejects.toThrow('Database connection failed');
    });
  });
});
```

## Troubleshooting

### Jest is not defined

Make sure to import jest from `@jest/globals`:

```typescript
import { jest } from '@jest/globals';
```

### Mock methods not available

Ensure you're casting to `any` when accessing mock methods:

```typescript
const mockPrisma = mockDeps.prisma as any;
```

### Services using real dependencies

Verify you're passing the mock dependencies to the constructor:

```typescript
const service = new MyService(mockDeps); // ✓ Correct
const service = new MyService(); // ✗ Will use real dependencies
```
