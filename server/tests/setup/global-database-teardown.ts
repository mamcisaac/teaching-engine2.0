/**
 * Global Database Teardown for Tests
 * 
 * This file is referenced in Jest's globalTeardown and handles:
 * - Connection cleanup
 * - Database cleanup
 * - Resource disposal
 */

import { globalTestTeardown } from '../database/test-database-setup';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test database infrastructure...');
  
  try {
    await globalTestTeardown();
    console.log('✅ Test database infrastructure cleaned up');
  } catch (error) {
    console.error('❌ Failed to cleanup test database infrastructure:', error);
    // Don't exit with error on cleanup failure - just warn
  }
}