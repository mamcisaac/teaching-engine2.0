import { jest } from '@jest/globals';

export class EmbeddingService {
  generateEmbedding = jest.fn();
  generateBatchEmbeddings = jest.fn();
  findSimilarExpectations = jest.fn();
  findSimilarOutcomes = jest.fn();
  calculateSimilarity = jest.fn();
  getEmbedding = jest.fn();
  cleanupOldEmbeddings = jest.fn();
}

export const embeddingService = new EmbeddingService();
