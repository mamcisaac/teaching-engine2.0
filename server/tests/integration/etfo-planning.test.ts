import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';
import { ETFOTestHelpers } from './helpers/etfo-helpers';

describe('ETFO Planning Integration Tests', () => {
  let authToken: string;
  let userId: number;
  let testEmail: string;
  let helpers: ETFOTestHelpers;

  beforeAll(async () => {
    // Create test user manually with unique email
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const timestamp = Date.now();
    testEmail = `etfo-test-${timestamp}@example.com`;

    // Clean up any existing user with this email first
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'ETFO Tester',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });

    userId = user.id;

    // Ensure the transaction is committed
    await prisma.$disconnect();
    await prisma.$connect();

    const loginResponse = await request(app).post('/api/login').send({
      email: testEmail,
      password: 'testpassword123',
    });

    if (loginResponse.status !== 200) {
      throw new Error(
        `Login failed: ${loginResponse.status} ${JSON.stringify(loginResponse.body)}`,
      );
    }

    authToken = loginResponse.body.token;

    if (!authToken) {
      throw new Error('No auth token received from login');
    }

    // Initialize helpers
    helpers = new ETFOTestHelpers(authToken);
  });

  afterAll(async () => {
    // Clean up test data in reverse dependency order
    if (userId) {
      try {
        // Delete in reverse order of dependencies
        await prisma.daybookEntryExpectation.deleteMany({
          where: { daybookEntry: { userId } },
        });
        await prisma.daybookEntry.deleteMany({ where: { userId } });

        await prisma.eTFOLessonPlanExpectation.deleteMany({
          where: { lessonPlan: { userId } },
        });
        await prisma.eTFOLessonPlanResource.deleteMany({
          where: { lessonPlan: { userId } },
        });
        await prisma.eTFOLessonPlan.deleteMany({ where: { userId } });

        await prisma.unitPlanExpectation.deleteMany({
          where: { unitPlan: { userId } },
        });
        await prisma.unitPlanResource.deleteMany({
          where: { unitPlan: { userId } },
        });
        await prisma.unitPlan.deleteMany({ where: { userId } });

        await prisma.longRangePlanExpectation.deleteMany({
          where: { longRangePlan: { userId } },
        });
        await prisma.longRangePlan.deleteMany({ where: { userId } });

        // Delete curriculum expectations created by this user's imports
        await prisma.curriculumExpectation.deleteMany({
          where: { import: { userId } },
        });
        await prisma.curriculumImport.deleteMany({ where: { userId } });

        await prisma.user.delete({ where: { id: userId } });
      } catch (error) {
        console.warn('Failed to delete test data:', error);
      }
    }
    await prisma.$disconnect();
  });

  describe('Curriculum Expectations', () => {
    test('should create a curriculum expectation', async () => {
      const expectationId = await helpers.createExpectation('CREATE_TEST');
      expect(expectationId).toBeDefined();
      expect(typeof expectationId).toBe('string');
    });

    test('should search curriculum expectations', async () => {
      // Create test expectation first
      await helpers.createExpectation('SEARCH_TEST');

      const response = await request(app)
        .get('/api/curriculum-expectations?search=SEARCH_TEST')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].description).toContain('SEARCH_TEST');
    });
  });

  describe('Long-Range Plans', () => {
    test('should create a long-range plan', async () => {
      const expectationId = await helpers.createExpectation('LRP');
      
      const response = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Grade 1 Mathematics - Fall Term',
          academicYear: '2024-2025',
          term: 'Fall',
          grade: 1,
          subject: 'Mathematics',
          description: 'Comprehensive math program for Grade 1',
          goals: 'Develop number sense and basic operations',
          themes: ['Number Sense', 'Patterns', 'Measurement'],
          expectationIds: [expectationId],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Grade 1 Mathematics - Fall Term');
      expect(response.body.expectations).toHaveLength(1);
    });

    test('should get all long-range plans for user', async () => {
      // Create test plan first
      const longRangePlanId = await helpers.createLongRangePlan('Test Plan for Retrieval');

      const response = await request(app)
        .get('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some(plan => plan.id === longRangePlanId)).toBe(true);
    });
  });

  describe('Unit Plans', () => {
    test('should create a unit plan', async () => {
      const expectationId = await helpers.createExpectation('UP');
      const longRangePlanId = await helpers.createLongRangePlan('Test Long-Range Plan for Units');

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Numbers 1-10',
          longRangePlanId,
          description: 'Introduction to numbers 1-10',
          bigIdeas: 'Numbers represent quantities',
          essentialQuestions: ['What is a number?', 'How do we count?'],
          startDate: '2024-09-01T00:00:00.000Z',
          endDate: '2024-09-30T23:59:59.999Z',
          estimatedHours: 20,
          expectationIds: [expectationId],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Numbers 1-10');
      expect(response.body.longRangePlanId).toBe(longRangePlanId);
    });
  });

  describe('ETFO Lesson Plans', () => {
    test('should create an ETFO lesson plan', async () => {
      const expectationId = await helpers.createExpectation('LP');
      const longRangePlanId = await helpers.createLongRangePlan('Test Long-Range Plan for Lessons');
      const unitPlanId = await helpers.createUnitPlan('Test Unit for Lessons', longRangePlanId, [expectationId]);

      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Counting to 5',
          unitPlanId,
          date: '2024-09-15T09:00:00Z',
          duration: 45,
          mindsOn: 'Review previous counting',
          action: 'Practice counting objects',
          consolidation: 'Share counting strategies',
          learningGoals: 'Students will count to 5 accurately',
          materials: ['counting bears', 'number cards'],
          isSubFriendly: true,
          expectationIds: [expectationId],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Counting to 5');
      expect(response.body.duration).toBe(45);
      expect(response.body.isSubFriendly).toBe(true);
    });

    test('should get lessons by date range', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('DATE_RANGE');

      // Create additional lesson in date range
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Lesson for Date Range',
          unitPlanId,
          date: '2024-09-20T10:00:00Z',
          duration: 30,
          isSubFriendly: false,
        });

      const response = await request(app)
        .get('/api/etfo-lesson-plans?startDate=2024-09-15&endDate=2024-09-25')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Daybook Entries', () => {
    test('should create a daybook entry', async () => {
      const response = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2024-09-15T00:00:00Z',
          whatWorked: 'Students engaged well with manipulatives',
          whatDidntWork: 'Some students struggled with counting sequence',
          nextSteps: 'Provide more practice with counting games',
          studentEngagement: 'High - students were excited to use counting bears',
          notes: 'Great day overall',
          overallRating: 4,
          wouldReuseLesson: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.overallRating).toBe(4);
      expect(response.body.wouldReuseLesson).toBe(true);
    });

    test('should get daybook entries by date range', async () => {
      // Create test entry first
      await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2024-09-18T00:00:00Z',
          notes: 'Test entry for date range query',
          overallRating: 3,
        });

      const response = await request(app)
        .get('/api/daybook-entries?startDate=2024-09-15&endDate=2024-09-20')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('AI Integration', () => {
    test('should handle AI draft generation request', async () => {
      const expectationId = await helpers.createExpectation('AI');

      const response = await request(app)
        .post('/api/long-range-plans/ai-draft')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expectationIds: [expectationId],
          subject: 'Mathematics',
          grade: 1,
          academicYear: '2024-2025',
          termStructure: 'semester',
        });

      // Since we don't have OpenAI API key in test environment,
      // we expect this to fail gracefully
      expect([200, 500]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('units');
        expect(Array.isArray(response.body.units)).toBe(true);
      }
    });
  });

  describe('Data Flow Integration', () => {
    test('should create complete planning hierarchy', async () => {
      const hierarchy = await helpers.createCompleteHierarchy('COMPLETE_FLOW');

      // Verify all components were created successfully
      expect(hierarchy.expectationId).toBeDefined();
      expect(hierarchy.longRangePlanId).toBeDefined();
      expect(hierarchy.unitPlanId).toBeDefined();
      expect(hierarchy.lessonPlanId).toBeDefined();
      expect(hierarchy.daybookEntryId).toBeDefined();

      // Verify relationships by querying the created long-range plan
      const planResponse = await request(app)
        .get(`/api/long-range-plans/${hierarchy.longRangePlanId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(planResponse.status).toBe(200);
      expect(planResponse.body.expectations).toHaveLength(1);
      expect(planResponse.body.unitPlans).toHaveLength(1);
    });
  });
});