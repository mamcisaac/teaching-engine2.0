/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import { CurriculumImportOrchestrator } from '../CurriculumImportOrchestrator';
import { CurriculumValidator } from '../CurriculumValidator';
import { CurriculumTransformer } from '../CurriculumTransformer';
import { CurriculumExportService } from '../CurriculumExportService';
import { CurriculumSearchService } from '../CurriculumSearchService';
import { CurriculumStatsService } from '../CurriculumStatsService';
import { prisma } from '@teaching-engine/database';
import { AppError } from '../../../utils/errors';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock dependencies
vi.mock('../CurriculumValidator');
vi.mock('../CurriculumTransformer');
vi.mock('../CurriculumExportService');
vi.mock('../CurriculumSearchService');
vi.mock('../CurriculumStatsService');
vi.mock('fs/promises');

describe('CurriculumImportOrchestrator', () => {
  let orchestrator: CurriculumImportOrchestrator;
  let mockValidator: jest.Mocked<CurriculumValidator>;
  let mockTransformer: jest.Mocked<CurriculumTransformer>;
  let mockExportService: jest.Mocked<CurriculumExportService>;
  let mockSearchService: jest.Mocked<CurriculumSearchService>;
  let mockStatsService: jest.Mocked<CurriculumStatsService>;

  const mockUserId = 1;
  const mockFilePath = '/tmp/curriculum.csv';
  
  const mockFileData = {
    headers: ['Code', 'Strand', 'Grade', 'Description'],
    rows: [
      ['A1.1', 'Number Sense', '5', 'Understand place value'],
      ['A1.2', 'Number Sense', '5', 'Compare and order numbers'],
    ],
  };

  const mockTransformedData = [
    {
      code: 'A1.1',
      strand: 'Number Sense',
      grade: 5,
      subject: 'Mathematics',
      description: 'Understand place value',
    },
    {
      code: 'A1.2',
      strand: 'Number Sense',
      grade: 5,
      subject: 'Mathematics',
      description: 'Compare and order numbers',
    },
  ];

  beforeEach(() => {
    // Create mock instances
    mockValidator = new CurriculumValidator() as jest.Mocked<CurriculumValidator>;
    mockTransformer = new CurriculumTransformer() as jest.Mocked<CurriculumTransformer>;
    mockExportService = new CurriculumExportService() as jest.Mocked<CurriculumExportService>;
    mockSearchService = new CurriculumSearchService() as jest.Mocked<CurriculumSearchService>;
    mockStatsService = new CurriculumStatsService() as jest.Mocked<CurriculumStatsService>;

    // Set up default mock behaviors
    mockValidator.validateFile.mockResolvedValue(true);
    mockValidator.validateHeaders.mockReturnValue(true);
    mockValidator.validateRow.mockReturnValue({ isValid: true, errors: [] });
    mockTransformer.parseFile.mockResolvedValue(mockFileData);
    mockTransformer.transformData.mockResolvedValue(mockTransformedData);

    // Create orchestrator instance
    orchestrator = new CurriculumImportOrchestrator();
    orchestrator['validator'] = mockValidator;
    orchestrator['transformer'] = mockTransformer;
    orchestrator['exportService'] = mockExportService;
    orchestrator['searchService'] = mockSearchService;
    orchestrator['statsService'] = mockStatsService;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('importFromFile', () => {
    it('should successfully import curriculum data from CSV file', async () => {
      // Mock file exists
      vi.mocked(fs.access).mockResolvedValue(undefined);

      // Mock database operations
      const mockExpectations = mockTransformedData.map((data, index) => ({
        id: index + 1,
        ...data,
      }));

      prisma.curriculumExpectation.createMany = vi.fn().mockResolvedValue({ count: 2 });
      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue(mockExpectations);

      const result = await orchestrator.importFromFile(
        { userId: mockUserId },
        { filePath: mockFilePath, subject: 'Mathematics', grade: 5 }
      );

      expect(result).toEqual({
        success: true,
        importedCount: 2,
        skippedCount: 0,
        errors: [],
        expectations: mockExpectations,
      });

      // Verify the workflow
      expect(mockValidator.validateFile).toHaveBeenCalledWith(mockFilePath);
      expect(mockTransformer.parseFile).toHaveBeenCalledWith(mockFilePath);
      expect(mockValidator.validateHeaders).toHaveBeenCalledWith(mockFileData.headers);
      expect(mockTransformer.transformData).toHaveBeenCalledWith(mockFileData.rows, {
        subject: 'Mathematics',
        grade: 5,
      });
      expect(prisma.curriculumExpectation.createMany).toHaveBeenCalled();
    });

    it('should handle file not found error', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

      await expect(
        orchestrator.importFromFile(
          { userId: mockUserId },
          { filePath: mockFilePath, subject: 'Mathematics', grade: 5 }
        )
      ).rejects.toThrow(AppError);
    });

    it('should handle invalid file format', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      mockValidator.validateFile.mockRejectedValue(new Error('Invalid file format'));

      await expect(
        orchestrator.importFromFile(
          { userId: mockUserId },
          { filePath: mockFilePath, subject: 'Mathematics', grade: 5 }
        )
      ).rejects.toThrow('Invalid file format');
    });

    it('should handle invalid headers', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      mockValidator.validateHeaders.mockReturnValue(false);

      await expect(
        orchestrator.importFromFile(
          { userId: mockUserId },
          { filePath: mockFilePath, subject: 'Mathematics', grade: 5 }
        )
      ).rejects.toThrow('Invalid CSV headers');
    });

    it('should skip invalid rows and continue import', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      
      // Mock validation results with one invalid row
      mockValidator.validateRow
        .mockReturnValueOnce({ isValid: true, errors: [] })
        .mockReturnValueOnce({ isValid: false, errors: ['Invalid grade'] });

      // Only one valid row should be transformed
      mockTransformer.transformData.mockResolvedValue([mockTransformedData[0]]);

      prisma.curriculumExpectation.createMany = vi.fn().mockResolvedValue({ count: 1 });
      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue([
        { id: 1, ...mockTransformedData[0] },
      ]);

      const result = await orchestrator.importFromFile(
        { userId: mockUserId },
        { filePath: mockFilePath, subject: 'Mathematics', grade: 5 }
      );

      expect(result).toEqual({
        success: true,
        importedCount: 1,
        skippedCount: 1,
        errors: ['Row 2: Invalid grade'],
        expectations: [{ id: 1, ...mockTransformedData[0] }],
      });
    });

    it('should handle database errors during import', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      prisma.curriculumExpectation.createMany = vi.fn().mockRejectedValue(
        new Error('Database connection error')
      );

      await expect(
        orchestrator.importFromFile(
          { userId: mockUserId },
          { filePath: mockFilePath, subject: 'Mathematics', grade: 5 }
        )
      ).rejects.toThrow('Database connection error');
    });

    it('should support importing from different file formats', async () => {
      const pdfPath = '/tmp/curriculum.pdf';
      vi.mocked(fs.access).mockResolvedValue(undefined);
      
      // Mock PDF parsing
      mockTransformer.parseFile.mockResolvedValue({
        headers: ['Expectation', 'Strand', 'Level', 'Details'],
        rows: [['B1.1', 'Measurement', '5', 'Measure lengths']],
      });

      mockTransformer.transformData.mockResolvedValue([
        {
          code: 'B1.1',
          strand: 'Measurement',
          grade: 5,
          subject: 'Mathematics',
          description: 'Measure lengths',
        },
      ]);

      prisma.curriculumExpectation.createMany = vi.fn().mockResolvedValue({ count: 1 });
      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue([
        {
          id: 1,
          code: 'B1.1',
          strand: 'Measurement',
          grade: 5,
          subject: 'Mathematics',
          description: 'Measure lengths',
        },
      ]);

      const result = await orchestrator.importFromFile(
        { userId: mockUserId },
        { filePath: pdfPath, subject: 'Mathematics', grade: 5 }
      );

      expect(result.importedCount).toBe(1);
      expect(path.extname(pdfPath)).toBe('.pdf');
    });
  });

  describe('exportCurriculum', () => {
    const mockExpectations = [
      {
        id: 1,
        code: 'A1.1',
        strand: 'Number Sense',
        grade: 5,
        subject: 'Mathematics',
        description: 'Understand place value',
      },
      {
        id: 2,
        code: 'A1.2',
        strand: 'Number Sense',
        grade: 5,
        subject: 'Mathematics',
        description: 'Compare and order numbers',
      },
    ];

    it('should export curriculum to CSV format', async () => {
      mockExportService.exportToCSV.mockResolvedValue('/tmp/export.csv');
      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue(mockExpectations);

      const result = await orchestrator.exportCurriculum(
        { userId: mockUserId },
        { format: 'csv', filters: { grade: 5, subject: 'Mathematics' } }
      );

      expect(result).toEqual({
        filePath: '/tmp/export.csv',
        format: 'csv',
        recordCount: 2,
      });

      expect(mockExportService.exportToCSV).toHaveBeenCalledWith(mockExpectations);
    });

    it('should export curriculum to PDF format', async () => {
      mockExportService.exportToPDF.mockResolvedValue('/tmp/export.pdf');
      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue(mockExpectations);

      const result = await orchestrator.exportCurriculum(
        { userId: mockUserId },
        { format: 'pdf', filters: { grade: 5, subject: 'Mathematics' } }
      );

      expect(result).toEqual({
        filePath: '/tmp/export.pdf',
        format: 'pdf',
        recordCount: 2,
      });

      expect(mockExportService.exportToPDF).toHaveBeenCalledWith(mockExpectations);
    });

    it('should export curriculum to JSON format', async () => {
      mockExportService.exportToJSON.mockResolvedValue('/tmp/export.json');
      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue(mockExpectations);

      const result = await orchestrator.exportCurriculum(
        { userId: mockUserId },
        { format: 'json', filters: { grade: 5, subject: 'Mathematics' } }
      );

      expect(result).toEqual({
        filePath: '/tmp/export.json',
        format: 'json',
        recordCount: 2,
      });

      expect(mockExportService.exportToJSON).toHaveBeenCalledWith(mockExpectations);
    });

    it('should handle unsupported export format', async () => {
      await expect(
        orchestrator.exportCurriculum(
          { userId: mockUserId },
          { format: 'xml' as unknown, filters: {} }
        )
      ).rejects.toThrow('Unsupported export format: xml');
    });

    it('should apply filters when exporting', async () => {
      mockExportService.exportToCSV.mockResolvedValue('/tmp/export.csv');
      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue([mockExpectations[0]]);

      await orchestrator.exportCurriculum(
        { userId: mockUserId },
        { 
          format: 'csv', 
          filters: { 
            grade: 5, 
            subject: 'Mathematics',
            strand: 'Number Sense',
            search: 'place value',
          },
        }
      );

      expect(prisma.curriculumExpectation.findMany).toHaveBeenCalledWith({
        where: {
          grade: 5,
          subject: 'Mathematics',
          strand: 'Number Sense',
          OR: [
            { code: { contains: 'place value', mode: 'insensitive' } },
            { description: { contains: 'place value', mode: 'insensitive' } },
          ],
        },
        orderBy: [{ grade: 'asc' }, { strand: 'asc' }, { code: 'asc' }],
      });
    });
  });

  describe('searchExpectations', () => {
    it('should search expectations using search service', async () => {
      const mockResults = [
        {
          id: 1,
          code: 'A1.1',
          description: 'Understand place value',
          strand: 'Number Sense',
          grade: 5,
          subject: 'Mathematics',
        },
      ];

      mockSearchService.search.mockResolvedValue(mockResults);

      const result = await orchestrator.searchExpectations(
        { userId: mockUserId },
        { query: 'place value', filters: { grade: 5 } }
      );

      expect(result).toEqual(mockResults);
      expect(mockSearchService.search).toHaveBeenCalledWith('place value', { grade: 5 });
    });
  });

  describe('getCurriculumStats', () => {
    it('should get curriculum statistics using stats service', async () => {
      const mockStats = {
        totalExpectations: 150,
        byGrade: { 1: 20, 2: 25, 3: 30, 4: 35, 5: 40 },
        byStrand: {
          'Number Sense': 50,
          'Measurement': 30,
          'Geometry': 25,
          'Data Management': 25,
          'Algebra': 20,
        },
        bySubject: {
          'Mathematics': 150,
        },
      };

      mockStatsService.getStats.mockResolvedValue(mockStats);

      const result = await orchestrator.getCurriculumStats(
        { userId: mockUserId },
        { filters: { subject: 'Mathematics' } }
      );

      expect(result).toEqual(mockStats);
      expect(mockStatsService.getStats).toHaveBeenCalledWith({ subject: 'Mathematics' });
    });
  });

  describe('validateImportData', () => {
    it('should validate import data before processing', async () => {
      const importData = {
        expectations: mockTransformedData,
      };

      mockValidator.validateImportData.mockResolvedValue({
        isValid: true,
        errors: [],
      });

      const result = await orchestrator.validateImportData(
        { userId: mockUserId },
        importData
      );

      expect(result).toEqual({
        isValid: true,
        errors: [],
      });

      expect(mockValidator.validateImportData).toHaveBeenCalledWith(importData);
    });

    it('should return validation errors', async () => {
      const importData = {
        expectations: [
          { code: '', description: 'Missing code' }, // Invalid
        ],
      };

      mockValidator.validateImportData.mockResolvedValue({
        isValid: false,
        errors: ['Expectation 1: Code is required'],
      });

      const result = await orchestrator.validateImportData(
        { userId: mockUserId },
        importData
      );

      expect(result).toEqual({
        isValid: false,
        errors: ['Expectation 1: Code is required'],
      });
    });
  });

  describe('mergeCurriculum', () => {
    it('should merge imported curriculum with existing data', async () => {
      const newExpectations = [
        {
          code: 'A1.3',
          strand: 'Number Sense',
          grade: 5,
          subject: 'Mathematics',
          description: 'Add and subtract numbers',
        },
      ];

      // Mock existing expectations
      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue([
        {
          id: 1,
          code: 'A1.1',
          description: 'Understand place value',
          strand: 'Number Sense',
          grade: 5,
          subject: 'Mathematics',
        },
      ]);

      // Mock upsert operations
      prisma.curriculumExpectation.upsert = vi.fn().mockResolvedValue({
        id: 2,
        ...newExpectations[0],
      });

      const result = await orchestrator.mergeCurriculum(
        { userId: mockUserId },
        { expectations: newExpectations, strategy: 'merge' }
      );

      expect(result).toEqual({
        added: 1,
        updated: 0,
        unchanged: 0,
        conflicts: [],
      });

      expect(prisma.curriculumExpectation.upsert).toHaveBeenCalled();
    });

    it('should handle conflicts during merge', async () => {
      const conflictingExpectations = [
        {
          code: 'A1.1',
          strand: 'Number Sense',
          grade: 5,
          subject: 'Mathematics',
          description: 'Different description', // Conflict
        },
      ];

      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue([
        {
          id: 1,
          code: 'A1.1',
          description: 'Understand place value',
          strand: 'Number Sense',
          grade: 5,
          subject: 'Mathematics',
        },
      ]);

      const result = await orchestrator.mergeCurriculum(
        { userId: mockUserId },
        { expectations: conflictingExpectations, strategy: 'skip' }
      );

      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toMatchObject({
        code: 'A1.1',
        reason: 'Description mismatch',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle transformer errors gracefully', async () => {
      vi.mocked(fs.access).mockResolvedValue(undefined);
      mockTransformer.parseFile.mockRejectedValue(new Error('Failed to parse file'));

      await expect(
        orchestrator.importFromFile(
          { userId: mockUserId },
          { filePath: mockFilePath, subject: 'Mathematics', grade: 5 }
        )
      ).rejects.toThrow('Failed to parse file');
    });

    it('should clean up temporary files on error', async () => {
      const tempFile = '/tmp/temp-import.csv';
      vi.mocked(fs.access).mockResolvedValue(undefined);
      mockTransformer.parseFile.mockRejectedValue(new Error('Parse error'));

      try {
        await orchestrator.importFromFile(
          { userId: mockUserId },
          { filePath: tempFile, subject: 'Mathematics', grade: 5 }
        );
      } catch (_error) {
        // Error expected
      }

      // Verify cleanup was attempted
      expect(mockTransformer.cleanup).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      // Create a large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        code: `A1.${i}`,
        strand: 'Number Sense',
        grade: Math.floor(i / 200) + 1,
        subject: 'Mathematics',
        description: `Expectation ${i}`,
      }));

      vi.mocked(fs.access).mockResolvedValue(undefined);
      mockTransformer.parseFile.mockResolvedValue({
        headers: ['Code', 'Strand', 'Grade', 'Description'],
        rows: largeDataset.map(e => [e.code, e.strand, e.grade.toString(), e.description]),
      });
      mockTransformer.transformData.mockResolvedValue(largeDataset);

      // Mock batch insert
      prisma.curriculumExpectation.createMany = vi.fn().mockResolvedValue({ count: 1000 });
      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue(
        largeDataset.map((e, i) => ({ id: i + 1, ...e }))
      );

      const startTime = Date.now();
      const result = await orchestrator.importFromFile(
        { userId: mockUserId },
        { filePath: mockFilePath, subject: 'Mathematics' }
      );
      const endTime = Date.now();

      expect(result.importedCount).toBe(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should batch database operations for performance', async () => {
      const batchSize = 100;
      const totalRecords = 250;
      const dataset = Array.from({ length: totalRecords }, (_, i) => ({
        code: `A1.${i}`,
        strand: 'Number Sense',
        grade: 5,
        subject: 'Mathematics',
        description: `Expectation ${i}`,
      }));

      vi.mocked(fs.access).mockResolvedValue(undefined);
      mockTransformer.parseFile.mockResolvedValue({
        headers: ['Code', 'Strand', 'Grade', 'Description'],
        rows: dataset.map(e => [e.code, e.strand, e.grade.toString(), e.description]),
      });
      mockTransformer.transformData.mockResolvedValue(dataset);

      // Track createMany calls
      let createManyCalls = 0;
      prisma.curriculumExpectation.createMany = vi.fn().mockImplementation(() => {
        createManyCalls++;
        return Promise.resolve({ count: batchSize });
      });

      prisma.curriculumExpectation.findMany = vi.fn().mockResolvedValue(
        dataset.map((e, i) => ({ id: i + 1, ...e }))
      );

      await orchestrator.importFromFile(
        { userId: mockUserId },
        { filePath: mockFilePath, subject: 'Mathematics', batchSize }
      );

      // Should batch into 3 calls (100 + 100 + 50)
      expect(createManyCalls).toBe(Math.ceil(totalRecords / batchSize));
    });
  });
});