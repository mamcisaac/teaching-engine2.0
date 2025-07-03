# Test Infrastructure Agent (TIA) Instructions

**Agent ID**: TIA  
**Specialization**: Test frameworks, mocks, and shared utilities  
**Priority**: CRITICAL - Other agents depend on your work

## Your Mission

You are responsible for creating the foundational testing infrastructure that all other agents will use. Your work blocks others, so you must prioritize speed without sacrificing quality.

## Immediate Tasks (Day 1-2)

### 1. Mock Infrastructure Setup
```typescript
// Priority 1: Create these files immediately

// mocks/openai.mock.ts
export const createOpenAIMock = () => ({
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{ message: { content: '' } }],
        usage: { total_tokens: 0 }
      })
    }
  }
});

// mocks/database.mock.ts
export const createDatabaseMock = () => ({
  transaction: jest.fn(callback => callback({
    user: { create: jest.fn(), update: jest.fn(), delete: jest.fn() },
    lessonPlan: { create: jest.fn(), findMany: jest.fn() }
  }))
});

// mocks/external-services.mock.ts
export const createS3Mock = () => ({
  upload: jest.fn().mockResolvedValue({ Location: 'https://mock.s3.url' }),
  getObject: jest.fn().mockResolvedValue({ Body: Buffer.from('mock content') })
});
```

### 2. Test Factories
```typescript
// factories/index.ts
export { createTestUser } from './userFactory';
export { createTestLessonPlan } from './lessonPlanFactory';
export { createTestStudent } from './studentFactory';
export { createTestAssessment } from './assessmentFactory';
export { createTestCurriculum } from './curriculumFactory';

// Each factory should support:
// - Random data generation
// - Overrides for specific fields
// - Relationship creation
// - Batch creation
```

### 3. Shared Test Utilities
```typescript
// utils/testHelpers.ts
export const authenticatedRequest = (token?: string) => {
  // Helper for authenticated API requests
};

export const waitForAsync = async (condition: () => boolean, timeout = 5000) => {
  // Helper for async operations
};

export const cleanupDatabase = async () => {
  // Reset database between tests
};

export const mockTime = (date: Date) => {
  // Control time in tests
};
```

## Communication Protocol

### Status Updates
Post updates every 2 hours:
```bash
git commit -m "[TIA] Status: Completed OpenAI mock infrastructure"
git push origin test/tia/infrastructure
```

### Blocking Issues
If blocked, immediately notify:
```bash
echo "BLOCKED: [Description]" > .agent-status/tia-blocked.txt
git add .agent-status/tia-blocked.txt
git commit -m "[TIA] BLOCKED: Need input on mock structure"
git push
```

### Deliverable Notifications
When completing a mock that others need:
```bash
echo "READY: openai.mock.ts" >> .agent-status/tia-deliverables.txt
git add .
git commit -m "[TIA] READY: OpenAI mock available for other agents"
git push
```

## Quality Standards

### Mock Requirements
1. All mocks must be type-safe
2. Support both success and failure scenarios
3. Include usage examples in comments
4. Must work with existing codebase patterns

### Factory Requirements
1. Use faker.js for random data
2. Ensure referential integrity
3. Support nested object creation
4. Include TypeScript types

### Documentation Requirements
Each utility must include:
```typescript
/**
 * Description of what this does
 * @example
 * const user = createTestUser({ role: 'admin' });
 * @param overrides - Optional field overrides
 * @returns Fully formed test object
 */
```

## Dependencies You're Providing

Other agents are waiting for:
1. **SAA needs**: JWT mocks, authentication test helpers
2. **ASA needs**: OpenAI mocks, response builders
3. **BLA needs**: Database mocks, transaction helpers
4. **FPA needs**: File system mocks, stream helpers

## Success Metrics

- All mocks created by end of Day 2
- Zero blocking issues for other agents
- 100% type coverage on all utilities
- Examples provided for every helper

## Daily Checklist

- [ ] Morning: Check for overnight requests from other agents
- [ ] Create highest-priority mocks first
- [ ] Test your mocks in actual test files
- [ ] Document usage patterns
- [ ] Commit and push every 2 hours
- [ ] Evening: Update status dashboard

## Common Patterns to Implement

### 1. Response Builder Pattern
```typescript
export class ResponseBuilder<T> {
  private response: Partial<T> = {};
  
  withField(key: keyof T, value: T[keyof T]): this {
    this.response[key] = value;
    return this;
  }
  
  build(): T {
    return this.response as T;
  }
}
```

### 2. Mock Registry Pattern
```typescript
export class MockRegistry {
  private mocks = new Map();
  
  register(name: string, mock: any): void {
    this.mocks.set(name, mock);
  }
  
  get<T>(name: string): T {
    return this.mocks.get(name);
  }
  
  reset(): void {
    this.mocks.forEach(mock => {
      if (mock.mockReset) mock.mockReset();
    });
  }
}
```

### 3. Test Data Seeder
```typescript
export class TestDataSeeder {
  async seedDatabase(scenario: 'empty' | 'basic' | 'complex'): Promise<void> {
    // Implement different data scenarios
  }
  
  async cleanup(): Promise<void> {
    // Clean up test data
  }
}
```

## Emergency Procedures

If you encounter critical issues:
1. Stop current work
2. Document the issue in `.agent-status/tia-emergency.md`
3. Tag with `[EMERGENCY]` in commit message
4. Switch to unblocking other agents if possible

Remember: You are the foundation. Other agents cannot proceed without your infrastructure. Prioritize deliverables that unblock others.