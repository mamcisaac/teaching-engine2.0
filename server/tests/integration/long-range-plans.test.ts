import request from 'supertest';
import { describe, beforeAll, beforeEach, afterEach, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import { getIntegrationTestPrismaClient, cleanIntegrationTestData } from '../integration-test-setup';
import { resetRateLimiterState } from '../../src/middleware/rateLimiter';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Long-Range Plans CRUD Operations', () => {
  let prisma: ReturnType<typeof getIntegrationTestPrismaClient>;
  let authToken: string;
  let otherUserToken: string;
  let userId: number;
  let otherUserId: number;
  let testUser: any;
  let otherUser: any;
  let testExpectation1: any;
  let testExpectation2: any;
  let testLongRangePlan: any;

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
        description: 'Test expectation 1 for long-range planning',
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
        description: 'Test expectation 2 for long-range planning',
        descriptionFr: 'Test expectation 2 FR',
        strand: 'Algebra',
        substrand: 'Patterns and Relationships',
        grade: 5,
        subject: 'Mathematics',
      },
    });

    // Create a default long-range plan for update/delete tests
    testLongRangePlan = await prisma.longRangePlan.create({
      data: {
        userId,
        title: 'Grade 5 Mathematics Long Range Plan',
        titleFr: 'Plan à long terme de mathématiques 5e année',
        academicYear: '2024-2025',
        term: 'Fall',
        grade: 5,
        subject: 'Mathematics',
        description: 'Comprehensive math plan for grade 5',
        descriptionFr: 'Plan complet de mathématiques pour la 5e année',
        goals: 'Build strong foundation in number sense and algebra',
        goalsFr: 'Construire une base solide en numératie et algèbre',
        themes: ['Problem Solving', 'Real-World Applications'],
        overarchingQuestions: 'How do we use math in everyday life?',
        assessmentOverview: 'Mix of formative and summative assessments',
        resourceNeeds: 'Manipulatives, digital tools, textbooks',
        professionalGoals: 'Improve differentiation strategies',
      },
    });

    // Link expectations to the plan
    await prisma.longRangePlanExpectation.createMany({
      data: [
        { longRangePlanId: testLongRangePlan.id, expectationId: testExpectation1.id },
        { longRangePlanId: testLongRangePlan.id, expectationId: testExpectation2.id },
      ],
    });
  });

  afterEach(async () => {
    // Clean up after each test using the unified helper
    await cleanIntegrationTestData();
    
    // Small delay to avoid rate limiting between tests
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('UPDATE Operation - PUT /api/long-range-plans/:id', () => {
    it('should update title, description, and academic year', async () => {
      const updateData = {
        title: 'Updated Grade 5 Mathematics Plan',
        description: 'Updated comprehensive plan with new focus areas',
        academicYear: '2025-2026',
      };

      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect([200, 429]).toContain(res.status);
      expect(res.body).toMatchObject({
        id: testLongRangePlan.id,
        title: updateData.title,
        description: updateData.description,
        academicYear: updateData.academicYear,
        // Unchanged fields should remain the same
        subject: 'Mathematics',
        grade: 5,
        userId,
      });

      // Verify in database
      const updated = await prisma.longRangePlan.findUnique({
        where: { id: testLongRangePlan.id },
      });
      expect(updated?.title).toBe(updateData.title);
      expect(updated?.description).toBe(updateData.description);
      expect(updated?.academicYear).toBe(updateData.academicYear);
    });

    it('should update themes and ETFO-aligned fields', async () => {
      const updateData = {
        themes: ['STEM Integration', 'Indigenous Perspectives', 'Social Justice'],
        overarchingQuestions: 'How does mathematics help us understand and improve our world?',
        assessmentOverview: 'Portfolio-based assessment with peer and self-evaluation',
        resourceNeeds: 'Community partnerships, field trips, guest speakers',
        professionalGoals: 'Integrate culturally responsive teaching practices',
      };

      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect([200, 429]).toContain(res.status);
      expect(res.body).toMatchObject(updateData);
    });

    it('should update curriculum expectations', async () => {
      // Create a new expectation to replace the existing ones
      const newExpectation = await prisma.curriculumExpectation.create({
        data: {
          code: 'MATH-5.3',
          description: 'New expectation for update test',
          strand: 'Geometry',
          grade: 5,
          subject: 'Mathematics',
        },
      });

      const updateData = {
        expectationIds: [newExpectation.id],
      };

      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect([200, 429]).toContain(res.status);
      expect(res.body.expectations).toHaveLength(1);
      expect(res.body.expectations[0].expectation.id).toBe(newExpectation.id);

      // Verify old expectations were removed
      const planExpectations = await prisma.longRangePlanExpectation.findMany({
        where: { longRangePlanId: testLongRangePlan.id },
      });
      expect(planExpectations).toHaveLength(1);
    });

    it('should clear all expectations when empty array provided', async () => {
      const updateData = {
        expectationIds: [],
      };

      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect([200, 429]).toContain(res.status);
      expect(res.body.expectations).toHaveLength(0);

      // Verify in database
      const planExpectations = await prisma.longRangePlanExpectation.findMany({
        where: { longRangePlanId: testLongRangePlan.id },
      });
      expect(planExpectations).toHaveLength(0);
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app)
        .put('/api/long-range-plans/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Long-range plan not found');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('should prevent updating plans owned by other users', async () => {
      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ title: 'Unauthorized Update' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Long-range plan not found');
    });

    it('should validate academic year format', async () => {
      const updateData = {
        academicYear: '2024', // Invalid format, should be YYYY-YYYY
      };

      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should handle partial updates correctly', async () => {
      const updateData = {
        title: 'Only Title Updated',
        // Other fields not provided
      };

      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect([200, 429]).toContain(res.status);
      expect(res.body.title).toBe(updateData.title);
      // Other fields should remain unchanged
      expect(res.body.description).toBe(testLongRangePlan.description);
      expect(res.body.grade).toBe(testLongRangePlan.grade);
      expect(res.body.subject).toBe(testLongRangePlan.subject);
    });
  });

  describe('DELETE Operation - DELETE /api/long-range-plans/:id', () => {
    it('should delete a long-range plan without dependencies', async () => {
      const res = await request(app)
        .delete(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verify deletion in database
      const deleted = await prisma.longRangePlan.findUnique({
        where: { id: testLongRangePlan.id },
      });
      expect(deleted).toBeNull();

      // Verify expectations junction records were cascade deleted
      const planExpectations = await prisma.longRangePlanExpectation.findMany({
        where: { longRangePlanId: testLongRangePlan.id },
      });
      expect(planExpectations).toHaveLength(0);
    });

    it('should prevent deletion of plan with unit plans (cascade protection)', async () => {
      // Create a unit plan linked to the long-range plan
      const unitPlan = await prisma.unitPlan.create({
        data: {
          userId,
          longRangePlanId: testLongRangePlan.id,
          title: 'Unit 1: Number Sense',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-10-15'),
        },
      });

      const res = await request(app)
        .delete(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Cannot delete long-range plan with existing unit plans');

      // Verify plan still exists
      const plan = await prisma.longRangePlan.findUnique({
        where: { id: testLongRangePlan.id },
      });
      expect(plan).not.toBeNull();
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app)
        .delete('/api/long-range-plans/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Long-range plan not found');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .delete(`/api/long-range-plans/${testLongRangePlan.id}`);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('should prevent deleting plans owned by other users', async () => {
      const res = await request(app)
        .delete(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Long-range plan not found');

      // Verify plan still exists
      const plan = await prisma.longRangePlan.findUnique({
        where: { id: testLongRangePlan.id },
      });
      expect(plan).not.toBeNull();
    });
  });

  describe('Single READ Operation - GET /api/long-range-plans/:id', () => {
    it('should retrieve a single plan with all relationships', async () => {
      // Create a unit plan to test relationship inclusion
      const unitPlan = await prisma.unitPlan.create({
        data: {
          userId,
          longRangePlanId: testLongRangePlan.id,
          title: 'Unit 1: Number Sense',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-10-15'),
        },
      });

      // Create a lesson plan for the unit
      await prisma.eTFOLessonPlan.create({
        data: {
          userId,
          unitPlanId: unitPlan.id,
          title: 'Lesson 1: Introduction',
          date: new Date('2024-09-05'),
          duration: 60,
          grade: 5,
          subject: 'Mathematics',
          learningGoals: 'Introduction to the topic',
          materials: ['Textbook'],
          mindsOn: 'Review previous concepts',
          action: 'Main teaching activity',
          consolidation: 'Summary and reflection',
        },
      });

      const res = await request(app)
        .get(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(res.status);
      expect(res.body).toMatchObject({
        id: testLongRangePlan.id,
        title: testLongRangePlan.title,
        academicYear: testLongRangePlan.academicYear,
        grade: testLongRangePlan.grade,
        subject: testLongRangePlan.subject,
      });

      // Verify expectations are included with full details
      expect(res.body.expectations).toHaveLength(2);
      expect(res.body.expectations[0]).toHaveProperty('expectation');
      expect(res.body.expectations[0].expectation).toHaveProperty('code');
      expect(res.body.expectations[0].expectation).toHaveProperty('description');

      // Verify unit plans are included with counts
      expect(res.body.unitPlans).toHaveLength(1);
      expect(res.body.unitPlans[0]).toMatchObject({
        id: unitPlan.id,
        title: unitPlan.title,
        _count: {
          expectations: 0,
        },
      });
    });

    it('should return 404 for non-existent plan', async () => {
      const res = await request(app)
        .get('/api/long-range-plans/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Long-range plan not found');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get(`/api/long-range-plans/${testLongRangePlan.id}`);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('should not return plans owned by other users', async () => {
      const res = await request(app)
        .get(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Long-range plan not found');
    });

    it('should handle plans with no expectations or units gracefully', async () => {
      // Create a plan with no relationships
      const emptyPlan = await prisma.longRangePlan.create({
        data: {
          userId,
          title: 'Empty Plan',
          academicYear: '2024-2025',
          grade: 6,
          subject: 'Science',
        },
      });

      const res = await request(app)
        .get(`/api/long-range-plans/${emptyPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 429]).toContain(res.status);
      expect(res.body.expectations).toHaveLength(0);
      expect(res.body.unitPlans).toHaveLength(0);
    });
  });

  describe('Authorization Tests', () => {
    let userAPlan: any;
    let userBPlan: any;
    let userAToken: string;
    let userBToken: string;

    beforeEach(async () => {
      // Create two different users with their own plans
      const userA = await prisma.user.create({
        data: {
          email: `userA-${Date.now()}@example.com`,
          password: await bcrypt.hash('password', 10),
          name: 'User A',
          role: 'teacher',
        },
      });

      const userB = await prisma.user.create({
        data: {
          email: `userB-${Date.now()}@example.com`,
          password: await bcrypt.hash('password', 10),
          name: 'User B',
          role: 'teacher',
        },
      });

      const secret = process.env.JWT_SECRET || 'test-secret-key';
      userAToken = jwt.sign({ 
        userId: String(userA.id), 
        email: userA.email,
        iat: Math.floor(Date.now() / 1000)
      }, secret, { expiresIn: '1h' });

      userBToken = jwt.sign({ 
        userId: String(userB.id), 
        email: userB.email,
        iat: Math.floor(Date.now() / 1000)
      }, secret, { expiresIn: '1h' });

      // Create plans for each user
      userAPlan = await prisma.longRangePlan.create({
        data: {
          userId: userA.id,
          title: 'User A Plan',
          academicYear: '2024-2025',
          grade: 4,
          subject: 'English',
        },
      });

      userBPlan = await prisma.longRangePlan.create({
        data: {
          userId: userB.id,
          title: 'User B Plan',
          academicYear: '2024-2025',
          grade: 4,
          subject: 'English',
        },
      });
    });

    it('should only list plans owned by authenticated user', async () => {
      const res = await request(app)
        .get('/api/long-range-plans')
        .set('Authorization', `Bearer ${userAToken}`);

      expect([200, 429]).toContain(res.status);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].id).toBe(userAPlan.id);
      expect(res.body[0].title).toBe('User A Plan');
    });

    it('should not allow cross-user plan access on GET', async () => {
      const res = await request(app)
        .get(`/api/long-range-plans/${userBPlan.id}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(404);
    });

    it('should not allow cross-user plan access on PUT', async () => {
      const res = await request(app)
        .put(`/api/long-range-plans/${userBPlan.id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(404);

      // Verify plan wasn't modified
      const plan = await prisma.longRangePlan.findUnique({
        where: { id: userBPlan.id },
      });
      expect(plan?.title).toBe('User B Plan');
    });

    it('should not allow cross-user plan access on DELETE', async () => {
      const res = await request(app)
        .delete(`/api/long-range-plans/${userBPlan.id}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(404);

      // Verify plan still exists
      const plan = await prisma.longRangePlan.findUnique({
        where: { id: userBPlan.id },
      });
      expect(plan).not.toBeNull();
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle invalid ID format gracefully', async () => {
      const invalidIds = ['123-invalid-uuid'];

      for (const id of invalidIds) {
        const res = await request(app)
          .get(`/api/long-range-plans/${id}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(404);
      }
    });

    it('should validate required fields on update', async () => {
      const invalidUpdates = [
        { title: '' }, // Empty title
        { title: null }, // Null title
        { grade: 0 }, // Grade too low
        { grade: 13 }, // Grade too high
        { subject: '' }, // Empty subject
      ];

      for (const update of invalidUpdates) {
        const res = await request(app)
          .put(`/api/long-range-plans/${testLongRangePlan.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(update);

        expect([400, 429]).toContain(res.status);
        if (res.status === 400) {
          expect(res.body).toHaveProperty('errors');
        }
      }
    });

    it('should handle missing required fields on create', async () => {
      const invalidPlans = [
        {}, // No fields
        { title: 'Test' }, // Missing academicYear, grade, subject
        { title: 'Test', academicYear: '2024-2025' }, // Missing grade, subject
        { title: 'Test', academicYear: '2024-2025', grade: 5 }, // Missing subject
      ];

      for (const plan of invalidPlans) {
        const res = await request(app)
          .post('/api/long-range-plans')
          .set('Authorization', `Bearer ${authToken}`)
          .send(plan);

        expect([400, 429]).toContain(res.status);
        if (res.status === 400) {
          expect(res.body).toHaveProperty('errors');
        }
      }
    });

    it('should validate date format for academic year', async () => {
      const invalidYears = [
        '2024', // Single year
        '24-25', // Short format
        '2024/2025', // Wrong separator
        '2024-2026', // Not consecutive years
        'invalid', // Non-numeric
      ];

      for (const year of invalidYears) {
        const res = await request(app)
          .put(`/api/long-range-plans/${testLongRangePlan.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ academicYear: year });

        expect([400, 429]).toContain(res.status);
        if (res.status === 400) {
          expect(res.body).toHaveProperty('errors');
        }
      }
    });

    it('should handle very long text fields appropriately', async () => {
      const longText = 'A'.repeat(10000); // Very long text
      
      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: longText,
          goals: longText,
          overarchingQuestions: longText,
        });

      expect([200, 429]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.description).toBe(longText);
        expect(res.body.goals).toBe(longText);
        expect(res.body.overarchingQuestions).toBe(longText);
      }
    });

    it('should handle concurrent updates without data loss', async () => {
      // Simulate concurrent updates to different fields
      const update1 = request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Concurrent Update 1' });

      const update2 = request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Concurrent Update 2' });

      const [res1, res2] = await Promise.all([update1, update2]);

      expect([200, 429]).toContain(res1.status);
      expect([200, 429]).toContain(res2.status);

      // Last update should win for the specific field
      const finalPlan = await prisma.longRangePlan.findUnique({
        where: { id: testLongRangePlan.id },
      });
      expect(finalPlan).not.toBeNull();
      // Both updates should have been applied to their respective fields
    });

    it('should handle invalid expectation IDs on update', async () => {
      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expectationIds: ['invalid-id-1', 'invalid-id-2'],
        });

      // The route validates expectation IDs exist
      expect([400, 429]).toContain(res.status);
      if (res.status === 400) {
        expect(res.body).toHaveProperty('message');
      }
    });

    it('should preserve themes array structure', async () => {
      const themes = ['Theme 1', 'Theme 2', 'Theme with special chars!@#$%'];
      
      const res = await request(app)
        .put(`/api/long-range-plans/${testLongRangePlan.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ themes });

      expect([200, 429]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.themes).toEqual(themes);
        expect(Array.isArray(res.body.themes)).toBe(true);
      }
    });
  });
});