/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Enhanced Service Mocks for Stable Testing Infrastructure
 * This provides comprehensive mocking for all service dependencies with proper isolation
 */

import { jest } from '@jest/globals';
import { MOCK_EMBEDDING_DATA } from './openai.mock';

/**
 * Enhanced Service Registry Mock
 */
export const createMockServiceRegistry = () => ({
  register: jest.fn(),
  get: jest.fn(),
  has: jest.fn().mockReturnValue(true),
  initialize: jest.fn().mockResolvedValue(undefined),
  shutdown: jest.fn().mockResolvedValue(undefined),
  getAll: jest.fn().mockReturnValue(new Map()),
  health: jest.fn().mockResolvedValue({ status: 'healthy' }),
});

/**
 * Enhanced Embedding Service Mock
 */
export const createMockEmbeddingService = () => ({
  generateEmbedding: jest.fn().mockResolvedValue({
    outcomeId: 'mock-outcome-id',
    embedding: MOCK_EMBEDDING_DATA,
    model: 'text-embedding-3-small',
  }),
  generateBatchEmbeddings: jest.fn().mockResolvedValue([
    {
      outcomeId: 'mock-outcome-1',
      embedding: MOCK_EMBEDDING_DATA,
      model: 'text-embedding-3-small',
    },
  ]),
  getEmbedding: jest.fn().mockResolvedValue(MOCK_EMBEDDING_DATA),
  calculateSimilarity: jest.fn().mockReturnValue(0.85),
  findSimilarOutcomes: jest.fn().mockResolvedValue([
    {
      outcomeId: 'similar-outcome-1',
      similarity: 0.92,
    },
  ]),
  findSimilarExpectations: jest.fn().mockResolvedValue([
    {
      outcomeId: 'similar-outcome-1',
      similarity: 0.92,
    },
  ]),
  generateMissingEmbeddings: jest.fn().mockResolvedValue(5),
  searchOutcomesByText: jest.fn().mockResolvedValue([
    {
      outcomeId: 'search-result-1',
      similarity: 0.88,
    },
  ]),
  searchExpectationsByText: jest.fn().mockResolvedValue([
    {
      outcomeId: 'search-result-1',
      similarity: 0.88,
    },
  ]),
  isEmbeddingServiceAvailable: jest.fn().mockReturnValue(true),
  getOrCreateOutcomeEmbedding: jest.fn().mockResolvedValue({
    outcomeId: 'mock-outcome-id',
    embedding: MOCK_EMBEDDING_DATA,
    model: 'text-embedding-3-small',
  }),
  getOrCreateExpectationEmbedding: jest.fn().mockResolvedValue({
    outcomeId: 'mock-outcome-id',
    embedding: MOCK_EMBEDDING_DATA,
    model: 'text-embedding-3-small',
  }),
  cleanupOldEmbeddings: jest.fn().mockResolvedValue(10),
  // Compatibility aliases
  cosineSimilarity: jest.fn().mockReturnValue(0.85),
});

/**
 * Enhanced LLM Service Mock
 */
export const createMockLLMService = () => ({
  generateContent: jest.fn().mockResolvedValue('Mock generated content for testing purposes.'),
  generateBilingualContent: jest.fn().mockResolvedValue({
    english: 'Mock English content',
    french: 'Mock French content',
  }),
  chat: jest.fn().mockResolvedValue('Mock chat response'),
  embedText: jest.fn().mockResolvedValue(MOCK_EMBEDDING_DATA),
  isAvailable: jest.fn().mockReturnValue(true),
  healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
  // Add OpenAI instance mock for direct access
  openai: {
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: MOCK_EMBEDDING_DATA }],
        usage: { total_tokens: 10 },
      }),
    },
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock AI response' } }],
          usage: { total_tokens: 50 },
        }),
      },
    },
  },
});

/**
 * Enhanced Clustering Service Mock
 */
export const createMockClusteringService = () => ({
  generateClusters: jest.fn().mockResolvedValue([
    {
      id: 'cluster-1',
      outcomes: ['outcome-1', 'outcome-2'],
      theme: 'Mathematics',
      confidence: 0.95,
    },
  ]),
  clusterOutcomes: jest.fn().mockResolvedValue([
    {
      clusterId: 'cluster-1',
      outcomeIds: ['outcome-1', 'outcome-2'],
      theme: 'Mathematics',
    },
  ]),
  isAvailable: jest.fn().mockReturnValue(true),
});

/**
 * Enhanced Curriculum Import Service Mock
 */
export const createMockCurriculumImportService = () => ({
  importFromFile: jest.fn().mockResolvedValue({
    importId: 'mock-import-id',
    outcomes: 5,
    status: 'completed',
  }),
  importCurriculumFromPDF: jest.fn().mockResolvedValue({
    expectations: [
      {
        id: 'expectation-1',
        description: 'Mock expectation',
        code: 'MOCK-001',
      },
    ],
    clusters: [
      {
        id: 'cluster-1',
        theme: 'Mock theme',
        expectations: ['expectation-1'],
      },
    ],
  }),
  importCurriculumFromText: jest.fn().mockResolvedValue({
    expectations: [
      {
        id: 'expectation-1',
        description: 'Mock expectation',
        code: 'MOCK-001',
      },
    ],
  }),
  parseContent: jest.fn().mockResolvedValue(['Mock parsed content']),
  validateFile: jest.fn().mockReturnValue(true),
  getImportStatus: jest.fn().mockResolvedValue({
    status: 'completed',
    progress: 100,
  }),
  isAvailable: jest.fn().mockReturnValue(true),
});

/**
 * Enhanced AI Parent Summary Service Mock
 */
export const createMockAIParentSummaryService = () => ({
  generateSummary: jest.fn().mockResolvedValue({
    summary: 'Mock parent summary content',
    highlights: ['Achievement 1', 'Achievement 2'],
    nextSteps: ['Next step 1', 'Next step 2'],
  }),
  generateBilingualSummary: jest.fn().mockResolvedValue({
    english: {
      summary: 'Mock English summary',
      highlights: ['English highlight 1'],
    },
    french: {
      summary: 'Mock French summary',
      highlights: ['French highlight 1'],
    },
  }),
  isAvailable: jest.fn().mockReturnValue(true),
});

/**
 * Enhanced AI Planning Assistant Mock
 */
export const createMockAIPlanningAssistant = () => ({
  generatePlan: jest.fn().mockResolvedValue({
    title: 'Mock Lesson Plan',
    objectives: ['Objective 1', 'Objective 2'],
    activities: ['Activity 1', 'Activity 2'],
    materials: ['Material 1', 'Material 2'],
  }),
  suggestActivities: jest.fn().mockResolvedValue([
    {
      title: 'Mock Activity',
      description: 'Mock activity description',
      duration: 30,
    },
  ]),
  isAvailable: jest.fn().mockReturnValue(true),
});

// Export all service mocks
export const mockServices = {
  serviceRegistry: createMockServiceRegistry(),
  embeddingService: createMockEmbeddingService(),
  llmService: createMockLLMService(),
  clusteringService: createMockClusteringService(),
  curriculumImportService: createMockCurriculumImportService(),
  aiParentSummaryService: createMockAIParentSummaryService(),
  aiPlanningAssistant: createMockAIPlanningAssistant(),
};

// Helper functions for test setup
export const resetAllServiceMocks = () => {
  Object.values(mockServices).forEach((service) => {
    Object.values(service).forEach((method) => {
      if (jest.isMockFunction(method)) {
        method.mockClear();
      }
    });
  });
};

export const setupServiceMock = (serviceName: string, methodName: string, response: any) => {
  const service = (mockServices as any)[serviceName];
  if (service && service[methodName]) {
    service[methodName].mockResolvedValueOnce(response);
  }
  return service?.[methodName];
};

export const setupServiceError = (serviceName: string, methodName: string, error: Error) => {
  const service = (mockServices as any)[serviceName];
  if (service && service[methodName]) {
    service[methodName].mockRejectedValueOnce(error);
  }
  return service?.[methodName];
};

export { mockServices };
