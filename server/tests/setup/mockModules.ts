/**
 * Centralized module mocking setup
 * Use this to ensure consistent mocking across all tests
 */

import { jest } from '@jest/globals';

// OpenAI Mock Setup
export const mockChatCreate = jest.fn();
export const mockEmbeddingCreate = jest.fn();

export const mockOpenAIInstance = {
  chat: {
    completions: {
      create: mockChatCreate,
    },
  },
  embeddings: {
    create: mockEmbeddingCreate,
  },
};

export const mockOpenAI = jest.fn(() => mockOpenAIInstance);

// Reset OpenAI mocks
export const resetOpenAIMocks = () => {
  jest.clearAllMocks();
  mockChatCreate.mockResolvedValue({
    id: 'chatcmpl-test',
    object: 'chat.completion',
    created: Date.now(),
    model: 'gpt-3.5-turbo',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: JSON.stringify({
            suggestions: ['Mock suggestion 1', 'Mock suggestion 2'],
            rationale: 'Mock rationale',
          }),
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 5,
      total_tokens: 15,
    },
  });

  mockEmbeddingCreate.mockResolvedValue({
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
  });
};

// Prisma Mock Setup
export const mockPrisma = {
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
  $transaction: jest.fn().mockImplementation((callback) => callback(mockPrisma)),
};

// Logger Mock Setup
export const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
};

// PDF Parser Mock Setup
export const mockPdfParse = jest.fn().mockResolvedValue({
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

// DOCX Parser Mock Setup
export const mockMammoth = {
  extractRawText: jest.fn().mockResolvedValue({
    value: 'Mock DOCX content for testing purposes',
    messages: [],
  }),
};

// Initialize module mocks
export const setupMocks = () => {
  // Mock OpenAI
  jest.mock('openai', () => mockOpenAI);

  // Mock Prisma
  jest.mock('../../src/prisma', () => ({
    prisma: mockPrisma,
  }));

  // Mock logger
  jest.mock('../../src/logger', () => mockLogger);

  // Mock PDF parsing
  jest.mock('pdf-parse', () => mockPdfParse);

  // Mock DOCX parsing
  jest.mock('mammoth', () => mockMammoth);
};

// Reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  resetOpenAIMocks();
};
