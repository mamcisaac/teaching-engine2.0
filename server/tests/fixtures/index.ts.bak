/**
 * Test Fixtures and Utilities Index
 * 
 * Central export point for all test data fixtures, factories, builders, and utilities.
 * Import this file to access the complete test data infrastructure.
 */

// Export factories
export {
  modernFactories,
  testScenarios,
  UserFactory,
  SubjectFactory,
  StudentFactory,
  CurriculumExpectationFactory,
  LongRangePlanFactory,
  UnitPlanFactory,
  ETFOLessonPlanFactory,
  DaybookEntryFactory,
  ExternalActivityFactory,
  CalendarEventFactory,
  ClassRoutineFactory,
} from './modern-factories';

// Export builders
export {
  builders,
  quickScenarios,
  UserBuilder,
  StudentBuilder,
  CurriculumExpectationBuilder,
  LongRangePlanBuilder,
  UnitPlanBuilder,
  ETFOLessonPlanBuilder,
  DaybookEntryBuilder,
  ActivityCollectionBuilder,
  ScenarioBuilder,
} from './test-data-builders';

// Export integration seeder
export {
  integrationSeeder,
  seedingUtils,
  IntegrationTestSeeder,
} from './integration-seeder';

// Export utilities
export {
  testDataManager,
  testDataValidator,
  testDataGenerator,
  testUtils,
  TestDataManager,
  TestDataValidator,
  TestDataComparator,
  TestDataGenerator,
} from './test-data-utilities';

// Export fixture data (JSON imports)
import usersData from './users.json';
import subjectsData from './subjects.json';
import studentsData from './students.json';
import expectationsData from './curriculum-expectations.json';
import activitiesData from './external-activities.json';
import eventsData from './calendar-events.json';
import routinesData from './class-routines.json';

export const fixtures = {
  users: usersData,
  subjects: subjectsData,
  students: studentsData,
  expectations: expectationsData,
  activities: activitiesData,
  events: eventsData,
  routines: routinesData,
};

/**
 * Quick Setup Functions
 * 
 * These are convenience functions for the most common test scenarios.
 * Use these for rapid test setup without having to use the full builder API.
 */

/**
 * Create a minimal teacher and classroom for quick tests
 * 
 * @example
 * const { teacher, students } = await quickSetup.minimal();
 */
export const quickSetup = {
  /**
   * Minimal setup: 1 teacher, 2 students, 1 subject
   */
  async minimal() {
    return await testUtils.quickTestSetup();
  },

  /**
   * English classroom: Grade 3 English teacher with full planning
   */
  async englishClassroom() {
    return await quickScenarios.englishGrade5();
  },

  /**
   * French immersion classroom: Grade 3 French teacher with planning
   */
  async frenchClassroom() {
    return await quickScenarios.frenchImmersionGrade3();
  },

  /**
   * ETFO planning setup: Complete planning hierarchy
   */
  async etfoPlanning() {
    return await seedingUtils.etfoPlanningSetup();
  },

  /**
   * Activity discovery setup: External activities and collections
   */
  async activityDiscovery() {
    return await seedingUtils.activityDiscoverySetup();
  },

  /**
   * Communication setup: Newsletter and parent message data
   */
  async communication() {
    return await seedingUtils.communicationSetup();
  },

  /**
   * Curriculum import setup: Import testing data
   */
  async curriculumImport() {
    return await seedingUtils.curriculumImportSetup();
  },

  /**
   * Full school environment: Multiple teachers, students, complete data
   */
  async fullSchool() {
    return await integrationSeeder.createSchoolEnvironment();
  },
};

/**
 * Cleanup Functions
 * 
 * Use these to clean up test data after tests complete.
 */
export const cleanup = {
  /**
   * Clean up tracked entities from TestDataManager
   */
  async tracked() {
    await testDataManager.cleanup();
  },

  /**
   * Full cleanup of all test data (use with caution)
   */
  async all() {
    await integrationSeeder.cleanup();
  },

  /**
   * Verify database is clean
   */
  async verify() {
    return await testUtils.verifyCleanDatabase();
  },
};

/**
 * Validation Functions
 * 
 * Use these to validate test data integrity and consistency.
 */
export const validation = {
  /**
   * Validate ETFO planning hierarchy
   */
  async planningHierarchy(longRangePlanId: string) {
    return await testDataValidator.validatePlanningHierarchy(longRangePlanId);
  },

  /**
   * Validate user data consistency
   */
  async userData(userId: number) {
    return await testDataValidator.validateUserData(userId);
  },
};

/**
 * Generator Functions
 * 
 * Use these to generate realistic test data patterns.
 */
export const generators = {
  /**
   * Generate student names
   */
  studentNames: TestDataGenerator.generateStudentNames,

  /**
   * Generate lesson content
   */
  lessonContent: TestDataGenerator.generateLessonContent,

  /**
   * Generate assessment rubric
   */
  assessmentRubric: TestDataGenerator.generateAssessmentRubric,
};

/**
 * Type Definitions for Test Data
 */
export interface TestTeacher {
  id: number;
  email: string;
  name: string;
  role: string;
  preferredLanguage: string;
}

export interface TestStudent {
  id: number;
  firstName: string;
  lastName: string;
  grade: number;
  userId: number;
}

export interface TestClassroom {
  teacher: TestTeacher;
  students: TestStudent[];
  subjects: any[];
}

export interface TestPlanningHierarchy {
  expectations: any[];
  longRangePlan: any;
  unitPlans: any[];
  lessonPlans: any[];
  daybookEntries?: any[];
}

/**
 * Default exports for common use cases
 */
export default {
  // Quick access to most common functions
  setup: quickSetup,
  cleanup,
  validation,
  generators,
  
  // Main APIs
  factories: modernFactories,
  builders,
  scenarios: testScenarios,
  seeder: integrationSeeder,
  utils: testUtils,
  
  // Fixture data
  fixtures,
};