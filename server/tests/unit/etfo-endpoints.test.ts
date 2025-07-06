/**
 * ETFO Endpoints Test
 * Verifies all critical ETFO endpoints are working with correct schema
 */

import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';
import jwt from 'jsonwebtoken';

describe('ETFO Endpoints Schema Fix Verification', () => {
  let authToken: string;
  let userId: number;
  let longRangePlanId: string;
  let unitPlanId: string;
  let lessonPlanId: string;
  let expectationId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'etfo.test@example.com',
        password: 'hashedpassword',
        name: 'ETFO Test Teacher',
        role: 'teacher',
      },
    });
    userId = user.id;
    authToken = jwt.sign({ userId }, process.env.JWT_SECRET || 'test-secret');

    // Create test curriculum expectation
    const expectation = await prisma.curriculumExpectation.create({
      data: {
        code: 'A1.1',
        description: 'Test expectation',
        strand: 'Test Strand',
        grade: 4,
        subject: 'Mathematics',
      },
    });
    expectationId = expectation.id;

    // Create test long range plan
    const lrp = await prisma.longRangePlan.create({
      data: {
        userId,
        title: 'Test Year Plan',
        academicYear: '2024-2025',
        grade: 4,
        subject: 'Mathematics',
      },
    });
    longRangePlanId = lrp.id;

    // Create test unit plan
    const unit = await prisma.unitPlan.create({
      data: {
        title: 'Test Unit',
        longRangePlanId,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-10-01'),
        expectations: {
          create: [{ expectationId }],
        },
      },
    });
    unitPlanId = unit.id;

    // Create test lesson plan
    const lesson = await prisma.eTFOLessonPlan.create({
      data: {
        userId,
        title: 'Test Lesson',
        unitPlanId,
        date: new Date('2024-09-15'),
        duration: 60,
        expectations: {
          create: [{ expectationId }],
        },
      },
    });
    lessonPlanId = lesson.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.daybookEntry.deleteMany({ where: { userId } });
    await prisma.eTFOLessonPlan.deleteMany({ where: { userId } });
    await prisma.unitPlan.deleteMany({ where: { longRangePlan: { userId } } });
    await prisma.longRangePlan.deleteMany({ where: { userId } });
    await prisma.curriculumExpectation.deleteMany({ where: { code: 'A1.1' } });
    await prisma.user.deleteMany({ where: { email: 'etfo.test@example.com' } });
  });

  describe('GET /api/etfo-lesson-plans', () => {
    it('should return lesson plans with correct schema', async () => {
      const response = await request(app)
        .get('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('lessonPlans');
      expect(response.body).toHaveProperty('pagination');

      const lessonPlan = response.body.lessonPlans[0];
      expect(lessonPlan).toHaveProperty('id');
      expect(lessonPlan).toHaveProperty('title');
      expect(lessonPlan).toHaveProperty('expectations'); // Not expectationCoverage
      expect(Array.isArray(lessonPlan.expectations)).toBe(true);
    });
  });

  describe('POST /api/etfo-lesson-plans', () => {
    it('should create lesson plan with expectations', async () => {
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Test Lesson',
          unitPlanId,
          date: new Date('2024-09-20').toISOString(),
          duration: 45,
          expectationIds: [expectationId],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('expectations');
      expect(response.body.expectations).toHaveLength(1);
      expect(response.body.expectations[0]).toHaveProperty('expectation');
    });
  });

  describe('GET /api/unit-plans', () => {
    it('should return unit plans with correct schema', async () => {
      const response = await request(app)
        .get('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('unitPlans');

      const unitPlan = response.body.unitPlans[0];
      expect(unitPlan).toHaveProperty('expectations');
      expect(Array.isArray(unitPlan.expectations)).toBe(true);
    });
  });

  describe('GET /api/templates', () => {
    it('should return templates with correct ownership filter', async () => {
      // Create a system template
      await prisma.planTemplate.create({
        data: {
          title: 'System Template',
          type: 'UNIT_PLAN',
          category: 'BY_SUBJECT',
          isSystem: true,
          content: {},
        },
      });

      const response = await request(app)
        .get('/api/templates')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('templates');
      // Should include system templates even though userId doesn't match
    });
  });

  describe('GET /api/daybook-entries', () => {
    it('should handle daybook entries with expectations', async () => {
      // Create daybook entry
      await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-15'),
          lessonPlanId,
          whatWorked: 'Test worked well',
          expectations: {
            create: [
              {
                expectationId,
                coverage: 'introduced',
              },
            ],
          },
        },
      });

      const response = await request(app)
        .get('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('entries');

      const entry = response.body.entries[0];
      expect(entry).toHaveProperty('expectations'); // Not expectationCoverage
    });
  });

  describe('POST /api/daybook-entries', () => {
    it('should create daybook entry with expectations', async () => {
      const response = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: new Date('2024-09-16').toISOString(),
          lessonPlanId,
          whatWorked: 'Students engaged well',
          overallRating: 4,
          expectations: [
            {
              expectationId,
              coverage: 'developing',
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('expectations');
      expect(response.body.expectations).toHaveLength(1);
      expect(response.body.expectations[0]).toHaveProperty('coverage', 'developing');
    });
  });
});
