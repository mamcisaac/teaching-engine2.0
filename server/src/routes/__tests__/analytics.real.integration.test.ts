/**
 * Real Analytics API Integration Tests
 *
 * Tests actual API endpoints with real service implementations
 * No mocking - validates end-to-end functionality
 */

import request from 'supertest';
import { app } from '../../index.js';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Analytics API Integration Tests (Real)', () => {
  let server: unknown;

  beforeAll(async () => {
    // Start the server for testing
    server = app.listen(0); // Use random port
  });

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  describe('Curriculum Analytics Endpoints', () => {
    it('GET /api/analytics/curriculum-heatmap should return valid heatmap data', async () => {
      const response = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({
          teacherId: 1,
          term: 'Term 1',
          viewMode: 'weekly',
        })
        .expect(200);

      // Validate response structure
      expect(response.body).toHaveProperty('outcomes');
      expect(response.body).toHaveProperty('weeks');
      expect(response.body).toHaveProperty('grid');
      expect(response.body).toHaveProperty('metadata');

      // Validate data types
      expect(Array.isArray(response.body.outcomes)).toBe(true);
      expect(Array.isArray(response.body.weeks)).toBe(true);
      expect(typeof response.body.grid).toBe('object');
      expect(typeof response.body.metadata).toBe('object');

      // Validate metadata structure
      expect(response.body.metadata).toHaveProperty('totalOutcomes');
      expect(response.body.metadata).toHaveProperty('coveragePercentage');
      expect(response.body.metadata).toHaveProperty('viewMode');
      expect(response.body.metadata.viewMode).toBe('weekly');
    });

    it('GET /api/analytics/curriculum-coverage should return coverage statistics', async () => {
      const response = await request(app)
        .get('/api/analytics/curriculum-coverage')
        .query({
          teacherId: 1,
          term: 'Term 1',
        })
        .expect(200);

      expect(response.body).toHaveProperty('totalOutcomes');
      expect(response.body).toHaveProperty('coveredOutcomes');
      expect(response.body).toHaveProperty('coveragePercentage');
      expect(response.body).toHaveProperty('subjectBreakdown');
      expect(response.body).toHaveProperty('weeklyProgress');
      expect(response.body).toHaveProperty('gaps');

      // Validate numeric values
      expect(typeof response.body.totalOutcomes).toBe('number');
      expect(typeof response.body.coveredOutcomes).toBe('number');
      expect(typeof response.body.coveragePercentage).toBe('number');
      expect(response.body.coveragePercentage).toBeGreaterThanOrEqual(0);
      expect(response.body.coveragePercentage).toBeLessThanOrEqual(100);
    });

    it('should handle missing parameters gracefully', async () => {
      const response = await request(app).get('/api/analytics/curriculum-heatmap').expect(200); // Should still work with default parameters

      expect(response.body).toHaveProperty('outcomes');
      expect(response.body).toHaveProperty('weeks');
      expect(response.body).toHaveProperty('grid');
    });

    it('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({
          teacherId: 'invalid',
          viewMode: 'invalid_mode',
        })
        .expect(200); // Should handle invalid params gracefully

      expect(response.body).toHaveProperty('outcomes');
    });
  });

  describe('Domain Analytics Endpoints', () => {
    it('GET /api/analytics/domain-radar should return student radar data', async () => {
      const response = await request(app)
        .get('/api/analytics/domain-radar')
        .query({
          studentId: 1,
          term: 'Term 1',
        })
        .expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('studentName');
      expect(response.body).toHaveProperty('term');
      expect(response.body).toHaveProperty('domains');
      expect(response.body).toHaveProperty('overallScore');
      expect(response.body).toHaveProperty('strengths');
      expect(response.body).toHaveProperty('areasForGrowth');

      // Validate domains structure
      expect(Array.isArray(response.body.domains)).toBe(true);
      if (response.body.domains.length > 0) {
        const domain = response.body.domains[0];
        expect(domain).toHaveProperty('subject');
        expect(domain).toHaveProperty('score');
        expect(domain).toHaveProperty('label');
        expect(domain).toHaveProperty('average');
      }

      // Validate score ranges
      expect(response.body.overallScore).toBeGreaterThanOrEqual(0);
      expect(response.body.overallScore).toBeLessThanOrEqual(100);
    });

    it('GET /api/analytics/domain-summary should return class summary', async () => {
      const response = await request(app)
        .get('/api/analytics/domain-summary')
        .query({
          teacherId: 1,
          term: 'Term 1',
        })
        .expect(200);

      expect(response.body).toHaveProperty('classAverages');
      expect(response.body).toHaveProperty('domainDistribution');
      expect(response.body).toHaveProperty('topPerformingDomains');
      expect(response.body).toHaveProperty('challengingDomains');
      expect(response.body).toHaveProperty('recommendedFocus');

      // Validate arrays
      expect(Array.isArray(response.body.topPerformingDomains)).toBe(true);
      expect(Array.isArray(response.body.challengingDomains)).toBe(true);
      expect(Array.isArray(response.body.recommendedFocus)).toBe(true);
    });

    it('GET /api/analytics/domain-trends should return trend data', async () => {
      const response = await request(app)
        .get('/api/analytics/domain-trends')
        .query({
          studentId: 1,
          domain: 'reading',
          weekCount: 12,
        })
        .expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('domain');
      expect(response.body).toHaveProperty('trends');
      expect(response.body).toHaveProperty('projection');

      // Validate trends array
      expect(Array.isArray(response.body.trends)).toBe(true);
      if (response.body.trends.length > 0) {
        const trend = response.body.trends[0];
        expect(trend).toHaveProperty('week');
        expect(trend).toHaveProperty('score');
        expect(trend).toHaveProperty('target');
        expect(trend).toHaveProperty('activities');
      }

      // Validate projection
      expect(response.body.projection).toHaveProperty('endOfTerm');
      expect(response.body.projection).toHaveProperty('trajectory');
      expect(response.body.projection).toHaveProperty('confidence');
      expect(['improving', 'stable', 'declining']).toContain(response.body.projection.trajectory);
    });
  });

  describe('Theme Analytics Endpoints', () => {
    it('GET /api/analytics/theme-usage should return theme analytics', async () => {
      const response = await request(app)
        .get('/api/analytics/theme-usage')
        .query({
          teacherId: 1,
          term: 'Term 1',
        })
        .expect(200);

      expect(response.body).toHaveProperty('totalThemes');
      expect(response.body).toHaveProperty('activeThemes');
      expect(response.body).toHaveProperty('averageUsagePerTheme');
      expect(response.body).toHaveProperty('mostUsedThemes');
      expect(response.body).toHaveProperty('themeBalance');
      expect(response.body).toHaveProperty('monthlyUsage');
      expect(response.body).toHaveProperty('subjectIntegration');
      expect(response.body).toHaveProperty('unusedThemes');
      expect(response.body).toHaveProperty('crossSubjectConnections');

      // Validate arrays
      expect(Array.isArray(response.body.mostUsedThemes)).toBe(true);
      expect(Array.isArray(response.body.monthlyUsage)).toBe(true);
      expect(Array.isArray(response.body.subjectIntegration)).toBe(true);
      expect(Array.isArray(response.body.unusedThemes)).toBe(true);
      expect(Array.isArray(response.body.crossSubjectConnections)).toBe(true);

      // Validate theme balance structure
      expect(typeof response.body.themeBalance).toBe('object');
      expect(response.body.themeBalance).toHaveProperty('count');
      expect(response.body.themeBalance).toHaveProperty('percentage');
    });

    it('GET /api/analytics/theme-matrix should return matrix data', async () => {
      const response = await request(app)
        .get('/api/analytics/theme-matrix')
        .query({
          teacherId: 1,
          term: 'Term 1',
        })
        .expect(200);

      expect(response.body).toHaveProperty('themes');
      expect(response.body).toHaveProperty('outcomes');
      expect(response.body).toHaveProperty('matrix');
      expect(response.body).toHaveProperty('coverage');

      // Validate arrays
      expect(Array.isArray(response.body.themes)).toBe(true);
      expect(Array.isArray(response.body.outcomes)).toBe(true);
      expect(typeof response.body.matrix).toBe('object');

      // Validate coverage statistics
      expect(response.body.coverage).toHaveProperty('themesCovered');
      expect(response.body.coverage).toHaveProperty('outcomesCovered');
      expect(response.body.coverage).toHaveProperty('totalConnections');
      expect(response.body.coverage).toHaveProperty('averageConnections');
    });
  });

  describe('Vocabulary Analytics Endpoints', () => {
    it('GET /api/analytics/vocabulary-growth should return growth data', async () => {
      const response = await request(app)
        .get('/api/analytics/vocabulary-growth')
        .query({
          studentId: 1,
          term: 'Term 1',
        })
        .expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('studentName');
      expect(response.body).toHaveProperty('totalWords');
      expect(response.body).toHaveProperty('wordsThisTerm');
      expect(response.body).toHaveProperty('acquisitionRate');
      expect(response.body).toHaveProperty('targetGrowth');
      expect(response.body).toHaveProperty('projectedEndOfTerm');
      expect(response.body).toHaveProperty('weeklyGrowth');
      expect(response.body).toHaveProperty('domainBreakdown');
      expect(response.body).toHaveProperty('difficultyProgression');

      // Validate arrays
      expect(Array.isArray(response.body.weeklyGrowth)).toBe(true);

      // Validate weekly growth structure
      if (response.body.weeklyGrowth.length > 0) {
        const weekData = response.body.weeklyGrowth[0];
        expect(weekData).toHaveProperty('week');
        expect(weekData).toHaveProperty('newWords');
        expect(weekData).toHaveProperty('cumulativeWords');
        expect(weekData).toHaveProperty('languages');
      }

      // Validate difficulty progression
      expect(response.body.difficultyProgression).toHaveProperty('basic');
      expect(response.body.difficultyProgression).toHaveProperty('intermediate');
      expect(response.body.difficultyProgression).toHaveProperty('advanced');
    });

    it('GET /api/analytics/vocabulary-trends should return trend analysis', async () => {
      const response = await request(app)
        .get('/api/analytics/vocabulary-trends')
        .query({
          studentId: 1,
          timeframe: 'term',
        })
        .expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body).toHaveProperty('timeframe');
      expect(response.body).toHaveProperty('trends');
      expect(response.body).toHaveProperty('insights');

      // Validate trends
      expect(Array.isArray(response.body.trends)).toBe(true);
      expect(Array.isArray(response.body.insights)).toBe(true);
    });
  });

  describe('Export Endpoints', () => {
    it('POST /api/analytics/export should handle curriculum heatmap export', async () => {
      const exportRequest = {
        type: 'curriculum-heatmap',
        format: 'csv',
        data: {
          teacherId: 1,
          term: 'Term 1',
          viewMode: 'weekly',
        },
        options: {
          title: 'Test Export',
          includeMetadata: true,
        },
      };

      const response = await request(app)
        .post('/api/analytics/export')
        .send(exportRequest)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toBeDefined();
    });

    it('POST /api/analytics/export should handle PDF export', async () => {
      const exportRequest = {
        type: 'domain-radar',
        format: 'pdf',
        data: {
          studentId: 1,
          term: 'Term 1',
        },
        options: {
          title: 'Domain Analysis Report',
          pageSize: 'letter',
        },
      };

      const response = await request(app)
        .post('/api/analytics/export')
        .send(exportRequest)
        .expect(200);

      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
    });

    it('POST /api/analytics/export should validate export request', async () => {
      const invalidRequest = {
        type: 'invalid-type',
        format: 'invalid-format',
        data: {},
      };

      await request(app).post('/api/analytics/export').send(invalidRequest).expect(400);
    });
  });

  describe('Performance and Reliability', () => {
    it('should respond within acceptable time limits', async () => {
      const start = Date.now();

      await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({ teacherId: 1 })
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .get('/api/analytics/domain-radar')
          .query({ studentId: i + 1 })
          .expect(200),
      );

      const responses = await Promise.all(requests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('studentId');
      });
    });

    it('should handle edge cases gracefully', async () => {
      // Test with extreme values
      const response = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({
          teacherId: 99999,
          term: 'NonexistentTerm',
          viewMode: 'yearly',
        })
        .expect(200);

      // Should return valid structure even with invalid data
      expect(response.body).toHaveProperty('outcomes');
      expect(response.body).toHaveProperty('weeks');
      expect(response.body).toHaveProperty('grid');
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests', async () => {
      await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({ teacherId: 'not-a-number' })
        .expect(200); // Should handle gracefully with default
    });

    it('should return appropriate error for invalid endpoints', async () => {
      await request(app).get('/api/analytics/nonexistent-endpoint').expect(404);
    });

    it('should handle missing required fields in POST requests', async () => {
      await request(app)
        .post('/api/analytics/export')
        .send({}) // Empty body
        .expect(400);
    });
  });
});
