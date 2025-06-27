import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';

// Sub plan routes have been implemented
describe('Enhanced Sub Plan API', () => {
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    // Create test user for authentication
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const timestamp = Date.now();
    const testEmail = `subplan-test-${timestamp}@example.com`;

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Sub Plan Tester',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });

    testUserId = user.id;

    // Disconnect and reconnect to ensure transaction is committed
    await prisma.$disconnect();
    await prisma.$connect();

    // Login to get proper auth token
    const loginResponse = await request(app).post('/api/login').send({
      email: testEmail,
      password: 'testpassword123',
    });

    if (loginResponse.status !== 200) {
      throw new Error(
        `Login failed: ${loginResponse.status} ${JSON.stringify(loginResponse.body)}`,
      );
    }

    authToken = loginResponse.body.token;

    if (!authToken) {
      throw new Error('No auth token received from login');
    }
  });

  beforeEach(async () => {
    // Clean up test data before each test to prevent contamination
    await prisma.studentGoal.deleteMany({
      where: {
        student: {
          userId: testUserId,
        },
      },
    });
    await prisma.student.deleteMany({
      where: {
        userId: testUserId,
      },
    });
    await prisma.classRoutine.deleteMany({
      where: {
        userId: testUserId,
      },
    });
    await prisma.subPlanRecord.deleteMany({
      where: {
        userId: testUserId,
      },
    });
  });

  afterAll(async () => {
    // No explicit cleanup needed - global setup handles it
  });

  const createTestData = async () => {
    // Use the existing test user created in beforeAll
    const testUser = { id: testUserId };

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

    return testUser;
  };

  describe('POST /api/sub-plan/generate', () => {
    it('should generate sub plan with all features included', async () => {
      const testUser = await createTestData();

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
        .set('Authorization', `Bearer ${authToken}`)
        .send(options)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.body).toBeDefined();
    });

    it('should generate anonymized sub plan', async () => {
      const testUser = await createTestData();

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
        .set('Authorization', `Bearer ${authToken}`)
        .send(options)
        .expect(200);

      expect(response.headers['content-type']).toBe('application/pdf');
    });

    it('should save sub plan record when requested', async () => {
      const testUser = await createTestData();

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
        .set('Authorization', `Bearer ${authToken}`)
        .send(options)
        .expect(200);

      const record = await prisma.subPlanRecord.findFirst({
        where: { userId: testUser.id },
      });

      expect(record).toBeDefined();
      expect((record?.content as any)?.emailedTo).toBe('substitute@school.com');
      expect(record?.notes).toBe('Watch for peanut allergies');
    });
  });

  describe('Class Routine Management', () => {
    it('should get all routines for user', async () => {
      const testUser = await createTestData();

      const response = await request(app)
        .get('/api/sub-plan/routines')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ userId: testUser.id })
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].title).toBe('Emergency Evacuation'); // Highest priority
    });

    it('should create new routine', async () => {
      const testUser = await createTestData();

      const newRoutine = {
        userId: testUser.id,
        title: 'Quiet Signal',
        description: 'Raise hand for quiet, students copy',
        category: 'behavior',
        priority: 8,
      };

      const response = await request(app)
        .post('/api/sub-plan/routines')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newRoutine)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.title).toBe('Quiet Signal');
    });

    it('should update existing routine', async () => {
      const testUser = await createTestData();

      const routine = await prisma.classRoutine.findFirst({
        where: { title: 'Morning Circle', userId: testUser.id },
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
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe('Morning Meeting');
      expect(response.body.priority).toBe(12);
    });

    it('should delete routine', async () => {
      const testUser = await createTestData();

      const routine = await prisma.classRoutine.findFirst({
        where: { title: 'Line Up Procedure', userId: testUser.id },
      });

      await request(app)
        .delete(`/api/sub-plan/routines/${routine!.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deleted = await prisma.classRoutine.findUnique({
        where: { id: routine!.id },
      });

      expect(deleted).toBeNull();
    });
  });

  describe('Sub Plan Records', () => {
    it('should retrieve saved sub plan records', async () => {
      const testUser = await createTestData();

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
        .set('Authorization', `Bearer ${authToken}`)
        .query({ userId: testUser.id })
        .expect(200);

      expect(response.body).toHaveLength(2);
      // Records should be sorted by date, most recent first
      const firstRecordDate = new Date(response.body[0].date);
      const secondRecordDate = new Date(response.body[1].date);
      expect(firstRecordDate.getTime()).toBeGreaterThan(secondRecordDate.getTime());
    });
  });
});
