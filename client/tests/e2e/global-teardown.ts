/**
 * Global teardown for Playwright tests
 * Cleans up test data and artifacts after all tests
 */

import { unlink } from 'fs/promises';
import { existsSync } from 'fs';

const TEST_SECRET = process.env.TEST_SECRET || 'test-secret-token';

async function cleanupTestData(): Promise<void> {
  console.log('🧹 Cleaning up test data...');
  
  try {
    // Reset test data via API
    const response = await fetch('http://localhost:3000/__test__/reset', {
      method: 'POST',
      headers: { 
        'X-Test-Token': TEST_SECRET 
      }
    });
    
    if (response.ok) {
      console.log('✅ Test data cleaned up');
    } else {
      console.warn(`⚠️  Test data cleanup failed: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('⚠️  Test data cleanup failed:', (error as Error).message);
  }
}

async function cleanupAuthState(): Promise<void> {
  console.log('🔐 Cleaning up auth state...');
  
  const authFile = 'tests/e2e/auth.json';
  
  try {
    if (existsSync(authFile)) {
      await unlink(authFile);
      console.log('✅ Auth state file removed');
    }
  } catch (error) {
    console.warn('⚠️  Auth state cleanup failed:', (error as Error).message);
  }
}

async function globalTeardown() {
  console.log('🏁 Starting Playwright global teardown...');
  
  // Clean up test data
  await cleanupTestData();
  
  // Clean up auth state file  
  await cleanupAuthState();
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;