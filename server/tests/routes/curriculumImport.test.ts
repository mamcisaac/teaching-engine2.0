import request from 'supertest';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import jwt from 'jsonwebtoken';
import { ImportStatus } from '@teaching-engine/database';

// Mock services
jest.mock('../../src/services/curriculumImportService');
jest.mock('../../src/services/clusteringService');

describe('Curriculum Import Routes', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;
  let authToken: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCurriculumImportService: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockClusteringService: any;

  beforeEach(async () => {
    prisma = getTestPrismaClient();

    // Create test user and generate auth token
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed_password',
        name: 'Test User',
        role: 'teacher',
      },
    });

    authToken = jwt.sign({ userId: user.id.toString() }, process.env.JWT_SECRET || 'secret');

    // Get mocked services
    const { curriculumImportService } = jest.requireMock(
      '../../src/services/curriculumImportService',
    );
    const { clusteringService } = jest.requireMock('../../src/services/clusteringService');
    mockCurriculumImportService = curriculumImportService;
    mockClusteringService = clusteringService;

    // Set up default mock implementations
    mockCurriculumImportService.startImport = jest.fn();
    mockCurriculumImportService.processImport = jest.fn();
    mockCurriculumImportService.getImportProgress = jest.fn();
    mockCurriculumImportService.cancelImport = jest.fn();
    mockCurriculumImportService.getImportHistory = jest.fn();
    mockClusteringService.generateClusters = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/curriculum-import/start', () => {
    it('should start a new import session', async () => {
      mockCurriculumImportService.startImport.mockResolvedValue('import-123');

      const response = await request(app)
        .post('/api/curriculum-import/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          grade: 5,
          subject: 'MATH',
          sourceFormat: 'csv',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        importId: 'import-123',
        message: 'Import session started successfully',
      });

      expect(mockCurriculumImportService.startImport).toHaveBeenCalledWith(
        expect.any(Number), // userId
        5,
        'MATH',
        'csv',
      );
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/curriculum-import/start').send({
        grade: 5,
        subject: 'MATH',
        sourceFormat: 'csv',
      });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/start')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          grade: 5,
          // Missing subject and sourceFormat
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('POST /api/curriculum-import/:importId/upload', () => {
    it('should process CSV file upload', async () => {
      const csvContent = 'code,description,subject,grade,domain\nM1.1,Count to 100,MATH,1,Number';

      mockCurriculumImportService.parseCSV.mockReturnValue([
        { code: 'M1.1', description: 'Count to 100', subject: 'MATH', grade: 1, domain: 'Number' },
      ]);

      mockCurriculumImportService.processImport.mockResolvedValue({
        importId: 'import-123',
        outcomes: [{ id: 'outcome-1', code: 'M1.1' }],
        clusters: [],
        errors: [],
      });

      const response = await request(app)
        .post('/api/curriculum-import/import-123/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from(csvContent), {
          filename: 'outcomes.csv',
          contentType: 'text/csv',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Import completed successfully');
      expect(response.body.outcomes).toHaveLength(1);
    });

    it('should reject unsupported file types', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/import-123/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('test'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        });

      expect(response.status).toBe(500); // Multer error
    });

    it('should handle PDF uploads with not implemented message', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/import-123/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('PDF content'), {
          filename: 'curriculum.pdf',
          contentType: 'application/pdf',
        });

      expect(response.status).toBe(501);
      expect(response.body.error).toBe('PDF parsing not yet implemented');
    });
  });

  describe('POST /api/curriculum-import/:importId/outcomes', () => {
    it('should process manual outcome entries', async () => {
      const outcomes = [
        { code: 'M1.1', description: 'Count to 100', subject: 'MATH', grade: 1 },
        { code: 'M1.2', description: 'Add numbers', subject: 'MATH', grade: 1 },
      ];

      mockCurriculumImportService.processImport.mockResolvedValue({
        importId: 'import-123',
        outcomes: outcomes.map((o, i) => ({ id: `outcome-${i}`, code: o.code })),
        clusters: [],
        errors: [],
      });

      const response = await request(app)
        .post('/api/curriculum-import/import-123/outcomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ outcomes });

      expect(response.status).toBe(200);
      expect(response.body.outcomes).toHaveLength(2);
    });

    it('should validate outcome structure', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/import-123/outcomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          outcomes: [
            { code: 'M1.1' }, // Missing required fields
          ],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Each outcome must have');
    });

    it('should reject empty outcomes array', async () => {
      const response = await request(app)
        .post('/api/curriculum-import/import-123/outcomes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ outcomes: [] });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('non-empty array');
    });
  });

  describe('GET /api/curriculum-import/:importId/progress', () => {
    it('should return import progress', async () => {
      mockCurriculumImportService.getImportProgress.mockResolvedValue({
        importId: 'import-123',
        status: ImportStatus.PROCESSING,
        totalOutcomes: 100,
        processedOutcomes: 50,
        errors: [],
      });

      const response = await request(app)
        .get('/api/curriculum-import/import-123/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        importId: 'import-123',
        status: ImportStatus.PROCESSING,
        totalOutcomes: 100,
        processedOutcomes: 50,
        errors: [],
      });
    });

    it('should handle non-existent import', async () => {
      mockCurriculumImportService.getImportProgress.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/curriculum-import/non-existent/progress')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Import session not found');
    });
  });

  describe('POST /api/curriculum-import/:importId/cancel', () => {
    it('should cancel import session', async () => {
      mockCurriculumImportService.cancelImport.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/curriculum-import/import-123/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Import cancelled successfully');
    });

    it('should handle failed cancellation', async () => {
      mockCurriculumImportService.cancelImport.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/curriculum-import/non-existent/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send();

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/curriculum-import/history', () => {
    it('should return import history', async () => {
      const mockHistory = [
        {
          id: 'import-1',
          createdAt: new Date('2024-01-01'),
          status: ImportStatus.COMPLETED,
          clusters: [],
          _count: { outcomes: 10 },
        },
      ];

      mockCurriculumImportService.getImportHistory.mockResolvedValue(mockHistory);

      const response = await request(app)
        .get('/api/curriculum-import/history')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(mockCurriculumImportService.getImportHistory).toHaveBeenCalledWith(
        expect.any(Number),
        10,
      );
    });
  });

  describe('POST /api/curriculum-import/:importId/cluster', () => {
    it('should trigger clustering', async () => {
      const mockClusters = [
        {
          id: 'cluster-1',
          name: 'Math Basics',
          type: 'skill',
          outcomeIds: ['outcome-1', 'outcome-2'],
          confidence: 0.85,
        },
      ];

      mockClusteringService.clusterOutcomes.mockResolvedValue(mockClusters);

      const response = await request(app)
        .post('/api/curriculum-import/import-123/cluster')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          options: {
            minClusterSize: 2,
            maxClusters: 10,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.clusters).toHaveLength(1);
      expect(mockClusteringService.clusterOutcomes).toHaveBeenCalledWith('import-123', {
        minClusterSize: 2,
        maxClusters: 10,
      });
    });
  });

  describe('POST /api/curriculum-import/:importId/recluster', () => {
    it('should trigger reclustering', async () => {
      const mockClusters = [
        {
          id: 'cluster-new-1',
          name: 'New Cluster',
          type: 'theme',
          outcomeIds: ['outcome-1', 'outcome-2', 'outcome-3'],
          confidence: 0.92,
        },
      ];

      mockClusteringService.reclusterOutcomes.mockResolvedValue(mockClusters);

      const response = await request(app)
        .post('/api/curriculum-import/import-123/recluster')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          options: {
            similarityThreshold: 0.8,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Re-clustering completed successfully');
    });
  });

  describe('GET /api/curriculum-import/:importId/clusters', () => {
    it('should get clusters for import', async () => {
      const mockClusters = [
        {
          id: 'cluster-1',
          name: 'Number Skills',
          type: 'skill',
          outcomeIds: ['outcome-1', 'outcome-2'],
          confidence: 0.88,
        },
      ];

      mockClusteringService.getClusters.mockResolvedValue(mockClusters);

      const response = await request(app)
        .get('/api/curriculum-import/import-123/clusters')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockClusters);
    });
  });

  describe('GET /api/curriculum-import/:importId/clusters/quality', () => {
    it('should analyze cluster quality', async () => {
      const mockAnalysis = {
        totalClusters: 5,
        averageConfidence: 0.82,
        clustersWithLowConfidence: 1,
        suggestions: ['Consider adjusting similarity threshold'],
      };

      mockClusteringService.analyzeClusterQuality.mockResolvedValue(mockAnalysis);

      const response = await request(app)
        .get('/api/curriculum-import/import-123/clusters/quality')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalysis);
    });
  });
});
