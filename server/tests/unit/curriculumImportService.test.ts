import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ImportStatus } from '@teaching-engine/database';

// Import services
import { CurriculumImportService } from '../../src/services/curriculumImportService';

// Create a mock prisma client for this test
const mockPrismaClient = {
  curriculumImport: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  outcomeCluster: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  curriculumExpectation: {
    findMany: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  outcome: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('CurriculumImportService', () => {
  let curriculumImportService: CurriculumImportService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create service instance
    curriculumImportService = new CurriculumImportService();

    // Inject the mock prisma client into the service
    (curriculumImportService as any).prisma = mockPrismaClient;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('startImport', () => {
    it('should create a new import session', async () => {
      // Mock the create method to return a valid import object
      const mockImportRecord = {
        id: 'cm56gp6kzjoq', // CUID-like ID
        userId: 1,
        grade: 5,
        subject: 'MATH',
        sourceFormat: 'csv',
        sourceFile: 'file.csv',
        status: ImportStatus.UPLOADING,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockPrismaClient.curriculumImport.create.mockResolvedValue(mockImportRecord);

      const importId = await curriculumImportService.startImport(1, 5, 'MATH', 'csv', 'file.csv');

      // The mock generates CUID-like IDs, so just verify it's a valid CUID format
      expect(importId).toMatch(/^c[a-z0-9]{8,}$/);
      expect(mockPrismaClient.curriculumImport.create).toHaveBeenCalledWith({
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
      // Clear any previous mock implementations
      mockPrismaClient.curriculumImport.create.mockReset();
      // Configure the mock to reject the promise
      mockPrismaClient.curriculumImport.create.mockRejectedValueOnce(new Error('Database error'));

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
      mockPrismaClient.curriculumImport.update.mockResolvedValue({});

      // Mock embedding service
      mockEmbeddingService.generateBatchEmbeddings = jest.fn().mockResolvedValue([]);

      // Mock cluster creation
      mockPrismaClient.outcomeCluster.create.mockResolvedValue({
        id: 'cluster-1',
        clusterName: 'MATH-Number-Grade1',
        outcomeIds: ['outcome-1', 'outcome-2'],
      });
    });

    it('should process outcomes successfully', async () => {
      // Mock no existing outcomes
      mockPrismaClient.outcome.findUnique.mockResolvedValue(null);

      // Mock outcome creation
      mockPrismaClient.outcome.create
        .mockResolvedValueOnce({ id: 'outcome-1', code: 'M1.1' })
        .mockResolvedValueOnce({ id: 'outcome-2', code: 'M1.2' });

      // Mock outcomes for clustering
      mockPrismaClient.outcome.findMany.mockResolvedValue([
        { id: 'outcome-1', code: 'M1.1', subject: 'MATH', domain: 'Number', grade: 1 },
        { id: 'outcome-2', code: 'M1.2', subject: 'MATH', domain: 'Number', grade: 1 },
      ]);

      const result = await curriculumImportService.processImport(importId, testOutcomes);

      expect(result.importId).toBe(importId);
      expect(result.outcomes).toHaveLength(2);
      expect(result.clusters).toHaveLength(1);
      expect(result.errors).toHaveLength(0);

      // Verify status updates
      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: { status: ImportStatus.PROCESSING, totalOutcomes: 2 },
      });

      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: { status: ImportStatus.COMPLETED },
      });

      // Verify embeddings were generated
      expect(mockEmbeddingService.generateBatchEmbeddings).toHaveBeenCalled();
    });

    it('should skip existing outcomes', async () => {
      // Mock first outcome exists, second doesn't
      mockPrismaClient.outcome.findUnique
        .mockResolvedValueOnce({ id: 'existing-1', code: 'M1.1' })
        .mockResolvedValueOnce(null);

      mockPrismaClient.outcome.create.mockResolvedValue({
        id: 'outcome-2',
        code: 'M1.2',
      });

      const result = await curriculumImportService.processImport(importId, testOutcomes);

      expect(result.outcomes).toHaveLength(2);
      expect(mockPrismaClient.outcome.create).toHaveBeenCalledTimes(1); // Only called for new outcome
    });

    it('should handle errors during processing', async () => {
      mockPrismaClient.outcome.findUnique.mockRejectedValue(new Error('Database error'));

      const result = await curriculumImportService.processImport(importId, testOutcomes);

      expect(result.errors).toHaveLength(2); // One error per outcome
      expect(result.outcomes).toHaveLength(0); // No successful outcomes

      // The import should complete but with errors recorded
      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
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

      mockPrismaClient.outcome.findUnique.mockResolvedValue(null);
      mockPrismaClient.outcome.create.mockImplementation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (args: { data: { code: string } }) =>
          Promise.resolve({ id: `outcome-${args.data.code}`, code: args.data.code }),
      );

      const result = await curriculumImportService.processImport(importId, manyOutcomes);

      expect(result.outcomes).toHaveLength(60);
      // Verify progress was updated during processing
      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
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
        userId: 1,
        grade: 5,
        subject: 'MATH',
        sourceFormat: 'csv',
        status: ImportStatus.PROCESSING,
        totalOutcomes: 100,
        processedOutcomes: 50,
        errorLog: ['Error 1', 'Error 2'],
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {},
        completedAt: null,
        sourceFile: null,
      };

      mockPrismaClient.curriculumImport.findUnique.mockResolvedValueOnce(mockImport);

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
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(null);

      const progress = await curriculumImportService.getImportProgress('non-existent');

      expect(progress).toBeNull();
    });
  });

  describe('cancelImport', () => {
    it('should cancel import successfully', async () => {
      const importId = 'c' + Math.random().toString(36).substr(2, 24);
      mockPrismaClient.curriculumImport.update.mockResolvedValueOnce({});

      const success = await curriculumImportService.cancelImport(importId);

      expect(success).toBe(true);
      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: { status: ImportStatus.CANCELLED },
      });
    });

    it('should handle cancellation errors', async () => {
      mockPrismaClient.curriculumImport.update.mockRejectedValue(new Error('Not found'));

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
          sourceFile: null,
          metadata: {},
          totalOutcomes: 10,
          processedOutcomes: 10,
          errorLog: [],
          completedAt: new Date('2024-01-01'),
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
          sourceFile: null,
          metadata: {},
          totalOutcomes: 0,
          processedOutcomes: 0,
          errorLog: ['Error occurred'],
          completedAt: null,
          clusters: [],
          _count: { curriculumExpectations: 0 },
        },
      ];

      mockPrismaClient.curriculumImport.findMany.mockResolvedValueOnce(mockImports);

      const history = await curriculumImportService.getImportHistory(1, 10);

      expect(history).toHaveLength(2);
      expect(history[0]).toHaveProperty('id');
      expect(history[0]).toHaveProperty('clusters');
      expect(history[0]).toHaveProperty('_count');
      expect(mockPrismaClient.curriculumImport.findMany).toHaveBeenCalledWith({
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
      mockPrismaClient.curriculumImport.findMany.mockResolvedValue([]);

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
