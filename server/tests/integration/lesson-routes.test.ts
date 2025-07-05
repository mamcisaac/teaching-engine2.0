/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import request from 'supertest';
import { describe, beforeAll, beforeEach, afterEach, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import { getIntegrationTestPrismaClient, cleanIntegrationTestData } from '../integration-test-setup';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Lesson Planning Routes', () => {
  let prisma: ReturnType<typeof getIntegrationTestPrismaClient>;
  let authToken: string;
  let userId: number;
  let testUser: unknown;
  let testLongRangePlan: unknown;
  let testUnitPlan: unknown;
  let testExpectation: unknown;
  let testLesson: unknown;
  let testDaybookEntry: unknown;

  beforeAll(async () => {
    prisma = getIntegrationTestPrismaClient();
  });

  beforeEach(async () => {
    // Clean up test data using the unified helper
    await cleanIntegrationTestData();

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
        password: hashedPassword,
        name: 'Test Teacher',
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

    // Create test curriculum data
    testExpectation = await prisma.curriculumExpectation.create({
      data: {
        code: 'TEST-5.1',
        description: 'Test expectation for lesson planning',
        descriptionFr: 'Test expectation FR',
        strand: 'Number Sense',
        substrand: 'Counting and Cardinality',
        grade: 5,
        subject: 'Mathematics',
      },
    });

    // Create test long-range plan
    testLongRangePlan = await prisma.longRangePlan.create({
      data: {
        userId,
        title: 'Mathematics Long Range Plan',
        academicYear: '2024-2025',
        grade: 5,
        subject: 'Mathematics',
      },
    });

    // Create test unit plan
    testUnitPlan = await prisma.unitPlan.create({
      data: {
        userId,
        longRangePlanId: testLongRangePlan.id,
        title: 'Fractions and Decimals Unit',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-30'),
      },
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.daybookEntry.deleteMany({});
    await prisma.lessonPlan.deleteMany({});
    await prisma.unitPlan.deleteMany({});
    await prisma.longRangePlan.deleteMany({});
    await prisma.curriculumExpectation.deleteMany({});
    await prisma.curriculumStrand.deleteMany({});
    await prisma.user.deleteMany({});
  });

  describe('ETFO Lesson Plans - GET /api/etfo/lesson-plans', () => {
    beforeEach(async () => {
      // Create test lesson plan
      testLesson = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Introduction to Fractions',
          date: new Date('2024-09-05'),
          durationMinutes: 60,
          objectives: ['Understand basic fractions', 'Identify numerator and denominator'],
          materials: ['Fraction tiles', 'Whiteboard'],
          introduction: 'Review whole numbers and introduce parts of a whole',
          mainActivity: 'Students use fraction tiles to explore fractions',
          closing: 'Exit ticket: Draw and label a fraction',
          assessment: 'Observation and exit tickets',
          differentiation: 'Visual aids for ELL students, challenge problems for advanced',
          homework: 'Complete fraction worksheet',
          reflectionNotes: 'Students engaged well with manipulatives',
          expectations: {
            connect: [{ id: testExpectation.id }],
          },
        },
      });
    });

    it('should return all lesson plans for authenticated user', async () => {
      const res = await request(app)
        .get('/api/etfo/lesson-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: testLesson.id,
        title: 'Introduction to Fractions',
        durationMinutes: 60,
        unitPlan: {
          id: testUnitPlan.id,
          title: 'Fractions and Decimals Unit',
        },
      });
    });

    it('should filter by unit plan', async () => {
      // Create another unit and lesson
      const otherUnit = await prisma.unitPlan.create({
        data: {
          userId,
          longRangePlanId: testLongRangePlan.id,
          title: 'Geometry Unit',
          startDate: new Date('2024-10-01'),
          endDate: new Date('2024-10-31'),
        },
      });

      await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: otherUnit.id,
          title: 'Introduction to Shapes',
          date: new Date('2024-10-05'),
          durationMinutes: 45,
        },
      });

      const res = await request(app)
        .get(`/api/etfo/lesson-plans?unitPlanId=${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].unitPlan.id).toBe(testUnitPlan.id);
    });

    it('should filter by date range', async () => {
      await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Fractions Review',
          date: new Date('2024-09-15'),
          durationMinutes: 45,
        },
      });

      const res = await request(app)
        .get('/api/etfo/lesson-plans?startDate=2024-09-01&endDate=2024-09-10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('Introduction to Fractions');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/etfo/lesson-plans');
      expect(res.status).toBe(401);
    });
  });

  describe('ETFO Lesson Plans - GET /api/etfo/lesson-plans/:id', () => {
    beforeEach(async () => {
      testLesson = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Fraction Operations',
          date: new Date('2024-09-10'),
          durationMinutes: 75,
          objectives: ['Add and subtract fractions', 'Find common denominators'],
          crossCurricularConnections: 'Science: measuring ingredients',
          indigenousPerspectives: 'Traditional beading patterns',
          expectations: {
            connect: [{ id: testExpectation.id }],
          },
        },
      });
    });

    it('should return a single lesson plan with all details', async () => {
      const res = await request(app)
        .get(`/api/etfo/lesson-plans/${testLesson.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: testLesson.id,
        title: 'Fraction Operations',
        durationMinutes: 75,
        crossCurricularConnections: 'Science: measuring ingredients',
        indigenousPerspectives: 'Traditional beading patterns',
        expectations: expect.arrayContaining([
          expect.objectContaining({
            id: testExpectation.id,
            code: 'TEST-5.1',
          }),
        ]),
      });
    });

    it('should return 404 for non-existent lesson', async () => {
      const res = await request(app)
        .get('/api/etfo/lesson-plans/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should not return lessons from other users', async () => {
      const otherUser = await prisma.user.create({
        data: {
          email: 'other-teacher@example.com',
          password: 'hashed',
          name: 'Other Teacher',
          role: 'teacher',
        },
      });

      const otherLesson = await prisma.lessonPlan.create({
        data: {
          userId: otherUser.id,
          unitPlanId: testUnitPlan.id,
          title: 'Private Lesson',
          date: new Date('2024-09-20'),
          durationMinutes: 60,
        },
      });

      const res = await request(app)
        .get(`/api/etfo/lesson-plans/${otherLesson.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('ETFO Lesson Plans - POST /api/etfo/lesson-plans', () => {
    it('should create a comprehensive ETFO-aligned lesson plan', async () => {
      const newLesson = {
        unitPlanId: testUnitPlan.id,
        title: 'Exploring Equivalent Fractions',
        date: '2024-09-12T00:00:00Z',
        durationMinutes: 60,
        objectives: [
          'Identify equivalent fractions',
          'Create equivalent fractions using models',
          'Apply understanding to real-world problems',
        ],
        materials: [
          'Fraction strips',
          'Grid paper',
          'Interactive whiteboard',
          'Student notebooks',
        ],
        introduction: 'Hook: Pizza slicing problem - same amount, different pieces',
        mainActivity: 'Stations: 1) Fraction strips 2) Grid drawing 3) Digital fraction tool',
        closing: 'Gallery walk of student work and reflection',
        assessment: 'Formative: observations, exit tickets. Summative: problem set',
        differentiation: 'Concrete materials for struggling, abstract challenges for advanced',
        homework: 'Find 3 examples of fractions at home',
        safetyConsiderations: 'Proper use of scissors when cutting fraction strips',
        crossCurricularConnections: 'Art: creating fraction art, Music: note values',
        indigenousPerspectives: 'Métis beadwork patterns showing fractional relationships',
        learningSkills: ['Problem Solving', 'Collaboration', 'Initiative'],
        successCriteria: [
          'I can show the same fraction in different ways',
          'I can explain why fractions are equivalent',
          'I can use models to prove equivalence',
        ],
        vocabularyFocus: ['equivalent', 'numerator', 'denominator', 'simplify'],
        resources: [
          'Fraction app: www.fractiontools.com',
          'Video: "Equivalent Fractions Song"',
          'Teacher guide page 45-48',
        ],
        accommodations: 'Extended time, visual aids, peer support for IEP students',
        extensions: 'Create a fraction puzzle for younger students',
        expectationIds: [testExpectation.id],
      };

      const res = await request(app)
        .post('/api/etfo/lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newLesson);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        title: 'Exploring Equivalent Fractions',
        durationMinutes: 60,
        objectives: expect.arrayContaining(['Identify equivalent fractions']),
        learningSkills: expect.arrayContaining(['Problem Solving']),
        vocabularyFocus: expect.arrayContaining(['equivalent']),
      });

      // Verify in database
      const created = await prisma.lessonPlan.findUnique({
        where: { id: res.body.id },
        include: { expectations: true },
      });
      expect(created).toBeTruthy();
      expect(created?.expectations).toHaveLength(1);
    });

    it('should validate required fields', async () => {
      const invalidLesson = {
        // Missing required unitPlanId and title
        date: '2024-09-12T00:00:00Z',
        durationMinutes: 60,
      };

      const res = await request(app)
        .post('/api/etfo/lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLesson);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should validate array length limits', async () => {
      const tooManyObjectives = {
        unitPlanId: testUnitPlan.id,
        title: 'Test Lesson',
        date: '2024-09-12T00:00:00Z',
        durationMinutes: 60,
        objectives: Array(11).fill('Objective'), // Max is 10
      };

      const res = await request(app)
        .post('/api/etfo/lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tooManyObjectives);

      expect(res.status).toBe(400);
    });

    it('should validate duration range', async () => {
      const invalidDuration = {
        unitPlanId: testUnitPlan.id,
        title: 'Test Lesson',
        date: '2024-09-12T00:00:00Z',
        durationMinutes: 500, // Max is 300
      };

      const res = await request(app)
        .post('/api/etfo/lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDuration);

      expect(res.status).toBe(400);
    });
  });

  describe('ETFO Lesson Plans - PUT /api/etfo/lesson-plans/:id', () => {
    beforeEach(async () => {
      testLesson = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Original Lesson',
          date: new Date('2024-09-15'),
          durationMinutes: 45,
        },
      });
    });

    it('should update lesson plan fields', async () => {
      const updateData = {
        title: 'Updated Lesson Title',
        durationMinutes: 60,
        objectives: ['New objective 1', 'New objective 2'],
        reflectionNotes: 'Lesson went very well, students were engaged',
      };

      const res = await request(app)
        .put(`/api/etfo/lesson-plans/${testLesson.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updateData);
    });

    it('should not allow updating unitPlanId', async () => {
      const otherUnit = await prisma.unitPlan.create({
        data: {
          userId,
          longRangePlanId: testLongRangePlan.id,
          title: 'Other Unit',
          startDate: new Date('2024-10-01'),
          endDate: new Date('2024-10-31'),
        },
      });

      const res = await request(app)
        .put(`/api/etfo/lesson-plans/${testLesson.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ unitPlanId: otherUnit.id });

      expect(res.status).toBe(200);

      // Verify unitPlanId didn't change
      const lesson = await prisma.lessonPlan.findUnique({
        where: { id: testLesson.id },
      });
      expect(lesson?.unitPlanId).toBe(testUnitPlan.id);
    });
  });

  describe('ETFO Lesson Plans - DELETE /api/etfo/lesson-plans/:id', () => {
    beforeEach(async () => {
      testLesson = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Lesson to Delete',
          date: new Date('2024-09-20'),
          durationMinutes: 45,
        },
      });
    });

    it('should delete a lesson plan', async () => {
      const res = await request(app)
        .delete(`/api/etfo/lesson-plans/${testLesson.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      const deleted = await prisma.lessonPlan.findUnique({
        where: { id: testLesson.id },
      });
      expect(deleted).toBeNull();
    });
  });

  describe('Daybook Entries - GET /api/daybook-entries', () => {
    beforeEach(async () => {
      testDaybookEntry = await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-05'),
          subject: 'Mathematics',
          topic: 'Introduction to Fractions',
          activities: 'Used fraction tiles, group work, exit tickets',
          homework: 'Complete worksheet pages 12-13',
          notes: 'Students struggled with equivalent fractions',
          resources: ['Fraction tiles', 'Worksheet package'],
          assessmentNotes: '3 students need extra support',
          parentCommunication: 'Sent note home about upcoming test',
          lessonPlanId: testLesson?.id,
        },
      });
    });

    it('should return all daybook entries for authenticated user', async () => {
      const res = await request(app)
        .get('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({
        id: testDaybookEntry.id,
        subject: 'Mathematics',
        topic: 'Introduction to Fractions',
      });
    });

    it('should filter by date range', async () => {
      await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-15'),
          subject: 'Science',
          topic: 'Water Cycle',
          activities: 'Experiment and discussion',
        },
      });

      const res = await request(app)
        .get('/api/daybook-entries?startDate=2024-09-01&endDate=2024-09-10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].subject).toBe('Mathematics');
    });

    it('should filter by subject', async () => {
      await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-06'),
          subject: 'Language Arts',
          topic: 'Creative Writing',
          activities: 'Story writing workshop',
        },
      });

      const res = await request(app)
        .get('/api/daybook-entries?subject=Mathematics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].subject).toBe('Mathematics');
    });
  });

  describe('Daybook Entries - POST /api/daybook-entries', () => {
    it('should create a new daybook entry', async () => {
      const newEntry = {
        date: '2024-09-08T00:00:00Z',
        subject: 'Science',
        topic: 'States of Matter',
        activities: 'Experiment: melting ice, observing water vapor',
        homework: 'Draw and label the water cycle',
        notes: 'Great engagement during hands-on experiment',
        resources: ['Ice cubes', 'Hot plate', 'Science journals'],
        assessmentNotes: 'Most students can identify 3 states of matter',
        parentCommunication: 'Newsletter sent about science fair',
        reflections: 'Need more time for discussion next class',
        nextSteps: 'Review states of matter, introduce changes',
      };

      const res = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newEntry);

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        subject: 'Science',
        topic: 'States of Matter',
        activities: expect.stringContaining('melting ice'),
      });
    });

    it('should link to existing lesson plan', async () => {
      const lesson = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'States of Matter Lesson',
          date: new Date('2024-09-08'),
          durationMinutes: 60,
        },
      });

      const newEntry = {
        date: '2024-09-08T00:00:00Z',
        subject: 'Science',
        topic: 'States of Matter',
        activities: 'As per lesson plan',
        lessonPlanId: lesson.id,
      };

      const res = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newEntry);

      expect(res.status).toBe(201);
      expect(res.body.lessonPlanId).toBe(lesson.id);
    });

    it('should validate required fields', async () => {
      const invalidEntry = {
        // Missing date and subject
        topic: 'Some topic',
      };

      const res = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidEntry);

      expect(res.status).toBe(400);
    });
  });

  describe('Daybook Entries - PUT /api/daybook-entries/:id', () => {
    beforeEach(async () => {
      testDaybookEntry = await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-10'),
          subject: 'Art',
          topic: 'Color Theory',
          activities: 'Primary color mixing',
        },
      });
    });

    it('should update daybook entry', async () => {
      const updateData = {
        activities: 'Primary and secondary color mixing',
        notes: 'Students loved the hands-on mixing',
        assessmentNotes: 'All students can identify primary colors',
      };

      const res = await request(app)
        .put(`/api/daybook-entries/${testDaybookEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updateData);
    });
  });

  describe('Daybook Entries - DELETE /api/daybook-entries/:id', () => {
    beforeEach(async () => {
      testDaybookEntry = await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-12'),
          subject: 'Music',
          topic: 'Rhythm Basics',
          activities: 'Clapping patterns',
        },
      });
    });

    it('should delete a daybook entry', async () => {
      const res = await request(app)
        .delete(`/api/daybook-entries/${testDaybookEntry.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      const deleted = await prisma.daybookEntry.findUnique({
        where: { id: testDaybookEntry.id },
      });
      expect(deleted).toBeNull();
    });
  });

  describe('Progress Tracking - GET /api/etfo/progress', () => {
    beforeEach(async () => {
      // Create multiple lessons with different completion states
      const lesson1 = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Lesson 1',
          date: new Date('2024-09-01'),
          durationMinutes: 60,
          isCompleted: true,
          expectations: {
            connect: [{ id: testExpectation.id }],
          },
        },
      });

      const lesson2 = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Lesson 2',
          date: new Date('2024-09-05'),
          durationMinutes: 45,
          isCompleted: false,
        },
      });

      // Create daybook entries
      await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-01'),
          subject: 'Mathematics',
          topic: 'Lesson 1 Topic',
          activities: 'Completed activities',
          lessonPlanId: lesson1.id,
        },
      });
    });

    it('should return progress statistics', async () => {
      const res = await request(app)
        .get('/api/etfo/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        totalLessons: 2,
        completedLessons: 1,
        completionRate: 50,
        daybookEntries: 1,
        coveredExpectations: 1,
      });
    });

    it('should filter progress by date range', async () => {
      const res = await request(app)
        .get('/api/etfo/progress?startDate=2024-09-01&endDate=2024-09-03')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        totalLessons: 1,
        completedLessons: 1,
        completionRate: 100,
      });
    });

    it('should filter progress by unit plan', async () => {
      const res = await request(app)
        .get(`/api/etfo/progress?unitPlanId=${testUnitPlan.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalLessons).toBe(2);
    });
  });

  describe('Recent Plans - GET /api/recent-plans', () => {
    beforeEach(async () => {
      // Create various plans with different update times
      await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Recent Lesson',
          date: new Date('2024-09-20'),
          durationMinutes: 60,
          updatedAt: new Date('2024-09-15T10:00:00Z'),
        },
      });

      await prisma.unitPlan.update({
        where: { id: testUnitPlan.id },
        data: { updatedAt: new Date('2024-09-14T10:00:00Z') },
      });

      await prisma.longRangePlan.update({
        where: { id: testLongRangePlan.id },
        data: { updatedAt: new Date('2024-09-13T10:00:00Z') },
      });
    });

    it('should return recently updated plans', async () => {
      const res = await request(app)
        .get('/api/recent-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('lessonPlans');
      expect(res.body).toHaveProperty('unitPlans');
      expect(res.body).toHaveProperty('longRangePlans');
      expect(res.body.lessonPlans.length).toBeGreaterThan(0);
    });

    it('should limit number of returned plans', async () => {
      // Create many plans
      for (let i = 0; i < 15; i++) {
        await prisma.lessonPlan.create({
          data: {
            userId,
            unitPlanId: testUnitPlan.id,
            title: `Lesson ${i}`,
            date: new Date(`2024-09-${20 + i}`),
            durationMinutes: 45,
          },
        });
      }

      const res = await request(app)
        .get('/api/recent-plans?limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.lessonPlans.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Batch Operations', () => {
    it('should batch create multiple lesson plans', async () => {
      const lessons = [
        {
          unitPlanId: testUnitPlan.id,
          title: 'Batch Lesson 1',
          date: '2024-09-25T00:00:00Z',
          durationMinutes: 45,
        },
        {
          unitPlanId: testUnitPlan.id,
          title: 'Batch Lesson 2',
          date: '2024-09-26T00:00:00Z',
          durationMinutes: 45,
        },
        {
          unitPlanId: testUnitPlan.id,
          title: 'Batch Lesson 3',
          date: '2024-09-27T00:00:00Z',
          durationMinutes: 45,
        },
      ];

      const res = await request(app)
        .post('/api/etfo/lesson-plans/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ lessons });

      expect(res.status).toBe(201);
      expect(res.body.created).toBe(3);
      expect(res.body.lessons).toHaveLength(3);
    });

    it('should batch update multiple lesson plans', async () => {
      // Create lessons to update
      const lesson1 = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Update Me 1',
          date: new Date('2024-09-28'),
          durationMinutes: 30,
        },
      });

      const lesson2 = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Update Me 2',
          date: new Date('2024-09-29'),
          durationMinutes: 30,
        },
      });

      const updates = [
        {
          id: lesson1.id,
          isCompleted: true,
          reflectionNotes: 'Went well',
        },
        {
          id: lesson2.id,
          isCompleted: true,
          reflectionNotes: 'Need to revisit',
        },
      ];

      const res = await request(app)
        .put('/api/etfo/lesson-plans/batch')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ updates });

      expect(res.status).toBe(200);
      expect(res.body.updated).toBe(2);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid date formats', async () => {
      const invalidLesson = {
        unitPlanId: testUnitPlan.id,
        title: 'Invalid Date Lesson',
        date: 'not-a-date',
        durationMinutes: 60,
      };

      const res = await request(app)
        .post('/api/etfo/lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLesson);

      expect(res.status).toBe(400);
    });

    it('should handle database constraint violations', async () => {
      // Try to create lesson with non-existent unit plan
      const invalidLesson = {
        unitPlanId: 'non-existent-id',
        title: 'Orphan Lesson',
        date: '2024-09-30T00:00:00Z',
        durationMinutes: 60,
      };

      const res = await request(app)
        .post('/api/etfo/lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLesson);

      expect(res.status).toBe(400);
    });

    it('should handle concurrent updates gracefully', async () => {
      const lesson = await prisma.lessonPlan.create({
        data: {
          userId,
          unitPlanId: testUnitPlan.id,
          title: 'Concurrent Update Test',
          date: new Date('2024-09-30'),
          durationMinutes: 45,
        },
      });

      // Simulate concurrent updates
      const update1 = request(app)
        .put(`/api/etfo/lesson-plans/${lesson.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Update 1' });

      const update2 = request(app)
        .put(`/api/etfo/lesson-plans/${lesson.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Update 2' });

      const [res1, res2] = await Promise.all([update1, update2]);

      // Both should succeed, last one wins
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });
  });
});