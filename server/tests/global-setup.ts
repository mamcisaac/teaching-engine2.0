/**
 * Global setup for all tests
 * Runs once before all test suites
 */

import { config } from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

export default async function globalSetup() {
  // Load environment variables
  config({ path: '.env.test' });
  config({ path: '.env' }); // Fallback to main env file
  
  // Ensure test database directory exists
  const dbUrl = process.env.DATABASE_URL || 'file:../packages/database/prisma/test.db';
  if (dbUrl.startsWith('file:')) {
    const dbPath = dbUrl.replace('file:', '');
    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
  }
  
  // Set global test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key';
  
  // Disable external service calls in tests
  process.env.DISABLE_EXTERNAL_CALLS = 'true';
  
  // Performance optimization flags
  process.env.SKIP_DB_SEED = 'true'; // Skip seeding in unit tests
  process.env.USE_MOCK_SERVICES = 'true'; // Use mocked services
  
  console.log('🚀 Global test setup completed');
}