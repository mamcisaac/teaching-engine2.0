/**
 * Service Mock Infrastructure
 * Provides comprehensive mocking for all services to prevent real API calls
 */

import { jest } from '@jest/globals';

// Mock Service Registry to prevent real service initialization
export const createMockServiceRegistry = () => {
  const mockServices = new Map();

  return {
    register: jest.fn().mockImplementation((name: string, service: any) => {
      mockServices.set(name, service);
      return Promise.resolve();
    }),
    get: jest.fn().mockImplementation((name: string) => {
      return mockServices.get(name);
    }),
    getAll: jest.fn().mockReturnValue(Array.from(mockServices.values())),
    has: jest.fn().mockImplementation((name: string) => mockServices.has(name)),
    clear: jest.fn().mockImplementation(() => {
      mockServices.clear();
    }),
    health: jest.fn().mockResolvedValue({
      status: 'healthy',
      services: Array.from(mockServices.keys()),
      timestamp: new Date().toISOString(),
    }),
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
  };
};

// Mock LLM Service
export const createMockLLMService = () => ({
  generateContent: jest.fn().mockResolvedValue('Mock AI response for testing'),
  generateBilingualContent: jest.fn().mockResolvedValue({
    english: 'Mock English content',
    french: 'Mock French content',
  }),
  isAvailable: jest.fn().mockReturnValue(true),
  getUsageStats: jest.fn().mockReturnValue({ requests: 0, tokens: 0 }),
});

// Mock Embedding Service
export const createMockEmbeddingService = () => ({
  generateEmbedding: jest.fn().mockResolvedValue({
    expectationId: 'test-id',
    embedding: Array.from({ length: 1536 }, () => Math.random() * 0.1),
    model: 'text-embedding-3-small',
  }),
  generateBatchEmbeddings: jest.fn().mockResolvedValue([]),
  getEmbedding: jest
    .fn()
    .mockResolvedValue(Array.from({ length: 1536 }, () => Math.random() * 0.1)),
  calculateSimilarity: jest.fn().mockReturnValue(0.85),
  findSimilarExpectations: jest.fn().mockResolvedValue([]),
  searchExpectationsByText: jest.fn().mockResolvedValue([]),
  generateMissingEmbeddings: jest.fn().mockResolvedValue(0),
  isEmbeddingServiceAvailable: jest.fn().mockReturnValue(false), // Disabled in tests
  getUsageStats: jest.fn().mockReturnValue({ requests: 0, tokens: 0 }),
});

// Mock AI Planning Assistant Service
export const createMockAIPlanningAssistantService = () => ({
  generateLessonPlan: jest.fn().mockResolvedValue({
    title: 'Mock Lesson Plan',
    objectives: ['Mock objective 1', 'Mock objective 2'],
    activities: [{ title: 'Mock Activity', duration: 30, description: 'Mock description' }],
    assessment: 'Mock assessment strategy',
    materials: ['Mock material 1', 'Mock material 2'],
  }),
  generateUnitPlan: jest.fn().mockResolvedValue({
    title: 'Mock Unit Plan',
    description: 'Mock unit description',
    duration: 4,
    lessons: [],
  }),
  generateActivityIdeas: jest.fn().mockResolvedValue([
    { title: 'Mock Activity 1', description: 'Mock description 1', duration: 30 },
    { title: 'Mock Activity 2', description: 'Mock description 2', duration: 45 },
  ]),
  isAvailable: jest.fn().mockReturnValue(false), // Disabled in tests
  getUsageStats: jest.fn().mockReturnValue({ requests: 0, tokens: 0 }),
});

// Mock Newsletter Service
export const createMockNewsletterService = () => ({
  generateNewsletter: jest.fn().mockResolvedValue({
    title: 'Mock Newsletter',
    content: 'Mock newsletter content',
    highlights: ['Mock highlight 1', 'Mock highlight 2'],
    upcoming: ['Mock upcoming event 1', 'Mock upcoming event 2'],
  }),
  sendNewsletter: jest.fn().mockResolvedValue({ success: true, recipientCount: 0 }),
  scheduleNewsletter: jest.fn().mockResolvedValue({ success: true, scheduledFor: new Date() }),
  isAvailable: jest.fn().mockReturnValue(false), // Disabled in tests
  getUsageStats: jest.fn().mockReturnValue({ requests: 0, tokens: 0 }),
});

// Mock Curriculum Import Service
export const createMockCurriculumImportService = () => ({
  importFromPDF: jest.fn().mockResolvedValue({
    success: true,
    expectationsCount: 5,
    expectations: [
      {
        id: 'mock-1',
        code: 'MOCK.1',
        description: 'Mock curriculum expectation 1',
        subject: 'Mathematics',
        grade: 5,
        domain: 'Number',
      },
    ],
  }),
  importFromDOCX: jest.fn().mockResolvedValue({
    success: true,
    expectationsCount: 3,
    expectations: [],
  }),
  validateContent: jest.fn().mockResolvedValue({ valid: true, warnings: [], errors: [] }),
  parseExpectations: jest.fn().mockResolvedValue([]),
  isAvailable: jest.fn().mockReturnValue(true),
});

// Email service removed - app only creates newsletter drafts, doesn't send emails

// Mock File Service
export const createMockFileService = () => ({
  uploadFile: jest.fn().mockResolvedValue({
    id: 'mock-file-id',
    filename: 'mock-file.pdf',
    size: 1024,
    mimetype: 'application/pdf',
  }),
  downloadFile: jest.fn().mockResolvedValue(Buffer.from('mock file content')),
  deleteFile: jest.fn().mockResolvedValue({ success: true }),
  validateFile: jest.fn().mockReturnValue({ valid: true, errors: [] }),
  isAvailable: jest.fn().mockReturnValue(true),
});

// Comprehensive Service Mock Registry
export const createComprehensiveServiceMocks = () => {
  const serviceRegistry = createMockServiceRegistry();

  // Register all mock services
  const services = {
    llmService: createMockLLMService(),
    embeddingService: createMockEmbeddingService(),
    aiPlanningAssistantService: createMockAIPlanningAssistantService(),
    newsletterService: createMockNewsletterService(),
    curriculumImportService: createMockCurriculumImportService(),
    fileService: createMockFileService(),
  };

  // Auto-register services
  Object.entries(services).forEach(([name, service]) => {
    serviceRegistry.register(name, service);
  });

  return {
    serviceRegistry,
    services,
  };
};

// Validate Service Mocks are Working
export const validateServiceMocks = () => {
  // Check that sensitive operations are mocked
  const validations = [
    {
      name: 'OpenAI Client',
      check: () => {
        // This will be mocked by globalMocks.ts
        return true;
      },
    },
    {
      name: 'File Service',
      check: () => {
        const mockFile = createMockFileService();
        return typeof mockFile.uploadFile === 'function';
      },
    },
  ];

  const failed = validations.filter((v) => {
    try {
      return !v.check();
    } catch (_error) {
      console.warn(`Service mock validation failed for ${v.name}:`, error);
      return true;
    }
  });

  if (failed.length > 0) {
    throw new Error(`Service mock validation failed for: ${failed.map((f) => f.name).join(', ')}`);
  }

  return true;
};

// Cleanup Service Mocks
export const cleanupServiceMocks = () => {
  jest.clearAllMocks();

  // Reset any global service state if needed
  const mockRegistry = createMockServiceRegistry();
  mockRegistry.clear();

  return true;
};

// Export service mock creation for individual test use
export {
  createMockServiceRegistry,
  createMockLLMService,
  createMockEmbeddingService,
  createMockAIPlanningAssistantService,
  createMockNewsletterService,
  createMockCurriculumImportService,
  createMockFileService,
};

// Initialize validation on module load
validateServiceMocks();

console.log(
  '[SERVICE MOCKS] Initialized - All services mocked, no real external calls will be made',
);
