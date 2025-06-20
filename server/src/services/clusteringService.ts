import { embeddingService } from './embeddingService';
import { openai } from './llmService';
import BaseService from './base/BaseService';

export interface ClusterResult {
  id: string;
  name: string;
  type: 'theme' | 'skill' | 'concept';
  outcomeIds: string[];
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
   * Cluster outcomes for a specific import using embedding-based similarity
   */
  async clusterOutcomes(
    importId: string,
    options: Partial<ClusteringOptions> = {},
  ): Promise<ClusterResult[]> {
    const opts = { ...this.defaultOptions, ...options };

    try {
      // Get all outcomes for this import with their embeddings
      const outcomes = await this.getOutcomesWithEmbeddings(importId);

      if (outcomes.length < opts.minClusterSize) {
        this.logger.info(
          { importId, outcomeCount: outcomes.length },
          'Not enough outcomes to create meaningful clusters',
        );
        return [];
      }

      this.logger.info(
        { importId, outcomeCount: outcomes.length, options: opts },
        'Starting outcome clustering',
      );

      // Perform hierarchical clustering
      const clusters = await this.performHierarchicalClustering(outcomes, opts);

      // Generate AI suggestions for cluster themes if enabled
      if (opts.useAISuggestions) {
        await this.generateClusterThemes(clusters);
      }

      // Save clusters to database
      const savedClusters = await this.saveClusters(importId, clusters);

      this.logger.info(
        { importId, clusterCount: savedClusters.length },
        'Completed outcome clustering',
      );

      return savedClusters;
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to cluster outcomes');
      throw new Error(`Clustering failed: ${error.message}`);
    }
  }

  /**
   * Re-cluster outcomes with different parameters
   */
  async reclusterOutcomes(
    importId: string,
    options: Partial<ClusteringOptions> = {},
  ): Promise<ClusterResult[]> {
    try {
      // Delete existing clusters for this import
      await this.prisma.outcomeCluster.deleteMany({
        where: { importId },
      });

      this.logger.info({ importId }, 'Deleted existing clusters for re-clustering');

      // Perform new clustering
      return await this.clusterOutcomes(importId, options);
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to re-cluster outcomes');
      throw error;
    }
  }

  /**
   * Get clusters for a specific import
   */
  async getClusters(importId: string): Promise<ClusterResult[]> {
    try {
      const clusters = await this.prisma.outcomeCluster.findMany({
        where: { importId },
        orderBy: { confidence: 'desc' },
      });

      return clusters.map((cluster) => ({
        id: cluster.id,
        name: cluster.clusterName,
        type: cluster.clusterType as 'theme' | 'skill' | 'concept',
        outcomeIds: cluster.outcomeIds as string[],
        confidence: cluster.confidence,
        suggestedTheme: cluster.suggestedTheme || undefined,
      }));
    } catch (error) {
      this.logger.error({ error, importId }, 'Failed to get clusters');
      return [];
    }
  }

  /**
   * Suggest similar outcomes based on a given outcome
   */
  async suggestSimilarOutcomes(
    outcomeId: string,
    threshold: number = 0.8,
    limit: number = 10,
  ): Promise<
    {
      outcomeId: string;
      code: string;
      description: string;
      similarity: number;
    }[]
  > {
    try {
      const similarities = await embeddingService.findSimilarOutcomes(outcomeId, threshold, limit);

      if (similarities.length === 0) return [];

      const outcomes = await this.prisma.outcome.findMany({
        where: {
          id: { in: similarities.map((s) => s.outcomeId) },
        },
        select: {
          id: true,
          code: true,
          description: true,
        },
      });

      return similarities
        .map((sim) => {
          const outcome = outcomes.find((o) => o.id === sim.outcomeId);
          return {
            outcomeId: sim.outcomeId,
            code: outcome?.code || 'Unknown',
            description: outcome?.description || 'Unknown',
            similarity: sim.similarity,
          };
        })
        .filter((item) => item.code !== 'Unknown');
    } catch (error) {
      this.logger.error({ error, outcomeId }, 'Failed to suggest similar outcomes');
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

      const smallClusters = clusters.filter((c) => c.outcomeIds.length < 3).length;
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

  private async getOutcomesWithEmbeddings(importId: string): Promise<
    {
      id: string;
      code: string;
      description: string;
      embedding: number[];
    }[]
  > {
    const outcomes = await this.prisma.outcome.findMany({
      where: { importId },
      include: {
        embedding: true,
      },
    });

    const outcomesWithEmbeddings = outcomes
      .filter((outcome) => outcome.embedding)
      .map((outcome) => ({
        id: outcome.id,
        code: outcome.code,
        description: outcome.description,
        embedding: outcome.embedding!.embedding as number[],
      }));

    // Generate missing embeddings
    const missingEmbeddings = outcomes.filter((outcome) => !outcome.embedding);
    if (missingEmbeddings.length > 0) {
      this.logger.info({ count: missingEmbeddings.length }, 'Generating missing embeddings');

      const embeddingData = missingEmbeddings.map((outcome) => ({
        id: outcome.id,
        text: `${outcome.code}: ${outcome.description}`,
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);

      // Re-fetch with new embeddings
      const updatedOutcomes = await this.prisma.outcome.findMany({
        where: { id: { in: missingEmbeddings.map((o) => o.id) } },
        include: { embedding: true },
      });

      for (const outcome of updatedOutcomes) {
        if (outcome.embedding) {
          outcomesWithEmbeddings.push({
            id: outcome.id,
            code: outcome.code,
            description: outcome.description,
            embedding: outcome.embedding.embedding as number[],
          });
        }
      }
    }

    return outcomesWithEmbeddings;
  }

  private async performHierarchicalClustering(
    outcomes: { id: string; code: string; description: string; embedding: number[] }[],
    options: ClusteringOptions,
  ): Promise<
    {
      name: string;
      type: 'theme' | 'skill' | 'concept';
      outcomeIds: string[];
      confidence: number;
    }[]
  > {
    // Simple hierarchical clustering implementation
    const clusters: {
      name: string;
      type: 'theme' | 'skill' | 'concept';
      outcomeIds: string[];
      confidence: number;
    }[] = [];

    const used = new Set<string>();
    const similarities: { [key: string]: { outcomeId: string; similarity: number }[] } = {};

    // Calculate similarities for all outcomes
    for (const outcome of outcomes) {
      similarities[outcome.id] = [];
      for (const other of outcomes) {
        if (outcome.id !== other.id) {
          const similarity = embeddingService.calculateSimilarity(
            outcome.embedding,
            other.embedding,
          );
          similarities[outcome.id].push({ outcomeId: other.id, similarity });
        }
      }
      similarities[outcome.id].sort((a, b) => b.similarity - a.similarity);
    }

    // Form clusters greedily
    for (const outcome of outcomes) {
      if (used.has(outcome.id) || clusters.length >= options.maxClusters) continue;

      const cluster = [outcome.id];
      used.add(outcome.id);

      // Find similar outcomes to add to this cluster
      const similarOutcomes = similarities[outcome.id]
        .filter((sim) => !used.has(sim.outcomeId) && sim.similarity >= options.similarityThreshold)
        .slice(0, 10); // Limit cluster size

      for (const sim of similarOutcomes) {
        cluster.push(sim.outcomeId);
        used.add(sim.outcomeId);
      }

      if (cluster.length >= options.minClusterSize) {
        // Calculate cluster confidence (average similarity)
        let totalSimilarity = 0;
        let pairCount = 0;

        for (let i = 0; i < cluster.length; i++) {
          for (let j = i + 1; j < cluster.length; j++) {
            const outcome1 = outcomes.find((o) => o.id === cluster[i])!;
            const outcome2 = outcomes.find((o) => o.id === cluster[j])!;
            totalSimilarity += embeddingService.calculateSimilarity(
              outcome1.embedding,
              outcome2.embedding,
            );
            pairCount++;
          }
        }

        const confidence = pairCount > 0 ? totalSimilarity / pairCount : 0;

        // Determine cluster type based on outcome patterns
        const clusterType = this.determineClusterType(
          cluster.map((id) => outcomes.find((o) => o.id === id)!),
        );

        clusters.push({
          name: `Cluster ${clusters.length + 1}`,
          type: clusterType,
          outcomeIds: cluster,
          confidence,
        });
      }
    }

    return clusters;
  }

  private determineClusterType(
    outcomes: { code: string; description: string }[],
  ): 'theme' | 'skill' | 'concept' {
    // Simple heuristic based on outcome descriptions
    const descriptions = outcomes.map((o) => o.description.toLowerCase()).join(' ');

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
  ): Promise<void> {
    if (!openai) {
      this.logger.warn('OpenAI not configured, skipping theme generation');
      return;
    }

    for (const cluster of clusters) {
      try {
        // Get outcome descriptions for this cluster
        const outcomes = await this.prisma.outcome.findMany({
          where: { id: { in: cluster.outcomeIds } },
          select: { code: true, description: true },
        });

        const outcomeList = outcomes.map((o) => `${o.code}: ${o.description}`).join('\n');

        const prompt = `Given these related curriculum outcomes, suggest a concise theme name (2-4 words) that captures their common focus:

${outcomeList}

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
          { error, clusterId: cluster.outcomeIds },
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
      outcomeIds: string[];
      confidence: number;
    }[],
  ): Promise<ClusterResult[]> {
    const savedClusters: ClusterResult[] = [];

    for (const cluster of clusters) {
      try {
        const saved = await this.prisma.outcomeCluster.create({
          data: {
            importId,
            clusterName: cluster.name,
            clusterType: cluster.type,
            outcomeIds: cluster.outcomeIds,
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
          outcomeIds: saved.outcomeIds as string[],
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
