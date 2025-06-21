import { jest } from '@jest/globals';
import * as embeddingService from '../embeddingService';

// Mock dependencies
jest.mock('@teaching-engine/database', () => {
  const mockPrismaClient = {
    outcomeEmbedding: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    outcome: {
      findMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      embeddings: {
        create: jest.fn().mockResolvedValue({
          data: [
            {
              embedding: Array(1536)
                .fill(0)
                .map(() => Math.random()),
            },
          ],
        }),
      },
    })),
  };
});

jest.mock('@/logger', () => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('EmbeddingService', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked PrismaClient instance
    const { PrismaClient } = jest.requireMock('@teaching-engine/database');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prisma = new PrismaClient() as any;
    // Set up OpenAI API key for tests
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('getOrCreateOutcomeEmbedding', () => {
    const mockOutcome = {
      id: 'outcome-1',
      subject: 'Mathematics',
      grade: 3,
      code: 'M3.1.2',
      description: 'Count to 100 by 2s, 5s, and 10s',
      domain: 'Number Sense',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return existing embedding if found', async () => {
      const mockEmbedding = {
        id: 'embedding-1',
        outcomeId: 'outcome-1',
        embedding: JSON.stringify(Array(1536).fill(0.5)),
        model: 'text-embedding-3-small',
        dimensions: 1536,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.outcomeEmbedding.findUnique.mockResolvedValue(mockEmbedding);

      const result = await embeddingService.getOrCreateOutcomeEmbedding(mockOutcome);

      expect(result).toEqual(mockEmbedding);
      expect(prisma.outcomeEmbedding.findUnique).toHaveBeenCalledWith({
        where: { outcomeId: 'outcome-1' },
      });
      expect(prisma.outcomeEmbedding.create).not.toHaveBeenCalled();
    });

    it('should create new embedding if not found', async () => {
      const mockEmbedding = {
        id: 'embedding-2',
        outcomeId: 'outcome-1',
        embedding: JSON.stringify(Array(1536).fill(0.5)),
        model: 'text-embedding-3-small',
        dimensions: 1536,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.outcomeEmbedding.findUnique.mockResolvedValue(null);
      prisma.outcomeEmbedding.create.mockResolvedValue(mockEmbedding);

      const result = await embeddingService.getOrCreateOutcomeEmbedding(mockOutcome);

      expect(result).toEqual(mockEmbedding);
      expect(prisma.outcomeEmbedding.create).toHaveBeenCalledWith({
        data: {
          outcomeId: 'outcome-1',
          embedding: expect.any(String),
          model: 'text-embedding-3-small',
          dimensions: 1536,
        },
      });
    });

    it('should throw error if OpenAI is not configured', async () => {
      delete process.env.OPENAI_API_KEY;

      // Force module re-evaluation to pick up missing API key
      jest.resetModules();
      const { embeddingService: embeddingServiceNoKey } = await import('../embeddingService');

      prisma.outcomeEmbedding.findUnique.mockResolvedValue(null);

      await expect(embeddingServiceNoKey.getOrCreateOutcomeEmbedding(mockOutcome)).rejects.toThrow(
        'OpenAI API key not configured',
      );
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const vector1 = [1, 0, 0];
      const vector2 = [0, 1, 0];
      const vector3 = [1, 0, 0];

      // Orthogonal vectors should have similarity 0
      expect(embeddingService.cosineSimilarity(vector1, vector2)).toBe(0);

      // Identical vectors should have similarity 1
      expect(embeddingService.cosineSimilarity(vector1, vector3)).toBe(1);
    });

    it('should throw error for vectors of different dimensions', () => {
      const vector1 = [1, 0, 0];
      const vector2 = [1, 0];

      expect(() => embeddingService.cosineSimilarity(vector1, vector2)).toThrow(
        'Embeddings must have the same dimensions',
      );
    });

    it('should handle zero vectors', () => {
      const vector1 = [0, 0, 0];
      const vector2 = [1, 1, 1];

      expect(embeddingService.cosineSimilarity(vector1, vector2)).toBe(0);
    });
  });

  describe('generateMissingEmbeddings', () => {
    it('should generate embeddings for outcomes without embeddings', async () => {
      const mockOutcomes = [
        {
          id: 'outcome-1',
          subject: 'Math',
          grade: 3,
          code: 'M3.1',
          description: 'Test outcome 1',
          domain: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'outcome-2',
          subject: 'Science',
          grade: 3,
          code: 'S3.1',
          description: 'Test outcome 2',
          domain: 'Life Science',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prisma.outcome.findMany.mockResolvedValue(mockOutcomes);
      prisma.outcomeEmbedding.upsert.mockResolvedValue({
        id: 'embedding-1',
        outcomeId: 'outcome-1',
        embedding: JSON.stringify(Array(1536).fill(0.5)),
        model: 'text-embedding-3-small',
        dimensions: 1536,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const count = await embeddingService.generateMissingEmbeddings();

      expect(count).toBe(2);
      expect(prisma.outcome.findMany).toHaveBeenCalledWith({
        where: { embedding: null },
      });
      expect(prisma.outcomeEmbedding.upsert).toHaveBeenCalledTimes(2);
    });

    it('should return 0 if no outcomes need embeddings', async () => {
      prisma.outcome.findMany.mockResolvedValue([]);

      const count = await embeddingService.generateMissingEmbeddings();

      expect(count).toBe(0);
    });
  });

  describe('findSimilarOutcomes', () => {
    it('should find similar outcomes based on embeddings', async () => {
      const targetEmbedding = {
        id: 'embedding-1',
        outcomeId: 'outcome-1',
        embedding: JSON.stringify([1, 0, 0]),
        model: 'text-embedding-3-small',
        dimensions: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
        outcome: {
          id: 'outcome-1',
          subject: 'Math',
          grade: 3,
          code: 'M3.1',
          description: 'Target outcome',
          domain: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const otherEmbeddings = [
        {
          id: 'embedding-2',
          outcomeId: 'outcome-2',
          embedding: JSON.stringify([0.9, 0.1, 0]),
          model: 'text-embedding-3-small',
          dimensions: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          outcome: {
            id: 'outcome-2',
            subject: 'Math',
            grade: 3,
            code: 'M3.2',
            description: 'Similar outcome',
            domain: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: 'embedding-3',
          outcomeId: 'outcome-3',
          embedding: JSON.stringify([0, 1, 0]),
          model: 'text-embedding-3-small',
          dimensions: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          outcome: {
            id: 'outcome-3',
            subject: 'Science',
            grade: 3,
            code: 'S3.1',
            description: 'Different outcome',
            domain: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      prisma.outcomeEmbedding.findUnique.mockResolvedValue(targetEmbedding);
      prisma.outcomeEmbedding.findMany.mockResolvedValue(otherEmbeddings);

      const results = await embeddingService.findSimilarOutcomes('outcome-1', 2);

      expect(results).toHaveLength(2);
      expect(results[0].outcome.id).toBe('outcome-2');
      expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
    });

    it('should throw error if no embedding found for outcome', async () => {
      prisma.outcomeEmbedding.findUnique.mockResolvedValue(null);

      await expect(embeddingService.findSimilarOutcomes('outcome-1')).rejects.toThrow(
        'No embedding found for outcome outcome-1',
      );
    });
  });

  describe('searchOutcomesByText', () => {
    it('should search outcomes by text query', async () => {
      const mockEmbeddings = [
        {
          id: 'embedding-1',
          outcomeId: 'outcome-1',
          embedding: JSON.stringify([1, 0, 0]),
          model: 'text-embedding-3-small',
          dimensions: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
          outcome: {
            id: 'outcome-1',
            subject: 'Math',
            grade: 3,
            code: 'M3.1',
            description: 'Count to 100',
            domain: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      prisma.outcomeEmbedding.findMany.mockResolvedValue(mockEmbeddings);

      const results = await embeddingService.searchOutcomesByText('counting numbers', 5);

      expect(results).toBeDefined();
      expect(results.length).toBeLessThanOrEqual(5);
      expect(results[0]).toHaveProperty('outcome');
      expect(results[0]).toHaveProperty('similarity');
    });
  });

  describe('isEmbeddingServiceAvailable', () => {
    it('should return true when OpenAI is configured', () => {
      expect(embeddingService.isEmbeddingServiceAvailable()).toBe(true);
    });

    it('should return false when OpenAI is not configured', async () => {
      delete process.env.OPENAI_API_KEY;

      // Force module re-evaluation to pick up missing API key
      jest.resetModules();
      const { embeddingService: embeddingServiceNoKey } = await import('../embeddingService');

      expect(embeddingServiceNoKey.isEmbeddingServiceAvailable()).toBe(false);
    });
  });
});
