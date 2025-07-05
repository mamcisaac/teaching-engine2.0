/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Real Authentication Security Tests - No Mocks
 *
 * This test suite replaces ALL mock authentication with REAL database operations,
 * REAL JWT verification, and REAL bcrypt password hashing.
 *
 * CRITICAL: This is production-level authentication testing using real components!
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@teaching-engine/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { Express } from 'express';
import {
  authenticate,
  generateAuthToken,
  hashPassword,
  validatePassword,
  verifyToken,
  checkPermissions,
} from '../../src/services/authService';

// No mocks for authentication - using REAL components only!

describe('Real Authentication Security Tests - NO MOCKS', () => {
  let prisma: PrismaClient;
  let app: Express;

  // Test users with strong passwords that meet real requirements
  const testUsers = {
    teacher: {
      email: 'teacher@secure-test.com',
      password: 'SecureTeacherPass123!',
      name: 'Test Teacher',
      role: 'teacher',
    },
    admin: {
      email: 'admin@secure-test.com',
      password: 'SecureAdminPass456!',
      name: 'Test Admin',
      role: 'admin',
    },
    user: {
      email: 'user@secure-test.com',
      password: 'SecureUserPass789!',
      name: 'Test User',
      role: 'USER',
    },
  };

  beforeAll(async () => {
    // Initialize REAL database connection
    prisma = new PrismaClient();
    await prisma.$connect();

    // Initialize app with REAL authentication middleware
    const appModule = await import('../../src/index');
    app = appModule.app;

    // Ensure JWT_SECRET is properly configured for real operations
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'real-test-jwt-secret-key-for-production-level-testing';
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up ALL test users before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: Object.values(testUsers).map((user) => user.email),
        },
      },
    });
  });

  afterEach(async () => {
    // Clean up ALL test users after each test to prevent interference
    await prisma.user.deleteMany({
      where: {
        email: {
          in: Object.values(testUsers).map((user) => user.email),
        },
      },
    });
  });

  describe('REAL Bcrypt Password Security', () => {
    it('should use real bcrypt hashing with proper salt rounds', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);

      // Verify real bcrypt format and characteristics
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
      expect(hashedPassword.length).toBeGreaterThanOrEqual(60); // bcrypt produces 60-char hashes
      expect(hashedPassword).not.toBe(password);

      // Verify real bcrypt verification works
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);

      // Verify wrong password fails with real bcrypt
      const isInvalid = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);

      // Verify hash is different each time (salt is working)
      const secondHash = await hashPassword(password);
      expect(secondHash).not.toBe(hashedPassword);

      // But both hashes should verify the same password
      const secondValid = await bcrypt.compare(password, secondHash);
      expect(secondValid).toBe(true);
    });

    it('should enforce REAL password strength requirements', async () => {
      // These should PASS real validation
      await expect(validatePassword('ValidPassword123!')).resolves.toBe(true);
      await expect(validatePassword('AnotherGood456@')).resolves.toBe(true);
      await expect(validatePassword('ComplexPass789&')).resolves.toBe(true);

      // These should FAIL real validation - too short
      await expect(validatePassword('Short1!')).rejects.toThrow(
        'Password does not meet security requirements',
      );

      // No uppercase letter
      await expect(validatePassword('lowercase123!')).rejects.toThrow(
        'Password does not meet security requirements',
      );

      // No lowercase letter
      await expect(validatePassword('UPPERCASE123!')).rejects.toThrow(
        'Password does not meet security requirements',
      );

      // No number
      await expect(validatePassword('NoNumber!')).rejects.toThrow(
        'Password does not meet security requirements',
      );

      // No special character
      await expect(validatePassword('NoSpecial123')).rejects.toThrow(
        'Password does not meet security requirements',
      );

      // Common passwords blocked
      await expect(validatePassword('password')).rejects.toThrow(
        'Password does not meet security requirements',
      );
      await expect(validatePassword('123456')).rejects.toThrow(
        'Password does not meet security requirements',
      );
      await expect(validatePassword('qwerty')).rejects.toThrow(
        'Password does not meet security requirements',
      );
    });
  });

  describe('REAL JWT Token Security', () => {
    it('should generate production-quality JWT tokens', async () => {
      const userId = '123';
      const email = 'test@example.com';

      const token = await generateAuthToken(userId, email);

      // Verify real JWT structure
      expect(token).toBeTruthy();
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3); // header.payload.signature

      // Verify token can be decoded with real JWT library
      const decoded = jwt.decode(token, { complete: true }) as unknown;
      expect(decoded.header.alg).toBe('HS256');
      expect(decoded.payload.userId).toBe(userId);
      expect(decoded.payload.email).toBe(email);
      expect(decoded.payload.exp).toBeTruthy();
      expect(decoded.payload.iat).toBeTruthy();

      // Verify expiration is in the future
      const now = Math.floor(Date.now() / 1000);
      expect(decoded.payload.exp).toBeGreaterThan(now);
    });

    it('should verify JWT tokens with real cryptographic verification', async () => {
      const userId = '456';
      const email = 'verify@example.com';

      // Generate real token
      const token = await generateAuthToken(userId, email);

      // Verify with real JWT verification
      const verified = await verifyToken(token);
      expect(verified.userId).toBe(userId);
      expect(verified.email).toBe(email);
    });

    it('should reject tokens with invalid signatures using real crypto verification', async () => {
      // Create token with wrong secret (real attack scenario)
      const fakeToken = jwt.sign({ userId: '123', email: 'fake@example.com' }, 'wrong-secret-key');

      await expect(verifyToken(fakeToken)).rejects.toThrow();
    });

    it('should reject expired tokens using real time validation', async () => {
      // Create expired token (real production scenario)
      const expiredToken = jwt.sign(
        { userId: '123', email: 'expired@example.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' },
      );

      await expect(verifyToken(expiredToken)).rejects.toThrow();
    });

    it('should require JWT_SECRET for real production security', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      await expect(generateAuthToken('123', 'test@example.com')).rejects.toThrow(
        'JWT_SECRET environment variable is required',
      );
      await expect(verifyToken('some.jwt.token')).rejects.toThrow(
        'JWT_SECRET environment variable is required',
      );

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('REAL Database User Authentication', () => {
    let createdUser: unknown;

    beforeEach(async () => {
      // Create REAL user in REAL database
      const hashedPassword = await hashPassword(testUsers.teacher.password);
      createdUser = await prisma.user.create({
        data: {
          email: testUsers.teacher.email,
          password: hashedPassword,
          name: testUsers.teacher.name,
          role: testUsers.teacher.role,
        },
      });
    });

    it('should authenticate real users with real database lookup and bcrypt verification', async () => {
      const result = await authenticate(
        testUsers.teacher.email,
        testUsers.teacher.password,
        prisma,
      );

      // Verify all authentication components are real
      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe(testUsers.teacher.email);
      expect(result.user.name).toBe(testUsers.teacher.name);
      expect(result.user.role).toBe(testUsers.teacher.role);
      expect(result.user.id).toBe(createdUser.id.toString());

      // Verify sensitive data is not leaked
      expect((result.user as unknown).password).toBeUndefined();

      // Verify token is a real JWT that can be verified
      const verified = await verifyToken(result.accessToken);
      expect(verified.userId).toBe(createdUser.id.toString());
      expect(verified.email).toBe(testUsers.teacher.email);

      // Verify token was signed with real secret
      const decoded = jwt.verify(result.accessToken, process.env.JWT_SECRET!) as unknown;
      expect(decoded.userId).toBe(createdUser.id.toString());
    });

    it('should reject wrong passwords using real bcrypt comparison', async () => {
      await expect(
        authenticate(testUsers.teacher.email, 'WrongPassword123!', prisma),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should reject non-existent emails with real database lookup', async () => {
      await expect(
        authenticate('nonexistent@secure-test.com', testUsers.teacher.password, prisma),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should handle concurrent authentication attempts correctly', async () => {
      // Test real concurrency scenarios - focus on successful authentication
      const promises = Array.from({ length: 3 }, () =>
        authenticate(testUsers.teacher.email, testUsers.teacher.password, prisma),
      );

      const results = await Promise.all(promises);

      // All should succeed with real authentication
      results.forEach((result) => {
        expect(result.user.email).toBe(testUsers.teacher.email);
        expect(result.accessToken).toBeTruthy();
        expect(result.user.id).toBe(createdUser.id.toString());
      });

      // Verify all tokens are valid JWT tokens (regardless of uniqueness)
      for (const result of results) {
        const verified = await verifyToken(result.accessToken);
        expect(verified.userId).toBe(createdUser.id.toString());
        expect(verified.email).toBe(testUsers.teacher.email);
      }
    });
  });

  describe('REAL Permission System', () => {
    it('should check admin permissions with real role-based logic', async () => {
      const adminUser = { role: 'ADMIN' };

      // Test all permission levels with real permission checking
      expect(await checkPermissions(adminUser, 'admin.access')).toBe(true);
      expect(await checkPermissions(adminUser, 'read')).toBe(true);
      expect(await checkPermissions(adminUser, 'write')).toBe(true);
      expect(await checkPermissions(adminUser, 'delete')).toBe(true);
    });

    it('should enforce user permission restrictions with real validation', async () => {
      const regularUser = { role: 'USER' };

      expect(await checkPermissions(regularUser, 'read')).toBe(true);
      expect(await checkPermissions(regularUser, 'write')).toBe(false);
      expect(await checkPermissions(regularUser, 'delete')).toBe(false);
      expect(await checkPermissions(regularUser, 'admin.access')).toBe(false);
    });

    it('should handle custom permissions arrays with real validation', async () => {
      const userWithCustomPermissions = {
        role: 'USER',
        permissions: ['read', 'write', 'custom.feature'],
      };

      expect(await checkPermissions(userWithCustomPermissions, 'read')).toBe(true);
      expect(await checkPermissions(userWithCustomPermissions, 'write')).toBe(true);
      expect(await checkPermissions(userWithCustomPermissions, 'custom.feature')).toBe(true);
      expect(await checkPermissions(userWithCustomPermissions, 'delete')).toBe(false);
      expect(await checkPermissions(userWithCustomPermissions, 'admin.access')).toBe(false);
    });
  });

  describe('REAL API Authentication Endpoints', () => {
    let authToken: string;
    let createdUser: unknown;

    beforeEach(async () => {
      // Create real user for API testing
      const hashedPassword = await hashPassword(testUsers.teacher.password);
      createdUser = await prisma.user.create({
        data: {
          email: testUsers.teacher.email,
          password: hashedPassword,
          name: testUsers.teacher.name,
          role: testUsers.teacher.role,
        },
      });
    });

    it('should perform real login via API with complete authentication flow', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUsers.teacher.email,
        password: testUsers.teacher.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.accessToken || response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe(testUsers.teacher.email);
      expect(response.body.user.password).toBeUndefined();

      authToken = response.body.accessToken || response.body.accessToken;

      // Verify token is real and valid
      const verified = await verifyToken(authToken);
      expect(verified.userId).toBe(createdUser.id.toString());

      // Note: Cookie authentication has been removed - using Bearer tokens only
    });

    it('should reject invalid credentials with real verification', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUsers.teacher.email,
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body.error || response.body.message).toBeTruthy();
    });

    it('should register new users with real database operations and bcrypt hashing', async () => {
      const newUser = {
        email: 'newuser@secure-test.com',
        password: 'NewUserPassword123!',
        name: 'New Test User',
      };

      const response = await request(app).post('/api/auth/register').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.accessToken || response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.password).toBeUndefined();

      // Verify user was ACTUALLY created in REAL database
      const dbUser = await prisma.user.findUnique({
        where: { email: newUser.email },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser!.email).toBe(newUser.email);
      expect(dbUser!.name).toBe(newUser.name);

      // Verify password was REALLY hashed with bcrypt
      expect(dbUser!.password).not.toBe(newUser.password);
      expect(dbUser!.password).toMatch(/^\$2[aby]\$/);

      // Verify real bcrypt verification works
      const isValid = await bcrypt.compare(newUser.password, dbUser!.password);
      expect(isValid).toBe(true);

      // Clean up
      await prisma.user.delete({ where: { email: newUser.email } });
    });

    it('should prevent duplicate registration with real database constraints', async () => {
      const duplicateUser = {
        email: testUsers.teacher.email, // Already exists
        password: 'DifferentPassword123!',
        name: 'Different Name',
      };

      const response = await request(app).post('/api/auth/register').send(duplicateUser);

      expect([400, 409]).toContain(response.status);
      expect(response.body.error || response.body.message).toBeTruthy();
    });

    it('should protect endpoints with real authentication middleware', async () => {
      // First login to get real token
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUsers.teacher.email,
        password: testUsers.teacher.password,
      });

      authToken = loginResponse.body.accessToken || loginResponse.body.accessToken;

      // Access protected endpoint with real token
      const protectedResponse = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${authToken}`);

      // Should work with real authentication (200) or return validation error (400) if no query params
      expect([200, 400]).toContain(protectedResponse.status);
    });

    it('should reject requests without authentication tokens', async () => {
      const response = await request(app).get('/api/students');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject requests with invalid/tampered tokens', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject tokens without Bearer prefix', async () => {
      // Login first to get real token
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: testUsers.teacher.email,
        password: testUsers.teacher.password,
      });

      const validToken = loginResponse.body.accessToken || loginResponse.body.accessToken;

      // Send token without Bearer prefix
      const response = await request(app).get('/api/students').set('Authorization', validToken);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });

  describe('REAL Security Edge Cases', () => {
    it('should handle malformed requests securely', async () => {
      // Test various malformed request scenarios
      const malformedRequests = [
        { email: null, password: null },
        { email: '', password: '' },
        { email: 'test@test.com' }, // missing password
        { password: 'password' }, // missing email
        {}, // empty object
      ];

      for (const badRequest of malformedRequests) {
        const response = await request(app).post('/api/auth/login').send(badRequest);

        expect(response.status).toBe(400);
        expect(response.body.error || response.body.message).toBeTruthy();
      }
    });

    it('should handle extremely long passwords securely', async () => {
      const longPassword = 'A'.repeat(1000) + '1!';

      // Should not crash and should handle gracefully
      const response = await request(app).post('/api/auth/register').send({
        email: 'longpass@test.com',
        password: longPassword,
        name: 'Long Password User',
      });

      // Either accepts it or rejects it, but shouldn't crash
      expect([201, 400, 413]).toContain(response.status);
    });

    it('should prevent timing attacks on user enumeration', async () => {
      // Create one real user
      const realUser = await prisma.user.create({
        data: {
          email: 'timing@test.com',
          password: await hashPassword('TestPassword123!'),
          name: 'Timing Test User',
          role: 'teacher',
        },
      });

      // Time login attempts for existing vs non-existing users
      const startExisting = Date.now();
      await request(app).post('/api/auth/login').send({
        email: 'timing@test.com',
        password: 'wrongpassword',
      });
      const timeExisting = Date.now() - startExisting;

      const startNonExisting = Date.now();
      await request(app).post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'wrongpassword',
      });
      const timeNonExisting = Date.now() - startNonExisting;

      // Time difference should be minimal (within 500ms to account for variance)
      const timeDifference = Math.abs(timeExisting - timeNonExisting);
      expect(timeDifference).toBeLessThan(500);

      // Clean up
      await prisma.user.delete({ where: { id: realUser.id } });
    });
  });

  describe('REAL Database Operations Security', () => {
    it('should create users with proper database constraints', async () => {
      const userData = {
        email: 'dbtest@secure-test.com',
        password: 'DatabasePassword123!',
        name: 'Database Test User',
        role: 'teacher',
      };

      // Hash password with real bcrypt
      const hashedPassword = await hashPassword(userData.password);

      // Create user in real database
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role,
        },
      });

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(hashedPassword);
      expect(user.password).not.toBe(userData.password);

      // Verify user can be found with real database query
      const foundUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(user.id);

      // Verify real bcrypt verification works
      const isValid = await bcrypt.compare(userData.password, foundUser!.password);
      expect(isValid).toBe(true);

      // Clean up
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should enforce real database unique constraints', async () => {
      const userData = {
        email: 'unique@secure-test.com',
        password: await hashPassword('UniquePassword123!'),
        name: 'First User',
        role: 'teacher',
      };

      // Create first user
      const firstUser = await prisma.user.create({ data: userData });

      // Attempt to create second user with same email should fail with real constraint
      await expect(
        prisma.user.create({
          data: {
            ...userData,
            name: 'Second User',
          },
        }),
      ).rejects.toThrow();

      // Clean up
      await prisma.user.delete({ where: { id: firstUser.id } });
    });
  });
});
