import { embeddingService } from './embeddingService';
import { openai } from './llmService';
import BaseService from './base/BaseService';

export interface ClusterResult {
  id: string;
  name: string;
  type: 'theme' | 'skill' | 'concept';
  expectationIds: string[];
  confidence: number;
  suggestedTheme?: string;
}

export interface ClusteringOptions {
  minClusterSize: number;
  maxClusters: number;
  similarityThreshold: number;
  useAISuggestions: boolean;
}

export class ClusteringService extends BaseService {
  private readonly defaultOptions: ClusteringOptions = {
    minClusterSize: 2,
    maxClusters: 20,
    similarityThreshold: 0.75,
    useAISuggestions: true,
  };

  constructor() {
    super('ClusteringService');
  }

  /**
   * Cluster curriculum expectations for a specific import using embedding-based similarity
   */
  async clusterExpectations(
    importId: string,
    options: Partial<ClusteringOptions> = {},
  ): Promise<ClusterResult[]> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Get all expectations for this import with their embeddings
      const expectations = await this.getExpectationsWithEmbeddings(importId);

      if (expectations.length < opts.minClusterSize) {
        this.logger.info(
          { importId, expectationCount: expectations.length },
          'Not enough expectations to create meaningful clusters',
        );
        return [];
      }

      this.logger.info(
        { importId, expectationCount: expectations.length, options: opts },
        'Starting expectation clustering',
      );

      // Perform hierarchical clustering
      const clusters = await this.performHierarchicalClustering(expectations, opts);

      // Generate AI suggestions for cluster themes if enabled
      if (opts.useAISuggestions) {
        await this.generateClusterThemes(clusters, importId);
      }

      // Save clusters to database
      const savedClusters = await this.saveClusters(importId, clusters);

      this.logger.info(
        { importId, clusterCount: savedClusters.length },
        'Completed expectation clustering',
      );

      return savedClusters;
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to cluster expectations');
      throw new Error(`Clustering failed: ${error.message}`);
    }
  }

  /**
   * Re-cluster expectations with different parameters
   */
  async reclusterExpectations(
    importId: string,
    options: Partial<ClusteringOptions> = {},
  ): Promise<ClusterResult[]> {
    try {
      // Delete existing clusters for this import
      await this.prisma.expectationCluster.deleteMany({
        where: { importId },
      });

      this.logger.info({ importId }, 'Deleted existing clusters for re-clustering');

      // Perform new clustering
      return await this.clusterExpectations(importId, options);
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to re-cluster expectations');
      throw error;
    }
  }

  /**
   * Get clusters for a specific import
   */
  async getClusters(importId: string): Promise<ClusterResult[]> {
    try {
      const clusters = await this.prisma.expectationCluster.findMany({
        where: { importId },
        orderBy: { confidence: 'desc' },
      });

      return clusters.map((cluster) => ({
        id: cluster.id,
        name: cluster.clusterName,
        type: cluster.clusterType as 'theme' | 'skill' | 'concept',
        expectationIds: cluster.expectationIds as string[],
        confidence: cluster.confidence,
        suggestedTheme: cluster.suggestedTheme || undefined,
      }));
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to get clusters');
      return [];
    }
  }

  /**
   * Suggest similar expectations based on a given expectation
   */
  async suggestSimilarExpectations(
    expectationId: string,
    threshold: number = 0.8,
    limit: number = 10,
  ): Promise<
    {
      expectationId: string;
      code: string;
      description: string;
      similarity: number;
    }[]
  > {
    try {
      const similarities = await embeddingService.findSimilarExpectations(expectationId, threshold, limit);

      if (similarities.length === 0) return [];

      const expectations = await this.prisma.curriculumExpectation.findMany({
        where: {
          id: { in: similarities.map((s) => s.expectationId) },
        },
        select: {
          id: true,
          code: true,
          description: true,
        },
      });

      return similarities
        .map((sim) => {
          const expectation = expectations.find((e) => e.id === sim.expectationId);
          return {
            expectationId: sim.expectationId,
            code: expectation?.code || 'Unknown',
            description: expectation?.description || 'Unknown',
            similarity: sim.similarity,
          };
        })
        .filter((item) => item.code !== 'Unknown');
    } catch (error) {
      this.logger.error({ error, expectationId }, 'Failed to suggest similar expectations');
      return [];
    }
  }

  /**
   * Analyze cluster quality and suggest improvements
   */
  async analyzeClusterQuality(importId: string): Promise<{
    totalClusters: number;
    averageConfidence: number;
    clustersWithLowConfidence: number;
    suggestions: string[];
  }> {
    try {
      const clusters = await this.getClusters(importId);

      if (clusters.length === 0) {
        return {
          totalClusters: 0,
          averageConfidence: 0,
          clustersWithLowConfidence: 0,
          suggestions: ['No clusters found. Consider running clustering first.'],
        };
      }

      const confidences = clusters.map((c) => c.confidence);
      const averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
      const clustersWithLowConfidence = clusters.filter((c) => c.confidence < 0.6).length;

      const suggestions: string[] = [];

      if (averageConfidence < 0.7) {
        suggestions.push('Consider adjusting similarity threshold for better clustering');
      }

      if (clustersWithLowConfidence > clusters.length * 0.3) {
        suggestions.push('Many clusters have low confidence - consider reducing max clusters');
      }

      const smallClusters = clusters.filter((c) => c.expectationIds.length < 3).length;
      if (smallClusters > clusters.length * 0.5) {
        suggestions.push('Many small clusters detected - consider increasing minimum cluster size');
      }

      return {
        totalClusters: clusters.length,
        averageConfidence,
        clustersWithLowConfidence,
        suggestions,
      };
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to analyze cluster quality');
      throw error;
    }
  }

  // Private helper methods

  private async getExpectationsWithEmbeddings(importId: string): Promise<
    {
      id: string;
      code: string;
      description: string;
      embedding: number[];
    }[]
  > {
    const expectations = await this.prisma.curriculumExpectation.findMany({
      where: { importId },
      include: {
        embedding: true,
      },
    });

    const expectationsWithEmbeddings = expectations
      .filter((expectation) => expectation.embedding)
      .map((expectation) => ({
        id: expectation.id,
        code: expectation.code,
        description: expectation.description,
        embedding: expectation.embedding!.embedding as number[],
      }));

    // Generate missing embeddings
    const missingEmbeddings = expectations.filter((expectation) => !expectation.embedding);
    if (missingEmbeddings.length > 0) {
      this.logger.info({ count: missingEmbeddings.length }, 'Generating missing embeddings');

      const embeddingData = missingEmbeddings.map((expectation) => ({
        id: expectation.id,
        text: `${expectation.code}: ${expectation.description}`,
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);

      // Re-fetch with new embeddings
      const updatedExpectations = await this.prisma.curriculumExpectation.findMany({
        where: { id: { in: missingEmbeddings.map((e) => e.id) } },
        include: { embedding: true },
      });

      for (const expectation of updatedExpectations) {
        if (expectation.embedding) {
          expectationsWithEmbeddings.push({
            id: expectation.id,
            code: expectation.code,
            description: expectation.description,
            embedding: expectation.embedding.embedding as number[],
          });
        }
      }
    }

    return expectationsWithEmbeddings;
  }

  private async performHierarchicalClustering(
    expectations: { id: string; code: string; description: string; embedding: number[] }[],
    options: ClusteringOptions,
  ): Promise<
    {
      name: string;
      type: 'theme' | 'skill' | 'concept';
      expectationIds: string[];
      confidence: number;
    }[]
  > {
    // Simple hierarchical clustering implementation
    const clusters: {
      name: string;
      type: 'theme' | 'skill' | 'concept';
      expectationIds: string[];
      confidence: number;
    }[] = [];

    const used = new Set<string>();
    const similarities: { [key: string]: { expectationId: string; similarity: number }[] } = {};

    // Calculate similarities for all expectations
    for (const expectation of expectations) {
      similarities[expectation.id] = [];
      for (const other of expectations) {
        if (expectation.id !== other.id) {
          const similarity = embeddingService.calculateSimilarity(
            expectation.embedding,
            other.embedding,
          );
          similarities[expectation.id].push({ expectationId: other.id, similarity });
        }
      }
      similarities[expectation.id].sort((a, b) => b.similarity - a.similarity);
    }

    // Form clusters greedily
    for (const expectation of expectations) {
      if (used.has(expectation.id) || clusters.length >= options.maxClusters) continue;

      const cluster = [expectation.id];
      used.add(expectation.id);

      // Find similar expectations to add to this cluster
      const similarExpectations = similarities[expectation.id]
        .filter((sim) => !used.has(sim.expectationId) && sim.similarity >= options.similarityThreshold)
        .slice(0, 10); // Limit cluster size

      for (const sim of similarExpectations) {
        cluster.push(sim.expectationId);
        used.add(sim.expectationId);
      }

      if (cluster.length >= options.minClusterSize) {
        // Calculate cluster confidence (average similarity)
        let totalSimilarity = 0;
        let pairCount = 0;

        for (let i = 0; i < cluster.length; i++) {
          for (let j = i + 1; j < cluster.length; j++) {
            const expectation1 = expectations.find((e) => e.id === cluster[i])!;
            const expectation2 = expectations.find((e) => e.id === cluster[j])!;
            totalSimilarity += embeddingService.calculateSimilarity(
              expectation1.embedding,
              expectation2.embedding,
            );
            pairCount++;
          }
        }

        const confidence = pairCount > 0 ? totalSimilarity / pairCount : 0;

        // Determine cluster type based on expectation patterns
        const clusterType = this.determineClusterType(
          cluster.map((id) => expectations.find((e) => e.id === id)!),
        );

        clusters.push({
          name: `Cluster ${clusters.length + 1}`,
          type: clusterType,
          expectationIds: cluster,
          confidence,
        });
      }
    }

    return clusters;
  }

  private determineClusterType(
    expectations: { code: string; description: string }[],
  ): 'theme' | 'skill' | 'concept' {
    // Simple heuristic based on expectation descriptions
    const descriptions = expectations.map((e) => e.description.toLowerCase()).join(' ');

    if (
      descriptions.includes('skill') ||
      descriptions.includes('ability') ||
      descriptions.includes('can')
    ) {
      return 'skill';
    }

    if (
      descriptions.includes('concept') ||
      descriptions.includes('understand') ||
      descriptions.includes('knowledge')
    ) {
      return 'concept';
    }

    return 'theme'; // Default
  }

  private async generateClusterThemes(
    clusters: {
      name: string;
      type: 'theme' | 'skill' | 'concept';
      outcomeIds: string[];
      confidence: number;
    }[],
    importId: string,
  ): Promise<void> {
    if (!openai) {
      this.logger.warn('OpenAI not configured, skipping theme generation');
      return;
    }

    for (const cluster of clusters) {
      try {
        // Get expectation descriptions for this cluster
        const expectations = await this.prisma.curriculumExpectation.findMany({
          where: { id: { in: cluster.expectationIds } },
          select: { code: true, description: true },
        });

        const expectationList = expectations.map((e) => `${e.code}: ${e.description}`).join('\n');

        const prompt = `Given these related curriculum expectations, suggest a concise theme name (2-4 words) that captures their common focus:

${expectationList}

Theme name:`;

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 50,
        });

        const suggestedTheme = response.choices[0]?.message?.content?.trim();
        if (suggestedTheme) {
          cluster.name = suggestedTheme;
        }
      } catch (error) {
        this.logger.error(
          { error, clusterId: cluster.expectationIds },
          'Failed to generate theme for cluster',
        );
      }
    }
  }

  private async saveClusters(
    importId: string,
    clusters: {
      name: string;
      type: 'theme' | 'skill' | 'concept';
      expectationIds: string[];
      confidence: number;
    }[],
  ): Promise<ClusterResult[]> {
    const savedClusters: ClusterResult[] = [];

    for (const cluster of clusters) {
      try {
        const saved = await this.prisma.expectationCluster.create({
          data: {
            importId,
            clusterName: cluster.name,
            clusterType: cluster.type,
            expectationIds: cluster.expectationIds,
            confidence: cluster.confidence,
            suggestedTheme:
              cluster.name !== `Cluster ${clusters.indexOf(cluster) + 1}`
                ? cluster.name
                : undefined,
          },
        });

        savedClusters.push({
          id: saved.id,
          name: saved.clusterName,
          type: saved.clusterType as 'theme' | 'skill' | 'concept',
          expectationIds: saved.expectationIds as string[],
          confidence: saved.confidence,
          suggestedTheme: saved.suggestedTheme || undefined,
        });
      } catch (error) {
        this.logger.error({ error, cluster }, 'Failed to save cluster');
      }
    }

    return savedClusters;
  }
}

// Export singleton instance
export const clusteringService = new ClusteringService();
