/**
 * Domain-Specific Arbitraries for Teaching Engine
 * Custom fast-check arbitraries for domain objects
 */

import fc, { Arbitrary } from 'fast-check';

// ==================== Basic Domain Types ====================

/**
 * Grade levels used in elementary education
 */
export const gradeArbitrary: Arbitrary<number> = fc.integer({ min: 1, max: 8 });

/**
 * Common subjects in elementary education
 */
export const subjectArbitrary: Arbitrary<string> = fc.constantFrom(
  'Mathematics',
  'Language Arts',
  'Science',
  'Social Studies',
  'French',
  'Physical Education',
  'Arts',
  'Music',
  'Health',
);

/**
 * Language codes (English/French bilingual support)
 */
export const languageArbitrary: Arbitrary<string> = fc.constantFrom('en', 'fr');

/**
 * Academic years in YYYY-YYYY format
 */
export const academicYearArbitrary: Arbitrary<string> = fc
  .integer({ min: 2020, max: 2030 })
  .map((year) => `${year}-${year + 1}`);

/**
 * School terms
 */
export const termArbitrary: Arbitrary<string> = fc.constantFrom(
  'Full Year',
  'Term 1',
  'Term 2',
  'Term 3',
  'Semester 1',
  'Semester 2',
);

/**
 * Curriculum strands for different subjects
 */
export const curriculumStrandArbitrary: Arbitrary<string> = fc.constantFrom(
  'Number Sense',
  'Algebra',
  'Geometry',
  'Measurement',
  'Data Management',
  'Reading',
  'Writing',
  'Oral Communication',
  'Media Literacy',
  'Understanding Life Systems',
  'Understanding Structures and Mechanisms',
  'Understanding Matter and Energy',
  'Understanding Earth and Space Systems',
  'Heritage and Identity',
  'People and Environments',
  'Citizenship and Government',
);

/**
 * Ontario curriculum expectation codes (e.g., "A1.2", "B3.1")
 */
export const curriculumCodeArbitrary: Arbitrary<string> = fc
  .tuple(
    fc.constantFrom('A', 'B', 'C', 'D', 'E'),
    fc.integer({ min: 1, max: 5 }),
    fc.integer({ min: 1, max: 10 }),
  )
  .map(([letter, major, minor]) => `${letter}${major}.${minor}`);

// ==================== Time and Duration ====================

/**
 * School hours (8 AM to 4 PM)
 */
export const schoolHourArbitrary: Arbitrary<Date> = fc.date({
  min: new Date('2024-01-01T08:00:00'),
  max: new Date('2024-01-01T16:00:00'),
});

/**
 * Lesson durations in minutes (15-120 minutes)
 */
export const lessonDurationArbitrary: Arbitrary<number> = fc.integer({ min: 15, max: 120 });

/**
 * School days (Monday to Friday)
 */
export const schoolDayArbitrary: Arbitrary<Date> = fc
  .date({
    min: new Date('2024-01-01'),
    max: new Date('2024-12-31'),
  })
  .filter((date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
  });

/**
 * Time intervals in minutes (start time to end time)
 */
export const timeIntervalArbitrary: Arbitrary<{ start: number; end: number }> = fc
  .tuple(
    fc.integer({ min: 0, max: 1440 }), // 0 to 24 hours in minutes
    fc.integer({ min: 15, max: 240 }), // 15 minutes to 4 hours duration
  )
  .map(([start, duration]) => ({
    start,
    end: Math.min(start + duration, 1440),
  }));

// ==================== Curriculum and Planning ====================

/**
 * Curriculum expectations
 */
export const curriculumExpectationArbitrary: Arbitrary<{
  id: string;
  code: string;
  description: string;
  strand: string;
  grade: number;
  subject: string;
}> = fc.record({
  id: fc.uuid(),
  code: curriculumCodeArbitrary,
  description: fc.lorem({ maxCount: 3 }),
  strand: curriculumStrandArbitrary,
  grade: gradeArbitrary,
  subject: subjectArbitrary,
});

/**
 * Long-range plans
 */
export const longRangePlanArbitrary: Arbitrary<{
  id: string;
  title: string;
  academicYear: string;
  term: string;
  grade: number;
  subject: string;
  description?: string;
}> = fc.record({
  id: fc.uuid(),
  title: fc.lorem({ maxCount: 2 }),
  academicYear: academicYearArbitrary,
  term: termArbitrary,
  grade: gradeArbitrary,
  subject: subjectArbitrary,
  description: fc.option(fc.lorem({ maxCount: 5 })),
});

/**
 * Unit plans
 */
export const unitPlanArbitrary: Arbitrary<{
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  estimatedHours: number;
  grade: number;
  subject: string;
}> = fc
  .tuple(
    fc.uuid(),
    fc.lorem({ maxCount: 2 }),
    fc.date({ min: new Date('2024-01-01'), max: new Date('2024-06-30') }),
    fc.integer({ min: 10, max: 60 }),
    gradeArbitrary,
    subjectArbitrary,
  )
  .map(([id, title, startDate, hours, grade, subject]) => ({
    id,
    title,
    startDate,
    endDate: new Date(startDate.getTime() + hours * 60 * 60 * 1000),
    estimatedHours: hours,
    grade,
    subject,
  }));

/**
 * Lesson plans
 */
export const lessonPlanArbitrary: Arbitrary<{
  id: string;
  title: string;
  date: Date;
  duration: number;
  grade: number;
  subject: string;
  mindsOn?: string;
  action?: string;
  consolidation?: string;
}> = fc.record({
  id: fc.uuid(),
  title: fc.lorem({ maxCount: 2 }),
  date: schoolDayArbitrary,
  duration: lessonDurationArbitrary,
  grade: gradeArbitrary,
  subject: subjectArbitrary,
  mindsOn: fc.option(fc.lorem({ maxCount: 3 })),
  action: fc.option(fc.lorem({ maxCount: 5 })),
  consolidation: fc.option(fc.lorem({ maxCount: 2 })),
});

// ==================== Assessment and Evaluation ====================

/**
 * Assessment types
 */
export const assessmentTypeArbitrary: Arbitrary<string> = fc.constantFrom(
  'diagnostic',
  'formative',
  'summative',
);

/**
 * Rating scales (1-5)
 */
export const ratingArbitrary: Arbitrary<number> = fc.integer({ min: 1, max: 5 });

/**
 * Percentage scores
 */
export const percentageArbitrary: Arbitrary<number> = fc.integer({ min: 0, max: 100 });

/**
 * Achievement levels (Ontario curriculum)
 */
export const achievementLevelArbitrary: Arbitrary<string> = fc.constantFrom(
  'Level 1',
  'Level 2',
  'Level 3',
  'Level 4',
);

/**
 * Coverage indicators for curriculum expectations
 */
export const coverageArbitrary: Arbitrary<string> = fc.constantFrom(
  'introduced',
  'developing',
  'consolidated',
);

// ==================== User and Context ====================

/**
 * User roles
 */
export const userRoleArbitrary: Arbitrary<string> = fc.constantFrom(
  'teacher',
  'administrator',
  'substitute',
);

/**
 * Email addresses
 */
export const emailArbitrary: Arbitrary<string> = fc.emailAddress();

/**
 * Teacher names
 */
export const teacherNameArbitrary: Arbitrary<string> = fc.fullName();

/**
 * School information
 */
export const schoolInfoArbitrary: Arbitrary<{
  name: string;
  board: string;
  address: string;
}> = fc.record({
  name: fc.lorem({ maxCount: 2 }).map((name) => `${name} Elementary School`),
  board: fc.lorem({ maxCount: 2 }).map((name) => `${name} District School Board`),
  address: fc.address(),
});

// ==================== Resource and Material ====================

/**
 * Resource types
 */
export const resourceTypeArbitrary: Arbitrary<string> = fc.constantFrom(
  'document',
  'video',
  'website',
  'book',
  'handout',
  'slide',
  'game',
  'experiment',
);

/**
 * Material requirements
 */
export const materialArbitrary: Arbitrary<string> = fc.constantFrom(
  'pencil',
  'paper',
  'calculator',
  'ruler',
  'scissors',
  'glue',
  'markers',
  'chart paper',
  'manipulatives',
  'computer',
  'tablet',
  'whiteboard',
);

/**
 * Technology requirements
 */
export const technologyArbitrary: Arbitrary<string> = fc.constantFrom(
  'computer',
  'tablet',
  'projector',
  'smartboard',
  'internet',
  'speakers',
  'microphone',
  'camera',
);

// ==================== Activity and Engagement ====================

/**
 * Activity types
 */
export const activityTypeArbitrary: Arbitrary<string> = fc.constantFrom(
  'discussion',
  'hands-on',
  'investigation',
  'presentation',
  'game',
  'experiment',
  'reading',
  'writing',
  'problem-solving',
  'collaboration',
);

/**
 * Grouping strategies
 */
export const groupingArbitrary: Arbitrary<string> = fc.constantFrom(
  'whole class',
  'small group',
  'pairs',
  'individual',
  'flexible grouping',
);

/**
 * Learning skills
 */
export const learningSkillArbitrary: Arbitrary<string> = fc.constantFrom(
  'responsibility',
  'organization',
  'independent work',
  'collaboration',
  'initiative',
  'self-regulation',
);

// ==================== Complex Domain Objects ====================

/**
 * Complete curriculum expectation with all relationships
 */
export const fullCurriculumExpectationArbitrary: Arbitrary<{
  id: string;
  code: string;
  description: string;
  strand: string;
  substrand?: string;
  grade: number;
  subject: string;
  descriptionFr?: string;
  strandFr?: string;
}> = fc.record({
  id: fc.uuid(),
  code: curriculumCodeArbitrary,
  description: fc.lorem({ maxCount: 5 }),
  strand: curriculumStrandArbitrary,
  substrand: fc.option(fc.lorem({ maxCount: 2 })),
  grade: gradeArbitrary,
  subject: subjectArbitrary,
  descriptionFr: fc.option(fc.lorem({ maxCount: 5 })),
  strandFr: fc.option(fc.lorem({ maxCount: 2 })),
});

/**
 * Complete lesson plan with all sections
 */
export const fullLessonPlanArbitrary: Arbitrary<{
  id: string;
  title: string;
  date: Date;
  duration: number;
  grade: number;
  subject: string;
  mindsOn: string;
  action: string;
  consolidation: string;
  learningGoals: string;
  materials: string[];
  assessmentType: string;
  expectations: string[];
}> = fc.record({
  id: fc.uuid(),
  title: fc.lorem({ maxCount: 3 }),
  date: schoolDayArbitrary,
  duration: lessonDurationArbitrary,
  grade: gradeArbitrary,
  subject: subjectArbitrary,
  mindsOn: fc.lorem({ maxCount: 3 }),
  action: fc.lorem({ maxCount: 6 }),
  consolidation: fc.lorem({ maxCount: 2 }),
  learningGoals: fc.lorem({ maxCount: 4 }),
  materials: fc.array(materialArbitrary, { minLength: 1, maxLength: 5 }),
  assessmentType: assessmentTypeArbitrary,
  expectations: fc.array(curriculumCodeArbitrary, { minLength: 1, maxLength: 3 }),
});

/**
 * Daybook entry with reflections
 */
export const daybookEntryArbitrary: Arbitrary<{
  id: string;
  date: Date;
  whatWorked?: string;
  whatDidntWork?: string;
  nextSteps?: string;
  overallRating?: number;
  wouldReuseLesson?: boolean;
}> = fc.record({
  id: fc.uuid(),
  date: schoolDayArbitrary,
  whatWorked: fc.option(fc.lorem({ maxCount: 3 })),
  whatDidntWork: fc.option(fc.lorem({ maxCount: 3 })),
  nextSteps: fc.option(fc.lorem({ maxCount: 2 })),
  overallRating: fc.option(ratingArbitrary),
  wouldReuseLesson: fc.option(fc.boolean()),
});

// ==================== Constraint-Based Arbitraries ====================

/**
 * Valid time slot within school hours
 */
export const validTimeSlotArbitrary: Arbitrary<{
  start: Date;
  end: Date;
  duration: number;
}> = fc
  .tuple(
    fc.integer({ min: 8, max: 15 }), // 8 AM to 3 PM
    fc.integer({ min: 0, max: 59 }), // minutes
    lessonDurationArbitrary,
  )
  .map(([hour, minute, duration]) => {
    const start = new Date();
    start.setHours(hour, minute, 0, 0);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    return { start, end, duration };
  });

/**
 * Curriculum progression (ensures grade-appropriate content)
 */
export const curriculumProgressionArbitrary: Arbitrary<{
  grade: number;
  expectations: string[];
  complexity: 'basic' | 'intermediate' | 'advanced';
}> = gradeArbitrary.chain((grade) => {
  const complexity = grade <= 3 ? 'basic' : grade <= 6 ? 'intermediate' : 'advanced';
  return fc.record({
    grade: fc.constant(grade),
    expectations: fc.array(curriculumCodeArbitrary, {
      minLength: 1,
      maxLength: grade <= 3 ? 2 : grade <= 6 ? 3 : 4,
    }),
    complexity: fc.constant(complexity),
  });
});

/**
 * Balanced assessment distribution
 */
export const assessmentDistributionArbitrary: Arbitrary<{
  diagnostic: number;
  formative: number;
  summative: number;
  total: number;
}> = fc
  .tuple(
    fc.integer({ min: 1, max: 5 }),
    fc.integer({ min: 5, max: 15 }),
    fc.integer({ min: 2, max: 8 }),
  )
  .map(([diagnostic, formative, summative]) => ({
    diagnostic,
    formative,
    summative,
    total: diagnostic + formative + summative,
  }));

/**
 * Realistic unit plan timeline
 */
export const unitTimelineArbitrary: Arbitrary<{
  startDate: Date;
  endDate: Date;
  totalHours: number;
  lessonCount: number;
  averageLessonDuration: number;
}> = fc
  .tuple(
    fc.date({ min: new Date('2024-01-01'), max: new Date('2024-05-01') }),
    fc.integer({ min: 1, max: 8 }), // weeks
    fc.integer({ min: 3, max: 5 }), // lessons per week
  )
  .map(([startDate, weeks, lessonsPerWeek]) => {
    const endDate = new Date(startDate.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
    const lessonCount = weeks * lessonsPerWeek;
    const averageLessonDuration = 60;
    const totalHours = (lessonCount * averageLessonDuration) / 60;

    return {
      startDate,
      endDate,
      totalHours,
      lessonCount,
      averageLessonDuration,
    };
  });

// ==================== Export All Arbitraries ====================

export const domainArbitraries = {
  // Basic types
  grade: gradeArbitrary,
  subject: subjectArbitrary,
  language: languageArbitrary,
  academicYear: academicYearArbitrary,
  term: termArbitrary,

  // Curriculum
  curriculumStrand: curriculumStrandArbitrary,
  curriculumCode: curriculumCodeArbitrary,
  curriculumExpectation: curriculumExpectationArbitrary,
  fullCurriculumExpectation: fullCurriculumExpectationArbitrary,

  // Time and duration
  schoolHour: schoolHourArbitrary,
  lessonDuration: lessonDurationArbitrary,
  schoolDay: schoolDayArbitrary,
  timeInterval: timeIntervalArbitrary,
  validTimeSlot: validTimeSlotArbitrary,

  // Planning
  longRangePlan: longRangePlanArbitrary,
  unitPlan: unitPlanArbitrary,
  lessonPlan: lessonPlanArbitrary,
  fullLessonPlan: fullLessonPlanArbitrary,
  daybookEntry: daybookEntryArbitrary,

  // Assessment
  assessmentType: assessmentTypeArbitrary,
  rating: ratingArbitrary,
  percentage: percentageArbitrary,
  achievementLevel: achievementLevelArbitrary,
  coverage: coverageArbitrary,
  assessmentDistribution: assessmentDistributionArbitrary,

  // Resources
  resourceType: resourceTypeArbitrary,
  material: materialArbitrary,
  technology: technologyArbitrary,

  // Activities
  activityType: activityTypeArbitrary,
  grouping: groupingArbitrary,
  learningSkill: learningSkillArbitrary,

  // Users and context
  userRole: userRoleArbitrary,
  email: emailArbitrary,
  teacherName: teacherNameArbitrary,
  schoolInfo: schoolInfoArbitrary,

  // Complex constraints
  curriculumProgression: curriculumProgressionArbitrary,
  unitTimeline: unitTimelineArbitrary,
};
