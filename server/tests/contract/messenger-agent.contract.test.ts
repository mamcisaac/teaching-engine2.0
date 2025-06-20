import request from 'supertest';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import { createTestUser, createAuthToken } from '../test-auth-helper';

/**
 * Contract Tests for Messenger Agent
 * 
 * These tests ensure that:
 * 1. API responses match expected schemas
 * 2. Mock behaviors in unit tests match real API behavior
 * 3. Frontend expectations align with backend implementations
 */

describe('Messenger Agent Contract Tests', () => {
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

  // No need for afterEach or afterAll - the test setup handles cleanup via transactions

  describe('Email Templates API Contract', () => {
    const validTemplateSchema = {
      id: 'number',
      name: 'string',
      subject: 'string',
      contentFr: 'string',
      contentEn: 'string',
      variables: 'string', // JSON string
      userId: 'number',
      createdAt: 'string',
      updatedAt: 'string'
    };

    const validateSchema = (obj: Record<string, unknown>, schema: Record<string, string>) => {
      for (const [key, expectedType] of Object.entries(schema)) {
        expect(obj).toHaveProperty(key);
        if (expectedType === 'string') {
          expect(typeof obj[key]).toBe('string');
        } else if (expectedType === 'number') {
          expect(typeof obj[key]).toBe('number');
        } else if (expectedType === 'boolean') {
          expect(typeof obj[key]).toBe('boolean');
        }
      }
    };

    it('GET /api/email-templates returns array matching schema', async () => {
      // Create test template
      await prisma.emailTemplate.create({
        data: {
          name: `Test Contract Template ${Date.now()}`,
          subject: 'Contract Subject',
          contentFr: 'French content',
          contentEn: 'English content',
          variables: JSON.stringify(['var1']),
          userId
        }
      });

      const response = await request(app)
        .get('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      response.body.forEach((template: Record<string, unknown>) => {
        validateSchema(template, validTemplateSchema);
      });
    });

    it('POST /api/email-templates returns created template matching schema', async () => {
      const templateData = {
        name: `Test New Contract Template ${Date.now()}`,
        subject: 'New Subject',
        contentFr: 'New French content',
        contentEn: 'New English content',
        variables: ['var1', 'var2']
      };

      const response = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send(templateData)
        .expect(201);

      validateSchema(response.body, validTemplateSchema);
      expect(response.body.name).toBe(templateData.name);
      expect(JSON.parse(response.body.variables)).toEqual(templateData.variables);
    });

    it('PUT /api/email-templates/:id returns updated template matching schema', async () => {
      const template = await prisma.emailTemplate.create({
        data: {
          name: `Test Update Template ${Date.now()}`,
          subject: 'Update Subject',
          contentFr: 'Update FR',
          contentEn: 'Update EN',
          variables: JSON.stringify([]),
          userId
        }
      });

      const updateData = { name: `Test Updated Name ${Date.now()}` };

      const response = await request(app)
        .put(`/api/email-templates/${template.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      validateSchema(response.body, validTemplateSchema);
      expect(response.body.name).toBe(updateData.name);
    });

    it('Error responses match expected schema', async () => {
      const errorSchema = {
        error: 'string'
      };

      // Test 404 error
      const notFoundResponse = await request(app)
        .get('/api/email-templates/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      validateSchema(notFoundResponse.body, errorSchema);

      // Test validation error
      const validationResponse = await request(app)
        .post('/api/email-templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: '' })
        .expect(400);

      expect(validationResponse.body).toHaveProperty('error');
      expect(validationResponse.body).toHaveProperty('details');
    });
  });

  describe('Report Generation API Contract', () => {
    let student: { id: number; firstName: string; lastName: string; grade: number; userId: number };

    beforeEach(async () => {
      student = await prisma.student.create({
        data: {
          firstName: 'Contract',
          lastName: 'Student',
          grade: 4,
          userId
        }
      });
    });

    // const _reportSchema = {
    //   studentName: 'string',
    //   period: 'string',
    //   sections: 'array',
    //   overallComments: 'string',
    //   nextSteps: 'array'
    // };

    const validateReportSchema = (report: Record<string, unknown>) => {
      expect(typeof report.studentName).toBe('string');
      expect(typeof report.period).toBe('string');
      expect(Array.isArray(report.sections)).toBe(true);
      expect(typeof report.overallComments).toBe('string');
      expect(Array.isArray(report.nextSteps)).toBe(true);

      // Validate section structure
      (report.sections as Array<Record<string, unknown>>).forEach((section) => {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('content');
        expect(typeof section.title).toBe('string');
        expect(typeof section.content).toBe('string');
      });
    };

    it('GET /api/reports/types returns expected structure', async () => {
      const response = await request(app)
        .get('/api/reports/types')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      
      response.body.forEach((reportType: Record<string, unknown>) => {
        expect(reportType).toHaveProperty('id');
        expect(reportType).toHaveProperty('name');
        expect(reportType).toHaveProperty('nameFr');
        expect(reportType).toHaveProperty('description');
        expect(reportType).toHaveProperty('descriptionFr');
      });

      const expectedTypes = ['progress', 'narrative', 'term_summary', 'report_card'];
      const actualTypes = response.body.map((t: Record<string, unknown>) => t.id);
      expectedTypes.forEach(type => {
        expect(actualTypes).toContain(type);
      });
    });

    it('POST /api/reports/generate returns report matching schema', async () => {
      const reportRequest = {
        studentId: student.id,
        reportType: 'progress',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        language: 'en'
      };

      const response = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send(reportRequest)
        .expect(200);

      validateReportSchema(response.body);
      expect(response.body.studentName).toContain(student.firstName);
    });

    it('All report types return consistent schema', async () => {
      const reportTypes = ['progress', 'narrative', 'term_summary', 'report_card'];
      
      for (const reportType of reportTypes) {
        const reportRequest = {
          studentId: student.id,
          reportType,
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
          language: 'en'
        };

        const response = await request(app)
          .post('/api/reports/generate')
          .set('Authorization', `Bearer ${authToken}`)
          .send(reportRequest)
          .expect(200);

        validateReportSchema(response.body);
      }
    });

    it('Language parameter affects report content appropriately', async () => {
      const baseRequest = {
        studentId: student.id,
        reportType: 'narrative',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z'
      };

      // Test English report
      const englishResponse = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...baseRequest, language: 'en' })
        .expect(200);

      // Test French report
      const frenchResponse = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...baseRequest, language: 'fr' })
        .expect(200);

      validateReportSchema(englishResponse.body);
      validateReportSchema(frenchResponse.body);

      // French report should have French language indicators
      expect(frenchResponse.body.sections[0].title).toContain('narratif');
    });
  });

  describe('Email Communication API Contract', () => {
    // const _bulkEmailResponseSchema = {
    //   results: 'array',
    //   summary: 'object'
    // };

    const validateBulkEmailResponse = (response: Record<string, unknown>) => {
      expect(Array.isArray(response.results)).toBe(true);
      expect(typeof response.summary).toBe('object');
      expect(response.summary).toHaveProperty('total');
      expect(response.summary).toHaveProperty('successful');
      expect(response.summary).toHaveProperty('failed');
      expect(typeof response.summary.total).toBe('number');
      expect(typeof response.summary.successful).toBe('number');
      expect(typeof response.summary.failed).toBe('number');

      (response.results as Array<Record<string, unknown>>).forEach((result) => {
        expect(result).toHaveProperty('email');
        expect(result).toHaveProperty('status');
        expect(['sent', 'failed', 'pending']).toContain(result.status);
      });
    };

    it('POST /api/communication/send-bulk returns expected structure', async () => {
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
        subject: 'Contract Test Email',
        htmlContent: '<p>Test content for {studentName}</p>',
        textContent: 'Test content for {studentName}'
      };

      const response = await request(app)
        .post('/api/communication/send-bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(emailRequest)
        .expect(200);

      validateBulkEmailResponse(response.body);
      expect(response.body.results).toHaveLength(2);
      expect(response.body.summary.total).toBe(2);
    });

    it('GET /api/communication/delivery-status returns expected structure', async () => {
      const response = await request(app)
        .get('/api/communication/delivery-status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('recent');
      expect(response.body).toHaveProperty('summary');
      expect(Array.isArray(response.body.recent)).toBe(true);
      expect(typeof response.body.summary).toBe('object');

      if (response.body.recent.length > 0) {
        (response.body.recent as Array<Record<string, unknown>>).forEach((delivery) => {
          expect(delivery).toHaveProperty('id');
          expect(delivery).toHaveProperty('email');
          expect(delivery).toHaveProperty('status');
          expect(delivery).toHaveProperty('sentAt');
        });
      }
    });

    it('Template variable substitution works consistently', async () => {
      const emailRequest = {
        recipients: [
          {
            email: 'template.test@example.com',
            name: 'Template Parent',
            studentName: 'Template Student'
          }
        ],
        subject: 'Update for {studentName}',
        htmlContent: '<p>Hello {parentName}, here are updates for {studentName}</p>',
        textContent: 'Hello {parentName}, here are updates for {studentName}',
        templateVariables: {
          parentName: 'Template Parent',
          studentName: 'Template Student'
        }
      };

      const response = await request(app)
        .post('/api/communication/send-bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send(emailRequest)
        .expect(200);

      validateBulkEmailResponse(response.body);
      
      // Variables should be processed consistently
      const result = response.body.results[0];
      expect(result.email).toBe('template.test@example.com');
    });
  });

  describe('Cross-Feature Integration Contracts', () => {
    it('Student-Contact relationship is consistent across APIs', async () => {
      // Create student
      const studentResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Integration',
          lastName: 'Student',
          grade: 3
        })
        .expect(201);

      const studentId = studentResponse.body.id;

      // Create parent contact via API
      const contactResponse = await request(app)
        .post('/api/parent-contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Integration Parent',
          email: 'integration.parent@example.com',
          studentId
        })
        .expect(201);

      // Verify student includes contact in response
      const studentDetailResponse = await request(app)
        .get(`/api/students/${studentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(studentDetailResponse.body).toHaveProperty('parentContacts');
      expect(Array.isArray(studentDetailResponse.body.parentContacts)).toBe(true);
      
      const parentContact = studentDetailResponse.body.parentContacts.find(
        (c: Record<string, unknown>) => c.id === contactResponse.body.id
      );
      expect(parentContact).toBeDefined();
      expect(parentContact.email).toBe('integration.parent@example.com');
    });

    it('Report generation includes all necessary student data', async () => {
      // Create comprehensive student with data
      const student = await prisma.student.create({
        data: {
          firstName: 'Data',
          lastName: 'Student',
          grade: 5,
          userId
        }
      });

      // Generate report and verify it includes expected data structure
      const reportResponse = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          studentId: student.id,
          reportType: 'progress',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-01-31T23:59:59Z',
          language: 'en',
          includeAssessments: true,
          includeGoals: true
        })
        .expect(200);

      const report = reportResponse.body;
      expect(report.studentName).toBe(`${student.firstName} ${student.lastName}`);
      
      // Report should handle empty data gracefully
      expect(Array.isArray(report.sections)).toBe(true);
      expect(typeof report.overallComments).toBe('string');
      expect(Array.isArray(report.nextSteps)).toBe(true);
    });

    it('Email sending integrates with contact management', async () => {
      // Create student and contact
      const student = await prisma.student.create({
        data: {
          firstName: 'Email',
          lastName: 'Student', 
          grade: 2,
          userId
        }
      });

      const contact = await prisma.parentContact.create({
        data: {
          name: 'Email Parent',
          email: 'email.parent@example.com',
          studentId: student.id
        }
      });

      // Send email using contact information
      const emailResponse = await request(app)
        .post('/api/communication/send-bulk')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipients: [
            {
              email: contact.email,
              name: contact.name,
              studentName: `${student.firstName} ${student.lastName}`
            }
          ],
          subject: 'Integration Test',
          htmlContent: 'Test integration',
          textContent: 'Test integration'
        })
        .expect(200);

      expect(emailResponse.body.results).toHaveLength(1);
      expect(emailResponse.body.results[0].email).toBe(contact.email);
    });
  });

  describe('Error Contract Consistency', () => {
    it('All APIs return consistent error format', async () => {
      const errorTests = [
        {
          path: '/api/email-templates/99999',
          method: 'get',
          expectedStatus: 404
        },
        {
          path: '/api/reports/generate',
          method: 'post',
          body: { invalid: 'data' },
          expectedStatus: 400
        },
        {
          path: '/api/communication/send-bulk',
          method: 'post',
          body: { invalid: 'data' },
          expectedStatus: 400
        }
      ];

      for (const test of errorTests) {
        let response;
        if (test.method === 'get') {
          response = await request(app)
            .get(test.path)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(test.expectedStatus);
        } else {
          response = await request(app)
            .post(test.path)
            .set('Authorization', `Bearer ${authToken}`)
            .send(test.body || {})
            .expect(test.expectedStatus);
        }

        // All errors should have consistent structure
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      }
    });

    it('Authentication errors are consistent across all endpoints', async () => {
      const endpoints = [
        { path: '/api/email-templates', method: 'get' },
        { path: '/api/reports/types', method: 'get' },
        { path: '/api/communication/delivery-status', method: 'get' }
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          [endpoint.method](endpoint.path)
          .expect(401);

        // 401 responses from sendStatus() have empty body
        expect(response.body).toEqual({});
      }
    });
  });

  describe('Performance Contract', () => {
    it('API response times are within acceptable limits', async () => {
      const performanceTests = [
        {
          name: 'Get email templates',
          test: () => request(app)
            .get('/api/email-templates')
            .set('Authorization', `Bearer ${authToken}`)
        },
        {
          name: 'Get report types',
          test: () => request(app)
            .get('/api/reports/types')
            .set('Authorization', `Bearer ${authToken}`)
        },
        {
          name: 'Get delivery status',
          test: () => request(app)
            .get('/api/communication/delivery-status')
            .set('Authorization', `Bearer ${authToken}`)
        }
      ];

      for (const perfTest of performanceTests) {
        const startTime = Date.now();
        await perfTest.test().expect(200);
        const duration = Date.now() - startTime;

        // API calls should complete within reasonable time
        expect(duration).toBeLessThan(5000); // 5 seconds max
      }
    });

    it('Bulk operations scale appropriately', async () => {
      const bulkSizes = [1, 5, 10];
      
      for (const size of bulkSizes) {
        const recipients = Array(size).fill(null).map((_, i) => ({
          email: `bulk${i}@example.com`,
          name: `Bulk Parent ${i}`,
          studentName: `Bulk Student ${i}`
        }));

        const startTime = Date.now();
        
        const response = await request(app)
          .post('/api/communication/send-bulk')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            recipients,
            subject: 'Bulk Performance Test',
            htmlContent: 'Test content',
            textContent: 'Test content'
          })
          .expect(200);

        const duration = Date.now() - startTime;

        expect(response.body.results).toHaveLength(size);
        expect(response.body.summary.total).toBe(size);
        
        // Performance should scale reasonably (not exponentially)
        expect(duration).toBeLessThan(size * 2000); // Max 2 seconds per recipient
      }
    });
  });
});