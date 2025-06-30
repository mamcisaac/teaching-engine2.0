// Global mock setup for all tests - Optimized for performance
// This file runs before any tests and sets up all required mocks
import { jest } from '@jest/globals';
import { randomBytes } from 'crypto';

// Set up environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'file:./test.db';
process.env.JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex'); // Reuse existing if available
process.env.OPENAI_API_KEY = 'test-api-key';

// Mock UUID before any other imports
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'default-uuid-' + Math.random().toString(36).substr(2, 9)),
  v1: jest.fn(() => 'v1-uuid'),
  v3: jest.fn(() => 'v3-uuid'),
  v5: jest.fn(() => 'v5-uuid'),
  parse: jest.fn(),
  stringify: jest.fn(),
  validate: jest.fn(() => true),
  version: jest.fn(() => 4),
  NIL: '00000000-0000-0000-0000-000000000000',
}));

// Lazy loading for database mock - only import when needed
let databaseMockLoaded = false;
const loadDatabaseMock = async () => {
  if (!databaseMockLoaded) {
    await import('./mocks/database.mock.ts');
    databaseMockLoaded = true;
  }
};

// Mock @teaching-engine/database with lazy loading
jest.mock('@teaching-engine/database', async () => {
  // Only load database mock when actually needed
  const { prisma, PrismaClient, ImportStatus, Prisma } = await import('./mocks/database.mock.ts');
  
  return {
    prisma,
    PrismaClient,
    ImportStatus,
    Prisma,
  };
});

// Optimized logger mock - reuse instances to reduce memory
let mockLogger: any;
const createMockLogger = () => {
  if (!mockLogger) {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn(() => mockLogger), // Reuse same instance for better performance
    };
  }
  return mockLogger;
};

const logger = createMockLogger();

// Mock both import paths with shared logger instance
jest.mock('@/logger', () => ({
  __esModule: true,
  default: logger,
  ...logger,
}));

// Mock src/logger
jest.doMock('../src/logger', () => ({
  __esModule: true,
  default: logger,
  ...logger,
}));

// Mock local prisma import using the consolidated database mock with lazy loading
jest.doMock('../src/prisma', async () => {
  await loadDatabaseMock();
  const { prisma, PrismaClient, Prisma } = await import('./mocks/database.mock.ts');
  return {
    prisma,
    PrismaClient,
    Prisma,
  };
});

// Optimized embeddingService mock - lazy generate embeddings
const generateMockEmbedding = () => {
  // Use consistent mock embedding to reduce memory usage
  if (!global.__mockEmbedding) {
    global.__mockEmbedding = Array(1536).fill(0).map(() => Math.random());
  }
  return global.__mockEmbedding;
};

jest.mock('@/services/embeddingService', () => ({
  embeddingService: {
    calculateSimilarity: jest.fn().mockReturnValue(0.85),
    generateBatchEmbeddings: jest.fn().mockResolvedValue([]),
    findSimilarOutcomes: jest.fn().mockResolvedValue([]),
    generateEmbedding: jest.fn().mockResolvedValue({
      outcomeId: 'test-outcome',
      embedding: generateMockEmbedding(),
      model: 'text-embedding-3-small',
    }),
    generateMissingEmbeddings: jest.fn().mockResolvedValue(0),
    getOrCreateOutcomeEmbedding: jest.fn().mockResolvedValue({
      outcomeId: 'test-outcome',
      embedding: generateMockEmbedding(),
      model: 'text-embedding-3-small',
    }),
    searchOutcomesByText: jest.fn().mockResolvedValue([]),
    isEmbeddingServiceAvailable: jest.fn().mockReturnValue(true),
    // Add alias for test compatibility
    cosineSimilarity: jest.fn().mockReturnValue(0.85),
  },
}));

// Optimized OpenAI mock - reuse mock responses
const mockEmbeddingResponse = {
  data: [
    {
      embedding: generateMockEmbedding(),
      index: 0,
    },
  ],
  usage: {
    prompt_tokens: 100,
    total_tokens: 100,
  },
};

const mockChatResponse = {
  id: 'mock-completion',
  choices: [
    {
      message: {
        role: 'assistant' as const,
        content: 'Mocked AI response',
      },
      finish_reason: 'stop' as const,
      index: 0,
    },
  ],
  usage: {
    prompt_tokens: 50,
    completion_tokens: 100,
    total_tokens: 150,
  },
};

const mockOpenAIInstance = {
  embeddings: {
    create: jest.fn().mockResolvedValue(mockEmbeddingResponse),
  },
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue(mockChatResponse),
    },
  },
};

// Mock OpenAI before any imports
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => mockOpenAIInstance),
  OpenAI: jest.fn().mockImplementation(() => mockOpenAIInstance),
}));

// Conditional mocking - only mock services that are actually used
if (process.env.MOCK_EMAIL_SERVICE !== 'false') {
  jest.mock('@/services/emailService', () => ({
    sendEmail: jest.fn().mockResolvedValue(true),
    sendBulkEmails: jest.fn().mockResolvedValue({ sent: [], failed: [] }),
  }));
}

// Note: curriculumImportService is not mocked here since its tests need the real implementation

// Mock clusteringService
jest.mock('@/services/clusteringService', () => ({
  clusteringService: {
    generateClusters: jest.fn().mockResolvedValue([]),
  },
}));

// Clear mock call history between test suites to prevent memory leaks
beforeEach(() => {
  if (global.__mockEmbedding) {
    jest.clearAllMocks();
  }
});

// Mock llmService with shared responses
jest.mock('@/services/llmService', () => ({
  openai: mockOpenAIInstance,
  generateContent: jest.fn().mockResolvedValue('Mock content for testing.'),
  generateBilingualContent: jest.fn().mockResolvedValue({
    english: 'Mock English content',
    french: 'Mock French content',
  }),
}));
