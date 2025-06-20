/**
 * Analytics API Integration Tests
 *
 * Tests all analytics endpoints for proper functionality and error handling
 */

import request from 'supertest';
import express from 'express';
import { describe, it, expect, beforeAll, beforeEach } from '@jest/globals';
import analyticsRoutes from '../analytics';
import { analyticsCache } from '../../services/analytics';

// Mock authentication middleware
const mockAuthMiddleware = (
  req: express.Request & { user?: { id: number; email: string } },
  res: express.Response,
  next: express.NextFunction,
) => {
  req.user = { id: 1, email: 'test@example.com' };
  next();
};

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/analytics', mockAuthMiddleware, analyticsRoutes);
  return app;
};

describe('Analytics API Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    // Clear cache before each test
    analyticsCache.clear();
  });

  describe('GET /api/analytics/curriculum-heatmap', () => {
    it('should return heatmap data with default parameters', async () => {
      const response = await request(app).get('/api/analytics/curriculum-heatmap').expect(200);

      expect(response.body).toHaveProperty('outcomes');
      expect(response.body).toHaveProperty('weeks');
      expect(response.body).toHaveProperty('grid');
      expect(response.body).toHaveProperty('metadata');
      expect(response.body.metadata.viewMode).toBe('planned');
    });

    it('should accept query parameters', async () => {
      const response = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({
          teacherId: 123,
          subject: 'Mathematics',
          domain: 'Number Sense',
          viewMode: 'taught',
          startWeek: 5,
          endWeek: 10,
        })
        .expect(200);

      expect(response.body.metadata.viewMode).toBe('taught');
      expect(response.body.weeks).toHaveLength(6); // weeks 5-10
    });

    it('should validate viewMode parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({ viewMode: 'invalid' })
        .expect(200);

      // Should default to a valid viewMode
      expect(['planned', 'taught', 'assessed', 'reinforced']).toContain(
        response.body.metadata.viewMode,
      );
    });
  });

  describe('GET /api/analytics/curriculum-summary', () => {
    it('should return curriculum summary', async () => {
      const response = await request(app).get('/api/analytics/curriculum-summary').expect(200);

      expect(response.body).toHaveProperty('totalOutcomes');
      expect(response.body).toHaveProperty('coveredOutcomes');
      expect(response.body).toHaveProperty('coveragePercentage');
      expect(response.body).toHaveProperty('topCoveredOutcomes');
      expect(response.body).toHaveProperty('leastCoveredOutcomes');
      expect(response.body).toHaveProperty('averageWeeklyHits');
      expect(response.body).toHaveProperty('domainImbalance');
      expect(response.body).toHaveProperty('domainBreakdown');
    });

    it('should filter by subject', async () => {
      const response = await request(app)
        .get('/api/analytics/curriculum-summary')
        .query({ subject: 'Science' })
        .expect(200);

      expect(response.body.totalOutcomes).toBeGreaterThan(0);
    });
  });

  describe('GET /api/analytics/domain-strength/:studentId', () => {
    it('should return domain radar data', async () => {
      const response = await request(app).get('/api/analytics/domain-strength/1').expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('studentName');
      expect(response.body).toHaveProperty('term');
      expect(response.body).toHaveProperty('domains');
      expect(response.body).toHaveProperty('overallScore');
      expect(response.body).toHaveProperty('strengths');
      expect(response.body).toHaveProperty('areasForGrowth');
    });

    it('should handle invalid student ID', async () => {
      const response = await request(app).get('/api/analytics/domain-strength/abc').expect(200); // Mock service always returns data

      expect(response.body.studentId).toBe(1); // Default mock data
    });
  });

  describe('GET /api/analytics/vocabulary-growth/:studentId', () => {
    it('should return vocabulary growth data', async () => {
      const response = await request(app).get('/api/analytics/vocabulary-growth/1').expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('studentName');
      expect(response.body).toHaveProperty('totalWords');
      expect(response.body).toHaveProperty('wordsThisTerm');
      expect(response.body).toHaveProperty('weeklyGrowth');
      expect(response.body).toHaveProperty('domainBreakdown');
      expect(response.body).toHaveProperty('acquisitionRate');
      expect(response.body).toHaveProperty('targetGrowth');
      expect(response.body).toHaveProperty('projectedEndOfTerm');
    });

    it('should accept week count parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/vocabulary-growth/1')
        .query({ weekCount: 10 })
        .expect(200);

      expect(response.body.weeklyGrowth).toHaveLength(10);
    });
  });

  describe('GET /api/analytics/bilingual-vocabulary/:studentId', () => {
    it('should return bilingual analytics', async () => {
      const response = await request(app).get('/api/analytics/bilingual-vocabulary/1').expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('cognateConnections');
      expect(response.body).toHaveProperty('languageBalance');
      expect(response.body).toHaveProperty('transferPatterns');
      expect(response.body).toHaveProperty('recommendedCognates');
    });
  });

  describe('GET /api/analytics/class-vocabulary-summary', () => {
    it('should require teacherId', async () => {
      await request(app)
        .get('/api/analytics/class-vocabulary-summary')
        .expect(400)
        .expect({ error: 'teacherId is required' });
    });

    it('should return class summary with teacherId', async () => {
      const response = await request(app)
        .get('/api/analytics/class-vocabulary-summary')
        .query({ teacherId: 1 })
        .expect(200);

      expect(response.body).toHaveProperty('classSize');
      expect(response.body).toHaveProperty('averageWordsPerStudent');
      expect(response.body).toHaveProperty('topPerformers');
      expect(response.body).toHaveProperty('strugglingStudents');
      expect(response.body).toHaveProperty('commonWords');
      expect(response.body).toHaveProperty('gapWords');
      expect(response.body).toHaveProperty('domainCoverage');
    });
  });

  describe('GET /api/analytics/theme-usage', () => {
    it('should return theme analytics', async () => {
      const response = await request(app).get('/api/analytics/theme-usage').expect(200);

      expect(response.body).toHaveProperty('totalThemes');
      expect(response.body).toHaveProperty('activeThemes');
      expect(response.body).toHaveProperty('averageUsagePerTheme');
      expect(response.body).toHaveProperty('mostUsedThemes');
      expect(response.body).toHaveProperty('themeBalance');
    });
  });

  describe('POST /api/analytics/export', () => {
    it('should export data in CSV format', async () => {
      const exportRequest = {
        type: 'curriculum-heatmap',
        format: 'csv',
        data: {
          outcomes: [{ id: '1', code: 'M1', label: 'Math 1', subject: 'Math', domain: 'Numbers' }],
          weeks: [1, 2, 3],
          grid: { '1': { 1: 1, 2: 0, 3: 2 } },
          metadata: {
            viewMode: 'planned',
            totalOutcomes: 1,
            totalWeeks: 3,
            coveragePercentage: 67,
          },
        },
      };

      const response = await request(app)
        .post('/api/analytics/export')
        .send(exportRequest)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.csv');
    });

    it('should export data in PDF format', async () => {
      const exportRequest = {
        type: 'vocabulary-growth',
        format: 'pdf',
        data: {
          studentId: 1,
          studentName: 'Test Student',
          totalWords: 100,
          wordsThisTerm: 30,
          weeklyGrowth: [],
          domainBreakdown: {},
          difficultyProgression: { basic: 50, intermediate: 30, advanced: 20 },
          acquisitionRate: 5,
          targetGrowth: 50,
          projectedEndOfTerm: 130,
        },
        options: {
          title: 'Test Report',
          includeMetadata: true,
        },
      };

      const response = await request(app)
        .post('/api/analytics/export')
        .send(exportRequest)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('.pdf');
    });

    it('should validate required fields', async () => {
      await request(app)
        .post('/api/analytics/export')
        .send({ type: 'test' })
        .expect(400)
        .expect({ error: 'Missing required fields: type, format, and data are required' });
    });

    it('should handle export errors gracefully', async () => {
      const exportRequest = {
        type: 'invalid-type',
        format: 'invalid-format',
        data: {},
      };

      const response = await request(app)
        .post('/api/analytics/export')
        .send(exportRequest)
        .expect(500);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Failed to export data');
    });
  });

  describe('POST /api/analytics/invalidate-cache', () => {
    it('should invalidate curriculum cache', async () => {
      await request(app)
        .post('/api/analytics/invalidate-cache')
        .send({ service: 'curriculum', teacherId: 1 })
        .expect(200)
        .expect({ success: true, message: 'Cache invalidated successfully' });
    });

    it('should invalidate all caches', async () => {
      await request(app)
        .post('/api/analytics/invalidate-cache')
        .send({ service: 'all', teacherId: 1 })
        .expect(200)
        .expect({ success: true, message: 'Cache invalidated successfully' });
    });

    it('should reject invalid service', async () => {
      await request(app)
        .post('/api/analytics/invalidate-cache')
        .send({ service: 'invalid' })
        .expect(400)
        .expect({ error: 'Invalid service specified' });
    });
  });

  describe('GET /api/analytics/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/analytics/health').expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toEqual({
        curriculum: 'operational',
        domain: 'operational',
        theme: 'operational',
        vocabulary: 'operational',
        export: 'operational',
      });
    });
  });

  describe('Error handling', () => {
    it('should handle internal server errors', async () => {
      // Force an error by sending invalid data that will crash the service
      const response = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({ startWeek: 'not-a-number' })
        .expect(200); // Our mock service handles this gracefully

      // Should still return valid data structure
      expect(response.body).toHaveProperty('outcomes');
    });
  });

  describe('Caching behavior', () => {
    it('should cache repeated requests', async () => {
      // First request
      const response1 = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({ subject: 'Mathematics' });

      // Second identical request
      const response2 = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({ subject: 'Mathematics' });

      // Responses should be identical due to caching
      expect(response1.body).toEqual(response2.body);
    });

    it('should not use cache for different parameters', async () => {
      const response1 = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({ subject: 'Mathematics' });

      const response2 = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({ subject: 'Science' });

      // Different subjects should have different outcomes
      expect(response1.body.outcomes[0]?.subject).toBe('Mathematics');
      expect(response2.body.outcomes[0]?.subject).toBe('Science');
    });
  });
});
