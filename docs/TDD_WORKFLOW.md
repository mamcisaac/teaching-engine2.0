# TDD Workflow Guide for Teaching Engine 2.0

> **Last Updated**: 2025-01-03  
> **Version**: 1.0  
> **Purpose**: Comprehensive guide to Test-Driven Development practices for the Teaching Engine 2.0 project

## Table of Contents

1. [Introduction to TDD](#introduction-to-tdd)
2. [RED-GREEN-REFACTOR Cycle](#red-green-refactor-cycle)
3. [Feature Implementation Workflow](#feature-implementation-workflow)
4. [TDD Patterns by Feature Type](#tdd-patterns-by-feature-type)
5. [Testing Commands and Coverage](#testing-commands-and-coverage)
6. [Mocking Strategies](#mocking-strategies)
7. [Best Practices](#best-practices)
8. [Common Pitfalls](#common-pitfalls)

## Introduction to TDD

Test-Driven Development (TDD) is **mandatory** for the Teaching Engine 2.0 project. This means:

- **Write tests FIRST** - Before implementing any feature
- **All tests must pass** - Never commit with failing tests
- **90%+ coverage required** - Non-negotiable for new code
- **Real-world testing** - Use actual databases and services, not just mocks

### Why TDD for Teaching Engine?

1. **Teacher Trust**: Real teachers depend on this software - bugs affect real classrooms
2. **Data Integrity**: We handle curriculum data and lesson plans that must be accurate
3. **Regulatory Compliance**: ETFO standards require reliable, tested software
4. **Maintainability**: Tests document expected behavior for future developers

## RED-GREEN-REFACTOR Cycle

### 🔴 RED Phase: Write a Failing Test

Write a test that describes the desired behavior. The test MUST fail initially.

```typescript
// Example: Testing a new curriculum import feature
// server/src/services/__tests__/curriculumService.test.ts

describe('CurriculumService', () => {
  describe('importETFOCurriculum', () => {
    it('should import ETFO curriculum data from CSV', async () => {
      // Arrange
      const csvData = `Grade,Subject,Strand,Expectation
        3,Mathematics,Number Sense,3.NS.1 - Count to 1000`;
      
      // Act
      const result = await curriculumService.importETFOCurriculum(csvData);
      
      // Assert
      expect(result.imported).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(result.curriculum[0]).toMatchObject({
        grade: '3',
        subject: 'Mathematics',
        strand: 'Number Sense',
        expectationCode: '3.NS.1'
      });
    });
  });
});
```

Run the test to ensure it fails:
```bash
pnpm test curriculumService.test.ts
# ❌ Test fails - importETFOCurriculum is not defined
```

### 🟢 GREEN Phase: Make the Test Pass

Write the **minimum** code necessary to make the test pass.

```typescript
// server/src/services/curriculumService.ts

export class CurriculumService {
  async importETFOCurriculum(csvData: string) {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const curriculum = [];
    const errors = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const [grade, subject, strand, expectation] = values;
      
      curriculum.push({
        grade,
        subject,
        strand,
        expectationCode: expectation.split(' - ')[0]
      });
    }
    
    return {
      imported: curriculum.length,
      errors,
      curriculum
    };
  }
}
```

Run the test again:
```bash
pnpm test curriculumService.test.ts
# ✅ Test passes!
```

### 🔵 REFACTOR Phase: Improve the Code

Now that the test passes, refactor for clarity, performance, and maintainability.

```typescript
// Refactored version with better error handling and validation
export class CurriculumService {
  private readonly CSV_HEADERS = ['Grade', 'Subject', 'Strand', 'Expectation'];
  
  async importETFOCurriculum(csvData: string): Promise<ImportResult> {
    const parser = new CSVParser(this.CSV_HEADERS);
    const { rows, errors: parseErrors } = parser.parse(csvData);
    
    const curriculum: CurriculumItem[] = [];
    const errors: ImportError[] = [...parseErrors];
    
    for (const [index, row] of rows.entries()) {
      try {
        const item = this.validateAndTransformRow(row, index);
        curriculum.push(item);
      } catch (error) {
        errors.push({
          line: index + 2,
          message: error.message,
          data: row
        });
      }
    }
    
    // Save to database
    if (curriculum.length > 0) {
      await this.saveCurriculumItems(curriculum);
    }
    
    return {
      imported: curriculum.length,
      errors,
      curriculum
    };
  }
  
  private validateAndTransformRow(row: Record<string, string>, index: number): CurriculumItem {
    const { Grade, Subject, Strand, Expectation } = row;
    
    if (!Grade || !Subject || !Strand || !Expectation) {
      throw new Error('Missing required fields');
    }
    
    const [expectationCode, description] = Expectation.split(' - ');
    
    return {
      grade: Grade,
      subject: Subject,
      strand: Strand,
      expectationCode: expectationCode.trim(),
      description: description?.trim() || ''
    };
  }
}
```

## Feature Implementation Workflow

### Step 1: Understand the Requirement

Before writing any code, clearly understand what needs to be built.

```markdown
Feature: AI-Generated Lesson Activities
- Teachers can request AI to generate activities for a lesson
- Activities must align with curriculum expectations
- Activities should be grade-appropriate
- Maximum 5 activities per request
```

### Step 2: Write Integration Test First

Start with a high-level integration test that describes the complete feature.

```typescript
// server/src/routes/__tests__/ai-activity-generation.integration.test.ts

describe('POST /api/ai/generate-activities', () => {
  it('should generate activities for a lesson plan', async () => {
    // Arrange
    const lessonPlan = await createTestLessonPlan({
      grade: '3',
      subject: 'Mathematics',
      expectations: ['3.NS.1', '3.NS.2']
    });
    
    // Act
    const response = await request(app)
      .post('/api/ai/generate-activities')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        lessonPlanId: lessonPlan.id,
        activityCount: 3
      });
    
    // Assert
    expect(response.status).toBe(200);
    expect(response.body.activities).toHaveLength(3);
    expect(response.body.activities[0]).toMatchObject({
      title: expect.any(String),
      description: expect.any(String),
      duration: expect.any(Number),
      materials: expect.any(Array),
      gradeAppropriate: true,
      alignedExpectations: expect.arrayContaining(['3.NS.1', '3.NS.2'])
    });
  });
});
```

### Step 3: Write Unit Tests for Components

Break down the feature into smaller units and test each one.

```typescript
// server/src/services/__tests__/aiActivityGenerator.test.ts

describe('AIActivityGenerator', () => {
  describe('generateActivities', () => {
    it('should create grade-appropriate prompts', () => {
      const prompt = generator.createPrompt({
        grade: '3',
        subject: 'Mathematics',
        expectations: ['3.NS.1'],
        activityCount: 2
      });
      
      expect(prompt).toContain('Grade 3');
      expect(prompt).toContain('Mathematics');
      expect(prompt).toContain('3.NS.1');
      expect(prompt).toContain('2 activities');
    });
    
    it('should parse AI response correctly', () => {
      const aiResponse = `
        Activity 1: Number Line Jump
        Description: Students physically jump on a floor number line
        Duration: 15 minutes
        Materials: Floor tape, number cards
      `;
      
      const activities = generator.parseResponse(aiResponse);
      
      expect(activities[0]).toMatchObject({
        title: 'Number Line Jump',
        description: expect.stringContaining('jump on a floor number line'),
        duration: 15,
        materials: ['Floor tape', 'number cards']
      });
    });
  });
});
```

### Step 4: Implement the Feature

Only after tests are written, implement the actual functionality.

```typescript
// server/src/services/aiActivityGenerator.ts

export class AIActivityGenerator {
  constructor(
    private openaiService: OpenAIService,
    private curriculumService: CurriculumService
  ) {}
  
  async generateActivities(params: GenerateActivitiesParams): Promise<Activity[]> {
    // Implementation driven by the tests
    const prompt = this.createPrompt(params);
    const response = await this.openaiService.complete(prompt);
    const activities = this.parseResponse(response);
    
    // Validate activities meet requirements
    return activities.map(activity => ({
      ...activity,
      gradeAppropriate: this.validateGradeLevel(activity, params.grade),
      alignedExpectations: params.expectations
    }));
  }
}
```

### Step 5: Run All Tests

Ensure both unit and integration tests pass.

```bash
# Run specific test file
pnpm test ai-activity-generation

# Run all tests
pnpm test

# Check coverage
pnpm test:coverage
```

## TDD Patterns by Feature Type

### CRUD Operations

```typescript
// Pattern: Test Create, Read, Update, Delete operations

describe('LessonPlanService', () => {
  let service: LessonPlanService;
  let prisma: PrismaClient;
  
  beforeEach(async () => {
    // Use real test database
    prisma = new PrismaClient({
      datasources: { db: { url: process.env.TEST_DATABASE_URL } }
    });
    service = new LessonPlanService(prisma);
  });
  
  afterEach(async () => {
    // Clean up test data
    await prisma.lessonPlan.deleteMany();
    await prisma.$disconnect();
  });
  
  describe('create', () => {
    it('should create a lesson plan with all required fields', async () => {
      const data = {
        title: 'Fractions Introduction',
        grade: '3',
        subject: 'Mathematics',
        duration: 60,
        objectives: ['Understand basic fractions'],
        teacherId: 'test-teacher-id'
      };
      
      const result = await service.create(data);
      
      expect(result.id).toBeDefined();
      expect(result.title).toBe(data.title);
      expect(result.createdAt).toBeInstanceOf(Date);
      
      // Verify it's actually in the database
      const dbRecord = await prisma.lessonPlan.findUnique({
        where: { id: result.id }
      });
      expect(dbRecord).toBeTruthy();
    });
    
    it('should validate required fields', async () => {
      const invalidData = { title: 'Test' }; // Missing required fields
      
      await expect(service.create(invalidData as any))
        .rejects
        .toThrow('Missing required fields');
    });
  });
  
  describe('update', () => {
    it('should update only provided fields', async () => {
      // Create test data
      const original = await service.create(validLessonPlanData);
      
      // Update specific fields
      const updates = { title: 'Updated Title', duration: 90 };
      const result = await service.update(original.id, updates);
      
      expect(result.title).toBe(updates.title);
      expect(result.duration).toBe(updates.duration);
      expect(result.subject).toBe(original.subject); // Unchanged
    });
  });
});
```

### Service Methods

```typescript
// Pattern: Test business logic with real dependencies

describe('ETFOPlanningService', () => {
  let service: ETFOPlanningService;
  let prisma: PrismaClient;
  
  beforeEach(async () => {
    prisma = await createTestDatabase();
    service = new ETFOPlanningService(prisma);
    
    // Seed test data
    await seedTestCurriculum(prisma);
  });
  
  describe('generateWeeklyPlan', () => {
    it('should create plans for each subject', async () => {
      const weekStart = new Date('2024-01-08'); // Monday
      const teacher = await createTestTeacher();
      
      const result = await service.generateWeeklyPlan({
        teacherId: teacher.id,
        weekStart,
        grade: '3',
        subjects: ['Mathematics', 'Language Arts']
      });
      
      expect(result.plans).toHaveLength(10); // 5 days × 2 subjects
      expect(result.plans[0].date).toEqual(weekStart);
      expect(result.plans[0].subject).toBe('Mathematics');
    });
    
    it('should align with curriculum expectations', async () => {
      const result = await service.generateWeeklyPlan(testParams);
      
      for (const plan of result.plans) {
        expect(plan.expectations).toBeDefined();
        expect(plan.expectations.length).toBeGreaterThan(0);
        expect(plan.expectations[0]).toMatch(/^\d\.[A-Z]+\.\d+$/);
      }
    });
  });
});
```

### API Endpoints

```typescript
// Pattern: Test full request/response cycle

describe('Calendar Events API', () => {
  let app: Express;
  let prisma: PrismaClient;
  let authToken: string;
  
  beforeAll(async () => {
    app = await createTestApp();
    prisma = getTestPrismaClient();
    authToken = await createTestAuthToken();
  });
  
  describe('GET /api/calendar/events', () => {
    it('should return events for date range', async () => {
      // Create test events
      await createTestEvents([
        { date: '2024-01-08', title: 'Math Lesson' },
        { date: '2024-01-09', title: 'Science Lab' },
        { date: '2024-01-15', title: 'Next Week Event' }
      ]);
      
      const response = await request(app)
        .get('/api/calendar/events')
        .query({
          startDate: '2024-01-08',
          endDate: '2024-01-10'
        })
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.events).toHaveLength(2);
      expect(response.body.events[0].title).toBe('Math Lesson');
    });
    
    it('should handle invalid date formats', async () => {
      const response = await request(app)
        .get('/api/calendar/events')
        .query({ startDate: 'invalid-date' })
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid date format');
    });
  });
  
  describe('POST /api/calendar/events', () => {
    it('should create recurring events', async () => {
      const eventData = {
        title: 'Weekly Math Review',
        startDate: '2024-01-08',
        endDate: '2024-02-08',
        recurrence: 'WEEKLY',
        dayOfWeek: 1 // Monday
      };
      
      const response = await request(app)
        .post('/api/calendar/events')
        .set('Authorization', `Bearer ${authToken}`)
        .send(eventData);
      
      expect(response.status).toBe(201);
      expect(response.body.created).toBe(5); // 5 Mondays in range
      
      // Verify in database
      const events = await prisma.calendarEvent.findMany({
        where: { title: eventData.title }
      });
      expect(events).toHaveLength(5);
    });
  });
});
```

### React Components

```typescript
// Pattern: Test user interactions and state changes

// client/src/components/__tests__/LessonPlanner.test.tsx

describe('LessonPlanner Component', () => {
  let mockServer: MockServiceWorker;
  
  beforeAll(() => {
    mockServer = setupMockServer();
  });
  
  beforeEach(() => {
    mockServer.resetHandlers();
  });
  
  it('should display curriculum expectations when grade is selected', async () => {
    // Mock API response
    mockServer.use(
      rest.get('/api/curriculum/expectations', (req, res, ctx) => {
        return res(ctx.json({
          expectations: [
            { code: '3.NS.1', description: 'Count to 1000' },
            { code: '3.NS.2', description: 'Add and subtract' }
          ]
        }));
      })
    );
    
    render(<LessonPlanner />);
    
    // Select grade
    const gradeSelect = screen.getByLabelText('Grade Level');
    await userEvent.selectOptions(gradeSelect, '3');
    
    // Wait for expectations to load
    await waitFor(() => {
      expect(screen.getByText('3.NS.1 - Count to 1000')).toBeInTheDocument();
    });
    
    // Verify UI state
    expect(screen.getByText('3.NS.2 - Add and subtract')).toBeInTheDocument();
  });
  
  it('should validate form before submission', async () => {
    render(<LessonPlanner />);
    
    // Try to submit without required fields
    const submitButton = screen.getByRole('button', { name: 'Create Lesson' });
    await userEvent.click(submitButton);
    
    // Check validation messages
    expect(screen.getByText('Title is required')).toBeInTheDocument();
    expect(screen.getByText('Please select a grade')).toBeInTheDocument();
    
    // Verify form wasn't submitted
    expect(mockServer.handlers).not.toContainEqual(
      expect.objectContaining({ method: 'POST' })
    );
  });
  
  it('should handle API errors gracefully', async () => {
    mockServer.use(
      rest.post('/api/lessons', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    render(<LessonPlanner />);
    
    // Fill form
    await userEvent.type(screen.getByLabelText('Title'), 'Test Lesson');
    await userEvent.selectOptions(screen.getByLabelText('Grade'), '3');
    
    // Submit
    await userEvent.click(screen.getByRole('button', { name: 'Create Lesson' }));
    
    // Check error handling
    await waitFor(() => {
      expect(screen.getByText('Failed to create lesson. Please try again.')).toBeInTheDocument();
    });
  });
});
```

## Testing Commands and Coverage

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (great for TDD)
pnpm test:watch

# Run specific test file
pnpm test lessonPlanService.test.ts

# Run tests matching pattern
pnpm test -- --grep "should create"

# Run tests for specific workspace
pnpm --filter server test
pnpm --filter client test
```

### Coverage Requirements

```bash
# Generate coverage report
pnpm test:coverage

# Coverage thresholds (configured in jest.config.js)
# - Statements: 90%
# - Branches: 85%
# - Functions: 90%
# - Lines: 90%
```

Example coverage report:
```
---------------------------|---------|----------|---------|---------|-------------------
File                       | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------------------|---------|----------|---------|---------|-------------------
All files                  |   92.45 |    87.23 |   91.67 |   92.31 |
 services/                 |   94.12 |    88.89 |   93.75 |   94.03 |
  aiActivityGenerator.ts   |   95.24 |    90.00 |   94.44 |   95.12 | 47,112
  curriculumService.ts     |   93.02 |    87.50 |   92.86 |   92.86 | 89-91,156
 routes/                   |   90.77 |    85.71 |   89.47 |   90.63 |
  lessons.ts               |   91.30 |    86.67 |   90.00 |   91.18 | 67,134-136
```

### Checking Specific Coverage

```bash
# Check coverage for a specific file
pnpm test -- --coverage --collectCoverageFrom="**/curriculumService.ts"

# Generate HTML coverage report
pnpm test:coverage
open coverage/lcov-report/index.html
```

## Mocking Strategies

### Prisma Mocking

```typescript
// For unit tests - mock Prisma client
// server/tests/mocks/prisma.mock.ts

export const prismaMock = {
  lessonPlan: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  },
  $transaction: jest.fn((callback) => callback(prismaMock)),
  $disconnect: jest.fn()
};

// Usage in tests
import { prismaMock } from '../mocks/prisma.mock';

describe('LessonPlanService (Unit)', () => {
  const service = new LessonPlanService(prismaMock as any);
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should create lesson plan', async () => {
    const mockLesson = { id: '123', title: 'Test' };
    prismaMock.lessonPlan.create.mockResolvedValue(mockLesson);
    
    const result = await service.create({ title: 'Test' });
    
    expect(prismaMock.lessonPlan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ title: 'Test' })
    });
    expect(result).toBe(mockLesson);
  });
});
```

### OpenAI Mocking

```typescript
// server/tests/mocks/openai.mock.ts

export class MockOpenAIService {
  async generateCompletion(prompt: string): Promise<string> {
    // Return predictable responses based on prompt content
    if (prompt.includes('generate activities')) {
      return `
        Activity 1: Math Manipulatives
        Description: Use blocks to understand fractions
        Duration: 20 minutes
        Materials: Fraction blocks, worksheets
      `;
    }
    
    if (prompt.includes('lesson objectives')) {
      return `
        1. Students will understand basic fraction concepts
        2. Students will identify fractions in everyday objects
        3. Students will compare simple fractions
      `;
    }
    
    return 'Mock response';
  }
}

// For integration tests - use test API key
const testOpenAIService = new OpenAIService({
  apiKey: process.env.TEST_OPENAI_API_KEY,
  maxTokens: 100 // Limit for cost control
});
```

### External API Mocking

```typescript
// Using MSW (Mock Service Worker) for HTTP mocking
// server/tests/mocks/handlers.ts

import { rest } from 'msw';

export const handlers = [
  // Mock curriculum API
  rest.get('https://api.ontario.ca/curriculum/*', (req, res, ctx) => {
    return res(
      ctx.json({
        expectations: [
          { code: '3.NS.1', description: 'Number sense expectation' }
        ]
      })
    );
  }),
  
  // Mock weather API for outdoor activities
  rest.get('https://api.weather.com/*', (req, res, ctx) => {
    return res(
      ctx.json({
        temperature: 22,
        conditions: 'sunny',
        suitable_for_outdoor: true
      })
    );
  })
];

// Setup in tests
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Database Mocking Strategies

```typescript
// Strategy 1: Use test database (recommended)
beforeEach(async () => {
  // Reset to known state
  await prisma.$executeRaw`TRUNCATE TABLE "LessonPlan" CASCADE`;
  await seedTestData();
});

// Strategy 2: Use transactions (rollback after test)
describe('with transaction rollback', () => {
  let tx: Prisma.TransactionClient;
  
  beforeEach(async () => {
    tx = await prisma.$transaction(async (prisma) => {
      // Return transaction client
      return prisma;
    });
  });
  
  afterEach(async () => {
    // Rollback transaction
    await tx.$queryRaw`ROLLBACK`;
  });
  
  it('should test without affecting database', async () => {
    await tx.lessonPlan.create({ data: testData });
    // Test runs in transaction
  });
});

// Strategy 3: In-memory SQLite for unit tests
const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file::memory:?cache=shared'
    }
  }
});
```

## Best Practices

### 1. Test Naming Conventions

```typescript
// Use descriptive test names that explain the expected behavior
describe('ComponentOrService', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Test implementation
    });
    
    it('should throw [ErrorType] when [invalid condition]', () => {
      // Error case test
    });
  });
});

// Good examples:
it('should calculate tax correctly for Ontario residents');
it('should return 401 when authentication token is missing');
it('should display loading spinner while fetching data');

// Bad examples:
it('works');
it('test case 1');
it('error handling');
```

### 2. Test Structure - AAA Pattern

```typescript
it('should generate lesson plan from template', async () => {
  // Arrange - Set up test data and conditions
  const template = await createTestTemplate({
    grade: '3',
    subject: 'Science',
    topic: 'Plant Growth'
  });
  const teacher = await createTestTeacher();
  
  // Act - Execute the function being tested
  const result = await lessonService.generateFromTemplate({
    templateId: template.id,
    teacherId: teacher.id,
    date: '2024-01-15'
  });
  
  // Assert - Verify the results
  expect(result).toBeDefined();
  expect(result.title).toContain('Plant Growth');
  expect(result.grade).toBe('3');
  expect(result.activities).toHaveLength(3);
});
```

### 3. Test Independence

```typescript
// Bad - Tests depend on execution order
let sharedUser;

it('should create user', async () => {
  sharedUser = await userService.create({ name: 'Test' });
});

it('should update user', async () => {
  // This fails if previous test didn't run
  await userService.update(sharedUser.id, { name: 'Updated' });
});

// Good - Each test is independent
describe('UserService', () => {
  let user;
  
  beforeEach(async () => {
    // Fresh setup for each test
    user = await createTestUser();
  });
  
  afterEach(async () => {
    // Clean up
    await deleteTestUser(user.id);
  });
  
  it('should update user name', async () => {
    const result = await userService.update(user.id, { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });
});
```

### 4. Testing Edge Cases

```typescript
describe('DateUtility', () => {
  describe('getSchoolDays', () => {
    it('should handle regular week', async () => {
      const days = getSchoolDays('2024-01-08', '2024-01-12');
      expect(days).toBe(5);
    });
    
    it('should exclude weekends', async () => {
      const days = getSchoolDays('2024-01-06', '2024-01-14'); // Sat to Sun
      expect(days).toBe(5); // Only Mon-Fri
    });
    
    it('should handle holidays', async () => {
      // Seed holiday data
      await createHoliday('2024-01-08', 'Test Holiday');
      
      const days = getSchoolDays('2024-01-08', '2024-01-12');
      expect(days).toBe(4); // Excluding Monday holiday
    });
    
    it('should handle invalid date ranges', async () => {
      expect(() => getSchoolDays('2024-01-12', '2024-01-08'))
        .toThrow('End date must be after start date');
    });
    
    it('should handle DST transitions', async () => {
      // Test around daylight saving time changes
      const days = getSchoolDays('2024-03-10', '2024-03-15');
      expect(days).toBe(5);
    });
  });
});
```

### 5. Async Testing Best Practices

```typescript
// Always use async/await for clarity
it('should fetch user data', async () => {
  const user = await userService.getById('123');
  expect(user.name).toBe('Test User');
});

// Handle promise rejections properly
it('should throw error for invalid user', async () => {
  await expect(userService.getById('invalid'))
    .rejects
    .toThrow('User not found');
});

// Wait for specific conditions
it('should update UI after save', async () => {
  render(<UserForm />);
  
  await userEvent.type(screen.getByLabelText('Name'), 'New Name');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));
  
  // Wait for async update
  await waitFor(() => {
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });
});

// Set appropriate timeouts for slow operations
it('should process large dataset', async () => {
  const result = await processLargeDataset();
  expect(result.processed).toBe(10000);
}, 30000); // 30 second timeout
```

## Common Pitfalls

### 1. Testing Implementation Instead of Behavior

```typescript
// Bad - Testing implementation details
it('should call calculateTax method', () => {
  const spy = jest.spyOn(service, 'calculateTax');
  service.processOrder(order);
  expect(spy).toHaveBeenCalled();
});

// Good - Testing behavior/outcomes
it('should apply correct tax to order total', () => {
  const order = { subtotal: 100, province: 'ON' };
  const result = service.processOrder(order);
  expect(result.tax).toBe(13); // 13% HST in Ontario
  expect(result.total).toBe(113);
});
```

### 2. Not Cleaning Up Test Data

```typescript
// Bad - Leaves test data in database
it('should create lesson', async () => {
  const lesson = await lessonService.create({ title: 'Test' });
  expect(lesson.id).toBeDefined();
  // No cleanup!
});

// Good - Always clean up
it('should create lesson', async () => {
  const lesson = await lessonService.create({ title: 'Test' });
  expect(lesson.id).toBeDefined();
  
  // Cleanup
  await lessonService.delete(lesson.id);
});

// Better - Use afterEach
afterEach(async () => {
  await prisma.lessonPlan.deleteMany({
    where: { title: { startsWith: 'Test' } }
  });
});
```

### 3. Overmocking

```typescript
// Bad - Mocking everything
it('should save user', async () => {
  const mockSave = jest.fn().mockResolvedValue({ id: '123' });
  const mockValidate = jest.fn().mockReturnValue(true);
  const mockHash = jest.fn().mockReturnValue('hashed');
  
  // This doesn't test anything meaningful
});

// Good - Mock only external dependencies
it('should save user with hashed password', async () => {
  // Only mock the password hashing service
  jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password');
  
  // Use real database
  const user = await userService.create({
    email: 'test@example.com',
    password: 'plaintext'
  });
  
  // Verify actual database record
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  });
  expect(dbUser.password).toBe('hashed-password');
});
```

### 4. Ignoring Error Cases

```typescript
// Bad - Only testing happy path
describe('EmailService', () => {
  it('should send email', async () => {
    const result = await emailService.send({
      to: 'test@example.com',
      subject: 'Test'
    });
    expect(result.sent).toBe(true);
  });
});

// Good - Test error scenarios
describe('EmailService', () => {
  it('should handle invalid email addresses', async () => {
    await expect(emailService.send({
      to: 'invalid-email',
      subject: 'Test'
    })).rejects.toThrow('Invalid email address');
  });
  
  it('should retry on temporary failures', async () => {
    // Mock first call to fail, second to succeed
    jest.spyOn(smtpClient, 'send')
      .mockRejectedValueOnce(new Error('Temporary failure'))
      .mockResolvedValueOnce({ messageId: '123' });
    
    const result = await emailService.send(validEmail);
    expect(result.sent).toBe(true);
    expect(smtpClient.send).toHaveBeenCalledTimes(2);
  });
  
  it('should handle rate limiting', async () => {
    // Send many emails
    const promises = Array(10).fill(null).map(() => 
      emailService.send(validEmail)
    );
    
    const results = await Promise.allSettled(promises);
    const rejected = results.filter(r => r.status === 'rejected');
    expect(rejected.length).toBeGreaterThan(0);
    expect(rejected[0].reason).toContain('Rate limit');
  });
});
```

### 5. Flaky Time-Dependent Tests

```typescript
// Bad - Depends on current time
it('should create event for today', () => {
  const event = eventService.createTodayEvent();
  expect(event.date).toBe(new Date().toISOString().split('T')[0]);
  // Fails at midnight!
});

// Good - Control time in tests
it('should create event for today', () => {
  // Mock current time
  const mockDate = new Date('2024-01-15T10:00:00');
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
  
  const event = eventService.createTodayEvent();
  expect(event.date).toBe('2024-01-15');
  
  jest.useRealTimers();
});

// Alternative - Inject date dependency
it('should create event for given date', () => {
  const event = eventService.createEvent({
    date: new Date('2024-01-15')
  });
  expect(event.date).toBe('2024-01-15');
});
```

## Summary

Test-Driven Development is not just a requirement for Teaching Engine 2.0 - it's a fundamental practice that ensures we deliver reliable, high-quality software to teachers. By following these patterns and practices:

1. **Always write tests first** - Let tests drive your design
2. **Keep tests simple and focused** - One assertion per test when possible
3. **Test behavior, not implementation** - Focus on what, not how
4. **Use real dependencies when practical** - Especially databases
5. **Clean up after tests** - Don't pollute the test environment
6. **Test edge cases and errors** - Not just the happy path
7. **Maintain high coverage** - 90%+ is the standard
8. **Run tests frequently** - After every change

Remember: If it's not tested, it's broken. Teachers depend on this software working correctly every single day.

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library Docs](https://testing-library.com/docs/)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- Project test examples: `/server/src/**/__tests__/`
- Mock implementations: `/server/tests/mocks/`