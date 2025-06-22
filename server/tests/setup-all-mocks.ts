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

// Mock logger to avoid console spam during tests
jest.mock('@/logger', () => {
  const createMockLogger = () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    child: jest.fn(() => createMockLogger()), // Return new logger instance for chaining
  });

  const mockLogger = createMockLogger();

  // Support both default and named exports
  return {
    __esModule: true,
    default: mockLogger,
    ...mockLogger,
  };
});

// Mock local prisma import
jest.mock('../src/prisma', () => ({
  prisma: {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn().mockImplementation((fn) => fn({})),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
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
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
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
