import { describe, it, expect, beforeEach } from '@jest/globals';
import { app } from '../src/index.js';
import { authRequest } from './test-auth-helper.js';
import { getTestPrismaClient } from './jest.setup.js';
import bcrypt from 'bcryptjs';

const auth = authRequest(app);
let prisma: ReturnType<typeof getTestPrismaClient>;

describe('Parent Message API', () => {
  beforeEach(async () => {
    prisma = getTestPrismaClient();

    // Create test user before each test
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'teacher',
      },
    });

    // Setup auth after creating user
    await auth.setup();
  });

  describe('POST /api/parent-messages', () => {
    it('should create a new parent message', async () => {
      const messageData = {
        title: 'Winter Theme Newsletter',
        timeframe: 'Week of Jan 12-19, 2026',
        contentFr: "Cette semaine, nous avons exploré le thème de l'hiver...",
        contentEn: 'This week, we explored the theme of winter...',
        linkedOutcomeIds: [],
        linkedActivityIds: [],
      };

      const response = await auth.post('/api/parent-messages').send(messageData).expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        title: messageData.title,
        timeframe: messageData.timeframe,
        contentFr: messageData.contentFr,
        contentEn: messageData.contentEn,
      });
    });

    it('should create a parent message with linked outcomes and activities', async () => {
      // Create test data
      const subject = await prisma.subject.create({
        data: {
          name: 'French',
          userId: auth.userId!,
        },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Winter Vocabulary',
          subjectId: subject.id,
          userId: 1,
        },
      });

      const activity = await prisma.activity.create({
        data: {
          title: 'Winter Words Practice',
          milestoneId: milestone.id,
          userId: 1,
        },
      });

      const outcome = await prisma.outcome.create({
        data: {
          id: 'test-outcome-1',
          subject: 'French',
          grade: 1,
          code: 'FR1.1',
          description: 'Use winter vocabulary in sentences',
        },
      });

      const messageData = {
        title: 'Winter Theme Newsletter',
        timeframe: 'Week of Jan 12-19, 2026',
        contentFr: "Cette semaine, nous avons exploré le thème de l'hiver...",
        contentEn: 'This week, we explored the theme of winter...',
        linkedOutcomeIds: [outcome.id],
        linkedActivityIds: [activity.id],
      };

      const response = await auth.post('/api/parent-messages').send(messageData).expect(201);

      expect(response.body.linkedOutcomes).toHaveLength(1);
      expect(response.body.linkedOutcomes[0].outcome.id).toBe(outcome.id);
      expect(response.body.linkedActivities).toHaveLength(1);
      expect(response.body.linkedActivities[0].activity.id).toBe(activity.id);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        title: '', // Empty title
        timeframe: 'Week 1',
        contentFr: 'Content',
        contentEn: 'Content',
      };

      const response = await auth.post('/api/parent-messages').send(invalidData).expect(400);

      expect(response.body.errors || response.body.error || response.body.message).toBeDefined();
    });
  });

  describe('GET /api/parent-messages', () => {
    it('should return all parent messages for the authenticated user', async () => {
      // Create test messages
      await prisma.parentMessage.createMany({
        data: [
          {
            userId: 1,
            title: 'Newsletter 1',
            timeframe: 'Week 1',
            contentFr: 'Contenu 1',
            contentEn: 'Content 1',
          },
          {
            userId: 1,
            title: 'Newsletter 2',
            timeframe: 'Week 2',
            contentFr: 'Contenu 2',
            contentEn: 'Content 2',
          },
        ],
      });

      const response = await auth.get('/api/parent-messages').expect(200);

      expect(response.body).toHaveLength(2);
      // Check that both newsletters are returned (order may vary)
      const titles = response.body.map((m: { title: string }) => m.title);
      expect(titles).toContain('Newsletter 1');
      expect(titles).toContain('Newsletter 2');
    });

    it('should not return messages from other users', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other@example.com',
          password: await bcrypt.hash('password', 10),
          name: 'Other User',
          role: 'teacher',
        },
      });

      // Create message for another user
      await prisma.parentMessage.create({
        data: {
          userId: otherUser.id,
          title: 'Other User Newsletter',
          timeframe: 'Week 1',
          contentFr: 'Contenu',
          contentEn: 'Content',
        },
      });

      // Create message for current user
      await prisma.parentMessage.create({
        data: {
          userId: 1,
          title: 'My Newsletter',
          timeframe: 'Week 1',
          contentFr: 'Contenu',
          contentEn: 'Content',
        },
      });

      const response = await auth.get('/api/parent-messages').expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].title).toBe('My Newsletter');
    });
  });

  describe('GET /api/parent-messages/:id', () => {
    it('should return a specific parent message', async () => {
      const message = await prisma.parentMessage.create({
        data: {
          userId: 1,
          title: 'Test Newsletter',
          timeframe: 'Week 1',
          contentFr: 'Contenu test',
          contentEn: 'Test content',
        },
      });

      const response = await auth.get(`/api/parent-messages/${message.id}`).expect(200);

      expect(response.body).toMatchObject({
        id: message.id,
        title: message.title,
        timeframe: message.timeframe,
        contentFr: message.contentFr,
        contentEn: message.contentEn,
      });
    });

    it('should return 404 for non-existent message', async () => {
      await auth.get('/api/parent-messages/999999').expect(404);
    });

    it('should not return messages from other users', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other2@example.com',
          password: await bcrypt.hash('password', 10),
          name: 'Other User 2',
          role: 'teacher',
        },
      });

      const message = await prisma.parentMessage.create({
        data: {
          userId: otherUser.id,
          title: 'Other User Newsletter',
          timeframe: 'Week 1',
          contentFr: 'Contenu',
          contentEn: 'Content',
        },
      });

      await auth.get(`/api/parent-messages/${message.id}`).expect(404);
    });
  });

  describe('PUT /api/parent-messages/:id', () => {
    it('should update a parent message', async () => {
      const message = await prisma.parentMessage.create({
        data: {
          userId: 1,
          title: 'Original Title',
          timeframe: 'Week 1',
          contentFr: 'Contenu original',
          contentEn: 'Original content',
        },
      });

      const updateData = {
        title: 'Updated Title',
        contentEn: 'Updated content',
      };

      const response = await auth
        .put(`/api/parent-messages/${message.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: message.id,
        title: updateData.title,
        timeframe: message.timeframe,
        contentFr: message.contentFr,
        contentEn: updateData.contentEn,
      });
    });

    it('should update linked outcomes and activities', async () => {
      // Create test data
      const subject = await prisma.subject.create({
        data: {
          name: 'Math',
          userId: 1,
        },
      });

      const milestone = await prisma.milestone.create({
        data: {
          title: 'Numbers',
          subjectId: subject.id,
          userId: 1,
        },
      });

      const activity1 = await prisma.activity.create({
        data: {
          title: 'Activity 1',
          milestoneId: milestone.id,
          userId: 1,
        },
      });

      const activity2 = await prisma.activity.create({
        data: {
          title: 'Activity 2',
          milestoneId: milestone.id,
          userId: 1,
        },
      });

      const message = await prisma.parentMessage.create({
        data: {
          userId: 1,
          title: 'Test Newsletter',
          timeframe: 'Week 1',
          contentFr: 'Contenu',
          contentEn: 'Content',
          linkedActivities: {
            create: [{ activityId: activity1.id }],
          },
        },
      });

      const updateData = {
        linkedActivityIds: [activity2.id],
      };

      const response = await auth
        .put(`/api/parent-messages/${message.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.linkedActivities).toHaveLength(1);
      expect(response.body.linkedActivities[0].activity.id).toBe(activity2.id);
    });
  });

  describe('DELETE /api/parent-messages/:id', () => {
    it('should delete a parent message', async () => {
      const message = await prisma.parentMessage.create({
        data: {
          userId: 1,
          title: 'To Delete',
          timeframe: 'Week 1',
          contentFr: 'À supprimer',
          contentEn: 'To delete',
        },
      });

      await auth.delete(`/api/parent-messages/${message.id}`).expect(204);

      // Verify deletion
      const deletedMessage = await prisma.parentMessage.findUnique({
        where: { id: message.id },
      });
      expect(deletedMessage).toBeNull();
    });

    it('should not delete messages from other users', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          email: 'other3@example.com',
          password: await bcrypt.hash('password', 10),
          name: 'Other User 3',
          role: 'teacher',
        },
      });

      const message = await prisma.parentMessage.create({
        data: {
          userId: otherUser.id,
          title: 'Other User Newsletter',
          timeframe: 'Week 1',
          contentFr: 'Contenu',
          contentEn: 'Content',
        },
      });

      await auth.delete(`/api/parent-messages/${message.id}`).expect(404);

      // Verify message still exists
      const stillExists = await prisma.parentMessage.findUnique({
        where: { id: message.id },
      });
      expect(stillExists).not.toBeNull();
    });
  });
});
