import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ImportStatus } from '@teaching-engine/database';

// Import services
import { CurriculumImportService } from '../../src/services/curriculumImportService';
import { embeddingService } from '../../src/services/embeddingService';
import { prisma } from '../../src/prisma';

// Import the mocked module to access mocks
jest.mock('@teaching-engine/database');

describe('CurriculumImportService', () => {
  let curriculumImportService: CurriculumImportService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockPrisma: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockEmbeddingService: any;

  // Helper to ensure a mock function exists - removed as not needed

  beforeEach(async () => {
    jest.clearAllMocks();

    // Get mocked instances - use prisma from import which should be mocked
    mockPrisma = prisma;
    mockEmbeddingService = embeddingService;

    // Create service instance
    curriculumImportService = new CurriculumImportService();

    // Force inject logger if needed
    if (!curriculumImportService['logger']) {
      curriculumImportService['logger'] = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        child: jest.fn(function () {
          return this;
        }),
      };
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('startImport', () => {
    it('should create a new import session', async () => {
      const mockImport = {
        id: 'c' + Math.random().toString(36).substr(2, 24), // Generate CUID-like ID
        userId: 1,
        grade: 5,
        subject: 'MATH',
        sourceFormat: 'csv',
        status: ImportStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
        totalOutcomes: 0,
        processedOutcomes: 0,
        errorLog: [],
        sourceFile: 'file.csv'
      };

      mockPrisma.curriculumImport.create.mockResolvedValue(mockImport);

      const importId = await curriculumImportService.startImport(1, 5, 'MATH', 'csv', 'file.csv');

      expect(importId).toBe(mockImport.id);
      expect(mockPrisma.curriculumImport.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          grade: 5,
          subject: 'MATH',
          sourceFormat: 'csv',
          sourceFile: 'file.csv',
          status: ImportStatus.UPLOADING,
          metadata: {},
        },
      });
    });

    it('should handle errors during import creation', async () => {
      mockPrisma.curriculumImport.create.mockRejectedValue(new Error('Database error'));

      await expect(curriculumImportService.startImport(1, 5, 'MATH', 'csv')).rejects.toThrow(
        'Failed to start import session',
      );
    });
  });

  describe('parseCSV', () => {
    it('should parse valid CSV content', () => {
      const csvContent = `code,description,subject,grade,domain
M1.1,Count to 100,MATH,1,Number
M1.2,Add single digits,MATH,1,Number
G1.1,Identify shapes,MATH,1,Geometry`;

      const outcomes = curriculumImportService.parseCSV(csvContent);

      expect(outcomes).toHaveLength(3);
      expect(outcomes[0]).toEqual({
        code: 'M1.1',
        description: 'Count to 100',
        subject: 'MATH',
        grade: 1,
        strand: 'Number',
      });
    });

    it('should handle CSV with missing optional fields', () => {
      const csvContent = `code,description
M1.1,Count to 100
M1.2,Add single digits`;

      const outcomes = curriculumImportService.parseCSV(csvContent);

      expect(outcomes).toHaveLength(2);
      expect(outcomes[0]).toEqual({
        code: 'M1.1',
        description: 'Count to 100',
        subject: 'Unknown',
        grade: 0,
        strand: 'General',
      });
    });

    it('should handle CSV with quoted values', () => {
      const csvContent = `code,description,subject,grade,domain
"M1.1","Count to 100, including skip counting",MATH,1,Number`;

      const outcomes = curriculumImportService.parseCSV(csvContent);

      expect(outcomes).toHaveLength(1);
      expect(outcomes[0].description).toBe('Count to 100, including skip counting');
    });

    it('should skip invalid lines', () => {
      const csvContent = `code,description,subject,grade,domain
M1.1,Count to 100,MATH,1,Number
invalid line without enough columns
M1.2,Add single digits,MATH,1,Number`;

      const outcomes = curriculumImportService.parseCSV(csvContent);

      expect(outcomes).toHaveLength(2);
    });

    it('should throw error for CSV without required columns', () => {
      const csvContent = `name,value
Test,123`;

      expect(() => curriculumImportService.parseCSV(csvContent)).toThrow(
        'CSV must contain "code" and "description" columns',
      );
    });
  });

  describe.skip('processImport', () => {
    const importId = 'c' + Math.random().toString(36).substr(2, 24); // Generate CUID-like ID
    const testOutcomes = [
      { code: 'M1.1', description: 'Count to 100', subject: 'MATH', grade: 1, domain: 'Number' },
      {
        code: 'M1.2',
        description: 'Add single digits',
        subject: 'MATH',
        grade: 1,
        domain: 'Number',
      },
    ];

    beforeEach(() => {
      // Mock update status calls
      mockPrisma.curriculumImport.update.mockResolvedValue({});

      // Mock embedding service
      mockEmbeddingService.generateBatchEmbeddings = jest.fn().mockResolvedValue([]);

      // Mock cluster creation
      mockPrisma.outcomeCluster.create.mockResolvedValue({
        id: 'cluster-1',
        clusterName: 'MATH-Number-Grade1',
        outcomeIds: ['outcome-1', 'outcome-2'],
      });
    });

    it('should process outcomes successfully', async () => {
      // Mock no existing outcomes
      mockPrisma.outcome.findUnique.mockResolvedValue(null);

      // Mock outcome creation
      mockPrisma.outcome.create
        .mockResolvedValueOnce({ id: 'outcome-1', code: 'M1.1' })
        .mockResolvedValueOnce({ id: 'outcome-2', code: 'M1.2' });

      // Mock outcomes for clustering
      mockPrisma.outcome.findMany.mockResolvedValue([
        { id: 'outcome-1', code: 'M1.1', subject: 'MATH', domain: 'Number', grade: 1 },
        { id: 'outcome-2', code: 'M1.2', subject: 'MATH', domain: 'Number', grade: 1 },
      ]);

      const result = await curriculumImportService.processImport(importId, testOutcomes);

      expect(result.importId).toBe(importId);
      expect(result.outcomes).toHaveLength(2);
      expect(result.clusters).toHaveLength(1);
      expect(result.errors).toHaveLength(0);

      // Verify status updates
      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: { status: ImportStatus.PROCESSING, totalOutcomes: 2 },
      });

      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: { status: ImportStatus.COMPLETED },
      });

      // Verify embeddings were generated
      expect(mockEmbeddingService.generateBatchEmbeddings).toHaveBeenCalled();
    });

    it('should skip existing outcomes', async () => {
      // Mock first outcome exists, second doesn't
      mockPrisma.outcome.findUnique
        .mockResolvedValueOnce({ id: 'existing-1', code: 'M1.1' })
        .mockResolvedValueOnce(null);

      mockPrisma.outcome.create.mockResolvedValue({
        id: 'outcome-2',
        code: 'M1.2',
      });

      const result = await curriculumImportService.processImport(importId, testOutcomes);

      expect(result.outcomes).toHaveLength(2);
      expect(mockPrisma.outcome.create).toHaveBeenCalledTimes(1); // Only called for new outcome
    });

    it('should handle errors during processing', async () => {
      mockPrisma.outcome.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      const result = await curriculumImportService.processImport(importId, testOutcomes);

      expect(result.errors).toHaveLength(2); // One error per outcome
      expect(result.outcomes).toHaveLength(0); // No successful outcomes

      // The import should complete but with errors recorded
      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: { status: ImportStatus.COMPLETED },
      });
    });

    it('should process outcomes in batches', async () => {
      // Create 60 test outcomes (more than batch size of 50)
      const manyOutcomes = Array(60)
        .fill(null)
        .map((_, i) => ({
          code: `M1.${i}`,
          description: `Outcome ${i}`,
          subject: 'MATH',
          grade: 1,
          domain: 'Number',
        }));

      mockPrisma.outcome.findUnique.mockResolvedValue(null);
      mockPrisma.outcome.create.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (args: { data: { code: string } }) =>
          Promise.resolve({ id: `outcome-${args.data.code}`, code: args.data.code }),
      );

      const result = await curriculumImportService.processImport(importId, manyOutcomes);

      expect(result.outcomes).toHaveLength(60);
      // Verify progress was updated during processing
      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: { processedOutcomes: 50 },
      });
    });
  });

  describe('getImportProgress', () => {
    it('should return import progress', async () => {
      const importId = 'c' + Math.random().toString(36).substr(2, 24);
      const mockImport = {
        id: importId,
        status: ImportStatus.PROCESSING,
        totalOutcomes: 100,
        processedOutcomes: 50,
        errorLog: ['Error 1', 'Error 2'],
      };

      mockPrisma.curriculumImport.findUnique.mockResolvedValue(mockImport);

      const progress = await curriculumImportService.getImportProgress(importId);

      expect(progress).toEqual({
        importId: importId,
        status: ImportStatus.PROCESSING,
        totalOutcomes: 100,
        processedOutcomes: 50,
        errors: ['Error 1', 'Error 2'],
      });
    });

    it('should return null for non-existent import', async () => {
      mockPrisma.curriculumImport.findUnique.mockResolvedValue(null);

      const progress = await curriculumImportService.getImportProgress('non-existent');

      expect(progress).toBeNull();
    });
  });

  describe('cancelImport', () => {
    it('should cancel import successfully', async () => {
      const importId = 'c' + Math.random().toString(36).substr(2, 24);
      mockPrisma.curriculumImport.update.mockResolvedValue({});

      const success = await curriculumImportService.cancelImport(importId);

      expect(success).toBe(true);
      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: { status: ImportStatus.CANCELLED },
      });
    });

    it('should handle cancellation errors', async () => {
      mockPrisma.curriculumImport.update.mockRejectedValue(
        new Error('Not found'),
      );

      const success = await curriculumImportService.cancelImport('non-existent');

      expect(success).toBe(false);
    });
  });

  describe('getImportHistory', () => {
    it('should return import history for user', async () => {
      const mockImports = [
        {
          id: 'c' + Math.random().toString(36).substr(2, 24),
          userId: 1,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          status: ImportStatus.COMPLETED,
          grade: 5,
          subject: 'MATH',
          sourceFormat: 'csv',
          metadata: {},
          totalOutcomes: 10,
          processedOutcomes: 10,
          errorLog: [],
          clusters: [{ id: 'cluster-1', clusterName: 'Test', clusterType: 'theme' }],
          _count: { curriculumExpectations: 10 },
        },
        {
          id: 'c' + Math.random().toString(36).substr(2, 24),
          userId: 1,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          status: ImportStatus.FAILED,
          grade: 5,
          subject: 'MATH',
          sourceFormat: 'csv',
          metadata: {},
          totalOutcomes: 0,
          processedOutcomes: 0,
          errorLog: ['Error occurred'],
          clusters: [],
          _count: { curriculumExpectations: 0 },
        },
      ];

      mockPrisma.curriculumImport.findMany.mockResolvedValue(mockImports);

      const history = await curriculumImportService.getImportHistory(1, 10);

      expect(history).toHaveLength(2);
      expect(history[0]).toHaveProperty('id');
      expect(history[0]).toHaveProperty('clusters');
      expect(history[0]).toHaveProperty('_count');
      expect(mockPrisma.curriculumImport.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          clusters: {
            select: {
              id: true,
              clusterName: true,
              clusterType: true,
            },
          },
          _count: {
            select: {
              curriculumExpectations: true,
            },
          },
        },
      });
    });

    it('should handle empty history', async () => {
      mockPrisma.curriculumImport.findMany.mockResolvedValue([]);

      const history = await curriculumImportService.getImportHistory(1);

      expect(history).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it.skip('should handle empty outcome array', async () => {
      const importId = 'c' + Math.random().toString(36).substr(2, 24);
      const result = await curriculumImportService.processImport(importId, []);

      expect(result.outcomes).toHaveLength(0);
      expect(result.clusters).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle CSV with special characters', () => {
      const csvContent = `code,description,subject,grade,domain
M1.1,"Count to 100, with émphasis on français",MATH,1,Nombre
M1.2,"Add & subtract (with symbols)",MATH,1,Number`;

      const outcomes = curriculumImportService.parseCSV(csvContent);

      expect(outcomes).toHaveLength(2);
      expect(outcomes[0].description).toContain('émphasis on français');
      expect(outcomes[1].description).toContain('& subtract (with symbols)');
    });

    it('should handle very large CSV files', () => {
      // Generate CSV with 1000 rows
      const headers = 'code,description,subject,grade,domain\n';
      const rows = Array(1000)
        .fill(null)
        .map((_, i) => `M${i}.1,Description ${i},MATH,${(i % 12) + 1},Domain`)
        .join('\n');
      const csvContent = headers + rows;

      const outcomes = curriculumImportService.parseCSV(csvContent);

      expect(outcomes).toHaveLength(1000);
    });
  });
});
