import request from 'supertest';
import { describe, beforeAll, beforeEach, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import bcrypt from 'bcryptjs';

describe('Newsletter Routes', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  let authToken: string;
  let testUserId: number;
  let testStudentId: number;
  let testNewsletterId: string;

  beforeAll(async () => {
    prisma = getTestPrismaClient();
  });

  beforeEach(async () => {
    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: hashedPassword,
        name: 'Test Teacher',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
    testUserId = testUser.id;

    // Create test student
    const testStudent = await prisma.student.create({
      data: {
        userId: testUserId,
        firstName: 'Test',
        lastName: 'Student',
        dateOfBirth: new Date('2015-01-01'),
        grade: '3',
      },
    });
    testStudentId = testStudent.id;

    // Create test daybook entry
    await prisma.daybookEntry.create({
      data: {
        userId: testUserId,
        date: new Date(),
        reflections: 'Test reflection',
        notes: 'Test notes',
      },
    });

    // Login to get auth token
    const loginRes = await request(app).post('/api/login').send({
      email: testUser.email,
      password: 'test123',
    });
    authToken = loginRes.body.accessToken;
  });

  describe('POST /api/newsletters/generate-newsletter', () => {
    it('should generate newsletter content with valid data', async () => {
      const res = await request(app)
        .post('/api/newsletters/generate-newsletter')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentIds: [testStudentId],
          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
          tone: 'friendly',
          focusAreas: ['Mathematics', 'Language Arts'],
          includeArtifacts: true,
          includeReflections: true,
          includeLearningGoals: true,
          includeUpcomingEvents: true,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sections');
      expect(Array.isArray(res.body.sections)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/newsletters/generate-newsletter')
        .send({
          studentIds: [testStudentId],
          from: new Date().toISOString(),
          to: new Date().toISOString(),
        });

      expect(res.status).toBe(401);
    });

    it('should return 400 with invalid data', async () => {
      const res = await request(app)
        .post('/api/newsletters/generate-newsletter')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentIds: 'invalid',
          from: 'invalid-date',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid request data');
    });

    it('should return 404 for non-existent students', async () => {
      const res = await request(app)
        .post('/api/newsletters/generate-newsletter')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentIds: [999999],
          from: new Date().toISOString(),
          to: new Date().toISOString(),
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'One or more students not found');
    });
  });

  describe('POST /api/newsletters/regenerate-newsletter', () => {
    it('should regenerate newsletter with variations', async () => {
      const res = await request(app)
        .post('/api/newsletters/regenerate-newsletter')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sections: [
            {
              id: 'section1',
              title: 'Test Section',
              titleFr: 'Section Test',
              content: 'Test content',
              contentFr: 'Contenu test',
              isEditable: true,
              order: 1,
            },
          ],
          studentIds: [testStudentId],
          from: new Date().toISOString(),
          to: new Date().toISOString(),
          tone: 'formal',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('sections');
      expect(res.body.sections[0].content).toContain('(Regenerated)');
    });
  });

  describe('GET /api/newsletters', () => {
    beforeEach(async () => {
      // Create test newsletter
      const newsletter = await prisma.newsletter.create({
        data: {
          userId: testUserId,
          title: 'Test Newsletter',
          titleFr: 'Bulletin Test',
          studentIds: [testStudentId],
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          dateTo: new Date(),
          tone: 'friendly',
          sections: [
            {
              id: 'section1',
              title: 'Weekly Update',
              content: 'This week we learned...',
            },
          ],
          isDraft: true,
        },
      });
      testNewsletterId = newsletter.id;
    });

    it('should get all newsletters for authenticated user', async () => {
      const res = await request(app)
        .get('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title', 'Test Newsletter');
    });

    it('should filter by draft status', async () => {
      const res = await request(app)
        .get('/api/newsletters?isDraft=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every((n: any) => n.isDraft === true)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/newsletters');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/newsletters/:id', () => {
    beforeEach(async () => {
      // Create test newsletter
      const newsletter = await prisma.newsletter.create({
        data: {
          userId: testUserId,
          title: 'Test Newsletter',
          titleFr: 'Bulletin Test',
          studentIds: [testStudentId],
          dateFrom: new Date(),
          dateTo: new Date(),
          tone: 'friendly',
          sections: [],
          isDraft: true,
        },
      });
      testNewsletterId = newsletter.id;
    });

    it('should get specific newsletter', async () => {
      const res = await request(app)
        .get(`/api/newsletters/${testNewsletterId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testNewsletterId);
      expect(res.body).toHaveProperty('title', 'Test Newsletter');
    });

    it('should return 404 for non-existent newsletter', async () => {
      const res = await request(app)
        .get('/api/newsletters/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should not return newsletter from another user', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          password: 'hashed',
          name: 'Other User',
          role: 'teacher',
        },
      });

      // Create newsletter for other user
      const otherNewsletter = await prisma.newsletter.create({
        data: {
          userId: otherUser.id,
          title: 'Other Newsletter',
          titleFr: 'Autre Bulletin',
          studentIds: [],
          dateFrom: new Date(),
          dateTo: new Date(),
          tone: 'formal',
          sections: [],
          isDraft: true,
        },
      });

      const res = await request(app)
        .get(`/api/newsletters/${otherNewsletter.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/newsletters', () => {
    it('should create new newsletter', async () => {
      const newsletterData = {
        title: 'New Newsletter',
        titleFr: 'Nouveau Bulletin',
        studentIds: [testStudentId],
        dateFrom: new Date().toISOString(),
        dateTo: new Date().toISOString(),
        tone: 'informative',
        sections: [
          {
            id: 'intro',
            title: 'Introduction',
            titleFr: 'Introduction',
            content: 'Welcome to this week\'s newsletter',
            contentFr: 'Bienvenue au bulletin de cette semaine',
            isEditable: true,
            order: 1,
          },
        ],
        isDraft: true,
      };

      const res = await request(app)
        .post('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newsletterData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('title', newsletterData.title);
      expect(res.body).toHaveProperty('tone', newsletterData.tone);
    });

    it('should return 400 with invalid data', async () => {
      const res = await request(app)
        .post('/api/newsletters')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Empty title
          studentIds: 'not-an-array',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/newsletters/:id', () => {
    beforeEach(async () => {
      // Create test newsletter
      const newsletter = await prisma.newsletter.create({
        data: {
          userId: testUserId,
          title: 'Original Title',
          titleFr: 'Titre Original',
          studentIds: [testStudentId],
          dateFrom: new Date(),
          dateTo: new Date(),
          tone: 'friendly',
          sections: [],
          isDraft: true,
        },
      });
      testNewsletterId = newsletter.id;
    });

    it('should update existing newsletter', async () => {
      const updateData = {
        title: 'Updated Title',
        titleFr: 'Titre Mis à Jour',
        studentIds: [testStudentId],
        dateFrom: new Date().toISOString(),
        dateTo: new Date().toISOString(),
        tone: 'formal',
        sections: [
          {
            id: 'new-section',
            title: 'New Section',
            titleFr: 'Nouvelle Section',
            content: 'Updated content',
            contentFr: 'Contenu mis à jour',
            isEditable: true,
            order: 1,
          },
        ],
        isDraft: false,
      };

      const res = await request(app)
        .put(`/api/newsletters/${testNewsletterId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('title', updateData.title);
      expect(res.body).toHaveProperty('tone', updateData.tone);
      expect(res.body).toHaveProperty('isDraft', false);
    });

    it('should return 404 for non-existent newsletter', async () => {
      const res = await request(app)
        .put('/api/newsletters/non-existent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated',
          titleFr: 'Mis à jour',
          studentIds: [],
          dateFrom: new Date().toISOString(),
          dateTo: new Date().toISOString(),
          tone: 'friendly',
          sections: [],
          isDraft: true,
        });

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/newsletters/:id/send', () => {
    beforeEach(async () => {
      // Create draft newsletter
      const newsletter = await prisma.newsletter.create({
        data: {
          userId: testUserId,
          title: 'Newsletter to Send',
          titleFr: 'Bulletin à Envoyer',
          studentIds: [testStudentId],
          dateFrom: new Date(),
          dateTo: new Date(),
          tone: 'friendly',
          sections: [],
          isDraft: true,
        },
      });
      testNewsletterId = newsletter.id;
    });

    it('should send newsletter and mark as sent', async () => {
      const res = await request(app)
        .post(`/api/newsletters/${testNewsletterId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Newsletter sent successfully');

      // Verify newsletter is marked as sent
      const updatedNewsletter = await prisma.newsletter.findUnique({
        where: { id: testNewsletterId },
      });
      expect(updatedNewsletter?.isDraft).toBe(false);
      expect(updatedNewsletter?.sentAt).toBeTruthy();
    });

    it('should return 400 if newsletter already sent', async () => {
      // Mark newsletter as sent
      await prisma.newsletter.update({
        where: { id: testNewsletterId },
        data: { isDraft: false, sentAt: new Date() },
      });

      const res = await request(app)
        .post(`/api/newsletters/${testNewsletterId}/send`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Newsletter already sent');
    });
  });

  describe('DELETE /api/newsletters/:id', () => {
    beforeEach(async () => {
      // Create test newsletter
      const newsletter = await prisma.newsletter.create({
        data: {
          userId: testUserId,
          title: 'Newsletter to Delete',
          titleFr: 'Bulletin à Supprimer',
          studentIds: [testStudentId],
          dateFrom: new Date(),
          dateTo: new Date(),
          tone: 'friendly',
          sections: [],
          isDraft: true,
        },
      });
      testNewsletterId = newsletter.id;
    });

    it('should delete newsletter', async () => {
      const res = await request(app)
        .delete(`/api/newsletters/${testNewsletterId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verify newsletter is deleted
      const deletedNewsletter = await prisma.newsletter.findUnique({
        where: { id: testNewsletterId },
      });
      expect(deletedNewsletter).toBeNull();
    });

    it('should return 404 for non-existent newsletter', async () => {
      const res = await request(app)
        .delete('/api/newsletters/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/newsletters/suggestions', () => {
    it('should get newsletter suggestions', async () => {
      const res = await request(app)
        .get('/api/newsletters/suggestions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('students');
      expect(res.body).toHaveProperty('dateRanges');
      expect(res.body).toHaveProperty('toneOptions');
      expect(res.body).toHaveProperty('focusAreas');
      expect(res.body).toHaveProperty('recentTopics');
      expect(Array.isArray(res.body.students)).toBe(true);
      expect(Array.isArray(res.body.dateRanges)).toBe(true);
      expect(Array.isArray(res.body.toneOptions)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/newsletters/suggestions');
      expect(res.status).toBe(401);
    });
  });
});