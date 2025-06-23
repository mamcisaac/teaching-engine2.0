import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/index.js';
import { authRequest } from './test-auth-helper.js';
import { getTestPrismaClient } from './jest.setup.js';
import bcrypt from 'bcryptjs';

const auth = authRequest(app);
let prisma: ReturnType<typeof getTestPrismaClient>;

describe('Audit API', () => {
  beforeEach(async () => {
    prisma = getTestPrismaClient();

    // Create test user before each test
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'teacher',
      },
    });

    // Setup auth after creating user
    await auth.setup();
  });

  describe('GET /api/audit/curriculum-coverage', () => {
    it('should return empty coverage data when no outcomes exist', async () => {
      const response = await auth.get('/api/audit/curriculum-coverage');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return outcome coverage data', async () => {
      // Get the test user
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      // Create test data
      const subject = await prisma.subject.create({
        data: {
          name: 'French',
          userId: user!.id,
        },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Test Milestone',
          subjectId: subject.id,
          userId: user!.id,
        },
      });

      // Create outcomes
      const outcome1 = await prisma.outcome.create({
        data: {
          code: 'FRA-1-001',
          description: 'Test French outcome',
          subject: 'FRA',
          grade: 1,
          domain: 'Oral Language',
        },
      });

      const outcome2 = await prisma.outcome.create({
        data: {
          code: 'MAT-1-001',
          description: 'Test Math outcome',
          subject: 'MAT',
          grade: 1,
          domain: 'Number Sense',
        },
      });

      // Create activity linked to outcome1
      const activity = await prisma.activity.create({
        data: {
          title: 'Test Activity',
          milestoneId: milestone.id,
          userId: user!.id,
          completedAt: new Date('2024-01-15'),
        },
      });

      // Link activity to outcome
      await prisma.activityOutcome.create({
        data: {
          activityId: activity.id,
          outcomeId: outcome1.id,
        },
      });

      const response = await auth.get('/api/audit/curriculum-coverage');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);

      const frenchOutcome = response.body.find(
        (o: { outcomeCode: string }) => o.outcomeCode === 'FRA-1-001',
      );
      expect(frenchOutcome).toMatchObject({
        outcomeId: outcome1.id,
        outcomeCode: 'FRA-1-001',
        outcomeDescription: 'Test French outcome',
        domain: 'Oral Language',
        coveredCount: 1,
        assessed: false,
      });

      const mathOutcome = response.body.find(
        (o: { outcomeCode: string }) => o.outcomeCode === 'MAT-1-001',
      );
      expect(mathOutcome).toMatchObject({
        outcomeId: outcome2.id,
        outcomeCode: 'MAT-1-001',
        outcomeDescription: 'Test Math outcome',
        domain: 'Number Sense',
        coveredCount: 0,
        assessed: false,
        lastUsed: null,
      });
    });

    it('should filter by subject', async () => {
      // Create outcomes for different subjects
      await prisma.outcome.create({
        data: {
          code: 'FRA-1-001',
          description: 'French outcome',
          subject: 'FRA',
          grade: 1,
        },
      });

      await prisma.outcome.create({
        data: {
          code: 'MAT-1-001',
          description: 'Math outcome',
          subject: 'MAT',
          grade: 1,
        },
      });

      const response = await auth.get('/api/audit/curriculum-coverage?subject=FRA');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].outcomeCode).toBe('FRA-1-001');
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/audit/curriculum-coverage');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/audit/curriculum-coverage/summary', () => {
    it('should return coverage summary statistics', async () => {
      // Get the test user
      const user = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      // Create test data
      const subject = await prisma.subject.create({
        data: {
          name: 'French',
          userId: user!.id,
        },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Test Milestone',
          subjectId: subject.id,
          userId: user!.id,
        },
      });

      // Create 3 outcomes
      const outcome1 = await prisma.outcome.create({
        data: {
          code: 'FRA-1-001',
          description: 'Covered and assessed',
          subject: 'FRA',
          grade: 1,
        },
      });

      const outcome2 = await prisma.outcome.create({
        data: {
          code: 'FRA-1-002',
          description: 'Covered but not assessed',
          subject: 'FRA',
          grade: 1,
        },
      });

      await prisma.outcome.create({
        data: {
          code: 'FRA-1-003',
          description: 'Not covered',
          subject: 'FRA',
          grade: 1,
        },
      });

      // Create activities
      const activity1 = await prisma.activity.create({
        data: {
          title: 'Assessment Activity',
          milestoneId: milestone.id,
          userId: user!.id,
          activityType: 'ASSESSMENT',
          completedAt: new Date(),
        },
      });

      const activity2 = await prisma.activity.create({
        data: {
          title: 'Lesson Activity',
          milestoneId: milestone.id,
          userId: user!.id,
          activityType: 'LESSON',
          completedAt: new Date(),
        },
      });

      // Link activities to outcomes
      await prisma.activityOutcome.create({
        data: { activityId: activity1.id, outcomeId: outcome1.id },
      });

      await prisma.activityOutcome.create({
        data: { activityId: activity2.id, outcomeId: outcome2.id },
      });

      const response = await auth.get('/api/audit/curriculum-coverage/summary');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        total: 3,
        covered: 2,
        assessed: 1,
        uncovered: 1,
        coveragePercentage: 67,
        assessmentPercentage: 33,
      });
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/audit/curriculum-coverage/summary');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/audit/curriculum-coverage/export', () => {
    beforeEach(async () => {
      // Create basic test data
      await prisma.outcome.create({
        data: {
          code: 'FRA-1-001',
          description: 'Test French outcome',
          subject: 'FRA',
          grade: 1,
          domain: 'Oral Language',
        },
      });
    });

    it('should export as JSON by default', async () => {
      const response = await auth.get('/api/audit/curriculum-coverage/export');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toHaveProperty('coverage');
      expect(response.body).toHaveProperty('summary');
      expect(response.body.coverage).toHaveLength(1);
    });

    it('should export as CSV', async () => {
      const response = await auth.get('/api/audit/curriculum-coverage/export?format=csv');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/csv/);
      expect(response.headers['content-disposition']).toMatch(
        /attachment; filename="curriculum-audit.csv"/,
      );
      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('Outcome Code,Description,Domain');
      expect(response.text).toContain('FRA-1-001');
    });

    it('should export as Markdown', async () => {
      const response = await auth.get('/api/audit/curriculum-coverage/export?format=markdown');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/markdown/);
      expect(response.headers['content-disposition']).toMatch(
        /attachment; filename="curriculum-audit.md"/,
      );
      expect(typeof response.text).toBe('string');
      expect(response.text).toContain('# Curriculum Coverage Audit Report');
      expect(response.text).toContain('FRA-1-001');
    });

    it('should return error for invalid format', async () => {
      const response = await auth.get('/api/audit/curriculum-coverage/export?format=invalid');
      expect(response.status).toBe(400);
    });

    it('should require authentication', async () => {
      const response = await request(app).get('/api/audit/curriculum-coverage/export');
      expect(response.status).toBe(401);
    });
  });
});
