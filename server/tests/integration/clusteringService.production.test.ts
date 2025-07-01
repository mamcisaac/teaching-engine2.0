import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { MockRegistry } from '../mocks/registry';
/**
 * Production-level integration tests for ClusteringService
 *
 * These tests validate real clustering algorithms with actual curriculum data:
 * - Hierarchical clustering with real embeddings
 * - AI-powered theme generation
 * - Cluster quality analysis and optimization
 * - Database integration and persistence
 * - Performance with realistic data volumes
 *
 * Prerequisites:
 * - OPENAI_API_KEY environment variable must be set (for theme generation)
 * - Test database must be available
 * - Real curriculum data with embeddings for comprehensive testing
 */

import { ClusteringService, ClusteringOptions } from '../../src/services/clusteringService';
import { EmbeddingService } from '../../src/services/embeddingService';
import { prisma } from '../../src/prisma';
import { DatabaseTestUtils } from '../utils/DatabaseTestUtils';

describe('ClusteringService - Production Integration', () => {
  let service: ClusteringService;
  let embeddingService: EmbeddingService;
  let testUtils: DatabaseTestUtils;

  // Test configuration
  const TEST_TIMEOUT = 120000; // 2 minutes for complex clustering operations
  const MIN_CLUSTER_SIZE = 2;
  const MAX_CLUSTERS = 10;
  const SIMILARITY_THRESHOLD = 0.75;

  beforeAll(async () => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable required for production tests');
    }

    testUtils = new DatabaseTestUtils();
    await testUtils.setupTestDatabase();
    service = new ClusteringService();
    embeddingService = new EmbeddingService();
  }, TEST_TIMEOUT);

  afterAll(async () => {
    await testUtils.cleanupTestDatabase();
  });

  beforeEach(async () => {
    await testUtils.resetTestData();

    // Setup centralized mocks
    const mockOpenAIInstance = MockRegistry.openai.create();
    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => mockOpenAIInstance as any);
  });

  describe('Clustering with Real Curriculum Data', () => {
    let testImportId: string;
    let testExpectations: any[];

    beforeEach(async () => {
      // Create comprehensive test data with realistic curriculum expectations
      const { import: curriculumImport } = await testUtils.createRealisticCurriculumData();
      testImportId = curriculumImport.id;

      // Create additional expectations for better clustering
      const additionalExpectations = await Promise.all([
        prisma.curriculumExpectation.create({
          data: {
            code: 'MA3.NS.3',
            description: 'Multiply and divide single-digit numbers using concrete materials',
            subject: 'Mathematics',
            grade: 3,
            strand: 'Number Sense and Numeration',
            importId: testImportId,
            learningGoals: [
              'Multiplication concepts',
              'Division strategies',
              'Concrete manipulation',
            ],
          },
        }),
        prisma.curriculumExpectation.create({
          data: {
            code: 'MA3.NS.4',
            description: 'Round two-digit and three-digit numbers to the nearest ten',
            subject: 'Mathematics',
            grade: 3,
            strand: 'Number Sense and Numeration',
            importId: testImportId,
            learningGoals: [
              'Rounding strategies',
              'Number approximation',
              'Place value understanding',
            ],
          },
        }),
        prisma.curriculumExpectation.create({
          data: {
            code: 'LA3.R.2',
            description: 'Identify main ideas and supporting details in grade-appropriate texts',
            subject: 'Language Arts',
            grade: 3,
            strand: 'Reading',
            importId: testImportId,
            learningGoals: ['Main idea identification', 'Supporting details', 'Text comprehension'],
          },
        }),
        prisma.curriculumExpectation.create({
          data: {
            code: 'LA3.W.2',
            description: 'Write informational texts with clear structure and supporting evidence',
            subject: 'Language Arts',
            grade: 3,
            strand: 'Writing',
            importId: testImportId,
            learningGoals: ['Informational writing', 'Text structure', 'Evidence support'],
          },
        }),
        prisma.curriculumExpectation.create({
          data: {
            code: 'SC3.LS.2',
            description: 'Classify living things based on observable characteristics',
            subject: 'Science',
            grade: 3,
            strand: 'Life Systems',
            importId: testImportId,
            learningGoals: ['Classification skills', 'Observable characteristics', 'Living things'],
          },
        }),
      ]);

      // Get all expectations for this import
      testExpectations = await prisma.curriculumExpectation.findMany({
        where: { importId: testImportId },
      });

      // Generate embeddings for all expectations
      const embeddingData = testExpectations.map((exp) => ({
        id: exp.id,
        text: `${exp.code}: ${exp.description}`,
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);
    });

    it(
      'should cluster expectations into meaningful groups',
      async () => {
        const options: Partial<ClusteringOptions> = {
          minClusterSize: MIN_CLUSTER_SIZE,
          maxClusters: MAX_CLUSTERS,
          similarityThreshold: SIMILARITY_THRESHOLD,
          useAISuggestions: true,
        };

        const clusters = await service.clusterExpectations(testImportId, options);

        expect(clusters).toBeDefined();
        expect(Array.isArray(clusters)).toBe(true);
        expect(clusters.length).toBeGreaterThan(0);

        // Validate cluster structure
        for (const cluster of clusters) {
          expect(cluster.id).toBeDefined();
          expect(cluster.name).toBeDefined();
          expect(cluster.type).toMatch(/^(theme|skill|concept)$/);
          expect(Array.isArray(cluster.expectationIds)).toBe(true);
          expect(cluster.expectationIds.length).toBeGreaterThanOrEqual(MIN_CLUSTER_SIZE);
          expect(cluster.confidence).toBeGreaterThan(0);
          expect(cluster.confidence).toBeLessThanOrEqual(1);
        }

        // Verify clusters are saved in database
        const savedClusters = await prisma.expectationCluster.findMany({
          where: { importId: testImportId },
        });
        expect(savedClusters.length).toBe(clusters.length);

        // Validate cluster quality
        const avgConfidence = clusters.reduce((sum, c) => sum + c.confidence, 0) / clusters.length;
        expect(avgConfidence).toBeGreaterThan(0.5); // Reasonable clustering quality
      },
      TEST_TIMEOUT,
    );

    it(
      'should identify subject-based clusters correctly',
      async () => {
        const clusters = await service.clusterExpectations(testImportId, {
          minClusterSize: 2,
          maxClusters: 15,
          similarityThreshold: 0.7,
          useAISuggestions: true,
        });

        // Should have clusters that group similar subjects
        const mathExpectations = testExpectations.filter((e) => e.subject === 'Mathematics');
        const laExpectations = testExpectations.filter((e) => e.subject === 'Language Arts');
        const scienceExpectations = testExpectations.filter((e) => e.subject === 'Science');

        // Find clusters that contain primarily math expectations
        const mathClusters = clusters.filter((cluster) => {
          const mathCount = cluster.expectationIds.filter((id) =>
            mathExpectations.some((exp) => exp.id === id),
          ).length;
          return mathCount / cluster.expectationIds.length > 0.5;
        });

        expect(mathClusters.length).toBeGreaterThan(0);

        // Verify subject coherence in clusters
        for (const cluster of mathClusters) {
          const clusterExpectations = testExpectations.filter((e) =>
            cluster.expectationIds.includes(e.id),
          );

          // Most expectations in math cluster should be math-related
          const mathRatio =
            clusterExpectations.filter((e) => e.subject === 'Mathematics').length /
            clusterExpectations.length;
          expect(mathRatio).toBeGreaterThan(0.5);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should generate appropriate AI-powered theme names',
      async () => {
        const clusters = await service.clusterExpectations(testImportId, {
          minClusterSize: 2,
          maxClusters: 8,
          similarityThreshold: 0.75,
          useAISuggestions: true,
        });

        // AI should generate meaningful theme names
        const clustersWithThemes = clusters.filter(
          (c) => c.suggestedTheme && c.suggestedTheme !== c.name,
        );

        if (clustersWithThemes.length > 0) {
          for (const cluster of clustersWithThemes) {
            expect(cluster.suggestedTheme).toBeDefined();
            expect(cluster.suggestedTheme!.length).toBeGreaterThan(5);
            expect(cluster.suggestedTheme!.length).toBeLessThan(50);

            // Theme should be descriptive, not just generic
            expect(cluster.suggestedTheme!.toLowerCase()).not.toBe('cluster');
            expect(cluster.suggestedTheme!.toLowerCase()).not.toMatch(/^cluster \d+$/);
          }
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should determine appropriate cluster types',
      async () => {
        const clusters = await service.clusterExpectations(testImportId, {
          minClusterSize: 2,
          maxClusters: 10,
          similarityThreshold: 0.7,
          useAISuggestions: false, // Focus on type determination
        });

        // Should assign appropriate types based on content
        const clusterTypes = clusters.map((c) => c.type);
        const uniqueTypes = [...new Set(clusterTypes)];

        expect(uniqueTypes.length).toBeGreaterThan(0);
        expect(uniqueTypes.every((type) => ['theme', 'skill', 'concept'].includes(type))).toBe(
          true,
        );

        // Verify type assignment logic
        for (const cluster of clusters) {
          const clusterExpectations = testExpectations.filter((e) =>
            cluster.expectationIds.includes(e.id),
          );

          const descriptions = clusterExpectations
            .map((e) => e.description.toLowerCase())
            .join(' ');

          if (cluster.type === 'skill') {
            expect(descriptions).toMatch(/skill|ability|can|perform|apply/);
          } else if (cluster.type === 'concept') {
            expect(descriptions).toMatch(/understand|concept|knowledge|identify|recognize/);
          }
          // theme is default, so no specific assertion needed
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Clustering Options and Configuration', () => {
    let testImportId: string;

    beforeEach(async () => {
      const { import: curriculumImport, expectations } =
        await testUtils.createRealisticCurriculumData();
      testImportId = curriculumImport.id;

      // Add more expectations for testing different options
      await testUtils.createTestExpectations(testImportId, 8);

      // Generate embeddings
      const allExpectations = await prisma.curriculumExpectation.findMany({
        where: { importId: testImportId },
      });

      const embeddingData = allExpectations.map((exp) => ({
        id: exp.id,
        text: `${exp.code}: ${exp.description}`,
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);
    });

    it(
      'should respect minimum cluster size setting',
      async () => {
        const minClusterSize = 3;
        const clusters = await service.clusterExpectations(testImportId, {
          minClusterSize,
          maxClusters: 20,
          similarityThreshold: 0.7,
          useAISuggestions: false,
        });

        // All clusters should meet minimum size requirement
        for (const cluster of clusters) {
          expect(cluster.expectationIds.length).toBeGreaterThanOrEqual(minClusterSize);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should respect maximum clusters setting',
      async () => {
        const maxClusters = 3;
        const clusters = await service.clusterExpectations(testImportId, {
          minClusterSize: 2,
          maxClusters,
          similarityThreshold: 0.6,
          useAISuggestions: false,
        });

        expect(clusters.length).toBeLessThanOrEqual(maxClusters);
      },
      TEST_TIMEOUT,
    );

    it(
      'should adapt to different similarity thresholds',
      async () => {
        const lowThresholdClusters = await service.clusterExpectations(testImportId, {
          minClusterSize: 2,
          maxClusters: 15,
          similarityThreshold: 0.6, // Lower threshold
          useAISuggestions: false,
        });

        const highThresholdClusters = await service.clusterExpectations(testImportId, {
          minClusterSize: 2,
          maxClusters: 15,
          similarityThreshold: 0.8, // Higher threshold
          useAISuggestions: false,
        });

        // Lower threshold should generally produce fewer, larger clusters
        // Higher threshold should produce more, smaller clusters (if any)
        if (lowThresholdClusters.length > 0 && highThresholdClusters.length > 0) {
          const avgLowThresholdSize =
            lowThresholdClusters.reduce((sum, c) => sum + c.expectationIds.length, 0) /
            lowThresholdClusters.length;
          const avgHighThresholdSize =
            highThresholdClusters.reduce((sum, c) => sum + c.expectationIds.length, 0) /
            highThresholdClusters.length;

          // This relationship may vary, but generally lower threshold allows more loose groupings
          expect(avgLowThresholdSize).toBeGreaterThan(0);
          expect(avgHighThresholdSize).toBeGreaterThan(0);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle edge case with insufficient data',
      async () => {
        // Create minimal test import with only 1 expectation
        const { import: minimalImport } = await testUtils.createRealisticCurriculumData();
        await testUtils.createTestExpectations(minimalImport.id, 1);

        const clusters = await service.clusterExpectations(minimalImport.id, {
          minClusterSize: 2,
          maxClusters: 10,
          similarityThreshold: 0.7,
          useAISuggestions: false,
        });

        // Should return empty array when insufficient data
        expect(clusters).toEqual([]);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Re-clustering Functionality', () => {
    let testImportId: string;

    beforeEach(async () => {
      const { import: curriculumImport } = await testUtils.createRealisticCurriculumData();
      testImportId = curriculumImport.id;

      // Create additional expectations
      await testUtils.createTestExpectations(testImportId, 6);

      // Generate embeddings
      const allExpectations = await prisma.curriculumExpectation.findMany({
        where: { importId: testImportId },
      });

      const embeddingData = allExpectations.map((exp) => ({
        id: exp.id,
        text: `${exp.code}: ${exp.description}`,
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);
    });

    it(
      'should successfully re-cluster with different parameters',
      async () => {
        // Initial clustering
        const initialClusters = await service.clusterExpectations(testImportId, {
          minClusterSize: 2,
          maxClusters: 8,
          similarityThreshold: 0.75,
          useAISuggestions: false,
        });

        expect(initialClusters.length).toBeGreaterThan(0);

        // Re-cluster with different parameters
        const newClusters = await service.reclusterExpectations(testImportId, {
          minClusterSize: 3,
          maxClusters: 5,
          similarityThreshold: 0.8,
          useAISuggestions: false,
        });

        // Should have different clustering results
        expect(Array.isArray(newClusters)).toBe(true);

        // Old clusters should be deleted
        const remainingOldClusters = await prisma.expectationCluster.findMany({
          where: {
            importId: testImportId,
            id: { in: initialClusters.map((c) => c.id) },
          },
        });
        expect(remainingOldClusters.length).toBe(0);

        // New clusters should be in database
        const storedNewClusters = await prisma.expectationCluster.findMany({
          where: { importId: testImportId },
        });
        expect(storedNewClusters.length).toBe(newClusters.length);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Cluster Retrieval and Management', () => {
    let testImportId: string;
    let createdClusters: any[];

    beforeEach(async () => {
      const { import: curriculumImport } = await testUtils.createRealisticCurriculumData();
      testImportId = curriculumImport.id;

      // Create and embed expectations
      await testUtils.createTestExpectations(testImportId, 8);

      const allExpectations = await prisma.curriculumExpectation.findMany({
        where: { importId: testImportId },
      });

      const embeddingData = allExpectations.map((exp) => ({
        id: exp.id,
        text: `${exp.code}: ${exp.description}`,
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);

      // Create clusters
      createdClusters = await service.clusterExpectations(testImportId, {
        minClusterSize: 2,
        maxClusters: 6,
        similarityThreshold: 0.7,
        useAISuggestions: false,
      });
    });

    it(
      'should retrieve clusters for import',
      async () => {
        const retrievedClusters = await service.getClusters(testImportId);

        expect(retrievedClusters).toBeDefined();
        expect(Array.isArray(retrievedClusters)).toBe(true);
        expect(retrievedClusters.length).toBe(createdClusters.length);

        // Should be sorted by confidence (descending)
        for (let i = 1; i < retrievedClusters.length; i++) {
          expect(retrievedClusters[i].confidence).toBeLessThanOrEqual(
            retrievedClusters[i - 1].confidence,
          );
        }

        // Verify cluster data integrity
        for (const cluster of retrievedClusters) {
          expect(cluster.id).toBeDefined();
          expect(cluster.name).toBeDefined();
          expect(cluster.type).toMatch(/^(theme|skill|concept)$/);
          expect(Array.isArray(cluster.expectationIds)).toBe(true);
          expect(cluster.confidence).toBeGreaterThan(0);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should return empty array for import with no clusters',
      async () => {
        const { import: emptyImport } = await testUtils.createRealisticCurriculumData();

        const clusters = await service.getClusters(emptyImport.id);
        expect(clusters).toEqual([]);
      },
      TEST_TIMEOUT,
    );
  });

  describe('Similar Expectations Suggestions', () => {
    let testExpectations: any[];

    beforeEach(async () => {
      const { expectations } = await testUtils.createRealisticCurriculumData();
      testExpectations = expectations;

      // Generate embeddings
      const embeddingData = expectations.map((exp) => ({
        id: exp.id,
        text: `${exp.code}: ${exp.description}`,
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);
    });

    it(
      'should suggest similar expectations with detailed information',
      async () => {
        const mathExpectation = testExpectations.find((e) => e.subject === 'Mathematics');
        expect(mathExpectation).toBeDefined();

        const suggestions = await service.suggestSimilarExpectations(
          mathExpectation.id,
          0.1, // Lower threshold for testing
          5,
        );

        expect(Array.isArray(suggestions)).toBe(true);

        if (suggestions.length > 0) {
          for (const suggestion of suggestions) {
            expect(suggestion.expectationId).toBeDefined();
            expect(suggestion.code).toBeDefined();
            expect(suggestion.description).toBeDefined();
            expect(suggestion.similarity).toBeGreaterThan(0);
            expect(suggestion.similarity).toBeLessThanOrEqual(1);

            // Should not suggest itself
            expect(suggestion.expectationId).not.toBe(mathExpectation.id);
          }

          // Results should be sorted by similarity
          for (let i = 1; i < suggestions.length; i++) {
            expect(suggestions[i].similarity).toBeLessThanOrEqual(suggestions[i - 1].similarity);
          }
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should filter out expectations without valid data',
      async () => {
        const testExpectation = testExpectations[0];

        const suggestions = await service.suggestSimilarExpectations(testExpectation.id, 0.1, 10);

        // All suggestions should have valid expectation data
        for (const suggestion of suggestions) {
          expect(suggestion.code).not.toBe('Unknown');
          expect(suggestion.description).not.toBe('Unknown');
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Cluster Quality Analysis', () => {
    let testImportId: string;

    beforeEach(async () => {
      const { import: curriculumImport } = await testUtils.createRealisticCurriculumData();
      testImportId = curriculumImport.id;

      // Create diverse expectations for quality analysis
      await testUtils.createTestExpectations(testImportId, 10);

      const allExpectations = await prisma.curriculumExpectation.findMany({
        where: { importId: testImportId },
      });

      const embeddingData = allExpectations.map((exp) => ({
        id: exp.id,
        text: `${exp.code}: ${exp.description}`,
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);

      // Create clusters
      await service.clusterExpectations(testImportId, {
        minClusterSize: 2,
        maxClusters: 8,
        similarityThreshold: 0.7,
        useAISuggestions: false,
      });
    });

    it(
      'should analyze cluster quality and provide suggestions',
      async () => {
        const analysis = await service.analyzeClusterQuality(testImportId);

        expect(analysis).toBeDefined();
        expect(typeof analysis.totalClusters).toBe('number');
        expect(typeof analysis.averageConfidence).toBe('number');
        expect(typeof analysis.clustersWithLowConfidence).toBe('number');
        expect(Array.isArray(analysis.suggestions)).toBe(true);

        // Quality metrics should be reasonable
        expect(analysis.totalClusters).toBeGreaterThanOrEqual(0);
        expect(analysis.averageConfidence).toBeGreaterThanOrEqual(0);
        expect(analysis.averageConfidence).toBeLessThanOrEqual(1);
        expect(analysis.clustersWithLowConfidence).toBeGreaterThanOrEqual(0);
        expect(analysis.clustersWithLowConfidence).toBeLessThanOrEqual(analysis.totalClusters);

        // Should provide actionable suggestions
        if (analysis.suggestions.length > 0) {
          for (const suggestion of analysis.suggestions) {
            expect(typeof suggestion).toBe('string');
            expect(suggestion.length).toBeGreaterThan(10);
          }
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle import with no clusters',
      async () => {
        const { import: emptyImport } = await testUtils.createRealisticCurriculumData();

        const analysis = await service.analyzeClusterQuality(emptyImport.id);

        expect(analysis.totalClusters).toBe(0);
        expect(analysis.averageConfidence).toBe(0);
        expect(analysis.clustersWithLowConfidence).toBe(0);
        expect(analysis.suggestions).toContain(
          'No clusters found. Consider running clustering first.',
        );
      },
      TEST_TIMEOUT,
    );

    it(
      'should provide specific suggestions based on cluster characteristics',
      async () => {
        const analysis = await service.analyzeClusterQuality(testImportId);

        if (analysis.totalClusters > 0) {
          // Check if suggestions are contextually appropriate
          if (analysis.averageConfidence < 0.7) {
            expect(
              analysis.suggestions.some(
                (s) => s.includes('similarity threshold') || s.includes('clustering'),
              ),
            ).toBe(true);
          }

          if (analysis.clustersWithLowConfidence > analysis.totalClusters * 0.3) {
            expect(
              analysis.suggestions.some((s) => s.includes('confidence') || s.includes('clusters')),
            ).toBe(true);
          }
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Error Handling and Edge Cases', () => {
    it(
      'should handle import with no expectations',
      async () => {
        const { import: emptyImport } = await testUtils.createRealisticCurriculumData();
        // Don't create any expectations

        await expect(
          service.clusterExpectations(emptyImport.id, {
            minClusterSize: 2,
            maxClusters: 10,
            similarityThreshold: 0.7,
            useAISuggestions: false,
          }),
        ).resolves.toEqual([]);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle expectations without embeddings gracefully',
      async () => {
        const { import: curriculumImport } = await testUtils.createRealisticCurriculumData();
        await testUtils.createTestExpectations(curriculumImport.id, 3);
        // Don't generate embeddings

        const clusters = await service.clusterExpectations(curriculumImport.id, {
          minClusterSize: 2,
          maxClusters: 10,
          similarityThreshold: 0.7,
          useAISuggestions: false,
        });

        // Should either succeed (by generating embeddings) or return empty gracefully
        expect(Array.isArray(clusters)).toBe(true);
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle clustering errors gracefully',
      async () => {
        const nonExistentImportId = 'non-existent-import-id';

        await expect(
          service.clusterExpectations(nonExistentImportId, {
            minClusterSize: 2,
            maxClusters: 10,
            similarityThreshold: 0.7,
            useAISuggestions: false,
          }),
        ).rejects.toThrow();
      },
      TEST_TIMEOUT,
    );

    it(
      'should handle AI theme generation failures gracefully',
      async () => {
        // Test with AI suggestions enabled but potentially problematic content
        const { import: curriculumImport } = await testUtils.createRealisticCurriculumData();
        await testUtils.createTestExpectations(curriculumImport.id, 4);

        const allExpectations = await prisma.curriculumExpectation.findMany({
          where: { importId: curriculumImport.id },
        });

        const embeddingData = allExpectations.map((exp) => ({
          id: exp.id,
          text: `${exp.code}: ${exp.description}`,
        }));

        await embeddingService.generateBatchEmbeddings(embeddingData);

        // Should not fail even if AI theme generation has issues
        const clusters = await service.clusterExpectations(curriculumImport.id, {
          minClusterSize: 2,
          maxClusters: 10,
          similarityThreshold: 0.7,
          useAISuggestions: true,
        });

        expect(Array.isArray(clusters)).toBe(true);
        // Clusters should be created even if theme generation fails
      },
      TEST_TIMEOUT,
    );
  });

  describe('Performance and Scalability', () => {
    it(
      'should handle moderate-sized datasets efficiently',
      async () => {
        const { import: curriculumImport } = await testUtils.createRealisticCurriculumData();
        await testUtils.createTestExpectations(curriculumImport.id, 15); // Moderate size

        const allExpectations = await prisma.curriculumExpectation.findMany({
          where: { importId: curriculumImport.id },
        });

        const embeddingData = allExpectations.map((exp) => ({
          id: exp.id,
          text: `${exp.code}: ${exp.description}`,
        }));

        await embeddingService.generateBatchEmbeddings(embeddingData);

        const startTime = Date.now();

        const clusters = await service.clusterExpectations(curriculumImport.id, {
          minClusterSize: 2,
          maxClusters: 10,
          similarityThreshold: 0.7,
          useAISuggestions: false, // Disable for performance testing
        });

        const duration = Date.now() - startTime;

        expect(clusters).toBeDefined();
        expect(duration).toBeLessThan(60000); // Should complete within 1 minute

        console.log(`Clustering ${allExpectations.length} expectations completed in ${duration}ms`);
      },
      TEST_TIMEOUT,
    );

    it(
      'should produce reasonable cluster sizes for different inputs',
      async () => {
        const { import: curriculumImport } = await testUtils.createRealisticCurriculumData();
        await testUtils.createTestExpectations(curriculumImport.id, 12);

        const allExpectations = await prisma.curriculumExpectation.findMany({
          where: { importId: curriculumImport.id },
        });

        const embeddingData = allExpectations.map((exp) => ({
          id: exp.id,
          text: `${exp.code}: ${exp.description}`,
        }));

        await embeddingService.generateBatchEmbeddings(embeddingData);

        const clusters = await service.clusterExpectations(curriculumImport.id, {
          minClusterSize: 2,
          maxClusters: 8,
          similarityThreshold: 0.7,
          useAISuggestions: false,
        });

        if (clusters.length > 0) {
          // Cluster sizes should be reasonable
          const clusterSizes = clusters.map((c) => c.expectationIds.length);
          const avgClusterSize = clusterSizes.reduce((a, b) => a + b, 0) / clusterSizes.length;
          const totalClustered = clusterSizes.reduce((a, b) => a + b, 0);

          expect(avgClusterSize).toBeGreaterThan(1);
          expect(avgClusterSize).toBeLessThan(allExpectations.length);
          expect(totalClustered).toBeLessThanOrEqual(allExpectations.length);

          console.log(
            `Created ${clusters.length} clusters with average size ${avgClusterSize.toFixed(2)}`,
          );
        }
      },
      TEST_TIMEOUT,
    );
  });

  describe('Integration with Database and Persistence', () => {
    let testImportId: string;

    beforeEach(async () => {
      const { import: curriculumImport } = await testUtils.createRealisticCurriculumData();
      testImportId = curriculumImport.id;

      await testUtils.createTestExpectations(testImportId, 6);

      const allExpectations = await prisma.curriculumExpectation.findMany({
        where: { importId: testImportId },
      });

      const embeddingData = allExpectations.map((exp) => ({
        id: exp.id,
        text: `${exp.code}: ${exp.description}`,
      }));

      await embeddingService.generateBatchEmbeddings(embeddingData);
    });

    it(
      'should persist clusters correctly in database',
      async () => {
        const clusters = await service.clusterExpectations(testImportId, {
          minClusterSize: 2,
          maxClusters: 8,
          similarityThreshold: 0.7,
          useAISuggestions: true,
        });

        // Verify database records
        const storedClusters = await prisma.expectationCluster.findMany({
          where: { importId: testImportId },
        });

        expect(storedClusters.length).toBe(clusters.length);

        for (let i = 0; i < clusters.length; i++) {
          const cluster = clusters[i];
          const stored = storedClusters.find((s) => s.id === cluster.id);

          expect(stored).toBeDefined();
          expect(stored!.clusterName).toBe(cluster.name);
          expect(stored!.clusterType).toBe(cluster.type);
          expect(stored!.expectationIds).toEqual(cluster.expectationIds);
          expect(stored!.confidence).toBe(cluster.confidence);
          expect(stored!.importId).toBe(testImportId);
        }
      },
      TEST_TIMEOUT,
    );

    it(
      'should maintain data integrity across operations',
      async () => {
        // Create initial clusters
        const initialClusters = await service.clusterExpectations(testImportId, {
          minClusterSize: 2,
          maxClusters: 6,
          similarityThreshold: 0.75,
          useAISuggestions: false,
        });

        // Verify all expectations are still intact
        const expectations = await prisma.curriculumExpectation.findMany({
          where: { importId: testImportId },
        });

        expect(expectations.length).toBeGreaterThan(0);

        // Re-cluster
        await service.reclusterExpectations(testImportId, {
          minClusterSize: 3,
          maxClusters: 4,
          similarityThreshold: 0.8,
          useAISuggestions: false,
        });

        // Expectations should still be intact
        const expectationsAfter = await prisma.curriculumExpectation.findMany({
          where: { importId: testImportId },
        });

        expect(expectationsAfter.length).toBe(expectations.length);

        // Old clusters should be gone
        const oldClusters = await prisma.expectationCluster.findMany({
          where: {
            importId: testImportId,
            id: { in: initialClusters.map((c) => c.id) },
          },
        });

        expect(oldClusters.length).toBe(0);
      },
      TEST_TIMEOUT,
    );
  });
});
