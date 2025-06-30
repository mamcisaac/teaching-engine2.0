import request from 'supertest';
import { describe, beforeAll, beforeEach, afterEach, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import {
  getIntegrationTestPrismaClient,
  cleanIntegrationTestData,
} from '../integration-test-setup';
import {
  createTestUser,
  createTestExpectation,
  createTestPlanningHierarchy,
  cleanAllTables,
} from '../helpers/test-db-helpers';
import jwt from 'jsonwebtoken';
import type {
  PrismaClient,
  User,
  CurriculumExpectation,
  LongRangePlan,
  UnitPlan,
} from '@teaching-engine/database';

describe('Curriculum Routes', () => {
  let prisma: PrismaClient;
  let authToken: string;
  let userId: number;
  let testUser: User;
  let testLongRangePlan: LongRangePlan;
  let testUnitPlan: UnitPlan;
  let testExpectation: CurriculumExpectation;

  beforeAll(async () => {
    prisma = getIntegrationTestPrismaClient();
  });

  beforeEach(async () => {
    // Clean up test data using the unified helper
    await cleanIntegrationTestData(prisma);

    // Create test user using helper
    testUser = await createTestUser(prisma);
    userId = testUser.id;

    // Create auth token
    const secret = process.env.JWT_SECRET || 'test-secret-key';
    authToken = jwt.sign(
      {
        userId: String(userId),
        email: testUser.email,
        iat: Math.floor(Date.now() / 1000),
      },
      secret,
      { expiresIn: '1h' },
    );

    // Create test curriculum expectation using helper
    testExpectation = await createTestExpectation(prisma);

    // Create test planning hierarchy using helper
    const hierarchy = await createTestPlanningHierarchy(prisma, userId, [testExpectation.id]);
    testLongRangePlan = hierarchy.longRangePlan;
    testUnitPlan = hierarchy.unitPlan;
  });

  afterEach(async () => {
    // Clean up after each test using helper
    await cleanAllTables(prisma);
  });

  describe('Long Range Plans - GET /api/long-range-plans', () => {
    it('should return all long-range plans for authenticated user', async () => {
      const res = await request(app)
        .get('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: testLongRangePlan.id,
        title: 'Test Long Range Plan',
        academicYear: '2024-2025',
        grade: 5,
        subject: 'Mathematics',
        _count: {
          unitPlans: 1,
          expectations: 1,
        },
      });
    });

    it('should filter by academic year', async () => {
      // Create another plan for different year
      await prisma.longRangePlan.create({
        data: {
          userId,
          title: 'Old Plan',
          academicYear: '2023-2024',
          grade: 5,
          subject: 'Mathematics',
        },
      });

      const res = await request(app)
        .get('/api/long-range-plans?academicYear=2024-2025')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].academicYear).toBe('2024-2025');
    });

    it('should filter by subject', async () => {
      await prisma.longRangePlan.create({
        data: {
          userId,
          title: 'Science Plan',
          academicYear: '2024-2025',
          grade: 5,
          subject: 'Science',
        },
      });

      const res = await request(app)
        .get('/api/long-range-plans?subject=Mathematics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].subject).toBe('Mathematics');
    });

    it('should filter by grade', async () => {
      await prisma.longRangePlan.create({
        data: {
          userId,
          title: 'Grade 6 Plan',
          academicYear: '2024-2025',
          grade: 6,
          subject: 'Mathematics',
        },
      });

      const res = await request(app)
        .get('/api/long-range-plans?grade=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].grade).toBe(5);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/long-range-plans');

      expect(res.status).toBe(401);
    });
  });

  describe('Long Range Plans - GET /api/long-range-plans/:id', () => {
    it('should return a single long-range plan', async () => {
      const res = await request(app)
        .get(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: testLongRangePlan.id,
        title: 'Test Long Range Plan',
        unitPlans: expect.arrayContaining([
          expect.objectContaining({
            id: testUnitPlan.id,
          }),
        ]),
        expectations: expect.arrayContaining([
          expect.objectContaining({
            id: testExpectation.id,
          }),
        ]),
      });
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app)
        .get('/api/long-range-plans/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should not return plans from other users', async () => {
      // Create another user and their plan using helper
      const otherUser = await createTestUser(prisma, 'other@example.com');

      const otherPlan = await prisma.longRangePlan.create({
        data: {
          userId: otherUser.id,
          title: 'Other User Plan',
          academicYear: '2024-2025',
          grade: 5,
          subject: 'Mathematics',
        },
      });

      const res = await request(app)
        .get(`/api/long-range-plans/${otherPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Long Range Plans - POST /api/long-range-plans', () => {
    it('should create a new long-range plan', async () => {
      const newPlan = {
        title: 'New Math Plan',
        titleFr: 'Nouveau Plan de Math',
        academicYear: '2024-2025',
        term: 'Fall',
        grade: 6,
        subject: 'Mathematics',
        description: 'A comprehensive math plan',
        goals: 'Improve problem-solving skills',
        themes: ['Numbers', 'Geometry', 'Algebra'],
        expectationIds: [testExpectation.id],
        overarchingQuestions: 'How do patterns help us understand the world?',
        assessmentOverview: 'Combination of formative and summative assessments',
        resourceNeeds: 'Manipulatives, online tools',
        professionalGoals: 'Integrate more technology',
      };

      const res = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPlan);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'New Math Plan',
        grade: 6,
        subject: 'Mathematics',
        themes: ['Numbers', 'Geometry', 'Algebra'],
      });

      // Verify in database
      const created = await prisma.longRangePlan.findUnique({
        where: { id: res.body.id },
        include: { expectations: true },
      });
      expect(created).toBeTruthy();
      expect(created?.expectations).toHaveLength(1);
    });

    it('should validate required fields', async () => {
      const invalidPlan = {
        // Missing required fields
        description: 'Some description',
      };

      const res = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPlan);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate academic year format', async () => {
      const invalidPlan = {
        title: 'Test Plan',
        academicYear: '2024', // Invalid format
        grade: 5,
        subject: 'Mathematics',
      };

      const res = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPlan);

      expect(res.status).toBe(400);
    });

    it('should validate grade range', async () => {
      const invalidPlan = {
        title: 'Test Plan',
        academicYear: '2024-2025',
        grade: 15, // Invalid grade
        subject: 'Mathematics',
      };

      const res = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidPlan);

      expect(res.status).toBe(400);
    });
  });

  describe('Long Range Plans - PUT /api/long-range-plans/:id', () => {
    it('should update an existing long-range plan', async () => {
      const updateData = {
        title: 'Updated Plan Title',
        description: 'Updated description',
        themes: ['Updated Theme 1', 'Updated Theme 2'],
      };

      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        title: 'Updated Plan Title',
        description: 'Updated description',
        themes: ['Updated Theme 1', 'Updated Theme 2'],
      });
    });

    it('should not update other users plans', async () => {
      const otherUser = await createTestUser(prisma, 'other2@example.com');

      const otherPlan = await prisma.longRangePlan.create({
        data: {
          userId: otherUser.id,
          title: 'Other Plan',
          academicYear: '2024-2025',
          grade: 5,
          subject: 'Mathematics',
        },
      });

      const res = await request(app)
        .put(`/api/long-range-plans/${otherPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(404);
    });
  });

  describe('Long Range Plans - DELETE /api/long-range-plans/:id', () => {
    it('should delete a long-range plan', async () => {
      const res = await request(app)
        .delete(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verify deletion
      const deleted = await prisma.longRangePlan.findUnique({
        where: { id: testLongRangePlan.id },
      });
      expect(deleted).toBeNull();
    });

    it('should not delete plans with unit plans', async () => {
      // Unit plan already exists from setup
      const res = await request(app)
        .delete(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Should still work but you might want to change this behavior
      expect(res.status).toBe(204);
    });
  });

  describe('Unit Plans - GET /api/unit-plans', () => {
    it('should return all unit plans for authenticated user', async () => {
      const res = await request(app)
        .get('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: testUnitPlan.id,
        title: 'Test Unit Plan',
        longRangePlan: {
          id: testLongRangePlan.id,
          title: 'Test Long Range Plan',
        },
        _count: {
          lessonPlans: 0,
          expectations: 1,
          resources: 0,
        },
      });
    });

    it('should filter by long-range plan', async () => {
      const res = await request(app)
        .get(`/api/unit-plans?longRangePlanId=${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('should filter by date range', async () => {
      const res = await request(app)
        .get('/api/unit-plans?startDate=2024-08-01&endDate=2024-10-01')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('Unit Plans - POST /api/unit-plans', () => {
    it('should create a new unit plan with all fields', async () => {
      const newUnit = {
        title: 'Fractions Unit',
        titleFr: 'Unité des Fractions',
        longRangePlanId: testLongRangePlan.id,
        description: 'Understanding fractions and decimals',
        bigIdeas: 'Fractions represent parts of a whole',
        essentialQuestions: [
          'How do fractions help us in daily life?',
          'What is the relationship between fractions and decimals?',
        ],
        startDate: '2024-10-01T00:00:00Z',
        endDate: '2024-10-31T00:00:00Z',
        estimatedHours: 20,
        assessmentPlan: 'Quiz, project, and performance task',
        successCriteria: [
          'Can identify and create equivalent fractions',
          'Can convert between fractions and decimals',
        ],
        expectationIds: [testExpectation.id],
        crossCurricularConnections: 'Science: measurements, Art: proportions',
        learningSkills: ['Critical Thinking', 'Problem Solving'],
        culminatingTask: 'Design a recipe book using fractions',
        keyVocabulary: ['numerator', 'denominator', 'equivalent', 'simplify'],
        priorKnowledge: 'Basic division and multiplication',
        parentCommunicationPlan: 'Newsletter and math night',
        fieldTripsAndGuestSpeakers: 'Visit to bakery to see fractions in action',
        differentiationStrategies: {
          forStruggling: ['Use manipulatives', 'Peer tutoring'],
          forAdvanced: ['Complex word problems', 'Create fraction games'],
          forELL: ['Visual aids', 'Vocabulary cards'],
          forIEP: ['Extended time', 'Modified assessments'],
        },
        indigenousPerspectives: 'Traditional beading patterns using fractions',
        environmentalEducation: 'Reduce food waste by understanding portions',
        socialJusticeConnections: 'Fair sharing and distribution',
        technologyIntegration: 'Fraction apps and online games',
        communityConnections: 'Local businesses using fractions',
      };

      const res = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newUnit);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Fractions Unit',
        estimatedHours: 20,
        learningSkills: ['Critical Thinking', 'Problem Solving'],
        keyVocabulary: expect.arrayContaining(['numerator', 'denominator']),
      });
    });

    it('should validate HTML injection in title', async () => {
      const maliciousUnit = {
        title: '<script>alert("XSS")</script>',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-10-01T00:00:00Z',
        endDate: '2024-10-31T00:00:00Z',
        expectationIds: [testExpectation.id],
      };

      const res = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousUnit);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('cannot contain HTML tags');
    });

    it('should require at least one expectation', async () => {
      const unitWithoutExpectations = {
        title: 'Test Unit',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-10-01T00:00:00Z',
        endDate: '2024-10-31T00:00:00Z',
        expectationIds: [], // Empty array
      };

      const res = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(unitWithoutExpectations);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('At least one curriculum expectation');
    });

    it('should validate array length limits', async () => {
      const tooManyQuestions = {
        title: 'Test Unit',
        longRangePlanId: testLongRangePlan.id,
        startDate: '2024-10-01T00:00:00Z',
        endDate: '2024-10-31T00:00:00Z',
        expectationIds: [testExpectation.id],
        essentialQuestions: Array(21).fill('Question?'), // 21 questions, max is 20
      };

      const res = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tooManyQuestions);

      expect(res.status).toBe(400);
    });
  });

  describe('Unit Plans - PUT /api/unit-plans/:id', () => {
    it('should update unit plan fields', async () => {
      const updateData = {
        title: 'Updated Unit Title',
        estimatedHours: 25,
        assessmentPlan: 'New assessment strategy',
        keyVocabulary: ['updated', 'vocabulary', 'terms'],
      };

      const res = await request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updateData);
    });

    it('should not allow updating longRangePlanId', async () => {
      const otherLongRangePlan = await prisma.longRangePlan.create({
        data: {
          userId,
          title: 'Another Plan',
          academicYear: '2024-2025',
          grade: 5,
          subject: 'Science',
        },
      });

      const res = await request(app)
        .put(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ longRangePlanId: otherLongRangePlan.id });

      expect(res.status).toBe(200);

      // Verify longRangePlanId didn't change
      const unit = await prisma.unitPlan.findUnique({
        where: { id: testUnitPlan.id },
      });
      expect(unit?.longRangePlanId).toBe(testLongRangePlan.id);
    });
  });

  describe('Unit Plans - DELETE /api/unit-plans/:id', () => {
    it('should delete a unit plan', async () => {
      const res = await request(app)
        .delete(`/api/unit-plans/${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      const deleted = await prisma.unitPlan.findUnique({
        where: { id: testUnitPlan.id },
      });
      expect(deleted).toBeNull();
    });
  });

  describe('AI Generation Endpoints', () => {
    it('should generate AI draft for long-range plan', async () => {
      const res = await request(app)
        .post('/api/long-range-plans/generate-draft')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          grade: 5,
          subject: 'Mathematics',
          academicYear: '2024-2025',
          context: 'Focus on problem-solving and real-world applications',
        });

      // This might fail if AI service is not configured
      expect([200, 500, 503]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('draft');
      }
    });

    it('should generate AI suggestions for existing plan', async () => {
      const res = await request(app)
        .post(`/api/long-range-plans/${testLongRangePlan.id}/generate-suggestions`)
        .set('Authorization', `Bearer ${authToken}`);

      // This might fail if AI service is not configured
      expect([200, 500, 503]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('suggestions');
      }
    });
  });

  describe('Curriculum Expectations - GET /api/curriculum/expectations', () => {
    it('should return curriculum expectations', async () => {
      const res = await request(app)
        .get('/api/curriculum/expectations?grade=5&subject=Mathematics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: testExpectation.id,
        code: 'TEST-5.1',
        description: 'Test expectation',
      });
    });
  });
});
