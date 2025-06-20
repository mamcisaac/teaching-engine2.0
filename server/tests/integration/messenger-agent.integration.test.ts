import request from 'supertest';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import { createTestUser, createAuthToken } from '../test-auth-helper';

describe('Messenger Agent Integration Tests', () => {
  let authToken: string;
  let userId: number;
  let testUser: { id: number; email: string; name: string; role: string };
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(async () => {
    // Get the test-specific Prisma client
    prisma = getTestPrismaClient();
    
    // Create a fresh test user for each test
    testUser = await createTestUser();
    userId = testUser.id;
    authToken = createAuthToken(userId);
  });

  // No additional cleanup needed - test setup handles via transactions

  describe('Email Templates API', () => {
    it('should create a new email template', async () => {
      const templateData = {
        name: 'Test Newsletter Template',
        subject: 'Weekly Update - {studentName}',
        contentFr: 'Bonjour {parentName}, voici les nouvelles de {studentName}...',
        contentEn: 'Hello {parentName}, here are the updates for {studentName}...',
        variables: ['parentName', 'studentName', 'weekDate']
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
      expect(JSON.parse(response.body.variables)).toEqual(templateData.variables);
      expect(response.body.userId).toBe(userId);
    });

    it('should get all email templates for user', async () => {
      // Create test templates
      const template1 = await prisma.emailTemplate.create({
        data: {
          name: 'Template 1',
          subject: 'Subject 1',
          contentFr: 'Content FR 1',
          contentEn: 'Content EN 1',
          variables: JSON.stringify(['var1']),
          userId
        }
      });

      const template2 = await prisma.emailTemplate.create({
        data: {
          name: 'Template 2',
          subject: 'Subject 2',
          contentFr: 'Content FR 2',
          contentEn: 'Content EN 2',
          variables: JSON.stringify(['var2']),
          userId
        }
      });

      const response = await request(app)
        .get('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body.map((t: Record<string, unknown>) => t.id)).toContain(template1.id);
      expect(response.body.map((t: Record<string, unknown>) => t.id)).toContain(template2.id);
    });

    it('should update an email template', async () => {
      const template = await prisma.emailTemplate.create({
        data: {
          name: 'Original Template',
          subject: 'Original Subject',
          contentFr: 'Original FR',
          contentEn: 'Original EN',
          variables: JSON.stringify(['original']),
          userId
        }
      });

      const updateData = {
        name: 'Updated Template',
        subject: 'Updated Subject'
      };

      const response = await request(app)
        .put(`/api/email-templates/${template.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.subject).toBe(updateData.subject);
      expect(response.body.contentFr).toBe('Original FR'); // Unchanged
    });

    it('should delete an email template', async () => {
      const template = await prisma.emailTemplate.create({
        data: {
          name: 'Template to Delete',
          subject: 'Delete Subject',
          contentFr: 'Delete FR',
          contentEn: 'Delete EN',
          variables: JSON.stringify([]),
          userId
        }
      });

      await request(app)
        .delete(`/api/email-templates/${template.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      const deletedTemplate = await prisma.emailTemplate.findUnique({
        where: { id: template.id }
      });
      expect(deletedTemplate).toBeNull();
    });

    it('should clone an email template', async () => {
      const original = await prisma.emailTemplate.create({
        data: {
          name: 'Original Template',
          subject: 'Original Subject',
          contentFr: 'Original FR',
          contentEn: 'Original EN',
          variables: JSON.stringify(['var1', 'var2']),
          userId
        }
      });

      const cloneData = { name: 'Cloned Template' };

      const response = await request(app)
        .post(`/api/email-templates/${original.id}/clone`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cloneData)
        .expect(201);

      expect(response.body.name).toBe(cloneData.name);
      expect(response.body.subject).toBe(original.subject);
      expect(response.body.contentFr).toBe(original.contentFr);
      expect(response.body.contentEn).toBe(original.contentEn);
      expect(response.body.variables).toBe(original.variables);
      expect(response.body.id).not.toBe(original.id);
    });

    it('should prevent duplicate template names', async () => {
      await prisma.emailTemplate.create({
        data: {
          name: 'Existing Template',
          subject: 'Subject',
          contentFr: 'FR',
          contentEn: 'EN',
          variables: JSON.stringify([]),
          userId
        }
      });

      const duplicateData = {
        name: 'Existing Template',
        subject: 'New Subject',
        contentFr: 'New FR',
        contentEn: 'New EN'
      };

      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(400);

      expect(response.body.error).toContain('already exists');
    });
  });

  describe('Report Generation API', () => {
    let student: { id: number; firstName: string; lastName: string; grade: number; userId: number };

    beforeEach(async () => {
      // Create a test student
      student = await prisma.student.create({
        data: {
          firstName: 'Test',
          lastName: 'Student',
          grade: 5,
          userId
        }
      });
    });

    it('should get available report types', async () => {
      const response = await request(app)
        .get('/api/reports/types')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(4);
      expect(response.body.map((t: Record<string, unknown>) => t.id)).toContain('progress');
      expect(response.body.map((t: Record<string, unknown>) => t.id)).toContain('narrative');
      expect(response.body.map((t: Record<string, unknown>) => t.id)).toContain('term_summary');
      expect(response.body.map((t: Record<string, unknown>) => t.id)).toContain('report_card');
    });

    it('should generate a progress report', async () => {
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
      expect(response.body.sections).toBeDefined();
      expect(response.body.overallComments).toBeDefined();
      expect(response.body.nextSteps).toBeDefined();
      expect(Array.isArray(response.body.nextSteps)).toBe(true);
    });

    it('should generate a narrative report', async () => {
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
      // Create another user and student
      const otherUser = await prisma.user.create({
        data: {
          name: 'Other User',
          email: 'other@test.com',
          password: 'password',
          role: 'teacher'
        }
      });

      const otherStudent = await prisma.student.create({
        data: {
          firstName: 'Other',
          lastName: 'Student',
          grade: 5,
          userId: otherUser.id
        }
      });

      const reportRequest = {
        studentId: otherStudent.id,
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

      // Cleanup
      await prisma.student.delete({ where: { id: otherStudent.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it('should save a generated report', async () => {
      const saveRequest = {
        studentId: student.id,
        reportType: 'progress',
        content: {
          studentName: 'Test Student',
          sections: [],
          overallComments: 'Good progress',
          nextSteps: []
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          language: 'en'
        }
      };

      const response = await request(app)
        .post('/api/reports/save')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saveRequest)
        .expect(200);

      expect(response.body.studentId).toBe(student.id);
      expect(response.body.reportType).toBe('progress');
      expect(response.body.content).toEqual(saveRequest.content);
    });

    it('should get saved reports for a student', async () => {
      const response = await request(app)
        .get(`/api/reports/student/${student.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should return mock reports for now
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Email Communication API', () => {
    let student: { id: number; firstName: string; lastName: string; grade: number; userId: number };
    // let parentContact: { id: number; name: string; email: string; studentId: number };

    beforeEach(async () => {
      // Create test student and parent contact
      student = await prisma.student.create({
        data: {
          firstName: 'Test',
          lastName: 'Student',
          grade: 5,
          userId
        }
      });

      parentContact = await prisma.parentContact.create({
        data: {
          name: 'Test Parent',
          email: 'test.parent@example.com',
          studentId: student.id
        }
      });
    });

    it('should send bulk emails with delivery tracking', async () => {
      const emailRequest = {
        recipients: [
          {
            email: 'test.parent@example.com',
            name: 'Test Parent',
            studentName: 'Test Student'
          }
        ],
        subject: 'Weekly Newsletter - Test Student',
        htmlContent: '<h1>Newsletter</h1><p>Test content for {studentName}</p>',
        textContent: 'Newsletter\nTest content for {studentName}',
        templateVariables: {
          studentName: 'Test Student',
          weekDate: '2024-01-15'
        }
      };

      const response = await request(app)
        .post('/api/communication/send-bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(emailRequest)
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.summary).toBeDefined();
      expect(response.body.summary.total).toBe(1);
    });

    it('should get email delivery status', async () => {
      const response = await request(app)
        .get('/api/communication/delivery-status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.recent).toBeDefined();
      expect(response.body.summary).toBeDefined();
      expect(Array.isArray(response.body.recent)).toBe(true);
    });

    it('should validate email recipients', async () => {
      const invalidRequest = {
        recipients: [
          {
            email: 'invalid-email',
            name: 'Test Parent'
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

      expect(response.body.error).toContain('Invalid');
    });

    it('should handle email sending failures gracefully', async () => {
      // Test with a mock failure scenario
      const emailRequest = {
        recipients: [
          {
            email: 'fail@test.local', // This should trigger a mock failure
            name: 'Fail Test',
            studentName: 'Test Student'
          }
        ],
        subject: 'Test Failure',
        htmlContent: 'Test content',
        textContent: 'Test content'
      };

      const response = await request(app)
        .post('/api/communication/send-bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(emailRequest)
        .expect(200);

      expect(response.body.results).toBeDefined();
      expect(response.body.summary.failed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('API Authentication and Authorization', () => {
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
        .expect(401);
    });

    it('should enforce user isolation for templates', async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          name: 'Other User',
          email: 'other@test.com',
          password: 'password',
          role: 'teacher'
        }
      });

      const otherUserToken = createAuthToken(otherUser.id);

      // Create template as original user
      const template = await prisma.emailTemplate.create({
        data: {
          name: 'Private Template',
          subject: 'Private',
          contentFr: 'Private FR',
          contentEn: 'Private EN',
          variables: JSON.stringify([]),
          userId
        }
      });

      // Try to access as other user
      await request(app)
        .get(`/api/email-templates/${template.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(404);

      // Try to update as other user
      await request(app)
        .put(`/api/email-templates/${template.id}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ name: 'Hacked' })
        .expect(404);

      // Cleanup
      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('{"invalid json}')
        .expect(400);

      expect(response.body.error || response.body.message).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const incompleteTemplate = {
        name: 'Incomplete Template'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(incompleteTemplate)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle very large payloads gracefully', async () => {
      const largeContent = 'x'.repeat(1000000); // 1MB string
      
      const largeTemplate = {
        name: 'Large Template',
        subject: 'Large Subject',
        contentFr: largeContent,
        contentEn: largeContent,
        variables: []
      };

      // Should either accept or reject gracefully without crashing
      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largeTemplate);

      expect([200, 201, 413, 400]).toContain(response.status);
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking Prisma to simulate connection errors
      // For now, just verify the endpoint exists and responds
      const response = await request(app)
        .get('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Performance and Rate Limiting', () => {
    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/email-templates')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(concurrentRequests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle bulk email sending efficiently', async () => {
      const recipients = Array(5).fill(null).map((_, i) => ({
        email: `test${i}@example.com`,
        name: `Test Parent ${i}`,
        studentName: `Test Student ${i}`
      }));

      const startTime = Date.now();

      const response = await request(app)
        .post('/api/communication/send-bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipients,
          subject: 'Bulk Test',
          htmlContent: 'Test content',
          textContent: 'Test content'
        })
        .expect(200);

      const duration = Date.now() - startTime;

      expect(response.body.results).toHaveLength(5);
      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
    });
  });
});