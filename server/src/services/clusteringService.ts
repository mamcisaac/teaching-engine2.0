/**
 * Clustering Service
 * Handles clustering of curriculum outcomes and content for organization
 */

import { embeddingService } from './embeddingService.js';
import logger from '../logger.js';

export interface ClusterItem {
  id: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, unknown>;
}

export interface Cluster {
  id: string;
  centroid: number[];
  items: ClusterItem[];
  label?: string;
  description?: string;
}

export interface ClusteringOptions {
  minClusters?: number;
  maxClusters?: number;
  similarityThreshold?: number;
}

export const clusteringService = {
  /**
   * Generate clusters from a list of items
   */
  async generateClusters(
    items: ClusterItem[],
    options: ClusteringOptions = {}
  ): Promise<Cluster[]> {
    try {
      const {
        minClusters = 2,
        maxClusters = 10,
        similarityThreshold = 0.7
      } = options;

      logger.info(`Generating clusters for ${items.length} items`);

      // Generate embeddings for items that don't have them
      const itemsWithEmbeddings = await this.ensureEmbeddings(items);

      // Simple clustering algorithm (k-means-like)
      const clusters = await this.performClustering(
        itemsWithEmbeddings,
        minClusters,
        maxClusters,
        similarityThreshold
      );

      logger.info(`Generated ${clusters.length} clusters`);
      return clusters;
    } catch (error) {
      logger.error('Failed to generate clusters:', error);
      throw error;
    }
  },

  /**
   * Ensure all items have embeddings
   */
  async ensureEmbeddings(items: ClusterItem[]): Promise<ClusterItem[]> {
    const itemsWithEmbeddings: ClusterItem[] = [];

    for (const item of items) {
      if (item.embedding) {
        itemsWithEmbeddings.push(item);
      } else {
        try {
          const embeddingResult = await embeddingService.generateEmbedding(
            item.content,
            item.id
          );
          itemsWithEmbeddings.push({
            ...item,
            embedding: embeddingResult.embedding,
          });
        } catch (error) {
          logger.warn(`Failed to generate embedding for item ${item.id}:`, error);
          // Skip items that fail embedding generation
        }
      }
    }

    return itemsWithEmbeddings;
  },

  /**
   * Perform clustering using a simple similarity-based approach
   */
  async performClustering(
    items: ClusterItem[],
    minClusters: number,
    maxClusters: number,
    similarityThreshold: number
  ): Promise<Cluster[]> {
    if (items.length === 0) {
      return [];
    }

    if (items.length <= minClusters) {
      // Create one cluster per item if we have fewer items than minimum clusters
      return items.map((item, index) => ({
        id: `cluster_${index}`,
        centroid: item.embedding || [],
        items: [item],
        label: `Cluster ${index + 1}`,
      }));
    }

    const clusters: Cluster[] = [];
    const unassignedItems = [...items];

    // Start with first item as first cluster
    let clusterIndex = 0;
    while (unassignedItems.length > 0 && clusters.length < maxClusters) {
      const seedItem = unassignedItems.shift()!;
      const cluster: Cluster = {
        id: `cluster_${clusterIndex}`,
        centroid: seedItem.embedding || [],
        items: [seedItem],
        label: `Cluster ${clusterIndex + 1}`,
      };

      // Find similar items to add to this cluster
      const remainingItems = [...unassignedItems];
      for (let i = remainingItems.length - 1; i >= 0; i--) {
        const item = remainingItems[i];
        if (item.embedding && cluster.centroid.length > 0) {
          const similarity = embeddingService.calculateSimilarity(
            item.embedding,
            cluster.centroid
          );

          if (similarity >= similarityThreshold) {
            cluster.items.push(item);
            unassignedItems.splice(unassignedItems.indexOf(item), 1);
          }
        }
      }

      // Update centroid based on all items in cluster
      if (cluster.items.length > 1) {
        cluster.centroid = this.calculateCentroid(cluster.items);
      }

      clusters.push(cluster);
      clusterIndex++;
    }

    // Add remaining items to closest clusters
    for (const item of unassignedItems) {
      if (item.embedding && clusters.length > 0) {
        let bestCluster = clusters[0];
        let bestSimilarity = -1;

        for (const cluster of clusters) {
          if (cluster.centroid.length > 0) {
            const similarity = embeddingService.calculateSimilarity(
              item.embedding,
              cluster.centroid
            );
            if (similarity > bestSimilarity) {
              bestSimilarity = similarity;
              bestCluster = cluster;
            }
          }
        }

        bestCluster.items.push(item);
        bestCluster.centroid = this.calculateCentroid(bestCluster.items);
      }
    }

    return clusters;
  },

  /**
   * Calculate centroid (average) of embeddings
   */
  calculateCentroid(items: ClusterItem[]): number[] {
    const embeddings = items
      .map(item => item.embedding)
      .filter(embedding => embedding !== undefined) as number[][];

    if (embeddings.length === 0) {
      return [];
    }

    const dimensions = embeddings[0].length;
    const centroid = new Array(dimensions).fill(0);

    for (const embedding of embeddings) {
      for (let i = 0; i < dimensions; i++) {
        centroid[i] += embedding[i];
      }
    }

    // Average the values
    for (let i = 0; i < dimensions; i++) {
      centroid[i] /= embeddings.length;
    }

    return centroid;
  },

  /**
   * Get cluster statistics
   */
  getClusterStats(clusters: Cluster[]): {
    totalClusters: number;
    totalItems: number;
    averageItemsPerCluster: number;
    clusterSizes: number[];
  } {
    const totalClusters = clusters.length;
    const totalItems = clusters.reduce((sum, cluster) => sum + cluster.items.length, 0);
    const averageItemsPerCluster = totalItems / totalClusters;
    const clusterSizes = clusters.map(cluster => cluster.items.length);

    return {
      totalClusters,
      totalItems,
      averageItemsPerCluster,
      clusterSizes,
    };
  },
};