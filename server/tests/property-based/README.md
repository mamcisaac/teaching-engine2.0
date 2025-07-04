# Property-Based Testing with fast-check

This directory contains property-based tests for the Teaching Engine 2.0 project using [fast-check](https://fast-check.dev/), a JavaScript library for property-based testing.

## Overview

Property-based testing is a testing methodology where tests are written as properties (invariants) that should hold for all possible inputs, rather than testing specific input-output examples. This approach helps discover edge cases and ensures that business logic behaves correctly across a wide range of scenarios.

## Why Property-Based Testing?

### Traditional Testing Problems

- **Limited coverage**: Example-based tests only cover specific scenarios
- **Edge case blindness**: Developers often miss edge cases
- **Maintenance overhead**: Many individual test cases to maintain
- **False confidence**: Passing tests may not indicate comprehensive coverage

### Property-Based Testing Benefits

- **Comprehensive coverage**: Tests thousands of random inputs automatically
- **Edge case discovery**: Finds corner cases developers wouldn't think of
- **Documentation**: Properties serve as executable specifications
- **Regression prevention**: Once a bug is found, it's added to examples to prevent regression

## Project Structure

```
tests/property-based/
├── README.md                           # This file
├── utils/
│   ├── property-test-config.ts         # Test configuration settings
│   └── property-test-helpers.ts        # Helper functions for common patterns
├── arbitraries/
│   └── domain-arbitraries.ts           # Custom generators for domain objects
├── invariants/
│   └── data-model-invariants.property.test.ts    # Data model invariant tests
├── api/
│   └── api-contract.property.test.ts   # API contract tests
├── curriculum-expectation-validation.property.test.ts
├── lesson-plan-scheduling.property.test.ts
├── grade-progression-logic.property.test.ts
├── date-time-calculations.property.test.ts
└── assessment-calculations.property.test.ts
```

## Test Categories

### 1. Domain Logic Tests

- **Curriculum Expectation Validation**: Tests curriculum code formats, grade-subject alignment, bilingual consistency
- **Lesson Plan Scheduling**: Tests time constraints, conflict detection, resource scheduling
- **Grade Progression Logic**: Tests developmental appropriateness, complexity progression
- **Date/Time Calculations**: Tests temporal logic, school calendar operations
- **Assessment Calculations**: Tests score calculations, grade boundaries, statistical properties

### 2. Data Model Invariants

- **Data Integrity**: Tests that data models maintain required constraints
- **Business Rules**: Tests that business logic is enforced at the data level
- **Relationships**: Tests referential integrity between related entities
- **Serialization**: Tests that data survives JSON roundtrips

### 3. API Contract Tests

- **Request/Response Structure**: Tests consistent API response formats
- **Validation Logic**: Tests input validation and error handling
- **Authorization**: Tests role-based access control
- **Rate Limiting**: Tests API throttling behavior

## Writing Property Tests

### Basic Property Test

```typescript
import { fc } from '@fast-check/jest';
import { domainArbitraries } from './arbitraries/domain-arbitraries';

it('should maintain valid grade ranges', () => {
  fc.assert(
    fc.property(domainArbitraries.grade, (grade) => {
      // Property: All grades should be within elementary range (1-8)
      return grade >= 1 && grade <= 8;
    }),
    getPropertyTestConfig('fast'),
  );
});
```

### Using Custom Arbitraries

```typescript
it('should validate curriculum expectations', () => {
  fc.assert(
    fc.property(domainArbitraries.fullCurriculumExpectation, (expectation) => {
      // Property: Valid expectations have required fields
      return expectation.id && expectation.code && expectation.description.trim().length > 0;
    }),
  );
});
```

### Testing Relationships

```typescript
it('should maintain lesson-unit relationship integrity', () => {
  fc.assert(
    fc.property(
      domainArbitraries.unitPlan,
      fc.array(domainArbitraries.lessonPlan, { minLength: 1, maxLength: 10 }),
      (unit, lessons) => {
        // Property: Lessons should fall within unit timeframe
        return lessons.every(
          (lesson) => lesson.date >= unit.startDate && lesson.date <= unit.endDate,
        );
      },
    ),
  );
});
```

## Available Arbitraries

### Basic Types

- `grade`: Elementary grades (1-8)
- `subject`: Core curriculum subjects
- `language`: Language codes (en/fr)
- `academicYear`: Academic year strings (YYYY-YYYY)

### Time and Duration

- `schoolDay`: School days (Monday-Friday)
- `lessonDuration`: Reasonable lesson durations (15-120 minutes)
- `validTimeSlot`: Time slots within school hours
- `unitTimeline`: Realistic unit plan timelines

### Educational Content

- `curriculumExpectation`: Basic curriculum expectations
- `fullCurriculumExpectation`: Complete expectations with all fields
- `longRangePlan`: Yearly/term planning documents
- `unitPlan`: Unit-level planning documents
- `lessonPlan`: Individual lesson plans
- `daybookEntry`: Daily reflection entries

### Assessment

- `assessmentType`: Types of assessment (diagnostic/formative/summative)
- `rating`: 1-5 rating scales
- `percentage`: 0-100 percentage scores
- `achievementLevel`: Ontario curriculum levels

### Complex Constraints

- `curriculumProgression`: Grade-appropriate complexity progression
- `assessmentDistribution`: Balanced assessment ratios
- `validTimeSlot`: Time slots within school constraints

## Configuration Options

### Test Speed Configurations

```typescript
// Fast tests for CI/development (50 runs)
getPropertyTestConfig('fast');

// Thorough tests for comprehensive testing (500 runs)
getPropertyTestConfig('thorough');

// Smoke tests for quick verification (10 runs)
getPropertyTestConfig('smoke');

// Stress tests for edge case discovery (1000 runs)
getPropertyTestConfig('stress');
```

### Custom Configuration

```typescript
fc.assert(fc.property(arbitrary, predicate), {
  numRuns: 200,
  seed: 42,
  timeout: 10000,
  verbose: true,
});
```

## Property Pattern Helpers

### Common Patterns

```typescript
// Test invariants
validateInvariant('name', arbitrary, (value) => invariantCheck(value));

// Test roundtrip properties
testRoundtrip('name', arbitrary, serialize, deserialize);

// Test monotonicity
testMonotonicity('name', arbitrary, compare, transform);

// Test commutativity
testCommutativity('name', arbitrary, operation);

// Test associativity
testAssociativity('name', arbitrary, operation);

// Test contracts (precondition/postcondition)
testContract('name', arbitrary, operation, precondition, postcondition);

// Test metamorphic properties
testMetamorphic('name', arbitrary, operation, transform, relation);
```

## Running Property Tests

### All Property Tests

```bash
# Run all property-based tests
npm test -- tests/property-based

# Run with specific configuration
TEST_TYPE=unit npm test -- tests/property-based
```

### Specific Test Categories

```bash
# Curriculum validation tests
npm test -- tests/property-based/curriculum-expectation-validation.property.test.ts

# Scheduling constraint tests
npm test -- tests/property-based/lesson-plan-scheduling.property.test.ts

# Assessment calculation tests
npm test -- tests/property-based/assessment-calculations.property.test.ts
```

### Debug Mode

```bash
# Run with verbose output for debugging
DEBUG_TESTS=true npm test -- tests/property-based
```

## Educational Domain Properties

### Key Invariants Tested

#### Curriculum Properties

- **Code Format**: Curriculum codes follow Ontario format (e.g., "A1.2")
- **Grade Alignment**: Content complexity matches grade level
- **Subject Consistency**: Strands belong to appropriate subjects
- **Bilingual Integrity**: French translations are consistent with English

#### Scheduling Properties

- **Time Constraints**: Lessons fit within school hours (8 AM - 4 PM)
- **Duration Limits**: Lesson durations are pedagogically appropriate
- **Conflict Detection**: No overlapping time slots
- **Break Requirements**: Adequate transition time between lessons

#### Progression Properties

- **Complexity Scaling**: Content complexity increases with grade level
- **Prerequisite Flow**: Higher grades build on lower grade concepts
- **Attention Spans**: Lesson durations match developmental capabilities
- **Assessment Balance**: Appropriate formative/summative ratios

#### Assessment Properties

- **Score Validity**: All scores within 0-100 range
- **Grade Boundaries**: Consistent achievement level conversions
- **Statistical Properties**: Valid mean, standard deviation calculations
- **Weighted Averages**: Correct weight distribution in calculations

## Best Practices

### Writing Effective Properties

1. **Focus on Invariants**: Test properties that should always be true
2. **Use Domain Knowledge**: Leverage educational expertise in property design
3. **Test Edge Cases**: Properties naturally find boundary conditions
4. **Combine Properties**: Test relationships between different aspects
5. **Document Intent**: Clear property names and comments

### Property Design Patterns

1. **Validation Properties**: Data integrity and format checking
2. **Relationship Properties**: Cross-entity consistency
3. **Mathematical Properties**: Arithmetic and statistical correctness
4. **Temporal Properties**: Time-based logic and ordering
5. **Business Rule Properties**: Domain-specific constraints

### Performance Considerations

1. **Batch Related Tests**: Group similar properties together
2. **Use Appropriate Configurations**: Fast tests for development, thorough for CI
3. **Profile Slow Properties**: Identify and optimize expensive checks
4. **Cache Expensive Operations**: Reuse computations where possible

## Integration with Existing Tests

Property tests complement but don't replace traditional unit tests:

- **Unit Tests**: Test specific scenarios and edge cases
- **Property Tests**: Test general behaviors and invariants
- **Integration Tests**: Test system interactions
- **E2E Tests**: Test complete user workflows

## Debugging Failed Properties

When a property test fails:

1. **Examine the Counterexample**: fast-check provides the failing input
2. **Add it as a Unit Test**: Create a specific test for the failure case
3. **Fix the Implementation**: Address the underlying issue
4. **Verify the Fix**: Ensure the property now passes
5. **Add Examples**: Include the counterexample in future test runs

## Continuous Integration

Property tests are integrated into the CI pipeline:

```yaml
# Example CI configuration
- name: Run Property Tests
  run: |
    npm test -- tests/property-based
    npm run test:coverage -- tests/property-based
```

## Educational Testing Insights

Property-based testing is particularly valuable for educational software because:

1. **Complex Domain Rules**: Education has many interrelated constraints
2. **Data Relationships**: Curriculum, planning, and assessment are interconnected
3. **Edge Cases**: Grade transitions, special circumstances, multi-grade classes
4. **Regulatory Compliance**: Adherence to educational standards and policies
5. **Scalability**: Properties ensure system works across different scales

## Future Enhancements

Planned improvements to the property testing suite:

1. **Model-Based Testing**: State machine properties for user workflows
2. **Performance Properties**: Response time and throughput characteristics
3. **Concurrency Properties**: Multi-user interaction testing
4. **Database Properties**: Data consistency under concurrent access
5. **Integration Properties**: Cross-service interaction testing

## Resources

- [fast-check Documentation](https://fast-check.dev/)
- [Property-Based Testing](https://www.fstar-lang.org/tutorial/book/part2/part2_property_based_testing.html)
- [Domain-Driven Design](https://martinfowler.com/tags/domain%20driven%20design.html)
- [Educational Testing Standards](https://www.ontario.ca/page/ministry-education)

## Contributing

When adding new property tests:

1. **Identify Invariants**: What should always be true?
2. **Create Arbitraries**: Generate realistic test data
3. **Write Properties**: Express invariants as testable properties
4. **Document Intent**: Explain the educational significance
5. **Test Thoroughly**: Ensure properties find real issues

For questions or contributions, see the main project README or contact the development team.
