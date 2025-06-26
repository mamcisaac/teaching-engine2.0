/**
 * Global database teardown for integration tests
 * Runs once after all integration tests
 */

import fs from 'fs';
import path from 'path';

export default async function globalTeardown() {
  const dbPath = path.join(process.cwd(), 'test-integration.db');
  
  try {
    // Clean up test database
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    if (fs.existsSync(`${dbPath}-journal`)) {
      fs.unlinkSync(`${dbPath}-journal`);
    }
    
    console.log('✅ Test database cleanup complete');
  } catch (error) {
    console.error('⚠️  Failed to cleanup test database:', error);
    // Don't throw - cleanup errors shouldn't fail the test run
  }
}