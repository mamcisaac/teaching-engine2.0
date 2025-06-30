#!/usr/bin/env node

/**
 * Test Performance Monitor
 * Measures and tracks test performance improvements
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PERFORMANCE_LOG = join(process.cwd(), 'test-performance.json');

class TestPerformanceMonitor {
  constructor() {
    this.results = this.loadExistingResults();
  }

  loadExistingResults() {
    if (existsSync(PERFORMANCE_LOG)) {
      try {
        return JSON.parse(readFileSync(PERFORMANCE_LOG, 'utf8'));
      } catch (e) {
        console.warn('Failed to load existing performance results:', e.message);
      }
    }
    return { benchmarks: [], phases: [] };
  }

  async runBenchmark(testCommand, label = 'default') {
    console.log(`🏃 Running benchmark: ${label}`);
    console.log(`Command: ${testCommand}`);
    
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const [command, ...args] = testCommand.split(' ');
      const child = spawn(command, args, {
        stdio: ['inherit', 'pipe', 'pipe'],
        env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules' }
      });

      let stdout = '';
      let stderr = '';
      let testResults = {
        passed: 0,
        failed: 0,
        suites: 0,
        time: 0
      };

      child.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        
        // Parse Jest output for test results
        const passMatch = output.match(/(\d+) passed/);
        const failMatch = output.match(/(\d+) failed/);
        const suiteMatch = output.match(/Test Suites:.*?(\d+) passed/);
        const timeMatch = output.match(/Time:\s*([\d.]+)\s*s/);
        
        if (passMatch) testResults.passed = parseInt(passMatch[1]);
        if (failMatch) testResults.failed = parseInt(failMatch[1]);
        if (suiteMatch) testResults.suites = parseInt(suiteMatch[1]);
        if (timeMatch) testResults.time = parseFloat(timeMatch[1]);
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const endTime = Date.now();
        const totalTime = (endTime - startTime) / 1000;

        const result = {
          label,
          command: testCommand,
          timestamp: new Date().toISOString(),
          wallClockTime: totalTime,
          jestReportedTime: testResults.time || totalTime,
          exitCode: code,
          testsPassed: testResults.passed,
          testsFailed: testResults.failed,
          testSuites: testResults.suites,
          success: code === 0
        };

        console.log(`✅ Benchmark completed: ${label}`);
        console.log(`   Wall clock time: ${totalTime.toFixed(2)}s`);
        console.log(`   Jest reported time: ${(testResults.time || totalTime).toFixed(2)}s`);
        console.log(`   Tests passed: ${testResults.passed}`);
        console.log(`   Tests failed: ${testResults.failed}`);
        console.log(`   Exit code: ${code}`);

        resolve(result);
      });

      child.on('error', (err) => {
        reject(new Error(`Failed to run benchmark: ${err.message}`));
      });

      // Timeout after 3 minutes
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error(`Benchmark timeout: ${label}`));
      }, 180000);
    });
  }

  saveBenchmark(result) {
    this.results.benchmarks.push(result);
    this.saveResults();
  }

  savePhase(phase, improvements) {
    this.results.phases.push({
      phase,
      improvements,
      timestamp: new Date().toISOString()
    });
    this.saveResults();
  }

  saveResults() {
    writeFileSync(PERFORMANCE_LOG, JSON.stringify(this.results, null, 2));
    console.log(`📊 Results saved to ${PERFORMANCE_LOG}`);
  }

  async comparePerformance(baseline, current) {
    const improvement = baseline.wallClockTime - current.wallClockTime;
    const percentImprovement = (improvement / baseline.wallClockTime) * 100;
    
    console.log(`\n📈 Performance Comparison:`);
    console.log(`   Baseline (${baseline.label}): ${baseline.wallClockTime.toFixed(2)}s`);
    console.log(`   Current (${current.label}): ${current.wallClockTime.toFixed(2)}s`);
    console.log(`   Improvement: ${improvement.toFixed(2)}s (${percentImprovement.toFixed(1)}%)`);
    
    if (percentImprovement > 0) {
      console.log(`   🎉 Performance improved!`);
    } else {
      console.log(`   ⚠️  Performance degraded by ${Math.abs(percentImprovement).toFixed(1)}%`);
    }

    return {
      improvement,
      percentImprovement,
      success: percentImprovement > 0
    };
  }

  getLastBenchmark(label) {
    return this.results.benchmarks
      .filter(b => b.label === label)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
  }

  generateReport() {
    const report = {
      summary: {
        totalBenchmarks: this.results.benchmarks.length,
        phases: this.results.phases.length,
        lastRun: this.results.benchmarks[this.results.benchmarks.length - 1]?.timestamp
      },
      phases: this.results.phases,
      benchmarks: this.results.benchmarks.slice(-10) // Last 10 benchmarks
    };

    console.log('\n📊 Performance Report:');
    console.log(JSON.stringify(report, null, 2));
    
    return report;
  }
}

// CLI interface
async function main() {
  const monitor = new TestPerformanceMonitor();
  const [command, ...args] = process.argv.slice(2);

  switch (command) {
    case 'benchmark':
      const testCommand = args[0] || 'pnpm test:unit';
      const label = args[1] || `benchmark-${Date.now()}`;
      try {
        const result = await monitor.runBenchmark(testCommand, label);
        monitor.saveBenchmark(result);
      } catch (error) {
        console.error('❌ Benchmark failed:', error.message);
        process.exit(1);
      }
      break;

    case 'compare':
      const baselineLabel = args[0];
      const currentLabel = args[1];
      if (!baselineLabel || !currentLabel) {
        console.error('Usage: compare <baseline-label> <current-label>');
        process.exit(1);
      }
      const baseline = monitor.getLastBenchmark(baselineLabel);
      const current = monitor.getLastBenchmark(currentLabel);
      if (!baseline || !current) {
        console.error('Benchmark results not found');
        process.exit(1);
      }
      await monitor.comparePerformance(baseline, current);
      break;

    case 'report':
      monitor.generateReport();
      break;

    case 'phase':
      const phase = args[0];
      const improvements = args.slice(1);
      if (!phase) {
        console.error('Usage: phase <phase-name> [improvement1] [improvement2] ...');
        process.exit(1);
      }
      monitor.savePhase(phase, improvements);
      console.log(`📝 Recorded phase: ${phase}`);
      break;

    default:
      console.log(`
Test Performance Monitor

Usage:
  benchmark [command] [label]  - Run a performance benchmark
  compare <baseline> <current> - Compare two benchmark results
  report                      - Generate performance report
  phase <name> [improvements] - Record phase completion

Examples:
  node scripts/test-performance-monitor.js benchmark "pnpm test:unit" "baseline"
  node scripts/test-performance-monitor.js compare baseline phase-1
  node scripts/test-performance-monitor.js phase "Phase 1" "Jest config" "Mock optimization"
      `);
      break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default TestPerformanceMonitor;