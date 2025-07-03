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
  const cuidModels = [
    'curriculumImport',
    'eTFOLessonPlan',
    'longRangePlan',
    'unitPlan',
    'daybookEntry',
    'curriculumExpectation',
  ];
  const shouldUseStringIds = options.useStringIds || cuidModels.includes(modelName);

  const generateId = () => {
    if (shouldUseStringIds) {
      // Generate a CUID-like string
      return `c${Math.random().toString(36).substr(2, 24)}`;
    }
    return idCounter++;
  };

  // Create implementation functions first
  const implementations = {
    findUnique: async ({ where }: any) => {
      const key = Object.values(where)[0];
      return mockData.get(String(key)) || null;
    },
    findMany: async () => {
      return Array.from(mockData.values());
    },
    findFirst: async () => {
      const values = Array.from(mockData.values());
      return values[0] || null;
    },
    create: async (args: any) => {
      const { data } = args || {};
      const id = data.id || generateId();
      const record = { id, ...data, createdAt: new Date(), updatedAt: new Date() };
      mockData.set(String(id), record);
      return record;
    },
    createMany: async ({ data }: any) => {
      const created = data.map((item: any) => {
        const id = item.id || generateId();
        const record = { id, ...item, createdAt: new Date(), updatedAt: new Date() };
        mockData.set(String(id), record);
        return record;
      });
      return { count: created.length };
    },
  };

  return {
    findUnique: jest.fn(implementations.findUnique),
    findMany: jest.fn(implementations.findMany),
    findFirst: jest.fn(implementations.findFirst),
    create: jest.fn(implementations.create),
    createMany: jest.fn(implementations.createMany),

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
  expectationCluster = createMockModel('expectationCluster');
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
  // Ensure all frequently used models are present
  equipmentBooking = createMockModel('equipmentBooking');
  reportDeadline = createMockModel('reportDeadline');
  holiday = createMockModel('holiday');
  unavailableBlock = createMockModel('unavailableBlock');

  // Test helper to reset all mock data
  _resetAllMocks = () => {
    Object.values(this).forEach((value) => {
      if (value && typeof value === 'object' && '_reset' in value) {
        value._reset();
      }
    });
  };
}

// Create singleton instance with pre-configured mocks
const createPrismaClientMock = () => {
  const client = new PrismaClient();

  // Ensure all model methods have implementations
  const models = ['curriculumExpectation', 'user', 'outcome', 'subject', 'milestone', 'activity'];

  models.forEach((modelName) => {
    if (client[modelName]) {
      // The model already has mock implementations from createMockModel
      // Just ensure they're properly set up
      const model = client[modelName];

      // Verify the mocks have implementations
      if (
        model.create &&
        jest.isMockFunction(model.create) &&
        !model.create.getMockImplementation()
      ) {
        console.warn(`Mock for ${modelName}.create has no implementation!`);
      }
    }
  });

  return client;
};

export const prisma = createPrismaClientMock();

// Export additional models that might be needed
export class ExtendedPrismaClient extends PrismaClient {
  // Add any additional models that are referenced in tests
  curriculumExpectation = createMockModel('curriculumExpectation');
  curriculumExpectationEmbedding = createMockModel('curriculumExpectationEmbedding');
  planTemplate = createMockModel('planTemplate');
  unavailableBlock = createMockModel('unavailableBlock');
  timetableSlot = createMockModel('timetableSlot');
  holiday = createMockModel('holiday');
  weeklyPlan = createMockModel('weeklyPlan');
  plannerState = createMockModel('plannerState');
  template = createMockModel('template');
  newsletter = createMockModel('newsletter');
  schoolYear = createMockModel('schoolYear');
  academicYear = createMockModel('academicYear');
  grade = createMockModel('grade');
  classLevel = createMockModel('classLevel');
  curriculum = createMockModel('curriculum');
  subjectArea = createMockModel('subjectArea');
  learningExpectation = createMockModel('learningExpectation');
  assessmentCriteria = createMockModel('assessmentCriteria');
  rubric = createMockModel('rubric');
  recentPlanAccess = createMockModel('recentPlanAccess');
}

// Re-export with extended functionality
export const extendedPrisma = new ExtendedPrismaClient();

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

export const CalendarEventType = {
  PD_DAY: 'PD_DAY',
  ASSEMBLY: 'ASSEMBLY',
  TRIP: 'TRIP',
  HOLIDAY: 'HOLIDAY',
  CUSTOM: 'CUSTOM',
};

export const CalendarEventSource = {
  MANUAL: 'MANUAL',
  ICAL_FEED: 'ICAL_FEED',
};

export const InvitationStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
};

export const TeamRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
};

// Export type definitions for models
export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  grade: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DaybookEntry {
  id: string;
  date: Date;
  content: string;
  contentFr?: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentArtifact {
  id: number;
  studentId: number;
  title: string;
  description?: string;
  filePath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentReflection {
  id: number;
  studentId: number;
  content: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

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
};

// Default export for compatibility
export default prisma;
