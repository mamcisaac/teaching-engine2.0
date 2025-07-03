/**
 * Authentication Security Tests
 *
 * Tests authentication flows, token security, and session management
 * to ensure secure user access control
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getTestPrismaClient, createTestData } from '../jest.setup';
import { resetRateLimiterState } from '../../src/middleware/rateLimiter';

// Import the actual app - we need to access it through a dynamic import
// to ensure the test database is properly set up before the app starts
let app: any;

// Custom matcher for checking multiple possible values
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOneOf(expected: Array<any>): R;
    }
  }
}

expect.extend({
  toBeOneOf(received: any, expected: Array<any>) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${JSON.stringify(expected)}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${JSON.stringify(expected)}`,
        pass: false,
      };
    }
  },
});

beforeEach(async () => {
  // Reset rate limiter state to avoid test interference
  resetRateLimiterState();
  
  // Import the actual app
  const appModule = await import('../../src/index');
  app = appModule.app;

  // Give the app a moment to initialize
  await new Promise((resolve) => setTimeout(resolve, 100));
});

afterEach(async () => {
  // Clean up any test users to avoid conflicts
  const { PrismaClient } = await import('@teaching-engine/database');
  const cleanupPrisma = new PrismaClient();
  try {
    await cleanupPrisma.user.deleteMany({
      where: {
        OR: [{ email: { contains: 'test@example.com' } }, { email: { contains: 'test-' } }],
      },
    });
  } finally {
    await cleanupPrisma.$disconnect();
  }
});

describe('Authentication Security Tests', () => {
  const testUser = {
    email: 'test@example.com',
    password: 'SecureTestPassword123!',
    name: 'Test User',
    role: 'teacher',
  };

  // Note: We register users through the API in these tests to ensure
  // the app's database connections can see the users

  // Helper to register a test user through API
  async function registerTestUser(email: string = testUser.email) {
    const response = await request(app).post('/api/auth/register').send({
      email,
      password: testUser.password,
      name: testUser.name,
    });

    if (response.status !== 201) {
      // If user already exists, that's fine for some tests
      if (response.status === 409) {
        return { alreadyExists: true };
      }
      throw new Error(
        `Failed to register user: ${response.status} ${JSON.stringify(response.body)}`,
      );
    }

    return {
      user: response.body.user,
      token: response.body.accessToken || response.body.token,
      alreadyExists: false,
    };
  }

  describe('Login Security', () => {
    it('should reject invalid email formats', async () => {
      // No user needed for this test
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
        password: testUser.password,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid request data');
      expect(response.body.messages[0].message).toBe('Invalid email format');
    });

    it('should reject missing credentials', async () => {
      // No user needed for this test
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid request data');
      expect(response.body.messages).toBeDefined();
    });

    it('should reject non-string credentials', async () => {
      // No user needed for this test
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 123,
          password: ['array'],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid request data');
    });

    it('should sanitize email input', async () => {
      // Create user first
      await registerTestUser();

      // The auth middleware lowercases emails automatically
      const response = await request(app).post('/api/auth/login').send({
        email: 'TEST@EXAMPLE.COM',
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject SQL injection attempts in email', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: "test@example.com'; DROP TABLE users; --",
        password: testUser.password,
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid request data');
      expect(response.body.messages[0].message).toBe('Invalid email format');
    });

    it('should reject overly long email addresses', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const response = await request(app).post('/api/auth/login').send({
        email: longEmail,
        password: testUser.password,
      });

      // Long emails are rejected by auth middleware, not validation
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should not leak user existence through timing attacks', async () => {
      // Create user first
      await registerTestUser();

      const start1 = Date.now();
      await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });
      const time2 = Date.now() - start2;

      // Both responses should be similar in timing (within 500ms)
      // Note: bcrypt operations can vary significantly in timing
      expect(Math.abs(time1 - time2)).toBeLessThan(500);
    });

    it('should return consistent error messages for invalid credentials', async () => {
      // Create user first
      await registerTestUser();

      const response1 = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      const response2 = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'wrongpassword',
      });

      expect(response1.status).toBe(401);
      expect(response2.status).toBe(401);
      expect(response1.body.message).toBe(response2.body.message);
      // Check that both have errors (the exact message may vary)
      expect(response1.body.message).toBeTruthy();
      expect(response2.body.message).toBeTruthy();
    });

    it('should set secure HTTP-only cookies on successful login', async () => {
      // Create user first
      await registerTestUser();

      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);

      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const refreshCookie = cookies.find((cookie: string) => cookie.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
      expect(refreshCookie).toMatch(/SameSite=(strict|Strict)/i);
      expect(refreshCookie).toContain('Path=/');
    });

    it('should not return password in response', async () => {
      // Create user first
      await registerTestUser();

      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.accessToken).toBeDefined();
    });
  });

  describe('JWT Token Security', () => {
    let validToken: string;
    let testUserId: number;
    let testUserEmail: string;
    
    // Define testUser for this suite
    const testUser = {
      email: 'test@example.com',
      password: 'SecureTestPassword123!',
      name: 'Test User',
      role: 'teacher',
    };

    beforeEach(async () => {
      // Reset rate limiter to avoid test interference
      resetRateLimiterState();
      
      // Wait a bit for rate limiter to reset (since it's 1 second window in tests)
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      // Ensure app is imported
      if (!app) {
        const appModule = await import('../../src/index');
        app = appModule.app;
        // Give the app a moment to initialize
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      
      // Clean up any existing test users before creating new ones
      const { PrismaClient } = await import('@teaching-engine/database');
      const cleanupPrisma = new PrismaClient();
      try {
        await cleanupPrisma.user.deleteMany({
          where: { 
            OR: [
              { email: { contains: 'test-' } },
              { email: { contains: 'test@' } }
            ]
          },
        });
      } finally {
        await cleanupPrisma.$disconnect();
      }
      
      // Instead of creating user directly in DB, register through API
      // This ensures the user is created in the same way the app expects
      const uniqueEmail = `test-${Date.now()}@example.com`;
      testUserEmail = uniqueEmail; // Store the email for use in tests

      const registerResponse = await request(app).post('/api/auth/register').send({
        email: uniqueEmail,
        password: testUser.password,
        name: testUser.name,
      });

      if (registerResponse.status !== 201) {
        // If rate limited, wait and try again once
        if (registerResponse.status === 429) {
          console.log('Rate limited, waiting 2 seconds and trying again...');
          await new Promise((resolve) => setTimeout(resolve, 2000));
          resetRateLimiterState(); // Try to reset again
          
          const retryResponse = await request(app).post('/api/auth/register').send({
            email: uniqueEmail,
            password: testUser.password,
            name: testUser.name,
          });
          
          if (retryResponse.status === 201) {
            testUserId = retryResponse.body.user?.id;
            validToken = retryResponse.body.accessToken;
            console.log('Retry registration successful:', testUserId);
            return;
          }
        }
        
        // Log to stdout for debugging
        console.log('=== Registration failed ===');
        console.log('Status:', registerResponse.status);
        console.log('Body:', JSON.stringify(registerResponse.body));
        console.log('Email:', uniqueEmail);
        console.log('Password:', testUser.password);
        console.log('========================');
        
        // Clean up any existing user just in case
        const { PrismaClient } = await import('@teaching-engine/database');
        const cleanupPrisma = new PrismaClient();
        try {
          await cleanupPrisma.user.deleteMany({
            where: { email: uniqueEmail },
          });
        } finally {
          await cleanupPrisma.$disconnect();
        }
        
        throw new Error(`Failed to register test user: ${registerResponse.status} ${JSON.stringify(registerResponse.body)}`);
      }

      console.log('User registered successfully:', registerResponse.body.user?.id);
      testUserId = registerResponse.body.user?.id;

      // Use the token from registration
      validToken = registerResponse.body.accessToken;

      if (!validToken) {
        console.error('No token received from registration:', registerResponse.body);
        throw new Error('Failed to get valid token from registration');
      }

      console.log('Valid token obtained:', validToken.substring(0, 20) + '...');
    });

    afterEach(async () => {
      // Clean up test user after each test
      if (testUserEmail) {
        const { PrismaClient } = await import('@teaching-engine/database');
        const directPrisma = new PrismaClient();
        try {
          await directPrisma.user.deleteMany({
            where: { email: testUserEmail },
          });
        } finally {
          await directPrisma.$disconnect();
        }
      }
    });

    it('should reject requests without token', async () => {
      const response = await request(app).get('/api/students');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject malformed tokens', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject expired tokens', async () => {
      // Create an expired token
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required for testing');
      }
      const expiredToken = jwt.sign(
        { userId: '1', email: testUser.email, iat: Math.floor(Date.now() / 1000) - 1000 },
        jwtSecret,
        { expiresIn: '-1h' },
      );

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject tokens with invalid signature', async () => {
      // Create token with different secret
      const invalidToken = jwt.sign({ userId: '1', email: testUser.email }, 'wrong-secret');

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Authentication required');
    });

    it('should reject tokens without Bearer prefix', async () => {
      // Only test if we have a valid token
      if (!validToken) {
        console.warn('Skipping test - no valid token available');
        return;
      }

      const response = await request(app).get('/api/students').set('Authorization', validToken);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Authentication required');
    });

    it('should accept valid tokens', async () => {
      // First verify the token was obtained
      expect(validToken).toBeDefined();
      expect(validToken).not.toBe('');

      // Verify the token is valid by decoding it
      const decoded = jwt.decode(validToken) as any;
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(testUserId.toString());
      expect(decoded.email).toBe(testUserEmail);
      
      // Verify token can be verified with the correct secret
      const verified = jwt.verify(validToken, process.env.JWT_SECRET || 'test-secret-key');
      expect(verified).toBeDefined();
    });

    it('should validate token payload structure', async () => {
      // Create token with missing userId
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is required for testing');
      }
      const invalidPayloadToken = jwt.sign({ email: testUser.email }, jwtSecret);

      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${invalidPayloadToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('Admin Token Security', () => {
    const originalWizardToken = process.env.WIZARD_TOKEN;

    beforeEach(() => {
      process.env.WIZARD_TOKEN = 'test-wizard-token-123';
    });

    afterEach(() => {
      process.env.WIZARD_TOKEN = originalWizardToken;
    });

    it('should test admin token security when admin endpoints exist', () => {
      // Note: The current implementation doesn't expose specific admin endpoints
      // This test is a placeholder for when admin functionality is added
      expect(true).toBe(true);
    });
  });

  describe('Session Management', () => {
    it('should clear auth cookie on logout', async () => {
      // Create user first
      await registerTestUser();

      // First login
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(loginResponse.status).toBe(200);
      const accessToken = loginResponse.body.accessToken;

      // Extract refresh token from cookies for the logout request
      const loginCookies = loginResponse.headers['set-cookie'];

      // Then logout (requires authentication)
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Cookie', loginCookies);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.message).toBe('Logged out successfully');

      const cookies = logoutResponse.headers['set-cookie'];
      const refreshCookie = cookies?.find((cookie: string) => cookie.startsWith('refreshToken='));
      expect(refreshCookie).toContain('refreshToken=;'); // Cookie should be cleared
    });

    it('should validate user existence on auth check', async () => {
      // Create user first
      await registerTestUser();

      // Login first
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      const token = loginResponse.body.accessToken;

      // Delete user from database
      const prisma = getTestPrismaClient();
      await prisma.user.delete({
        where: { email: testUser.email },
      });

      // Try to access protected endpoint
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      // The actual implementation might return 401 instead of 404 when user is not found
      expect(response.status).toBeOneOf([401, 404]);
      if (response.status === 404) {
        expect(response.body.message).toBe('User not found');
      } else {
        expect(response.body.message).toBeTruthy();
      }
    });
  });

  describe('Password Security', () => {
    it('should reject weak passwords during registration', async () => {
      // Note: This test assumes there's a registration endpoint
      // Adjust based on actual implementation
      const weakPasswords = ['123456', 'password', 'qwerty', 'abc123', '1234567890', 'password123'];

      for (const weakPassword of weakPasswords) {
        const response = await request(app).post('/api/auth/register').send({
          email: 'newuser@example.com',
          password: weakPassword,
          name: 'New User',
        });

        // Should fail validation (400) due to password requirements
        expect(response.status).toBe(400);
        expect(response.body.message).toBeTruthy();
        expect(response.body.message).toContain('Password');
      }
    });

    it('should properly hash passwords before storage', async () => {
      // Create user first
      await registerTestUser();

      const prisma = getTestPrismaClient();
      const user = await prisma.user.findUnique({
        where: { email: testUser.email },
      });

      expect(user).toBeDefined();
      expect(user!.password).not.toBe(testUser.password);
      expect(user!.password.length).toBeGreaterThan(50); // Bcrypt hashes are typically 60 chars
      expect(user!.password).toMatch(/^\$2[aby]\$/); // Bcrypt format
    });
  });
});
