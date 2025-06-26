#!/usr/bin/env node

/**
 * Parallel Test Runner
 * Runs test suites in parallel for maximum performance
 */

const { spawn } = require('child_process');
const os = require('os');
const chalk = require('chalk');

class ParallelTestRunner {
  constructor() {
    this.maxWorkers = Math.floor(os.cpus().length * 0.75);
    this.results = [];
    this.startTime = Date.now();
  }

  async runTestSuites() {
    const suites = [
      { 
        name: 'Unit Tests', 
        command: 'pnpm',
        args: ['test:unit'],
        color: chalk.blue,
      },
      { 
        name: 'Integration Tests', 
        command: 'pnpm',
        args: ['test:integration'],
        color: chalk.green,
      },
      { 
        name: 'E2E Tests', 
        command: 'pnpm',
        args: ['test:e2e'],
        color: chalk.magenta,
      },
    ];

    console.log(chalk.bold(`🚀 Running ${suites.length} test suites in parallel`));
    console.log(chalk.gray(`   Using ${this.maxWorkers} worker processes\n`));

    // Run all suites in parallel
    const promises = suites.map(suite => this.runSuite(suite));
    const results = await Promise.allSettled(promises);

    // Process results
    console.log('\n' + chalk.bold('📊 Test Results:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    let allPassed = true;
    results.forEach((result, index) => {
      const suite = suites[index];
      const status = result.status === 'fulfilled';
      const icon = status ? '✅' : '❌';
      const statusText = status ? chalk.green('PASSED') : chalk.red('FAILED');
      
      console.log(`${icon} ${suite.color(suite.name.padEnd(20))} ${statusText}`);
      
      if (!status) {
        allPassed = false;
        console.log(chalk.red(`   Error: ${result.reason.message}`));
      }
    });

    // Summary
    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    console.log(chalk.gray('─'.repeat(50)));
    
    if (allPassed) {
      console.log(chalk.green.bold(`\n✨ All tests passed in ${duration}s!`));
    } else {
      console.log(chalk.red.bold(`\n💥 Some tests failed. Total time: ${duration}s`));
    }

    process.exit(allPassed ? 0 : 1);
  }

  runSuite(suite) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let output = '';
      let errorOutput = '';

      const child = spawn(suite.command, suite.args, {
        env: { 
          ...process.env, 
          NODE_ENV: 'test',
          FORCE_COLOR: '1',
          // Optimize Jest for parallel execution
          JEST_MAX_WORKERS: Math.floor(this.maxWorkers / 3).toString(),
        },
        shell: true,
      });

      child.stdout.on('data', (data) => {
        output += data.toString();
        if (process.env.VERBOSE) {
          process.stdout.write(suite.color(`[${suite.name}] `) + data);
        }
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
        if (process.env.VERBOSE) {
          process.stderr.write(suite.color(`[${suite.name}] `) + data);
        }
      });

      child.on('close', (code) => {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        if (code === 0) {
          // Extract test counts from output
          const testMatch = output.match(/(\d+) passed/);
          const testCount = testMatch ? testMatch[1] : 'unknown';
          
          console.log(suite.color(`[${suite.name}] ${testCount} tests passed in ${duration}s`));
          resolve({ suite: suite.name, duration, testCount });
        } else {
          reject(new Error(`${suite.name} failed with code ${code}\n${errorOutput}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start ${suite.name}: ${error.message}`));
      });
    });
  }
}

// Performance monitoring wrapper
class TestPerformanceMonitor {
  static logSlowTests(output) {
    const slowTestRegex = /SLOW TEST: (.*?) took (\d+)ms/g;
    let match;
    const slowTests = [];

    while ((match = slowTestRegex.exec(output)) !== null) {
      slowTests.push({ name: match[1], duration: parseInt(match[2]) });
    }

    if (slowTests.length > 0) {
      console.log(chalk.yellow('\n⚠️  Slow Tests Detected:'));
      slowTests
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 10)
        .forEach((test, i) => {
          console.log(chalk.yellow(`   ${i + 1}. ${test.name}: ${test.duration}ms`));
        });
    }
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    console.log(`
${chalk.bold('Parallel Test Runner')}

Usage: node parallel-test-runner.js [options]

Options:
  --verbose    Show test output in real-time
  --help       Show this help message

Environment Variables:
  VERBOSE=1    Same as --verbose flag
`);
    process.exit(0);
  }

  if (args.includes('--verbose')) {
    process.env.VERBOSE = '1';
  }

  new ParallelTestRunner().runTestSuites();
}

module.exports = { ParallelTestRunner };