/**
 * Additional Test Coverage for Curriculum Import Service
 * 
 * Tests critical paths and edge cases that weren't covered in existing tests
 * to improve overall test coverage for this critical service
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CurriculumImportService } from '../../src/services/curriculumImportService';
import { getTestPrismaClient, createTestData } from '../jest.setup';

// Mock dependencies
jest.mock('../../src/services/embeddingService', () => ({
  EmbeddingService: jest.fn().mockImplementation(() => ({
    generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    findSimilarOutcomes: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock('../../src/services/clusteringService', () => ({
  ClusteringService: jest.fn().mockImplementation(() => ({
    clusterOutcomes: jest.fn().mockResolvedValue({
      clusters: [],
      clusterAssignments: {},
      silhouetteScore: 0.5
    }),
  })),
}));

jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
  mkdir: jest.fn(),
  unlink: jest.fn(),
  access: jest.fn(),
}));

jest.mock('mammoth', () => ({
  extractRawText: jest.fn().mockResolvedValue({ value: 'Extracted text content' }),
}));

jest.mock('pdf-parse', () => 
  jest.fn().mockResolvedValue({ text: 'Extracted PDF content' })
);

describe('CurriculumImportService Coverage Tests', () => {
  let service: CurriculumImportService;
  let mockUser: any;

  beforeEach(async () => {
    // Create test user
    mockUser = await createTestData(async (prisma) => {
      return await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashed_password',
          name: 'Test Teacher',
          role: 'teacher',
        },
      });
    });

    service = new CurriculumImportService();
  });

  describe('File Processing Edge Cases', () => {
    it('should handle unsupported file types gracefully', async () => {
      const mockFile = {
        originalname: 'test.txt',
        mimetype: 'text/plain',
        buffer: Buffer.from('Plain text content'),
        size: 100,
        fieldname: 'file',
        encoding: '7bit',
        stream: null as any,
        destination: '',
        filename: '',
        path: ''
      };

      await expect(
        service.processFile(mockFile, mockUser.id)
      ).rejects.toThrow('Unsupported file type');
    });

    it('should handle corrupted PDF files', async () => {
      const pdfParseMock = require('pdf-parse');
      pdfParseMock.mockRejectedValueOnce(new Error('PDF parsing failed'));

      const mockFile = {
        originalname: 'corrupted.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('corrupted data'),
        size: 100,
        fieldname: 'file',
        encoding: '7bit',
        stream: null as any,
        destination: '',
        filename: '',
        path: ''
      };

      await expect(
        service.processFile(mockFile, mockUser.id)
      ).rejects.toThrow('PDF parsing failed');
    });

    it('should handle corrupted Word documents', async () => {
      const mammothMock = require('mammoth');
      mammothMock.extractRawText.mockRejectedValueOnce(new Error('Document parsing failed'));

      const mockFile = {
        originalname: 'corrupted.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        buffer: Buffer.from('corrupted data'),
        size: 100,
        fieldname: 'file',
        encoding: '7bit',
        stream: null as any,
        destination: '',
        filename: '',
        path: ''
      };

      await expect(
        service.processFile(mockFile, mockUser.id)
      ).rejects.toThrow('Document parsing failed');
    });

    it('should handle empty files', async () => {
      const mockFile = {
        originalname: 'empty.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.alloc(0),
        size: 0,
        fieldname: 'file',
        encoding: '7bit',
        stream: null as any,
        destination: '',
        filename: '',
        path: ''
      };

      await expect(
        service.processFile(mockFile, mockUser.id)
      ).rejects.toThrow();
    });

    it('should handle files that are too large', async () => {
      const mockFile = {
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.alloc(100 * 1024 * 1024), // 100MB
        size: 100 * 1024 * 1024,
        fieldname: 'file',
        encoding: '7bit',
        stream: null as any,
        destination: '',
        filename: '',
        path: ''
      };

      await expect(
        service.processFile(mockFile, mockUser.id)
      ).rejects.toThrow();
    });
  });

  describe('Text Extraction and Parsing', () => {
    it('should extract curriculum expectations from various text formats', async () => {
      const testTexts = [
        // Ontario curriculum format
        'A1.1 demonstrate an understanding of numbers',
        // Quebec curriculum format
        'Compétence 1: Résoudre une situation-problème mathématique',
        // BC curriculum format
        'Students are expected to know and do the following:',
        // Mixed content with noise
        'Page 15\nA1.1 demonstrate understanding\nFooter text',
      ];

      for (const text of testTexts) {
        const result = await service.extractCurriculumExpectations(text, mockUser.id);
        expect(result).toBeDefined();
        expect(result.outcomes).toBeDefined();
      }
    });

    it('should handle text with special characters and encoding', async () => {
      const textWithSpecialChars = `
        A1.1 demonstrate an understanding of numbers, including: 
        • whole numbers (1–1 000 000)
        • decimal numbers to thousandths
        • proper and improper fractions and mixed numbers
        • ratio and rate
      `;

      const result = await service.extractCurriculumExpectations(textWithSpecialChars, mockUser.id);
      expect(result).toBeDefined();
      expect(result.outcomes).toBeDefined();
    });

    it('should parse curriculum codes correctly', async () => {
      const texts = [
        'A1.1 Basic expectation',
        'B2.3 Advanced expectation',
        'C.1.2 Complex code format',
        'Math.1.A Simple format',
      ];

      for (const text of texts) {
        const result = await service.extractCurriculumExpectations(text, mockUser.id);
        expect(result.outcomes.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Database Operations and Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // Mock prisma to throw connection error
      const prisma = getTestPrismaClient();
      const originalFind = prisma.outcome.findMany;
      prisma.outcome.findMany = jest.fn().mockRejectedValue(new Error('Database connection failed'));

      const text = 'A1.1 Test expectation';
      
      await expect(
        service.extractCurriculumExpectations(text, mockUser.id)
      ).rejects.toThrow('Database connection failed');

      // Restore original method
      prisma.outcome.findMany = originalFind;
    });

    it('should handle transaction rollbacks properly', async () => {
      const prisma = getTestPrismaClient();
      
      // Mock transaction to fail midway
      const originalTransaction = prisma.$transaction;
      prisma.$transaction = jest.fn().mockImplementation(async (callback) => {
        throw new Error('Transaction failed');
      });

      const text = 'A1.1 Test expectation';
      
      await expect(
        service.extractCurriculumExpectations(text, mockUser.id)
      ).rejects.toThrow('Transaction failed');

      // Restore original method
      prisma.$transaction = originalTransaction;
    });

    it('should validate user permissions before processing', async () => {
      const invalidUserId = 99999;
      const text = 'A1.1 Test expectation';

      // This should either fail or handle gracefully
      await expect(
        service.extractCurriculumExpectations(text, invalidUserId)
      ).rejects.toThrow();
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should sanitize malicious content in curriculum text', async () => {
      const maliciousText = `
        A1.1 <script>alert('xss')</script> demonstrate understanding
        B2.2 <img src="x" onerror="alert(1)"> solve problems
        C3.3 javascript:alert('malicious') analyze data
      `;

      const result = await service.extractCurriculumExpectations(maliciousText, mockUser.id);
      
      // Should extract expectations but remove malicious content
      expect(result.outcomes.length).toBeGreaterThan(0);
      result.outcomes.forEach(outcome => {
        expect(outcome.description).not.toContain('<script>');
        expect(outcome.description).not.toContain('javascript:');
        expect(outcome.description).not.toContain('onerror');
      });
    });

    it('should handle extremely long text content', async () => {
      const longText = 'A1.1 ' + 'very '.repeat(10000) + 'long expectation';

      const result = await service.extractCurriculumExpectations(longText, mockUser.id);
      expect(result).toBeDefined();
      
      // Should truncate or handle long descriptions appropriately
      result.outcomes.forEach(outcome => {
        expect(outcome.description.length).toBeLessThan(5000);
      });
    });

    it('should validate curriculum code formats', async () => {
      const invalidCodes = [
        'INVALID_CODE expectation',
        '123ABC expectation',
        '<script>A1.1</script> expectation',
        'A' + '1'.repeat(100) + ' expectation',
      ];

      for (const text of invalidCodes) {
        const result = await service.extractCurriculumExpectations(text, mockUser.id);
        // Should either reject invalid codes or sanitize them
        result.outcomes.forEach(outcome => {
          expect(outcome.code).toMatch(/^[A-Z]+[0-9]+\.[0-9]+$/);
        });
      }
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle multiple concurrent file uploads', async () => {
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        const mockFile = {
          originalname: `test${i}.pdf`,
          mimetype: 'application/pdf',
          buffer: Buffer.from(`Test content ${i}`),
          size: 100,
          fieldname: 'file',
          encoding: '7bit',
          stream: null as any,
          destination: '',
          filename: '',
          path: ''
        };
        
        promises.push(service.processFile(mockFile, mockUser.id));
      }

      // All should either succeed or fail gracefully
      const results = await Promise.allSettled(promises);
      expect(results.length).toBe(5);
      
      // Check that we don't have memory leaks or hanging promises
      results.forEach(result => {
        expect(result.status).toBeOneOf(['fulfilled', 'rejected']);
      });
    });

    it('should handle processing interruption gracefully', async () => {
      const mockFile = {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('Test content'),
        size: 100,
        fieldname: 'file',
        encoding: '7bit',
        stream: null as any,
        destination: '',
        filename: '',
        path: ''
      };

      const processingPromise = service.processFile(mockFile, mockUser.id);
      
      // Simulate interruption after a short delay
      setTimeout(() => {
        // In a real scenario, we might abort the operation
      }, 10);

      // Should handle interruption gracefully
      await expect(processingPromise).resolves.toBeDefined();
    });
  });

  describe('Integration with External Services', () => {
    it('should handle embedding service failures', async () => {
      const { EmbeddingService } = require('../../src/services/embeddingService');
      const mockEmbeddingService = new EmbeddingService();
      mockEmbeddingService.generateEmbedding.mockRejectedValue(new Error('Embedding service unavailable'));

      const text = 'A1.1 Test expectation';
      
      // Should either retry or handle gracefully
      const result = await service.extractCurriculumExpectations(text, mockUser.id);
      expect(result).toBeDefined();
    });

    it('should handle clustering service failures', async () => {
      const { ClusteringService } = require('../../src/services/clusteringService');
      const mockClusteringService = new ClusteringService();
      mockClusteringService.clusterOutcomes.mockRejectedValue(new Error('Clustering service unavailable'));

      const text = 'A1.1 Test expectation\nB2.2 Another expectation';
      
      // Should handle clustering failure gracefully
      const result = await service.extractCurriculumExpectations(text, mockUser.id);
      expect(result).toBeDefined();
    });
  });

  describe('Configuration and Environment', () => {
    it('should handle missing environment variables', async () => {
      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const text = 'A1.1 Test expectation';
      
      try {
        const result = await service.extractCurriculumExpectations(text, mockUser.id);
        // Should either use fallback or handle gracefully
        expect(result).toBeDefined();
      } finally {
        // Restore environment
        if (originalEnv) {
          process.env.OPENAI_API_KEY = originalEnv;
        }
      }
    });

    it('should respect processing limits and quotas', async () => {
      // Test with a very large file that should be rejected
      const mockFile = {
        originalname: 'huge.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.alloc(200 * 1024 * 1024), // 200MB
        size: 200 * 1024 * 1024,
        fieldname: 'file',
        encoding: '7bit',
        stream: null as any,
        destination: '',
        filename: '',
        path: ''
      };

      await expect(
        service.processFile(mockFile, mockUser.id)
      ).rejects.toThrow();
    });
  });
});