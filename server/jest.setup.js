/* eslint-env node */

import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.test file if it exists
const envPath = path.resolve(__dirname, '../.env.test');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Jest setup file for server tests
// This ensures consistent test environment between local and CI

// Set test environment variables
process.env.NODE_ENV = 'test';

// Set DATABASE_URL with a consistent default for both local and CI
// In CI, this can be overridden by the workflow file if needed
// Use a relative path that works from the server directory
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:../packages/database/prisma/test.db';

// Set other required environment variables for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Optional: Set a flag to detect CI environment
process.env.IS_CI = process.env.CI || 'false';

// Suppress console warnings in tests unless explicitly debugging
if (!process.env.DEBUG_TESTS) {
  // Create a no-op function to suppress warnings
  global.console.warn = () => {};
}
