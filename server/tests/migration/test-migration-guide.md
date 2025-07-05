# Test Migration Guide

This guide helps migrate existing tests to use the new real database infrastructure.

## Overview

The new test infrastructure provides:
- **Real database operations** instead of mocks
- **Proper test isolation** using transactions or table clearing
- **Test data factories** for easy data creation
- **Performance monitoring** and debugging tools

## Migration Steps

### 1. Update Test Setup

**Before (Old Setup):**
```typescript
import { mockPrismaClient } from '../helpers/mock-prisma';

describe('My Test', () => {
  let prisma: any;
  
  beforeEach(() => {
    prisma = mockPrismaClient;
  });
});
```

**After (New Setup):**
```typescript
import { getTestContext, createTestData, getTestPrismaClient } from '../setup/enhanced-jest-setup';

describe('My Test', () => {
  let testData: ReturnType<typeof createTestData>;
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(() => {
    testData = createTestData();
    prisma = getTestPrismaClient();
  });
});
```

### 2. Replace Mocked Data with Real Data

**Before (Mock Data):**
```typescript
const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
};

prisma.user.findUnique.mockResolvedValue(mockUser);
```

**After (Real Data):**
```typescript
const user = await testData.user({
  email: 'test@school.ca',
  name: 'Test Teacher',
});

// Now test against real database
const foundUser = await prisma.user.findUnique({
  where: { id: user.id },
});
```

### 3. Update Test Assertions

**Before (Mock Verification):**
```typescript
expect(prisma.user.create).toHaveBeenCalledWith({
  data: expectedData,
});
```

**After (Database Verification):**
```typescript
const createdUser = await testData.user(expectedData);

expect(createdUser.email).toBe(expectedData.email);
expect(createdUser.name).toBe(expectedData.name);

// Verify in database
const dbUser = await prisma.user.findUnique({
  where: { id: createdUser.id },
});
expect(dbUser).toBeDefined();
```

### 4. Handle Complex Scenarios

**Before (Complex Mock Setup):**
```typescript
const mockUserWithPlans = {
  id: 1,
  email: 'teacher@school.ca',
  longRangePlans: [
    { id: 'plan1', title: 'Math Plan' },
    { id: 'plan2', title: 'Science Plan' },
  ],
};

prisma.user.findUnique.mockResolvedValue(mockUserWithPlans);
```

**After (Test Scenarios):**
```typescript
// Use pre-built scenarios
const scenario = await testScenarios.teacherWithPlans({
  grade: 4,
  subject: 'Mathematics',
});

// Or create custom scenario
const user = await testData.user();
const mathPlan = await testData.longRangePlan({
  userId: user.id,
  subject: 'Mathematics',
});
const sciencePlan = await testData.longRangePlan({
  userId: user.id,
  subject: 'Science',
});
```

## Common Migration Patterns

### Pattern 1: Service Tests

**Before:**
```typescript
describe('UserService', () => {
  it('should create user', () => {
    const userData = { email: 'test@example.com' };
    prisma.user.create.mockResolvedValue({ id: 1, ...userData });
    
    const result = await userService.createUser(userData);
    expect(result.id).toBe(1);
  });
});
```

**After:**
```typescript
describe('UserService', () => {
  it('should create user', async () => {
    const userData = { email: 'test@school.ca', name: 'Test Teacher' };
    
    const result = await userService.createUser(userData);
    
    // Verify with real database
    expect(result.id).toBeDefined();
    expect(result.email).toBe(userData.email);
    
    const dbUser = await prisma.user.findUnique({
      where: { id: result.id },
    });
    expect(dbUser).toBeDefined();
  });
});
```

### Pattern 2: Repository Tests

**Before:**
```typescript
describe('UserRepository', () => {
  it('should find user by email', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    
    const result = await userRepo.findByEmail('test@example.com');
    expect(result).toEqual(mockUser);
  });
});
```

**After:**
```typescript
describe('UserRepository', () => {
  it('should find user by email', async () => {
    // Create real user
    const user = await testData.user({
      email: 'test@school.ca',
    });
    
    // Test repository method
    const result = await userRepo.findByEmail('test@school.ca');
    
    expect(result).toBeDefined();
    expect(result.id).toBe(user.id);
    expect(result.email).toBe('test@school.ca');
  });
});
```

### Pattern 3: Integration Tests

**Before:**
```typescript
describe('API Integration', () => {
  it('should return user plans', async () => {
    const mockUser = { id: 1, longRangePlans: [] };
    prisma.user.findUnique.mockResolvedValue(mockUser);
    
    const response = await request(app)
      .get('/api/users/1/plans')
      .expect(200);
      
    expect(response.body).toEqual(mockUser.longRangePlans);
  });
});
```

**After:**
```typescript
describe('API Integration', () => {
  it('should return user plans', async () => {
    // Create real test scenario
    const scenario = await testScenarios.teacherWithPlans();
    
    const response = await request(app)
      .get(`/api/users/${scenario.teacher.id}/plans`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
      
    expect(response.body).toHaveLength(1);
    expect(response.body[0].id).toBe(scenario.longRangePlan.id);
  });
});
```

## Best Practices for Migrated Tests

### 1. Use Test Data Factories

**Good:**
```typescript
const user = await testData.user();
const expectation = await testData.expectation();
const plan = await testData.longRangePlan({ userId: user.id });
```

**Avoid:**
```typescript
const user = await prisma.user.create({
  data: { /* lots of manual data */ }
});
```

### 2. Test Real Business Logic

**Good:**
```typescript
// Test actual constraint
await expect(
  testData.user({ email: 'duplicate@school.ca' })
).rejects.toThrow(/unique constraint/i);
```

**Avoid:**
```typescript
// Testing mock behavior
expect(prisma.user.create).toThrow();
```

### 3. Use Scenarios for Complex Tests

**Good:**
```typescript
const scenario = await testScenarios.teacherWithPlans();
// Test complete workflow
```

**Avoid:**
```typescript
// Manual setup of complex relationships
const user = await testData.user();
const plan1 = await testData.longRangePlan({ userId: user.id });
// ... 20 more lines of setup
```

### 4. Verify Database State

**Good:**
```typescript
const user = await userService.createUser(data);

// Verify service response
expect(user.id).toBeDefined();

// Verify database state
const dbUser = await prisma.user.findUnique({
  where: { id: user.id },
});
expect(dbUser).toBeDefined();
```

## Performance Considerations

### 1. Use Batching for Large Datasets

```typescript
// Good: Use factory batching
const users = await testData.users(100);

// Avoid: Individual creation
const users = [];
for (let i = 0; i < 100; i++) {
  users.push(await testData.user());
}
```

### 2. Leverage Test Scenarios

```typescript
// Good: Pre-built scenario
const data = await testScenarios.integration();

// Avoid: Manual assembly
const user = await testData.user();
const expectations = await testData.expectations(10);
// ... manual relationship setup
```

### 3. Clean Up Appropriately

```typescript
// No manual cleanup needed - test isolation handles it
// Just use the provided factories and helpers
```

## Troubleshooting Common Issues

### Issue: "Database locked" errors
**Solution:** Ensure you're using the proper setup files and not mixing isolation strategies.

### Issue: "Foreign key constraint" errors
**Solution:** Create parent entities before children using test data factories.

### Issue: Slow tests
**Solution:** Use appropriate test scenarios and avoid unnecessary data creation.

### Issue: "Test client not initialized"
**Solution:** Make sure you're importing from the correct setup file and using proper Jest lifecycle hooks.

## Migration Checklist

- [ ] Update imports to use new setup files
- [ ] Replace mock data with test data factories
- [ ] Update assertions to verify real database state
- [ ] Use test scenarios for complex setups
- [ ] Remove manual cleanup code
- [ ] Test that all tests pass with real database
- [ ] Verify test isolation is working properly