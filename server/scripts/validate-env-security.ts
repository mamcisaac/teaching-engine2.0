#!/usr/bin/env node
/**
 * Environment Variable Security Validation Script
 * 
 * Validates that all required environment variables are properly configured
 * and no sensitive data is leaked in configuration files
 */

import { readFileSync, existsSync } from 'fs';
import path from 'path';

interface EnvIssue {
  type: 'missing' | 'weak' | 'exposed' | 'format';
  variable: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
}

const envIssues: EnvIssue[] = [];

/**
 * Required environment variables for different environments
 */
const requiredVars = {
  production: [
    'JWT_SECRET',
    'DATABASE_URL',
    'NODE_ENV'
  ],
  development: [
    'JWT_SECRET',
    'DATABASE_URL'
  ],
  test: [
    'JWT_SECRET',
    'DATABASE_URL'
  ]
};

/**
 * Sensitive variables that should never be committed
 */
const sensitiveVars = [
  'JWT_SECRET',
  'DATABASE_URL',
  'OPENAI_API_KEY',
  'WIZARD_TOKEN',
  'PASSWORD',
  'SECRET',
  'KEY',
  'TOKEN'
];

/**
 * Validate JWT secret strength
 */
function validateJwtSecret(secret: string | undefined): void {
  if (!secret) {
    envIssues.push({
      type: 'missing',
      variable: 'JWT_SECRET',
      severity: 'critical',
      description: 'JWT_SECRET environment variable is not set',
      recommendation: 'Generate a strong random secret: openssl rand -hex 32'
    });
    return;
  }

  if (secret.length < 32) {
    envIssues.push({
      type: 'weak',
      variable: 'JWT_SECRET',
      severity: 'high',
      description: 'JWT_SECRET is too short (less than 32 characters)',
      recommendation: 'Use a secret with at least 32 characters for security'
    });
  }

  if (secret === 'secret' || secret === 'test-secret' || secret.includes('changeme')) {
    envIssues.push({
      type: 'weak',
      variable: 'JWT_SECRET',
      severity: 'critical',
      description: 'JWT_SECRET uses a default or weak value',
      recommendation: 'Generate a strong random secret: openssl rand -hex 32'
    });
  }

  // Check for common weak patterns
  if (/^(123|abc|password|secret|key)/i.test(secret)) {
    envIssues.push({
      type: 'weak',
      variable: 'JWT_SECRET',
      severity: 'high',
      description: 'JWT_SECRET uses a predictable pattern',
      recommendation: 'Generate a strong random secret: openssl rand -hex 32'
    });
  }
}

/**
 * Validate database URL security
 */
function validateDatabaseUrl(dbUrl: string | undefined): void {
  if (!dbUrl) {
    envIssues.push({
      type: 'missing',
      variable: 'DATABASE_URL',
      severity: 'critical',
      description: 'DATABASE_URL environment variable is not set',
      recommendation: 'Configure a proper database connection string'
    });
    return;
  }

  // Check for default passwords
  if (dbUrl.includes('password') || dbUrl.includes('123456') || dbUrl.includes('admin')) {
    envIssues.push({
      type: 'weak',
      variable: 'DATABASE_URL',
      severity: 'high',
      description: 'DATABASE_URL contains weak or default credentials',
      recommendation: 'Use strong, unique database credentials'
    });
  }

  // Check for unencrypted connections in production
  if (process.env.NODE_ENV === 'production' && dbUrl.startsWith('postgres://')) {
    if (!dbUrl.includes('sslmode=require') && !dbUrl.includes('ssl=true')) {
      envIssues.push({
        type: 'weak',
        variable: 'DATABASE_URL',
        severity: 'medium',
        description: 'Database connection may not use SSL in production',
        recommendation: 'Ensure SSL is enabled for production database connections'
      });
    }
  }
}

/**
 * Check for environment variables exposed in committed files
 */
function checkForExposedSecrets(): void {
  const filesToCheck = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.production',
    'docker-compose.yml',
    'package.json',
    'README.md'
  ];

  for (const filename of filesToCheck) {
    const filePath = path.join(process.cwd(), filename);
    
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for exposed secrets
        for (const sensitiveVar of sensitiveVars) {
          // Look for actual secret values, not just variable names
          const secretPattern = new RegExp(`${sensitiveVar}\\s*=\\s*[^\\s#][^\\n\\r]{8,}`, 'i');
          if (secretPattern.test(content)) {
            envIssues.push({
              type: 'exposed',
              variable: sensitiveVar,
              severity: 'critical',
              description: `Potential secret exposed in ${filename}`,
              recommendation: `Remove sensitive values from ${filename} and use environment variables`
            });
          }
        }

        // Check for common leaked patterns
        const dangerousPatterns = [
          /jwt_secret\s*=\s*["'][^"']{10,}["']/i,
          /database_url\s*=\s*["'][^"']{10,}["']/i,
          /api_key\s*=\s*["'][^"']{10,}["']/i,
          /password\s*=\s*["'][^"']{3,}["']/i
        ];

        for (const pattern of dangerousPatterns) {
          if (pattern.test(content)) {
            envIssues.push({
              type: 'exposed',
              variable: 'UNKNOWN',
              severity: 'high',
              description: `Potential secret pattern found in ${filename}`,
              recommendation: `Review ${filename} for exposed credentials`
            });
          }
        }
      } catch (error) {
        console.warn(`Could not read ${filename}: ${error}`);
      }
    }
  }
}

/**
 * Validate required variables for current environment
 */
function validateRequiredVars(): void {
  const currentEnv = (process.env.NODE_ENV || 'development') as keyof typeof requiredVars;
  const required = requiredVars[currentEnv] || requiredVars.development;

  for (const varName of required) {
    if (!process.env[varName]) {
      envIssues.push({
        type: 'missing',
        variable: varName,
        severity: 'critical',
        description: `Required environment variable ${varName} is not set for ${currentEnv} environment`,
        recommendation: `Set ${varName} in your environment or .env file`
      });
    }
  }
}

/**
 * Check for test/development leaks in production
 */
function validateProductionSecurity(): void {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // Check for development/test values in production
  const dangerousValues = [
    'localhost',
    'test-',
    'dev-',
    'development',
    'changeme',
    '123456',
    'password'
  ];

  for (const [key, value] of Object.entries(process.env)) {
    if (typeof value === 'string' && sensitiveVars.some(s => key.includes(s.toUpperCase()))) {
      for (const dangerous of dangerousValues) {
        if (value.toLowerCase().includes(dangerous)) {
          envIssues.push({
            type: 'weak',
            variable: key,
            severity: 'critical',
            description: `Production environment variable ${key} contains development/test value`,
            recommendation: `Update ${key} with production-appropriate value`
          });
        }
      }
    }
  }
}

/**
 * Main validation function
 */
async function validateEnvironmentSecurity(): Promise<void> {
  console.log('🔐 Validating environment variable security...\n');

  // Load .env file if it exists
  const envPath = path.join(process.cwd(), '.env');
  if (existsSync(envPath)) {
    const { config } = await import('dotenv');
    config({ path: envPath });
  }

  // Run all validations
  validateRequiredVars();
  validateJwtSecret(process.env.JWT_SECRET);
  validateDatabaseUrl(process.env.DATABASE_URL);
  checkForExposedSecrets();
  validateProductionSecurity();

  // Report results
  if (envIssues.length === 0) {
    console.log('✅ No environment security issues found!');
    process.exit(0);
  }

  console.log(`❌ Found ${envIssues.length} environment security issues:\n`);

  const criticalIssues = envIssues.filter(issue => issue.severity === 'critical');
  const highIssues = envIssues.filter(issue => issue.severity === 'high');
  const mediumIssues = envIssues.filter(issue => issue.severity === 'medium');
  const lowIssues = envIssues.filter(issue => issue.severity === 'low');

  const printIssues = (issues: EnvIssue[], emoji: string, title: string) => {
    if (issues.length > 0) {
      console.log(`${emoji} ${title} (${issues.length}):`);
      issues.forEach(issue => {
        console.log(`  ${issue.variable} - ${issue.type.toUpperCase()}`);
        console.log(`    ${issue.description}`);
        console.log(`    💡 ${issue.recommendation}\n`);
      });
    }
  };

  printIssues(criticalIssues, '🚨', 'CRITICAL ISSUES');
  printIssues(highIssues, '⚠️', 'HIGH PRIORITY ISSUES');
  printIssues(mediumIssues, '⚡', 'MEDIUM PRIORITY ISSUES');
  printIssues(lowIssues, 'ℹ️', 'LOW PRIORITY ISSUES');

  console.log('📋 Environment Security Checklist:');
  console.log('  □ JWT_SECRET is cryptographically strong (32+ chars)');
  console.log('  □ DATABASE_URL uses strong credentials');
  console.log('  □ No secrets committed to version control');
  console.log('  □ Production variables differ from development');
  console.log('  □ SSL/TLS enabled for production connections');
  console.log('  □ Environment files (.env) in .gitignore\n');

  // Exit with error if critical or high issues found
  if (criticalIssues.length > 0 || highIssues.length > 0) {
    console.log('🛑 Critical or high priority issues found. Fix before deploying to production.');
    process.exit(1);
  } else {
    console.log('✅ No critical issues found, but consider addressing medium/low priority items.');
    process.exit(0);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateEnvironmentSecurity().catch(error => {
    console.error('Environment validation failed:', error);
    process.exit(1);
  });
}

export { validateEnvironmentSecurity };