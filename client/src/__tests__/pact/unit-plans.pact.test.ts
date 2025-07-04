import { describe, it, expect, beforeAll } from 'vitest';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { pactConfig, createInteractionUrl } from './setup';
import axios from 'axios';

const { like, eachLike, datetime, string, integer, boolean } = MatchersV3;

const provider = new PactV3({
  consumer: pactConfig.consumer,
  provider: pactConfig.provider,
  port: pactConfig.port,
  dir: pactConfig.dir,
  logLevel: pactConfig.logLevel as unknown,
  spec: pactConfig.spec,
  cors: pactConfig.cors,
});

describe('Unit Plans API Contract Tests', () => {
  beforeAll(async () => {
    // Setup is handled internally by PactV3
  });
  // Cleanup is handled internally by PactV3
  // Note: PactV3 doesn't require afterEach verify

  describe('GET /api/unit-plans', () => {
    it('should return a list of unit plans', async () => {
      const expectedResponse = {
        unitPlans: eachLike({
          id: string('unit123'),
          title: string('Fractions and Decimals'),
          titleFr: string('Fractions et décimales'),
          longRangePlanId: string('lrp123'),
          description: string('Understanding fractions and decimal relationships'),
          bigIdeas: string('Fractions represent parts of a whole'),
          essentialQuestions: eachLike(string('How do fractions relate to everyday life?')),
          startDate: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-01T00:00:00.000Z'),
          endDate: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-31T00:00:00.000Z'),
          estimatedHours: integer(20),
          assessmentPlan: string('Formative and summative assessments throughout'),
          successCriteria: eachLike(string('Students can identify fractions in real-world contexts')),
          crossCurricularConnections: string('Science: Measuring ingredients'),
          learningSkills: eachLike(string('Collaboration')),
          culminatingTask: string('Design a recipe using fractions'),
          keyVocabulary: eachLike(string('numerator')),
          _count: like({
            lessonPlans: integer(8),
            expectations: integer(5),
            resources: integer(12),
          }),
          progress: like({
            total: integer(8),
            completed: integer(3),
            percentage: integer(37),
          }),
        }),
        pagination: like({
          total: integer(4),
          limit: integer(20),
          offset: integer(0),
          hasMore: boolean(false),
        }),
      };

      await provider
        .uponReceiving('a request for unit plans')
        .withRequest({
          method: 'GET',
          path: '/api/unit-plans',
          query: {
            longRangePlanId: 'lrp123',
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
          const response = await axios.get(
            createInteractionUrl('/api/unit-plans'),
            {
              params: {
                longRangePlanId: 'lrp123',
                limit: 20,
                offset: 0,
              },
              headers: {
                Authorization: 'Bearer test-token',
              },
            }
          );

          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty('unitPlans');
          expect(response.data).toHaveProperty('pagination');
          expect(Array.isArray(response.data.unitPlans)).toBe(true);
        });
    });
  });

  describe('POST /api/unit-plans', () => {
    it('should create a new unit plan', async () => {
      const newUnitPlan = {
        title: 'Geometry Basics',
        longRangePlanId: 'lrp123',
        description: 'Introduction to basic geometric shapes and properties',
        bigIdeas: 'Shapes have specific properties that define them',
        essentialQuestions: ['What makes a shape unique?', 'How do we measure shapes?'],
        startDate: '2024-02-01T00:00:00.000Z',
        endDate: '2024-02-28T00:00:00.000Z',
        estimatedHours: 15,
        assessmentPlan: 'Weekly quizzes and hands-on activities',
        successCriteria: ['Identify basic shapes', 'Calculate perimeter and area'],
        expectationIds: ['exp-geo-1', 'exp-geo-2'],
      };

      const expectedResponse = {
        id: string('unit-new-123'),
        ...newUnitPlan,
        startDate: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', newUnitPlan.startDate),
        endDate: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', newUnitPlan.endDate),
        expectations: eachLike({
          expectationId: string('exp-geo-1'),
          expectation: like({
            id: string('exp-geo-1'),
            code: string('GE1.1'),
            description: string('Identify and describe shapes'),
          }),
        }),
        createdAt: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-10T00:00:00.000Z'),
        updatedAt: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-10T00:00:00.000Z'),
      };

      await provider
        .given('user is authenticated and long range plan exists')
        .uponReceiving('a request to create a unit plan')
        .withRequest({
          method: 'POST',
          path: '/api/unit-plans',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: newUnitPlan,
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
            createInteractionUrl('/api/unit-plans'),
            newUnitPlan,
            {
              headers: {
                Authorization: 'Bearer test-token',
                'Content-Type': 'application/json',
              },
            }
          );

          expect(response.status).toBe(201);
          expect(response.data.id).toBeDefined();
          expect(response.data.title).toBe(newUnitPlan.title);
        });
    });
  });
});