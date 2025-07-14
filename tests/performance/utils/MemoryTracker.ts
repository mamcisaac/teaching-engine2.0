/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Memory Tracker Utility
 * Advanced memory monitoring and leak detection for all application components
 */

import * as os from 'os';
import { performance } from 'perf_hooks';

interface MemoryMeasurement {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers?: number;
  gcCount?: number;
  gcDuration?: number;
  rss?: number; // Resident Set Size
  free?: number; // Free system memory
}

interface GCEvent {
  type: 'scavenge' | 'mark_sweep' | 'incremental_marking';
  startTime: number;
  endTime: number;
  duration: number;
  heapBefore: number;
  heapAfter: number;
  efficiency: number; // Percentage of memory reclaimed
}

interface MemoryProfile {
  component: 'frontend' | 'backend' | 'database';
  duration: number;
  measurements: MemoryMeasurement[];
  gcEvents: GCEvent[];
  leakAnalysis: {
    detected: boolean;
    growthRate: number; // MB per minute
    confidence: number; // 0-1
    patterns: string[];
  };
  recommendations: string[];
}

export class MemoryTracker {
  private gcObserver: any = null;
  private isTracking: boolean = false;
  private gcEvents: GCEvent[] = [];

  constructor() {
    this.setupGCObserver();
  }

  private setupGCObserver(): void {
    // Set up garbage collection monitoring for Node.js
    if (typeof process !== 'undefined' && process.versions?.node) {
      try {
        // Enable GC events tracking
        if (global.gc && (performance as any).markResourceTiming) {
          const { PerformanceObserver } = require('perf_hooks');

          this.gcObserver = new PerformanceObserver((list: any) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              if (entry.entryType === 'gc') {
                this.recordGCEvent(entry);
              }
            }
          });

          this.gcObserver.observe({ entryTypes: ['gc'] });
        }
      } catch (_error) {
        console.warn('GC monitoring not available:', error.message);
      }
    }
  }

  private recordGCEvent(entry: any): void {
    if (!this.isTracking) return;

    const gcEvent: GCEvent = {
      type: this.getGCType(entry.kind),
      startTime: entry.startTime,
      endTime: entry.startTime + entry.duration,
      duration: entry.duration,
      heapBefore: entry.detail?.before ?? 0,
      heapAfter: entry.detail?.after ?? 0,
      efficiency:
        entry.detail?.before > 0
          ? ((entry.detail.before - entry.detail.after) / entry.detail.before) * 100
          : 0,
    };

    this.gcEvents.push(gcEvent);
  }

  private getGCType(kind: number): GCEvent['type'] {
    switch (kind) {
      case 1:
        return 'scavenge';
      case 2:
        return 'mark_sweep';
      case 4:
        return 'incremental_marking';
      default:
        return 'mark_sweep';
    }
  }

  async trackFrontendMemory(duration: number): Promise<MemoryMeasurement[]> {
    // This method would be called from browser context
    // Returns mock data for server-side testing
    const measurements: MemoryMeasurement[] = [];
    const startTime = Date.now();
    const endTime = startTime + duration;
    const interval = 1000; // 1 second intervals

    while (Date.now() < endTime) {
      // Simulate browser memory measurement
      const mockMemory = this.generateMockBrowserMemory();
      measurements.push({
        timestamp: Date.now(),
        heapUsed: mockMemory.usedJSHeapSize,
        heapTotal: mockMemory.totalJSHeapSize,
        external: 0,
      });

      await this.delay(interval);
    }

    return measurements;
  }

  private generateMockBrowserMemory() {
    // Generate realistic browser memory data for testing
    const baseMemory = 50 * 1024 * 1024; // 50MB base
    const randomVariation = Math.random() * 20 * 1024 * 1024; // ±20MB variation

    return {
      usedJSHeapSize: baseMemory + randomVariation,
      totalJSHeapSize: baseMemory * 2 + randomVariation,
      jsHeapSizeLimit: 2048 * 1024 * 1024, // 2GB limit
    };
  }

  async trackBackendMemory(duration: number): Promise<MemoryMeasurement[]> {
    const measurements: MemoryMeasurement[] = [];
    const startTime = Date.now();
    const endTime = startTime + duration;
    const interval = 1000; // 1 second intervals

    this.isTracking = true;
    this.gcEvents = []; // Reset GC events

    console.log(`🔍 Starting backend memory tracking for ${duration}ms`);

    while (Date.now() < endTime) {
      const memoryUsage = process.memoryUsage();
      const systemMemory = this.getSystemMemory();

      measurements.push({
        timestamp: Date.now(),
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers,
        rss: memoryUsage.rss,
        free: systemMemory.free,
        gcCount: this.gcEvents.length,
        gcDuration: this.calculateAverageGCDuration(),
      });

      await this.delay(interval);
    }

    this.isTracking = false;
    console.log(
      `✅ Backend memory tracking completed. ${measurements.length} measurements collected.`,
    );

    return measurements;
  }

  async trackDatabaseMemory(duration: number): Promise<MemoryMeasurement[]> {
    // Mock database memory tracking
    // In a real implementation, this would connect to database monitoring tools
    const measurements: MemoryMeasurement[] = [];
    const startTime = Date.now();
    const endTime = startTime + duration;
    const interval = 2000; // 2 second intervals for database

    console.log(`🗃️ Starting database memory tracking for ${duration}ms`);

    while (Date.now() < endTime) {
      // Simulate database memory metrics
      const mockDbMemory = this.generateMockDatabaseMemory();

      measurements.push({
        timestamp: Date.now(),
        heapUsed: mockDbMemory.bufferPool,
        heapTotal: mockDbMemory.totalAllocated,
        external: mockDbMemory.connections,
        rss: mockDbMemory.processMemory,
      });

      await this.delay(interval);
    }

    console.log(
      `✅ Database memory tracking completed. ${measurements.length} measurements collected.`,
    );
    return measurements;
  }

  private generateMockDatabaseMemory() {
    const baseBufferPool = 128 * 1024 * 1024; // 128MB buffer pool
    const variation = Math.random() * 32 * 1024 * 1024; // ±32MB variation

    return {
      bufferPool: baseBufferPool + variation,
      totalAllocated: baseBufferPool * 1.5 + variation,
      connections: Math.floor(Math.random() * 100) * 1024 * 1024, // Connection overhead
      processMemory: 200 * 1024 * 1024 + variation, // Process memory
    };
  }

  private getSystemMemory() {
    return {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    };
  }

  private calculateAverageGCDuration(): number {
    if (this.gcEvents.length === 0) return 0;

    const totalDuration = this.gcEvents.reduce((sum, event) => sum + event.duration, 0);
    return totalDuration / this.gcEvents.length;
  }

  analyzeMemoryLeak(measurements: MemoryMeasurement[]): {
    detected: boolean;
    growthRate: number;
    confidence: number;
    patterns: string[];
  } {
    if (measurements.length < 10) {
      return {
        detected: false,
        growthRate: 0,
        confidence: 0,
        patterns: ['Insufficient data for analysis'],
      };
    }

    // Divide measurements into segments for trend analysis
    const segmentSize = Math.floor(measurements.length / 3);
    const segment1 = measurements.slice(0, segmentSize);
    const segment2 = measurements.slice(segmentSize, segmentSize * 2);
    const segment3 = measurements.slice(segmentSize * 2);

    const avg1 = this.calculateAverageHeapUsage(segment1);
    const avg2 = this.calculateAverageHeapUsage(segment2);
    const avg3 = this.calculateAverageHeapUsage(segment3);

    // Calculate growth rate (MB per minute)
    const totalDuration =
      measurements[measurements.length - 1].timestamp - measurements[0].timestamp;
    const totalGrowth = avg3 - avg1;
    const growthRate = totalGrowth / 1024 / 1024 / (totalDuration / 60000); // MB per minute

    // Analyze patterns
    const patterns: string[] = [];

    // Consistent upward trend
    if (avg2 > avg1 && avg3 > avg2) {
      patterns.push('Consistent upward memory trend');
    }

    // Large allocation pattern
    const maxHeap = Math.max(...measurements.map((m) => m.heapUsed));
    const minHeap = Math.min(...measurements.map((m) => m.heapUsed));
    const heapRange = maxHeap - minHeap;

    if (heapRange > 100 * 1024 * 1024) {
      // More than 100MB range
      patterns.push('Large memory allocation variations');
    }

    // GC inefficiency pattern
    const gcEfficiency = this.calculateGCEfficiency();
    if (gcEfficiency < 0.5) {
      // Less than 50% efficiency
      patterns.push('Inefficient garbage collection');
    }

    // Determine confidence based on consistency and magnitude
    let confidence = 0;
    if (Math.abs(growthRate) > 5) confidence += 0.3; // Significant growth rate
    if (patterns.length > 0) confidence += 0.3; // Identifiable patterns
    if (measurements.length > 50) confidence += 0.2; // Sufficient data
    if (totalDuration > 60000) confidence += 0.2; // Sufficient duration

    const detected = growthRate > 2 && confidence > 0.6; // More than 2MB/min with high confidence

    return {
      detected,
      growthRate: Math.round(growthRate * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      patterns,
    };
  }

  private calculateAverageHeapUsage(measurements: MemoryMeasurement[]): number {
    if (measurements.length === 0) return 0;
    return measurements.reduce((sum, m) => sum + m.heapUsed, 0) / measurements.length;
  }

  private calculateGCEfficiency(): number {
    if (this.gcEvents.length === 0) return 1; // Assume perfect if no GC data

    const totalEfficiency = this.gcEvents.reduce((sum, event) => sum + event.efficiency, 0);
    return totalEfficiency / this.gcEvents.length / 100; // Convert to 0-1 scale
  }

  generateMemoryProfile(
    component: 'frontend' | 'backend' | 'database',
    measurements: MemoryMeasurement[],
  ): MemoryProfile {
    const leakAnalysis = this.analyzeMemoryLeak(measurements);
    const recommendations = this.generateRecommendations(component, measurements, leakAnalysis);

    const duration =
      measurements.length > 0
        ? measurements[measurements.length - 1].timestamp - measurements[0].timestamp
        : 0;

    return {
      component,
      duration,
      measurements,
      gcEvents: [...this.gcEvents],
      leakAnalysis,
      recommendations,
    };
  }

  private generateRecommendations(
    component: 'frontend' | 'backend' | 'database',
    measurements: MemoryMeasurement[],
    leakAnalysis: any,
  ): string[] {
    const recommendations: string[] = [];

    if (leakAnalysis.detected) {
      recommendations.push('🚨 Memory leak detected - immediate investigation required');

      if (component === 'frontend') {
        recommendations.push('Review event listener cleanup in component unmounting');
        recommendations.push('Check for circular references in React components');
        recommendations.push('Implement proper cleanup in useEffect hooks');
      } else if (component === 'backend') {
        recommendations.push('Review object lifecycle management');
        recommendations.push('Check for unclosed database connections');
        recommendations.push('Implement proper stream cleanup');
      }
    }

    // Peak memory recommendations
    const peakMemory = Math.max(...measurements.map((m) => m.heapUsed));
    const peakMB = peakMemory / 1024 / 1024;

    if (peakMB > 500 && component === 'backend') {
      recommendations.push('Consider implementing data streaming for large operations');
      recommendations.push('Review caching strategies to reduce memory pressure');
    }

    if (peakMB > 150 && component === 'frontend') {
      recommendations.push('Implement lazy loading for large components');
      recommendations.push('Consider virtual scrolling for large lists');
    }

    // GC recommendations
    const avgGCDuration = this.calculateAverageGCDuration();
    if (avgGCDuration > 50) {
      recommendations.push('Optimize object allocation patterns to reduce GC pressure');
      recommendations.push('Consider object pooling for frequently created objects');
    }

    // Memory growth recommendations
    if (leakAnalysis.growthRate > 1) {
      recommendations.push('Implement regular memory profiling in development');
      recommendations.push('Add memory usage monitoring to production alerts');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Memory usage appears healthy');
    }

    return recommendations;
  }

  async measureMemoryImpact<T>(
    operation: () => Promise<T>,
    description: string,
  ): Promise<{
    result: T;
    memoryImpact: {
      before: MemoryMeasurement;
      after: MemoryMeasurement;
      difference: number;
      efficiency: number;
    };
  }> {
    // Force GC before measurement
    if (global.gc) {
      global.gc();
      await this.delay(100); // Let GC complete
    }

    const before: MemoryMeasurement = {
      timestamp: Date.now(),
      ...process.memoryUsage(),
    };

    console.log(`📊 Measuring memory impact: ${description}`);
    const result = await operation();

    // Force GC after operation
    if (global.gc) {
      global.gc();
      await this.delay(100);
    }

    const after: MemoryMeasurement = {
      timestamp: Date.now(),
      ...process.memoryUsage(),
    };

    const difference = after.heapUsed - before.heapUsed;
    const efficiency = before.heapUsed > 0 ? (difference / before.heapUsed) * 100 : 0;

    console.log(`📊 ${description}: ${(difference / 1024 / 1024).toFixed(2)}MB impact`);

    return {
      result,
      memoryImpact: {
        before,
        after,
        difference,
        efficiency,
      },
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  cleanup(): void {
    this.isTracking = false;

    if (this.gcObserver) {
      this.gcObserver.disconnect();
      this.gcObserver = null;
    }

    this.gcEvents = [];
  }
}
