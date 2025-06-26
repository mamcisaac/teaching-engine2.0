#!/usr/bin/env node

/**
 * Smart Test Runner for Teaching Engine 2.0
 * 
 * This script provides intelligent test execution with:
 * - Test result caching
 * - Parallel execution optimization
 * - Test selection based on file changes
 * - Performance monitoring
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

class SmartTestRunner {
  constructor() {
    this.cacheDir = path.join(process.cwd(), 'tests', 'temp', '.smart-cache');
    this.ensureCacheDir();
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Gets the hash of all source files for change detection
   */
  getSourceHash() {
    const srcDirs = ['server/src', 'client/src', 'packages'];
    let allFiles = [];

    for (const dir of srcDirs) {
      if (fs.existsSync(dir)) {
        allFiles.push(...this.getAllFiles(dir, ['.ts', '.tsx', '.js', '.jsx']));
      }
    }

    const fileHashes = allFiles.map(file => {
      try {
        const stats = fs.statSync(file);
        return `${file}:${stats.mtime.getTime()}:${stats.size}`;
      } catch {
        return `${file}:missing`;
      }
    });

    return crypto.createHash('md5').update(fileHashes.join('|')).digest('hex');
  }

  /**
   * Gets all files with specific extensions recursively
   */
  getAllFiles(dir, extensions) {
    const files = [];
    
    try {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = fs.statSync(fullPath);
        
        if (stats.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
          files.push(...this.getAllFiles(fullPath, extensions));
        } else if (stats.isFile()) {
          const ext = path.extname(entry);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch {
      // Ignore errors
    }
    
    return files;
  }

  /**
   * Checks if tests need to be run based on file changes
   */
  needsTestRun(testType) {
    const cacheFile = path.join(this.cacheDir, `last-run-${testType}.json`);
    
    if (!fs.existsSync(cacheFile)) {
      return true;
    }

    try {
      const lastRun = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      const currentHash = this.getSourceHash();
      
      // Check if source files have changed
      if (lastRun.sourceHash !== currentHash) {
        return true;
      }

      // Check if it's been more than 1 hour since last run
      const timeSinceLastRun = Date.now() - lastRun.timestamp;
      if (timeSinceLastRun > 60 * 60 * 1000) {
        return true;
      }

      return false;
    } catch {
      return true;
    }
  }

  /**
   * Records a test run
   */
  recordTestRun(testType, success) {
    const cacheFile = path.join(this.cacheDir, `last-run-${testType}.json`);
    
    const runData = {
      testType,
      success,
      timestamp: Date.now(),
      sourceHash: this.getSourceHash(),
    };
    
    fs.writeFileSync(cacheFile, JSON.stringify(runData, null, 2));
  }

  /**
   * Gets the optimal number of workers based on system resources and test type
   */
  getOptimalWorkers(testType) {
    const cpuCount = os.cpus().length;
    
    switch (testType) {
      case 'unit':
        // Unit tests can use more workers since they're fast and isolated
        return Math.min(cpuCount, 8);
      case 'integration':
        // Integration tests need fewer workers due to database constraints
        return 1;
      case 'e2e':
        // E2E tests run sequentially
        return 1;
      case 'performance':
        // Performance tests need consistent environment
        return 1;
      default:
        return Math.ceil(cpuCount / 2);
    }
  }

  /**
   * Runs tests with smart caching and optimization
   */
  async runTests(testType, options = {}) {
    const {
      force = false,
      verbose = false,
      coverage = false,
      watch = false,
    } = options;

    console.log(`🧪 Smart Test Runner - ${testType} tests`);

    // Check if we need to run tests
    if (!force && !watch && !this.needsTestRun(testType)) {
      console.log(`✅ ${testType} tests are up to date (use --force to run anyway)`);
      return true;
    }

    const workers = this.getOptimalWorkers(testType);
    const startTime = Date.now();

    try {
      let command;
      let args = [];

      if (testType === 'contract') {
        command = 'vitest';
        args = ['run', 'tests/contract'];
      } else {
        // Server tests
        command = 'pnpm';
        args = ['--filter', 'server', 'run', `test:${testType}`];
      }

      if (watch) {
        args.push('--watch');
      }
      if (coverage) {
        args.push('--coverage');
      }
      if (verbose) {
        args.push('--verbose');
      }

      console.log(`🚀 Running: ${command} ${args.join(' ')}`);
      console.log(`⚡ Using ${workers} worker${workers > 1 ? 's' : ''}`);

      const env = {
        ...process.env,
        TEST_WORKERS: workers.toString(),
      };

      // Run the tests
      const result = execSync(`${command} ${args.join(' ')}`, {
        stdio: 'inherit',
        env,
        cwd: process.cwd(),
      });

      const duration = Date.now() - startTime;
      console.log(`✅ ${testType} tests completed in ${(duration / 1000).toFixed(2)}s`);

      // Record successful run
      this.recordTestRun(testType, true);
      return true;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testType} tests failed after ${(duration / 1000).toFixed(2)}s`);
      
      // Record failed run
      this.recordTestRun(testType, false);
      return false;
    }
  }

  /**
   * Runs tests for files that have changed
   */
  async runChangedTests() {
    console.log('🔍 Analyzing changed files...');
    
    try {
      // Get changed files from git
      const changedFiles = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim())
        .filter(file => /\.(ts|tsx|js|jsx)$/.test(file));

      if (changedFiles.length === 0) {
        console.log('📝 No relevant files changed');
        return true;
      }

      console.log(`📁 Changed files: ${changedFiles.join(', ')}`);

      // Determine which test types to run based on changed files
      const testTypes = new Set();

      for (const file of changedFiles) {
        if (file.startsWith('server/src/')) {
          testTypes.add('unit');
          if (file.includes('integration') || file.includes('service')) {
            testTypes.add('integration');
          }
        } else if (file.startsWith('client/src/')) {
          testTypes.add('unit');
        } else if (file.startsWith('packages/')) {
          testTypes.add('unit');
          testTypes.add('integration');
        }
      }

      if (testTypes.size === 0) {
        console.log('🎯 No tests need to run for changed files');
        return true;
      }

      console.log(`🎯 Running tests: ${Array.from(testTypes).join(', ')}`);

      // Run tests in order of speed (unit -> integration)
      const orderedTests = ['unit', 'integration', 'e2e'].filter(type => testTypes.has(type));
      
      for (const testType of orderedTests) {
        const success = await this.runTests(testType);
        if (!success) {
          return false;
        }
      }

      return true;

    } catch (error) {
      console.error('❌ Failed to analyze changed files:', error.message);
      return false;
    }
  }

  /**
   * Clears the test cache
   */
  clearCache() {
    try {
      if (fs.existsSync(this.cacheDir)) {
        const files = fs.readdirSync(this.cacheDir);
        for (const file of files) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
      console.log('🧹 Test cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error.message);
    }
  }

  /**
   * Shows cache status
   */
  showCacheStatus() {
    console.log('📊 Test Cache Status:');
    
    const testTypes = ['unit', 'integration', 'e2e', 'performance'];
    
    for (const testType of testTypes) {
      const cacheFile = path.join(this.cacheDir, `last-run-${testType}.json`);
      
      if (fs.existsSync(cacheFile)) {
        try {
          const data = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
          const age = Date.now() - data.timestamp;
          const ageStr = age < 60000 ? `${Math.round(age / 1000)}s ago` :
                        age < 3600000 ? `${Math.round(age / 60000)}m ago` :
                        `${Math.round(age / 3600000)}h ago`;
          
          const status = data.success ? '✅' : '❌';
          console.log(`  ${testType}: ${status} ${ageStr}`);
        } catch {
          console.log(`  ${testType}: ❓ (corrupted cache)`);
        }
      } else {
        console.log(`  ${testType}: ➖ (never run)`);
      }
    }
  }
}

// CLI interface
async function main() {
  const runner = new SmartTestRunner();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🧪 Smart Test Runner for Teaching Engine 2.0

Usage:
  node smart-test-runner.js <command> [options]

Commands:
  unit                    Run unit tests
  integration             Run integration tests
  e2e                     Run e2e tests
  performance             Run performance tests
  contract                Run contract tests
  changed                 Run tests for changed files
  all                     Run all tests
  cache:clear             Clear test cache
  cache:status            Show cache status

Options:
  --force                 Force run even if cache is valid
  --verbose               Verbose output
  --coverage              Generate coverage report
  --watch                 Watch mode

Examples:
  node smart-test-runner.js unit
  node smart-test-runner.js integration --force
  node smart-test-runner.js changed
  node smart-test-runner.js all --coverage
`);
    process.exit(0);
  }

  const command = args[0];
  const options = {
    force: args.includes('--force'),
    verbose: args.includes('--verbose'),
    coverage: args.includes('--coverage'),
    watch: args.includes('--watch'),
  };

  try {
    let success = true;

    switch (command) {
      case 'unit':
      case 'integration':
      case 'e2e':
      case 'performance':
      case 'contract':
        success = await runner.runTests(command, options);
        break;

      case 'changed':
        success = await runner.runChangedTests();
        break;

      case 'all':
        const testTypes = ['unit', 'integration'];
        for (const testType of testTypes) {
          success = await runner.runTests(testType, options);
          if (!success) break;
        }
        break;

      case 'cache:clear':
        runner.clearCache();
        break;

      case 'cache:status':
        runner.showCacheStatus();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        process.exit(1);
    }

    process.exit(success ? 0 : 1);

  } catch (error) {
    console.error(`❌ Test runner failed:`, error.message);
    process.exit(1);
  }
}

// Check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default SmartTestRunner;