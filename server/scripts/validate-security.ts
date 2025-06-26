#!/usr/bin/env node
/**
 * Security validation script to check for common security vulnerabilities
 * This script should be run as part of CI/CD to catch security issues early
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

interface SecurityIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

const securityIssues: SecurityIssue[] = [];

/**
 * Check for hardcoded secrets in code
 */
function checkHardcodedSecrets(file: string, content: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for hardcoded JWT secrets
    if (line.includes("'secret'") || line.includes('"secret"')) {
      if (line.includes('JWT_SECRET') && line.includes('||')) {
        securityIssues.push({
          file,
          line: index + 1,
          issue: 'HARDCODED_JWT_SECRET',
          severity: 'critical',
          description: 'Hardcoded JWT secret fallback found. Use environment variables only.'
        });
      }
    }
    
    // Check for test secrets in production code (excluding test files)
    if (!file.includes('/test') && !file.includes('.test.') && !file.includes('.spec.')) {
      if (line.includes('test-secret') || line.includes('fake-secret')) {
        securityIssues.push({
          file,
          line: index + 1,
          issue: 'TEST_SECRET_IN_PRODUCTION',
          severity: 'critical',
          description: 'Test secret found in production code.'
        });
      }
    }
    
    // Check for hardcoded API keys
    const apiKeyPattern = /(api[_-]?key|secret[_-]?key)["\s]*[:=]["\s]*[a-zA-Z0-9]{10,}/i;
    if (apiKeyPattern.test(line) && !line.includes('process.env')) {
      securityIssues.push({
        file,
        line: index + 1,
        issue: 'HARDCODED_API_KEY',
        severity: 'critical',
        description: 'Hardcoded API key found. Use environment variables.'
      });
    }
  });
}

/**
 * Check for SQL injection vulnerabilities
 */
function checkSQLInjection(file: string, content: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for string concatenation in SQL queries
    if (line.includes('$queryRaw') || line.includes('$executeRaw')) {
      if (line.includes('+') || line.includes('${')) {
        securityIssues.push({
          file,
          line: index + 1,
          issue: 'POTENTIAL_SQL_INJECTION',
          severity: 'high',
          description: 'Potential SQL injection via string concatenation. Use parameterized queries.'
        });
      }
    }
  });
}

/**
 * Check for weak password handling
 */
function checkPasswordSecurity(file: string, content: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for plaintext password storage
    if (line.includes('password') && line.includes('=') && !line.includes('bcrypt') && !line.includes('hash')) {
      if (line.includes('create') || line.includes('update')) {
        securityIssues.push({
          file,
          line: index + 1,
          issue: 'POTENTIAL_PLAINTEXT_PASSWORD',
          severity: 'high',
          description: 'Potential plaintext password storage. Ensure passwords are hashed.'
        });
      }
    }
    
    // Check for weak bcrypt rounds
    if (line.includes('bcrypt.hash') && line.includes(',')) {
      const roundsMatch = line.match(/bcrypt\.hash\([^,]+,\s*(\d+)\)/);
      if (roundsMatch && parseInt(roundsMatch[1]) < 10) {
        securityIssues.push({
          file,
          line: index + 1,
          issue: 'WEAK_BCRYPT_ROUNDS',
          severity: 'medium',
          description: 'Bcrypt rounds too low. Use at least 10 rounds for security.'
        });
      }
    }
  });
}

/**
 * Check for missing security headers
 */
function checkSecurityHeaders(file: string, content: string) {
  if (file.includes('index.ts') || file.includes('app.ts')) {
    const hasHelmet = content.includes('helmet');
    const hasCORS = content.includes('cors');
    
    if (!hasHelmet) {
      securityIssues.push({
        file,
        line: 1,
        issue: 'MISSING_HELMET',
        severity: 'medium',
        description: 'Consider using helmet middleware for security headers.'
      });
    }
    
    if (!hasCORS) {
      securityIssues.push({
        file,
        line: 1,
        issue: 'MISSING_CORS',
        severity: 'low',
        description: 'Consider configuring CORS properly.'
      });
    }
  }
}

/**
 * Check for XSS vulnerabilities
 */
function checkXSSVulnerabilities(file: string, content: string) {
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    // Check for innerHTML usage without sanitization
    if (line.includes('innerHTML') && !line.includes('sanitize')) {
      securityIssues.push({
        file,
        line: index + 1,
        issue: 'POTENTIAL_XSS',
        severity: 'high',
        description: 'Potential XSS vulnerability. Sanitize HTML content before using innerHTML.'
      });
    }
    
    // Check for direct HTML rendering without sanitization
    if (line.includes('dangerouslySetInnerHTML') && !line.includes('sanitize')) {
      securityIssues.push({
        file,
        line: index + 1,
        issue: 'DANGEROUS_HTML_RENDERING',
        severity: 'high',
        description: 'Dangerous HTML rendering without sanitization.'
      });
    }
  });
}

/**
 * Recursively find TypeScript and JavaScript files
 */
function findFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build directories
      if (!['node_modules', 'dist', 'build', '.git'].includes(entry)) {
        findFiles(fullPath, files);
      }
    } else if (stat.isFile() && (entry.endsWith('.ts') || entry.endsWith('.js'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Main security validation function
 */
async function validateSecurity() {
  console.log('🔍 Running security validation...\n');
  
  // Get all TypeScript and JavaScript files
  const files = findFiles(process.cwd());
  
  for (const fullPath of files) {
    const file = path.relative(process.cwd(), fullPath);
    
    try {
      const content = readFileSync(fullPath, 'utf-8');
      
      checkHardcodedSecrets(file, content);
      checkSQLInjection(file, content);
      checkPasswordSecurity(file, content);
      checkSecurityHeaders(file, content);
      checkXSSVulnerabilities(file, content);
    } catch (error) {
      console.warn(`⚠️  Could not read file ${file}: ${error}`);
    }
  }
  
  // Report results
  if (securityIssues.length === 0) {
    console.log('✅ No security issues found!');
    process.exit(0);
  }
  
  console.log(`❌ Found ${securityIssues.length} security issues:\n`);
  
  const criticalIssues = securityIssues.filter(issue => issue.severity === 'critical');
  const highIssues = securityIssues.filter(issue => issue.severity === 'high');
  const mediumIssues = securityIssues.filter(issue => issue.severity === 'medium');
  const lowIssues = securityIssues.filter(issue => issue.severity === 'low');
  
  const printIssues = (issues: SecurityIssue[], emoji: string, title: string) => {
    if (issues.length > 0) {
      console.log(`${emoji} ${title} (${issues.length}):`);
      issues.forEach(issue => {
        console.log(`  ${issue.file}:${issue.line} - ${issue.issue}`);
        console.log(`    ${issue.description}\n`);
      });
    }
  };
  
  printIssues(criticalIssues, '🚨', 'CRITICAL ISSUES');
  printIssues(highIssues, '⚠️', 'HIGH PRIORITY ISSUES');
  printIssues(mediumIssues, '⚡', 'MEDIUM PRIORITY ISSUES');
  printIssues(lowIssues, 'ℹ️', 'LOW PRIORITY ISSUES');
  
  // Exit with error code if critical or high issues found
  if (criticalIssues.length > 0 || highIssues.length > 0) {
    console.log('🛑 Critical or high priority security issues found. Please fix before deploying.');
    process.exit(1);
  } else {
    console.log('✅ No critical security issues found, but consider addressing medium/low priority items.');
    process.exit(0);
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSecurity().catch(error => {
    console.error('Security validation failed:', error);
    process.exit(1);
  });
}

export { validateSecurity };