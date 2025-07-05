/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { logger } from '../logger';
import { getMetrics } from '../middleware/metrics';
import { prisma } from '@teaching-engine/database';
import { withSpan, errorCounter } from './telemetry';
import nodemailer from 'nodemailer';

interface Alert {
  id: string;
  name: string;
  condition: () => Promise<boolean>;
  message: (context: AlertContext) => string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  cooldown: number; // Minutes before re-alerting
  channels: Array<'log' | 'email' | 'webhook'>;
}

interface AlertState {
  lastTriggered: Map<string, Date>;
  active: Map<string, boolean>;
}

interface AlertContext {
  errorRate?: number;
  percentage?: number;
  p95?: number;
  p99?: number;
  mean?: number;
  hitRate?: number;
  count?: number;
  errorCount?: number;
  totalRequests?: number;
  totalOperations?: number;
  heapUsed?: number;
  heapTotal?: number;
  hits?: number;
  misses?: number;
  [key: string]: any;
}

// Alert configuration from environment
const ALERT_EMAIL_ENABLED = process.env.ALERT_EMAIL_ENABLED === 'true';
const ALERT_EMAIL_TO = process.env.ALERT_EMAIL_TO || 'admin@teaching-engine.com';
const ALERT_EMAIL_FROM = process.env.ALERT_EMAIL_FROM || 'alerts@teaching-engine.com';
const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL;
const ALERT_CHECK_INTERVAL = parseInt(process.env.ALERT_CHECK_INTERVAL || '60000'); // Default 1 minute

// Alert state management
const alertState: AlertState = {
  lastTriggered: new Map(),
  active: new Map(),
};

// Email transporter (if enabled)
let emailTransporter: nodemailer.Transporter | null = null;

if (ALERT_EMAIL_ENABLED) {
  emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Alert definitions
const alerts: Alert[] = [
  {
    id: 'high_error_rate',
    name: 'High Error Rate',
    condition: async () => {
      const metrics = getMetrics();
      const errors = metrics.counters.http_errors_total || 0;
      const total = metrics.counters.http_requests_total || 1;
      const errorRate = (errors / total) * 100;
      return errorRate > 10;
    },
    message: (context) => `Error rate is ${context.errorRate?.toFixed(2)}% (threshold: 10%)`,
    severity: 'critical',
    cooldown: 15,
    channels: ['log', 'email', 'webhook'],
  },
  {
    id: 'high_memory_usage',
    name: 'High Memory Usage',
    condition: async () => {
      const used = process.memoryUsage().heapUsed;
      const total = process.memoryUsage().heapTotal;
      const percentage = (used / total) * 100;
      return percentage > 90;
    },
    message: (context) => `Memory usage is ${context.percentage?.toFixed(2)}% (threshold: 90%)`,
    severity: 'critical',
    cooldown: 10,
    channels: ['log', 'email'],
  },
  {
    id: 'database_connection_failure',
    name: 'Database Connection Failure',
    condition: async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return false;
      } catch (_error) {
        return true;
      }
    },
    message: () => 'Database connection is failing',
    severity: 'critical',
    cooldown: 5,
    channels: ['log', 'email', 'webhook'],
  },
  {
    id: 'slow_response_times',
    name: 'Slow Response Times',
    condition: async () => {
      const metrics = getMetrics();
      const histogramData = metrics.histograms.http_request_duration_ms;
      if (!histogramData || histogramData.count === 0) return false;

      // Calculate p95 from histogram buckets
      const targetCount = (histogramData.count * 95) / 100;
      let cumulativeCount = 0;
      let p95 = 0;

      for (const bucket of histogramData.buckets) {
        cumulativeCount += bucket.count;
        if (cumulativeCount >= targetCount) {
          p95 = bucket.le === Infinity ? histogramData.sum / histogramData.count : bucket.le;
          break;
        }
      }

      return p95 > 5000; // 5 seconds
    },
    message: (context) => `95th percentile response time is ${context.p95}ms (threshold: 5000ms)`,
    severity: 'warning',
    cooldown: 30,
    channels: ['log', 'webhook'],
  },
  {
    id: 'low_cache_hit_rate',
    name: 'Low Cache Hit Rate',
    condition: async () => {
      const metrics = getMetrics();
      const hits = metrics.counters.cache_hits_total || 0;
      const misses = metrics.counters.cache_misses_total || 0;
      const total = hits + misses;
      if (total < 100) return false; // Not enough data
      const hitRate = (hits / total) * 100;
      return hitRate < 50;
    },
    message: (context) => `Cache hit rate is ${context.hitRate?.toFixed(2)}% (threshold: 50%)`,
    severity: 'info',
    cooldown: 60,
    channels: ['log'],
  },
  {
    id: 'high_ai_operation_failures',
    name: 'High AI Operation Failures',
    condition: async () => {
      const metrics = getMetrics();
      const errors = metrics.counters.ai_operation_errors_total || 0;
      const total = metrics.counters.ai_operations_total || 1;
      const errorRate = (errors / total) * 100;
      return errorRate > 20;
    },
    message: (context) =>
      `AI operation error rate is ${context.errorRate?.toFixed(2)}% (threshold: 20%)`,
    severity: 'warning',
    cooldown: 30,
    channels: ['log', 'email'],
  },
  {
    id: 'disk_space_low',
    name: 'Low Disk Space',
    condition: async () => {
      // This would need actual disk space checking implementation
      // For now, return false
      return false;
    },
    message: (context) => `Disk space is ${context.percentage?.toFixed(2)}% full (threshold: 90%)`,
    severity: 'warning',
    cooldown: 60,
    channels: ['log', 'email'],
  },
  {
    id: 'unusual_user_activity',
    name: 'Unusual User Activity',
    condition: async () => {
      // Check for sudden spikes in user activity
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      const recentActivity = await prisma.daybookEntry.count({
        where: {
          createdAt: {
            gte: fiveMinutesAgo,
          },
        },
      });

      // Alert if more than 100 entries in 5 minutes (potential abuse)
      return recentActivity > 100;
    },
    message: (context) => `Unusual activity detected: ${context.count} entries in last 5 minutes`,
    severity: 'warning',
    cooldown: 30,
    channels: ['log', 'webhook'],
  },
];

// Send alert through various channels
const sendAlert = async (alert: Alert, context: AlertContext): Promise<void> => {
  await withSpan('alerting.sendAlert', { attributes: { alertId: alert.id } }, async (span) => {
    const message = alert.message(context);
    const timestamp = new Date().toISOString();

    // Always log
    if (alert.channels.includes('log')) {
      const logData = {
        alert: alert.name,
        severity: alert.severity,
        message,
        context,
        timestamp,
      };

      switch (alert.severity) {
        case 'critical':
          logger.fatal(logData, `ALERT: ${alert.name}`);
          break;
        case 'error':
          logger.error(logData, `ALERT: ${alert.name}`);
          break;
        case 'warning':
          logger.warn(logData, `ALERT: ${alert.name}`);
          break;
        case 'info':
          logger.info(logData, `ALERT: ${alert.name}`);
          break;
      }
    }

    // Send email if configured
    if (alert.channels.includes('email') && emailTransporter) {
      try {
        await emailTransporter.sendMail({
          from: ALERT_EMAIL_FROM,
          to: ALERT_EMAIL_TO,
          subject: `[${alert.severity.toUpperCase()}] Teaching Engine Alert: ${alert.name}`,
          text: `Alert: ${alert.name}\n\nMessage: ${message}\n\nTimestamp: ${timestamp}\n\nContext: ${JSON.stringify(context, null, 2)}`,
          html: `
            <h2>Alert: ${alert.name}</h2>
            <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
            <h3>Context</h3>
            <pre>${JSON.stringify(context, null, 2)}</pre>
          `,
        });
        logger.info(`Email alert sent for ${alert.name}`);
      } catch (_error) {
        logger.error('Failed to send email alert', _error);
      }
    }

    // Send webhook if configured
    if (alert.channels.includes('webhook') && ALERT_WEBHOOK_URL) {
      try {
        const response = await fetch(ALERT_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            alert: alert.name,
            severity: alert.severity,
            message,
            context,
            timestamp,
          }),
        });

        if (!response.ok) {
          throw new Error(`Webhook returned ${response.status}`);
        }

        logger.info(`Webhook alert sent for ${alert.name}`);
      } catch (_error) {
        logger.error('Failed to send webhook alert', _error);
      }
    }

    // Increment error counter for monitoring
    errorCounter.add(1, {
      type: 'alert',
      severity: alert.severity,
      alert_id: alert.id,
    });
  });
};

// Check if alert should be triggered
const shouldTriggerAlert = (alert: Alert): boolean => {
  const lastTriggered = alertState.lastTriggered.get(alert.id);
  if (!lastTriggered) return true;

  const cooldownMs = alert.cooldown * 60 * 1000;
  const timeSinceLastTrigger = Date.now() - lastTriggered.getTime();

  return timeSinceLastTrigger >= cooldownMs;
};

// Main alert checking loop
const checkAlerts = async (): Promise<void> => {
  await withSpan('alerting.checkAlerts', {}, async (span) => {
    for (const alert of alerts) {
      try {
        const shouldAlert = await alert.condition();
        const wasActive = alertState.active.get(alert.id) || false;

        if (shouldAlert && !wasActive) {
          // New alert
          if (shouldTriggerAlert(alert)) {
            const context = await gatherAlertContext(alert);
            await sendAlert(alert, context);
            alertState.lastTriggered.set(alert.id, new Date());
            alertState.active.set(alert.id, true);

            span.addEvent('alert_triggered', {
              alert_id: alert.id,
              severity: alert.severity,
            });
          }
        } else if (!shouldAlert && wasActive) {
          // Alert resolved
          alertState.active.set(alert.id, false);
          logger.info(`Alert resolved: ${alert.name}`);

          span.addEvent('alert_resolved', {
            alert_id: alert.id,
          });
        }
      } catch (_error) {
        logger.error(`Failed to check alert ${alert.name}`, _error);
      }
    }
  });
};

// Gather context data for alert
const gatherAlertContext = async (alert: Alert): Promise<AlertContext> => {
  const metrics = getMetrics();
  const context: Record<string, unknown> = {};

  switch (alert.id) {
    case 'high_error_rate': {
      const errors = metrics.counters.http_errors_total || 0;
      const total = metrics.counters.http_requests_total || 1;
      context.errorRate = (errors / total) * 100;
      context.errorCount = errors;
      context.totalRequests = total;
      break;
    }

    case 'high_memory_usage': {
      const memUsage = process.memoryUsage();
      context.percentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      context.heapUsed = memUsage.heapUsed;
      context.heapTotal = memUsage.heapTotal;
      break;
    }

    case 'slow_response_times': {
      const histogramData = metrics.histograms.http_request_duration_ms;
      if (histogramData && histogramData.count > 0) {
        // Calculate p95 from histogram buckets
        const targetCount95 = (histogramData.count * 95) / 100;
        const targetCount99 = (histogramData.count * 99) / 100;
        let cumulativeCount = 0;
        let p95 = 0;
        let p99 = 0;

        for (const bucket of histogramData.buckets) {
          cumulativeCount += bucket.count;
          if (cumulativeCount >= targetCount95 && p95 === 0) {
            p95 = bucket.le === Infinity ? histogramData.sum / histogramData.count : bucket.le;
          }
          if (cumulativeCount >= targetCount99 && p99 === 0) {
            p99 = bucket.le === Infinity ? histogramData.sum / histogramData.count : bucket.le;
          }
        }

        context.p95 = p95;
        context.p99 = p99;
        context.mean = histogramData.sum / histogramData.count;
      } else {
        context.p95 = 0;
        context.p99 = 0;
        context.mean = 0;
      }
      break;
    }

    case 'low_cache_hit_rate': {
      const hits = metrics.counters.cache_hits_total || 0;
      const misses = metrics.counters.cache_misses_total || 0;
      const totalCache = hits + misses;
      context.hitRate = totalCache > 0 ? (hits / totalCache) * 100 : 0;
      context.hits = hits;
      context.misses = misses;
      break;
    }

    case 'high_ai_operation_failures': {
      const aiErrors = metrics.counters.ai_operation_errors_total || 0;
      const aiTotal = metrics.counters.ai_operations_total || 1;
      context.errorRate = (aiErrors / aiTotal) * 100;
      context.errorCount = aiErrors;
      context.totalOperations = aiTotal;
      break;
    }

    case 'unusual_user_activity': {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      context.count = await prisma.daybookEntry.count({
        where: {
          createdAt: {
            gte: fiveMinutesAgo,
          },
        },
      });
      break;
    }
  }

  return context;
};

// Start alert monitoring
let alertInterval: NodeJS.Timeout | null = null;

export const startAlertMonitoring = (): void => {
  if (alertInterval) {
    logger.warn('Alert monitoring already started');
    return;
  }

  logger.info(
    {
      checkInterval: ALERT_CHECK_INTERVAL,
      emailEnabled: ALERT_EMAIL_ENABLED,
      webhookEnabled: !!ALERT_WEBHOOK_URL,
    },
    'Starting alert monitoring',
  );

  // Initial check
  checkAlerts().catch((error) => {
    logger.error('Initial alert check failed', error);
  });

  // Set up recurring checks
  alertInterval = setInterval(() => {
    checkAlerts().catch((error) => {
      logger.error('Alert check failed', error);
    });
  }, ALERT_CHECK_INTERVAL);
};

// Stop alert monitoring
export const stopAlertMonitoring = (): void => {
  if (alertInterval) {
    clearInterval(alertInterval);
    alertInterval = null;
    logger.info('Alert monitoring stopped');
  }
};

// Manual alert trigger (for testing)
export const triggerManualAlert = async (alertId: string, context?: any): Promise<void> => {
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) {
    throw new Error(`Alert ${alertId} not found`);
  }

  const alertContext = context || (await gatherAlertContext(alert));
  await sendAlert(alert, alertContext);
};

// Get alert status
export const getAlertStatus = (): unknown => {
  return {
    alerts: alerts.map((alert) => ({
      id: alert.id,
      name: alert.name,
      severity: alert.severity,
      active: alertState.active.get(alert.id) || false,
      lastTriggered: alertState.lastTriggered.get(alert.id) || null,
      cooldown: alert.cooldown,
    })),
    monitoring: {
      enabled: !!alertInterval,
      checkInterval: ALERT_CHECK_INTERVAL,
      emailEnabled: ALERT_EMAIL_ENABLED,
      webhookEnabled: !!ALERT_WEBHOOK_URL,
    },
  };
};
