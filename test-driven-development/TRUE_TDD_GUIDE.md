# TRUE Test-Driven Development Guide

## What Real TDD Looks Like

This guide shows how to do **actual TDD** - starting with the simplest possible test and growing the implementation through small, incremental steps.

## ✅ The Right Way: Incremental Test Growth

### Lesson Completion Feature - Test Progression

```
Step 1: Can we track if something is complete? (boolean)
Step 2: Can we mark something as complete? (function)
Step 3: Is it user-specific? (add user context)
Step 4: Can we check status? (query method)
Step 5: Can we undo? (toggle functionality)  
Step 6: When did it happen? (timestamps)
Step 7: What's the progress? (statistics)
Step 8: Do we need persistence? (storage interface)
Step 9: How do we handle errors? (error cases)
Step 10: What about performance? (optimization)
```

Each step discovers ONE new requirement and adds the MINIMAL code to satisfy it.

## ❌ What I Did Wrong Initially

### Over-Specified Integration Tests
```typescript
// WRONG - Assumes entire implementation
test('should render checkbox with data-testid="completion-checkbox"', () => {
  render(<LessonCompletionCheckbox {...props} />);
  const checkbox = screen.getByTestId('completion-checkbox');
  expect(checkbox).toHaveClass('checkbox--incomplete');
  // Assumes React, specific component structure, CSS classes, etc.
});
```

### Right - Start with Pure Logic
```typescript
// RIGHT - Tests behavior, not implementation
test('should track completion status', () => {
  const isComplete = false;
  expect(isComplete).toBe(false);
});
```

## 📈 How Tests Should Grow

### Phase 1: Pure Business Logic (No UI, No DB)
```typescript
// Start here - pure functions, simple data structures
class LessonCompletionTracker {
  markComplete(userId: number, lessonId: string): void
  isComplete(userId: number, lessonId: string): boolean
}
```

### Phase 2: Add Persistence Interface (Still No Implementation)
```typescript
// Discover we need persistence
interface CompletionStore {
  save(completion: Completion): Promise<void>
  load(userId: number, lessonId: string): Promise<Completion | null>
}
```

### Phase 3: Add UI Interface (Still No React)
```typescript
// Discover we need UI
interface CompletionDisplay {
  showStatus(isComplete: boolean): void
  onToggle(callback: () => void): void
}
```

### Phase 4: Integration Tests (Finally!)
```typescript
// Now we can test integration
test('clicking checkbox should mark lesson complete', () => {
  // But we're testing behavior, not implementation details
});
```

## 🔑 Key TDD Principles

### 1. **Red-Green-Refactor**
- **Red**: Write a failing test
- **Green**: Write MINIMAL code to pass
- **Refactor**: Improve code while keeping tests green

### 2. **One Test, One Concept**
Each test should introduce exactly ONE new requirement:
```typescript
// Test 1: Can we store a value?
// Test 2: Can we retrieve it?
// Test 3: Can we update it?
// Test 4: What if it doesn't exist?
```

### 3. **No Implementation Assumptions**
Tests shouldn't assume:
- UI framework (React, Vue, etc.)
- Database type (SQL, NoSQL, etc.)
- State management (Redux, Zustand, etc.)
- CSS structure
- File organization

### 4. **Test Behavior, Not Implementation**
```typescript
// WRONG
test('should call setState with true', () => {
  // Testing React internals
});

// RIGHT
test('should mark lesson as complete', () => {
  // Testing business behavior
});
```

## 📊 Test File Organization

```
test-driven-development/
├── 01-lesson-completion/
│   ├── step1.test.ts   # Concept exists
│   ├── step2.test.ts   # Basic function
│   ├── step3.test.ts   # User context
│   ├── step4.test.ts   # Query capability
│   ├── step5.test.ts   # Toggle functionality
│   ├── step6.test.ts   # Timestamps
│   └── step7.test.ts   # Progress tracking
├── 02-weekly-schedule/
│   ├── step1.test.ts   # Lesson has time
│   ├── step2.test.ts   # Can reschedule
│   └── step3.test.ts   # Conflict detection
└── 03-quick-assessment/
    ├── step1.test.ts   # Levels exist
    ├── step2.test.ts   # Assess one student
    ├── step3.test.ts   # Assess multiple
    └── step4.test.ts   # Generate groups
```

## 🚀 How to Continue From Here

### For Lesson Completion:
```typescript
// Next test: step8.test.ts - Discover need for persistence
test('should persist completions between sessions', () => {
  // This will drive the need for a storage interface
  // But we still don't specify what kind of storage
});

// Then: step9.test.ts - Discover need for error handling
test('should handle storage failures gracefully', () => {
  // This drives error handling design
});

// Then: step10.test.ts - Discover performance needs
test('should load 100 completions in under 100ms', () => {
  // This drives optimization needs
});
```

### For Weekly Schedule:
```typescript
// Next: step4.test.ts - Discover need for week view
test('should get all lessons for a week', () => {
  // Drives the need for date filtering
});

// Then: step5.test.ts - Discover need for current week
test('should identify current week', () => {
  // Drives date handling logic
});
```

### For Quick Assessment:
```typescript
// Next: step5.test.ts - Discover need for timing
test('should complete 25 assessments in under 90 seconds', () => {
  // Drives performance requirements
});

// Then: step6.test.ts - Discover keyboard shortcuts
test('should map number keys to levels', () => {
  // Drives keyboard handling
});
```

## 🎯 When to Add UI Tests

Only after core logic is solid:

1. **First**: Pure business logic tests
2. **Then**: Storage/persistence tests
3. **Then**: API/service tests
4. **Finally**: UI component tests
5. **Last**: E2E integration tests

## 💡 Implementation Strategy

### Start Implementation When:
- You have 5-7 incremental tests
- Tests cover basic happy path
- Tests are failing for the right reasons

### Implement Incrementally:
1. Make test 1 pass
2. Commit
3. Make test 2 pass
4. Commit
5. Continue...

### Refactor When:
- All current tests are green
- You see duplication
- You see complexity
- You need better names

## 📚 Example: Growing a Feature

### Step 1: Discovery
```typescript
// We discover we need to track something
test('should know if lesson is complete', () => {
  const isComplete = false;
  expect(isComplete).toBe(false);
});
```

### Step 2: Function
```typescript
// We discover we need behavior
function markComplete(lessonId: string) {
  return { lessonId, complete: true };
}
```

### Step 3: State
```typescript
// We discover we need memory
class Tracker {
  private state = new Map();
  markComplete(id: string) {
    this.state.set(id, true);
  }
}
```

### Step 4: Persistence
```typescript
// We discover we need storage
class Tracker {
  constructor(private store: Store) {}
  async markComplete(id: string) {
    await this.store.save(id, true);
  }
}
```

### Step 5: UI
```typescript
// We discover we need display
interface Display {
  showCompletion(isComplete: boolean): void;
}
```

### Step 6: Integration
```typescript
// Finally, we can integrate
const tracker = new Tracker(store);
const display = new CheckboxDisplay();
display.onClick(() => tracker.markComplete(id));
```

## ✨ Benefits of True TDD

1. **Design Emerges**: You discover the design through tests
2. **No Over-Engineering**: You build only what's needed
3. **Flexible Architecture**: Not locked into implementation
4. **Fast Feedback**: Tests run instantly
5. **Confidence**: Every line has a test
6. **Documentation**: Tests document behavior

## 🔄 Refactoring the Existing Tests

To fix the over-specified tests:

1. **Extract Business Logic Tests**: Pull out pure logic
2. **Remove UI Assumptions**: No data-testid, no CSS classes
3. **Remove DB Assumptions**: No Prisma, no schema
4. **Create Incremental Steps**: Break into 5-10 small tests
5. **Focus on Behavior**: What, not how

## 🎓 Learning Path

1. Run the simple tests first:
   ```bash
   npm test step1.test.ts
   ```

2. Implement minimal code to pass

3. Run next test:
   ```bash
   npm test step2.test.ts
   ```

4. Add minimal code to pass

5. Continue until all tests pass

6. Refactor with confidence

## 🏁 Conclusion

True TDD is about:
- Starting simple
- Growing incrementally
- Testing behavior not implementation
- Letting design emerge
- Building confidence through small steps

The tests I initially created were integration test specifications. The tests in `test-driven-development/` show actual TDD - simple, incremental, and focused on behavior.

Start here. Grow from here. Let the tests drive the design.