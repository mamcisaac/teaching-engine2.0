import type { Request, Response } from 'express';
import { Router } from 'express';

import { logger } from '../logger';
import { authMiddleware } from '../middleware/auth';
import { metricsStore, getPerformanceSummary } from '../middleware/metrics';
import { getUserId } from '../utils/authHelpers';
import type { AuthenticatedRequest } from './base/middleware';

const router = Router();

/**
 * Prometheus metrics endpoint (no auth required for monitoring tools)
 * GET /metrics
 */
router.get('/', (_req: Request, res: Response): void => {
  try {
    const prometheusFormat = metricsStore.getPrometheusFormat();

    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(prometheusFormat);
  } catch (_error) {
    logger.error('Error generating Prometheus metrics:', _error as string | undefined);
    res.status(500).send('Error generating metrics');
  }
});

/**
 * JSON metrics endpoint (requires authentication)
 * GET /api/metrics/json
 */
router.get('/json', authMiddleware, (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const metrics = metricsStore.getMetrics();

    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (_error) {
    logger.error('Error getting JSON metrics:', _error as string | undefined);
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics',
    });
    return;
  }
});

/**
 * Performance summary endpoint
 * GET /api/metrics/summary
 */
router.get('/summary', authMiddleware, (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const summary = getPerformanceSummary();

    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (_error) {
    logger.error('Error getting performance summary:', _error as string | undefined);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance summary',
    });
    return;
  }
});

/**
 * Health check with performance data
 * GET /api/metrics/health
 */
router.get('/health', authMiddleware, (_req: AuthenticatedRequest, res: Response): void => {
  try {
    const summary = getPerformanceSummary();

    // Determine health status based on metrics
    let status = 'healthy';
    const issues = [];

    // Check error rates
    if (summary.http.errorRate > 10) {
      status = 'degraded';
      issues.push(`High HTTP error rate: ${summary.http.errorRate.toFixed(2)}%`);
    }

    if (summary.database.errorRate > 5) {
      status = 'degraded';
      issues.push(`High database error rate: ${summary.database.errorRate.toFixed(2)}%`);
    }

    // Check response times
    if (summary.http.responseTime.p95 && summary.http.responseTime.p95 > 2000) {
      status = status === 'healthy' ? 'degraded' : 'unhealthy';
      issues.push(`Slow response times: P95 ${summary.http.responseTime.p95}ms`);
    }

    // Check memory usage (assume 1GB limit for now)
    if (summary.system.memoryUsage > 1024 * 1024 * 1024) {
      status = status === 'healthy' ? 'degraded' : 'unhealthy';
      issues.push(`High memory usage: ${(summary.system.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check cache performance
    if (summary.cache.hitRate < 50 && summary.cache.totalHits + summary.cache.totalMisses > 100) {
      issues.push(`Low cache hit rate: ${summary.cache.hitRate.toFixed(2)}%`);
    }

    res.json({
      success: true,
      data: {
        status,
        issues,
        summary,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
    return;
  } catch (_error) {
    logger.error('Error getting health metrics:', _error as string | undefined);
    res.status(500).json({
      success: false,
      message: 'Failed to get health metrics',
    });
    return;
  }
});

/**
 * Reset metrics (development/testing only)
 * DELETE /api/metrics/reset
 */
router.delete('/reset', authMiddleware, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only allow in development/test environments
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({
        success: false,
        message: 'Metrics reset not allowed in production',
      });
      return;
    }

    metricsStore.reset();

    const userId = getUserId(req, res);
    logger.info(`Metrics reset by user ${userId || 'unknown'}`);

    res.json({
      success: true,
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (_error) {
    logger.error('Error resetting metrics:', _error as string | undefined);
    res.status(500).json({
      success: false,
      message: 'Failed to reset metrics',
    });
    return;
  }
});

/**
 * Real-time metrics for dashboard
 * GET /api/metrics/realtime
 */
router.get('/realtime', authMiddleware, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const summary = getPerformanceSummary();
    const metrics = metricsStore.getMetrics();

    // Get recent activity (last 10 metrics)
    const recentActivity = metrics.recent.slice(-10);

    // Calculate current rates (requests per minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = recentActivity.filter(
      (m) => m.name === 'http_requests_total' && m.timestamp > oneMinuteAgo,
    );

    const requestsPerMinute = recentRequests.length;

    res.json({
      success: true,
      data: {
        current: {
          requestsPerMinute,
          activeConnections: metrics.gauges.active_connections || 0,
          memoryUsage: summary.system.memoryUsage,
          cpuUsage: summary.system.cpuUsage,
          cacheHitRate: summary.cache.hitRate,
        },
        summary,
        recentActivity: recentActivity.slice(-5), // Last 5 metrics
      },
      timestamp: new Date().toISOString(),
    });
    return;
  } catch (_error) {
    logger.error('Error getting realtime metrics:', _error as string | undefined);
    res.status(500).json({
      success: false,
      message: 'Failed to get realtime metrics',
    });
    return;
  }
});

export { router };
