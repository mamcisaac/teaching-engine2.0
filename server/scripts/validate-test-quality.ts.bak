#!/usr/bin/env tsx
/**
 * Validate Test Quality Standards
 * 
 * This script validates that tests follow real implementation patterns
 * and meet quality standards.
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface QualityIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'error' | 'warning';
}

async function validateTestQuality(): Promise<void> {
  console.log('🔍 Validating test quality standards...\n');

  const issues: QualityIssue[] = [];
  
  // Find all test files
  const testFiles = await glob('src/**/*.test.ts', {
    cwd: process.cwd(),
    absolute: false
  });

  console.log(`Found ${testFiles.length} test files to validate\n`);

  for (const file of testFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    // Check for real implementation patterns
    const hasRealImplementationTests = content.includes('Real Implementation');
    const hasMockingLibrary = content.includes('jest.mock') || content.includes('vi.mock');
    const hasProperDescribeBlocks = content.includes('describe(');
    const hasTestCases = content.includes('it(') || content.includes('test(');
    const hasAssertions = content.includes('expect(');

    // Basic quality checks
    if (!hasProperDescribeBlocks) {
      issues.push({
        file,
        line: 1,
        issue: 'Test file should use describe blocks for organization',
        severity: 'warning'
      });
    }

    if (!hasTestCases) {
      issues.push({
        file,
        line: 1,
        issue: 'Test file has no test cases',
        severity: 'error'
      });
    }

    if (!hasAssertions) {
      issues.push({
        file,
        line: 1,
        issue: 'Test file has no assertions',
        severity: 'error'
      });
    }

    // Check for forbidden patterns
    lines.forEach((line, index) => {
      // Check for console.log in tests
      if (line.includes('console.log') && !line.trim().startsWith('//')) {
        issues.push({
          file,
          line: index + 1,
          issue: 'Remove console.log from tests',
          severity: 'warning'
        });
      }

      // Check for hardcoded timeouts
      if (line.includes('setTimeout') && !line.includes('jest.setTimeout')) {
        issues.push({
          file,
          line: index + 1,
          issue: 'Avoid hardcoded timeouts in tests',
          severity: 'warning'
        });
      }

      // Check for any type usage
      if (line.includes(': any') || line.includes('<any>')) {
        issues.push({
          file,
          line: index + 1,
          issue: 'Avoid using "any" type in tests',
          severity: 'warning'
        });
      }

      // Check for proper async handling
      if (line.includes('async') && !line.includes('await') && !line.includes('=>')) {
        const nextFewLines = lines.slice(index, index + 10).join('\n');
        if (!nextFewLines.includes('await')) {
          issues.push({
            file,
            line: index + 1,
            issue: 'Async function without await',
            severity: 'warning'
          });
        }
      }
    });

    // Check for test coverage
    if (hasRealImplementationTests && !hasMockingLibrary) {
      console.log(`✅ ${file}: Uses real implementations (no mocking)`);
    } else if (hasMockingLibrary) {
      console.log(`⚠️  ${file}: Contains mocking - consider real implementation tests`);
    }
  }

  // Report issues
  console.log('\n📊 Quality Report:\n');
  
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  if (errors.length > 0) {
    console.log(`❌ Found ${errors.length} errors:\n`);
    errors.forEach(error => {
      console.log(`  ${error.file}:${error.line} - ${error.issue}`);
    });
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Found ${warnings.length} warnings:\n`);
    warnings.forEach(warning => {
      console.log(`  ${warning.file}:${warning.line} - ${warning.issue}`);
    });
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All tests meet quality standards!');
  }

  // Exit with error if there are any errors
  if (errors.length > 0) {
    process.exit(1);
  }
}

// Run validation
validateTestQuality().catch(error => {
  console.error('❌ Test quality validation failed:', error);
  process.exit(1);
});