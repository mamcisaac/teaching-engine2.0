/**
 * Mock Validation Test for Embedding Service
 * This test validates that our mock infrastructure is working correctly
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';

// Import unified mock setup FIRST
import {
  getMocks,
  setupMocks,
  resetMocks,
  mockOpenAI,
  mockPrismaClient as mockPrisma,
  validateMockIntegrity,
} from '../setup/unified-mock-setup.js';

describe('Mock Infrastructure Validation', () => {
  beforeEach(() => {
    setupMocks();

    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as any);
  });

  afterEach(() => {
    resetMocks();
  });

  describe('OpenAI Mock', () => {
    it('should have properly mocked OpenAI instance', () => {
      expect(mockOpenAI).toBeDefined();
      expect(mockOpenAI.embeddings).toBeDefined();
      expect(mockOpenAI.embeddings.create).toBeDefined();
      expect(jest.isMockFunction(mockOpenAI.embeddings.create)).toBe(true);
    });

    it('should return mock responses from OpenAI', async () => {
      const mockResponse = {
        data: [{ embedding: [0.1, 0.2, 0.3] }],
        usage: { total_tokens: 10 },
      };

      mockOpenAI.embeddings.create.mockResolvedValueOnce(mockResponse);

      const result = await mockOpenAI.embeddings.create({
        model: 'text-embedding-3-small',
        input: 'test text',
        encoding_format: 'float',
      });

      expect(result).toEqual(mockResponse);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-3-small',
        input: 'test text',
        encoding_format: 'float',
      });
    });
  });

  describe('Database Mock', () => {
    it('should have properly mocked Prisma client', () => {
      expect(mockPrisma).toBeDefined();
      expect(mockPrisma.curriculumExpectationEmbedding).toBeDefined();
      expect(jest.isMockFunction(mockPrisma.curriculumExpectationEmbedding.findUnique)).toBe(true);
    });

    it('should return mock responses from Prisma', async () => {
      const mockEmbedding = {
        expectationId: 'test-id',
        embedding: [0.1, 0.2, 0.3],
        model: 'text-embedding-3-small',
      };

      mockPrisma.curriculumExpectationEmbedding.findUnique.mockResolvedValueOnce(mockEmbedding);

      const result = await mockPrisma.curriculumExpectationEmbedding.findUnique({
        where: { expectationId: 'test-id' },
      });

      expect(result).toEqual(mockEmbedding);
    });
  });

  describe('Mock Integrity', () => {
    it('should pass mock integrity validation', () => {
      expect(() => validateMockIntegrity()).not.toThrow();
    });
  });

  describe('Module Import Testing', () => {
    it('should properly mock OpenAI module when imported', async () => {
      // Dynamic import to test module mocking
      const OpenAI = (await import('openai')).default;
      const instance = new OpenAI({ apiKey: 'test' });

      expect(jest.isMockFunction(instance.embeddings.create)).toBe(true);
    });

    it('should properly mock database module when imported', async () => {
      const { prisma } = await import('@teaching-engine/database');

      expect(jest.isMockFunction(prisma.curriculumExpectationEmbedding.findUnique)).toBe(true);
    });
  });
});
