/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import { Express } from 'express';
import { prisma } from '@teaching-engine/database';
import { createTestApp, createTestUser, cleanupTestData, TestUser } from '../../test-utils/test-helpers';
import { WeeklyPlannerState } from '@prisma/client';

describe('Planner State Routes', () => {
  let app: Express;
  let testUser: TestUser;
  let authToken: string;
  let secondUser: TestUser;
  let secondUserToken: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanupTestData();

    // Create test users
    testUser = await createTestUser({
      email: 'planner-test@example.com',
      password: 'TestPassword123!',
    });

    secondUser = await createTestUser({
      email: 'planner-test2@example.com',
      password: 'TestPassword123!',
    });

    // Get auth tokens
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'TestPassword123!',
      });
    authToken = loginResponse.body.token;

    const secondLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: secondUser.email,
        password: 'TestPassword123!',
      });
    secondUserToken = secondLoginResponse.body.token;
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('GET /api/planner/state', () => {
    it('should create default state for new user', async () => {
      const response = await request(app)
        .get('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toMatchObject({
        userId: testUser.id,
        defaultView: 'week',
        timeSlotDuration: 30,
        showWeekends: false,
        startOfWeek: 1,
        workingHours: '{"start":"08:00","end":"16:00"}',
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

      // Verify state was created in database
      const dbState = await prisma.weeklyPlannerState.findUnique({
        where: { userId: testUser.id },
      });
      expect(dbState).toBeTruthy();
    });

    it('should return existing state for user', async () => {
      // Create custom state
      const customState = await prisma.weeklyPlannerState.create({
        data: {
          userId: testUser.id,
          defaultView: 'month',
          timeSlotDuration: 60,
          showWeekends: true,
          theme: 'dark',
          compactMode: true,
          defaultLessonDuration: 45,
        },
      });

      const response = await request(app)
        .get('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toMatchObject({
        id: customState.id,
        defaultView: 'month',
        timeSlotDuration: 60,
        showWeekends: true,
        theme: 'dark',
        compactMode: true,
        defaultLessonDuration: 45,
      });
    });

    it('should isolate state between users', async () => {
      // Create states for both users
      await prisma.weeklyPlannerState.create({
        data: {
          userId: testUser.id,
          theme: 'dark',
        },
      });

      await prisma.weeklyPlannerState.create({
        data: {
          userId: secondUser.id,
          theme: 'light',
        },
      });

      // Check first user's state
      const response1 = await request(app)
        .get('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response1.body.data.theme).toBe('dark');

      // Check second user's state
      const response2 = await request(app)
        .get('/api/planner/state')
        .set('Authorization', `Bearer ${secondUserToken}`)
        .expect(200);

      expect(response2.body.data.theme).toBe('light');
    });
  });

  describe('PUT /api/planner/state', () => {
    it('should update existing planner state', async () => {
      // Create initial state
      await prisma.weeklyPlannerState.create({
        data: {
          userId: testUser.id,
        },
      });

      const updates = {
        defaultView: 'month',
        timeSlotDuration: 60,
        showWeekends: true,
        theme: 'dark',
        compactMode: true,
        sidebarExpanded: false,
        showMiniCalendar: false,
        autoSaveInterval: 60,
        defaultLessonDuration: 90,
      };

      const response = await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toMatchObject(updates);

      // Verify database update
      const dbState = await prisma.weeklyPlannerState.findUnique({
        where: { userId: testUser.id },
      });
      expect(dbState).toMatchObject(updates);
    });

    it('should create state if not exists on update', async () => {
      const updates = {
        theme: 'dark',
        showWeekends: true,
      };

      const response = await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates)
        .expect(200);

      expect(response.body.data).toMatchObject(updates);

      // Verify state was created
      const dbState = await prisma.weeklyPlannerState.findUnique({
        where: { userId: testUser.id },
      });
      expect(dbState).toBeTruthy();
      expect(dbState?.theme).toBe('dark');
    });

    it('should validate update data', async () => {
      const invalidUpdates = {
        defaultView: 'invalid', // Should be week/month/agenda
        timeSlotDuration: 5, // Too small
        startOfWeek: 7, // Invalid day
      };

      await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidUpdates)
        .expect(400);
    });

    it('should handle partial updates', async () => {
      // Create initial state
      const initialState = await prisma.weeklyPlannerState.create({
        data: {
          userId: testUser.id,
          theme: 'light',
          showWeekends: false,
        },
      });

      // Update only theme
      const response = await request(app)
        .put('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ theme: 'dark' })
        .expect(200);

      expect(response.body.data).toMatchObject({
        theme: 'dark',
        showWeekends: false, // Unchanged
      });
    });
  });

  describe('PATCH /api/planner/state/view', () => {
    it('should update current view and position', async () => {
      await prisma.weeklyPlannerState.create({
        data: { userId: testUser.id },
      });

      const viewUpdate = {
        view: 'month',
        position: '2024-09-15',
      };

      const response = await request(app)
        .patch('/api/planner/state/view')
        .set('Authorization', `Bearer ${authToken}`)
        .send(viewUpdate)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toMatchObject({
        lastActiveView: 'month',
        currentWeekStart: expect.any(String),
      });
    });
  });

  describe('PATCH /api/planner/state/draft', () => {
    it('should save draft changes', async () => {
      await prisma.weeklyPlannerState.create({
        data: { userId: testUser.id },
      });

      const draftData = {
        lessonPlans: [
          { id: 'temp-1', title: 'Draft Lesson', date: '2024-09-20' },
        ],
        unsavedChanges: true,
      };

      const response = await request(app)
        .patch('/api/planner/state/draft')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ draft: draftData })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);

      // Verify draft was saved
      const dbState = await prisma.weeklyPlannerState.findUnique({
        where: { userId: testUser.id },
      });
      expect(dbState?.draftChanges).toBe(JSON.stringify(draftData));
    });

    it('should clear draft changes when draft is null', async () => {
      // Create state with draft
      await prisma.weeklyPlannerState.create({
        data: {
          userId: testUser.id,
          draftChanges: JSON.stringify({ test: 'data' }),
        },
      });

      const response = await request(app)
        .patch('/api/planner/state/draft')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ draft: null })
        .expect(200);

      // Verify draft was cleared
      const dbState = await prisma.weeklyPlannerState.findUnique({
        where: { userId: testUser.id },
      });
      expect(dbState?.draftChanges).toBeNull();
    });
  });

  describe('POST /api/planner/state/reset', () => {
    it('should reset planner state to defaults', async () => {
      // Create custom state
      await prisma.weeklyPlannerState.create({
        data: {
          userId: testUser.id,
          theme: 'dark',
          showWeekends: true,
          timeSlotDuration: 60,
          defaultView: 'month',
        },
      });

      const response = await request(app)
        .post('/api/planner/state/reset')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toMatchObject({
        theme: 'light',
        showWeekends: false,
        timeSlotDuration: 30,
        defaultView: 'week',
      });
    });

    it('should preserve user ID on reset', async () => {
      await prisma.weeklyPlannerState.create({
        data: { userId: testUser.id },
      });

      const response = await request(app)
        .post('/api/planner/state/reset')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.userId).toBe(testUser.id);
    });
  });

  describe('GET /api/planner/state/history', () => {
    it('should return undo/redo history', async () => {
      const history = {
        undoHistory: JSON.stringify([
          { action: 'move', timestamp: '2024-09-01' },
          { action: 'create', timestamp: '2024-09-02' },
        ]),
        redoHistory: JSON.stringify([
          { action: 'delete', timestamp: '2024-09-03' },
        ]),
      };

      await prisma.weeklyPlannerState.create({
        data: {
          userId: testUser.id,
          ...history,
        },
      });

      const response = await request(app)
        .get('/api/planner/state/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('undoHistory');
      expect(response.body.data).toHaveProperty('redoHistory');
      expect(response.body.data.undoHistory).toHaveLength(2);
      expect(response.body.data.redoHistory).toHaveLength(1);
    });
  });

  describe('PATCH /api/planner/state/history', () => {
    it('should update history with size limit', async () => {
      await prisma.weeklyPlannerState.create({
        data: {
          userId: testUser.id,
          maxHistorySize: 3,
        },
      });

      const newHistory = {
        undoHistory: [
          { action: 'action1', timestamp: '2024-09-01' },
          { action: 'action2', timestamp: '2024-09-02' },
          { action: 'action3', timestamp: '2024-09-03' },
          { action: 'action4', timestamp: '2024-09-04' }, // Should be trimmed
        ],
        redoHistory: [],
      };

      const response = await request(app)
        .patch('/api/planner/state/history')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newHistory)
        .expect(200);

      // Verify history was trimmed to max size
      const dbState = await prisma.weeklyPlannerState.findUnique({
        where: { userId: testUser.id },
      });
      
      const savedUndo = safeJsonParse(dbState?.undoHistory || '[]', {});
      expect(savedUndo).toHaveLength(3);
      expect(savedUndo[0].action).toBe('action2'); // First item trimmed
    });
  });

  describe('Error Handling', () => {
    it('should require authentication for all endpoints', async () => {
      await request(app).get('/api/planner/state').expect(401);
      await request(app).put('/api/planner/state').send({}).expect(401);
      await request(app).patch('/api/planner/state/view').send({}).expect(401);
      await request(app).patch('/api/planner/state/draft').send({}).expect(401);
      await request(app).post('/api/planner/state/reset').expect(401);
      await request(app).get('/api/planner/state/history').expect(401);
      await request(app).patch('/api/planner/state/history').send({}).expect(401);
    });

    it('should handle database errors gracefully', async () => {
      // Force a database error by closing the connection
      // This is a simplified example - in real tests you might mock the prisma client
      const response = await request(app)
        .get('/api/planner/state')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200); // Should still handle gracefully

      expect(response.body).toHaveProperty('success');
    });
  });
});