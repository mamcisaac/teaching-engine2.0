#!/usr/bin/env node

/**
 * Verification Script for Mutation Testing Setup
 * Checks that all mutation testing components are properly configured
 */

const fs = require('fs/promises');
const path = require('path');
const { spawn } = require('child_process');

const REQUIRED_FILES = {
  server: [
    'stryker.conf.mjs',
    'stryker.core.conf.mjs',
    'package.json'
  ],
  client: [
    'stryker.conf.mjs', 
    'stryker.core.conf.mjs',
    'package.json'
  ],
  root: [
    'scripts/mutation-test-runner.cjs',
    '.github/workflows/mutation-testing.yml',
    'docs/MUTATION_TESTING.md'
  ]
};

const REQUIRED_PACKAGES = {
  server: [
    '@stryker-mutator/core',
    '@stryker-mutator/javascript-mutator',
    '@stryker-mutator/jest-runner',
    '@stryker-mutator/typescript-checker',
    '@stryker-mutator/html-reporter'
  ],
  client: [
    '@stryker-mutator/core',
    '@stryker-mutator/javascript-mutator', 
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
    '@stryker-mutator/html-reporter'
  ]
};

class MutationSetupVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
  }

  async verify() {
    console.log('🔍 Verifying Mutation Testing Setup for Teaching Engine 2.0\\n');

    try {
      await this.checkFiles();
      await this.checkPackages();
      await this.checkScripts();
      await this.checkConfigurations();
      await this.verifyStrykerInstallation();

      this.printResults();
      
      if (this.errors.length > 0) {
        console.log('\\n❌ Setup verification failed. Please fix the errors above.');
        process.exit(1);
      } else {
        console.log('\\n✅ Mutation testing setup verification passed!');
        console.log('\\n🧬 Ready to run mutation tests:');
        console.log('   pnpm test:mutation:core    # Quick core logic testing');
        console.log('   pnpm test:mutation         # Full mutation testing');
        process.exit(0);
      }
    } catch (error) {
      console.error('\\n💥 Verification failed with error:', error.message);
      process.exit(1);
    }
  }

  async checkFiles() {
    console.log('📁 Checking required files...');

    for (const [component, files] of Object.entries(REQUIRED_FILES)) {
      const baseDir = component === 'root' ? '.' : component;
      
      for (const file of files) {
        const filePath = path.join(baseDir, file);
        
        try {
          await fs.access(filePath);
          this.successes.push(`✓ ${filePath} exists`);
        } catch (error) {
          this.errors.push(`✗ Missing file: ${filePath}`);
        }
      }
    }
  }

  async checkPackages() {
    console.log('\\n📦 Checking installed packages...');

    for (const [component, packages] of Object.entries(REQUIRED_PACKAGES)) {
      const packageJsonPath = path.join(component, 'package.json');
      
      try {
        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
        const devDeps = packageJson.devDependencies || {};
        
        for (const pkg of packages) {
          if (devDeps[pkg]) {
            this.successes.push(`✓ ${component}: ${pkg} v${devDeps[pkg]} installed`);
          } else {
            this.errors.push(`✗ ${component}: Missing package ${pkg}`);
          }
        }
      } catch (error) {
        this.errors.push(`✗ Failed to read ${packageJsonPath}: ${error.message}`);
      }
    }
  }

  async checkScripts() {
    console.log('\\n📜 Checking package.json scripts...');

    // Check root scripts
    try {
      const rootPackage = JSON.parse(await fs.readFile('package.json', 'utf8'));
      const scripts = rootPackage.scripts || {};
      
      const expectedRootScripts = [
        'test:mutation',
        'test:mutation:server',
        'test:mutation:client',
        'test:mutation:core',
        'test:mutation:ci'
      ];
      
      for (const script of expectedRootScripts) {
        if (scripts[script]) {
          this.successes.push(`✓ Root script: ${script}`);
        } else {
          this.errors.push(`✗ Missing root script: ${script}`);
        }
      }
    } catch (error) {
      this.errors.push(`✗ Failed to check root scripts: ${error.message}`);
    }

    // Check component scripts
    for (const component of ['server', 'client']) {
      try {
        const packageJson = JSON.parse(await fs.readFile(path.join(component, 'package.json'), 'utf8'));
        const scripts = packageJson.scripts || {};
        
        if (scripts['test:mutation']) {
          this.successes.push(`✓ ${component}: test:mutation script`);
        } else {
          this.errors.push(`✗ ${component}: Missing test:mutation script`);
        }
      } catch (error) {
        this.warnings.push(`⚠ Failed to check ${component} scripts: ${error.message}`);
      }
    }
  }

  async checkConfigurations() {
    console.log('\\n⚙️  Checking Stryker configurations...');

    for (const component of ['server', 'client']) {
      for (const configFile of ['stryker.conf.mjs', 'stryker.core.conf.mjs']) {
        const configPath = path.join(component, configFile);
        
        try {
          const content = await fs.readFile(configPath, 'utf8');
          
          // Basic validation of config content
          const checks = [
            { pattern: /mutate:\s*\[/, name: 'mutate configuration' },
            { pattern: /testRunner:\s*['"](?:jest|vitest)['"]/, name: 'test runner' },
            { pattern: /thresholds:\s*\{/, name: 'thresholds configuration' },
            { pattern: /plugins:\s*\[/, name: 'plugins configuration' }
          ];
          
          for (const check of checks) {
            if (check.pattern.test(content)) {
              this.successes.push(`✓ ${component}/${configFile}: ${check.name}`);
            } else {
              this.warnings.push(`⚠ ${component}/${configFile}: Missing or invalid ${check.name}`);
            }
          }
        } catch (error) {
          this.errors.push(`✗ Failed to read ${configPath}: ${error.message}`);
        }
      }
    }
  }

  async verifyStrykerInstallation() {
    console.log('\\n🧬 Verifying Stryker installation...');

    for (const component of ['server', 'client']) {
      try {
        const result = await this.executeCommand('npx', ['@stryker-mutator/core', '--version'], component);
        const version = result.trim();
        this.successes.push(`✓ ${component}: Stryker mutator ${version} available`);
      } catch (error) {
        this.warnings.push(`⚠ ${component}: Stryker not available - ${error.message}`);
      }
    }
  }

  executeCommand(command, args, cwd = '.') {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { 
        cwd, 
        stdio: 'pipe',
        shell: true 
      });
      
      let output = '';
      let errorOutput = '';
      
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      proc.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed: ${errorOutput || output}`));
        }
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        proc.kill();
        reject(new Error('Command timeout'));
      }, 10000);
    });
  }

  printResults() {
    console.log('\\n📊 Verification Results:\\n');

    if (this.successes.length > 0) {
      console.log('✅ Successes:');
      this.successes.forEach(success => console.log(`   ${success}`));
    }

    if (this.warnings.length > 0) {
      console.log('\\n⚠️  Warnings:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\\n❌ Errors:');
      this.errors.forEach(error => console.log(`   ${error}`));
    }

    console.log(`\\n📈 Summary: ${this.successes.length} successes, ${this.warnings.length} warnings, ${this.errors.length} errors`);
  }
}

// Run verification if called directly
if (require.main === module) {
  const verifier = new MutationSetupVerifier();
  verifier.verify().catch(console.error);
}

module.exports = { MutationSetupVerifier };