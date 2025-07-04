import { Router } from 'express';
import { 
  getCacheStats, 
  getCacheMemoryUsage, 
  clearAllCaches, 
  clearCache, 
  isCacheHealthy,
  warmUpCache 
} from '../middleware/cache.js';
import { authMiddleware } from '../middleware/auth.js';
import logger from '../logger.js';

const router = Router();

// All cache management endpoints require authentication
router.use(authMiddleware);

/**
 * Get cache statistics
 * GET /api/cache/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = getCacheStats();
    const memoryUsage = getCacheMemoryUsage();
    const isHealthy = isCacheHealthy();
    
    res.json({
      success: true,
      data: {
        stats,
        memoryUsage,
        isHealthy,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics'
    });
  }
});

/**
 * Get cache health status
 * GET /api/cache/health
 */
router.get('/health', async (req, res) => {
  try {
    const isHealthy = isCacheHealthy();
    const stats = getCacheStats();
    
    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error checking cache health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check cache health'
    });
  }
});

/**
 * Warm up cache with commonly accessed data
 * POST /api/cache/warmup
 */
router.post('/warmup', async (req, res) => {
  try {
    await warmUpCache();
    
    res.json({
      success: true,
      message: 'Cache warm-up completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error warming up cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to warm up cache'
    });
  }
});

/**
 * Clear all caches
 * DELETE /api/cache/all
 */
router.delete('/all', async (req, res) => {
  try {
    clearAllCaches();
    
    logger.info('All caches cleared by user', { userId: req.user?.id });
    
    res.json({
      success: true,
      message: 'All caches cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error clearing all caches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear caches'
    });
  }
});

/**
 * Clear specific cache type
 * DELETE /api/cache/:cacheType
 */
router.delete('/:cacheType', async (req, res) => {
  try {
    const { cacheType } = req.params;
    
    // Validate cache type
    const validCacheTypes = ['api', 'curriculum', 'static', 'user'];
    if (!validCacheTypes.includes(cacheType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid cache type. Valid types: ${validCacheTypes.join(', ')}`
      });
    }
    
    clearCache(cacheType as any);
    
    logger.info(`Cache cleared: ${cacheType}`, { userId: req.user?.id });
    
    res.json({
      success: true,
      message: `Cache '${cacheType}' cleared successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

/**
 * Get cache memory usage
 * GET /api/cache/memory
 */
router.get('/memory', async (req, res) => {
  try {
    const memoryUsage = getCacheMemoryUsage();
    
    // Calculate totals
    const totals = Object.values(memoryUsage).reduce(
      (acc, cache) => ({
        keyCount: acc.keyCount + cache.keyCount,
        hits: acc.hits + cache.hits,
        misses: acc.misses + cache.misses,
        ksize: acc.ksize + cache.ksize,
        vsize: acc.vsize + cache.vsize
      }),
      { keyCount: 0, hits: 0, misses: 0, ksize: 0, vsize: 0 }
    );
    
    res.json({
      success: true,
      data: {
        caches: memoryUsage,
        totals,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting cache memory usage:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache memory usage'
    });
  }
});

export default router;