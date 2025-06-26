#!/usr/bin/env node

/**
 * Test Isolation Script for Teaching Engine 2.0
 * 
 * This script ensures proper test isolation by managing environment variables
 * and database state between test runs.
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test environment configurations for different isolation levels
const isolationConfigs = {
  minimal: {
    description: 'Minimal isolation - shared database, isolated env vars',
    database: 'shared',
    env: 'isolated'
  },
  standard: {
    description: 'Standard isolation - separate database per test suite',
    database: 'per-suite',
    env: 'isolated'
  },
  strict: {
    description: 'Strict isolation - separate database per test file',
    database: 'per-file',
    env: 'isolated'
  },
  paranoid: {
    description: 'Paranoid isolation - separate process per test',
    database: 'per-test',
    env: 'isolated',
    process: 'per-test'
  }
};

// Environment variable isolation
class EnvironmentIsolator {
  constructor() {
    this.originalEnv = { ...process.env };
    this.testEnvs = new Map();
  }

  createIsolatedEnv(testId, baseEnv = {}) {
    const isolatedEnv = {
      ...this.originalEnv,
      ...baseEnv,
      NODE_ENV: 'test',
      TEST_ID: testId,
      DATABASE_URL: this.generateTestDatabaseUrl(testId)
    };

    this.testEnvs.set(testId, isolatedEnv);
    return isolatedEnv;
  }

  generateTestDatabaseUrl(testId) {
    const timestamp = Date.now();
    return `file:./test-${testId}-${timestamp}.db`;
  }

  applyEnvironment(testId) {
    const testEnv = this.testEnvs.get(testId);
    if (!testEnv) {
      throw new Error(`No environment found for test ID: ${testId}`);
    }

    // Clear current environment
    for (const key in process.env) {
      if (key !== 'PATH' && key !== 'HOME' && key !== 'USER') {
        delete process.env[key];
      }
    }

    // Apply test environment
    Object.assign(process.env, testEnv);
  }

  restoreOriginalEnvironment() {
    // Clear all environment variables
    for (const key in process.env) {
      if (key !== 'PATH' && key !== 'HOME' && key !== 'USER') {
        delete process.env[key];
      }
    }

    // Restore original environment
    Object.assign(process.env, this.originalEnv);
  }

  cleanup() {
    this.restoreOriginalEnvironment();
    
    // Clean up test databases
    for (const [testId, env] of this.testEnvs) {
      if (env.DATABASE_URL && env.DATABASE_URL.startsWith('file:')) {
        const dbPath = env.DATABASE_URL.replace('file:', '');
        const fullPath = join(rootDir, 'packages', 'database', dbPath);
        
        if (existsSync(fullPath)) {
          try {
            unlinkSync(fullPath);
            console.log(`${colors.green}✓ Cleaned up test database: ${dbPath}${colors.reset}`);
          } catch (error) {
            console.warn(`${colors.yellow}⚠ Could not clean up ${dbPath}: ${error.message}${colors.reset}`);
          }
        }
      }
    }
    
    this.testEnvs.clear();
  }
}

// Database isolation manager
class DatabaseIsolator {
  constructor() {
    this.testDatabases = new Set();
  }

  async createTestDatabase(testId) {
    const dbUrl = `file:./test-${testId}-${Date.now()}.db`;
    const dbPath = join(rootDir, 'packages', 'database', dbUrl.replace('file:', ''));
    
    console.log(`${colors.cyan}Creating test database: ${dbUrl}${colors.reset}`);
    
    // Create database with schema
    await this.runCommand(`cd packages/database && DATABASE_URL="${dbUrl}" npx prisma db push`);
    
    this.testDatabases.add(dbPath);
    return dbUrl;
  }

  async runCommand(command) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, [], { 
        shell: true, 
        stdio: 'pipe',
        cwd: rootDir 
      });

      let output = '';
      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        output += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Command failed with code ${code}: ${output}`));
        }
      });
    });
  }

  cleanup() {
    console.log(`${colors.cyan}Cleaning up test databases...${colors.reset}`);
    
    for (const dbPath of this.testDatabases) {
      if (existsSync(dbPath)) {
        try {
          unlinkSync(dbPath);
          // Also clean up related files
          const walFile = dbPath + '-wal';
          const shmFile = dbPath + '-shm';
          
          if (existsSync(walFile)) unlinkSync(walFile);
          if (existsSync(shmFile)) unlinkSync(shmFile);
          
          console.log(`${colors.green}✓ Removed: ${dbPath}${colors.reset}`);
        } catch (error) {
          console.warn(`${colors.yellow}⚠ Could not remove ${dbPath}: ${error.message}${colors.reset}`);
        }
      }
    }
    
    this.testDatabases.clear();
  }
}

// Main isolation manager
class TestIsolationManager {
  constructor(config = 'standard') {
    this.config = isolationConfigs[config] || isolationConfigs.standard;
    this.envIsolator = new EnvironmentIsolator();
    this.dbIsolator = new DatabaseIsolator();
    this.activeTests = new Map();
  }

  async setupTestEnvironment(testId, options = {}) {
    console.log(`${colors.blue}Setting up isolated environment for: ${testId}${colors.reset}`);
    console.log(`${colors.cyan}Isolation level: ${this.config.description}${colors.reset}`);
    
    try {
      // Create isolated environment
      const baseEnv = this.loadTestEnvironmentDefaults();
      const isolatedEnv = this.envIsolator.createIsolatedEnv(testId, baseEnv);
      
      // Create isolated database if needed
      if (this.config.database !== 'shared') {
        const dbUrl = await this.dbIsolator.createTestDatabase(testId);
        isolatedEnv.DATABASE_URL = dbUrl;
      }
      
      // Apply environment
      this.envIsolator.applyEnvironment(testId);
      
      // Store test info
      this.activeTests.set(testId, {
        startTime: Date.now(),
        config: this.config,
        env: isolatedEnv
      });
      
      console.log(`${colors.green}✓ Test environment ready for: ${testId}${colors.reset}`);
      return isolatedEnv;
      
    } catch (error) {
      console.error(`${colors.red}❌ Failed to setup test environment: ${error.message}${colors.reset}`);
      throw error;
    }
  }

  loadTestEnvironmentDefaults() {
    const envExamplePath = join(rootDir, '.env.test.example');
    
    if (!existsSync(envExamplePath)) {
      console.warn(`${colors.yellow}⚠ .env.test.example not found, using minimal defaults${colors.reset}`);
      return {
        NODE_ENV: 'test',
        JWT_SECRET: 'test-jwt-secret',
        PORT: '3001'
      };
    }
    
    const content = readFileSync(envExamplePath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key) {
          let value = valueParts.join('=');
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          env[key.trim()] = value;
        }
      }
    });
    
    return env;
  }

  async teardownTestEnvironment(testId) {
    const testInfo = this.activeTests.get(testId);
    
    if (!testInfo) {
      console.warn(`${colors.yellow}⚠ No test environment found for: ${testId}${colors.reset}`);
      return;
    }
    
    const duration = Date.now() - testInfo.startTime;
    console.log(`${colors.blue}Tearing down test environment: ${testId} (${duration}ms)${colors.reset}`);
    
    this.activeTests.delete(testId);
  }

  async cleanup() {
    console.log(`${colors.cyan}Performing complete test isolation cleanup...${colors.reset}`);
    
    // Cleanup all active tests
    for (const testId of this.activeTests.keys()) {
      await this.teardownTestEnvironment(testId);
    }
    
    // Cleanup isolators
    this.envIsolator.cleanup();
    this.dbIsolator.cleanup();
    
    console.log(`${colors.green}✅ Test isolation cleanup completed${colors.reset}`);
  }

  generateTestReport() {
    console.log(`\n${colors.blue}Test Isolation Report${colors.reset}`);
    console.log('====================');
    console.log(`Configuration: ${this.config.description}`);
    console.log(`Active tests: ${this.activeTests.size}`);
    
    if (this.activeTests.size > 0) {
      console.log('\nActive test environments:');
      for (const [testId, info] of this.activeTests) {
        const duration = Date.now() - info.startTime;
        console.log(`  - ${testId}: ${duration}ms`);
      }
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const testId = args[1] || `test-${Date.now()}`;
  const isolationLevel = args[2] || 'standard';
  
  const manager = new TestIsolationManager(isolationLevel);
  
  // Handle cleanup on exit
  const cleanup = async () => {
    await manager.cleanup();
    process.exit(0);
  };
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', () => manager.cleanup());
  
  try {
    switch (command) {
      case 'setup':
        await manager.setupTestEnvironment(testId);
        manager.generateTestReport();
        break;
        
      case 'teardown':
        await manager.teardownTestEnvironment(testId);
        break;
        
      case 'cleanup':
        await manager.cleanup();
        break;
        
      case 'report':
        manager.generateTestReport();
        break;
        
      default:
        console.log(`${colors.cyan}Test Isolation Manager${colors.reset}`);
        console.log('Usage: pnpm test:isolate <command> [testId] [level]');
        console.log('');
        console.log('Commands:');
        console.log('  setup    - Setup isolated test environment');
        console.log('  teardown - Teardown test environment');
        console.log('  cleanup  - Clean up all test environments');
        console.log('  report   - Show current test environments');
        console.log('');
        console.log('Isolation levels:');
        Object.entries(isolationConfigs).forEach(([level, config]) => {
          console.log(`  ${level.padEnd(10)} - ${config.description}`);
        });
        break;
    }
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Export for use as module
export { TestIsolationManager, EnvironmentIsolator, DatabaseIsolator };

// Run as CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}