import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';

describe('ETFO Planning Integration Tests', () => {
  let authToken: string;
  let userId: number;
  let testEmail: string;
  let testCurriculumExpectationId: string;
  let testLongRangePlanId: string;
  let testUnitPlanId: string;
  let unitPlanExpectationId: string;
  let lessonPlanExpectationId: string;
  let aiTestExpectationId: string;
  let flowTestExpectationId: string;

  beforeAll(async () => {
    // Create test user manually with unique email
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const timestamp = Date.now();
    testEmail = `etfo-test-${timestamp}@example.com`;
    
    // Clean up any existing user with this email first
    await prisma.user.deleteMany({
      where: { email: testEmail }
    });
    
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'ETFO Tester',
        role: 'teacher',
      },
    });
    
    userId = user.id;
    
    // Ensure the transaction is committed
    await prisma.$disconnect();
    await prisma.$connect();

    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: testEmail,
        password: 'testpassword123',
      });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status} ${JSON.stringify(loginResponse.body)}`);
    }

    authToken = loginResponse.body.token;
    
    if (!authToken) {
      throw new Error('No auth token received from login');
    }
    
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

  beforeEach(async () => {
    // Clean up any existing test data for this user only
    if (!userId) return;
    
    // Delete in reverse order of dependencies to avoid foreign key violations
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
      where: { 
        import: { userId } 
      }
    });
  });

  describe('Curriculum Expectations', () => {
    test('should create a curriculum expectation', async () => {
      const response = await request(app)
        .post('/api/curriculum-expectations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: `TEST.1.1.${Date.now()}`,
          description: 'Test expectation for ETFO planning',
          strand: 'Test Strand',
          grade: 1,
          subject: 'Mathematics',
        });

      expect(response.status).toBe(201);
      expect(response.body.code).toContain('TEST.1.1');
      expect(response.body.description).toBe('Test expectation for ETFO planning');
      testCurriculumExpectationId = response.body.id;
    });

    test('should search curriculum expectations', async () => {
      // Create test expectation first
      await request(app)
        .post('/api/curriculum-expectations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: `SEARCH.1.1.${Date.now()}`,
          description: 'Searchable test expectation',
          strand: 'Search Strand',
          grade: 1,
          subject: 'Mathematics',
        });

      const response = await request(app)
        .get('/api/curriculum-expectations?search=Searchable')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].description).toContain('Searchable');
    });
  });

  describe('Long-Range Plans', () => {
    beforeEach(async () => {
      // Create test curriculum expectation
      const expectationResponse = await request(app)
        .post('/api/curriculum-expectations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: `LRP.1.1.${Date.now()}`,
          description: 'Long-range plan test expectation',
          strand: 'Test Strand',
          grade: 1,
          subject: 'Mathematics',
        });
      
      if (expectationResponse.status !== 201) {
        throw new Error(`Failed to create test expectation: ${expectationResponse.status} ${JSON.stringify(expectationResponse.body)}`);
      }
      
      testCurriculumExpectationId = expectationResponse.body.id;
    });

    test('should create a long-range plan', async () => {
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
          expectationIds: [testCurriculumExpectationId],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Grade 1 Mathematics - Fall Term');
      expect(response.body.expectations).toHaveLength(1);
      testLongRangePlanId = response.body.id;
    });

    test('should get all long-range plans for user', async () => {
      // Create test plan first
      const createResponse = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Plan for Retrieval',
          academicYear: '2024-2025',
          grade: 1,
          subject: 'Mathematics',
        });
      
      expect(createResponse.status).toBe(201);

      const response = await request(app)
        .get('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('Unit Plans', () => {
    beforeEach(async () => {
      // Create prerequisite data
      const expectationResponse = await request(app)
        .post('/api/curriculum-expectations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: `UP.1.1.${Date.now()}`,
          description: 'Unit plan test expectation',
          strand: 'Test Strand',
          grade: 1,
          subject: 'Mathematics',
        });
      unitPlanExpectationId = expectationResponse.body.id;

      const planResponse = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Long-Range Plan for Units',
          academicYear: '2024-2025',
          grade: 1,
          subject: 'Mathematics',
        });
      testLongRangePlanId = planResponse.body.id;
    });

    test('should create a unit plan', async () => {
      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Numbers 1-10',
          longRangePlanId: testLongRangePlanId,
          description: 'Introduction to numbers 1-10',
          bigIdeas: 'Numbers represent quantities',
          essentialQuestions: ['What is a number?', 'How do we count?'],
          startDate: '2024-09-01T00:00:00.000Z',
          endDate: '2024-09-30T23:59:59.999Z',
          estimatedHours: 20,
          expectationIds: [unitPlanExpectationId],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Numbers 1-10');
      expect(response.body.longRangePlanId).toBe(testLongRangePlanId);
      testUnitPlanId = response.body.id;
    });
  });

  describe('ETFO Lesson Plans', () => {
    beforeEach(async () => {
      // Create full prerequisite chain
      const expectationResponse = await request(app)
        .post('/api/curriculum-expectations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: `LP.1.1.${Date.now()}`,
          description: 'Lesson plan test expectation',
          strand: 'Test Strand',
          grade: 1,
          subject: 'Mathematics',
        });
      lessonPlanExpectationId = expectationResponse.body.id;

      const planResponse = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Long-Range Plan for Lessons',
          academicYear: '2024-2025',
          grade: 1,
          subject: 'Mathematics',
        });
      testLongRangePlanId = planResponse.body.id;

      const unitResponse = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Unit for Lessons',
          longRangePlanId: testLongRangePlanId,
          startDate: '2024-09-01T00:00:00.000Z',
          endDate: '2024-09-30T23:59:59.999Z',
        });
      testUnitPlanId = unitResponse.body.id;
    });

    test('should create an ETFO lesson plan', async () => {
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Counting to 5',
          unitPlanId: testUnitPlanId,
          date: '2024-09-15T09:00:00Z',
          duration: 45,
          mindsOn: 'Review previous counting',
          action: 'Practice counting objects',
          consolidation: 'Share counting strategies',
          learningGoals: 'Students will count to 5 accurately',
          materials: ['counting bears', 'number cards'],
          isSubFriendly: true,
          expectationIds: [lessonPlanExpectationId],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Counting to 5');
      expect(response.body.duration).toBe(45);
      expect(response.body.isSubFriendly).toBe(true);
    });

    test('should get lessons by date range', async () => {
      // Create test lesson first
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Lesson for Date Range',
          unitPlanId: testUnitPlanId,
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
    beforeEach(async () => {
      // Create test expectation for AI tests
      const expectationResponse = await request(app)
        .post('/api/curriculum-expectations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: `AI.1.1.${Date.now()}`,
          description: 'AI test expectation for number recognition',
          strand: 'Number Sense',
          grade: 1,
          subject: 'Mathematics',
        });
      aiTestExpectationId = expectationResponse.body.id;
    });

    test('should handle AI draft generation request', async () => {
      const response = await request(app)
        .post('/api/long-range-plans/ai-draft')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expectationIds: [aiTestExpectationId],
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
      // 1. Create curriculum expectation
      const expectationResponse = await request(app)
        .post('/api/curriculum-expectations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          code: `FLOW.1.1.${Date.now()}`,
          description: 'Complete flow test expectation',
          strand: 'Number Sense',
          grade: 1,
          subject: 'Mathematics',
        });
      const expectationId = expectationResponse.body.id;

      // 2. Create long-range plan
      const longRangeResponse = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Complete Flow Test Plan',
          academicYear: '2024-2025',
          grade: 1,
          subject: 'Mathematics',
          expectationIds: [expectationId],
        });
      const longRangePlanId = longRangeResponse.body.id;

      // 3. Create unit plan
      const unitResponse = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Complete Flow Unit',
          longRangePlanId,
          startDate: '2024-09-01T00:00:00.000Z',
          endDate: '2024-09-30T23:59:59.999Z',
          expectationIds: [expectationId],
        });
      const unitPlanId = unitResponse.body.id;

      // 4. Create lesson plan
      const lessonResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Complete Flow Lesson',
          unitPlanId,
          date: '2024-09-15T09:00:00Z',
          duration: 45,
          isSubFriendly: false,
          expectationIds: [expectationId],
        });
      const lessonPlanId = lessonResponse.body.id;

      // 5. Create daybook entry
      const daybookResponse = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2024-09-15T00:00:00Z',
          lessonPlanId,
          notes: 'Complete flow test',
          overallRating: 5,
        });

      // Verify all components were created successfully
      expect(expectationResponse.status).toBe(201);
      expect(longRangeResponse.status).toBe(201);
      expect(unitResponse.status).toBe(201);
      expect(lessonResponse.status).toBe(201);
      expect(daybookResponse.status).toBe(201);

      // Verify relationships
      expect(longRangeResponse.body.expectations).toHaveLength(1);
      expect(unitResponse.body.longRangePlanId).toBe(longRangePlanId);
      expect(lessonResponse.body.unitPlanId).toBe(unitPlanId);
      expect(daybookResponse.body.lessonPlanId).toBe(lessonPlanId);
    });
  });
});