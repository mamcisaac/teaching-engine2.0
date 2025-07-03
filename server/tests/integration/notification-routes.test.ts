import request from 'supertest';
import { describe, beforeAll, beforeEach, it, expect, jest } from '@jest/globals';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import bcrypt from 'bcryptjs';
import { notificationService } from '../../src/services/notificationService';

// Mock the notification service
jest.mock('../../src/services/notificationService');

describe('Notification Routes', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  let authToken: string;
  let testUserId: number;
  let testNotificationId: string;

  beforeAll(async () => {
    prisma = getTestPrismaClient();
  });

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        password: hashedPassword,
        name: 'Test User',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
    testUserId = testUser.id;

    // Login to get auth token
    const loginRes = await request(app).post('/api/login').send({
      email: testUser.email,
      password: 'test123',
    });
    authToken = loginRes.body.accessToken;

    // Set up default notification ID
    testNotificationId = `notification-${Date.now()}`;
  });

  describe('GET /api/notifications', () => {
    it('should get user notifications with default parameters', async () => {
      const mockNotifications = {
        notifications: [
          {
            id: 'notif1',
            userId: testUserId,
            type: 'info',
            title: 'Test Notification',
            message: 'This is a test',
            priority: 'medium',
            read: false,
            createdAt: new Date(),
          },
        ],
        total: 1,
        unreadCount: 1,
      };

      (notificationService.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockNotifications);
      expect(notificationService.getUserNotifications).toHaveBeenCalledWith(testUserId, {
        limit: 50,
        offset: 0,
        unreadOnly: false,
      });
    });

    it('should get notifications with custom parameters', async () => {
      const mockNotifications = {
        notifications: [],
        total: 0,
        unreadCount: 0,
      };

      (notificationService.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      const res = await request(app)
        .get('/api/notifications?limit=20&offset=10&unread=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(notificationService.getUserNotifications).toHaveBeenCalledWith(testUserId, {
        limit: 20,
        offset: 10,
        unreadOnly: true,
      });
    });

    it('should enforce maximum limit', async () => {
      const mockNotifications = {
        notifications: [],
        total: 0,
        unreadCount: 0,
      };

      (notificationService.getUserNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      const res = await request(app)
        .get('/api/notifications?limit=200')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(notificationService.getUserNotifications).toHaveBeenCalledWith(testUserId, {
        limit: 100, // Maximum enforced
        offset: 0,
        unreadOnly: false,
      });
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });

    it('should handle service errors', async () => {
      (notificationService.getUserNotifications as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/notifications/mark-read', () => {
    it('should mark notification as read', async () => {
      (notificationService.markAsRead as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notificationId: testNotificationId,
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(notificationService.markAsRead).toHaveBeenCalledWith(testNotificationId, testUserId);
    });

    it('should return 404 if notification not found', async () => {
      (notificationService.markAsRead as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notificationId: 'non-existent',
        });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Notification not found' });
    });

    it('should return 400 with invalid data', async () => {
      const res = await request(app)
        .post('/api/notifications/mark-read')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          notificationId: '', // Empty ID
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid request data');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .post('/api/notifications/mark-read')
        .send({
          notificationId: testNotificationId,
        });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/notifications/mark-all-read', () => {
    it('should mark all notifications as read', async () => {
      (notificationService.markAllAsRead as jest.Mock).mockResolvedValue(5);

      const res = await request(app)
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, markedCount: 5 });
      expect(notificationService.markAllAsRead).toHaveBeenCalledWith(testUserId);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).post('/api/notifications/mark-all-read');
      expect(res.status).toBe(401);
    });

    it('should handle service errors', async () => {
      (notificationService.markAllAsRead as jest.Mock).mockRejectedValue(
        new Error('Service error')
      );

      const res = await request(app)
        .post('/api/notifications/mark-all-read')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/notifications/:id', () => {
    it('should delete notification', async () => {
      (notificationService.deleteNotification as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .delete(`/api/notifications/${testNotificationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);
      expect(notificationService.deleteNotification).toHaveBeenCalledWith(
        testNotificationId,
        testUserId
      );
    });

    it('should return 404 if notification not found', async () => {
      (notificationService.deleteNotification as jest.Mock).mockResolvedValue(false);

      const res = await request(app)
        .delete('/api/notifications/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Notification not found' });
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).delete(`/api/notifications/${testNotificationId}`);
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/notifications/preferences', () => {
    it('should get user notification preferences', async () => {
      const mockPreferences = {
        emailEnabled: true,
        pushEnabled: false,
        quietHours: {
          start: '22:00',
          end: '08:00',
        },
        categories: {
          planning: {
            enabled: true,
            channels: ['in_app', 'email'],
          },
          reminders: {
            enabled: true,
            channels: ['in_app'],
          },
        },
      };

      (notificationService.getUserPreferences as jest.Mock).mockResolvedValue(mockPreferences);

      const res = await request(app)
        .get('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPreferences);
      expect(notificationService.getUserPreferences).toHaveBeenCalledWith(testUserId);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/notifications/preferences');
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/preferences', () => {
    it('should update notification preferences', async () => {
      const updateData = {
        emailEnabled: false,
        quietHours: {
          start: '21:00',
          end: '07:00',
        },
      };

      const updatedPreferences = {
        emailEnabled: false,
        pushEnabled: true,
        quietHours: {
          start: '21:00',
          end: '07:00',
        },
        categories: {},
      };

      (notificationService.updatePreferences as jest.Mock).mockResolvedValue(undefined);
      (notificationService.getUserPreferences as jest.Mock).mockResolvedValue(updatedPreferences);

      const res = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedPreferences);
      expect(notificationService.updatePreferences).toHaveBeenCalledWith(testUserId, updateData);
    });

    it('should validate quiet hours format', async () => {
      const res = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          quietHours: {
            start: 'invalid',
            end: '07:00',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid request data');
    });

    it('should validate categories structure', async () => {
      const res = await request(app)
        .put('/api/notifications/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categories: {
            planning: {
              enabled: true,
              channels: ['invalid_channel'],
            },
          },
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'Invalid request data');
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app)
        .put('/api/notifications/preferences')
        .send({ emailEnabled: false });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/notifications/test', () => {
    it('should send test notification in non-production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      (notificationService.sendNotification as jest.Mock).mockResolvedValue('test-notif-id');

      const res = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, notificationId: 'test-notif-id' });
      expect(notificationService.sendNotification).toHaveBeenCalledWith(testUserId, {
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification from Teaching Engine 2.0.',
        priority: 'low',
        channels: ['in_app'],
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should return 403 in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const res = await request(app)
        .post('/api/notifications/test')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Test notifications not available in production' });

      process.env.NODE_ENV = originalEnv;
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).post('/api/notifications/test');
      expect(res.status).toBe(401);
    });
  });
});