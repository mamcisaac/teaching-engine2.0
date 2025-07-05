/**
 * Test Data Factory
 * 
 * Provides a unified interface for creating test data using the existing factories
 * with support for real database operations.
 */

import { PrismaClient } from '@teaching-engine/database';
import { UserFactory } from '../factories/domain/UserFactory';
import { CurriculumFactory } from '../factories/domain/CurriculumFactory';
import { LongRangePlanFactory } from '../factories/domain/LongRangePlanFactory';
import { UnitPlanFactory } from '../factories/domain/UnitPlanFactory';
import { ETFOLessonPlanFactory } from '../factories/domain/LessonPlanFactory';
import { DaybookFactory } from '../factories/domain/DaybookFactory';
import { SubstitutePlanFactory } from '../factories/domain/SubstitutePlanFactory';

export interface TestDataContext {
  prisma: PrismaClient;
  locale?: 'en' | 'fr';
  seed?: number;
}

export class TestDataFactory {
  private userFactory: UserFactory;
  private curriculumFactory: CurriculumFactory;
  private longRangePlanFactory: LongRangePlanFactory;
  private unitPlanFactory: UnitPlanFactory;
  private lessonPlanFactory: ETFOLessonPlanFactory;
  private daybookFactory: DaybookFactory;
  private substitutePlanFactory: SubstitutePlanFactory;

  constructor(private context: TestDataContext) {
    const factoryOptions = {
      locale: context.locale,
      seed: context.seed,
      persist: true, // Always persist in tests
    };

    // Initialize factories
    this.userFactory = new UserFactory(factoryOptions);
    this.userFactory.setPrisma(context.prisma);

    this.curriculumFactory = new CurriculumFactory(factoryOptions);
    this.curriculumFactory.setPrisma(context.prisma);

    this.longRangePlanFactory = new LongRangePlanFactory(factoryOptions);
    this.longRangePlanFactory.setPrisma(context.prisma);

    this.unitPlanFactory = new UnitPlanFactory(factoryOptions);
    this.unitPlanFactory.setPrisma(context.prisma);

    this.lessonPlanFactory = new ETFOLessonPlanFactory(factoryOptions);
    this.lessonPlanFactory.setPrisma(context.prisma);

    this.daybookFactory = new DaybookFactory(factoryOptions);
    this.daybookFactory.setPrisma(context.prisma);

    this.substitutePlanFactory = new SubstitutePlanFactory(factoryOptions);
    this.substitutePlanFactory.setPrisma(context.prisma);
  }

  /**
   * Create a complete teacher scenario with all planning levels
   */
  async createTeacherScenario(options?: {
    teacherName?: string;
    grade?: number;
    subject?: string;
    includeSubPlans?: boolean;
  }) {
    const grade = options?.grade || 4;
    const subject = options?.subject || 'Mathematics';

    // Create teacher
    const teacher = await this.userFactory.create({
      name: options?.teacherName,
      preferredLanguage: this.context.locale || 'en',
    });

    // Create curriculum expectations
    const expectations = await this.curriculumFactory.createGradeExpectations({
      grade,
      subject,
      count: 20,
    });

    // Create long-range plan
    const longRangePlan = await this.longRangePlanFactory.create({
      userId: teacher.id,
      grade,
      subject,
      expectations: expectations.slice(0, 15), // Use most expectations
    });

    // Create unit plans
    const unitPlans = await Promise.all([
      this.unitPlanFactory.create({
        userId: teacher.id,
        longRangePlanId: longRangePlan.id,
        title: 'Number Sense and Numeration',
        expectations: expectations.slice(0, 5),
      }),
      this.unitPlanFactory.create({
        userId: teacher.id,
        longRangePlanId: longRangePlan.id,
        title: 'Measurement',
        expectations: expectations.slice(5, 10),
      }),
      this.unitPlanFactory.create({
        userId: teacher.id,
        longRangePlanId: longRangePlan.id,
        title: 'Geometry and Spatial Sense',
        expectations: expectations.slice(10, 15),
      }),
    ]);

    // Create lesson plans for the first unit
    const lessonPlans = await this.lessonPlanFactory.createUnitLessons({
      userId: teacher.id,
      unitPlan: unitPlans[0],
      count: 5,
    });

    // Create daybook entries for completed lessons
    const daybookEntries = await Promise.all(
      lessonPlans.slice(0, 3).map(lesson =>
        this.daybookFactory.create({
          userId: teacher.id,
          lessonPlanId: lesson.id,
          date: lesson.date,
        })
      )
    );

    // Create substitute plan if requested
    let substitutePlan;
    if (options?.includeSubPlans) {
      substitutePlan = await this.substitutePlanFactory.create({
        userId: teacher.id,
        grade,
        subject,
        dateFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      });
    }

    return {
      teacher,
      expectations,
      longRangePlan,
      unitPlans,
      lessonPlans,
      daybookEntries,
      substitutePlan,
    };
  }

  /**
   * Create minimal test data for unit tests
   */
  async createMinimalTestData() {
    const user = await this.userFactory.create();
    const expectation = await this.curriculumFactory.create();
    
    return { user, expectation };
  }

  /**
   * Create integration test data with relationships
   */
  async createIntegrationTestData() {
    // Create users
    const teacher = await this.userFactory.create();
    const principal = await this.userFactory.createPrincipal();
    
    // Create curriculum
    const expectations = await this.curriculumFactory.createMany(10);
    
    // Create planning hierarchy
    const longRangePlan = await this.longRangePlanFactory.create({
      userId: teacher.id,
      expectations: expectations.slice(0, 5),
    });
    
    const unitPlan = await this.unitPlanFactory.create({
      userId: teacher.id,
      longRangePlanId: longRangePlan.id,
      expectations: expectations.slice(0, 3),
    });
    
    const lessonPlan = await this.lessonPlanFactory.create({
      userId: teacher.id,
      unitPlanId: unitPlan.id,
      expectations: [expectations[0]],
    });
    
    return {
      users: { teacher, principal },
      curriculum: { expectations },
      planning: { longRangePlan, unitPlan, lessonPlan },
    };
  }

  /**
   * Create performance test data at scale
   */
  async createPerformanceTestData(scale: 'small' | 'medium' | 'large' = 'medium') {
    const counts = {
      small: { users: 10, expectations: 50, plans: 20 },
      medium: { users: 50, expectations: 200, plans: 100 },
      large: { users: 200, expectations: 1000, plans: 500 },
    };

    const config = counts[scale];
    
    console.log(`Creating ${scale} performance test dataset...`);
    
    // Create users in batches
    const users = await this.createInBatches(
      config.users,
      10,
      () => this.userFactory.create()
    );
    
    // Create expectations in batches
    const expectations = await this.createInBatches(
      config.expectations,
      20,
      () => this.curriculumFactory.create()
    );
    
    // Create plans for each user
    const plans = [];
    for (const user of users.slice(0, config.plans / 5)) {
      const longRangePlan = await this.longRangePlanFactory.create({
        userId: user.id,
        expectations: this.randomSample(expectations, 10),
      });
      plans.push(longRangePlan);
    }
    
    return { users, expectations, plans };
  }

  /**
   * Create bilingual test data
   */
  async createBilingualTestData() {
    // Create English data
    const enFactory = new TestDataFactory({
      ...this.context,
      locale: 'en',
    });
    
    const enTeacher = await enFactory.userFactory.create({
      preferredLanguage: 'en',
      name: 'English Teacher',
    });
    
    const enExpectations = await enFactory.curriculumFactory.createMany(5);
    
    // Create French data
    const frFactory = new TestDataFactory({
      ...this.context,
      locale: 'fr',
    });
    
    const frTeacher = await frFactory.userFactory.create({
      preferredLanguage: 'fr',
      name: 'Professeur Français',
    });
    
    const frExpectations = await frFactory.curriculumFactory.createMany(5);
    
    return {
      english: { teacher: enTeacher, expectations: enExpectations },
      french: { teacher: frTeacher, expectations: frExpectations },
    };
  }

  /**
   * Helper: Create data in batches to avoid memory issues
   */
  private async createInBatches<T>(
    total: number,
    batchSize: number,
    creator: () => Promise<T>
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < total; i += batchSize) {
      const batch = await Promise.all(
        Array(Math.min(batchSize, total - i))
          .fill(null)
          .map(() => creator())
      );
      results.push(...batch);
      
      // Log progress for large datasets
      if (total > 100 && i % 100 === 0) {
        console.log(`Created ${i}/${total} items...`);
      }
    }
    
    return results;
  }

  /**
   * Helper: Get random sample from array
   */
  private randomSample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Clean up all created data
   */
  async cleanup() {
    // Factories should implement their own cleanup
    await Promise.all([
      this.userFactory.cleanup?.(),
      this.curriculumFactory.cleanup?.(),
      this.longRangePlanFactory.cleanup?.(),
      this.unitPlanFactory.cleanup?.(),
      this.lessonPlanFactory.cleanup?.(),
      this.daybookFactory.cleanup?.(),
      this.substitutePlanFactory.cleanup?.(),
    ]);
  }
}

/**
 * Create a test data factory instance
 */
export function createTestDataFactory(prisma: PrismaClient, options?: {
  locale?: 'en' | 'fr';
  seed?: number;
}): TestDataFactory {
  return new TestDataFactory({
    prisma,
    locale: options?.locale,
    seed: options?.seed,
  });
}