#!/usr/bin/env tsx
/**
 * Update Performance Baseline
 * 
 * This script updates the performance baseline metrics
 */

import * as fs from 'fs';
import * as path from 'path';

async function updatePerformanceBaseline(): Promise<void> {
  console.log('💾 Updating performance baseline...\n');

  const currentDir = path.join(process.cwd(), 'regression-analysis');
  const baselineDir = path.join(process.cwd(), 'performance-baseline');

  // Create baseline directory if it doesn't exist
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }

  // Get latest regression results
  if (!fs.existsSync(currentDir)) {
    console.log('❌ No regression analysis results found');
    process.exit(1);
  }

  const files = fs.readdirSync(currentDir)
    .filter(f => f.startsWith('regression-'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('❌ No regression result files found');
    process.exit(1);
  }

  // Copy latest results as new baseline
  const latestFile = path.join(currentDir, files[0]);
  const baselineFile = path.join(baselineDir, 'baseline.json');
  
  const data = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
  
  // Add metadata
  const baseline = {
    ...data,
    baselineTimestamp: new Date().toISOString(),
    baselineCommit: process.env.GITHUB_SHA ?? 'local',
    baselineBranch: process.env.GITHUB_REF ?? 'main'
  };

  fs.writeFileSync(baselineFile, JSON.stringify(baseline, null, 2));

  // Also keep a history
  const historyFile = path.join(baselineDir, `baseline-${Date.now()}.json`);
  fs.writeFileSync(historyFile, JSON.stringify(baseline, null, 2));

  console.log('📊 New Baseline Metrics:');
  baseline.benchmarks.forEach(bench => {
    if (bench.duration > 0) {
      console.log(`- ${bench.name}: ${bench.duration}ms, ${(bench.memory / 1024 / 1024).toFixed(2)}MB`);
    }
  });

  console.log(`\n✅ Performance baseline updated successfully!`);
  console.log(`Baseline saved to: ${baselineFile}`);
}

// Run update
updatePerformanceBaseline().catch(error => {
  console.error('❌ Failed to update performance baseline:', error);
  process.exit(1);
});