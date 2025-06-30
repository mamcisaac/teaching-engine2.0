/**
 * Test Database Helpers
 * Utility functions for managing test database state across integration tests
 */

import { PrismaClient } from '@teaching-engine/database';

/**
 * Clean all tables in the correct dependency order
 * This ensures foreign key constraints are respected
 */
export async function cleanAllTables(prisma: PrismaClient): Promise<void> {
  try {
    // Clean in dependency order (most dependent first)
    
    // Clean many-to-many junction tables first
    await prisma.$transaction([
      // Planning junction tables
      prisma.daybookEntryExpectation.deleteMany({}),
      prisma.eTFOLessonPlanExpectation.deleteMany({}),
      prisma.eTFOLessonPlanResource.deleteMany({}),
      prisma.unitPlanExpectation.deleteMany({}),
      prisma.unitPlanResource.deleteMany({}),
      prisma.longRangePlanExpectation.deleteMany({}),
      
      // Team and sharing junction tables
      prisma.teamMember.deleteMany({}),
      prisma.teamInvitation.deleteMany({}),
      prisma.sharedPlan.deleteMany({}),
      prisma.planComment.deleteMany({}),
      prisma.teamCalendarEvent.deleteMany({}),
      prisma.teamResource.deleteMany({}),
      prisma.discussionReply.deleteMany({}),
      prisma.resourceRating.deleteMany({}),
      prisma.resourceBookmark.deleteMany({}),
      prisma.templateRating.deleteMany({}),
      
      // Activity junction tables
      prisma.activityCollectionItem.deleteMany({}),
      prisma.activityRating.deleteMany({}),
    ]);

    // Clean dependent entities
    await prisma.$transaction([
      // Planning entities
      prisma.daybookEntry.deleteMany({}),
      prisma.eTFOLessonPlan.deleteMany({}),
      prisma.unitPlan.deleteMany({}),
      prisma.longRangePlan.deleteMany({}),
      
      // Student data
      prisma.studentGoal.deleteMany({}),
      prisma.studentReflection.deleteMany({}),
      prisma.studentArtifact.deleteMany({}),
      prisma.parentSummary.deleteMany({}),
      prisma.student.deleteMany({}),
      
      // Resources and activities
      prisma.externalActivity.deleteMany({}),
      prisma.activityImport.deleteMany({}),
      prisma.activityCollection.deleteMany({}),
      prisma.resourceLibraryItem.deleteMany({}),
      
      // Team entities
      prisma.teamDiscussion.deleteMany({}),
      prisma.teamCalendar.deleteMany({}),
      prisma.team.deleteMany({}),
      
      // Templates and versions
      prisma.templateVariation.deleteMany({}),
      prisma.planTemplate.deleteMany({}),
      prisma.planVersion.deleteMany({}),
      prisma.recentPlanAccess.deleteMany({}),
    ]);

    // Clean core entities
    await prisma.$transaction([
      // Curriculum data
      prisma.curriculumExpectationEmbedding.deleteMany({}),
      prisma.curriculumExpectation.deleteMany({}),
      prisma.expectationCluster.deleteMany({}),
      prisma.curriculumImport.deleteMany({}),
      
      // User data
      prisma.calendarEvent.deleteMany({}),
      prisma.unavailableBlock.deleteMany({}),
      prisma.classRoutine.deleteMany({}),
      prisma.subPlanRecord.deleteMany({}),
      prisma.parentMessage.deleteMany({}),
      prisma.newsletter.deleteMany({}),
      prisma.weeklyPlannerState.deleteMany({}),
      
      // Base entities
      prisma.subject.deleteMany({}),
      prisma.user.deleteMany({}),
    ]);

    console.log('[Test DB Helper] All tables cleaned successfully');
  } catch (error) {
    console.error('[Test DB Helper] Failed to clean tables:', error);
    throw error;
  }
}

/**
 * Create test users with proper data
 */
export interface TestUserData {
  email: string;
  password: string;
  name: string;
  role?: string;
  preferredLanguage?: string;
}

export async function createTestUser(
  prisma: PrismaClient,
  userData: TestUserData
): Promise<any> {
  const bcrypt = await import('bcryptjs');
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  return prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: userData.role || 'teacher',
      preferredLanguage: userData.preferredLanguage || 'en',
    },
  });
}

/**
 * Create test curriculum expectations
 */
export interface TestExpectationData {
  code: string;
  description: string;
  strand: string;
  substrand?: string;
  grade: number;
  subject: string;
  descriptionFr?: string;
  strandFr?: string;
  substrandFr?: string;
}

export async function createTestExpectation(
  prisma: PrismaClient,
  expectationData: TestExpectationData
): Promise<any> {
  return prisma.curriculumExpectation.create({
    data: expectationData,
  });
}

/**
 * Create a complete test planning hierarchy
 */
export interface TestPlanningData {
  userId: number;
  expectationId: string;
  longRangePlan?: {
    title: string;
    academicYear: string;
    grade: number;
    subject: string;
  };
  unitPlan?: {
    title: string;
    startDate: Date;
    endDate: Date;
  };
  lessonPlan?: {
    title: string;
    date: Date;
    duration: number;
  };
}

export async function createTestPlanningHierarchy(
  prisma: PrismaClient,
  data: TestPlanningData
): Promise<{
  longRangePlan?: any;
  unitPlan?: any;
  lessonPlan?: any;
}> {
  const result: any = {};

  // Create long-range plan if requested
  if (data.longRangePlan) {
    result.longRangePlan = await prisma.longRangePlan.create({
      data: {
        userId: data.userId,
        ...data.longRangePlan,
      },
    });

    // Link expectation
    await prisma.longRangePlanExpectation.create({
      data: {
        longRangePlanId: result.longRangePlan.id,
        expectationId: data.expectationId,
      },
    });
  }

  // Create unit plan if requested
  if (data.unitPlan && result.longRangePlan) {
    result.unitPlan = await prisma.unitPlan.create({
      data: {
        userId: data.userId,
        longRangePlanId: result.longRangePlan.id,
        ...data.unitPlan,
      },
    });

    // Link expectation
    await prisma.unitPlanExpectation.create({
      data: {
        unitPlanId: result.unitPlan.id,
        expectationId: data.expectationId,
      },
    });
  }

  // Create lesson plan if requested
  if (data.lessonPlan && result.unitPlan) {
    result.lessonPlan = await prisma.eTFOLessonPlan.create({
      data: {
        userId: data.userId,
        unitPlanId: result.unitPlan.id,
        ...data.lessonPlan,
      },
    });

    // Link expectation
    await prisma.eTFOLessonPlanExpectation.create({
      data: {
        lessonPlanId: result.lessonPlan.id,
        expectationId: data.expectationId,
      },
    });
  }

  return result;
}

/**
 * Generate unique test email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

/**
 * Wait for database to be ready
 */
export async function waitForDatabase(
  prisma: PrismaClient,
  maxAttempts: number = 10,
  delayMs: number = 100
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }
  return false;
}

/**
 * Transaction helper for test isolation
 */
export async function withTransaction<T>(
  prisma: PrismaClient,
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    return fn(tx as PrismaClient);
  });
}