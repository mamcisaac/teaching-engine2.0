#!/usr/bin/env node

/**
 * Test Categorization Script
 * Analyzes and categorizes tests by performance characteristics
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { join, basename } from 'path';

// Test categorization patterns
const FAST_PATTERNS = [
  /\.(auth|validation|utils|helpers|parser|formatter)\.test\./,
  /unit\/.*\/(models|schemas|validators)\//,
  /\.fast\.test\./,
];

const SLOW_PATTERNS = [
  /integration\//,
  /e2e\//,
  /\.slow\.test\./,
  /curriculumImport.*test/,
  /newsletterService.*test/,
  /embeddingService.*test/,
  /ai.*test/,
  /llm.*test/,
  /pdf.*test/,
  /file.*upload.*test/,
];

const IO_INTENSIVE_PATTERNS = [
  /file.*service/i,
  /upload/i,
  /download/i,
  /pdf/i,
  /image/i,
  /export/i,
  /import/i,
];

async function analyzeTestFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const fileName = basename(filePath);
  
  // Check for test characteristics
  const characteristics = {
    hasTimeout: /test.*timeout|jest\.setTimeout/i.test(content),
    hasAsyncOperations: /async|await|Promise/i.test(content),
    hasDatabase: /prisma|database|\.create\(|\.findMany\(/i.test(content),
    hasNetworkCalls: /fetch|axios|http|api/i.test(content),
    hasFileOperations: /readFile|writeFile|createReadStream/i.test(content),
    hasMocking: /jest\.mock|mockImplementation/i.test(content),
    testCount: (content.match(/\bit\(/g) || []).length,
    describeCount: (content.match(/\bdescribe\(/g) || []).length,
  };
  
  // Categorize based on patterns and characteristics
  let category = 'medium';
  let estimatedTime = 1000; // Default 1s
  
  // Check if it matches fast patterns
  if (FAST_PATTERNS.some(pattern => pattern.test(filePath))) {
    category = 'fast';
    estimatedTime = 200;
  }
  // Check if it matches slow patterns
  else if (SLOW_PATTERNS.some(pattern => pattern.test(filePath))) {
    category = 'slow';
    estimatedTime = 5000;
  }
  // Check for IO-intensive operations
  else if (IO_INTENSIVE_PATTERNS.some(pattern => pattern.test(filePath))) {
    category = 'io-intensive';
    estimatedTime = 3000;
  }
  // Analyze characteristics for better categorization
  else {
    const heavyOperations = 
      characteristics.hasDatabase + 
      characteristics.hasNetworkCalls + 
      characteristics.hasFileOperations;
    
    if (heavyOperations === 0 && characteristics.testCount < 10) {
      category = 'fast';
      estimatedTime = 300;
    } else if (heavyOperations >= 2 || characteristics.testCount > 20) {
      category = 'slow';
      estimatedTime = 4000;
    }
  }
  
  // Adjust time based on test count
  estimatedTime *= Math.log10(characteristics.testCount + 1);
  
  return {
    file: filePath,
    category,
    estimatedTime: Math.round(estimatedTime),
    characteristics,
  };
}

async function categorizeAllTests() {
  console.log('🔍 Analyzing test files...\n');
  
  const testFiles = await glob('tests/**/*.test.ts', {
    cwd: join(process.cwd()),
  });
  
  const srcTestFiles = await glob('src/**/*.test.ts', {
    cwd: join(process.cwd()),
  });
  
  const allFiles = [...testFiles, ...srcTestFiles];
  console.log(`📋 Found ${allFiles.length} test files\n`);
  
  const categorized = {
    fast: [],
    medium: [],
    slow: [],
    'io-intensive': [],
  };
  
  const analyses = await Promise.all(
    allFiles.map(file => analyzeTestFile(file))
  );
  
  analyses.forEach(analysis => {
    categorized[analysis.category].push(analysis);
  });
  
  // Sort by estimated time
  Object.values(categorized).forEach(category => {
    category.sort((a, b) => a.estimatedTime - b.estimatedTime);
  });
  
  return categorized;
}

function generateOptimizedConfig(categorized) {
  const config = {
    // Fast tests - run with maximum parallelization
    fast: {
      testMatch: categorized.fast.map(t => t.file),
      maxWorkers: 'auto',
      testTimeout: 2000,
    },
    // Medium tests - moderate parallelization
    medium: {
      testMatch: categorized.medium.map(t => t.file),
      maxWorkers: 4,
      testTimeout: 5000,
    },
    // Slow tests - limited parallelization
    slow: {
      testMatch: categorized.slow.map(t => t.file),
      maxWorkers: 2,
      testTimeout: 10000,
    },
    // IO-intensive tests - sequential execution
    'io-intensive': {
      testMatch: categorized['io-intensive'].map(t => t.file),
      maxWorkers: 1,
      testTimeout: 8000,
    },
  };
  
  return config;
}

async function main() {
  const categorized = await categorizeAllTests();
  
  // Print analysis
  console.log('📊 Test Categorization Results:');
  console.log('==============================\n');
  
  let totalEstimatedTime = 0;
  
  Object.entries(categorized).forEach(([category, tests]) => {
    const categoryTime = tests.reduce((sum, t) => sum + t.estimatedTime, 0);
    totalEstimatedTime += categoryTime;
    
    console.log(`${category.toUpperCase()} (${tests.length} files, ~${(categoryTime / 1000).toFixed(1)}s)`);
    console.log('-'.repeat(50));
    
    tests.slice(0, 5).forEach(test => {
      console.log(`  ${test.file.substring(0, 60).padEnd(60)} ~${test.estimatedTime}ms`);
    });
    
    if (tests.length > 5) {
      console.log(`  ... and ${tests.length - 5} more`);
    }
    console.log();
  });
  
  console.log(`\n⏱️  Total estimated sequential time: ${(totalEstimatedTime / 1000).toFixed(1)}s`);
  console.log(`⚡ Estimated parallel time (8 cores): ~${(totalEstimatedTime / 8000).toFixed(1)}s\n`);
  
  // Generate optimized configuration
  const optimizedConfig = generateOptimizedConfig(categorized);
  
  // Write categorization report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: Object.values(categorized).reduce((sum, cat) => sum + cat.length, 0),
      categories: Object.entries(categorized).map(([name, tests]) => ({
        name,
        count: tests.length,
        estimatedTime: tests.reduce((sum, t) => sum + t.estimatedTime, 0),
      })),
    },
    categorized,
    optimizedConfig,
  };
  
  writeFileSync('test-categorization.json', JSON.stringify(report, null, 2));
  console.log('📝 Report saved to test-categorization.json');
  
  // Generate Jest config for each category
  console.log('\n🔧 Suggested test commands:');
  console.log('  pnpm test:fast    # Run only fast tests (~2s)');
  console.log('  pnpm test:medium  # Run medium tests (~8s)');
  console.log('  pnpm test:slow    # Run slow tests (~15s)');
  console.log('  pnpm test:turbo   # Run all with optimized config (~12s total)');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}