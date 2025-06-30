#!/usr/bin/env node

/**
 * Performance Test Runner
 * Tracks and reports test performance improvements
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';
import TestPerformanceMonitor from './test-performance-monitor.js';

async function runTestCommand(command, label) {
  const monitor = new TestPerformanceMonitor();
  
  console.log(`\n🚀 Running: ${label}`);
  console.log(`📋 Command: ${command}`);
  console.log('⏱️  Starting timer...\n');
  
  const startTime = performance.now();
  const startMemory = process.memoryUsage();
  
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        FORCE_COLOR: '1',
      },
    });
    
    child.on('close', (code) => {
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      const duration = (endTime - startTime) / 1000;
      
      const memoryDelta = {
        heapUsed: (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024,
        external: (endMemory.external - startMemory.external) / 1024 / 1024,
      };
      
      console.log(`\n📊 Performance Results for ${label}:`);
      console.log(`  ⏱️  Total time: ${duration.toFixed(2)}s`);
      console.log(`  💾 Memory delta: ${memoryDelta.heapUsed.toFixed(2)}MB heap, ${memoryDelta.external.toFixed(2)}MB external`);
      console.log(`  📈 Exit code: ${code}`);
      
      const result = {
        label,
        command,
        timestamp: new Date().toISOString(),
        wallClockTime: duration,
        jestReportedTime: duration,
        exitCode: code,
        success: code === 0,
        memoryDelta,
      };
      
      monitor.saveBenchmark(result);
      resolve(result);
    });
    
    child.on('error', (err) => {
      console.error(`❌ Error: ${err.message}`);
      reject(err);
    });
  });
}

async function compareImplementations() {
  console.log('🔬 Testing Engine Performance Comparison');
  console.log('========================================\n');
  
  const tests = [
    {
      label: 'Original Jest Config',
      command: 'pnpm test:unit',
    },
    {
      label: 'Performance Config',
      command: 'pnpm test:perf',
    },
    {
      label: 'Turbo Mode',
      command: 'pnpm test:turbo',
    },
    {
      label: 'Sharded Execution (4 shards)',
      command: 'pnpm test:shard 4',
    },
    {
      label: 'Sharded Execution (8 shards)',
      command: 'pnpm test:shard 8',
    },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await runTestCommand(test.command, test.label);
      results.push(result);
    } catch (error) {
      console.error(`❌ Failed to run ${test.label}: ${error.message}`);
      results.push({
        ...test,
        success: false,
        wallClockTime: Infinity,
        error: error.message,
      });
    }
  }
  
  console.log('\n📊 Final Comparison:');
  console.log('===================\n');
  
  // Sort by execution time
  results.sort((a, b) => a.wallClockTime - b.wallClockTime);
  
  const baseline = results.find(r => r.label === 'Original Jest Config')?.wallClockTime || 42;
  
  results.forEach((result, index) => {
    const improvement = baseline - result.wallClockTime;
    const percentImprovement = (improvement / baseline) * 100;
    
    console.log(`${index + 1}. ${result.label}`);
    console.log(`   Time: ${result.wallClockTime.toFixed(2)}s`);
    console.log(`   Improvement: ${improvement.toFixed(2)}s (${percentImprovement.toFixed(1)}%)`);
    console.log(`   Status: ${result.success ? '✅ Passed' : '❌ Failed'}`);
    if (result.memoryDelta) {
      console.log(`   Memory: ${result.memoryDelta.heapUsed.toFixed(2)}MB heap`);
    }
    console.log();
  });
  
  const bestResult = results[0];
  if (bestResult.wallClockTime < 15) {
    console.log(`🎉 Target achieved! Tests now run in ${bestResult.wallClockTime.toFixed(2)}s (target: <15s)`);
    console.log(`🏆 Best configuration: ${bestResult.label}`);
  } else {
    console.log(`⚠️  Target not yet achieved. Best time: ${bestResult.wallClockTime.toFixed(2)}s (target: <15s)`);
  }
}

// CLI
async function main() {
  const command = process.argv[2];
  
  if (command === 'compare') {
    await compareImplementations();
  } else if (command) {
    const label = process.argv[3] || 'manual-test';
    await runTestCommand(command, label);
  } else {
    console.log(`
Performance Test Runner

Usage:
  node scripts/performance-runner.js compare              - Compare all implementations
  node scripts/performance-runner.js "<command>" [label]  - Run specific command

Examples:
  node scripts/performance-runner.js compare
  node scripts/performance-runner.js "pnpm test:perf" "Performance Config Test"
    `);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}