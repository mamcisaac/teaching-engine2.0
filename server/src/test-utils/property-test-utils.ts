/**
 * Property-Based Testing Utilities for Teaching Engine 2.0
 * 
 * Provides fast-check based property testing infrastructure with:
 * - Custom arbitraries for education domain
 * - Property test helpers and combinators
 * - Invariant checkers
 * - Test execution wrapper
 */

import fc from 'fast-check';
import type { 
  CurriculumExpectation
} from '@teaching-engine/database';

// Local type definitions for property testing
interface Assessment {
  id: string;
  type: 'diagnostic' | 'formative' | 'summative';
  rating: number;
  date: Date;
  notes?: string | null;
  strand?: string | null;
}

interface LessonPlan {
  id: string;
  title: string;
  date: Date;
  duration: number;
  subject: string;
  grade: number;
  objectives: string[];
  materials: string[];
  activities: string[];
  assessment?: string | null;
  homework?: string | null;
  notes?: string | null;
}

/**
 * Custom arbitraries for education domain
 */
export const arbitraries = {
  // Basic education types
  grade: () => fc.integer({ min: 1, max: 8 }),
  
  subject: () => fc.constantFrom(
    'Mathematics',
    'Language Arts',
    'Science',
    'Social Studies',
    'The Arts',
    'Health and Physical Education',
    'French as a Second Language'
  ),
  
  strand: (subject: string) => {
    const strandsBySubject: Record<string, string[]> = {
      'Mathematics': ['Number Sense', 'Measurement', 'Geometry', 'Patterning', 'Data Management'],
      'Language Arts': ['Reading', 'Writing', 'Oral Communication', 'Media Literacy'],
      'Science': ['Life Systems', 'Matter and Energy', 'Structures and Mechanisms', 'Earth and Space Systems'],
      'Social Studies': ['Heritage and Identity', 'People and Environments'],
      'The Arts': ['Dance', 'Drama', 'Music', 'Visual Arts'],
      'Health and Physical Education': ['Active Living', 'Movement Competence', 'Healthy Living'],
      'French as a Second Language': ['Listening', 'Speaking', 'Reading', 'Writing']
    };
    
    const strands = strandsBySubject[subject] || ['General'];
    return fc.constantFrom(...strands);
  },
  
  expectationCode: () => fc.tuple(
    fc.constantFrom('A', 'B', 'C', 'D', 'E'),
    fc.integer({ min: 1, max: 5 }),
    fc.integer({ min: 1, max: 10 })
  ).map(([letter, num1, num2]) => `${letter}${num1}.${num2}`),
  
  assessmentRating: () => fc.integer({ min: 1, max: 4 }),
  
  assessmentType: () => fc.constantFrom('diagnostic', 'formative', 'summative'),
  
  schoolDate: () => fc.date({
    min: new Date('2024-09-01'),
    max: new Date('2025-06-30')
  }).filter(date => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Exclude weekends
  }),
  
  schoolYear: () => fc.integer({ min: 2020, max: 2030 })
    .map(year => `${year}-${year + 1}`),
  
  lessonDuration: () => fc.constantFrom(30, 40, 45, 50, 60, 75, 90, 100, 120),
  
  groupingStrategy: () => fc.constantFrom(
    'Whole Class',
    'Small Groups',
    'Pairs',
    'Individual',
    'Mixed Grouping',
    'Stations'
  ),
  
  teachingStrategy: () => fc.constantFrom(
    'Direct Instruction',
    'Guided Practice',
    'Independent Work',
    'Collaborative Learning',
    'Inquiry-Based',
    'Problem-Based Learning',
    'Differentiated Instruction'
  ),
  
  // Complex education objects
  curriculumExpectation: (): fc.Arbitrary<Partial<CurriculumExpectation>> => {
    return fc.record({
      id: fc.uuid(),
      code: arbitraries.expectationCode(),
      grade: arbitraries.grade(),
      subject: arbitraries.subject(),
      strand: fc.string({ minLength: 3, maxLength: 50 }),
      description: fc.string({ minLength: 10, maxLength: 500 }),
      createdAt: fc.date(),
      updatedAt: fc.date()
    });
  },
  
  assessment: (): fc.Arbitrary<Partial<Assessment>> => {
    return fc.record({
      id: fc.uuid(),
      type: arbitraries.assessmentType(),
      rating: arbitraries.assessmentRating(),
      date: arbitraries.schoolDate(),
      notes: fc.string({ maxLength: 1000 }),
      strand: fc.string({ minLength: 3, maxLength: 50 })
    });
  },
  
  lessonPlan: (): fc.Arbitrary<Partial<LessonPlan>> => {
    return fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 5, maxLength: 100 }),
      date: arbitraries.schoolDate(),
      duration: arbitraries.lessonDuration(),
      subject: arbitraries.subject(),
      grade: arbitraries.grade(),
      objectives: fc.array(fc.string({ minLength: 10, maxLength: 200 }), { minLength: 1, maxLength: 5 }),
      materials: fc.array(fc.string({ minLength: 3, maxLength: 50 }), { maxLength: 10 }),
      activities: fc.array(fc.string({ minLength: 10, maxLength: 500 }), { minLength: 1, maxLength: 5 }),
      assessment: fc.string({ maxLength: 500 }),
      homework: fc.option(fc.string({ maxLength: 300 })),
      notes: fc.option(fc.string({ maxLength: 1000 }))
    });
  }
};

/**
 * Property test combinators and helpers
 */
export const properties = {
  // Check if output is within bounds
  bounded: <T>(
    fn: (input: T) => number,
    arbitrary: fc.Arbitrary<T>,
    min: number,
    max: number
  ): fc.IProperty<[T]> => {
    return fc.property(arbitrary, (input) => {
      const result = fn(input);
      return result >= min && result <= max;
    });
  },
  
  // Check if function is idempotent
  idempotent: <T, R>(
    fn: (input: T) => R,
    arbitrary: fc.Arbitrary<T>
  ): fc.IProperty<[T]> => {
    return fc.property(arbitrary, (input) => {
      const result1 = fn(input);
      const result2 = fn(input);
      return JSON.stringify(result1) === JSON.stringify(result2);
    });
  },
  
  // Check if array length is preserved
  preservesLength: <T, R>(
    fn: (input: T[]) => R[],
    arbitrary: fc.Arbitrary<T[]>
  ): fc.IProperty<[T[]]> => {
    return fc.property(arbitrary, (input) => {
      const result = fn(input);
      return Array.isArray(result) && result.length === input.length;
    });
  },
  
  // Check if all elements are preserved (for sorting/filtering)
  preservesElements: <T>(
    fn: (input: T[]) => T[],
    arbitrary: fc.Arbitrary<T[]>
  ): fc.IProperty<[T[]]> => {
    return fc.property(arbitrary, (input) => {
      const result = fn(input);
      const inputSet = new Set(input.map(item => JSON.stringify(item)));
      const resultSet = new Set(result.map(item => JSON.stringify(item)));
      
      return inputSet.size === resultSet.size &&
        [...inputSet].every(item => resultSet.has(item));
    });
  },
  
  // Check if dates are valid
  validDates: <T>(
    fn: (input: T) => Date,
    arbitrary: fc.Arbitrary<T>
  ): fc.IProperty<[T]> => {
    return fc.property(arbitrary, (input) => {
      const result = fn(input);
      return result instanceof Date && !isNaN(result.getTime());
    });
  },
  
  // Check if sorting maintains order
  sortingPreservesElements: <T>(
    fn: (input: T[]) => T[],
    arbitrary: fc.Arbitrary<T[]>
  ): fc.IProperty<[T[]]> => {
    return fc.property(arbitrary, (input) => {
      const result = fn(input);
      
      // Check same length
      if (result.length !== input.length) return false;
      
      // Check all elements present
      const inputCounts = new Map<string, number>();
      const resultCounts = new Map<string, number>();
      
      for (const item of input) {
        const key = JSON.stringify(item);
        inputCounts.set(key, (inputCounts.get(key) || 0) + 1);
      }
      
      for (const item of result) {
        const key = JSON.stringify(item);
        resultCounts.set(key, (resultCounts.get(key) || 0) + 1);
      }
      
      // Compare counts
      if (inputCounts.size !== resultCounts.size) return false;
      
      for (const [key, count] of inputCounts) {
        if (resultCounts.get(key) !== count) return false;
      }
      
      return true;
    });
  }
};

/**
 * Education-specific property generators
 */
export const educationProperties = {
  assessment: () => arbitraries.assessment(),
  curriculumExpectation: () => arbitraries.curriculumExpectation(),
  lessonPlan: () => arbitraries.lessonPlan()
};

/**
 * Invariant checkers for domain rules
 */
export const invariants = {
  assessment: {
    ratingInBounds: (assessment: { rating: number }) => 
      assessment.rating >= 1 && assessment.rating <= 4,
    
    hasValidType: (assessment: { type: string }) =>
      ['diagnostic', 'formative', 'summative'].includes(assessment.type),
    
    dateIsSchoolDay: (assessment: { date: Date }) => {
      const day = assessment.date.getDay();
      return day !== 0 && day !== 6; // Not weekend
    }
  },
  
  curriculumExpectation: {
    codeIsValid: (expectation: { code: string }) =>
      /^[A-E]\d\.\d+$/.test(expectation.code),
    
    gradeIsValid: (expectation: { grade: number }) =>
      expectation.grade >= 1 && expectation.grade <= 8,
    
    hasDescription: (expectation: { description: string }) =>
      expectation.description && expectation.description.length >= 10
  },
  
  lessonPlan: {
    durationIsReasonable: (plan: { duration: number }) =>
      plan.duration >= 30 && plan.duration <= 180,
    
    hasObjectives: (plan: { objectives?: string[] }) =>
      plan.objectives && plan.objectives.length > 0,
    
    dateIsSchoolDay: (plan: { date: Date }) => {
      const day = plan.date.getDay();
      return day !== 0 && day !== 6;
    }
  }
};

/**
 * Matchers for common validations
 */
export const matchers = {
  isValidAssessmentRating: (rating: number): boolean =>
    Number.isInteger(rating) && rating >= 1 && rating <= 4,
  
  isValidElementaryGrade: (grade: number): boolean =>
    Number.isInteger(grade) && grade >= 1 && grade <= 8,
  
  isValidCurriculumCode: (code: string): boolean =>
    /^[A-E]\d\.\d+$/.test(code),
  
  isSchoolDay: (date: Date): boolean => {
    const day = date.getDay();
    return day !== 0 && day !== 6;
  },
  
  isValidSubject: (subject: string): boolean => {
    const validSubjects = [
      'Mathematics',
      'Language Arts', 
      'Science',
      'Social Studies',
      'The Arts',
      'Health and Physical Education',
      'French as a Second Language'
    ];
    return validSubjects.includes(subject);
  }
};

/**
 * Test runner with proper error handling
 */
export function runPropertyTest(
  property: fc.IProperty<unknown[]>,
  options?: fc.Parameters<unknown[]>
): void {
  const defaultOptions: fc.Parameters<unknown[]> = {
    numRuns: 100,
    verbose: true,
    seed: Date.now(),
    ...options
  };
  
  try {
    fc.assert(property, defaultOptions);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Property test failed:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
    throw error;
  }
}

/**
 * Export everything for use in tests
 */
export default {
  fc,
  arbitraries,
  properties,
  educationProperties,
  invariants,
  matchers,
  runPropertyTest
};