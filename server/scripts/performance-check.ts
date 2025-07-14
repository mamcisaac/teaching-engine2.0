#!/usr/bin/env tsx
/**
 * Performance Check for Tests
 * 
 * This script validates performance of test files
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface PerformanceResult {
  file: string;
  duration: number;
  status: 'fast' | 'acceptable' | 'slow' | 'very-slow';
}

async function checkTestPerformance(testFiles: string[]): Promise<void> {
  console.log('⚡ Validating performance of changed tests...\n');

  const results: PerformanceResult[] = [];
  const performanceThresholds = {
    fast: 100,        // < 100ms
    acceptable: 500,  // < 500ms
    slow: 2000,       // < 2s
    verySlow: 5000    // > 5s
  };

  for (const file of testFiles) {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  Skipping ${file} - file not found`);
      continue;
    }

    try {
      console.log(`Testing ${file}...`);
      
      const startTime = Date.now();
      execSync(`npx jest ${file} --testTimeout=10000 --maxWorkers=1`, {
        stdio: 'ignore'
      });
      const duration = Date.now() - startTime;

      let status: PerformanceResult['status'];
      if (duration < performanceThresholds.fast) {
        status = 'fast';
      } else if (duration < performanceThresholds.acceptable) {
        status = 'acceptable';
      } else if (duration < performanceThresholds.slow) {
        status = 'slow';
      } else {
        status = 'very-slow';
      }

      results.push({ file, duration, status });

      const emoji = {
        'fast': '🚀',
        'acceptable': '✅',
        'slow': '⚠️',
        'very-slow': '❌'
      }[status];

      console.log(`${emoji} ${file}: ${duration}ms (${status})`);
    } catch (error) {
      console.log(`❌ ${file}: Test failed or timed out`);
      results.push({ file, duration: -1, status: 'very-slow' });
    }
  }

  // Summary
  console.log('\n📊 Performance Summary:\n');
  
  const grouped = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`🚀 Fast (<100ms): ${grouped.fast ?? 0}`);
  console.log(`✅ Acceptable (<500ms): ${grouped.acceptable ?? 0}`);
  console.log(`⚠️  Slow (<2s): ${grouped.slow ?? 0}`);
  console.log(`❌ Very Slow (>2s): ${grouped['very-slow'] ?? 0}`);

  const slowTests = results.filter(r => r.status === 'slow' || r.status === 'very-slow');
  
  if (slowTests.length > 0) {
    console.log('\n⚠️  Slow tests that need optimization:');
    slowTests.forEach(test => {
      console.log(`  - ${test.file} (${test.duration}ms)`);
    });
  }

  // Fail if too many slow tests
  const totalTests = results.length;
  const slowTestPercentage = (slowTests.length / totalTests) * 100;
  
  if (slowTestPercentage > 20) {
    console.log(`\n❌ Too many slow tests: ${slowTestPercentage.toFixed(1)}% (threshold: 20%)`);
    process.exit(1);
  }

  console.log('\n✅ Test performance is acceptable!');
}

// Get test files from command line arguments or read from stdin
const testFiles = process.argv.slice(2);

if (testFiles.length === 0) {
  console.log('❌ No test files provided');
  console.log('Usage: tsx performance-check.ts <test-file1> <test-file2> ...');
  process.exit(1);
}

checkTestPerformance(testFiles).catch(error => {
  console.error('❌ Performance check failed:', error);
  process.exit(1);
});