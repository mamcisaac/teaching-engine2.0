/**
 * Global teardown for Playwright tests
 * Cleans up after all tests have run
 */

async function globalTeardown() {
  console.log('🧹 Running global teardown...');
  
  // Could add cleanup here if needed
  // For example, clearing test data, stopping services, etc.
  
  console.log('✅ Global teardown complete');
}

export default globalTeardown;