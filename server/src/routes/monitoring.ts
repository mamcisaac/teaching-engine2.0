import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getDashboardMetrics } from '../monitoring/dashboard';
import { getAlertStatus, triggerManualAlert } from '../monitoring/alerting';
import { logger } from '../logger';
import { withSpan } from '../monitoring/telemetry';

const router = Router();

// Dashboard metrics endpoint
router.get('/dashboard', authenticate, async (req, res) => {
  await withSpan('api.monitoring.dashboard', async () => {
    await getDashboardMetrics(req, res);
  });
});

// Alert status endpoint
router.get('/alerts', authenticate, async (req, res) => {
  await withSpan('api.monitoring.alerts', async () => {
    try {
      const status = getAlertStatus();
      res.json(status);
    } catch (_error) {
      logger.error('Failed to get alert status', error);
      res.status(500).json({ error: 'Failed to get alert status' });
    }
  });
});

// Manual alert trigger (for testing)
router.post('/alerts/:alertId/trigger', authenticate, async (req, res) => {
  await withSpan('api.monitoring.triggerAlert', async (span) => {
    try {
      const { alertId } = req.params;
      const { context } = req.body;

      span.setAttributes({
        'alert.id': alertId,
        'alert.manual': true,
      });

      await triggerManualAlert(alertId, context);
      res.json({ success: true, message: `Alert ${alertId} triggered` });
    } catch (_error) {
      logger.error('Failed to trigger manual alert', error);
      res.status(500).json({ error: 'Failed to trigger alert' });
    }
  });
});

// Health check endpoint with detailed status
router.get('/health/detailed', async (req, res) => {
  await withSpan('api.monitoring.healthDetailed', async (span) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid,
        version: process.env.npm_package_version || 'unknown',
        node: process.version,
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: false,
          cache: true,
          monitoring: true,
        },
      };

      // Check database
      try {
        const { prisma } = await import('@teaching-engine/database');
        await prisma.$queryRaw`SELECT 1`;
        health.services.database = true;
      } catch (_error) {
        health.status = 'degraded';
        health.services.database = false;
      }

      span.setAttributes({
        'health.status': health.status,
        'health.database': health.services.database,
        'health.uptime': health.uptime,
      });

      const statusCode = health.status === 'healthy' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (_error) {
      logger.error('Health check failed', error);
      res.status(503).json({
        status: 'unhealthy',
        error: 'Health check failed',
      });
    }
  });
});

export default router;