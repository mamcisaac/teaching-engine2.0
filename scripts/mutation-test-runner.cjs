#!/usr/bin/env node

/**
 * Comprehensive Mutation Testing Runner for Teaching Engine 2.0
 * Manages mutation testing across server and client with intelligent scheduling and reporting
 */

const { spawn, exec } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const { performance } = require('perf_hooks');

// Configuration
const CONFIG = {
  server: {
    dir: 'server',
    configFile: 'stryker.conf.mjs',
    coreConfigFile: 'stryker.core.conf.mjs',
    thresholds: {
      high: 85,
      low: 70,
      break: 60
    }
  },
  client: {
    dir: 'client',
    configFile: 'stryker.conf.mjs',
    coreConfigFile: 'stryker.core.conf.mjs',
    thresholds: {
      high: 80,
      low: 65,
      break: 50
    }
  },
  reporting: {
    baseDir: 'reports/mutation',
    summaryFile: 'mutation-summary.json',
    htmlReportFile: 'index.html'
  }
};

class MutationTestRunner {
  constructor() {
    this.results = {
      server: null,
      client: null,
      summary: {
        totalMutants: 0,
        killedMutants: 0,
        survivedMutants: 0,
        timedOutMutants: 0,
        runtimeErrorMutants: 0,
        mutationScore: 0,
        testExecutionTime: 0,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Main execution method
   */
  async run(options = {}) {
    const {
      target = 'both',        // 'server', 'client', 'both'
      scope = 'full',         // 'core', 'full'
      ci = false,             // CI mode with reduced output
      parallel = false,       // Run server and client in parallel
      threshold = null,       // Override threshold
      reporters = null        // Override reporters
    } = options;

    console.log('🧬 Starting Mutation Testing for Teaching Engine 2.0');
    console.log(`Target: ${target}, Scope: ${scope}, CI Mode: ${ci}`);
    
    const startTime = performance.now();

    try {
      // Validate environment
      await this.validateEnvironment();

      // Run mutation tests based on target
      if (target === 'both' && parallel) {
        await this.runParallel(scope, ci, threshold, reporters);
      } else {
        if (target === 'both' || target === 'server') {
          await this.runServer(scope, ci, threshold, reporters);
        }
        
        if (target === 'both' || target === 'client') {
          await this.runClient(scope, ci, threshold, reporters);
        }
      }

      // Generate comprehensive report
      await this.generateReport();

      // Check thresholds and exit appropriately
      const success = this.checkThresholds();
      
      const endTime = performance.now();
      this.results.summary.testExecutionTime = Math.round(endTime - startTime);

      console.log(`\\n✅ Mutation testing completed in ${Math.round((endTime - startTime) / 1000)}s`);
      
      if (!success && ci) {
        process.exit(1);
      }

      return success;
    } catch (error) {
      console.error('❌ Mutation testing failed:', error.message);
      if (ci) {
        process.exit(1);
      }
      throw error;
    }
  }

  /**
   * Validate that the environment is ready for mutation testing
   */
  async validateEnvironment() {
    console.log('🔍 Validating environment...');

    // Check if Stryker is installed
    for (const component of ['server', 'client']) {
      const packageJsonPath = path.join(CONFIG[component].dir, 'package.json');
      
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        const hasStryker = packageJson.devDependencies && 
                          packageJson.devDependencies['@stryker-mutator/core'];
        
        if (!hasStryker) {
          throw new Error(`Stryker not found in ${component}/package.json`);
        }
      } catch (error) {
        throw new Error(`Failed to validate ${component}: ${error.message}`);
      }
    }

    // Check if test suites pass before mutation testing
    console.log('🧪 Running pre-mutation test validation...');
    await this.runPreValidation();

    console.log('✅ Environment validation passed');
  }

  /**
   * Run tests to ensure they pass before mutation testing
   */
  async runPreValidation() {
    const serverTest = this.executeCommand('pnpm', ['--filter', 'server', 'test:quick'], 'server');
    const clientTest = this.executeCommand('pnpm', ['--filter', 'client', 'test:quick'], 'client');
    
    await Promise.all([serverTest, clientTest]);
  }

  /**
   * Run server mutation testing
   */
  async runServer(scope, ci, threshold, reporters) {
    console.log('\\n🖥️  Running server mutation tests...');
    
    const configFile = scope === 'core' ? CONFIG.server.coreConfigFile : CONFIG.server.configFile;
    const args = this.buildStrykerArgs(configFile, ci, threshold, reporters, 'server');
    
    const result = await this.executeStryker(args, CONFIG.server.dir);
    this.results.server = result;
    
    console.log(`Server mutation score: ${result.mutationScore}%`);
  }

  /**
   * Run client mutation testing
   */
  async runClient(scope, ci, threshold, reporters) {
    console.log('\\n🌐 Running client mutation tests...');
    
    const configFile = scope === 'core' ? CONFIG.client.coreConfigFile : CONFIG.client.configFile;
    const args = this.buildStrykerArgs(configFile, ci, threshold, reporters, 'client');
    
    const result = await this.executeStryker(args, CONFIG.client.dir);
    this.results.client = result;
    
    console.log(`Client mutation score: ${result.mutationScore}%`);
  }

  /**
   * Run server and client mutation testing in parallel
   */
  async runParallel(scope, ci, threshold, reporters) {
    console.log('\\n⚡ Running server and client mutation tests in parallel...');
    
    const serverPromise = this.runServer(scope, ci, threshold, reporters);
    const clientPromise = this.runClient(scope, ci, threshold, reporters);
    
    await Promise.all([serverPromise, clientPromise]);
  }

  /**
   * Build Stryker command arguments
   */
  buildStrykerArgs(configFile, ci, threshold, reporters, component) {
    const args = ['run', '--configFile', configFile];
    
    if (ci) {
      args.push('--logLevel', 'error');
      args.push('--maxConcurrentTestRunners', '1');
    }
    
    if (threshold) {
      args.push('--thresholds.break', threshold.toString());
    }
    
    if (reporters) {
      args.push('--reporters', reporters);
    } else if (ci) {
      args.push('--reporters', 'clear-text,progress');
    }
    
    return args;
  }

  /**
   * Execute Stryker mutation testing
   */
  async executeStryker(args, workingDir) {
    return new Promise((resolve, reject) => {
      const stryker = spawn('npx', ['stryker', ...args], {
        cwd: workingDir,
        stdio: 'pipe'
      });

      let output = '';
      let mutationScore = 0;
      let mutationStats = {
        total: 0,
        killed: 0,
        survived: 0,
        timedOut: 0,
        runtimeError: 0
      };

      stryker.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        if (!process.env.CI) {
          process.stdout.write(text);
        }

        // Parse mutation score from output
        const scoreMatch = text.match(/Mutation score: ([0-9.]+)%/);
        if (scoreMatch) {
          mutationScore = parseFloat(scoreMatch[1]);
        }

        // Parse detailed stats
        this.parseStrykerStats(text, mutationStats);
      });

      stryker.stderr.on('data', (data) => {
        output += data.toString();
        if (!process.env.CI) {
          process.stderr.write(data);
        }
      });

      stryker.on('close', (code) => {
        const result = {
          exitCode: code,
          mutationScore,
          stats: mutationStats,
          output,
          timestamp: new Date().toISOString()
        };

        if (code === 0 || (code === 1 && mutationScore > 0)) {
          // Stryker exits with 1 if mutation score is below threshold, but that's expected
          resolve(result);
        } else {
          reject(new Error(`Stryker failed with exit code ${code}`));
        }
      });
    });
  }

  /**
   * Parse Stryker output for detailed statistics
   */
  parseStrykerStats(output, stats) {
    // Parse mutation counts from Stryker output
    const patterns = {
      total: /([0-9]+) mutant\\(s\\) generated/,
      killed: /([0-9]+) killed/,
      survived: /([0-9]+) survived/,
      timedOut: /([0-9]+) timed out/,
      runtimeError: /([0-9]+) runtime error/
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = output.match(pattern);
      if (match) {
        stats[key] = parseInt(match[1], 10);
      }
    }
  }

  /**
   * Execute a command and return a promise
   */
  executeCommand(command, args, cwd = process.cwd()) {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { cwd, stdio: 'pipe' });
      
      let output = '';
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        output += data.toString();
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed: ${command} ${args.join(' ')}\\nOutput: ${output}`));
        }
      });
    });
  }

  /**
   * Generate comprehensive mutation testing report
   */
  async generateReport() {
    console.log('\\n📊 Generating mutation testing report...');

    // Calculate summary statistics
    this.calculateSummary();

    // Ensure reports directory exists
    await fs.mkdir(CONFIG.reporting.baseDir, { recursive: true });

    // Write JSON summary
    const summaryPath = path.join(CONFIG.reporting.baseDir, CONFIG.reporting.summaryFile);
    await fs.writeFile(summaryPath, JSON.stringify(this.results, null, 2));

    // Generate HTML report
    await this.generateHtmlReport();

    console.log(`Report generated: ${summaryPath}`);
  }

  /**
   * Calculate summary statistics across server and client
   */
  calculateSummary() {
    const { server, client } = this.results;
    const summary = this.results.summary;

    if (server) {
      summary.totalMutants += server.stats.total;
      summary.killedMutants += server.stats.killed;
      summary.survivedMutants += server.stats.survived;
      summary.timedOutMutants += server.stats.timedOut;
      summary.runtimeErrorMutants += server.stats.runtimeError;
    }

    if (client) {
      summary.totalMutants += client.stats.total;
      summary.killedMutants += client.stats.killed;
      summary.survivedMutants += client.stats.survived;
      summary.timedOutMutants += client.stats.timedOut;
      summary.runtimeErrorMutants += client.stats.runtimeError;
    }

    // Calculate overall mutation score
    if (summary.totalMutants > 0) {
      summary.mutationScore = Math.round(
        (summary.killedMutants / summary.totalMutants) * 100 * 100
      ) / 100;
    }
  }

  /**
   * Generate HTML report
   */
  async generateHtmlReport() {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Mutation Testing Report - Teaching Engine 2.0</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .component { margin-bottom: 30px; }
        .score { font-size: 24px; font-weight: bold; }
        .good { color: #4CAF50; }
        .warning { color: #FF9800; }
        .danger { color: #F44336; }
        .stats { display: flex; gap: 20px; }
        .stat { text-align: center; }
        .stat-value { font-size: 20px; font-weight: bold; }
        .stat-label { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧬 Mutation Testing Report</h1>
        <h2>Teaching Engine 2.0</h2>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>

    <div class="summary">
        <h3>Overall Summary</h3>
        <div class="score ${this.getScoreClass(this.results.summary.mutationScore)}">
            Mutation Score: ${this.results.summary.mutationScore}%
        </div>
        <div class="stats">
            <div class="stat">
                <div class="stat-value">${this.results.summary.totalMutants}</div>
                <div class="stat-label">Total Mutants</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.results.summary.killedMutants}</div>
                <div class="stat-label">Killed</div>
            </div>
            <div class="stat">
                <div class="stat-value">${this.results.summary.survivedMutants}</div>
                <div class="stat-label">Survived</div>
            </div>
            <div class="stat">
                <div class="stat-value">${Math.round(this.results.summary.testExecutionTime / 1000)}s</div>
                <div class="stat-label">Execution Time</div>
            </div>
        </div>
    </div>

    ${this.results.server ? this.generateComponentHtml('Server', this.results.server) : ''}
    ${this.results.client ? this.generateComponentHtml('Client', this.results.client) : ''}

    <div class="component">
        <h3>Thresholds</h3>
        <p>Server: High ≥${CONFIG.server.thresholds.high}%, Low ≥${CONFIG.server.thresholds.low}%, Break <${CONFIG.server.thresholds.break}%</p>
        <p>Client: High ≥${CONFIG.client.thresholds.high}%, Low ≥${CONFIG.client.thresholds.low}%, Break <${CONFIG.client.thresholds.break}%</p>
    </div>
</body>
</html>`;

    const htmlPath = path.join(CONFIG.reporting.baseDir, CONFIG.reporting.htmlReportFile);
    await fs.writeFile(htmlPath, html);
  }

  /**
   * Generate HTML for a component (server/client)
   */
  generateComponentHtml(name, result) {
    return `
    <div class="component">
        <h3>${name}</h3>
        <div class="score ${this.getScoreClass(result.mutationScore)}">
            Mutation Score: ${result.mutationScore}%
        </div>
        <div class="stats">
            <div class="stat">
                <div class="stat-value">${result.stats.total}</div>
                <div class="stat-label">Total Mutants</div>
            </div>
            <div class="stat">
                <div class="stat-value">${result.stats.killed}</div>
                <div class="stat-label">Killed</div>
            </div>
            <div class="stat">
                <div class="stat-value">${result.stats.survived}</div>
                <div class="stat-label">Survived</div>
            </div>
            <div class="stat">
                <div class="stat-value">${result.stats.timedOut}</div>
                <div class="stat-label">Timed Out</div>
            </div>
        </div>
    </div>`;
  }

  /**
   * Get CSS class for mutation score
   */
  getScoreClass(score) {
    if (score >= 80) return 'good';
    if (score >= 65) return 'warning';
    return 'danger';
  }

  /**
   * Check if mutation scores meet thresholds
   */
  checkThresholds() {
    let success = true;

    if (this.results.server) {
      const score = this.results.server.mutationScore;
      const threshold = CONFIG.server.thresholds.break;
      
      if (score < threshold) {
        console.log(`❌ Server mutation score ${score}% below threshold ${threshold}%`);
        success = false;
      } else {
        console.log(`✅ Server mutation score ${score}% meets threshold ${threshold}%`);
      }
    }

    if (this.results.client) {
      const score = this.results.client.mutationScore;
      const threshold = CONFIG.client.thresholds.break;
      
      if (score < threshold) {
        console.log(`❌ Client mutation score ${score}% below threshold ${threshold}%`);
        success = false;
      } else {
        console.log(`✅ Client mutation score ${score}% meets threshold ${threshold}%`);
      }
    }

    return success;
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--target':
        options.target = args[++i];
        break;
      case '--scope':
        options.scope = args[++i];
        break;
      case '--ci':
        options.ci = true;
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--threshold':
        options.threshold = parseInt(args[++i], 10);
        break;
      case '--reporters':
        options.reporters = args[++i];
        break;
      case '--help':
        console.log(`
Mutation Testing Runner for Teaching Engine 2.0

Usage: node mutation-test-runner.js [options]

Options:
  --target <server|client|both>    Target to test (default: both)
  --scope <core|full>             Test scope (default: full)
  --ci                            CI mode with reduced output
  --parallel                      Run server and client in parallel
  --threshold <number>            Override threshold for breaking builds
  --reporters <reporters>         Override reporters (e.g., 'html,clear-text')
  --help                          Show this help message

Examples:
  node mutation-test-runner.js --target server --scope core
  node mutation-test-runner.js --ci --parallel
  node mutation-test-runner.js --target client --threshold 70
        `);
        process.exit(0);
        break;
    }
  }

  const runner = new MutationTestRunner();
  runner.run(options).catch((error) => {
    console.error('Mutation testing failed:', error);
    process.exit(1);
  });
}

module.exports = { MutationTestRunner, CONFIG };