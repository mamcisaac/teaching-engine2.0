import request from 'supertest';
import { describe, beforeAll, beforeEach, afterEach, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Planning Routes', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  let authToken: string;
  let userId: number;
  let testUser: any;

  beforeAll(async () => {
    prisma = getTestPrismaClient();
  });

  beforeEach(async () => {
    // Clean up test data
    await prisma.weeklyPlannerState.deleteMany({});
    await prisma.user.deleteMany({});

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
        password: hashedPassword,
        name: 'Test User',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
    userId = testUser.id;

    // Create auth token
    const secret = process.env.JWT_SECRET || 'test-secret-key';
    authToken = jwt.sign({ 
      userId: String(userId), 
      email: testUser.email,
      iat: Math.floor(Date.now() / 1000)
    }, secret, { expiresIn: '1h' });
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.weeklyPlannerState.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('GET /api/planner/state', () => {
    it('should return planner state for authenticated user', async () => {
      const res = await request(app)
        .get('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        defaultView: 'week',
        timeSlotDuration: 30,
        showWeekends: false,
        startOfWeek: 1,
        sidebarExpanded: true,
        showMiniCalendar: true,
        showResourcePanel: true,
        compactMode: false,
        theme: 'light',
        autoSave: true,
        autoSaveInterval: 30,
        showUncoveredOutcomes: true,
        defaultLessonDuration: 60,
      });
    });

    it('should create default state if none exists', async () => {
      // Verify no state exists
      let state = await prisma.weeklyPlannerState.findUnique({
        where: { userId },
      });
      expect(state).toBeNull();

      // Make request
      const res = await request(app)
        .get('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);

      // Verify state was created
      state = await prisma.weeklyPlannerState.findUnique({
        where: { userId },
      });
      expect(state).toBeTruthy();
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/planner/state');

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Authentication required');
    });

    it('should return 403 with invalid token', async () => {
      const res = await request(app)
        .get('/api/planner/state')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/planner/state', () => {
    it('should update planner state for authenticated user', async () => {
      const updateData = {
        defaultView: 'month',
        timeSlotDuration: 45,
        showWeekends: true,
        theme: 'dark',
        compactMode: true,
      };

      const res = await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Origin', 'http://localhost:5173')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updateData);

      // Verify in database
      const state = await prisma.weeklyPlannerState.findUnique({
        where: { userId },
      });
      expect(state?.defaultView).toBe('month');
      expect(state?.timeSlotDuration).toBe(45);
      expect(state?.showWeekends).toBe(true);
      expect(state?.theme).toBe('dark');
      expect(state?.compactMode).toBe(true);
    });

    it('should validate input data', async () => {
      const invalidData = {
        defaultView: 'invalid-view',
        timeSlotDuration: 5, // Less than minimum 15
        startOfWeek: 7, // More than maximum 1
      };

      const res = await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Origin', 'http://localhost:5173')
        .send(invalidData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should sanitize text input', async () => {
      const maliciousData = {
        lastActiveView: '<script>alert("XSS")</script>',
      };

      const res = await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousData);

      expect(res.status).toBe(200);
      expect(res.body.lastActiveView).toBe('alert("XSS")'); // Script tags removed
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .put('/api/planner/state')
        .send({ defaultView: 'month' });

      expect(res.status).toBe(401);
    });

    it('should enforce rate limiting', async () => {
      // Note: This test may need adjustment based on rate limit configuration
      const requests = [];
      for (let i = 0; i < 101; i++) {
        requests.push(
          request(app)
            .put('/api/planner/state')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ defaultView: 'week' })
        );
      }

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/planner/state/reset', () => {
    it('should reset planner state to defaults', async () => {
      // First, update some values
      await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          defaultView: 'month',
          theme: 'dark',
          showWeekends: true,
        });

      // Now reset
      const res = await request(app)
        .post('/api/planner/state/reset')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        defaultView: 'week',
        theme: 'light',
        showWeekends: false,
      });
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).post('/api/planner/state/reset');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/planner/state/offline', () => {
    it('should update offline data', async () => {
      const offlineData = {
        hasOfflineChanges: true,
        offlineData: {
          pendingChanges: [
            {
              planId: 'cuid123',
              title: 'Updated Plan',
              timestamp: Date.now(),
            },
          ],
          syncVersion: 'v1.0',
        },
      };

      const res = await request(app)
        .patch('/api/planner/state/offline')
        .set('Authorization', `Bearer ${authToken}`)
        .send(offlineData);

      expect(res.status).toBe(200);
      expect(res.body.hasOfflineChanges).toBe(true);
    });

    it('should validate offline data structure', async () => {
      const invalidData = {
        offlineData: {
          pendingChanges: [
            {
              // Missing required fields
              content: 'Some content',
            },
          ],
        },
      };

      const res = await request(app)
        .patch('/api/planner/state/offline')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData);

      expect(res.status).toBe(400);
    });

    it('should limit number of pending changes', async () => {
      const tooManyChanges = {
        offlineData: {
          pendingChanges: Array(51).fill({
            planId: 'cuid123',
            title: 'Change',
            timestamp: Date.now(),
          }),
        },
      };

      const res = await request(app)
        .patch('/api/planner/state/offline')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tooManyChanges);

      expect(res.status).toBe(400);
    });
  });

  describe('Security Tests', () => {
    it('should enforce CSRF protection on state updates', async () => {
      const res = await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Origin', 'http://malicious-site.com')
        .send({ defaultView: 'month' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toContain('CSRF protection');
    });

    it('should allow requests from valid origins', async () => {
      const res = await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Origin', 'http://localhost:5173')
        .send({ defaultView: 'month' });

      expect(res.status).toBe(200);
    });

    it('should handle missing origin/referer for non-GET requests', async () => {
      const res = await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        // No Origin or Referer header
        .send({ defaultView: 'month' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Missing origin/referer');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock a database error
      const originalFindUnique = prisma.weeklyPlannerState.findUnique;
      prisma.weeklyPlannerState.findUnique = () => {
        throw new Error('Database connection lost');
      };

      const res = await request(app)
        .get('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');

      // Restore original method
      prisma.weeklyPlannerState.findUnique = originalFindUnique;
    });
  });
});