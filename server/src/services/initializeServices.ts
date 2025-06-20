import { serviceRegistry } from './ServiceRegistry';
import { embeddingService } from './embeddingService';
import { curriculumImportService } from './curriculumImportService';
import { clusteringService } from './clusteringService';
import { enhancedPlanningService } from './enhancedPlanningService';
import { enhancedMaterialService } from './enhancedMaterialService';
import { notificationService } from './NotificationService';
import { cacheService } from './CacheService';
import logger from '../logger';

/**
 * Initialize and register all services with the service registry
 */
export async function initializeServices(): Promise<void> {
  try {
    logger.info('Initializing services...');

    // Register core services
    serviceRegistry.register({
      name: 'CacheService',
      instance: cacheService,
      dependencies: [],
      singleton: true,
      healthCheckInterval: 5 * 60 * 1000 // 5 minutes
    });

    serviceRegistry.register({
      name: 'EmbeddingService',
      instance: embeddingService,
      dependencies: ['CacheService'],
      singleton: true,
      healthCheckInterval: 10 * 60 * 1000 // 10 minutes
    });

    serviceRegistry.register({
      name: 'CurriculumImportService',
      instance: curriculumImportService,
      dependencies: ['EmbeddingService'],
      singleton: true
    });

    serviceRegistry.register({
      name: 'ClusteringService',
      instance: clusteringService,
      dependencies: ['EmbeddingService'],
      singleton: true
    });

    serviceRegistry.register({
      name: 'EnhancedPlanningService',
      instance: enhancedPlanningService,
      dependencies: ['EmbeddingService', 'ClusteringService'],
      singleton: true
    });

    serviceRegistry.register({
      name: 'EnhancedMaterialService',
      instance: enhancedMaterialService,
      dependencies: [],
      singleton: true
    });

    serviceRegistry.register({
      name: 'NotificationService',
      instance: notificationService,
      dependencies: [],
      singleton: true,
      healthCheckInterval: 15 * 60 * 1000 // 15 minutes
    });

    // Initialize all services in dependency order
    const { initialized, failed } = await serviceRegistry.initializeAll();

    if (failed.length > 0) {
      logger.error({ failed }, 'Some services failed to initialize');
      throw new Error(`Failed to initialize services: ${failed.map(f => f.serviceName).join(', ')}`);
    }

    logger.info({ initialized }, 'All services initialized successfully');

    // Log initial health status
    const healthStatus = await serviceRegistry.getHealthStatus();
    const unhealthy = healthStatus.filter(s => !s.healthy);
    
    if (unhealthy.length > 0) {
      logger.warn({ unhealthy: unhealthy.map(s => s.serviceName) }, 
        'Some services are unhealthy at startup');
    }
  } catch (error) {
    logger.error({ error }, 'Failed to initialize services');
    throw error;
  }
}

/**
 * Gracefully shutdown all services
 */
export async function shutdownServices(): Promise<void> {
  try {
    logger.info('Shutting down services...');
    
    await serviceRegistry.shutdown();
    
    // Cleanup any resources specific to services
    notificationService.destroy();
    cacheService.destroy();
    
    logger.info('All services shut down successfully');
  } catch (error) {
    logger.error({ error }, 'Error during service shutdown');
  }
}

/**
 * Get service health status for monitoring
 */
export async function getServiceHealth(): Promise<{
  healthy: boolean;
  services: unknown[];
  metrics: unknown[];
}> {
  const healthStatus = await serviceRegistry.getHealthStatus();
  const metrics = serviceRegistry.getAllMetrics();
  
  const healthy = healthStatus.every(s => s.healthy);
  
  return {
    healthy,
    services: healthStatus,
    metrics
  };
}