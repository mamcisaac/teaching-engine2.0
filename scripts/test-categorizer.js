#!/usr/bin/env node

/**
 * Test Categorizer for Teaching Engine 2.0
 * Analyzes and categorizes tests to help with organization
 */

import fs from 'fs';
import path from 'path';
import { glob, globSync } from 'glob';
import chalk from 'chalk';

class TestCategorizer {
  constructor() {
    this.categories = {
      unit: {
        pattern: /\.(unit|spec)\.test\.(ts|js)$/,
        files: [],
        characteristics: ['mocked dependencies', 'isolated', 'fast']
      },
      integration: {
        pattern: /\.(integration|int)\.test\.(ts|js)$/,
        files: [],
        characteristics: ['database access', 'multiple modules', 'slower']
      },
      e2e: {
        pattern: /\.(e2e|end-to-end)\.test\.(ts|js)$/,
        files: [],
        characteristics: ['full stack', 'browser testing', 'slowest']
      },
      performance: {
        pattern: /\.(performance|perf|benchmark)\.test\.(ts|js)$/,
        files: [],
        characteristics: ['timing sensitive', 'resource monitoring']
      },
      contract: {
        pattern: /\.(contract|api)\.test\.(ts|js)$/,
        files: [],
        characteristics: ['API contracts', 'schema validation']
      },
      security: {
        pattern: /\.(security|sec)\.test\.(ts|js)$/,
        files: [],
        characteristics: ['vulnerability checks', 'auth testing']
      }
    };
    
    this.testPatterns = {
      hasDatabase: /prisma|db|database|repository/i,
      hasHTTP: /supertest|request|axios|fetch/i,
      hasMocks: /mock|stub|spy|jest\.fn/i,
      hasAsync: /async|await|Promise/i,
      hasTimeout: /timeout|setTimeout|setInterval/i,
      hasFixtures: /fixture|seed|testData/i
    };
  }

  /**
   * Find all test files in the project
   */
  findTestFiles() {
    const patterns = [
      'server/**/*.test.{ts,js}',
      'client/**/*.test.{ts,tsx,js,jsx}',
      'packages/**/*.test.{ts,js}',
      'tests/**/*.{test,spec}.{ts,js}'
    ];
    
    const allTests = [];
    
    for (const pattern of patterns) {
      const files = globSync(pattern, {
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
      });
      allTests.push(...files);
    }
    
    return allTests;
  }

  /**
   * Analyze test file to determine its category
   */
  analyzeTestFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Check filename patterns first
    for (const [category, config] of Object.entries(this.categories)) {
      if (config.pattern.test(fileName)) {
        return { category, confidence: 'high' };
      }
    }
    
    // Analyze content for patterns
    const characteristics = {
      hasDatabase: this.testPatterns.hasDatabase.test(content),
      hasHTTP: this.testPatterns.hasHTTP.test(content),
      hasMocks: this.testPatterns.hasMocks.test(content),
      hasAsync: this.testPatterns.hasAsync.test(content),
      hasTimeout: this.testPatterns.hasTimeout.test(content),
      hasFixtures: this.testPatterns.hasFixtures.test(content)
    };
    
    // Heuristics for categorization
    if (characteristics.hasDatabase && characteristics.hasHTTP) {
      return { category: 'integration', confidence: 'high' };
    }
    
    if (characteristics.hasMocks && !characteristics.hasDatabase) {
      return { category: 'unit', confidence: 'high' };
    }
    
    if (content.includes('playwright') || content.includes('puppeteer')) {
      return { category: 'e2e', confidence: 'high' };
    }
    
    if (content.includes('performance') || content.includes('benchmark')) {
      return { category: 'performance', confidence: 'medium' };
    }
    
    // Default to unit if unsure
    return { category: 'unit', confidence: 'low' };
  }

  /**
   * Generate categorization report
   */
  generateReport() {
    const testFiles = this.findTestFiles();
    console.log(chalk.blue.bold(`\n📊 Test Categorization Report\n`));
    console.log(chalk.gray(`Found ${testFiles.length} test files\n`));
    
    const uncategorized = [];
    const suggestions = [];
    
    // Analyze each test file
    testFiles.forEach(file => {
      const { category, confidence } = this.analyzeTestFile(file);
      
      if (confidence === 'low') {
        uncategorized.push(file);
      }
      
      this.categories[category].files.push({
        path: file,
        confidence
      });
    });
    
    // Display results by category
    for (const [category, config] of Object.entries(this.categories)) {
      if (config.files.length > 0) {
        console.log(chalk.green(`${category.toUpperCase()} Tests (${config.files.length}):`));
        console.log(chalk.gray(`  Characteristics: ${config.characteristics.join(', ')}`));
        
        // Show a few examples
        config.files.slice(0, 3).forEach(({ path: filePath, confidence }) => {
          const confidenceColor = confidence === 'high' ? 'green' : confidence === 'medium' ? 'yellow' : 'red';
          console.log(`  • ${path.relative(process.cwd(), filePath)} ${chalk[confidenceColor](`[${confidence}]`)}`);
        });
        
        if (config.files.length > 3) {
          console.log(chalk.gray(`  ... and ${config.files.length - 3} more`));
        }
        console.log();
      }
    }
    
    // Show uncategorized tests
    if (uncategorized.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Uncategorized Tests (${uncategorized.length}):`));
      uncategorized.forEach(file => {
        console.log(`  • ${path.relative(process.cwd(), file)}`);
        
        // Suggest a category
        const suggestion = this.suggestCategory(file);
        if (suggestion) {
          suggestions.push({ file, suggestion });
        }
      });
    }
    
    // Show suggestions
    if (suggestions.length > 0) {
      console.log(chalk.cyan('\n💡 Suggestions:'));
      suggestions.forEach(({ file, suggestion }) => {
        const fileName = path.basename(file);
        const newName = fileName.replace(/\.test\.(ts|js)$/, `.${suggestion}.test.$1`);
        console.log(`  • Rename ${chalk.yellow(fileName)} → ${chalk.green(newName)}`);
      });
    }
    
    // Summary statistics
    console.log(chalk.blue('\n📈 Summary:'));
    const totalTests = testFiles.length;
    const categorizedTests = totalTests - uncategorized.length;
    const percentage = ((categorizedTests / totalTests) * 100).toFixed(1);
    
    console.log(`  • Total tests: ${totalTests}`);
    console.log(`  • Categorized: ${categorizedTests} (${percentage}%)`);
    console.log(`  • Uncategorized: ${uncategorized.length}`);
    
    // Recommendations
    console.log(chalk.green('\n✨ Recommendations:'));
    console.log('  1. Use consistent naming: *.unit.test.ts, *.integration.test.ts');
    console.log('  2. Place tests near source files for better organization');
    console.log('  3. Use test:unit for fast feedback, test:integration for thorough testing');
    console.log('  4. Run test:quick before commits for rapid validation');
  }

  /**
   * Suggest category based on file location and content
   */
  suggestCategory(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Location-based suggestions
    if (filePath.includes('/routes/') || filePath.includes('/api/')) {
      return 'integration';
    }
    
    if (filePath.includes('/services/') && content.includes('mock')) {
      return 'unit';
    }
    
    if (filePath.includes('/utils/') || filePath.includes('/helpers/')) {
      return 'unit';
    }
    
    if (filePath.includes('/e2e/') || content.includes('page.goto')) {
      return 'e2e';
    }
    
    return null;
  }

  /**
   * Generate test organization script
   */
  generateOrganizationScript() {
    const output = [];
    output.push('#!/bin/bash');
    output.push('# Test reorganization script generated by test-categorizer');
    output.push('# Review before running!');
    output.push('');
    
    const testFiles = this.findTestFiles();
    
    testFiles.forEach(file => {
      const { category, confidence } = this.analyzeTestFile(file);
      
      if (confidence === 'low') {
        const suggestion = this.suggestCategory(file);
        if (suggestion) {
          const fileName = path.basename(file);
          const newName = fileName.replace(/\.test\.(ts|js)$/, `.${suggestion}.test.$1`);
          const newPath = path.join(path.dirname(file), newName);
          
          output.push(`# Rename to clarify test type (confidence: ${confidence})`);
          output.push(`# mv "${file}" "${newPath}"`);
          output.push('');
        }
      }
    });
    
    const scriptPath = path.join(process.cwd(), 'reorganize-tests.sh');
    fs.writeFileSync(scriptPath, output.join('\n'), { mode: 0o755 });
    
    console.log(chalk.green(`\n✅ Generated reorganization script: ${scriptPath}`));
    console.log(chalk.yellow('   Review and uncomment lines before running!'));
  }
}

// CLI
function main() {
  const categorizer = new TestCategorizer();
  const args = process.argv.slice(2);
  
  if (args.includes('--organize')) {
    categorizer.generateOrganizationScript();
  }
  
  categorizer.generateReport();
}

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  main();
}

export default TestCategorizer;