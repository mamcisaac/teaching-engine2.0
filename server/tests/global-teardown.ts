/**
 * Global teardown for all tests
 * Runs once after all test suites complete
 */

import { existsSync, rmSync } from 'fs';

export default async function globalTeardown() {
  // Clean up test database if using SQLite
  const dbUrl = process.env.DATABASE_URL ?? 'file:../packages/database/prisma/test.db';
  if (dbUrl.startsWith('file:') && process.env.KEEP_TEST_DB !== 'true') {
    const dbPath = dbUrl.replace('file:', '');
    
    // Remove test database files
    if (existsSync(dbPath)) {
      rmSync(dbPath, { force: true });
    }
    if (existsSync(dbPath + '-journal')) {
      rmSync(dbPath + '-journal', { force: true });
    }
    if (existsSync(dbPath + '-wal')) {
      rmSync(dbPath + '-wal', { force: true });
    }
  }
  
  // Clear any temporary test files
  if (existsSync('./.test-tmp')) {
    rmSync('./.test-tmp', { recursive: true, force: true });
  }
  
  console.log('🧹 Global test teardown completed');
}