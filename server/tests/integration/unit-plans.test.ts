/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import request from 'supertest';
import { describe, beforeAll, beforeEach, afterEach, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import { getIntegrationTestPrismaClient, cleanIntegrationTestData } from '../integration-test-setup';
import { resetRateLimiterState } from '../../src/middleware/rateLimiter';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Unit Plans CRUD Operations', () => {
  let prisma: ReturnType<typeof getIntegrationTestPrismaClient>;
  let authToken: string;
  let otherUserToken: string;
  let userId: number;
  let otherUserId: number;
  let testUser: unknown;
  let otherUser: unknown;
  let testExpectation1: unknown;
  let testExpectation2: unknown;
  let testExpectation3: unknown;
  let testLongRangePlan: unknown;
  let otherUserLongRangePlan: unknown;
  let testUnitPlan: unknown;

  beforeAll(async () => {
    prisma = getIntegrationTestPrismaClient();
  });

  beforeEach(async () => {
    // Clean up test data using the unified helper
    await cleanIntegrationTestData();
    
    // Reset rate limiter to avoid 429 errors
    resetRateLimiterState();

    // Create test users
    const hashedPassword = await bcrypt.hash('test123', 10);
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
        password: hashedPassword,
        name: 'Test Teacher',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
    userId = testUser.id;

    otherUser = await prisma.user.create({
      data: {
        email: `other-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
        password: hashedPassword,
        name: 'Other Teacher',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
    otherUserId = otherUser.id;

    // Create auth tokens
    const secret = process.env.JWT_SECRET || 'test-secret-key';
    authToken = jwt.sign({ 
      userId: String(userId), 
      email: testUser.email,
      iat: Math.floor(Date.now() / 1000)
    }, secret, { expiresIn: '1h' });

    otherUserToken = jwt.sign({ 
      userId: String(otherUserId), 
      email: otherUser.email,
      iat: Math.floor(Date.now() / 1000)
    }, secret, { expiresIn: '1h' });

    // Create test curriculum expectations
    testExpectation1 = await prisma.curriculumExpectation.create({
      data: {
        code: 'MATH-5.1',
        description: 'Test expectation 1 for unit planning',
        descriptionFr: 'Test expectation 1 FR',
        strand: 'Number Sense',
        substrand: 'Counting and Cardinality',
        grade: 5,
        subject: 'Mathematics',
      },
    });

    testExpectation2 = await prisma.curriculumExpectation.create({
      data: {
        code: 'MATH-5.2',
        description: 'Test expectation 2 for unit planning',
        descriptionFr: 'Test expectation 2 FR',
        strand: 'Algebra',
        substrand: 'Patterns and Relationships',
        grade: 5,
        subject: 'Mathematics',
      },
    });

    testExpectation3 = await prisma.curriculumExpectation.create({
      data: {
        code: 'MATH-5.3',
        description: 'Test expectation 3 for unit planning',
        descriptionFr: 'Test expectation 3 FR',
        strand: 'Geometry',
        substrand: 'Shapes and Space',
        grade: 5,
        subject: 'Mathematics',
      },
    });

    // Create a default long-range plan for unit tests
    testLongRangePlan = await prisma.longRangePlan.create({
      data: {
        userId,
        title: 'Grade 5 Mathematics Long Range Plan',
        titleFr: 'Plan à long terme de mathématiques 5e année',
        academicYear: '2024-2025',
        term: 'Full Year',
        grade: 5,
        subject: 'Mathematics',
        description: 'Full year mathematics planning',
        goals: 'Build strong mathematical foundations',
      },
    });

    // Create a long-range plan for another user
    otherUserLongRangePlan = await prisma.longRangePlan.create({
      data: {
        userId: otherUserId,
        title: 'Other User Math Plan',
        academicYear: '2024-2025',
        term: 'Full Year',
        grade: 5,
        subject: 'Mathematics',
      },
    });

    // Create a default unit plan for update/delete tests
    testUnitPlan = await prisma.unitPlan.create({
      data: {
        userId,
        title: 'Number Sense Unit',
        titleFr: 'Unité du sens des nombres',
        longRangePlanId: testLongRangePlan.id,
        description: 'Introduction to fractions and decimals',
        bigIdeas: 'Numbers can be represented in multiple ways',
        essentialQuestions: ['How are fractions and decimals related?', 'When do we use different number representations?'],
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-10-15'),
        estimatedHours: 30,
        assessmentPlan: 'Formative assessments throughout, summative test at end',
        successCriteria: ['Can convert between fractions and decimals', 'Can compare and order rational numbers'],
        learningSkills: ['Responsibility', 'Organization'],
        keyVocabulary: ['fraction', 'decimal', 'numerator', 'denominator'],
      },
    });

    // Link expectations to the test unit plan
    await prisma.unitPlanExpectation.createMany({
      data: [
        { unitPlanId: testUnitPlan.id, expectationId: testExpectation1.id },
        { unitPlanId: testUnitPlan.id, expectationId: testExpectation2.id },
      ],
    });
  });

  afterEach(async () => {
    await cleanIntegrationTestData();
    resetRateLimiterState();
  });

  describe('CREATE /api/unit-plans', () => {
    it('should create a new unit plan with all required fields', async () => {
      const newUnitPlan = {
        title: 'Algebra Unit',
        titleFr: 'Unité d\'algèbre',
        longRangePlanId: testLongRangePlan.id,
        description: 'Introduction to algebraic thinking',
        bigIdeas: 'Patterns help us understand relationships',
        essentialQuestions: ['What patterns exist in our world?', 'How can we represent patterns?'],
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-12-15T00:00:00.000Z',
        estimatedHours: 25,
        assessmentPlan: 'Performance tasks and observations',
        successCriteria: ['Can identify patterns', 'Can extend patterns'],
        expectationIds: [testExpectation2.id, testExpectation3.id],
        crossCurricularConnections: 'Science: patterns in nature',
        learningSkills: ['Initiative', 'Collaboration'],
        culminatingTask: 'Create a pattern book',
        keyVocabulary: ['pattern', 'sequence', 'rule'],
        priorKnowledge: 'Basic counting and number sense',
        parentCommunicationPlan: 'Monthly newsletter updates',
        differentiationStrategies: {
          forStruggling: ['Use manipulatives', 'Peer support'],
          forAdvanced: ['Create complex patterns', 'Lead discussions'],
          forELL: ['Visual supports', 'Vocabulary pre-teaching'],
          forIEP: ['Modified expectations', 'Extra time'],
        },
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUnitPlan)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId,
        title: 'Algebra Unit',
        titleFr: 'Unité d\'algèbre',
        longRangePlanId: testLongRangePlan.id,
        description: 'Introduction to algebraic thinking',
        bigIdeas: 'Patterns help us understand relationships',
        essentialQuestions: ['What patterns exist in our world?', 'How can we represent patterns?'],
        estimatedHours: 25,
        assessmentPlan: 'Performance tasks and observations',
        successCriteria: ['Can identify patterns', 'Can extend patterns'],
        crossCurricularConnections: 'Science: patterns in nature',
        learningSkills: ['Initiative', 'Collaboration'],
        culminatingTask: 'Create a pattern book',
        keyVocabulary: ['pattern', 'sequence', 'rule'],
        priorKnowledge: 'Basic counting and number sense',
        parentCommunicationPlan: 'Monthly newsletter updates',
        differentiationStrategies: {
          forStruggling: ['Use manipulatives', 'Peer support'],
          forAdvanced: ['Create complex patterns', 'Lead discussions'],
          forELL: ['Visual supports', 'Vocabulary pre-teaching'],
          forIEP: ['Modified expectations', 'Extra time'],
        },
        longRangePlan: {
          id: testLongRangePlan.id,
          title: 'Grade 5 Mathematics Long Range Plan',
          subject: 'Mathematics',
          grade: 5,
        },
        _count: {
          lessonPlans: 0,
          expectations: 2,
        },
      });

      // Verify expectations were linked
      const linkedExpectations = await prisma.unitPlanExpectation.findMany({
        where: { unitPlanId: response.body.id },
      });
      expect(linkedExpectations).toHaveLength(2);
      expect(linkedExpectations.map(e => e.expectationId).sort()).toEqual(
        [testExpectation2.id, testExpectation3.id].sort()
      );
    });

    it('should create a unit plan with minimal required fields', async () => {
      const minimalUnitPlan = {
        title: 'Minimal Unit',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: [testExpectation1.id],
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(minimalUnitPlan)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId,
        title: 'Minimal Unit',
        longRangePlanId: testLongRangePlan.id,
        essentialQuestions: [],
        successCriteria: [],
        learningSkills: [],
        keyVocabulary: [],
        differentiationStrategies: null,
      });
    });

    it('should validate title length and content', async () => {
      const invalidTitle = {
        title: '<script>alert("XSS")</script>',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: [testExpectation1.id],
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTitle)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(JSON.stringify(response.body.errors)).toContain('Title cannot contain HTML tags');
    });

    it('should require at least one curriculum expectation', async () => {
      const noExpectations = {
        title: 'Unit Without Expectations',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: [],
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(noExpectations)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(JSON.stringify(response.body.errors)).toContain('At least one curriculum expectation must be selected');
    });

    it('should validate date formats', async () => {
      const invalidDates = {
        title: 'Invalid Date Unit',
        longRangePlanId: testLongRangePlan.id,
        startDate: 'invalid-date',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: [testExpectation1.id],
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDates)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should validate array field limits', async () => {
      const tooManyExpectations = {
        title: 'Too Many Expectations',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: Array(51).fill(testExpectation1.id), // 51 expectations (max is 50)
        essentialQuestions: Array(21).fill('Question?'), // 21 questions (max is 20)
        keyVocabulary: Array(31).fill('word'), // 31 words (max is 30)
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tooManyExpectations)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should prevent creating unit plan for non-owned long-range plan', async () => {
      const unauthorizedPlan = {
        title: 'Unauthorized Unit',
        longRangePlanId: otherUserLongRangePlan.id, // Other user's plan
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: [testExpectation1.id],
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(unauthorizedPlan)
        .expect(404);

      expect(response.body.error).toBe('Long-range plan not found');
    });

    it('should validate invalid expectation IDs', async () => {
      const invalidExpectations = {
        title: 'Invalid Expectations Unit',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: ['invalid-id-123'],
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidExpectations)
        .expect(400); // Validation will fail for invalid CUID

      expect(response.body.errors).toBeDefined();
    });

    it('should require authentication', async () => {
      const newUnitPlan = {
        title: 'Unauthenticated Unit',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: [testExpectation1.id],
      };

      await request(app)
        .post('/api/unit-plans')
        .send(newUnitPlan)
        .expect(401);
    });
  });

  describe('READ /api/unit-plans', () => {
    describe('GET /api/unit-plans (list)', () => {
      beforeEach(async () => {
        // Create additional unit plans for filtering tests
        await prisma.unitPlan.create({
          data: {
            userId,
            title: 'Geometry Unit',
            longRangePlanId: testLongRangePlan.id,
            startDate: new Date('2024-10-16'),
            endDate: new Date('2024-11-30'),
            estimatedHours: 20,
          },
        });

        await prisma.unitPlan.create({
          data: {
            userId,
            title: 'Measurement Unit',
            longRangePlanId: testLongRangePlan.id,
            startDate: new Date('2024-12-01'),
            endDate: new Date('2025-01-15'),
            estimatedHours: 25,
          },
        });

        // Create unit plan for other user
        await prisma.unitPlan.create({
          data: {
            userId: otherUserId,
            title: 'Other User Unit',
            longRangePlanId: otherUserLongRangePlan.id,
            startDate: new Date('2024-09-01'),
            endDate: new Date('2024-10-15'),
          },
        });
      });

      it('should list all unit plans for authenticated user', async () => {
        const response = await request(app)
          .get('/api/unit-plans')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveLength(3); // Only user's plans
        expect(response.body[0]).toMatchObject({
          id: expect.any(String),
          userId,
          title: expect.any(String),
          longRangePlan: {
            id: testLongRangePlan.id,
            title: 'Grade 5 Mathematics Long Range Plan',
            subject: 'Mathematics',
            grade: 5,
          },
          _count: {
            lessonPlans: expect.any(Number),
            expectations: expect.any(Number),
            resources: expect.any(Number),
          },
        });

        // Verify ordering by startDate
        const dates = response.body.map((plan: unknown) => new Date(plan.startDate).getTime());
        expect(dates).toEqual([...dates].sort((a, b) => a - b));
      });

      it('should filter by longRangePlanId', async () => {
        const response = await request(app)
          .get(`/api/unit-plans?longRangePlanId=${testLongRangePlan.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveLength(3);
        expect(response.body.every((plan: unknown) => plan.longRangePlanId === testLongRangePlan.id)).toBe(true);
      });

      it('should filter by date range', async () => {
        const response = await request(app)
          .get('/api/unit-plans?startDate=2024-10-01&endDate=2024-11-01')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveLength(1); // Only Geometry Unit starts in this range
        expect(response.body[0].title).toBe('Geometry Unit');
      });

      it('should combine multiple filters', async () => {
        const response = await request(app)
          .get(`/api/unit-plans?longRangePlanId=${testLongRangePlan.id}&startDate=2024-12-01`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Measurement Unit');
      });

      it('should return empty array when no plans match filters', async () => {
        const response = await request(app)
          .get('/api/unit-plans?startDate=2025-06-01')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toEqual([]);
      });

      it('should not return other users plans', async () => {
        const response = await request(app)
          .get('/api/unit-plans')
          .set('Authorization', `Bearer ${otherUserToken}`)
          .expect(200);

        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Other User Unit');
      });

      it('should require authentication', async () => {
        await request(app)
          .get('/api/unit-plans')
          .expect(401);
      });
    });

    describe('GET /api/unit-plans/:id (single)', () => {
      let lessonPlan1: unknown;
      let lessonPlan2: unknown;
      let resource1: unknown;

      beforeEach(async () => {
        // Create lesson plans for the unit
        lessonPlan1 = await prisma.eTFOLessonPlan.create({
          data: {
            userId,
            unitPlanId: testUnitPlan.id,
            title: 'Introduction to Fractions',
            date: new Date('2024-09-05'),
            duration: 60,
            grade: 5,
            subject: 'Mathematics',
          },
        });

        lessonPlan2 = await prisma.eTFOLessonPlan.create({
          data: {
            userId,
            unitPlanId: testUnitPlan.id,
            title: 'Comparing Fractions',
            date: new Date('2024-09-10'),
            duration: 60,
            grade: 5,
            subject: 'Mathematics',
          },
        });

        // Create daybook entry for one lesson (marking it complete)
        await prisma.daybookEntry.create({
          data: {
            userId,
            lessonPlanId: lessonPlan1.id,
            date: new Date('2024-09-05'),
            notes: 'Lesson went well',
            whatWorked: 'Students engaged',
            overallRating: 4,
            wouldReuseLesson: true,
          },
        });

        // Create resources
        resource1 = await prisma.unitPlanResource.create({
          data: {
            unitPlanId: testUnitPlan.id,
            title: 'Fraction Manipulatives',
            type: 'physical',
            notes: 'Pizza slices and fraction bars',
          },
        });
      });

      it('should retrieve a single unit plan with all relations', async () => {
        const response = await request(app)
          .get(`/api/unit-plans/${testUnitPlan.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body).toMatchObject({
          id: testUnitPlan.id,
          userId,
          title: 'Number Sense Unit',
          titleFr: 'Unité du sens des nombres',
          description: 'Introduction to fractions and decimals',
          bigIdeas: 'Numbers can be represented in multiple ways',
          essentialQuestions: ['How are fractions and decimals related?', 'When do we use different number representations?'],
          estimatedHours: 30,
          assessmentPlan: 'Formative assessments throughout, summative test at end',
          successCriteria: ['Can convert between fractions and decimals', 'Can compare and order rational numbers'],
          learningSkills: ['Responsibility', 'Organization'],
          keyVocabulary: ['fraction', 'decimal', 'numerator', 'denominator'],
          longRangePlan: expect.objectContaining({
            id: testLongRangePlan.id,
            title: 'Grade 5 Mathematics Long Range Plan',
          }),
          expectations: expect.arrayContaining([
            expect.objectContaining({
              expectationId: testExpectation1.id,
              expectation: expect.objectContaining({
                code: 'MATH-5.1',
                description: 'Test expectation 1 for unit planning',
              }),
            }),
          ]),
          lessonPlans: expect.arrayContaining([
            expect.objectContaining({
              id: lessonPlan1.id,
              title: 'Introduction to Fractions',
              _count: { expectations: 0 },
              daybookEntry: expect.objectContaining({
                id: expect.any(String),
                overallRating: 4,
                wouldReuseLesson: true,
              }),
            }),
            expect.objectContaining({
              id: lessonPlan2.id,
              title: 'Comparing Fractions',
              _count: { expectations: 0 },
              daybookEntry: null,
            }),
          ]),
          resources: expect.arrayContaining([
            expect.objectContaining({
              id: resource1.id,
              title: 'Fraction Manipulatives',
              type: 'physical',
            }),
          ]),
          progress: {
            total: 2,
            completed: 1,
            percentage: 50,
          },
        });

        // Verify expectations are ordered by code
        const expectationCodes = response.body.expectations.map((e: unknown) => e.expectation.code);
        expect(expectationCodes).toEqual([...expectationCodes].sort());

        // Verify lesson plans are ordered by date
        const lessonDates = response.body.lessonPlans.map((lp: unknown) => new Date(lp.date).getTime());
        expect(lessonDates).toEqual([...lessonDates].sort((a, b) => a - b));
      });

      it('should calculate progress correctly', async () => {
        // Add more lessons with varying completion status
        const lesson3 = await prisma.eTFOLessonPlan.create({
          data: {
            userId,
            unitPlanId: testUnitPlan.id,
            title: 'Decimal Introduction',
            date: new Date('2024-09-15'),
            duration: 60,
            grade: 5,
            subject: 'Mathematics',
          },
        });

        await prisma.daybookEntry.create({
          data: {
            userId,
            lessonPlanId: lesson3.id,
            date: new Date('2024-09-15'),
            notes: 'Good progress',
            whatWorked: 'Students understood concepts',
            whatDidntWork: 'Need more practice',
            overallRating: 3,
            wouldReuseLesson: true,
          },
        });

        const response = await request(app)
          .get(`/api/unit-plans/${testUnitPlan.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.progress).toEqual({
          total: 3,
          completed: 2,
          percentage: 67, // Math.round(2/3 * 100)
        });
      });

      it('should return 404 for non-existent unit plan', async () => {
        const response = await request(app)
          .get('/api/unit-plans/invalid-id')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.error).toBe('Unit plan not found');
      });

      it('should prevent access to other users unit plans', async () => {
        const response = await request(app)
          .get(`/api/unit-plans/${testUnitPlan.id}`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .expect(404);

        expect(response.body.error).toBe('Unit plan not found');
      });

      it('should require authentication', async () => {
        await request(app)
          .get(`/api/unit-plans/${testUnitPlan.id}`)
          .expect(401);
      });
    });
  });

  describe('UPDATE /api/unit-plans/:id', () => {
    it('should update all fields except longRangePlanId', async () => {
      const updates = {
        title: 'Updated Number Sense Unit',
        titleFr: 'Unité mise à jour',
        description: 'Updated description',
        descriptionFr: 'Description mise à jour',
        bigIdeas: 'Updated big ideas',
        bigIdeasFr: 'Grandes idées mises à jour',
        essentialQuestions: ['New question 1?', 'New question 2?'],
        startDate: '2024-09-15T00:00:00.000Z',
        endDate: '2024-10-30T00:00:00.000Z',
        estimatedHours: 35,
        assessmentPlan: 'Updated assessment plan',
        successCriteria: ['Updated criterion 1', 'Updated criterion 2'],
        expectationIds: [testExpectation2.id, testExpectation3.id], // Replace existing
        crossCurricularConnections: 'Updated connections',
        learningSkills: ['Self-regulation', 'Independent work'],
        culminatingTask: 'Updated task',
        keyVocabulary: ['updated', 'vocabulary'],
        priorKnowledge: 'Updated prerequisites',
        parentCommunicationPlan: 'Updated communication',
        fieldTripsAndGuestSpeakers: 'Museum visit planned',
        differentiationStrategies: {
          forStruggling: ['Updated strategy 1'],
          forAdvanced: ['Updated strategy 2'],
          forELL: ['Updated ELL support'],
          forIEP: ['Updated IEP support'],
        },
        indigenousPerspectives: 'Updated perspectives',
        environmentalEducation: 'Updated environmental connections',
        socialJusticeConnections: 'Updated social justice',
        technologyIntegration: 'Updated technology use',
        communityConnections: 'Updated community links',
      };

      const response = await request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testUnitPlan.id,
        userId,
        title: 'Updated Number Sense Unit',
        titleFr: 'Unité mise à jour',
        description: 'Updated description',
        descriptionFr: 'Description mise à jour',
        bigIdeas: 'Updated big ideas',
        bigIdeasFr: 'Grandes idées mises à jour',
        essentialQuestions: ['New question 1?', 'New question 2?'],
        estimatedHours: 35,
        assessmentPlan: 'Updated assessment plan',
        successCriteria: ['Updated criterion 1', 'Updated criterion 2'],
        crossCurricularConnections: 'Updated connections',
        learningSkills: ['Self-regulation', 'Independent work'],
        culminatingTask: 'Updated task',
        keyVocabulary: ['updated', 'vocabulary'],
        priorKnowledge: 'Updated prerequisites',
        parentCommunicationPlan: 'Updated communication',
        fieldTripsAndGuestSpeakers: 'Museum visit planned',
        differentiationStrategies: {
          forStruggling: ['Updated strategy 1'],
          forAdvanced: ['Updated strategy 2'],
          forELL: ['Updated ELL support'],
          forIEP: ['Updated IEP support'],
        },
        indigenousPerspectives: 'Updated perspectives',
        environmentalEducation: 'Updated environmental connections',
        socialJusticeConnections: 'Updated social justice',
        technologyIntegration: 'Updated technology use',
        communityConnections: 'Updated community links',
      });

      // Verify dates were updated
      expect(new Date(response.body.startDate).toISOString()).toBe('2024-09-15T00:00:00.000Z');
      expect(new Date(response.body.endDate).toISOString()).toBe('2024-10-30T00:00:00.000Z');

      // Verify expectations were replaced
      const linkedExpectations = await prisma.unitPlanExpectation.findMany({
        where: { unitPlanId: testUnitPlan.id },
        orderBy: { expectationId: 'asc' },
      });
      expect(linkedExpectations).toHaveLength(2);
      expect(linkedExpectations.map(e => e.expectationId)).toEqual(
        [testExpectation2.id, testExpectation3.id].sort()
      );
    });

    it('should update partial fields', async () => {
      const partialUpdate = {
        title: 'Partially Updated Unit',
        estimatedHours: 40,
      };

      const response = await request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.title).toBe('Partially Updated Unit');
      expect(response.body.estimatedHours).toBe(40);
      // Other fields should remain unchanged
      expect(response.body.description).toBe('Introduction to fractions and decimals');
      expect(response.body.bigIdeas).toBe('Numbers can be represented in multiple ways');
    });

    it('should clear optional fields when set to null', async () => {
      const clearFields = {
        description: null,
        bigIdeas: null,
        assessmentPlan: null,
        differentiationStrategies: null,
      };

      const response = await request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(clearFields);
      
      if (response.status !== 200) {
        console.error('Clear fields error:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);

      expect(response.body.description).toBeNull();
      expect(response.body.bigIdeas).toBeNull();
      expect(response.body.assessmentPlan).toBeNull();
      expect(response.body.differentiationStrategies).toBeNull();
    });

    it('should update expectations to empty array', async () => {
      const removeExpectations = {
        expectationIds: [],
      };

      const response = await request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(removeExpectations);
      
      console.log('Update response status:', response.status);
      console.log('Update response body:', JSON.stringify(response.body, null, 2));
      
      if (response.status !== 200) {
        console.error('Remove expectations error:', JSON.stringify(response.body, null, 2));
      }
      expect(response.status).toBe(200);

      expect(response.body.expectations).toEqual([]);

      // Verify in database
      const linkedExpectations = await prisma.unitPlanExpectation.findMany({
        where: { unitPlanId: testUnitPlan.id },
      });
      expect(linkedExpectations).toHaveLength(0);
    });

    it('should validate field constraints on update', async () => {
      const invalidUpdate = {
        title: '<script>XSS</script>',
        estimatedHours: -5,
        essentialQuestions: Array(21).fill('Too many questions'),
      };

      const response = await request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdate)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should prevent updating non-owned unit plan', async () => {
      const update = {
        title: 'Unauthorized Update',
      };

      const response = await request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(update)
        .expect(404);

      expect(response.body.error).toBe('Unit plan not found');
    });

    it('should return 404 for non-existent unit plan', async () => {
      const response = await request(app)
        .put('/api/unit-plans/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Update' })
        .expect(404);

      expect(response.body.error).toBe('Unit plan not found');
    });

    it('should require authentication', async () => {
      await request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .send({ title: 'Update' })
        .expect(401);
    });
  });

  describe('DELETE /api/unit-plans/:id', () => {
    it('should delete unit plan without lesson plans', async () => {
      // Create a unit plan without lessons
      const emptyUnit = await prisma.unitPlan.create({
        data: {
          userId,
          title: 'Empty Unit to Delete',
          longRangePlanId: testLongRangePlan.id,
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-01-31'),
        },
      });

      await request(app)
        .delete(`/api/unit-plans/${emptyUnit.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify deletion
      const deleted = await prisma.unitPlan.findUnique({
        where: { id: emptyUnit.id },
      });
      expect(deleted).toBeNull();
    });

    it('should prevent deletion of unit plan with lesson plans', async () => {
      // Create a lesson plan for the test unit
      await prisma.eTFOLessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Blocking Lesson',
          date: new Date('2024-09-20'),
          duration: 60,
        },
      });

      const response = await request(app)
        .delete(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.error).toBe('Cannot delete unit plan with existing lesson plans');

      // Verify unit plan still exists
      const stillExists = await prisma.unitPlan.findUnique({
        where: { id: testUnitPlan.id },
      });
      expect(stillExists).not.toBeNull();
    });

    it('should cascade delete expectations and resources', async () => {
      const unitToDelete = await prisma.unitPlan.create({
        data: {
          userId,
          title: 'Unit with Relations',
          longRangePlanId: testLongRangePlan.id,
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-02-28'),
        },
      });

      // Add expectations
      await prisma.unitPlanExpectation.create({
        data: {
          unitPlanId: unitToDelete.id,
          expectationId: testExpectation1.id,
        },
      });

      // Add resources
      await prisma.unitPlanResource.create({
        data: {
          unitPlanId: unitToDelete.id,
          title: 'Test Resource',
          type: 'document',
        },
      });

      // Double check no lesson plans exist before delete
      const preDeleteCheck = await prisma.unitPlan.findUnique({
        where: { id: unitToDelete.id },
        include: { 
          _count: { 
            select: { 
              lessonPlans: true,
              expectations: true,
              resources: true 
            } 
          } 
        }
      });
      console.log('Pre-delete unit status:', preDeleteCheck?._count);

      const deleteResponse = await request(app)
        .delete(`/api/unit-plans/${unitToDelete.id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      if (deleteResponse.status !== 204) {
        console.error('Delete error:', JSON.stringify(deleteResponse.body, null, 2));
        // Check if it has lesson plans
        const checkUnit = await prisma.unitPlan.findUnique({
          where: { id: unitToDelete.id },
          include: { 
            _count: { 
              select: { 
                lessonPlans: true,
                expectations: true,
                resources: true 
              } 
            },
            lessonPlans: true 
          }
        });
        console.error('Unit status after delete attempt:', checkUnit?._count);
        console.error('Lesson plans:', checkUnit?.lessonPlans);
      }
      expect(deleteResponse.status).toBe(204);

      // Verify cascade deletion
      const expectations = await prisma.unitPlanExpectation.findMany({
        where: { unitPlanId: unitToDelete.id },
      });
      expect(expectations).toHaveLength(0);

      const resources = await prisma.unitPlanResource.findMany({
        where: { unitPlanId: unitToDelete.id },
      });
      expect(resources).toHaveLength(0);
    });

    it('should prevent deletion of non-owned unit plan', async () => {
      const response = await request(app)
        .delete(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);

      expect(response.body.error).toBe('Unit plan not found');
    });

    it('should return 404 for non-existent unit plan', async () => {
      const response = await request(app)
        .delete('/api/unit-plans/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error).toBe('Unit plan not found');
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/unit-plans/${testUnitPlan.id}`)
        .expect(401);
    });
  });

  describe('Resources Management', () => {
    beforeEach(() => {
      // Reset rate limiter state before each test
      resetRateLimiterState();
    });

    describe('POST /api/unit-plans/:id/resources', () => {
      it('should add a resource to unit plan', async () => {
        const newResource = {
          title: 'Fraction Video Tutorial',
          type: 'video',
          url: 'https://example.com/fractions',
          notes: 'Great introduction video',
        };

        const response = await request(app)
          .post(`/api/unit-plans/${testUnitPlan.id}/resources`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(newResource)
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(String),
          unitPlanId: testUnitPlan.id,
          title: 'Fraction Video Tutorial',
          type: 'video',
          url: 'https://example.com/fractions',
          notes: 'Great introduction video',
          createdAt: expect.any(String),
        });
      });

      it('should add resource with minimal fields', async () => {
        const minimalResource = {
          title: 'Worksheet',
          type: 'document',
        };

        const response = await request(app)
          .post(`/api/unit-plans/${testUnitPlan.id}/resources`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(minimalResource)
          .expect(201);

        expect(response.body.title).toBe('Worksheet');
        expect(response.body.type).toBe('document');
        expect(response.body.url).toBeNull();
        expect(response.body.notes).toBeNull();
      });

      it('should require title and type', async () => {
        const invalidResource = {
          url: 'https://example.com',
        };

        const response = await request(app)
          .post(`/api/unit-plans/${testUnitPlan.id}/resources`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidResource)
          .expect(400);

        expect(response.body.error).toBe('Title and type are required');
      });

      it('should prevent adding resource to non-owned unit plan', async () => {
        const resource = {
          title: 'Unauthorized Resource',
          type: 'document',
        };

        const response = await request(app)
          .post(`/api/unit-plans/${testUnitPlan.id}/resources`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .send(resource)
          .expect(404);

        expect(response.body.error).toBe('Unit plan not found');
      });
    });

    describe('DELETE /api/unit-plans/:id/resources/:resourceId', () => {
      let testResource: unknown;

      beforeEach(async () => {
        testResource = await prisma.unitPlanResource.create({
          data: {
            unitPlanId: testUnitPlan.id,
            title: 'Resource to Delete',
            type: 'website',
            url: 'https://example.com/delete-me',
          },
        });
      });

      it('should delete a resource', async () => {
        await request(app)
          .delete(`/api/unit-plans/${testUnitPlan.id}/resources/${testResource.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(204);

        // Verify deletion
        const deleted = await prisma.unitPlanResource.findUnique({
          where: { id: testResource.id },
        });
        expect(deleted).toBeNull();
      });

      it('should prevent deleting resource from non-owned unit plan', async () => {
        const response = await request(app)
          .delete(`/api/unit-plans/${testUnitPlan.id}/resources/${testResource.id}`)
          .set('Authorization', `Bearer ${otherUserToken}`)
          .expect(404);

        expect(response.body.error).toBe('Resource not found');
      });

      it('should return 404 for non-existent resource', async () => {
        const response = await request(app)
          .delete(`/api/unit-plans/${testUnitPlan.id}/resources/invalid-id`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.error).toBe('Resource not found');
      });

      it('should verify resource belongs to specified unit plan', async () => {
        // Create another unit plan
        const otherUnit = await prisma.unitPlan.create({
          data: {
            userId,
            title: 'Other Unit',
            longRangePlanId: testLongRangePlan.id,
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-03-31'),
          },
        });

        // Try to delete resource using wrong unit plan ID
        const response = await request(app)
          .delete(`/api/unit-plans/${otherUnit.id}/resources/${testResource.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(404);

        expect(response.body.error).toBe('Resource not found');
      });
    });
  });

  describe('Duplicate Unit Plan', () => {
    let sourceUnit: unknown;
    let sourceResource: unknown;
    let sourceLesson: unknown;

    beforeEach(async () => {
      // Reset rate limiter state before each test
      resetRateLimiterState();
      // Create a comprehensive source unit plan
      sourceUnit = await prisma.unitPlan.create({
        data: {
          userId,
          title: 'Source Unit Plan',
          titleFr: 'Plan source',
          longRangePlanId: testLongRangePlan.id,
          description: 'Source description',
          bigIdeas: 'Source big ideas',
          essentialQuestions: ['Source Q1', 'Source Q2'],
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-15'),
          estimatedHours: 40,
          assessmentPlan: 'Source assessment',
          successCriteria: ['Source criterion'],
          learningSkills: ['Source skill'],
          keyVocabulary: ['source', 'vocabulary'],
          differentiationStrategies: {
            forStruggling: ['Source struggling strategy'],
            forAdvanced: ['Source advanced strategy'],
          },
        },
      });

      // Add expectations
      await prisma.unitPlanExpectation.createMany({
        data: [
          { unitPlanId: sourceUnit.id, expectationId: testExpectation1.id },
          { unitPlanId: sourceUnit.id, expectationId: testExpectation2.id },
        ],
      });

      // Add resources
      sourceResource = await prisma.unitPlanResource.create({
        data: {
          unitPlanId: sourceUnit.id,
          title: 'Source Resource',
          type: 'document',
          url: 'https://example.com/source',
          notes: 'Source notes',
        },
      });

      // Add lesson plan
      sourceLesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId,
          unitPlanId: sourceUnit.id,
          title: 'Source Lesson',
          date: new Date('2024-01-10'),
          duration: 60,
          grade: 5,
          subject: 'Mathematics',
        },
      });

      // Add expectation to lesson
      await prisma.eTFOLessonPlanExpectation.create({
        data: {
          lessonPlanId: sourceLesson.id,
          expectationId: testExpectation1.id,
        },
      });

      // Add resource to lesson
      await prisma.eTFOLessonPlanResource.create({
        data: {
          lessonPlanId: sourceLesson.id,
          title: 'Lesson Resource',
          type: 'video',
          url: 'https://example.com/lesson',
        },
      });
    });

    it('should duplicate unit plan without sub-items', async () => {
      const duplicateRequest = {
        sourceId: sourceUnit.id,
        title: 'Duplicated Unit Plan',
        includeSubItems: false,
      };

      const response = await request(app)
        .post('/api/unit-plans/duplicate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateRequest)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        userId,
        title: 'Duplicated Unit Plan',
        titleFr: 'Plan source',
        longRangePlanId: testLongRangePlan.id,
        description: 'Source description',
        bigIdeas: 'Source big ideas',
        essentialQuestions: ['Source Q1', 'Source Q2'],
        estimatedHours: 40,
        assessmentPlan: 'Source assessment',
        successCriteria: ['Source criterion'],
        learningSkills: ['Source skill'],
        keyVocabulary: ['source', 'vocabulary'],
        differentiationStrategies: {
          forStruggling: ['Source struggling strategy'],
          forAdvanced: ['Source advanced strategy'],
        },
      });

      // Verify different ID
      expect(response.body.id).not.toBe(sourceUnit.id);

      // Verify dates shifted to current period
      const newStartDate = new Date(response.body.startDate);
      const today = new Date();
      expect(newStartDate.getDate()).toBe(today.getDate());
      expect(newStartDate.getMonth()).toBe(today.getMonth());
      expect(newStartDate.getFullYear()).toBe(today.getFullYear());

      // Verify expectations were copied
      const copiedExpectations = await prisma.unitPlanExpectation.findMany({
        where: { unitPlanId: response.body.id },
      });
      expect(copiedExpectations).toHaveLength(2);

      // Verify resources were copied
      const copiedResources = await prisma.unitPlanResource.findMany({
        where: { unitPlanId: response.body.id },
      });
      expect(copiedResources).toHaveLength(1);
      expect(copiedResources[0].title).toBe('Source Resource');

      // Verify lesson plans were NOT copied
      const copiedLessons = await prisma.eTFOLessonPlan.findMany({
        where: { unitPlanId: response.body.id },
      });
      expect(copiedLessons).toHaveLength(0);
    });

    it('should duplicate unit plan with sub-items (lesson plans)', async () => {
      const duplicateRequest = {
        sourceId: sourceUnit.id,
        title: 'Duplicated with Lessons',
        includeSubItems: true,
      };

      const response = await request(app)
        .post('/api/unit-plans/duplicate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateRequest)
        .expect(201);

      expect(response.body.title).toBe('Duplicated with Lessons');

      // Verify lesson plans were copied
      const copiedLessons = await prisma.eTFOLessonPlan.findMany({
        where: { unitPlanId: response.body.id },
        include: {
          expectations: true,
          resources: true,
        },
      });
      expect(copiedLessons).toHaveLength(1);
      expect(copiedLessons[0].title).toBe('Source Lesson (Copy)');

      // Verify lesson date was adjusted
      const originalDuration = sourceUnit.endDate.getTime() - sourceUnit.startDate.getTime();
      const newStartDate = new Date(response.body.startDate);
      const expectedLessonDate = new Date(
        newStartDate.getTime() + (sourceLesson.date.getTime() - sourceUnit.startDate.getTime())
      );
      expect(copiedLessons[0].date.getDate()).toBe(expectedLessonDate.getDate());

      // Verify lesson expectations were copied
      expect(copiedLessons[0].expectations).toHaveLength(1);
      expect(copiedLessons[0].expectations[0].expectationId).toBe(testExpectation1.id);

      // Verify lesson resources were copied
      expect(copiedLessons[0].resources).toHaveLength(1);
      expect(copiedLessons[0].resources[0].title).toBe('Lesson Resource');
    });

    it('should require sourceId and title', async () => {
      const invalidRequest = {
        sourceId: sourceUnit.id,
        // missing title
      };

      const response = await request(app)
        .post('/api/unit-plans/duplicate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBe('Source ID and title are required');
    });

    it('should prevent duplicating non-owned unit plan', async () => {
      const duplicateRequest = {
        sourceId: sourceUnit.id,
        title: 'Unauthorized Duplicate',
      };

      const response = await request(app)
        .post('/api/unit-plans/duplicate')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send(duplicateRequest)
        .expect(404);

      expect(response.body.error).toBe('Source unit plan not found');
    });

    it('should return 404 for non-existent source unit', async () => {
      const duplicateRequest = {
        sourceId: 'invalid-id',
        title: 'Duplicate of Nothing',
      };

      const response = await request(app)
        .post('/api/unit-plans/duplicate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateRequest)
        .expect(404);

      expect(response.body.error).toBe('Source unit plan not found');
    });
  });

  describe('Edge Cases and Field Limits', () => {
    it('should handle maximum field lengths', async () => {
      const maxLengthPlan = {
        title: 'A'.repeat(255), // Max title length
        titleFr: 'B'.repeat(255),
        longRangePlanId: testLongRangePlan.id,
        description: 'C'.repeat(2000), // Max description
        descriptionFr: 'D'.repeat(2000),
        bigIdeas: 'E'.repeat(2000),
        bigIdeasFr: 'F'.repeat(2000),
        essentialQuestions: Array(20).fill('Q'.repeat(500)), // Max 20 questions of 500 chars
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        estimatedHours: 1000, // Max hours
        assessmentPlan: 'A'.repeat(2000),
        successCriteria: Array(20).fill('C'.repeat(500)),
        expectationIds: [testExpectation1.id],
        crossCurricularConnections: 'X'.repeat(1000),
        learningSkills: Array(10).fill('S'.repeat(100)),
        culminatingTask: 'T'.repeat(1000),
        keyVocabulary: Array(30).fill('V'.repeat(100)),
        priorKnowledge: 'P'.repeat(1000),
        parentCommunicationPlan: 'C'.repeat(1000),
        fieldTripsAndGuestSpeakers: 'F'.repeat(1000),
        differentiationStrategies: {
          forStruggling: Array(10).fill('S'.repeat(200)),
          forAdvanced: Array(10).fill('A'.repeat(200)),
          forELL: Array(10).fill('E'.repeat(200)),
          forIEP: Array(10).fill('I'.repeat(200)),
        },
        indigenousPerspectives: 'I'.repeat(1000),
        environmentalEducation: 'E'.repeat(1000),
        socialJusticeConnections: 'S'.repeat(1000),
        technologyIntegration: 'T'.repeat(1000),
        communityConnections: 'C'.repeat(1000),
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maxLengthPlan)
        .expect(201);

      expect(response.body.title).toHaveLength(255);
      expect(response.body.description).toHaveLength(2000);
      expect(response.body.essentialQuestions).toHaveLength(20);
      expect(response.body.keyVocabulary).toHaveLength(30);
    });

    it('should handle date edge cases', async () => {
      // Same start and end date
      const sameDayPlan = {
        title: 'One Day Unit',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-11-15T00:00:00.000Z',
        endDate: '2024-11-15T23:59:59.999Z',
        expectationIds: [testExpectation1.id],
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(sameDayPlan)
        .expect(201);

      expect(response.body.title).toBe('One Day Unit');
    });

    it('should handle concurrent updates gracefully', async () => {
      // Simulate concurrent update attempts
      const update1 = request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Update 1' });

      const update2 = request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Update 2' });

      const [response1, response2] = await Promise.all([update1, update2]);

      // Both should succeed, last one wins
      expect([response1.status, response2.status]).toContain(200);
      
      // Verify final state
      const finalUnit = await prisma.unitPlan.findUnique({
        where: { id: testUnitPlan.id },
      });
      expect(['Update 1', 'Update 2']).toContain(finalUnit?.title);
    });

    it('should handle invalid CUID format', async () => {
      const invalidCuid = {
        title: 'Invalid CUID Test',
        longRangePlanId: 'not-a-valid-cuid',
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: [testExpectation1.id],
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCuid)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should handle special characters in text fields', async () => {
      const specialCharsPlan = {
        title: 'Unit with émojis 🎯 and special chars: <>&"\'',
        longRangePlanId: testLongRangePlan.id,
        description: 'Description with\nnewlines\tand\ttabs',
        essentialQuestions: ['Question with "quotes"?', 'Question with \'apostrophes\'?'],
        startDate: '2024-11-01T00:00:00.000Z',
        endDate: '2024-11-30T00:00:00.000Z',
        expectationIds: [testExpectation1.id],
        keyVocabulary: ['café', 'naïve', 'résumé'],
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(specialCharsPlan)
        .expect(201);

      expect(response.body.description).toBe('Description with\nnewlines\tand\ttabs');
      expect(response.body.keyVocabulary).toContain('café');
    });
  });
});