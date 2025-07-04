import { Verifier } from '@pact-foundation/pact';
import path from 'path';
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import { prisma } from '../../prisma.js';
import { createTestUser, generateAuthToken } from '../security/utils/security-test-utilities.js';
import { server } from '../../index.js';
import type { Server } from 'http';

describe('ETFO Lesson Plans Provider Contract Tests', () => {
  let httpServer: Server;
  let testUserId: number;
  let testToken: string;

  beforeAll(async () => {
    // Start the server
    await new Promise<void>((resolve) => {
      httpServer = server.listen(3000, () => {
        console.log('Test server started on port 3000');
        resolve();
      });
    });

    // Create test user and generate token
    const user = await createTestUser();
    testUserId = user.id;
    testToken = generateAuthToken(user.id);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId: testUserId } });
    await prisma.unitPlan.deleteMany({ where: { longRangePlan: { userId: testUserId } } });
    await prisma.longRangePlan.deleteMany({ where: { userId: testUserId } });
    await prisma.user.delete({ where: { id: testUserId } });

    // Close server
    await new Promise<void>((resolve) => {
      httpServer.close(() => {
        console.log('Test server closed');
        resolve();
      });
    });
  });

  it('should verify the ETFO lesson plans contract', async () => {
    const verifierOptions = {
      provider: 'TeachingEngineServer',
      providerBaseUrl: 'http://localhost:3000',
      pactUrls: [
        path.resolve(
          __dirname,
          '../../../../client/pacts/teachingengineclient-teachingengineserver.json'
        ),
      ],
      logLevel: 'warn' as const,
      providerVersion: '0.0.0',
      stateHandlers: {
        'a lesson plan exists': async () => {
          // Create test data for lesson plan
          const longRangePlan = await prisma.longRangePlan.create({
            data: {
              title: 'Test Long Range Plan',
              academicYear: '2023-2024',
              grade: 3,
              subject: 'Mathematics',
              userId: testUserId,
            },
          });

          const unitPlan = await prisma.unitPlan.create({
            data: {
              title: 'Fractions Unit',
              longRangePlanId: longRangePlan.id,
              startDate: new Date('2024-01-01'),
              endDate: new Date('2024-01-31'),
            },
          });

          const lessonPlan = await prisma.eTFOLessonPlan.create({
            data: {
              id: 'cuid123456789',
              title: 'Introduction to Fractions',
              titleFr: 'Introduction aux fractions',
              unitPlanId: unitPlan.id,
              userId: testUserId,
              date: new Date('2024-01-15'),
              duration: 60,
              mindsOn: 'Quick review of whole numbers',
              action: 'Students work with fraction manipulatives',
              consolidation: 'Exit ticket with fraction problems',
              learningGoals: 'Students will understand basic fractions',
              materials: ['Fraction tiles'],
              grouping: 'Pairs and small groups',
              accommodations: ['Visual aids for ELL students'],
              modifications: ['Simplified fractions for IEP students'],
              extensions: ['Complex fraction problems for advanced students'],
              assessmentType: 'formative',
              assessmentNotes: 'Observe student work with manipulatives',
              isSubFriendly: true,
              subNotes: 'All materials are in the blue bin',
            },
          });

          // Add expectations
          const expectation = await prisma.curriculumExpectation.create({
            data: {
              id: 'exp123',
              code: 'NA1.2',
              description: 'Represent and describe whole numbers',
              strand: 'Number',
              grade: 3,
              subject: 'Mathematics',
            },
          });

          await prisma.eTFOLessonPlanExpectation.create({
            data: {
              lessonPlanId: lessonPlan.id,
              expectationId: expectation.id,
            },
          });

          // Add resources
          await prisma.eTFOLessonPlanResource.create({
            data: {
              id: 'res123',
              lessonPlanId: lessonPlan.id,
              name: 'Fraction Worksheet',
              type: 'document',
              url: 'https://example.com/worksheet.pdf',
            },
          });

          return {
            description: 'Lesson plan test data created',
          };
        },
        'user is authenticated': async () => {
          // User is already created in beforeAll
          return {
            description: 'User is authenticated with valid token',
          };
        },
      },
      requestFilter: (req: any, res: any, next: any) => {
        // Replace the test token with the actual token
        if (req.headers.authorization === 'Bearer test-token') {
          req.headers.authorization = `Bearer ${testToken}`;
        }
        next();
      },
      // Enable pending pacts (for CI/CD)
      enablePending: true,
      // Publish verification results to broker (if configured)
      publishVerificationResult: process.env.CI === 'true',
    };

    const verifier = new Verifier(verifierOptions);

    try {
      await verifier.verifyProvider();
      console.log('Pact verification complete!');
    } catch (error) {
      console.error('Pact verification failed:', error);
      throw error;
    }
  }, 60000); // 60 second timeout for provider tests
});