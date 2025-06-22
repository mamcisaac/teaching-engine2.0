import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import embeddingsRouter from '../embeddings';
import * as embeddingService from '../../services/embeddingService';

// Services and logger are already mocked in setup-all-mocks.ts
// Mock authentication middleware
jest.mock('../../middleware/auth', () => ({
  requireAdminToken: jest.fn((req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token === 'valid-admin-token') {
      next();
    } else {
      res.status(403).json({ error: 'Invalid admin token' });
    }
  }),
}));

// Mock Prisma
jest.mock('@teaching-engine/database', () => {
  const mockPrismaClient = {
    outcome: {
      count: jest.fn(),
      findUnique: jest.fn(),
    },
    outcomeEmbedding: {
      count: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

describe('Embeddings Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/embeddings', embeddingsRouter);
  });

  describe('GET /embeddings/status', () => {
    it('should return status when service is available', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(true);

      // Mock prisma is already available from jest setup
      (prismaMock.outcome.count as jest.Mock).mockResolvedValue(100);
      (prismaMock.outcomeEmbedding.count as jest.Mock).mockResolvedValue(80);

      const res = await request(app).get('/embeddings/status');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        available: true,
        totalOutcomes: 100,
        embeddedOutcomes: 80,
        missingEmbeddings: 20,
        model: 'text-embedding-3-small',
      });
    });

    it('should return unavailable when service is not configured', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(false);

      const res = await request(app).get('/embeddings/status');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        available: false,
        message: 'OpenAI API key not configured',
      });
    });
  });

  describe('POST /embeddings/generate', () => {
    it('should generate embeddings with valid admin token', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(true);
      (embeddingService.generateMissingEmbeddings as jest.Mock).mockResolvedValue(25);

      const res = await request(app)
        .post('/embeddings/generate')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({ forceRegenerate: false });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        generated: 25,
        message: 'Successfully generated 25 embeddings',
      });
    });

    it('should reject request without admin token', async () => {
      const res = await request(app).post('/embeddings/generate').send({ forceRegenerate: false });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Invalid admin token' });
    });

    it('should return 503 when service is unavailable', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(false);

      const res = await request(app)
        .post('/embeddings/generate')
        .set('Authorization', 'Bearer valid-admin-token')
        .send({});

      expect(res.status).toBe(503);
      expect(res.body).toEqual({
        error: 'Embedding service not available',
        message: 'OpenAI API key not configured',
      });
    });
  });

  describe('GET /embeddings/similar/:outcomeId', () => {
    it('should find similar outcomes', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(true);
      (embeddingService.findSimilarOutcomes as jest.Mock).mockResolvedValue([
        {
          outcome: {
            id: 'outcome-2',
            code: 'M3.2',
            description: 'Similar outcome',
            subject: 'Math',
            grade: 3,
          },
          similarity: 0.95,
        },
      ]);

      const res = await request(app).get('/embeddings/similar/outcome-1').query({ limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].similarity).toBe(0.95);
    });

    it('should return 503 when service is unavailable', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(false);

      const res = await request(app).get('/embeddings/similar/outcome-1');

      expect(res.status).toBe(503);
    });
  });

  describe('POST /embeddings/search', () => {
    it('should search outcomes by text', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(true);
      (embeddingService.searchOutcomesByText as jest.Mock).mockResolvedValue([
        {
          outcome: {
            id: 'outcome-1',
            code: 'M3.1',
            description: 'Count to 100',
            subject: 'Math',
            grade: 3,
          },
          similarity: 0.88,
        },
      ]);

      const res = await request(app)
        .post('/embeddings/search')
        .send({ query: 'counting numbers', limit: 5 });

      expect(res.status).toBe(200);
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].outcome.description).toBe('Count to 100');
    });

    it('should return 400 for missing query', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(true);

      const res = await request(app).post('/embeddings/search').send({ limit: 5 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Query text is required' });
    });
  });

  describe('POST /embeddings/outcome/:outcomeId', () => {
    it('should generate embedding for specific outcome', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(true);

      // Mock prisma is already available from jest setup
      (prismaMock.outcome.findUnique as jest.Mock).mockResolvedValue({
        id: 'outcome-1',
        code: 'M3.1',
        description: 'Test outcome',
        subject: 'Math',
        grade: 3,
      });

      (embeddingService.getOrCreateOutcomeEmbedding as jest.Mock).mockResolvedValue({
        id: 'embedding-1',
        outcomeId: 'outcome-1',
        model: 'text-embedding-3-small',
        dimensions: 1536,
        embedding: JSON.stringify(Array(1536).fill(0.5)),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app)
        .post('/embeddings/outcome/outcome-1')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(200);
      expect(res.body.embedding.outcomeId).toBe('outcome-1');
      expect(res.body.message).toBe('Embedding generated successfully');
    });

    it('should return 404 for non-existent outcome', async () => {
      (embeddingService.isEmbeddingServiceAvailable as jest.Mock).mockReturnValue(true);

      // Mock prisma is already available from jest setup
      (prismaMock.outcome.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/embeddings/outcome/non-existent')
        .set('Authorization', 'Bearer valid-admin-token');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Outcome not found' });
    });
  });
});
