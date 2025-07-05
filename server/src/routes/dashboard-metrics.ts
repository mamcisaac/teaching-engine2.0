import { Router } from 'express';
import { getPerformanceSummary, metricsStore } from '../middleware/metrics.js';
import { getCacheStats } from '../middleware/cache.js';
import { authMiddleware } from '../middleware/auth.js';
import { prisma } from '../prisma.js';
import logger from '../logger.js';

const router = Router();

// All dashboard metrics require authentication
router.use(authMiddleware);

/**
 * Dashboard overview metrics
 * GET /api/dashboard/metrics
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const performanceSummary = getPerformanceSummary();
    const cacheStats = getCacheStats();
    
    // Get database connection info
    let dbStatus = 'healthy';
    let dbInfo = {};
    
    try {
      // Simple database health check
      await prisma.$queryRaw`SELECT 1`;
      
      // Get basic database stats if available
      const userCount = await prisma.user.count();
      const planCount = await prisma.unitPlan.count();
      const lessonCount = await prisma.eTFOLessonPlan.count();
      
      dbInfo = {
        totalUsers: userCount,
        totalUnitPlans: planCount,
        totalLessonPlans: lessonCount,
        lastChecked: new Date().toISOString()
      };
    } catch (_error) {
      dbStatus = 'unhealthy';
      logger.error('Database health check failed:', _error);
    }
    
    res.json({
      success: true,
      data: {
        performance: performanceSummary,
        cache: {
          stats: cacheStats,
          hitRateOverall: calculateOverallCacheHitRate(cacheStats)
        },
        database: {
          status: dbStatus,
          info: dbInfo
        },
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version,
          platform: process.platform,
          env: process.env.NODE_ENV
        },
        application: {
          version: process.env.npm_package_version || '0.0.0',
          startTime: new Date(Date.now() - process.uptime() * 1000).toISOString()
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    logger.error('Error getting dashboard metrics:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard metrics'
    });
  }
});

/**
 * Performance trends over time
 * GET /api/dashboard/trends
 */
router.get('/trends', async (req: Request, res: Response) => {
  try {
    const metrics = metricsStore.getMetrics();
    
    // Get recent metrics for trending
    const now = Date.now();
    const timeRanges = {
      last5min: now - 5 * 60 * 1000,
      last15min: now - 15 * 60 * 1000,
      last1hour: now - 60 * 60 * 1000
    };
    
    const trends = {
      requests: {
        last5min: metrics.recent.filter(m => 
          m.name === 'http_requests_total' && m.timestamp > timeRanges.last5min
        ).length,
        last15min: metrics.recent.filter(m => 
          m.name === 'http_requests_total' && m.timestamp > timeRanges.last15min
        ).length,
        last1hour: metrics.recent.filter(m => 
          m.name === 'http_requests_total' && m.timestamp > timeRanges.last1hour
        ).length
      },
      errors: {
        last5min: metrics.recent.filter(m => 
          m.name === 'http_errors_total' && m.timestamp > timeRanges.last5min
        ).length,
        last15min: metrics.recent.filter(m => 
          m.name === 'http_errors_total' && m.timestamp > timeRanges.last15min
        ).length,
        last1hour: metrics.recent.filter(m => 
          m.name === 'http_errors_total' && m.timestamp > timeRanges.last1hour
        ).length
      }
    };
    
    // Calculate rates per minute
    const rates = {
      requestsPerMin5min: trends.requests.last5min / 5,
      requestsPerMin15min: trends.requests.last15min / 15,
      requestsPerMin1hour: trends.requests.last1hour / 60,
      errorsPerMin5min: trends.errors.last5min / 5,
      errorsPerMin15min: trends.errors.last15min / 15,
      errorsPerMin1hour: trends.errors.last1hour / 60
    };
    
    res.json({
      success: true,
      data: {
        trends,
        rates,
        timeRanges: {
          last5min: new Date(timeRanges.last5min).toISOString(),
          last15min: new Date(timeRanges.last15min).toISOString(),
          last1hour: new Date(timeRanges.last1hour).toISOString(),
          now: new Date(now).toISOString()
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    logger.error('Error getting performance trends:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance trends'
    });
  }
});

/**
 * Resource usage insights
 * GET /api/dashboard/resources
 */
router.get('/resources', async (req: Request, res: Response) => {
  try {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Convert memory to MB for readability
    const memoryMB = {
      rss: Math.round(memUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024)
    };
    
    // Calculate heap usage percentage
    const heapUsagePercent = (memoryMB.heapUsed / memoryMB.heapTotal) * 100;
    
    res.json({
      success: true,
      data: {
        memory: {
          ...memoryMB,
          heapUsagePercent: Math.round(heapUsagePercent * 100) / 100,
          unit: 'MB'
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
          userMs: cpuUsage.user / 1000,
          systemMs: cpuUsage.system / 1000
        },
        process: {
          pid: process.pid,
          uptime: process.uptime(),
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    logger.error('Error getting resource usage:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to get resource usage'
    });
  }
});

/**
 * Application insights (user activity, popular features)
 * GET /api/dashboard/insights
 */
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    // Get user-specific insights
    const insights = await Promise.all([
      // Recent activity counts
      prisma.recentPlanAccess.count({
        where: { userId }
      }),
      
      // Active unit plans
      prisma.unitPlan.count({
        where: { userId }
      }),
      
      // Lesson plans this month
      prisma.eTFOLessonPlan.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setDate(1)) // First day of current month
          }
        }
      }),
      
      // Newsletter drafts
      prisma.newsletter.count({
        where: {
          userId,
          isDraft: true
        }
      })
    ]);
    
    const [recentAccess, unitPlans, monthlyLessons, drafts] = insights;
    
    res.json({
      success: true,
      data: {
        userActivity: {
          recentPlanAccess: recentAccess,
          activeUnitPlans: unitPlans,
          lessonPlansThisMonth: monthlyLessons,
          newsletterDrafts: drafts
        },
        productivity: {
          plansPerWeek: monthlyLessons / 4, // Rough estimate
          averageAccessPerPlan: unitPlans > 0 ? recentAccess / unitPlans : 0
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (_error) {
    logger.error('Error getting application insights:', _error);
    res.status(500).json({
      success: false,
      message: 'Failed to get application insights'
    });
  }
});

/**
 * Calculate overall cache hit rate from cache stats
 */
function calculateOverallCacheHitRate(cacheStats: unknown): number {
  let totalHits = 0;
  let totalRequests = 0;
  
  Object.values(cacheStats).forEach((cache: unknown) => {
    totalHits += cache.hits;
    totalRequests += cache.hits + cache.misses;
  });
  
  return totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
}

export default router;