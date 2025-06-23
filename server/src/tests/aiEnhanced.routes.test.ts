import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('AI Enhanced Routes', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        id: 100,
        email: 'aitest@example.com',
        password: 'hashedpassword',
        name: 'AI Test User'
      }
    });
    userId = user.id;

    // Create auth token
    authToken = jwt.sign({ userId: userId.toString() }, JWT_SECRET);

    // Create test data
    await prisma.subject.create({
      data: {
        id: 100,
        name: 'Test Subject',
        userId
      }
    });

    await prisma.outcome.create({
      data: {
        id: 'test-outcome-1',
        code: 'T1.1',
        description: 'Test outcome',
        grade: 1,
        subject: 'Test Subject'
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.aISuggestedActivity.deleteMany({ where: { userId } });
    await prisma.aIGeneratedPlan.deleteMany({ where: { userId } });
    await prisma.planningConversation.deleteMany({ where: { userId } });
    await prisma.activitySeries.deleteMany({ where: { userId } });
    await prisma.outcome.deleteMany({ where: { id: 'test-outcome-1' } });
    await prisma.subject.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  });

  beforeEach(() => {
    // Clear any existing data between tests
  });

  describe('POST /api/ai/activities/generate', () => {
    it('should generate activities successfully', async () => {
      const response = await request(app)
        .post('/api/ai/activities/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          outcomeIds: ['test-outcome-1'],
          theme: 'Animals',
          complexity: 'simple'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/ai/activities/generate')
        .send({
          outcomeIds: ['test-outcome-1']
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/ai/activities/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing outcomeIds
          theme: 'Animals'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/ai/curriculum/analyze', () => {
    it('should analyze curriculum coverage', async () => {
      const response = await request(app)
        .get('/api/ai/curriculum/analyze')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalOutcomes');
      expect(response.body.data).toHaveProperty('coveragePercentage');
      expect(response.body.data).toHaveProperty('priorityGaps');
    });

    it('should filter by subject when provided', async () => {
      const response = await request(app)
        .get('/api/ai/curriculum/analyze?subjectId=100')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/ai/plans/generate', () => {
    it('should generate weekly plan', async () => {
      const response = await request(app)
        .post('/api/ai/plans/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          weekStart: '2024-01-08',
          preferences: {
            preferredComplexity: 'moderate',
            includeAssessments: false
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('planId');
      expect(response.body.data).toHaveProperty('plan');
    });

    it('should validate weekStart format', async () => {
      const response = await request(app)
        .post('/api/ai/plans/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          weekStart: 'invalid-date',
          preferences: {}
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/ai/agent/sessions', () => {
    it('should start new planning agent session', async () => {
      const response = await request(app)
        .post('/api/ai/agent/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('sessionId');
      expect(response.body.data).toHaveProperty('message');
    });
  });

  describe('POST /api/ai/agent/messages', () => {
    it('should process agent messages', async () => {
      // First start a session
      const sessionResponse = await request(app)
        .post('/api/ai/agent/sessions')
        .set('Authorization', `Bearer ${authToken}`);

      const sessionId = sessionResponse.body.data.sessionId;

      // Then send a message
      const response = await request(app)
        .post('/api/ai/agent/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionId,
          message: 'Help me generate activities for math'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
    });

    it('should require valid session and message', async () => {
      const response = await request(app)
        .post('/api/ai/agent/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing sessionId and message
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/ai/agent/quick-actions', () => {
    it('should return quick action suggestions', async () => {
      const response = await request(app)
        .get('/api/ai/agent/quick-actions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/ai/activities/:id/feedback', () => {
    it('should record activity feedback', async () => {
      // First create an activity suggestion
      const activity = await prisma.aISuggestedActivity.create({
        data: {
          outcomeId: 'test-outcome-1',
          userId,
          title: 'Test Activity',
          descriptionFr: 'Test description',
          materials: '[]',
          duration: 30
        }
      });

      const response = await request(app)
        .post(`/api/ai/activities/${activity.id}/feedback`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accepted: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Feedback recorded');
    });
  });
});