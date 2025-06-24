import { openai } from './llmService';
import BaseService from './base/BaseService';

export interface EmbeddingResult {
  expectationId: string;
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
   * Check if embedding service is available
   */
  isEmbeddingServiceAvailable(): boolean {
    return !!openai;
  }

  /**
   * Generate embedding for a single curriculum expectation
   */
  async generateEmbedding(expectationId: string, text: string): Promise<EmbeddingResult | null> {
    if (!openai) {
      this.logger.warn('OpenAI API key not configured, skipping embedding generation');
      return null;
    }

    try {
      // Check if embedding already exists
      const existing = await this.prisma.curriculumExpectationEmbedding.findUnique({
        where: { expectationId },
      });

      if (existing) {
        this.logger.debug({ expectationId }, 'Embedding already exists for expectation');
        return {
          expectationId,
          embedding: existing.embedding as number[],
          model: existing.model,
        };
      }

      const embedding = await this.generateEmbeddingVector(text);
      if (!embedding) return null;

      // Store in database
      await this.prisma.curriculumExpectationEmbedding.create({
        data: {
          expectationId,
          embedding,
          model: this.model,
        },
      });

      this.logger.info(
        { expectationId, model: this.model },
        'Generated and stored embedding for expectation',
      );

      return {
        expectationId,
        embedding,
        model: this.model,
      };
    } catch (error) {
      this.logger.error({ error, expectationId }, 'Failed to generate embedding for expectation');
      return null;
    }
  }

  /**
   * Generate embeddings for multiple expectations in batches
   */
  async generateBatchEmbeddings(
    expectations: { id: string; text: string }[],
  ): Promise<EmbeddingResult[]> {
    if (!openai) {
      this.logger.warn('OpenAI API key not configured, skipping batch embedding generation');
      return [];
    }

    const results: EmbeddingResult[] = [];
    const batches = this.createEmbeddingBatches(expectations, this.batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      this.logger.info(
        { batchIndex: i + 1, totalBatches: batches.length, batchSize: batch.length },
        'Processing embedding batch',
      );

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
   * Get embedding for an expectation (from cache or generate new)
   */
  async getEmbedding(expectationId: string): Promise<number[] | null> {
    try {
      const embedding = await this.prisma.curriculumExpectationEmbedding.findUnique({
        where: { expectationId },
      });

      return embedding ? (embedding.embedding as number[]) : null;
    } catch (error) {
      this.logger.error({ error, expectationId }, 'Failed to get embedding for expectation');
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
   * Find similar expectations based on embedding similarity
   */
  async findSimilarExpectations(
    expectationId: string,
    threshold: number = 0.8,
    limit: number = 10,
  ): Promise<
    {
      expectationId: string;
      similarity: number;
      expectation?: {
        id: string;
        code: string;
        description: string;
        subject: string;
        grade: number;
      };
    }[]
  > {
    try {
      const targetEmbedding = await this.getEmbedding(expectationId);
      if (!targetEmbedding) return [];

      // Get all embeddings with expectation data (optimized for current dataset size)
      const allEmbeddings = await this.prisma.curriculumExpectationEmbedding.findMany({
        where: {
          expectationId: { not: expectationId },
        },
        include: {
          expectation: true,
        },
      });

      const similarities = allEmbeddings
        .map((emb) => ({
          expectationId: emb.expectationId,
          similarity: this.calculateSimilarity(targetEmbedding, emb.embedding as number[]),
          expectation: {
            id: emb.expectation.id,
            code: emb.expectation.code,
            description: emb.expectation.description,
            subject: emb.expectation.subject,
            grade: emb.expectation.grade,
          },
        }))
        .filter((item) => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return similarities;
    } catch (error) {
      this.logger.error({ error, expectationId }, 'Failed to find similar expectations');
      return [];
    }
  }

  /**
   * Generate embeddings for all expectations missing them
   */
  async generateMissingEmbeddings(forceRegenerate: boolean = false): Promise<number> {
    try {
      if (!openai) {
        this.logger.warn('OpenAI API key not configured');
        return 0;
      }

      let expectations;
      if (forceRegenerate) {
        // Get all expectations
        expectations = await this.prisma.curriculumExpectation.findMany({
          select: { id: true, code: true, description: true },
        });
      } else {
        // Get expectations without embeddings
        expectations = await this.prisma.curriculumExpectation.findMany({
          where: {
            embedding: null,
          },
          select: { id: true, code: true, description: true },
        });
      }

      if (expectations.length === 0) {
        this.logger.info('No expectations need embeddings');
        return 0;
      }

      this.logger.info({ count: expectations.length }, 'Found expectations needing embeddings');

      // Prepare data for batch processing
      const expectationData = expectations.map((expectation) => ({
        id: expectation.id,
        text: `${expectation.code}: ${expectation.description}`,
      }));

      const results = await this.generateBatchEmbeddings(expectationData);

      this.logger.info(
        { total: expectations.length, generated: results.length },
        'Finished generating embeddings',
      );

      return results.length;
    } catch (error) {
      this.logger.error({ error }, 'Failed to generate missing embeddings');
      return 0;
    }
  }

  /**
   * Search expectations by text similarity
   */
  async searchExpectationsByText(
    searchText: string,
    limit: number = 20,
    threshold: number = 0.7,
  ): Promise<
    {
      expectationId: string;
      similarity: number;
      expectation: {
        id: string;
        code: string;
        description: string;
        subject: string;
        grade: number;
      };
    }[]
  > {
    try {
      if (!openai) {
        this.logger.warn('OpenAI API key not configured');
        return [];
      }

      // Generate embedding for search text
      const searchEmbedding = await this.generateEmbeddingVector(searchText);
      if (!searchEmbedding) return [];

      // Get all embeddings with expectation data
      const allEmbeddings = await this.prisma.curriculumExpectationEmbedding.findMany({
        include: {
          expectation: true,
        },
      });

      const similarities = allEmbeddings
        .map((emb) => ({
          expectationId: emb.expectationId,
          similarity: this.calculateSimilarity(searchEmbedding, emb.embedding as number[]),
          expectation: {
            id: emb.expectation.id,
            code: emb.expectation.code,
            description: emb.expectation.description,
            subject: emb.expectation.subject,
            grade: emb.expectation.grade,
          },
        }))
        .filter((item) => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      return similarities;
    } catch (error) {
      this.logger.error({ error, searchText }, 'Failed to search expectations by text');
      return [];
    }
  }

  /**
   * Get or create embedding for a specific expectation
   */
  async getOrCreateExpectationEmbedding(expectationId: string): Promise<EmbeddingResult | null> {
    try {
      // Check if embedding exists
      const existing = await this.prisma.curriculumExpectationEmbedding.findUnique({
        where: { expectationId },
      });

      if (existing) {
        return {
          expectationId,
          embedding: existing.embedding as number[],
          model: existing.model,
        };
      }

      // Get expectation details
      const expectation = await this.prisma.curriculumExpectation.findUnique({
        where: { id: expectationId },
        select: { code: true, description: true },
      });

      if (!expectation) {
        throw new Error(`Expectation ${expectationId} not found`);
      }

      // Generate embedding
      const text = `${expectation.code}: ${expectation.description}`;
      return await this.generateEmbedding(expectationId, text);
    } catch (error) {
      this.logger.error({ error, expectationId }, 'Failed to get or create expectation embedding');
      return null;
    }
  }

  /**
   * Cleanup old embeddings for a specific model
   */
  async cleanupOldEmbeddings(model: string): Promise<number> {
    try {
      const result = await this.prisma.curriculumExpectationEmbedding.deleteMany({
        where: { model: { not: model } },
      });

      this.logger.info(
        { deletedCount: result.count, currentModel: model },
        'Cleaned up old embeddings',
      );

      return result.count;
    } catch (error) {
      this.logger.error({ error, model }, 'Failed to cleanup old embeddings');
      return 0;
    }
  }

  // Private helper methods

  async generateEmbeddingVector(text: string): Promise<number[] | null> {
    if (!openai) return null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await openai.embeddings.create({
          model: this.model,
          input: text,
          encoding_format: 'float',
        });

        if (response.usage?.total_tokens) {
          this.logger.debug({ tokens: response.usage.total_tokens }, 'Embedding tokens used');
        }

        return response.data[0].embedding;
      } catch (error: unknown) {
        this.logger.warn(
          {
            error: error instanceof Error ? error.message : String(error),
            attempt,
            maxRetries: this.maxRetries,
          },
          'Embedding generation attempt failed',
        );

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
    const existingEmbeddings = await this.prisma.curriculumExpectationEmbedding.findMany({
      where: {
        expectationId: { in: batch.map((item) => item.id) },
      },
    });

    const existingIds = new Set(existingEmbeddings.map((emb) => emb.expectationId));
    const newItems = batch.filter((item) => !existingIds.has(item.id));

    // Add existing embeddings to results
    for (const existing of existingEmbeddings) {
      results.push({
        expectationId: existing.expectationId,
        embedding: existing.embedding as number[],
        model: existing.model,
      });
    }

    if (newItems.length === 0) {
      return results;
    }

    // Generate embeddings for new items
    try {
      const response = await openai!.embeddings.create({
        model: this.model,
        input: newItems.map((item) => item.text),
        encoding_format: 'float',
      });

      // Store new embeddings
      const embeddings = response.data.map((embedding, index) => ({
        expectationId: newItems[index].id,
        embedding: embedding.embedding,
        model: this.model,
      }));

      await this.prisma.curriculumExpectationEmbedding.createMany({
        data: embeddings,
      });

      results.push(...embeddings);

      this.logger.info(
        { newEmbeddings: newItems.length, totalTokens: response.usage?.total_tokens },
        'Generated batch embeddings',
      );
    } catch (error) {
      this.logger.error(
        { error, batchSize: newItems.length },
        'Failed to generate batch embeddings',
      );
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
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();
