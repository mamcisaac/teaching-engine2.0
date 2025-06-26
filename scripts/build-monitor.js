#!/usr/bin/env node

/**
 * Build Performance Monitor for Teaching Engine 2.0
 * 
 * Tracks and analyzes build performance metrics:
 * - Phase timing
 * - Memory usage
 * - Bundle sizes
 * - Bottleneck identification
 */

import { performance, PerformanceObserver } from 'perf_hooks';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import Table from 'cli-table3';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class BuildPerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      phases: new Map(),
      memorySnapshots: [],
      bundleSizes: new Map(),
      dependencies: new Map(),
      warnings: [],
      performanceMarks: []
    };
    
    this.reportDir = path.join(process.cwd(), '.build-reports');
    fs.ensureDirSync(this.reportDir);
    
    this.setupPerformanceObserver();
    this.startMemoryMonitoring();
  }

  /**
   * Setup performance observer for detailed metrics
   */
  setupPerformanceObserver() {
    const obs = new PerformanceObserver((items) => {
      items.getEntries().forEach((entry) => {
        this.metrics.performanceMarks.push({
          name: entry.name,
          duration: entry.duration,
          startTime: entry.startTime
        });
      });
    });
    obs.observe({ entryTypes: ['measure', 'mark'] });
  }

  /**
   * Start monitoring memory usage
   */
  startMemoryMonitoring() {
    this.memoryInterval = setInterval(() => {
      const usage = process.memoryUsage();
      this.metrics.memorySnapshots.push({
        timestamp: Date.now(),
        heapUsed: usage.heapUsed,
        heapTotal: usage.heapTotal,
        external: usage.external,
        rss: usage.rss
      });
    }, 1000); // Sample every second
  }

  /**
   * Stop memory monitoring
   */
  stopMemoryMonitoring() {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
    }
  }

  /**
   * Start tracking a build phase
   */
  startPhase(name, metadata = {}) {
    performance.mark(`${name}-start`);
    
    this.metrics.phases.set(name, {
      name,
      startTime: Date.now(),
      startMemory: process.memoryUsage(),
      metadata,
      subPhases: []
    });
    
    console.log(chalk.blue(`▶ Starting: ${name}`));
  }

  /**
   * End tracking a build phase
   */
  endPhase(name, metadata = {}) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const phase = this.metrics.phases.get(name);
    if (!phase) {
      console.warn(chalk.yellow(`Warning: Phase "${name}" was not started`));
      return;
    }

    phase.endTime = Date.now();
    phase.duration = phase.endTime - phase.startTime;
    phase.endMemory = process.memoryUsage();
    phase.memoryDelta = phase.endMemory.heapUsed - phase.startMemory.heapUsed;
    phase.metadata = { ...phase.metadata, ...metadata };

    const icon = phase.duration > 5000 ? '⚠️' : '✓';
    console.log(
      chalk.green(`${icon} Completed: ${name} in ${this.formatDuration(phase.duration)} ` +
      `(${this.formatBytes(phase.memoryDelta)} memory)`)
    );
  }

  /**
   * Track a sub-phase within a phase
   */
  trackSubPhase(parentPhase, subPhaseName, fn) {
    const startTime = Date.now();
    const result = fn();
    const duration = Date.now() - startTime;

    const phase = this.metrics.phases.get(parentPhase);
    if (phase) {
      phase.subPhases.push({
        name: subPhaseName,
        duration,
        timestamp: startTime
      });
    }

    return result;
  }

  /**
   * Track bundle sizes
   */
  async trackBundleSizes(distDir) {
    const files = await this.getFilesRecursively(distDir);
    
    for (const file of files) {
      const stats = await fs.stat(file);
      const relativePath = path.relative(distDir, file);
      
      this.metrics.bundleSizes.set(relativePath, {
        size: stats.size,
        gzipSize: await this.getGzipSize(file),
        brotliSize: await this.getBrotliSize(file)
      });
    }
  }

  /**
   * Get files recursively
   */
  async getFilesRecursively(dir) {
    const files = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.getFilesRecursively(fullPath));
      } else if (entry.isFile() && !entry.name.startsWith('.')) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Get gzip size of a file
   */
  async getGzipSize(filePath) {
    try {
      const { stdout } = await execAsync(`gzip -c "${filePath}" | wc -c`);
      return parseInt(stdout.trim());
    } catch {
      return 0;
    }
  }

  /**
   * Get brotli size of a file
   */
  async getBrotliSize(filePath) {
    try {
      const { stdout } = await execAsync(`brotli -c "${filePath}" | wc -c`);
      return parseInt(stdout.trim());
    } catch {
      return 0;
    }
  }

  /**
   * Add a warning
   */
  addWarning(message, details = {}) {
    this.metrics.warnings.push({
      message,
      details,
      timestamp: Date.now()
    });
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    this.stopMemoryMonitoring();
    
    const totalTime = Date.now() - this.metrics.startTime;
    const phases = Array.from(this.metrics.phases.values());
    
    // Console output
    console.log('\n' + chalk.bold.blue('📊 Build Performance Report'));
    console.log(chalk.gray('═'.repeat(60)));
    console.log(chalk.bold(`Total Build Time: ${this.formatDuration(totalTime)}`));
    
    // Phase breakdown table
    this.printPhaseTable(phases, totalTime);
    
    // Memory analysis
    this.printMemoryAnalysis();
    
    // Bundle size analysis
    await this.printBundleSizeAnalysis();
    
    // Warnings
    this.printWarnings();
    
    // Bottleneck analysis
    this.identifyBottlenecks(phases);
    
    // Save detailed report
    await this.saveDetailedReport(totalTime, phases);
  }

  /**
   * Print phase timing table
   */
  printPhaseTable(phases, totalTime) {
    console.log('\n' + chalk.bold('Phase Breakdown:'));
    
    const table = new Table({
      head: ['Phase', 'Duration', '% of Total', 'Memory Δ'],
      colWidths: [30, 15, 12, 15],
      style: { head: ['cyan'] }
    });

    phases
      .sort((a, b) => b.duration - a.duration)
      .forEach(phase => {
        const percentage = ((phase.duration / totalTime) * 100).toFixed(1);
        const memoryDelta = phase.memoryDelta || 0;
        
        table.push([
          phase.name,
          this.formatDuration(phase.duration),
          `${percentage}%`,
          this.formatBytes(memoryDelta)
        ]);
      });

    console.log(table.toString());
  }

  /**
   * Print memory analysis
   */
  printMemoryAnalysis() {
    if (this.metrics.memorySnapshots.length === 0) return;
    
    console.log('\n' + chalk.bold('Memory Usage:'));
    
    const maxHeap = Math.max(...this.metrics.memorySnapshots.map(s => s.heapUsed));
    const avgHeap = this.metrics.memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.metrics.memorySnapshots.length;
    
    console.log(`  Peak Heap: ${this.formatBytes(maxHeap)}`);
    console.log(`  Average Heap: ${this.formatBytes(avgHeap)}`);
    
    // Memory graph (simple ASCII)
    this.printMemoryGraph();
  }

  /**
   * Print simple memory usage graph
   */
  printMemoryGraph() {
    const samples = this.metrics.memorySnapshots;
    if (samples.length < 2) return;
    
    const maxHeap = Math.max(...samples.map(s => s.heapUsed));
    const height = 10;
    const width = Math.min(60, samples.length);
    
    console.log('\n  Memory Usage Over Time:');
    
    for (let h = height; h >= 0; h--) {
      let line = '  ';
      for (let w = 0; w < width; w++) {
        const sampleIndex = Math.floor((w / width) * samples.length);
        const sample = samples[sampleIndex];
        const normalizedHeight = (sample.heapUsed / maxHeap) * height;
        
        line += normalizedHeight >= h ? '█' : ' ';
      }
      console.log(line);
    }
    console.log('  ' + '─'.repeat(width));
  }

  /**
   * Print bundle size analysis
   */
  async printBundleSizeAnalysis() {
    if (this.metrics.bundleSizes.size === 0) return;
    
    console.log('\n' + chalk.bold('Bundle Sizes:'));
    
    const table = new Table({
      head: ['File', 'Size', 'Gzip', 'Brotli'],
      colWidths: [40, 12, 12, 12],
      style: { head: ['cyan'] }
    });

    const entries = Array.from(this.metrics.bundleSizes.entries())
      .sort((a, b) => b[1].size - a[1].size)
      .slice(0, 10); // Top 10 largest files

    for (const [file, sizes] of entries) {
      table.push([
        file.length > 37 ? '...' + file.slice(-34) : file,
        this.formatBytes(sizes.size),
        this.formatBytes(sizes.gzipSize),
        this.formatBytes(sizes.brotliSize)
      ]);
    }

    console.log(table.toString());
    
    // Total sizes
    const totalSize = Array.from(this.metrics.bundleSizes.values())
      .reduce((sum, s) => sum + s.size, 0);
    const totalGzip = Array.from(this.metrics.bundleSizes.values())
      .reduce((sum, s) => sum + s.gzipSize, 0);
    
    console.log(`\n  Total Size: ${this.formatBytes(totalSize)}`);
    console.log(`  Total Gzip: ${this.formatBytes(totalGzip)}`);
  }

  /**
   * Print warnings
   */
  printWarnings() {
    if (this.metrics.warnings.length === 0) return;
    
    console.log('\n' + chalk.bold.yellow('⚠️  Warnings:'));
    this.metrics.warnings.forEach(warning => {
      console.log(`  - ${warning.message}`);
      if (warning.details) {
        console.log(`    ${chalk.gray(JSON.stringify(warning.details))}`);
      }
    });
  }

  /**
   * Identify and report bottlenecks
   */
  identifyBottlenecks(phases) {
    console.log('\n' + chalk.bold('🔍 Bottleneck Analysis:'));
    
    // Find slowest phase
    const slowestPhase = phases.reduce((a, b) => a.duration > b.duration ? a : b);
    console.log(`  Slowest Phase: ${slowestPhase.name} (${this.formatDuration(slowestPhase.duration)})`);
    
    // Check for memory spikes
    const memorySpikes = phases.filter(p => p.memoryDelta > 100 * 1024 * 1024); // > 100MB
    if (memorySpikes.length > 0) {
      console.log(`  Memory Spikes: ${memorySpikes.map(p => p.name).join(', ')}`);
    }
    
    // Parallel opportunity analysis
    const sequentialTime = phases.reduce((sum, p) => sum + p.duration, 0);
    const parallelPotential = sequentialTime - (Date.now() - this.metrics.startTime);
    if (parallelPotential > 1000) {
      console.log(`  Parallelization Opportunity: ${this.formatDuration(parallelPotential)} potential savings`);
    }
  }

  /**
   * Save detailed report to file
   */
  async saveDetailedReport(totalTime, phases) {
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: totalTime,
      phases: phases.map(p => ({
        ...p,
        startMemory: undefined, // Remove circular references
        endMemory: undefined
      })),
      bundleSizes: Object.fromEntries(this.metrics.bundleSizes),
      memoryStats: {
        samples: this.metrics.memorySnapshots.length,
        peak: Math.max(...this.metrics.memorySnapshots.map(s => s.heapUsed)),
        average: this.metrics.memorySnapshots.reduce((sum, s) => sum + s.heapUsed, 0) / this.metrics.memorySnapshots.length
      },
      warnings: this.metrics.warnings,
      performanceMarks: this.metrics.performanceMarks
    };

    const reportPath = path.join(
      this.reportDir, 
      `build-report-${new Date().toISOString().replace(/:/g, '-')}.json`
    );
    
    await fs.writeJson(reportPath, report, { spaces: 2 });
    console.log(`\n💾 Detailed report saved to: ${chalk.cyan(reportPath)}`);
  }

  /**
   * Format duration for display
   */
  formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${((ms % 60000) / 1000).toFixed(0)}s`;
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes) {
    const sign = bytes < 0 ? '-' : '+';
    bytes = Math.abs(bytes);
    
    if (bytes < 1024) return `${sign}${bytes}B`;
    if (bytes < 1024 * 1024) return `${sign}${(bytes / 1024).toFixed(1)}KB`;
    return `${sign}${(bytes / 1024 / 1024).toFixed(1)}MB`;
  }
}

// Export for use in build scripts
export default BuildPerformanceMonitor;

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new BuildPerformanceMonitor();
  
  // Example usage simulation
  monitor.startPhase('Dependencies Installation');
  setTimeout(() => {
    monitor.endPhase('Dependencies Installation');
    
    monitor.startPhase('TypeScript Compilation');
    setTimeout(() => {
      monitor.endPhase('TypeScript Compilation');
      
      monitor.startPhase('Bundle Generation');
      setTimeout(() => {
        monitor.endPhase('Bundle Generation');
        monitor.generateReport();
      }, 1500);
    }, 2000);
  }, 1000);
}