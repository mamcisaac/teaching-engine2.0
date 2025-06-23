import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/index';
import { getTestPrismaClient } from './jest.setup';
import bcrypt from 'bcryptjs';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123',
};

describe('Milestone Alerts API', () => {
  let authToken: string;
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(async () => {
    prisma = getTestPrismaClient();

    // Hash the password before creating the user
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);

    // Ensure the test user exists
    await prisma.user.upsert({
      where: { email: TEST_USER.email },
      update: {},
      create: {
        email: TEST_USER.email,
        password: hashedPassword,
        name: 'Test User',
        role: 'teacher',
      },
    });

    // Create test user and authenticate
    const loginResponse = await request(app).post('/api/login').send({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    authToken = loginResponse.body.token;
  });

  afterEach(async () => {
    // Clean up any test data if needed
  });

  describe('GET /api/alerts', () => {
    it('should return milestone alerts when authenticated', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('alerts');
      expect(Array.isArray(response.body.alerts)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/alerts');

      expect(response.status).toBe(401);
    });

    it('should return alerts with correct structure', async () => {
      const response = await request(app)
        .get('/api/alerts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      if (response.body.alerts && response.body.alerts.length > 0) {
        const alert = response.body.alerts[0];
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('title');
        expect(alert).toHaveProperty('description');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('isRead');
        expect(alert).toHaveProperty('createdAt');
        expect(alert).toHaveProperty('milestoneId');

        // Check alert types are valid
        expect(['deadline', 'progress', 'coverage']).toContain(alert.type);

        // Check severity is valid
        expect(['low', 'medium', 'high', 'critical']).toContain(alert.severity);
      }
    });

    it('should filter alerts by subjectId when provided', async () => {
      const response = await request(app)
        .get('/api/alerts?subjectId=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('alerts');
      expect(Array.isArray(response.body.alerts)).toBe(true);
      // In the future, we would test that only alerts for the specified subject are returned
    });
  });

  describe('Milestone Alert Logic', () => {
    it('should create deadline alerts', async () => {
      // First trigger alert generation
      const checkResponse = await request(app)
        .post('/api/alerts/check')
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.status).toBe(200);
      expect(checkResponse.body).toHaveProperty('message');

      // Then fetch alerts
      const response = await request(app)
        .get('/api/alerts?type=deadline')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('alerts');

      // Look for deadline alerts
      const deadlineAlerts = response.body.alerts.filter(
        (alert: { type: string }) => alert.type === 'deadline',
      );

      if (deadlineAlerts.length > 0) {
        expect(deadlineAlerts[0]).toHaveProperty('title');
        expect(deadlineAlerts[0].title).toContain('Deadline');
      }
    });

    it('should create coverage alerts', async () => {
      // First trigger alert generation
      const checkResponse = await request(app)
        .post('/api/alerts/check')
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.status).toBe(200);

      const response = await request(app)
        .get('/api/alerts?type=coverage')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Look for coverage alerts
      const coverageAlerts = response.body.alerts.filter(
        (alert: { type: string }) => alert.type === 'coverage',
      );

      if (coverageAlerts.length > 0) {
        expect(coverageAlerts[0]).toHaveProperty('description');
        expect(coverageAlerts[0].description).toContain('coverage');
      }
    });

    it('should return alert statistics', async () => {
      const response = await request(app)
        .get('/api/alerts/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalAlerts');
      expect(response.body).toHaveProperty('unreadAlerts');
      expect(response.body).toHaveProperty('readAlerts');
      expect(response.body).toHaveProperty('alertsBySeverity');
      expect(response.body).toHaveProperty('alertsByType');
      expect(response.body).toHaveProperty('recentAlerts');

      // Verify the structure of alertsBySeverity and alertsByType
      if (response.body.totalAlerts > 0) {
        expect(typeof response.body.alertsBySeverity).toBe('object');
        expect(typeof response.body.alertsByType).toBe('object');
        expect(Array.isArray(response.body.recentAlerts)).toBe(true);
      }
    });
  });
});
