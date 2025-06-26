/**
 * Mock factories for creating consistent test data
 */

import { jest } from '@jest/globals';

/**
 * Creates a mock Prisma model with all standard CRUD operations
 */
export const createModelMock = () => ({
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

/**
 * Creates a mock logger instance for testing
 */
export const createMockLogger = () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn(() => createMockLogger()),
});

/**
 * Creates a comprehensive mock Prisma client instance
 */
export const createMockPrismaClient = () => {
  const client = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    $queryRawUnsafe: jest.fn().mockResolvedValue([{ 1: 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(1),
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    
    // All database models
    user: createModelMock(),
    outcome: createModelMock(),
    outcomeEmbedding: createModelMock(),
    curriculumExpectation: createModelMock(),
    curriculumExpectationEmbedding: createModelMock(),
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
    assessmentResult: createModelMock(),
    assessmentTemplate: createModelMock(),
    calendarEvent: createModelMock(),
    student: createModelMock(),
    classRoutine: createModelMock(),
    teacherPreferences: createModelMock(),
    dailyPlan: createModelMock(),
    dailyPlanItem: createModelMock(),
    resource: createModelMock(),
    longRangePlan: createModelMock(),
    unitPlan: createModelMock(),
    eTFOLessonPlan: createModelMock(),
    daybookEntry: createModelMock(),
  };

  // Set up transaction mock
  client.$transaction.mockImplementation((fn) => {
    if (typeof fn === 'function') {
      return fn(client);
    }
    return Promise.resolve(fn);
  });

  return client;
};

/**
 * Mock OpenAI service with consistent responses
 */
export const createMockOpenAI = () => ({
  embeddings: {
    create: jest.fn().mockResolvedValue({
      data: [
        {
          embedding: Array(1536).fill(0).map(() => Math.random()),
          index: 0,
        },
      ],
      usage: {
        prompt_tokens: 100,
        total_tokens: 100,
      },
    }),
  },
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        id: 'mock-completion',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Mocked AI response',
            },
            finish_reason: 'stop',
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150,
        },
      }),
    },
  },
});

/**
 * Mock embedding service for testing
 */
export const createMockEmbeddingService = () => ({
  calculateSimilarity: jest.fn().mockReturnValue(0.85),
  generateBatchEmbeddings: jest.fn().mockResolvedValue([]),
  findSimilarOutcomes: jest.fn().mockResolvedValue([]),
  generateEmbedding: jest.fn().mockResolvedValue({
    outcomeId: 'test-outcome',
    embedding: Array(1536).fill(0).map(() => Math.random()),
    model: 'text-embedding-3-small',
  }),
  generateMissingEmbeddings: jest.fn().mockResolvedValue(0),
  getOrCreateOutcomeEmbedding: jest.fn().mockResolvedValue({
    outcomeId: 'test-outcome',
    embedding: Array(1536).fill(0).map(() => Math.random()),
    model: 'text-embedding-3-small',
  }),
  searchOutcomesByText: jest.fn().mockResolvedValue([]),
  isEmbeddingServiceAvailable: jest.fn().mockReturnValue(true),
  cosineSimilarity: jest.fn().mockReturnValue(0.85),
});

/**
 * Sample test data factories
 */
export const testDataFactories = {
  user: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  outcome: (overrides = {}) => ({
    id: 'test-outcome-id',
    code: 'TEST-001',
    description: 'Test outcome description',
    subject: 'Mathematics',
    grade: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  curriculumImport: (overrides = {}) => ({
    id: 'test-import-id',
    filename: 'test-curriculum.pdf',
    status: 'COMPLETED',
    progress: 100,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};