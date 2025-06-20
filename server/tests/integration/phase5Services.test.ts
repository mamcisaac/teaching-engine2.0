import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { embeddingService } from '../../src/services/embeddingService';
import { curriculumImportService } from '../../src/services/curriculumImportService';
import { clusteringService } from '../../src/services/clusteringService';
import { enhancedPlanningService } from '../../src/services/enhancedPlanningService';
import { enhancedMaterialService } from '../../src/services/enhancedMaterialService';
import { notificationService } from '../../src/services/NotificationService';
import { cacheService } from '../../src/services/CacheService';
import { serviceRegistry } from '../../src/services/ServiceRegistry';

describe('Phase 5 Services Integration', () => {
  beforeAll(() => {
    // Register all Phase 5 services
    serviceRegistry.register({
      name: 'EmbeddingService',
      instance: embeddingService as unknown,
      dependencies: [],
      singleton: true,
    });

    serviceRegistry.register({
      name: 'CurriculumImportService',
      instance: curriculumImportService as unknown,
      dependencies: ['EmbeddingService'],
      singleton: true,
    });

    serviceRegistry.register({
      name: 'ClusteringService',
      instance: clusteringService as unknown,
      dependencies: ['EmbeddingService'],
      singleton: true,
    });

    serviceRegistry.register({
      name: 'EnhancedPlanningService',
      instance: enhancedPlanningService as unknown,
      dependencies: ['ClusteringService'],
      singleton: true,
    });

    serviceRegistry.register({
      name: 'EnhancedMaterialService',
      instance: enhancedMaterialService as unknown,
      dependencies: [],
      singleton: true,
    });

    serviceRegistry.register({
      name: 'NotificationService',
      instance: notificationService,
      dependencies: [],
      singleton: true,
      healthCheckInterval: 60000, // 1 minute
    });

    serviceRegistry.register({
      name: 'CacheService',
      instance: cacheService,
      dependencies: [],
      singleton: true,
    });
  });

  afterAll(async () => {
    await serviceRegistry.shutdown();
  });

  describe('Service Registration', () => {
    it('should have all Phase 5 services registered', () => {
      expect(serviceRegistry.has('EmbeddingService')).toBe(true);
      expect(serviceRegistry.has('CurriculumImportService')).toBe(true);
      expect(serviceRegistry.has('ClusteringService')).toBe(true);
      expect(serviceRegistry.has('EnhancedPlanningService')).toBe(true);
      expect(serviceRegistry.has('EnhancedMaterialService')).toBe(true);
      expect(serviceRegistry.has('NotificationService')).toBe(true);
      expect(serviceRegistry.has('CacheService')).toBe(true);
    });

    it('should retrieve services correctly', () => {
      expect(serviceRegistry.get('EmbeddingService')).toBe(embeddingService);
      expect(serviceRegistry.get('CacheService')).toBe(cacheService);
    });
  });

  describe('Service Dependencies', () => {
    it('should show correct dependency graph', () => {
      const graph = serviceRegistry.getDependencyGraph();

      // Check that CurriculumImportService depends on EmbeddingService
      const importDependency = graph.edges.find(
        (e) => e.from === 'EmbeddingService' && e.to === 'CurriculumImportService',
      );
      expect(importDependency).toBeDefined();

      // Check that EnhancedPlanningService depends on ClusteringService
      const planningDependency = graph.edges.find(
        (e) => e.from === 'ClusteringService' && e.to === 'EnhancedPlanningService',
      );
      expect(planningDependency).toBeDefined();
    });
  });

  describe('Service Health', () => {
    it('should report health status for all services', async () => {
      const healthStatus = await serviceRegistry.getHealthStatus();

      const serviceNames = healthStatus.map((h) => h.serviceName);
      expect(serviceNames).toContain('CacheService');
      expect(serviceNames).toContain('NotificationService');

      // Most services should be healthy (database connection might fail in test env)
      const healthyServices = healthStatus.filter((h) => h.healthy);
      expect(healthyServices.length).toBeGreaterThan(0);
    });
  });

  describe('Service Instantiation', () => {
    it('should have properly instantiated EmbeddingService', () => {
      expect(embeddingService).toBeDefined();
      expect(embeddingService.calculateSimilarity).toBeDefined();
      expect(embeddingService.generateEmbedding).toBeDefined();
    });

    it('should have properly instantiated CurriculumImportService', () => {
      expect(curriculumImportService).toBeDefined();
      expect(curriculumImportService.startImport).toBeDefined();
      expect(curriculumImportService.parseCSV).toBeDefined();
    });

    it('should have properly instantiated ClusteringService', () => {
      expect(clusteringService).toBeDefined();
      expect(clusteringService.clusterOutcomes).toBeDefined();
      expect(clusteringService.suggestSimilarOutcomes).toBeDefined();
    });

    it('should have properly instantiated EnhancedPlanningService', () => {
      expect(enhancedPlanningService).toBeDefined();
      expect(enhancedPlanningService.generateIntelligentSchedule).toBeDefined();
      expect(enhancedPlanningService.suggestActivitySequence).toBeDefined();
    });

    it('should have properly instantiated EnhancedMaterialService', () => {
      expect(enhancedMaterialService).toBeDefined();
      expect(enhancedMaterialService.generateBulkMaterials).toBeDefined();
      expect(enhancedMaterialService.getAvailableTemplates).toBeDefined();
    });

    it('should have properly instantiated NotificationService', () => {
      expect(notificationService).toBeDefined();
      expect(notificationService.sendNotification).toBeDefined();
      expect(notificationService.getTemplates).toBeDefined();
    });

    it('should have properly instantiated CacheService', () => {
      expect(cacheService).toBeDefined();
      expect(cacheService.set).toBeDefined();
      expect(cacheService.get).toBeDefined();
    });
  });

  describe('Basic Service Operations', () => {
    it('should perform basic cache operations', async () => {
      await cacheService.set('test-key', 'test-value');
      const value = await cacheService.get('test-key');
      expect(value).toBe('test-value');

      await cacheService.delete('test-key');
      const deletedValue = await cacheService.get('test-key');
      expect(deletedValue).toBeNull();
    });

    it('should calculate embedding similarity', () => {
      const embedding1 = [1, 0, 0];
      const embedding2 = [1, 0, 0];
      const similarity = embeddingService.calculateSimilarity(embedding1, embedding2);
      expect(similarity).toBe(1);
    });

    it('should parse CSV content', () => {
      const csv = 'code,description,subject,grade\nM1,Test,MATH,1';
      const outcomes = curriculumImportService.parseCSV(csv);
      expect(outcomes).toHaveLength(1);
      expect(outcomes[0].code).toBe('M1');
    });

    it('should get material templates', () => {
      const templates = enhancedMaterialService.getAvailableTemplates();
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
    });

    it('should get notification templates', () => {
      const templates = notificationService.getTemplates();
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });
  });
});
