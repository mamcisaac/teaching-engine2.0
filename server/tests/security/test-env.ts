/**
 * Security Test Environment Configuration
 * Ensures security tests have proper environment setup
 */

// Save original environment
const originalEnv = { ...process.env };

export function setupSecurityTestEnv() {
  // Set security-specific test values
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.DATABASE_URL = 'file:../packages/database/prisma/test-security.db';

  // Security test flags
  process.env.ENABLE_SECURITY_CHECKS = 'true';
  process.env.VALIDATE_API_KEYS = 'true';
  process.env.ENFORCE_HTTPS = 'false'; // Allow HTTP in tests

  // Rate limiting test values
  process.env.RATE_LIMIT_WINDOW = '60000'; // 1 minute
  process.env.RATE_LIMIT_MAX_REQUESTS = '10';

  // CORS test values
  process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:5173';

  return originalEnv;
}

export function restoreOriginalEnv(savedEnv: NodeJS.ProcessEnv) {
  // Clear all env vars
  Object.keys(process.env).forEach((key) => {
    delete process.env[key];
  });

  // Restore original
  Object.assign(process.env, savedEnv);
}
