import { PrismaClient } from '@teaching-engine/database';
import { randomBytes } from 'crypto';
import { getTestPrismaClient } from './jest.setup';

/**
 * Enhanced factory system for test data creation with better type safety and domain scenarios
 */

/**
 * Base factory interface with improved typing
 */
interface Factory<T> {
  create(overrides?: Partial<T>): Promise<T>;
  createMany(count: number, overrides?: Partial<T>): Promise<T[]>;
  build(overrides?: Partial<T>): Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Enhanced User Factory
 */
export class UserFactory implements Factory<any> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  build(overrides: unknown = {}) {
    const id = randomBytes(4).toString('hex');
    return {
      email: `test-${id}@example.com`,
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj8zKBqQ9cmu', // hashed 'password'
      name: `Test User ${id}`,
      role: 'teacher',
      preferredLanguage: 'en',
      ...overrides,
    };
  }

  async create(overrides: unknown = {}) {
    const userData = this.build(overrides);
    return await this.prisma.user.create({
      data: userData,
    });
  }

  async createMany(count: number, overrides: unknown = {}) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const userData = this.build({
        ...overrides,
        email: `test-bulk-${i}-${randomBytes(2).toString('hex')}@example.com`,
        name: `Test User ${i + 1}`,
      });
      users.push(userData);
    }

    const result = await this.prisma.user.createMany({
      data: users,
    });

    // Return the created users (SQLite doesn't return IDs from createMany)
    return await this.prisma.user.findMany({
      where: {
        email: {
          in: users.map((u) => u.email),
        },
      },
      orderBy: { id: 'asc' },
    });
  }
}

/**
 * Enhanced Subject Factory
 */
export class SubjectFactory implements Factory<any> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  build(overrides: unknown = {}) {
    const id = randomBytes(4).toString('hex');
    return {
      name: `Test Subject ${id}`,
      nameEn: `Test Subject ${id} EN`,
      nameFr: `Test Subject ${id} FR`,
      ...overrides,
    };
  }

  async create(overrides: unknown = {}) {
    const subjectData = this.build(overrides);
    return await this.prisma.subject.create({
      data: subjectData,
    });
  }

  async createMany(count: number, overrides: unknown = {}) {
    const subjects = [];
    for (let i = 0; i < count; i++) {
      const subjectData = this.build({
        ...overrides,
        name: `Test Subject ${i + 1}`,
        nameEn: `Test Subject ${i + 1} EN`,
        nameFr: `Test Subject ${i + 1} FR`,
      });
      subjects.push(subjectData);
    }

    const result = await this.prisma.subject.createMany({
      data: subjects,
    });

    return await this.prisma.subject.findMany({
      where: {
        name: {
          in: subjects.map((s) => s.name),
        },
      },
      orderBy: { id: 'asc' },
    });
  }
}

/**
 * Enhanced Milestone Factory
 */
export class MilestoneFactory implements Factory<any> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  build(overrides: unknown = {}) {
    const id = randomBytes(4).toString('hex');
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      title: `Test Milestone ${id}`,
      titleEn: `Test Milestone ${id} EN`,
      titleFr: `Test Milestone ${id} FR`,
      description: `Test milestone description ${id}`,
      startDate: now,
      endDate: oneWeekFromNow,
      estHours: 10,
      ...overrides,
    };
  }

  async create(overrides: unknown = {}) {
    const milestoneData = this.build(overrides);

    // Ensure we have a subjectId
    if (!milestoneData.subjectId) {
      const subject = await new SubjectFactory(this.prisma).create();
      milestoneData.subjectId = subject.id;
    }

    return await this.prisma.milestone.create({
      data: milestoneData,
    });
  }

  async createMany(count: number, overrides: unknown = {}) {
    const milestones = [];
    for (let i = 0; i < count; i++) {
      milestones.push(
        await this.create({
          ...overrides,
          title: `Test Milestone ${i + 1}`,
        }),
      );
    }
    return milestones;
  }
}

/**
 * Enhanced Activity Factory
 */
export class ActivityFactory implements Factory<any> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  build(overrides: unknown = {}) {
    const id = randomBytes(4).toString('hex');

    return {
      title: `Test Activity ${id}`,
      titleEn: `Test Activity ${id} EN`,
      titleFr: `Test Activity ${id} FR`,
      activityType: 'LESSON',
      durationMins: 60,
      privateNote: `Private note for activity ${id}`,
      privateNoteEn: `Private note for activity ${id} EN`,
      privateNoteFr: `Private note for activity ${id} FR`,
      publicNote: `Public note for activity ${id}`,
      publicNoteEn: `Public note for activity ${id} EN`,
      publicNoteFr: `Public note for activity ${id} FR`,
      tags: ['test', 'sample'],
      materialsText: `Materials for activity ${id}`,
      materialsTextEn: `Materials for activity ${id} EN`,
      materialsTextFr: `Materials for activity ${id} FR`,
      orderIndex: 0,
      isSubFriendly: true,
      isFallback: false,
      ...overrides,
    };
  }

  async create(overrides: unknown = {}) {
    const activityData = this.build(overrides);

    // Ensure we have a milestoneId
    if (!activityData.milestoneId) {
      const milestone = await new MilestoneFactory(this.prisma).create();
      activityData.milestoneId = milestone.id;
    }

    return await this.prisma.activity.create({
      data: activityData,
    });
  }

  async createMany(count: number, overrides: unknown = {}) {
    const activities = [];
    for (let i = 0; i < count; i++) {
      activities.push(
        await this.create({
          ...overrides,
          orderIndex: i,
          title: `Test Activity ${i + 1}`,
        }),
      );
    }
    return activities;
  }
}

/**
 * Enhanced Outcome Factory
 */
export class OutcomeFactory implements Factory<any> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  build(overrides: unknown = {}) {
    const id = randomBytes(4).toString('hex');

    return {
      code: `TEST-${id.toUpperCase()}`,
      subject: 'FRA',
      grade: 1,
      description: `Test outcome description ${id}`,
      domain: 'Communication orale',
      ...overrides,
    };
  }

  async create(overrides: unknown = {}) {
    const outcomeData = this.build(overrides);
    return await this.prisma.outcome.create({
      data: outcomeData,
    });
  }

  async createMany(count: number, overrides: unknown = {}) {
    const outcomes = [];
    for (let i = 0; i < count; i++) {
      outcomes.push(
        await this.create({
          ...overrides,
          code: `TEST-BULK-${i.toString().padStart(4, '0')}`,
          description: `Test outcome ${i + 1}`,
        }),
      );
    }
    return outcomes;
  }
}

// Export factory instances
export const enhancedFactories = {
  user: new UserFactory(),
  subject: new SubjectFactory(),
  milestone: new MilestoneFactory(),
  activity: new ActivityFactory(),
  outcome: new OutcomeFactory(),
};

/**
 * Domain-specific factory scenarios
 */
export const domainFactories = {
  /**
   * Create a French immersion classroom scenario
   */
  async frenchImmersionClassroom() {
    const teacher = await enhancedFactories.user.create({
      name: 'Mme. Dubois',
      email: 'teacher@frenchimmersion.edu',
      role: 'teacher',
      preferredLanguage: 'fr',
    });

    const subjects = await Promise.all([
      enhancedFactories.subject.create({
        name: 'Français',
        nameEn: 'French',
        nameFr: 'Français',
        userId: teacher.id,
      }),
      enhancedFactories.subject.create({
        name: 'Mathématiques',
        nameEn: 'Mathematics',
        nameFr: 'Mathématiques',
        userId: teacher.id,
      }),
      enhancedFactories.subject.create({
        name: 'Sciences',
        nameEn: 'Science',
        nameFr: 'Sciences',
        userId: teacher.id,
      }),
    ]);

    const outcomes = await Promise.all([
      enhancedFactories.outcome.create({
        code: 'FRA-1-CO-1',
        subject: 'FRA',
        grade: 1,
        description: "L'élève peut comprendre des instructions simples",
        domain: 'Communication orale',
      }),
      enhancedFactories.outcome.create({
        code: 'MAT-1-N-1',
        subject: 'MAT',
        grade: 1,
        description: "L'élève peut compter jusqu'à 20",
        domain: 'Nombre',
      }),
    ]);

    return { teacher, subjects, outcomes };
  },

  /**
   * Create a complete curriculum unit
   */
  async curriculumUnit(
    options: {
      subject?: string;
      grade?: number;
      unitTitle?: string;
      activityCount?: number;
    } = {},
  ) {
    const {
      subject = 'FRA',
      grade = 1,
      unitTitle = 'Test Curriculum Unit',
      activityCount = 5,
    } = options;

    const teacher = await enhancedFactories.user.create();
    const subjectRecord = await enhancedFactories.subject.create({
      name: subject,
      userId: teacher.id,
    });

    const milestone = await enhancedFactories.milestone.create({
      title: unitTitle,
      subjectId: subjectRecord.id,
      userId: teacher.id,
      estHours: activityCount * 2, // 2 hours per activity
    });

    const activities = await enhancedFactories.activity.createMany(activityCount, {
      milestoneId: milestone.id,
      userId: teacher.id,
    });

    const outcomes = await enhancedFactories.outcome.createMany(activityCount * 2, {
      subject,
      grade,
    });

    // Link activities to outcomes
    const relations = [];
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const activityOutcomes = outcomes.slice(i * 2, (i + 1) * 2);

      for (const outcome of activityOutcomes) {
        await getTestPrismaClient().activityOutcome.create({
          data: {
            activityId: activity.id,
            outcomeId: outcome.id,
          },
        });
        relations.push({ activityId: activity.id, outcomeId: outcome.id });
      }
    }

    return {
      teacher,
      subject: subjectRecord,
      milestone,
      activities,
      outcomes,
      relations,
    };
  },

  /**
   * Create assessment tracking scenario
   */
  async assessmentTracking() {
    const teacher = await enhancedFactories.user.create();

    const assessmentTemplates = await Promise.all([
      getTestPrismaClient().assessmentTemplate.create({
        data: {
          title: 'Oral French Assessment',
          type: 'oral',
          description: 'Assessment of oral French proficiency',
          outcomeIds: JSON.stringify(['FRA-1-CO-1', 'FRA-1-EO-1']),
          userId: teacher.id,
        },
      }),
      getTestPrismaClient().assessmentTemplate.create({
        data: {
          title: 'Math Problem Solving',
          type: 'written',
          description: 'Problem solving assessment',
          outcomeIds: JSON.stringify(['MAT-1-N-1', 'MAT-1-PS-1']),
          userId: teacher.id,
        },
      }),
    ]);

    const assessmentResults = [];
    for (const template of assessmentTemplates) {
      for (let i = 0; i < 3; i++) {
        const result = await getTestPrismaClient().assessmentResult.create({
          data: {
            templateId: template.id,
            date: new Date(2024, 2, i * 7 + 1), // Weekly assessments
            groupScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
            notes: `Assessment notes for week ${i + 1}`,
          },
        });
        assessmentResults.push(result);
      }
    }

    return { teacher, assessmentTemplates, assessmentResults };
  },
};

/**
 * Bulk creation utilities for performance testing
 */
export const bulkFactories = {
  async createUsers(count: number) {
    return await enhancedFactories.user.createMany(count);
  },

  async createSubjects(count: number, userId?: number) {
    return await enhancedFactories.subject.createMany(count, { userId });
  },

  async createOutcomes(count: number, subject = 'FRA', grade = 1) {
    return await enhancedFactories.outcome.createMany(count, { subject, grade });
  },

  async createCompleteScenario(
    options: {
      userCount?: number;
      subjectsPerUser?: number;
      milestonesPerSubject?: number;
      activitiesPerMilestone?: number;
      outcomesPerActivity?: number;
    } = {},
  ) {
    const {
      userCount = 2,
      subjectsPerUser = 3,
      milestonesPerSubject = 4,
      activitiesPerMilestone = 5,
      outcomesPerActivity = 2,
    } = options;

    const users = await this.createUsers(userCount);
    const allSubjects = [];
    const allMilestones = [];
    const allActivities = [];
    const allOutcomes = [];

    for (const user of users) {
      const subjects = await this.createSubjects(subjectsPerUser, user.id);
      allSubjects.push(...subjects);

      for (const subject of subjects) {
        const milestones = await enhancedFactories.milestone.createMany(milestonesPerSubject, {
          subjectId: subject.id,
          userId: user.id,
        });
        allMilestones.push(...milestones);

        for (const milestone of milestones) {
          const activities = await enhancedFactories.activity.createMany(activitiesPerMilestone, {
            milestoneId: milestone.id,
            userId: user.id,
          });
          allActivities.push(...activities);

          for (const activity of activities) {
            const outcomes = await this.createOutcomes(outcomesPerActivity);
            allOutcomes.push(...outcomes);

            // Link outcomes to activities
            for (const outcome of outcomes) {
              await getTestPrismaClient().activityOutcome.create({
                data: {
                  activityId: activity.id,
                  outcomeId: outcome.id,
                },
              });
            }
          }
        }
      }
    }

    return {
      users,
      subjects: allSubjects,
      milestones: allMilestones,
      activities: allActivities,
      outcomes: allOutcomes,
      stats: {
        totalUsers: users.length,
        totalSubjects: allSubjects.length,
        totalMilestones: allMilestones.length,
        totalActivities: allActivities.length,
        totalOutcomes: allOutcomes.length,
      },
    };
  },
};
