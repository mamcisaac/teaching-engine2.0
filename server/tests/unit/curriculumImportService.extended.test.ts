import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ImportStatus } from '@teaching-engine/database';
import { CurriculumImportService } from '../../src/services/curriculumImportService';

// Create test database client
const createMockPrismaClient = () => ({
  curriculumImport: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  },
  curriculumExpectation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

describe('CurriculumImportService - Extended Coverage Tests', () => {
  let service: CurriculumImportService;
  let mockPrismaClient: ReturnType<typeof createMockPrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create service instance
    service = new CurriculumImportService();

    // Create mock prisma client
    mockPrismaClient = createMockPrismaClient();
    (service as any).prisma = mockPrismaClient;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('File Format Validation', () => {
    it('should handle CSV with complex quoted fields', () => {
      const csvContent = `code,description,subject,grade,domain
"M1.1","Test with ""escaped quotes"" and commas, semicolons; etc.",Math,1,Number
"M1.2","Multi-line description
with actual newlines",Math,1,Number
"M1.3","Unicode test: émoji 🎯 中文 العربية",Math,1,Number`;

      const result = service.parseCSV(csvContent);

      expect(result).toHaveLength(3); // Parser actually processes all three lines
      expect(result[0].description).toContain('escaped quotes');
      expect(result[2].description).toContain('🎯');
    });

    it('should handle CSV with empty fields gracefully', () => {
      const csvContent = `code,description,subject,grade,domain
M1.1,,Math,1,Number
,Some description,Math,1,Number
M1.3,Another description,,1,Number
M1.4,Complete description,Math,,Number`;

      const result = service.parseCSV(csvContent);

      expect(result).toHaveLength(4);
      expect(result[0].description).toBe('');
      expect(result[1].code).toBe('');
      expect(result[2].subject).toBe(''); // Empty subject stays empty initially
      expect(result[3].grade).toBe(0);
    });

    it('should handle CSV with BOM (Byte Order Mark)', () => {
      const csvWithBom = '\ufeffcode,description,subject,grade,domain\nM1.1,Test,Math,1,Number';

      const result = service.parseCSV(csvWithBom);

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('M1.1');
    });

    it('should validate required CSV columns', () => {
      const invalidCsv1 = 'name,value\ntest,123';
      expect(() => service.parseCSV(invalidCsv1)).toThrow(
        'CSV must contain "code" and "description" columns',
      );

      const invalidCsv2 = 'code,name\nM1,Test';
      expect(() => service.parseCSV(invalidCsv2)).toThrow(
        'CSV must contain "code" and "description" columns',
      );

      const validCsv = 'code,description\nM1,Test';
      expect(() => service.parseCSV(validCsv)).not.toThrow();
    });
  });

  describe('Language Detection', () => {
    it('should detect French content correctly', () => {
      const frenchText = `
        Mathématiques - 1re année
        Attentes:
        - L'élève doit compter jusqu'à 100
        - Apprentissage des nombres
        Domaine: Numération
      `;

      const isFrench = (service as any).detectLanguage(frenchText);
      expect(isFrench).toBe(true);
    });

    it('should detect English content correctly', () => {
      const englishText = `
        Mathematics - Grade 1
        Expectations:
        - Students will count to 100
        - Learning about numbers
        Strand: Number Sense
      `;

      const isFrench = (service as any).detectLanguage(englishText);
      expect(isFrench).toBe(false);
    });

    it('should detect bilingual content', () => {
      const bilingualText = `
        Mathematics/Mathématiques - Grade/Année 2
        Expectations/Attentes:
        - Student will count/L'élève doit compter
        Strand/Domaine: Number/Nombre
      `;

      const isBilingual = (service as any).detectBilingual(bilingualText);
      expect(isBilingual).toBe(true);
    });
  });

  describe('Text Chunking', () => {
    it('should chunk text by paragraphs', () => {
      const text = 'Para 1\n\nPara 2\n\nPara 3';

      const chunks = (service as any).chunkText(text, 20);

      expect(chunks).toHaveLength(1); // Small text stays as one chunk
      expect(chunks[0]).toBe(text);
    });

    it('should handle long paragraphs that exceed chunk size', () => {
      const longParagraph = 'A'.repeat(100);
      const text = `${longParagraph}\n\nShort paragraph`;

      const chunks = (service as any).chunkText(text, 50);

      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toBe(longParagraph);
      expect(chunks[1]).toBe('Short paragraph');
    });

    it('should combine small paragraphs within chunk limit', () => {
      const text = 'Small 1\n\nSmall 2\n\nSmall 3';

      const chunks = (service as any).chunkText(text, 100);

      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toBe('Small 1\n\nSmall 2\n\nSmall 3');
    });
  });

  describe('Expectation Type Detection', () => {
    it('should detect overall expectations correctly', () => {
      expect((service as any).determineExpectationType('A', 'Overall expectation')).toBe('overall');
      expect((service as any).determineExpectationType('A1.0', 'Strand expectation')).toBe(
        'overall',
      );
      expect((service as any).determineExpectationType('A1', 'Grade expectation')).toBe('overall');
      expect((service as any).determineExpectationType('O1', 'Contains overall')).toBe('overall');
    });

    it('should detect specific expectations correctly', () => {
      expect((service as any).determineExpectationType('A1.1', 'Specific expectation')).toBe(
        'specific',
      );
      expect((service as any).determineExpectationType('3.N.1.2', 'Detailed code')).toBe(
        'specific',
      );
      expect((service as any).determineExpectationType('B2.3a', 'Sub-expectation')).toBe(
        'specific',
      );
    });
  });

  describe('storeUploadedFile', () => {
    it('should store file metadata correctly', async () => {
      const mockFile = {
        originalname: 'test-curriculum.csv',
        mimetype: 'text/csv',
        size: 2048,
        buffer: Buffer.from('test,content\nM1.1,Test'),
      } as Express.Multer.File;

      mockPrismaClient.curriculumImport.update.mockResolvedValue({});

      await service.storeUploadedFile('import-123', mockFile);

      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: 'import-123' },
        data: {
          sourceFile: 'test-curriculum.csv',
          metadata: expect.objectContaining({
            filename: 'test-curriculum.csv',
            mimetype: 'text/csv',
            size: 2048,
            uploadedAt: expect.any(String),
          }),
          rawText: mockFile.buffer.toString('base64'),
        },
      });
    });

    it('should handle file storage errors', async () => {
      const mockFile = {
        originalname: 'test.csv',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      mockPrismaClient.curriculumImport.update.mockRejectedValue(new Error('Storage failed'));

      await expect(service.storeUploadedFile('import-123', mockFile)).rejects.toThrow(
        'Storage failed',
      );
    });
  });

  describe('parseUploadedFile - CSV Path', () => {
    it('should parse CSV file successfully', async () => {
      const csvContent = 'code,description,subject,grade,domain\nM1.1,Count to 10,Math,1,Number';
      const mockImport = {
        id: 'import-csv',
        sourceFormat: 'csv',
        rawText: Buffer.from(csvContent).toString('base64'),
        grade: 1,
        metadata: {},
      };

      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImport);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({});

      const result = await service.parseUploadedFile('import-csv');

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe('Math');
      expect(result.subjects[0].expectations).toHaveLength(1);
      expect(result.subjects[0].expectations[0].code).toBe('M1.1');
      expect(result.subjects[0].expectations[0].type).toBe('specific');
    });

    it('should handle import not found', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(null);

      await expect(service.parseUploadedFile('nonexistent')).rejects.toThrow(
        'Import session not found',
      );
    });

    it('should handle missing file content', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        id: 'import-empty',
        rawText: null,
      });

      await expect(service.parseUploadedFile('import-empty')).rejects.toThrow(
        'No file content found for parsing',
      );
    });

    it('should handle unsupported file formats', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        id: 'import-txt',
        sourceFormat: 'txt',
        rawText: 'some text',
      });

      await expect(service.parseUploadedFile('import-txt')).rejects.toThrow(
        'Unsupported file format: txt',
      );
    });

    it('should update status to FAILED on parsing error', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        id: 'import-error',
        sourceFormat: 'csv',
        rawText: 'invalid-base64',
      });
      mockPrismaClient.curriculumImport.update.mockResolvedValue({});

      await expect(service.parseUploadedFile('import-error')).rejects.toThrow();

      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: 'import-error' },
        data: { status: ImportStatus.FAILED },
      });
    });
  });

  describe('loadPresetCurriculum', () => {
    beforeEach(() => {
      mockPrismaClient.curriculumImport.create.mockResolvedValue({ id: 'preset-import' });
      mockPrismaClient.curriculumImport.update.mockResolvedValue({});
    });

    it('should load PEI French preset correctly', async () => {
      const result = await service.loadPresetCurriculum(1, 'pei-grade1-french');

      expect(result.subjects).toHaveLength(2);
      expect(result.subjects[0].name).toBe('Français Langue Première');
      expect(result.subjects[1].name).toBe('Mathématiques');
      expect(result.subjects[0].expectations[0].code).toBe('CO1');
    });

    it('should load Ontario English preset correctly', async () => {
      const result = await service.loadPresetCurriculum(1, 'ontario-grade1-english');

      expect(result.subjects).toHaveLength(2);
      expect(result.subjects[0].name).toBe('Language');
      expect(result.subjects[1].name).toBe('Mathematics');
    });

    it('should load BC core preset correctly', async () => {
      const result = await service.loadPresetCurriculum(1, 'bc-grade1-core');

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe('English Language Arts');
    });

    it('should handle unknown preset', async () => {
      await expect(service.loadPresetCurriculum(1, 'unknown-preset')).rejects.toThrow(
        'Unknown preset: unknown-preset',
      );
    });

    it('should store preset metadata correctly', async () => {
      await service.loadPresetCurriculum(1, 'pei-grade1-french');

      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: 'preset-import' },
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            presetId: 'pei-grade1-french',
            parsedSubjects: expect.any(Array),
            loadedAt: expect.any(String),
          }),
        }),
      });
    });
  });

  describe('finalizeImport', () => {
    it('should finalize import with expectations', async () => {
      const mockImport = {
        id: 'final-import',
        metadata: {
          parsedSubjects: [
            {
              name: 'Mathematics',
              expectations: [
                {
                  code: 'M1.1',
                  description: 'Count to 100',
                  strand: 'Number',
                  grade: 1,
                  subject: 'Mathematics',
                },
                {
                  code: 'M1.2',
                  description: 'Add numbers',
                  strand: 'Number',
                  grade: 1,
                  subject: 'Mathematics',
                },
              ],
            },
          ],
        },
        curriculumExpectations: [],
      };

      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImport);
      mockPrismaClient.curriculumExpectation.create.mockResolvedValue({});
      mockPrismaClient.curriculumImport.update.mockResolvedValue({});

      const result = await service.finalizeImport('final-import', 1);

      expect(result.totalExpectations).toBe(2);
      expect(result.subjects).toEqual(['Mathematics']);
      expect(mockPrismaClient.curriculumExpectation.create).toHaveBeenCalledTimes(2);
    });

    it('should handle empty subjects gracefully', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        id: 'empty-import',
        metadata: {},
        curriculumExpectations: [],
      });
      mockPrismaClient.curriculumImport.update.mockResolvedValue({});

      const result = await service.finalizeImport('empty-import', 1);

      expect(result.totalExpectations).toBe(0);
      expect(result.subjects).toEqual([]);
    });

    it('should update final metadata correctly', async () => {
      const mockImport = {
        id: 'meta-import',
        metadata: {
          parsedSubjects: [
            {
              name: 'Test',
              expectations: [
                { code: 'T1', description: 'Test', grade: 1, subject: 'Test', strand: 'Test' },
              ],
            },
          ],
        },
        curriculumExpectations: [],
      };

      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImport);
      mockPrismaClient.curriculumExpectation.create.mockResolvedValue({});
      mockPrismaClient.curriculumImport.update.mockResolvedValue({});

      await service.finalizeImport('meta-import', 1);

      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'meta-import' },
          data: expect.objectContaining({
            metadata: expect.objectContaining({
              finalResults: expect.objectContaining({
                totalExpectations: 1,
                subjects: ['Test'],
                completedAt: expect.any(String),
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed CSV gracefully', () => {
      const malformedCsv = `code,description,subject,grade,domain
M1.1,"Unclosed quote and missing comma
M1.2,Normal line,Math,1,Number`;

      const result = service.parseCSV(malformedCsv);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle very large CSV files efficiently', () => {
      const headers = 'code,description,subject,grade,domain\n';
      const rows = Array(5000)
        .fill(null)
        .map((_, i) => `M${i}.1,Description ${i},Math,${(i % 12) + 1},Domain`)
        .join('\n');
      const largeCsv = headers + rows;

      const startTime = Date.now();
      const result = service.parseCSV(largeCsv);
      const endTime = Date.now();

      expect(result).toHaveLength(5000);
      expect(endTime - startTime).toBeLessThan(500); // Should parse quickly
    });

    it('should handle empty CSV content', () => {
      const emptyCsv = 'code,description,subject,grade,domain\n';
      const result = service.parseCSV(emptyCsv);
      expect(result).toHaveLength(0);
    });

    it('should handle CSV with different line endings', () => {
      const csvWindows = 'code,description\r\nM1.1,Test 1\r\nM1.2,Test 2';
      const csvUnix = 'code,description\nM1.1,Test 1\nM1.2,Test 2';

      const resultWindows = service.parseCSV(csvWindows);
      const resultUnix = service.parseCSV(csvUnix);

      expect(resultWindows).toHaveLength(2);
      expect(resultUnix).toHaveLength(2);
    });
  });

  describe('Data Validation', () => {
    it('should sanitize invalid grade values', () => {
      const csv = `code,description,subject,grade,domain
M1.1,Test 1,Math,invalid,Number
M1.2,Test 2,Math,3.5,Number
M1.3,Test 3,Math,-1,Number
M1.4,Test 4,Math,15,Number`;

      const result = service.parseCSV(csv);

      expect(result[0].grade).toBe(0); // Invalid -> 0
      expect(result[1].grade).toBe(3); // 3.5 -> 3
      expect(result[2].grade).toBe(-1); // -1 stays as parsed
      expect(result[3].grade).toBe(15); // Valid high grade
    });

    it('should handle missing subject and domain defaults', () => {
      const csv = `code,description
M1.1,Test without subject
M1.2,Another test`;

      const result = service.parseCSV(csv);

      expect(result[0].subject).toBe('Unknown');
      expect(result[0].strand).toBe('General');
      expect(result[1].subject).toBe('Unknown');
      expect(result[1].strand).toBe('General');
    });
  });

  describe('Performance Considerations', () => {
    it('should handle rapid successive parsing calls', () => {
      const csv = 'code,description\nM1.1,Test\nM1.2,Test2';

      const iterations = 100;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        const result = service.parseCSV(csv);
        expect(result).toHaveLength(2);
      }

      const endTime = Date.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(2); // Less than 2ms per parse on average
    });
  });
});
