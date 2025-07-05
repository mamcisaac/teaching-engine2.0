/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Centralized Mock Factories
 * Provides consistent mock implementations across all tests
 */

import { jest } from '@jest/globals';

// OpenAI Mock Factory
export const createOpenAIMock = () => {
  const mockChatCompletion = {
    id: 'chatcmpl-test',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-3.5-turbo',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Mock generated content',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 5,
      total_tokens: 15,
    },
  };

  const mockEmbedding = {
    object: 'list',
    data: [
      {
        object: 'embedding',
        embedding: new Array(1536).fill(0.1),
        index: 0,
      },
    ],
    model: 'text-embedding-ada-002',
    usage: {
      prompt_tokens: 5,
      total_tokens: 5,
    },
  };

  const mockCreate = jest.fn().mockResolvedValue(mockChatCompletion);
  const mockEmbeddingCreate = jest.fn().mockResolvedValue(mockEmbedding);

  const mockOpenAIInstance = {
    chat: {
      completions: {
        create: mockCreate,
      },
    },
    embeddings: {
      create: mockEmbeddingCreate,
    },
  };

  const mockOpenAI = jest.fn().mockImplementation(() => mockOpenAIInstance);

  // Add static methods and properties to the constructor mock
  mockOpenAI.mockImplementation = jest.fn().mockReturnValue(mockOpenAI);
  mockOpenAI.prototype = mockOpenAIInstance;

  return mockOpenAI;
};

// Prisma Mock Factory
export const createPrismaMock = () => ({
  curriculumExpectation: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    upsert: jest.fn().mockResolvedValue({}),
  },
  lesson: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
  unitPlan: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
  weeklyPlan: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
  user: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
  $transaction: jest.fn().mockImplementation((callback) => callback(this)),
});

// Logger Mock Factory
export const createLoggerMock = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

// PDF Parser Mock Factory
export const createPDFParserMock = () =>
  jest.fn().mockResolvedValue({
    numpages: 1,
    numrender: 1,
    info: {
      PDFFormatVersion: '1.4',
      IsAcroFormPresent: false,
      IsXFAPresent: false,
    },
    metadata: null,
    version: '1.10.100',
    text: 'Mock PDF content for testing purposes',
  });

// DOCX Parser Mock Factory
export const createDocxParserMock = () => ({
  extractRawText: jest.fn().mockResolvedValue({
    value: 'Mock DOCX content for testing purposes',
    messages: [],
  }),
});

// Service Registry Mock Factory
export const createServiceRegistryMock = () => ({
  register: jest.fn(),
  get: jest.fn(),
  health: jest.fn().mockResolvedValue({ status: 'healthy' }),
});

// Cleanup function for all mocks
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};
