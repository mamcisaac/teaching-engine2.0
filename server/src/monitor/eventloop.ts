/**
 * Event Loop Monitoring Module
 * Tracks event loop lag to detect performance issues
 */

import { monitorEventLoopDelay, PerformanceObserver } from 'node:perf_hooks';
import { logger } from '../logger';

// Event loop delay histogram with 20ms resolution
const histogram = monitorEventLoopDelay({ resolution: 20 });

// Track metrics
let eventLoopMetrics = {
  p50: 0,
  p95: 0,
  p99: 0,
  max: 0,
  lastUpdate: Date.now()
};

/**
 * Start event loop monitoring
 */
export function startEventLoopMonitoring(): void {
  histogram.enable();

  // Update metrics every 2 seconds
  const updateInterval = setInterval(() => {
    const p50 = histogram.percentile(50) / 1e6; // Convert to ms
    const p95 = histogram.percentile(95) / 1e6;
    const p99 = histogram.percentile(99) / 1e6;
    const max = histogram.max / 1e6;

    eventLoopMetrics = {
      p50,
      p95,
      p99,
      max,
      lastUpdate: Date.now()
    };

    // Log warning if p95 is high
    if (p95 > 100) {
      logger.warn('[eventloop-monitor] High event loop lag detected', {
        p50: `${p50.toFixed(1)}ms`,
        p95: `${p95.toFixed(1)}ms`,
        p99: `${p99.toFixed(1)}ms`,
        max: `${max.toFixed(1)}ms`
      });
    }

    // Reset histogram for next period
    histogram.reset();
  }, 2000);

  // Ensure interval doesn't keep process alive
  updateInterval.unref();

  logger.info('✅ Event loop monitoring started');
}

/**
 * Get current event loop metrics
 */
export function getEventLoopMetrics(): typeof eventLoopMetrics {
  return { ...eventLoopMetrics };
}

/**
 * Check if event loop is healthy
 * Returns true if p95 < 50ms
 */
export function isEventLoopHealthy(): boolean {
  return eventLoopMetrics.p95 < 50;
}

/**
 * Stop event loop monitoring
 */
export function stopEventLoopMonitoring(): void {
  histogram.disable();
  logger.info('Event loop monitoring stopped');
}

// Export for testing
export { histogram };