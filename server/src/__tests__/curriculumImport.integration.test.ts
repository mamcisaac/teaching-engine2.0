import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import { prisma } from '../prisma';
import { getTestAuthToken, testUserData } from '../test-utils/auth';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Curriculum Import API', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    const auth = await getTestAuthToken();
    authToken = auth.token;
    userId = auth.userId;
  });

  beforeEach(async () => {
    // Clean up any existing curriculum imports and expectations
    await prisma.curriculumExpectation.deleteMany({});
    await prisma.curriculumImport.deleteMany({});
  });

  afterAll(async () => {
    await prisma.curriculumExpectation.deleteMany({});
    await prisma.curriculumImport.deleteMany({});
  });

  describe('POST /api/curriculum/import/start', () => {
    it('should start a new import session', async () => {
      const response = await request(app)
        .post('/api/curriculum/import/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          grade: 1,
          subject: 'Mathematics',
          sourceFormat: 'manual',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('importId');
      expect(response.body.message).toBe('Import session started successfully');

      // Verify in database
      const importSession = await prisma.curriculumImport.findUnique({
        where: { id: response.body.importId },
      });
      expect(importSession).toBeTruthy();
      expect(importSession?.grade).toBe(1);
      expect(importSession?.subject).toBe('Mathematics');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/curriculum/import/start')
        .send({
          grade: 1,
          subject: 'Mathematics',
          sourceFormat: 'manual',
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/curriculum/import/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          grade: 1,
          // missing subject and sourceFormat
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('POST /api/curriculum/import/import-preset', () => {
    it('should load a preset curriculum', async () => {
      const response = await request(app)
        .post('/api/curriculum/import/import-preset')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          presetId: 'pei-grade1-french',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('subjects');
      expect(response.body.subjects).toBeInstanceOf(Array);
      expect(response.body.subjects.length).toBeGreaterThan(0);
      expect(response.body.subjects[0]).toHaveProperty('name');
      expect(response.body.subjects[0]).toHaveProperty('expectations');
    });

    it('should handle unknown preset', async () => {
      const response = await request(app)
        .post('/api/curriculum/import/import-preset')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          presetId: 'unknown-preset',
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Unknown preset');
    });
  });

  describe('POST /api/curriculum/import/:id/confirm', () => {
    it('should confirm import and create expectations', async () => {
      // First, load a preset
      const presetResponse = await request(app)
        .post('/api/curriculum/import/import-preset')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          presetId: 'ontario-grade1-english',
        });

      expect(presetResponse.status).toBe(200);
      const sessionId = presetResponse.body.sessionId;

      // Then confirm the import
      const confirmResponse = await request(app)
        .post(`/api/curriculum/import/${sessionId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(confirmResponse.status).toBe(200);
      expect(confirmResponse.body.message).toBe('Import confirmed successfully');
      expect(confirmResponse.body).toHaveProperty('created');
      expect(confirmResponse.body.created).toBeGreaterThan(0);

      // Verify expectations were created
      const expectations = await prisma.curriculumExpectation.findMany({
        where: { importId: sessionId },
      });
      expect(expectations.length).toBeGreaterThan(0);
    });

    it('should reject confirmation if not ready', async () => {
      // Create an import session in wrong status
      const importSession = await prisma.curriculumImport.create({
        data: {
          userId,
          grade: 1,
          subject: 'Test',
          sourceFormat: 'manual',
          status: 'UPLOADING',
        },
      });

      const response = await request(app)
        .post(`/api/curriculum/import/${importSession.id}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('not ready to be confirmed');
    });
  });

  describe('GET /api/curriculum/import/:id/progress', () => {
    it('should return import progress', async () => {
      // Create an import session
      const importSession = await prisma.curriculumImport.create({
        data: {
          userId,
          grade: 1,
          subject: 'Test',
          sourceFormat: 'manual',
          status: 'PROCESSING',
          totalOutcomes: 10,
          processedOutcomes: 5,
        },
      });

      const response = await request(app)
        .get(`/api/curriculum/import/${importSession.id}/progress`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'PROCESSING');
      expect(response.body).toHaveProperty('totalOutcomes', 10);
      expect(response.body).toHaveProperty('processedOutcomes', 5);
    });

    it('should return 404 for non-existent import', async () => {
      const response = await request(app)
        .get('/api/curriculum/import/non-existent-id/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('CSV Import', () => {
    it('should parse CSV content correctly', async () => {
      const { curriculumImportService } = await import('../services/curriculumImportService');
      
      const csvContent = `code,description,subject,grade,domain
M1.1,"Count to 20 and represent numbers to 10",Mathematics,1,Number Sense
M1.2,"Compare and order numbers to 10",Mathematics,1,Number Sense
L1.1,"Listen to understand and respond appropriately",Language,1,Oral Communication`;

      const outcomes = curriculumImportService.parseCSV(csvContent);
      
      expect(outcomes).toHaveLength(3);
      expect(outcomes[0]).toEqual({
        code: 'M1.1',
        description: 'Count to 20 and represent numbers to 10',
        subject: 'Mathematics',
        grade: 1,
        domain: 'Number Sense',
      });
    });

    it('should handle CSV with quoted values', async () => {
      const { curriculumImportService } = await import('../services/curriculumImportService');
      
      const csvContent = `code,description,subject,grade,domain
"M1.1","Count to 20, and represent numbers to 10","Mathematics",1,"Number Sense"
"L1.1","Listen to understand, respond appropriately","Language",1,"Oral Communication"`;

      const outcomes = curriculumImportService.parseCSV(csvContent);
      
      expect(outcomes).toHaveLength(2);
      expect(outcomes[0].description).toBe('Count to 20, and represent numbers to 10');
    });

    it('should reject CSV without required columns', async () => {
      const { curriculumImportService } = await import('../services/curriculumImportService');
      
      const csvContent = `name,value
Test,123`;

      expect(() => curriculumImportService.parseCSV(csvContent)).toThrow('CSV must contain "code" and "description" columns');
    });
  });

  describe('ETFO Progress Integration', () => {
    it('should update progress after successful import', async () => {
      // Load and confirm a preset
      const presetResponse = await request(app)
        .post('/api/curriculum/import/import-preset')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          presetId: 'pei-grade1-french',
        });

      const sessionId = presetResponse.body.sessionId;

      await request(app)
        .post(`/api/curriculum/import/${sessionId}/confirm`)
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      // Check ETFO progress
      const progressResponse = await request(app)
        .get('/api/etfo/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(progressResponse.status).toBe(200);
      expect(progressResponse.body.curriculumExpectations.imported).toBeGreaterThan(0);
    });
  });

  describe('Import History', () => {
    it('should return user import history', async () => {
      // Create a few import sessions
      await prisma.curriculumImport.createMany({
        data: [
          {
            userId,
            grade: 1,
            subject: 'Math',
            sourceFormat: 'manual',
            status: 'COMPLETED',
          },
          {
            userId,
            grade: 2,
            subject: 'Science',
            sourceFormat: 'csv',
            status: 'COMPLETED',
          },
        ],
      });

      const response = await request(app)
        .get('/api/curriculum/import/history')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
    });

    it('should respect limit parameter', async () => {
      // Create multiple import sessions
      const imports = Array.from({ length: 5 }, (_, i) => ({
        userId,
        grade: i + 1,
        subject: `Subject ${i}`,
        sourceFormat: 'manual' as const,
        status: 'COMPLETED' as const,
      }));
      
      await prisma.curriculumImport.createMany({ data: imports });

      const response = await request(app)
        .get('/api/curriculum/import/history?limit=3')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
    });
  });
});