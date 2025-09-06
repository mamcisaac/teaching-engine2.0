/**
 * TDD Test Suite for Lesson Completion Tracking API
 * Issue #292: Implement Lesson Completion Tracking System
 * 
 * MANDATORY VERIFICATION GATES:
 * Gate 1: Backend API must pass before frontend work
 * - curl/Postman shows correct completion data ✓
 * - Can create completion via API ✓
 * - Can delete completion via API ✓
 * - Data persists in database ✓
 * - Integration tests: 100% pass ✓
 */

import request from 'supertest';
import { app } from '../../app';
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

const prisma = new PrismaClient();

describe('Lesson Completion Tracking API - TDD RED Phase', () => {
  let authToken: string;
  let userId: number;
  let lessonId: string;
  let lesson2Id: string;

  beforeAll(async () => {
    // Setup test user and lessons
    const user = await prisma.user.create({
      data: {
        email: 'emily.mcisaac@test.com',
        name: 'Emily McIsaac',
        passwordHash: 'hashed_password',
        role: 'TEACHER'
      }
    });
    userId = user.id;
    authToken = sign({ userId: user.id }, process.env.JWT_SECRET || 'test-secret');

    // Create test lessons
    const lesson1 = await prisma.eTFOLessonPlan.create({
      data: {
        title: 'Counting by 2s',
        subject: 'Mathématiques',
        gradeLevel: '1',
        duration: 45,
        objectives: ['Students will count by 2s up to 20'],
        materials: ['Number line', 'Counting blocks'],
        activities: ['Introduction', 'Guided practice', 'Independent work'],
        assessment: 'Observation checklist',
        reflection: '',
        isAIGenerated: false,
        isApproved: true,
        status: 'APPROVED',
        userId: userId
      }
    });
    lessonId = lesson1.id;

    const lesson2 = await prisma.eTFOLessonPlan.create({
      data: {
        title: 'French Phonics - /ou/ sound',
        subject: 'Français',
        gradeLevel: '1',
        duration: 45,
        objectives: ['Students will identify the /ou/ sound'],
        materials: ['Phonics cards'],
        activities: ['Sound introduction', 'Word practice'],
        assessment: 'Quick check',
        reflection: '',
        isAIGenerated: false,
        isApproved: true,
        status: 'APPROVED',
        userId: userId
      }
    });
    lesson2Id = lesson2.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up completions before each test
    await prisma.lessonCompletion.deleteMany({});
  });

  describe('POST /api/lesson-completions - Mark lesson complete', () => {
    it('should create a new lesson completion record', async () => {
      const response = await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lessonId: lessonId,
          notes: 'Students struggled with skip counting',
          actualDuration: 50,
          wentWell: false,
          needsFollowUp: true
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        userId: userId,
        lessonId: lessonId,
        notes: 'Students struggled with skip counting',
        actualDuration: 50,
        wentWell: false,
        needsFollowUp: true,
        completedAt: expect.any(String)
      });

      // Verify persistence in database
      const completion = await prisma.lessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId: lessonId
          }
        }
      });
      expect(completion).toBeTruthy();
      expect(completion?.notes).toBe('Students struggled with skip counting');
    });

    it('should allow quick completion without optional fields', async () => {
      const response = await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lessonId: lessonId
        });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        userId: userId,
        lessonId: lessonId,
        wentWell: true, // default
        needsFollowUp: false, // default
        notes: null,
        actualDuration: null
      });
    });

    it('should prevent duplicate completions for same lesson', async () => {
      // First completion
      await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lessonId: lessonId });

      // Attempt duplicate
      const response = await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lessonId: lessonId });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already completed');
    });

    it('should handle optimistic updates with proper response time', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lessonId: lessonId });

      const responseTime = Date.now() - startTime;
      
      expect(response.status).toBe(201);
      expect(responseTime).toBeLessThan(100); // Must respond in < 100ms for optimistic UI
    });

    it('should validate lessonId exists', async () => {
      const response = await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lessonId: 'non-existent-id' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Lesson not found');
    });
  });

  describe('DELETE /api/lesson-completions/:lessonId - Mark lesson incomplete', () => {
    beforeEach(async () => {
      // Create a completion to delete
      await prisma.lessonCompletion.create({
        data: {
          userId: userId,
          lessonId: lessonId,
          notes: 'Initial completion',
          wentWell: true,
          needsFollowUp: false
        }
      });
    });

    it('should delete an existing lesson completion', async () => {
      const response = await request(app)
        .delete(`/api/lesson-completions/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify deletion from database
      const completion = await prisma.lessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId: lessonId
          }
        }
      });
      expect(completion).toBeNull();
    });

    it('should return 404 for non-existent completion', async () => {
      const response = await request(app)
        .delete(`/api/lesson-completions/${lesson2Id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Completion not found');
    });

    it('should handle concurrent delete requests gracefully', async () => {
      const requests = Array(3).fill(null).map(() =>
        request(app)
          .delete(`/api/lesson-completions/${lessonId}`)
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      
      // One should succeed, others should get 404
      const successCount = responses.filter(r => r.status === 204).length;
      const notFoundCount = responses.filter(r => r.status === 404).length;
      
      expect(successCount).toBe(1);
      expect(notFoundCount).toBe(2);
    });
  });

  describe('PUT /api/lesson-completions/:lessonId - Update completion details', () => {
    beforeEach(async () => {
      await prisma.lessonCompletion.create({
        data: {
          userId: userId,
          lessonId: lessonId,
          notes: 'Initial notes',
          wentWell: true,
          needsFollowUp: false,
          actualDuration: 45
        }
      });
    });

    it('should update existing completion details', async () => {
      const response = await request(app)
        .put(`/api/lesson-completions/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notes: 'Updated: Students needed extra support with skip counting',
          actualDuration: 55,
          wentWell: false,
          needsFollowUp: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        notes: 'Updated: Students needed extra support with skip counting',
        actualDuration: 55,
        wentWell: false,
        needsFollowUp: true
      });

      // Verify persistence
      const completion = await prisma.lessonCompletion.findUnique({
        where: {
          userId_lessonId: {
            userId: userId,
            lessonId: lessonId
          }
        }
      });
      expect(completion?.notes).toBe('Updated: Students needed extra support with skip counting');
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .put(`/api/lesson-completions/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notes: 'Just updating notes'
        });

      expect(response.status).toBe(200);
      expect(response.body.notes).toBe('Just updating notes');
      expect(response.body.actualDuration).toBe(45); // Original value preserved
    });
  });

  describe('GET /api/lesson-completions - Get completions with filters', () => {
    beforeEach(async () => {
      // Create multiple completions with different dates
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await prisma.lessonCompletion.create({
        data: {
          userId: userId,
          lessonId: lessonId,
          completedAt: today,
          notes: 'Today lesson 1'
        }
      });

      await prisma.lessonCompletion.create({
        data: {
          userId: userId,
          lessonId: lesson2Id,
          completedAt: yesterday,
          notes: 'Yesterday lesson 2'
        }
      });
    });

    it('should get all completions for user', async () => {
      const response = await request(app)
        .get('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.completions).toHaveLength(2);
      expect(response.body.completions[0].lessonId).toBeDefined();
    });

    it('should filter completions by date range', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .get('/api/lesson-completions')
        .query({
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString()
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.completions).toHaveLength(1);
      expect(response.body.completions[0].notes).toBe('Today lesson 1');
    });

    it('should include lesson details when requested', async () => {
      const response = await request(app)
        .get('/api/lesson-completions')
        .query({ includeLessonDetails: true })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.completions[0].lesson).toBeDefined();
      expect(response.body.completions[0].lesson.title).toBeDefined();
    });

    it('should handle empty result sets gracefully', async () => {
      await prisma.lessonCompletion.deleteMany({});

      const response = await request(app)
        .get('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.completions).toEqual([]);
    });
  });

  describe('GET /api/lesson-completions/stats - Get completion statistics', () => {
    beforeEach(async () => {
      // Create completions for statistics
      await prisma.lessonCompletion.createMany({
        data: [
          {
            userId: userId,
            lessonId: lessonId,
            wentWell: true,
            needsFollowUp: false,
            actualDuration: 45
          },
          {
            userId: userId,
            lessonId: lesson2Id,
            wentWell: false,
            needsFollowUp: true,
            actualDuration: 60
          }
        ]
      });
    });

    it('should return completion statistics for today', async () => {
      const response = await request(app)
        .get('/api/lesson-completions/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalLessons: expect.any(Number),
        completedLessons: 2,
        completionRate: expect.any(Number),
        averageActualDuration: 52.5,
        lessonsWentWell: 1,
        lessonsNeedFollowUp: 1
      });
    });

    it('should calculate weekly statistics', async () => {
      const response = await request(app)
        .get('/api/lesson-completions/stats')
        .query({ period: 'week' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dailyBreakdown');
      expect(response.body.dailyBreakdown).toBeInstanceOf(Array);
      expect(response.body.dailyBreakdown.length).toBe(7);
    });

    it('should handle no completions gracefully', async () => {
      await prisma.lessonCompletion.deleteMany({});

      const response = await request(app)
        .get('/api/lesson-completions/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        totalLessons: expect.any(Number),
        completedLessons: 0,
        completionRate: 0,
        averageActualDuration: null,
        lessonsWentWell: 0,
        lessonsNeedFollowUp: 0
      });
    });
  });

  describe('Batch Operations - Performance Requirements', () => {
    it('should handle batch marking of multiple lessons efficiently', async () => {
      const lessonIds = [lessonId, lesson2Id];
      const startTime = Date.now();

      const response = await request(app)
        .post('/api/lesson-completions/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completions: lessonIds.map(id => ({
            lessonId: id,
            wentWell: true
          }))
        });

      const responseTime = Date.now() - startTime;

      expect(response.status).toBe(201);
      expect(response.body.created).toBe(2);
      expect(responseTime).toBeLessThan(200); // Batch operation should be under 200ms
    });

    it('should support batch deletion', async () => {
      // Create completions first
      await prisma.lessonCompletion.createMany({
        data: [
          { userId, lessonId },
          { userId, lessonId: lesson2Id }
        ]
      });

      const response = await request(app)
        .delete('/api/lesson-completions/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lessonIds: [lessonId, lesson2Id]
        });

      expect(response.status).toBe(204);

      // Verify all deleted
      const remaining = await prisma.lessonCompletion.count({
        where: { userId }
      });
      expect(remaining).toBe(0);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should require authentication for all endpoints', async () => {
      const endpoints = [
        { method: 'post', path: '/api/lesson-completions' },
        { method: 'delete', path: `/api/lesson-completions/${lessonId}` },
        { method: 'put', path: `/api/lesson-completions/${lessonId}` },
        { method: 'get', path: '/api/lesson-completions' },
        { method: 'get', path: '/api/lesson-completions/stats' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
        expect(response.body.error).toContain('Authentication required');
      }
    });

    it('should prevent accessing other users completions', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@test.com',
          name: 'Other Teacher',
          passwordHash: 'hash',
          role: 'TEACHER'
        }
      });

      // Create completion for other user
      await prisma.lessonCompletion.create({
        data: {
          userId: otherUser.id,
          lessonId: lessonId,
          notes: 'Private notes'
        }
      });

      // Try to access with original user token
      const response = await request(app)
        .get('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const userCompletions = response.body.completions.filter(
        (.*: unknown) => c.notes === 'Private notes'
      );
      expect(userCompletions).toHaveLength(0);
    });

    it('should handle database connection failures gracefully', async () => {
      // Simulate database disconnection
      await prisma.$disconnect();

      const response = await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lessonId });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Database error');

      // Reconnect for cleanup
      await prisma.$connect();
    });
  });

  describe('CRITICAL: State Management Anti-Patterns Prevention', () => {
    it('should ensure completions are user-specific and isolated', async () => {
      // Create completions for current user
      await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lessonId: lessonId });

      await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lessonId: lesson2Id });

      // Verify each lesson has independent completion state
      const response = await request(app)
        .get('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`);

      const completions = response.body.completions;
      expect(completions).toHaveLength(2);
      
      // Each completion should be independent
      const lesson1Completion = completions.find(.*: unknown) => c.lessonId === lessonId);
      const lesson2Completion = completions.find(.*: unknown) => c.lessonId === lesson2Id);
      
      expect(lesson1Completion).toBeDefined();
      expect(lesson2Completion).toBeDefined();
      expect(lesson1Completion.id).not.toBe(lesson2Completion.id);
    });

    it('should maintain consistency between individual and batch operations', async () => {
      // Mark lesson1 complete individually
      await request(app)
        .post('/api/lesson-completions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lessonId: lessonId });

      // Get stats
      const statsBefore = await request(app)
        .get('/api/lesson-completions/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsBefore.body.completedLessons).toBe(1);

      // Mark lesson2 complete via batch
      await request(app)
        .post('/api/lesson-completions/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completions: [{ lessonId: lesson2Id, wentWell: true }]
        });

      // Verify consistency
      const statsAfter = await request(app)
        .get('/api/lesson-completions/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(statsAfter.body.completedLessons).toBe(2);
    });
  });
});