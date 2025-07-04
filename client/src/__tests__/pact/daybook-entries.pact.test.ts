import { describe, it, expect, beforeAll } from 'vitest';
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { pactConfig, createInteractionUrl } from './setup';
import axios from 'axios';

const { like, eachLike, datetime, string, integer, boolean, regex } = MatchersV3;

const provider = new PactV3({
  consumer: pactConfig.consumer,
  provider: pactConfig.provider,
  port: pactConfig.port,
  dir: pactConfig.dir,
  logLevel: pactConfig.logLevel as unknown,
  spec: pactConfig.spec,
  cors: pactConfig.cors,
});

describe('Daybook Entries API Contract Tests', () => {
  beforeAll(async () => {
    // Setup is handled internally by PactV3
  });
  // Cleanup is handled internally by PactV3

  describe('GET /api/daybook-entries', () => {
    it('should return a list of daybook entries', async () => {
      const expectedResponse = {
        daybookEntries: eachLike({
          id: string('daybook123'),
          date: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-15T00:00:00.000Z'),
          lessonPlanId: string('lesson123'),
          lessonPlan: like({
            id: string('lesson123'),
            title: string('Introduction to Fractions'),
            unitPlanId: string('unit123'),
          }),
          whatWorked: string('Students engaged well with manipulatives'),
          whatDidntWork: string('Timing was too tight for consolidation'),
          nextSteps: string('Review fractions in next lesson'),
          studentEngagement: string('High - students were excited about hands-on activities'),
          studentChallenges: string('Some struggled with equivalent fractions'),
          studentSuccesses: string('Most could identify simple fractions'),
          notes: string('Consider more time for practice'),
          overallRating: integer(4),
          wouldReuseLesson: boolean(true),
          expectations: eachLike({
            expectationId: string('exp123'),
            coverage: regex(/^(introduced|developing|consolidated)$/, 'developing'),
            expectation: like({
              id: string('exp123'),
              code: string('NA1.2'),
              description: string('Represent and describe whole numbers'),
            }),
          }),
          _count: like({
            expectations: integer(2),
          }),
        }),
        pagination: like({
          total: integer(10),
          limit: integer(20),
          offset: integer(0),
          hasMore: boolean(false),
        }),
      };

      await provider
        .uponReceiving('a request for daybook entries')
        .withRequest({
          method: 'GET',
          path: '/api/daybook-entries',
          query: {
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-01-31T23:59:59.999Z',
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
            createInteractionUrl('/api/daybook-entries'),
            {
              params: {
                startDate: '2024-01-01T00:00:00.000Z',
                endDate: '2024-01-31T23:59:59.999Z',
                limit: 20,
                offset: 0,
              },
              headers: {
                Authorization: 'Bearer test-token',
              },
            }
          );

          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty('daybookEntries');
          expect(response.data).toHaveProperty('pagination');
          expect(Array.isArray(response.data.daybookEntries)).toBe(true);
        });
    });

    it('should filter daybook entries by rating', async () => {
      const expectedResponse = {
        daybookEntries: eachLike({
          id: string('daybook456'),
          date: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-20T00:00:00.000Z'),
          overallRating: integer(5),
          wouldReuseLesson: boolean(true),
          whatWorked: string('Excellent lesson - students fully engaged'),
        }),
        pagination: like({
          total: integer(3),
          limit: integer(10),
          offset: integer(0),
          hasMore: boolean(false),
        }),
      };

      await provider
        .uponReceiving('a request for highly-rated daybook entries')
        .withRequest({
          method: 'GET',
          path: '/api/daybook-entries',
          query: {
            rating: '5',
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
            createInteractionUrl('/api/daybook-entries'),
            {
              params: {
                rating: 5,
                limit: 10,
                offset: 0,
              },
              headers: {
                Authorization: 'Bearer test-token',
              },
            }
          );

          expect(response.status).toBe(200);
          expect(response.data.daybookEntries).toBeDefined();
        });
    });
  });

  describe('POST /api/daybook-entries', () => {
    it('should create a new daybook entry', async () => {
      const newDaybookEntry = {
        date: '2024-01-16T00:00:00.000Z',
        lessonPlanId: 'lesson123',
        whatWorked: 'Group discussions were very productive',
        whatDidntWork: 'Technology issues with projector',
        nextSteps: 'Continue with advanced fraction concepts',
        studentEngagement: 'Good overall, some students needed extra support',
        studentChallenges: 'Mixed numbers were challenging',
        studentSuccesses: 'All students could work with simple fractions',
        notes: 'Remember to check tech before class',
        overallRating: 4,
        wouldReuseLesson: true,
        expectationCoverage: [
          { expectationId: 'exp123', coverage: 'developing' },
          { expectationId: 'exp456', coverage: 'introduced' },
        ],
      };

      const expectedResponse = {
        id: string('daybook-new-123'),
        ...newDaybookEntry,
        date: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', newDaybookEntry.date),
        userId: integer(1),
        expectations: eachLike({
          expectationId: string('exp123'),
          coverage: string('developing'),
          expectation: like({
            id: string('exp123'),
            code: string('NA1.2'),
            description: string('Represent and describe whole numbers'),
          }),
        }),
        createdAt: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-16T12:00:00.000Z'),
        updatedAt: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-16T12:00:00.000Z'),
      };

      await provider
        .given('user is authenticated and lesson plan exists')
        .uponReceiving('a request to create a daybook entry')
        .withRequest({
          method: 'POST',
          path: '/api/daybook-entries',
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: newDaybookEntry,
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
            createInteractionUrl('/api/daybook-entries'),
            newDaybookEntry,
            {
              headers: {
                Authorization: 'Bearer test-token',
                'Content-Type': 'application/json',
              },
            }
          );

          expect(response.status).toBe(201);
          expect(response.data.id).toBeDefined();
          expect(response.data.overallRating).toBe(newDaybookEntry.overallRating);
        });
    });
  });

  describe('PUT /api/daybook-entries/:id', () => {
    it('should update an existing daybook entry', async () => {
      const daybookId = 'daybook123';
      const updateData = {
        whatWorked: 'Updated: Students really understood the concept',
        overallRating: 5,
        notes: 'One of the best lessons this term',
      };

      const expectedResponse = {
        id: string(daybookId),
        ...updateData,
        date: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-15T00:00:00.000Z'),
        lessonPlanId: string('lesson123'),
        updatedAt: datetime('yyyy-MM-ddTHH:mm:ss.SSSX', '2024-01-17T00:00:00.000Z'),
      };

      await provider
        .given('a daybook entry exists')
        .uponReceiving('a request to update a daybook entry')
        .withRequest({
          method: 'PUT',
          path: `/api/daybook-entries/${daybookId}`,
          headers: {
            Authorization: 'Bearer test-token',
            'Content-Type': 'application/json',
          },
          body: updateData,
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: expectedResponse,
        })
        .executeTest(async (mockService) => {
          const response = await axios.put(
            createInteractionUrl(`/api/daybook-entries/${daybookId}`),
            updateData,
            {
              headers: {
                Authorization: 'Bearer test-token',
                'Content-Type': 'application/json',
              },
            }
          );

          expect(response.status).toBe(200);
          expect(response.data.whatWorked).toBe(updateData.whatWorked);
          expect(response.data.overallRating).toBe(updateData.overallRating);
        });
    });
  });
});