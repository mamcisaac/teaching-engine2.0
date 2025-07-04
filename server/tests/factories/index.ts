/**
 * Test Data Factory System
 * 
 * Comprehensive factory system for generating realistic test data
 * with support for bilingual content, performance testing, and
 * scenario-based testing.
 */

// Base factory
export { BaseFactory, FactoryOptions } from './base/BaseFactory';

// Domain factories
export { UserFactory } from './domain/UserFactory';
export { CurriculumFactory } from './domain/CurriculumFactory';
export { LessonPlanFactory } from './domain/LessonPlanFactory';
export { UnitPlanFactory } from './domain/UnitPlanFactory';
export { LongRangePlanFactory } from './domain/LongRangePlanFactory';
export { DaybookFactory } from './domain/DaybookFactory';
export { SubstitutePlanFactory } from './domain/SubstitutePlanFactory';

// Scenario factories
export { TeachingScenarios } from './scenarios/TeachingScenarios';

// Performance testing
export { PerformanceDataGenerator } from './performance/PerformanceDataGenerator';

// Localization
export { BilingualFactory } from './localization/BilingualFactory';

// Seed generation
export { SeedGenerator, SeedOptions } from './seed/seedGenerator';

// Factory utilities
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { fakerFR_CA } from '@faker-js/faker';

// Import factories for type checking
import { UserFactory } from './domain/UserFactory';
import { CurriculumFactory } from './domain/CurriculumFactory';
import { LessonPlanFactory } from './domain/LessonPlanFactory';
import { UnitPlanFactory } from './domain/UnitPlanFactory';
import { LongRangePlanFactory } from './domain/LongRangePlanFactory';
import { DaybookFactory } from './domain/DaybookFactory';
import { SubstitutePlanFactory } from './domain/SubstitutePlanFactory';
import { BilingualFactory } from './localization/BilingualFactory';

/**
 * Create all factories with shared configuration
 */
export function createFactories(prisma?: PrismaClient, options?: {
  locale?: 'en' | 'fr';
  seed?: number;
}) {
  // Set faker seed if provided
  if (options?.seed) {
    faker.seed(options.seed);
    fakerFR_CA.seed(options.seed);
  }

  // Create factories
  const factories = {
    user: new UserFactory(options),
    curriculum: new CurriculumFactory(options),
    lessonPlan: new LessonPlanFactory(options),
    unitPlan: new UnitPlanFactory(options),
    longRangePlan: new LongRangePlanFactory(options),
    daybook: new DaybookFactory(options),
    substitutePlan: new SubstitutePlanFactory(options),
    bilingual: new BilingualFactory(options),
  };

  // Set prisma if provided
  if (prisma) {
    Object.values(factories).forEach(factory => {
      if ('setPrisma' in factory) {
        factory.setPrisma(prisma);
      }
    });
  }

  return factories;
}

/**
 * Quick data generation helpers
 */
export const quick = {
  /**
   * Create a teacher with full setup
   */
  async teacher(prisma: PrismaClient, options?: {
    grade?: number;
    subjects?: string[];
  }) {
    const scenarios = new TeachingScenarios(prisma);
    return scenarios.newTeacherSetup(options);
  },

  /**
   * Create a week of lessons
   */
  async weekOfLessons(prisma: PrismaClient, teacherId: number) {
    const factory = new LessonPlanFactory({ persist: true });
    factory.setPrisma(prisma);
    
    return factory.createWeekOfLessons({
      userId: teacherId,
      unitPlanId: faker.string.uuid(),
      grade: faker.number.int({ min: 1, max: 8 }),
      subject: faker.helpers.arrayElement(['Mathematics', 'Language', 'Science']),
      startDate: new Date(),
    });
  },

  /**
   * Create curriculum for a grade
   */
  async curriculum(prisma: PrismaClient, grade: number) {
    const factory = new CurriculumFactory({ persist: true });
    factory.setPrisma(prisma);
    
    return factory.createGradeCurriculum(grade);
  },

  /**
   * Create substitute plan
   */
  async substitutePlan(prisma: PrismaClient, teacherId: number) {
    const factory = new SubstitutePlanFactory({ persist: true });
    factory.setPrisma(prisma);
    
    return factory.createDetailedSubPlan({
      userId: teacherId,
      date: new Date(),
      grade: faker.number.int({ min: 1, max: 8 }),
      includeEmergencyInfo: true,
      includeStudentInfo: true,
      includeSchedule: true,
    });
  },
};

/**
 * Test data cleanup utilities
 */
export async function cleanupTestData(prisma: PrismaClient) {
  console.log('Cleaning up test data...');
  
  // Delete in correct order to respect foreign keys
  await prisma.daybookEntryExpectation.deleteMany({});
  await prisma.eTFOLessonPlanExpectation.deleteMany({});
  await prisma.unitPlanExpectation.deleteMany({});
  await prisma.longRangePlanExpectation.deleteMany({});
  
  await prisma.daybookEntry.deleteMany({});
  await prisma.eTFOLessonPlanResource.deleteMany({});
  await prisma.eTFOLessonPlan.deleteMany({});
  await prisma.unitPlanResource.deleteMany({});
  await prisma.unitPlan.deleteMany({});
  await prisma.longRangePlan.deleteMany({});
  
  await prisma.curriculumExpectationEmbedding.deleteMany({});
  await prisma.curriculumExpectation.deleteMany({});
  await prisma.expectationCluster.deleteMany({});
  await prisma.curriculumImport.deleteMany({});
  
  await prisma.substitutePlan.deleteMany({});
  await prisma.newsletter.deleteMany({});
  await prisma.classRoutine.deleteMany({});
  await prisma.classroomAnnouncement.deleteMany({});
  
  // Only delete test users
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: '@test.com' } },
        { email: { contains: '@school.ca' } },
        { email: { contains: '@board.ca' } },
      ],
    },
  });
  
  console.log('Test data cleanup complete');
}

// Export legacy factories for backward compatibility
export { default as testFactories } from './testFactories';