import request from 'supertest';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup.js';
import { seedTestData } from '../helpers/testDataSeeder';
import { createAuthToken } from '../test-auth-helper';

describe('Messenger Agent Core Integration Tests', () => {
  let authToken: string;
  let userId: number;
  let testData: import('../helpers/testDataSeeder').TestDataSeed;
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(async () => {
    prisma = getTestPrismaClient();
    
    // Seed test data for each test
    testData = await seedTestData(prisma);
    userId = testData.users[0].id;
    authToken = createAuthToken(userId);
  });

  // No cleanup needed - test setup handles via transactions

  describe('Email Templates API - Core Functions', () => {
    // Tests run in isolated transactions - no cleanup needed

    it('should get all email templates for authenticated user', async () => {
      const response = await request(app)
        .get('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(0);
      
      // If templates exist, validate structure
      if (response.body.length > 0) {
        const template = response.body[0];
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('subject');
        expect(template).toHaveProperty('contentFr');
        expect(template).toHaveProperty('contentEn');
        expect(template).toHaveProperty('userId');
        expect(template.userId).toBe(userId);
      }
    });

    it('should create a new email template', async () => {
      const templateData = {
        name: `Test Integration Template ${Date.now()}`,
        subject: 'Test Subject - {studentName}',
        contentFr: 'Contenu français pour {studentName}',
        contentEn: 'English content for {studentName}',
        variables: ['studentName', 'parentName']
      };

      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(201);

      expect(response.body.name).toBe(templateData.name);
      expect(response.body.subject).toBe(templateData.subject);
      expect(response.body.contentFr).toBe(templateData.contentFr);
      expect(response.body.contentEn).toBe(templateData.contentEn);
      expect(response.body.userId).toBe(userId);
      expect(typeof response.body.id).toBe('number');

      // Verify variables are stored as JSON string
      const storedVariables = JSON.parse(response.body.variables);
      expect(storedVariables).toEqual(templateData.variables);
    });

    it('should get a specific template by ID', async () => {
      // First create a template
      const createResponse = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Get Template ${Date.now()}`,
          subject: 'Get Test',
          contentFr: 'Français',
          contentEn: 'English',
          variables: []
        });

      const templateId = createResponse.body.id;

      // Then get it by ID
      const response = await request(app)
        .get(`/api/email-templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(templateId);
      expect(response.body.name).toContain('Test Get Template');
    });

    it('should update an existing template', async () => {
      // Create template first
      const createResponse = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Update Template ${Date.now()}`,
          subject: 'Original Subject',
          contentFr: 'Original FR',
          contentEn: 'Original EN',
          variables: []
        });

      const templateId = createResponse.body.id;

      // Update it
      const updateData = {
        name: `Test Updated Template Name ${Date.now()}`,
        subject: 'Updated Subject'
      };

      const response = await request(app)
        .put(`/api/email-templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.subject).toBe(updateData.subject);
      expect(response.body.contentFr).toBe('Original FR'); // Should remain unchanged
    });

    it('should delete a template', async () => {
      // Create template first
      const createResponse = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Delete Template ${Date.now()}`,
          subject: 'Delete Test',
          contentFr: 'FR',
          contentEn: 'EN',
          variables: []
        });

      const templateId = createResponse.body.id;

      // Delete it
      await request(app)
        .delete(`/api/email-templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify it's gone
      await request(app)
        .get(`/api/email-templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should prevent duplicate template names', async () => {
      const uniqueName = `Test Duplicate Template ${Date.now()}`;
      const templateData = {
        name: uniqueName,
        subject: 'Subject',
        contentFr: 'FR',
        contentEn: 'EN',
        variables: []
      };

      // Create first template
      await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });

    it('should clone a template', async () => {
      // Create original template
      const originalResponse = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test Original Clone Template ${Date.now()}`,
          subject: 'Clone Subject',
          contentFr: 'Clone FR',
          contentEn: 'Clone EN',
          variables: ['var1', 'var2']
        });

      const originalId = originalResponse.body.id;

      // Clone it
      const cloneData = { name: `Test Cloned Template ${Date.now()}` };
      const cloneResponse = await request(app)
        .post(`/api/email-templates/${originalId}/clone`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cloneData)
        .expect(201);

      expect(cloneResponse.body.name).toContain('Test Cloned Template');
      expect(cloneResponse.body.subject).toBe('Clone Subject');
      expect(cloneResponse.body.contentFr).toBe('Clone FR');
      expect(cloneResponse.body.contentEn).toBe('Clone EN');
      expect(cloneResponse.body.variables).toBe(originalResponse.body.variables);
      expect(cloneResponse.body.id).not.toBe(originalId);
    });
  });

  describe('Report Generation API - Core Functions', () => {
    it('should get available report types', async () => {
      const response = await request(app)
        .get('/api/reports/types')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4);

      const reportTypes = response.body.map((t: Record<string, unknown>) => t.id);
      expect(reportTypes).toContain('progress');
      expect(reportTypes).toContain('narrative');
      expect(reportTypes).toContain('term_summary');
      expect(reportTypes).toContain('report_card');

      // Validate structure
      response.body.forEach((reportType: Record<string, unknown>) => {
        expect(reportType).toHaveProperty('id');
        expect(reportType).toHaveProperty('name');
        expect(reportType).toHaveProperty('nameFr');
        expect(reportType).toHaveProperty('description');
        expect(reportType).toHaveProperty('descriptionFr');
      });
    });

    it('should generate a progress report for a student', async () => {
      const student = testData.students[0];
      
      const reportRequest = {
        studentId: student.id,
        reportType: 'progress',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        language: 'en',
        includeAssessments: true,
        includeGoals: true
      };

      const response = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportRequest)
        .expect(200);

      expect(response.body.studentName).toBe(`${student.firstName} ${student.lastName}`);
      expect(response.body.period).toBeDefined();
      expect(Array.isArray(response.body.sections)).toBe(true);
      expect(typeof response.body.overallComments).toBe('string');
      expect(Array.isArray(response.body.nextSteps)).toBe(true);

      // Validate section structure
      response.body.sections.forEach((section: Record<string, unknown>) => {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('content');
        expect(typeof section.title).toBe('string');
        expect(typeof section.content).toBe('string');
      });
    });

    it('should generate a French narrative report', async () => {
      const student = testData.students[1];
      
      const reportRequest = {
        studentId: student.id,
        reportType: 'narrative',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        language: 'fr'
      };

      const response = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportRequest)
        .expect(200);

      expect(response.body.studentName).toBe(`${student.firstName} ${student.lastName}`);
      expect(response.body.sections).toHaveLength(1);
      expect(response.body.sections[0].title).toContain('narratif');
    });

    it('should validate report generation request', async () => {
      const invalidRequest = {
        studentId: 'invalid',
        reportType: 'invalid_type',
        startDate: 'invalid_date'
      };

      const response = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBe('Invalid report data');
      expect(response.body.details).toBeDefined();
    });

    it('should reject access to other users students', async () => {
      // Try to generate report for a non-existent student ID
      const reportRequest = {
        studentId: 99999,
        reportType: 'progress',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        language: 'en'
      };

      await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportRequest)
        .expect(404);
    });
  });

  describe('Email Communication API - Core Functions', () => {
    it('should get email delivery status', async () => {
      const response = await request(app)
        .get('/api/communication/delivery-status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('recent');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.recent)).toBe(true);
      expect(typeof response.body.summary).toBe('object');
    });

    it('should send bulk emails with proper structure', async () => {
      const emailRequest = {
        recipients: [
          {
            email: 'test1@example.com',
            name: 'Test Parent 1',
            studentName: 'Test Student 1'
          },
          {
            email: 'test2@example.com',
            name: 'Test Parent 2',
            studentName: 'Test Student 2'
          }
        ],
        subject: 'Integration Test Email',
        htmlContent: '<p>Test content for {studentName}</p>',
        textContent: 'Test content for {studentName}'
      };

      const response = await request(app)
        .post('/api/communication/send-bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(emailRequest)
        .expect(200);

      expect(response.body).toHaveProperty('results');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results).toHaveLength(2);

      // Validate summary
      expect(response.body.summary).toHaveProperty('total');
      expect(response.body.summary).toHaveProperty('successful');
      expect(response.body.summary).toHaveProperty('failed');
      expect(response.body.summary.total).toBe(2);

      // Validate result structure
      response.body.results.forEach((result: Record<string, unknown>) => {
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('status');
        expect(result).toHaveProperty('timestamp');
        expect(['sent', 'failed', 'pending']).toContain(result.status);
      });
    });

    it('should validate email recipients', async () => {
      const invalidRequest = {
        recipients: [
          {
            email: 'invalid-email-format',
            name: 'Invalid Parent'
          }
        ],
        subject: 'Test',
        htmlContent: 'Test'
      };

      const response = await request(app)
        .post('/api/communication/send-bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Authentication and Security', () => {
    it('should reject requests without authentication', async () => {
      await request(app)
        .get('/api/email-templates')
        .expect(401);

      await request(app)
        .post('/api/reports/generate')
        .send({})
        .expect(401);

      await request(app)
        .post('/api/communication/send-bulk')
        .send({})
        .expect(401);
    });

    it('should reject requests with invalid authentication', async () => {
      await request(app)
        .get('/api/email-templates')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
    });

    it('should enforce user data isolation', async () => {
      // Create token for second user
      const user2Token = createAuthToken(testData.users[1].id);

      // Create template as user 1
      const template1Response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Test User 1 Template ${Date.now()}`,
          subject: 'Private',
          contentFr: 'FR',
          contentEn: 'EN',
          variables: []
        });

      const templateId = template1Response.body.id;

      // Try to access as user 2
      await request(app)
        .get(`/api/email-templates/${templateId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(404);

      // Verify user 2 can't see user 1's templates
      const user2Templates = await request(app)
        .get('/api/email-templates')
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(200);

      const user1TemplateInUser2List = user2Templates.body.find(
        (t: Record<string, unknown>) => t.id === templateId
      );
      expect(user1TemplateInUser2List).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      // This will be handled by Express middleware
      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid": json"}')
        .expect(500);

      // Should return some form of error response
      expect(response.body).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const incompleteTemplate = {
        name: '' // Invalid: empty name
      };

      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteTemplate)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle non-existent resources', async () => {
      await request(app)
        .get('/api/email-templates/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      await request(app)
        .put('/api/email-templates/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);

      await request(app)
        .delete('/api/email-templates/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Performance', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/email-templates')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const startTime = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const duration = Date.now() - startTime;

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000);
    });

    it('should handle bulk email operations efficiently', async () => {
      const recipients = Array(3).fill(null).map((_, i) => ({
        email: `perf${i}@example.com`,
        name: `Perf Parent ${i}`,
        studentName: `Perf Student ${i}`
      }));

      const startTime = Date.now();

      const response = await request(app)
        .post('/api/communication/send-bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipients,
          subject: 'Performance Test',
          htmlContent: 'Test content',
          textContent: 'Test content'
        })
        .expect(200);

      const duration = Date.now() - startTime;

      expect(response.body.results).toHaveLength(3);
      expect(response.body.summary.total).toBe(3);
      
      // Should complete within reasonable time (2 seconds per recipient max)
      expect(duration).toBeLessThan(6000);
    });
  });
});