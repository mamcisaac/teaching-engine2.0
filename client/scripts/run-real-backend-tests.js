#!/usr/bin/env node

/**
 * Script to run real backend integration tests
 * Handles server startup, test execution, and cleanup
 */

const { spawn } = require('child_process');
const { promises: fs } = require('fs');
const path = require('path');

const TEST_CONFIG = {
  serverPort: 3001,
  baseUrl: 'http://localhost:3001',
  maxRetries: 30,
  retryInterval: 1000,
  timeout: 30000,
};

let testServer = null;
let testsPassed = false;

async function checkServerHealth() {
  try {
    const response = await fetch(`${TEST_CONFIG.baseUrl}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer() {
  console.log('⏳ Waiting for test server to be ready...');
  
  for (let i = 0; i < TEST_CONFIG.maxRetries; i++) {
    if (await checkServerHealth()) {
      console.log('✅ Test server is ready!');
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.retryInterval));
  }
  
  throw new Error('❌ Test server failed to start within timeout');
}

async function startTestServer() {
  console.log('🚀 Starting test backend server...');
  
  const env = {
    ...process.env,
    NODE_ENV: 'test',
    PORT: TEST_CONFIG.serverPort.toString(),
    DATABASE_URL: 'file:./test-real-backend.db',
    JWT_SECRET: 'test-jwt-secret-for-testing-only',
    DISABLE_AUTH_RATE_LIMIT: 'true',
    LOG_LEVEL: 'error',
  };

  return new Promise((resolve, reject) => {
    testServer = spawn('pnpm', ['--filter', 'server', 'dev'], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: path.resolve(__dirname, '../..'),
    });

    let serverOutput = '';

    const timeout = setTimeout(() => {
      reject(new Error(`Server failed to start within ${TEST_CONFIG.timeout}ms`));
    }, TEST_CONFIG.timeout);

    testServer.stdout?.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      
      if (output.includes(`Server running on port ${TEST_CONFIG.serverPort}`) || 
          output.includes('Server started') ||
          output.includes('listening on')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    testServer.stderr?.on('data', (data) => {
      console.error('Server error:', data.toString());
    });

    testServer.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    testServer.on('exit', (code) => {
      if (code !== 0 && !testsPassed) {
        clearTimeout(timeout);
        reject(new Error(`Server exited with code ${code}. Output: ${serverOutput}`));
      }
    });
  });
}

async function runTests() {
  console.log('🧪 Running real backend integration tests...');
  
  return new Promise((resolve, reject) => {
    const testProcess = spawn('pnpm', ['test:real-backend'], {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '..'),
    });

    testProcess.on('exit', (code) => {
      if (code === 0) {
        testsPassed = true;
        console.log('✅ All tests passed!');
        resolve();
      } else {
        console.log('❌ Some tests failed');
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });

    testProcess.on('error', (error) => {
      reject(error);
    });
  });
}

async function stopTestServer() {
  if (!testServer) return;
  
  console.log('🛑 Stopping test server...');
  
  return new Promise((resolve) => {
    testServer.on('exit', () => {
      testServer = null;
      resolve();
    });

    testServer.kill('SIGTERM');

    // Force kill after 5 seconds
    setTimeout(() => {
      if (testServer) {
        testServer.kill('SIGKILL');
        testServer = null;
      }
      resolve();
    }, 5000);
  });
}

async function cleanup() {
  await stopTestServer();
  
  // Clean up test database
  try {
    const testDbPath = path.resolve(__dirname, '../../server/test-real-backend.db');
    await fs.unlink(testDbPath);
    console.log('🧹 Cleaned up test database');
  } catch (error) {
    // Database might not exist, that's okay
  }
}

async function main() {
  let exitCode = 0;
  
  try {
    // Start test server
    await startTestServer();
    await waitForServer();
    
    // Run tests
    await runTests();
    
    console.log('🎉 Real backend integration tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    exitCode = 1;
    
  } finally {
    await cleanup();
  }
  
  process.exit(exitCode);
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, cleaning up...');
  await cleanup();
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, cleaning up...');
  await cleanup();
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = {
  startTestServer,
  stopTestServer,
  runTests,
  cleanup,
};