import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';
import { ClusteringService } from '../../src/services/clusteringService';
import { ServiceDependencies } from '../../src/services/base/BaseService';
import { createMockDependencies } from '../utils/createServiceMocks';

// Mock the embedding service module
jest.mock('../../src/services/embeddingService');

// Mock the LLM service module
jest.mock('../../src/services/llmService');

import { embeddingService } from '../../src/services/embeddingService';
import { openai } from '../../src/services/llmService';

describe('ClusteringService', () => {
  let clusteringService: ClusteringService;
  let mockDeps: ServiceDependencies;
  let mockEmbeddingService: typeof embeddingService;
  let mockOpenAI: typeof openai;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create mock dependencies with extended Prisma models
    mockDeps = createMockDependencies(jest);

    // Add missing Prisma models for clustering
    const mockPrisma = mockDeps.prisma as any;
    mockPrisma.expectationCluster = {
      create: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      deleteMany: jest.fn(),
    };
    mockPrisma.expectationEmbedding = {
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    };

    // Setup embedding service mocks
    mockEmbeddingService = embeddingService as any;
    mockEmbeddingService.calculateSimilarity = jest.fn();
    mockEmbeddingService.findSimilarExpectations = jest.fn();
    mockEmbeddingService.generateBatchEmbeddings = jest.fn();

    // Setup OpenAI mocks
    mockOpenAI = openai as any;
    if (!mockOpenAI.chat) {
      mockOpenAI.chat = { completions: { create: jest.fn() } };
    } else if (!mockOpenAI.chat.completions) {
      mockOpenAI.chat.completions = { create: jest.fn() };
    } else {
      mockOpenAI.chat.completions.create = jest.fn();
    }

    // Create service with injected dependencies
    clusteringService = new ClusteringService(mockDeps);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('clusterExpectations', () => {
    const importId = 'import-123';
    const mockExpectations = [
      {
        id: 'expectation-1',
        code: 'M1.1',
        description: 'Count to 100',
        importId,
        embedding: { embedding: [1, 0, 0] },
      },
      {
        id: 'expectation-2',
        code: 'M1.2',
        description: 'Add single digits',
        importId,
        embedding: { embedding: [0.9, 0.1, 0] },
      },
      {
        id: 'expectation-3',
        code: 'G1.1',
        description: 'Identify shapes',
        importId,
        embedding: { embedding: [0, 1, 0] },
      },
      {
        id: 'expectation-4',
        code: 'G1.2',
        description: 'Compare shapes',
        importId,
        embedding: { embedding: [0, 0.9, 0.1] },
      },
    ];

    beforeEach(() => {
      const mockPrisma = mockDeps.prisma as any;

      // Mock expectation retrieval
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(mockExpectations);

      // Mock embedding service similarity calculations
      (mockEmbeddingService.calculateSimilarity as jest.Mock).mockImplementation(
        (emb1: number[], emb2: number[]) => {
          // Simple dot product for testing
          return emb1.reduce((sum: number, val: number, i: number) => sum + val * emb2[i], 0);
        },
      );

      // Mock OpenAI theme generation
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: 'Number Concepts' } }],
      });

      // Mock cluster creation
      mockPrisma.expectationCluster.create.mockImplementation((args: { data: unknown }) =>
        Promise.resolve({ id: `cluster-${Date.now()}`, ...args.data }),
      );
    });

    it('should cluster expectations with high similarity', async () => {
      const results = await clusteringService.clusterExpectations(importId);

      expect(results).toHaveLength(2); // Two clusters: Math and Geometry

      // Verify clusters contain related expectations
      const mathCluster = results.find((c) => c.expectationIds.includes('expectation-1'));
      expect(mathCluster?.expectationIds).toContain('expectation-2');

      const geometryCluster = results.find((c) => c.expectationIds.includes('expectation-3'));
      expect(geometryCluster?.expectationIds).toContain('expectation-4');
    });

    it('should respect minimum cluster size', async () => {
      const results = await clusteringService.clusterExpectations(importId, {
        minClusterSize: 3,
      });

      // With min cluster size 3, neither cluster should be created
      expect(results).toHaveLength(0);
    });

    it('should limit maximum clusters', async () => {
      // Add more expectations
      const manyExpectations = Array(50)
        .fill(null)
        .map((_, i) => ({
          id: `expectation-${i}`,
          code: `M1.${i}`,
          description: `Expectation ${i}`,
          importId,
          embedding: { embedding: [Math.random(), Math.random(), Math.random()] },
        }));

      const mockPrisma = mockDeps.prisma as any;
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(manyExpectations);

      const results = await clusteringService.clusterExpectations(importId, {
        maxClusters: 5,
      });

      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should generate AI themes when enabled', async () => {
      const results = await clusteringService.clusterExpectations(importId, {
        useAISuggestions: true,
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(results[0].suggestedTheme).toBeDefined();
    });

    it('should skip AI themes when disabled', async () => {
      const results = await clusteringService.clusterExpectations(importId, {
        useAISuggestions: false,
      });

      expect(mockOpenAI.chat.completions.create).not.toHaveBeenCalled();
      expect(results[0].suggestedTheme).toBeUndefined();
    });

    it('should handle empty expectation list', async () => {
      const mockPrisma = mockDeps.prisma as any;
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([]);

      const results = await clusteringService.clusterExpectations(importId);

      expect(results).toHaveLength(0);
    });

    it('should generate missing embeddings', async () => {
      const mockPrisma = mockDeps.prisma as any;

      // Mock expectations without embeddings
      const expectationsWithoutEmbeddings = [
        { id: 'expectation-1', code: 'M1.1', description: 'Count', importId, embedding: null },
        { id: 'expectation-2', code: 'M1.2', description: 'Add', importId, embedding: null },
      ];

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(expectationsWithoutEmbeddings);

      // Mock embedding generation
      (mockEmbeddingService.generateBatchEmbeddings as jest.Mock).mockResolvedValue([]);

      // Mock re-fetch with embeddings
      mockPrisma.curriculumExpectation.findMany
        .mockResolvedValueOnce(expectationsWithoutEmbeddings)
        .mockResolvedValueOnce([
          { ...expectationsWithoutEmbeddings[0], embedding: { embedding: [1, 0, 0] } },
          { ...expectationsWithoutEmbeddings[1], embedding: { embedding: [0.9, 0.1, 0] } },
        ]);

      await clusteringService.clusterExpectations(importId);

      expect(mockEmbeddingService.generateBatchEmbeddings).toHaveBeenCalled();
    });

    it('should determine cluster types correctly', async () => {
      const mockPrisma = mockDeps.prisma as any;

      // Mock expectations with specific keywords
      const typedExpectations = [
        {
          id: 'expectation-1',
          code: 'S1.1',
          description: 'Develop critical thinking skills',
          importId,
          embedding: { embedding: [1, 0, 0] },
        },
        {
          id: 'expectation-2',
          code: 'S1.2',
          description: 'Apply problem-solving ability',
          importId,
          embedding: { embedding: [0.9, 0.1, 0] },
        },
        {
          id: 'expectation-3',
          code: 'C1.1',
          description: 'Understand basic concepts',
          importId,
          embedding: { embedding: [0, 1, 0] },
        },
        {
          id: 'expectation-4',
          code: 'C1.2',
          description: 'Grasp foundational knowledge',
          importId,
          embedding: { embedding: [0, 0.9, 0.1] },
        },
      ];

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(typedExpectations);

      const results = await clusteringService.clusterExpectations(importId);

      const skillCluster = results.find((c) => c.expectationIds.includes('expectation-1'));
      expect(skillCluster?.type).toBe('skill');

      const conceptCluster = results.find((c) => c.expectationIds.includes('expectation-3'));
      expect(conceptCluster?.type).toBe('concept');
    });
  });

  describe('reclusterExpectations', () => {
    it('should delete existing clusters before reclustering', async () => {
      const importId = 'import-123';
      const mockPrisma = mockDeps.prisma as any;

      // Mock deletion
      mockPrisma.expectationCluster.deleteMany.mockResolvedValue({ count: 3 });

      // Mock expectations for new clustering
      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([]);

      await clusteringService.reclusterExpectations(importId);

      expect(mockPrisma.expectationCluster.deleteMany).toHaveBeenCalledWith({
        where: { importId },
      });
    });
  });

  describe('getClusters', () => {
    it('should retrieve and format clusters', async () => {
      const mockPrisma = mockDeps.prisma as any;

      const mockClusters = [
        {
          id: 'cluster-1',
          clusterName: 'Math Basics',
          clusterType: 'skill',
          expectationIds: ['expectation-1', 'expectation-2'],
          confidence: 0.85,
          suggestedTheme: 'Number Skills',
        },
        {
          id: 'cluster-2',
          clusterName: 'Geometry',
          clusterType: 'concept',
          expectationIds: ['expectation-3', 'expectation-4'],
          confidence: 0.92,
          suggestedTheme: null,
        },
      ];

      mockPrisma.expectationCluster.findMany.mockResolvedValue(mockClusters);

      const results = await clusteringService.getClusters('import-123');

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'cluster-1',
        name: 'Math Basics',
        type: 'skill',
        expectationIds: ['expectation-1', 'expectation-2'],
        confidence: 0.85,
        suggestedTheme: 'Number Skills',
      });
      expect(results[1].suggestedTheme).toBeUndefined();
    });
  });

  describe('suggestSimilarExpectations', () => {
    it('should return similar expectations with details', async () => {
      const mockPrisma = mockDeps.prisma as any;

      const mockSimilarities = [
        { expectationId: 'expectation-2', similarity: 0.95 },
        { expectationId: 'expectation-3', similarity: 0.82 },
      ];

      (mockEmbeddingService.findSimilarExpectations as jest.Mock).mockResolvedValue(
        mockSimilarities,
      );

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([
        { id: 'expectation-2', code: 'M1.2', description: 'Add numbers' },
        { id: 'expectation-3', code: 'M1.3', description: 'Subtract numbers' },
      ]);

      const results = await clusteringService.suggestSimilarExpectations('expectation-1', 0.8, 5);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        expectationId: 'expectation-2',
        code: 'M1.2',
        description: 'Add numbers',
        similarity: 0.95,
      });
    });

    it('should handle no similar expectations', async () => {
      (mockEmbeddingService.findSimilarExpectations as jest.Mock).mockResolvedValue([]);

      const results = await clusteringService.suggestSimilarExpectations('expectation-1');

      expect(results).toHaveLength(0);
    });
  });

  describe('analyzeClusterQuality', () => {
    it('should provide quality analysis with suggestions', async () => {
      const mockClusters = [
        { confidence: 0.85, expectationIds: ['e1', 'e2', 'e3'] },
        { confidence: 0.55, expectationIds: ['e4', 'e5'] },
        { confidence: 0.45, expectationIds: ['e6'] }, // Small cluster (< 3 items)
        { confidence: 0.72, expectationIds: ['e7', 'e8', 'e9', 'e10'] },
      ];

      // Mock getClusters
      jest.spyOn(clusteringService, 'getClusters').mockResolvedValue(
        mockClusters.map((c, i) => ({
          id: `cluster-${i}`,
          name: `Cluster ${i}`,
          type: 'theme' as const,
          expectationIds: c.expectationIds,
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
      // Since only 1 of 4 clusters is small (25%), it won't trigger the "many small clusters" suggestion
      expect(analysis.suggestions).toContain(
        'Many clusters have low confidence - consider reducing max clusters',
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

    it('should detect many small clusters', async () => {
      const mockClusters = [
        { confidence: 0.85, expectationIds: ['e1', 'e2'] },
        { confidence: 0.75, expectationIds: ['e3'] },
        { confidence: 0.65, expectationIds: ['e4'] },
        { confidence: 0.72, expectationIds: ['e5', 'e6'] },
      ];

      // Mock getClusters
      jest.spyOn(clusteringService, 'getClusters').mockResolvedValue(
        mockClusters.map((c, i) => ({
          id: `cluster-${i}`,
          name: `Cluster ${i}`,
          type: 'theme' as const,
          expectationIds: c.expectationIds,
          confidence: c.confidence,
        })),
      );

      const analysis = await clusteringService.analyzeClusterQuality('import-123');

      // 3 of 4 clusters have < 3 items (75% > 50%)
      expect(analysis.suggestions).toContain(
        'Many small clusters detected - consider increasing minimum cluster size',
      );
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle clustering with very similar embeddings', async () => {
      const mockPrisma = mockDeps.prisma as any;

      // All expectations have nearly identical embeddings
      const similarExpectations = Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `expectation-${i}`,
          code: `M1.${i}`,
          description: `Very similar expectation ${i}`,
          importId: 'import-123',
          embedding: { embedding: [0.99 + i * 0.001, 0.01, 0] },
        }));

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(similarExpectations);

      // Mock the calculateSimilarity to return high values for similar vectors
      (mockEmbeddingService.calculateSimilarity as jest.Mock).mockImplementation(
        (emb1: number[], emb2: number[]) => {
          // Calculate actual dot product for these similar vectors
          const dotProduct = emb1.reduce(
            (sum: number, val: number, i: number) => sum + val * emb2[i],
            0,
          );
          // Normalize to ensure high similarity
          return (
            dotProduct /
            Math.sqrt(emb1.reduce((s, v) => s + v * v, 0) * emb2.reduce((s, v) => s + v * v, 0))
          );
        },
      );

      // Mock cluster creation to succeed
      mockPrisma.expectationCluster.create.mockImplementation((args: { data: unknown }) =>
        Promise.resolve({ id: `cluster-${Date.now()}`, ...args.data }),
      );

      // Mock OpenAI theme generation
      (mockOpenAI.chat.completions.create as jest.Mock).mockResolvedValue({
        choices: [{ message: { content: 'Similar Concepts' } }],
      });

      const results = await clusteringService.clusterExpectations('import-123', {
        similarityThreshold: 0.95, // Lower threshold to ensure clustering happens
        minClusterSize: 2,
      });

      // Should create at least one cluster with most expectations
      expect(results.length).toBeGreaterThan(0);
      // The first cluster should contain multiple expectations
      expect(results[0].expectationIds.length).toBeGreaterThan(1);
      expect(results[0].confidence).toBeGreaterThan(0.9);
    });

    it('should handle clustering with orthogonal embeddings', async () => {
      const mockPrisma = mockDeps.prisma as any;

      // All expectations have completely different embeddings
      const orthogonalExpectations = [
        {
          id: 'e1',
          code: 'M1',
          description: 'Math',
          importId: 'import-123',
          embedding: { embedding: [1, 0, 0] },
        },
        {
          id: 'e2',
          code: 'S1',
          description: 'Science',
          importId: 'import-123',
          embedding: { embedding: [0, 1, 0] },
        },
        {
          id: 'e3',
          code: 'E1',
          description: 'English',
          importId: 'import-123',
          embedding: { embedding: [0, 0, 1] },
        },
      ];

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue(orthogonalExpectations);

      const results = await clusteringService.clusterExpectations('import-123', {
        similarityThreshold: 0.5,
        minClusterSize: 1,
      });

      // Should not create any clusters (no similarities above threshold)
      expect(results).toHaveLength(0);
    });

    it('should handle errors during theme generation gracefully', async () => {
      const mockPrisma = mockDeps.prisma as any;

      mockPrisma.curriculumExpectation.findMany.mockResolvedValue([
        {
          id: 'e1',
          code: 'M1',
          description: 'Math',
          importId: 'import-123',
          embedding: { embedding: [1, 0, 0] },
        },
        {
          id: 'e2',
          code: 'M2',
          description: 'More Math',
          importId: 'import-123',
          embedding: { embedding: [0.9, 0.1, 0] },
        },
      ]);

      // Mock similarity calculation for these embeddings
      (mockEmbeddingService.calculateSimilarity as jest.Mock).mockImplementation(
        (emb1: number[], emb2: number[]) => {
          // Simple dot product
          return emb1.reduce((sum: number, val: number, i: number) => sum + val * emb2[i], 0);
        },
      );

      // Mock cluster creation to succeed
      mockPrisma.expectationCluster.create.mockImplementation((args: { data: unknown }) =>
        Promise.resolve({ id: `cluster-${Date.now()}`, ...args.data }),
      );

      // Mock OpenAI error
      (mockOpenAI.chat.completions.create as jest.Mock).mockRejectedValue(new Error('API error'));

      const results = await clusteringService.clusterExpectations('import-123', {
        useAISuggestions: true,
        minClusterSize: 2,
      });

      // Should still create cluster without theme
      expect(results).toHaveLength(1);
      expect(results[0].name).toMatch(/Cluster \d+/);
    });
  });
});
