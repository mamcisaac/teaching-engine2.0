/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * TDD Integration Test - Complete Teacher Workflow
 * Tests end-to-end user scenarios with real database and services
 */

import {
  getIntegrationTestClient,
  seedIntegrationTestData,
  cleanIntegrationTestData,
} from '../setup/tdd-integration-setup';
import { createTestApp } from '../utils/tdd-test-utilities';
import request from 'supertest';
import { Express } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Complete Teacher Workflow - Integration Tests', () => {
  let app: Express;
  let client: unknown;
  let teacherToken: string;
  let teacher: unknown;

  beforeAll(async () => {
    app = await createTestApp();
    client = getIntegrationTestClient();
  });

  beforeEach(async () => {
    await cleanIntegrationTestData();
    
    // Create teacher user
    const hashedPassword = await bcrypt.hash('TeacherPass123!', 10);
    teacher = await client.user.create({
      data: {
        email: 'teacher@workflow.test',
        password: hashedPassword,
        name: 'Ms. Teacher',
        role: 'USER',
      },
    });

    teacherToken = jwt.sign(
      { userId: teacher.id, email: teacher.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  describe('Complete Planning Workflow', () => {
    it('should support full lesson planning lifecycle', async () => {
      // 1. Teacher logs in
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'teacher@workflow.test',
          password: 'TeacherPass123!',
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.user.email).toBe('teacher@workflow.test');
      const token = loginResponse.body.token;

      // 2. Teacher creates a long-range plan
      const longRangePlanResponse = await request(app)
        .post('/api/long-range-plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Fall Mathematics Program',
          subject: 'Mathematics',
          grade: 5,
          startDate: '2024-09-01',
          endDate: '2024-12-20',
          description: 'Complete fall mathematics curriculum',
        });

      expect(longRangePlanResponse.status).toBe(201);
      const longRangePlan = longRangePlanResponse.body;
      expect(longRangePlan.title).toBe('Fall Mathematics Program');

      // 3. Teacher creates curriculum expectations
      const expectationResponse = await request(app)
        .post('/api/curriculum-expectations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: 'MATH.5.NBT.1',
          description: 'Understand place value system',
          subject: 'Mathematics',
          grade: 5,
          strand: 'Number and Operations in Base Ten',
        });

      expect(expectationResponse.status).toBe(201);
      const expectation = expectationResponse.body;

      // 4. Teacher creates a unit plan
      const unitPlanResponse = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Place Value and Number Sense',
          subject: 'Mathematics',
          grade: 5,
          startDate: '2024-09-01',
          endDate: '2024-09-30',
          longRangePlanId: longRangePlan.id,
          expectationIds: [expectation.id],
        });

      expect(unitPlanResponse.status).toBe(201);
      const unitPlan = unitPlanResponse.body;

      // 5. Teacher creates an ETFO lesson plan
      const lessonPlanResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Introduction to Place Value',
          subject: 'Mathematics',
          grade: 5,
          date: '2024-09-05',
          duration: 60,
          unitPlanId: unitPlan.id,
          threePartLesson: {
            minds_on: 'Show large numbers on board, ask students what they notice',
            action: 'Use base-10 blocks to build numbers and identify place values',
            consolidation: 'Students share what they learned about place value',
          },
          learningGoals: ['Understand that each digit position has a value'],
          successCriteria: ['I can identify the value of digits in different positions'],
          materials: ['Base-10 blocks', 'Place value charts', 'Whiteboard'],
          expectationIds: [expectation.id],
        });

      expect(lessonPlanResponse.status).toBe(201);
      const lessonPlan = lessonPlanResponse.body;

      // 6. Verify complete hierarchy exists in database
      const dbLongRangePlan = await client.longRangePlan.findUnique({
        where: { id: longRangePlan.id },
        include: {
          unitPlans: {
            include: {
              eTFOLessonPlans: {
                include: {
                  expectations: {
                    include: {
                      expectation: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      expect(dbLongRangePlan).toBeTruthy();
      expect(dbLongRangePlan.unitPlans).toHaveLength(1);
      expect(dbLongRangePlan.unitPlans[0].eTFOLessonPlans).toHaveLength(1);
      expect(dbLongRangePlan.unitPlans[0].eTFOLessonPlans[0].expectations).toHaveLength(1);

      // 7. Teacher retrieves all their plans
      const plansResponse = await request(app)
        .get('/api/long-range-plans')
        .set('Authorization', `Bearer ${token}`);

      expect(plansResponse.status).toBe(200);
      expect(plansResponse.body).toHaveLength(1);
      expect(plansResponse.body[0].id).toBe(longRangePlan.id);
    });
  });

  describe('Student Management Workflow', () => {
    it('should support complete student data management', async () => {
      // 1. Teacher adds students
      const student1Response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          firstName: 'Emma',
          lastName: 'Johnson',
          grade: 5,
        });

      const student2Response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          firstName: 'Liam',
          lastName: 'Smith',
          grade: 5,
        });

      expect(student1Response.status).toBe(201);
      expect(student2Response.status).toBe(201);

      const student1 = student1Response.body;
      const student2 = student2Response.body;

      // 2. Teacher creates assignments/activities for students
      const activityResponse = await request(app)
        .post('/api/activities')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Place Value Practice',
          description: 'Practice identifying place values',
          instructions: 'Complete the place value worksheet',
          materials: ['Worksheet', 'Pencil'],
          assessmentCriteria: 'Accuracy in identifying place values',
          subject: 'Mathematics',
          grade: 5,
          duration: 30,
          activityType: 'practice',
        });

      expect(activityResponse.status).toBe(201);
      const activity = activityResponse.body;

      // 3. Teacher tracks student progress
      const progressResponse1 = await request(app)
        .post('/api/student-progress')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: student1.id,
          activityId: activity.id,
          status: 'COMPLETED',
          score: 85,
          notes: 'Good understanding, needs practice with larger numbers',
        });

      const progressResponse2 = await request(app)
        .post('/api/student-progress')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          studentId: student2.id,
          activityId: activity.id,
          status: 'IN_PROGRESS',
          score: null,
          notes: 'Working through the problems methodically',
        });

      expect(progressResponse1.status).toBe(201);
      expect(progressResponse2.status).toBe(201);

      // 4. Teacher retrieves class overview
      const classOverviewResponse = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${teacherToken}`)
        .query({ includeProgress: true });

      expect(classOverviewResponse.status).toBe(200);
      expect(classOverviewResponse.body).toHaveLength(2);

      // Should include progress data
      const studentsWithProgress = classOverviewResponse.body;
      expect(studentsWithProgress.find((s: unknown) => s.id === student1.id)).toBeTruthy();
      expect(studentsWithProgress.find((s: unknown) => s.id === student2.id)).toBeTruthy();
    });
  });

  describe('AI-Assisted Planning Workflow', () => {
    it('should support AI-generated content integration', async () => {
      // 1. Create curriculum expectation
      const expectation = await client.curriculumExpectation.create({
        data: {
          code: 'SCI.5.ESS.1',
          description: 'Develop a model of Earth system interactions',
          subject: 'Science',
          grade: 5,
          strand: 'Earth and Space Sciences',
        },
      });

      // 2. Teacher requests AI-generated activity
      const aiActivityResponse = await request(app)
        .post('/api/ai/generate-activity')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          subject: 'Science',
          grade: 5,
          expectations: [expectation.id],
          activityType: 'investigation',
          duration: 45,
          additionalContext: 'Focus on local ecosystem',
        });

      expect(aiActivityResponse.status).toBe(200);
      const aiActivity = aiActivityResponse.body;
      expect(aiActivity.title).toBeTruthy();
      expect(aiActivity.subject).toBe('Science');
      expect(aiActivity.activityType).toBe('investigation');

      // 3. Teacher modifies and saves the AI-generated activity
      const modifiedActivityResponse = await request(app)
        .put(`/api/activities/${aiActivity.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          ...aiActivity,
          title: `${aiActivity.title} - Modified`,
          materials: [...aiActivity.materials, 'Magnifying glasses'],
        });

      expect(modifiedActivityResponse.status).toBe(200);
      expect(modifiedActivityResponse.body.title).toContain('Modified');

      // 4. Teacher generates lesson plan incorporating the activity
      const aiLessonResponse = await request(app)
        .post('/api/ai/generate-lesson-plan')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          subject: 'Science',
          grade: 5,
          title: 'Earth System Interactions',
          activityIds: [aiActivity.id],
          expectations: [expectation.id],
          duration: 60,
        });

      expect(aiLessonResponse.status).toBe(200);
      const aiLesson = aiLessonResponse.body;
      expect(aiLesson.threePartLesson).toBeTruthy();
      expect(aiLesson.threePartLesson.minds_on).toBeTruthy();
      expect(aiLesson.threePartLesson.action).toBeTruthy();
      expect(aiLesson.threePartLesson.consolidation).toBeTruthy();

      // 5. Verify the AI-generated content is properly linked
      const savedLesson = await client.eTFOLessonPlan.findUnique({
        where: { id: aiLesson.id },
        include: {
          activities: true,
          expectations: true,
        },
      });

      expect(savedLesson).toBeTruthy();
      expect(savedLesson.activities).toHaveLength(1);
      expect(savedLesson.expectations).toHaveLength(1);
    });
  });

  describe('Calendar and Scheduling Workflow', () => {
    it('should support complete calendar management', async () => {
      // 1. Teacher creates calendar events
      const lessonEventResponse = await request(app)
        .post('/api/calendar-events')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Math Lesson - Place Value',
          start: '2024-09-05T09:00:00Z',
          end: '2024-09-05T10:00:00Z',
          type: 'LESSON',
          description: 'Introduction to place value concepts',
        });

      const meetingEventResponse = await request(app)
        .post('/api/calendar-events')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Parent-Teacher Conference',
          start: '2024-09-06T15:00:00Z',
          end: '2024-09-06T15:30:00Z',
          type: 'MEETING',
          description: 'Meeting with Emma Johnson\'s parents',
        });

      expect(lessonEventResponse.status).toBe(201);
      expect(meetingEventResponse.status).toBe(201);

      // 2. Teacher retrieves calendar view
      const calendarResponse = await request(app)
        .get('/api/calendar-events')
        .set('Authorization', `Bearer ${teacherToken}`)
        .query({
          start: '2024-09-01',
          end: '2024-09-30',
        });

      expect(calendarResponse.status).toBe(200);
      expect(calendarResponse.body).toHaveLength(2);

      // 3. Teacher updates an event
      const updateEventResponse = await request(app)
        .put(`/api/calendar-events/${lessonEventResponse.body.id}`)
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          title: 'Math Lesson - Advanced Place Value',
          start: '2024-09-05T09:00:00Z',
          end: '2024-09-05T10:30:00Z', // Extended duration
          type: 'LESSON',
        });

      expect(updateEventResponse.status).toBe(200);
      expect(updateEventResponse.body.title).toBe('Math Lesson - Advanced Place Value');
      expect(updateEventResponse.body.end).toBe('2024-09-05T10:30:00Z');

      // 4. Verify database consistency
      const dbEvents = await client.calendarEvent.findMany({
        where: { userId: teacher.id },
        orderBy: { start: 'asc' },
      });

      expect(dbEvents).toHaveLength(2);
      expect(dbEvents[0].title).toBe('Math Lesson - Advanced Place Value');
    });
  });

  describe('Performance with Realistic Data Volumes', () => {
    it('should handle realistic teacher workload efficiently', async () => {
      // Create realistic data volumes
      const startTime = Date.now();

      // Create 30 students (typical class size)
      const students = await Promise.all(
        Array.from({ length: 30 }, (_, i) =>
          client.student.create({
            data: {
              firstName: `Student${i + 1}`,
              lastName: 'Test',
              grade: 5,
              userId: teacher.id,
            },
          })
        )
      );

      // Create 50 curriculum expectations (full curriculum)
      const expectations = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          client.curriculumExpectation.create({
            data: {
              code: `CURR.5.${i + 1}`,
              description: `Curriculum expectation ${i + 1}`,
              subject: i < 25 ? 'Mathematics' : 'Science',
              grade: 5,
              strand: `Strand ${(i % 5) + 1}`,
            },
          })
        )
      );

      // Create 5 long-range plans (year's worth)
      const longRangePlans = await Promise.all(
        Array.from({ length: 5 }, (_, i) =>
          client.longRangePlan.create({
            data: {
              title: `Long Range Plan ${i + 1}`,
              subject: i < 3 ? 'Mathematics' : 'Science',
              grade: 5,
              startDate: new Date(`2024-0${i + 1}-01`),
              endDate: new Date(`2024-0${i + 2}-01`),
              userId: teacher.id,
            },
          })
        )
      );

      // Create 20 unit plans
      const unitPlans = await Promise.all(
        Array.from({ length: 20 }, (_, i) =>
          client.unitPlan.create({
            data: {
              title: `Unit Plan ${i + 1}`,
              subject: i < 10 ? 'Mathematics' : 'Science',
              grade: 5,
              startDate: new Date(`2024-09-${i + 1}`),
              endDate: new Date(`2024-09-${i + 5}`),
              longRangePlanId: longRangePlans[i % 5].id,
              userId: teacher.id,
            },
          })
        )
      );

      // Create 100 lesson plans (semester's worth)
      const lessonPlans = await Promise.all(
        Array.from({ length: 100 }, (_, i) =>
          client.eTFOLessonPlan.create({
            data: {
              title: `Lesson ${i + 1}`,
              subject: i < 50 ? 'Mathematics' : 'Science',
              grade: 5,
              date: new Date(`2024-09-${(i % 20) + 1}`),
              duration: 60,
              threePartLesson: {
                minds_on: `Minds on activity ${i + 1}`,
                action: `Main activity ${i + 1}`,
                consolidation: `Consolidation ${i + 1}`,
              },
              learningGoals: [`Goal ${i + 1}`],
              successCriteria: [`Criteria ${i + 1}`],
              materials: [`Material ${i + 1}`],
              unitPlanId: unitPlans[i % 20].id,
              userId: teacher.id,
            },
          })
        )
      );

      const setupTime = Date.now() - startTime;
      console.log(`Created realistic data volume in ${setupTime}ms`);

      // Test performance of common operations
      const queryStartTime = Date.now();

      // Teacher dashboard query (typical complex query)
      const dashboardResponse = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(dashboardResponse.status).toBe(200);

      const queryTime = Date.now() - queryStartTime;
      console.log(`Dashboard query completed in ${queryTime}ms`);

      // Should complete within reasonable time
      expect(queryTime).toBeLessThan(2000); // 2 seconds max

      // Verify data integrity
      expect(dashboardResponse.body.students).toHaveLength(30);
      expect(dashboardResponse.body.recentLessons).toBeDefined();
      expect(dashboardResponse.body.upcomingEvents).toBeDefined();
    });
  });

  describe('Concurrent User Operations', () => {
    it('should handle multiple teachers working simultaneously', async () => {
      // Create second teacher
      const hashedPassword = await bcrypt.hash('Teacher2Pass123!', 10);
      const teacher2 = await client.user.create({
        data: {
          email: 'teacher2@workflow.test',
          password: hashedPassword,
          name: 'Mr. Teacher2',
          role: 'USER',
        },
      });

      const teacher2Token = jwt.sign(
        { userId: teacher2.id, email: teacher2.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Both teachers create plans simultaneously
      const [teacher1Plan, teacher2Plan] = await Promise.all([
        request(app)
          .post('/api/long-range-plans')
          .set('Authorization', `Bearer ${teacherToken}`)
          .send({
            title: 'Teacher 1 Math Plan',
            subject: 'Mathematics',
            grade: 5,
            startDate: '2024-09-01',
            endDate: '2024-12-20',
          }),
        request(app)
          .post('/api/long-range-plans')
          .set('Authorization', `Bearer ${teacher2Token}`)
          .send({
            title: 'Teacher 2 Science Plan',
            subject: 'Science',
            grade: 4,
            startDate: '2024-09-01',
            endDate: '2024-12-20',
          }),
      ]);

      expect(teacher1Plan.status).toBe(201);
      expect(teacher2Plan.status).toBe(201);

      // Plans should be isolated by user
      expect(teacher1Plan.body.userId).toBe(teacher.id);
      expect(teacher2Plan.body.userId).toBe(teacher2.id);

      // Each teacher should only see their own plans
      const [teacher1Plans, teacher2Plans] = await Promise.all([
        request(app)
          .get('/api/long-range-plans')
          .set('Authorization', `Bearer ${teacherToken}`),
        request(app)
          .get('/api/long-range-plans')
          .set('Authorization', `Bearer ${teacher2Token}`),
      ]);

      expect(teacher1Plans.body).toHaveLength(1);
      expect(teacher2Plans.body).toHaveLength(1);
      expect(teacher1Plans.body[0].id).toBe(teacher1Plan.body.id);
      expect(teacher2Plans.body[0].id).toBe(teacher2Plan.body.id);
    });
  });
});