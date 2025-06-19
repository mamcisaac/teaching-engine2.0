import request from 'supertest';
import type { Request, Response, NextFunction } from 'express';
import { app } from '../index';
import { prisma } from '../prisma';

interface AuthRequest extends Request {
  user?: { userId: string };
}

// Mock authentication
jest.mock('../middleware/auth', () => ({
  authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => {
    req.user = { userId: '1' };
    next();
  },
}));

describe('Timeline API', () => {
  const testUserId = 1;
  const authToken = 'test-token';

  beforeEach(async () => {
    // Clean up test data
    await prisma.activity.deleteMany();
    await prisma.assessmentResult.deleteMany();
    await prisma.assessmentTemplate.deleteMany();
    await prisma.thematicUnit.deleteMany();
    await prisma.parentMessage.deleteMany();
    await prisma.milestone.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.outcome.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    await prisma.user.create({
      data: {
        id: testUserId,
        email: 'test@example.com',
        password: 'hashed-password',
        name: 'Test User',
      },
    });

    // Create test outcomes
    await prisma.outcome.createMany({
      data: [
        {
          id: 'outcome-1',
          code: 'CO.1',
          description: 'Test outcome 1',
          subject: 'French',
          grade: 1,
        },
        {
          id: 'outcome-2',
          code: 'CO.2',
          description: 'Test outcome 2',
          subject: 'French',
          grade: 1,
        },
      ],
    });

    // Create test subject and milestone
    const subject = await prisma.subject.create({
      data: {
        id: 1,
        name: 'French',
        userId: testUserId,
      },
    });

    const milestone = await prisma.milestone.create({
      data: {
        id: 1,
        title: 'Test Milestone',
        subjectId: subject.id,
        userId: testUserId,
      },
    });

    // Create test activities
    await prisma.activity.create({
      data: {
        id: 1,
        title: 'Test Activity 1',
        milestoneId: milestone.id,
        userId: testUserId,
        completedAt: new Date('2024-01-15'),
        activityType: 'LESSON',
        outcomes: {
          create: {
            outcomeId: 'outcome-1',
          },
        },
      },
    });

    await prisma.activity.create({
      data: {
        id: 2,
        title: 'Test Assessment Activity',
        milestoneId: milestone.id,
        userId: testUserId,
        completedAt: new Date('2024-01-20'),
        activityType: 'ASSESSMENT',
        outcomes: {
          create: {
            outcomeId: 'outcome-2',
          },
        },
      },
    });

    // Create test assessment
    const assessmentTemplate = await prisma.assessmentTemplate.create({
      data: {
        id: 1,
        title: 'Oral Assessment',
        type: 'oral',
        userId: testUserId,
        outcomeIds: JSON.stringify(['outcome-1', 'outcome-2']),
      },
    });

    await prisma.assessmentResult.create({
      data: {
        id: 1,
        templateId: assessmentTemplate.id,
        date: new Date('2024-01-25'),
        groupScore: 85,
        notes: 'Good progress',
      },
    });

    // Create test thematic unit
    await prisma.thematicUnit.create({
      data: {
        id: 1,
        title: 'Space Exploration',
        userId: testUserId,
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-02-10'),
        outcomes: {
          create: {
            outcomeId: 'outcome-1',
          },
        },
      },
    });

    // Create test parent message
    await prisma.parentMessage.create({
      data: {
        id: 1,
        title: 'January Newsletter',
        userId: testUserId,
        timeframe: 'January 2024',
        contentEn: 'Test content',
        contentFr: 'Contenu test',
        linkedOutcomes: {
          create: {
            outcomeId: 'outcome-2',
          },
        },
      },
    });
  });

  describe('GET /api/timeline/events', () => {
    it('should return timeline events for the user', async () => {
      const response = await request(app)
        .get('/api/timeline/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          from: '2024-01-01',
          to: '2024-02-01',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(5); // 2 activities + 1 assessment + 1 theme + 1 newsletter

      // Check event structure
      const event = response.body[0];
      expect(event).toHaveProperty('id');
      expect(event).toHaveProperty('date');
      expect(event).toHaveProperty('type');
      expect(event).toHaveProperty('label');
      expect(event).toHaveProperty('linkedOutcomeIds');

      // Verify event types
      const eventTypes = response.body.map((e: { type: string }) => e.type);
      expect(eventTypes).toContain('activity');
      expect(eventTypes).toContain('assessment');
      expect(eventTypes).toContain('theme');
      expect(eventTypes).toContain('newsletter');
    });

    it('should filter events by subject', async () => {
      const response = await request(app)
        .get('/api/timeline/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          from: '2024-01-01',
          to: '2024-02-01',
          subjectId: '1',
        });

      expect(response.status).toBe(200);
      // Should include activities from the subject but not assessments, themes, or newsletters
      const activityEvents = response.body.filter(
        (e: { type: string }) => e.type === 'activity' || e.type === 'assessment',
      );
      expect(activityEvents.length).toBeGreaterThan(0);
    });

    it('should filter events by outcome', async () => {
      const response = await request(app)
        .get('/api/timeline/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          from: '2024-01-01',
          to: '2024-02-01',
          outcomeId: 'outcome-1',
        });

      expect(response.status).toBe(200);
      const eventsWithOutcome1 = response.body.filter((e: { linkedOutcomeIds: string[] }) =>
        e.linkedOutcomeIds.includes('outcome-1'),
      );
      expect(eventsWithOutcome1.length).toBeGreaterThan(0);
    });

    it('should return events sorted by date', async () => {
      const response = await request(app)
        .get('/api/timeline/events')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          from: '2024-01-01',
          to: '2024-02-01',
        });

      expect(response.status).toBe(200);

      // Check that events are sorted
      for (let i = 1; i < response.body.length; i++) {
        const prevDate = new Date(response.body[i - 1].date);
        const currDate = new Date(response.body[i].date);
        expect(currDate.getTime()).toBeGreaterThanOrEqual(prevDate.getTime());
      }
    });
  });

  describe('GET /api/timeline/summary', () => {
    it('should return timeline summary with outcome coverage', async () => {
      const response = await request(app)
        .get('/api/timeline/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          from: '2024-01-01',
          to: '2024-02-01',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalOutcomes');
      expect(response.body).toHaveProperty('coveredOutcomes');
      expect(response.body).toHaveProperty('coveragePercentage');
      expect(response.body).toHaveProperty('nextMilestone');

      expect(response.body.totalOutcomes).toBe(2);
      expect(response.body.coveredOutcomes).toBe(2); // Both outcomes are covered
      expect(response.body.coveragePercentage).toBe(100);
    });

    it('should return next milestone with uncompleted activities', async () => {
      // Add an uncompleted activity
      await prisma.activity.create({
        data: {
          id: 3,
          title: 'Future Activity',
          milestoneId: 1,
          userId: testUserId,
          completedAt: null,
        },
      });

      const response = await request(app)
        .get('/api/timeline/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.nextMilestone).toBeTruthy();
      expect(response.body.nextMilestone.title).toBe('Test Milestone');
    });
  });

  describe('Authentication', () => {
    it('should require authentication for timeline events', async () => {
      const response = await request(app).get('/api/timeline/events');

      expect(response.status).toBe(401);
    });

    it('should require authentication for timeline summary', async () => {
      const response = await request(app).get('/api/timeline/summary');

      expect(response.status).toBe(401);
    });
  });
});
