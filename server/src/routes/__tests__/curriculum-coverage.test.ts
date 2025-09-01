import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@teaching-engine/database';

import { router } from '../curriculum-coverage';
import { cache } from '../../services/cache';
import { logger } from '../../logger';

// Mock dependencies
vi.mock('../../prisma', () => ({
  prisma: {
    curriculumExpectation: {
      count: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    eTFOLessonPlan: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('../../services/cache', () => ({
  cache: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
  CacheKeys: {
    curriculumCoverage: (key: string) => `coverage:${key}`,
  },
  CacheTags: {
    curriculum: () => ['curriculum'],
    user: (id: string) => [`user:${id}`],
  },
}));

vi.mock('../../logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../utils/authHelpers', () => ({
  getUserId: vi.fn(() => 'test-user-id'),
}));

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/api/curriculum-coverage', router);

describe('Curriculum Coverage API', () => {
  const mockPrisma = require('../../prisma').prisma;
  const mockCache = cache();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/curriculum-coverage', () => {
    it('should return coverage statistics with proper pagination', async () => {
      // Mock data
      const mockExpectations = [
        {
          id: '1',
          code: 'M1.1',
          description: 'Count to 100',
          subject: 'Mathématiques',
          grade: 1,
          strand: 'Number Sense',
          _count: {
            lessonPlans: 2,
            unitPlans: 1,
            daybookEntries: 0,
          },
        },
        {
          id: '2',
          code: 'M1.2',
          description: 'Add single digits',
          subject: 'Mathématiques',
          grade: 1,
          strand: 'Number Sense',
          _count: {
            lessonPlans: 0,
            unitPlans: 0,
            daybookEntries: 0,
          },
        },
      ];

      mockPrisma.curriculumExpectation.count.mockResolvedValue(2);
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(mockExpectations);
      mockCache.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/curriculum-coverage')
        .query({ grade: 1, page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('overall');
      expect(response.body.data.overall).toEqual({
        total: 2,
        covered: 1,
        uncovered: 1,
        percentage: 50,
      });
      expect(response.body.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should use cache when available', async () => {
      const cachedData = {
        success: true,
        data: {
          overall: { total: 10, covered: 5, uncovered: 5, percentage: 50 },
        },
      };

      mockCache.get.mockResolvedValue(cachedData);

      const response = await request(app)
        .get('/api/curriculum-coverage')
        .query({ grade: 1 })
        .expect(200);

      expect(response.body).toEqual(cachedData);
      expect(mockPrisma.curriculumExpectation.findMany).not.toHaveBeenCalled();
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/curriculum-coverage')
        .query({ grade: 'invalid', limit: 999 })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'INVALID_PARAMETERS');
    });

    it('should handle database errors gracefully', async () => {
      mockPrisma.curriculumExpectation.count.mockRejectedValue(new Error('Database error'));
      mockCache.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/curriculum-coverage')
        .query({ grade: 1 })
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'INTERNAL_ERROR');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should calculate coverage by subject correctly', async () => {
      const mockExpectations = [
        {
          id: '1',
          code: 'F1.1',
          subject: 'Français (Immersion)',
          grade: 1,
          strand: 'Lecture',
          _count: { lessonPlans: 1, unitPlans: 0, daybookEntries: 0 },
        },
        {
          id: '2',
          code: 'F1.2',
          subject: 'Français (Immersion)',
          grade: 1,
          strand: 'Lecture',
          _count: { lessonPlans: 0, unitPlans: 0, daybookEntries: 0 },
        },
        {
          id: '3',
          code: 'M1.1',
          subject: 'Mathématiques',
          grade: 1,
          strand: 'Number',
          _count: { lessonPlans: 1, unitPlans: 1, daybookEntries: 0 },
        },
      ];

      mockPrisma.curriculumExpectation.count.mockResolvedValue(3);
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(mockExpectations);
      mockCache.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/curriculum-coverage')
        .query({ grade: 1 })
        .expect(200);

      const bySubject = response.body.data.bySubject;
      expect(bySubject).toHaveLength(2);
      
      const french = bySubject.find((s: any) => s.subject === 'Français (Immersion)');
      expect(french).toEqual(expect.objectContaining({
        subject: 'Français (Immersion)',
        total: 2,
        covered: 1,
        percentage: 50,
      }));
      
      const math = bySubject.find((s: any) => s.subject === 'Mathématiques');
      expect(math).toEqual(expect.objectContaining({
        subject: 'Mathématiques',
        total: 1,
        covered: 1,
        percentage: 100,
      }));
    });
  });

  describe('GET /api/curriculum-coverage/uncovered', () => {
    it('should return uncovered expectations with priority', async () => {
      const mockUncovered = [
        {
          id: '1',
          code: 'M1.1',
          description: 'Count to 100',
          subject: 'Mathématiques',
          grade: 1,
          strand: 'Number Sense',
          type: 'overall',
        },
        {
          id: '2',
          code: 'A1.1',
          description: 'Draw shapes',
          subject: 'Arts visuels',
          grade: 1,
          strand: 'Creating',
          type: 'specific',
        },
      ];

      mockPrisma.curriculumExpectation.count.mockResolvedValue(2);
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(mockUncovered);
      mockPrisma.eTFOLessonPlan.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/curriculum-coverage/uncovered')
        .query({ grade: 1 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.expectations).toHaveLength(2);
      
      // Check that Math (core subject) has higher priority
      const mathExp = response.body.data.expectations.find((e: any) => e.code === 'M1.1');
      expect(mathExp.priority).toBe('high');
      
      const artExp = response.body.data.expectations.find((e: any) => e.code === 'A1.1');
      expect(artExp.priority).toBe('low');
    });

    it('should filter by priority when requested', async () => {
      const mockUncovered = [
        {
          id: '1',
          code: 'M1.1',
          description: 'Count to 100',
          subject: 'Mathématiques',
          grade: 1,
          strand: 'Number Sense',
        },
      ];

      mockPrisma.curriculumExpectation.count.mockResolvedValue(1);
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(mockUncovered);
      mockPrisma.eTFOLessonPlan.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/curriculum-coverage/uncovered')
        .query({ grade: 1, priorityFilter: 'high' })
        .expect(200);

      expect(response.body.data.expectations).toHaveLength(1);
      expect(response.body.data.expectations[0].priority).toBe('high');
    });

    it('should support search functionality', async () => {
      mockPrisma.curriculumExpectation.count.mockResolvedValue(0);
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([]);

      await request(app)
        .get('/api/curriculum-coverage/uncovered')
        .query({ search: 'count' })
        .expect(200);

      expect(mockPrisma.curriculumExpectation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { code: { contains: 'count', mode: 'insensitive' } },
              { description: { contains: 'count', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should include suggested activities', async () => {
      const mockUncovered = [
        {
          id: '1',
          code: 'F1.1',
          description: 'Read simple texts',
          subject: 'Français (Immersion)',
          grade: 1,
          strand: 'Lecture',
        },
      ];

      mockPrisma.curriculumExpectation.count.mockResolvedValue(1);
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(mockUncovered);
      mockPrisma.eTFOLessonPlan.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/curriculum-coverage/uncovered')
        .query({ grade: 1 })
        .expect(200);

      const expectation = response.body.data.expectations[0];
      expect(expectation.suggestedActivities).toBeDefined();
      expect(expectation.suggestedActivities).toBeInstanceOf(Array);
      expect(expectation.suggestedActivities.length).toBeGreaterThan(0);
      expect(expectation.suggestedDuration).toBeDefined();
    });
  });

  describe('POST /api/curriculum-coverage/quick-plan', () => {
    it('should generate a lesson plan template', async () => {
      const mockExpectation = {
        id: 'exp-1',
        code: 'M1.1',
        description: 'Count to 100',
        subject: 'Mathématiques',
        grade: 1,
        strand: 'Number Sense',
        lessonPlans: [],
      };

      mockPrisma.curriculumExpectation.findUnique.mockResolvedValue(mockExpectation);
      mockPrisma.eTFOLessonPlan.findMany.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/curriculum-coverage/quick-plan')
        .send({
          expectationId: 'exp-1',
          templatePreference: 'engaging',
        })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('learningGoals');
      expect(response.body.data).toHaveProperty('materials');
      expect(response.body.data).toHaveProperty('differentiationStrategies');
      expect(response.body.data.metadata).toEqual(expect.objectContaining({
        method: 'smart-template',
        expectationCode: 'M1.1',
        expectationSubject: 'Mathématiques',
      }));
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/api/curriculum-coverage/quick-plan')
        .send({
          // Missing expectationId
          templatePreference: 'invalid',
        })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'INVALID_REQUEST');
    });

    it('should return 404 for non-existent expectation', async () => {
      mockPrisma.curriculumExpectation.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/curriculum-coverage/quick-plan')
        .send({
          expectationId: 'non-existent',
        })
        .expect(404);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'EXPECTATION_NOT_FOUND');
    });

    it('should detect already covered expectations', async () => {
      const mockExpectation = {
        id: 'exp-1',
        code: 'M1.1',
        lessonPlans: [
          {
            lessonPlan: {
              id: 'lesson-1',
              title: 'Existing Lesson',
              date: new Date(),
            },
          },
        ],
      };

      mockPrisma.curriculumExpectation.findUnique.mockResolvedValue(mockExpectation);

      const response = await request(app)
        .post('/api/curriculum-coverage/quick-plan')
        .send({
          expectationId: 'exp-1',
        })
        .expect(409);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'ALREADY_COVERED');
      expect(response.body.existingLessons).toHaveLength(1);
    });

    it('should use different templates based on preference', async () => {
      const mockExpectation = {
        id: 'exp-1',
        code: 'F1.1',
        description: 'Read simple texts',
        subject: 'Français (Immersion)',
        grade: 1,
        strand: 'Lecture',
        lessonPlans: [],
      };

      mockPrisma.curriculumExpectation.findUnique.mockResolvedValue(mockExpectation);
      mockPrisma.eTFOLessonPlan.findMany.mockResolvedValue([]);

      // Test engaging template
      const engagingResponse = await request(app)
        .post('/api/curriculum-coverage/quick-plan')
        .send({
          expectationId: 'exp-1',
          templatePreference: 'engaging',
        })
        .expect(200);

      expect(engagingResponse.body.data.title).toContain('Adventure');

      // Test structured template
      const structuredResponse = await request(app)
        .post('/api/curriculum-coverage/quick-plan')
        .send({
          expectationId: 'exp-1',
          templatePreference: 'structured',
        })
        .expect(200);

      expect(structuredResponse.body.data.title).toContain('Lesson');
    });
  });

  describe('GET /api/curriculum-coverage/trends', () => {
    it('should calculate historical trends', async () => {
      const mockExpectations = [
        {
          id: '1',
          code: 'M1.1',
          subject: 'Mathématiques',
          grade: 1,
          _count: {
            lessonPlans: 1,
            unitPlans: 0,
          },
        },
      ];

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(mockExpectations);

      const response = await request(app)
        .get('/api/curriculum-coverage/trends')
        .query({ grade: 1, months: 3 })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.data[0]).toHaveProperty('month');
      expect(response.body.data[0]).toHaveProperty('coverage');
      expect(response.body.data[0]).toHaveProperty('total');
      expect(response.body.data[0]).toHaveProperty('covered');
    });
  });

  describe('Error Handling', () => {
    it('should handle Prisma known errors', async () => {
      const prismaError = {
        code: 'P2025',
        clientVersion: '4.0.0',
      };
      
      Object.setPrototypeOf(prismaError, Error.prototype);
      prismaError.constructor = Error;
      prismaError.name = 'PrismaClientKnownRequestError';
      
      mockPrisma.curriculumExpectation.findMany.mockRejectedValue(prismaError);
      mockCache.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/curriculum-coverage')
        .query({ grade: 1 })
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'P2025');
    });

    it('should handle unexpected errors', async () => {
      mockPrisma.curriculumExpectation.findMany.mockRejectedValue(new Error('Unexpected'));
      mockCache.get.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/curriculum-coverage')
        .query({ grade: 1 })
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'INTERNAL_ERROR');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should respect pagination limits', async () => {
      const response = await request(app)
        .get('/api/curriculum-coverage')
        .query({ grade: 1, limit: 200 }) // Try to request more than max
        .expect(400);

      expect(response.body).toHaveProperty('error', 'INVALID_PARAMETERS');
    });

    it('should cache responses with proper TTL', async () => {
      mockPrisma.curriculumExpectation.count.mockResolvedValue(1);
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([]);
      mockCache.get.mockResolvedValue(null);

      await request(app)
        .get('/api/curriculum-coverage')
        .query({ grade: 1 })
        .expect(200);

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          ttl: 300, // 5 minutes
          tags: expect.arrayContaining(['user:test-user-id']),
        })
      );
    });
  });
});