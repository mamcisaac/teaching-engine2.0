import { describe, it, expect, beforeAll } from 'vitest';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import { pactConfig, createInteractionUrl } from './setup';
import axios from 'axios';

const { like, eachLike, datetime, string, integer, boolean, regex } = MatchersV3;

// Create a new Pact instance
const provider = new PactV3({
  consumer: pactConfig.consumer,
  provider: pactConfig.provider,
  port: pactConfig.port,
  dir: pactConfig.dir,
  logLevel: pactConfig.logLevel as unknown,
  spec: pactConfig.spec,
  cors: pactConfig.cors,
});

describe('ETFO Lesson Plans API Contract Tests', () => {
  beforeAll(async () => {
    // Setup is handled internally by PactV3
  });
  // Cleanup is handled internally by PactV3
  // Note: PactV3 doesn't require afterEach verify

  describe('GET /api/etfo-lesson-plans', () => {
    it('should return a list of lesson plans', async () => {
      const expectedResponse = {
        lessonPlans: eachLike({
          id: string('cuid123456789'),
          title: string('Introduction to Fractions'),
          titleFr: string('Introduction aux fractions'),
          unitPlanId: string('unit123'),
          date: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-15T00:00:00.000Z'),
          duration: integer(60),
          mindsOn: string('Quick review of whole numbers'),
          action: string('Students work with fraction manipulatives'),
          consolidation: string('Exit ticket with fraction problems'),
          learningGoals: string('Students will understand basic fractions'),
          materials: eachLike(string('Fraction tiles')),
          grouping: string('Pairs and small groups'),
          accommodations: eachLike(string('Visual aids for ELL students')),
          modifications: eachLike(string('Simplified fractions for IEP students')),
          extensions: eachLike(string('Complex fraction problems for advanced students')),
          assessmentType: regex(/^(diagnostic|formative|summative)$/, 'formative'),
          assessmentNotes: string('Observe student work with manipulatives'),
          isSubFriendly: boolean(true),
          subNotes: string('All materials are in the blue bin'),
          expectations: eachLike({
            expectation: like({
              id: string('exp123'),
              code: string('NA1.2'),
              description: string('Represent and describe whole numbers'),
              strand: string('Number'),
              grade: integer(3),
              subject: string('Mathematics'),
            }),
          }),
          _count: like({
            expectations: integer(2),
            resources: integer(3),
          }),
        }),
        pagination: like({
          total: integer(15),
          limit: integer(20),
          offset: integer(0),
          hasMore: boolean(false),
        }),
      };

      await provider
        .uponReceiving('a request for lesson plans')
        .withRequest({
          method: 'GET',
          path: '/api/etfo-lesson-plans',
          query: {
            unitPlanId: 'unit123',
            limit: '20',
            offset: '0',
          },
          headers: {
            Authorization: 'Bearer test-token',
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedResponse,
        })
        .executeTest(async (mockService) => {
          // Make the actual request
          const response = await axios.get(
            createInteractionUrl('/api/etfo-lesson-plans'),
            {
              params: {
                unitPlanId: 'unit123',
                limit: 20,
                offset: 0,
              },
              headers: {
                Authorization: 'Bearer test-token',
              },
            }
          );

          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty('lessonPlans');
          expect(response.data).toHaveProperty('pagination');
          expect(Array.isArray(response.data.lessonPlans)).toBe(true);
        });
    });

    it('should filter lesson plans by date range', async () => {
      const expectedResponse = {
        lessonPlans: eachLike({
          id: string('cuid123456789'),
          title: string('Lesson within date range'),
          date: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-20T00:00:00.000Z'),
          unitPlanId: string('unit123'),
          duration: integer(45),
          isSubFriendly: boolean(false),
        }),
        pagination: like({
          total: integer(5),
          limit: integer(10),
          offset: integer(0),
          hasMore: boolean(false),
        }),
      };

      await provider
        .uponReceiving('a request for lesson plans with date filter')
        .withRequest({
          method: 'GET',
          path: '/api/etfo-lesson-plans',
          query: {
            startDate: '2024-01-15T00:00:00.000Z',
            endDate: '2024-01-31T23:59:59.999Z',
            limit: '10',
            offset: '0',
          },
          headers: {
            Authorization: 'Bearer test-token',
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedResponse,
        })
        .executeTest(async (mockService) => {
          const response = await axios.get(
            createInteractionUrl('/api/etfo-lesson-plans'),
            {
              params: {
                startDate: '2024-01-15T00:00:00.000Z',
                endDate: '2024-01-31T23:59:59.999Z',
                limit: 10,
                offset: 0,
              },
              headers: {
                Authorization: 'Bearer test-token',
              },
            }
          );

          expect(response.status).toBe(200);
          expect(response.data.lessonPlans).toBeDefined();
        });
    });
  });

  describe('GET /api/etfo-lesson-plans/:id', () => {
    it('should return a single lesson plan', async () => {
      const lessonPlanId = 'cuid123456789';
      const expectedResponse = {
        id: string(lessonPlanId),
        title: string('Introduction to Fractions'),
        titleFr: string('Introduction aux fractions'),
        unitPlanId: string('unit123'),
        unitPlan: like({
          id: string('unit123'),
          title: string('Fractions Unit'),
          longRangePlanId: string('lrp123'),
        }),
        date: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-15T00:00:00.000Z'),
        duration: integer(60),
        mindsOn: string('Quick review of whole numbers'),
        action: string('Students work with fraction manipulatives'),
        consolidation: string('Exit ticket with fraction problems'),
        learningGoals: string('Students will understand basic fractions'),
        materials: eachLike(string('Fraction tiles')),
        grouping: string('Pairs and small groups'),
        isSubFriendly: boolean(true),
        expectations: eachLike({
          expectation: like({
            id: string('exp123'),
            code: string('NA1.2'),
            description: string('Represent and describe whole numbers'),
          }),
        }),
        resources: eachLike({
          id: string('res123'),
          name: string('Fraction Worksheet'),
          type: regex(/^(website|document|video|image|other)$/, 'document'),
          url: string('https://example.com/worksheet.pdf'),
        }),
      };

      await provider
        .given('a lesson plan exists')
        .uponReceiving('a request for a specific lesson plan')
        .withRequest({
          method: 'GET',
          path: `/api/etfo-lesson-plans/${lessonPlanId}`,
          headers: {
            Authorization: 'Bearer test-token',
          },
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedResponse,
        })
        .executeTest(async (mockService) => {
          const response = await axios.get(
            createInteractionUrl(`/api/etfo-lesson-plans/${lessonPlanId}`),
            {
              headers: {
                Authorization: 'Bearer test-token',
              },
            }
          );

          expect(response.status).toBe(200);
          expect(response.data.id).toBe(lessonPlanId);
          expect(response.data.title).toBeDefined();
        });
    });
  });

  describe('POST /api/etfo-lesson-plans', () => {
    it('should create a new lesson plan', async () => {
      const newLessonPlan = {
        title: 'Introduction to Multiplication',
        unitPlanId: 'unit123',
        date: '2024-02-01T00:00:00.000Z',
        duration: 45,
        mindsOn: 'Review addition facts',
        action: 'Introduce multiplication as repeated addition',
        consolidation: 'Practice problems',
        learningGoals: 'Students will understand multiplication',
        materials: ['Counters', 'Multiplication chart'],
        grouping: 'Whole class then pairs',
        isSubFriendly: false,
        expectationIds: ['exp456', 'exp789'],
      };

      const expectedResponse = {
        id: string('newcuid123'),
        ...newLessonPlan,
        date: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', newLessonPlan.date),
        userId: integer(1),
        expectations: eachLike({
          expectationId: string('exp456'),
          expectation: like({
            id: string('exp456'),
            code: string('NA2.1'),
            description: string('Understand multiplication concepts'),
          }),
        }),
        createdAt: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-10T00:00:00.000Z'),
        updatedAt: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-10T00:00:00.000Z'),
      };

      await provider
        .given('user is authenticated')
        .uponReceiving('a request to create a lesson plan')
        .withRequest({
          method: 'POST',
          path: '/api/etfo-lesson-plans',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: newLessonPlan,
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedResponse,
        })
        .executeTest(async (mockService) => {
          const response = await axios.post(
            createInteractionUrl('/api/etfo-lesson-plans'),
            newLessonPlan,
            {
              headers: {
                Authorization: 'Bearer test-token',
                'Content-Type': 'application/json',
              },
            }
          );

          expect(response.status).toBe(201);
          expect(response.data.id).toBeDefined();
          expect(response.data.title).toBe(newLessonPlan.title);
        });
    });
  });
});