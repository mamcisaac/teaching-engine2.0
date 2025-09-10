#!/usr/bin/env node

/**
 * Test Runner for Hierarchical Planning Display E2E Tests
 * Tests the LRP → Units → Lessons hierarchy with coverage tracking
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🎯 Running Hierarchical Planning Display Tests');
console.log('════════════════════════════════════════════════════════════');
console.log('Testing: LRP → Units → Lessons hierarchy');
console.log('Features: Color coding, unit titles, coverage tracking');
console.log('════════════════════════════════════════════════════════════');

// Check if servers are running
try {
  console.log('\n🔍 Checking servers...');
  
  // Check API server
  execSync('curl -s http://localhost:3000/health', { stdio: 'ignore' });
  console.log('✅ API server is running');
  
  // Check client
  execSync('curl -s http://localhost:5173', { stdio: 'ignore' });
  console.log('✅ Client application is running');
} catch (error) {
  console.error('❌ Servers are not running. Please start them first:');
  console.error('   cd server && npm run dev');
  console.error('   cd client && npm run dev');
  process.exit(1);
}

// Run the test using Jest (which is already configured)
console.log('\n🚀 Starting hierarchical planning tests...\n');

try {
  // Convert TypeScript test to JavaScript for Jest
  const testPath = path.join(__dirname, 'hierarchical-planning-display.spec.ts');
  
  // Run with Jest
  execSync(`HEADLESS=false jest --config=${__dirname}/jest.config.js ${testPath}`, {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      TEST_BASE_URL: 'http://localhost:5173',
      API_BASE_URL: 'http://localhost:3000'
    }
  });
  
  console.log('\n✅ Tests completed successfully!');
} catch (error) {
  console.error('\n❌ Tests failed');
  process.exit(1);
}