import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Set a dedicated test database file
process.env.DATABASE_URL = 'file:../packages/database/prisma/test-db.sqlite';

// Load .env file if it exists
const envPath = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envPath)) {
  console.log(`Loading environment from .env.test`);
  config({ path: envPath });
} else {
  console.warn('No .env.test file found. Using default test configuration.');
}

// Log the database configuration for debugging
console.log('Test database configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: 'file:../packages/database/prisma/test-db.sqlite',
  JWT_SECRET: '***',
});

// Ensure the test database is clean before running tests
export async function cleanTestDatabase() {
  try {
    // Delete the test database file if it exists
    const testDbPath = path.resolve(__dirname, '../../packages/database/prisma/test-db.sqlite');
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
      console.log('Cleaned up test database file');
    }
  } catch (error) {
    console.error('Error cleaning test database:', error);
  }
}

// Run cleanup before tests
cleanTestDatabase().catch(console.error);
