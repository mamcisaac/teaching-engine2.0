#!/usr/bin/env node

/**
 * Environment Validation Script for Teaching Engine 2.0
 * 
 * This script validates environment variables and configuration
 * to ensure tests can run successfully.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Required environment variables by category
const requiredEnvVars = {
  database: {
    vars: ['DATABASE_URL'],
    description: 'Database configuration'
  },
  auth: {
    vars: ['JWT_SECRET', 'JWT_REFRESH_SECRET'],
    description: 'Authentication tokens',
    canGenerate: true
  },
  server: {
    vars: ['PORT', 'NODE_ENV'],
    description: 'Server configuration',
    defaults: {
      PORT: '3001',
      NODE_ENV: 'test'
    }
  },
  frontend: {
    vars: ['CLIENT_URL'],
    description: 'Frontend configuration',
    defaults: {
      CLIENT_URL: 'http://localhost:5173'
    }
  }
};

// Optional but recommended variables
const optionalEnvVars = {
  ai: {
    vars: ['OPENAI_API_KEY', 'CLAUDE_API_KEY'],
    description: 'AI service keys (can use mocks for testing)'
  },
  aws: {
    vars: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET'],
    description: 'AWS configuration (can use LocalStack)'
  },
  email: {
    vars: ['EMAIL_FROM', 'EMAIL_HOST'],
    description: 'Email service configuration'
  },
  features: {
    vars: ['MOCK_EXTERNAL_APIS', 'MOCK_AI_RESPONSES'],
    description: 'Test feature flags'
  }
};

// Check if running in CI environment
function isCI() {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}

// Generate secure random string
function generateSecret(length = 32) {
  return createHash('sha256')
    .update(Math.random().toString() + Date.now().toString())
    .digest('hex')
    .substring(0, length);
}

// Load environment variables from file
function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }
  
  const content = readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key) {
        let value = valueParts.join('=');
        // Remove quotes if present
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

// Save environment variables to file
function saveEnvFile(filePath, env) {
  const content = Object.entries(env)
    .map(([key, value]) => {
      // Quote values containing spaces or special characters
      if (value.includes(' ') || value.includes('"') || value.includes("'")) {
        value = `"${value.replace(/"/g, '\\"')}"`;
      }
      return `${key}=${value}`;
    })
    .join('\n');
  
  writeFileSync(filePath, content + '\n');
}

// Validate a single environment file
function validateEnvFile(filePath, fileDescription) {
  console.log(`\n${colors.cyan}Validating ${fileDescription}...${colors.reset}`);
  
  const issues = [];
  const warnings = [];
  const fixes = {};
  
  let env = {};
  if (existsSync(filePath)) {
    env = loadEnvFile(filePath);
    console.log(`  ✓ File exists: ${filePath}`);
  } else {
    issues.push(`File missing: ${filePath}`);
    console.log(`  ${colors.red}✗ File missing: ${filePath}${colors.reset}`);
  }
  
  // Check required variables
  for (const [category, config] of Object.entries(requiredEnvVars)) {
    for (const varName of config.vars) {
      if (!env[varName]) {
        if (config.defaults && config.defaults[varName]) {
          fixes[varName] = config.defaults[varName];
          warnings.push(`${varName} missing - will use default: ${config.defaults[varName]}`);
        } else if (config.canGenerate) {
          fixes[varName] = generateSecret();
          warnings.push(`${varName} missing - will generate secure value`);
        } else {
          issues.push(`Required variable missing: ${varName} (${config.description})`);
        }
      } else {
        console.log(`  ✓ ${varName} is set`);
      }
    }
  }
  
  // Check optional variables
  for (const [category, config] of Object.entries(optionalEnvVars)) {
    for (const varName of config.vars) {
      if (!env[varName]) {
        warnings.push(`Optional: ${varName} not set (${config.description})`);
      }
    }
  }
  
  // Security checks
  if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
    issues.push('JWT_SECRET is too short (minimum 32 characters)');
  }
  
  if (env.NODE_ENV && env.NODE_ENV !== 'test' && !isCI()) {
    warnings.push(`NODE_ENV is "${env.NODE_ENV}" - should be "test" for testing`);
  }
  
  return { issues, warnings, fixes, env };
}

// Check database connectivity
async function checkDatabase(databaseUrl) {
  console.log(`\n${colors.cyan}Checking database connectivity...${colors.reset}`);
  
  if (!databaseUrl) {
    console.log(`  ${colors.red}✗ No DATABASE_URL configured${colors.reset}`);
    return false;
  }
  
  if (databaseUrl.startsWith('file:')) {
    // SQLite database
    const dbPath = databaseUrl.replace('file:', '');
    const absolutePath = join(rootDir, 'packages', 'database', dbPath);
    console.log(`  Database type: SQLite`);
    console.log(`  Database path: ${absolutePath}`);
    
    if (!existsSync(dirname(absolutePath))) {
      console.log(`  ${colors.yellow}⚠ Database directory doesn't exist yet${colors.reset}`);
    } else {
      console.log(`  ✓ Database directory exists`);
    }
    return true;
  } else if (databaseUrl.startsWith('postgresql://')) {
    // PostgreSQL database
    console.log(`  Database type: PostgreSQL`);
    console.log(`  ${colors.yellow}⚠ PostgreSQL connectivity check not implemented${colors.reset}`);
    return true;
  } else {
    console.log(`  ${colors.red}✗ Unknown database type${colors.reset}`);
    return false;
  }
}

// Main validation function
async function validateEnvironment() {
  console.log(`${colors.blue}Teaching Engine 2.0 - Environment Validation${colors.reset}`);
  console.log('==========================================');
  
  const allIssues = [];
  const allWarnings = [];
  const allFixes = {};
  
  // Define environment files to check
  const envFiles = [
    {
      path: join(rootDir, '.env.test'),
      description: 'Root test environment',
      required: false
    },
    {
      path: join(rootDir, 'server', '.env.test'),
      description: 'Server test environment',
      required: true
    },
    {
      path: join(rootDir, 'packages', 'database', '.env.test'),
      description: 'Database test environment',
      required: true
    }
  ];
  
  // Validate each environment file
  for (const { path, description, required } of envFiles) {
    const result = validateEnvFile(path, description);
    
    if (required || existsSync(path)) {
      allIssues.push(...result.issues);
      allWarnings.push(...result.warnings);
      Object.assign(allFixes, result.fixes);
    }
    
    // Check database if this is the database env file
    if (path.includes('database') && result.env.DATABASE_URL) {
      await checkDatabase(result.env.DATABASE_URL);
    }
  }
  
  // Additional checks
  console.log(`\n${colors.cyan}Additional checks...${colors.reset}`);
  
  // Node version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  console.log(`  Node.js version: ${nodeVersion}`);
  if (majorVersion < 18) {
    allWarnings.push(`Node.js ${nodeVersion} detected - version 18+ recommended`);
  }
  
  // Package manager
  const packageManager = process.env.npm_config_user_agent || '';
  if (packageManager.includes('pnpm')) {
    console.log(`  ✓ Using pnpm package manager`);
  } else {
    allWarnings.push('Not using pnpm - run "pnpm install" for best results');
  }
  
  // CI environment
  if (isCI()) {
    console.log(`  ✓ Running in CI environment`);
  }
  
  // Summary
  console.log(`\n${colors.blue}Validation Summary${colors.reset}`);
  console.log('==================');
  
  if (allIssues.length === 0) {
    console.log(`${colors.green}✅ All required checks passed!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ Found ${allIssues.length} critical issues:${colors.reset}`);
    allIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }
  
  if (allWarnings.length > 0) {
    console.log(`\n${colors.yellow}⚠️  ${allWarnings.length} warnings:${colors.reset}`);
    allWarnings.forEach((warning, i) => {
      console.log(`  ${i + 1}. ${warning}`);
    });
  }
  
  if (Object.keys(allFixes).length > 0) {
    console.log(`\n${colors.cyan}Suggested fixes:${colors.reset}`);
    console.log('Add these to your .env.test files:');
    Object.entries(allFixes).forEach(([key, value]) => {
      console.log(`  ${key}=${value}`);
    });
  }
  
  // Provide helpful next steps
  if (allIssues.length > 0 || Object.keys(allFixes).length > 0) {
    console.log(`\n${colors.blue}Next steps:${colors.reset}`);
    console.log('1. Copy .env.test.example to .env.test in relevant directories');
    console.log('2. Update the values as needed');
    console.log('3. Run "pnpm test:setup" to initialize the test environment');
    console.log('4. Run this validation again to confirm');
  }
  
  return allIssues.length === 0;
}

// Auto-fix option
async function autoFix() {
  console.log(`\n${colors.yellow}Attempting auto-fix...${colors.reset}`);
  
  // Create .env.test files from examples if they don't exist
  const examples = [
    {
      example: join(rootDir, '.env.test.example'),
      target: join(rootDir, '.env.test')
    },
    {
      example: join(rootDir, 'server', '.env.test.example'),
      target: join(rootDir, 'server', '.env.test')
    }
  ];
  
  for (const { example, target } of examples) {
    if (existsSync(example) && !existsSync(target)) {
      console.log(`Creating ${target} from example...`);
      const content = readFileSync(example, 'utf8');
      writeFileSync(target, content);
    }
  }
  
  // Create database .env.test if missing
  const dbEnvPath = join(rootDir, 'packages', 'database', '.env.test');
  if (!existsSync(dbEnvPath)) {
    console.log(`Creating ${dbEnvPath}...`);
    writeFileSync(dbEnvPath, 'DATABASE_URL="file:./test.db"\n');
  }
  
  console.log(`${colors.green}✓ Auto-fix completed${colors.reset}`);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const shouldAutoFix = args.includes('--fix') || args.includes('--auto-fix');
  
  if (shouldAutoFix) {
    await autoFix();
  }
  
  const isValid = await validateEnvironment();
  
  if (!isValid && !shouldAutoFix) {
    console.log(`\n${colors.cyan}Tip: Run with --fix flag to attempt auto-fix${colors.reset}`);
    console.log('  pnpm test:validate --fix');
  }
  
  process.exit(isValid ? 0 : 1);
}

// Execute
main().catch(console.error);