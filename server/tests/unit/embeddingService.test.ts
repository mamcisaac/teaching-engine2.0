// Mock OpenAI FIRST - this must be at the top level for Jest hoisting
const mockEmbeddingsCreate = jest.fn();
const mockChatCreate = jest.fn();

jest.mock('openai', () => {
  const mockInstance = {
    embeddings: {
      create: mockEmbeddingsCreate,
    },
    chat: {
      completions: {
        create: mockChatCreate,
      },
    },
  };

  const MockConstructor = jest.fn().mockImplementation(() => mockInstance);
  return {
    __esModule: true,
    default: MockConstructor,
    OpenAI: MockConstructor,
  };
});

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';
import { MockFunction, ensureMockFunction } from '../helpers/mock-types.js';
import { createMockEmbeddingResponse, MOCK_EMBEDDING_DATA } from '../mocks/openai.mock.js';
import {
  getMocks,
  setupMocks,
  resetMocks,
  mockPrismaClient as mockPrisma,
} from '../setup/unified-mock-setup.js';

// Import the service after mocks are set up
import { EmbeddingService } from '../../src/services/embeddingService.js';
import { openai } from '../../src/services/llmService.js';

describe('EmbeddingService', () => {
  let service: EmbeddingService;
  let mockEmbeddingCreate: MockFunction<any>;

  beforeEach(() => {
    // Set up unified mocks for database
    setupMocks();

    // Clear all mock calls from previous tests
    jest.clearAllMocks();

    // Use the mock function defined at the top level
    mockEmbeddingCreate = mockEmbeddingsCreate;

    // Setup default embedding response
    mockEmbeddingCreate.mockResolvedValue(createMockEmbeddingResponse(1));

    service = new EmbeddingService();

    // Setup default mock responses for curriculumExpectationEmbedding
    const embeddingModel = mockPrisma.curriculumExpectationEmbedding;
    embeddingModel.createMany.mockResolvedValue({ count: 0 });

    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as any);

    embeddingModel.findUnique.mockResolvedValue(null);
    embeddingModel.create.mockResolvedValue({
      expectationId: 'test-id',
      embedding: MOCK_EMBEDDING_DATA,
      model: 'text-embedding-3-small',
    } as any);
    embeddingModel.findMany.mockResolvedValue([]);
    embeddingModel.deleteMany.mockResolvedValue({ count: 0 });

    // Setup curriculum expectation model
    const expectationModel = mockPrisma.curriculumExpectation;
    expectationModel.findMany.mockResolvedValue([]);
    expectationModel.findUnique.mockResolvedValue(null);

    mockPrisma.$queryRaw.mockResolvedValue([]);
  });

  afterEach(() => {
    resetMocks();
    if (mockEmbeddingCreate) {
      mockEmbeddingCreate.mockClear();
    }
  });

  describe('isEmbeddingServiceAvailable', () => {
    it('should return true when OpenAI is available', () => {
      const result = service.isEmbeddingServiceAvailable();
      expect(result).toBe(true);
    });
  });

  describe('generateEmbedding', () => {
    it('should generate embedding for new expectation', async () => {
      // Setup mocks for new embedding generation
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(null);
      mockPrisma.curriculumExpectationEmbedding.create.mockResolvedValue({
        expectationId: 'exp-123',
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
        model: 'text-embedding-3-small',
      } as any);

      const result = await service.generateEmbedding(
        'exp-123',
        'Mathematics: Students will understand addition',
      );

      expect(result).toEqual({
        expectationId: 'exp-123',
        embedding: MOCK_EMBEDDING_DATA,
        model: 'text-embedding-3-small',
      });
      expect(mockEmbeddingCreate).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'Mathematics: Students will understand addition',
        encoding_format: 'float',
      });
    });

    it('should return existing embedding if already exists', async () => {
      const existingEmbedding = {
        expectationId: 'exp-123',
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
        model: 'text-embedding-3-small',
      };

      // Reset the mock completely and setup fresh return value
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockReset();
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(
        existingEmbedding as any,
      );

      // Also reset and track OpenAI calls
      mockEmbeddingCreate.mockReset();

      const result = await service.generateEmbedding('exp-123', 'Some text');

      // The service returns the existing embedding from the database
      expect(result).toEqual({
        expectationId: 'exp-123',
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
        model: 'text-embedding-3-small',
      });
      expect(mockEmbeddingCreate).not.toHaveBeenCalled();
    });

    it('should handle OpenAI API errors with retry', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(null);

      // First two calls fail, third succeeds
      (mockedOpenAI as any).embeddings.create
        .mockRejectedValueOnce(new Error('Rate limit'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          data: [{ embedding: [0.1, 0.2, 0.3] }],
          usage: { total_tokens: 5 },
        } as any);

      mockPrisma.curriculumExpectationEmbedding.create.mockResolvedValue({
        expectationId: 'exp-123',
        embedding: [0.1, 0.2, 0.3],
        model: 'text-embedding-3-small',
      } as any);

      const result = await service.generateEmbedding('exp-123', 'Test text');

      expect(result).toBeDefined();
      expect(mockedOpenAI.embeddings.create).toHaveBeenCalledTimes(3);
    });

    it('should return null when all retries fail', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(null);
      (mockedOpenAI as any).embeddings.create.mockRejectedValue(new Error('Persistent error'));

      const result = await service.generateEmbedding('exp-123', 'Test text');

      expect(result).toBeNull();
      expect(mockedOpenAI.embeddings.create).toHaveBeenCalledTimes(3); // maxRetries
    });
  });

  describe('getEmbedding', () => {
    it('should retrieve existing embedding', async () => {
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5];

      // Reset and setup mock specifically for this test
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockReset();
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue({
        expectationId: 'exp-123',
        embedding,
        model: 'text-embedding-3-small',
      } as any);

      const result = await service.getEmbedding('exp-123');

      expect(result).toEqual(embedding);
    });

    it('should return null for non-existent embedding', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(null);

      const result = await service.getEmbedding('exp-123');

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.getEmbedding('exp-123');

      expect(result).toBeNull();
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [0, 1, 0];
      const embedding3 = [1, 0, 0]; // Same as embedding1

      const similarity1_2 = service.calculateSimilarity(embedding1, embedding2);
      const similarity1_3 = service.calculateSimilarity(embedding1, embedding3);

      expect(similarity1_2).toBe(0); // Orthogonal vectors
      expect(similarity1_3).toBe(1); // Identical vectors
    });

    it('should handle normalized vectors', () => {
      const embedding1 = [0.6, 0.8]; // Normalized vector
      const embedding2 = [0.8, 0.6]; // Another normalized vector

      const similarity = service.calculateSimilarity(embedding1, embedding2);

      expect(similarity).toBeCloseTo(0.96, 2); // cos(θ) where θ is small
    });

    it('should handle zero vectors', () => {
      const embedding1 = [0, 0, 0];
      const embedding2 = [1, 2, 3];

      const similarity = service.calculateSimilarity(embedding1, embedding2);

      expect(similarity).toBe(0);
    });

    it('should throw error for mismatched dimensions', () => {
      const embedding1 = [1, 2, 3];
      const embedding2 = [1, 2]; // Different length

      expect(() => service.calculateSimilarity(embedding1, embedding2)).toThrow(
        'Embeddings must have the same length',
      );
    });
  });

  describe('generateBatchEmbeddings', () => {
    it('should generate embeddings for multiple expectations', async () => {
      const expectations = [
        { id: 'exp-1', text: 'Math: Addition' },
        { id: 'exp-2', text: 'Science: Gravity' },
        { id: 'exp-3', text: 'English: Reading' },
      ];

      mockPrisma.curriculumExpectationEmbedding.findMany.mockResolvedValue([]);
      mockedOpenAI.embeddings.create.mockResolvedValue({
        data: [
          { embedding: [0.1, 0.2, 0.3] },
          { embedding: [0.4, 0.5, 0.6] },
          { embedding: [0.7, 0.8, 0.9] },
        ],
        usage: { total_tokens: 30 },
      } as any);
      mockPrisma.curriculumExpectationEmbedding.createMany.mockResolvedValue({ count: 3 } as any);

      const results = await service.generateBatchEmbeddings(expectations);

      expect(results).toHaveLength(3);
      expect(results[0].expectationId).toBe('exp-1');
      expect(results[1].expectationId).toBe('exp-2');
      expect(results[2].expectationId).toBe('exp-3');
      expect(mockPrisma.curriculumExpectationEmbedding.createMany).toHaveBeenCalled();
    });

    it('should handle batching with existing embeddings', async () => {
      const expectations = [
        { id: 'exp-1', text: 'Math: Addition' },
        { id: 'exp-2', text: 'Science: Gravity' },
      ];

      // Mock existing embedding for exp-1
      mockPrisma.curriculumExpectationEmbedding.findMany.mockResolvedValue([
        {
          expectationId: 'exp-1',
          embedding: [0.9, 0.8, 0.7],
          model: 'text-embedding-3-small',
        },
      ] as any);

      // Only exp-2 should be processed
      mockedOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: [0.4, 0.5, 0.6] }],
        usage: { total_tokens: 10 },
      } as any);
      mockPrisma.curriculumExpectationEmbedding.createMany.mockResolvedValue({ count: 1 } as any);

      const results = await service.generateBatchEmbeddings(expectations);

      expect(results).toHaveLength(2);
      expect(results.find((r) => r.expectationId === 'exp-1')).toBeDefined();
      expect(results.find((r) => r.expectationId === 'exp-2')).toBeDefined();
      expect(mockedOpenAI.embeddings.create).toHaveBeenCalledWith(
        expect.objectContaining({
          input: ['Science: Gravity'], // Only new item
        }),
      );
    });
  });

  describe('findSimilarExpectations', () => {
    it('should find similar expectations above threshold', async () => {
      const targetEmbedding = [1, 0, 0];
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue({
        expectationId: 'target-exp',
        embedding: targetEmbedding,
        model: 'text-embedding-3-small',
      } as any);

      mockPrisma.curriculumExpectationEmbedding.findMany.mockResolvedValue([
        {
          expectationId: 'similar-exp-1',
          embedding: [0.9, 0.1, 0], // High similarity
          expectation: {
            id: 'similar-exp-1',
            code: 'M1.A1',
            description: 'Similar math concept',
            subject: 'Math',
            grade: 1,
          },
        },
        {
          expectationId: 'dissimilar-exp',
          embedding: [0, 1, 0], // Low similarity
          expectation: {
            id: 'dissimilar-exp',
            code: 'S1.A1',
            description: 'Different science concept',
            subject: 'Science',
            grade: 1,
          },
        },
        {
          expectationId: 'similar-exp-2',
          embedding: [0.85, 0.15, 0], // High similarity
          expectation: {
            id: 'similar-exp-2',
            code: 'M1.A2',
            description: 'Another similar math concept',
            subject: 'Math',
            grade: 1,
          },
        },
      ] as any);

      const results = await service.findSimilarExpectations('target-exp', 0.8, 5);

      expect(results).toHaveLength(2); // Only high similarity ones
      expect(results[0].expectationId).toBe('similar-exp-1'); // Highest similarity first
      expect(results[0].similarity).toBeGreaterThan(0.8);
      expect(results[1].expectationId).toBe('similar-exp-2');
      expect(results[1].similarity).toBeGreaterThan(0.8);
    });

    it('should return empty array when target embedding not found', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(null);

      const results = await service.findSimilarExpectations('non-existent', 0.8, 5);

      expect(results).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      const results = await service.findSimilarExpectations('target-exp', 0.8, 5);

      expect(results).toEqual([]);
    });
  });

  describe('generateMissingEmbeddings', () => {
    it('should generate embeddings for expectations without them', async () => {
      const expectationsWithoutEmbeddings = [
        { id: 'exp-1', code: 'M1.A1', description: 'Addition basics' },
        { id: 'exp-2', code: 'S1.B1', description: 'Plant growth' },
      ];

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(
        expectationsWithoutEmbeddings as any,
      );

      // Mock successful batch embedding generation
      mockPrisma.curriculumExpectationEmbedding.findMany.mockResolvedValue([]);
      mockedOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3] }, { embedding: [0.4, 0.5, 0.6] }],
        usage: { total_tokens: 20 },
      } as any);
      mockPrisma.curriculumExpectationEmbedding.createMany.mockResolvedValue({ count: 2 } as any);

      const count = await service.generateMissingEmbeddings();

      expect(count).toBe(2);
      expect(mockPrisma.curriculumExpectation.findMany).toHaveBeenCalledWith({
        where: { embedding: null },
        select: { id: true, code: true, description: true },
      });
    });

    it('should return 0 when no expectations need embeddings', async () => {
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([]);

      const count = await service.generateMissingEmbeddings();

      expect(count).toBe(0);
    });
  });

  describe('searchExpectationsByText', () => {
    it('should search expectations by text similarity', async () => {
      const searchText = 'mathematical operations';

      mockedOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: [0.7, 0.3, 0.1] }],
        usage: { total_tokens: 5 },
      } as any);

      mockPrisma.curriculumExpectationEmbedding.findMany.mockResolvedValue([
        {
          expectationId: 'math-exp-1',
          embedding: [0.8, 0.2, 0.1], // High similarity
          expectation: {
            id: 'math-exp-1',
            code: 'M3.N1',
            description: 'Addition and subtraction operations',
            subject: 'Math',
            grade: 3,
          },
        },
        {
          expectationId: 'science-exp-1',
          embedding: [0.1, 0.2, 0.9], // Low similarity
          expectation: {
            id: 'science-exp-1',
            code: 'S3.L1',
            description: 'Living organisms classification',
            subject: 'Science',
            grade: 3,
          },
        },
      ] as any);

      const results = await service.searchExpectationsByText(searchText, 20, 0.7);

      expect(results).toHaveLength(1); // Only high similarity result
      expect(results[0].expectationId).toBe('math-exp-1');
      expect(results[0].similarity).toBeGreaterThan(0.7);
    });

    it('should handle OpenAI API errors', async () => {
      mockedOpenAI.embeddings.create.mockRejectedValue(new Error('API error'));

      const results = await service.searchExpectationsByText('test', 10, 0.7);

      expect(results).toEqual([]);
    });
  });

  describe('getOrCreateExpectationEmbedding', () => {
    it('should return existing embedding if found', async () => {
      const existingEmbedding = {
        expectationId: 'exp-123',
        embedding: [0.1, 0.2, 0.3],
        model: 'text-embedding-3-small',
      };
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(
        existingEmbedding as any,
      );

      const result = await service.getOrCreateExpectationEmbedding('exp-123');

      expect(result).toEqual({
        expectationId: 'exp-123',
        embedding: [0.1, 0.2, 0.3],
        model: 'text-embedding-3-small',
      });
      expect(mockedOpenAI.embeddings.create).not.toHaveBeenCalled();
    });

    it('should create new embedding if not found', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(null);
      mockPrisma.curriculumExpectation.findUnique.mockResolvedValue({
        id: 'exp-123',
        code: 'M1.A1',
        description: 'Basic addition',
      } as any);

      mockPrisma.curriculumExpectationEmbedding.create.mockResolvedValue({
        expectationId: 'exp-123',
        embedding: [0.1, 0.2, 0.3],
        model: 'text-embedding-3-small',
      } as any);

      const result = await service.getOrCreateExpectationEmbedding('exp-123');

      expect(result).toBeDefined();
      expect(result?.expectationId).toBe('exp-123');
      expect(mockedOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'M1.A1: Basic addition',
        encoding_format: 'float',
      });
    });

    it('should handle non-existent expectations', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(null);
      mockPrisma.curriculumExpectation.findUnique.mockResolvedValue(null);

      await expect(service.getOrCreateExpectationEmbedding('non-existent')).rejects.toThrow(
        'Expectation non-existent not found',
      );
    });
  });

  describe('cleanupOldEmbeddings', () => {
    it('should delete embeddings with old models', async () => {
      mockPrisma.curriculumExpectationEmbedding.deleteMany.mockResolvedValue({ count: 5 } as any);

      const deletedCount = await service.cleanupOldEmbeddings('text-embedding-3-small');

      expect(deletedCount).toBe(5);
      expect(mockPrisma.curriculumExpectationEmbedding.deleteMany).toHaveBeenCalledWith({
        where: { model: { not: 'text-embedding-3-small' } },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.curriculumExpectationEmbedding.deleteMany.mockRejectedValue(
        new Error('Database error'),
      );

      const deletedCount = await service.cleanupOldEmbeddings('text-embedding-3-small');

      expect(deletedCount).toBe(0);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed embedding data', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue({
        expectationId: 'exp-123',
        embedding: 'invalid-data' as any, // Not an array
        model: 'text-embedding-3-small',
      } as any);

      const result = await service.getEmbedding('exp-123');

      // Should handle gracefully, returning whatever is stored
      expect(result).toBe('invalid-data');
    });

    it('should handle concurrent embedding generation safely', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValue(null);
      mockPrisma.curriculumExpectationEmbedding.create.mockImplementation(async (args: any) => ({
        expectationId: args.data.expectationId,
        embedding: args.data.embedding,
        model: args.data.model,
      }));

      // Setup OpenAI responses for concurrent requests
      mockedOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: [0.1, 0.2, 0.3, 0.4, 0.5] }],
        usage: { total_tokens: 10 },
      } as any);

      // Generate multiple embeddings concurrently
      const promises = Array.from({ length: 5 }, (_, i) =>
        service.generateEmbedding(`exp-${i + 1}`, `Text ${i + 1}`),
      );

      const results = await Promise.all(promises);

      expect(results.every((r) => r !== null)).toBe(true);
      expect(results).toHaveLength(5);
    });
  });

  describe('performance optimization', () => {
    it('should efficiently handle similarity calculations for large datasets', () => {
      const largeEmbedding1 = Array.from({ length: 1536 }, (_, i) => Math.sin(i * 0.1));
      const largeEmbedding2 = Array.from({ length: 1536 }, (_, i) => Math.cos(i * 0.1));

      const startTime = Date.now();
      const similarity = service.calculateSimilarity(largeEmbedding1, largeEmbedding2);
      const endTime = Date.now();

      expect(similarity).toBeCloseTo(0, 1); // sin and cos are orthogonal
      expect(endTime - startTime).toBeLessThan(100); // Should be fast
    });
  });
});
