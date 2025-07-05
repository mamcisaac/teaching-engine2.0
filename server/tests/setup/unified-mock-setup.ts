/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Unified Mock Setup - Production-Grade Stability
 * This provides a comprehensive, stable mock foundation for all test types
 */

import { jest, beforeEach, afterEach } from '@jest/globals';
import {
  unifiedPrismaClient,
  resetDatabaseMocks,
  ImportStatus,
  Prisma,
} from '../mocks/database.unified.mock.js';
import {
  mockPdfParse,
  mockDocxParser,
  mockMammoth,
  mockOfficeParser,
  resetFileParsingMocks,
} from '../mocks/file-parsing.mock.js';
import {
  mockOpenAI,
  resetOpenAIMocks,
  createMockEmbeddingResponse,
  createMockChatResponse,
} from '../mocks/openai.mock.js';

// Environment setup
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = 'test-secret-key';
// CRITICAL: Remove real API key - use TEST_OPENAI_API_KEY instead
delete process.env.OPENAI_API_KEY;
process.env.TEST_OPENAI_API_KEY = 'test-mock-api-key';

/**
 * Global Mock Registry
 * Provides centralized access to all mocks for tests
 */
export class MockRegistry {
  static openai = mockOpenAI;
  static prisma = unifiedPrismaClient;
  static fileParsing = {
    pdfParse: mockPdfParse,
    docxParser: mockDocxParser,
    mammoth: mockMammoth,
    officeParser: mockOfficeParser,
  };

  static reset() {
    resetOpenAIMocks();
    resetDatabaseMocks();
    resetFileParsingMocks();
  }

  static setup() {
    // Set up OpenAI mocks with default successful responses
    if (jest.isMockFunction(this.openai.embeddings.create)) {
      this.openai.embeddings.create.mockResolvedValue(createMockEmbeddingResponse());
    }
    if (jest.isMockFunction(this.openai.chat.completions.create)) {
      this.openai.chat.completions.create.mockResolvedValue(createMockChatResponse());
    }

    // Database mocks are already set up by the unified mock system
    // File parsing mocks are already set up by the file parsing mock system

    return this;
  }
}

/**
 * Module Mock Definitions
 * These must be defined at the top level for Jest to hoist them
 */

// Mock OpenAI module - must be hoisted
jest.mock('openai', () => {
  const { mockOpenAI } = require('../mocks/openai.mock.js');

  // Create constructor mock that returns the same mock instance
  const MockOpenAIConstructor = jest.fn().mockImplementation(() => mockOpenAI);

  return {
    __esModule: true,
    default: MockOpenAIConstructor,
    OpenAI: MockOpenAIConstructor,
  };
});

// Mock database module - unified approach
jest.mock('@teaching-engine/database', () => {
  const {
    unifiedPrismaClient,
    ImportStatus,
    Prisma,
  } = require('../mocks/database.unified.mock.js');
  return {
    __esModule: true,
    prisma: unifiedPrismaClient,
    PrismaClient: jest.fn().mockImplementation(() => unifiedPrismaClient),
    ImportStatus,
    Prisma,
  };
});

// Mock Prisma client imports
jest.mock('@prisma/client', () => {
  const { unifiedPrismaClient, Prisma } = require('../mocks/database.unified.mock.js');
  return {
    __esModule: true,
    PrismaClient: jest.fn().mockImplementation(() => unifiedPrismaClient),
    Prisma,
  };
});

// Mock local prisma imports
jest.mock('../../src/prisma', () => {
  const { unifiedPrismaClient } = require('../mocks/database.unified.mock.js');
  return {
    __esModule: true,
    default: unifiedPrismaClient,
    prisma: unifiedPrismaClient,
  };
});

// Mock file parsing libraries
jest.mock('pdf-parse', () => {
  const mockPdfParse = require('../mocks/pdf-parse.mock.js').default;
  return {
    __esModule: true,
    default: mockPdfParse,
  };
});

jest.mock('mammoth', () => {
  const mammothMock = require('../mocks/mammoth.mock.js');
  return {
    __esModule: true,
    extractRawText: mammothMock.extractRawText,
    convertToHtml: mammothMock.convertToHtml,
  };
});

jest.mock('docx-parser', () => {
  const mockDocxParser = require('../mocks/docx-parser.mock.js').default;
  return {
    __esModule: true,
    default: mockDocxParser,
  };
});

jest.mock('office-text-extractor', () => {
  const { mockOfficeParser } = require('../mocks/file-parsing.mock.js');
  return {
    __esModule: true,
    ...mockOfficeParser,
  };
});

// Mock llmService import paths used by embeddingService
jest.mock('../../src/services/llmService.ts', () => {
  const { mockOpenAI } = require('../mocks/openai.mock.js');
  return {
    __esModule: true,
    openai: mockOpenAI,
    generateContent: jest.fn().mockResolvedValue('Mock content'),
    generateBilingualContent: jest.fn().mockResolvedValue({
      english: 'Mock English content',
      french: 'Mock French content',
    }),
  };
});

jest.mock('../../src/services/llmService.js', () => {
  const { mockOpenAI } = require('../mocks/openai.mock.js');
  return {
    __esModule: true,
    openai: mockOpenAI,
    generateContent: jest.fn().mockResolvedValue('Mock content'),
    generateBilingualContent: jest.fn().mockResolvedValue({
      english: 'Mock English content',
      french: 'Mock French content',
    }),
  };
});

// Mock llmService to ensure it uses mocked OpenAI
jest.mock('../../src/services/llmService', () => {
  const { mockOpenAI } = require('../mocks/openai.mock.js');
  return {
    __esModule: true,
    openai: mockOpenAI,
    generateContent: jest.fn().mockResolvedValue('Mock content'),
    generateBilingualContent: jest.fn().mockResolvedValue({
      english: 'Mock English content',
      french: 'Mock French content',
    }),
  };
});

// Mock logger to prevent console noise in tests
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

jest.mock('../../src/logger', () => ({
  __esModule: true,
  default: mockLogger,
}));

// Mock utility modules
jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substr(2, 9)),
  v1: jest.fn(() => 'mock-uuid-v1'),
  v3: jest.fn(() => 'mock-uuid-v3'),
  v5: jest.fn(() => 'mock-uuid-v5'),
  parse: jest.fn(),
  stringify: jest.fn(),
  validate: jest.fn(() => true),
  version: jest.fn(() => 4),
  NIL: '00000000-0000-0000-0000-000000000000',
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  __esModule: true,
  hash: jest.fn().mockResolvedValue('$2a$10$hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('$2a$10$salt'),
  getRounds: jest.fn().mockReturnValue(10),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
  verify: jest.fn().mockReturnValue({ userId: '123', email: 'test@example.com' }),
  decode: jest.fn().mockReturnValue({ userId: '123', email: 'test@example.com' }),
}));

/**
 * Global Test Hooks
 * Automatically set up and tear down mocks for every test
 */
beforeEach(() => {
  MockRegistry.setup();
});

afterEach(() => {
  MockRegistry.reset();
});

/**
 * Exported functions for manual test control
 */
export const setupMocks = () => MockRegistry.setup();
export const resetMocks = () => MockRegistry.reset();
export const getMocks = () => MockRegistry;

/**
 * Test Utilities
 */
export const expectMockCalled = (mockFn: jest.Mock, times: number = 1) => {
  expect(mockFn).toHaveBeenCalledTimes(times);
};

export const expectMockCalledWith = (mockFn: jest.Mock, ...args: any[]) => {
  expect(mockFn).toHaveBeenCalledWith(...args);
};

export const expectMockResolvedValue = (mockFn: jest.Mock, value: any) => {
  expect(mockFn).toHaveReturnedWith(Promise.resolve(value));
};

/**
 * Mock Validation Utilities
 */
export const validateMockIntegrity = () => {
  const issues: string[] = [];

  // Check OpenAI mocks
  if (!jest.isMockFunction(mockOpenAI.embeddings.create)) {
    issues.push('OpenAI embeddings.create is not properly mocked');
  }

  if (!jest.isMockFunction(mockOpenAI.chat.completions.create)) {
    issues.push('OpenAI chat.completions.create is not properly mocked');
  }

  // Check database mocks
  if (!jest.isMockFunction(unifiedPrismaClient.outcomeEmbedding.findUnique)) {
    issues.push('Prisma outcomeEmbedding.findUnique is not properly mocked');
  }

  // Check file parsing mocks
  if (!jest.isMockFunction(mockPdfParse)) {
    issues.push('PDF parser is not properly mocked');
  }

  if (issues.length > 0) {
    throw new Error(`Mock integrity issues found:\n${issues.join('\n')}`);
  }

  return true;
};

/**
 * Export everything needed for tests
 */
export {
  mockOpenAI,
  unifiedPrismaClient,
  unifiedPrismaClient as mockPrismaClient,
  mockPdfParse,
  mockDocxParser,
  mockMammoth,
  mockOfficeParser,
  mockLogger,
  ImportStatus,
  Prisma,
};

// Default export for convenience
export default MockRegistry;
