import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Global setup that runs once before all test suites
 * This ensures the test environment is properly configured
 */
export default async function globalSetup() {
  console.log('🔧 Setting up test environment...');
  
  // Ensure test directory exists
  const testTempDir = path.join(process.cwd(), 'tests', 'temp');
  if (!fs.existsSync(testTempDir)) {
    fs.mkdirSync(testTempDir, { recursive: true });
  }
  
  // Clean up any leftover test databases from previous runs
  console.log('🧹 Cleaning up old test databases...');
  try {
    const files = fs.readdirSync(testTempDir);
    for (const file of files) {
      if (file.startsWith('test_') && file.endsWith('.db')) {
        const filePath = path.join(testTempDir, file);
        try {
          fs.unlinkSync(filePath);
          // Also remove WAL and SHM files
          const walPath = `${filePath}-wal`;
          const shmPath = `${filePath}-shm`;
          if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
          if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
        } catch (error) {
          console.warn(`Failed to delete old test database: ${file}`, error);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to clean up old test databases:', error);
  }
  
  // Ensure Prisma client is generated
  console.log('📦 Generating Prisma client...');
  try {
    execSync('cd .. && pnpm db:generate', {
      stdio: 'inherit',
      timeout: 60000, // 1 minute timeout
    });
  } catch (error) {
    console.error('Failed to generate Prisma client:', error);
    throw error;
  }
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test.db';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
  
  // Suppress console warnings in tests unless debugging
  if (!process.env.DEBUG_TESTS) {
    global.console.warn = () => {};
  }
  
  console.log('✅ Test environment setup complete');
  
  // Return a teardown function
  return async () => {
    // This runs after all tests are complete
    console.log('🔧 Tearing down test environment...');
  };
}