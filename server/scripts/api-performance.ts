#!/usr/bin/env tsx
/**
 * API Performance Testing
 * 
 * This script tests API performance under load
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

interface PerformanceResult {
  endpoint: string;
  method: string;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  successRate: number;
  requestsPerSecond: number;
}

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = 10;
const TOTAL_REQUESTS = 100;

async function testEndpointPerformance(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<PerformanceResult> {
  const responseTimes: number[] = [];
  let successCount = 0;
  let errorCount = 0;
  
  const startTime = Date.now();
  
  // Run requests in batches
  for (let i = 0; i < TOTAL_REQUESTS; i += CONCURRENT_REQUESTS) {
    const batch = Array.from({ length: Math.min(CONCURRENT_REQUESTS, TOTAL_REQUESTS - i) }, async () => {
      const requestStart = Date.now();
      try {
        await axios({
          method,
          url: `${API_BASE_URL}${endpoint}`,
          data,
          timeout: 10000,
          validateStatus: (status) => status < 500
        });
        
        const responseTime = Date.now() - requestStart;
        responseTimes.push(responseTime);
        successCount++;
      } catch (error) {
        errorCount++;
      }
    });
    
    await Promise.all(batch);
  }
  
  const totalTime = Date.now() - startTime;
  
  return {
    endpoint,
    method,
    averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0,
    minResponseTime: Math.min(...responseTimes) || 0,
    maxResponseTime: Math.max(...responseTimes) || 0,
    successRate: (successCount / TOTAL_REQUESTS) * 100,
    requestsPerSecond: (TOTAL_REQUESTS / totalTime) * 1000
  };
}

async function runAPIPerformanceTests(): Promise<void> {
  console.log('⚡ Testing API performance under load...\n');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Concurrent Requests: ${CONCURRENT_REQUESTS}`);
  console.log(`Total Requests per Endpoint: ${TOTAL_REQUESTS}\n`);

  // Define endpoints to test
  const endpoints = [
    { path: '/api/health', method: 'GET' as const },
    { path: '/api/auth/status', method: 'GET' as const },
    { path: '/api/curriculum', method: 'GET' as const },
    { path: '/api/lesson-plans', method: 'GET' as const },
    { path: '/api/templates', method: 'GET' as const }
  ];

  const results: PerformanceResult[] = [];

  // Test each endpoint
  for (const endpoint of endpoints) {
    console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
    try {
      const result = await testEndpointPerformance(endpoint.path, endpoint.method);
      results.push(result);
      
      console.log(`✅ Complete - Avg: ${result.averageResponseTime.toFixed(2)}ms, Success: ${result.successRate}%`);
    } catch (error) {
      console.log(`❌ Failed - ${error.message}`);
    }
  }

  // Generate report
  console.log('\n📊 Performance Test Results:\n');
  console.log('| Endpoint | Method | Avg (ms) | Min (ms) | Max (ms) | Success % | RPS |');
  console.log('|----------|--------|----------|----------|----------|-----------|-----|');
  
  results.forEach(result => {
    console.log(
      `| ${result.endpoint.padEnd(20)} | ${result.method.padEnd(6)} | ${
        result.averageResponseTime.toFixed(2).padStart(8)
      } | ${
        result.minResponseTime.toString().padStart(8)
      } | ${
        result.maxResponseTime.toString().padStart(8)
      } | ${
        result.successRate.toFixed(1).padStart(9)
      } | ${
        result.requestsPerSecond.toFixed(1).padStart(3)
      } |`
    );
  });

  // Save results
  const reportsDir = path.join(process.cwd(), 'api-test-results');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    configuration: {
      baseUrl: API_BASE_URL,
      concurrentRequests: CONCURRENT_REQUESTS,
      totalRequests: TOTAL_REQUESTS
    },
    results,
    summary: {
      totalEndpointsTested: results.length,
      averageResponseTime: results.reduce((sum, r) => sum + r.averageResponseTime, 0) / results.length,
      overallSuccessRate: results.reduce((sum, r) => sum + r.successRate, 0) / results.length,
      slowestEndpoint: results.reduce((slow, r) => r.averageResponseTime > slow.averageResponseTime ? r : slow).endpoint
    }
  };

  const reportFile = path.join(reportsDir, `performance-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  console.log(`\n✅ Performance test complete! Report saved to: ${reportFile}`);

  // Fail if any endpoint has poor performance
  const failedEndpoints = results.filter(r => 
    r.averageResponseTime > 1000 || // > 1s average
    r.successRate < 95 || // < 95% success rate
    r.requestsPerSecond < 10 // < 10 RPS
  );

  if (failedEndpoints.length > 0) {
    console.log('\n❌ Some endpoints failed performance criteria:');
    failedEndpoints.forEach(endpoint => {
      console.log(`- ${endpoint.endpoint}: ${endpoint.averageResponseTime}ms avg, ${endpoint.successRate}% success`);
    });
    process.exit(1);
  }
}

// Run performance tests
runAPIPerformanceTests().catch(error => {
  console.error('❌ API performance test failed:', error);
  process.exit(1);
});