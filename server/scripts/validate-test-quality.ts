#!/usr/bin/env node
/**
 * Test Quality Validation Script
 * Validates that all tests follow real implementation testing standards
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { glob } from 'glob';

interface TestQualityResult {
  file: string;
  issues: TestQualityIssue[];
  score: number;
  passed: boolean;
}

interface TestQualityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  severity: number; // 0-100, higher is more severe
}

interface QualityStandards {
  minScore: number;
  requiredPatterns: { [key: string]: RegExp };
  forbiddenPatterns: { [key: string]: RegExp };
  performanceThresholds: { [key: string]: number };
}

const QUALITY_STANDARDS: QualityStandards = {
  minScore: 80,
  requiredPatterns: {
    realImplementation: /Real Implementation/i,
    performanceMonitoring: /performanceManager|measureTestPerformance|performanceTestUtils/,
    databaseCleanup: /afterEach.*cleanup|rollbackTransaction|afterAll.*disconnect/,
    realisticTestData: /createRealisticTestData|testUtils\.|faker\.|Factory\./,
    descriptiveTests: /should\s+.{10,}\s+when\s+.{5,}/
  },
  forbiddenPatterns: {
    jestMockServices: /jest\.mock\(['"].*\/services\/.*['"],?\s*\(\)\s*=>/,
    simpleTestData: /{\s*id:\s*[1-9],?\s*name:\s*['"]test['"]}/,
    mockReturnValue: /\.mock(Return|Resolved)Value\(/,
    hardcodedEmails: /@example\.com(?!.*test|.*fake)/,
    vagueTestNames: /it\(['"]should work['"]|test\(['"]basic/i
  },
  performanceThresholds: {
    maxTestCount: 50,        // Max tests per file
    maxFileSize: 2000,       // Max lines per test file
    maxComplexity: 20        // Max cyclomatic complexity
  }
};

class TestQualityValidator {
  private results: TestQualityResult[] = [];
  private totalFiles = 0;
  private passedFiles = 0;

  async validateTestFiles(pattern: string = '**/*.{test,spec}.ts'): Promise<void> {
    console.log('🔍 Scanning for test files...');
    
    const testFiles = await glob(pattern, {
      ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
      absolute: true
    });

    console.log(`Found ${testFiles.length} test files to validate`);
    this.totalFiles = testFiles.length;

    for (const file of testFiles) {
      try {
        const result = await this.validateFile(file);
        this.results.push(result);
        
        if (result.passed) {
          this.passedFiles++;
          console.log(`✅ ${relative(process.cwd(), file)} (Score: ${result.score}/100)`);
        } else {
          console.log(`❌ ${relative(process.cwd(), file)} (Score: ${result.score}/100)`);
          this.printIssues(result.issues);
        }
      } catch (error) {
        console.error(`❌ Error validating ${file}:`, error);
        this.results.push({
          file,
          issues: [{
            type: 'error',
            message: `Validation error: ${error}`,
            severity: 100
          }],
          score: 0,
          passed: false
        });
      }
    }
  }

  private async validateFile(filePath: string): Promise<TestQualityResult> {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relativePath = relative(process.cwd(), filePath);
    
    const issues: TestQualityIssue[] = [];
    let score = 100;

    // Check required patterns
    for (const [name, pattern] of Object.entries(QUALITY_STANDARDS.requiredPatterns)) {
      if (!pattern.test(content)) {
        const severity = this.getSeverityForMissingPattern(name);
        issues.push({
          type: severity > 50 ? 'error' : 'warning',
          message: this.getMessageForMissingPattern(name),
          severity
        });
        score -= severity;
      }
    }

    // Check forbidden patterns
    for (const [name, pattern] of Object.entries(QUALITY_STANDARDS.forbiddenPatterns)) {
      const matches = content.match(pattern);
      if (matches) {
        const severity = this.getSeverityForForbiddenPattern(name);
        const lineNumber = this.findLineNumber(content, matches[0]);
        issues.push({
          type: 'error',
          message: this.getMessageForForbiddenPattern(name),
          line: lineNumber,
          severity
        });
        score -= severity;
      }
    }

    // Check file-specific standards
    const fileIssues = this.validateFileStructure(content, lines, relativePath);
    issues.push(...fileIssues);
    score -= fileIssues.reduce((sum, issue) => sum + issue.severity, 0);

    // Check performance thresholds
    const performanceIssues = this.validatePerformanceThresholds(content, lines);
    issues.push(...performanceIssues);
    score -= performanceIssues.reduce((sum, issue) => sum + issue.severity, 0);

    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    return {
      file: relativePath,
      issues,
      score,
      passed: score >= QUALITY_STANDARDS.minScore && issues.filter(i => i.type === 'error').length === 0
    };
  }

  private validateFileStructure(content: string, lines: string[], filePath: string): TestQualityIssue[] {
    const issues: TestQualityIssue[] = [];

    // Check for proper test organization
    const hasDescribeBlock = /describe\s*\(/.test(content);
    if (!hasDescribeBlock) {
      issues.push({
        type: 'error',
        message: 'Test file must have at least one describe block',
        severity: 30
      });
    }

    // Check for import statements
    const hasTestUtilsImport = /import.*test.*utils|import.*testUtils/.test(content);
    const usesDatabaseOperations = /prisma|testDb|TestDatabaseManager/.test(content);
    
    if (usesDatabaseOperations && !hasTestUtilsImport) {
      issues.push({
        type: 'warning',
        message: 'Consider importing test utilities for database operations',
        severity: 10
      });
    }

    // Check for proper async handling
    const hasAsyncTests = /it\s*\(\s*['"].*['"],\s*async|test\s*\(\s*['"].*['"],\s*async/.test(content);
    const hasProperErrorHandling = /try\s*{|catch\s*\(|expect.*rejects|expect.*resolves/.test(content);
    
    if (hasAsyncTests && !hasProperErrorHandling) {
      issues.push({
        type: 'warning',
        message: 'Async tests should include proper error handling',
        severity: 15
      });
    }

    // Check for test isolation
    const isIntegrationTest = filePath.includes('integration') || content.includes('integration');
    if (isIntegrationTest) {
      const hasBeforeEach = /beforeEach\s*\(/.test(content);
      const hasAfterEach = /afterEach\s*\(/.test(content);
      
      if (!hasBeforeEach) {
        issues.push({
          type: 'warning',
          message: 'Integration tests should have beforeEach setup',
          severity: 10
        });
      }
      
      if (!hasAfterEach && usesDatabaseOperations) {
        issues.push({
          type: 'error',
          message: 'Integration tests with database operations must have afterEach cleanup',
          severity: 25
        });
      }
    }

    return issues;
  }

  private validatePerformanceThresholds(content: string, lines: string[]): TestQualityIssue[] {
    const issues: TestQualityIssue[] = [];

    // Check file size
    if (lines.length > QUALITY_STANDARDS.performanceThresholds.maxFileSize) {
      issues.push({
        type: 'warning',
        message: `Test file is too large (${lines.length} lines). Consider splitting into multiple files.`,
        severity: 15
      });
    }

    // Check test count
    const testCount = (content.match(/it\s*\(|test\s*\(/g) || []).length;
    if (testCount > QUALITY_STANDARDS.performanceThresholds.maxTestCount) {
      issues.push({
        type: 'warning',
        message: `Too many tests in one file (${testCount}). Consider organizing into multiple describe blocks or files.`,
        severity: 10
      });
    }

    // Check for potential performance issues
    const hasNestedLoops = /for\s*\(.*for\s*\(|while\s*\(.*while\s*\(/.test(content);
    if (hasNestedLoops) {
      issues.push({
        type: 'info',
        message: 'Nested loops detected - ensure test performance is acceptable',
        severity: 5
      });
    }

    // Check for database operations without transactions
    const hasDatabaseOps = /prisma\.(create|update|delete|upsert)/.test(content);
    const hasTransactionControl = /startTransaction|rollback|transaction/.test(content);
    
    if (hasDatabaseOps && !hasTransactionControl) {
      issues.push({
        type: 'warning',
        message: 'Database operations should use transactions for test isolation',
        severity: 20
      });
    }

    return issues;
  }

  private getSeverityForMissingPattern(pattern: string): number {
    const severityMap: { [key: string]: number } = {
      realImplementation: 50,
      performanceMonitoring: 20,
      databaseCleanup: 40,
      realisticTestData: 25,
      descriptiveTests: 15
    };
    return severityMap[pattern] || 10;
  }

  private getSeverityForForbiddenPattern(pattern: string): number {
    const severityMap: { [key: string]: number } = {
      jestMockServices: 50,
      simpleTestData: 20,
      mockReturnValue: 30,
      hardcodedEmails: 10,
      vagueTestNames: 25
    };
    return severityMap[pattern] || 15;
  }

  private getMessageForMissingPattern(pattern: string): string {
    const messageMap: { [key: string]: string } = {
      realImplementation: 'Test describe block must include "Real Implementation" identifier',
      performanceMonitoring: 'Tests should include performance monitoring (performanceManager, measureTestPerformance)',
      databaseCleanup: 'Tests with database operations must include proper cleanup (afterEach, rollback)',
      realisticTestData: 'Use realistic test data generators (testUtils, faker) instead of hardcoded values',
      descriptiveTests: 'Test descriptions should follow pattern: "should [action] when [condition]"'
    };
    return messageMap[pattern] || `Missing required pattern: ${pattern}`;
  }

  private getMessageForForbiddenPattern(pattern: string): string {
    const messageMap: { [key: string]: string } = {
      jestMockServices: 'Mocking internal services is forbidden - use real implementations with dependency injection',
      simpleTestData: 'Avoid simple hardcoded test objects - use realistic test data generators',
      mockReturnValue: 'Mock return values discouraged in real implementation tests',
      hardcodedEmails: 'Use test email domains (@test.com, @example.com) instead of real ones',
      vagueTestNames: 'Test names must be descriptive and specific'
    };
    return messageMap[pattern] || `Forbidden pattern detected: ${pattern}`;
  }

  private findLineNumber(content: string, searchText: string): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return 0;
  }

  private printIssues(issues: TestQualityIssue[]): void {
    for (const issue of issues) {
      const icon = issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
      const location = issue.line ? `:${issue.line}` : '';
      console.log(`  ${icon} ${issue.message}${location}`);
    }
  }

  generateReport(): void {
    console.log('\n📊 Test Quality Validation Report');
    console.log('='.repeat(50));
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total files: ${this.totalFiles}`);
    console.log(`  Passed: ${this.passedFiles} (${Math.round((this.passedFiles / this.totalFiles) * 100)}%)`);
    console.log(`  Failed: ${this.totalFiles - this.passedFiles}`);
    
    const averageScore = this.results.reduce((sum, r) => sum + r.score, 0) / this.results.length;
    console.log(`  Average quality score: ${Math.round(averageScore)}/100`);
    
    // Group issues by type
    const allIssues = this.results.flatMap(r => r.issues);
    const errorCount = allIssues.filter(i => i.type === 'error').length;
    const warningCount = allIssues.filter(i => i.type === 'warning').length;
    const infoCount = allIssues.filter(i => i.type === 'info').length;
    
    console.log(`\n🚨 Issues breakdown:`);
    console.log(`  Errors: ${errorCount}`);
    console.log(`  Warnings: ${warningCount}`);
    console.log(`  Info: ${infoCount}`);
    
    // Top issues
    const issueFrequency: { [key: string]: number } = {};
    allIssues.forEach(issue => {
      const key = issue.message.split(':')[0];
      issueFrequency[key] = (issueFrequency[key] || 0) + 1;
    });
    
    const topIssues = Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    if (topIssues.length > 0) {
      console.log(`\n🔥 Most common issues:`);
      topIssues.forEach(([issue, count], index) => {
        console.log(`  ${index + 1}. ${issue} (${count} occurrences)`);
      });
    }
    
    // Failing files
    const failingFiles = this.results.filter(r => !r.passed);
    if (failingFiles.length > 0) {
      console.log(`\n❌ Files requiring attention:`);
      failingFiles
        .sort((a, b) => a.score - b.score)
        .slice(0, 10)
        .forEach(file => {
          console.log(`  ${file.file} (Score: ${file.score}/100)`);
        });
    }
    
    // Recommendations
    console.log(`\n💡 Recommendations:`);
    if (averageScore < 70) {
      console.log('  - Review real implementation testing guidelines');
      console.log('  - Set up automated pre-commit hooks');
      console.log('  - Consider team training on testing standards');
    }
    if (errorCount > 0) {
      console.log('  - Fix critical errors before committing');
      console.log('  - Implement stricter linting rules');
    }
    if (warningCount > errorCount * 2) {
      console.log('  - Address warnings to improve test quality');
      console.log('  - Update test templates and documentation');
    }
    
    console.log('\n📚 Resources:');
    console.log('  - Real Implementation Testing Guide: docs/testing/REAL_IMPLEMENTATION_TESTING_STANDARDS.md');
    console.log('  - Test Utilities: server/tests/test-utils/');
    console.log('  - Performance Guidelines: docs/testing/PERFORMANCE_VISUAL_TESTING_STRATEGY.md');
  }

  getExitCode(): number {
    const criticalFailures = this.results.filter(r => 
      !r.passed && r.issues.some(i => i.type === 'error' && i.severity >= 40)
    ).length;
    
    return criticalFailures > 0 ? 1 : 0;
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const pattern = args.length > 0 ? args.join(' ') : '**/*.{test,spec}.ts';
  
  console.log('🔍 Real Implementation Test Quality Validator');
  console.log('==========================================\n');
  
  const validator = new TestQualityValidator();
  
  try {
    await validator.validateTestFiles(pattern);
    validator.generateReport();
    
    const exitCode = validator.getExitCode();
    if (exitCode === 0) {
      console.log('\n✅ All tests meet quality standards!');
    } else {
      console.log('\n❌ Some tests need improvement before they can be committed.');
    }
    
    process.exit(exitCode);
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TestQualityValidator, QUALITY_STANDARDS };