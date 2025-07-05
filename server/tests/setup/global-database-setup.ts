/**
 * Global Database Setup for Tests
 * 
 * This file is referenced in Jest's globalSetup and handles:
 * - Test database initialization
 * - Schema setup
 * - Environment preparation
 */

import { globalTestSetup } from '../database/test-database-setup';

export default async function globalSetup() {
  console.log('🗄️ Initializing test database infrastructure...');
  
  try {
    await globalTestSetup();
    console.log('✅ Test database infrastructure ready');
  } catch (error) {
    console.error('❌ Failed to initialize test database infrastructure:', error);
    process.exit(1);
  }
}