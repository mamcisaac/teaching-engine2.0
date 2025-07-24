import type { Request, Response } from 'express';
import { Router } from 'express';

import { logger } from '../logger.js';
import { authMiddleware } from '../middleware/auth';
import { cache, CacheUtils } from '../services/cache';

import type { AuthenticatedRequest } from './base/middleware';

const router = Router();

// All cache management endpoints require authentication
router.use(authMiddleware);

/**
 * Get cache statistics
 * GET /api/cache/stats
 */
router.get('/stats', async (_req: Request, res: Response) => {

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
        timestamp: new Date().toISOString(),
      },
    });
    return;
  } catch (_error) {
    logger.error('Error getting cache stats:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics',
    });
    return;
  }

});

/**
 * Get cache health status
 * GET /api/cache/health
 */
router.get('/health', async (_req: Request, res: Response) => {

    try {
    const health = await CacheUtils.getHealth();

    res.json({
      success: true,
      data: {
        healthy: health.healthy,
        type: health.type,
        stats: health.stats,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  } catch (_error) {
    logger.error('Error checking cache health:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to check cache health',
    });
    return;
  }

});

/**
 * Warm up cache with commonly accessed data
 * POST /api/cache/warmup
 */
router.post('/warmup', async (_req: Request, res: Response) => {

    try {
    await CacheUtils.warmUp();

    res.json({
      success: true,
      message: 'Cache warm-up completed',
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (_error) {
    logger.error('Error warming up cache:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to warm up cache',
    });
    return;
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

    logger.info(`All caches cleared by user ${req.user.id}`);

    res.json({
      success: true,
      message: 'All caches cleared successfully',
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (_error) {
    logger.error('Error clearing all caches:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear caches',
    });
    return;
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
      res.status(400).json({
        success: false,
        message: 'Pattern is required',
      });
      return;
    }

    const cacheService = cache();
    const deleted = await cacheService.deleteByPattern(pattern);

    logger.info(
      `Cache cleared by pattern: ${pattern} by user ${req.user.id}, deleted: ${deleted}`,
    );

    res.json({
      success: true,
      message: `Cache cleared by pattern successfully`,
      deleted,
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (_error) {
    logger.error('Error clearing cache by pattern:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
    });
    return;
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
      res.status(400).json({
        success: false,
        message: 'Tags array is required',
      });
      return;
    }

    const cacheService = cache();
    const deleted = await cacheService.invalidateByTags(tags);

    logger.info(
      `Cache invalidated by tags: ${tags.join(', ')} by user ${req.user.id}, deleted: ${deleted}`,
    );

    res.json({
      success: true,
      message: `Cache invalidated by tags successfully`,
      deleted,
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (_error) {
    logger.error('Error invalidating cache by tags:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to invalidate cache',
    });
    return;
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
      res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
      return;
    }

    await CacheUtils.clearUserCache(userIdNumber);

    logger.info(`User cache cleared for user ${userId} by user ${req.user.id}`);

    res.json({
      success: true,
      message: `User cache cleared successfully`,
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (_error) {
    logger.error('Error clearing user cache:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear user cache',
    });
    return;
  }

});

export { router };
