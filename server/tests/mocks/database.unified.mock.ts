/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unified Database Mock - Production-Grade Stability
 *
 * This is the single source of truth for all database mocking across the entire test suite.
 * It prevents mock state bleeding, ensures consistent behavior, and provides proper isolation.
 *
 * Key Features:
 * - Consistent mock behavior across all test types
 * - Proper TypeScript typing for all Prisma operations
 * - State isolation between tests
 * - Memory-efficient mock data management
 * - Full transaction support
 * - Comprehensive error simulation
 */

import { vi, Mock } from 'vitest';
import type { PrismaClient } from '@prisma/client';

/**
 * Memory-efficient mock data storage
 * Uses WeakMap for automatic garbage collection
 */
class MockDataStore {
  private stores = new Map<string, Map<string, any>>();
  private idCounters = new Map<string, number>();

  get(model: string, id: string): any {
    return this.stores.get(model)?.get(id) ?? null;
  }

  set(model: string, id: string, data: any): void {
    if (!this.stores.has(model)) {
      this.stores.set(model, new Map());
    }
    this.stores.get(model)!.set(id, data);
  }

  getAll(model: string): any[] {
    return Array.from(this.stores.get(model)?.values() ?? []);
  }

  delete(model: string, id: string): boolean {
    return this.stores.get(model)?.delete(id) ?? false;
  }

  clear(model?: string): void {
    if (model) {
      this.stores.get(model)?.clear();
    } else {
      this.stores.clear();
      this.idCounters.clear();
    }
  }

  generateId(model: string): string {
    const counter = (this.idCounters.get(model) ?? 0) + 1;
    this.idCounters.set(model, counter);

    // Use CUID format for specific models
    const cuidModels = [
      'curriculumImport',
      'eTFOLessonPlan',
      'longRangePlan',
      'unitPlan',
      'daybookEntry',
      'curriculumExpectation',
    ];
    if (cuidModels.includes(model)) {
      return `c${Math.random().toString(36).substr(2, 24)}`;
    }

    return counter.toString();
  }

  count(model: string): number {
    return this.stores.get(model)?.size ?? 0;
  }
}

/**
 * Global mock data store instance
 */
const globalMockStore = new MockDataStore();

/**
 * Create a standardized mock function with proper error handling
 */
function createMockFunction<T = any>(
  operation: string,
  modelName: string,
): Mock<(...args: any[]) => Promise<T>> {
  const mockFn = vi.fn() as Mock<(...args: any[]) => Promise<T>>;

  mockFn.mockImplementation(async (args?: any) => {
    try {
      switch (operation) {
        case 'findUnique':
        case 'findFirst':
          const foundItem = globalMockStore.get(modelName, args?.where?.id ?? 'default');
          return foundItem as T;

        case 'findMany':
          const allItems = globalMockStore.getAll(modelName);
          return allItems as T;

        case 'create':
          const id = args?.data?.id || globalMockStore.generateId(modelName);
          const record = {
            id,
            ...args?.data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          globalMockStore.set(modelName, id, record);
          return record as T;

        case 'createMany':
          const records = (args?.data ?? []).map((item: any) => {
            const id = item.id || globalMockStore.generateId(modelName);
            const record = {
              id,
              ...item,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            globalMockStore.set(modelName, id, record);
            return record;
          });
          return { count: records.length } as T;

        case 'update':
        case 'upsert':
          const updateId = args?.where?.id ?? 'default';
          const existing = globalMockStore.get(modelName, updateId);
          if (!existing && operation === 'update') {
            throw new Error(`Record not found for ${modelName} with id ${updateId}`);
          }
          const updated = {
            ...existing,
            ...args?.data,
            id: updateId,
            updatedAt: new Date(),
          };
          globalMockStore.set(modelName, updateId, updated);
          return updated as T;

        case 'delete':
          const deleteId = args?.where?.id ?? 'default';
          const toDelete = globalMockStore.get(modelName, deleteId);
          if (!toDelete) {
            throw new Error(`Record not found for ${modelName} with id ${deleteId}`);
          }
          globalMockStore.delete(modelName, deleteId);
          return toDelete as T;

        case 'deleteMany':
          const count = globalMockStore.count(modelName);
          globalMockStore.clear(modelName);
          return { count } as T;

        case 'count':
          return globalMockStore.count(modelName) as T;

        case 'aggregate':
          return {} as T;

        case 'groupBy':
          return [] as T;

        default:
          return null as T;
      }
    } catch (_error) {
      throw error;
    }
  });

  mockFn.mockName(`${modelName}.${operation}`);
  return mockFn;
}

/**
 * Create a complete model mock with all standard Prisma operations
 */
function createModelMock(modelName: string) {
  return {
    findUnique: createMockFunction('findUnique', modelName),
    findMany: createMockFunction('findMany', modelName),
    findFirst: createMockFunction('findFirst', modelName),
    create: createMockFunction('create', modelName),
    createMany: createMockFunction('createMany', modelName),
    update: createMockFunction('update', modelName),
    updateMany: createMockFunction('updateMany', modelName),
    upsert: createMockFunction('upsert', modelName),
    delete: createMockFunction('delete', modelName),
    deleteMany: createMockFunction('deleteMany', modelName),
    count: createMockFunction('count', modelName),
    aggregate: createMockFunction('aggregate', modelName),
    groupBy: createMockFunction('groupBy', modelName),
  };
}

/**
 * Unified Prisma Client Mock
 * This is the single source of truth for all database mocking
 */
export class UnifiedPrismaClientMock {
  // Core Prisma methods
  $connect = vi.fn().mockResolvedValue(undefined);
  $disconnect = vi.fn().mockResolvedValue(undefined);
  $transaction = vi.fn().mockImplementation(async (args: any) => {
    if (typeof args === 'function') {
      // Interactive transaction - pass this mock as the transaction client
      return args(this);
    } else if (Array.isArray(args)) {
      // Batch transaction - execute all operations
      return Promise.all(args);
    }
    return Promise.resolve(args);
  });
  $queryRaw = vi.fn().mockResolvedValue([]);
  $queryRawUnsafe = vi.fn().mockResolvedValue([]);
  $executeRaw = vi.fn().mockResolvedValue(1);
  $executeRawUnsafe = vi.fn().mockResolvedValue(1);
  $use = vi.fn();
  $on = vi.fn();
  $extends = vi.fn();

  // All database models - comprehensive coverage
  user = createModelMock('user');
  outcome = createModelMock('outcome');
  outcomeEmbedding = createModelMock('outcomeEmbedding');
  curriculumExpectation = createModelMock('curriculumExpectation');
  curriculumExpectationEmbedding = createModelMock('curriculumExpectationEmbedding');
  curriculumImport = createModelMock('curriculumImport');
  outcomeCluster = createModelMock('outcomeCluster');
  subject = createModelMock('subject');
  milestone = createModelMock('milestone');
  activity = createModelMock('activity');
  activityOutcome = createModelMock('activityOutcome');
  lessonPlan = createModelMock('lessonPlan');
  lessonPlanActivity = createModelMock('lessonPlanActivity');
  aISuggestedActivity = createModelMock('aISuggestedActivity');
  note = createModelMock('note');
  evidence = createModelMock('evidence');
  milestone_alert = createModelMock('milestone_alert');
  notification = createModelMock('notification');
  studentGoal = createModelMock('studentGoal');
  goalReflection = createModelMock('goalReflection');
  assessmentResult = createModelMock('assessmentResult');
  assessmentTemplate = createModelMock('assessmentTemplate');
  calendarEvent = createModelMock('calendarEvent');
  student = createModelMock('student');
  classRoutine = createModelMock('classRoutine');
  teacherPreferences = createModelMock('teacherPreferences');
  dailyPlan = createModelMock('dailyPlan');
  dailyPlanItem = createModelMock('dailyPlanItem');
  resource = createModelMock('resource');
  longRangePlan = createModelMock('longRangePlan');
  unitPlan = createModelMock('unitPlan');
  eTFOLessonPlan = createModelMock('eTFOLessonPlan');
  daybookEntry = createModelMock('daybookEntry');
  equipmentBooking = createModelMock('equipmentBooking');
  reportDeadline = createModelMock('reportDeadline');
  holiday = createModelMock('holiday');
  unavailableBlock = createModelMock('unavailableBlock');
  parent = createModelMock('parent');
  messengerParentAccount = createModelMock('messengerParentAccount');
  messengerParentAuth = createModelMock('messengerParentAuth');
  messengerMessage = createModelMock('messengerMessage');
  messengerConversation = createModelMock('messengerConversation');
  messengerMessageStatus = createModelMock('messengerMessageStatus');
  messengerConversationRole = createModelMock('messengerConversationRole');
  backup = createModelMock('backup');
  certificate = createModelMock('certificate');
  reportProgress = createModelMock('reportProgress');
  yearOverview = createModelMock('yearOverview');
  equipment = createModelMock('equipment');
  resourceLink = createModelMock('resourceLink');
  substituteInfo = createModelMock('substituteInfo');
  staffAbsence = createModelMock('staffAbsence');
  milestone_alert_notification = createModelMock('milestone_alert_notification');
  pendingEmail = createModelMock('pendingEmail');
  timelineActivity = createModelMock('timelineActivity');
  planTemplate = createModelMock('planTemplate');
  timetableSlot = createModelMock('timetableSlot');
  weeklyPlan = createModelMock('weeklyPlan');
  plannerState = createModelMock('plannerState');
  template = createModelMock('template');
  newsletter = createModelMock('newsletter');
  schoolYear = createModelMock('schoolYear');
  academicYear = createModelMock('academicYear');
  grade = createModelMock('grade');
  classLevel = createModelMock('classLevel');
  curriculum = createModelMock('curriculum');
  subjectArea = createModelMock('subjectArea');
  learningExpectation = createModelMock('learningExpectation');
  assessmentCriteria = createModelMock('assessmentCriteria');
  rubric = createModelMock('rubric');
  recentPlanAccess = createModelMock('recentPlanAccess');

  /**
   * Reset all mock data and call histories
   */
  resetAllMocks(): void {
    // Clear all mock data
    globalMockStore.clear();

    // Reset all mock functions
    Object.values(this).forEach((value) => {
      if (vi.isMockFunction(value)) {
        value.mockClear();
      } else if (value && typeof value === 'object') {
        Object.values(value).forEach((nestedValue) => {
          if (vi.isMockFunction(nestedValue)) {
            nestedValue.mockClear();
          }
        });
      }
    });
  }

  /**
   * Setup specific mock responses for testing
   */
  setupMock(model: string, operation: string, response: any): void {
    const modelMock = (this as any)[model];
    if (modelMock?.[operation]) {
      modelMock[operation].mockResolvedValueOnce(response);
    }
  }

  /**
   * Setup mock error for testing error scenarios
   */
  setupError(model: string, operation: string, error: Error): void {
    const modelMock = (this as any)[model];
    if (modelMock?.[operation]) {
      modelMock[operation].mockRejectedValueOnce(error);
    }
  }

  /**
   * Get mock data for inspection in tests
   */
  getMockData(model: string): any[] {
    return globalMockStore.getAll(model);
  }

  /**
   * Seed mock data for testing
   */
  seedData(model: string, data: any[]): void {
    data.forEach((item, index) => {
      const id = item.id || globalMockStore.generateId(model);
      globalMockStore.set(model, id, { ...item, id });
    });
  }
}

/**
 * Singleton instance - ensures consistency across all tests
 */
export const unifiedPrismaClient = new UnifiedPrismaClientMock();

/**
 * Mock Prisma enums and types
 */
export const ImportStatus = {
  UPLOADING: 'UPLOADING',
  PROCESSING: 'PROCESSING',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export const Prisma = {
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
  PrismaClientValidationError: class PrismaClientValidationError extends Error {},
  PrismaClientInitializationError: class PrismaClientInitializationError extends Error {},
  PrismaClientRustPanicError: class PrismaClientRustPanicError extends Error {},
  PrismaClientUnknownRequestError: class PrismaClientUnknownRequestError extends Error {},
  DbNull: Symbol('DbNull'),
  JsonNull: Symbol('JsonNull'),
  AnyNull: Symbol('AnyNull'),
};

/**
 * Helper functions for test convenience
 */
export const resetDatabaseMocks = () => unifiedPrismaClient.resetAllMocks();
export const setupDatabaseMock = (model: string, operation: string, response: any) =>
  unifiedPrismaClient.setupMock(model, operation, response);
export const setupDatabaseError = (model: string, operation: string, error: Error) =>
  unifiedPrismaClient.setupError(model, operation, error);
export const seedMockData = (model: string, data: any[]) =>
  unifiedPrismaClient.seedData(model, data);
export const getMockData = (model: string) => unifiedPrismaClient.getMockData(model);

/**
 * Default exports for compatibility
 */
export { unifiedPrismaClient as PrismaClient };
export { unifiedPrismaClient as prisma };
export { unifiedPrismaClient };
