/**
 * Global Setup for Real Backend Tests
 * Manages test server lifecycle for the entire test suite
 */

import { 
  globalRealBackendSetup, 
  globalRealBackendTeardown,
  isTestServerRunning,
  startTestServer,
  waitForTestServer,
} from './real-backend-setup';

let setupCompleted = false;

export async function setup() {
  if (setupCompleted) {
    console.log('Real backend setup already completed');
    return;
  }

  console.log('🚀 Starting global real backend test setup...');

  try {
    // Check if server is already running
    const isRunning = await isTestServerRunning();
    
    if (!isRunning) {
      console.log('📡 Starting test backend server...');
      await startTestServer();
      await waitForTestServer();
    } else {
      console.log('✅ Test backend server already running');
    }

    // Configure global test environment
    await globalRealBackendSetup();
    
    setupCompleted = true;
    console.log('✅ Global real backend test setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Global real backend test setup failed:', error);
    throw error;
  }
}

export async function teardown() {
  if (!setupCompleted) {
    console.log('No real backend setup to teardown');
    return;
  }

  console.log('🧹 Starting global real backend test teardown...');

  try {
    await globalRealBackendTeardown();
    setupCompleted = false;
    console.log('✅ Global real backend test teardown completed successfully!');
    
  } catch (error) {
    console.error('❌ Global real backend test teardown failed:', error);
    // Don't throw during teardown to avoid masking test failures
  }
}