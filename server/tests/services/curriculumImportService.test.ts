import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { CurriculumImportService } from '../../src/services/curriculumImportService';
import { ImportStatus } from '@teaching-engine/database';
import { embeddingService } from '../../src/services/embeddingService';
import { prisma } from '../../src/prisma';

describe('CurriculumImportService', () => {
  let curriculumImportService: CurriculumImportService;
  const mockPrisma = prisma as jest.Mocked<typeof prisma>;
  const mockEmbeddingService = embeddingService as jest.Mocked<typeof embeddingService>;

  beforeEach(() => {
    curriculumImportService = new CurriculumImportService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('startImport', () => {
    it('should create a new import session', async () => {
      const mockImport = {
        id: 'import-123',
        userId: 1,
        grade: 5,
        subject: 'MATH',
        sourceFormat: 'csv',
        status: ImportStatus.PENDING,
      };

      (mockPrisma.curriculumImport.create as jest.Mock).mockResolvedValue(mockImport);

      const importId = await curriculumImportService.startImport(1, 5, 'MATH', 'csv', 'file.csv');

      expect(importId).toBe('import-123');
      expect(mockPrisma.curriculumImport.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          grade: 5,
          subject: 'MATH',
          sourceFormat: 'csv',
          sourceFile: 'file.csv',
          status: ImportStatus.PENDING,
          metadata: {},
        },
      });
    });

    it('should handle errors during import creation', async () => {
      (mockPrisma.curriculumImport.create as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

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
        domain: 'Number',
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
        domain: undefined,
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

  describe('processImport', () => {
    const importId = 'import-123';
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
      (mockPrisma.curriculumImport.update as jest.Mock).mockResolvedValue({});

      // Mock embedding service
      (mockEmbeddingService.generateBatchEmbeddings as jest.Mock).mockResolvedValue([]);

      // Mock cluster creation
      (mockPrisma.outcomeCluster.create as jest.Mock).mockResolvedValue({
        id: 'cluster-1',
        clusterName: 'MATH-Number-Grade1',
        outcomeIds: ['outcome-1', 'outcome-2'],
      });
    });

    it('should process outcomes successfully', async () => {
      // Mock no existing outcomes
      (mockPrisma.outcome.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock outcome creation
      (mockPrisma.outcome.create as jest.Mock)
        .mockResolvedValueOnce({ id: 'outcome-1', code: 'M1.1' })
        .mockResolvedValueOnce({ id: 'outcome-2', code: 'M1.2' });

      // Mock outcomes for clustering
      (mockPrisma.outcome.findMany as jest.Mock).mockResolvedValue([
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
      (mockPrisma.outcome.findUnique as jest.Mock)
        .mockResolvedValueOnce({ id: 'existing-1', code: 'M1.1' })
        .mockResolvedValueOnce(null);

      (mockPrisma.outcome.create as jest.Mock).mockResolvedValue({ id: 'outcome-2', code: 'M1.2' });

      const result = await curriculumImportService.processImport(importId, testOutcomes);

      expect(result.outcomes).toHaveLength(2);
      expect(mockPrisma.outcome.create).toHaveBeenCalledTimes(1); // Only called for new outcome
    });

    it('should handle errors during processing', async () => {
      (mockPrisma.outcome.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await curriculumImportService.processImport(importId, testOutcomes);

      expect(result.errors).toHaveLength(2); // One error per outcome
      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: { status: ImportStatus.FAILED },
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

      (mockPrisma.outcome.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.outcome.create as jest.Mock).mockImplementation((args) =>
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
      const mockImport = {
        id: 'import-123',
        status: ImportStatus.PROCESSING,
        totalOutcomes: 100,
        processedOutcomes: 50,
        errorLog: ['Error 1', 'Error 2'],
      };

      (mockPrisma.curriculumImport.findUnique as jest.Mock).mockResolvedValue(mockImport);

      const progress = await curriculumImportService.getImportProgress('import-123');

      expect(progress).toEqual({
        importId: 'import-123',
        status: ImportStatus.PROCESSING,
        totalOutcomes: 100,
        processedOutcomes: 50,
        errors: ['Error 1', 'Error 2'],
      });
    });

    it('should return null for non-existent import', async () => {
      (mockPrisma.curriculumImport.findUnique as jest.Mock).mockResolvedValue(null);

      const progress = await curriculumImportService.getImportProgress('non-existent');

      expect(progress).toBeNull();
    });
  });

  describe('cancelImport', () => {
    it('should cancel import successfully', async () => {
      (mockPrisma.curriculumImport.update as jest.Mock).mockResolvedValue({});

      const success = await curriculumImportService.cancelImport('import-123');

      expect(success).toBe(true);
      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: 'import-123' },
        data: { status: ImportStatus.CANCELLED },
      });
    });

    it('should handle cancellation errors', async () => {
      (mockPrisma.curriculumImport.update as jest.Mock).mockRejectedValue(new Error('Not found'));

      const success = await curriculumImportService.cancelImport('non-existent');

      expect(success).toBe(false);
    });
  });

  describe('getImportHistory', () => {
    it('should return import history for user', async () => {
      const mockImports = [
        {
          id: 'import-1',
          createdAt: new Date('2024-01-01'),
          status: ImportStatus.COMPLETED,
          clusters: [{ id: 'cluster-1', clusterName: 'Test', clusterType: 'theme' }],
          _count: { outcomes: 10 },
        },
        {
          id: 'import-2',
          createdAt: new Date('2024-01-02'),
          status: ImportStatus.FAILED,
          clusters: [],
          _count: { outcomes: 0 },
        },
      ];

      (mockPrisma.curriculumImport.findMany as jest.Mock).mockResolvedValue(mockImports);

      const history = await curriculumImportService.getImportHistory(1, 10);

      expect(history).toHaveLength(2);
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
              outcomes: true,
            },
          },
        },
      });
    });

    it('should handle empty history', async () => {
      (mockPrisma.curriculumImport.findMany as jest.Mock).mockResolvedValue([]);

      const history = await curriculumImportService.getImportHistory(1);

      expect(history).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty outcome array', async () => {
      const result = await curriculumImportService.processImport('import-123', []);

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
