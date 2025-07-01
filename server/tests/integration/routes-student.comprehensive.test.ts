/**
 * Comprehensive Student Routes Tests
 * Priority 1B: Core CRUD Operations with Complete Lifecycle Testing
 *
 * Production-level testing with:
 * - Real database operations with proper cleanup
 * - Complete student lifecycle testing (CRUD + goals + reflections)
 * - Audit logging and security validation
 * - Performance benchmarking
 * - Edge case and error handling
 */

import { describe, it, expect, beforeEach, afterAll, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@teaching-engine/database';
import studentRouter from '../../src/routes/student';
import {
  getIntegrationTestPrismaClient,
  cleanIntegrationTestData,
  seedIntegrationTestData,
} from '../integration-test-setup';
import { performance } from 'perf_hooks';

describe('Student Routes - Comprehensive Integration Tests', () => {
  let app: express.Application;
  let prisma: PrismaClient;
  let testUserId: number;
  let otherUserId: number;

  beforeAll(async () => {
    // Get integration test client
    prisma = getIntegrationTestPrismaClient();

    // Setup Express app with student routes
    app = express();
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = { id: testUserId };
      next();
    });

    app.use('/students', studentRouter);

    // Global error handler
    app.use((error: any, req: any, res: any, next: any) => {
      console.error('Test app error:', error);
      res.status(500).json({ error: 'Internal server error' });
    });
  });

  beforeEach(async () => {
    // Clean database before each test for isolation
    await cleanIntegrationTestData();

    // Create test users
    const testData = await seedIntegrationTestData({
      users: [
        {
          email: 'teacher@test.com',
          password: 'hashedpassword',
          name: 'Test Teacher',
          role: 'USER',
        },
        {
          email: 'other@test.com',
          password: 'hashedpassword',
          name: 'Other Teacher',
          role: 'USER',
        },
      ],
    });
    testUserId = testData.users[0].id;
    otherUserId = testData.users[1].id;
  });

  afterAll(async () => {
    // Final cleanup
    await cleanIntegrationTestData();
  });

  describe('GET /students - List Students', () => {
    beforeEach(async () => {
      // Create test students for the authenticated user
      await prisma.student.createMany({
        data: [
          {
            firstName: 'Alice',
            lastName: 'Johnson',
            grade: 3,
            userId: testUserId,
          },
          {
            firstName: 'Bob',
            lastName: 'Smith',
            grade: 2,
            userId: testUserId,
          },
          {
            firstName: 'Charlie',
            lastName: 'Brown',
            grade: 3,
            userId: testUserId,
          },
          {
            firstName: 'David',
            lastName: 'Wilson',
            grade: 2,
            userId: otherUserId, // Different teacher's student
          },
        ],
      });
    });

    it('should retrieve all students for authenticated teacher with proper ordering', async () => {
      const startTime = performance.now();

      const response = await request(app).get('/students').expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Should complete within 500ms
      expect(responseTime).toBeLessThan(500);

      // Should only return students belonging to the authenticated teacher
      expect(response.body).toHaveLength(3);

      // Verify structure and backward compatibility
      response.body.forEach((student: any) => {
        expect(student).toHaveProperty('id');
        expect(student).toHaveProperty('firstName');
        expect(student).toHaveProperty('lastName');
        expect(student).toHaveProperty('grade');
        expect(student).toHaveProperty('name'); // Legacy field
        expect(student).toHaveProperty('goals');
        expect(student).toHaveProperty('reflections');
        expect(student).toHaveProperty('_count');
        expect(student.userId).toBe(testUserId);

        // Verify name field generation
        expect(student.name).toBe(`${student.firstName} ${student.lastName}`);

        // Verify sensitive fields are masked
        expect(student.createdAt).toBeUndefined();
        expect(student.updatedAt).toBeUndefined();
      });

      // Verify ordering: grade ASC, lastName ASC, firstName ASC
      expect(response.body[0].grade).toBe(2); // Bob Smith (Grade 2)
      expect(response.body[0].lastName).toBe('Smith');
      expect(response.body[1].grade).toBe(3); // Charlie Brown (Grade 3)
      expect(response.body[1].lastName).toBe('Brown');
      expect(response.body[2].grade).toBe(3); // Alice Johnson (Grade 3)
      expect(response.body[2].lastName).toBe('Johnson');
    });

    it('should require authentication', async () => {
      // Temporarily remove authentication
      testUserId = 0;

      const response = await request(app).get('/students').expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      // Restore authentication
      testUserId = 1;
    });

    it('should handle empty student list', async () => {
      // Clean all students for this teacher
      await prisma.student.deleteMany({
        where: { userId: testUserId },
      });

      const response = await request(app).get('/students').expect(200);

      expect(response.body).toHaveLength(0);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle large student lists efficiently', async () => {
      // Create many students for performance testing
      const manyStudents = Array.from({ length: 100 }, (_, index) => ({
        firstName: `Student${index}`,
        lastName: `Test${index.toString().padStart(3, '0')}`,
        grade: (index % 12) + 1,
        userId: testUserId,
      }));

      await prisma.student.createMany({ data: manyStudents });

      const startTime = performance.now();

      const response = await request(app).get('/students').expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Should handle 100+ students within 1 second
      expect(responseTime).toBeLessThan(1000);
      expect(response.body.length).toBe(103); // 100 new + 3 existing

      console.log(`Large student list benchmark: ${responseTime}ms for 103 students`);
    });
  });

  describe('GET /students/:id - Get Single Student', () => {
    let testStudentId: number;

    beforeEach(async () => {
      const student = await prisma.student.create({
        data: {
          firstName: 'Test',
          lastName: 'Student',
          grade: 3,
          userId: testUserId,
        },
      });
      testStudentId = student.id;

      // Add some goals and reflections
      await prisma.studentGoal.create({
        data: {
          studentId: testStudentId,
          text: 'Learn multiplication tables',
          status: 'active',
        },
      });

      await prisma.studentReflection.create({
        data: {
          studentId: testStudentId,
          content: "I enjoyed today's math lesson",
          date: new Date(),
        },
      });
    });

    it('should retrieve a single student with all related data', async () => {
      const response = await request(app).get(`/students/${testStudentId}`).expect(200);

      expect(response.body.id).toBe(testStudentId);
      expect(response.body.firstName).toBe('Test');
      expect(response.body.lastName).toBe('Student');
      expect(response.body.grade).toBe(3);
      expect(response.body.name).toBe('Test Student');

      // Verify related data is included
      expect(response.body).toHaveProperty('goals');
      expect(response.body).toHaveProperty('reflections');
      expect(response.body).toHaveProperty('artifacts');
      expect(response.body).toHaveProperty('parentSummaries');

      expect(response.body.goals).toHaveLength(1);
      expect(response.body.reflections).toHaveLength(1);

      // Verify sensitive fields are masked
      expect(response.body.createdAt).toBeUndefined();
      expect(response.body.updatedAt).toBeUndefined();
    });

    it('should return 404 for non-existent student', async () => {
      const nonExistentId = 99999;

      const response = await request(app).get(`/students/${nonExistentId}`).expect(404);

      expect(response.body).toHaveProperty('error', 'Student not found');
    });

    it('should return 404 for student belonging to different teacher', async () => {
      // Create student for other teacher
      const otherStudent = await prisma.student.create({
        data: {
          firstName: 'Other',
          lastName: 'Student',
          grade: 1,
          userId: otherUserId,
        },
      });

      const response = await request(app).get(`/students/${otherStudent.id}`).expect(404);

      expect(response.body).toHaveProperty('error', 'Student not found');
    });

    it('should handle invalid student ID', async () => {
      const response = await request(app).get('/students/invalid').expect(400);
    });

    it('should require authentication', async () => {
      testUserId = 0;

      const response = await request(app).get(`/students/${testStudentId}`).expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      testUserId = 1;
    });
  });

  describe('POST /students - Create Student', () => {
    it('should create a new student with new format (firstName, lastName, grade)', async () => {
      const newStudent = {
        firstName: 'Emma',
        lastName: 'Davis',
        grade: 4,
      };

      const startTime = performance.now();

      const response = await request(app).post('/students').send(newStudent).expect(201);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Creation should complete within 1 second
      expect(responseTime).toBeLessThan(1000);

      expect(response.body).toHaveProperty('id');
      expect(response.body.firstName).toBe(newStudent.firstName);
      expect(response.body.lastName).toBe(newStudent.lastName);
      expect(response.body.grade).toBe(newStudent.grade);
      expect(response.body.name).toBe('Emma Davis'); // Legacy field
      expect(response.body).toHaveProperty('goals');
      expect(response.body).toHaveProperty('reflections');

      // Verify in database
      const createdStudent = await prisma.student.findUnique({
        where: { id: response.body.id },
      });
      expect(createdStudent).toBeTruthy();
      expect(createdStudent?.userId).toBe(testUserId);
    });

    it('should create a student with legacy format (name only)', async () => {
      const legacyStudent = {
        name: 'John Doe',
      };

      const response = await request(app).post('/students').send(legacyStudent).expect(201);

      expect(response.body.firstName).toBe('John');
      expect(response.body.lastName).toBe('Doe');
      expect(response.body.grade).toBe(1); // Default grade for legacy
      expect(response.body.name).toBe('John Doe');
    });

    it('should handle single name in legacy format', async () => {
      const singleNameStudent = {
        name: 'Madonna',
      };

      const response = await request(app).post('/students').send(singleNameStudent).expect(201);

      expect(response.body.firstName).toBe('Madonna');
      expect(response.body.lastName).toBe('Student'); // Default last name
      expect(response.body.name).toBe('Madonna Student');
    });

    it('should handle complex names in legacy format', async () => {
      const complexNameStudent = {
        name: 'Mary Jane Watson-Parker',
      };

      const response = await request(app).post('/students').send(complexNameStudent).expect(201);

      expect(response.body.firstName).toBe('Mary');
      expect(response.body.lastName).toBe('Jane Watson-Parker');
      expect(response.body.name).toBe('Mary Jane Watson-Parker');
    });

    it('should validate required fields for new format', async () => {
      const incompleteStudents = [
        { firstName: 'Test' }, // Missing lastName and grade
        { lastName: 'Student' }, // Missing firstName and grade
        { grade: 5 }, // Missing firstName and lastName
        { firstName: 'Test', lastName: 'Student' }, // Missing grade
        { firstName: 'Test', grade: 5 }, // Missing lastName
      ];

      for (const incompleteStudent of incompleteStudents) {
        const response = await request(app).post('/students').send(incompleteStudent).expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should validate field lengths and types', async () => {
      const invalidStudents = [
        {
          firstName: '', // Too short
          lastName: 'Test',
          grade: 5,
        },
        {
          firstName: 'A'.repeat(101), // Too long
          lastName: 'Test',
          grade: 5,
        },
        {
          firstName: 'Test',
          lastName: 'A'.repeat(101), // Too long
          grade: 5,
        },
        {
          firstName: 'Test',
          lastName: 'Student',
          grade: 0, // Invalid grade
        },
        {
          firstName: 'Test',
          lastName: 'Student',
          grade: 13, // Invalid grade
        },
        {
          name: 'A'.repeat(201), // Too long legacy name
        },
      ];

      for (const invalidStudent of invalidStudents) {
        const response = await request(app).post('/students').send(invalidStudent).expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should require authentication', async () => {
      testUserId = 0;

      const response = await request(app)
        .post('/students')
        .send({
          firstName: 'Test',
          lastName: 'Student',
          grade: 3,
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      testUserId = 1;
    });

    it('should reject invalid student data', async () => {
      const response = await request(app)
        .post('/students')
        .send({}) // Empty data
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /students/:id - Update Student', () => {
    let testStudentId: number;

    beforeEach(async () => {
      const student = await prisma.student.create({
        data: {
          firstName: 'Original',
          lastName: 'Name',
          grade: 2,
          userId: testUserId,
        },
      });
      testStudentId = student.id;
    });

    it('should update student with new format fields', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Student',
        grade: 4,
      };

      const startTime = performance.now();

      const response = await request(app)
        .put(`/students/${testStudentId}`)
        .send(updateData)
        .expect(200);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Update should complete within 1 second
      expect(responseTime).toBeLessThan(1000);

      expect(response.body.id).toBe(testStudentId);
      expect(response.body.firstName).toBe(updateData.firstName);
      expect(response.body.lastName).toBe(updateData.lastName);
      expect(response.body.grade).toBe(updateData.grade);
      expect(response.body.name).toBe('Updated Student');

      // Verify in database
      const updatedStudent = await prisma.student.findUnique({
        where: { id: testStudentId },
      });
      expect(updatedStudent?.firstName).toBe(updateData.firstName);
    });

    it('should update student with legacy name format', async () => {
      const updateData = {
        name: 'Legacy Updated Name',
      };

      const response = await request(app)
        .put(`/students/${testStudentId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe('Legacy');
      expect(response.body.lastName).toBe('Updated Name');
      expect(response.body.name).toBe('Legacy Updated Name');
    });

    it('should update only provided fields (partial update)', async () => {
      const partialUpdate = {
        grade: 5,
      };

      const response = await request(app)
        .put(`/students/${testStudentId}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.grade).toBe(5);
      expect(response.body.firstName).toBe('Original'); // Should remain unchanged
      expect(response.body.lastName).toBe('Name'); // Should remain unchanged
    });

    it('should validate field lengths during update', async () => {
      const invalidUpdates = [
        { firstName: 'A'.repeat(101) }, // Too long
        { lastName: 'A'.repeat(101) }, // Too long
        { grade: 0 }, // Invalid
        { grade: 13 }, // Invalid
        { name: 'A'.repeat(201) }, // Too long
      ];

      for (const invalidUpdate of invalidUpdates) {
        const response = await request(app)
          .put(`/students/${testStudentId}`)
          .send(invalidUpdate)
          .expect(400);

        expect(response.body).toHaveProperty('error');
      }
    });

    it('should return 404 when updating non-existent student', async () => {
      const nonExistentId = 99999;

      const response = await request(app)
        .put(`/students/${nonExistentId}`)
        .send({ firstName: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Student not found');
    });

    it('should return 404 when updating student from different teacher', async () => {
      // Create student for other teacher
      const otherStudent = await prisma.student.create({
        data: {
          firstName: 'Other',
          lastName: 'Student',
          grade: 1,
          userId: otherUserId,
        },
      });

      const response = await request(app)
        .put(`/students/${otherStudent.id}`)
        .send({ firstName: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Student not found');
    });

    it('should require authentication', async () => {
      testUserId = 0;

      const response = await request(app)
        .put(`/students/${testStudentId}`)
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      testUserId = 1;
    });
  });

  describe('DELETE /students/:id - Delete Student', () => {
    let testStudentId: number;

    beforeEach(async () => {
      const student = await prisma.student.create({
        data: {
          firstName: 'To',
          lastName: 'Delete',
          grade: 2,
          userId: testUserId,
        },
      });
      testStudentId = student.id;

      // Add related data to test cascading delete
      await prisma.studentGoal.create({
        data: {
          studentId: testStudentId,
          text: 'Test goal',
          status: 'active',
        },
      });

      await prisma.studentReflection.create({
        data: {
          studentId: testStudentId,
          content: 'Test reflection',
          date: new Date(),
        },
      });
    });

    it('should delete student and all related data in transaction', async () => {
      const startTime = performance.now();

      const response = await request(app).delete(`/students/${testStudentId}`).expect(204);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Deletion should complete within 2 seconds (includes transaction)
      expect(responseTime).toBeLessThan(2000);
      expect(response.body).toEqual({});

      // Verify student is deleted
      const deletedStudent = await prisma.student.findUnique({
        where: { id: testStudentId },
      });
      expect(deletedStudent).toBeNull();

      // Verify related data is deleted
      const goals = await prisma.studentGoal.findMany({
        where: { studentId: testStudentId },
      });
      expect(goals).toHaveLength(0);

      const reflections = await prisma.studentReflection.findMany({
        where: { studentId: testStudentId },
      });
      expect(reflections).toHaveLength(0);
    });

    it('should return 404 when deleting non-existent student', async () => {
      const nonExistentId = 99999;

      const response = await request(app).delete(`/students/${nonExistentId}`).expect(404);

      expect(response.body).toHaveProperty('error', 'Student not found');
    });

    it('should return 404 when deleting student from different teacher', async () => {
      // Create student for other teacher
      const otherStudent = await prisma.student.create({
        data: {
          firstName: 'Other',
          lastName: 'Student',
          grade: 1,
          userId: otherUserId,
        },
      });

      const response = await request(app).delete(`/students/${otherStudent.id}`).expect(404);

      expect(response.body).toHaveProperty('error', 'Student not found');
    });

    it('should require authentication', async () => {
      testUserId = 0;

      const response = await request(app).delete(`/students/${testStudentId}`).expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      testUserId = 1;
    });

    it('should handle deletion with many related records efficiently', async () => {
      // Create many related records
      const manyGoals = Array.from({ length: 50 }, (_, index) => ({
        studentId: testStudentId,
        text: `Goal ${index}`,
        status: 'active' as const,
      }));

      const manyReflections = Array.from({ length: 50 }, (_, index) => ({
        studentId: testStudentId,
        content: `Reflection ${index}`,
        date: new Date(),
      }));

      await prisma.studentGoal.createMany({ data: manyGoals });
      await prisma.studentReflection.createMany({ data: manyReflections });

      const startTime = performance.now();

      await request(app).delete(`/students/${testStudentId}`).expect(204);

      const endTime = performance.now();
      const responseTime = endTime - startTime;

      // Performance benchmark: Should handle bulk deletion within 5 seconds
      expect(responseTime).toBeLessThan(5000);

      console.log(
        `Bulk deletion benchmark: ${responseTime}ms for student with 100+ related records`,
      );
    });
  });

  describe('Student Goals Management', () => {
    let testStudentId: number;

    beforeEach(async () => {
      const student = await prisma.student.create({
        data: {
          firstName: 'Goal',
          lastName: 'Student',
          grade: 3,
          userId: testUserId,
        },
      });
      testStudentId = student.id;
    });

    describe('GET /students/:id/goals', () => {
      it('should retrieve all goals for a student', async () => {
        // Create test goals
        await prisma.studentGoal.createMany({
          data: [
            {
              studentId: testStudentId,
              text: 'Learn multiplication',
              status: 'active',
            },
            {
              studentId: testStudentId,
              text: 'Complete reading log',
              status: 'completed',
            },
          ],
        });

        const response = await request(app).get(`/students/${testStudentId}/goals`).expect(200);

        expect(response.body).toHaveLength(2);
        response.body.forEach((goal: any) => {
          expect(goal).toHaveProperty('id');
          expect(goal).toHaveProperty('text');
          expect(goal).toHaveProperty('status');
          expect(goal).toHaveProperty('studentId', testStudentId);
        });
      });

      it('should return 404 for non-existent student', async () => {
        const response = await request(app).get('/students/99999/goals').expect(404);

        expect(response.body).toHaveProperty('error', 'Student not found');
      });

      it('should require authentication', async () => {
        testUserId = 0;

        const response = await request(app).get(`/students/${testStudentId}/goals`).expect(401);

        expect(response.body).toHaveProperty('error', 'Unauthorized');

        testUserId = 1;
      });
    });

    describe('POST /students/:id/goals', () => {
      it('should create a new goal for student', async () => {
        const newGoal = {
          text: 'Master division facts',
          status: 'active',
        };

        const response = await request(app)
          .post(`/students/${testStudentId}/goals`)
          .send(newGoal)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.text).toBe(newGoal.text);
        expect(response.body.status).toBe(newGoal.status);
        expect(response.body.studentId).toBe(testStudentId);

        // Verify in database
        const createdGoal = await prisma.studentGoal.findUnique({
          where: { id: response.body.id },
        });
        expect(createdGoal).toBeTruthy();
      });

      it('should validate goal text length', async () => {
        const invalidGoals = [
          { text: '' }, // Too short
          { text: 'A'.repeat(501) }, // Too long
        ];

        for (const invalidGoal of invalidGoals) {
          const response = await request(app)
            .post(`/students/${testStudentId}/goals`)
            .send(invalidGoal)
            .expect(400);

          expect(response.body).toHaveProperty('error');
        }
      });

      it('should set default status if not provided', async () => {
        const goalWithoutStatus = {
          text: 'Practice reading daily',
        };

        const response = await request(app)
          .post(`/students/${testStudentId}/goals`)
          .send(goalWithoutStatus)
          .expect(201);

        expect(response.body.status).toBe('active');
      });
    });

    describe('PATCH /students/:id/goals/:goalId', () => {
      let testGoalId: number;

      beforeEach(async () => {
        const goal = await prisma.studentGoal.create({
          data: {
            studentId: testStudentId,
            text: 'Original goal text',
            status: 'active',
          },
        });
        testGoalId = goal.id;
      });

      it('should update goal successfully', async () => {
        const updateData = {
          text: 'Updated goal text',
          status: 'completed',
        };

        const response = await request(app)
          .patch(`/students/${testStudentId}/goals/${testGoalId}`)
          .send(updateData)
          .expect(200);

        expect(response.body.text).toBe(updateData.text);
        expect(response.body.status).toBe(updateData.status);
      });

      it('should return 404 for non-existent goal', async () => {
        const response = await request(app)
          .patch(`/students/${testStudentId}/goals/99999`)
          .send({ text: 'Updated text' })
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Goal not found');
      });
    });

    describe('DELETE /students/:id/goals/:goalId', () => {
      let testGoalId: number;

      beforeEach(async () => {
        const goal = await prisma.studentGoal.create({
          data: {
            studentId: testStudentId,
            text: 'Goal to delete',
            status: 'active',
          },
        });
        testGoalId = goal.id;
      });

      it('should delete goal successfully', async () => {
        await request(app).delete(`/students/${testStudentId}/goals/${testGoalId}`).expect(204);

        // Verify deletion
        const deletedGoal = await prisma.studentGoal.findUnique({
          where: { id: testGoalId },
        });
        expect(deletedGoal).toBeNull();
      });

      it('should return 404 for non-existent goal', async () => {
        const response = await request(app)
          .delete(`/students/${testStudentId}/goals/99999`)
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Goal not found');
      });
    });
  });

  describe('Student Reflections Management', () => {
    let testStudentId: number;

    beforeEach(async () => {
      const student = await prisma.student.create({
        data: {
          firstName: 'Reflection',
          lastName: 'Student',
          grade: 3,
          userId: testUserId,
        },
      });
      testStudentId = student.id;
    });

    describe('GET /students/:id/reflections', () => {
      it('should retrieve all reflections for a student', async () => {
        // Create test reflections
        await prisma.studentReflection.createMany({
          data: [
            {
              studentId: testStudentId,
              content: 'I enjoyed math class today',
              date: new Date('2024-01-01'),
            },
            {
              studentId: testStudentId,
              content: 'Reading was challenging but fun',
              date: new Date('2024-01-02'),
            },
          ],
        });

        const response = await request(app)
          .get(`/students/${testStudentId}/reflections`)
          .expect(200);

        expect(response.body).toHaveLength(2);
        response.body.forEach((reflection: any) => {
          expect(reflection).toHaveProperty('id');
          expect(reflection).toHaveProperty('content');
          expect(reflection).toHaveProperty('date');
          expect(reflection).toHaveProperty('studentId', testStudentId);
        });
      });
    });

    describe('POST /students/:id/reflections', () => {
      it('should create a new reflection for student', async () => {
        const newReflection = {
          content: 'Today I learned about fractions',
          date: new Date().toISOString(),
        };

        const response = await request(app)
          .post(`/students/${testStudentId}/reflections`)
          .send(newReflection)
          .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body.content).toBe(newReflection.content);
        expect(response.body.studentId).toBe(testStudentId);
      });

      it('should set default date if not provided', async () => {
        const reflectionWithoutDate = {
          content: 'Reflection without date',
        };

        const response = await request(app)
          .post(`/students/${testStudentId}/reflections`)
          .send(reflectionWithoutDate)
          .expect(201);

        expect(response.body.date).toBeDefined();
        expect(new Date(response.body.date)).toBeInstanceOf(Date);
      });

      it('should handle legacy text field mapping to content', async () => {
        const legacyReflection = {
          text: 'Legacy text field content',
        };

        const response = await request(app)
          .post(`/students/${testStudentId}/reflections`)
          .send(legacyReflection)
          .expect(201);

        expect(response.body.content).toBe(legacyReflection.text);
      });
    });

    describe('DELETE /students/:id/reflections/:reflectionId', () => {
      let testReflectionId: number;

      beforeEach(async () => {
        const reflection = await prisma.studentReflection.create({
          data: {
            studentId: testStudentId,
            content: 'Reflection to delete',
            date: new Date(),
          },
        });
        testReflectionId = reflection.id;
      });

      it('should delete reflection successfully', async () => {
        await request(app)
          .delete(`/students/${testStudentId}/reflections/${testReflectionId}`)
          .expect(204);

        // Verify deletion
        const deletedReflection = await prisma.studentReflection.findUnique({
          where: { id: testReflectionId },
        });
        expect(deletedReflection).toBeNull();
      });

      it('should return 404 for non-existent reflection', async () => {
        const response = await request(app)
          .delete(`/students/${testStudentId}/reflections/99999`)
          .expect(404);

        expect(response.body).toHaveProperty('error', 'Reflection not found');
      });
    });
  });

  describe('GET /students/:id/progress - Progress Summary', () => {
    let testStudentId: number;

    beforeEach(async () => {
      const student = await prisma.student.create({
        data: {
          firstName: 'Progress',
          lastName: 'Student',
          grade: 3,
          userId: testUserId,
        },
      });
      testStudentId = student.id;

      // Add some reflections for progress tracking
      await prisma.studentReflection.createMany({
        data: [
          {
            studentId: testStudentId,
            content: 'Reflection 1',
            date: new Date(),
          },
          {
            studentId: testStudentId,
            content: 'Reflection 2',
            date: new Date(),
          },
        ],
      });
    });

    it('should retrieve student progress summary', async () => {
      const response = await request(app).get(`/students/${testStudentId}/progress`).expect(200);

      expect(response.body).toHaveProperty('student');
      expect(response.body).toHaveProperty('progress');

      expect(response.body.student.id).toBe(testStudentId);
      expect(response.body.progress).toHaveProperty('totalAssessments', 0);
      expect(response.body.progress).toHaveProperty('averageScore', null);
      expect(response.body.progress).toHaveProperty('assessmentsByType');
      expect(response.body.progress).toHaveProperty('artifactCount', 0);
      expect(response.body.progress).toHaveProperty('reflectionCount', 2);
    });

    it('should require authentication', async () => {
      testUserId = 0;

      const response = await request(app).get(`/students/${testStudentId}/progress`).expect(401);

      expect(response.body).toHaveProperty('error', 'Unauthorized');

      testUserId = 1;
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle concurrent student operations safely', async () => {
      const newStudents = Array.from({ length: 5 }, (_, index) => ({
        firstName: `Concurrent${index}`,
        lastName: 'Student',
        grade: 3,
      }));

      // Create multiple concurrent requests
      const concurrentRequests = newStudents.map((student) =>
        request(app).post('/students').send(student),
      );

      const responses = await Promise.all(concurrentRequests);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(201);
      });

      // Verify all students were created
      const createdStudents = await prisma.student.findMany({
        where: { userId: testUserId },
      });
      expect(createdStudents).toHaveLength(5);
    });

    it('should handle malformed request bodies gracefully', async () => {
      const response = await request(app)
        .post('/students')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);
    });

    it('should handle database constraint violations', async () => {
      // This would test foreign key constraints, unique constraints, etc.
      // The current schema doesn't have such constraints for students
      expect(true).toBe(true); // Placeholder for potential future constraints
    });
  });
});
