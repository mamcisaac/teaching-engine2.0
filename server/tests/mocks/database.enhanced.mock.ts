/**
 * Enhanced Database Mock for Stable Testing Infrastructure
 * This provides comprehensive mocking for all Prisma operations with proper isolation
 */

import { jest } from '@jest/globals';
import type { PrismaClient } from '@teaching-engine/database';

/**
 * Create a mock function that tracks calls and provides reasonable defaults
 */
const createMockFunction = (defaultValue: any = null) => {
  const mockFn = jest.fn();

  // Provide sensible defaults for common operations
  if (defaultValue !== null) {
    mockFn.mockResolvedValue(defaultValue);
  } else {
    // Auto-detect return type based on method name
    mockFn.mockImplementation((args?: any) => {
      const fnName = mockFn.getMockName();

      if (fnName.includes('findMany') || fnName.includes('findFirst')) {
        return Promise.resolve([]);
      } else if (fnName.includes('findUnique') || fnName.includes('findFirst')) {
        return Promise.resolve(null);
      } else if (
        fnName.includes('create') ||
        fnName.includes('update') ||
        fnName.includes('upsert')
      ) {
        return Promise.resolve({ id: 'mock-id', ...args?.data });
      } else if (fnName.includes('delete')) {
        return Promise.resolve({ id: 'mock-id' });
      } else if (fnName.includes('count')) {
        return Promise.resolve(0);
      }

      return Promise.resolve(defaultValue);
    });
  }

  return mockFn;
};

/**
 * Create a complete model mock with all CRUD operations
 */
const createModelMock = (modelName: string) => {
  const mock = {
    findUnique: createMockFunction(),
    findMany: createMockFunction(),
    findFirst: createMockFunction(),
    create: createMockFunction(),
    createMany: createMockFunction(),
    update: createMockFunction(),
    updateMany: createMockFunction(),
    upsert: createMockFunction(),
    delete: createMockFunction(),
    deleteMany: createMockFunction(),
    count: createMockFunction(),
    aggregate: createMockFunction(),
    groupBy: createMockFunction(),
    // Add Prisma-specific methods
    $use: createMockFunction(),
    $on: createMockFunction(),
    $extends: createMockFunction(),
  };

  // Set mock names for better debugging
  Object.keys(mock).forEach((key) => {
    mock[key as keyof typeof mock].mockName(`${modelName}.${key}`);
  });

  return mock;
};

/**
 * Enhanced Prisma Client Mock with comprehensive transaction support
 */
export const createEnhancedPrismaClientMock = (): jest.Mocked<PrismaClient> => {
  const prismaClientMock = {
    // Core Prisma methods
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn().mockImplementation(async (args: any) => {
      if (typeof args === 'function') {
        // Interactive transaction
        return args(prismaClientMock as any);
      } else if (Array.isArray(args)) {
        // Batch transaction
        return Promise.all(args);
      }
      return Promise.resolve(args);
    }),
    $queryRaw: jest.fn().mockResolvedValue([]),
    $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    $executeRaw: jest.fn().mockResolvedValue(1),
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    $use: jest.fn(),
    $on: jest.fn(),
    $extends: jest.fn(),

    // All database models
    user: createModelMock('user'),
    outcome: createModelMock('outcome'),
    outcomeEmbedding: createModelMock('outcomeEmbedding'),
    curriculumExpectation: createModelMock('curriculumExpectation'),
    curriculumExpectationEmbedding: createModelMock('curriculumExpectationEmbedding'),
    curriculumImport: createModelMock('curriculumImport'),
    outcomeCluster: createModelMock('outcomeCluster'),
    subject: createModelMock('subject'),
    milestone: createModelMock('milestone'),
    activity: createModelMock('activity'),
    activityOutcome: createModelMock('activityOutcome'),
    lessonPlan: createModelMock('lessonPlan'),
    lessonPlanActivity: createModelMock('lessonPlanActivity'),
    aISuggestedActivity: createModelMock('aISuggestedActivity'),
    note: createModelMock('note'),
    evidence: createModelMock('evidence'),
    milestone_alert: createModelMock('milestone_alert'),
    notification: createModelMock('notification'),
    studentGoal: createModelMock('studentGoal'),
    goalReflection: createModelMock('goalReflection'),
    parent: createModelMock('parent'),
    messengerParentAccount: createModelMock('messengerParentAccount'),
    messengerParentAuth: createModelMock('messengerParentAuth'),
    messengerMessage: createModelMock('messengerMessage'),
    messengerConversation: createModelMock('messengerConversation'),
    messengerMessageStatus: createModelMock('messengerMessageStatus'),
    messengerConversationRole: createModelMock('messengerConversationRole'),
    backup: createModelMock('backup'),
    certificate: createModelMock('certificate'),
    reportProgress: createModelMock('reportProgress'),
    yearOverview: createModelMock('yearOverview'),
    equipment: createModelMock('equipment'),
    equipmentBooking: createModelMock('equipmentBooking'),
    resourceLink: createModelMock('resourceLink'),
    substituteInfo: createModelMock('substituteInfo'),
    calendarEvent: createModelMock('calendarEvent'),
    holiday: createModelMock('holiday'),
    staffAbsence: createModelMock('staffAbsence'),
    milestone_alert_notification: createModelMock('milestone_alert_notification'),
    pendingEmail: createModelMock('pendingEmail'),
    timelineActivity: createModelMock('timelineActivity'),
  };

  return prismaClientMock as unknown as jest.Mocked<PrismaClient>;
};

// Global mock instance
export const mockPrismaClient = createEnhancedPrismaClientMock();

// Helper functions for test setup
export const setupDatabaseMock = (modelName: string, operation: string, response: any) => {
  const model = (mockPrismaClient as any)[modelName];
  if (model && model[operation]) {
    model[operation].mockResolvedValueOnce(response);
  }
  return model?.[operation];
};

export const setupDatabaseError = (modelName: string, operation: string, error: Error) => {
  const model = (mockPrismaClient as any)[modelName];
  if (model && model[operation]) {
    model[operation].mockRejectedValueOnce(error);
  }
  return model?.[operation];
};

export const resetDatabaseMocks = () => {
  Object.keys(mockPrismaClient).forEach((key) => {
    const model = (mockPrismaClient as any)[key];
    if (model && typeof model === 'object') {
      Object.keys(model).forEach((method) => {
        if (jest.isMockFunction(model[method])) {
          model[method].mockClear();
        }
      });
    }
  });
};

// Commonly used mock responses
export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 'mock-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'USER',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockOutcome = (overrides: Partial<any> = {}) => ({
  id: 'mock-outcome-id',
  description: 'Mock outcome description',
  code: 'MOCK-001',
  grade: '5',
  subject: 'Math',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockEmbedding = (overrides: Partial<any> = {}) => ({
  outcomeId: 'mock-outcome-id',
  embedding: Array(1536)
    .fill(0)
    .map(() => Math.random()),
  model: 'text-embedding-3-small',
  createdAt: new Date(),
  ...overrides,
});

// Export for module mocking
export default mockPrismaClient;
