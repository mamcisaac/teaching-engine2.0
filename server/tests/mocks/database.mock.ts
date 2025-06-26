/**
 * Optimized Database Mock
 * Provides a complete mock implementation of PrismaClient
 */

import { jest } from '@jest/globals';

// Helper to create a mock model with all CRUD operations
const createMockModel = (modelName: string, options: { useStringIds?: boolean } = {}) => {
  const mockData = new Map<string, any>();
  let idCounter = 1;
  
  // Models that use CUID format
  const cuidModels = ['curriculumImport', 'eTFOLessonPlan', 'longRangePlan', 'unitPlan', 'daybookEntry', 'curriculumExpectation'];
  const shouldUseStringIds = options.useStringIds || cuidModels.includes(modelName);

  const generateId = () => {
    if (shouldUseStringIds) {
      // Generate a CUID-like string
      return `c${Math.random().toString(36).substr(2, 24)}`;
    }
    return idCounter++;
  };

  return {
    findUnique: jest.fn(({ where }) => {
      const key = Object.values(where)[0];
      return Promise.resolve(mockData.get(String(key)) || null);
    }),
    
    findMany: jest.fn(() => {
      return Promise.resolve(Array.from(mockData.values()));
    }),
    
    findFirst: jest.fn(() => {
      const values = Array.from(mockData.values());
      return Promise.resolve(values[0] || null);
    }),
    
    create: jest.fn(({ data }) => {
      const id = data.id || generateId();
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      mockData.set(String(id), record);
      return Promise.resolve(record);
    }),
    
    createMany: jest.fn(({ data }) => {
      const created = data.map((item: any) => {
        const id = item.id || generateId();
        const record = { id, ...item, createdAt: new Date(), updatedAt: new Date() };
        mockData.set(String(id), record);
        return record;
      });
      return Promise.resolve({ count: created.length });
    }),
    
    update: jest.fn(({ where, data }) => {
      const key = String(Object.values(where)[0]);
      const existing = mockData.get(key);
      if (!existing) throw new Error('Record not found');
      const updated = { ...existing, ...data, updatedAt: new Date() };
      mockData.set(key, updated);
      return Promise.resolve(updated);
    }),
    
    updateMany: jest.fn(() => {
      return Promise.resolve({ count: mockData.size });
    }),
    
    delete: jest.fn(({ where }) => {
      const key = String(Object.values(where)[0]);
      const record = mockData.get(key);
      if (!record) throw new Error('Record not found');
      mockData.delete(key);
      return Promise.resolve(record);
    }),
    
    deleteMany: jest.fn(() => {
      const count = mockData.size;
      mockData.clear();
      return Promise.resolve({ count });
    }),
    
    count: jest.fn(() => Promise.resolve(mockData.size)),
    aggregate: jest.fn(() => Promise.resolve({})),
    groupBy: jest.fn(() => Promise.resolve([])),
    
    // Test helper to access mock data
    _getMockData: () => mockData,
    _reset: () => mockData.clear(),
  };
};

// Create mock Prisma client
export class PrismaClient {
  // Connection methods
  $connect = jest.fn().mockResolvedValue(undefined);
  $disconnect = jest.fn().mockResolvedValue(undefined);
  
  // Transaction support
  $transaction = jest.fn().mockImplementation((fn) => {
    if (typeof fn === 'function') {
      return fn(this);
    }
    return Promise.all(fn);
  });
  
  // Raw query methods (optimized)
  $queryRaw = jest.fn().mockResolvedValue([]);
  $queryRawUnsafe = jest.fn().mockResolvedValue([]);
  $executeRaw = jest.fn().mockResolvedValue(0);
  $executeRawUnsafe = jest.fn().mockResolvedValue(0);
  
  // All models
  user = createMockModel('user');
  outcome = createMockModel('outcome');
  outcomeEmbedding = createMockModel('outcomeEmbedding');
  curriculumExpectation = createMockModel('curriculumExpectation');
  curriculumExpectationEmbedding = createMockModel('curriculumExpectationEmbedding');
  curriculumImport = createMockModel('curriculumImport');
  outcomeCluster = createMockModel('outcomeCluster');
  subject = createMockModel('subject');
  milestone = createMockModel('milestone');
  activity = createMockModel('activity');
  activityOutcome = createMockModel('activityOutcome');
  lessonPlan = createMockModel('lessonPlan');
  lessonPlanActivity = createMockModel('lessonPlanActivity');
  aISuggestedActivity = createMockModel('aISuggestedActivity');
  note = createMockModel('note');
  evidence = createMockModel('evidence');
  milestone_alert = createMockModel('milestone_alert');
  notification = createMockModel('notification');
  studentGoal = createMockModel('studentGoal');
  goalReflection = createMockModel('goalReflection');
  assessmentResult = createMockModel('assessmentResult');
  assessmentTemplate = createMockModel('assessmentTemplate');
  calendarEvent = createMockModel('calendarEvent');
  student = createMockModel('student');
  classRoutine = createMockModel('classRoutine');
  teacherPreferences = createMockModel('teacherPreferences');
  dailyPlan = createMockModel('dailyPlan');
  dailyPlanItem = createMockModel('dailyPlanItem');
  resource = createMockModel('resource');
  longRangePlan = createMockModel('longRangePlan');
  unitPlan = createMockModel('unitPlan');
  eTFOLessonPlan = createMockModel('eTFOLessonPlan');
  daybookEntry = createMockModel('daybookEntry');

  // Test helper to reset all mock data
  _resetAllMocks = () => {
    Object.values(this).forEach((value) => {
      if (value && typeof value === 'object' && '_reset' in value) {
        value._reset();
      }
    });
  };
}

// Create singleton instance
export const prisma = new PrismaClient();

// Export enums and types
export const ImportStatus = {
  UPLOADING: 'UPLOADING',
  PROCESSING: 'PROCESSING',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

export const Prisma = {
  PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
    code: string;
    constructor(message: string, code: string) {
      super(message);
      this.code = code;
    }
  },
  PrismaClientValidationError: class PrismaClientValidationError extends Error {},
};