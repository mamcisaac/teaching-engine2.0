#!/usr/bin/env node

/**
 * Master Test Runner for Teaching Engine 2.0
 * Runs all E2E tests and generates comprehensive report
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

// Import test suites
const testOnboarding = require('./suites/onboarding.test');
const testPlanningCascade = require('./suites/planning-cascade.test');
const testCurriculum = require('./suites/curriculum.test');
const helpers = require('./helpers');

// ASCII Art Banner
const banner = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     Teaching Engine 2.0 - Comprehensive E2E Test Suite      ║
║                                                              ║
║     🍎 Testing Grade 1 French Immersion Features 📚         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;

// Test configuration
const TEST_SUITES = [
  {
    name: 'Onboarding Flow',
    fn: testOnboarding,
    critical: true
  },
  {
    name: 'Planning Cascade View',
    fn: testPlanningCascade,
    critical: true
  },
  {
    name: 'Curriculum Management',
    fn: testCurriculum,
    critical: false
  }
];

// Start servers if not running
async function startServers() {
  console.log('🚀 Checking server status...\n');
  
  // Check if servers are running
  const checkServer = (url) => {
    return new Promise((resolve) => {
      const urlParts = new URL(url);
      
      const options = {
        hostname: urlParts.hostname,
        port: urlParts.port,
        path: '/',
        method: 'GET',
        timeout: 2000
      };
      
      const req = http.request(options, (res) => {
        resolve(true);
      });
      
      req.on('error', () => {
        resolve(false);
      });
      
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  };
  
  const clientRunning = await checkServer('http://localhost:5173');
  const serverRunning = await checkServer('http://localhost:3000');
  
  if (!clientRunning) {
    console.log('⚠️  Client not running. Please start it with: cd client && npm run dev');
    console.log('   Then run this test again.\n');
    process.exit(1);
  } else {
    console.log('✅ Client is running on http://localhost:5173');
  }
  
  if (!serverRunning) {
    console.log('⚠️  Server not running. Continuing with client-only tests.');
    console.log('   Some features may not work without the server.\n');
  } else {
    console.log('✅ Server is running on http://localhost:3000');
  }
  
  console.log('');
}

// Run individual test suite
async function runTestSuite(suite) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📋 Running: ${suite.name}`);
  console.log(`${'='.repeat(60)}\n`);
  
  try {
    const results = await suite.fn();
    return results;
  } catch (error) {
    console.error(`❌ Fatal error in ${suite.name}:`, error);
    return {
      name: suite.name,
      passed: false,
      errors: [error.message],
      screenshots: [],
      duration: 0
    };
  }
}

// Main test runner
async function runAllTests() {
  console.log(banner);
  
  // Check servers
  await startServers();
  
  // Create screenshots directory
  await fs.mkdir(path.join(__dirname, 'screenshots'), { recursive: true });
  
  // Run test suites
  const allResults = [];
  let criticalFailure = false;
  
  for (const suite of TEST_SUITES) {
    const results = await runTestSuite(suite);
    allResults.push(results);
    
    if (!results.passed && suite.critical) {
      criticalFailure = true;
      console.log(`\n⚠️  Critical test failed: ${suite.name}`);
      console.log('   Continuing with remaining tests...\n');
    }
    
    // Small delay between suites
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Generate summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 TEST SUMMARY');
  console.log(`${'='.repeat(60)}\n`);
  
  const totalTests = allResults.length;
  const passedTests = allResults.filter(r => r.passed).length;
  const failedTests = allResults.filter(r => !r.passed).length;
  const totalDuration = allResults.reduce((sum, r) => sum + r.duration, 0);
  const totalScreenshots = allResults.reduce((sum, r) => sum + r.screenshots.length, 0);
  
  // Print results table
  console.log('Test Results:');
  console.log('-'.repeat(50));
  
  allResults.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const duration = `${result.duration}ms`;
    const screenshots = `${result.screenshots.length} screenshots`;
    
    console.log(`${status.padEnd(10)} ${result.name.padEnd(25)} ${duration.padEnd(10)} ${screenshots}`);
    
    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        console.log(`         └─ ${error}`);
      });
    }
  });
  
  console.log('-'.repeat(50));
  
  // Overall statistics
  console.log(`\n📈 Overall Statistics:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   Passed: ${passedTests} (${Math.round(passedTests/totalTests*100)}%)`);
  console.log(`   Failed: ${failedTests} (${Math.round(failedTests/totalTests*100)}%)`);
  console.log(`   Total Duration: ${(totalDuration/1000).toFixed(2)}s`);
  console.log(`   Screenshots Captured: ${totalScreenshots}`);
  
  // Performance metrics
  const avgMetrics = {
    domContentLoaded: 0,
    loadComplete: 0,
    firstPaint: 0
  };
  
  let metricsCount = 0;
  allResults.forEach(result => {
    if (result.metrics && result.metrics.domContentLoaded) {
      avgMetrics.domContentLoaded += result.metrics.domContentLoaded;
      avgMetrics.loadComplete += result.metrics.loadComplete;
      avgMetrics.firstPaint += result.metrics.firstPaint;
      metricsCount++;
    }
  });
  
  if (metricsCount > 0) {
    console.log(`\n⚡ Average Performance Metrics:`);
    console.log(`   DOM Content Loaded: ${Math.round(avgMetrics.domContentLoaded/metricsCount)}ms`);
    console.log(`   Page Load Complete: ${Math.round(avgMetrics.loadComplete/metricsCount)}ms`);
    console.log(`   First Paint: ${Math.round(avgMetrics.firstPaint/metricsCount)}ms`);
  }
  
  // Generate HTML report
  console.log('\n📝 Generating HTML report...');
  const reportPath = await helpers.generateReport(allResults);
  console.log(`   Report saved to: ${reportPath}`);
  
  // List screenshot files
  console.log('\n📸 Screenshots saved:');
  const screenshotDir = path.join(__dirname, 'screenshots');
  const dirs = await fs.readdir(screenshotDir);
  
  for (const dir of dirs) {
    const dirPath = path.join(screenshotDir, dir);
    const stat = await fs.stat(dirPath);
    
    if (stat.isDirectory()) {
      const files = await fs.readdir(dirPath);
      console.log(`   ${dir}/: ${files.length} files`);
    }
  }
  
  // Exit code
  const exitCode = criticalFailure ? 1 : 0;
  
  if (exitCode === 0) {
    console.log('\n✅ All tests completed successfully!');
    console.log('   Teaching Engine 2.0 is working as expected.');
  } else {
    console.log('\n❌ Some critical tests failed.');
    console.log('   Please review the errors and screenshots.');
  }
  
  console.log('\n👋 Test run complete!\n');
  
  process.exit(exitCode);
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

// Run tests
runAllTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});