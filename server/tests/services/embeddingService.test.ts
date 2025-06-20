import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { EmbeddingService } from '../../src/services/embeddingService';
import { getTestPrismaClient } from '../jest.setup';

// Mock OpenAI
jest.mock('../../src/services/llmService', () => ({
  openai: {
    embeddings: {
      create: jest.fn(),
    },
  },
}));

// Import the mocked openai after mocking
import { openai } from '../../src/services/llmService';

describe('EmbeddingService', () => {
  let embeddingService: EmbeddingService;
  let prisma: ReturnType<typeof getTestPrismaClient>;
  const mockOpenAI = openai as any;

  beforeEach(() => {
    embeddingService = new EmbeddingService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('generateEmbedding', () => {
    const outcomeId = 'outcome-123';
    const text = 'Test outcome description';
    const mockEmbedding = Array(1536).fill(0.1);

    it('should generate and store a new embedding', async () => {
      // Mock no existing embedding
      (mockPrisma.outcomeEmbedding.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Mock OpenAI response
      (mockOpenAI.embeddings.create as jest.Mock).mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
        usage: { total_tokens: 10 },
      });

      // Mock create
      (mockPrisma.outcomeEmbedding.create as jest.Mock).mockResolvedValue({
        outcomeId,
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
      });

      const result = await embeddingService.generateEmbedding(outcomeId, text);

      expect(result).toEqual({
        outcomeId,
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
      });

      expect(mockPrisma.outcomeEmbedding.findUnique).toHaveBeenCalledWith({
        where: { outcomeId },
      });

      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });

      expect(mockPrisma.outcomeEmbedding.create).toHaveBeenCalledWith({
        data: {
          outcomeId,
          embedding: mockEmbedding,
          model: 'text-embedding-3-small',
        },
      });
    });

    it('should return existing embedding if already exists', async () => {
      const existingEmbedding = {
        outcomeId,
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
      };

      (mockPrisma.outcomeEmbedding.findUnique as jest.Mock).mockResolvedValue(existingEmbedding);

      const result = await embeddingService.generateEmbedding(outcomeId, text);

      expect(result).toEqual(existingEmbedding);
      expect(mockOpenAI.embeddings.create).not.toHaveBeenCalled();
      expect(mockPrisma.outcomeEmbedding.create).not.toHaveBeenCalled();
    });

    it('should return null when OpenAI is not configured', async () => {
      // Temporarily set openai to null
      const originalOpenAI = (embeddingService as any).constructor.prototype.generateEmbeddingVector;
      (embeddingService as any).generateEmbeddingVector = async () => null;

      const result = await embeddingService.generateEmbedding(outcomeId, text);

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (mockPrisma.outcomeEmbedding.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await embeddingService.generateEmbedding(outcomeId, text);

      expect(result).toBeNull();
    });
  });

  describe('generateBatchEmbeddings', () => {
    const outcomes = [
      { id: 'outcome-1', text: 'Text 1' },
      { id: 'outcome-2', text: 'Text 2' },
      { id: 'outcome-3', text: 'Text 3' },
    ];

    it('should process outcomes in batches', async () => {
      // Mock no existing embeddings
      (mockPrisma.outcomeEmbedding.findMany as jest.Mock).mockResolvedValue([]);
      
      // Mock OpenAI batch response
      (mockOpenAI.embeddings.create as jest.Mock).mockResolvedValue({
        data: outcomes.map(() => ({ embedding: Array(1536).fill(0.1) })),
        usage: { total_tokens: 30 },
      });

      // Mock createMany
      (mockPrisma.outcomeEmbedding.createMany as jest.Mock).mockResolvedValue({ count: 3 });

      const results = await embeddingService.generateBatchEmbeddings(outcomes);

      expect(results).toHaveLength(3);
      expect(mockPrisma.outcomeEmbedding.findMany).toHaveBeenCalled();
      expect(mockOpenAI.embeddings.create).toHaveBeenCalled();
      expect(mockPrisma.outcomeEmbedding.createMany).toHaveBeenCalled();
    });

    it('should skip outcomes with existing embeddings', async () => {
      // Mock one existing embedding
      (mockPrisma.outcomeEmbedding.findMany as jest.Mock).mockResolvedValue([
        {
          outcomeId: 'outcome-1',
          embedding: Array(1536).fill(0.1),
          model: 'text-embedding-3-small',
        },
      ]);

      // Mock OpenAI response for remaining outcomes
      (mockOpenAI.embeddings.create as jest.Mock).mockResolvedValue({
        data: [
          { embedding: Array(1536).fill(0.2) },
          { embedding: Array(1536).fill(0.3) },
        ],
        usage: { total_tokens: 20 },
      });

      (mockPrisma.outcomeEmbedding.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const results = await embeddingService.generateBatchEmbeddings(outcomes);

      expect(results).toHaveLength(3);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: ['Text 2', 'Text 3'],
        encoding_format: 'float',
      });
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [0, 1, 0];
      
      const similarity = embeddingService.calculateSimilarity(embedding1, embedding2);
      
      expect(similarity).toBe(0); // Orthogonal vectors
    });

    it('should return 1 for identical embeddings', () => {
      const embedding = [0.5, 0.5, 0.5];
      
      const similarity = embeddingService.calculateSimilarity(embedding, embedding);
      
      expect(similarity).toBeCloseTo(1, 10);
    });

    it('should handle zero vectors', () => {
      const embedding1 = [0, 0, 0];
      const embedding2 = [1, 1, 1];
      
      const similarity = embeddingService.calculateSimilarity(embedding1, embedding2);
      
      expect(similarity).toBe(0);
    });

    it('should throw error for embeddings of different lengths', () => {
      const embedding1 = [1, 2, 3];
      const embedding2 = [1, 2];
      
      expect(() => {
        embeddingService.calculateSimilarity(embedding1, embedding2);
      }).toThrow('Embeddings must have the same length');
    });
  });

  describe('findSimilarOutcomes', () => {
    const targetOutcomeId = 'outcome-target';
    const targetEmbedding = [1, 0, 0];

    it('should find similar outcomes above threshold', async () => {
      // Mock target embedding
      (mockPrisma.outcomeEmbedding.findUnique as jest.Mock).mockResolvedValue({
        embedding: targetEmbedding,
      });

      // Mock all embeddings
      (mockPrisma.outcomeEmbedding.findMany as jest.Mock).mockResolvedValue([
        { outcomeId: 'outcome-1', embedding: [0.9, 0.1, 0] },
        { outcomeId: 'outcome-2', embedding: [0, 1, 0] },
        { outcomeId: 'outcome-3', embedding: [0.95, 0.05, 0] },
      ]);

      const results = await embeddingService.findSimilarOutcomes(targetOutcomeId, 0.8, 10);

      expect(results).toHaveLength(2); // Only outcomes 1 and 3 are similar enough
      expect(results[0].outcomeId).toBe('outcome-3'); // Higher similarity first
      expect(results[1].outcomeId).toBe('outcome-1');
    });

    it('should return empty array if target embedding not found', async () => {
      (mockPrisma.outcomeEmbedding.findUnique as jest.Mock).mockResolvedValue(null);

      const results = await embeddingService.findSimilarOutcomes(targetOutcomeId, 0.8, 10);

      expect(results).toEqual([]);
    });

    it('should limit results to specified limit', async () => {
      (mockPrisma.outcomeEmbedding.findUnique as jest.Mock).mockResolvedValue({
        embedding: targetEmbedding,
      });

      // Mock many similar embeddings
      const manyEmbeddings = Array(20).fill(null).map((_, i) => ({
        outcomeId: `outcome-${i}`,
        embedding: [0.9 + i * 0.001, 0.1, 0], // Slightly different similarities
      }));

      (mockPrisma.outcomeEmbedding.findMany as jest.Mock).mockResolvedValue(manyEmbeddings);

      const results = await embeddingService.findSimilarOutcomes(targetOutcomeId, 0.8, 5);

      expect(results).toHaveLength(5);
    });
  });

  describe('cleanupOldEmbeddings', () => {
    it('should delete embeddings for different models', async () => {
      (mockPrisma.outcomeEmbedding.deleteMany as jest.Mock).mockResolvedValue({ count: 10 });

      const count = await embeddingService.cleanupOldEmbeddings('text-embedding-3-small');

      expect(count).toBe(10);
      expect(mockPrisma.outcomeEmbedding.deleteMany).toHaveBeenCalledWith({
        where: { model: { not: 'text-embedding-3-small' } },
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      (mockPrisma.outcomeEmbedding.deleteMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const count = await embeddingService.cleanupOldEmbeddings('text-embedding-3-small');

      expect(count).toBe(0);
    });
  });

  describe('getEmbedding', () => {
    it('should retrieve embedding from database', async () => {
      const mockEmbedding = Array(1536).fill(0.1);
      (mockPrisma.outcomeEmbedding.findUnique as jest.Mock).mockResolvedValue({
        embedding: mockEmbedding,
      });

      const result = await embeddingService.getEmbedding('outcome-123');

      expect(result).toEqual(mockEmbedding);
    });

    it('should return null if embedding not found', async () => {
      (mockPrisma.outcomeEmbedding.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await embeddingService.getEmbedding('outcome-123');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      (mockPrisma.outcomeEmbedding.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await embeddingService.getEmbedding('outcome-123');

      expect(result).toBeNull();
    });
  });
});