import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';
import { TestDatabaseManager } from '../test-database-manager';

describe('Enhanced Sub Plan API', () => {
  let testDb: TestDatabaseManager;
  let testUser: any;

  beforeAll(async () => {
    testDb = new TestDatabaseManager();
    await testDb.setup();
  });

  afterAll(async () => {
    await testDb.teardown();
  });

  beforeEach(async () => {
    await testDb.reset();

    // Create test user
    testUser = await prisma.user.create({
      data: {
        email: 'teacher@school.com',
        password: 'password',
        name: 'Test Teacher',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });

    // Create test class routines
    await prisma.classRoutine.createMany({
      data: [
        {
          userId: testUser.id,
          title: 'Morning Circle',
          description: 'Students gather in a circle for morning greeting and calendar time',
          category: 'morning',
          timeOfDay: '9:00 AM',
          priority: 10,
          isActive: true,
        },
        {
          userId: testUser.id,
          title: 'Line Up Procedure',
          description: 'Students line up by door 3 after recess',
          category: 'transition',
          priority: 5,
          isActive: true,
        },
        {
          userId: testUser.id,
          title: 'Emergency Evacuation',
          description: 'Exit through west door, meet at flag pole',
          category: 'emergency',
          priority: 15,
          isActive: true,
        },
      ],
    });

    // Create test students with goals
    const student1 = await prisma.student.create({
      data: {
        userId: testUser.id,
        firstName: 'Emma',
        lastName: 'Johnson',
        grade: 2,
      },
    });

    const student2 = await prisma.student.create({
      data: {
        userId: testUser.id,
        firstName: 'Liam',
        lastName: 'Smith',
        grade: 2,
      },
    });

    // Create test goals
    await prisma.studentGoal.createMany({
      data: [
        {
          studentId: student1.id,
          text: 'Identify character feelings in stories',
          status: 'active',
        },
        {
          studentId: student2.id,
          text: 'Use doubles strategies for addition',
          status: 'active',
        },
      ],
    });
  });

  describe('POST /api/sub-plan/generate', () => {
    it('should generate sub plan with all features included', async () => {
      const options = {
        date: '2025-04-12',
        days: 1,
        includeGoals: true,
        includeRoutines: true,
        includePlans: true,
        anonymize: false,
        userId: testUser.id,
      };

      const response = await request(app)
        .post('/api/sub-plan/generate')
        .set('Authorization', `Bearer ${global.testToken}`)
        .send(options)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.body).toBeDefined();
    });

    it('should generate anonymized sub plan', async () => {
      const options = {
        date: '2025-04-12',
        days: 1,
        includeGoals: true,
        includeRoutines: true,
        includePlans: true,
        anonymize: true,
        userId: testUser.id,
      };

      const response = await request(app)
        .post('/api/sub-plan/generate')
        .set('Authorization', `Bearer ${global.testToken}`)
        .send(options)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('should save sub plan record when requested', async () => {
      const options = {
        date: '2025-04-12',
        days: 1,
        includeGoals: true,
        includeRoutines: true,
        includePlans: true,
        anonymize: false,
        saveRecord: true,
        emailTo: 'substitute@school.com',
        notes: 'Watch for peanut allergies',
        userId: testUser.id,
      };

      await request(app)
        .post('/api/sub-plan/generate')
        .set('Authorization', `Bearer ${global.testToken}`)
        .send(options)
        .expect(200);

      const record = await prisma.subPlanRecord.findFirst({
        where: { userId: testUser.id },
      });

      expect(record).toBeDefined();
      expect(record?.emailedTo).toBe('substitute@school.com');
      expect(record?.notes).toBe('Watch for peanut allergies');
    });
  });

  describe('Class Routine Management', () => {
    it('should get all routines for user', async () => {
      const response = await request(app)
        .get('/api/sub-plan/routines')
        .set('Authorization', `Bearer ${global.testToken}`)
        .query({ userId: testUser.id })
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].title).toBe('Emergency Evacuation'); // Highest priority
    });

    it('should create new routine', async () => {
      const newRoutine = {
        userId: testUser.id,
        title: 'Quiet Signal',
        description: 'Raise hand for quiet, students copy',
        category: 'behavior',
        priority: 8,
      };

      const response = await request(app)
        .post('/api/sub-plan/routines')
        .set('Authorization', `Bearer ${global.testToken}`)
        .send(newRoutine)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe('Quiet Signal');
    });

    it('should update existing routine', async () => {
      const routine = await prisma.classRoutine.findFirst({
        where: { title: 'Morning Circle' },
      });

      const updateData = {
        id: routine!.id,
        title: 'Morning Meeting',
        description: 'Updated morning routine',
        category: 'morning',
        priority: 12,
      };

      const response = await request(app)
        .post('/api/sub-plan/routines')
        .set('Authorization', `Bearer ${global.testToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Morning Meeting');
      expect(response.body.priority).toBe(12);
    });

    it('should delete routine', async () => {
      const routine = await prisma.classRoutine.findFirst({
        where: { title: 'Line Up Procedure' },
      });

      await request(app)
        .delete(`/api/sub-plan/routines/${routine!.id}`)
        .set('Authorization', `Bearer ${global.testToken}`)
        .expect(200);

      const deleted = await prisma.classRoutine.findUnique({
        where: { id: routine!.id },
      });

      expect(deleted).toBeNull();
    });
  });

  describe('Sub Plan Records', () => {
    it('should retrieve saved sub plan records', async () => {
      // Create some test records
      await prisma.subPlanRecord.createMany({
        data: [
          {
            userId: testUser.id,
            date: new Date('2025-04-10'),
            daysCount: 1,
            content: {},
            includeGoals: true,
            includeRoutines: true,
            includePlans: true,
            anonymized: false,
          },
          {
            userId: testUser.id,
            date: new Date('2025-04-08'),
            daysCount: 2,
            content: {},
            includeGoals: false,
            includeRoutines: true,
            includePlans: true,
            anonymized: true,
          },
        ],
      });

      const response = await request(app)
        .get('/api/sub-plan/records')
        .set('Authorization', `Bearer ${global.testToken}`)
        .query({ userId: testUser.id })
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].date).toContain('2025-04-10'); // Most recent first
    });
  });
});
