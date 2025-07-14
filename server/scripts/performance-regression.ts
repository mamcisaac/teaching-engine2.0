#!/usr/bin/env tsx
/**
 * Performance Regression Testing
 * 
 * This script runs performance regression tests
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface BenchmarkResult {
  name: string;
  duration: number;
  memory: number;
  operations: number;
}

async function runPerformanceRegressionTests(): Promise<void> {
  console.log('📈 Running performance regression tests...\n');

  const benchmarks: BenchmarkResult[] = [];

  // Define performance benchmarks
  const performanceTests = [
    {
      name: 'Database Query Performance',
      test: async () => {
        const start = Date.now();
        const memBefore = process.memoryUsage().heapUsed;
        
        // Run database performance test
        execSync('npx jest src/tests/performance/database.perf.test.ts --testTimeout=30000', {
          stdio: 'ignore'
        });
        
        return {
          duration: Date.now() - start,
          memory: process.memoryUsage().heapUsed - memBefore,
          operations: 1000 // Mock number
        };
      }
    },
    {
      name: 'API Endpoint Performance',
      test: async () => {
        const start = Date.now();
        const memBefore = process.memoryUsage().heapUsed;
        
        // Run API performance test
        execSync('npx jest src/tests/performance/api.perf.test.ts --testTimeout=30000', {
          stdio: 'ignore'
        });
        
        return {
          duration: Date.now() - start,
          memory: process.memoryUsage().heapUsed - memBefore,
          operations: 500 // Mock number
        };
      }
    },
    {
      name: 'Service Layer Performance',
      test: async () => {
        const start = Date.now();
        const memBefore = process.memoryUsage().heapUsed;
        
        // Run service performance test
        execSync('npx jest src/tests/performance/services.perf.test.ts --testTimeout=30000', {
          stdio: 'ignore'
        });
        
        return {
          duration: Date.now() - start,
          memory: process.memoryUsage().heapUsed - memBefore,
          operations: 2000 // Mock number
        };
      }
    }
  ];

  // Run benchmarks
  for (const test of performanceTests) {
    console.log(`Running: ${test.name}...`);
    try {
      const result = await test.test();
      benchmarks.push({
        name: test.name,
        ...result
      });
      
      console.log(`✅ ${test.name}: ${result.duration}ms, ${(result.memory / 1024 / 1024).toFixed(2)}MB`);
    } catch (error) {
      console.log(`❌ ${test.name}: Failed`);
      benchmarks.push({
        name: test.name,
        duration: -1,
        memory: -1,
        operations: 0
      });
    }
  }

  // Save results
  const resultsDir = path.join(process.cwd(), 'regression-analysis');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const results = {
    timestamp: new Date().toISOString(),
    commit: process.env.GITHUB_SHA ?? 'local',
    branch: process.env.GITHUB_REF ?? 'local',
    benchmarks,
    summary: {
      totalDuration: benchmarks.reduce((sum, b) => sum + (b.duration > 0 ? b.duration : 0), 0),
      totalMemory: benchmarks.reduce((sum, b) => sum + (b.memory > 0 ? b.memory : 0), 0),
      failedTests: benchmarks.filter(b => b.duration < 0).length
    }
  };

  const resultsFile = path.join(resultsDir, `regression-${Date.now()}.json`);
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

  console.log('\n📊 Performance Regression Summary:');
  console.log(`Total Duration: ${results.summary.totalDuration}ms`);
  console.log(`Total Memory: ${(results.summary.totalMemory / 1024 / 1024).toFixed(2)}MB`);
  console.log(`Failed Tests: ${results.summary.failedTests}`);
  
  console.log(`\n✅ Results saved to: ${resultsFile}`);

  if (results.summary.failedTests > 0) {
    process.exit(1);
  }
}

// Run regression tests
runPerformanceRegressionTests().catch(error => {
  console.error('❌ Performance regression tests failed:', error);
  process.exit(1);
});