/**
 * Mock setup for integration tests
 * Integration tests use real database but mock external services
 */

import { jest } from '@jest/globals';
import { setupTestEnvironment } from './testHelpers';
import { createMockLogger, createMockOpenAI, createMockEmbeddingService } from './mockFactories';

// Set up test environment
setupTestEnvironment();

// Create mock instances for external services only
const mockLogger = createMockLogger();
const mockOpenAI = createMockOpenAI();
const mockEmbeddingService = createMockEmbeddingService();

// Mock logger (but allow it to work for debugging if needed)
jest.mock('@/logger', () => {
  if (process.env.DEBUG_TESTS) {
    // Allow real logging in debug mode
    return jest.requireActual('@/logger');
  }
  return {
    __esModule: true,
    default: mockLogger,
    ...mockLogger,
  };
});

// Mock OpenAI (external service)
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockOpenAI),
  OpenAI: jest.fn().mockImplementation(() => mockOpenAI),
}));

// Mock embedding service (uses OpenAI)
jest.mock('@/services/embeddingService', () => ({
  embeddingService: mockEmbeddingService,
}));

// Mock email service (external service)
jest.mock('@/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendBulkEmails: jest.fn().mockResolvedValue({ sent: [], failed: [] }),
}));

// Mock LLM service (external service)
jest.mock('@/services/llmService', () => ({
  openai: mockOpenAI,
  generateContent: jest.fn().mockResolvedValue('Mocked content for integration tests'),
  generateBilingualContent: jest.fn().mockResolvedValue({
    english: 'Mock English content',
    french: 'Mock French content',
  }),
}));

// DON'T mock @teaching-engine/database - use real Prisma for integration tests
// DON'T mock file system - integration tests can use real files
// DON'T mock internal services - test real implementations

// Store mock instances globally for test access
const globalForTest = globalThis as unknown as {
  integrationMocks: {
    logger: typeof mockLogger;
    openai: typeof mockOpenAI;
    embeddingService: typeof mockEmbeddingService;
  };
};

globalForTest.integrationMocks = {
  logger: mockLogger,
  openai: mockOpenAI,
  embeddingService: mockEmbeddingService,
};

// Export for direct use in tests
export {
  mockLogger,
  mockOpenAI,
  mockEmbeddingService,
};