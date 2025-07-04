/**
 * Property-based testing utilities for Teaching Engine 2.0
 * Uses fast-check to generate test data and validate properties
 */

import fc from 'fast-check';
import { addDays, addWeeks, addMonths, isValid, format } from 'date-fns';

/**
 * Custom arbitraries for education domain objects
 */
export const arbitraries = {
  // Grade levels (1-8 for elementary, 9-12 for secondary)
  grade: () => fc.integer({ min: 1, max: 8 }),
  
  // Ontario curriculum subjects
  subject: () => fc.constantFrom(
    'Mathematics',
    'Language',
    'Science',
    'Social Studies',
    'French',
    'The Arts',
    'Health and Physical Education'
  ),

  // Curriculum strands
  strand: (subject: string) => {
    const strands = {
      Mathematics: ['Number Sense', 'Measurement', 'Geometry', 'Data Management', 'Algebra'],
      Language: ['Oral Communication', 'Reading', 'Writing', 'Media Literacy'],
      Science: ['Understanding Life Systems', 'Understanding Matter and Energy', 'Understanding Structures and Mechanisms', 'Understanding Earth and Space Systems'],
      'Social Studies': ['Heritage and Identity', 'People and Environments', 'Citizenship'],
      French: ['Listening', 'Speaking', 'Reading', 'Writing'],
      'The Arts': ['Dance', 'Drama', 'Music', 'Visual Arts'],
      'Health and Physical Education': ['Active Living', 'Movement Competence', 'Healthy Living']
    };
    return fc.constantFrom(...(strands[subject as keyof typeof strands] || ['General']));
  },

  // Curriculum expectation codes (e.g., "A1.1", "B2.3")
  expectationCode: () => fc.string({
    minLength: 3,
    maxLength: 5
  }).map(s => {
    const letter = fc.sample(fc.constantFrom('A', 'B', 'C', 'D'), 1)[0];
    const major = fc.sample(fc.integer({ min: 1, max: 5 }), 1)[0];
    const minor = fc.sample(fc.integer({ min: 1, max: 9 }), 1)[0];
    return `${letter}${major}.${minor}`;
  }),

  // School years (e.g., "2024-2025")
  schoolYear: () => fc.integer({ min: 2020, max: 2030 }).map(year => `${year}-${year + 1}`),

  // Academic terms
  term: () => fc.constantFrom('Term 1', 'Term 2', 'Full Year'),

  // Lesson duration in minutes
  lessonDuration: () => fc.integer({ min: 15, max: 120 }),

  // Assessment ratings (1-4 scale)
  assessmentRating: () => fc.integer({ min: 1, max: 4 }),

  // School day dates (Monday-Friday, during school year)
  schoolDate: () => fc.date({
    min: new Date('2024-09-01'),
    max: new Date('2025-06-30')
  }).filter(date => {
    const day = date.getDay();
    return day >= 1 && day <= 5; // Monday to Friday
  }),

  // Time slots (8:00 AM to 4:00 PM in 15-minute increments)
  timeSlot: () => fc.integer({ min: 8 * 60, max: 16 * 60 }).map(minutes => {
    const rounded = Math.round(minutes / 15) * 15;
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }),

  // Learning goals (realistic education language)
  learningGoal: () => fc.constantFrom(
    'Students will understand the concept of fractions',
    'Students will be able to identify main ideas in text',
    'Students will demonstrate understanding of scientific method',
    'Students will express ideas clearly in writing',
    'Students will solve multi-step word problems',
    'Students will analyze historical events and their impact'
  ),

  // Assessment types
  assessmentType: () => fc.constantFrom(
    'diagnostic',
    'formative',
    'summative',
    'self-assessment',
    'peer-assessment'
  ),

  // Differentiation strategies
  differentiationStrategy: () => fc.constantFrom(
    'visual supports',
    'manipulatives',
    'peer collaboration',
    'technology integration',
    'modified expectations',
    'extra time',
    'alternative assessment'
  ),

  // User roles
  userRole: () => fc.constantFrom('teacher', 'principal', 'vice-principal', 'supply-teacher'),

  // Valid email addresses
  email: () => fc.emailAddress(),

  // Canadian postal codes
  postalCode: () => fc.string({ minLength: 6, maxLength: 6 }).map(s => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = '0123456789';
    return `${letters[Math.floor(Math.random() * letters.length)]}${digits[Math.floor(Math.random() * digits.length)]}${letters[Math.floor(Math.random() * letters.length)]} ${digits[Math.floor(Math.random() * digits.length)]}${letters[Math.floor(Math.random() * letters.length)]}${digits[Math.floor(Math.random() * digits.length)]}`;
  }),

  // Bilingual content (English/French pairs)
  bilingualText: () => fc.record({
    en: fc.lorem({ maxCount: 20 }),
    fr: fc.lorem({ maxCount: 20 })
  })
};

/**
 * Property test utilities for common patterns
 */
export const properties = {
  /**
   * Test that a function is idempotent (f(f(x)) === f(x))
   */
  idempotent: <T>(fn: (x: T) => T, arbitrary: fc.Arbitrary<T>) => {
    return fc.property(arbitrary, (input) => {
      const result1 = fn(input);
      const result2 = fn(result1);
      return JSON.stringify(result1) === JSON.stringify(result2);
    });
  },

  /**
   * Test that a function is commutative (f(a, b) === f(b, a))
   */
  commutative: <T, U>(fn: (a: T, b: T) => U, arbitrary: fc.Arbitrary<T>) => {
    return fc.property(arbitrary, arbitrary, (a, b) => {
      const result1 = fn(a, b);
      const result2 = fn(b, a);
      return JSON.stringify(result1) === JSON.stringify(result2);
    });
  },

  /**
   * Test that a function preserves array length
   */
  preservesLength: <T, U>(fn: (arr: T[]) => U[], arbitrary: fc.Arbitrary<T[]>) => {
    return fc.property(arbitrary, (input) => {
      const result = fn(input);
      return result.length === input.length;
    });
  },

  /**
   * Test that a validation function accepts valid inputs and rejects invalid ones
   */
  validation: <T>(
    validator: (input: T) => boolean,
    validArbitrary: fc.Arbitrary<T>,
    invalidArbitrary: fc.Arbitrary<T>
  ) => {
    const validProperty = fc.property(validArbitrary, (input) => {
      return validator(input) === true;
    });

    const invalidProperty = fc.property(invalidArbitrary, (input) => {
      return validator(input) === false;
    });

    return { valid: validProperty, invalid: invalidProperty };
  },

  /**
   * Test that a function always returns values within expected bounds
   */
  bounded: <T, U extends number>(
    fn: (input: T) => U,
    arbitrary: fc.Arbitrary<T>,
    min: number,
    max: number
  ) => {
    return fc.property(arbitrary, (input) => {
      const result = fn(input);
      return result >= min && result <= max;
    });
  },

  /**
   * Test date calculations maintain valid dates
   */
  validDates: (fn: (date: Date) => Date, dateArbitrary: fc.Arbitrary<Date>) => {
    return fc.property(dateArbitrary, (input) => {
      const result = fn(input);
      return isValid(result);
    });
  },

  /**
   * Test that sorting functions maintain all elements
   */
  sortingPreservesElements: <T>(
    sortFn: (arr: T[]) => T[],
    arbitrary: fc.Arbitrary<T[]>
  ) => {
    return fc.property(arbitrary, (input) => {
      const result = sortFn(input);
      const inputSorted = [...input].sort();
      const resultSorted = [...result].sort();
      return JSON.stringify(inputSorted) === JSON.stringify(resultSorted);
    });
  }
};

/**
 * Education-specific property generators
 */
export const educationProperties = {
  /**
   * Generate curriculum expectation data
   */
  curriculumExpectation: () => fc.record({
    code: arbitraries.expectationCode(),
    grade: arbitraries.grade(),
    subject: arbitraries.subject(),
    description: fc.lorem({ maxCount: 50 }),
    strand: fc.string({ minLength: 5, maxLength: 30 })
  }),

  /**
   * Generate lesson plan data
   */
  lessonPlan: () => fc.record({
    title: fc.lorem({ maxCount: 5 }),
    grade: arbitraries.grade(),
    subject: arbitraries.subject(),
    duration: arbitraries.lessonDuration(),
    learningGoals: fc.array(arbitraries.learningGoal(), { minLength: 1, maxLength: 3 }),
    date: arbitraries.schoolDate(),
    mindsOn: fc.lorem({ maxCount: 20 }),
    action: fc.lorem({ maxCount: 30 }),
    consolidation: fc.lorem({ maxCount: 20 })
  }),

  /**
   * Generate unit plan data
   */
  unitPlan: () => fc.record({
    title: fc.lorem({ maxCount: 4 }),
    grade: arbitraries.grade(),
    startDate: arbitraries.schoolDate(),
    endDate: arbitraries.schoolDate(),
    bigIdeas: fc.lorem({ maxCount: 15 }),
    totalHours: fc.integer({ min: 5, max: 50 }),
    description: fc.lorem({ maxCount: 25 })
  }),

  /**
   * Generate user data
   */
  user: () => fc.record({
    email: arbitraries.email(),
    name: fc.fullName(),
    role: arbitraries.userRole(),
    preferredLanguage: fc.constantFrom('en', 'fr')
  }),

  /**
   * Generate assessment data
   */
  assessment: () => fc.record({
    type: arbitraries.assessmentType(),
    rating: arbitraries.assessmentRating(),
    date: arbitraries.schoolDate(),
    notes: fc.lorem({ maxCount: 20 }),
    rubricScores: fc.array(fc.integer({ min: 1, max: 4 }), { minLength: 3, maxLength: 6 })
  })
};

/**
 * Test configuration for fast-check
 */
export const testConfig = {
  // Default number of test cases
  numRuns: 100,
  
  // Seed for reproducible tests
  seed: 42,
  
  // Maximum size for generated data
  maxSize: 100,
  
  // Timeout for individual tests
  timeout: 5000,
  
  // Shrinking configuration
  shrinking: {
    enable: true,
    maxShrinks: 1000
  }
};

/**
 * Helper function to run property tests with custom configuration
 */
export const runPropertyTest = (
  property: fc.Property<any>,
  config: Partial<typeof testConfig> = {}
) => {
  const finalConfig = { ...testConfig, ...config };
  return fc.assert(property, finalConfig);
};

/**
 * Custom matchers for education domain
 */
export const matchers = {
  /**
   * Check if a grade is valid for elementary school
   */
  isValidElementaryGrade: (grade: number): boolean => {
    return Number.isInteger(grade) && grade >= 1 && grade <= 8;
  },

  /**
   * Check if a curriculum code follows Ontario format
   */
  isValidCurriculumCode: (code: string): boolean => {
    return /^[A-Z]\d+\.\d+$/.test(code);
  },

  /**
   * Check if a school year string is valid
   */
  isValidSchoolYear: (year: string): boolean => {
    const match = year.match(/^(\d{4})-(\d{4})$/);
    if (!match) return false;
    
    const startYear = parseInt(match[1]);
    const endYear = parseInt(match[2]);
    return endYear === startYear + 1;
  },

  /**
   * Check if a lesson duration is reasonable
   */
  isReasonableLessonDuration: (duration: number): boolean => {
    return duration >= 15 && duration <= 180 && duration % 5 === 0;
  },

  /**
   * Check if a date falls within a school year
   */
  isSchoolYearDate: (date: Date): boolean => {
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const day = date.getDate();
    
    // School year typically runs September to June
    return (month >= 9) || (month <= 6);
  },

  /**
   * Check if assessment rating is on 4-point scale
   */
  isValidAssessmentRating: (rating: number): boolean => {
    return Number.isInteger(rating) && rating >= 1 && rating <= 4;
  }
};

/**
 * Invariant validators for data models
 */
export const invariants = {
  /**
   * Lesson plan invariants
   */
  lessonPlan: {
    durationIsPositive: (plan: any) => plan.duration > 0,
    hasRequiredSections: (plan: any) => 
      plan.mindsOn && plan.action && plan.consolidation,
    dateIsValid: (plan: any) => isValid(new Date(plan.date)),
    gradeIsElementary: (plan: any) => matchers.isValidElementaryGrade(plan.grade)
  },

  /**
   * Unit plan invariants
   */
  unitPlan: {
    endDateAfterStart: (plan: any) => 
      new Date(plan.endDate) > new Date(plan.startDate),
    hoursAreReasonable: (plan: any) => 
      plan.totalHours >= 1 && plan.totalHours <= 200,
    titleIsNotEmpty: (plan: any) => 
      plan.title && plan.title.trim().length > 0
  },

  /**
   * User invariants
   */
  user: {
    emailIsValid: (user: any) => 
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email),
    roleIsValid: (user: any) => 
      ['teacher', 'principal', 'vice-principal', 'supply-teacher'].includes(user.role),
    languageIsSupported: (user: any) => 
      ['en', 'fr'].includes(user.preferredLanguage)
  },

  /**
   * Curriculum expectation invariants
   */
  curriculumExpectation: {
    codeIsValid: (exp: any) => matchers.isValidCurriculumCode(exp.code),
    gradeIsValid: (exp: any) => matchers.isValidElementaryGrade(exp.grade),
    hasDescription: (exp: any) => exp.description && exp.description.length > 10
  }
};