/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Global test setup for mocks
 * This file configures common mocks for all tests
 */

import { jest } from '@jest/globals';

// Mock OpenAI with our proven working pattern
jest.mock('openai', () => ({
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
        model: 'text-embedding-ada-002',
        usage: { prompt_tokens: 8, total_tokens: 8 },
      }),
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          id: 'chatcmpl-test',
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'Mocked response',
              },
              finish_reason: 'stop',
            },
          ],
          created: Date.now(),
          model: 'gpt-4',
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
        }),
      },
    },
  })),
}));

// Mock database with our proven working pattern
jest.mock('@teaching-engine/database', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    team: {
      findUnique: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    },
    student: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      update: jest.fn(),
    },
    curriculumExpectation: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      createMany: jest.fn(),
    },
    oerResource: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    lessonPlan: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    unitPlan: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
    },
    embeddingCache: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    },
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $transaction: jest.fn().mockImplementation(async (fn) => {
      if (typeof fn === 'function') {
        return fn(mockPrismaClient);
      }
      return Promise.all(fn);
    }),
  };

  return {
    prisma: mockPrismaClient,
    Prisma: {
      PrismaClientKnownRequestError: class extends Error {
        code: string;
        constructor(message: string, { code }: { code: string }) {
          super(message);
          this.code = code;
        }
      },
    },
  };
});

// Mock node-fetch
jest.mock('node-fetch', () => ({
  default: jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
      text: async () => 'OK',
    }),
  ),
}));

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});
