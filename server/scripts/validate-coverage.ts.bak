#!/usr/bin/env tsx
/**
 * Validate Coverage Thresholds
 * 
 * This script validates that test coverage meets required thresholds
 */

import * as fs from 'fs';
import * as path from 'path';

interface CoverageThresholds {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

interface CoverageSummary {
  total: {
    statements: { pct: number };
    branches: { pct: number };
    functions: { pct: number };
    lines: { pct: number };
  };
}

async function validateCoverage(): Promise<void> {
  console.log('🎯 Validating coverage thresholds...\n');

  const thresholds: CoverageThresholds = {
    statements: 90,
    branches: 85,
    functions: 85,
    lines: 90
  };

  // Look for coverage summary
  const coverageFile = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
  
  if (!fs.existsSync(coverageFile)) {
    console.log('❌ Coverage summary not found. Run tests with coverage first.');
    console.log('Run: pnpm test:coverage');
    process.exit(1);
  }

  const coverage: CoverageSummary = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));

  console.log('📊 Coverage Results:\n');
  
  let failedThresholds = 0;
  
  const categories: Array<keyof CoverageThresholds> = ['statements', 'branches', 'functions', 'lines'];
  
  categories.forEach(category => {
    const actual = coverage.total[category].pct;
    const threshold = thresholds[category];
    const passed = actual >= threshold;
    const emoji = passed ? '✅' : '❌';
    
    console.log(`${emoji} ${category.charAt(0).toUpperCase() + category.slice(1)}: ${actual.toFixed(2)}% (threshold: ${threshold}%)`);
    
    if (!passed) {
      failedThresholds++;
    }
  });

  // Additional analysis
  console.log('\n📈 Coverage Analysis:');
  
  const avgCoverage = (
    coverage.total.statements.pct +
    coverage.total.branches.pct +
    coverage.total.functions.pct +
    coverage.total.lines.pct
  ) / 4;
  
  console.log(`Average Coverage: ${avgCoverage.toFixed(2)}%`);
  
  if (avgCoverage >= 95) {
    console.log('🌟 Excellent coverage!');
  } else if (avgCoverage >= 90) {
    console.log('👍 Good coverage!');
  } else if (avgCoverage >= 80) {
    console.log('⚠️  Coverage needs improvement');
  } else {
    console.log('❌ Poor coverage - significant improvement needed');
  }

  // Generate detailed report
  const reportDir = path.join(process.cwd(), 'coverage-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = {
    timestamp: new Date().toISOString(),
    thresholds,
    actual: {
      statements: coverage.total.statements.pct,
      branches: coverage.total.branches.pct,
      functions: coverage.total.functions.pct,
      lines: coverage.total.lines.pct
    },
    passed: failedThresholds === 0,
    averageCoverage: avgCoverage
  };

  const reportFile = path.join(reportDir, `coverage-validation-${Date.now()}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  if (failedThresholds > 0) {
    console.log(`\n❌ Coverage validation failed! ${failedThresholds} thresholds not met.`);
    process.exit(1);
  } else {
    console.log('\n✅ All coverage thresholds met!');
  }
}

// Run validation
validateCoverage().catch(error => {
  console.error('❌ Coverage validation error:', error);
  process.exit(1);
});