import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ImportStatus } from '@teaching-engine/database';
import fs from 'fs';
import path from 'path';
import { CurriculumImportService } from '../../src/services/curriculumImportService';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');

// Mock pdf-parse and mammoth
jest.mock('pdf-parse');
jest.mock('mammoth');

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
  outcomeCluster: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  curriculumExpectation: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
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
});

describe('CurriculumImportService - Comprehensive Tests', () => {
  let service: CurriculumImportService;
  let mockPrismaClient: ReturnType<typeof createMockPrismaClient>;
  let mockOpenAI: jest.Mocked<OpenAI>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment
    process.env.OPENAI_API_KEY = 'test-api-key';

    // Create service instance
    service = new CurriculumImportService();

    // Create mock prisma client
    mockPrismaClient = createMockPrismaClient();
    (service as any).prisma = mockPrismaClient;

    // Mock OpenAI
    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    } as any;
    (service as any).openai = mockOpenAI;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with OpenAI when API key is present', () => {
      const serviceWithKey = new CurriculumImportService();
      expect((serviceWithKey as any).openai).toBeTruthy();
    });

    it('should handle missing OpenAI API key gracefully', () => {
      delete process.env.OPENAI_API_KEY;
      const serviceWithoutKey = new CurriculumImportService();
      expect((serviceWithoutKey as any).openai).toBeNull();
    });
  });

  describe('confirmImport', () => {
    const mockImportId = 'test-import-123';
    const mockImportRecord = {
      id: mockImportId,
      status: ImportStatus.READY_FOR_REVIEW,
      metadata: {
        parsedSubjects: [
          {
            name: 'Mathematics',
            expectations: [
              {
                code: 'M1.1',
                description: 'Count to 100',
                descriptionFr: "Compter jusqu'à 100",
                strand: 'Number',
                substrand: 'Counting',
                grade: 1,
                subject: 'Mathematics',
              },
              {
                code: 'M1.2',
                description: 'Add single digits',
                strand: 'Number',
                grade: 1,
                subject: 'Mathematics',
              },
            ],
          },
        ],
      },
    };

    it('should confirm import and create expectations', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImportRecord);
      mockPrismaClient.curriculumExpectation.findUnique.mockResolvedValue(null);
      mockPrismaClient.curriculumExpectation.create.mockResolvedValue({} as any);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.confirmImport(mockImportId);

      expect(result.created).toBe(2);
      expect(mockPrismaClient.curriculumExpectation.create).toHaveBeenCalledTimes(2);
      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: mockImportId },
        data: { status: ImportStatus.COMPLETED },
      });
    });

    it('should skip existing expectations', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImportRecord);
      mockPrismaClient.curriculumExpectation.findUnique
        .mockResolvedValueOnce({ code: 'M1.1' } as any) // Existing
        .mockResolvedValueOnce(null); // New
      mockPrismaClient.curriculumExpectation.create.mockResolvedValue({} as any);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.confirmImport(mockImportId);

      expect(result.created).toBe(1);
      expect(mockPrismaClient.curriculumExpectation.create).toHaveBeenCalledTimes(1);
    });

    it('should handle import not found error', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(null);

      await expect(service.confirmImport(mockImportId)).rejects.toThrow('Import session not found');
    });

    it('should handle wrong import status', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        ...mockImportRecord,
        status: ImportStatus.PROCESSING,
      });

      await expect(service.confirmImport(mockImportId)).rejects.toThrow(
        'Import is not ready for confirmation',
      );
    });

    it('should handle creation errors gracefully', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImportRecord);
      mockPrismaClient.curriculumExpectation.findUnique.mockResolvedValue(null);
      mockPrismaClient.curriculumExpectation.create.mockRejectedValue(new Error('DB error'));
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.confirmImport(mockImportId);

      expect(result.created).toBe(0);
      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: mockImportId },
        data: { status: ImportStatus.COMPLETED },
      });
    });
  });

  describe('parsePDF', () => {
    const mockPdfParse = jest.fn();

    beforeEach(() => {
      jest.doMock('pdf-parse', () => mockPdfParse);
    });

    it('should parse PDF content successfully', async () => {
      const mockPdfContent = `
        Mathematics Curriculum Grade 1
        
        Overall Expectations:
        A1. Students will count to 100
        
        Specific Expectations:
        A1.1 Count forward by 1s
        A1.2 Count backward from 20
      `;

      mockPdfParse.mockResolvedValue({ text: mockPdfContent });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: 'Mathematics',
                grade: 1,
                expectations: [
                  {
                    code: 'A1',
                    type: 'overall',
                    description: 'Students will count to 100',
                    strand: 'Number',
                  },
                  {
                    code: 'A1.1',
                    type: 'specific',
                    description: 'Count forward by 1s',
                    strand: 'Number',
                  },
                ],
              }),
            },
          },
        ],
      } as any);

      const buffer = Buffer.from('fake pdf content');
      const result = await service.parsePDF(buffer);

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('A1');
      expect(result[1].code).toBe('A1.1');
      expect(mockPdfParse).toHaveBeenCalledWith(buffer);
    });

    it('should handle empty PDF', async () => {
      mockPdfParse.mockResolvedValue({ text: '' });

      const buffer = Buffer.from('');
      await expect(service.parsePDF(buffer)).rejects.toThrow(
        'PDF appears to be empty or too short',
      );
    });

    it('should handle PDF parsing errors', async () => {
      mockPdfParse.mockRejectedValue(new Error('Invalid PDF'));

      const buffer = Buffer.from('invalid');
      await expect(service.parsePDF(buffer)).rejects.toThrow('PDF parsing failed: Invalid PDF');
    });

    it('should handle large PDFs by chunking', async () => {
      // Create a very long text (>3000 chars)
      const longText = 'Mathematics Curriculum\n\n' + 'A'.repeat(4000);
      mockPdfParse.mockResolvedValue({ text: longText });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: 'Mathematics',
                grade: 1,
                expectations: [
                  {
                    code: 'A1',
                    description: 'Test expectation',
                    strand: 'Number',
                  },
                ],
              }),
            },
          },
        ],
      } as any);

      const buffer = Buffer.from('fake pdf');
      const result = await service.parsePDF(buffer);

      // Should process in multiple chunks
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2); // One expectation per chunk
    });
  });

  describe('parseDOCX', () => {
    const mockMammoth = {
      extractRawText: jest.fn(),
    };

    beforeEach(() => {
      jest.doMock('mammoth', () => mockMammoth);
    });

    it('should parse DOCX content successfully', async () => {
      const mockDocxContent = `
        English Language Arts - Grade 3
        
        Reading Expectations:
        R1. Read and understand various texts
        R1.1 Use phonics to decode words
      `;

      mammoth.extractRawText.mockResolvedValue({ value: mockDocxContent });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: 'English Language Arts',
                grade: 3,
                expectations: [
                  {
                    code: 'R1',
                    type: 'overall',
                    description: 'Read and understand various texts',
                    strand: 'Reading',
                  },
                  {
                    code: 'R1.1',
                    type: 'specific',
                    description: 'Use phonics to decode words',
                    strand: 'Reading',
                  },
                ],
              }),
            },
          },
        ],
      } as any);

      const buffer = Buffer.from('fake docx content');
      const result = await service.parseDOCX(buffer);

      expect(result).toHaveLength(2);
      expect(result[0].subject).toBe('English Language Arts');
      expect(result[0].grade).toBe(3);
    });

    it('should handle empty DOCX', async () => {
      mammoth.extractRawText.mockResolvedValue({ value: '' });

      const buffer = Buffer.from('');
      await expect(service.parseDOCX(buffer)).rejects.toThrow(
        'DOCX appears to be empty or too short',
      );
    });

    it('should handle DOCX parsing errors', async () => {
      mammoth.extractRawText.mockRejectedValue(new Error('Invalid DOCX'));

      const buffer = Buffer.from('invalid');
      await expect(service.parseDOCX(buffer)).rejects.toThrow('DOCX parsing failed: Invalid DOCX');
    });
  });

  describe('parseTextWithAI', () => {
    it('should detect French content', async () => {
      const frenchText = `
        Mathématiques - 1re année
        Attentes:
        - L'élève doit compter jusqu'à 100
        - Apprentissage des nombres
        Domaine: Numération
      `;

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: 'Mathématiques',
                grade: 1,
                expectations: [
                  {
                    code: 'N1',
                    description: "L'élève doit compter jusqu'à 100",
                    strand: 'Numération',
                  },
                ],
              }),
            },
          },
        ],
      } as any);

      const result = await (service as any).parseTextWithAI(frenchText);

      expect(result).toHaveLength(1);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining('French'),
            }),
          ]),
        }),
      );
    });

    it('should detect bilingual content', async () => {
      const bilingualText = `
        Mathematics/Mathématiques - Grade/Année 2
        Expectations/Attentes:
        - Student will count/L'élève doit compter
        Strand/Domaine: Number/Nombre
      `;

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: 'Mathematics',
                grade: 2,
                expectations: [
                  {
                    code: 'N1',
                    description: 'Student will count',
                    descriptionFr: "L'élève doit compter",
                    strand: 'Number',
                    strandFr: 'Nombre',
                  },
                ],
              }),
            },
          },
        ],
      } as any);

      const result = await (service as any).parseTextWithAI(bilingualText);

      expect(result).toHaveLength(1);
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining('bilingual'),
            }),
          ]),
        }),
      );
    });

    it('should handle missing OpenAI configuration', async () => {
      (service as any).openai = null;

      await expect((service as any).parseTextWithAI('test')).rejects.toThrow(
        'OpenAI API key not configured',
      );
    });

    it('should handle invalid JSON response from AI', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Invalid JSON response',
            },
          },
        ],
      } as any);

      const result = await (service as any).parseTextWithAI('test text');

      expect(result).toHaveLength(0);
    });

    it('should handle empty AI response', async () => {
      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: null,
            },
          },
        ],
      } as any);

      const result = await (service as any).parseTextWithAI('test text');

      expect(result).toHaveLength(0);
    });
  });

  describe('storeUploadedFile', () => {
    it('should store file metadata and content', async () => {
      const mockFile = {
        originalname: 'curriculum.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test content'),
      } as Express.Multer.File;

      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      await service.storeUploadedFile('import-123', mockFile);

      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: 'import-123' },
        data: {
          sourceFile: 'curriculum.pdf',
          metadata: {
            filename: 'curriculum.pdf',
            mimetype: 'application/pdf',
            size: 1024,
            uploadedAt: expect.any(String),
          },
          rawText: mockFile.buffer.toString('base64'),
        },
      });
    });

    it('should handle storage errors', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;

      mockPrismaClient.curriculumImport.update.mockRejectedValue(new Error('Storage error'));

      await expect(service.storeUploadedFile('import-123', mockFile)).rejects.toThrow(
        'Storage error',
      );
    });
  });

  describe('parseUploadedFile', () => {
    const mockImportId = 'import-123';

    it('should parse uploaded PDF file', async () => {
      const mockImport = {
        id: mockImportId,
        sourceFormat: 'pdf',
        rawText: Buffer.from('test pdf').toString('base64'),
        grade: 3,
        metadata: {},
      };

      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImport);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const pdf = (await import('pdf-parse')).default;
      pdf.mockResolvedValue({ text: 'Mathematics Grade 3' });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: 'Mathematics',
                grade: 3,
                expectations: [
                  {
                    code: 'M3.1',
                    description: 'Test expectation',
                    strand: 'Number',
                  },
                ],
              }),
            },
          },
        ],
      } as any);

      const result = await service.parseUploadedFile(mockImportId);

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe('Mathematics');
      expect(result.subjects[0].expectations).toHaveLength(1);
      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockImportId },
          data: expect.objectContaining({
            status: ImportStatus.READY_FOR_REVIEW,
          }),
        }),
      );
    });

    it('should parse uploaded DOCX file', async () => {
      const mockImport = {
        id: mockImportId,
        sourceFormat: 'docx',
        rawText: Buffer.from('test docx').toString('base64'),
        grade: 2,
        metadata: {},
      };

      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImport);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const mammoth = (await import('mammoth')).default;
      mammoth.extractRawText.mockResolvedValue({ value: 'English Grade 2' });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                subject: 'English',
                grade: 2,
                expectations: [
                  {
                    code: 'E2.1',
                    description: 'Reading comprehension',
                    strand: 'Reading',
                  },
                ],
              }),
            },
          },
        ],
      } as any);

      const result = await service.parseUploadedFile(mockImportId);

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe('English');
    });

    it('should parse uploaded CSV file', async () => {
      const csvContent = 'code,description,subject,grade,domain\nM1.1,Count to 10,Math,1,Number';
      const mockImport = {
        id: mockImportId,
        sourceFormat: 'csv',
        rawText: Buffer.from(csvContent).toString('base64'),
        grade: 1,
        metadata: {},
      };

      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImport);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.parseUploadedFile(mockImportId);

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe('Math');
      expect(result.subjects[0].expectations[0].code).toBe('M1.1');
    });

    it('should handle import not found', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(null);

      await expect(service.parseUploadedFile(mockImportId)).rejects.toThrow(
        'Import session not found',
      );
    });

    it('should handle missing file content', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        id: mockImportId,
        rawText: null,
      });

      await expect(service.parseUploadedFile(mockImportId)).rejects.toThrow(
        'No file content found for parsing',
      );
    });

    it('should handle unsupported file format', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        id: mockImportId,
        sourceFormat: 'txt',
        rawText: 'test',
      });

      await expect(service.parseUploadedFile(mockImportId)).rejects.toThrow(
        'Unsupported file format: txt',
      );
    });

    it('should update status to FAILED on error', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        id: mockImportId,
        sourceFormat: 'pdf',
        rawText: 'invalid',
      });
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const pdf = (await import('pdf-parse')).default;
      pdf.mockRejectedValue(new Error('Parse error'));

      await expect(service.parseUploadedFile(mockImportId)).rejects.toThrow();

      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: mockImportId },
        data: { status: ImportStatus.FAILED },
      });
    });
  });

  describe('loadPresetCurriculum', () => {
    const userId = 1;

    it('should load PEI French preset', async () => {
      const mockImport = {
        id: 'import-123',
        userId,
        grade: 1,
        subject: 'Multi-Subject',
        sourceFormat: 'manual',
        status: ImportStatus.UPLOADING,
      };

      mockPrismaClient.curriculumImport.create.mockResolvedValue(mockImport);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.loadPresetCurriculum(userId, 'pei-grade1-french');

      expect(result.subjects).toHaveLength(2);
      expect(result.subjects[0].name).toBe('Français Langue Première');
      expect(result.subjects[1].name).toBe('Mathématiques');
      expect(result.subjects[0].expectations).toHaveLength(2);
    });

    it('should load Ontario English preset', async () => {
      mockPrismaClient.curriculumImport.create.mockResolvedValue({ id: 'import-456' } as any);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.loadPresetCurriculum(userId, 'ontario-grade1-english');

      expect(result.subjects).toHaveLength(2);
      expect(result.subjects[0].name).toBe('Language');
      expect(result.subjects[1].name).toBe('Mathematics');
    });

    it('should load BC core preset', async () => {
      mockPrismaClient.curriculumImport.create.mockResolvedValue({ id: 'import-789' } as any);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.loadPresetCurriculum(userId, 'bc-grade1-core');

      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe('English Language Arts');
    });

    it('should handle unknown preset', async () => {
      mockPrismaClient.curriculumImport.create.mockResolvedValue({ id: 'import-000' } as any);

      await expect(service.loadPresetCurriculum(userId, 'unknown-preset')).rejects.toThrow(
        'Unknown preset: unknown-preset',
      );
    });

    it('should store preset metadata', async () => {
      mockPrismaClient.curriculumImport.create.mockResolvedValue({ id: 'import-meta' } as any);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      await service.loadPresetCurriculum(userId, 'pei-grade1-french');

      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: 'import-meta' },
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
    const mockImportId = 'import-final';
    const userId = 1;

    it('should finalize import successfully', async () => {
      const mockImport = {
        id: mockImportId,
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
      mockPrismaClient.curriculumExpectation.create.mockResolvedValue({} as any);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.finalizeImport(mockImportId, userId);

      expect(result.totalExpectations).toBe(2);
      expect(result.subjects).toEqual(['Mathematics']);
      expect(mockPrismaClient.curriculumExpectation.create).toHaveBeenCalledTimes(2);
      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockImportId },
          data: { status: 'COMPLETED' },
        }),
      );
    });

    it('should handle import not found', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(null);

      await expect(service.finalizeImport(mockImportId, userId)).rejects.toThrow(
        'Import session not found',
      );
    });

    it('should handle empty parsed subjects', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        id: mockImportId,
        metadata: {},
        curriculumExpectations: [],
      });
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.finalizeImport(mockImportId, userId);

      expect(result.totalExpectations).toBe(0);
      expect(result.subjects).toEqual([]);
    });

    it('should update status to FAILED on error', async () => {
      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue({
        id: mockImportId,
        metadata: { parsedSubjects: [{ name: 'Test', expectations: [{ code: 'T1' }] }] },
      });
      mockPrismaClient.curriculumExpectation.create.mockRejectedValue(new Error('DB error'));
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      await expect(service.finalizeImport(mockImportId, userId)).rejects.toThrow();

      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: mockImportId },
        data: { status: 'FAILED' },
      });
    });
  });

  describe('CSV Parsing Edge Cases', () => {
    it('should handle CSV with empty lines', () => {
      const csv = `code,description,subject,grade,domain

M1.1,Test 1,Math,1,Number

M1.2,Test 2,Math,1,Number
`;
      const result = service.parseCSV(csv);
      expect(result).toHaveLength(2);
    });

    it('should handle CSV with different delimiters in quotes', () => {
      const csv = `code,description,subject,grade,domain
"M1.1","Test, with comma",Math,1,Number
"M1.2","Test; with semicolon",Math,1,Number`;

      const result = service.parseCSV(csv);
      expect(result[0].description).toBe('Test, with comma');
      expect(result[1].description).toBe('Test; with semicolon');
    });

    it('should handle CSV with newlines in quoted fields', () => {
      const csv = `code,description,subject,grade,domain
"M1.1","Test with
newline",Math,1,Number`;

      const result = service.parseCSV(csv);
      expect(result[0].description).toContain('newline');
    });

    it('should handle CSV with Unicode characters', () => {
      const csv = `code,description,subject,grade,domain
M1.1,Test with émoji 🎯,Math,1,Number
M1.2,Test with Chinese 中文,Math,1,Number`;

      const result = service.parseCSV(csv);
      expect(result[0].description).toContain('🎯');
      expect(result[1].description).toContain('中文');
    });

    it('should handle CSV with escaped quotes', () => {
      const csv = `code,description,subject,grade,domain
"M1.1","Test with ""escaped"" quotes",Math,1,Number`;

      const result = service.parseCSV(csv);
      expect(result[0].description).toBe('Test with "escaped" quotes');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large file parsing efficiently', async () => {
      // Create a large CSV with 10,000 rows
      const headers = 'code,description,subject,grade,domain\n';
      const rows = Array(10000)
        .fill(null)
        .map((_, i) => `M${i}.1,Description ${i},Math,${(i % 12) + 1},Domain${i % 5}`)
        .join('\n');
      const largeCsv = headers + rows;

      const startTime = Date.now();
      const result = service.parseCSV(largeCsv);
      const endTime = Date.now();

      expect(result).toHaveLength(10000);
      expect(endTime - startTime).toBeLessThan(1000); // Should parse in under 1 second
    });

    it('should handle batch processing for large imports', async () => {
      // Simulate importing 1000 expectations
      const expectations = Array(1000)
        .fill(null)
        .map((_, i) => ({
          code: `M${i}.1`,
          description: `Description ${i}`,
          subject: 'Math',
          grade: 1,
          strand: 'Number',
        }));

      const mockImport = {
        id: 'batch-import',
        metadata: { parsedSubjects: [{ name: 'Math', expectations }] },
        curriculumExpectations: [],
      };

      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImport);
      mockPrismaClient.curriculumExpectation.create.mockResolvedValue({} as any);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const startTime = Date.now();
      const result = await service.finalizeImport('batch-import', 1);
      const endTime = Date.now();

      expect(result.totalExpectations).toBe(1000);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete in under 5 seconds
    });
  });

  describe('Error Recovery and Logging', () => {
    it('should log errors with appropriate context', async () => {
      const loggerSpy = jest.spyOn((service as any).logger, 'error');

      mockPrismaClient.curriculumImport.create.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.startImport(1, 3, 'Math', 'csv')).rejects.toThrow();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Error),
          userId: 1,
          grade: 3,
          subject: 'Math',
        }),
        'Failed to start curriculum import',
      );
    });

    it('should handle partial failures gracefully', async () => {
      const mockImport = {
        id: 'partial-import',
        metadata: {
          parsedSubjects: [
            {
              name: 'Math',
              expectations: [
                { code: 'M1.1', description: 'Valid', grade: 1, subject: 'Math', strand: 'Number' },
                {
                  code: '',
                  description: 'Invalid - no code',
                  grade: 1,
                  subject: 'Math',
                  strand: 'Number',
                },
                {
                  code: 'M1.3',
                  description: 'Valid again',
                  grade: 1,
                  subject: 'Math',
                  strand: 'Number',
                },
              ],
            },
          ],
        },
      };

      mockPrismaClient.curriculumImport.findUnique.mockResolvedValue(mockImport);
      mockPrismaClient.curriculumExpectation.create
        .mockResolvedValueOnce({} as any)
        .mockRejectedValueOnce(new Error('Invalid code'))
        .mockResolvedValueOnce({} as any);
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.finalizeImport('partial-import', 1);

      expect(result.totalExpectations).toBe(2); // Only valid ones
      expect(mockPrismaClient.curriculumExpectation.create).toHaveBeenCalledTimes(3);
    });
  });

  describe('Data Validation', () => {
    it('should validate CSV column requirements', () => {
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

    it('should sanitize grade values', () => {
      const csv = `code,description,subject,grade,domain
M1.1,Test 1,Math,invalid,Number
M1.2,Test 2,Math,3.5,Number
M1.3,Test 3,Math,-1,Number
M1.4,Test 4,Math,13,Number`;

      const result = service.parseCSV(csv);

      expect(result[0].grade).toBe(0); // Invalid -> 0
      expect(result[1].grade).toBe(3); // 3.5 -> 3
      expect(result[2].grade).toBe(0); // -1 -> 0
      expect(result[3].grade).toBe(13); // 13 stays 13 (let validation handle bounds)
    });

    it('should handle missing required fields gracefully', () => {
      const csv = `code,description,subject,grade,domain
,No code,Math,1,Number
M1.2,,Math,1,Number`;

      const result = service.parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('');
      expect(result[1].description).toBe('');
    });
  });

  describe('Integration with Real File Formats', () => {
    it('should detect expectation types correctly', () => {
      const service = new CurriculumImportService();

      // Test various code patterns
      expect((service as any).determineExpectationType('A', 'Overall expectation')).toBe('overall');
      expect((service as any).determineExpectationType('A1.0', 'Overall for strand')).toBe(
        'overall',
      );
      expect((service as any).determineExpectationType('A1', 'Overall expectation text')).toBe(
        'overall',
      );
      expect((service as any).determineExpectationType('A1.1', 'Specific expectation')).toBe(
        'specific',
      );
      expect((service as any).determineExpectationType('3.N.1.2', 'Specific expectation')).toBe(
        'specific',
      );
      expect(
        (service as any).determineExpectationType('B2.3a', 'Contains overall in description'),
      ).toBe('specific');
    });

    it('should chunk text appropriately', () => {
      const service = new CurriculumImportService();
      const text = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';

      const chunks = (service as any).chunkText(text, 20);

      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toBe('Paragraph 1');
      expect(chunks[1]).toBe('Paragraph 2');
      expect(chunks[2]).toBe('Paragraph 3');
    });

    it('should handle very long paragraphs', () => {
      const service = new CurriculumImportService();
      const longParagraph = 'A'.repeat(100);
      const text = `${longParagraph}\n\nShort paragraph`;

      const chunks = (service as any).chunkText(text, 50);

      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toBe(longParagraph);
      expect(chunks[1]).toBe('Short paragraph');
    });
  });

  describe('Real-world file handling', () => {
    it('should handle malformed CSV gracefully', () => {
      const malformedCsv = `code,description,subject,grade,domain
M1.1,"Unclosed quote,Math,1,Number
M1.2,Normal line,Math,1,Number`;

      const result = service.parseCSV(malformedCsv);

      // Should still parse what it can
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle BOM in CSV files', () => {
      // UTF-8 BOM
      const csvWithBom = '\ufeffcode,description,subject,grade,domain\nM1.1,Test,Math,1,Number';

      const result = service.parseCSV(csvWithBom);

      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('M1.1');
    });

    it('should handle different line endings', () => {
      const csvWindows = 'code,description\r\nM1.1,Test 1\r\nM1.2,Test 2';
      const csvUnix = 'code,description\nM1.1,Test 1\nM1.2,Test 2';
      const csvMac = 'code,description\rM1.1,Test 1\rM1.2,Test 2';

      const resultWindows = service.parseCSV(csvWindows);
      const resultUnix = service.parseCSV(csvUnix);
      const resultMac = service.parseCSV(csvMac);

      expect(resultWindows).toHaveLength(2);
      expect(resultUnix).toHaveLength(2);
      expect(resultMac.length).toBeGreaterThanOrEqual(1); // Mac might parse differently
    });
  });
});
