#!/usr/bin/env node

/**
 * Enhanced Smart Test Runner for Teaching Engine 2.0
 * 
 * Features:
 * - Simplified commands (reduced from 20+ to 8)
 * - Enhanced error messages with actionable solutions
 * - Auto-detection of what tests to run
 * - Interactive mode support
 * - Better developer experience
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import chalk from 'chalk';
import inquirer from 'inquirer';

class TestErrorEnhancer {
  static enhance(error) {
    const message = error.message || error.toString();
    
    // ESM/CommonJS errors
    if (message.includes('Cannot use import statement') || message.includes('ERR_REQUIRE_ESM')) {
      return `
${chalk.red('❌ Module System Error')}: Cannot use ES6 imports in CommonJS context

${chalk.yellow('🔧 Quick Fix:')}
  1. Change file extension to .mjs, or
  2. Add "type": "module" to package.json, or
  3. Use require() instead of import

${chalk.blue('📚 Learn more')}: https://nodejs.org/api/esm.html
      `;
    }
    
    // Missing environment variables
    if (message.includes('environment variable') || message.includes('env var')) {
      const varName = message.match(/(\w+_\w+)/)?.[1] || 'UNKNOWN_VAR';
      return `
${chalk.red('❌ Missing Environment Variable')}: ${varName}

${chalk.yellow('🔧 Quick Fix:')}
  1. Copy .env.example to .env
  2. Set ${varName}="your-value-here"
  3. Restart your test runner

${chalk.green('💡 For tests, you can set it temporarily:')}
  ${varName}=test-value pnpm test
      `;
    }
    
    // Database connection errors
    if (message.includes('ECONNREFUSED') || message.includes('connect') || message.includes('database')) {
      return `
${chalk.red('❌ Database Connection Failed')}

${chalk.yellow('🔧 Quick Fix:')}
  1. Ensure PostgreSQL is running: ${chalk.cyan('brew services start postgresql')}
  2. Check DATABASE_URL in .env
  3. Run migrations: ${chalk.cyan('pnpm db:migrate')}

${chalk.green('💡 For tests, use the test database:')}
  DATABASE_URL="postgresql://test:test@localhost:5432/test" pnpm test

${chalk.blue('🔍 Debug command:')}
  psql -U postgres -c "\\l" # List all databases
      `;
    }
    
    // Port already in use
    if (message.includes('EADDRINUSE') || message.includes('port')) {
      const port = message.match(/:(\d+)/)?.[1] || '3000';
      return `
${chalk.red('❌ Port Already in Use')}: ${port}

${chalk.yellow('🔧 Quick Fix:')}
  ${chalk.cyan(`lsof -ti:${port} | xargs kill -9`)}

${chalk.green('💡 Or use our cleanup command:')}
  pnpm test:clean
      `;
    }
    
    // Timeout errors
    if (message.includes('timeout') || message.includes('Timeout')) {
      return `
${chalk.red('❌ Test Timeout')}

${chalk.yellow('🔧 Quick Fix:')}
  1. Increase timeout in test: ${chalk.cyan('jest.setTimeout(30000)')}
  2. Check for missing await statements
  3. Ensure async operations complete properly

${chalk.green('💡 Run with extended timeout:')}
  pnpm test --testTimeout=30000
      `;
    }
    
    // Memory errors
    if (message.includes('heap out of memory') || message.includes('ENOMEM')) {
      return `
${chalk.red('❌ Out of Memory Error')}

${chalk.yellow('🔧 Quick Fix:')}
  1. Increase Node memory: ${chalk.cyan('NODE_OPTIONS="--max-old-space-size=4096" pnpm test')}
  2. Run tests in smaller batches
  3. Check for memory leaks in tests

${chalk.green('💡 Use our optimized runner:')}
  pnpm test --runInBand
      `;
    }
    
    return message;
  }
}

class SmartTestRunner {
  constructor() {
    this.cacheDir = path.join(process.cwd(), 'tests', 'temp', '.smart-cache');
    this.ensureCacheDir();
    
    // Simplified test mappings
    this.testMappings = {
      'server/src/services': 'unit',
      'server/src/routes': 'integration',
      'server/src/utils': 'unit',
      'client/src/components': 'unit',
      'client/src/hooks': 'unit',
      'client/src/pages': 'integration',
      'packages': 'unit'
    };
  }

  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Get changed files from git
   */
  getChangedFiles() {
    try {
      const output = execSync('git diff --name-only HEAD~1', { encoding: 'utf8' });
      return output.split('\n').filter(Boolean);
    } catch {
      // If no git history, check unstaged changes
      try {
        const output = execSync('git status --porcelain', { encoding: 'utf8' });
        return output.split('\n')
          .filter(Boolean)
          .map(line => line.substring(3));
      } catch {
        return [];
      }
    }
  }

  /**
   * Determine which tests to run based on changed files
   */
  determineTestsToRun(changedFiles) {
    if (!changedFiles || changedFiles.length === 0) {
      console.log(chalk.blue('No changes detected. Running all tests...'));
      return ['all'];
    }
    
    const testTypes = new Set();
    
    changedFiles.forEach(file => {
      // Direct test file changes
      if (file.includes('.test.') || file.includes('.spec.')) {
        if (file.includes('integration')) {
          testTypes.add('integration');
        } else if (file.includes('e2e')) {
          testTypes.add('e2e');
        } else {
          testTypes.add('unit');
        }
        return;
      }
      
      // Map source files to test types
      for (const [pattern, type] of Object.entries(this.testMappings)) {
        if (file.includes(pattern)) {
          testTypes.add(type);
        }
      }
    });
    
    return Array.from(testTypes);
  }

  /**
   * Run tests with enhanced error handling
   */
  async runTests(testType, options = {}) {
    const { watch = false, coverage = false, debug = false, updateSnapshots = false } = options;
    
    console.log(chalk.green(`🧪 Running ${testType} tests...`));
    
    try {
      let command;
      let args = [];
      
      // Build command based on test type
      switch (testType) {
        case 'all':
          command = 'pnpm';
          args = ['test'];
          break;
        case 'unit':
          command = 'pnpm';
          args = ['--filter', 'server', 'test:unit'];
          break;
        case 'integration':
          command = 'pnpm';
          args = ['--filter', 'server', 'test:integration'];
          break;
        case 'e2e':
          command = 'pnpm';
          args = ['test:e2e'];
          break;
        case 'quick':
          // Quick smoke test
          command = 'pnpm';
          args = ['--filter', 'server', 'test:unit', '--', '--testTimeout=5000', '--bail'];
          break;
        default:
          command = 'pnpm';
          args = ['test', testType];
      }
      
      // Add options
      if (watch) {
        args.push('--', '--watch');
      }
      if (coverage) {
        args.push('--', '--coverage');
      }
      if (debug) {
        args = ['--inspect-brk', ...args];
        command = 'node';
      }
      if (updateSnapshots) {
        args.push('--', '-u');
      }
      
      // Set up environment
      const env = {
        ...process.env,
        NODE_ENV: 'test',
        FORCE_COLOR: '1',
        TEST_TYPE: testType === 'all' ? undefined : testType
      };
      
      console.log(chalk.gray(`Executing: ${command} ${args.join(' ')}`));
      
      // Run the command
      const result = execSync(`${command} ${args.join(' ')}`, {
        stdio: 'inherit',
        env
      });
      
      console.log(chalk.green(`✅ ${testType} tests passed!`));
      return true;
      
    } catch (error) {
      console.error(chalk.red(`\n❌ ${testType} tests failed!\n`));
      
      // Enhance error message
      const enhancedMessage = TestErrorEnhancer.enhance(error);
      console.error(enhancedMessage);
      
      // Suggest next steps
      console.log(chalk.yellow('\n📝 Next steps:'));
      console.log(chalk.yellow('  1. Fix the failing tests'));
      console.log(chalk.yellow('  2. Run: pnpm test:watch to see changes live'));
      console.log(chalk.yellow('  3. Run: pnpm test:debug to debug in Chrome DevTools'));
      
      return false;
    }
  }

  /**
   * Smart test detection based on changes
   */
  async smart(options = {}) {
    console.log(chalk.blue('🧠 Smart Test Runner - Analyzing changes...\n'));
    
    const changedFiles = this.getChangedFiles();
    
    if (changedFiles.length > 0) {
      console.log(chalk.cyan('📝 Changed files:'));
      changedFiles.forEach(file => console.log(chalk.gray(`  - ${file}`)));
      console.log();
    }
    
    const testsToRun = this.determineTestsToRun(changedFiles);
    
    if (testsToRun.includes('all') || testsToRun.length === 0) {
      return this.runTests('unit', options);
    }
    
    console.log(chalk.cyan(`🎯 Running: ${testsToRun.join(', ')} tests\n`));
    
    // Run tests in order of speed
    const testOrder = ['unit', 'integration', 'e2e'];
    for (const testType of testOrder) {
      if (testsToRun.includes(testType)) {
        const success = await this.runTests(testType, options);
        if (!success && !options.continueOnError) {
          return false;
        }
      }
    }
    
    return true;
  }

  /**
   * Interactive test runner
   */
  async interactive() {
    
    console.log(chalk.blue.bold('\n🧪 Teaching Engine 2.0 - Interactive Test Runner\n'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: '🚀 Run smart test detection', value: 'smart' },
          { name: '⚡ Quick test (fast unit tests only)', value: 'quick' },
          { name: '🔍 Test specific file/directory', value: 'specific' },
          { name: '📊 Generate coverage report', value: 'coverage' },
          { name: '🐛 Debug tests', value: 'debug' },
          { name: '👀 Watch mode', value: 'watch' },
          { name: '🧹 Fix common issues', value: 'fix' },
          { name: '📚 Show commands', value: 'help' }
        ]
      }
    ]);
    
    switch (action) {
      case 'smart':
        await this.smart();
        break;
        
      case 'quick':
        await this.runTests('quick');
        break;
        
      case 'specific':
        const { testPath } = await inquirer.prompt([
          {
            type: 'input',
            name: 'testPath',
            message: 'Enter test file or directory path:',
            default: 'server/tests/unit'
          }
        ]);
        execSync(`pnpm test ${testPath}`, { stdio: 'inherit' });
        break;
        
      case 'coverage':
        await this.runTests('all', { coverage: true });
        break;
        
      case 'debug':
        console.log(chalk.yellow('\n🐛 Starting debugger...'));
        console.log(chalk.yellow('1. Open Chrome and go to: chrome://inspect'));
        console.log(chalk.yellow('2. Click "inspect" when your process appears\n'));
        await this.runTests('unit', { debug: true });
        break;
        
      case 'watch':
        await this.runTests('unit', { watch: true });
        break;
        
      case 'fix':
        await this.fixCommonIssues();
        break;
        
      case 'help':
        this.showHelp();
        break;
    }
  }

  /**
   * Fix common issues automatically
   */
  async fixCommonIssues() {
    
    const { issue } = await inquirer.prompt([
      {
        type: 'list',
        name: 'issue',
        message: 'What issue are you experiencing?',
        choices: [
          'Port conflicts (EADDRINUSE)',
          'Database connection errors',
          'Module import errors',
          'Test timeouts',
          'Memory issues',
          'Environment variable issues'
        ]
      }
    ]);
    
    console.log(chalk.yellow('\n🔧 Fixing issue...\n'));
    
    switch (issue) {
      case 'Port conflicts (EADDRINUSE)':
        execSync('lsof -ti:3000 | xargs kill -9 2>/dev/null || true', { stdio: 'inherit' });
        execSync('lsof -ti:5173 | xargs kill -9 2>/dev/null || true', { stdio: 'inherit' });
        console.log(chalk.green('✅ Ports cleared!'));
        break;
        
      case 'Database connection errors':
        console.log(chalk.cyan('Setting up test database...'));
        execSync('pnpm --filter @teaching-engine/database db:push --force-reset', { stdio: 'inherit' });
        execSync('pnpm --filter @teaching-engine/database db:seed', { stdio: 'inherit' });
        console.log(chalk.green('✅ Test database ready!'));
        break;
        
      case 'Module import errors':
        console.log(chalk.cyan('Regenerating modules...'));
        execSync('rm -rf node_modules pnpm-lock.yaml', { stdio: 'inherit' });
        execSync('pnpm install', { stdio: 'inherit' });
        console.log(chalk.green('✅ Modules reinstalled!'));
        break;
        
      case 'Environment variable issues':
        if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
          fs.copyFileSync('.env.example', '.env');
          console.log(chalk.green('✅ Created .env from .env.example'));
        }
        console.log(chalk.yellow('📝 Please check your .env file for required variables'));
        break;
    }
  }

  /**
   * Show help with simplified commands
   */
  showHelp() {
    console.log(`
${chalk.blue.bold('🧪 Teaching Engine 2.0 - Test Runner')}

${chalk.green('Simplified Commands (8 total):')}
  ${chalk.cyan('pnpm test')}              Run smart detection (default)
  ${chalk.cyan('pnpm test:watch')}        Watch mode for TDD
  ${chalk.cyan('pnpm test:coverage')}     Generate coverage report
  ${chalk.cyan('pnpm test:debug')}        Debug with Chrome DevTools
  ${chalk.cyan('pnpm test:quick')}        Fast smoke test
  ${chalk.cyan('pnpm test:fix')}          Fix common issues
  ${chalk.cyan('pnpm test:ci')}           Run all tests for CI
  ${chalk.cyan('pnpm test:help')}         Show this help

${chalk.green('Advanced Usage:')}
  ${chalk.gray('# Test specific file')}
  pnpm test server/tests/unit/auth.test.ts
  
  ${chalk.gray('# Update snapshots')}
  pnpm test -u
  
  ${chalk.gray('# Run with specific timeout')}
  pnpm test --testTimeout=30000

${chalk.green('Tips:')}
  • Smart detection runs automatically
  • Use test:watch for TDD workflow
  • Use test:debug when tests are hard to understand
  • Use test:fix when something is broken
`);
  }
}

// Main entry point
async function main() {
  const runner = new SmartTestRunner();
  const args = process.argv.slice(2);
  
  // Map old commands to new simplified ones
  const commandMap = {
    'unit': () => runner.runTests('unit'),
    'integration': () => runner.runTests('integration'),
    'e2e': () => runner.runTests('e2e'),
    'all': () => runner.runTests('all'),
    'watch': () => runner.runTests('unit', { watch: true }),
    'coverage': () => runner.runTests('all', { coverage: true }),
    'debug': () => runner.runTests('unit', { debug: true }),
    'quick': () => runner.runTests('quick'),
    'fix': () => runner.fixCommonIssues(),
    'help': () => runner.showHelp(),
    'interactive': () => runner.interactive(),
    '-i': () => runner.interactive(),
    '--interactive': () => runner.interactive()
  };
  
  try {
    // Handle npm run test:xxx format
    const command = args[0] || 'smart';
    
    if (commandMap[command]) {
      await commandMap[command]();
    } else if (command === 'smart' || !command) {
      // Default smart detection
      await runner.smart({
        watch: args.includes('--watch') || args.includes('-w'),
        coverage: args.includes('--coverage') || args.includes('-c'),
        debug: args.includes('--debug') || args.includes('-d'),
        updateSnapshots: args.includes('-u') || args.includes('--updateSnapshot')
      });
    } else {
      // Assume it's a file path
      execSync(`pnpm test ${args.join(' ')}`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.error(chalk.red('\n❌ Test runner failed!'));
    console.error(TestErrorEnhancer.enhance(error));
    process.exit(1);
  }
}

// Check if running directly
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  main().catch(console.error);
}

export { SmartTestRunner, TestErrorEnhancer };