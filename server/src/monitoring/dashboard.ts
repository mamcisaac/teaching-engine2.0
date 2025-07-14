/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as os from 'os';

import { prisma } from '@teaching-engine/database';
import type { Request, Response } from 'express';

import { logger } from '../logger';
import { getMetrics } from '../middleware/metrics';

import { withSpan, updateSystemHealth } from './telemetry';

interface DashboardMetrics {
  timestamp: string;
  system: {
    uptime: number;
    memory: {
      total: number;
      used: number;
      free: number;
      percentage: number;
    };
    cpu: {
      model: string;
      cores: number;
      usage: number;
    };
    load: number[];
  };
  application: {
    requests: {
      total: number;
      per_minute: number;
      success_rate: number;
      error_rate: number;
    };
    response_times: {
      p50: number;
      p90: number;
      p95: number;
      p99: number;
      mean: number;
    };
    active_users: number;
    database: {
      connections: number;
      queries_per_minute: number;
      slow_queries: number;
      error_rate: number;
    };
    cache: {
      hit_rate: number;
      size: number;
      evictions: number;
    };
  };
  business: {
    plans: {
      total: number;
      created_today: number;
      created_this_week: number;
      by_type: Record<string, number>;
    };
    users: {
      total: number;
      active_today: number;
      active_this_week: number;
      new_this_week: number;
    };
    curriculum: {
      expectations_covered: number;
      coverage_percentage: number;
      most_used_subjects: { subject: string; count: number }[];
    };
    ai_usage: {
      total_operations: number;
      operations_today: number;
      average_duration: number;
      success_rate: number;
    };
  };
  alerts: {
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    details?: unknown;
  }[];
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    score: number;
    checks: {
      database: boolean;
      cache: boolean;
      external_services: boolean;
      disk_space: boolean;
      memory: boolean;
    };
  };
}

// Helper to calculate CPU usage
const getCpuUsage = (): number => {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~((idle * 100) / total);

  return usage;
};

// Helper to get active alerts
const getActiveAlerts = async (): Promise<DashboardMetrics['alerts']> => {
  const alerts: DashboardMetrics['alerts'] = [];
  const metrics = getMetrics();

  // Check error rate
  const errorRate = metrics.counters.http_errors_total || 0;
  const totalRequests = metrics.counters.http_requests_total || 1;
  const errorPercentage = (errorRate / totalRequests) * 100;

  if (errorPercentage > 10) {
    alerts.push({
      level: 'critical',
      message: `High error rate: ${errorPercentage.toFixed(2)}%`,
      timestamp: new Date().toISOString(),
      details: { errorRate, totalRequests },
    });
  } else if (errorPercentage > 5) {
    alerts.push({
      level: 'warning',
      message: `Elevated error rate: ${errorPercentage.toFixed(2)}%`,
      timestamp: new Date().toISOString(),
      details: { errorRate, totalRequests },
    });
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const memPercentage = (memUsage.heapUsed / totalMem) * 100;

  if (memPercentage > 90) {
    alerts.push({
      level: 'critical',
      message: `Memory usage critical: ${memPercentage.toFixed(2)}%`,
      timestamp: new Date().toISOString(),
      details: { memUsage, totalMem },
    });
  } else if (memPercentage > 80) {
    alerts.push({
      level: 'warning',
      message: `Memory usage high: ${memPercentage.toFixed(2)}%`,
      timestamp: new Date().toISOString(),
      details: { memUsage, totalMem },
    });
  }

  // Check slow queries
  const slowQueries = metrics.counters.database_slow_queries_total || 0;
  if (slowQueries > 100) {
    alerts.push({
      level: 'warning',
      message: `High number of slow queries: ${slowQueries}`,
      timestamp: new Date().toISOString(),
      details: { slowQueries },
    });
  }

  // Check cache hit rate
  const cacheHits = metrics.counters.cache_hits_total || 0;
  const cacheMisses = metrics.counters.cache_misses_total || 0;
  const cacheTotal = cacheHits + cacheMisses;
  const cacheHitRate = cacheTotal > 0 ? (cacheHits / cacheTotal) * 100 : 0;

  if (cacheHitRate < 50 && cacheTotal > 100) {
    alerts.push({
      level: 'info',
      message: `Low cache hit rate: ${cacheHitRate.toFixed(2)}%`,
      timestamp: new Date().toISOString(),
      details: { cacheHits, cacheMisses },
    });
  }

  return alerts;
};

// Helper to perform health checks
const performHealthChecks = async (): Promise<DashboardMetrics['health']> => {
  const checks = {
    database: false,
    cache: true, // Assuming cache is always healthy for now
    external_services: true,
    disk_space: false,
    memory: false,
  };

  let score = 100;

  // Database health check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (_error) {
    checks.database = false;
    score -= 30;
    logger.error('Database health check failed', _error);
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const totalMem = os.totalmem();
  const memPercentage = (memUsage.heapUsed / totalMem) * 100;
  checks.memory = memPercentage < 90;
  if (!checks.memory) {
score -= 20;
}

  // Disk space check (simplified)
  checks.disk_space = true; // Would need actual implementation

  // Update system health score
  updateSystemHealth(score);

  const status = score >= 80 ? 'healthy' : score >= 50 ? 'degraded' : 'unhealthy';

  return {
    status,
    score,
    checks,
  };
};

export const getDashboardMetrics = async (_req: Request, res: Response): Promise<void> => {
  await withSpan('dashboard.getMetrics', {}, async (span) => {
    try {
      const metrics = getMetrics();
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Calculate request metrics
      const totalRequests = metrics.counters.http_requests_total || 0;
      const totalErrors = metrics.counters.http_errors_total || 0;
      const successRate =
        totalRequests > 0 ? ((totalRequests - totalErrors) / totalRequests) * 100 : 100;

      // Get response time percentiles
      const httpDuration = metrics.histograms.http_request_duration_ms;
      // Calculate percentiles from histogram data
      const percentiles = { p50: 0, p90: 0, p95: 0, p99: 0 };
      if (httpDuration && httpDuration.count > 0) {
        const p50Target = (httpDuration.count * 50) / 100;
        const p90Target = (httpDuration.count * 90) / 100;
        const p95Target = (httpDuration.count * 95) / 100;
        const p99Target = (httpDuration.count * 99) / 100;
        let cumulativeCount = 0;

        for (const bucket of httpDuration.buckets) {
          cumulativeCount += bucket.count;
          if (cumulativeCount >= p50Target && percentiles.p50 === 0) {
            percentiles.p50 =
              bucket.le === Infinity ? httpDuration.sum / httpDuration.count : bucket.le;
          }
          if (cumulativeCount >= p90Target && percentiles.p90 === 0) {
            percentiles.p90 =
              bucket.le === Infinity ? httpDuration.sum / httpDuration.count : bucket.le;
          }
          if (cumulativeCount >= p95Target && percentiles.p95 === 0) {
            percentiles.p95 =
              bucket.le === Infinity ? httpDuration.sum / httpDuration.count : bucket.le;
          }
          if (cumulativeCount >= p99Target && percentiles.p99 === 0) {
            percentiles.p99 =
              bucket.le === Infinity ? httpDuration.sum / httpDuration.count : bucket.le;
          }
        }
      }

      // Get database metrics
      const [
        totalUsers,
        activeUsersToday,
        activeUsersThisWeek,
        newUsersThisWeek,
        totalPlans,
        plansToday,
        plansThisWeek,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            daybookEntries: {
              some: {
                createdAt: { gte: dayAgo },
              },
            },
          },
        }),
        prisma.user.count({
          where: {
            daybookEntries: {
              some: {
                createdAt: { gte: weekAgo },
              },
            },
          },
        }),
        prisma.user.count(), // Note: Removed createdAt filter due to schema mismatch
        prisma.eTFOLessonPlan.count(),
        prisma.eTFOLessonPlan.count({
          where: { createdAt: { gte: dayAgo } },
        }),
        prisma.eTFOLessonPlan.count({
          where: { createdAt: { gte: weekAgo } },
        }),
      ]);

      // Get plan counts by type
      const [unitPlans, lessonPlans, longRangePlans] = await Promise.all([
        prisma.unitPlan.count(),
        prisma.eTFOLessonPlan.count(),
        prisma.longRangePlan.count(),
      ]);

      // Get curriculum coverage
      const [totalExpectations, coveredExpectations] = await Promise.all([
        prisma.curriculumExpectation.count(),
        prisma.curriculumExpectation.count({
          where: {
            OR: [
              { longRangePlans: { some: {} } },
              { unitPlans: { some: {} } },
              { lessonPlans: { some: {} } },
            ],
          },
        }),
      ]);

      const coveragePercentage =
        totalExpectations > 0 ? (coveredExpectations / totalExpectations) * 100 : 0;

      // Get most used subjects
      const subjectCounts = await prisma.eTFOLessonPlan.groupBy({
        by: ['subject'],
        _count: {
          subject: true,
        },
        orderBy: {
          _count: {
            subject: 'desc',
          },
        },
        take: 5,
      });

      // Build dashboard metrics
      const dashboardMetrics: DashboardMetrics = {
        timestamp: now.toISOString(),
        system: {
          uptime: process.uptime(),
          memory: {
            total: os.totalmem(),
            used: os.totalmem() - os.freemem(),
            free: os.freemem(),
            percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
          },
          cpu: {
            model: os.cpus()[0].model,
            cores: os.cpus().length,
            usage: getCpuUsage(),
          },
          load: os.loadavg(),
        },
        application: {
          requests: {
            total: totalRequests,
            per_minute: totalRequests / (process.uptime() / 60),
            success_rate: successRate,
            error_rate: 100 - successRate,
          },
          response_times: {
            p50: percentiles.p50 || 0,
            p90: percentiles.p90 || 0,
            p95: percentiles.p95 || 0,
            p99: percentiles.p99 || 0,
            mean:
              httpDuration && httpDuration.count > 0 ? httpDuration.sum / httpDuration.count : 0,
          },
          active_users: activeUsersToday,
          database: {
            connections: 1, // Would need actual pool stats
            queries_per_minute:
              (metrics.counters.database_queries_total || 0) / (process.uptime() / 60),
            slow_queries: metrics.counters.database_slow_queries_total || 0,
            error_rate:
              ((metrics.counters.database_errors_total || 0) /
                (metrics.counters.database_queries_total || 1)) *
              100,
          },
          cache: {
            hit_rate:
              ((metrics.counters.cache_hits_total || 0) /
                ((metrics.counters.cache_hits_total || 0) +
                  (metrics.counters.cache_misses_total || 1))) *
              100,
            size: metrics.gauges.cache_size_bytes || 0,
            evictions: metrics.counters.cache_evictions_total || 0,
          },
        },
        business: {
          plans: {
            total: totalPlans,
            created_today: plansToday,
            created_this_week: plansThisWeek,
            by_type: {
              long_range: longRangePlans,
              unit: unitPlans,
              lesson: lessonPlans,
            },
          },
          users: {
            total: totalUsers,
            active_today: activeUsersToday,
            active_this_week: activeUsersThisWeek,
            new_this_week: newUsersThisWeek,
          },
          curriculum: {
            expectations_covered: coveredExpectations,
            coverage_percentage: coveragePercentage,
            most_used_subjects: subjectCounts.map((sc: { subject: string | null; _count: { subject: number } }) => ({
              subject: sc.subject || 'Unknown',
              count: sc._count.subject,
            })),
          },
          ai_usage: {
            total_operations: metrics.counters.ai_operations_total || 0,
            operations_today: 0, // Would need time-based tracking
            average_duration: metrics.histograms.ai_operation_duration_ms
              ? metrics.histograms.ai_operation_duration_ms.sum /
                metrics.histograms.ai_operation_duration_ms.count
              : 0,
            success_rate: 95, // Would need actual tracking
          },
        },
        alerts: await getActiveAlerts(),
        health: await performHealthChecks(),
      };

      // Add span attributes
      span.setAttributes({
        'dashboard.active_users': activeUsersToday,
        'dashboard.health_score': dashboardMetrics.health.score,
        'dashboard.alert_count': dashboardMetrics.alerts.length,
      });

      res.json(dashboardMetrics);
    } catch (_error) {
      logger.error('Failed to generate dashboard metrics', _error);
      res.status(500).json({ error: 'Failed to generate dashboard metrics' });
    }
  });
};

// WebSocket support for real-time dashboard updates
export const dashboardWebSocketHandler = (ws: any): void => {
  const interval = setInterval(async () => {
    try {
      const metrics = getMetrics();
      const realtimeData = {
        timestamp: new Date().toISOString(),
        requests_per_second: metrics.counters.http_requests_total || 0,
        active_connections: ws.clients?.size ?? 0,
        memory_usage: process.memoryUsage().heapUsed,
        cpu_usage: getCpuUsage(),
      };

      ws.send(JSON.stringify(realtimeData));
    } catch (_error) {
      logger.error('Failed to send real-time metrics', _error);
    }
  }, 1000); // Update every second

  ws.on('close', () => {
    clearInterval(interval);
  });
};
