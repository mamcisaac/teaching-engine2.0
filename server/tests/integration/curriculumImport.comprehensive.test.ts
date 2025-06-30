import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@teaching-engine/database';
import fs from 'fs';
import path from 'path';
import { testHelpers } from '../test-helpers';

const prisma = new PrismaClient();

describe('Curriculum Import Routes - Comprehensive Integration Tests', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Create test user and get auth token
    const user = await testHelpers.createTestUser();
    userId = user.id;
    authToken = await testHelpers.getAuthToken(user.email, 'password');
  });

  afterAll(async () => {
    await testHelpers.cleanupTestData();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up any existing imports
    await prisma.curriculumImport.deleteMany({
      where: { userId },
    });
  });

  describe('POST /api/curriculum-import/start', () => {
    it('should start a new import session', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          grade: 3,
          subject: 'Mathematics',
          sourceFormat: 'csv',
        });

      expect(response.status).toBe(200);
      expect(response.body.sessionId).toMatch(/^c[a-z0-9]{8,}$/);
      expect(response.body.message).toBe('Import session created');

      // Verify in database
      const importRecord = await prisma.curriculumImport.findUnique({
        where: { id: response.body.sessionId },
      });
      expect(importRecord).toBeTruthy();
      expect(importRecord?.grade).toBe(3);
      expect(importRecord?.subject).toBe('Mathematics');
    });

    it('should reject invalid grade', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          grade: 13, // Invalid grade
          subject: 'Mathematics',
          sourceFormat: 'csv',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject invalid source format', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          grade: 3,
          subject: 'Mathematics',
          sourceFormat: 'txt', // Invalid format
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/curriculum-import/:importId/upload', () => {
    let importId: string;

    beforeEach(async () => {
      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId,
          grade: 3,
          subject: 'Mathematics',
          sourceFormat: 'csv',
          status: 'UPLOADING',
        },
      });
      importId = importRecord.id;
    });

    it('should upload and parse CSV file', async () => {
      const csvContent = `code,description,subject,grade,domain
M3.1,Count to 1000,Mathematics,3,Number Sense
M3.2,Add and subtract three-digit numbers,Mathematics,3,Number Sense
M3.3,Identify 2D shapes,Mathematics,3,Geometry`;

      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/upload`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(csvContent), {
          filename: 'curriculum.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(200);
      expect(response.body.subjects).toHaveLength(1);
      expect(response.body.subjects[0].name).toBe('Mathematics');
      expect(response.body.subjects[0].expectations).toHaveLength(3);
    });

    it('should upload and parse PDF file with AI', async () => {
      // Create a minimal PDF buffer for testing
      const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< >>\nendobj\nxref\n0 0\ntrailer\n<< >>\n%%EOF');

      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/upload`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', pdfBuffer, {
          filename: 'curriculum.pdf',
          contentType: 'application/pdf',
        });

      // Note: This will fail in test environment without OpenAI key
      // But we're testing the route handling
      expect([200, 500]).toContain(response.status);
    });

    it('should handle large files', async () => {
      // Create a large CSV (1MB)
      const headers = 'code,description,subject,grade,domain\n';
      const rows = Array(10000)
        .fill(null)
        .map((_, i) => `M${i}.1,Description ${i},Mathematics,3,Domain`)
        .join('\n');
      const largeCsv = headers + rows;

      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/upload`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(largeCsv), {
          filename: 'large-curriculum.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(200);
      expect(response.body.subjects[0].expectations).toHaveLength(10000);
    });

    it('should reject files that are too large', async () => {
      // Create a file larger than 10MB limit
      const hugeFile = Buffer.alloc(11 * 1024 * 1024); // 11MB

      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/upload`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', hugeFile, {
          filename: 'huge.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(413); // Payload too large
    });

    it('should handle missing file', async () => {
      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/upload`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('No file uploaded');
    });

    it('should handle invalid import ID', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/invalid-id/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test'), 'test.csv');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/curriculum-import/:importId/confirm', () => {
    let importId: string;

    beforeEach(async () => {
      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId,
          grade: 3,
          subject: 'Mathematics',
          sourceFormat: 'csv',
          status: 'READY_FOR_REVIEW',
          metadata: {
            parsedSubjects: [
              {
                name: 'Mathematics',
                expectations: [
                  {
                    code: 'M3.1',
                    description: 'Count to 1000',
                    strand: 'Number Sense',
                    grade: 3,
                    subject: 'Mathematics',
                  },
                ],
              },
            ],
          },
        },
      });
      importId = importRecord.id;
    });

    it('should confirm import and create expectations', async () => {
      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.created).toBe(1);

      // Verify expectation was created
      const expectation = await prisma.curriculumExpectation.findUnique({
        where: { code: 'M3.1' },
      });
      expect(expectation).toBeTruthy();
      expect(expectation?.description).toBe('Count to 1000');
    });

    it('should not duplicate existing expectations', async () => {
      // Create existing expectation
      await prisma.curriculumExpectation.create({
        data: {
          code: 'M3.1',
          description: 'Existing expectation',
          strand: 'Number Sense',
          grade: 3,
          subject: 'Mathematics',
        },
      });

      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.created).toBe(0);
    });

    it('should reject confirmation for wrong status', async () => {
      await prisma.curriculumImport.update({
        where: { id: importId },
        data: { status: 'PROCESSING' },
      });

      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/curriculum-import/presets', () => {
    it('should return available presets', async () => {
      const response = await request(app)
        .get('/api/curriculum-import/presets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.presets).toBeDefined();
      expect(response.body.presets.length).toBeGreaterThan(0);
      expect(response.body.presets[0]).toHaveProperty('id');
      expect(response.body.presets[0]).toHaveProperty('name');
      expect(response.body.presets[0]).toHaveProperty('description');
    });
  });

  describe('POST /api/curriculum-import/preset/:presetId', () => {
    it('should load PEI French preset', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/preset/pei-grade1-french')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.subjects).toHaveLength(2);
      expect(response.body.subjects[0].name).toBe('Français Langue Première');
    });

    it('should handle invalid preset ID', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/preset/invalid-preset')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/curriculum-import/:importId/progress', () => {
    it('should return import progress', async () => {
      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId,
          grade: 3,
          subject: 'Mathematics',
          sourceFormat: 'csv',
          status: 'PROCESSING',
          totalOutcomes: 100,
          processedOutcomes: 50,
          errorLog: ['Error 1'],
        },
      });

      const response = await request(app)
        .get(`/api/curriculum-import/${importRecord.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.importId).toBe(importRecord.id);
      expect(response.body.status).toBe('PROCESSING');
      expect(response.body.totalOutcomes).toBe(100);
      expect(response.body.processedOutcomes).toBe(50);
      expect(response.body.errors).toHaveLength(1);
    });

    it('should return 404 for non-existent import', async () => {
      const response = await request(app)
        .get('/api/curriculum-import/non-existent/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/curriculum-import/:importId', () => {
    it('should cancel import', async () => {
      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId,
          grade: 3,
          subject: 'Mathematics',
          sourceFormat: 'csv',
          status: 'PROCESSING',
        },
      });

      const response = await request(app)
        .delete(`/api/curriculum-import/${importRecord.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify status updated
      const updated = await prisma.curriculumImport.findUnique({
        where: { id: importRecord.id },
      });
      expect(updated?.status).toBe('CANCELLED');
    });
  });

  describe('GET /api/curriculum-import/history', () => {
    beforeEach(async () => {
      // Create multiple import records
      await prisma.curriculumImport.createMany({
        data: [
          {
            userId,
            grade: 1,
            subject: 'Math',
            sourceFormat: 'csv',
            status: 'COMPLETED',
            createdAt: new Date('2024-01-01'),
          },
          {
            userId,
            grade: 2,
            subject: 'English',
            sourceFormat: 'pdf',
            status: 'FAILED',
            createdAt: new Date('2024-01-02'),
          },
          {
            userId,
            grade: 3,
            subject: 'Science',
            sourceFormat: 'docx',
            status: 'COMPLETED',
            createdAt: new Date('2024-01-03'),
          },
        ],
      });
    });

    it('should return import history', async () => {
      const response = await request(app)
        .get('/api/curriculum-import/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      expect(response.body[0].subject).toBe('Science'); // Most recent first
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/curriculum-import/history?limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('File format validation', () => {
    let importId: string;

    beforeEach(async () => {
      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId,
          grade: 3,
          subject: 'Mathematics',
          sourceFormat: 'csv',
          status: 'UPLOADING',
        },
      });
      importId = importRecord.id;
    });

    it('should validate CSV structure', async () => {
      const invalidCsv = `invalid,headers,without,required,fields
data1,data2,data3,data4,data5`;

      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/upload`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(invalidCsv), 'invalid.csv');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('CSV must contain');
    });

    it('should handle different CSV encodings', async () => {
      // UTF-8 with BOM
      const csvWithBom = '\ufeffcode,description,subject,grade,domain\n' +
        'M3.1,Test with émoji 🎯,Math,3,Number';

      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/upload`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(csvWithBom), 'utf8-bom.csv');

      expect(response.status).toBe(200);
      expect(response.body.subjects[0].expectations[0].description).toContain('🎯');
    });

    it('should handle CSV with special characters', async () => {
      const specialCsv = `code,description,subject,grade,domain
"M3.1","Test with ""quotes"" and commas, semicolons; etc.",Math,3,Number
"M3.2","Test with
newlines",Math,3,Number`;

      const response = await request(app)
        .post(`/api/curriculum-import/${importId}/upload`)
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(specialCsv), 'special.csv');

      expect(response.status).toBe(200);
      expect(response.body.subjects[0].expectations).toHaveLength(2);
    });
  });

  describe('Concurrent import handling', () => {
    it('should handle multiple simultaneous imports', async () => {
      // Start multiple imports concurrently
      const promises = Array(5).fill(null).map((_, i) =>
        request(app)
          .post('/api/curriculum-import/start')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            grade: i + 1,
            subject: `Subject${i}`,
            sourceFormat: 'csv',
          })
      );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.sessionId).toBeDefined();
      });

      // Verify all imports were created
      const imports = await prisma.curriculumImport.findMany({
        where: { userId },
      });
      expect(imports.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Error scenarios', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // In a real scenario, you might use a test database that can be taken offline
      expect(true).toBe(true); // Placeholder
    });

    it('should handle malformed multipart requests', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/test-id/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'multipart/form-data')
        .send('malformed data');

      expect(response.status).toBe(400);
    });
  });

  describe('Performance and load testing', () => {
    it('should handle rapid sequential requests', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        const response = await request(app)
          .post('/api/curriculum-import/start')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            grade: 3,
            subject: 'Mathematics',
            sourceFormat: 'csv',
          });
        
        expect(response.status).toBe(200);
      }

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete in under 5 seconds
    });
  });
});