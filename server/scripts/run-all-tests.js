#!/usr/bin/env node

/**
 * Comprehensive test runner for Teaching Engine 2.0
 * Runs all test suites with proper error handling and reporting
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';

const testSuites = [
  {
    name: 'Unit Tests',
    command: 'pnpm',
    args: ['test:unit'],
    description: 'Fast isolated unit tests with mocks',
  },
  {
    name: 'Integration Tests',
    command: 'pnpm',
    args: ['test:integration'],
    description: 'Tests with real database, mocked external services',
  },
  {
    name: 'AI Snapshot Tests',
    command: 'pnpm',
    args: ['test:ai-snapshots'],
    description: 'AI output regression testing',
  },
];

const runTestSuite = (suite) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running ${suite.name}...`);
    console.log(`📝 ${suite.description}`);
    console.log(`⏱️  Started at ${new Date().toLocaleTimeString()}`);
    
    const startTime = performance.now();
    
    const child = spawn(suite.command, suite.args, {
      stdio: 'inherit',
      shell: true,
    });
    
    child.on('close', (code) => {
      const endTime = performance.now();
      const duration = ((endTime - startTime) / 1000).toFixed(2);
      
      if (code === 0) {
        console.log(`✅ ${suite.name} completed successfully in ${duration}s`);
        resolve({ name: suite.name, success: true, duration });
      } else {
        console.log(`❌ ${suite.name} failed with exit code ${code} after ${duration}s`);
        resolve({ name: suite.name, success: false, duration, exitCode: code });
      }
    });
    
    child.on('error', (error) => {
      console.error(`💥 Failed to start ${suite.name}:`, error);
      reject(error);
    });
  });
};

const main = async () => {
  console.log('🧪 Teaching Engine 2.0 - Comprehensive Test Suite');
  console.log('=' .repeat(50));
  
  const results = [];
  const totalStartTime = performance.now();
  
  try {
    for (const suite of testSuites) {
      const result = await runTestSuite(suite);
      results.push(result);
      
      // Short pause between test suites to allow cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.error('💥 Test runner failed:', error);
    process.exit(1);
  }
  
  const totalEndTime = performance.now();
  const totalDuration = ((totalEndTime - totalStartTime) / 1000).toFixed(2);
  
  // Print summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    const details = result.exitCode ? ` (exit code: ${result.exitCode})` : '';
    console.log(`${status} ${result.name}: ${result.duration}s${details}`);
  });
  
  console.log(`\n⏱️  Total time: ${totalDuration}s`);
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n🔍 Failed test suites:');
    failed.forEach(result => {
      console.log(`  - ${result.name}`);
    });
    
    console.log('\n💡 To debug individual failures, run:');
    failed.forEach(result => {
      const suiteName = result.name.toLowerCase().replace(' tests', '').replace(' ', '-');
      console.log(`  pnpm test:${suiteName} --verbose`);
    });
    
    process.exit(1);
  } else {
    console.log('\n🎉 All test suites passed!');
    process.exit(0);
  }
};

// Handle SIGINT (Ctrl+C) gracefully
process.on('SIGINT', () => {
  console.log('\n⚠️  Test runner interrupted by user');
  process.exit(130);
});

main().catch(error => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});