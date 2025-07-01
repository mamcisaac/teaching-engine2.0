import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';
import { EmbeddingService } from '../../src/services/embeddingService';

// Lightweight mocks for faster execution
const mockEmbedding = new Array(1536).fill(0.1); // Consistent mock embedding

const mockOpenAI = {
  embeddings: {
    create: jest.fn().mockResolvedValue(
      MockRegistry.openai.embedding({
        data: [{ embedding: mockEmbedding, index: 0 }],
        usage: { prompt_tokens: 10, total_tokens: 10 },
      }),
    ),
  },
};

const mockPrisma = {
  curriculumExpectationEmbedding: {
    findUnique: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id: 1, embedding: mockEmbedding }),
    findMany: jest.fn().mockResolvedValue([]),
    createMany: jest.fn().mockResolvedValue({ count: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
  },
  curriculumExpectation: {
    findMany: jest
      .fn()
      .mockResolvedValue([
        { id: 'test-1', title: 'Test Outcome 1', description: 'Test description' },
      ]),
  },
};

jest.mock('../../src/services/llmService', () => ({ openai: mockOpenAI }));

// Mock the service with lightweight database mock
jest.mock('../../src/services/embeddingService', () => {
  const originalModule = jest.requireActual('../../src/services/embeddingService');

  return {
    ...originalModule,
    EmbeddingService: class extends originalModule.EmbeddingService {
      get prisma() {
        return mockPrisma;
      }
    },
  };
});

describe('EmbeddingService - Fast Tests', () => {
  let service: EmbeddingService;

  beforeEach(() => {
    service = new EmbeddingService();
    jest.clearAllMocks();

    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as any);
  });

  describe('Core functionality', () => {
    it('should generate embeddings', async () => {
      const result = await service.generateEmbedding('test-outcome-1');

      expect(result).toEqual({
        outcomeId: 'test-outcome-1',
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
      });
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledTimes(1);
    });

    it('should calculate similarity between embeddings', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [0, 1, 0];
      const embedding3 = [1, 0, 0];

      const similarity1 = service.calculateSimilarity(embedding1, embedding2);
      const similarity2 = service.calculateSimilarity(embedding1, embedding3);

      expect(similarity1).toBeLessThan(similarity2);
      expect(similarity2).toBe(1); // Perfect match
    });

    it('should find similar outcomes', async () => {
      mockPrisma.curriculumExpectationEmbedding.findMany.mockResolvedValue([
        { outcomeId: 'similar-1', embedding: mockEmbedding },
        { outcomeId: 'similar-2', embedding: mockEmbedding },
      ]);

      const results = await service.findSimilarOutcomes('test-outcome', 0.8, 5);

      expect(results).toHaveLength(2);
      expect(mockPrisma.curriculumExpectationEmbedding.findMany).toHaveBeenCalled();
    });

    it('should check if service is available', () => {
      expect(service.isEmbeddingServiceAvailable()).toBe(true);
    });
  });

  describe('Batch operations', () => {
    it('should generate batch embeddings', async () => {
      const outcomes = ['outcome-1', 'outcome-2'];

      const results = await service.generateBatchEmbeddings(outcomes);

      expect(results).toHaveLength(2);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledTimes(2);
    });

    it('should generate missing embeddings', async () => {
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([
        { id: 'missing-1', title: 'Missing 1' },
        { id: 'missing-2', title: 'Missing 2' },
      ]);

      const count = await service.generateMissingEmbeddings();

      expect(count).toBe(2);
      expect(mockPrisma.curriculumExpectationEmbedding.createMany).toHaveBeenCalled();
    });
  });

  describe('Search functionality', () => {
    it('should search outcomes by text', async () => {
      const searchResults = await service.searchOutcomesByText('math addition', 5, 0.7);

      expect(Array.isArray(searchResults)).toBe(true);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle OpenAI API errors gracefully', async () => {
      mockOpenAI.embeddings.create.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.generateEmbedding('test')).rejects.toThrow('API Error');
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.curriculumExpectationEmbedding.findUnique.mockRejectedValueOnce(
        new Error('DB Error'),
      );

      await expect(service.getOrCreateOutcomeEmbedding('test')).rejects.toThrow('DB Error');
    });
  });
});
