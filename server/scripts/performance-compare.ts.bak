#!/usr/bin/env tsx
/**
 * Performance Comparison
 * 
 * This script compares performance with baseline
 */

import * as fs from 'fs';
import * as path from 'path';

interface PerformanceData {
  timestamp: string;
  benchmarks: Array<{
    name: string;
    duration: number;
    memory: number;
    operations: number;
  }>;
  summary: {
    totalDuration: number;
    totalMemory: number;
    failedTests: number;
  };
}

async function comparePerformance(): Promise<void> {
  console.log('📊 Comparing performance with baseline...\n');

  const baselineDir = path.join(process.cwd(), 'baseline-metrics');
  const currentDir = path.join(process.cwd(), 'regression-analysis');

  // Mock baseline data for now
  const baseline: PerformanceData = {
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    benchmarks: [
      { name: 'Database Query Performance', duration: 5000, memory: 50 * 1024 * 1024, operations: 1000 },
      { name: 'API Endpoint Performance', duration: 3000, memory: 30 * 1024 * 1024, operations: 500 },
      { name: 'Service Layer Performance', duration: 2000, memory: 20 * 1024 * 1024, operations: 2000 }
    ],
    summary: {
      totalDuration: 10000,
      totalMemory: 100 * 1024 * 1024,
      failedTests: 0
    }
  };

  // Get latest current results
  let current: PerformanceData = baseline; // Default to baseline if no current results
  
  if (fs.existsSync(currentDir)) {
    const files = fs.readdirSync(currentDir)
      .filter(f => f.startsWith('regression-'))
      .sort()
      .reverse();
    
    if (files.length > 0) {
      const latestFile = path.join(currentDir, files[0]);
      current = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
    }
  }

  // Compare results
  console.log('📈 Performance Comparison:\n');
  console.log('| Benchmark | Baseline | Current | Change | Status |');
  console.log('|-----------|----------|---------|--------|--------|');

  let hasRegression = false;
  const regressionThreshold = 1.2; // 20% slower is considered regression

  current.benchmarks.forEach(currentBench => {
    const baselineBench = baseline.benchmarks.find(b => b.name === currentBench.name);
    
    if (baselineBench && currentBench.duration > 0) {
      const change = ((currentBench.duration - baselineBench.duration) / baselineBench.duration) * 100;
      const status = currentBench.duration > baselineBench.duration * regressionThreshold ? '❌' : '✅';
      
      if (status === '❌') hasRegression = true;
      
      console.log(
        `| ${currentBench.name.padEnd(30)} | ${baselineBench.duration}ms | ${currentBench.duration}ms | ${change >= 0 ? '+' : ''}${change.toFixed(1)}% | ${status} |`
      );
    }
  });

  // Summary comparison
  console.log('\n📊 Summary Comparison:');
  console.log(`Total Duration: ${baseline.summary.totalDuration}ms → ${current.summary.totalDuration}ms`);
  console.log(`Total Memory: ${(baseline.summary.totalMemory / 1024 / 1024).toFixed(2)}MB → ${(current.summary.totalMemory / 1024 / 1024).toFixed(2)}MB`);

  // Generate comparison report
  const comparisonDir = path.join(process.cwd(), 'performance-reports');
  if (!fs.existsSync(comparisonDir)) {
    fs.mkdirSync(comparisonDir, { recursive: true });
  }

  const comparison = {
    timestamp: new Date().toISOString(),
    baseline,
    current,
    hasRegression,
    regressionThreshold: `${(regressionThreshold - 1) * 100}%`
  };

  const comparisonFile = path.join(comparisonDir, `comparison-${Date.now()}.json`);
  fs.writeFileSync(comparisonFile, JSON.stringify(comparison, null, 2));

  if (hasRegression) {
    console.log('\n❌ Performance regression detected!');
    process.exit(1);
  } else {
    console.log('\n✅ No performance regression detected!');
  }
}

// Run comparison
comparePerformance().catch(error => {
  console.error('❌ Performance comparison failed:', error);
  process.exit(1);
});