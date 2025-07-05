/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';
import { ETFOTestHelpers } from './helpers/etfo-helpers';

describe('ETFO Lesson Plans - Comprehensive CRUD Tests', () => {
  let authToken: string;
  let unauthorizedToken: string;
  let userId: number;
  let unauthorizedUserId: number;
  let testEmail: string;
  let unauthorizedEmail: string;
  let helpers: ETFOTestHelpers;
  let unauthorizedHelpers: ETFOTestHelpers;

  beforeAll(async () => {
    // Create primary test user
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const timestamp = Date.now();
    testEmail = `etfo-lesson-test-${timestamp}@example.com`;
    unauthorizedEmail = `etfo-lesson-unauthorized-${timestamp}@example.com`;

    // Clean up any existing users
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, unauthorizedEmail] } },
    });

    // Create primary test user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'ETFO Lesson Tester',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
    userId = user.id;

    // Create unauthorized user
    const unauthorizedUser = await prisma.user.create({
      data: {
        email: unauthorizedEmail,
        password: hashedPassword,
        name: 'Unauthorized User',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
    unauthorizedUserId = unauthorizedUser.id;

    // Ensure the transaction is committed
    await prisma.$disconnect();
    await prisma.$connect();

    // Login primary user
    const loginResponse = await request(app).post('/api/login').send({
      email: testEmail,
      password: 'testpassword123',
    });
    authToken = loginResponse.body.accessToken;

    // Login unauthorized user
    const unauthorizedLoginResponse = await request(app).post('/api/login').send({
      email: unauthorizedEmail,
      password: 'testpassword123',
    });
    unauthorizedToken = unauthorizedLoginResponse.body.accessToken;

    // Initialize helpers
    helpers = new ETFOTestHelpers(authToken);
    unauthorizedHelpers = new ETFOTestHelpers(unauthorizedToken);
  });

  afterAll(async () => {
    // Clean up test data in reverse dependency order
    if (userId) {
      try {
        await prisma.daybookEntryExpectation.deleteMany({
          where: { daybookEntry: { userId } },
        });
        await prisma.daybookEntry.deleteMany({ where: { userId } });

        await prisma.eTFOLessonPlanExpectation.deleteMany({
          where: { lessonPlan: { userId } },
        });
        await prisma.eTFOLessonPlanResource.deleteMany({
          where: { lessonPlan: { userId } },
        });
        await prisma.eTFOLessonPlan.deleteMany({ where: { userId } });

        await prisma.unitPlanExpectation.deleteMany({
          where: { unitPlan: { userId } },
        });
        await prisma.unitPlanResource.deleteMany({
          where: { unitPlan: { userId } },
        });
        await prisma.unitPlan.deleteMany({ where: { userId } });

        await prisma.longRangePlanExpectation.deleteMany({
          where: { longRangePlan: { userId } },
        });
        await prisma.longRangePlan.deleteMany({ where: { userId } });

        await prisma.curriculumExpectation.deleteMany({
          where: { import: { userId } },
        });
        await prisma.curriculumImport.deleteMany({ where: { userId } });

        await prisma.user.delete({ where: { id: userId } });
      } catch (_error) {
        console.warn('Failed to delete primary user test data:', error);
      }
    }

    if (unauthorizedUserId) {
      try {
        await prisma.daybookEntryExpectation.deleteMany({
          where: { daybookEntry: { userId: unauthorizedUserId } },
        });
        await prisma.daybookEntry.deleteMany({ where: { userId: unauthorizedUserId } });

        await prisma.eTFOLessonPlanExpectation.deleteMany({
          where: { lessonPlan: { userId: unauthorizedUserId } },
        });
        await prisma.eTFOLessonPlanResource.deleteMany({
          where: { lessonPlan: { userId: unauthorizedUserId } },
        });
        await prisma.eTFOLessonPlan.deleteMany({ where: { userId: unauthorizedUserId } });

        await prisma.unitPlanExpectation.deleteMany({
          where: { unitPlan: { userId: unauthorizedUserId } },
        });
        await prisma.unitPlanResource.deleteMany({
          where: { unitPlan: { userId: unauthorizedUserId } },
        });
        await prisma.unitPlan.deleteMany({ where: { userId: unauthorizedUserId } });

        await prisma.longRangePlanExpectation.deleteMany({
          where: { longRangePlan: { userId: unauthorizedUserId } },
        });
        await prisma.longRangePlan.deleteMany({ where: { userId: unauthorizedUserId } });

        await prisma.curriculumExpectation.deleteMany({
          where: { import: { userId: unauthorizedUserId } },
        });
        await prisma.curriculumImport.deleteMany({ where: { userId: unauthorizedUserId } });

        await prisma.user.delete({ where: { id: unauthorizedUserId } });
      } catch (_error) {
        console.warn('Failed to delete unauthorized user test data:', error);
      }
    }

    await prisma.$disconnect();
  });

  describe('CREATE (POST /api/etfo-lesson-plans)', () => {
    test('should create a comprehensive ETFO lesson plan with all fields', async () => {
      const expectationId = await helpers.createExpectation('COMPREHENSIVE');
      const longRangePlanId = await helpers.createLongRangePlan('Comprehensive Test Plan', [expectationId]);
      const unitPlanId = await helpers.createUnitPlan('Comprehensive Test Unit', longRangePlanId, [expectationId]);

      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Comprehensive ETFO Lesson',
          titleFr: 'Leçon ETFO Complète',
          unitPlanId,
          date: '2024-09-15T09:00:00Z',
          duration: 60,
          mindsOn: 'Students will reflect on what they know about numbers',
          mindsOnFr: 'Les étudiants réfléchiront sur ce qu\'ils savent des nombres',
          action: 'Students will explore number patterns through manipulatives',
          actionFr: 'Les étudiants exploreront les modèles numériques avec des manipulatifs',
          consolidation: 'Students will share their discoveries and create a class chart',
          consolidationFr: 'Les étudiants partageront leurs découvertes et créeront un graphique de classe',
          learningGoals: 'Students will identify patterns in numbers 1-20',
          learningGoalsFr: 'Les étudiants identifieront les modèles dans les nombres 1-20',
          materials: ['counting bears', 'number cards', 'chart paper', 'markers'],
          grouping: 'pairs',
          accommodations: ['visual number line', 'extra time for responses'],
          modifications: ['use numbers 1-10 instead of 1-20'],
          extensions: ['explore patterns beyond 20'],
          assessmentType: 'formative',
          assessmentNotes: 'Observe student explanations and peer interactions',
          isSubFriendly: true,
          subNotes: 'Materials are in the math center. Students are familiar with this routine.',
          expectationIds: [expectationId],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Comprehensive ETFO Lesson');
      expect(response.body.titleFr).toBe('Leçon ETFO Complète');
      expect(response.body.mindsOn).toBe('Students will reflect on what they know about numbers');
      expect(response.body.action).toBe('Students will explore number patterns through manipulatives');
      expect(response.body.consolidation).toBe('Students will share their discoveries and create a class chart');
      expect(response.body.learningGoals).toBe('Students will identify patterns in numbers 1-20');
      expect(response.body.materials).toEqual(['counting bears', 'number cards', 'chart paper', 'markers']);
      expect(response.body.grouping).toBe('pairs');
      expect(response.body.accommodations).toEqual(['visual number line', 'extra time for responses']);
      expect(response.body.modifications).toEqual(['use numbers 1-10 instead of 1-20']);
      expect(response.body.extensions).toEqual(['explore patterns beyond 20']);
      expect(response.body.assessmentType).toBe('formative');
      expect(response.body.assessmentNotes).toBe('Observe student explanations and peer interactions');
      expect(response.body.isSubFriendly).toBe(true);
      expect(response.body.subNotes).toBe('Materials are in the math center. Students are familiar with this routine.');
      expect(response.body.expectations).toHaveLength(1);
      expect(response.body.expectations[0].expectationId).toBe(expectationId);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
          duration: 45,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors || response.body.error || response.body.message).toBeDefined();
    });

    test('should validate assessment type enum', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('ASSESSMENT_ENUM');

      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Assessment Type Test',
          unitPlanId,
          date: '2024-09-15T09:00:00Z',
          duration: 30,
          assessmentType: 'invalid_type',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors || response.body.error || response.body.message).toBeDefined();
    });

    test('should reject invalid expectation IDs', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('INVALID_EXPECTATION');

      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Expectation Test',
          unitPlanId,
          date: '2024-09-15T09:00:00Z',
          duration: 30,
          expectationIds: ['invalid-expectation-id'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('curriculum expectations not found');
    });

    test('should reject unauthorized unit plan access', async () => {
      const { unitPlanId } = await unauthorizedHelpers.createCompleteHierarchy('UNAUTHORIZED_UNIT');

      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Unauthorized Unit Test',
          unitPlanId,
          date: '2024-09-15T09:00:00Z',
          duration: 30,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Unit plan not found');
    });
  });

  describe('READ (GET /api/etfo-lesson-plans)', () => {
    test('should get all lesson plans for authenticated user', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('READ_ALL');
      
      // Create multiple lesson plans
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'First Lesson',
          unitPlanId,
          date: '2024-09-15T09:00:00Z',
          duration: 30,
          isSubFriendly: true,
        });

      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Second Lesson',
          unitPlanId,
          date: '2024-09-16T09:00:00Z',
          duration: 45,
          isSubFriendly: false,
        });

      const response = await request(app)
        .get('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      
      // Check that lesson plans are ordered by date
      const firstLesson = response.body.find(lesson => lesson.title === 'First Lesson');
      const secondLesson = response.body.find(lesson => lesson.title === 'Second Lesson');
      expect(firstLesson).toBeDefined();
      expect(secondLesson).toBeDefined();
      expect(new Date(firstLesson.date).getTime()).toBeLessThan(new Date(secondLesson.date).getTime());
    });

    test('should filter by date range', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('DATE_FILTER');
      
      // Create lesson within date range
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Within Range',
          unitPlanId,
          date: '2024-09-20T09:00:00Z',
          duration: 30,
        });

      // Create lesson outside date range
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Outside Range',
          unitPlanId,
          date: '2024-10-01T09:00:00Z',
          duration: 30,
        });

      const response = await request(app)
        .get('/api/etfo-lesson-plans?startDate=2024-09-15&endDate=2024-09-25')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      const withinRange = response.body.find(lesson => lesson.title === 'Within Range');
      const outsideRange = response.body.find(lesson => lesson.title === 'Outside Range');
      
      expect(withinRange).toBeDefined();
      expect(outsideRange).toBeUndefined();
    });

    test('should filter by sub-friendly status', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('SUB_FILTER');
      
      // Create sub-friendly lesson
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Sub Friendly',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
          isSubFriendly: true,
        });

      // Create non-sub-friendly lesson
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Not Sub Friendly',
          unitPlanId,
          date: '2024-09-19T09:00:00Z',
          duration: 30,
          isSubFriendly: false,
        });

      const response = await request(app)
        .get('/api/etfo-lesson-plans?isSubFriendly=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      const subFriendly = response.body.find(lesson => lesson.title === 'Sub Friendly');
      const notSubFriendly = response.body.find(lesson => lesson.title === 'Not Sub Friendly');
      
      expect(subFriendly).toBeDefined();
      expect(notSubFriendly).toBeUndefined();
    });

    test('should filter by unit plan', async () => {
      const expectationId = await helpers.createExpectation('UNIT_FILTER');
      const longRangePlanId = await helpers.createLongRangePlan('Unit Filter Test', [expectationId]);
      const unitPlan1Id = await helpers.createUnitPlan('Unit 1', longRangePlanId, [expectationId]);
      const unitPlan2Id = await helpers.createUnitPlan('Unit 2', longRangePlanId, [expectationId]);
      
      // Create lessons in different units
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Unit 1 Lesson',
          unitPlanId: unitPlan1Id,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Unit 2 Lesson',
          unitPlanId: unitPlan2Id,
          date: '2024-09-19T09:00:00Z',
          duration: 30,
        });

      const response = await request(app)
        .get(`/api/etfo-lesson-plans?unitPlanId=${unitPlan1Id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      const unit1Lesson = response.body.find(lesson => lesson.title === 'Unit 1 Lesson');
      const unit2Lesson = response.body.find(lesson => lesson.title === 'Unit 2 Lesson');
      
      expect(unit1Lesson).toBeDefined();
      expect(unit2Lesson).toBeUndefined();
    });

    test('should include related data in list view', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('RELATED_DATA');
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Related Data Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      const response = await request(app)
        .get('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const lesson = response.body.find(l => l.title === 'Related Data Test');
      
      expect(lesson).toBeDefined();
      expect(lesson.unitPlan).toBeDefined();
      expect(lesson.unitPlan.title).toBeDefined();
      expect(lesson.unitPlan.longRangePlan).toBeDefined();
      expect(lesson.unitPlan.longRangePlan.subject).toBeDefined();
      expect(lesson.unitPlan.longRangePlan.grade).toBeDefined();
      expect(lesson._count).toBeDefined();
      expect(lesson._count.expectations).toBeDefined();
      expect(lesson._count.resources).toBeDefined();
    });

    test('should only return lesson plans for authenticated user', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('USER_ISOLATION');
      const { unitPlanId: otherUnitPlanId } = await unauthorizedHelpers.createCompleteHierarchy('OTHER_USER');
      
      // Create lesson for authorized user
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My Lesson',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      // Create lesson for unauthorized user
      await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({
          title: 'Other User Lesson',
          unitPlanId: otherUnitPlanId,
          date: '2024-09-19T09:00:00Z',
          duration: 30,
        });

      const response = await request(app)
        .get('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      
      const myLesson = response.body.find(lesson => lesson.title === 'My Lesson');
      const otherLesson = response.body.find(lesson => lesson.title === 'Other User Lesson');
      
      expect(myLesson).toBeDefined();
      expect(otherLesson).toBeUndefined();
    });
  });

  describe('READ Single (GET /api/etfo-lesson-plans/:id)', () => {
    test('should get a specific lesson plan with all relationships', async () => {
      const expectationId = await helpers.createExpectation('SINGLE_READ');
      const longRangePlanId = await helpers.createLongRangePlan('Single Read Test', [expectationId]);
      const unitPlanId = await helpers.createUnitPlan('Single Read Unit', longRangePlanId, [expectationId]);
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Single Read Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 45,
          mindsOn: 'Test minds on',
          action: 'Test action',
          consolidation: 'Test consolidation',
          learningGoals: 'Test learning goals',
          materials: ['test material'],
          expectationIds: [expectationId],
        });

      const lessonId = createResponse.body.id;

      // Add a resource to the lesson
      await request(app)
        .post(`/api/etfo-lesson-plans/${lessonId}/resources`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Resource',
          type: 'handout',
          url: 'https://example.com/test-resource',
          content: 'Test content',
        });

      const response = await request(app)
        .get(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Single Read Test');
      expect(response.body.mindsOn).toBe('Test minds on');
      expect(response.body.action).toBe('Test action');
      expect(response.body.consolidation).toBe('Test consolidation');
      expect(response.body.learningGoals).toBe('Test learning goals');
      expect(response.body.materials).toEqual(['test material']);
      
      // Check relationships
      expect(response.body.unitPlan).toBeDefined();
      expect(response.body.unitPlan.longRangePlan).toBeDefined();
      expect(response.body.expectations).toHaveLength(1);
      expect(response.body.expectations[0].expectation).toBeDefined();
      expect(response.body.expectations[0].expectation.id).toBe(expectationId);
      expect(response.body.resources).toHaveLength(1);
      expect(response.body.resources[0].title).toBe('Test Resource');
    });

    test('should return 404 for non-existent lesson plan', async () => {
      const response = await request(app)
        .get('/api/etfo-lesson-plans/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Lesson plan not found');
    });

    test('should return 404 for lesson plan owned by different user', async () => {
      const { unitPlanId } = await unauthorizedHelpers.createCompleteHierarchy('OTHER_USER_SINGLE');
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({
          title: 'Other User Lesson',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      const lessonId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Lesson plan not found');
    });

    test('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/etfo-lesson-plans/test-id');

      expect(response.status).toBe(401);
      expect(response.body.error || response.body.message).toMatch(/Unauthorized|Authentication required/);
    });
  });

  describe('UPDATE (PUT /api/etfo-lesson-plans/:id)', () => {
    test('should update all ETFO-specific fields', async () => {
      const expectationId = await helpers.createExpectation('UPDATE_ETFO');
      const newExpectationId = await helpers.createExpectation('UPDATE_ETFO_NEW');
      const longRangePlanId = await helpers.createLongRangePlan('Update ETFO Test', [expectationId, newExpectationId]);
      const unitPlanId = await helpers.createUnitPlan('Update ETFO Unit', longRangePlanId, [expectationId, newExpectationId]);
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
          mindsOn: 'Original minds on',
          action: 'Original action',
          consolidation: 'Original consolidation',
          learningGoals: 'Original learning goals',
          materials: ['original material'],
          grouping: 'whole class',
          accommodations: ['original accommodation'],
          modifications: ['original modification'],
          extensions: ['original extension'],
          assessmentType: 'formative',
          assessmentNotes: 'Original assessment notes',
          isSubFriendly: true,
          subNotes: 'Original sub notes',
          expectationIds: [expectationId],
        });

      const lessonId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          titleFr: 'Titre Mis à Jour',
          date: '2024-09-19T10:00:00Z',
          duration: 45,
          mindsOn: 'Updated minds on activity',
          mindsOnFr: 'Activité d\'activation mise à jour',
          action: 'Updated main learning activity',
          actionFr: 'Activité d\'apprentissage principale mise à jour',
          consolidation: 'Updated consolidation activity',
          consolidationFr: 'Activité de consolidation mise à jour',
          learningGoals: 'Updated learning goals',
          learningGoalsFr: 'Objectifs d\'apprentissage mis à jour',
          materials: ['updated material 1', 'updated material 2'],
          grouping: 'pairs',
          accommodations: ['visual supports', 'extra time'],
          modifications: ['simplified instructions', 'reduced expectations'],
          extensions: ['additional challenge problems', 'peer tutoring'],
          assessmentType: 'summative',
          assessmentNotes: 'Updated assessment strategy with rubric',
          isSubFriendly: false,
          subNotes: 'Updated substitute notes with detailed instructions',
          expectationIds: [newExpectationId],
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Title');
      expect(updateResponse.body.titleFr).toBe('Titre Mis à Jour');
      expect(updateResponse.body.duration).toBe(45);
      expect(updateResponse.body.mindsOn).toBe('Updated minds on activity');
      expect(updateResponse.body.mindsOnFr).toBe('Activité d\'activation mise à jour');
      expect(updateResponse.body.action).toBe('Updated main learning activity');
      expect(updateResponse.body.actionFr).toBe('Activité d\'apprentissage principale mise à jour');
      expect(updateResponse.body.consolidation).toBe('Updated consolidation activity');
      expect(updateResponse.body.consolidationFr).toBe('Activité de consolidation mise à jour');
      expect(updateResponse.body.learningGoals).toBe('Updated learning goals');
      expect(updateResponse.body.learningGoalsFr).toBe('Objectifs d\'apprentissage mis à jour');
      expect(updateResponse.body.materials).toEqual(['updated material 1', 'updated material 2']);
      expect(updateResponse.body.grouping).toBe('pairs');
      expect(updateResponse.body.accommodations).toEqual(['visual supports', 'extra time']);
      expect(updateResponse.body.modifications).toEqual(['simplified instructions', 'reduced expectations']);
      expect(updateResponse.body.extensions).toEqual(['additional challenge problems', 'peer tutoring']);
      expect(updateResponse.body.assessmentType).toBe('summative');
      expect(updateResponse.body.assessmentNotes).toBe('Updated assessment strategy with rubric');
      expect(updateResponse.body.isSubFriendly).toBe(false);
      expect(updateResponse.body.subNotes).toBe('Updated substitute notes with detailed instructions');
      
      // Check that expectations were updated
      expect(updateResponse.body.expectations).toHaveLength(1);
      expect(updateResponse.body.expectations[0].expectationId).toBe(newExpectationId);
    });

    test('should support partial updates', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('PARTIAL_UPDATE');
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Partial Update Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
          mindsOn: 'Original minds on',
          action: 'Original action',
          consolidation: 'Original consolidation',
          isSubFriendly: true,
        });

      const lessonId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title Only',
          duration: 45,
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Title Only');
      expect(updateResponse.body.duration).toBe(45);
      expect(updateResponse.body.mindsOn).toBe('Original minds on');
      expect(updateResponse.body.action).toBe('Original action');
      expect(updateResponse.body.consolidation).toBe('Original consolidation');
      expect(updateResponse.body.isSubFriendly).toBe(true);
    });

    test('should clear expectations when empty array provided', async () => {
      const expectationId = await helpers.createExpectation('CLEAR_EXPECTATIONS');
      const longRangePlanId = await helpers.createLongRangePlan('Clear Expectations Test', [expectationId]);
      const unitPlanId = await helpers.createUnitPlan('Clear Expectations Unit', longRangePlanId, [expectationId]);
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Clear Expectations Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
          expectationIds: [expectationId],
        });

      const lessonId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expectationIds: [],
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.expectations).toHaveLength(0);
    });

    test('should validate assessment type on update', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('ASSESSMENT_VALIDATION');
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Assessment Validation Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
          assessmentType: 'formative',
        });

      const lessonId = createResponse.body.id;

      const updateResponse = await request(app)
        .put(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          assessmentType: 'invalid_type',
        });

      expect(updateResponse.status).toBe(400);
      expect(updateResponse.body.errors || updateResponse.body.error || updateResponse.body.message).toBeDefined();
    });

    test('should return 404 for non-existent lesson plan', async () => {
      const response = await request(app)
        .put('/api/etfo-lesson-plans/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Lesson plan not found');
    });

    test('should return 404 for lesson plan owned by different user', async () => {
      const { unitPlanId } = await unauthorizedHelpers.createCompleteHierarchy('OTHER_USER_UPDATE');
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({
          title: 'Other User Update Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      const lessonId = createResponse.body.id;

      const response = await request(app)
        .put(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Attempted Update',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Lesson plan not found');
    });

    test('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .put('/api/etfo-lesson-plans/test-id')
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(401);
      expect(response.body.error || response.body.message).toMatch(/Unauthorized|Authentication required/);
    });
  });

  describe('DELETE (DELETE /api/etfo-lesson-plans/:id)', () => {
    test('should delete lesson plan successfully', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('DELETE_SUCCESS');
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Delete Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      const lessonId = createResponse.body.id;

      const deleteResponse = await request(app)
        .delete(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    test('should prevent deletion when daybook entry exists', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('DELETE_WITH_DAYBOOK');
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Delete with Daybook Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      const lessonId = createResponse.body.id;

      // Create daybook entry for the lesson
      await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: '2024-09-18T00:00:00Z',
          lessonPlanId: lessonId,
          notes: 'Test daybook entry',
          overallRating: 4,
        });

      const deleteResponse = await request(app)
        .delete(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(400);
      expect(deleteResponse.body.error).toBe('Cannot delete lesson plan with existing daybook entry');
    });

    test('should delete lesson plan and associated resources via API', async () => {
      const expectationId = await helpers.createExpectation('DELETE_WITH_RESOURCES');
      const longRangePlanId = await helpers.createLongRangePlan('Delete with Resources Test', [expectationId]);
      const unitPlanId = await helpers.createUnitPlan('Delete with Resources Unit', longRangePlanId, [expectationId]);
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Delete with Resources Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
          expectationIds: [expectationId],
        });

      const lessonId = createResponse.body.id;

      // Add a resource
      const resourceResponse = await request(app)
        .post(`/api/etfo-lesson-plans/${lessonId}/resources`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Resource',
          type: 'handout',
          content: 'Test content',
        });

      expect(resourceResponse.status).toBe(201);
      const resourceId = resourceResponse.body.id;

      // Verify expectations and resources exist
      const beforeDelete = await request(app)
        .get(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(beforeDelete.body.expectations).toHaveLength(1);
      expect(beforeDelete.body.resources).toHaveLength(1);

      // Delete the resource first (since schema doesn't have cascade delete for resources)
      const deleteResourceResponse = await request(app)
        .delete(`/api/etfo-lesson-plans/${lessonId}/resources/${resourceId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResourceResponse.status).toBe(204);

      // Now delete the lesson plan
      const deleteResponse = await request(app)
        .delete(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);

      // Verify lesson plan was deleted
      const getResponse = await request(app)
        .get(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);

      // Verify expectations were cascaded deleted
      const expectationCheck = await prisma.eTFOLessonPlanExpectation.findMany({
        where: { lessonPlanId: lessonId },
      });
      expect(expectationCheck).toHaveLength(0);
    });

    test('should return 404 for non-existent lesson plan', async () => {
      const response = await request(app)
        .delete('/api/etfo-lesson-plans/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Lesson plan not found');
    });

    test('should return 404 for lesson plan owned by different user', async () => {
      const { unitPlanId } = await unauthorizedHelpers.createCompleteHierarchy('OTHER_USER_DELETE');
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({
          title: 'Other User Delete Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      const lessonId = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Lesson plan not found');
    });

    test('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .delete('/api/etfo-lesson-plans/test-id');

      expect(response.status).toBe(401);
      expect(response.body.error || response.body.message).toMatch(/Unauthorized|Authentication required/);
    });
  });

  describe('ETFO-Specific Features', () => {
    test('should validate three-part lesson structure', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('THREE_PART');
      
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Three-Part Lesson Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 60,
          mindsOn: 'Students will discuss what they already know about fractions',
          action: 'Students will work in pairs to explore fraction strips and make comparisons',
          consolidation: 'Students will share their findings and create a class chart of equivalent fractions',
        });

      expect(response.status).toBe(201);
      expect(response.body.mindsOn).toBe('Students will discuss what they already know about fractions');
      expect(response.body.action).toBe('Students will work in pairs to explore fraction strips and make comparisons');
      expect(response.body.consolidation).toBe('Students will share their findings and create a class chart of equivalent fractions');
    });

    test('should support differentiation strategies', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('DIFFERENTIATION');
      
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Differentiation Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 45,
          accommodations: [
            'Visual number line for students with learning difficulties',
            'Extra time for task completion',
            'Peer support partnerships',
          ],
          modifications: [
            'Simplified word problems for students reading below grade level',
            'Reduced number of practice problems',
            'Alternative assessment format',
          ],
          extensions: [
            'Challenge problems for advanced learners',
            'Research project on real-world applications',
            'Peer tutoring opportunities',
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.accommodations).toEqual([
        'Visual number line for students with learning difficulties',
        'Extra time for task completion',
        'Peer support partnerships',
      ]);
      expect(response.body.modifications).toEqual([
        'Simplified word problems for students reading below grade level',
        'Reduced number of practice problems',
        'Alternative assessment format',
      ]);
      expect(response.body.extensions).toEqual([
        'Challenge problems for advanced learners',
        'Research project on real-world applications',
        'Peer tutoring opportunities',
      ]);
    });

    test('should support assessment strategies', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('ASSESSMENT');
      
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Assessment Strategy Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 45,
          assessmentType: 'formative',
          assessmentNotes: 'Observe student problem-solving strategies during partner work. Use exit ticket to assess understanding of key concepts. Anecdotal notes on student explanations.',
        });

      expect(response.status).toBe(201);
      expect(response.body.assessmentType).toBe('formative');
      expect(response.body.assessmentNotes).toBe('Observe student problem-solving strategies during partner work. Use exit ticket to assess understanding of key concepts. Anecdotal notes on student explanations.');
    });

    test('should support bilingual content', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('BILINGUAL');
      
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Bilingual Test',
          titleFr: 'Test Bilingue',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 45,
          mindsOn: 'Students will brainstorm what they know about weather',
          mindsOnFr: 'Les étudiants feront un remue-méninges sur ce qu\'ils savent de la météo',
          action: 'Students will observe and record weather patterns',
          actionFr: 'Les étudiants observeront et enregistreront les modèles météorologiques',
          consolidation: 'Students will create a weather journal',
          consolidationFr: 'Les étudiants créeront un journal météorologique',
          learningGoals: 'Students will identify and describe weather patterns',
          learningGoalsFr: 'Les étudiants identifieront et décriront les modèles météorologiques',
        });

      expect(response.status).toBe(201);
      expect(response.body.titleFr).toBe('Test Bilingue');
      expect(response.body.mindsOnFr).toBe('Les étudiants feront un remue-méninges sur ce qu\'ils savent de la météo');
      expect(response.body.actionFr).toBe('Les étudiants observeront et enregistreront les modèles météorologiques');
      expect(response.body.consolidationFr).toBe('Les étudiants créeront un journal météorologique');
      expect(response.body.learningGoalsFr).toBe('Les étudiants identifieront et décriront les modèles météorologiques');
    });

    test('should support substitute teacher features', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('SUBSTITUTE');
      
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Substitute Teacher Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 45,
          isSubFriendly: true,
          subNotes: 'All materials are in the math center labeled bins. Students know the routine for partner work. Answer key is in the teacher desk drawer. Contact office if you need additional support.',
          grouping: 'pairs',
          materials: ['pattern blocks', 'recording sheets', 'timer'],
        });

      expect(response.status).toBe(201);
      expect(response.body.isSubFriendly).toBe(true);
      expect(response.body.subNotes).toBe('All materials are in the math center labeled bins. Students know the routine for partner work. Answer key is in the teacher desk drawer. Contact office if you need additional support.');
      expect(response.body.grouping).toBe('pairs');
      expect(response.body.materials).toEqual(['pattern blocks', 'recording sheets', 'timer']);
    });

    test('should support expectation linking and unlinking', async () => {
      const expectation1 = await helpers.createExpectation('LINKING_1');
      const expectation2 = await helpers.createExpectation('LINKING_2');
      const expectation3 = await helpers.createExpectation('LINKING_3');
      const longRangePlanId = await helpers.createLongRangePlan('Expectation Linking Test', [expectation1, expectation2, expectation3]);
      const unitPlanId = await helpers.createUnitPlan('Expectation Linking Unit', longRangePlanId, [expectation1, expectation2, expectation3]);
      
      // Create lesson with multiple expectations
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Expectation Linking Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 45,
          expectationIds: [expectation1, expectation2],
        });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.expectations).toHaveLength(2);

      const lessonId = createResponse.body.id;

      // Update to link different expectations
      const updateResponse = await request(app)
        .put(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expectationIds: [expectation2, expectation3],
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.expectations).toHaveLength(2);
      
      const expectationIds = updateResponse.body.expectations.map(e => e.expectationId);
      expect(expectationIds).toContain(expectation2);
      expect(expectationIds).toContain(expectation3);
      expect(expectationIds).not.toContain(expectation1);

      // Unlink all expectations
      const unlinkResponse = await request(app)
        .put(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          expectationIds: [],
        });

      expect(unlinkResponse.status).toBe(200);
      expect(unlinkResponse.body.expectations).toHaveLength(0);
    });

    test('should validate materials as array', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('MATERIALS_VALIDATION');
      
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Materials Validation Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 45,
          materials: 'string instead of array',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors || response.body.error || response.body.message).toBeDefined();
    });

    test('should handle complex lesson scenarios', async () => {
      const expectation1 = await helpers.createExpectation('COMPLEX_1');
      const expectation2 = await helpers.createExpectation('COMPLEX_2');
      const longRangePlanId = await helpers.createLongRangePlan('Complex Lesson Test', [expectation1, expectation2]);
      const unitPlanId = await helpers.createUnitPlan('Complex Lesson Unit', longRangePlanId, [expectation1, expectation2]);
      
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Complex Multi-Expectation Lesson',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 75,
          mindsOn: 'Students will use a KWL chart to activate prior knowledge about ecosystems',
          action: 'Students will work in groups to create a food web diagram using local ecosystem examples',
          consolidation: 'Groups will present their food webs and explain the relationships between organisms',
          learningGoals: 'Students will understand the interdependence of organisms in an ecosystem',
          materials: [
            'KWL chart template',
            'ecosystem picture cards',
            'large chart paper',
            'colored markers',
            'ecosystem reference books',
          ],
          grouping: 'small group',
          accommodations: [
            'Provide visual vocabulary cards for ELL students',
            'Allow extra time for group work',
            'Provide sentence starters for explanations',
          ],
          modifications: [
            'Simplified food web with fewer organisms',
            'Pre-made organism cards for students with fine motor difficulties',
          ],
          extensions: [
            'Research endangered species in local ecosystem',
            'Create a presentation on human impact on food webs',
          ],
          assessmentType: 'formative',
          assessmentNotes: 'Use checklist to assess group collaboration and understanding of ecosystem relationships',
          isSubFriendly: false,
          subNotes: 'This lesson requires specialized knowledge of ecosystems - recommend rescheduling',
          expectationIds: [expectation1, expectation2],
        });

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Complex Multi-Expectation Lesson');
      expect(response.body.duration).toBe(75);
      expect(response.body.materials).toHaveLength(5);
      expect(response.body.accommodations).toHaveLength(3);
      expect(response.body.modifications).toHaveLength(2);
      expect(response.body.extensions).toHaveLength(2);
      expect(response.body.expectations).toHaveLength(2);
      expect(response.body.isSubFriendly).toBe(false);
    });
  });

  describe('Authorization Tests', () => {
    test('should enforce ownership for all operations', async () => {
      // Create lesson plan as authorized user
      const { unitPlanId } = await helpers.createCompleteHierarchy('OWNERSHIP_TEST');
      
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Ownership Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      const lessonId = createResponse.body.id;

      // Try to access as unauthorized user
      const readResponse = await request(app)
        .get(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`);

      expect(readResponse.status).toBe(404);

      // Try to update as unauthorized user
      const updateResponse = await request(app)
        .put(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send({
          title: 'Hacked Title',
        });

      expect(updateResponse.status).toBe(404);

      // Try to delete as unauthorized user
      const deleteResponse = await request(app)
        .delete(`/api/etfo-lesson-plans/${lessonId}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`);

      expect(deleteResponse.status).toBe(404);
    });

    test('should require authentication for all operations', async () => {
      // Test without authentication
      const createResponse = await request(app)
        .post('/api/etfo-lesson-plans')
        .send({
          title: 'Unauthenticated Test',
        });

      expect(createResponse.status).toBe(401);

      const readResponse = await request(app)
        .get('/api/etfo-lesson-plans');

      expect(readResponse.status).toBe(401);

      const updateResponse = await request(app)
        .put('/api/etfo-lesson-plans/test-id')
        .send({
          title: 'Updated Title',
        });

      expect(updateResponse.status).toBe(401);

      const deleteResponse = await request(app)
        .delete('/api/etfo-lesson-plans/test-id');

      expect(deleteResponse.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Test with invalid unitPlanId format
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Database Error Test',
          unitPlanId: 'invalid-format',
          date: '2024-09-18T09:00:00Z',
          duration: 30,
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Unit plan not found');
    });

    test('should handle invalid date formats', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('INVALID_DATE');
      
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Date Test',
          unitPlanId,
          date: 'invalid-date-format',
          duration: 30,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors || response.body.error || response.body.message).toBeDefined();
    });

    test('should handle negative duration values', async () => {
      const { unitPlanId } = await helpers.createCompleteHierarchy('NEGATIVE_DURATION');
      
      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Negative Duration Test',
          unitPlanId,
          date: '2024-09-18T09:00:00Z',
          duration: -30,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors || response.body.error || response.body.message).toBeDefined();
    });
  });
});