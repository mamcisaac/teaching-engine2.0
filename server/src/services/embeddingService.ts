import { openai } from './llmService';
import BaseService from './base/BaseService';

export interface EmbeddingResult {
  outcomeId: string;
  embedding: number[];
  model: string;
}

export class EmbeddingService extends BaseService {
  private readonly model = 'text-embedding-3-small';
  private readonly batchSize = 100; // OpenAI API batch limit
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  constructor() {
    super('EmbeddingService');
  }

  /**
   * Generate embedding for a single outcome
   */
  async generateEmbedding(outcomeId: string, text: string): Promise<EmbeddingResult | null> {
    if (!openai) {
      this.logger.warn('OpenAI API key not configured, skipping embedding generation');
      return null;
    }

    try {
      // Check if embedding already exists
      const existing = await this.prisma.outcomeEmbedding.findUnique({
        where: { outcomeId }
      });

      if (existing) {
        this.logger.debug({ outcomeId }, 'Embedding already exists for outcome');
        return {
          outcomeId,
          embedding: existing.embedding as number[],
          model: existing.model
        };
      }

      const embedding = await this.generateEmbeddingVector(text);
      if (!embedding) return null;

      // Store in database
      await this.prisma.outcomeEmbedding.create({
        data: {
          outcomeId,
          embedding,
          model: this.model
        }
      });

      this.logger.info({ outcomeId, model: this.model }, 'Generated and stored embedding for outcome');

      return {
        outcomeId,
        embedding,
        model: this.model
      };
    } catch (error) {
      this.logger.error({ error, outcomeId }, 'Failed to generate embedding for outcome');
      return null;
    }
  }

  /**
   * Generate embeddings for multiple outcomes in batches
   */
  async generateBatchEmbeddings(outcomes: { id: string; text: string }[]): Promise<EmbeddingResult[]> {
    if (!openai) {
      this.logger.warn('OpenAI API key not configured, skipping batch embedding generation');
      return [];
    }

    const results: EmbeddingResult[] = [];
    const batches = this.createEmbeddingBatches(outcomes, this.batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.info({ batchIndex: i + 1, totalBatches: batches.length, batchSize: batch.length }, 
        'Processing embedding batch');

      try {
        const batchResults = await this.processBatch(batch);
        results.push(...batchResults);

        // Add delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await this.sleepEmbed(this.retryDelay);
        }
      } catch (error) {
        this.logger.error({ error, batchIndex: i + 1 }, 'Failed to process embedding batch');
      }
    }

    return results;
  }

  /**
   * Get embedding for an outcome (from cache or generate new)
   */
  async getEmbedding(outcomeId: string): Promise<number[] | null> {
    try {
      const embedding = await this.prisma.outcomeEmbedding.findUnique({
        where: { outcomeId }
      });

      return embedding ? (embedding.embedding as number[]) : null;
    } catch (error) {
      this.logger.error({ error, outcomeId }, 'Failed to get embedding for outcome');
      return null;
    }
  }

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

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Find similar outcomes based on embedding similarity
   */
  async findSimilarOutcomes(outcomeId: string, threshold: number = 0.8, limit: number = 10): Promise<{
    outcomeId: string;
    similarity: number;
  }[]> {
    try {
      const targetEmbedding = await this.getEmbedding(outcomeId);
      if (!targetEmbedding) return [];

      // Get all embeddings (for small datasets)
      // TODO: Implement vector database for larger datasets
      const allEmbeddings = await this.prisma.outcomeEmbedding.findMany({
        where: {
          outcomeId: { not: outcomeId }
        }
      });

      const similarities = allEmbeddings
        .map(emb => ({
          outcomeId: emb.outcomeId,
          similarity: this.calculateSimilarity(targetEmbedding, emb.embedding as number[])
        }))
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return similarities;
    } catch (error) {
      this.logger.error({ error, outcomeId }, 'Failed to find similar outcomes');
      return [];
    }
  }

  /**
   * Cleanup old embeddings for a specific model
   */
  async cleanupOldEmbeddings(model: string): Promise<number> {
    try {
      const result = await this.prisma.outcomeEmbedding.deleteMany({
        where: { model: { not: model } }
      });

      this.logger.info({ deletedCount: result.count, currentModel: model }, 
        'Cleaned up old embeddings');

      return result.count;
    } catch (error) {
      this.logger.error({ error, model }, 'Failed to cleanup old embeddings');
      return 0;
    }
  }

  // Private helper methods

  private async generateEmbeddingVector(text: string): Promise<number[] | null> {
    if (!openai) return null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await openai.embeddings.create({
          model: this.model,
          input: text,
          encoding_format: 'float'
        });

        if (response.usage?.total_tokens) {
          this.logger.debug({ tokens: response.usage.total_tokens }, 'Embedding tokens used');
        }

        return response.data[0].embedding;
      } catch (error: unknown) {
        this.logger.warn({ error: error instanceof Error ? error.message : String(error), attempt, maxRetries: this.maxRetries }, 
          'Embedding generation attempt failed');

        if (attempt === this.maxRetries) {
          this.logger.error({ error }, 'All embedding generation attempts failed');
          return null;
        }

        // Exponential backoff
        await this.sleepEmbed(this.retryDelay * Math.pow(2, attempt - 1));
      }
    }

    return null;
  }

  private async processBatch(batch: { id: string; text: string }[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    // Check for existing embeddings
    const existingEmbeddings = await this.prisma.outcomeEmbedding.findMany({
      where: {
        outcomeId: { in: batch.map(item => item.id) }
      }
    });

    const existingIds = new Set(existingEmbeddings.map(emb => emb.outcomeId));
    const newItems = batch.filter(item => !existingIds.has(item.id));

    // Add existing embeddings to results
    for (const existing of existingEmbeddings) {
      results.push({
        outcomeId: existing.outcomeId,
        embedding: existing.embedding as number[],
        model: existing.model
      });
    }

    if (newItems.length === 0) {
      return results;
    }

    // Generate embeddings for new items
    try {
      const response = await openai!.embeddings.create({
        model: this.model,
        input: newItems.map(item => item.text),
        encoding_format: 'float'
      });

      // Store new embeddings
      const embeddings = response.data.map((embedding, index) => ({
        outcomeId: newItems[index].id,
        embedding: embedding.embedding,
        model: this.model
      }));

      await this.prisma.outcomeEmbedding.createMany({
        data: embeddings
      });

      results.push(...embeddings);

      this.logger.info({ newEmbeddings: newItems.length, totalTokens: response.usage?.total_tokens }, 
        'Generated batch embeddings');

    } catch (error) {
      this.logger.error({ error, batchSize: newItems.length }, 'Failed to generate batch embeddings');
    }

    return results;
  }

  private createEmbeddingBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private sleepEmbed(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();