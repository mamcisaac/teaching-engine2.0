#!/usr/bin/env node

/**
 * Performance Testing Suite Runner for Teaching Engine 2.0
 * Orchestrates comprehensive performance testing and reporting
 */

import { spawn, exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  server: {
    url: process.env.PERFORMANCE_TEST_URL || 'http://localhost:3000',
    healthCheck: '/api/health',
  },
  artillery: {
    configPath: path.join(__dirname, '../artillery-config.yml'),
    outputDir: path.join(__dirname, '../results'),
    reportFormats: ['json', 'html'],
  },
  monitoring: {
    enabled: process.env.ENABLE_MONITORING !== 'false',
    metricsInterval: 5000,
    maxDuration: 30 * 60 * 1000, // 30 minutes
  },
  thresholds: {
    responseTime: {
      p95: 2000, // 95th percentile < 2s
      p99: 5000, // 99th percentile < 5s
    },
    errorRate: 0.01, // < 1% error rate
    throughput: 50, // > 50 req/sec
  },
};

// Utility functions
const log = {
  info: (msg) => console.log(`ℹ️  ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`✅ ${new Date().toISOString()} - ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`❌ ${new Date().toISOString()} - ${msg}`),
};

// Ensure output directory exists
async function ensureOutputDir() {
  try {
    await fs.mkdir(CONFIG.artillery.outputDir, { recursive: true });
    log.info(`Output directory ready: ${CONFIG.artillery.outputDir}`);
  } catch (error) {
    log.error(`Failed to create output directory: ${error.message}`);
    throw error;
  }
}

// Health check for the server
async function checkServerHealth() {
  log.info('Checking server health...');

  return new Promise((resolve, reject) => {
    const healthUrl = `${CONFIG.server.url}${CONFIG.server.healthCheck}`;

    exec(`curl -f ${healthUrl}`, (error, stdout, stderr) => {
      if (error) {
        log.error(`Server health check failed: ${error.message}`);
        reject(new Error(`Server not ready at ${CONFIG.server.url}`));
      } else {
        log.success('Server is healthy and ready for testing');
        resolve(true);
      }
    });
  });
}

// Start system monitoring
function startSystemMonitoring() {
  if (!CONFIG.monitoring.enabled) {
    log.info('System monitoring disabled');
    return null;
  }

  log.info('Starting system monitoring...');

  const metrics = {
    cpu: [],
    memory: [],
    network: [],
    responseTime: [],
  };

  const interval = setInterval(async () => {
    try {
      // Collect CPU usage
      const cpuUsage = await getCPUUsage();
      metrics.cpu.push({ timestamp: Date.now(), value: cpuUsage });

      // Collect memory usage
      const memoryUsage = await getMemoryUsage();
      metrics.memory.push({ timestamp: Date.now(), value: memoryUsage });

      // Quick health check for response time
      const responseTime = await measureResponseTime();
      metrics.responseTime.push({ timestamp: Date.now(), value: responseTime });
    } catch (error) {
      log.warn(`Monitoring error: ${error.message}`);
    }
  }, CONFIG.monitoring.metricsInterval);

  // Stop monitoring after max duration
  setTimeout(() => {
    clearInterval(interval);
    log.info('System monitoring stopped');
  }, CONFIG.monitoring.maxDuration);

  return { interval, metrics };
}

// Get CPU usage
function getCPUUsage() {
  return new Promise((resolve, reject) => {
    exec("top -l 1 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//'", (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(parseFloat(stdout.trim()) || 0);
      }
    });
  });
}

// Get memory usage
function getMemoryUsage() {
  return new Promise((resolve, reject) => {
    exec("ps -A -o %mem | awk '{sum+=$1} END {print sum}'", (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(parseFloat(stdout.trim()) || 0);
      }
    });
  });
}

// Measure response time
function measureResponseTime() {
  const start = Date.now();

  return new Promise((resolve) => {
    exec(
      `curl -s -o /dev/null -w "%{time_total}" ${CONFIG.server.url}/api/health`,
      (error, stdout) => {
        const time = error ? -1 : parseFloat(stdout) * 1000; // Convert to milliseconds
        resolve(time);
      },
    );
  });
}

// Run Artillery load test
function runArtilleryTest(scenario = 'all') {
  return new Promise((resolve, reject) => {
    log.info(`Starting Artillery load test (scenario: ${scenario})...`);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const outputFile = path.join(
      CONFIG.artillery.outputDir,
      `performance-${scenario}-${timestamp}.json`,
    );

    const artilleryArgs = ['run', CONFIG.artillery.configPath, '--output', outputFile];

    // Add scenario-specific configuration if not 'all'
    if (scenario !== 'all') {
      artilleryArgs.push('--scenario', scenario);
    }

    const artillery = spawn('artillery', artilleryArgs, {
      stdio: 'pipe',
      env: {
        ...process.env,
        TARGET_URL: CONFIG.server.url,
      },
    });

    let output = '';
    let errorOutput = '';

    artillery.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;

      // Log real-time progress
      if (chunk.includes('Summary report')) {
        log.info('Artillery test completed, generating summary...');
      } else if (chunk.includes('Scenarios launched')) {
        log.info(`Artillery progress: ${chunk.trim()}`);
      }
    });

    artillery.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    artillery.on('close', (code) => {
      if (code !== 0) {
        log.error(`Artillery test failed with code ${code}`);
        log.error(`Error output: ${errorOutput}`);
        reject(new Error(`Artillery test failed: ${errorOutput}`));
      } else {
        log.success('Artillery load test completed successfully');
        resolve({
          outputFile,
          output,
          scenario,
        });
      }
    });

    artillery.on('error', (error) => {
      log.error(`Failed to start Artillery: ${error.message}`);
      reject(error);
    });
  });
}

// Analyze test results
async function analyzeResults(resultFile) {
  try {
    log.info('Analyzing performance test results...');

    const resultsData = await fs.readFile(resultFile, 'utf-8');
    const results = JSON.parse(resultsData);

    const analysis = {
      summary: {
        totalRequests: results.aggregate.counters['http.requests'],
        totalErrors:
          results.aggregate.counters['http.responses'] -
          results.aggregate.counters['http.response_time.200'],
        duration: results.aggregate.duration,
        throughput:
          results.aggregate.counters['http.requests'] / (results.aggregate.duration / 1000),
      },
      performance: {
        responseTime: {
          mean: results.aggregate.summaries['http.response_time'].mean,
          p95: results.aggregate.summaries['http.response_time'].p95,
          p99: results.aggregate.summaries['http.response_time'].p99,
          max: results.aggregate.summaries['http.response_time'].max,
        },
      },
      thresholds: {
        passed: [],
        failed: [],
      },
    };

    // Check thresholds
    if (analysis.performance.responseTime.p95 <= CONFIG.thresholds.responseTime.p95) {
      analysis.thresholds.passed.push(
        `95th percentile response time: ${analysis.performance.responseTime.p95}ms ≤ ${CONFIG.thresholds.responseTime.p95}ms`,
      );
    } else {
      analysis.thresholds.failed.push(
        `95th percentile response time: ${analysis.performance.responseTime.p95}ms > ${CONFIG.thresholds.responseTime.p95}ms`,
      );
    }

    if (analysis.performance.responseTime.p99 <= CONFIG.thresholds.responseTime.p99) {
      analysis.thresholds.passed.push(
        `99th percentile response time: ${analysis.performance.responseTime.p99}ms ≤ ${CONFIG.thresholds.responseTime.p99}ms`,
      );
    } else {
      analysis.thresholds.failed.push(
        `99th percentile response time: ${analysis.performance.responseTime.p99}ms > ${CONFIG.thresholds.responseTime.p99}ms`,
      );
    }

    const errorRate = analysis.summary.totalErrors / analysis.summary.totalRequests;
    if (errorRate <= CONFIG.thresholds.errorRate) {
      analysis.thresholds.passed.push(
        `Error rate: ${(errorRate * 100).toFixed(2)}% ≤ ${(CONFIG.thresholds.errorRate * 100).toFixed(2)}%`,
      );
    } else {
      analysis.thresholds.failed.push(
        `Error rate: ${(errorRate * 100).toFixed(2)}% > ${(CONFIG.thresholds.errorRate * 100).toFixed(2)}%`,
      );
    }

    if (analysis.summary.throughput >= CONFIG.thresholds.throughput) {
      analysis.thresholds.passed.push(
        `Throughput: ${analysis.summary.throughput.toFixed(2)} req/s ≥ ${CONFIG.thresholds.throughput} req/s`,
      );
    } else {
      analysis.thresholds.failed.push(
        `Throughput: ${analysis.summary.throughput.toFixed(2)} req/s < ${CONFIG.thresholds.throughput} req/s`,
      );
    }

    return analysis;
  } catch (error) {
    log.error(`Failed to analyze results: ${error.message}`);
    throw error;
  }
}

// Generate comprehensive report
async function generateReport(analysis, monitoring) {
  const timestamp = new Date().toISOString();
  const reportPath = path.join(
    CONFIG.artillery.outputDir,
    `performance-report-${timestamp.replace(/[:.]/g, '-')}.md`,
  );

  const report = `# Teaching Engine 2.0 - Performance Test Report
Generated: ${timestamp}

## Test Summary
- **Total Requests**: ${analysis.summary.totalRequests.toLocaleString()}
- **Total Errors**: ${analysis.summary.totalErrors.toLocaleString()}
- **Test Duration**: ${(analysis.summary.duration / 1000).toFixed(1)} seconds
- **Throughput**: ${analysis.summary.throughput.toFixed(2)} requests/second
- **Error Rate**: ${((analysis.summary.totalErrors / analysis.summary.totalRequests) * 100).toFixed(2)}%

## Response Time Analysis
- **Mean Response Time**: ${analysis.performance.responseTime.mean.toFixed(2)}ms
- **95th Percentile**: ${analysis.performance.responseTime.p95.toFixed(2)}ms
- **99th Percentile**: ${analysis.performance.responseTime.p99.toFixed(2)}ms
- **Maximum Response Time**: ${analysis.performance.responseTime.max.toFixed(2)}ms

## SLA Compliance

### ✅ Passed Thresholds
${analysis.thresholds.passed.map((item) => `- ${item}`).join('\n')}

### ❌ Failed Thresholds
${
  analysis.thresholds.failed.length > 0
    ? analysis.thresholds.failed.map((item) => `- ${item}`).join('\n')
    : '- None (All thresholds passed!)'
}

## Recommendations

${
  analysis.thresholds.failed.length === 0
    ? '🎉 **All performance thresholds met!** The system is performing within acceptable limits for teacher workloads.'
    : `⚠️  **Performance issues detected.** Consider the following optimizations:

${
  analysis.performance.responseTime.p95 > CONFIG.thresholds.responseTime.p95
    ? '- Optimize database queries and add caching for frequent requests\n'
    : ''
}${
        analysis.summary.throughput < CONFIG.thresholds.throughput
          ? '- Scale server resources or optimize request handling\n'
          : ''
      }${
        analysis.summary.totalErrors / analysis.summary.totalRequests > CONFIG.thresholds.errorRate
          ? '- Investigate and fix error sources to improve reliability\n'
          : ''
      }`
}

## Teacher Workflow Impact

Based on these results:
- **Login Experience**: ${analysis.performance.responseTime.p95 <= 500 ? '✅ Excellent' : analysis.performance.responseTime.p95 <= 1000 ? '⚠️ Acceptable' : '❌ Needs Improvement'}
- **Lesson Planning**: ${analysis.performance.responseTime.p95 <= 2000 ? '✅ Smooth' : '❌ May Impact Productivity'}
- **Peak Hour Support**: ${analysis.summary.throughput >= 50 ? '✅ Can Handle 200+ Concurrent Teachers' : '❌ May Struggle During Peak Usage'}

---
*This report was generated automatically by the Teaching Engine 2.0 performance testing suite.*
`;

  await fs.writeFile(reportPath, report);
  log.success(`Performance report generated: ${reportPath}`);

  return reportPath;
}

// Main execution function
async function main() {
  try {
    log.info('🚀 Starting Teaching Engine 2.0 Performance Test Suite');

    // Setup
    await ensureOutputDir();
    await checkServerHealth();

    // Start monitoring
    const monitoring = startSystemMonitoring();

    // Run performance tests
    log.info('📊 Running comprehensive performance tests...');

    const scenarios = [
      'teacher_login_workflow',
      'weekly_lesson_planning',
      'curriculum_browsing',
      'student_management',
      'newsletter_generation',
    ];

    const results = [];

    for (const scenario of scenarios) {
      try {
        log.info(`🎯 Testing scenario: ${scenario}`);
        const result = await runArtilleryTest(scenario);
        results.push(result);

        // Brief pause between scenarios to allow system recovery
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        log.error(`Scenario ${scenario} failed: ${error.message}`);
        // Continue with other scenarios
      }
    }

    // Analyze results
    if (results.length > 0) {
      log.info('📈 Analyzing test results...');

      // Use the most comprehensive result for analysis
      const mainResult = results[0];
      const analysis = await analyzeResults(mainResult.outputFile);

      // Generate report
      const reportPath = await generateReport(analysis, monitoring);

      // Summary
      log.success(`🎉 Performance testing completed!`);
      log.info(`📄 Report available at: ${reportPath}`);

      if (analysis.thresholds.failed.length === 0) {
        log.success('✅ All performance thresholds passed - system ready for production!');
      } else {
        log.warn(
          `⚠️  ${analysis.thresholds.failed.length} performance threshold(s) failed - review needed`,
        );
      }

      // Exit with appropriate code
      process.exit(analysis.thresholds.failed.length === 0 ? 0 : 1);
    } else {
      log.error('❌ No test results available for analysis');
      process.exit(1);
    }
  } catch (error) {
    log.error(`💥 Performance testing failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  log.warn('🛑 Performance testing interrupted by user');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log.warn('🛑 Performance testing terminated');
  process.exit(1);
});

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
