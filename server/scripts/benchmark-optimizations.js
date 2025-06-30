#!/usr/bin/env node

/**
 * Benchmark Optimizations
 * Measures and compares all test optimization strategies
 */

import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import { cpus } from 'os';

const BASELINE_TARGET = 42; // Original baseline in seconds
const TARGET_TIME = 15; // Target time in seconds

async function runBenchmark(name, command, options = {}) {
  console.log(`\n🚀 Running: ${name}`);
  console.log(`📋 Command: ${command}`);
  
  const startTime = performance.now();
  const startCpu = process.cpuUsage();
  
  try {
    execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      timeout: 120000, // 2 minute timeout
      env: {
        ...process.env,
        FORCE_COLOR: '0',
        CI: 'true', // Disable interactive elements
      },
    });
    
    const endTime = performance.now();
    const endCpu = process.cpuUsage(startCpu);
    const duration = (endTime - startTime) / 1000;
    
    return {
      name,
      command,
      duration,
      cpuTime: (endCpu.user + endCpu.system) / 1000000,
      success: true,
      improvement: BASELINE_TARGET - duration,
      percentImprovement: ((BASELINE_TARGET - duration) / BASELINE_TARGET) * 100,
    };
  } catch (error) {
    const endTime = performance.now();
    const duration = (endTime - startTime) / 1000;
    
    return {
      name,
      command,
      duration,
      success: false,
      error: error.message,
      improvement: BASELINE_TARGET - duration,
      percentImprovement: ((BASELINE_TARGET - duration) / BASELINE_TARGET) * 100,
    };
  }
}

async function main() {
  console.log('🔬 Jest Performance Optimization Benchmark');
  console.log('==========================================');
  console.log(`📊 Baseline: ${BASELINE_TARGET}s`);
  console.log(`🎯 Target: <${TARGET_TIME}s`);
  console.log(`💻 CPU Cores: ${cpus().length}`);
  console.log();
  
  const benchmarks = [
    // Baseline configuration
    {
      name: 'Baseline (Original Config)',
      command: 'NODE_OPTIONS="--experimental-vm-modules" jest --config jest.config.js --testPathPattern="tests/unit" --maxWorkers=2',
    },
    
    // Optimization strategies
    {
      name: 'Parallel Execution (Auto Workers)',
      command: 'NODE_OPTIONS="--experimental-vm-modules" jest --config jest.config.js --testPathPattern="tests/unit" --maxWorkers=auto',
    },
    {
      name: 'Performance Config',
      command: 'pnpm test:perf',
    },
    {
      name: 'Turbo Mode',
      command: 'pnpm test:turbo',
    },
    {
      name: 'Sharded (4 shards)',
      command: 'pnpm test:shard 4',
    },
    {
      name: 'Sharded (8 shards)',
      command: 'pnpm test:shard 8',
    },
    {
      name: 'Fast Tests Only',
      command: 'pnpm test:fast-only',
    },
  ];
  
  const results = [];
  
  // Run benchmarks
  for (const benchmark of benchmarks) {
    const result = await runBenchmark(benchmark.name, benchmark.command);
    results.push(result);
    
    // Quick summary after each run
    console.log(`\n✅ Completed in ${result.duration.toFixed(2)}s`);
    if (result.duration < TARGET_TIME) {
      console.log(`🎉 Achieved target! (${result.percentImprovement.toFixed(1)}% improvement)`);
    }
  }
  
  // Final report
  console.log('\n\n📊 FINAL PERFORMANCE REPORT');
  console.log('============================\n');
  
  // Sort by duration
  results.sort((a, b) => a.duration - b.duration);
  
  // Print results table
  console.log('Rank | Strategy                    | Time     | Improvement | Status');
  console.log('-----|----------------------------|----------|-------------|--------');
  
  results.forEach((result, index) => {
    const rank = index + 1;
    const name = result.name.padEnd(26);
    const time = `${result.duration.toFixed(2)}s`.padEnd(8);
    const improvement = `${result.percentImprovement.toFixed(1)}%`.padEnd(11);
    const status = result.duration < TARGET_TIME ? '✅ Target' : '❌ Slow';
    
    console.log(`  ${rank}  | ${name} | ${time} | ${improvement} | ${status}`);
  });
  
  console.log('\n📈 Summary:');
  const bestResult = results[0];
  console.log(`  Best time: ${bestResult.duration.toFixed(2)}s (${bestResult.name})`);
  console.log(`  Improvement: ${bestResult.improvement.toFixed(2)}s (${bestResult.percentImprovement.toFixed(1)}%)`);
  
  if (bestResult.duration < TARGET_TIME) {
    console.log(`\n🎉 SUCCESS! Target achieved with ${bestResult.name}`);
    console.log(`   Reduced from ${BASELINE_TARGET}s to ${bestResult.duration.toFixed(2)}s`);
    
    // Provide implementation instructions
    console.log('\n🔧 To use this optimization:');
    console.log(`   1. Run tests with: ${bestResult.command}`);
    console.log('   2. Update CI/CD pipelines to use the optimized command');
    console.log('   3. Consider adding to package.json scripts for easy access');
  } else {
    console.log(`\n⚠️  Target not achieved. Best result: ${bestResult.duration.toFixed(2)}s`);
    console.log('   Consider additional optimizations:');
    console.log('   - Further test categorization');
    console.log('   - More aggressive mocking');
    console.log('   - Test file splitting');
    console.log('   - Hardware upgrades');
  }
  
  // Save results
  const report = {
    timestamp: new Date().toISOString(),
    baseline: BASELINE_TARGET,
    target: TARGET_TIME,
    cpuCores: cpus().length,
    results: results.map(r => ({
      ...r,
      achievedTarget: r.duration < TARGET_TIME,
    })),
    bestStrategy: bestResult,
  };
  
  import('fs').then(fs => {
    fs.writeFileSync(
      'test-optimization-report.json',
      JSON.stringify(report, null, 2)
    );
  });
  
  console.log('\n📝 Detailed report saved to test-optimization-report.json');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}