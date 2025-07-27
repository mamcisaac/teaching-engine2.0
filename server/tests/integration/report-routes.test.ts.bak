/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import request from 'supertest';
import { describe, beforeAll, beforeEach, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import bcrypt from 'bcryptjs';

describe('Report Routes', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  let authToken: string;
  let testUserId: number;
  let testExpectationId: number;
  let testLessonPlanId: string;

  beforeAll(async () => {
    prisma = getTestPrismaClient();
  });

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: hashedPassword,
        name: 'Test Teacher',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
    testUserId = testUser.id;

    // Create test curriculum expectations
    const expectation1 = await prisma.curriculumExpectation.create({
      data: {
        code: 'MATH-G3-NS-1',
        description: 'Count to 1000 by 1s, 5s, 10s, and 100s',
        subject: 'Mathematics',
        grade: 3,
        strand: 'Number Sense',
        substrand: 'Counting',
        province: 'ON',
      },
    });
    testExpectationId = expectation1.id;

    const expectation2 = await prisma.curriculumExpectation.create({
      data: {
        code: 'MATH-G3-NS-2',
        description: 'Read and write numbers to 1000',
        subject: 'Mathematics',
        grade: 3,
        strand: 'Number Sense',
        substrand: 'Number Representation',
        province: 'ON',
      },
    });

    await prisma.curriculumExpectation.create({
      data: {
        code: 'MATH-G3-ME-1',
        description: 'Estimate and measure length using standard units',
        subject: 'Mathematics',
        grade: 3,
        strand: 'Measurement',
        substrand: 'Length',
        province: 'ON',
      },
    });

    // Create test lesson plan with expectations
    const lessonPlan = await prisma.eTFOLessonPlan.create({
      data: {
        userId: testUserId,
        title: 'Number Sense Introduction',
        titleFr: 'Introduction au sens des nombres',
        date: new Date(),
        subject: 'Mathematics',
        grade: '3',
        duration: 60,
        status: 'completed',
        mindsOn: 'Review counting patterns',
        action: 'Practice counting and writing numbers',
        consolidation: 'Number game activity',
      },
    });
    testLessonPlanId = lessonPlan.id;

    // Link expectations to lesson plan
    await prisma.eTFOLessonPlanExpectation.create({
      data: {
        lessonPlanId: testLessonPlanId,
        expectationId: expectation1.id,
      },
    });

    await prisma.eTFOLessonPlanExpectation.create({
      data: {
        lessonPlanId: testLessonPlanId,
        expectationId: expectation2.id,
      },
    });

    // Login to get auth token
    const loginRes = await request(app).post('/api/login').send({
      email: testUser.email,
      password: 'test123',
    });
    authToken = loginRes.body.accessToken;
  });

  describe('GET /api/curriculum-expectations/coverage/report', () => {
    it('should get coverage report with all expectations', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage/report')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('covered');
      expect(res.body).toHaveProperty('percentage');
      expect(res.body).toHaveProperty('byStrand');
      expect(res.body).toHaveProperty('uncovered');
      expect(res.body).toHaveProperty('details');
      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.covered).toBeGreaterThan(0);
    });

    it('should filter by subject', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage/report?subject=Mathematics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3); // 3 math expectations created
      expect(res.body.covered).toBe(2); // 2 covered in lesson plan
      expect(res.body.percentage).toBe(67); // 2/3 = 66.67% rounded
    });

    it('should filter by grade', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage/report?grade=3')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      expect(res.body.covered).toBe(2);
    });

    it('should filter by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const res = await request(app)
        .get(`/api/curriculum-expectations/coverage/report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.covered).toBe(2); // Should include today's lesson
    });

    it('should calculate coverage by strand', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage/report?subject=Mathematics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.byStrand).toHaveProperty('Number Sense');
      expect(res.body.byStrand).toHaveProperty('Measurement');
      expect(res.body.byStrand['Number Sense']).toEqual({
        total: 2,
        covered: 2,
      });
      expect(res.body.byStrand['Measurement']).toEqual({
        total: 1,
        covered: 0,
      });
    });

    it('should list uncovered expectations', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage/report?subject=Mathematics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.uncovered)).toBe(true);
      expect(res.body.uncovered.length).toBe(1);
      expect(res.body.uncovered[0]).toHaveProperty('code', 'MATH-G3-ME-1');
    });

    it('should include coverage details', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage/report')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.details)).toBe(true);
      expect(res.body.details.length).toBeGreaterThan(0);
      expect(res.body.details[0]).toHaveProperty('expectationId');
      expect(res.body.details[0]).toHaveProperty('expectation');
      expect(res.body.details[0]).toHaveProperty('lessonPlan');
      expect(res.body.details[0].lessonPlan).toHaveProperty('title');
      expect(res.body.details[0].lessonPlan).toHaveProperty('date');
    });

    it('should handle empty results', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage/report?subject=Science')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.covered).toBe(0);
      expect(res.body.percentage).toBe(0);
      expect(res.body.uncovered).toEqual([]);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage/report');

      expect(res.status).toBe(401);
    });
  });

  describe('Progress Reports (via ETFO routes)', () => {
    beforeEach(async () => {
      // Create additional test data for progress reports
      await prisma.eTFOLessonPlan.create({
        data: {
          userId: testUserId,
          title: 'Science Investigation',
          titleFr: 'Investigation scientifique',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          subject: 'Science',
          grade: '3',
          duration: 45,
          status: 'completed',
          mindsOn: 'Science discussion',
          action: 'Hands-on experiment',
          consolidation: 'Lab report',
        },
      });

      await prisma.eTFOLessonPlan.create({
        data: {
          userId: testUserId,
          title: 'Language Arts Reading',
          titleFr: 'Lecture en français',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days future
          subject: 'Language Arts',
          grade: '3',
          duration: 50,
          status: 'draft',
          mindsOn: 'Reading warm-up',
          action: 'Guided reading',
          consolidation: 'Reading response',
        },
      });
    });

    it('should get ETFO planning progress', async () => {
      const res = await request(app)
        .get('/api/etfo/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalLessons');
      expect(res.body).toHaveProperty('completedLessons');
      expect(res.body).toHaveProperty('draftLessons');
      expect(res.body).toHaveProperty('upcomingLessons');
      expect(res.body).toHaveProperty('bySubject');
      expect(res.body).toHaveProperty('byGrade');
      expect(res.body).toHaveProperty('weeklyAverage');
      expect(res.body).toHaveProperty('lastUpdated');
    });

    it('should calculate progress by subject', async () => {
      const res = await request(app)
        .get('/api/etfo/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.bySubject).toHaveProperty('Mathematics');
      expect(res.body.bySubject).toHaveProperty('Science');
      expect(res.body.bySubject).toHaveProperty('Language Arts');
      expect(res.body.bySubject.Mathematics.total).toBe(1);
      expect(res.body.bySubject.Mathematics.completed).toBe(1);
      expect(res.body.bySubject['Language Arts'].draft).toBe(1);
    });

    it('should filter progress by date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const res = await request(app)
        .get(`/api/etfo/progress?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalLessons).toBe(2); // Should not include future lesson
    });
  });

  describe('Analytics and Summary Reports', () => {
    it('should get coverage summary', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('summary');
      expect(res.body.summary).toHaveProperty('totalExpectations');
      expect(res.body.summary).toHaveProperty('coveredExpectations');
      expect(res.body.summary).toHaveProperty('coveragePercentage');
    });

    it('should get planning analytics', async () => {
      const res = await request(app)
        .get('/api/etfo/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('lessonStats');
      expect(res.body).toHaveProperty('timeDistribution');
      expect(res.body).toHaveProperty('subjectBalance');
    });
  });

  describe('Export Reports', () => {
    it('should export coverage report as CSV', async () => {
      const res = await request(app)
        .get('/api/curriculum-expectations/coverage/export?format=csv')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
    });

    it('should export progress report as PDF', async () => {
      const res = await request(app)
        .get('/api/etfo/progress/export?format=pdf')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain('attachment');
    });
  });
});