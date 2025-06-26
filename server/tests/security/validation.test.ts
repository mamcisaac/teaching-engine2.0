/**
 * Input Validation and Sanitization Security Tests
 * 
 * Tests input validation, sanitization, and protection against
 * injection attacks and malicious input
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { getTestPrismaClient, createTestData } from '../jest.setup';

// Import the actual app
let app: any;

beforeEach(async () => {
  // Import the actual app
  const appModule = await import('../../src/index');
  app = appModule.app;
});

describe('Input Validation and Sanitization Security Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'SecureTestPassword123!',
    name: 'Test User',
    role: 'teacher'
  };

  let authToken: string;

  beforeEach(async () => {
    // Create test user and get auth token
    const hashedPassword = await bcrypt.hash(testUser.password, 12);
    
    await createTestData(async (prisma) => {
      return await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          name: testUser.name,
          role: testUser.role,
        },
      });
    });

    const loginResponse = await request(app)
      .post('/api/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const cookies = loginResponse.headers['set-cookie'];
    const authCookie = cookies.find((cookie: string) => cookie.startsWith('authToken='));
    authToken = authCookie?.split('=')[1].split(';')[0] || '';
  });

  describe('XSS Prevention', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src="x" onerror="alert(1)">',
      'javascript:alert("xss")',
      '<svg onload="alert(1)">',
      '"><script>alert("xss")</script>',
      '<iframe src="javascript:alert(1)">',
      '<object data="javascript:alert(1)">',
      '<embed src="javascript:alert(1)">',
      '<link rel="stylesheet" href="javascript:alert(1)">',
      '<style>@import "javascript:alert(1)"</style>',
      '<meta http-equiv="refresh" content="0;url=javascript:alert(1)">',
      '&lt;script&gt;alert("xss")&lt;/script&gt;',
      '%3Cscript%3Ealert("xss")%3C/script%3E'
    ];

    it('should sanitize XSS attempts in student names', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            firstName: payload,
            lastName: 'TestLast',
            grade: 5
          });

        if (response.status === 201 || response.status === 200) {
          // If creation succeeded, verify the payload was sanitized
          expect(response.body.firstName).not.toBe(payload);
          expect(response.body.firstName).not.toContain('<script>');
          expect(response.body.firstName).not.toContain('javascript:');
          expect(response.body.firstName).not.toContain('onerror');
          expect(response.body.firstName).not.toContain('onload');
        } else {
          // If creation failed, it should be due to validation, not server error
          expect(response.status).toBe(400);
        }
      }
    });

    it('should sanitize XSS attempts in lesson plan content', async () => {
      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/etfo-lesson-plans')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Lesson',
            subject: 'Mathematics',
            grade: 5,
            date: new Date().toISOString(),
            content: payload,
            objectives: [payload]
          });

        if (response.status === 201 || response.status === 200) {
          // If creation succeeded, verify the payload was sanitized
          expect(response.body.content).not.toBe(payload);
          expect(response.body.content).not.toContain('<script>');
          expect(response.body.content).not.toContain('javascript:');
          
          if (response.body.objectives && response.body.objectives.length > 0) {
            expect(response.body.objectives[0]).not.toBe(payload);
            expect(response.body.objectives[0]).not.toContain('<script>');
          }
        } else {
          // Should fail validation, not cause server error
          expect(response.status).toBe(400);
        }
      }
    });

    it('should sanitize XSS attempts in text fields', async () => {
      const textFieldEndpoints = [
        {
          endpoint: '/api/unit-plans',
          payload: {
            title: '<script>alert("xss")</script>',
            description: '<img src="x" onerror="alert(1)">',
            subject: 'Mathematics',
            grade: 5,
            term: 'Fall 2024'
          }
        },
        {
          endpoint: '/api/long-range-plans',
          payload: {
            title: '<svg onload="alert(1)">',
            subject: 'Science',
            grade: 6,
            year: 2024
          }
        }
      ];

      for (const { endpoint, payload } of textFieldEndpoints) {
        const response = await request(app)
          .post(endpoint)
          .set('Authorization', `Bearer ${authToken}`)
          .send(payload);

        if (response.status === 201 || response.status === 200) {
          // Verify XSS payload was sanitized
          Object.keys(payload).forEach(key => {
            if (typeof payload[key] === 'string' && payload[key].includes('<')) {
              expect(response.body[key]).not.toBe(payload[key]);
              expect(response.body[key]).not.toContain('<script>');
              expect(response.body[key]).not.toContain('onerror');
              expect(response.body[key]).not.toContain('onload');
            }
          });
        }
      }
    });
  });

  describe('SQL Injection Prevention', () => {
    const sqlInjectionPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; DELETE FROM students; --",
      "' OR 1=1 --",
      "admin'--",
      "admin'/*",
      "' OR 'x'='x",
      "1'; DROP TABLE students; --",
      "' AND 1=CONVERT(int, (SELECT COUNT(*) FROM users))",
      "' WAITFOR DELAY '00:00:10' --",
      "'; EXEC xp_cmdshell('dir'); --"
    ];

    it('should prevent SQL injection in student queries', async () => {
      // Create a test student first
      const createResponse = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Student',
          grade: 5
        });

      const studentId = createResponse.body.id;

      for (const payload of sqlInjectionPayloads) {
        // Try SQL injection in various ways
        const responses = await Promise.all([
          // Try in search/filter parameters
          request(app)
            .get('/api/students')
            .query({ search: payload })
            .set('Authorization', `Bearer ${authToken}`),
          
          // Try in ID parameter
          request(app)
            .get(`/api/students/${payload}`)
            .set('Authorization', `Bearer ${authToken}`),

          // Try in update data
          request(app)
            .put(`/api/students/${studentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              firstName: payload,
              lastName: 'Test'
            })
        ]);

        responses.forEach(response => {
          // Should not cause server errors (500)
          expect(response.status).not.toBe(500);
          
          // If successful, should not contain injection payload
          if (response.status === 200) {
            const responseStr = JSON.stringify(response.body);
            expect(responseStr).not.toContain('DROP TABLE');
            expect(responseStr).not.toContain('DELETE FROM');
            expect(responseStr).not.toContain('UNION SELECT');
          }
        });
      }
    });

    it('should prevent SQL injection in search parameters', async () => {
      for (const payload of sqlInjectionPayloads) {
        const endpoints = [
          '/api/students',
          '/api/unit-plans',
          '/api/long-range-plans',
          '/api/etfo-lesson-plans'
        ];

        for (const endpoint of endpoints) {
          const response = await request(app)
            .get(endpoint)
            .query({ 
              search: payload,
              filter: payload,
              sort: payload
            })
            .set('Authorization', `Bearer ${authToken}`);

          // Should not cause database errors
          expect(response.status).not.toBe(500);
          
          // Should not return database structure information
          if (response.status === 200) {
            const responseStr = JSON.stringify(response.body);
            expect(responseStr).not.toContain('sqlite_master');
            expect(responseStr).not.toContain('information_schema');
            expect(responseStr).not.toContain('PRAGMA');
          }
        }
      }
    });
  });

  describe('Input Length and Type Validation', () => {
    it('should reject oversized string inputs', async () => {
      const oversizedInputs = {
        veryLongString: 'A'.repeat(10000),
        extraLongString: 'B'.repeat(100000),
        megaString: 'C'.repeat(1000000)
      };

      for (const [key, value] of Object.entries(oversizedInputs)) {
        const response = await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            firstName: value,
            lastName: 'Test',
            grade: 5
          });

        // Should reject oversized input
        expect(response.status).toBe(400);
        expect(response.body.errors || response.body.error).toBeDefined();
      }
    });

    it('should validate data types strictly', async () => {
      const invalidTypeInputs = [
        {
          firstName: 123, // Should be string
          lastName: 'Test',
          grade: 5
        },
        {
          firstName: 'Test',
          lastName: [], // Should be string
          grade: 5
        },
        {
          firstName: 'Test',
          lastName: 'Student',
          grade: 'five' // Should be number
        },
        {
          firstName: 'Test',
          lastName: 'Student',
          grade: { level: 5 } // Should be number
        },
        {
          firstName: null,
          lastName: 'Test',
          grade: 5
        }
      ];

      for (const input of invalidTypeInputs) {
        const response = await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .send(input);

        expect(response.status).toBe(400);
        expect(response.body.errors || response.body.error).toBeDefined();
      }
    });

    it('should validate required fields', async () => {
      const incompleteInputs = [
        {}, // Missing all fields
        { firstName: 'Test' }, // Missing lastName and grade
        { lastName: 'Student' }, // Missing firstName and grade
        { firstName: '', lastName: '', grade: 5 }, // Empty strings
        { firstName: '   ', lastName: '   ', grade: 5 } // Whitespace only
      ];

      for (const input of incompleteInputs) {
        const response = await request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .send(input);

        expect(response.status).toBe(400);
        expect(response.body.errors || response.body.error).toBeDefined();
      }
    });
  });

  describe('File Upload Validation', () => {
    it('should validate file types for curriculum import', async () => {
      // Test malicious file extensions
      const maliciousFiles = [
        { filename: 'malware.exe', mimetype: 'application/x-executable' },
        { filename: 'script.js', mimetype: 'application/javascript' },
        { filename: 'shell.sh', mimetype: 'application/x-sh' },
        { filename: 'virus.bat', mimetype: 'application/x-bat' },
        { filename: 'trojan.scr', mimetype: 'application/x-screensaver' }
      ];

      for (const file of maliciousFiles) {
        const response = await request(app)
          .post('/api/curriculum-import/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', Buffer.from('malicious content'), file.filename);

        // Should reject malicious file types
        expect(response.status).toBeOneOf([400, 415, 422]);
      }
    });

    it('should validate file size limits', async () => {
      // Test oversized file
      const largeFileContent = Buffer.alloc(100 * 1024 * 1024); // 100MB
      
      const response = await request(app)
        .post('/api/curriculum-import/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', largeFileContent, 'large.pdf');

      // Should reject oversized files
      expect(response.status).toBeOneOf([400, 413, 422]);
    });

    it('should sanitize file names', async () => {
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32\\config\\sam',
        'file with spaces and..special chars!@#.pdf',
        'file_with_unicode_名前.pdf',
        'file.pdf.exe',
        '.htaccess'
      ];

      for (const filename of maliciousFilenames) {
        const response = await request(app)
          .post('/api/curriculum-import/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', Buffer.from('test content'), filename);

        // Should either reject or sanitize the filename
        if (response.status === 200 || response.status === 201) {
          // If accepted, filename should be sanitized
          expect(response.body.filename).not.toContain('..');
          expect(response.body.filename).not.toContain('/');
          expect(response.body.filename).not.toContain('\\');
        } else {
          // Should reject with appropriate error
          expect(response.status).toBeOneOf([400, 422]);
        }
      }
    });
  });

  describe('API Rate Limiting and DoS Prevention', () => {
    it('should limit request size', async () => {
      // Test very large JSON payload
      const largePayload = {
        title: 'A'.repeat(1000000), // 1MB string
        description: 'B'.repeat(1000000),
        content: 'C'.repeat(1000000)
      };

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send(largePayload);

      // Should reject oversized payloads
      expect(response.status).toBeOneOf([400, 413]);
    });

    it('should prevent deeply nested objects', async () => {
      // Create deeply nested object
      let deepObject: any = { value: 'test' };
      for (let i = 0; i < 1000; i++) {
        deepObject = { nested: deepObject };
      }

      const response = await request(app)
        .post('/api/unit-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test',
          subject: 'Math',
          grade: 5,
          term: 'Fall',
          metadata: deepObject
        });

      // Should reject or flatten deeply nested objects
      expect(response.status).toBeOneOf([400, 413, 422]);
    });
  });

  describe('Content Security and Sanitization', () => {
    it('should sanitize HTML content in rich text fields', async () => {
      const maliciousHtml = `
        <div>
          <script>alert('xss')</script>
          <iframe src="javascript:alert(1)"></iframe>
          <img src="x" onerror="alert(1)">
          <p onclick="alert(1)">Click me</p>
          <style>body { display: none; }</style>
          Valid content here
        </div>
      `;

      const response = await request(app)
        .post('/api/etfo-lesson-plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Lesson',
          subject: 'Mathematics',
          grade: 5,
          date: new Date().toISOString(),
          content: maliciousHtml
        });

      if (response.status === 200 || response.status === 201) {
        // Should strip dangerous elements but keep safe content
        expect(response.body.content).not.toContain('<script>');
        expect(response.body.content).not.toContain('<iframe>');
        expect(response.body.content).not.toContain('onerror');
        expect(response.body.content).not.toContain('onclick');
        expect(response.body.content).not.toContain('javascript:');
        expect(response.body.content).toContain('Valid content here');
      }
    });

    it('should validate date formats', async () => {
      const invalidDates = [
        'not-a-date',
        '2024-13-45', // Invalid month/day
        'javascript:alert(1)',
        '<script>alert(1)</script>',
        '2024/02/30', // Wrong format
        1234567890, // Unix timestamp as number
        null,
        undefined
      ];

      for (const invalidDate of invalidDates) {
        const response = await request(app)
          .post('/api/etfo-lesson-plans')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Lesson',
            subject: 'Mathematics',
            grade: 5,
            date: invalidDate
          });

        expect(response.status).toBe(400);
        expect(response.body.errors || response.body.error).toBeDefined();
      }
    });

    it('should validate email formats strictly', async () => {
      const invalidEmails = [
        'not-an-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user..user@domain.com',
        'user@domain..com',
        'user space@domain.com',
        'user@domain.c',
        'user@domain.com.',
        '<script>@domain.com',
        'user@domain.com<script>',
        'very.long.email.address.that.exceeds.normal.length.limits.for.email.addresses@domain.com'
      ];

      // Test against login endpoint
      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/login')
          .send({
            email: email,
            password: 'test123'
          });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid email format');
      }
    });
  });

  describe('Headers and Protocol Security', () => {
    it('should reject malicious headers', async () => {
      const maliciousHeaders = {
        'X-Forwarded-For': '<script>alert(1)</script>',
        'User-Agent': 'Mozilla/5.0 <script>alert(1)</script>',
        'Referer': 'javascript:alert(1)',
        'Content-Type': 'application/json; charset=utf-8<script>',
        'X-Custom-Header': '"><script>alert(1)</script>'
      };

      for (const [header, value] of Object.entries(maliciousHeaders)) {
        const response = await request(app)
          .get('/api/students')
          .set('Authorization', `Bearer ${authToken}`)
          .set(header, value);

        // Should not cause server errors
        expect(response.status).not.toBe(500);
        
        // Should not reflect malicious content in response
        const responseStr = JSON.stringify(response.body) + JSON.stringify(response.headers);
        expect(responseStr).not.toContain('<script>');
        expect(responseStr).not.toContain('javascript:');
      }
    });

    it('should validate Content-Type for POST requests', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'text/plain')
        .send('firstName=Test&lastName=Student&grade=5');

      // Should reject non-JSON content for JSON endpoints
      expect(response.status).toBeOneOf([400, 415]);
    });
  });
});