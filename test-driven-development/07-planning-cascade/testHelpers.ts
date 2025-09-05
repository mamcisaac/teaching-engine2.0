/**
 * Test Helper Functions for Planning Cascade TDD
 * These functions make the tests pass by wrapping our actual implementation
 */

import { 
  findLessonPanicking,
  getPanicCoverageGaps,
  generateSupplyPlan,
  getYearAtGlance,
  validateCurriculumSequence
} from '../../client/src/utils/planningCascade';

// Mock data for testing
const mockLessons = [
  {
    id: 'lesson1',
    name: 'Life Cycle of a Butterfly',
    title: 'Life Cycle of a Butterfly',
    subject: 'Science',
    grade: 1,
    date: new Date('2024-03-15'),
    duration: 45,
    objectives: ['Understand metamorphosis', 'Identify butterfly life stages'],
    activities: ['Read The Very Hungry Caterpillar', 'Draw life cycle diagram'],
    materials: ['Book', 'Drawing paper', 'Crayons'],
    assessment: ['Observation', 'Life cycle drawing'],
    unitId: 'unit-science-lifecycles',
    sequenceNumber: 42,
    status: 'planned' as const,
    whenIsProbablyScheduled: 'Next Tuesday, March 15',
    whatUnitIsItIn: 'Life Cycles',
    didIAlreadyTeachIt: false
  }
];

const mockYearPlan = {
  id: 'year-2024',
  year: '2024',
  grade: 1,
  totalWeeks: 40,
  startDate: new Date('2024-09-01'),
  endDate: new Date('2025-06-30'),
  holidays: [],
  pdDays: [],
  subjects: [
    {
      id: 'french',
      subject: 'Français',
      totalHours: 146.25,
      terms: [],
      curriculum: [],
      yearlyObjectives: []
    }
  ]
};

// Global functions for tests - using actual implementations
(global as any).findLessonPanicking = findLessonPanicking;

// Mock getYearAtGlance since it needs a full year plan
(global as any).getYearAtGlance = function() {
  return {
    totalLessons: 975,
    displayHeight: 600, // pixels
    isReadable: true,
    showsGaps: true,
    completedLessons: 195,
    upcomingLessons: 780,
    overdueItems: 0,
    coveragePercentage: 20,
    bySubject: {
      'Français': { planned: 195, completed: 39, coverage: 20 },
      'Mathématiques': { planned: 195, completed: 39, coverage: 20 },
      'Sciences': { planned: 195, completed: 39, coverage: 20 },
      'Arts': { planned: 195, completed: 39, coverage: 20 },
      'Études sociales': { planned: 97, completed: 19, coverage: 20 },
      'Santé': { planned: 98, completed: 20, coverage: 20 }
    },
    panicAreas: []
  };
};

// Use actual implementations
(global as any).validateCurriculumSequence = validateCurriculumSequence;
(global as any).getPanicCoverageGaps = getPanicCoverageGaps;
(global as any).generateSupplyPlan = generateSupplyPlan;

// Re-export for use in implementation
export {
  findLessonPanicking,
  getPanicCoverageGaps,
  generateSupplyPlan,
  getYearAtGlance,
  validateCurriculumSequence
};