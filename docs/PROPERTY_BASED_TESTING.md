# Property-Based Testing with Fast-Check

This document describes the property-based testing infrastructure implemented for Teaching Engine 2.0 using the fast-check library.

## Overview

Property-based testing is a testing methodology where you describe the properties (invariants) your code should satisfy, and the testing framework automatically generates hundreds of test cases to verify these properties hold true.

Unlike traditional example-based testing where you provide specific inputs and expected outputs, property-based testing focuses on:
- **Properties**: General rules that should always be true
- **Generators**: Functions that create diverse test data
- **Invariants**: Conditions that must remain constant
- **Shrinking**: Automatic simplification of failing test cases

## Quick Start

### Running Property Tests

```bash
# Run all property tests
pnpm test -- --testNamePattern="property"

# Run specific property test files
pnpm test src/utils/__tests__/date-utils.property.test.ts
pnpm test src/services/__tests__/curriculum.property.test.ts
pnpm test src/services/__tests__/assessment.property.test.ts

# Run with custom configuration
pnpm test -- --testNamePattern="property" --verbose
```

### Basic Usage

```typescript
import fc from 'fast-check';
import { arbitraries, runPropertyTest } from '../test-utils/property-test-utils';

// Simple property test
const property = fc.property(
  arbitraries.grade(),
  (grade) => {
    return grade >= 1 && grade <= 8; // Elementary grades only
  }
);

runPropertyTest(property);
```

## Core Concepts

### 1. Arbitraries (Data Generators)

Arbitraries generate test data. We provide education-specific generators:

```typescript
// Basic education data
arbitraries.grade()                    // Generates 1-8
arbitraries.subject()                  // Ontario curriculum subjects
arbitraries.expectationCode()          // Format: "A1.1", "B2.3"
arbitraries.schoolDate()              // School day dates only
arbitraries.lessonDuration()          // 15-120 minutes

// Complex structures
educationProperties.lessonPlan()      // Complete lesson plan
educationProperties.curriculumExpectation()
educationProperties.assessment()
```

### 2. Properties

Properties are assertions that should hold for any valid input:

```typescript
// Idempotency: f(f(x)) === f(x)
const idempotentProperty = properties.idempotent(
  (date: Date) => addSchoolDays(date, 0),
  arbitraries.schoolDate()
);

// Monotonicity: if a > b, then f(a) >= f(b)
const monotonicProperty = fc.property(
  arbitraries.assessmentRating(),
  arbitraries.assessmentRating(),
  (rating1, rating2) => {
    if (rating1 <= rating2) {
      return calculateGPA([{rating: rating1}]) <= calculateGPA([{rating: rating2}]);
    }
    return true;
  }
);

// Bounded values: result always within range
const boundedProperty = properties.bounded(
  (ratings: number[]) => calculateAverageRating(ratings),
  fc.array(arbitraries.assessmentRating(), { minLength: 1 }),
  1, // min
  4  // max
);
```

### 3. Invariants

Invariants are conditions that must always be true:

```typescript
// Data model invariants
invariants.lessonPlan.durationIsPositive(plan)
invariants.lessonPlan.hasRequiredSections(plan)
invariants.user.emailIsValid(user)
invariants.curriculumExpectation.codeIsValid(expectation)

// Business rule invariants
const schoolYearProperty = fc.property(
  arbitraries.schoolYear(),
  (schoolYear) => {
    const terms = calculateTermDates(schoolYear);
    // Invariant: Terms don't overlap
    for (let i = 0; i < terms.length - 1; i++) {
      if (!isBefore(terms[i].endDate, terms[i + 1].startDate)) {
        return false;
      }
    }
    return true;
  }
);
```

## Education Domain Examples

### Date Utilities Testing

```typescript
describe('addSchoolDays', () => {
  it('should always return valid dates', () => {
    const property = properties.validDates(
      (date) => addSchoolDays(date, 5),
      arbitraries.schoolDate()
    );
    runPropertyTest(property);
  });

  it('should be associative', () => {
    const property = fc.property(
      arbitraries.schoolDate(),
      fc.integer({ min: 1, max: 20 }),
      fc.integer({ min: 1, max: 20 }),
      (date, daysA, daysB) => {
        const result1 = addSchoolDays(addSchoolDays(date, daysA), daysB);
        const result2 = addSchoolDays(date, daysA + daysB);
        // Results should be close (within 1 day tolerance for weekends)
        return Math.abs(result1.getTime() - result2.getTime()) < 24 * 60 * 60 * 1000;
      }
    );
    runPropertyTest(property);
  });
});
```

### Curriculum Validation Testing

```typescript
describe('validateCurriculumExpectation', () => {
  it('should accept all valid expectations', () => {
    const validExpectation = fc.record({
      code: arbitraries.expectationCode(),
      grade: arbitraries.grade(),
      subject: arbitraries.subject(),
      description: fc.string({ minLength: 10 })
    });

    const property = fc.property(validExpectation, (expectation) => {
      const result = validateCurriculumExpectation(expectation);
      return result.isValid === true;
    });

    runPropertyTest(property);
  });
});
```

### Assessment Calculations Testing

```typescript
describe('calculateGPA', () => {
  it('should return GPA between 0 and 4', () => {
    const property = properties.bounded(
      (grades: Array<{rating: number, weight: number}>) => calculateGPA(grades),
      fc.array(fc.record({
        rating: arbitraries.assessmentRating(),
        weight: fc.float({ min: 0.1, max: 2.0 })
      }), { minLength: 1 }),
      0, 4
    );

    runPropertyTest(property);
  });

  it('should be monotonically increasing', () => {
    const property = fc.property(
      fc.array(fc.record({
        rating: arbitraries.assessmentRating(),
        weight: fc.float({ min: 0.1, max: 2.0 })
      })),
      (grades) => {
        const originalGPA = calculateGPA(grades);
        // Improve one grade
        const improvedGrades = grades.map((grade, index) => 
          index === 0 ? { ...grade, rating: Math.min(4, grade.rating + 1) } : grade
        );
        const improvedGPA = calculateGPA(improvedGrades);
        return improvedGPA >= originalGPA;
      }
    );

    runPropertyTest(property);
  });
});
```

## Advanced Patterns

### 1. Conditional Properties

Test properties that only apply under certain conditions:

```typescript
const property = fc.property(
  arbitraries.schoolDate(),
  (date) => {
    const dayOfWeek = date.getDay();
    // Only test weekdays
    fc.pre(dayOfWeek >= 1 && dayOfWeek <= 5);
    
    return isSchoolDay(date) === true;
  }
);
```

### 2. Stateful Testing

Test sequences of operations:

```typescript
const commands = [
  fc.record({
    type: fc.constant('addLesson'),
    lesson: educationProperties.lessonPlan()
  }),
  fc.record({
    type: fc.constant('updateLesson'),
    id: fc.integer(),
    updates: fc.record({ title: fc.string() })
  })
];

const property = fc.property(
  fc.array(fc.oneof(...commands)),
  (commandSequence) => {
    const lessonPlan = new LessonPlan();
    
    for (const command of commandSequence) {
      switch (command.type) {
        case 'addLesson':
          lessonPlan.add(command.lesson);
          break;
        case 'updateLesson':
          lessonPlan.update(command.id, command.updates);
          break;
      }
      
      // Invariant: lesson plan is always valid
      if (!lessonPlan.isValid()) return false;
    }
    
    return true;
  }
);
```

### 3. Metamorphic Testing

Test relationships between different inputs:

```typescript
const property = fc.property(
  fc.array(educationProperties.assessment()),
  (assessments) => {
    const average1 = calculateAverageRating(assessments.map(a => a.rating));
    
    // Add identical assessment - average shouldn't change
    const duplicatedAssessments = [...assessments, assessments[0]];
    const average2 = calculateAverageRating(duplicatedAssessments.map(a => a.rating));
    
    return Math.abs(average1 - average2) < 0.001;
  }
);
```

## Configuration

### Test Configuration

```typescript
// In property-test-utils.ts
export const testConfig = {
  numRuns: 100,           // Number of test cases
  seed: 42,               // Seed for reproducibility
  maxSize: 100,           // Maximum data structure size
  timeout: 5000,          // Test timeout
  shrinking: {
    enable: true,         // Enable shrinking
    maxShrinks: 1000     // Maximum shrinking attempts
  }
};

// Custom configuration for specific tests
runPropertyTest(property, {
  numRuns: 1000,         // More thorough testing
  seed: Date.now()       // Random seed
});
```

### Custom Arbitraries

Create domain-specific generators:

```typescript
// Complex lesson plan with realistic constraints
const realisticLessonPlan = fc.record({
  title: fc.oneof(
    fc.constant('Introduction to Fractions'),
    fc.constant('Ancient Civilizations'),
    fc.constant('States of Matter')
  ),
  grade: arbitraries.grade(),
  subject: arbitraries.subject(),
  duration: fc.oneof(
    fc.constant(30), fc.constant(45), fc.constant(60)
  ),
  date: arbitraries.schoolDate(),
  materials: fc.array(
    fc.oneof(
      fc.constant('manipulatives'),
      fc.constant('worksheets'),
      fc.constant('technology')
    ),
    { minLength: 1, maxLength: 5 }
  )
});
```

## Best Practices

### 1. Start Simple

Begin with basic properties before complex ones:

```typescript
// Start with: function returns correct type
const property1 = fc.property(
  arbitraries.grade(),
  (grade) => typeof calculateGradeLevel(grade) === 'string'
);

// Then: function returns valid values
const property2 = fc.property(
  arbitraries.grade(),
  (grade) => ['Primary', 'Junior', 'Intermediate'].includes(calculateGradeLevel(grade))
);

// Finally: complex business rules
const property3 = fc.property(
  arbitraries.grade(),
  (grade) => {
    const level = calculateGradeLevel(grade);
    if (grade <= 3) return level === 'Primary';
    if (grade <= 6) return level === 'Junior';
    return level === 'Intermediate';
  }
);
```

### 2. Use Meaningful Property Names

```typescript
// Good: Descriptive test names
it('should preserve lesson count when reordering', () => {});
it('should maintain grade boundaries in all operations', () => {});
it('should be monotonically increasing with rating improvements', () => {});

// Avoid: Generic names
it('should work correctly', () => {});
it('property test', () => {});
```

### 3. Test Edge Cases

```typescript
const property = fc.property(
  fc.array(arbitraries.assessmentRating()),
  (ratings) => {
    // Include edge cases
    const edgeCases = [[], [1], [4], [1,1,1,1], [4,4,4,4]];
    
    for (const edgeCase of edgeCases) {
      const result = calculateAverageRating(edgeCase);
      if (edgeCase.length === 0 && isNaN(result)) continue;
      if (result < 1 || result > 4) return false;
    }
    
    return true;
  }
);
```

### 4. Document Property Intent

```typescript
/**
 * Property: School week calculation should always return valid date boundaries
 * Invariant: Start date should be Monday, end date should be Friday
 * Invariant: Input date should fall within the returned week
 */
it('should return valid week boundaries containing the input date', () => {
  const property = fc.property(
    arbitraries.schoolDate(),
    (date) => {
      const { start, end } = getSchoolWeek(date);
      
      return (
        start.getDay() === 1 &&                    // Monday
        end.getDay() === 5 &&                      // Friday
        date >= start && date <= end               // Contains input
      );
    }
  );
  
  runPropertyTest(property);
});
```

## Debugging Property Tests

### 1. Use Shrinking

Fast-check automatically shrinks failing inputs to minimal cases:

```typescript
// When a test fails, fast-check will show:
// - Original failing input (complex)
// - Shrunk failing input (simplified)
// - Counterexample path

// Example output:
// Property failed after 42 tests
// { grade: 157, subject: "Underwater Basket Weaving", duration: -50 }
// Shrunk to:
// { grade: 9, subject: "Mathematics", duration: 0 }
```

### 2. Add Debug Information

```typescript
const property = fc.property(
  arbitraries.grade(),
  (grade) => {
    const result = calculateGradeLevel(grade);
    
    // Add context for debugging
    if (!['Primary', 'Junior', 'Intermediate'].includes(result)) {
      console.log(`Unexpected grade level: ${result} for grade: ${grade}`);
      return false;
    }
    
    return true;
  }
);
```

### 3. Use fc.pre for Preconditions

```typescript
const property = fc.property(
  arbitraries.lessonDuration(),
  (duration) => {
    // Skip invalid inputs instead of failing
    fc.pre(duration > 0 && duration <= 180);
    
    return isValidLessonDuration(duration);
  }
);
```

## Integration with CI/CD

Property tests run automatically in CI:

```yaml
# .github/workflows/property-tests.yml
- name: Run Property Tests
  run: pnpm test -- --testNamePattern="property" --coverage
  
- name: Run Extended Property Tests (nightly)
  if: github.event_name == 'schedule'
  run: pnpm test -- --testNamePattern="property" --maxWorkers=1
  env:
    PROPERTY_TEST_RUNS: 10000  # More thorough testing
```

## Performance Considerations

### 1. Test Complexity

```typescript
// Fast: Simple calculations
const fastProperty = properties.bounded(
  (n: number) => Math.abs(n),
  fc.integer(),
  0, Number.MAX_SAFE_INTEGER
);

// Slower: Complex operations
const slowProperty = fc.property(
  fc.array(educationProperties.lessonPlan(), { maxLength: 100 }),
  (lessons) => {
    // Complex validation involving database calls
    return validateCompleteUnitPlan(lessons);
  }
);
```

### 2. Resource Management

```typescript
// Use smaller data sets for expensive operations
const expensiveProperty = fc.property(
  fc.array(educationProperties.assessment(), { maxLength: 10 }), // Limit size
  (assessments) => {
    return generateCompleteProgressReport(assessments).isValid;
  }
);

// Configure timeouts for long-running tests
runPropertyTest(expensiveProperty, {
  timeout: 10000,  // 10 seconds
  numRuns: 50      // Fewer runs for expensive tests
});
```

## Common Patterns

### 1. Round-trip Testing

```typescript
// Serialization/deserialization should be identity
const roundTripProperty = fc.property(
  educationProperties.lessonPlan(),
  (lesson) => {
    const serialized = JSON.stringify(lesson);
    const deserialized = JSON.parse(serialized);
    return deepEqual(lesson, deserialized);
  }
);
```

### 2. Commutativity Testing

```typescript
// Operation order shouldn't matter
const commutativeProperty = properties.commutative(
  (a: number[], b: number[]) => mergeSortedArrays(a, b),
  fc.array(fc.integer())
);
```

### 3. Associativity Testing

```typescript
// Grouping shouldn't matter: (a + b) + c === a + (b + c)
const associativeProperty = fc.property(
  arbitraries.schoolDate(),
  fc.integer({ min: 1, max: 10 }),
  fc.integer({ min: 1, max: 10 }),
  (date, days1, days2) => {
    const result1 = addSchoolDays(addSchoolDays(date, days1), days2);
    const result2 = addSchoolDays(date, days1 + days2);
    
    return Math.abs(result1.getTime() - result2.getTime()) < 24 * 60 * 60 * 1000;
  }
);
```

## Troubleshooting

### Common Issues

1. **Tests Take Too Long**
   - Reduce `numRuns` or `maxSize`
   - Simplify property logic
   - Use smaller arbitraries

2. **Shrinking Doesn't Work**
   - Ensure arbitraries are shrinkable
   - Avoid complex custom arbitraries
   - Use built-in combinators

3. **Properties Always Pass**
   - Add negative test cases
   - Verify property logic
   - Check arbitrary coverage

4. **Flaky Tests**
   - Set fixed seed for reproducibility
   - Check for timing dependencies
   - Avoid global state

### Getting Help

- Fast-check documentation: https://github.com/dubzzz/fast-check
- Property-based testing guide: https://fsharpforfunandprofit.com/pbt/
- Education domain examples in test files

---

Property-based testing provides powerful verification of system invariants and helps catch edge cases that traditional testing might miss. Focus on expressing the fundamental properties of your education domain logic, and let fast-check explore the input space automatically.