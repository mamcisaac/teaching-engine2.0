/**
 * Mock setup specifically for unit tests
 * Unit tests should be fast and isolated with extensive mocking
 */

import { jest } from '@jest/globals';
import { setupTestEnvironment, createMockLogger } from './testHelpers';
import { createMockPrismaClient, createMockOpenAI, createMockEmbeddingService } from './mockFactories';

// Set up test environment
setupTestEnvironment();

// Create global mock instances
const mockPrismaClient = createMockPrismaClient();
const mockLogger = createMockLogger();
const mockOpenAI = createMockOpenAI();
const mockEmbeddingService = createMockEmbeddingService();

// Mock @teaching-engine/database completely for unit tests
jest.mock('@teaching-engine/database', () => ({
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
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  prisma: mockPrismaClient,
}));

// Mock logger
jest.mock('@/logger', () => ({
  __esModule: true,
  default: mockLogger,
  ...mockLogger,
}));

// Mock OpenAI
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockOpenAI),
  OpenAI: jest.fn().mockImplementation(() => mockOpenAI),
}));

// Mock embedding service
jest.mock('@/services/embeddingService', () => ({
  embeddingService: mockEmbeddingService,
}));

// Mock email service
jest.mock('@/services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendBulkEmails: jest.fn().mockResolvedValue({ sent: [], failed: [] }),
}));

// Mock clustering service
jest.mock('@/services/clusteringService', () => ({
  clusteringService: {
    generateClusters: jest.fn().mockResolvedValue([]),
  },
}));

// Mock LLM service
jest.mock('@/services/llmService', () => ({
  openai: mockOpenAI,
  generateContent: jest.fn().mockResolvedValue('Mocked content for unit tests'),
  generateBilingualContent: jest.fn().mockResolvedValue({
    english: 'Mock English content',
    french: 'Mock French content',
  }),
}));

// Mock file system operations for unit tests
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue('mock file content'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  readdirSync: jest.fn().mockReturnValue([]),
  statSync: jest.fn().mockReturnValue({ isDirectory: () => false, size: 1024 }),
}));

// Mock path operations
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
  resolve: jest.fn((...args) => '/' + args.join('/')),
  dirname: jest.fn((p) => p.split('/').slice(0, -1).join('/')),
  basename: jest.fn((p) => p.split('/').pop()),
  extname: jest.fn((p) => '.' + p.split('.').pop()),
}));

// Store mock instances globally for test access
const globalForTest = globalThis as unknown as {
  testMocks: {
    prisma: typeof mockPrismaClient;
    logger: typeof mockLogger;
    openai: typeof mockOpenAI;
    embeddingService: typeof mockEmbeddingService;
  };
};

globalForTest.testMocks = {
  prisma: mockPrismaClient,
  logger: mockLogger,
  openai: mockOpenAI,
  embeddingService: mockEmbeddingService,
};

// Export for direct use in tests
export {
  mockPrismaClient,
  mockLogger,
  mockOpenAI,
  mockEmbeddingService,
};