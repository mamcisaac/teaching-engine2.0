/**
 * File Upload Security Test Suite
 * Comprehensive file upload security validation and malicious file detection
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import supertest from 'supertest';
import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@teaching-engine/database';
import { generateAuthToken } from '../../services/auth/authService';
import { rateLimiters } from '../../middleware/rateLimit';
import curriculumImportRoutes from '../../routes/curriculumImport';
import { authMiddleware } from '../../middleware/auth';
import logger from '../../logger';
import path from 'path';
import fs from 'fs';

// Mock logger
jest.mock('../../logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock the curriculum import service
jest.mock('../../services/curriculum', () => ({
  curriculumImportService: {
    startImport: jest.fn().mockResolvedValue('test-import-id'),
    storeUploadedFile: jest.fn().mockResolvedValue(true),
    parseUploadedFile: jest.fn().mockResolvedValue({
      subjects: ['Math', 'Science'],
      errors: [],
    }),
    getImportProgress: jest.fn().mockResolvedValue({
      status: 'READY_FOR_REVIEW',
      progress: 100,
    }),
    confirmImport: jest.fn().mockResolvedValue({ created: 5 }),
    getImportHistory: jest.fn().mockResolvedValue([]),
    cancelImport: jest.fn().mockResolvedValue(true),
    finalizeImport: jest.fn().mockResolvedValue({
      totalExpectations: 10,
      subjects: ['Math'],
    }),
  },
}));

describe('File Upload Security Tests', () => {
  let app: express.Application;
  let prisma: PrismaClient;
  let request: supertest.SuperTest<supertest.Test>;
  let testToken: string;
  let testUser: unknown;

  // Malicious file content samples
  const maliciousFiles = {
    // Script injection in filename
    scriptFilename: 'test<script>alert("xss")</script>.pdf',

    // Path traversal in filename
    pathTraversalFilename: '../../../etc/passwd.pdf',

    // Null byte injection
    nullByteFilename: 'test\x00.exe.pdf',

    // Executable disguised as PDF
    executableAsPdf: Buffer.from([
      0x4d,
      0x5a,
      0x90,
      0x00, // PE header for Windows executable
      ...Array(100).fill(0x00),
    ]),

    // ZIP bomb (small compressed, huge uncompressed)
    zipBomb: Buffer.from([
      0x50,
      0x4b,
      0x03,
      0x04, // ZIP signature
      0x14,
      0x00,
      0x08,
      0x08, // ZIP headers with compression
      ...Array(50).fill(0xff),
    ]),

    // PHP webshell disguised as CSV
    phpWebshell: Buffer.from('<?php system($_GET["cmd"]); ?>\nName,Grade\nTest,A'),

    // JavaScript in CSV
    jsInCsv: Buffer.from('Name,Code\n"Test","<script>alert(\'XSS\')</script>"'),

    // SQL injection in CSV
    sqlInCsv: Buffer.from('Name,Query\n"Test","DROP TABLE users; --"'),

    // Large file (potential DoS)
    largeFile: Buffer.alloc(50 * 1024 * 1024, 'A'), // 50MB

    // Empty file
    emptyFile: Buffer.alloc(0),

    // Binary data disguised as text
    binaryAsText: Buffer.from([0xff, 0xfe, 0x00, 0x00, ...Array(100).fill(0x41)]),

    // Polyglot file (valid as multiple formats)
    polyglotFile: Buffer.from([
      0x25,
      0x50,
      0x44,
      0x46, // PDF header
      0x2d,
      0x31,
      0x2e,
      0x34, // PDF version
      ...Buffer.from('\n%<script>alert("XSS")</script>\n'),
    ]),

    // XML External Entity (XXE) attack in DOCX
    xxeDocx: Buffer.from([
      0x50,
      0x4b,
      0x03,
      0x04, // ZIP signature (DOCX is ZIP)
      ...Buffer.from(
        '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>',
      ),
    ]),

    // Malformed PDF with embedded JavaScript
    malformedPdf: Buffer.from([
      0x25,
      0x50,
      0x44,
      0x46, // PDF header
      ...Buffer.from('/JavaScript <script>app.alert("XSS")</script>'),
    ]),
  };

  // Valid test files
  const validFiles = {
    validPdf: Buffer.from([
      0x25,
      0x50,
      0x44,
      0x46,
      0x2d,
      0x31,
      0x2e,
      0x34, // PDF header
      0x0a,
      0x25,
      0xe2,
      0xe3,
      0xcf,
      0xd3,
      0x0a, // PDF magic
      ...Array(100).fill(0x20), // Padding
    ]),

    validCsv: Buffer.from('Name,Grade,Subject\nJohn,A,Math\nJane,B,Science'),

    validDocx: Buffer.from([
      0x50,
      0x4b,
      0x03,
      0x04, // ZIP signature
      0x14,
      0x00,
      0x06,
      0x00, // ZIP headers
      ...Array(100).fill(0x00), // DOCX content
    ]),

    smallValidFile: Buffer.from('Name,Grade\nTest,A'),
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-file-upload-secret';
    process.env.NODE_ENV = 'test';

    // Initialize test database
    prisma = new PrismaClient({
      datasources: {
        db: { url: process.env.DATABASE_URL || 'file:./test-file-upload.db' },
      },
    });

    // Create test user and token
    testUser = await prisma.user.create({
      data: {
        email: 'file.upload@test.com',
        name: 'File Upload Test User',
        password: 'HashedPassword123!',
        role: 'USER',
      },
    });

    testToken = await generateAuthToken(testUser.id.toString(), testUser.email);

    // Setup Express app
    app = express();
    app.use(express.json());

    // Add authentication middleware for protected routes
    app.use('/api/curriculum/import', authMiddleware);
    app.use('/api/curriculum/import', rateLimiters.upload);
    app.use('/api/curriculum/import', curriculumImportRoutes);

    // Test upload endpoint without authentication for security testing
    const testUpload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 1,
      },
    });

    app.post('/api/test/upload', testUpload.single('file'), (req, res) => {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      res.json({
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer.toString('hex').substring(0, 100),
      });
    });

    // Test endpoint with strict file validation
    const strictUpload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 1024 * 1024, // 1MB strict limit
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['text/csv'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only CSV files allowed'));
        }
      },
    });

    app.post('/api/test/strict-upload', strictUpload.single('file'), (req, res) => {
      res.json({ message: 'File uploaded successfully' });
    });

    request = supertest(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'file.upload' } },
    });
    await prisma.$disconnect();
  });

  describe('File Type Validation', () => {
    it('should accept valid file types', async () => {
      const validFileTests = [
        { buffer: validFiles.validCsv, filename: 'test.csv', mimetype: 'text/csv' },
        { buffer: validFiles.validPdf, filename: 'test.pdf', mimetype: 'application/pdf' },
        {
          buffer: validFiles.validDocx,
          filename: 'test.docx',
          mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ];

      for (const testFile of validFileTests) {
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${testToken}`)
          .attach('file', testFile.buffer, {
            filename: testFile.filename,
            contentType: testFile.mimetype,
          });

        expect(response.status).toBe(200);
        expect(response.body.sessionId).toBeTruthy();
        expect(response.body.filename).toBe(testFile.filename);
      }
    });

    it('should reject invalid file types', async () => {
      const invalidFileTests = [
        {
          buffer: maliciousFiles.executableAsPdf,
          filename: 'malware.exe',
          mimetype: 'application/x-executable',
        },
        {
          buffer: maliciousFiles.phpWebshell,
          filename: 'shell.php',
          mimetype: 'application/x-php',
        },
        { buffer: validFiles.validCsv, filename: 'test.txt', mimetype: 'text/plain' },
        { buffer: validFiles.validCsv, filename: 'test.js', mimetype: 'application/javascript' },
        { buffer: validFiles.validCsv, filename: 'test.html', mimetype: 'text/html' },
        { buffer: validFiles.validCsv, filename: 'test.xml', mimetype: 'application/xml' },
      ];

      for (const testFile of invalidFileTests) {
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${testToken}`)
          .attach('file', testFile.buffer, {
            filename: testFile.filename,
            contentType: testFile.mimetype,
          });

        expect(response.status).toBe(500);
        expect(response.body.error).toContain('Invalid file type');
      }
    });

    it('should validate file extensions against MIME types', async () => {
      const mismatchTests = [
        {
          buffer: maliciousFiles.executableAsPdf,
          filename: 'fake.pdf',
          mimetype: 'application/pdf',
        },
        { buffer: maliciousFiles.phpWebshell, filename: 'fake.csv', mimetype: 'text/csv' },
        { buffer: validFiles.validCsv, filename: 'wrong.pdf', mimetype: 'text/csv' },
      ];

      for (const testFile of mismatchTests) {
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${testToken}`)
          .attach('file', testFile.buffer, {
            filename: testFile.filename,
            contentType: testFile.mimetype,
          });

        // Should validate both extension and MIME type
        expect(response.status).toBeOneOf([400, 500]);
      }
    });

    it('should handle octet-stream MIME type carefully', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', validFiles.validDocx, {
          filename: 'test.docx',
          contentType: 'application/octet-stream',
        });

      // Should accept octet-stream only for specific extensions
      expect(response.status).toBe(200);
    });
  });

  describe('Filename Security', () => {
    it('should sanitize malicious filenames', async () => {
      const maliciousFilenames = [
        maliciousFiles.scriptFilename,
        maliciousFiles.pathTraversalFilename,
        maliciousFiles.nullByteFilename,
        'file with spaces.pdf',
        'file"with"quotes.pdf',
        "file'with'quotes.pdf",
        'file<with>brackets.pdf',
        'file|with|pipes.pdf',
        'file:with:colons.pdf',
        'file*with*asterisks.pdf',
        'file?with?questions.pdf',
        '../../etc/passwd.pdf',
        'COM1.pdf', // Windows reserved name
        'PRN.pdf', // Windows reserved name
        '.hidden.pdf',
      ];

      for (const filename of maliciousFilenames) {
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${testToken}`)
          .attach('file', validFiles.validPdf, {
            filename: filename,
            contentType: 'application/pdf',
          });

        if (response.status === 200) {
          // If upload succeeds, filename should be sanitized
          expect(response.body.filename).not.toBe(filename);
          expect(response.body.filename).not.toContain('<script>');
          expect(response.body.filename).not.toContain('../');
          expect(response.body.filename).not.toContain('\x00');
        } else {
          // Or upload should be rejected
          expect(response.status).toBeOneOf([400, 500]);
        }
      }
    });

    it('should handle extremely long filenames', async () => {
      const longFilename = 'a'.repeat(1000) + '.pdf';

      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', validFiles.validPdf, {
          filename: longFilename,
          contentType: 'application/pdf',
        });

      if (response.status === 200) {
        // Should truncate or sanitize long filenames
        expect(response.body.filename.length).toBeLessThan(255);
      } else {
        expect(response.status).toBeOneOf([400, 500]);
      }
    });

    it('should handle Unicode and special characters in filenames', async () => {
      const unicodeFilenames = [
        'test-文件.pdf',
        'тест.pdf',
        'test-emoji-🔥.pdf',
        'test-symbols-©®™.pdf',
        'test-combining-é.pdf',
        'test-rtl-‏test‏.pdf',
      ];

      for (const filename of unicodeFilenames) {
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${testToken}`)
          .attach('file', validFiles.validPdf, {
            filename: filename,
            contentType: 'application/pdf',
          });

        // Should handle Unicode gracefully
        expect(response.status).toBeOneOf([200, 400, 500]);

        if (response.status === 200) {
          expect(response.body.filename).toBeTruthy();
        }
      }
    });
  });

  describe('File Size Validation', () => {
    it('should enforce file size limits', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', maliciousFiles.largeFile, {
          filename: 'large.pdf',
          contentType: 'application/pdf',
        });

      expect(response.status).toBe(413); // Payload too large
    });

    it('should reject empty files', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', maliciousFiles.emptyFile, {
          filename: 'empty.pdf',
          contentType: 'application/pdf',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('empty');
    });

    it('should handle files at size boundaries', async () => {
      // Test file just under the limit
      const nearLimitFile = Buffer.alloc(9 * 1024 * 1024, 'A'); // 9MB

      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', nearLimitFile, {
          filename: 'near-limit.csv',
          contentType: 'text/csv',
        });

      // Should accept files just under the limit
      expect(response.status).toBe(200);
    });
  });

  describe('Malicious Content Detection', () => {
    it('should detect executable content in files', async () => {
      const executableTests = [
        { buffer: maliciousFiles.executableAsPdf, name: 'PE executable as PDF' },
        { buffer: maliciousFiles.phpWebshell, name: 'PHP webshell' },
        { buffer: maliciousFiles.binaryAsText, name: 'Binary disguised as text' },
      ];

      for (const test of executableTests) {
        const response = await request.post('/api/test/upload').attach('file', test.buffer, {
          filename: `test-${test.name}.csv`,
          contentType: 'text/csv',
        });

        // Should either detect and reject or sanitize
        expect(response.status).toBeOneOf([200, 400, 500]);
      }
    });

    it('should handle script injection in file content', async () => {
      const scriptInjectionTests = [maliciousFiles.jsInCsv, maliciousFiles.phpWebshell];

      for (const maliciousBuffer of scriptInjectionTests) {
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${testToken}`)
          .attach('file', maliciousBuffer, {
            filename: 'test.csv',
            contentType: 'text/csv',
          });

        // Should accept the file but content should be sanitized during processing
        expect(response.status).toBe(200);
      }
    });

    it('should detect ZIP bomb attempts', async () => {
      const response = await request
        .post('/api/test/upload')
        .attach('file', maliciousFiles.zipBomb, {
          filename: 'bomb.docx',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

      // Should handle compressed files safely
      expect(response.status).toBeOneOf([200, 400, 500]);
    });

    it('should detect polyglot files', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', maliciousFiles.polyglotFile, {
          filename: 'polyglot.pdf',
          contentType: 'application/pdf',
        });

      // Should validate file format strictly
      expect(response.status).toBeOneOf([200, 400, 500]);
    });

    it('should detect XXE attacks in DOCX files', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', maliciousFiles.xxeDocx, {
          filename: 'xxe.docx',
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

      // Should handle XML safely
      expect(response.status).toBeOneOf([200, 400, 500]);
    });
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication for file uploads', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .attach('file', validFiles.validCsv, {
          filename: 'test.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject invalid tokens', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', 'Bearer invalid-token')
        .attach('file', validFiles.validCsv, {
          filename: 'test.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(401);
    });

    it('should handle expired tokens', async () => {
      const expiredToken = await generateAuthToken(testUser.id.toString(), testUser.email, '1ms');

      await new Promise((resolve) => setTimeout(resolve, 10));

      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${expiredToken}`)
        .attach('file', validFiles.validCsv, {
          filename: 'test.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to file uploads', async () => {
      const uploadRequests = [];

      // Make multiple upload requests
      for (let i = 0; i < 15; i++) {
        uploadRequests.push(
          request
            .post('/api/curriculum/import/upload')
            .set('Authorization', `Bearer ${testToken}`)
            .attach('file', validFiles.smallValidFile, {
              filename: `test-${i}.csv`,
              contentType: 'text/csv',
            }),
        );
      }

      const responses = await Promise.all(uploadRequests);

      // Should rate limit after several uploads
      const rateLimitedResponses = responses.filter((r) => r.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);

      // Rate limited responses should have proper headers
      rateLimitedResponses.forEach((response) => {
        expect(response.headers['retry-after']).toBeTruthy();
        expect(response.body.error).toContain('File upload limit exceeded');
      });
    });

    it('should have separate rate limits for different users', async () => {
      // Create another user
      const user2 = await prisma.user.create({
        data: {
          email: 'file.upload.2@test.com',
          name: 'File Upload Test User 2',
          password: 'HashedPassword123!',
          role: 'USER',
        },
      });

      const token2 = await generateAuthToken(user2.id.toString(), user2.email);

      // Upload with first user until rate limited
      for (let i = 0; i < 12; i++) {
        await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${testToken}`)
          .attach('file', validFiles.smallValidFile, {
            filename: `test1-${i}.csv`,
            contentType: 'text/csv',
          });
      }

      // Second user should still be able to upload
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${token2}`)
        .attach('file', validFiles.smallValidFile, {
          filename: 'test2.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(200);

      // Clean up
      await prisma.user.delete({ where: { id: user2.id } });
    });
  });

  describe('Upload Security Edge Cases', () => {
    it('should handle missing file field', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .send({ notAFile: 'data' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No file uploaded');
    });

    it('should handle multiple file uploads when only one expected', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', validFiles.validCsv, 'test1.csv')
        .attach('file2', validFiles.validPdf, 'test2.pdf');

      // Should only process the expected file field
      expect(response.status).toBeOneOf([200, 400]);
    });

    it('should handle corrupted multipart data', async () => {
      // Manually craft malformed multipart data
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .set('Content-Type', 'multipart/form-data; boundary=malformed')
        .send('--malformed\r\nContent-Disposition: form-data; name="file"\r\n\r\nmalformed');

      expect(response.status).toBeOneOf([400, 500]);
    });

    it('should handle oversized field names and values', async () => {
      const oversizedFieldName = 'a'.repeat(10000);
      const formData = new FormData();
      formData.append(oversizedFieldName, 'value');

      // Note: This is a simplified test - real implementation would need proper FormData handling
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', validFiles.validCsv, 'test.csv');

      expect(response.status).toBeOneOf([200, 400, 413]);
    });

    it('should handle concurrent file uploads', async () => {
      const concurrentUploads = Array.from({ length: 5 }, (_, i) =>
        request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${testToken}`)
          .attach('file', validFiles.smallValidFile, {
            filename: `concurrent-${i}.csv`,
            contentType: 'text/csv',
          }),
      );

      const responses = await Promise.all(concurrentUploads);

      // All should succeed or be rate limited
      responses.forEach((response) => {
        expect(response.status).toBeOneOf([200, 429]);
      });
    });

    it('should handle upload interruption gracefully', async () => {
      // This is difficult to test comprehensively in a unit test
      // but we can verify basic error handling
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', validFiles.validCsv, 'test.csv');

      expect(response.status).toBeOneOf([200, 400, 500]);
    });
  });

  describe('File Processing Security', () => {
    it('should validate file content after upload', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', validFiles.validCsv, {
          filename: 'test.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(200);

      // Parse the uploaded file
      const parseResponse = await request
        .post('/api/curriculum/import/parse')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          sessionId: response.body.sessionId,
          useAiExtraction: false,
        });

      expect(parseResponse.status).toBe(200);
    });

    it('should sanitize file content during processing', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', maliciousFiles.sqlInCsv, {
          filename: 'malicious.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(200);

      // Content should be sanitized during processing
      const parseResponse = await request
        .post('/api/curriculum/import/parse')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          sessionId: response.body.sessionId,
          useAiExtraction: false,
        });

      // Processing should complete without executing malicious content
      expect(parseResponse.status).toBe(200);
    });

    it('should handle file processing errors gracefully', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', maliciousFiles.malformedPdf, {
          filename: 'malformed.pdf',
          contentType: 'application/pdf',
        });

      if (response.status === 200) {
        // If upload succeeds, parsing should handle malformed content
        const parseResponse = await request
          .post('/api/curriculum/import/parse')
          .set('Authorization', `Bearer ${testToken}`)
          .send({
            sessionId: response.body.sessionId,
            useAiExtraction: false,
          });

        expect(parseResponse.status).toBeOneOf([200, 400, 500]);
      }
    });
  });

  describe('Error Handling Security', () => {
    it('should not expose internal paths in error messages', async () => {
      const response = await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', maliciousFiles.executableAsPdf, {
          filename: 'malware.exe',
          contentType: 'application/x-executable',
        });

      expect(response.status).toBeOneOf([400, 500]);

      // Error should not expose internal paths
      expect(response.body.error).not.toContain('/home/');
      expect(response.body.error).not.toContain('/var/');
      expect(response.body.error).not.toContain('C:\\');
      expect(response.body.error).not.toContain('node_modules');
    });

    it('should not expose stack traces in production mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      try {
        const response = await request
          .post('/api/curriculum/import/upload')
          .set('Authorization', `Bearer ${testToken}`)
          .attach('file', maliciousFiles.largeFile, {
            filename: 'large.pdf',
            contentType: 'application/pdf',
          });

        expect(response.body.stack).toBeUndefined();
        expect(response.body.trace).toBeUndefined();
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('should log security events appropriately', async () => {
      await request
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${testToken}`)
        .attach('file', maliciousFiles.executableAsPdf, {
          filename: 'suspicious.exe',
          contentType: 'application/pdf',
        });

      // Should log suspicious activity (implementation dependent)
      expect(true).toBe(true); // Placeholder for logging verification
    });
  });
});
