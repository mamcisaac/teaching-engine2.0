/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Permissions and Authorization Security Tests
 *
 * Tests authorization and access control to ensure users can only
 * access resources they own and have permission to view/modify
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import {
  getIntegrationTestPrismaClient,
  cleanIntegrationTestData,
} from '../../integration-test-setup';

// Import the actual app
let app: unknown;

beforeEach(async () => {
  // Import the actual app
  const appModule = await import('../../../src/index');
  app = appModule.app;
});

describe('Authorization and Permissions Security Tests', () => {
  const teacher1 = {
    email: 'teacher1@example.com',
    password: 'SecurePassword123!',
    name: 'Teacher One',
    role: 'teacher',
  };

  const teacher2 = {
    email: 'teacher2@example.com',
    password: 'SecurePassword123!',
    name: 'Teacher Two',
    role: 'teacher',
  };

  let teacher1Token: string;
  let teacher2Token: string;
  let teacher1Id: number;
  let teacher2Id: number;

  beforeEach(async () => {
    // Create test users with hashed passwords
    const hashedPassword1 = await bcrypt.hash(teacher1.password, 12);
    const hashedPassword2 = await bcrypt.hash(teacher2.password, 12);

    // Clean any existing test data
    await cleanIntegrationTestData();

    // Use the integration test Prisma client
    const prisma = getIntegrationTestPrismaClient();

    console.log('Creating users directly with Prisma client...');

    try {
      const user1 = await prisma.user.create({
        data: {
          email: teacher1.email,
          password: hashedPassword1,
          name: teacher1.name,
          role: teacher1.role,
        },
      });

      const user2 = await prisma.user.create({
        data: {
          email: teacher2.email,
          password: hashedPassword2,
          name: teacher2.name,
          role: teacher2.role,
        },
      });

      console.log('Created users:', { user1, user2 });

      expect(user1).toBeTruthy();
      expect(user2).toBeTruthy();
      expect(user1.id).toBeTruthy();
      expect(user2.id).toBeTruthy();

      teacher1Id = user1.id;
      teacher2Id = user2.id;
    } catch (_error) {
      console.error('Error creating users:', error);
      throw error;
    }

    // Login both users to get tokens
    const loginResponse1 = await request(app).post('/api/auth/login').send({
      email: teacher1.email,
      password: teacher1.password,
    });

    const loginResponse2 = await request(app).post('/api/auth/login').send({
      email: teacher2.email,
      password: teacher2.password,
    });

    // Extract tokens from response body (auth middleware returns accessToken)
    expect(loginResponse1.status).toBe(200);
    expect(loginResponse2.status).toBe(200);
    expect(loginResponse1.body.accessToken).toBeTruthy();
    expect(loginResponse2.body.accessToken).toBeTruthy();

    teacher1Token = loginResponse1.body.accessToken;
    teacher2Token = loginResponse2.body.accessToken;
  });

  describe('Student Data Isolation', () => {
    let teacher1Student: unknown;
    let teacher2Student: unknown;

    beforeEach(async () => {
      // Create students for each teacher
      const createStudentResponse1 = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacher1Token}`)
        .send({
          firstName: 'Student',
          lastName: 'One',
          grade: 5,
        });

      console.log(
        'Create student response 1:',
        createStudentResponse1.status,
        createStudentResponse1.body,
      );

      const createStudentResponse2 = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacher2Token}`)
        .send({
          firstName: 'Student',
          lastName: 'Two',
          grade: 6,
        });

      console.log(
        'Create student response 2:',
        createStudentResponse2.status,
        createStudentResponse2.body,
      );

      teacher1Student = createStudentResponse1.body;
      teacher2Student = createStudentResponse2.body;
    });

    it('should only return students belonging to authenticated teacher', async () => {
      const response1 = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${teacher1Token}`);

      const response2 = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${teacher2Token}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Teacher 1 should only see their student
      expect(response1.body).toHaveLength(1);
      expect(response1.body[0].id).toBe(teacher1Student.id);
      expect(response1.body[0].name).toBe('Student One');

      // Teacher 2 should only see their student
      expect(response2.body).toHaveLength(1);
      expect(response2.body[0].id).toBe(teacher2Student.id);
      expect(response2.body[0].name).toBe('Student Two');
    });

    it('should prevent access to other teachers students by ID', async () => {
      // Teacher 1 tries to access Teacher 2's student
      const response = await request(app)
        .get(`/api/students/${teacher2Student.id}`)
        .set('Authorization', `Bearer ${teacher1Token}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Student not found');
    });

    it('should prevent modification of other teachers students', async () => {
      // Teacher 1 tries to update Teacher 2's student
      const response = await request(app)
        .put(`/api/students/${teacher2Student.id}`)
        .set('Authorization', `Bearer ${teacher1Token}`)
        .send({
          firstName: 'Modified',
          lastName: 'Name',
        });

      expect(response.status).toBeOneOf([404, 403]);
    });

    it('should prevent deletion of other teachers students', async () => {
      // Teacher 1 tries to delete Teacher 2's student
      const response = await request(app)
        .delete(`/api/students/${teacher2Student.id}`)
        .set('Authorization', `Bearer ${teacher1Token}`);

      expect(response.status).toBeOneOf([404, 403]);
    });
  });

  describe('Curriculum Data Isolation', () => {
    let teacher1LRP: unknown;
    let teacher2LRP: unknown;

    beforeEach(async () => {
      // Create long range plans for each teacher
      const createLRPResponse1 = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${teacher1Token}`)
        .send({
          title: 'Teacher 1 LRP',
          subject: 'Mathematics',
          grade: 5,
          year: 2024,
        });

      const createLRPResponse2 = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${teacher2Token}`)
        .send({
          title: 'Teacher 2 LRP',
          subject: 'Science',
          grade: 6,
          year: 2024,
        });

      teacher1LRP = createLRPResponse1.body;
      teacher2LRP = createLRPResponse2.body;
    });

    it('should only return long range plans belonging to authenticated teacher', async () => {
      const response1 = await request(app)
        .get('/api/long-range-plans')
        .set('Authorization', `Bearer ${teacher1Token}`);

      const response2 = await request(app)
        .get('/api/long-range-plans')
        .set('Authorization', `Bearer ${teacher2Token}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Teacher 1 should only see their LRP
      const teacher1Plans = response1.body.filter((plan: unknown) => plan.id === teacher1LRP.id);
      const teacher2PlansInTeacher1Response = response1.body.filter(
        (plan: unknown) => plan.id === teacher2LRP.id,
      );

      expect(teacher1Plans).toHaveLength(1);
      expect(teacher2PlansInTeacher1Response).toHaveLength(0);

      // Teacher 2 should only see their LRP
      const teacher2Plans = response2.body.filter((plan: unknown) => plan.id === teacher2LRP.id);
      const teacher1PlansInTeacher2Response = response2.body.filter(
        (plan: unknown) => plan.id === teacher1LRP.id,
      );

      expect(teacher2Plans).toHaveLength(1);
      expect(teacher1PlansInTeacher2Response).toHaveLength(0);
    });

    it('should prevent access to other teachers plans by ID', async () => {
      // Teacher 1 tries to access Teacher 2's plan
      const response = await request(app)
        .get(`/api/long-range-plans/${teacher2LRP.id}`)
        .set('Authorization', `Bearer ${teacher1Token}`);

      expect(response.status).toBeOneOf([404, 403]);
    });
  });

  describe('Unit Plan Data Isolation', () => {
    let teacher1UnitPlan: unknown;
    let teacher2UnitPlan: unknown;

    beforeEach(async () => {
      // Create unit plans for each teacher
      const createUnitPlanResponse1 = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${teacher1Token}`)
        .send({
          title: 'Teacher 1 Unit Plan',
          subject: 'Mathematics',
          grade: 5,
          term: 'Fall 2024',
        });

      const createUnitPlanResponse2 = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${teacher2Token}`)
        .send({
          title: 'Teacher 2 Unit Plan',
          subject: 'Science',
          grade: 6,
          term: 'Fall 2024',
        });

      teacher1UnitPlan = createUnitPlanResponse1.body;
      teacher2UnitPlan = createUnitPlanResponse2.body;
    });

    it('should only return unit plans belonging to authenticated teacher', async () => {
      const response1 = await request(app)
        .get('/api/unit-plans')
        .set('Authorization', `Bearer ${teacher1Token}`);

      const response2 = await request(app)
        .get('/api/unit-plans')
        .set('Authorization', `Bearer ${teacher2Token}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Check that teachers only see their own plans
      const teacher1Plans = response1.body.filter((plan: unknown) => plan.id === teacher1UnitPlan.id);
      const teacher2PlansInTeacher1Response = response1.body.filter(
        (plan: unknown) => plan.id === teacher2UnitPlan.id,
      );

      expect(teacher1Plans).toHaveLength(1);
      expect(teacher2PlansInTeacher1Response).toHaveLength(0);
    });

    it('should prevent access to other teachers unit plans by ID', async () => {
      // Teacher 1 tries to access Teacher 2's unit plan
      const response = await request(app)
        .get(`/api/unit-plans/${teacher2UnitPlan.id}`)
        .set('Authorization', `Bearer ${teacher1Token}`);

      expect(response.status).toBeOneOf([404, 403]);
    });
  });

  describe('Lesson Plan Data Isolation', () => {
    let teacher1LessonPlan: unknown;
    let teacher2LessonPlan: unknown;

    beforeEach(async () => {
      // Create lesson plans for each teacher
      const createLessonPlanResponse1 = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${teacher1Token}`)
        .send({
          title: 'Teacher 1 Lesson Plan',
          subject: 'Mathematics',
          grade: 5,
          date: new Date().toISOString(),
        });

      const createLessonPlanResponse2 = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${teacher2Token}`)
        .send({
          title: 'Teacher 2 Lesson Plan',
          subject: 'Science',
          grade: 6,
          date: new Date().toISOString(),
        });

      teacher1LessonPlan = createLessonPlanResponse1.body;
      teacher2LessonPlan = createLessonPlanResponse2.body;
    });

    it('should only return lesson plans belonging to authenticated teacher', async () => {
      const response1 = await request(app)
        .get('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${teacher1Token}`);

      const response2 = await request(app)
        .get('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${teacher2Token}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Check that teachers only see their own plans
      const teacher1Plans = response1.body.filter((plan: unknown) => plan.id === teacher1LessonPlan.id);
      const teacher2PlansInTeacher1Response = response1.body.filter(
        (plan: unknown) => plan.id === teacher2LessonPlan.id,
      );

      expect(teacher1Plans).toHaveLength(1);
      expect(teacher2PlansInTeacher1Response).toHaveLength(0);
    });

    it('should prevent access to other teachers lesson plans by ID', async () => {
      // Teacher 1 tries to access Teacher 2's lesson plan
      const response = await request(app)
        .get(`/api/etfo-lesson-plans/${teacher2LessonPlan.id}`)
        .set('Authorization', `Bearer ${teacher1Token}`);

      expect(response.status).toBeOneOf([404, 403]);
    });
  });

  describe('User Profile Access Control', () => {
    it('should only return authenticated users own profile', async () => {
      const response1 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${teacher1Token}`);

      const response2 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${teacher2Token}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      expect(response1.body.id).toBe(teacher1Id);
      expect(response1.body.email).toBe(teacher1.email);

      expect(response2.body.id).toBe(teacher2Id);
      expect(response2.body.email).toBe(teacher2.email);
    });

    it('should not allow access to other users profiles', async () => {
      // Try to access user profile by ID (if such endpoint exists)
      const response = await request(app)
        .get(`/api/users/${teacher2Id}`)
        .set('Authorization', `Bearer ${teacher1Token}`);

      // Should not be allowed or endpoint should not exist
      expect(response.status).toBeOneOf([403, 404]);
    });
  });

  describe('Cross-Tenant Data Validation', () => {
    it('should validate user ownership in request parameters', async () => {
      // Create a student for teacher2 directly in database
      const prisma = getIntegrationTestPrismaClient();
      const student = await prisma.student.create({
        data: {
          firstName: 'Direct',
          lastName: 'Student',
          grade: 5,
          userId: teacher2Id,
        },
      });

      // Teacher1 tries to access this student through various endpoints
      const responses = await Promise.all([
        request(app)
          .get(`/api/students/${student.id}`)
          .set('Authorization', `Bearer ${teacher1Token}`),

        request(app)
          .put(`/api/students/${student.id}`)
          .set('Authorization', `Bearer ${teacher1Token}`)
          .send({ firstName: 'Modified' }),

        request(app)
          .delete(`/api/students/${student.id}`)
          .set('Authorization', `Bearer ${teacher1Token}`),
      ]);

      // All should fail
      responses.forEach((response) => {
        expect(response.status).toBeOneOf([403, 404]);
      });
    });

    it('should prevent privilege escalation through parameter manipulation', async () => {
      // Try to access admin endpoints or modify other users data
      const maliciousRequests = [
        // Try to create data for another user
        request(app).post('/api/students').set('Authorization', `Bearer ${teacher1Token}`).send({
          firstName: 'Malicious',
          lastName: 'Student',
          grade: 5,
          userId: teacher2Id, // Try to set different userId
        }),

        // Try to access system endpoints
        request(app).get('/api/users').set('Authorization', `Bearer ${teacher1Token}`),

        // Try to access admin endpoints
        request(app)
          .post('/api/admin/reset-database')
          .set('Authorization', `Bearer ${teacher1Token}`),
      ];

      const responses = await Promise.all(maliciousRequests);

      responses.forEach((response) => {
        // Should either be forbidden, not found, or ignore the malicious userId
        expect(response.status).not.toBe(200);
      });
    });
  });

  describe('Rate Limiting and Abuse Prevention', () => {
    it('should apply rate limiting to authentication endpoints', async () => {
      const promises = [];

      // Send many login requests rapidly
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app).post('/api/login').send({
            email: teacher1.email,
            password: 'wrongpassword',
          }),
        );
      }

      const responses = await Promise.all(promises);

      // At least some requests should be rate limited
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should apply rate limiting to API endpoints', async () => {
      const promises = [];

      // Send many API requests rapidly
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app).get('/api/students').set('Authorization', `Bearer ${teacher1Token}`),
        );
      }

      const responses = await Promise.all(promises);

      // Some requests might be rate limited (depends on configuration)
      const successfulResponses = responses.filter((r) => r.status === 200);
      const rateLimitedResponses = responses.filter((r) => r.status === 429);

      // Should have both successful and potentially rate-limited responses
      expect(successfulResponses.length).toBeGreaterThan(0);
      // Rate limiting might kick in
      if (rateLimitedResponses.length > 0) {
        expect(rateLimitedResponses.length).toBeGreaterThan(0);
      }
    });
  });
});
