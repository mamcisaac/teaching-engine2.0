import { describe, it, expect, jest, beforeEach } from '@jest/globals';
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

describe('CurriculumImportService - Basic Tests', () => {
  let service: CurriculumImportService;
  let mockPrismaClient: ReturnType<typeof createMockPrismaClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up environment
    process.env.TEST_OPENAI_API_KEY = 'test-api-key';
    delete process.env.OPENAI_API_KEY;

    // Create service instance
    service = new CurriculumImportService();

    // Create mock prisma client
    mockPrismaClient = createMockPrismaClient();
    (service as any).prisma = mockPrismaClient;
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
  });

  describe('CSV Parsing', () => {
    it('should parse basic CSV correctly', () => {
      const csv = `code,description,subject,grade,domain
M1.1,Count to 10,Math,1,Number
M1.2,Add numbers,Math,1,Number`;

      const result = service.parseCSV(csv);

      expect(result).toHaveLength(2);
      expect(result[0].code).toBe('M1.1');
      expect(result[0].description).toBe('Count to 10');
      expect(result[0].subject).toBe('Math');
      expect(result[0].grade).toBe(1);
      expect(result[0].strand).toBe('Number');
    });

    it('should handle CSV with empty lines', () => {
      const csv = `code,description,subject,grade,domain

M1.1,Test 1,Math,1,Number

M1.2,Test 2,Math,1,Number
`;
      const result = service.parseCSV(csv);
      expect(result).toHaveLength(2);
    });

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

  describe('startImport', () => {
    it('should create new import session and return import ID', async () => {
      const mockImport = {
        id: 'import-123',
        userId: 1,
        grade: 3,
        subject: 'Math',
        sourceFormat: 'csv',
        status: ImportStatus.UPLOADING,
      };

      mockPrismaClient.curriculumImport.create.mockResolvedValue(mockImport);

      const result = await service.startImport(1, 3, 'Math', 'csv');

      expect(result).toBe('import-123');
      expect(mockPrismaClient.curriculumImport.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          grade: 3,
          subject: 'Math',
          sourceFormat: 'csv',
          sourceFile: undefined,
          status: ImportStatus.UPLOADING,
          metadata: {},
        },
      });
    });

    it('should handle database errors during import creation', async () => {
      mockPrismaClient.curriculumImport.create.mockRejectedValue(
        new Error('Database connection failed'),
      );

      await expect(service.startImport(1, 3, 'Math', 'csv')).rejects.toThrow(
        'Failed to start import session',
      );
    });
  });

  describe('getImportHistory', () => {
    it('should return import history for user', async () => {
      const mockImports = [
        {
          id: 'import-1',
          userId: 1,
          subject: 'Math',
          grade: 3,
          status: ImportStatus.COMPLETED,
          createdAt: new Date(),
          clusters: [],
          _count: { curriculumExpectations: 5 },
        },
        {
          id: 'import-2',
          userId: 1,
          subject: 'English',
          grade: 3,
          status: ImportStatus.PROCESSING,
          createdAt: new Date(),
          clusters: [],
          _count: { curriculumExpectations: 0 },
        },
      ];

      mockPrismaClient.curriculumImport.findMany.mockResolvedValue(mockImports);

      const result = await service.getImportHistory(1);

      expect(result).toHaveLength(2);
      expect(mockPrismaClient.curriculumImport.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
        take: 20,
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

    it('should return empty array when no imports found', async () => {
      mockPrismaClient.curriculumImport.findMany.mockResolvedValue([]);

      const result = await service.getImportHistory(1);

      expect(result).toHaveLength(0);
    });
  });

  describe('cancelImport', () => {
    it('should cancel import session', async () => {
      mockPrismaClient.curriculumImport.update.mockResolvedValue({} as any);

      const result = await service.cancelImport('import-123');

      expect(result).toBe(true);
      expect(mockPrismaClient.curriculumImport.update).toHaveBeenCalledWith({
        where: { id: 'import-123' },
        data: { status: ImportStatus.CANCELLED },
      });
    });

    it('should handle cancellation errors', async () => {
      mockPrismaClient.curriculumImport.update.mockRejectedValue(new Error('Not found'));

      const result = await service.cancelImport('import-123');

      expect(result).toBe(false);
    });
  });
});
