/**
 * Embedding Service
 * Handles text embeddings for semantic search and similarity comparisons
 */

import { openai } from './llmService.js';
import logger from '../logger.js';

export interface EmbeddingResult {
  outcomeId: string;
  embedding: number[];
  model: string;
}

export interface SimilarityResult {
  outcomeId: string;
  similarity: number;
  description?: string;
}

export const embeddingService = {
  /**
   * Generate an embedding for a given text
   */
  async generateEmbedding(text: string, outcomeId: string): Promise<EmbeddingResult> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return {
        outcomeId,
        embedding: response.data[0].embedding,
        model: 'text-embedding-3-small',
      };
    } catch (error) {
      logger.error('Failed to generate embedding:', error);
      throw error;
    }
  },

  /**
   * Generate embeddings for multiple texts
   */
  async generateBatchEmbeddings(texts: string[], outcomeIds: string[]): Promise<EmbeddingResult[]> {
    try {
      const results: EmbeddingResult[] = [];
      
      for (let i = 0; i < texts.length; i++) {
        const result = await this.generateEmbedding(texts[i], outcomeIds[i]);
        results.push(result);
      }

      return results;
    } catch (error) {
      logger.error('Failed to generate batch embeddings:', error);
      throw error;
    }
  },

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  },

  /**
   * Alias for calculateSimilarity for backward compatibility
   */
  cosineSimilarity(embedding1: number[], embedding2: number[]): number {
    return this.calculateSimilarity(embedding1, embedding2);
  },

  /**
   * Find similar outcomes based on text query
   */
  async searchOutcomesByText(queryText: string, limit: number = 10): Promise<SimilarityResult[]> {
    try {
      // This would typically search a vector database
      // For now, return empty results
      logger.info(`Searching for outcomes similar to: "${queryText}"`);
      return [];
    } catch (error) {
      logger.error('Failed to search outcomes by text:', error);
      throw error;
    }
  },

  /**
   * Find similar outcomes based on embedding
   */
  async findSimilarOutcomes(embedding: number[], limit: number = 10): Promise<SimilarityResult[]> {
    try {
      // This would typically search a vector database
      // For now, return empty results
      logger.info(`Finding similar outcomes for embedding of length ${embedding.length}`);
      return [];
    } catch (error) {
      logger.error('Failed to find similar outcomes:', error);
      throw error;
    }
  },

  /**
   * Get or create outcome embedding
   */
  async getOrCreateOutcomeEmbedding(outcomeId: string, text: string): Promise<EmbeddingResult> {
    try {
      // This would typically check if embedding exists first
      // For now, always generate new embedding
      return await this.generateEmbedding(text, outcomeId);
    } catch (error) {
      logger.error('Failed to get or create outcome embedding:', error);
      throw error;
    }
  },

  /**
   * Generate missing embeddings for outcomes
   */
  async generateMissingEmbeddings(): Promise<number> {
    try {
      // This would typically check database for missing embeddings
      // For now, return 0 as no embeddings were generated
      logger.info('Checking for missing embeddings...');
      return 0;
    } catch (error) {
      logger.error('Failed to generate missing embeddings:', error);
      throw error;
    }
  },

  /**
   * Check if embedding service is available
   */
  isEmbeddingServiceAvailable(): boolean {
    return process.env.OPENAI_API_KEY !== undefined;
  },
};