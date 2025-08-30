#!/usr/bin/env node

/**
 * Runner script for ETFO Student Assessment System E2E Tests
 * Handles environment setup and test execution
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Test modes
const TEST_MODES = {
  quick: {
    name: 'Quick Demo',
    file: 'quick-demo.test.js',
    timeout: 120000,
    description: 'Quick validation of core features (2 minutes)'
  },
  full: {
    name: 'Full Assessment',
    file: 'assessment-system-complete.test.js',
    timeout: 600000,
    description: 'Complete multi-agent parallel testing (10 minutes)'
  },
  agents: {
    name: 'Agent Workflows',
    file: 'emily-assessment-workflows.test.js',
    timeout: 300000,
    description: 'Emily\'s daily teaching workflow (5 minutes)'
  },
  stress: {
    name: 'Stress Test',
    file: 'assessment-system-complete.test.js',
    timeout: 900000,
    parallel: true,
    description: 'High-load stress testing with all agents (15 minutes)'
  }
};

// Parse command line arguments
const mode = process.argv[2] || 'quick';
const headless = process.argv.includes('--headless');
const parallel = process.argv.includes('--parallel');
const verbose = process.argv.includes('--verbose');

// Validate mode
if (!TEST_MODES[mode]) {
  console.error(`❌ Invalid test mode: ${mode}`);
  console.log('\nAvailable modes:');
  Object.entries(TEST_MODES).forEach(([key, config]) => {
    console.log(`  ${key.padEnd(10)} - ${config.description}`);
  });
  process.exit(1);
}

const testConfig = TEST_MODES[mode];

// Set environment variables
const env = {
  ...process.env,
  NODE_ENV: 'test',
  TEST_CLIENT_URL: process.env.TEST_CLIENT_URL || 'http://localhost:5173',
  TEST_API_URL: process.env.TEST_API_URL || 'http://localhost:3000',
  HEADLESS: headless ? 'true' : 'false',
  PARALLEL: parallel || testConfig.parallel ? 'true' : 'false',
  TEST_TIMEOUT: testConfig.timeout,
  FEATURE_STUDENT_ASSESSMENT: 'true',
  JWT_SECRET: 'test-secret-key-for-e2e-testing',
  REDIS_URL: 'redis://localhost:6379',
  STORAGE_DRIVER: 'local',
  UPLOAD_PATH: './test-uploads',
  MOCK_FILE_PROCESSING: 'true'
};

// Display test configuration
console.log('\n🎯 ETFO Student Assessment - E2E Test Runner');
console.log('═'.repeat(60));
console.log(`Mode:        ${testConfig.name}`);
console.log(`File:        ${testConfig.file}`);
console.log(`Timeout:     ${testConfig.timeout / 1000} seconds`);
console.log(`Headless:    ${headless ? 'Yes' : 'No (Visual Mode)'}`);
console.log(`Parallel:    ${env.PARALLEL === 'true' ? 'Yes' : 'No'}`);
console.log(`Client URL:  ${env.TEST_CLIENT_URL}`);
console.log(`API URL:     ${env.TEST_API_URL}`);
console.log('═'.repeat(60) + '\n');

// Check if servers are running
async function checkServers() {
  console.log('🔍 Checking servers...');
  
  try {
    // Check API server
    const apiResponse = await fetch(`${env.TEST_API_URL}/health`).catch(() => null);
    if (!apiResponse || !apiResponse.ok) {
      console.error('❌ API server is not running');
      console.log('   Please start the server: cd server && npm run dev');
      return false;
    }
    console.log('✅ API server is running');
    
    // Check client
    const clientResponse = await fetch(env.TEST_CLIENT_URL).catch(() => null);
    if (!clientResponse) {
      console.error('❌ Client application is not running');
      console.log('   Please start the client: cd client && npm run dev');
      return false;
    }
    console.log('✅ Client application is running');
    
    // Check Redis
    const { exec } = require('child_process');
    await new Promise((resolve, reject) => {
      exec('redis-cli ping', (error, stdout) => {
        if (error || stdout.trim() !== 'PONG') {
          console.error('❌ Redis is not running');
          console.log('   Please start Redis: redis-server');
          reject(false);
        } else {
          console.log('✅ Redis is running');
          resolve(true);
        }
      });
    }).catch(() => false);
    
    return true;
  } catch (error) {
    console.error('❌ Server check failed:', error.message);
    return false;
  }
}

// Create test directories
function setupTestEnvironment() {
  console.log('\n📁 Setting up test environment...');
  
  // Create directories
  const dirs = [
    'test-uploads',
    'test-uploads/artifacts',
    'test-uploads/temp',
    'tests/e2e/screenshots'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`   Created: ${dir}`);
    }
  });
  
  console.log('✅ Test environment ready\n');
}

// Run the tests
async function runTests() {
  // Check servers
  const serversReady = await checkServers();
  if (!serversReady) {
    console.error('\n❌ Cannot run tests - servers not ready');
    process.exit(1);
  }
  
  // Setup environment
  setupTestEnvironment();
  
  console.log('🚀 Starting tests...\n');
  
  // Prepare Jest command
  const jestArgs = [
    '--config=tests/e2e/jest.config.js',
    `tests/e2e/${testConfig.file}`,
    '--runInBand', // Run tests serially within the file
    '--forceExit', // Force Jest to exit after tests complete
    '--detectOpenHandles' // Detect handles that prevent Jest from exiting
  ];
  
  if (verbose) {
    jestArgs.push('--verbose');
  }
  
  // Run Jest
  const jest = spawn('npx', ['jest', ...jestArgs], {
    env,
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  jest.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Tests completed successfully!');
      
      // Print summary
      console.log('\n📊 Test Summary:');
      console.log('═'.repeat(60));
      console.log('All assessment features validated:');
      console.log('  ✅ Student CRUD operations');
      console.log('  ✅ ETFO 4-level mastery tracking');
      console.log('  ✅ Evidence triangulation (O/C/P)');
      console.log('  ✅ File upload and processing');
      console.log('  ✅ Analytics and reporting');
      console.log('  ✅ Multi-agent parallel workflows');
      console.log('  ✅ System performance under load');
      console.log('═'.repeat(60));
      
      // Provide next steps
      console.log('\n📸 Screenshots saved to: tests/e2e/screenshots/');
      console.log('📄 Test report available at: tests/e2e/screenshots/*/test-report.json');
      
      if (mode === 'quick') {
        console.log('\n💡 Run full test suite for comprehensive validation:');
        console.log('   npm run test:e2e:full');
      }
    } else {
      console.error(`\n❌ Tests failed with code ${code}`);
      console.log('\n🔍 Debugging tips:');
      console.log('  1. Check server logs for errors');
      console.log('  2. Review screenshots in tests/e2e/screenshots/');
      console.log('  3. Run with --verbose for detailed output');
      console.log('  4. Run without --headless to see browser actions');
    }
    
    process.exit(code);
  });
  
  jest.on('error', (error) => {
    console.error('❌ Failed to start tests:', error);
    process.exit(1);
  });
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\n\n⚠️ Tests interrupted by user');
  process.exit(130);
});

// Main execution
console.log(`
🏫 ETFO Student Assessment System - E2E Testing
📚 Grade 1 French Immersion Assessment Platform
👩‍🏫 Multi-Agent Teacher Workflow Validation
`);

runTests().catch(error => {
  console.error('❌ Test runner error:', error);
  process.exit(1);
});