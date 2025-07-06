import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { AuthenticatedRequest } from './base/middleware';
import logger from '../logger.js';
import { cache, CacheUtils } from '../services/cache';

const router = Router();

// All cache management endpoints require authentication
router.use(authMiddleware);

/**
 * Get cache statistics
 * GET /api/cache/stats
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const cacheService = cache();
    const stats = cacheService.getStats();
    const health = await CacheUtils.getHealth();
    
    res.json({
      success: true,
      data: {
        stats,
        type: health.type,
        isHealthy: health.healthy,
        timestamp: new Date().toISOString()
      }
    });
  } catch (_error) {
    logger.error('Error getting cache stats:', _error);
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
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await CacheUtils.getHealth();
    
    res.json({
      success: true,
      data: {
        healthy: health.healthy,
        type: health.type,
        stats: health.stats,
        timestamp: new Date().toISOString()
      }
    });
  } catch (_error) {
    logger.error('Error checking cache health:', _error);
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
router.post('/warmup', async (req: Request, res: Response) => {
  try {
    await CacheUtils.warmUp();
    
    res.json({
      success: true,
      message: 'Cache warm-up completed',
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    logger.error('Error warming up cache:', _error);
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
router.delete('/all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const cacheService = cache();
    await cacheService.clear();
    
    logger.info(`All caches cleared by user ${req.user?.id}`);
    
    res.json({
      success: true,
      message: 'All caches cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    logger.error('Error clearing all caches:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear caches'
    });
  }
});

/**
 * Clear cache by pattern
 * DELETE /api/cache/pattern
 */
router.delete('/pattern', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pattern } = req.body;
    
    if (!pattern) {
      return res.status(400).json({
        success: false,
        message: 'Pattern is required'
      });
    }
    
    const cacheService = cache();
    const deleted = await cacheService.deleteByPattern(pattern);
    
    logger.info(`Cache cleared by pattern: ${pattern} by user ${req.user?.id}, deleted: ${deleted}`);
    
    res.json({
      success: true,
      message: `Cache cleared by pattern successfully`,
      deleted,
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    logger.error('Error clearing cache by pattern:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

/**
 * Clear cache by tags
 * DELETE /api/cache/tags
 */
router.delete('/tags', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tags } = req.body;
    
    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: 'Tags array is required'
      });
    }
    
    const cacheService = cache();
    const deleted = await cacheService.invalidateByTags(tags);
    
    logger.info(`Cache invalidated by tags: ${tags.join(', ')} by user ${req.user?.id}, deleted: ${deleted}`);
    
    res.json({
      success: true,
      message: `Cache invalidated by tags successfully`,
      deleted,
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    logger.error('Error invalidating cache by tags:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache'
    });
  }
});

/**
 * Clear user-specific cache
 * DELETE /api/cache/user/:userId
 */
router.delete('/user/:userId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const userIdNumber = parseInt(userId, 10);
    
    if (isNaN(userIdNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    await CacheUtils.clearUserCache(userIdNumber);
    
    logger.info(`User cache cleared for user ${userId} by user ${req.user?.id}`);
    
    res.json({
      success: true,
      message: `User cache cleared successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    logger.error('Error clearing user cache:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear user cache'
    });
  }
});

export default router;