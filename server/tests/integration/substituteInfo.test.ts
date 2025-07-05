/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Substitute Information Integration Tests
 * 
 * Tests the substitute teacher information system
 * including emergency plans and substitute instructions
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { app } from '../../src/index';
import { authRequest } from '../test-auth-helper';
import { getTestPrismaClient, createTestData } from '../jest.setup';

const auth = authRequest(app);

describe('Substitute Information API', () => {
  let testSubject: unknown;
  let testMilestone: unknown;
  let testUser: unknown;

  beforeAll(async () => {
    await auth.setup();
  });

  beforeEach(async () => {
    // Create test data for each test
    const testData = await createTestData(async (prisma) => {
      const user = await prisma.user.findFirst({
        where: { id: auth.userId }
      });

      const subject = await prisma.subject.create({
        data: {
          name: 'Mathematics',
          code: 'MATH',
          userId: auth.userId!,
        },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Test Milestone',
          subjectId: subject.id,
          userId: auth.userId!,
        },
      });

      return { user, subject, milestone };
    });

    testUser = testData.user;
    testSubject = testData.subject;
    testMilestone = testData.milestone;
  });

  describe('Emergency Substitute Plans', () => {
    it('should create emergency substitute plan', async () => {
      const planData = {
        title: 'Emergency Math Plan',
        subject: 'Mathematics',
        grade: 5,
        duration: 60,
        activities: [
          {
            title: 'Review worksheet',
            description: 'Students complete pages 45-47',
            duration: 30,
            materials: ['Math textbook', 'Worksheets']
          },
          {
            title: 'Math games',
            description: 'Use math fact games for remaining time',
            duration: 30,
            materials: ['Math games bin']
          }
        ],
        specialInstructions: 'Check with Mrs. Smith next door if needed',
        emergencyContacts: ['Principal: ext 100', 'VP: ext 101']
      };

      const response = await auth.post('/api/substitute/emergency-plans')
        .send(planData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(planData.title);
      expect(response.body.activities).toHaveLength(2);
    });

    it('should retrieve all emergency plans for teacher', async () => {
      // Create a test plan first
      await auth.post('/api/substitute/emergency-plans')
        .send({
          title: 'Test Emergency Plan',
          subject: 'Science',
          grade: 4,
          duration: 45,
          activities: [],
          specialInstructions: 'Test instructions'
        });

      const response = await auth.get('/api/substitute/emergency-plans');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should update existing emergency plan', async () => {
      // Create plan
      const createResponse = await auth.post('/api/substitute/emergency-plans')
        .send({
          title: 'Original Plan',
          subject: 'English',
          grade: 3,
          duration: 50,
          activities: []
        });

      const planId = createResponse.body.id;

      // Update plan
      const updateResponse = await auth.put(`/api/substitute/emergency-plans/${planId}`)
        .send({
          title: 'Updated Plan',
          subject: 'English',
          grade: 3,
          duration: 60,
          activities: [
            {
              title: 'Reading activity',
              description: 'Silent reading for 20 minutes',
              duration: 20
            }
          ]
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Plan');
      expect(updateResponse.body.duration).toBe(60);
    });

    it('should delete emergency plan', async () => {
      // Create plan
      const createResponse = await auth.post('/api/substitute/emergency-plans')
        .send({
          title: 'Plan to Delete',
          subject: 'Art',
          grade: 2,
          duration: 40,
          activities: []
        });

      const planId = createResponse.body.id;

      // Delete plan
      const deleteResponse = await auth.delete(`/api/substitute/emergency-plans/${planId}`);
      expect(deleteResponse.status).toBe(204);

      // Verify deletion
      const getResponse = await auth.get(`/api/substitute/emergency-plans/${planId}`);
      expect(getResponse.status).toBe(404);
    });
  });

  describe('Daily Substitute Instructions', () => {
    it('should generate substitute instructions for specific date', async () => {
      const date = '2024-03-15';
      
      const response = await auth.get(`/api/substitute/daily-instructions?date=${date}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('date', date);
      expect(response.body).toHaveProperty('schedule');
      expect(response.body).toHaveProperty('specialInstructions');
      expect(response.body).toHaveProperty('emergencyContacts');
    });

    it('should include lesson plans in daily instructions', async () => {
      // Create a lesson plan for today
      const today = new Date().toISOString().split('T')[0];
      
      const lessonResponse = await auth.post('/api/lesson-plans')
        .send({
          title: 'Math Lesson',
          subject: 'Mathematics',
          date: today,
          duration: 60,
          objectives: ['Understand fractions'],
          activities: ['Fraction manipulatives'],
          materials: ['Fraction bars']
        });

      const response = await auth.get(`/api/substitute/daily-instructions?date=${today}`);

      expect(response.status).toBe(200);
      expect(response.body.schedule.length).toBeGreaterThan(0);
      
      const mathLesson = response.body.schedule.find((item: unknown) => 
        item.subject === 'Mathematics'
      );
      expect(mathLesson).toBeDefined();
      expect(mathLesson.title).toBe('Math Lesson');
    });

    it('should handle dates with no planned activities', async () => {
      const futureDate = '2025-12-31';
      
      const response = await auth.get(`/api/substitute/daily-instructions?date=${futureDate}`);

      expect(response.status).toBe(200);
      expect(response.body.date).toBe(futureDate);
      expect(response.body.schedule).toEqual([]);
      expect(response.body).toHaveProperty('emergencyPlans');
    });
  });

  describe('Classroom Information', () => {
    it('should provide classroom setup information', async () => {
      const response = await auth.get('/api/substitute/classroom-info');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('classroomRules');
      expect(response.body).toHaveProperty('routines');
      expect(response.body).toHaveProperty('studentNeeds');
      expect(response.body).toHaveProperty('emergencyProcedures');
    });

    it('should update classroom information', async () => {
      const updateData = {
        classroomRules: [
          'Raise hand before speaking',
          'Walk, don\'t run',
          'Be kind to others'
        ],
        routines: {
          morning: 'Bell work on whiteboard',
          dismissal: 'Pack bags, stack chairs'
        },
        studentNeeds: [
          {
            name: 'Student A',
            needs: 'Needs frequent breaks',
            accommodations: 'Sits near teacher'
          }
        ],
        emergencyProcedures: {
          fire: 'Exit through door A, meet at flag pole',
          lockdown: 'Lock door, lights off, quiet'
        }
      };

      const response = await auth.put('/api/substitute/classroom-info')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.classroomRules).toEqual(updateData.classroomRules);
      expect(response.body.routines.morning).toBe(updateData.routines.morning);
    });
  });

  describe('Error Handling', () => {
    it('should require authentication', async () => {
      const response = await auth.get('/api/substitute/emergency-plans')
        .set('Authorization', ''); // Remove auth

      expect(response.status).toBe(401);
    });

    it('should validate emergency plan data', async () => {
      const invalidData = {
        // Missing required fields
        subject: 'Math'
      };

      const response = await auth.post('/api/substitute/emergency-plans')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid date formats', async () => {
      const response = await auth.get('/api/substitute/daily-instructions?date=invalid-date');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid date format');
    });

    it('should handle non-existent emergency plan', async () => {
      const response = await auth.get('/api/substitute/emergency-plans/99999');

      expect(response.status).toBe(404);
    });
  });

  describe('Access Control', () => {
    it('should only show plans for authenticated teacher', async () => {
      // Create plan with current user
      await auth.post('/api/substitute/emergency-plans')
        .send({
          title: 'My Plan',
          subject: 'Math',
          grade: 1,
          duration: 30,
          activities: []
        });

      // Get plans (should only include current user's plans)
      const response = await auth.get('/api/substitute/emergency-plans');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // All plans should belong to current user
      response.body.forEach((plan: unknown) => {
        expect(plan.userId).toBe(auth.userId);
      });
    });

    it('should prevent access to other teacher\'s plans', async () => {
      // Try to access a plan with wrong user ID (should fail)
      const response = await auth.get('/api/substitute/emergency-plans/99999');

      expect(response.status).toBe(404);
    });
  });
});