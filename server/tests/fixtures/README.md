# Test Fixtures and Data Utilities

This directory contains a comprehensive test data infrastructure for the Teaching Engine 2.0 project. It provides factories, builders, seeders, and utilities for creating consistent, realistic test data that aligns with the ETFO planning hierarchy.

## 📁 Directory Structure

```
tests/fixtures/
├── README.md                    # This file
├── index.ts                     # Main export point
├── modern-factories.ts          # Factory functions for all models
├── test-data-builders.ts        # Fluent builder interfaces
├── integration-seeder.ts        # Integration test data seeding
├── test-data-utilities.ts       # Utilities and helpers
└── [data-files]/               # JSON fixture data
    ├── users.json
    ├── subjects.json
    ├── students.json
    ├── curriculum-expectations.json
    ├── external-activities.json
    ├── calendar-events.json
    └── class-routines.json
```

## 🚀 Quick Start

### Basic Test Setup

```typescript
import testFixtures from '../fixtures';

describe('My Test Suite', () => {
  afterEach(async () => {
    await testFixtures.cleanup.tracked();
  });

  it('should work with minimal setup', async () => {
    const { teacher, students } = await testFixtures.setup.minimal();
    
    expect(teacher).toBeDefined();
    expect(students).toHaveLength(2);
  });
});
```

### English Classroom Setup

```typescript
import { quickSetup } from '../fixtures';

describe('English Classroom Tests', () => {
  it('should create complete English classroom', async () => {
    const classroom = await quickSetup.englishClassroom();
    
    expect(classroom.teacher.preferredLanguage).toBe('en');
    expect(classroom.students).toHaveLength(8);
    expect(classroom.planning.lessonPlans.length).toBeGreaterThan(0);
  });
});
```

### French Immersion Setup

```typescript
import { quickSetup } from '../fixtures';

describe('French Immersion Tests', () => {
  it('should create French immersion classroom', async () => {
    const classroom = await quickSetup.frenchClassroom();
    
    expect(classroom.teacher.preferredLanguage).toBe('fr');
    expect(classroom.teacher.name).toBe('Mme. Dubois');
  });
});
```

## 🏗️ Builder Pattern Usage

The builder pattern provides a fluent interface for creating test data:

### Creating Users

```typescript
import { builders } from '../fixtures';

// Create a teacher
const teacher = await builders.user()
  .teacher()
  .withName('Ms. Johnson')
  .withEmail('teacher@example.com')
  .preferEnglish()
  .create();

// Create an admin
const admin = await builders.user()
  .admin()
  .withName('Dr. Principal')
  .preferFrench()
  .create();
```

### Creating Students

```typescript
import { builders } from '../fixtures';

const student = await builders.student()
  .withName('Emma', 'Johnson')
  .inGrade(3)
  .forTeacher(teacherId)
  .create();
```

### Creating Curriculum Expectations

```typescript
import { builders } from '../fixtures';

const mathExpectation = await builders.curriculumExpectation()
  .withCode('3.N1.1')
  .withDescription('Count to 1000')
  .mathematics()
  .forGrade(3)
  .create();

const englishExpectation = await builders.curriculumExpectation()
  .withCode('3.R1.1')
  .withDescription('Use phonics to decode words')
  .english()
  .forGrade(3)
  .create();
```

### Creating Planning Hierarchy

```typescript
import { builders } from '../fixtures';

// Create long range plan
const longRangePlan = await builders.longRangePlan()
  .withTitle('Grade 3 Mathematics')
  .forAcademicYear('2024-2025')
  .fullYear()
  .forGrade(3)
  .forSubject('Mathematics')
  .forTeacher(teacherId)
  .withThemes(['Number Sense', 'Algebra', 'Geometry'])
  .create();

// Create unit plan
const unitPlan = await builders.unitPlan()
  .withTitle('Number Sense and Counting')
  .forLongRangePlan(longRangePlan.id)
  .forTeacher(teacherId)
  .withDuration(startDate, endDate)
  .withEstimatedHours(20)
  .withBigIdeas('Numbers help us understand quantities')
  .withEssentialQuestions(['How do we use numbers?'])
  .create();

// Create lesson plan
const lessonPlan = await builders.etfoLessonPlan()
  .withTitle('Counting to 100')
  .forUnit(unitPlan.id)
  .forTeacher(teacherId)
  .onDate(new Date())
  .withDuration(60)
  .forGrade(3)
  .forSubject('Mathematics')
  .inLanguage('en')
  .withMindsOn('Review counting strategies')
  .withAction('Practice counting with manipulatives')
  .withConsolidation('Share counting strategies')
  .withLearningGoals('Count accurately to 100')
  .withMaterials(['counting bears', 'charts'])
  .wholeClass()
  .formativeAssessment()
  .subFriendly()
  .create();
```

### Creating Daybook Entries

```typescript
import { builders } from '../fixtures';

const daybookEntry = await builders.daybookEntry()
  .forDate(new Date())
  .forLesson(lessonPlan.id)
  .forTeacher(teacherId)
  .whatWorked('Students engaged with manipulatives')
  .whatDidntWork('Some needed more scaffolding')
  .nextSteps('Provide additional practice')
  .studentEngagement('High participation')
  .withRating(4)
  .wouldReuse()
  .create();
```

## 🏭 Factory Pattern Usage

Factories provide simple creation of entities with sensible defaults:

```typescript
import { modernFactories } from '../fixtures';

// Create multiple entities quickly
const users = await modernFactories.user.createMany(5);
const students = await modernFactories.student.createMany(10, { grade: 3 });
const expectations = await modernFactories.curriculumExpectation.createMany(8, {
  subject: 'Mathematics',
  grade: 3
});

// Create from fixture data
const mathSubject = await modernFactories.subject.createFromFixture('math', {
  userId: teacherId
});

const tptActivity = await modernFactories.externalActivity.createFromFixture('tpt-activity-1');
```

## 🌱 Integration Seeding

For integration tests that need comprehensive realistic data:

```typescript
import { integrationSeeder } from '../fixtures';

describe('Integration Tests', () => {
  let schoolData;

  beforeAll(async () => {
    schoolData = await integrationSeeder.createSchoolEnvironment();
  });

  afterAll(async () => {
    await integrationSeeder.cleanup();
  });

  it('should have complete school environment', () => {
    expect(schoolData.teachers.english).toBeDefined();
    expect(schoolData.teachers.french).toBeDefined();
    expect(schoolData.students.english.length).toBe(6);
    expect(schoolData.students.french.length).toBe(6);
  });
});
```

## 🧪 Test Data Management

The `TestDataManager` tracks created entities for automatic cleanup:

```typescript
import { testDataManager } from '../fixtures';

describe('Managed Test Data', () => {
  afterEach(async () => {
    await testDataManager.cleanup(); // Cleans up all tracked entities
  });

  it('should create and track entities', async () => {
    const teacher = await testDataManager.createUser({ role: 'teacher' });
    const students = await Promise.all([
      testDataManager.createStudent({ userId: teacher.id }),
      testDataManager.createStudent({ userId: teacher.id }),
    ]);

    // All entities are automatically tracked for cleanup
    expect(testDataManager.getCreatedEntities('user')).toHaveLength(1);
    expect(testDataManager.getCreatedEntities('student')).toHaveLength(2);
  });
});
```

## ✅ Data Validation

Validate test data integrity:

```typescript
import { validation } from '../fixtures';

it('should validate planning hierarchy', async () => {
  const hierarchy = await createPlanningHierarchy();
  
  const result = await validation.planningHierarchy(hierarchy.longRangePlan.id);
  
  expect(result.valid).toBe(true);
  expect(result.issues).toHaveLength(0);
  expect(result.summary.expectationCount).toBeGreaterThan(0);
});

it('should validate user data', async () => {
  const teacher = await createTeacher();
  
  const result = await validation.userData(teacher.id);
  
  expect(result.valid).toBe(true);
  expect(result.summary.subjectCount).toBeGreaterThan(0);
});
```

## 🎲 Data Generation

Generate realistic test data patterns:

```typescript
import { generators } from '../fixtures';

// Generate student names
const names = generators.studentNames(10, 'en');
// Returns: [['Emma', 'Johnson'], ['Liam', 'Chen'], ...]

const frenchNames = generators.studentNames(5, 'fr');
// Returns: [['Gabriel', 'Dubois'], ['Camille', 'Martin'], ...]

// Generate lesson content
const mathContent = generators.lessonContent('Mathematics', 3, 1);
// Returns: { mindsOn: '...', action: '...', consolidation: '...' }

// Generate assessment rubric
const rubric = generators.assessmentRubric('Mathematics');
// Returns: { criteria: [...], subject: 'Mathematics' }
```

## 🔧 Utility Functions

Quick utility functions for common patterns:

```typescript
import { testUtils } from '../fixtures';

// Quick teacher creation
const teacher = await testUtils.createTestTeacher('Ms. Smith', 'en');

// Quick student creation
const students = await testUtils.createTestStudents(teacher.id, 5, 3);

// Verify clean database
const isClean = await testUtils.verifyCleanDatabase();

// Quick minimal setup
const { teacher, students, subject } = await testUtils.quickTestSetup();
```

## 📊 Scenario Building

Create complex scenarios with the scenario builder:

```typescript
import { builders } from '../fixtures';

const scenario = await builders.scenario()
  .withTeacher('Ms. Johnson', 'en')
  .then(s => s.withStudents(6, 3))
  .then(s => s.withSubjects(['math', 'english', 'science']))
  .then(s => s.withMathPlanningHierarchy())
  .then(s => s.build());

// Access all created data
console.log(scenario.teacher);
console.log(scenario.students);
console.log(scenario.longRangePlans);
console.log(scenario.lessonPlans);
```

## 🧹 Cleanup Strategies

Different cleanup approaches for different test types:

```typescript
// 1. Tracked cleanup (recommended for most tests)
afterEach(async () => {
  await testDataManager.cleanup();
});

// 2. Full cleanup (for integration tests)
afterAll(async () => {
  await integrationSeeder.cleanup();
});

// 3. Verification cleanup (ensure clean state)
beforeEach(async () => {
  const isClean = await testUtils.verifyCleanDatabase();
  if (!isClean) {
    throw new Error('Database not clean before test');
  }
});
```

## 💡 Best Practices

1. **Use the Right Tool**: 
   - Builders for complex, customized entities
   - Factories for simple entities with defaults
   - Quick setup for rapid prototyping

2. **Clean Up Properly**:
   - Always clean up test data after tests
   - Use `testDataManager` for automatic tracking
   - Verify database is clean before important tests

3. **Be Realistic**:
   - Use fixture data for realistic content
   - Generate appropriate names and content
   - Follow ETFO planning hierarchy properly

4. **Test Performance**:
   - Use bulk creation methods for large datasets
   - Consider seeding shared data in `beforeAll`
   - Clean up only what you need to

5. **Validate Data**:
   - Use validation utilities to ensure data integrity
   - Assert on important relationships
   - Check for orphaned data

## 🔍 Examples by Use Case

### Unit Tests
```typescript
import { modernFactories } from '../fixtures';

it('should calculate correctly', async () => {
  const user = await modernFactories.user.create();
  const expectation = await modernFactories.curriculumExpectation.create();
  
  // Test logic here
});
```

### Integration Tests
```typescript
import { quickSetup } from '../fixtures';

it('should handle complete workflow', async () => {
  const classroom = await quickSetup.etfoPlanning();
  
  // Test full workflow
});
```

### E2E Tests
```typescript
import { integrationSeeder } from '../fixtures';

beforeAll(async () => {
  await integrationSeeder.createSchoolEnvironment();
});
```

## 📚 Additional Resources

- See individual files for detailed API documentation
- Check test files for usage examples
- Refer to the main schema for data relationships
- Review ETFO documentation for planning hierarchy details

## 🤝 Contributing

When adding new test utilities:

1. Follow the established patterns
2. Add comprehensive JSDoc comments
3. Include usage examples
4. Update this README
5. Add validation for new entities
6. Consider both English and French scenarios