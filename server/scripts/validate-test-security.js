#!/usr/bin/env node

/**
 * Test Security Validation Script
 * Ensures no real API calls are possible in test environment
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔒 Validating Test Security Configuration...\n');

let hasIssues = false;

// 1. Check environment variables
console.log('1️⃣ Checking environment variables...');
const dangerousEnvVars = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'COHERE_API_KEY',
  'GOOGLE_API_KEY',
  'AZURE_OPENAI_API_KEY',
];

dangerousEnvVars.forEach((envVar) => {
  if (process.env[envVar] && !process.env[envVar].includes('test')) {
    console.error(`❌ ${envVar} is set with a real-looking value!`);
    hasIssues = true;
  }
});

if (!hasIssues) {
  console.log('✅ No dangerous API keys in environment\n');
}

// 2. Check for real API test files
console.log('2️⃣ Checking for real API test files...');
const testDir = path.join(__dirname, '../tests');
const realApiFiles = [];

function findRealApiTests(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      findRealApiTests(fullPath);
    } else if (file.endsWith('.test.ts')) {
      if (file.includes('realapi') || file.includes('production')) {
        realApiFiles.push(fullPath);
      }
    }
  });
}

findRealApiTests(testDir);

if (realApiFiles.length > 0) {
  console.log(`⚠️  Found ${realApiFiles.length} real API test files:`);
  realApiFiles.forEach((file) => {
    console.log(`   - ${path.relative(testDir, file)}`);
  });
  console.log('   These should be excluded from normal test runs\n');
} else {
  console.log('✅ No real API test files found\n');
}

// 3. Check mock configuration
console.log('3️⃣ Checking mock configuration...');
const mockFile = path.join(__dirname, '../tests/__mocks__/openai.ts');
if (fs.existsSync(mockFile)) {
  const mockContent = fs.readFileSync(mockFile, 'utf8');
  if (mockContent.includes('SECURITY') && mockContent.includes('throw')) {
    console.log('✅ OpenAI mock has security checks\n');
  } else {
    console.error('❌ OpenAI mock missing security checks!');
    hasIssues = true;
  }
} else {
  console.error('❌ OpenAI mock file not found!');
  hasIssues = true;
}

// 4. Check jest configuration
console.log('4️⃣ Checking Jest configuration...');
const jestConfig = path.join(__dirname, '../jest.config.js');
if (fs.existsSync(jestConfig)) {
  const jestContent = fs.readFileSync(jestConfig, 'utf8');
  if (jestContent.includes('00-security-mocks.ts')) {
    console.log('✅ Security mocks are loaded first in Jest config\n');
  } else {
    console.error('❌ Security mocks not properly configured in Jest!');
    hasIssues = true;
  }
}

// 5. Run security validation test
console.log('5️⃣ Running security validation test...');
try {
  execSync('npm test -- tests/unit/openai-security-check.test.ts --silent', {
    stdio: 'pipe',
    env: { ...process.env, TEST_OPENAI_API_KEY: 'test-key' },
  });
  console.log('✅ Security tests passed\n');
} catch (error) {
  console.error('❌ Security tests failed!');
  console.error(error.toString());
  hasIssues = true;
}

// Summary
console.log('='.repeat(50));
if (hasIssues) {
  console.error('\n❌ SECURITY ISSUES FOUND! Fix these before running tests.\n');
  process.exit(1);
} else {
  console.log('\n✅ All security checks passed! Test environment is secure.\n');
  console.log('To run tests safely: npm test');
  console.log('To run real API tests: REAL_API_TESTS=true npm test\n');
}
