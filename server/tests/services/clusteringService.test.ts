import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { ClusteringService } from '../../src/services/clusteringService';
import { embeddingService } from '../../src/services/embeddingService';
import { openai } from '../../src/services/llmService';
import { prisma } from '../../src/prisma';

describe.skip('ClusteringService', () => {
  let clusteringService: ClusteringService;

  beforeEach(() => {
    clusteringService = new ClusteringService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('clusterOutcomes', () => {
    const importId = 'import-123';
    const mockOutcomes = [
      {
        id: 'outcome-1',
        code: 'M1.1',
        description: 'Count to 100',
        embedding: { embedding: [1, 0, 0] },
      },
      {
        id: 'outcome-2',
        code: 'M1.2',
        description: 'Add single digits',
        embedding: { embedding: [0.9, 0.1, 0] },
      },
      {
        id: 'outcome-3',
        code: 'G1.1',
        description: 'Identify shapes',
        embedding: { embedding: [0, 1, 0] },
      },
      {
        id: 'outcome-4',
        code: 'G1.2',
        description: 'Compare shapes',
        embedding: { embedding: [0, 0.9, 0.1] },
      },
    ];

    beforeEach(() => {
      // Mock outcome retrieval
      (prisma.outcome.findMany as jest.Mock).mockResolvedValue(mockOutcomes);

      // Mock embedding service similarity calculations
      (embeddingService.calculateSimilarity as jest.Mock).mockImplementation((emb1, emb2) => {
        // Simple dot product for testing
        return emb1.reduce((sum: number, val: number, i: number) => sum + val * emb2[i], 0);
      });

      // Mock OpenAI theme generation
      (openai.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: 'Number Concepts' } }],
      });

      // Mock cluster creation
      (prisma.outcomeCluster.create as jest.Mock).mockImplementation((args) =>
        Promise.resolve({ id: `cluster-${Date.now()}`, ...args.data }),
      );
    });

    it('should cluster outcomes with high similarity', async () => {
      const results = await clusteringService.clusterOutcomes(importId);

      expect(results).toHaveLength(2); // Two clusters: Math and Geometry

      // Verify clusters contain related outcomes
      const mathCluster = results.find((c) => c.outcomeIds.includes('outcome-1'));
      expect(mathCluster?.outcomeIds).toContain('outcome-2');

      const geometryCluster = results.find((c) => c.outcomeIds.includes('outcome-3'));
      expect(geometryCluster?.outcomeIds).toContain('outcome-4');
    });

    it('should respect minimum cluster size', async () => {
      const results = await clusteringService.clusterOutcomes(importId, {
        minClusterSize: 3,
      });

      // With min cluster size 3, neither cluster should be created
      expect(results).toHaveLength(0);
    });

    it('should limit maximum clusters', async () => {
      // Add more outcomes
      const manyOutcomes = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `outcome-${i}`,
          code: `M1.${i}`,
          description: `Outcome ${i}`,
          embedding: { embedding: [Math.random(), Math.random(), Math.random()] },
        }));

      (prisma.outcome.findMany as jest.Mock).mockResolvedValue(manyOutcomes);

      const results = await clusteringService.clusterOutcomes(importId, {
        maxClusters: 5,
      });

      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should generate AI themes when enabled', async () => {
      const results = await clusteringService.clusterOutcomes(importId, {
        useAISuggestions: true,
      });

      expect(openai.chat.completions.create).toHaveBeenCalled();
      expect(results[0].suggestedTheme).toBeDefined();
    });

    it('should skip AI themes when disabled', async () => {
      const results = await clusteringService.clusterOutcomes(importId, {
        useAISuggestions: false,
      });

      expect(openai.chat.completions.create).not.toHaveBeenCalled();
      expect(results[0].suggestedTheme).toBeUndefined();
    });

    it('should handle empty outcome list', async () => {
      (prisma.outcome.findMany as jest.Mock).mockResolvedValue([]);

      const results = await clusteringService.clusterOutcomes(importId);

      expect(results).toHaveLength(0);
    });

    it('should generate missing embeddings', async () => {
      // Mock outcomes without embeddings
      const outcomesWithoutEmbeddings = [
        { id: 'outcome-1', code: 'M1.1', description: 'Count', embedding: null },
        { id: 'outcome-2', code: 'M1.2', description: 'Add', embedding: null },
      ];

      (prisma.outcome.findMany as jest.Mock).mockResolvedValue(outcomesWithoutEmbeddings);

      // Mock embedding generation
      (embeddingService.generateBatchEmbeddings as jest.Mock).mockResolvedValue([]);

      // Mock re-fetch with embeddings
      (prisma.outcome.findMany as jest.Mock)
        .mockResolvedValueOnce(outcomesWithoutEmbeddings)
        .mockResolvedValueOnce([
          { ...outcomesWithoutEmbeddings[0], embedding: { embedding: [1, 0, 0] } },
          { ...outcomesWithoutEmbeddings[1], embedding: { embedding: [0.9, 0.1, 0] } },
        ]);

      await clusteringService.clusterOutcomes(importId);

      expect(embeddingService.generateBatchEmbeddings).toHaveBeenCalled();
    });

    it('should determine cluster types correctly', async () => {
      // Mock outcomes with specific keywords
      const typedOutcomes = [
        {
          id: 'outcome-1',
          code: 'S1.1',
          description: 'Develop critical thinking skills',
          embedding: { embedding: [1, 0, 0] },
        },
        {
          id: 'outcome-2',
          code: 'S1.2',
          description: 'Apply problem-solving ability',
          embedding: { embedding: [0.9, 0.1, 0] },
        },
        {
          id: 'outcome-3',
          code: 'C1.1',
          description: 'Understand basic concepts',
          embedding: { embedding: [0, 1, 0] },
        },
        {
          id: 'outcome-4',
          code: 'C1.2',
          description: 'Grasp foundational knowledge',
          embedding: { embedding: [0, 0.9, 0.1] },
        },
      ];

      (prisma.outcome.findMany as jest.Mock).mockResolvedValue(typedOutcomes);

      const results = await clusteringService.clusterOutcomes(importId);

      const skillCluster = results.find((c) => c.outcomeIds.includes('outcome-1'));
      expect(skillCluster?.type).toBe('skill');

      const conceptCluster = results.find((c) => c.outcomeIds.includes('outcome-3'));
      expect(conceptCluster?.type).toBe('concept');
    });
  });

  describe('reclusterOutcomes', () => {
    it('should delete existing clusters before reclustering', async () => {
      const importId = 'import-123';

      // Mock deletion
      (prisma.outcomeCluster.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      // Mock outcomes for new clustering
      (prisma.outcome.findMany as jest.Mock).mockResolvedValue([]);

      await clusteringService.reclusterOutcomes(importId);

      expect(prisma.outcomeCluster.deleteMany).toHaveBeenCalledWith({
        where: { importId },
      });
    });
  });

  describe('getClusters', () => {
    it('should retrieve and format clusters', async () => {
      const mockClusters = [
        {
          id: 'cluster-1',
          clusterName: 'Math Basics',
          clusterType: 'skill',
          outcomeIds: ['outcome-1', 'outcome-2'],
          confidence: 0.85,
          suggestedTheme: 'Number Skills',
        },
        {
          id: 'cluster-2',
          clusterName: 'Geometry',
          clusterType: 'concept',
          outcomeIds: ['outcome-3', 'outcome-4'],
          confidence: 0.92,
          suggestedTheme: null,
        },
      ];

      (prisma.outcomeCluster.findMany as jest.Mock).mockResolvedValue(mockClusters);

      const results = await clusteringService.getClusters('import-123');

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'cluster-1',
        name: 'Math Basics',
        type: 'skill',
        outcomeIds: ['outcome-1', 'outcome-2'],
        confidence: 0.85,
        suggestedTheme: 'Number Skills',
      });
      expect(results[1].suggestedTheme).toBeUndefined();
    });
  });

  describe('suggestSimilarOutcomes', () => {
    it('should return similar outcomes with details', async () => {
      const mockSimilarities = [
        { outcomeId: 'outcome-2', similarity: 0.95 },
        { outcomeId: 'outcome-3', similarity: 0.82 },
      ];

      (embeddingService.findSimilarOutcomes as jest.Mock).mockResolvedValue(mockSimilarities);

      (prisma.outcome.findMany as jest.Mock).mockResolvedValue([
        { id: 'outcome-2', code: 'M1.2', description: 'Add numbers' },
        { id: 'outcome-3', code: 'M1.3', description: 'Subtract numbers' },
      ]);

      const results = await clusteringService.suggestSimilarOutcomes('outcome-1', 0.8, 5);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        outcomeId: 'outcome-2',
        code: 'M1.2',
        description: 'Add numbers',
        similarity: 0.95,
      });
    });

    it('should handle no similar outcomes', async () => {
      (embeddingService.findSimilarOutcomes as jest.Mock).mockResolvedValue([]);

      const results = await clusteringService.suggestSimilarOutcomes('outcome-1');

      expect(results).toHaveLength(0);
    });
  });

  describe('analyzeClusterQuality', () => {
    it('should provide quality analysis with suggestions', async () => {
      const mockClusters = [
        { confidence: 0.85, outcomeIds: ['o1', 'o2', 'o3'] },
        { confidence: 0.55, outcomeIds: ['o4', 'o5'] },
        { confidence: 0.45, outcomeIds: ['o6'] },
        { confidence: 0.72, outcomeIds: ['o7', 'o8', 'o9', 'o10'] },
      ];

      // Mock getClusters
      jest.spyOn(clusteringService, 'getClusters').mockResolvedValue(
        mockClusters.map((c, i) => ({
          id: `cluster-${i}`,
          name: `Cluster ${i}`,
          type: 'theme' as const,
          outcomeIds: c.outcomeIds,
          confidence: c.confidence,
        })),
      );

      const analysis = await clusteringService.analyzeClusterQuality('import-123');

      expect(analysis.totalClusters).toBe(4);
      expect(analysis.averageConfidence).toBeCloseTo(0.6425, 2);
      expect(analysis.clustersWithLowConfidence).toBe(2);
      expect(analysis.suggestions).toContain(
        'Consider adjusting similarity threshold for better clustering',
      );
      expect(analysis.suggestions).toContain(
        'Many small clusters detected - consider increasing minimum cluster size',
      );
    });

    it('should handle no clusters', async () => {
      jest.spyOn(clusteringService, 'getClusters').mockResolvedValue([]);

      const analysis = await clusteringService.analyzeClusterQuality('import-123');

      expect(analysis.totalClusters).toBe(0);
      expect(analysis.averageConfidence).toBe(0);
      expect(analysis.suggestions).toContain(
        'No clusters found. Consider running clustering first.',
      );
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle clustering with very similar embeddings', async () => {
      // All outcomes have nearly identical embeddings
      const similarOutcomes = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `outcome-${i}`,
          code: `M1.${i}`,
          description: `Very similar outcome ${i}`,
          embedding: { embedding: [0.99 + i * 0.001, 0.01, 0] },
        }));

      (prisma.outcome.findMany as jest.Mock).mockResolvedValue(similarOutcomes);

      const results = await clusteringService.clusterOutcomes('import-123', {
        similarityThreshold: 0.99,
      });

      // Should create one large cluster
      expect(results).toHaveLength(1);
      expect(results[0].outcomeIds).toHaveLength(10);
      expect(results[0].confidence).toBeGreaterThan(0.99);
    });

    it('should handle clustering with orthogonal embeddings', async () => {
      // All outcomes have completely different embeddings
      const orthogonalOutcomes = [
        { id: 'o1', code: 'M1', description: 'Math', embedding: { embedding: [1, 0, 0] } },
        { id: 'o2', code: 'S1', description: 'Science', embedding: { embedding: [0, 1, 0] } },
        { id: 'o3', code: 'E1', description: 'English', embedding: { embedding: [0, 0, 1] } },
      ];

      (prisma.outcome.findMany as jest.Mock).mockResolvedValue(orthogonalOutcomes);

      const results = await clusteringService.clusterOutcomes('import-123', {
        similarityThreshold: 0.5,
        minClusterSize: 1,
      });

      // Should not create any clusters (no similarities above threshold)
      expect(results).toHaveLength(0);
    });

    it('should handle errors during theme generation gracefully', async () => {
      (prisma.outcome.findMany as jest.Mock).mockResolvedValue([
        { id: 'o1', code: 'M1', description: 'Math', embedding: { embedding: [1, 0, 0] } },
        { id: 'o2', code: 'M2', description: 'More Math', embedding: { embedding: [0.9, 0.1, 0] } },
      ]);

      // Mock OpenAI error
      (openai.chat.completions.create as jest.Mock).mockRejectedValue(new Error('API error'));

      const results = await clusteringService.clusterOutcomes('import-123', {
        useAISuggestions: true,
      });

      // Should still create cluster without theme
      expect(results).toHaveLength(1);
      expect(results[0].name).toMatch(/Cluster \d+/);
    });
  });
});
