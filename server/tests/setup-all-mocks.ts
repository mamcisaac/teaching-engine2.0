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
jest.mock('../src/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

// Mock embeddingService
jest.mock('../src/services/embeddingService', () => ({
  embeddingService: {
    calculateSimilarity: jest.fn(),
    generateBatchEmbeddings: jest.fn(),
    findSimilarOutcomes: jest.fn(),
    generateEmbedding: jest.fn().mockResolvedValue({
      embedding: Array(1536)
        .fill(0)
        .map(() => Math.random()),
    }),
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
jest.mock('../src/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendBulkEmails: jest.fn().mockResolvedValue({ sent: [], failed: [] }),
}));
