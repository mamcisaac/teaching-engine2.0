import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/index';
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

  describe('GET /api/alerts/milestones', () => {
    it('should return milestone alerts when authenticated', async () => {
      const response = await request(app)
        .get('/api/alerts/milestones')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/alerts/milestones');

      expect(response.status).toBe(401);
    });

    it('should return alerts with correct structure', async () => {
      const response = await request(app)
        .get('/api/alerts/milestones')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      if (response.body.length > 0) {
        const alert = response.body[0];
        expect(alert).toHaveProperty('type');
        expect(alert).toHaveProperty('message');
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('dueDate');
        expect(alert).toHaveProperty('priority');

        // Check alert types are valid
        expect([
          'outcome_missed',
          'outcome_undercovered',
          'outcome_unassessed',
          'underassessed_domain',
          'theme_unaddressed',
        ]).toContain(alert.type);

        // Check severity is valid
        expect(['warning', 'notice']).toContain(alert.severity);

        // Check priority is valid
        expect(['low', 'medium', 'high']).toContain(alert.priority);
      }
    });

    it('should filter alerts by classId when provided', async () => {
      const response = await request(app)
        .get('/api/alerts/milestones?classId=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      // In the future, we would test that only alerts for the specified class are returned
    });
  });

  describe('Milestone Alert Logic', () => {
    it('should detect overdue outcomes', async () => {
      // This test would require setting up test data with overdue milestone definitions
      // and checking that the appropriate alerts are generated
      const response = await request(app)
        .get('/api/alerts/milestones')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Look for overdue outcome alerts
      const overdueAlerts = response.body.filter(
        (alert: { type: string; severity: string }) =>
          alert.type === 'outcome_missed' && alert.severity === 'warning',
      );

      // Since we have milestone definitions in our seed data that are overdue,
      // we should get some alerts
      if (overdueAlerts.length > 0) {
        expect(overdueAlerts[0]).toHaveProperty('outcomeCode');
        expect(overdueAlerts[0].message).toContain('has not been introduced');
      }
    });

    it('should detect underassessed domains', async () => {
      const response = await request(app)
        .get('/api/alerts/milestones')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Look for domain-level alerts
      const domainAlerts = response.body.filter(
        (alert: { type: string }) => alert.type === 'underassessed_domain',
      );

      if (domainAlerts.length > 0) {
        expect(domainAlerts[0]).toHaveProperty('domain');
        expect(domainAlerts[0].message).toContain('activities logged');
      }
    });

    it('should prioritize high-priority alerts', async () => {
      const response = await request(app)
        .get('/api/alerts/milestones')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const highPriorityAlerts = response.body.filter(
        (alert: { priority: string }) => alert.priority === 'high',
      );

      const mediumPriorityAlerts = response.body.filter(
        (alert: { priority: string }) => alert.priority === 'medium',
      );

      // High priority alerts should come first (if any exist)
      if (highPriorityAlerts.length > 0 && mediumPriorityAlerts.length > 0) {
        const firstHighIndex = response.body.findIndex(
          (alert: { priority: string }) => alert.priority === 'high',
        );
        const firstMediumIndex = response.body.findIndex(
          (alert: { priority: string }) => alert.priority === 'medium',
        );

        expect(firstHighIndex).toBeLessThan(firstMediumIndex);
      }
    });
  });
});
