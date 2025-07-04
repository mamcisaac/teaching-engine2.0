# Test Data Factory System

A comprehensive factory system for generating realistic test data for the Teaching Engine 2.0 application. This system provides factories for creating test data with support for:

- 🏭 Domain-specific factories for all major entities
- 🌍 Bilingual content generation (English/French)
- 🎭 Scenario-based testing
- ⚡ Performance testing with large datasets
- 🌱 Seed data generation for development

## Quick Start

### Basic Usage

```typescript
import { createFactories } from './tests/factories';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const factories = createFactories(prisma);

// Create a teacher
const teacher = await factories.user.create({
  name: 'Jane Smith',
  email: 'jane@school.ca'
});

// Create a lesson plan
const lesson = await factories.lessonPlan.create({
  userId: teacher.id,
  title: 'Introduction to Fractions',
  grade: 4,
  subject: 'Mathematics'
});
```

### Using Scenarios

```typescript
import { TeachingScenarios } from './tests/factories/scenarios/TeachingScenarios';

const scenarios = new TeachingScenarios(prisma);

// Set up a new teacher with everything they need
const setup = await scenarios.newTeacherSetup({
  grade: 3,
  subjects: ['Mathematics', 'Language', 'Science']
});

// Create a complete school year plan
const yearPlan = await scenarios.fullSchoolYearPlan({
  grade: 5,
  subjects: ['Mathematics', 'Language', 'Science', 'Social Studies']
});
```

### Seed Data Generation

```bash
# Minimal seed data (quick start)
pnpm seed:minimal

# Standard seed data (good for development)
pnpm seed:standard

# Comprehensive seed data with bilingual content
pnpm seed:comprehensive

# Performance testing data
pnpm seed:performance

# Clear database and reseed
pnpm seed:clear
```

## Factory Types

### Domain Factories

#### UserFactory
Creates teacher users with realistic Canadian school board data.

```typescript
const teacher = await factories.user.create();
const principal = await factories.user.createPrincipal();
const supplyTeacher = await factories.user.createSupplyTeacher();

// Create with specific preferences
const frenchTeacher = await factories.user.createWithPreferences({
  grades: [3, 4],
  subjects: ['French', 'Mathematics'],
  language: 'bilingual',
  experience: 'experienced'
});
```

#### CurriculumFactory
Creates Ontario curriculum expectations with proper structure.

```typescript
// Create a single expectation
const expectation = await factories.curriculum.create({
  grade: 4,
  subject: 'Mathematics',
  strand: 'Number Sense and Numeration'
});

// Create a full strand
const strand = await factories.curriculum.createStrand({
  subject: 'Science',
  grade: 3,
  strand: 'Life Systems',
  count: 10
});

// Create complete grade curriculum
const gradeCurriculum = await factories.curriculum.createGradeCurriculum(5);
```

#### LessonPlanFactory
Creates ETFO-aligned lesson plans with three-part structure.

```typescript
// Create a single lesson
const lesson = await factories.lessonPlan.create({
  title: 'Exploring Patterns',
  mindsOn: 'Number talk about patterns in nature',
  action: 'Hands-on pattern creation with manipulatives',
  consolidation: 'Gallery walk to share patterns'
});

// Create a week of lessons
const weekLessons = await factories.lessonPlan.createWeekOfLessons({
  userId: teacher.id,
  unitPlanId: unit.id,
  grade: 3,
  subject: 'Mathematics',
  startDate: new Date()
});

// Create substitute-friendly lessons
const subLessons = await factories.lessonPlan.createSubFriendlyLessons(5, {
  grade: 2,
  subject: 'Language'
});
```

#### UnitPlanFactory
Creates comprehensive unit plans with ETFO fields.

```typescript
// Create a unit plan
const unit = await factories.unitPlan.create({
  title: 'Habitats and Communities',
  bigIdeas: 'All living things depend on their environment',
  essentialQuestions: ['How do living things interact?'],
  crossCurricularConnections: 'Language (research writing), Art (habitat dioramas)'
});

// Create a term's worth of units
const termUnits = await factories.unitPlan.createTermUnits({
  userId: teacher.id,
  longRangePlanId: yearPlan.id,
  term: 1,
  grade: 4,
  subject: 'Science'
});
```

#### DaybookFactory
Creates daily reflections and teaching notes.

```typescript
// Create a daybook entry
const entry = await factories.daybook.create({
  date: new Date(),
  quickNotes: 'Great discussion during math today',
  observations: 'Students engaged with manipulatives',
  whatWorkedWell: 'Think-pair-share, visual aids',
  whatToImprove: 'Need more time for consolidation'
});

// Create entries for report card period
const reportCardEntries = await factories.daybook.createReportCardEntries({
  userId: teacher.id,
  numberOfWeeks: 10
});
```

### Scenario Factories

The `TeachingScenarios` class provides complete, realistic scenarios:

#### Available Scenarios

1. **New Teacher Setup** - Everything a new teacher needs to get started
2. **Full School Year Plan** - Complete planning for an academic year
3. **Substitute Teacher Day** - All materials for a supply teacher
4. **Parent-Teacher Conference** - Preparation materials for conferences
5. **Report Card Period** - Data and reflections for report writing
6. **Cross-Curricular Project** - Integrated learning across subjects
7. **French Immersion Classroom** - Bilingual teaching materials
8. **Special Education Support** - Differentiated instruction materials

### Bilingual Factory

Creates content in both English and French:

```typescript
const bilingual = factories.bilingual;

// Generate bilingual content
const content = bilingual.generateBilingualContent();

// Create French immersion lesson
const immersionLesson = bilingual.generateFrenchImmersionLesson({
  grade: 3,
  subject: 'mathematics',
  immersionLevel: 'middle' // 'early', 'middle', or 'late'
});

// Generate Quebec curriculum content
const quebecContent = bilingual.generateQuebecCurriculum({
  level: 'primaire',
  cycle: 2
});
```

### Performance Testing

Generate large-scale data for performance testing:

```typescript
const perfGenerator = new PerformanceDataGenerator(prisma);

// Generate school board data
await perfGenerator.generateSchoolBoardData({
  numberOfSchools: 10,
  teachersPerSchool: 30,
  yearsOfData: 3
});

// Generate stress test data
await perfGenerator.generateStressTestData({
  targetRecords: 1000000,
  concurrentUsers: 100
});

// Generate query performance test data
await perfGenerator.generateQueryPerformanceData();
```

## Configuration Options

### Factory Options

```typescript
interface FactoryOptions {
  locale?: 'en' | 'fr';      // Language for generated content
  seed?: number;              // Faker seed for reproducible data
  persist?: boolean;          // Whether to save to database
}
```

### Seed Options

```typescript
interface SeedOptions {
  mode: 'minimal' | 'standard' | 'comprehensive' | 'performance';
  includeTestUsers?: boolean;
  includeDemoData?: boolean;
  includeBilingualContent?: boolean;
}
```

## Best Practices

### For Unit Tests

```typescript
// Use factories without persistence for speed
const factories = createFactories(null, { persist: false });

// Generate deterministic data with seed
const factories = createFactories(null, { seed: 12345 });

// Clean up after tests
afterEach(async () => {
  await cleanupTestData(prisma);
});
```

### For Integration Tests

```typescript
// Use real database connections
const factories = createFactories(prisma);

// Create complete scenarios
const scenario = await scenarios.newTeacherSetup({
  grade: 4,
  subjects: ['Mathematics', 'Science']
});

// Test with realistic data volumes
const data = await factories.lessonPlan.createMany(50);
```

### For Development

```bash
# Start with standard seed
pnpm seed:standard

# Add bilingual content if needed
pnpm seed:comprehensive

# Reset if needed
pnpm seed:clear
```

## Advanced Usage

### Custom Scenarios

```typescript
// Create your own scenario
async function createCustomScenario(prisma: PrismaClient) {
  const factories = createFactories(prisma);
  
  // Create school
  const principal = await factories.user.createPrincipal();
  const teachers = await factories.user.createMany(20);
  
  // Create curriculum
  for (let grade = 1; grade <= 8; grade++) {
    await factories.curriculum.createGradeCurriculum(grade);
  }
  
  // Create planning for each teacher
  for (const teacher of teachers) {
    await scenarios.fullSchoolYearPlan({
      teacher,
      grade: Math.floor(Math.random() * 8) + 1
    });
  }
  
  return { principal, teachers };
}
```

### Batch Operations

```typescript
// Create many records efficiently
const lessons = await factories.lessonPlan.createMany(100, {
  subject: 'Mathematics',
  grade: 5
});

// Create related data in batches
const units = await factories.unitPlan.createTermUnits({
  userId: teacher.id,
  longRangePlanId: plan.id,
  term: 1,
  grade: 3,
  subject: 'Science'
});
```

### Testing Specific Features

```typescript
// Test substitute features
const subPlan = await factories.substitutePlan.createDetailedSubPlan({
  userId: teacher.id,
  date: tomorrow,
  grade: 4,
  includeEmergencyInfo: true,
  includeStudentInfo: true,
  includeSchedule: true
});

// Test report card features
const reportData = await scenarios.reportCardPeriod({
  teacher,
  term: 1,
  grade: 5
});

// Test French immersion
const immersion = await scenarios.frenchImmersionClassroom({
  grade: 2,
  percentFrench: 50
});
```

## Troubleshooting

### Common Issues

1. **Prisma Client Out of Sync**
   ```bash
   pnpm --filter @teaching-engine/database db:generate
   ```

2. **Seed Fails with Constraint Errors**
   - Check for existing data conflicts
   - Use `pnpm seed:clear` to reset

3. **Performance Tests Too Slow**
   - Reduce data volumes for development
   - Use batch operations
   - Consider using SQLite for tests

### Memory Issues

For large data generation:
```typescript
// Use batching
const batchSize = 100;
for (let i = 0; i < totalRecords; i += batchSize) {
  await factories.lessonPlan.createMany(batchSize);
  // Allow garbage collection
  if (i % 1000 === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

## Contributing

When adding new factories:

1. Extend `BaseFactory` for common functionality
2. Include realistic Canadian education data
3. Support bilingual content where appropriate
4. Add corresponding scenario methods
5. Update this documentation
6. Add tests for the factory

## License

Part of Teaching Engine 2.0 - See main project license.