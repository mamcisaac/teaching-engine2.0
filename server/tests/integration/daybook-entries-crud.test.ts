import request from 'supertest';
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { app } from '../../src/index';
import { prisma } from '../../src/prisma';

describe('Daybook Entries - Core CRUD Tests', () => {
  let authToken: string;
  let unauthorizedToken: string;
  let userId: number;
  let unauthorizedUserId: number;
  let testEmail: string;
  let unauthorizedEmail: string;

  beforeAll(async () => {
    // Create test users
    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const timestamp = Date.now();
    testEmail = `daybook-crud-test-${timestamp}@example.com`;
    unauthorizedEmail = `daybook-crud-unauthorized-${timestamp}@example.com`;

    // Clean up any existing users
    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, unauthorizedEmail] } },
    });

    // Create primary test user
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Daybook CRUD Tester',
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

    // Login both users
    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: testEmail,
        password: 'testpassword123',
      });

    authToken = loginResponse.body.accessToken;

    const unauthorizedLoginResponse = await request(app)
      .post('/api/login')
      .send({
        email: unauthorizedEmail,
        password: 'testpassword123',
      });

    unauthorizedToken = unauthorizedLoginResponse.body.accessToken;
  });

  beforeEach(async () => {
    // Clean up any existing daybook entries before each test
    await prisma.daybookEntryExpectation.deleteMany({
      where: {
        daybookEntry: {
          userId: { in: [userId, unauthorizedUserId] }
        }
      }
    });
    
    await prisma.daybookEntry.deleteMany({
      where: { userId: { in: [userId, unauthorizedUserId] } },
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.daybookEntryExpectation.deleteMany({
      where: {
        daybookEntry: {
          userId: { in: [userId, unauthorizedUserId] }
        }
      }
    });
    
    await prisma.daybookEntry.deleteMany({
      where: { userId: { in: [userId, unauthorizedUserId] } },
    });

    await prisma.user.deleteMany({
      where: { email: { in: [testEmail, unauthorizedEmail] } },
    });
  });

  describe('CREATE Operations (POST /api/daybook-entries)', () => {
    test('should create a basic daybook entry with reflection fields', async () => {
      const entryData = {
        date: '2024-09-15T00:00:00Z',
        whatWorked: 'Students engaged well with hands-on activities',
        whatDidntWork: 'Some students struggled with complex instructions',
        nextSteps: 'Simplify instruction language, provide visual aids',
        classEngagement: 'High engagement during group work',
        commonChallenges: 'Difficulty following multi-step directions',
        notableAchievements: 'All students participated in discussion',
        notes: 'Great day overall, students showed progress',
        privateNotes: 'Need to follow up with parent conference',
        overallRating: 4,
        wouldReuseLesson: true,
      };

      const response = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.whatWorked).toBe(entryData.whatWorked);
      expect(response.body.whatDidntWork).toBe(entryData.whatDidntWork);
      expect(response.body.nextSteps).toBe(entryData.nextSteps);
      expect(response.body.classEngagement).toBe(entryData.classEngagement);
      expect(response.body.commonChallenges).toBe(entryData.commonChallenges);
      expect(response.body.notableAchievements).toBe(entryData.notableAchievements);
      expect(response.body.notes).toBe(entryData.notes);
      expect(response.body.privateNotes).toBe(entryData.privateNotes);
      expect(response.body.overallRating).toBe(entryData.overallRating);
      expect(response.body.wouldReuseLesson).toBe(entryData.wouldReuseLesson);
      expect(response.body.userId).toBe(userId);
    });

    test('should create daybook entry with bilingual reflection support', async () => {
      const entryData = {
        date: '2024-09-16T00:00:00Z',
        whatWorked: 'Interactive whiteboard activities',
        whatWorkedFr: 'Activités sur tableau blanc interactif',
        whatDidntWork: 'Time management issues',
        whatDidntWorkFr: 'Problèmes de gestion du temps',
        nextSteps: 'Better time allocation for activities',
        nextStepsFr: 'Meilleure répartition du temps pour les activités',
        notes: 'Good participation today',
        notesFr: 'Bonne participation aujourd\'hui',
        overallRating: 3,
      };

      const response = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      expect(response.status).toBe(201);
      expect(response.body.whatWorked).toBe(entryData.whatWorked);
      expect(response.body.whatWorkedFr).toBe(entryData.whatWorkedFr);
      expect(response.body.whatDidntWork).toBe(entryData.whatDidntWork);
      expect(response.body.whatDidntWorkFr).toBe(entryData.whatDidntWorkFr);
      expect(response.body.nextSteps).toBe(entryData.nextSteps);
      expect(response.body.nextStepsFr).toBe(entryData.nextStepsFr);
      expect(response.body.notes).toBe(entryData.notes);
      expect(response.body.notesFr).toBe(entryData.notesFr);
    });

    test('should create daybook entry with expectation coverage', async () => {
      // Create a curriculum expectation first
      const expectation = await prisma.curriculumExpectation.create({
        data: {
          code: `MATH.1.1.${Date.now()}`,
          description: 'Test math expectation',
          strand: 'Number Sense',
          grade: 1,
          subject: 'Mathematics',
        },
      });
      
      const entryData = {
        date: '2024-09-18T00:00:00Z',
        whatWorked: 'Students mastered the concept',
        overallRating: 4,
        expectationCoverage: [
          {
            expectationId: expectation.id,
            coverage: 'consolidated'
          }
        ],
      };

      const response = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      expect(response.status).toBe(201);
      expect(response.body.expectations).toBeDefined();
      expect(response.body.expectations).toHaveLength(1);
      expect(response.body.expectations[0].coverage).toBe('consolidated');
      expect(response.body.expectations[0].expectation).toBeDefined();
    });

    test('should validate rating scale (1-5)', async () => {
      const entryData = {
        date: '2024-09-19T00:00:00Z',
        overallRating: 6, // Invalid rating
      };

      const response = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      expect(response.status).toBe(400);
      // Check the actual structure of the error response
      expect(response.body.error || response.body.message || response.body.errors).toBeDefined();
    });

    test('should require authentication', async () => {
      const entryData = {
        date: '2024-09-20T00:00:00Z',
        notes: 'Test entry',
      };

      const response = await request(app)
        .post('/api/daybook-entries')
        .send(entryData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('READ Operations (GET /api/daybook-entries)', () => {
    let testEntryId: string;

    beforeEach(async () => {
      // Create a test entry for read operations
      const entry = await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-15T00:00:00Z'),
          whatWorked: 'Great student engagement',
          whatDidntWork: 'Ran out of time',
          nextSteps: 'Allow more time for activities',
          classEngagement: 'High participation',
          commonChallenges: 'Time management',
          notes: 'Overall positive day',
          overallRating: 4,
          wouldReuseLesson: true,
        },
      });
      testEntryId = entry.id;
    });

    test('should get all daybook entries for authenticated user', async () => {
      const response = await request(app)
        .get('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check that all entries belong to the authenticated user
      response.body.forEach((entry: any) => {
        expect(entry.userId).toBe(userId);
      });
    });

    test('should filter entries by date range', async () => {
      const response = await request(app)
        .get('/api/daybook-entries')
        .query({
          startDate: '2024-09-15T00:00:00Z',
          endDate: '2024-09-16T00:00:00Z'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Check that all entries are within the date range
      response.body.forEach((entry: any) => {
        const entryDate = new Date(entry.date);
        expect(entryDate.getTime()).toBeGreaterThanOrEqual(new Date('2024-09-15T00:00:00Z').getTime());
        expect(entryDate.getTime()).toBeLessThanOrEqual(new Date('2024-09-16T00:00:00Z').getTime());
      });
    });

    test('should filter entries by rating', async () => {
      const response = await request(app)
        .get('/api/daybook-entries')
        .query({ rating: 4 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      // Check that all entries have the specified rating
      response.body.forEach((entry: any) => {
        expect(entry.overallRating).toBe(4);
      });
    });

    test('should get single daybook entry with full details', async () => {
      const response = await request(app)
        .get(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testEntryId);
      expect(response.body.whatWorked).toBe('Great student engagement');
      expect(response.body.whatDidntWork).toBe('Ran out of time');
      expect(response.body.nextSteps).toBe('Allow more time for activities');
      expect(response.body.classEngagement).toBe('High participation');
      expect(response.body.commonChallenges).toBe('Time management');
      expect(response.body.notes).toBe('Overall positive day');
      expect(response.body.overallRating).toBe(4);
      expect(response.body.wouldReuseLesson).toBe(true);
      expect(response.body.userId).toBe(userId);
    });

    test('should not allow access to other users\' entries', async () => {
      const response = await request(app)
        .get(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Daybook entry not found');
    });

    test('should return 404 for non-existent entry', async () => {
      const response = await request(app)
        .get('/api/daybook-entries/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Daybook entry not found');
    });

    test('should require authentication for list', async () => {
      const response = await request(app)
        .get('/api/daybook-entries');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    test('should require authentication for single entry', async () => {
      const response = await request(app)
        .get(`/api/daybook-entries/${testEntryId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('UPDATE Operations (PUT /api/daybook-entries/:id)', () => {
    let testEntryId: string;

    beforeEach(async () => {
      // Create test entry for update operations
      const entry = await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-20T00:00:00Z'),
          whatWorked: 'Original content',
          overallRating: 3,
        },
      });
      testEntryId = entry.id;
    });

    test('should update reflection fields', async () => {
      const updateData = {
        whatWorked: 'Updated: Interactive activities were very successful',
        whatDidntWork: 'Updated: Need better time management',
        nextSteps: 'Updated: Plan shorter activities, use timer',
        classEngagement: 'Updated: Students highly engaged throughout',
        commonChallenges: 'Updated: Some students need additional support',
        notableAchievements: 'Updated: All students participated actively',
        notes: 'Updated: Great improvement from last week',
        overallRating: 5,
        wouldReuseLesson: true,
      };

      const response = await request(app)
        .put(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.whatWorked).toBe(updateData.whatWorked);
      expect(response.body.whatDidntWork).toBe(updateData.whatDidntWork);
      expect(response.body.nextSteps).toBe(updateData.nextSteps);
      expect(response.body.classEngagement).toBe(updateData.classEngagement);
      expect(response.body.commonChallenges).toBe(updateData.commonChallenges);
      expect(response.body.notableAchievements).toBe(updateData.notableAchievements);
      expect(response.body.notes).toBe(updateData.notes);
      expect(response.body.overallRating).toBe(updateData.overallRating);
      expect(response.body.wouldReuseLesson).toBe(updateData.wouldReuseLesson);
    });

    test('should update bilingual content', async () => {
      const updateData = {
        whatWorkedFr: 'Les activités interactives ont très bien fonctionné',
        whatDidntWorkFr: 'Besoin d\'une meilleure gestion du temps',
        nextStepsFr: 'Planifier des activités plus courtes',
        notesFr: 'Excellente amélioration par rapport à la semaine dernière',
      };

      const response = await request(app)
        .put(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.whatWorkedFr).toBe(updateData.whatWorkedFr);
      expect(response.body.whatDidntWorkFr).toBe(updateData.whatDidntWorkFr);
      expect(response.body.nextStepsFr).toBe(updateData.nextStepsFr);
      expect(response.body.notesFr).toBe(updateData.notesFr);
    });

    test('should update rating within valid range', async () => {
      const updateData = {
        overallRating: 2,
      };

      const response = await request(app)
        .put(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.overallRating).toBe(2);
    });

    test('should reject invalid rating', async () => {
      const updateData = {
        overallRating: 0, // Invalid rating
      };

      const response = await request(app)
        .put(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      // Check the actual structure of the error response
      expect(response.body.error || response.body.message || response.body.errors).toBeDefined();
    });

    test('should update expectation coverage', async () => {
      // Create a curriculum expectation
      const expectation = await prisma.curriculumExpectation.create({
        data: {
          code: `SCIENCE.1.1.${Date.now()}`,
          description: 'Test science expectation',
          strand: 'Understanding Matter and Energy',
          grade: 1,
          subject: 'Science',
        },
      });
      
      const updateData = {
        expectationCoverage: [
          {
            expectationId: expectation.id,
            coverage: 'developing'
          }
        ],
      };

      const response = await request(app)
        .put(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.expectations).toBeDefined();
      expect(response.body.expectations).toHaveLength(1);
      expect(response.body.expectations[0].coverage).toBe('developing');
    });

    test('should not allow updating other users\' entries', async () => {
      const updateData = {
        notes: 'Unauthorized update attempt',
      };

      const response = await request(app)
        .put(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Daybook entry not found');
    });

    test('should return 404 for non-existent entry', async () => {
      const updateData = {
        notes: 'Update attempt on non-existent entry',
      };

      const response = await request(app)
        .put('/api/daybook-entries/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Daybook entry not found');
    });

    test('should require authentication', async () => {
      const updateData = {
        notes: 'Unauthorized update',
      };

      const response = await request(app)
        .put(`/api/daybook-entries/${testEntryId}`)
        .send(updateData);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });
  });

  describe('DELETE Operations (DELETE /api/daybook-entries/:id)', () => {
    let testEntryId: string;
    let testEntryWithExpectationsId: string;

    beforeEach(async () => {
      // Create test entry for delete operations
      const entry = await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-22T00:00:00Z'),
          notes: 'Entry to be deleted',
        },
      });
      testEntryId = entry.id;

      // Create entry with expectations for cascade delete test
      const expectation = await prisma.curriculumExpectation.create({
        data: {
          code: `DELETE.1.1.${Date.now()}`,
          description: 'Expectation for delete test',
          strand: 'Test Strand',
          grade: 1,
          subject: 'Test Subject',
        },
      });

      const entryWithExpectations = await prisma.daybookEntry.create({
        data: {
          userId,
          date: new Date('2024-09-23T00:00:00Z'),
          notes: 'Entry with expectations to be deleted',
        },
      });
      testEntryWithExpectationsId = entryWithExpectations.id;

      await prisma.daybookEntryExpectation.create({
        data: {
          daybookEntryId: testEntryWithExpectationsId,
          expectationId: expectation.id,
          coverage: 'introduced',
        },
      });
    });

    test('should delete daybook entry', async () => {
      const response = await request(app)
        .delete(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify entry is deleted
      const checkResponse = await request(app)
        .get(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.status).toBe(404);
    });

    test('should cascade delete expectation relationships', async () => {
      // Verify expectations exist before deletion
      const expectationsBefore = await prisma.daybookEntryExpectation.findMany({
        where: { daybookEntryId: testEntryWithExpectationsId },
      });
      expect(expectationsBefore).toHaveLength(1);

      const response = await request(app)
        .delete(`/api/daybook-entries/${testEntryWithExpectationsId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);

      // Verify expectations are cascade deleted
      const expectationsAfter = await prisma.daybookEntryExpectation.findMany({
        where: { daybookEntryId: testEntryWithExpectationsId },
      });
      expect(expectationsAfter).toHaveLength(0);
    });

    test('should not allow deleting other users\' entries', async () => {
      const response = await request(app)
        .delete(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Daybook entry not found');

      // Verify entry still exists
      const checkResponse = await request(app)
        .get(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.status).toBe(200);
    });

    test('should return 404 for non-existent entry', async () => {
      const response = await request(app)
        .delete('/api/daybook-entries/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Daybook entry not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/daybook-entries/${testEntryId}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');

      // Verify entry still exists
      const checkResponse = await request(app)
        .get(`/api/daybook-entries/${testEntryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.status).toBe(200);
    });
  });

  describe('INSIGHTS Endpoint (GET /api/daybook-entries/insights/summary)', () => {
    beforeEach(async () => {
      // Create multiple entries for analytics testing
      const entriesData = [
        {
          userId,
          date: new Date('2024-09-01T00:00:00Z'),
          whatWorked: 'Interactive activities engaged students',
          whatDidntWork: 'Ran out of time for conclusion',
          nextSteps: 'Allow more time for wrap-up',
          overallRating: 4,
          wouldReuseLesson: true,
        },
        {
          userId,
          date: new Date('2024-09-02T00:00:00Z'),
          whatWorked: 'Group work was very effective',
          whatDidntWork: 'Some students distracted during instruction',
          nextSteps: 'Use attention-getting strategies',
          overallRating: 3,
          wouldReuseLesson: false,
        },
        {
          userId,
          date: new Date('2024-09-03T00:00:00Z'),
          whatWorked: 'Visual aids helped comprehension',
          whatDidntWork: 'Technology issues slowed progress',
          nextSteps: 'Have backup plans ready',
          overallRating: 5,
          wouldReuseLesson: true,
        },
      ];

      await prisma.daybookEntry.createMany({
        data: entriesData,
      });
    });

    test('should generate insights summary', async () => {
      const response = await request(app)
        .get('/api/daybook-entries/insights/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.period).toBeDefined();
      expect(response.body.summary).toBeDefined();
      expect(response.body.trends).toBeDefined();
      expect(response.body.commonThemes).toBeDefined();
      expect(response.body.recommendations).toBeDefined();
    });

    test('should calculate summary statistics', async () => {
      const response = await request(app)
        .get('/api/daybook-entries/insights/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.summary.totalEntries).toBeGreaterThan(0);
      expect(response.body.summary.averageRating).toBeGreaterThan(0);
      expect(response.body.summary.averageRating).toBeLessThanOrEqual(5);
      expect(response.body.summary.reusePercentage).toBeGreaterThanOrEqual(0);
      expect(response.body.summary.reusePercentage).toBeLessThanOrEqual(100);
    });

    test('should filter insights by date range', async () => {
      const response = await request(app)
        .get('/api/daybook-entries/insights/summary')
        .query({
          startDate: '2024-09-01T00:00:00Z',
          endDate: '2024-09-02T23:59:59Z'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.period.start).toBe('2024-09-01T00:00:00Z');
      expect(response.body.period.end).toBe('2024-09-02T23:59:59Z');
      expect(response.body.summary.totalEntries).toBeLessThanOrEqual(2);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/daybook-entries/insights/summary');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    test('should handle empty results gracefully', async () => {
      const response = await request(app)
        .get('/api/daybook-entries/insights/summary')
        .query({
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-01-02T00:00:00Z'
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.summary.totalEntries).toBe(0);
      expect(response.body.recommendations).toBeDefined();
      expect(response.body.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Student Engagement Tracking', () => {
    test('should track engagement patterns in reflection fields', async () => {
      const entryData = {
        date: '2024-09-26T00:00:00Z',
        classEngagement: 'High engagement during hands-on activities. Students were actively participating and asking questions.',
        commonChallenges: 'Some students struggled with multi-step problems. Need to break down complex tasks.',
        notableAchievements: 'Three students who usually struggle showed significant improvement today.',
        whatWorked: 'Interactive whiteboard activities kept everyone focused',
        nextSteps: 'Continue with interactive approach, add more visual supports',
        overallRating: 4,
      };

      const response = await request(app)
        .post('/api/daybook-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .send(entryData);

      expect(response.status).toBe(201);
      expect(response.body.classEngagement).toBe(entryData.classEngagement);
      expect(response.body.commonChallenges).toBe(entryData.commonChallenges);
      expect(response.body.notableAchievements).toBe(entryData.notableAchievements);
    });

    test('should validate rating scale (1-5) properly', async () => {
      const testCases = [
        { rating: 1, shouldPass: true },
        { rating: 2, shouldPass: true },
        { rating: 3, shouldPass: true },
        { rating: 4, shouldPass: true },
        { rating: 5, shouldPass: true },
        { rating: 0, shouldPass: false },
        { rating: 6, shouldPass: false },
      ];

      for (const testCase of testCases) {
        const entryData = {
          date: `2024-10-${String(testCase.rating + 10).padStart(2, '0')}T00:00:00Z`,
          overallRating: testCase.rating,
          notes: `Test rating ${testCase.rating}`,
        };

        const response = await request(app)
          .post('/api/daybook-entries')
          .set('Authorization', `Bearer ${authToken}`)
          .send(entryData);

        if (testCase.shouldPass) {
          expect(response.status).toBe(201);
          expect(response.body.overallRating).toBe(testCase.rating);
        } else {
          expect(response.status).toBe(400);
          // Check the actual structure of the error response
          expect(response.body.error || response.body.message || response.body.errors).toBeDefined();
        }
      }
    });
  });
});