import { jest } from '@jest/globals';
import type { PrismaClient } from '@teaching-engine/database';

/**
 * Type-safe mock factory for Prisma Client
 * This ensures all mock methods are properly typed as Jest mocks
 */
export function createMockPrismaClient(): jest.Mocked<PrismaClient> {
  const createModelMock = () => ({
    findUnique: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  });

  return {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn().mockImplementation((fn) => {
      if (typeof fn === 'function') {
        return fn({} as PrismaClient);
      }
      return Promise.resolve(fn);
    }),
    $queryRaw: jest.fn().mockResolvedValue([]),
    $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    $executeRaw: jest.fn().mockResolvedValue(1),
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    $use: jest.fn(),
    $on: jest.fn(),
    $extends: jest.fn(),
    user: createModelMock(),
    outcome: createModelMock(),
    outcomeEmbedding: createModelMock(),
    curriculumImport: createModelMock(),
    outcomeCluster: createModelMock(),
    subject: createModelMock(),
    milestone: createModelMock(),
    activity: createModelMock(),
    activityOutcome: createModelMock(),
    lessonPlan: createModelMock(),
    lessonPlanActivity: createModelMock(),
    aISuggestedActivity: createModelMock(),
    note: createModelMock(),
    evidence: createModelMock(),
    milestone_alert: createModelMock(),
    notification: createModelMock(),
    studentGoal: createModelMock(),
    goalReflection: createModelMock(),
    parent: createModelMock(),
    messengerParentAccount: createModelMock(),
    messengerParentAuth: createModelMock(),
    messengerMessage: createModelMock(),
    messengerConversation: createModelMock(),
    messengerMessageStatus: createModelMock(),
    messengerConversationRole: createModelMock(),
    backup: createModelMock(),
    certificate: createModelMock(),
    reportProgress: createModelMock(),
    yearOverview: createModelMock(),
    equipment: createModelMock(),
    equipmentBooking: createModelMock(),
    resourceLink: createModelMock(),
    substituteInfo: createModelMock(),
    calendarEvent: createModelMock(),
    holiday: createModelMock(),
    staffAbsence: createModelMock(),
    milestone_alert_notification: createModelMock(),
    pendingEmail: createModelMock(),
    timelineActivity: createModelMock(),
    // Add any missing models as needed
  } as unknown as jest.Mocked<PrismaClient>;
}

/**
 * Helper to setup Prisma mock with common defaults
 */
export function setupPrismaMock(prisma: jest.Mocked<PrismaClient>) {
  // Setup common mock responses
  prisma.$queryRaw.mockResolvedValue([{ 1: 1 }]);
  prisma.$transaction.mockImplementation(async (fn) => {
    if (typeof fn === 'function') {
      return fn(prisma as unknown as PrismaClient);
    }
    return Promise.resolve(fn);
  });

  return prisma;
}
