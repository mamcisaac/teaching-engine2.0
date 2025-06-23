// Global mock setup for all tests
// This file runs before any tests and sets up all required mocks
import { jest } from '@jest/globals';

// Set up environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret';
process.env.OPENAI_API_KEY = 'test-api-key';

// Mock Prisma Client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
    // Add all the models that need mocking
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    outcome: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    outcomeEmbedding: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    curriculumImport: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    outcomeCluster: {
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  })),
}));

// Mock @teaching-engine/database to export enums and types
jest.mock('@teaching-engine/database', () => {
  // Create the mock prisma client instance
  const mockPrismaClientInstance = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
    $queryRawUnsafe: jest.fn().mockResolvedValue([{ 1: 1 }]),
    $executeRaw: jest.fn().mockResolvedValue(1),
    $executeRawUnsafe: jest.fn().mockResolvedValue(1),
    user: {
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
    },
    outcome: {
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
    },
    outcomeEmbedding: {
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
    },
    curriculumImport: {
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
    },
    outcomeCluster: {
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
    },
    subject: {
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
    },
    milestone: {
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
    },
    activity: {
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
    },
    activityOutcome: {
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
    },
    lessonPlan: {
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
    },
    lessonPlanActivity: {
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
    },
    aISuggestedActivity: {
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
    },
    note: {
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
    },
    evidence: {
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
    },
    milestone_alert: {
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
    },
    notification: {
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
    },
    studentGoal: {
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
    },
    goalReflection: {
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
    },
  };

  // Set up the transaction mock to use the client instance
  mockPrismaClientInstance.$transaction.mockImplementation((fn) => {
    if (typeof fn === 'function') {
      return fn(mockPrismaClientInstance);
    }
    return Promise.resolve(fn);
  });

  return {
    // Export all enums that tests might need
    ImportStatus: {
      UPLOADING: 'UPLOADING',
      PROCESSING: 'PROCESSING',
      READY_FOR_REVIEW: 'READY_FOR_REVIEW',
      CONFIRMED: 'CONFIRMED',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
    },
    // Re-export PrismaClient from the mock
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClientInstance),
    // Export the instance directly
    prisma: mockPrismaClientInstance,
  };
});

// Mock logger to avoid console spam during tests
const createMockLogger = () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn(() => createMockLogger()), // Return new logger instance for chaining
});

const mockLogger = createMockLogger();

// Mock both import paths
jest.mock('@/logger', () => ({
  __esModule: true,
  default: mockLogger,
  ...mockLogger,
}));

// Mock src/logger
jest.doMock('../src/logger', () => ({
  __esModule: true,
  default: mockLogger,
  ...mockLogger,
}));

// Helper to create model mocks
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

// Create the mock prisma client instance
const mockPrismaClientInstance = {
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn(),
  $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
  $queryRawUnsafe: jest.fn().mockResolvedValue([{ 1: 1 }]),
  $executeRaw: jest.fn().mockResolvedValue(1),
  $executeRawUnsafe: jest.fn().mockResolvedValue(1),
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
  assessmentResult: createModelMock(),
  assessmentTemplate: createModelMock(),
  calendarEvent: createModelMock(),
  student: createModelMock(),
  classRoutine: createModelMock(),
  teacherPreferences: createModelMock(),
  dailyPlan: createModelMock(),
  dailyPlanItem: createModelMock(),
  resource: createModelMock(),
};

// Set up the transaction mock to use the client instance
mockPrismaClientInstance.$transaction.mockImplementation((fn) => {
  if (typeof fn === 'function') {
    return fn(mockPrismaClientInstance);
  }
  return Promise.resolve(fn);
});

// Store the mock instance globally for tests to access
const globalForPrisma = globalThis as unknown as {
  testPrismaClient: typeof mockPrismaClientInstance;
};
globalForPrisma.testPrismaClient = mockPrismaClientInstance;

// Mock local prisma import
jest.doMock('../src/prisma', () => ({
  // The prisma export is a Proxy that delegates to testPrismaClient
  prisma: mockPrismaClientInstance,
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClientInstance),
  // Re-export everything else
  Prisma: {},
}));

// Mock embeddingService
jest.mock('@/services/embeddingService', () => ({
  embeddingService: {
    calculateSimilarity: jest.fn().mockReturnValue(0.85),
    generateBatchEmbeddings: jest.fn().mockResolvedValue([]),
    findSimilarOutcomes: jest.fn().mockResolvedValue([]),
    generateEmbedding: jest.fn().mockResolvedValue({
      outcomeId: 'test-outcome',
      embedding: Array(1536)
        .fill(0)
        .map(() => Math.random()),
      model: 'text-embedding-3-small',
    }),
    generateMissingEmbeddings: jest.fn().mockResolvedValue(0),
    getOrCreateOutcomeEmbedding: jest.fn().mockResolvedValue({
      outcomeId: 'test-outcome',
      embedding: Array(1536)
        .fill(0)
        .map(() => Math.random()),
      model: 'text-embedding-3-small',
    }),
    searchOutcomesByText: jest.fn().mockResolvedValue([]),
    isEmbeddingServiceAvailable: jest.fn().mockReturnValue(true),
    // Add alias for test compatibility
    cosineSimilarity: jest.fn().mockReturnValue(0.85),
  },
}));

// Mock OpenAI before any imports
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [
            {
              embedding: Array(1536)
                .fill(0)
                .map(() => Math.random()),
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
    })),
    OpenAI: jest.fn().mockImplementation(() => ({
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [
            {
              embedding: Array(1536)
                .fill(0)
                .map(() => Math.random()),
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
    })),
  };
});

// Mock email service
jest.mock('@/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendBulkEmails: jest.fn().mockResolvedValue({ sent: [], failed: [] }),
}));

// Note: curriculumImportService is not mocked here since its tests need the real implementation

// Mock clusteringService
jest.mock('@/services/clusteringService', () => ({
  clusteringService: {
    generateClusters: jest.fn(),
  },
}));

// Mock llmService
jest.mock('@/services/llmService', () => ({
  openai: {
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
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [
          {
            embedding: Array(1536)
              .fill(0)
              .map(() => Math.random()),
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 100,
          total_tokens: 100,
        },
      }),
    },
  },
  generateContent: jest.fn().mockResolvedValue('This is a mock response for testing purposes.'),
  generateBilingualContent: jest.fn().mockResolvedValue({
    english: 'Mock English content',
    french: 'Mock French content',
  }),
}));
