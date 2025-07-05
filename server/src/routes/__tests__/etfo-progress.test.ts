/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { prisma } from '@teaching-engine/database';
import { createTestApp, createTestUser, cleanupTestData, TestUser } from '../../test-utils/test-helpers';
import { CurriculumExpectation, LongRangePlan, UnitPlan, ETFOLessonPlan, DaybookEntry } from '@prisma/client';

describe('ETFO Progress Routes', () => {
  let app: Express;
  let testUser: TestUser;
  let authToken: string;
  let testExpectation: CurriculumExpectation;
  let testLongRangePlan: LongRangePlan;
  let testUnitPlan: UnitPlan;
  let testLessonPlan: ETFOLessonPlan;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanupTestData();

    // Create test user
    testUser = await createTestUser({
      email: 'etfo-progress-test@example.com',
      password: 'TestPassword123!',
    });

    // Get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'TestPassword123!',
      });

    authToken = loginResponse.body.token;

    // Create test data hierarchy
    testExpectation = await prisma.curriculumExpectation.create({
      data: {
        code: 'A1.1',
        description: 'Test expectation for progress tracking',
        strand: 'Number Sense',
        grade: 5,
        subject: 'Mathematics',
      },
    });

    testLongRangePlan = await prisma.longRangePlan.create({
      data: {
        userId: testUser.id,
        title: 'Grade 5 Math - Full Year',
        academicYear: '2024-2025',
        term: 'Full Year',
        grade: 5,
        subject: 'Mathematics',
        description: 'Comprehensive math curriculum for grade 5',
        expectations: {
          create: {
            expectationId: testExpectation.id,
            plannedTerm: 'Term 1',
          },
        },
      },
    });

    testUnitPlan = await prisma.unitPlan.create({
      data: {
        userId: testUser.id,
        title: 'Number Patterns and Algebra',
        longRangePlanId: testLongRangePlan.id,
        description: 'Exploring patterns and early algebra concepts',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-10-15'),
        bigIdeas: 'Patterns help us make predictions',
        expectations: {
          create: {
            expectationId: testExpectation.id,
          },
        },
      },
    });

    testLessonPlan = await prisma.eTFOLessonPlan.create({
      data: {
        userId: testUser.id,
        title: 'Introduction to Number Patterns',
        unitPlanId: testUnitPlan.id,
        grade: 5,
        subject: 'Mathematics',
        date: new Date('2024-09-05'),
        duration: 60,
        learningGoals: 'Students will identify and extend number patterns',
        mindsOn: 'Pattern puzzle warm-up',
        action: 'Explore growing patterns with manipulatives',
        consolidation: 'Create your own pattern',
        expectations: {
          create: {
            expectationId: testExpectation.id,
          },
        },
      },
    });
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/etfo/overview', () => {
    it('should return comprehensive ETFO planning overview', async () => {
      const response = await request(app)
        .get('/api/etfo/overview')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data).toHaveProperty('longRangePlans');
      expect(response.body.data).toHaveProperty('recentActivity');
      expect(response.body.data).toHaveProperty('upcomingPlans');

      // Verify summary counts
      expect(response.body.data.summary).toMatchObject({
        totalLongRangePlans: 1,
        totalUnitPlans: 1,
        totalLessonPlans: 1,
        totalDaybookEntries: 0,
      });

      // Verify long-range plan is included
      expect(response.body.data.longRangePlans).toHaveLength(1);
      expect(response.body.data.longRangePlans[0]).toMatchObject({
        id: testLongRangePlan.id,
        title: testLongRangePlan.title,
        academicYear: testLongRangePlan.academicYear,
      });
    });

    it('should return empty overview for user with no plans', async () => {
      // Create new user with no data
      const newUser = await createTestUser({
        email: 'empty-progress@example.com',
        password: 'TestPassword123!',
      });

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: newUser.email,
          password: 'TestPassword123!',
        });

      const response = await request(app)
        .get('/api/etfo/overview')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);

      expect(response.body.data.summary).toMatchObject({
        totalLongRangePlans: 0,
        totalUnitPlans: 0,
        totalLessonPlans: 0,
        totalDaybookEntries: 0,
      });
    });
  });

  describe('GET /api/etfo/curriculum-coverage', () => {
    it('should return curriculum coverage statistics', async () => {
      // Create additional expectations and coverage
      const expectation2 = await prisma.curriculumExpectation.create({
        data: {
          code: 'A1.2',
          description: 'Another test expectation',
          strand: 'Number Sense',
          grade: 5,
          subject: 'Mathematics',
        },
      });

      // Add expectation to unit plan
      await prisma.unitPlanExpectation.create({
        data: {
          unitPlanId: testUnitPlan.id,
          expectationId: expectation2.id,
        },
      });

      const response = await request(app)
        .get('/api/etfo/curriculum-coverage')
        .query({ grade: 5, subject: 'Mathematics' })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('totalExpectations', 2);
      expect(response.body.data).toHaveProperty('coveredExpectations', 2);
      expect(response.body.data).toHaveProperty('coveragePercentage', 100);
      expect(response.body.data).toHaveProperty('byStrand');
      expect(response.body.data).toHaveProperty('uncoveredExpectations');

      // Verify strand coverage
      expect(response.body.data.byStrand).toHaveLength(1);
      expect(response.body.data.byStrand[0]).toMatchObject({
        strand: 'Number Sense',
        total: 2,
        covered: 2,
        percentage: 100,
      });
    });

    it('should filter coverage by date range', async () => {
      const response = await request(app)
        .get('/api/etfo/curriculum-coverage')
        .query({
          grade: 5,
          subject: 'Mathematics',
          startDate: '2024-08-01',
          endDate: '2024-11-01',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.coveredExpectations).toBeGreaterThan(0);
    });
  });

  describe('GET /api/etfo/planning-timeline', () => {
    it('should return planning timeline with all levels', async () => {
      // Add a daybook entry
      const daybookEntry = await prisma.daybookEntry.create({
        data: {
          userId: testUser.id,
          date: new Date('2024-09-05'),
          lessonPlanId: testLessonPlan.id,
          whatWorked: 'Students engaged well with manipulatives',
          whatDidntWork: 'Need more time for consolidation',
          nextSteps: 'Review patterns in next lesson',
          overallRating: 4,
          wouldReuseLesson: true,
        },
      });

      const response = await request(app)
        .get('/api/etfo/planning-timeline')
        .query({
          startDate: '2024-09-01',
          endDate: '2024-10-31',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('timeline');
      expect(Array.isArray(response.body.data.timeline)).toBe(true);

      // Verify timeline contains all planning levels
      const timelineTypes = response.body.data.timeline.map((item: unknown) => item.type);
      expect(timelineTypes).toContain('unit_start');
      expect(timelineTypes).toContain('lesson');
      expect(timelineTypes).toContain('daybook');
    });
  });

  describe('GET /api/etfo/teaching-effectiveness', () => {
    it('should return teaching effectiveness metrics', async () => {
      // Create multiple daybook entries with ratings
      await prisma.daybookEntry.createMany({
        data: [
          {
            userId: testUser.id,
            date: new Date('2024-09-06'),
            whatWorked: 'Good engagement',
            overallRating: 4,
            wouldReuseLesson: true,
          },
          {
            userId: testUser.id,
            date: new Date('2024-09-07'),
            whatWorked: 'Excellent results',
            overallRating: 5,
            wouldReuseLesson: true,
          },
          {
            userId: testUser.id,
            date: new Date('2024-09-08'),
            whatWorked: 'Needs improvement',
            overallRating: 3,
            wouldReuseLesson: false,
          },
        ],
      });

      const response = await request(app)
        .get('/api/etfo/teaching-effectiveness')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('averageRating');
      expect(response.body.data).toHaveProperty('totalLessons', 3);
      expect(response.body.data).toHaveProperty('reusePercentage');
      expect(response.body.data).toHaveProperty('ratingDistribution');
      expect(response.body.data).toHaveProperty('trends');

      // Verify calculations
      expect(response.body.data.averageRating).toBeCloseTo(4.0, 1);
      expect(response.body.data.reusePercentage).toBeCloseTo(66.67, 1);
    });
  });

  describe('GET /api/etfo/upcoming-planning', () => {
    it('should return upcoming planning needs', async () => {
      // Create unit plans with gaps
      const futureUnit = await prisma.unitPlan.create({
        data: {
          userId: testUser.id,
          title: 'Upcoming Unit',
          longRangePlanId: testLongRangePlan.id,
          startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
          endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
          // No lesson plans created yet
        },
      });

      const response = await request(app)
        .get('/api/etfo/upcoming-planning')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('unitsNeedingPlans');
      expect(response.body.data).toHaveProperty('lessonsNeedingDaybook');
      expect(response.body.data).toHaveProperty('upcomingDeadlines');

      // Verify upcoming unit needs plans
      expect(response.body.data.unitsNeedingPlans).toContainEqual(
        expect.objectContaining({
          id: futureUnit.id,
          title: futureUnit.title,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should require authentication', async () => {
      await request(app)
        .get('/api/etfo/overview')
        .expect(401);
    });

    it('should validate query parameters', async () => {
      await request(app)
        .get('/api/etfo/curriculum-coverage')
        .query({ grade: 'invalid' }) // Invalid grade
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should handle invalid date ranges', async () => {
      await request(app)
        .get('/api/etfo/planning-timeline')
        .query({
          startDate: '2024-10-01',
          endDate: '2024-09-01', // End before start
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});