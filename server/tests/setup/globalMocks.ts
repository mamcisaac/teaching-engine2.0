/**
 * Global Mock Setup - Prevents Real API Calls During Testing
 *
 * This file provides comprehensive mocking for all external services
 * to ensure tests never make real API calls or access production resources.
 */

import { jest } from '@jest/globals';

// Environment setup for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key';

// CRITICAL: Remove any real API keys to prevent accidental usage
delete process.env.OPENAI_API_KEY;
delete process.env.ANTHROPIC_API_KEY;
delete process.env.COHERE_API_KEY;

// Set test API keys that will be caught by mocks
process.env.TEST_OPENAI_API_KEY = 'test-openai-key-for-mocking';
process.env.TEST_ANTHROPIC_API_KEY = 'test-anthropic-key-for-mocking';

// Ensure we're in test mode
process.env.NODE_ENV = 'test';
process.env.AI_REQUEST_DELAY_MS = '0'; // No delays in tests
process.env.AI_MAX_RETRIES = '1'; // Single retry in tests

/**
 * OpenAI Mock - Prevents Real API Calls
 */
const createOpenAIMock = () => {
  const mockChatCompletion = {
    id: 'chatcmpl-test-' + Math.random().toString(36).substring(7),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'gpt-3.5-turbo',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: 'Mock AI response for testing - no real API call made',
        },
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 10,
      completion_tokens: 15,
      total_tokens: 25,
    },
  };

  const mockEmbedding = {
    object: 'list',
    data: [
      {
        object: 'embedding',
        embedding: Array.from({ length: 1536 }, () => Math.random() * 0.1),
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

  const MockOpenAI = jest.fn().mockImplementation(() => mockOpenAIInstance);
  MockOpenAI.prototype = mockOpenAIInstance;

  return MockOpenAI;
};

/**
 * Logger Mock - Prevents Console Pollution
 */
const createLoggerMock = () => {
  const silentFn = jest.fn(); // Always silent during tests

  const mockLogger = {
    info: silentFn,
    warn: silentFn,
    error: silentFn,
    debug: silentFn,
    trace: silentFn,
    fatal: silentFn,
    child: jest.fn().mockReturnValue({
      info: silentFn,
      warn: silentFn,
      error: silentFn,
      debug: silentFn,
      trace: silentFn,
      fatal: silentFn,
      child: jest.fn().mockReturnThis(),
    }),
  };

  // Only enable logging if explicitly requested for debugging
  if (process.env.DEBUG_TESTS === 'true') {
    mockLogger.error = jest.fn((msg) => console.error('[TEST DEBUG]', msg));
    mockLogger.warn = jest.fn((msg) => console.warn('[TEST DEBUG]', msg));
  }

  return mockLogger;
};

/**
 * PDF Parser Mock - Prevents File System Dependencies
 */
const createPDFParserMock = () => {
  return jest.fn().mockImplementation(() => ({
    loadPDF: jest.fn().mockResolvedValue({
      numpages: 1,
      numrender: 1,
      info: {
        PDFFormatVersion: '1.4',
        IsAcroFormPresent: false,
        IsXFAPresent: false,
      },
      metadata: null,
      version: '1.10.100',
      text: 'Mock PDF content extracted for testing purposes. This represents curriculum expectations and learning outcomes.',
    }),
  }));
};

/**
 * DOCX Parser Mock - Prevents File System Dependencies
 */
const createDocxParserMock = () => ({
  extractRawText: jest.fn().mockResolvedValue({
    value:
      'Mock DOCX content extracted for testing purposes. This represents structured curriculum documents.',
    messages: [],
  }),
});

/**
 * Fetch Mock - Prevents Real HTTP Requests
 */
const createFetchMock = () => {
  return jest.fn().mockImplementation((url: string) => {
    // Log warning if real URLs are being called during tests
    if (process.env.DEBUG_TESTS === 'true') {
      console.warn(`[TEST WARNING] Fetch called with URL: ${url} - This should be mocked!`);
    }

    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map(),
      json: () =>
        Promise.resolve({
          message: 'Mock HTTP response - no real request made',
          url: url,
          timestamp: new Date().toISOString(),
        }),
      text: () => Promise.resolve('Mock HTTP response text'),
      blob: () => Promise.resolve(new Blob(['mock blob data'])),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    });
  });
};

/**
 * File System Mock - Prevents Real File Operations
 */
const createFileSystemMock = () => ({
  readFile: jest.fn().mockResolvedValue('Mock file content'),
  writeFile: jest.fn().mockResolvedValue(undefined),
  exists: jest.fn().mockResolvedValue(true),
  mkdir: jest.fn().mockResolvedValue(undefined),
  readdir: jest.fn().mockResolvedValue(['mock-file.txt']),
  stat: jest.fn().mockResolvedValue({
    isFile: () => true,
    isDirectory: () => false,
    size: 1024,
    mtime: new Date(),
  }),
});

// Apply global mocks
jest.mock('openai', () => createOpenAIMock());
jest.mock('pino', () => () => createLoggerMock());

// Mock the logger module directly
jest.mock('../../src/logger', () => createLoggerMock());

jest.mock('pdf2pic', () => createPDFParserMock());
jest.mock('mammoth', () => createDocxParserMock());

// Mock global fetch if it exists
if (typeof global !== 'undefined') {
  (global as any).fetch = createFetchMock();
}

// Mock Node.js modules that might make external calls
jest.mock('fs/promises', () => createFileSystemMock());
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: createFileSystemMock(),
}));

// Mock http/https modules to prevent real requests
jest.mock('http', () => ({
  ...jest.requireActual('http'),
  request: jest.fn(),
  get: jest.fn(),
}));

jest.mock('https', () => ({
  ...jest.requireActual('https'),
  request: jest.fn(),
  get: jest.fn(),
}));

/**
 * Mock Cleanup Function
 */
export const cleanupGlobalMocks = () => {
  jest.clearAllMocks();

  // Reset any global state that might have been modified
  if (typeof global !== 'undefined') {
    (global as any).fetch = createFetchMock();
  }
};

/**
 * Validate No Real API Calls
 * Call this in tests to ensure mocks are working
 */
export const validateNoRealAPICalls = () => {
  // Check that sensitive environment variables are not set
  const sensitiveKeys = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'COHERE_API_KEY',
    'PRODUCTION_DATABASE_URL',
  ];

  const foundKeys = sensitiveKeys.filter((key) => process.env[key]);

  if (foundKeys.length > 0) {
    throw new Error(
      `Test environment has real API keys set: ${foundKeys.join(', ')}. ` +
        'This could cause real API calls during testing!',
    );
  }

  // Validate we're in test environment
  if (process.env.NODE_ENV !== 'test') {
    throw new Error(`Not in test environment! NODE_ENV=${process.env.NODE_ENV}`);
  }

  return true;
};

/**
 * Mock Service Registry
 */
export const createServiceRegistryMock = () => {
  const services = new Map();

  return {
    register: jest.fn().mockImplementation((name, service) => {
      services.set(name, service);
    }),
    get: jest.fn().mockImplementation((name) => {
      return services.get(name);
    }),
    getAll: jest.fn().mockImplementation(() => Array.from(services.values())),
    health: jest.fn().mockResolvedValue({
      status: 'healthy',
      services: Array.from(services.keys()),
      timestamp: new Date().toISOString(),
    }),
    clear: jest.fn().mockImplementation(() => {
      services.clear();
    }),
  };
};

// Export validation function for use in tests
export { validateNoRealAPICalls };

// Initialize validation on module load
validateNoRealAPICalls();

console.log('[GLOBAL MOCKS] Initialized - All external APIs mocked, no real calls will be made');
