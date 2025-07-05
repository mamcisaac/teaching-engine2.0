/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';
import { LongRangePlan, UnitPlan, ETFOLessonPlan, DaybookEntry, RecentPlanAccess } from '@prisma/client';

describe('Recent Plans Routes', () => {
  let authToken: string;
  let userId: number;
  let testEmail: string;
  let longRangePlan: LongRangePlan;
  let unitPlan: UnitPlan;
  let lessonPlan: ETFOLessonPlan;
  let daybookEntry: DaybookEntry;

  beforeAll(async () => {
    // Create test user
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const timestamp = Date.now();
    testEmail = `recent-plans-test-${timestamp}@example.com`;

    // Clean up any existing user
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Test User',
        password: hashedPassword,
        role: 'TEACHER',
      },
    });

    userId = testUser.id;

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'testpassword123',
      });

    authToken = loginResponse.body.token;
  });

  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.recentPlanAccess.deleteMany({ where: { userId } });
    await prisma.daybookEntry.deleteMany({ where: { userId } });
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId } });
    await prisma.unitPlan.deleteMany({ where: { userId } });
    await prisma.longRangePlan.deleteMany({ where: { userId } });

    // Create test data hierarchy
    longRangePlan = await prisma.longRangePlan.create({
      data: {
        userId,
        title: 'Grade 5 Mathematics Long Range Plan',
        subject: 'Mathematics',
        grade: '5',
        academicYear: '2024-2025',
        term: 'Full Year',
        status: 'draft',
      },
    });

    unitPlan = await prisma.unitPlan.create({
      data: {
        userId,
        longRangePlanId: longRangePlan.id,
        title: 'Number Sense and Numeration',
        description: 'Understanding numbers and operations',
        duration: 4,
        unitNumber: 1,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-30'),
      },
    });

    lessonPlan = await prisma.eTFOLessonPlan.create({
      data: {
        userId,
        unitPlanId: unitPlan.id,
        title: 'Introduction to Fractions',
        date: new Date('2024-09-15'),
        status: 'draft',
        learningGoals: 'Students will understand basic fractions',
        successCriteria: 'Can identify and represent simple fractions',
        openingActivities: 'Fraction pizza activity',
        middleActivities: 'Practice with manipulatives',
        closingActivities: 'Exit ticket assessment',
        assessmentStrategies: 'Observation and exit tickets',
      },
    });

    daybookEntry = await prisma.daybookEntry.create({
      data: {
        userId,
        lessonPlanId: lessonPlan.id,
        date: new Date('2024-09-15'),
        reflections: 'Lesson went well, students engaged',
        nextSteps: 'Continue with more complex fractions',
      },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.recentPlanAccess.deleteMany({ where: { userId } });
    await prisma.daybookEntry.deleteMany({ where: { userId } });
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId } });
    await prisma.unitPlan.deleteMany({ where: { userId } });
    await prisma.longRangePlan.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  });

  describe('POST /api/recent-plans/track', () => {
    test('should track plan access successfully', async () => {
      const response = await request(app)
        .post('/api/recent-plans/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'long-range',
          planId: longRangePlan.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify in database
      const access = await prisma.recentPlanAccess.findUnique({
        where: {
          userId_planType_planId: {
            userId,
            planType: 'long-range',
            planId: longRangePlan.id,
          },
        },
      });

      expect(access).toBeTruthy();
      expect(access?.accessCount).toBe(1);
    });

    test('should increment access count on subsequent tracks', async () => {
      // First access
      await request(app)
        .post('/api/recent-plans/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'unit',
          planId: unitPlan.id,
        });

      // Second access
      await request(app)
        .post('/api/recent-plans/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'unit',
          planId: unitPlan.id,
        });

      // Verify count increased
      const access = await prisma.recentPlanAccess.findUnique({
        where: {
          userId_planType_planId: {
            userId,
            planType: 'unit',
            planId: unitPlan.id,
          },
        },
      });

      expect(access?.accessCount).toBe(2);
    });

    test('should track different plan types independently', async () => {
      // Track all plan types
      await request(app)
        .post('/api/recent-plans/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planType: 'long-range', planId: longRangePlan.id });

      await request(app)
        .post('/api/recent-plans/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planType: 'unit', planId: unitPlan.id });

      await request(app)
        .post('/api/recent-plans/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planType: 'lesson', planId: lessonPlan.id });

      await request(app)
        .post('/api/recent-plans/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planType: 'daybook', planId: daybookEntry.id });

      // Verify all tracked
      const accesses = await prisma.recentPlanAccess.count({
        where: { userId },
      });

      expect(accesses).toBe(4);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/recent-plans/track')
        .send({
          planType: 'long-range',
          planId: longRangePlan.id,
        });

      expect(response.status).toBe(401);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/recent-plans/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'long-range',
          // Missing planId
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Plan type and ID are required');
    });

    test('should handle invalid plan types gracefully', async () => {
      const response = await request(app)
        .post('/api/recent-plans/track')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          planType: 'invalid-type',
          planId: 999,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/recent-plans', () => {
    beforeEach(async () => {
      // Create some access history
      await prisma.recentPlanAccess.createMany({
        data: [
          {
            userId,
            planType: 'long-range',
            planId: longRangePlan.id,
            lastAccessed: new Date('2024-01-04T10:00:00Z'),
            accessCount: 5,
          },
          {
            userId,
            planType: 'unit',
            planId: unitPlan.id,
            lastAccessed: new Date('2024-01-04T11:00:00Z'),
            accessCount: 3,
          },
          {
            userId,
            planType: 'lesson',
            planId: lessonPlan.id,
            lastAccessed: new Date('2024-01-04T12:00:00Z'),
            accessCount: 2,
          },
          {
            userId,
            planType: 'daybook',
            planId: daybookEntry.id,
            lastAccessed: new Date('2024-01-04T13:00:00Z'),
            accessCount: 1,
          },
        ],
      });
    });

    test('should get recent plans ordered by last accessed', async () => {
      const response = await request(app)
        .get('/api/recent-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(4);

      // Should be ordered by lastAccessed desc
      expect(response.body[0].type).toBe('daybook');
      expect(response.body[1].type).toBe('lesson');
      expect(response.body[2].type).toBe('unit');
      expect(response.body[3].type).toBe('long-range');
    });

    test('should include plan details for each type', async () => {
      const response = await request(app)
        .get('/api/recent-plans')
        .set('Authorization', `Bearer ${authToken}`);

      // Check long-range plan
      const longRangePlanEntry = response.body.find((p: unknown) => p.type === 'long-range');
      expect(longRangePlanEntry).toMatchObject({
        id: longRangePlan.id,
        type: 'long-range',
        title: 'Grade 5 Mathematics Long Range Plan',
        subject: 'Mathematics',
        grade: '5',
        status: 'in-progress',
      });

      // Check unit plan
      const unitPlanEntry = response.body.find((p: unknown) => p.type === 'unit');
      expect(unitPlanEntry).toMatchObject({
        id: unitPlan.id,
        type: 'unit',
        title: 'Number Sense and Numeration',
        subject: 'Mathematics',
        grade: '5',
        parentTitle: 'Grade 5 Mathematics Long Range Plan',
      });

      // Check lesson plan
      const lessonPlanEntry = response.body.find((p: unknown) => p.type === 'lesson');
      expect(lessonPlanEntry).toMatchObject({
        id: lessonPlan.id,
        type: 'lesson',
        title: 'Introduction to Fractions',
        parentTitle: 'Number Sense and Numeration',
        status: 'completed', // Has daybook entry
      });

      // Check daybook entry
      const daybookPlanEntry = response.body.find((p: unknown) => p.type === 'daybook');
      expect(daybookPlanEntry).toMatchObject({
        id: daybookEntry.id,
        type: 'daybook',
        parentTitle: 'Number Sense and Numeration',
      });
    });

    test('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/recent-plans?limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    test('should handle deleted plans gracefully', async () => {
      // Delete a plan
      await prisma.unitPlan.delete({ where: { id: unitPlan.id } });

      const response = await request(app)
        .get('/api/recent-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Should return 3 plans (unit plan filtered out)
      expect(response.body).toHaveLength(3);
      expect(response.body.find((p: unknown) => p.type === 'unit')).toBeUndefined();
    });

    test('should only show plans for authenticated user', async () => {
      // Create another user with different plans
      const bcrypt = (await import('bcryptjs')).default;
      const otherHashedPassword = await bcrypt.hash('otherpassword123', 10);
      const otherUser = await prisma.user.create({
        data: {
          email: `other-user-${Date.now()}@example.com`,
          name: 'Other User',
          password: otherHashedPassword,
          role: 'TEACHER',
        },
      });

      const otherPlan = await prisma.longRangePlan.create({
        data: {
          userId: otherUser.id,
          title: 'Other User Plan',
          subject: 'Science',
          grade: '6',
          academicYear: '2024-2025',
          term: 'Full Year',
          status: 'draft',
        },
      });

      await prisma.recentPlanAccess.create({
        data: {
          userId: otherUser.id,
          planType: 'long-range',
          planId: otherPlan.id,
          lastAccessed: new Date(),
          accessCount: 1,
        },
      });

      // Original user should not see other user's plans
      const response = await request(app)
        .get('/api/recent-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.find((p: unknown) => p.title === 'Other User Plan')).toBeUndefined();
    });

    test('should require authentication', async () => {
      const response = await request(app).get('/api/recent-plans');
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/recent-plans/clear', () => {
    beforeEach(async () => {
      // Create some access history
      await prisma.recentPlanAccess.createMany({
        data: [
          {
            userId,
            planType: 'long-range',
            planId: longRangePlan.id,
            lastAccessed: new Date(),
            accessCount: 5,
          },
          {
            userId,
            planType: 'unit',
            planId: unitPlan.id,
            lastAccessed: new Date(),
            accessCount: 3,
          },
        ],
      });
    });

    test('should clear all recent plans for user', async () => {
      // Verify plans exist
      const before = await prisma.recentPlanAccess.count({
        where: { userId },
      });
      expect(before).toBe(2);

      // Clear history
      const response = await request(app)
        .delete('/api/recent-plans/clear')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify cleared
      const after = await prisma.recentPlanAccess.count({
        where: { userId },
      });
      expect(after).toBe(0);
    });

    test('should only clear plans for authenticated user', async () => {
      // Create another user with access history
      const bcrypt = (await import('bcryptjs')).default;
      const otherHashedPassword = await bcrypt.hash('otherpassword123', 10);
      const otherUser = await prisma.user.create({
        data: {
          email: `other-clear-test-${Date.now()}@example.com`,
          name: 'Other User',
          password: otherHashedPassword,
          role: 'TEACHER',
        },
      });

      await prisma.recentPlanAccess.create({
        data: {
          userId: otherUser.id,
          planType: 'long-range',
          planId: 999,
          lastAccessed: new Date(),
          accessCount: 1,
        },
      });

      // Clear original user's history
      await request(app)
        .delete('/api/recent-plans/clear')
        .set('Authorization', `Bearer ${authToken}`);

      // Other user's history should remain
      const otherUserAccess = await prisma.recentPlanAccess.count({
        where: { userId: otherUser.id },
      });
      expect(otherUserAccess).toBe(1);
    });

    test('should require authentication', async () => {
      const response = await request(app).delete('/api/recent-plans/clear');
      expect(response.status).toBe(401);
    });
  });

  describe('Edge Cases', () => {
    test('should handle plans with missing parent data', async () => {
      // Create orphaned lesson plan
      const orphanedLesson = await prisma.eTFOLessonPlan.create({
        data: {
          userId,
          unitPlanId: null,
          title: 'Orphaned Lesson',
          date: new Date(),
          status: 'draft',
          learningGoals: 'Test',
          successCriteria: 'Test',
          openingActivities: 'Test',
          middleActivities: 'Test',
          closingActivities: 'Test',
          assessmentStrategies: 'Test',
        },
      });

      await prisma.recentPlanAccess.create({
        data: {
          userId,
          planType: 'lesson',
          planId: orphanedLesson.id,
          lastAccessed: new Date(),
          accessCount: 1,
        },
      });

      const response = await request(app)
        .get('/api/recent-plans')
        .set('Authorization', `Bearer ${authToken}`);

      const orphanedEntry = response.body.find((p: unknown) => p.id === orphanedLesson.id);
      expect(orphanedEntry).toBeTruthy();
      expect(orphanedEntry.parentTitle).toBeUndefined();
    });

    test('should calculate progress correctly', async () => {
      // Add more unit plans to long range plan
      await prisma.unitPlan.createMany({
        data: Array.from({ length: 9 }, (_, i) => ({
          userId,
          longRangePlanId: longRangePlan.id,
          title: `Unit ${i + 2}`,
          description: 'Test unit',
          duration: 4,
          unitNumber: i + 2,
          startDate: new Date(),
          endDate: new Date(),
        })),
      });

      // Add more lesson plans to unit plan
      await prisma.eTFOLessonPlan.createMany({
        data: Array.from({ length: 19 }, (_, i) => ({
          userId,
          unitPlanId: unitPlan.id,
          title: `Lesson ${i + 2}`,
          date: new Date(),
          status: 'draft',
          learningGoals: 'Test',
          successCriteria: 'Test',
          openingActivities: 'Test',
          middleActivities: 'Test',
          closingActivities: 'Test',
          assessmentStrategies: 'Test',
        })),
      });

      await prisma.recentPlanAccess.createMany({
        data: [
          {
            userId,
            planType: 'long-range',
            planId: longRangePlan.id,
            lastAccessed: new Date(),
            accessCount: 1,
          },
          {
            userId,
            planType: 'unit',
            planId: unitPlan.id,
            lastAccessed: new Date(),
            accessCount: 1,
          },
        ],
      });

      const response = await request(app)
        .get('/api/recent-plans')
        .set('Authorization', `Bearer ${authToken}`);

      const longRangeEntry = response.body.find((p: unknown) => p.type === 'long-range');
      const unitEntry = response.body.find((p: unknown) => p.type === 'unit');

      // Progress should be capped at 100
      expect(longRangeEntry.progress).toBe(100); // 10 units * 10 = 100
      expect(unitEntry.progress).toBe(100); // 20 lessons * 5 = 100
    });
  });
});