import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { CurriculumImportService } from '../services/curriculumImportService';
import { prisma } from '../prisma';

// Mock dependencies
jest.mock('../prisma');

describe('CurriculumImportService', () => {
  let service: CurriculumImportService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CurriculumImportService();
  });

  describe('startImport', () => {
    it('should create a new import session', async () => {
      const mockImport = {
        id: 'import-123',
        userId: 1,
        grade: 1,
        subject: 'Mathematics',
        sourceFormat: 'csv',
        status: 'UPLOADING',
      };

      (prisma.curriculumImport.create as jest.Mock).mockResolvedValue(mockImport);

      const result = await service.startImport(1, 1, 'Mathematics', 'csv');

      expect(result).toBe('import-123');
      expect(prisma.curriculumImport.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          grade: 1,
          subject: 'Mathematics',
          sourceFormat: 'csv',
          sourceFile: undefined,
          status: 'UPLOADING',
          metadata: {},
        },
      });
    });

    it('should handle errors gracefully', async () => {
      (prisma.curriculumImport.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(service.startImport(1, 1, 'Mathematics', 'csv')).rejects.toThrow(
        'Failed to start import session',
      );
    });
  });

  describe('parseCSV', () => {
    it('should parse valid CSV content', () => {
      const csvContent = `code,description,subject,grade,domain
M1.1,"Count to 20",Mathematics,1,Number
M1.2,"Add numbers",Mathematics,1,Number`;

      const result = service.parseCSV(csvContent);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        code: 'M1.1',
        description: 'Count to 20',
        subject: 'Mathematics',
        grade: 1,
        domain: 'Number',
      });
    });

    it('should handle CSV with missing optional columns', () => {
      const csvContent = `code,description
M1.1,"Count to 20"
M1.2,"Add numbers"`;

      const result = service.parseCSV(csvContent);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        code: 'M1.1',
        description: 'Count to 20',
        subject: 'Unknown',
        grade: 0,
        domain: undefined,
      });
    });

    it('should skip empty lines', () => {
      const csvContent = `code,description,subject,grade
M1.1,"Count to 20",Mathematics,1

M1.2,"Add numbers",Mathematics,1
`;

      const result = service.parseCSV(csvContent);

      expect(result).toHaveLength(2);
    });

    it('should handle quoted values with commas', () => {
      const csvContent = `code,description,subject,grade
"M1.1","Count to 20, then to 30",Mathematics,1`;

      const result = service.parseCSV(csvContent);

      expect(result[0].description).toBe('Count to 20, then to 30');
    });

    it('should throw error for missing required columns', () => {
      const csvContent = `name,value
Test,123`;

      expect(() => service.parseCSV(csvContent)).toThrow(
        'CSV must contain "code" and "description" columns',
      );
    });
  });

  describe('confirmImport', () => {
    it('should create curriculum expectations from parsed data', async () => {
      const mockImport = {
        id: 'import-123',
        status: 'READY_FOR_REVIEW',
        metadata: {
          parsedSubjects: [
            {
              name: 'Mathematics',
              expectations: [
                {
                  code: 'M1.1',
                  description: 'Count to 20',
                  strand: 'Number',
                  grade: 1,
                  subject: 'Mathematics',
                },
              ],
            },
          ],
        },
      };

      (prisma.curriculumImport.findUnique as jest.Mock).mockResolvedValue(mockImport);
      (prisma.curriculumExpectation.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.curriculumExpectation.create as jest.Mock).mockResolvedValue({});
      (prisma.curriculumImport.update as jest.Mock).mockResolvedValue({});

      const result = await service.confirmImport('import-123');

      expect(result.created).toBe(1);
      expect(prisma.curriculumExpectation.create).toHaveBeenCalledWith({
        data: {
          code: 'M1.1',
          description: 'Count to 20',
          descriptionFr: null,
          strand: 'Number',
          substrand: null,
          grade: 1,
          subject: 'Mathematics',
        },
      });
    });

    it('should skip existing expectations', async () => {
      const mockImport = {
        id: 'import-123',
        status: 'READY_FOR_REVIEW',
        metadata: {
          parsedSubjects: [
            {
              name: 'Mathematics',
              expectations: [
                {
                  code: 'M1.1',
                  description: 'Count to 20',
                  strand: 'Number',
                  grade: 1,
                  subject: 'Mathematics',
                },
              ],
            },
          ],
        },
      };

      (prisma.curriculumImport.findUnique as jest.Mock).mockResolvedValue(mockImport);
      (prisma.curriculumExpectation.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });
      (prisma.curriculumImport.update as jest.Mock).mockResolvedValue({});

      const result = await service.confirmImport('import-123');

      expect(result.created).toBe(0);
      expect(prisma.curriculumExpectation.create).not.toHaveBeenCalled();
    });

    it('should reject if import not found', async () => {
      (prisma.curriculumImport.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.confirmImport('non-existent')).rejects.toThrow(
        'Import session not found',
      );
    });

    it('should reject if import not ready', async () => {
      const mockImport = {
        id: 'import-123',
        status: 'PROCESSING',
      };

      (prisma.curriculumImport.findUnique as jest.Mock).mockResolvedValue(mockImport);

      await expect(service.confirmImport('import-123')).rejects.toThrow(
        'Import is not ready for confirmation',
      );
    });
  });

  describe('getImportProgress', () => {
    it('should return progress information', async () => {
      const mockImport = {
        id: 'import-123',
        status: 'PROCESSING',
        totalOutcomes: 100,
        processedOutcomes: 50,
        errorLog: ['Error 1', 'Error 2'],
      };

      (prisma.curriculumImport.findUnique as jest.Mock).mockResolvedValue(mockImport);

      const result = await service.getImportProgress('import-123');

      expect(result).toEqual({
        importId: 'import-123',
        status: 'PROCESSING',
        totalOutcomes: 100,
        processedOutcomes: 50,
        errors: ['Error 1', 'Error 2'],
      });
    });

    it('should return null for non-existent import', async () => {
      (prisma.curriculumImport.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await service.getImportProgress('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('loadPresetCurriculum', () => {
    it('should load PEI Grade 1 French preset', async () => {
      (prisma.curriculumImport.create as jest.Mock).mockResolvedValue({ id: 'import-123' });
      (prisma.curriculumImport.update as jest.Mock).mockResolvedValue({});

      const result = await service.loadPresetCurriculum(1, 'pei-grade1-french');

      expect(result.sessionId).toBe('import-123');
      expect(result.subjects).toHaveLength(2);
      expect(result.subjects[0].name).toBe('Français Langue Première');
      expect(result.subjects[0].expectations).toHaveLength(2);
    });

    it('should load Ontario Grade 1 English preset', async () => {
      (prisma.curriculumImport.create as jest.Mock).mockResolvedValue({ id: 'import-123' });
      (prisma.curriculumImport.update as jest.Mock).mockResolvedValue({});

      const result = await service.loadPresetCurriculum(1, 'ontario-grade1-english');

      expect(result.subjects).toHaveLength(2);
      expect(result.subjects[0].name).toBe('Language');
      expect(result.subjects[1].name).toBe('Mathematics');
    });

    it('should throw error for unknown preset', async () => {
      await expect(service.loadPresetCurriculum(1, 'unknown-preset')).rejects.toThrow(
        'Unknown preset: unknown-preset',
      );
    });
  });

  describe('Text Chunking', () => {
    it('should split text into manageable chunks', () => {
      // Access private method through reflection
      const chunkText = (service as any).chunkText.bind(service);

      const longText = Array(10).fill('This is a paragraph.').join('\n\n');
      const chunks = chunkText(longText, 50);

      expect(chunks.length).toBeGreaterThan(1);
      chunks.forEach((chunk) => {
        expect(chunk.length).toBeLessThanOrEqual(50);
      });
    });

    it('should preserve paragraph boundaries', () => {
      const chunkText = (service as any).chunkText.bind(service);

      const text = 'Paragraph 1.\n\nParagraph 2.\n\nParagraph 3.';
      const chunks = chunkText(text, 20);

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toBe('Paragraph 1.');
      expect(chunks[1]).toBe('Paragraph 2.');
      expect(chunks[2]).toBe('Paragraph 3.');
    });
  });

  describe('Expectation Type Detection', () => {
    it('should identify overall expectations', () => {
      const determineType = (service as any).determineExpectationType.bind(service);

      expect(determineType('A', 'Overall expectation')).toBe('overall');
      expect(determineType('A1.0', 'Some description')).toBe('overall');
      expect(determineType('B2', 'Some description')).toBe('overall');
      expect(determineType('1', 'Some description')).toBe('overall');
    });

    it('should identify specific expectations', () => {
      const determineType = (service as any).determineExpectationType.bind(service);

      expect(determineType('A1.1', 'Specific expectation')).toBe('specific');
      expect(determineType('B2.3', 'Some description')).toBe('specific');
      expect(determineType('1.2.3', 'Some description')).toBe('specific');
    });
  });
});
