import { PrismaClient } from '@teaching-engine/database';
import { randomBytes } from 'crypto';
import { getTestPrismaClient } from './jest.setup';

/**
 * Base factory interface
 */
interface Factory<T> {
  create(overrides?: Partial<T>): Promise<T>;
  createMany(count: number, overrides?: Partial<T>): Promise<T[]>;
  build(overrides?: Partial<T>): T;
}

/**
 * Factory for creating test users
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
      password: 'password123',
      name: `Test User ${id}`,
      role: 'TEACHER',
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
      users.push(await this.create(overrides));
    }
    return users;
  }
}

/**
 * Factory for creating test subjects
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
      subjects.push(await this.create(overrides));
    }
    return subjects;
  }
}

/**
 * Factory for creating test milestones
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
      milestones.push(await this.create(overrides));
    }
    return milestones;
  }
}

/**
 * Factory for creating test activities
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
      activityType: 'LESSON',
      durationMins: 60,
      privateNote: `Private note for activity ${id}`,
      publicNote: `Public note for activity ${id}`,
      tags: ['test', 'sample'],
      materialsText: `Materials for activity ${id}`,
      orderIndex: 0,
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
      activities.push(await this.create({ ...overrides, orderIndex: i }));
    }
    return activities;
  }
}

/**
 * Factory for creating test outcomes
 */
export class OutcomeFactory implements Factory<any> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  build(overrides: unknown = {}) {
    const id = randomBytes(4).toString('hex');

    return {
      code: `TEST-${id}`,
      subject: 'FRA',
      grade: 1,
      description: `Test outcome description ${id}`,
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
      outcomes.push(await this.create(overrides));
    }
    return outcomes;
  }
}

/**
 * Factory for creating test notes
 */
export class NoteFactory implements Factory<any> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  build(overrides: unknown = {}) {
    const id = randomBytes(4).toString('hex');

    return {
      content: `Test note content ${id}`,
      public: false,
      ...overrides,
    };
  }

  async create(overrides: unknown = {}) {
    const noteData = this.build(overrides);

    // Ensure we have an activityId
    if (!noteData.activityId) {
      const activity = await new ActivityFactory(this.prisma).create();
      noteData.activityId = activity.id;
    }

    return await this.prisma.note.create({
      data: noteData,
    });
  }

  async createMany(count: number, overrides: unknown = {}) {
    const notes = [];
    for (let i = 0; i < count; i++) {
      notes.push(await this.create(overrides));
    }
    return notes;
  }
}

/**
 * Factory for creating test calendar events
 */
export class CalendarEventFactory implements Factory<any> {
  private prisma: PrismaClient;

  constructor(prisma?: PrismaClient) {
    this.prisma = prisma || getTestPrismaClient();
  }

  build(overrides: unknown = {}) {
    const id = randomBytes(4).toString('hex');
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    return {
      title: `Test Event ${id}`,
      start: now,
      end: oneHourLater,
      allDay: false,
      eventType: 'MEETING',
      ...overrides,
    };
  }

  async create(overrides: unknown = {}) {
    const eventData = this.build(overrides);
    return await this.prisma.calendarEvent.create({
      data: eventData,
    });
  }

  async createMany(count: number, overrides: unknown = {}) {
    const events = [];
    for (let i = 0; i < count; i++) {
      events.push(await this.create(overrides));
    }
    return events;
  }
}

// Export factory instances for easy use
export const factories = {
  user: new UserFactory(),
  subject: new SubjectFactory(),
  milestone: new MilestoneFactory(),
  activity: new ActivityFactory(),
  outcome: new OutcomeFactory(),
  note: new NoteFactory(),
  calendarEvent: new CalendarEventFactory(),
};

/**
 * Create a complete test scenario with related data
 */
export async function createTestScenario(
  options: {
    subjectCount?: number;
    milestonesPerSubject?: number;
    activitiesPerMilestone?: number;
    outcomesPerActivity?: number;
  } = {},
) {
  const {
    subjectCount = 1,
    milestonesPerSubject = 2,
    activitiesPerMilestone = 3,
    outcomesPerActivity = 2,
  } = options;

  const scenario: unknown = {
    subjects: [],
    milestones: [],
    activities: [],
    outcomes: [],
  };

  // Create subjects
  for (let i = 0; i < subjectCount; i++) {
    const subject = await factories.subject.create();
    scenario.subjects.push(subject);

    // Create milestones for each subject
    for (let j = 0; j < milestonesPerSubject; j++) {
      const milestone = await factories.milestone.create({ subjectId: subject.id });
      scenario.milestones.push(milestone);

      // Create activities for each milestone
      for (let k = 0; k < activitiesPerMilestone; k++) {
        const activity = await factories.activity.create({
          milestoneId: milestone.id,
          orderIndex: k,
        });
        scenario.activities.push(activity);

        // Create outcomes for each activity
        for (let l = 0; l < outcomesPerActivity; l++) {
          const outcome = await factories.outcome.create();
          scenario.outcomes.push(outcome);

          // Link outcome to activity
          await factories.activity.prisma.activityOutcome.create({
            data: {
              activityId: activity.id,
              outcomeId: outcome.id,
            },
          });
        }
      }
    }
  }

  return scenario;
}
