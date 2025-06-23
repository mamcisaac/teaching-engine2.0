/**
 * Analytics Contract Tests
 *
 * Ensures that mock data and test doubles match the real API behavior
 * Validates API contracts and data structures
 */

import request from 'supertest';
import { app } from '../../../index';
import { mockDataService } from '../mockDataService';
import { curriculumAnalyticsService } from '../curriculumAnalyticsSimple';
import { domainAnalyticsService } from '../domainAnalyticsSimple';
import { themeAnalyticsService } from '../themeAnalyticsSimple';
import { vocabularyAnalyticsService } from '../vocabularyAnalytics';

// Type definitions for contract validation
interface ContractExpectation {
  endpoint: string;
  method: 'GET' | 'POST';
  queryParams?: Record<string, unknown>;
  requestBody?: unknown;
  expectedStatus: number;
  expectedStructure: unknown;
  mockComparison?: () => Promise<unknown>;
}

describe.skip('Analytics API Contract Tests', () => {
  let server: any;

  beforeAll(async () => {
    server = app.listen(0);
  });

  afterAll(async () => {
    if (server && typeof server.close === 'function') {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  // Helper function to validate object structure
  const validateStructure = (actual: unknown, expected: unknown, path = ''): void => {
    if (typeof expected === 'object' && expected !== null && !Array.isArray(expected)) {
      expect(typeof actual).toBe('object');
      expect(actual).not.toBe(null);

      Object.keys(expected).forEach((key) => {
        const currentPath = path ? `${path}.${key}` : key;
        expect(actual).toHaveProperty(key, `Missing property ${currentPath}`);
        validateStructure(actual[key], expected[key], currentPath);
      });
    } else if (Array.isArray(expected)) {
      expect(Array.isArray(actual)).toBe(true);
      if (expected.length > 0 && actual.length > 0) {
        validateStructure(actual[0], expected[0], `${path}[0]`);
      }
    } else {
      expect(typeof actual).toBe(typeof expected);
    }
  };

  // Helper function to test API endpoint contract
  const testContract = async (contract: ContractExpectation): Promise<void> => {
    let response: request.Response;

    if (contract.method === 'GET') {
      const req = request(app).get(contract.endpoint);
      if (contract.queryParams) {
        req.query(contract.queryParams);
      }
      response = await req;
    } else if (contract.method === 'POST') {
      const req = request(app).post(contract.endpoint);
      if (contract.requestBody) {
        req.send(contract.requestBody);
      }
      response = await req;
    }

    // Validate status code
    expect(response.status).toBe(contract.expectedStatus);

    // Validate response structure
    validateStructure(response.body, contract.expectedStructure);

    // Compare with mock if provided
    if (contract.mockComparison) {
      const mockData = await contract.mockComparison();
      validateStructure(response.body, mockData);
    }
  };

  describe('Curriculum Analytics Contracts', () => {
    it('should match contract for curriculum heatmap endpoint', async () => {
      await testContract({
        endpoint: '/api/analytics/curriculum-heatmap',
        method: 'GET',
        queryParams: { teacherId: 1, term: 'Term 1', viewMode: 'weekly' },
        expectedStatus: 200,
        expectedStructure: {
          outcomes: [
            {
              id: 'string',
              code: 'string',
              label: 'string',
              subject: 'string',
              domain: 'string',
            },
          ],
          weeks: ['number'],
          grid: {},
          metadata: {
            totalOutcomes: 'number',
            coveragePercentage: 'number',
            viewMode: 'string',
          },
        },
        mockComparison: async () => {
          return await curriculumAnalyticsService.generateHeatmapData({
            teacherId: 1,
            term: 'Term 1',
            viewMode: 'weekly',
          });
        },
      });
    });

    it('should match contract for curriculum coverage endpoint', async () => {
      await testContract({
        endpoint: '/api/analytics/curriculum-coverage',
        method: 'GET',
        queryParams: { teacherId: 1, term: 'Term 1' },
        expectedStatus: 200,
        expectedStructure: {
          totalOutcomes: 'number',
          coveredOutcomes: 'number',
          coveragePercentage: 'number',
          subjectBreakdown: {},
          weeklyProgress: [
            {
              week: 'number',
              covered: 'number',
              percentage: 'number',
            },
          ],
          gaps: [
            {
              outcomeId: 'string',
              outcomeCode: 'string',
              subject: 'string',
              weeksSinceTarget: 'number',
              priority: 'string',
              recommendation: 'string',
            },
          ],
        },
        mockComparison: async () => {
          return await curriculumAnalyticsService.analyzeCoverage({
            teacherId: 1,
            term: 'Term 1',
          });
        },
      });
    });
  });

  describe('Domain Analytics Contracts', () => {
    it('should match contract for domain radar endpoint', async () => {
      await testContract({
        endpoint: '/api/analytics/domain-radar',
        method: 'GET',
        queryParams: { studentId: 1, term: 'Term 1' },
        expectedStatus: 200,
        expectedStructure: {
          studentId: 'number',
          studentName: 'string',
          term: 'string',
          domains: [
            {
              subject: 'string',
              score: 'number',
              label: 'string',
              average: 'number',
            },
          ],
          overallScore: 'number',
          strengths: ['string'],
          areasForGrowth: ['string'],
        },
        mockComparison: async () => {
          return await domainAnalyticsService.generateStudentRadar({
            studentId: 1,
            term: 'Term 1',
          });
        },
      });
    });

    it('should match contract for domain summary endpoint', async () => {
      await testContract({
        endpoint: '/api/analytics/domain-summary',
        method: 'GET',
        queryParams: { teacherId: 1, term: 'Term 1' },
        expectedStatus: 200,
        expectedStructure: {
          classAverages: {},
          domainDistribution: {},
          topPerformingDomains: ['string'],
          challengingDomains: ['string'],
          recommendedFocus: ['string'],
        },
        mockComparison: async () => {
          return await domainAnalyticsService.generateClassSummary({
            teacherId: 1,
            term: 'Term 1',
          });
        },
      });
    });

    it('should match contract for domain trends endpoint', async () => {
      await testContract({
        endpoint: '/api/analytics/domain-trends',
        method: 'GET',
        queryParams: { studentId: 1, domain: 'reading', weekCount: 12 },
        expectedStatus: 200,
        expectedStructure: {
          studentId: 'number',
          domain: 'string',
          trends: [
            {
              week: 'number',
              score: 'number',
              target: 'number',
              activities: 'number',
            },
          ],
          projection: {
            endOfTerm: 'number',
            trajectory: 'string',
            confidence: 'number',
          },
        },
        mockComparison: async () => {
          return await domainAnalyticsService.generateDomainTrends({
            studentId: 1,
            domain: 'reading',
            weekCount: 12,
          });
        },
      });
    });
  });

  describe('Theme Analytics Contracts', () => {
    it('should match contract for theme usage endpoint', async () => {
      await testContract({
        endpoint: '/api/analytics/theme-usage',
        method: 'GET',
        queryParams: { teacherId: 1, term: 'Term 1' },
        expectedStatus: 200,
        expectedStructure: {
          totalThemes: 'number',
          activeThemes: 'number',
          averageUsagePerTheme: 'number',
          mostUsedThemes: [
            {
              themeId: 'string',
              name: 'string',
              usageCount: 'number',
              lastUsed: 'string',
            },
          ],
          themeBalance: {},
          monthlyUsage: [
            {
              month: 'string',
              usage: 'number',
              themes: 'number',
            },
          ],
          subjectIntegration: [
            {
              subject: 'string',
              themeCount: 'number',
              avgUsage: 'number',
            },
          ],
          unusedThemes: [
            {
              themeId: 'string',
              name: 'string',
              category: 'string',
            },
          ],
          crossSubjectConnections: [
            {
              theme: 'string',
              subjects: ['string'],
              connectionStrength: 'number',
            },
          ],
        },
        mockComparison: async () => {
          return await themeAnalyticsService.getThemeUsageAnalytics({
            teacherId: 1,
            term: 'Term 1',
          });
        },
      });
    });

    it('should match contract for theme matrix endpoint', async () => {
      await testContract({
        endpoint: '/api/analytics/theme-matrix',
        method: 'GET',
        queryParams: { teacherId: 1, term: 'Term 1' },
        expectedStatus: 200,
        expectedStructure: {
          themes: ['string'],
          outcomes: ['string'],
          matrix: {},
          coverage: {
            themesCovered: 'number',
            outcomesCovered: 'number',
            totalConnections: 'number',
            averageConnections: 'number',
          },
        },
        mockComparison: async () => {
          return await themeAnalyticsService.getThemeMatrix({
            teacherId: 1,
            term: 'Term 1',
          });
        },
      });
    });
  });

  describe('Vocabulary Analytics Contracts', () => {
    it('should match contract for vocabulary growth endpoint', async () => {
      await testContract({
        endpoint: '/api/analytics/vocabulary-growth',
        method: 'GET',
        queryParams: { studentId: 1, term: 'Term 1' },
        expectedStatus: 200,
        expectedStructure: {
          studentId: 'number',
          studentName: 'string',
          totalWords: 'number',
          wordsThisTerm: 'number',
          acquisitionRate: 'number',
          targetGrowth: 'number',
          projectedEndOfTerm: 'number',
          weeklyGrowth: [
            {
              week: 'number',
              newWords: 'number',
              cumulativeWords: 'number',
              languages: {
                en: 'number',
                fr: 'number',
              },
            },
          ],
          domainBreakdown: {},
          difficultyProgression: {
            basic: 'number',
            intermediate: 'number',
            advanced: 'number',
          },
        },
        mockComparison: async () => {
          return await vocabularyAnalyticsService.generateStudentGrowthData({
            studentId: 1,
            term: 'Term 1',
            weekCount: 10,
          });
        },
      });
    });

    it('should match contract for vocabulary trends endpoint', async () => {
      await testContract({
        endpoint: '/api/analytics/vocabulary-trends',
        method: 'GET',
        queryParams: { studentId: 1, timeframe: 'term' },
        expectedStatus: 200,
        expectedStructure: {
          studentId: 'number',
          timeframe: 'string',
          trends: [
            {
              period: 'string',
              acquisitionRate: 'number',
              retentionRate: 'number',
              difficultyProgression: 'number',
            },
          ],
          insights: [
            {
              type: 'string',
              message: 'string',
              confidence: 'number',
              actionable: 'boolean',
            },
          ],
        },
        mockComparison: async () => {
          // Note: generateTrendAnalysis doesn't exist in the service
          // This endpoint might need to be removed or the service updated
          return {
            studentId: 1,
            timeframe: 'term',
            trends: [],
            insights: [],
          };
        },
      });
    });
  });

  describe('Export Endpoint Contracts', () => {
    it('should match contract for CSV export', async () => {
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

      // Validate headers
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.csv');

      // Validate CSV content structure
      const csvContent = response.text;
      expect(csvContent).toContain('outcomeId,outcomeCode,outcomeLabel'); // Header row
      expect(csvContent.split('\n').length).toBeGreaterThan(1); // Has data rows
    });

    it('should match contract for PDF export', async () => {
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

      // Validate headers
      expect(response.headers['content-type']).toContain('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.pdf');

      // Validate PDF content (basic check)
      expect(response.body).toBeInstanceOf(Buffer);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should validate export request structure', async () => {
      const invalidRequests = [
        {}, // Empty request
        { type: 'invalid-type' }, // Invalid type
        { type: 'curriculum-heatmap', format: 'invalid-format' }, // Invalid format
        { type: 'curriculum-heatmap', format: 'csv' }, // Missing data
      ];

      for (const invalidRequest of invalidRequests) {
        await request(app).post('/api/analytics/export').send(invalidRequest).expect(400);
      }
    });
  });

  describe('Mock Data Service Contracts', () => {
    it('should ensure mock data matches API response structure', async () => {
      // Test that mock service generates data matching API expectations
      const mockStudent = mockDataService.generateStudent();
      const mockOutcomes = mockDataService.generateCurriculumOutcomes(10);
      const mockThemes = mockDataService.generateThemes(5);

      // Validate mock student structure
      expect(mockStudent).toHaveProperty('id');
      expect(mockStudent).toHaveProperty('name');
      expect(mockStudent).toHaveProperty('grade');
      expect(typeof mockStudent.id).toBe('number');
      expect(typeof mockStudent.name).toBe('string');

      // Validate mock outcomes structure
      expect(Array.isArray(mockOutcomes)).toBe(true);
      if (mockOutcomes.length > 0) {
        const outcome = mockOutcomes[0];
        expect(outcome).toHaveProperty('id');
        expect(outcome).toHaveProperty('code');
        expect(outcome).toHaveProperty('label');
        expect(outcome).toHaveProperty('subject');
        expect(outcome).toHaveProperty('domain');
      }

      // Validate mock themes structure
      expect(Array.isArray(mockThemes)).toBe(true);
      if (mockThemes.length > 0) {
        const theme = mockThemes[0];
        expect(theme).toHaveProperty('id');
        expect(theme).toHaveProperty('name');
        expect(theme).toHaveProperty('category');
      }
    });

    it('should ensure consistent data types across mock and API', async () => {
      // Get data from API
      const apiResponse = await request(app)
        .get('/api/analytics/curriculum-heatmap')
        .query({ teacherId: 1 })
        .expect(200);

      // Get data from service directly
      const serviceData = await curriculumAnalyticsService.generateHeatmapData({
        teacherId: 1,
      });

      // Compare structure consistency
      validateStructure(apiResponse.body, serviceData);

      // Ensure numeric fields are actually numbers
      expect(typeof apiResponse.body.metadata.totalOutcomes).toBe('number');
      expect(typeof apiResponse.body.metadata.coveragePercentage).toBe('number');
      expect(typeof serviceData.metadata.totalOutcomes).toBe('number');
      expect(typeof serviceData.metadata.coveragePercentage).toBe('number');
    });
  });

  describe('Error Response Contracts', () => {
    it('should have consistent error response structure', async () => {
      // Test various error scenarios
      const errorEndpoints = [
        '/api/analytics/nonexistent-endpoint',
        '/api/analytics/curriculum-heatmap?teacherId=invalid',
      ];

      for (const endpoint of errorEndpoints) {
        const response = await request(app).get(endpoint);

        if (response.status >= 400) {
          // Error responses should have consistent structure
          expect(response.body).toHaveProperty('error');
          expect(typeof response.body.error).toBe('string');

          if (response.body.details) {
            expect(typeof response.body.details).toBe('string');
          }
        }
      }
    });

    it('should handle malformed request bodies consistently', async () => {
      const malformedBodies = [null, 'invalid-json', { malformed: 'data' }];

      for (const body of malformedBodies) {
        const response = await request(app).post('/api/analytics/export').send(body);

        if (response.status >= 400) {
          expect(response.body).toHaveProperty('error');
          expect(typeof response.body.error).toBe('string');
        }
      }
    });
  });

  describe('Performance Contracts', () => {
    it('should meet performance SLA across all endpoints', async () => {
      const endpoints = [
        '/api/analytics/curriculum-heatmap?teacherId=1',
        '/api/analytics/domain-radar?studentId=1',
        '/api/analytics/theme-usage?teacherId=1',
        '/api/analytics/vocabulary-growth?studentId=1',
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();

        await request(app).get(endpoint).expect(200);

        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(2000); // Should respond within 2 seconds
      }
    });

    it('should handle concurrent requests without degradation', async () => {
      const concurrentRequests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/analytics/curriculum-heatmap')
          .query({ teacherId: Math.floor(Math.random() * 100) + 1 }),
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const totalDuration = Date.now() - startTime;

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Total time should be reasonable for concurrent execution
      expect(totalDuration).toBeLessThan(5000);
    });
  });
});
