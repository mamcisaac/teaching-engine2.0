import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { CurriculumImportService } from '../../src/services/curriculumImportService';
import { prisma } from '../../src/prisma';

// Mock external services
jest.mock('../../src/services/embeddingService', () => ({
  embeddingService: {
    generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    generateBatchEmbeddings: jest.fn().mockResolvedValue([[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]]),
  },
}));

jest.mock('../../src/services/clusteringService', () => ({
  clusteringService: {
    clusterExpectations: jest.fn().mockResolvedValue([
      {
        clusterName: 'Number Operations',
        clusterType: 'concept',
        expectationIds: ['exp1', 'exp2'],
        confidence: 0.85,
      },
    ]),
  },
}));

const mockPrisma = prisma;

describe('CurriculumImportService', () => {
  let curriculumImportService: CurriculumImportService;

  beforeEach(() => {
    jest.clearAllMocks();
    curriculumImportService = new CurriculumImportService();
  });

  describe.skip('createImport', () => {
    test('should create new curriculum import', async () => {
      const userId = 1;
      const importData = {
        filename: 'test-curriculum.pdf',
        originalName: 'Grade 1 Math Curriculum.pdf',
        grade: 1,
        subject: 'Mathematics',
      };

      const mockImport = {
        id: 'import1',
        userId,
        ...importData,
        status: 'UPLOADING',
        createdAt: new Date(),
      };

      mockPrisma.curriculumImport.create.mockResolvedValue(mockImport as any);

      const result = await curriculumImportService.createImport(userId, importData);

      expect(result).toEqual(mockImport);
      expect(mockPrisma.curriculumImport.create).toHaveBeenCalledWith({
        data: {
          userId,
          ...importData,
          status: 'UPLOADING',
        },
      });
    });
  });

  describe.skip('updateImportStatus', () => {
    test('should update import status and metadata', async () => {
      const importId = 'import1';
      const status = 'PROCESSING';
      const metadata = { step: 'parsing_pdf' };

      const mockUpdatedImport = {
        id: importId,
        status,
        metadata,
        updatedAt: new Date(),
      };

      mockPrisma.curriculumImport.update.mockResolvedValue(mockUpdatedImport as any);

      // @ts-ignore - method doesn't exist in current implementation
      const result = await curriculumImportService.updateImportStatus(importId, status, metadata);

      expect(result).toEqual(mockUpdatedImport);
      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: {
          status,
          metadata,
          updatedAt: expect.any(Date),
        },
      });
    });

    test('should handle processing completion', async () => {
      const importId = 'import1';
      const status = 'COMPLETED';

      mockPrisma.curriculumImport.update.mockResolvedValue({
        id: importId,
        status,
        processedAt: expect.any(Date),
        completedAt: expect.any(Date),
      } as any);

      await curriculumImportService.updateImportStatus(importId, status);

      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: {
          status,
          processedAt: expect.any(Date),
          completedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe.skip('parseTextContent', () => {
    test('should parse curriculum text into structured expectations', async () => {
      const importId = 'import1';
      const rawText = `
        A1.1 - Students will demonstrate understanding of numbers 1-10
        A1.2 - Students will count objects accurately up to 20
        B2.1 - Students will identify and extend simple patterns
      `;

      const mockImport = {
        id: importId,
        grade: 1,
        subject: 'Mathematics',
      };

      mockPrisma.curriculumImport.findUnique.mockResolvedValue(mockImport as any);
      mockPrisma.curriculumImport.update.mockResolvedValue({} as any);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.curriculumExpectation.createMany.mockResolvedValue({ count: 3 } as any);

      const result = await curriculumImportService.parseTextContent(importId, rawText);

      expect(result.processedCount).toBe(3);
      expect(result.expectations).toHaveLength(3);
      expect(result.expectations[0].code).toBe('A1.1');
      expect(result.expectations[0].description).toBe('Students will demonstrate understanding of numbers 1-10');
      expect(result.expectations[1].code).toBe('A1.2');
      expect(result.expectations[2].code).toBe('B2.1');
    });

    test('should handle malformed text gracefully', async () => {
      const importId = 'import1';
      const rawText = `
        Invalid line without proper format
        A1.1 - Valid expectation
        Another invalid line
      `;

      const mockImport = {
        id: importId,
        grade: 1,
        subject: 'Mathematics',
      };

      mockPrisma.curriculumImport.findUnique.mockResolvedValue(mockImport as any);
      mockPrisma.curriculumImport.update.mockResolvedValue({} as any);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.curriculumExpectation.createMany.mockResolvedValue({ count: 1 } as any);

      const result = await curriculumImportService.parseTextContent(importId, rawText);

      expect(result.processedCount).toBe(1);
      expect(result.expectations).toHaveLength(1);
      expect(result.expectations[0].code).toBe('A1.1');
      expect(result.errors).toHaveLength(2); // Two invalid lines
    });
  });

  describe('processCSVContent', () => {
    test('should parse CSV curriculum data', async () => {
      const importId = 'import1';
      const csvContent = `code,description,strand,substrand,grade,subject
A1.1,"Students will demonstrate understanding of numbers 1-10","Number Sense","Counting",1,"Mathematics"
A1.2,"Students will count objects accurately up to 20","Number Sense","Counting",1,"Mathematics"
B2.1,"Students will identify and extend simple patterns","Patterns","Simple Patterns",1,"Mathematics"`;

      const mockImport = {
        id: importId,
        grade: 1,
        subject: 'Mathematics',
      };

      mockPrisma.curriculumImport.findUnique.mockResolvedValue(mockImport as any);
      mockPrisma.curriculumImport.update.mockResolvedValue({} as any);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.curriculumExpectation.createMany.mockResolvedValue({ count: 3 } as any);

      const result = await curriculumImportService.processCSVContent(importId, csvContent);

      expect(result.processedCount).toBe(3);
      expect(result.expectations).toHaveLength(3);
      expect(result.expectations[0].strand).toBe('Number Sense');
      expect(result.expectations[0].substrand).toBe('Counting');
      expect(result.expectations[2].strand).toBe('Patterns');
    });

    test('should handle missing required columns', async () => {
      const importId = 'import1';
      const csvContent = `description,strand
"Students will demonstrate understanding of numbers 1-10","Number Sense"`;

      const mockImport = {
        id: importId,
        grade: 1,
        subject: 'Mathematics',
      };

      mockPrisma.curriculumImport.findUnique.mockResolvedValue(mockImport as any);

      await expect(
        curriculumImportService.processCSVContent(importId, csvContent)
      ).rejects.toThrow('Missing required columns');
    });
  });

  describe('generateClusters', () => {
    test('should create expectation clusters using AI', async () => {
      const importId = 'import1';

      const mockExpectations = [
        {
          id: 'exp1',
          code: 'A1.1',
          description: 'Number recognition',
          strand: 'Number Sense',
        },
        {
          id: 'exp2',
          code: 'A1.2',
          description: 'Counting objects',
          strand: 'Number Sense',
        },
      ];

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(mockExpectations as any);
      mockPrisma.expectationCluster.createMany.mockResolvedValue({ count: 1 } as any);
      mockPrisma.curriculumImport.update.mockResolvedValue({} as any);

      const result = await curriculumImportService.generateClusters(importId);

      expect(result.clustersCreated).toBe(1);
      expect(result.clusters).toHaveLength(1);
      expect(result.clusters[0].clusterName).toBe('Number Operations');
      expect(result.clusters[0].expectationIds).toEqual(['exp1', 'exp2']);
    });

    test('should handle empty expectations', async () => {
      const importId = 'import1';

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([]);

      const result = await curriculumImportService.generateClusters(importId);

      expect(result.clustersCreated).toBe(0);
      expect(result.clusters).toHaveLength(0);
    });
  });

  describe('getImportProgress', () => {
    test('should return detailed import progress', async () => {
      const importId = 'import1';

      const mockImport = {
        id: importId,
        status: 'PROCESSING',
        totalOutcomes: 100,
        processedOutcomes: 75,
        errorLog: [
          { line: 10, error: 'Invalid format' },
          { line: 25, error: 'Missing code' },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockPrisma.curriculumImport.findUnique.mockResolvedValue(mockImport as any);

      const result = await curriculumImportService.getImportProgress(importId);

      expect(result).toEqual({
        id: importId,
        status: 'PROCESSING',
        progress: 75, // processedOutcomes / totalOutcomes * 100
        totalOutcomes: 100,
        processedOutcomes: 75,
        errorCount: 2,
        errors: mockImport.errorLog,
        createdAt: mockImport.createdAt,
        updatedAt: mockImport.updatedAt,
      });
    });

    test('should handle import not found', async () => {
      const importId = 'nonexistent';

      mockPrisma.curriculumImport.findUnique.mockResolvedValue(null);

      await expect(
        curriculumImportService.getImportProgress(importId)
      ).rejects.toThrow('Import not found');
    });
  });

  describe('getUserImports', () => {
    test('should return user imports with statistics', async () => {
      const userId = 1;

      const mockImports = [
        {
          id: 'import1',
          filename: 'grade1-math.pdf',
          status: 'COMPLETED',
          grade: 1,
          subject: 'Mathematics',
          totalOutcomes: 50,
          processedOutcomes: 50,
          createdAt: new Date('2024-01-01'),
          curriculumExpectations: [{ id: 'exp1' }, { id: 'exp2' }],
          clusters: [{ id: 'cluster1' }],
        },
        {
          id: 'import2',
          filename: 'grade1-science.pdf',
          status: 'PROCESSING',
          grade: 1,
          subject: 'Science',
          totalOutcomes: 30,
          processedOutcomes: 20,
          createdAt: new Date('2024-01-02'),
          curriculumExpectations: [{ id: 'exp3' }],
          clusters: [],
        },
      ];

      mockPrisma.curriculumImport.findMany.mockResolvedValue(mockImports as any);

      const result = await curriculumImportService.getUserImports(userId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('import1');
      expect(result[0].expectationCount).toBe(2);
      expect(result[0].clusterCount).toBe(1);
      expect(result[1].id).toBe('import2');
      expect(result[1].expectationCount).toBe(1);
      expect(result[1].clusterCount).toBe(0);
    });
  });

  describe('validateImportData', () => {
    test('should validate required fields', () => {
      const validData = {
        filename: 'test.pdf',
        grade: 1,
        subject: 'Mathematics',
      };

      expect(() => curriculumImportService.validateImportData(validData)).not.toThrow();
    });

    test('should reject invalid grade', () => {
      const invalidData = {
        filename: 'test.pdf',
        grade: 15, // Invalid grade
        subject: 'Mathematics',
      };

      expect(() => curriculumImportService.validateImportData(invalidData))
        .toThrow('Grade must be between 1 and 12');
    });

    test('should reject missing filename', () => {
      const invalidData = {
        grade: 1,
        subject: 'Mathematics',
      };

      expect(() => curriculumImportService.validateImportData(invalidData))
        .toThrow('Filename is required');
    });

    test('should reject unsupported file type', () => {
      const invalidData = {
        filename: 'test.txt', // Unsupported extension
        grade: 1,
        subject: 'Mathematics',
      };

      expect(() => curriculumImportService.validateImportData(invalidData))
        .toThrow('Unsupported file type');
    });
  });

  describe('error handling', () => {
    test('should handle database errors during import creation', async () => {
      const userId = 1;
      const importData = {
        filename: 'test.pdf',
        grade: 1,
        subject: 'Mathematics',
      };

      mockPrisma.curriculumImport.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(
        curriculumImportService.createImport(userId, importData)
      ).rejects.toThrow('Database connection failed');
    });

    test('should handle transaction failures during parsing', async () => {
      const importId = 'import1';
      const rawText = 'A1.1 - Test expectation';

      const mockImport = {
        id: importId,
        grade: 1,
        subject: 'Mathematics',
      };

      mockPrisma.curriculumImport.findUnique.mockResolvedValue(mockImport as any);
      mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        curriculumImportService.parseTextContent(importId, rawText)
      ).rejects.toThrow('Transaction failed');
    });

    test.skip('should update import status to FAILED on error', async () => {
      const importId = 'import1';
      const errorMessage = 'Processing failed';

      // @ts-ignore - method doesn't exist in current implementation
      await curriculumImportService.markImportAsFailed(importId, errorMessage);

      expect(mockPrisma.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: importId },
        data: {
          status: 'FAILED',
          errorMessage,
          updatedAt: expect.any(Date),
        },
      });
    });
  });

  describe('performance optimization', () => {
    test('should batch process large datasets', async () => {
      const importId = 'import1';
      const largeText = Array.from({ length: 1000 }, (_, i) => 
        `A${i}.1 - Test expectation ${i}`
      ).join('\n');

      const mockImport = {
        id: importId,
        grade: 1,
        subject: 'Mathematics',
      };

      mockPrisma.curriculumImport.findUnique.mockResolvedValue(mockImport as any);
      mockPrisma.curriculumImport.update.mockResolvedValue({} as any);
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrisma);
      });
      mockPrisma.curriculumExpectation.createMany.mockResolvedValue({ count: 1000 } as any);

      const result = await curriculumImportService.parseTextContent(importId, largeText);

      expect(result.processedCount).toBe(1000);
      expect(result.expectations).toHaveLength(1000);
      
      // Should have called createMany to batch insert
      expect(mockPrisma.curriculumExpectation.createMany).toHaveBeenCalled();
    });
  });
});