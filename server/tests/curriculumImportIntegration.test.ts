import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import fs from 'fs/promises';
import path from 'path';
import { app } from '../src/index';
import { prisma } from '../src/prisma';
import { createTestUser, getAuthToken } from './test-helpers';

describe('Curriculum Import Integration', () => {
  let testUserId: number;
  let authToken: string;
  let testFilePath: string;

  beforeEach(async () => {
    // Create test user
    const testUser = await createTestUser();
    testUserId = testUser.id;
    authToken = getAuthToken(testUser.id);

    // Create test PDF file
    testFilePath = path.join(__dirname, 'fixtures', 'test-curriculum.pdf');
    await fs.mkdir(path.dirname(testFilePath), { recursive: true });
    
    // Create a minimal PDF file for testing
    const pdfContent = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n' +
      '2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n' +
      '3 0 obj\n<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>\nendobj\n' +
      'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000074 00000 n\n' +
      '0000000120 00000 n\ntrailer\n<</Size 4/Root 1 0 R>>\nstartxref\n179\n%%EOF'
    );
    await fs.writeFile(testFilePath, pdfContent);
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.unlink(testFilePath);
    } catch (error) {
      // File might not exist, ignore error
    }

    // Clean up database
    await prisma.curriculumImport.deleteMany({
      where: { userId: testUserId }
    });
  });

  describe('POST /api/curriculum/import/upload', () => {
    it('should upload curriculum document successfully', async () => {
      const response = await request(app)
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', testFilePath)
        .expect(200);

      expect(response.body).toHaveProperty('importId');
      expect(response.body).toHaveProperty('status', 'UPLOADING');

      // Verify database record
      const importRecord = await prisma.curriculumImport.findFirst({
        where: { id: response.body.importId }
      });

      expect(importRecord).toBeDefined();
      expect(importRecord?.userId).toBe(testUserId);
      expect(importRecord?.originalName).toBe('test-curriculum.pdf');
      expect(importRecord?.mimeType).toBe('application/pdf');
    });

    it('should reject non-document files', async () => {
      // Create a fake image file
      const imagePath = path.join(__dirname, 'fixtures', 'test-image.jpg');
      await fs.writeFile(imagePath, Buffer.from('fake image data'));

      const response = await request(app)
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', imagePath)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid file type');

      // Clean up
      await fs.unlink(imagePath);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/curriculum/import/upload')
        .attach('document', testFilePath)
        .expect(401);
    });

    it('should handle missing file', async () => {
      const response = await request(app)
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No file uploaded');
    });

    it('should handle large files gracefully', async () => {
      // Create a large file (simulated)
      const largePath = path.join(__dirname, 'fixtures', 'large-file.pdf');
      const largeContent = Buffer.alloc(10 * 1024 * 1024, 'x'); // 10MB
      await fs.writeFile(largePath, largeContent);

      const response = await request(app)
        .post('/api/curriculum/import/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('document', largePath)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('File too large');

      // Clean up
      await fs.unlink(largePath);
    });
  });

  describe('GET /api/curriculum/import/:id/status', () => {
    it('should return import status', async () => {
      // Create test import record
      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId: testUserId,
          filename: 'test.pdf',
          originalName: 'test-curriculum.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          filePath: '/tmp/test.pdf',
          status: 'READY_FOR_REVIEW',
          parsedData: JSON.stringify({
            subject: 'Mathematics',
            grade: 1,
            outcomes: [
              { code: 'M1.1', description: 'Count to 10' }
            ]
          })
        }
      });

      const response = await request(app)
        .get(`/api/curriculum/import/${importRecord.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'READY_FOR_REVIEW');
      expect(response.body).toHaveProperty('parsedData');
      expect(response.body.parsedData).toHaveProperty('subject', 'Mathematics');
    });

    it('should return 404 for non-existent import', async () => {
      await request(app)
        .get('/api/curriculum/import/999/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not allow access to other users imports', async () => {
      // Create another user's import
      const otherUser = await createTestUser();
      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId: otherUser.id,
          filename: 'other-test.pdf',
          originalName: 'other-curriculum.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          filePath: '/tmp/other-test.pdf',
          status: 'READY_FOR_REVIEW'
        }
      });

      await request(app)
        .get(`/api/curriculum/import/${importRecord.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/curriculum/import/:id/confirm', () => {
    it('should confirm curriculum import successfully', async () => {
      const curriculumData = {
        subject: 'Mathematics',
        grade: 1,
        outcomes: [
          { code: 'M1.1', description: 'Count to 10' },
          { code: 'M1.2', description: 'Recognize numbers 1-10' }
        ]
      };

      // Create test import record
      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId: testUserId,
          filename: 'test.pdf',
          originalName: 'test-curriculum.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          filePath: '/tmp/test.pdf',
          status: 'READY_FOR_REVIEW',
          parsedData: JSON.stringify(curriculumData)
        }
      });

      const response = await request(app)
        .post(`/api/curriculum/import/${importRecord.id}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ curriculumData })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Curriculum imported successfully');
      expect(response.body).toHaveProperty('outcomesCreated', 2);

      // Verify outcomes were created in database
      const outcomes = await prisma.outcome.findMany({
        where: {
          subject: 'Mathematics',
          grade: 1,
          code: { in: ['M1.1', 'M1.2'] }
        }
      });

      expect(outcomes).toHaveLength(2);
      expect(outcomes[0].description).toBe('Count to 10');
      expect(outcomes[1].description).toBe('Recognize numbers 1-10');

      // Verify import status updated
      const updatedImport = await prisma.curriculumImport.findUnique({
        where: { id: importRecord.id }
      });
      expect(updatedImport?.status).toBe('CONFIRMED');
    });

    it('should validate curriculum data structure', async () => {
      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId: testUserId,
          filename: 'test.pdf',
          originalName: 'test-curriculum.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          filePath: '/tmp/test.pdf',
          status: 'READY_FOR_REVIEW'
        }
      });

      // Invalid data - missing required fields
      const invalidData = {
        subject: 'Mathematics'
        // Missing grade and outcomes
      };

      const response = await request(app)
        .post(`/api/curriculum/import/${importRecord.id}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ curriculumData: invalidData })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid curriculum data');
    });

    it('should handle duplicate outcome codes gracefully', async () => {
      // First, create an existing outcome
      await prisma.outcome.create({
        data: {
          id: 'existing-outcome',
          subject: 'Mathematics',
          grade: 1,
          code: 'M1.1',
          description: 'Existing outcome'
        }
      });

      const curriculumData = {
        subject: 'Mathematics',
        grade: 1,
        outcomes: [
          { code: 'M1.1', description: 'Duplicate code outcome' },
          { code: 'M1.2', description: 'New outcome' }
        ]
      };

      const importRecord = await prisma.curriculumImport.create({
        data: {
          userId: testUserId,
          filename: 'test.pdf',
          originalName: 'test-curriculum.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024,
          filePath: '/tmp/test.pdf',
          status: 'READY_FOR_REVIEW',
          parsedData: JSON.stringify(curriculumData)
        }
      });

      const response = await request(app)
        .post(`/api/curriculum/import/${importRecord.id}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ curriculumData })
        .expect(200);

      expect(response.body).toHaveProperty('outcomesCreated', 1);
      expect(response.body).toHaveProperty('duplicatesSkipped', 1);
    });
  });

  describe('GET /api/curriculum/import/history', () => {
    it('should return user import history', async () => {
      // Create multiple import records
      await prisma.curriculumImport.createMany({
        data: [
          {
            userId: testUserId,
            filename: 'import1.pdf',
            originalName: 'Math Curriculum.pdf',
            mimeType: 'application/pdf',
            fileSize: 1024,
            filePath: '/tmp/import1.pdf',
            status: 'CONFIRMED'
          },
          {
            userId: testUserId,
            filename: 'import2.pdf', 
            originalName: 'Science Curriculum.pdf',
            mimeType: 'application/pdf',
            fileSize: 2048,
            filePath: '/tmp/import2.pdf',
            status: 'READY_FOR_REVIEW'
          }
        ]
      });

      const response = await request(app)
        .get('/api/curriculum/import/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('imports');
      expect(response.body.imports).toHaveLength(2);
      expect(response.body.imports[0]).toHaveProperty('originalName');
      expect(response.body.imports[0]).toHaveProperty('status');
      expect(response.body.imports[0]).toHaveProperty('createdAt');
    });

    it('should paginate results', async () => {
      // Create many import records
      const imports = Array.from({ length: 15 }, (_, i) => ({
        userId: testUserId,
        filename: `import${i}.pdf`,
        originalName: `Curriculum ${i}.pdf`,
        mimeType: 'application/pdf',
        fileSize: 1024,
        filePath: `/tmp/import${i}.pdf`,
        status: 'CONFIRMED' as const
      }));

      await prisma.curriculumImport.createMany({ data: imports });

      const response = await request(app)
        .get('/api/curriculum/import/history')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.imports).toHaveLength(10);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('total', 15);
      expect(response.body.pagination).toHaveProperty('page', 1);
      expect(response.body.pagination).toHaveProperty('totalPages', 2);
    });
  });
});