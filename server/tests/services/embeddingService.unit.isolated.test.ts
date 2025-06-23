import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { EmbeddingService } from '@/services/embeddingService';

// Create manual mocks for dependencies
const mockPrisma = {
  outcomeEmbedding: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
  },
};

const mockOpenAI = {
  embeddings: {
    create: jest.fn(),
  },
  chat: {
    completions: {
      create: jest.fn(),
    },
  },
};

// Mock the modules
jest.mock('@/prisma', () => ({
  prisma: mockPrisma,
}));

jest.mock('@/services/llmService', () => ({
  openai: mockOpenAI,
}));

describe('EmbeddingService Unit Tests', () => {
  let embeddingService: EmbeddingService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create service instance
    embeddingService = new EmbeddingService();
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

    it('should calculate similarity for real-world embeddings', () => {
      // Simulated embeddings for similar concepts
      const mathEmbedding1 = [0.8, 0.2, 0.1, 0.05];
      const mathEmbedding2 = [0.75, 0.25, 0.15, 0.1];

      const similarity = embeddingService.calculateSimilarity(mathEmbedding1, mathEmbedding2);

      expect(similarity).toBeGreaterThan(0.9); // High similarity
    });
  });

  describe('generateEmbedding', () => {
    const outcomeId = 'outcome-123';
    const text = 'Test outcome description';
    const mockEmbedding = Array(1536).fill(0.1);

    it('should generate and store a new embedding', async () => {
      // Mock no existing embedding
      mockPrisma.outcomeEmbedding.findUnique.mockResolvedValue(null);

      // Mock OpenAI response
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: mockEmbedding }],
        usage: { total_tokens: 10 },
      });

      // Mock create
      mockPrisma.outcomeEmbedding.create.mockResolvedValue({
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
    });

    it('should return existing embedding if already exists', async () => {
      const existingEmbedding = {
        outcomeId,
        embedding: mockEmbedding,
        model: 'text-embedding-3-small',
      };

      mockPrisma.outcomeEmbedding.findUnique.mockResolvedValue(existingEmbedding);

      const result = await embeddingService.generateEmbedding(outcomeId, text);

      expect(result).toEqual(existingEmbedding);
      expect(mockOpenAI.embeddings.create).not.toHaveBeenCalled();
      expect(mockPrisma.outcomeEmbedding.create).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockPrisma.outcomeEmbedding.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await embeddingService.generateEmbedding(outcomeId, text);

      expect(result).toBeNull();
    });
  });

  describe('findSimilarOutcomes', () => {
    const targetOutcomeId = 'outcome-target';
    const targetEmbedding = [1, 0, 0];

    it('should find similar outcomes above threshold', async () => {
      // Mock getting target embedding
      mockPrisma.outcomeEmbedding.findUnique.mockResolvedValue({
        embedding: targetEmbedding,
      });

      // Mock all embeddings
      mockPrisma.outcomeEmbedding.findMany.mockResolvedValue([
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
      mockPrisma.outcomeEmbedding.findUnique.mockResolvedValue(null);

      const results = await embeddingService.findSimilarOutcomes(targetOutcomeId, 0.8, 10);

      expect(results).toEqual([]);
    });

    it('should respect the limit parameter', async () => {
      mockPrisma.outcomeEmbedding.findUnique.mockResolvedValue({
        embedding: targetEmbedding,
      });

      // Mock many similar embeddings
      const manyEmbeddings = Array(20)
        .fill(null)
        .map((_, i) => ({
          outcomeId: `outcome-${i}`,
          embedding: [0.9 - i * 0.01, 0.1, 0], // Slightly different similarities
        }));

      mockPrisma.outcomeEmbedding.findMany.mockResolvedValue(manyEmbeddings);

      const results = await embeddingService.findSimilarOutcomes(targetOutcomeId, 0.7, 5);

      expect(results).toHaveLength(5);
      // Check they are sorted by similarity
      expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
    });
  });

  describe('generateBatchEmbeddings', () => {
    const outcomes = [
      { id: 'outcome-1', text: 'Text 1' },
      { id: 'outcome-2', text: 'Text 2' },
      { id: 'outcome-3', text: 'Text 3' },
    ];

    it('should process new outcomes in batch', async () => {
      // Mock no existing embeddings
      mockPrisma.outcomeEmbedding.findMany.mockResolvedValue([]);

      // Mock OpenAI batch response
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: outcomes.map(() => ({ embedding: Array(1536).fill(0.1) })),
        usage: { total_tokens: 30 },
      });

      // Mock createMany
      mockPrisma.outcomeEmbedding.createMany.mockResolvedValue({ count: 3 });

      const results = await embeddingService.generateBatchEmbeddings(outcomes);

      expect(results).toHaveLength(3);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: ['Text 1', 'Text 2', 'Text 3'],
        encoding_format: 'float',
      });
    });

    it('should skip outcomes with existing embeddings', async () => {
      // Mock one existing embedding
      mockPrisma.outcomeEmbedding.findMany.mockResolvedValue([
        {
          outcomeId: 'outcome-1',
          embedding: Array(1536).fill(0.1),
          model: 'text-embedding-3-small',
        },
      ]);

      // Mock OpenAI response for remaining outcomes
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: [{ embedding: Array(1536).fill(0.2) }, { embedding: Array(1536).fill(0.3) }],
        usage: { total_tokens: 20 },
      });

      mockPrisma.outcomeEmbedding.createMany.mockResolvedValue({ count: 2 });

      const results = await embeddingService.generateBatchEmbeddings(outcomes);

      expect(results).toHaveLength(3); // 1 existing + 2 new
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: ['Text 2', 'Text 3'],
        encoding_format: 'float',
      });
    });

    it('should handle batches larger than API limit', async () => {
      // Create 150 outcomes (more than batch size of 100)
      const manyOutcomes = Array(150)
        .fill(null)
        .map((_, i) => ({
          id: `outcome-${i}`,
          text: `Text ${i}`,
        }));

      mockPrisma.outcomeEmbedding.findMany.mockResolvedValue([]);
      mockOpenAI.embeddings.create.mockResolvedValue({
        data: Array(100).fill({ embedding: Array(1536).fill(0.1) }),
        usage: { total_tokens: 1000 },
      });
      mockPrisma.outcomeEmbedding.createMany.mockResolvedValue({ count: 100 });

      await embeddingService.generateBatchEmbeddings(manyOutcomes);

      // Should be called twice (100 + 50)
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('getEmbedding', () => {
    it('should retrieve embedding from database', async () => {
      const mockEmbedding = Array(1536).fill(0.1);
      mockPrisma.outcomeEmbedding.findUnique.mockResolvedValue({
        embedding: mockEmbedding,
      });

      const result = await embeddingService.getEmbedding('outcome-123');

      expect(result).toEqual(mockEmbedding);
    });

    it('should return null if embedding not found', async () => {
      mockPrisma.outcomeEmbedding.findUnique.mockResolvedValue(null);

      const result = await embeddingService.getEmbedding('outcome-123');

      expect(result).toBeNull();
    });
  });

  describe('cleanupOldEmbeddings', () => {
    it('should delete embeddings for different models', async () => {
      mockPrisma.outcomeEmbedding.deleteMany.mockResolvedValue({ count: 10 });

      const count = await embeddingService.cleanupOldEmbeddings('text-embedding-3-small');

      expect(count).toBe(10);
      expect(mockPrisma.outcomeEmbedding.deleteMany).toHaveBeenCalledWith({
        where: { model: { not: 'text-embedding-3-small' } },
      });
    });

    it('should handle cleanup errors gracefully', async () => {
      mockPrisma.outcomeEmbedding.deleteMany.mockRejectedValue(new Error('Database error'));

      const count = await embeddingService.cleanupOldEmbeddings('text-embedding-3-small');

      expect(count).toBe(0);
    });
  });
});
