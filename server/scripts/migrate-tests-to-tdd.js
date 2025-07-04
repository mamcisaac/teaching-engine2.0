#!/usr/bin/env node

/**
 * Script to help migrate tests from mocked to TDD-compliant real implementations
 * 
 * Usage: node scripts/migrate-tests-to-tdd.js [test-file-path]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to identify mocked tests
const MOCK_PATTERNS = [
  /import.*mock.*from.*mocks/gi,
  /jest\.mock\(/g,
  /mockResolvedValue/g,
  /mockImplementation/g,
  /mockReturnValue/g,
  /createMockModel/g,
  /@teaching-engine\/database.*mocks/g,
  /mockRequest|mockResponse|mockNext/g,
];

// Files that need migration
const TEST_FILES_TO_MIGRATE = [
  'src/middleware/__tests__/auth.test.ts',
  'src/middleware/__tests__/rateLimiter.test.ts',
  'src/services/ai/__tests__/aiService.unit.test.ts',
  'src/services/fileParsing/__tests__/csvParser.unit.test.ts',
  'src/services/fileParsing/__tests__/pdfParser.unit.test.ts',
  'src/services/base/__tests__/BaseService.unit.test.ts',
  'src/services/curriculum/parsers/__tests__/CSVParser.unit.test.ts',
  'src/services/curriculum/validators/__tests__/CurriculumValidator.unit.test.ts',
  'src/services/templates/engines/__tests__/HandlebarsEngine.unit.test.ts',
  'src/services/templates/providers/__tests__/LessonTemplateProvider.unit.test.ts',
];

/**
 * Analyze a test file for mock usage
 */
function analyzeTestFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const issues = [];
    const lineNumbers = {};

    // Check each pattern
    MOCK_PATTERNS.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        // Find line numbers
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            if (!lineNumbers[pattern.source]) {
              lineNumbers[pattern.source] = [];
            }
            lineNumbers[pattern.source].push(index + 1);
          }
        });
        
        issues.push({
          pattern: pattern.source,
          count: matches.length,
          lines: lineNumbers[pattern.source] || [],
        });
      }
    });

    return {
      filePath,
      hasMocks: issues.length > 0,
      issues,
      totalMockCount: issues.reduce((sum, issue) => sum + issue.count, 0),
    };
  } catch (error) {
    return {
      filePath,
      error: error.message,
    };
  }
}

/**
 * Generate migration suggestions
 */
function generateMigrationSuggestions(analysis) {
  const suggestions = [];

  if (analysis.error) {
    return [`Error reading file: ${analysis.error}`];
  }

  if (!analysis.hasMocks) {
    return ['✅ No mocks found - this file appears to be TDD-compliant!'];
  }

  // Add specific suggestions based on patterns found
  analysis.issues.forEach(issue => {
    if (issue.pattern.includes('mock.*from.*mocks')) {
      suggestions.push(`
📝 Replace mock imports (lines: ${issue.lines.join(', ')}):
   OLD: import { mockPrisma } from '../mocks/database.mock';
   NEW: import { setupRealTestLifecycle } from '../utils/tdd-test-utilities';`);
    }

    if (issue.pattern.includes('jest\\.mock')) {
      suggestions.push(`
📝 Remove jest.mock() calls (lines: ${issue.lines.join(', ')}):
   Remove these lines and use real implementations instead`);
    }

    if (issue.pattern.includes('mockResolvedValue|mockImplementation')) {
      suggestions.push(`
📝 Replace mock methods with real database operations (lines: ${issue.lines.join(', ')}):
   OLD: mockPrisma.user.findUnique.mockResolvedValue({...});
   NEW: const user = await testClient.user.create({ data: {...} });`);
    }

    if (issue.pattern.includes('mockRequest|mockResponse')) {
      suggestions.push(`
📝 Replace mock Express objects with real app testing (lines: ${issue.lines.join(', ')}):
   OLD: const req = mockRequest(); const res = mockResponse();
   NEW: const app = await createTestApp();
        const response = await request(app).post('/endpoint').send({...});`);
    }
  });

  // Add general migration steps
  suggestions.push(`
🔧 General Migration Steps:
1. Add test lifecycle setup:
   const testLifecycle = setupRealTestLifecycle();

2. Create real test data:
   const user = await createTestUser();
   const factory = new TestDataFactory();

3. Use real services:
   const service = await createRealService(ServiceClass);

4. Assert real database state:
   await realTestAssertions.assertDatabaseState(...);
`);

  return suggestions;
}

/**
 * Create a TDD-compliant test template
 */
function generateTDDTemplate(originalPath) {
  const testName = path.basename(originalPath, '.test.ts');
  
  return `/**
 * TDD-Compliant ${testName} Tests
 * Uses real implementations instead of mocks
 */

import { Express } from 'express';
import {
  createTestApp,
  createTestUser,
  setupRealTestLifecycle,
  realTestAssertions,
  TestDataFactory,
  createRealService,
} from '../../../tests/utils/tdd-test-utilities';
import request from 'supertest';

describe('${testName} - Real Implementation Tests', () => {
  const testLifecycle = setupRealTestLifecycle();
  let app: Express;
  let factory: TestDataFactory;

  beforeAll(async () => {
    app = await createTestApp();
    factory = new TestDataFactory();
    await factory.initialize();
  });

  describe('RED - Write Failing Tests First', () => {
    it('should fail when implementation is missing', async () => {
      // Write test that defines expected behavior
      // This should fail initially
    });
  });

  describe('GREEN - Implement Minimum Code', () => {
    it('should pass with minimal implementation', async () => {
      // Implement just enough to make test pass
    });
  });

  describe('REFACTOR - Improve Implementation', () => {
    it('should handle edge cases with real data', async () => {
      // Add comprehensive tests with real scenarios
    });

    it('should perform well with production data volumes', async () => {
      // Test with realistic data volumes
      const { subjects, students, expectations } = 
        await performanceHelpers.createRealisticDataVolume(factory, userId);
      
      // Test performance
      await performanceHelpers.measureDatabasePerformance(
        async () => {
          // Your operation here
        },
        100 // Max 100ms
      );
    });
  });
});`;
}

/**
 * Main execution
 */
function main() {
  const args = process.argv.slice(2);
  
  console.log('🔍 TDD Test Migration Analyzer\n');

  if (args[0] === '--generate-template') {
    const template = generateTDDTemplate(args[1] || 'Example');
    console.log(template);
    return;
  }

  const filesToAnalyze = args.length > 0 ? args : TEST_FILES_TO_MIGRATE;
  
  let totalMocks = 0;
  const results = [];

  filesToAnalyze.forEach(file => {
    const fullPath = path.resolve(process.cwd(), file);
    const analysis = analyzeTestFile(fullPath);
    
    if (!analysis.error && analysis.hasMocks) {
      totalMocks += analysis.totalMockCount;
      results.push(analysis);
      
      console.log(`\n📄 ${file}`);
      console.log(`   Found ${analysis.totalMockCount} mock usage(s)`);
      
      const suggestions = generateMigrationSuggestions(analysis);
      suggestions.forEach(suggestion => console.log(suggestion));
    } else if (analysis.error) {
      console.log(`\n❌ ${file}: ${analysis.error}`);
    } else {
      console.log(`\n✅ ${file}: Already TDD-compliant!`);
    }
  });

  console.log('\n📊 Summary:');
  console.log(`   Total files analyzed: ${filesToAnalyze.length}`);
  console.log(`   Files with mocks: ${results.length}`);
  console.log(`   Total mock usages: ${totalMocks}`);
  
  if (results.length > 0) {
    console.log('\n🎯 Priority Order for Migration:');
    results
      .sort((a, b) => b.totalMockCount - a.totalMockCount)
      .forEach((result, index) => {
        console.log(`   ${index + 1}. ${path.basename(result.filePath)} (${result.totalMockCount} mocks)`);
      });
  }

  console.log('\n💡 To generate a TDD template for a test:');
  console.log('   node scripts/migrate-tests-to-tdd.js --generate-template [TestName]');
}

// Run the script
main();