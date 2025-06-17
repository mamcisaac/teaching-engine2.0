import { 
  PrismaClient, 
  User, 
  Subject, 
  Outcome, 
  Activity, 
  DailyPlan,
  Milestone,
  Note,
  ActivityType,
  GroupingType,
  AssessmentType
} from '@teaching-engine/database';
import { randomBytes } from 'crypto';
import { getTestPrismaClient, executeWithRetry } from '../jest.setup';

/**
 * Test data factory for creating test entities with sensible defaults
 * All entities created through factories are automatically cleaned up via transaction rollback
 */

// Helper to generate unique IDs
function generateId(prefix: string = ''): string {
  return `${prefix}${randomBytes(8).toString('hex')}`;
}

// Helper to get the test client
function getClient(): PrismaClient {
  return getTestPrismaClient();
}

/**
 * User factory
 */
export const userFactory = {
  async create(overrides: Partial<User> = {}): Promise<User> {
    const client = getClient();
    const id = generateId('user_');
    
    return executeWithRetry(() => 
      client.user.create({
        data: {
          id,
          username: `test_${id}`,
          email: `${id}@test.com`,
          passwordHash: 'hashed_password',
          firstName: 'Test',
          lastName: 'User',
          role: 'TEACHER',
          createdAt: new Date(),
          updatedAt: new Date(),
          ...overrides,
        },
      })
    );
  },
  
  async createMany(count: number, overrides: Partial<User> = {}): Promise<User[]> {
    const users: User[] = [];
    for (let i = 0; i < count; i++) {
      const user = await this.create({
        ...overrides,
        username: overrides.username ? `${overrides.username}_${i}` : undefined,
        email: overrides.email ? `${i}_${overrides.email}` : undefined,
      });
      users.push(user);
    }
    return users;
  },
};

/**
 * Subject factory
 */
export const subjectFactory = {
  async create(overrides: Partial<Subject> = {}): Promise<Subject> {
    const client = getClient();
    const id = generateId('subject_');
    
    return executeWithRetry(() =>
      client.subject.create({
        data: {
          id,
          name: `Test Subject ${id}`,
          nameEn: overrides.nameEn || `Test Subject ${id}`,
          nameFr: overrides.nameFr || `Matière de test ${id}`,
          gradeLevel: 5,
          ...overrides,
        },
      })
    );
  },
  
  async createMany(count: number, overrides: Partial<Subject> = {}): Promise<Subject[]> {
    const subjects: Subject[] = [];
    for (let i = 0; i < count; i++) {
      const subject = await this.create({
        ...overrides,
        name: overrides.name ? `${overrides.name} ${i}` : `Test Subject ${i}`,
      });
      subjects.push(subject);
    }
    return subjects;
  },
  
  async createWithUser(userOverrides: Partial<User> = {}, subjectOverrides: Partial<Subject> = {}): Promise<{ user: User; subject: Subject }> {
    const user = await userFactory.create(userOverrides);
    const subject = await this.create({
      ...subjectOverrides,
      userId: user.id,
    });
    return { user, subject };
  },
};

/**
 * Milestone factory
 */
export const milestoneFactory = {
  async create(overrides: Partial<Milestone> = {}): Promise<Milestone> {
    const client = getClient();
    const id = generateId('milestone_');
    
    // Ensure we have a subject
    let subjectId = overrides.subjectId;
    if (!subjectId) {
      const subject = await subjectFactory.create();
      subjectId = subject.id;
    }
    
    return executeWithRetry(() =>
      client.milestone.create({
        data: {
          id,
          title: `Test Milestone ${id}`,
          description: `Description for milestone ${id}`,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          completed: false,
          subjectId,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...overrides,
        },
      })
    );
  },
  
  async createMany(count: number, overrides: Partial<Milestone> = {}): Promise<Milestone[]> {
    const milestones: Milestone[] = [];
    for (let i = 0; i < count; i++) {
      const milestone = await this.create({
        ...overrides,
        title: overrides.title ? `${overrides.title} ${i}` : `Test Milestone ${i}`,
      });
      milestones.push(milestone);
    }
    return milestones;
  },
};

/**
 * Outcome factory
 */
export const outcomeFactory = {
  async create(overrides: Partial<Outcome> = {}): Promise<Outcome> {
    const client = getClient();
    const id = generateId('outcome_');
    
    // Ensure we have a subject
    let subjectId = overrides.subjectId;
    if (!subjectId) {
      const subject = await subjectFactory.create();
      subjectId = subject.id;
    }
    
    return executeWithRetry(() =>
      client.outcome.create({
        data: {
          id,
          code: `TEST.${id}`,
          description: `Test outcome ${id}`,
          subjectId,
          gradeLevel: 5,
          strand: 'Test Strand',
          createdAt: new Date(),
          ...overrides,
        },
      })
    );
  },
  
  async createMany(count: number, overrides: Partial<Outcome> = {}): Promise<Outcome[]> {
    const outcomes: Outcome[] = [];
    for (let i = 0; i < count; i++) {
      const outcome = await this.create({
        ...overrides,
        code: overrides.code ? `${overrides.code}.${i}` : undefined,
        description: overrides.description ? `${overrides.description} ${i}` : undefined,
      });
      outcomes.push(outcome);
    }
    return outcomes;
  },
  
  async createWithSubject(subjectOverrides: Partial<Subject> = {}, outcomeOverrides: Partial<Outcome> = {}): Promise<{ subject: Subject; outcome: Outcome }> {
    const subject = await subjectFactory.create(subjectOverrides);
    const outcome = await this.create({
      ...outcomeOverrides,
      subjectId: subject.id,
    });
    return { subject, outcome };
  },
};

/**
 * Activity factory
 */
export const activityFactory = {
  async create(overrides: Partial<Activity> = {}): Promise<Activity> {
    const client = getClient();
    const id = generateId('activity_');
    
    // Ensure we have a milestone
    let milestoneId = overrides.milestoneId;
    if (!milestoneId) {
      const milestone = await milestoneFactory.create();
      milestoneId = milestone.id;
    }
    
    return executeWithRetry(() =>
      client.activity.create({
        data: {
          id,
          title: `Test Activity ${id}`,
          type: 'MINDS_ON' as ActivityType,
          description: `Description for ${id}`,
          duration: 30,
          materials: ['pencil', 'paper'],
          teachingStrategies: ['discussion', 'demonstration'],
          groupingType: 'WHOLE_CLASS' as GroupingType,
          differentiationStrategies: [],
          accommodations: [],
          assessmentType: 'FORMATIVE' as AssessmentType,
          safetyConsiderations: null,
          milestoneId,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...overrides,
        },
      })
    );
  },
  
  async createMany(count: number, overrides: Partial<Activity> = {}): Promise<Activity[]> {
    const activities: Activity[] = [];
    for (let i = 0; i < count; i++) {
      const activity = await this.create({
        ...overrides,
        title: overrides.title ? `${overrides.title} ${i}` : `Test Activity ${i}`,
      });
      activities.push(activity);
    }
    return activities;
  },
  
  async createWithOutcomes(outcomeIds: string[], overrides: Partial<Activity> = {}): Promise<Activity> {
    const client = getClient();
    const id = generateId('activity_');
    
    // Ensure we have a milestone
    let milestoneId = overrides.milestoneId;
    if (!milestoneId) {
      const milestone = await milestoneFactory.create();
      milestoneId = milestone.id;
    }
    
    return executeWithRetry(() =>
      client.activity.create({
        data: {
          id,
          title: `Test Activity ${id}`,
          type: 'MINDS_ON' as ActivityType,
          description: `Description for ${id}`,
          duration: 30,
          materials: ['pencil', 'paper'],
          teachingStrategies: ['discussion', 'demonstration'],
          groupingType: 'WHOLE_CLASS' as GroupingType,
          differentiationStrategies: [],
          accommodations: [],
          assessmentType: 'FORMATIVE' as AssessmentType,
          safetyConsiderations: null,
          milestoneId,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...overrides,
          outcomes: {
            create: outcomeIds.map(outcomeId => ({
              outcomeId,
            })),
          },
        },
        include: {
          outcomes: true,
        },
      })
    );
  },
};

/**
 * Note factory
 */
export const noteFactory = {
  async create(overrides: Partial<Note> = {}): Promise<Note> {
    const client = getClient();
    const id = generateId('note_');
    
    // Ensure we have an activity
    let activityId = overrides.activityId;
    if (!activityId) {
      const activity = await activityFactory.create();
      activityId = activity.id;
    }
    
    return executeWithRetry(() =>
      client.note.create({
        data: {
          id,
          content: `Test note content for ${id}`,
          activityId,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...overrides,
        },
      })
    );
  },
  
  async createMany(count: number, overrides: Partial<Note> = {}): Promise<Note[]> {
    const notes: Note[] = [];
    for (let i = 0; i < count; i++) {
      const note = await this.create({
        ...overrides,
        content: overrides.content ? `${overrides.content} ${i}` : `Test note ${i}`,
      });
      notes.push(note);
    }
    return notes;
  },
};

/**
 * Daily Plan factory
 */
export const dailyPlanFactory = {
  async create(overrides: Partial<DailyPlan> = {}): Promise<DailyPlan> {
    const client = getClient();
    const id = generateId('plan_');
    
    // Ensure we have a user
    let userId = overrides.userId;
    if (!userId) {
      const user = await userFactory.create();
      userId = user.id;
    }
    
    return executeWithRetry(() =>
      client.dailyPlan.create({
        data: {
          id,
          date: new Date(),
          userId,
          notes: `Test notes for ${id}`,
          reflections: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...overrides,
        },
      })
    );
  },
  
  async createWithItems(itemCount: number = 3, overrides: Partial<DailyPlan> = {}): Promise<DailyPlan> {
    const client = getClient();
    const id = generateId('plan_');
    
    // Ensure we have a user
    let userId = overrides.userId;
    if (!userId) {
      const user = await userFactory.create();
      userId = user.id;
    }
    
    // Create subjects for the items
    const subjects = await Promise.all(
      Array.from({ length: itemCount }, () => subjectFactory.create())
    );
    
    return executeWithRetry(() =>
      client.dailyPlan.create({
        data: {
          id,
          date: new Date(),
          userId,
          notes: `Test notes for ${id}`,
          reflections: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...overrides,
          items: {
            create: subjects.map((subject, index) => ({
              timeSlot: `${9 + index}:00-${9 + index}:50`,
              subjectId: subject.id,
              activities: [`Activity ${index + 1}`],
              notes: `Notes for item ${index + 1}`,
              order: index,
            })),
          },
        },
        include: {
          items: true,
        },
      })
    );
  },
};

/**
 * Export all factories
 */
export const factories = {
  user: userFactory,
  subject: subjectFactory,
  milestone: milestoneFactory,
  outcome: outcomeFactory,
  activity: activityFactory,
  note: noteFactory,
  dailyPlan: dailyPlanFactory,
};

/**
 * Test scenario creator
 */
export interface TestScenarioOptions {
  subjectCount?: number;
  milestonesPerSubject?: number;
  activitiesPerMilestone?: number;
  outcomesPerActivity?: number;
}

export async function createTestScenario(options: TestScenarioOptions = {}) {
  const {
    subjectCount = 1,
    milestonesPerSubject = 1,
    activitiesPerMilestone = 1,
    outcomesPerActivity = 1,
  } = options;
  
  const user = await userFactory.create();
  const subjects: Subject[] = [];
  const milestones: Milestone[] = [];
  const activities: Activity[] = [];
  const outcomes: Outcome[] = [];
  
  // Create subjects
  for (let i = 0; i < subjectCount; i++) {
    const subject = await subjectFactory.create({
      name: `Subject ${i + 1}`,
      userId: user.id,
    });
    subjects.push(subject);
    
    // Create milestones for each subject
    for (let j = 0; j < milestonesPerSubject; j++) {
      const milestone = await milestoneFactory.create({
        title: `Milestone ${i + 1}-${j + 1}`,
        subjectId: subject.id,
      });
      milestones.push(milestone);
      
      // Create activities for each milestone
      for (let k = 0; k < activitiesPerMilestone; k++) {
        const activity = await activityFactory.create({
          title: `Activity ${i + 1}-${j + 1}-${k + 1}`,
          milestoneId: milestone.id,
        });
        activities.push(activity);
        
        // Create outcomes for each activity
        for (let l = 0; l < outcomesPerActivity; l++) {
          const outcome = await outcomeFactory.create({
            code: `OUT.${i + 1}.${j + 1}.${k + 1}.${l + 1}`,
            description: `Outcome ${l + 1} for activity ${activity.title}`,
            subjectId: subject.id,
          });
          outcomes.push(outcome);
          
          // Link outcome to activity
          await getClient().activityOutcome.create({
            data: {
              activityId: activity.id,
              outcomeId: outcome.id,
            },
          });
        }
      }
    }
  }
  
  return {
    user,
    subjects,
    milestones,
    activities,
    outcomes,
  };
}

/**
 * Test data seeder for complex scenarios
 */
export const testSeeder = {
  /**
   * Create a complete test scenario with user, subjects, outcomes, and activities
   */
  async createCompleteScenario() {
    return createTestScenario({
      subjectCount: 2,
      milestonesPerSubject: 2,
      activitiesPerMilestone: 2,
      outcomesPerActivity: 2,
    });
  },
  
  /**
   * Create minimal test data
   */
  async createMinimal() {
    const { user, subject } = await subjectFactory.createWithUser();
    const milestone = await milestoneFactory.create({ subjectId: subject.id });
    const outcome = await outcomeFactory.create({ subjectId: subject.id });
    const activity = await activityFactory.create({ milestoneId: milestone.id });
    
    return { user, subject, milestone, outcome, activity };
  },
};