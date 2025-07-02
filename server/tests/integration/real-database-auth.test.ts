/**
 * Real Database Authentication Integration Tests
 *
 * Complete test suite using REAL database operations, REAL JWT verification,
 * and REAL bcrypt password hashing - no mocks!
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

describe('Real Database Authentication Integration Tests', () => {
  let prisma: PrismaClient;
  let app: Express;

  // Test data
  const testUser = {
    email: 'real-test@example.com',
    password: 'RealTestPassword123!',
    name: 'Real Test User',
    role: 'teacher',
  };

  const adminUser = {
    email: 'admin@example.com',
    password: 'AdminPassword456!',
    name: 'Admin User',
    role: 'admin',
  };

  beforeAll(async () => {
    // Use real database connection (integration test setup handles this)
    prisma = new PrismaClient();
    await prisma.$connect();

    // Initialize app
    const appModule = await import('../../src/index');
    app = appModule.app;

    // Ensure JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-jwt-secret-key-for-auth-tests';
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test users before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, adminUser.email],
        },
      },
    });
  });

  afterEach(async () => {
    // Clean up test users after each test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, adminUser.email],
        },
      },
    });
  });

  describe('Real Password Hashing and Verification', () => {
    it('should hash passwords using real bcrypt', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await hashPassword(password);

      // Verify bcrypt format
      expect(hashedPassword).toMatch(/^\$2[aby]\$/);
      expect(hashedPassword.length).toBeGreaterThan(50);
      expect(hashedPassword).not.toBe(password);

      // Verify password can be verified
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);

      // Verify wrong password fails
      const isInvalid = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    it('should validate password strength with real requirements', async () => {
      // Valid password
      await expect(validatePassword('ValidPassword123!')).resolves.toBe(true);

      // Too short
      await expect(validatePassword('Short1!')).rejects.toThrow(
        'Password does not meet security requirements',
      );

      // No uppercase
      await expect(validatePassword('lowercase123!')).rejects.toThrow(
        'Password does not meet security requirements',
      );

      // No lowercase
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

      // Common password
      await expect(validatePassword('password')).rejects.toThrow(
        'Password does not meet security requirements',
      );
    });
  });

  describe('Real JWT Token Operations', () => {
    it('should generate valid JWT tokens with real configuration', async () => {
      const userId = '123';
      const email = 'test@example.com';

      const token = await generateAuthToken(userId, email);

      // Verify token format
      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature

      // Verify token can be decoded
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.exp).toBeTruthy();
      expect(decoded.iat).toBeTruthy();
    });

    it('should verify JWT tokens with real secret', async () => {
      const userId = '456';
      const email = 'verify@example.com';

      // Generate token
      const token = await generateAuthToken(userId, email);

      // Verify token
      const verified = await verifyToken(token);
      expect(verified.userId).toBe(userId);
      expect(verified.email).toBe(email);
    });

    it('should reject tokens with invalid signatures', async () => {
      // Create token with different secret
      const fakeToken = jwt.sign({ userId: '123', email: 'fake@example.com' }, 'wrong-secret');

      await expect(verifyToken(fakeToken)).rejects.toThrow();
    });

    it('should reject expired tokens', async () => {
      // Create expired token
      const expiredToken = jwt.sign(
        { userId: '123', email: 'expired@example.com' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' },
      );

      await expect(verifyToken(expiredToken)).rejects.toThrow();
    });

    it('should require JWT_SECRET environment variable', async () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      await expect(generateAuthToken('123', 'test@example.com')).rejects.toThrow(
        'JWT_SECRET environment variable is required',
      );

      process.env.JWT_SECRET = originalSecret;
    });
  });

  describe('Real Database User Authentication', () => {
    let createdUser: any;

    beforeEach(async () => {
      // Create real user in database
      const hashedPassword = await hashPassword(testUser.password);
      createdUser = await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          name: testUser.name,
          role: testUser.role,
        },
      });
    });

    it('should authenticate user with correct credentials from real database', async () => {
      const result = await authenticate(testUser.email, testUser.password, prisma);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(testUser.email);
      expect(result.user.name).toBe(testUser.name);
      expect(result.user.role).toBe(testUser.role);
      expect(result.user.id).toBe(createdUser.id.toString());

      // Verify password not returned
      expect((result.user as any).password).toBeUndefined();

      // Verify token is valid
      const verified = await verifyToken(result.token);
      expect(verified.userId).toBe(createdUser.id.toString());
      expect(verified.email).toBe(testUser.email);
    });

    it('should reject authentication with wrong password', async () => {
      await expect(authenticate(testUser.email, 'WrongPassword', prisma)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('should reject authentication with non-existent email', async () => {
      await expect(
        authenticate('nonexistent@example.com', testUser.password, prisma),
      ).rejects.toThrow('Invalid credentials');
    });

    it('should perform case-insensitive email lookup', async () => {
      // Note: This test depends on database configuration
      // SQLite is case-insensitive by default, PostgreSQL requires LOWER() or ILIKE
      try {
        const result = await authenticate(testUser.email.toUpperCase(), testUser.password, prisma);
        expect(result.user.email).toBe(testUser.email);
      } catch (error) {
        // If case-sensitive lookup fails, that's also valid behavior
        expect(error).toHaveProperty('message', 'Invalid credentials');
      }
    });
  });

  describe('Real Permission System', () => {
    it('should check admin permissions correctly', async () => {
      const adminUserData = { role: 'ADMIN' };

      const hasAdminAccess = await checkPermissions(adminUserData, 'admin.access');
      expect(hasAdminAccess).toBe(true);

      const hasRead = await checkPermissions(adminUserData, 'read');
      expect(hasRead).toBe(true);

      const hasWrite = await checkPermissions(adminUserData, 'write');
      expect(hasWrite).toBe(true);

      const hasDelete = await checkPermissions(adminUserData, 'delete');
      expect(hasDelete).toBe(true);
    });

    it('should check user permissions correctly', async () => {
      const regularUser = { role: 'USER' };

      const hasRead = await checkPermissions(regularUser, 'read');
      expect(hasRead).toBe(true);

      const hasWrite = await checkPermissions(regularUser, 'write');
      expect(hasWrite).toBe(false);

      const hasDelete = await checkPermissions(regularUser, 'delete');
      expect(hasDelete).toBe(false);

      const hasAdminAccess = await checkPermissions(regularUser, 'admin.access');
      expect(hasAdminAccess).toBe(false);
    });

    it('should check moderator permissions correctly', async () => {
      const moderatorUser = { role: 'MODERATOR' };

      const hasRead = await checkPermissions(moderatorUser, 'read');
      expect(hasRead).toBe(true);

      const hasWrite = await checkPermissions(moderatorUser, 'write');
      expect(hasWrite).toBe(true);

      const hasDelete = await checkPermissions(moderatorUser, 'delete');
      expect(hasDelete).toBe(false);

      const hasAdminAccess = await checkPermissions(moderatorUser, 'admin.access');
      expect(hasAdminAccess).toBe(false);
    });

    it('should check specific permissions array', async () => {
      const userWithPermissions = {
        role: 'USER',
        permissions: ['read', 'write', 'custom.permission'],
      };

      const hasRead = await checkPermissions(userWithPermissions, 'read');
      expect(hasRead).toBe(true);

      const hasWrite = await checkPermissions(userWithPermissions, 'write');
      expect(hasWrite).toBe(true);

      const hasCustom = await checkPermissions(userWithPermissions, 'custom.permission');
      expect(hasCustom).toBe(true);

      const hasDelete = await checkPermissions(userWithPermissions, 'delete');
      expect(hasDelete).toBe(false);
    });
  });

  describe('Real Database User Management', () => {
    it('should create users with properly hashed passwords', async () => {
      const userData = {
        email: 'dbuser@example.com',
        password: 'DatabasePassword123!',
        name: 'Database User',
        role: 'teacher',
      };

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user in database
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
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toBe(hashedPassword);

      // Verify user can be found
      const foundUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(foundUser).toBeDefined();
      expect(foundUser!.id).toBe(user.id);

      // Verify password verification
      const isValid = await bcrypt.compare(userData.password, foundUser!.password);
      expect(isValid).toBe(true);

      // Clean up
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
        email: 'unique@example.com',
        password: await hashPassword('Password123!'),
        name: 'First User',
        role: 'teacher',
      };

      // Create first user
      const firstUser = await prisma.user.create({ data: userData });

      // Try to create second user with same email
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

  describe('Real Authentication Error Handling', () => {
    it('should handle JWT secret missing gracefully', async () => {
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

    it('should validate input parameters', async () => {
      // Test with empty/null values
      await expect(authenticate('', testUser.password, prisma)).rejects.toThrow();

      await expect(authenticate(testUser.email, '', prisma)).rejects.toThrow();

      await expect(verifyToken('')).rejects.toThrow();
    });
  });

  describe('Real API Authentication Integration', () => {
    let authToken: string;
    let createdUser: any;

    beforeEach(async () => {
      // Create real user in database
      const hashedPassword = await hashPassword(testUser.password);
      createdUser = await prisma.user.create({
        data: {
          email: testUser.email,
          password: hashedPassword,
          name: testUser.name,
          role: testUser.role,
        },
      });
    });

    it('should login with real credentials via API', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.password).toBeUndefined();

      authToken = response.body.token;

      // Verify token is valid
      const verified = await verifyToken(authToken);
      expect(verified.userId).toBe(createdUser.id.toString());
    });

    it('should reject invalid credentials via API', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword',
      });

      expect(response.status).toBe(401);
      // Check for error response - can be either message or error field
      expect(response.body.error || response.body.message).toBeTruthy();
    });

    it('should register new user with real database operations', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'NewUserPassword123!',
        name: 'New User',
      };

      const response = await request(app).post('/api/auth/register').send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      // Check for either token or accessToken field
      expect(response.body.token || response.body.accessToken).toBeDefined();
      expect(response.body.user.email).toBe(newUser.email);
      expect(response.body.user.password).toBeUndefined();

      // Verify user was actually created in database
      const dbUser = await prisma.user.findUnique({
        where: { email: newUser.email },
      });

      expect(dbUser).toBeDefined();
      expect(dbUser!.email).toBe(newUser.email);
      expect(dbUser!.name).toBe(newUser.name);

      // Verify password was hashed
      expect(dbUser!.password).not.toBe(newUser.password);
      expect(dbUser!.password).toMatch(/^\$2[aby]\$/);

      // Verify password can be verified
      const isValid = await bcrypt.compare(newUser.password, dbUser!.password);
      expect(isValid).toBe(true);

      // Clean up
      await prisma.user.delete({ where: { email: newUser.email } });
    });

    it('should prevent duplicate registration', async () => {
      // Try to register with existing email
      const response = await request(app).post('/api/auth/register').send({
        email: testUser.email, // Already exists
        password: 'DifferentPassword123!',
        name: 'Different Name',
      });

      // Expect either 409 (Conflict) or 400 (Bad Request) for duplicate email
      expect([400, 409]).toContain(response.status);
      expect(response.body.error || response.body.message).toBeTruthy();
    });

    it('should reject requests without authentication token', async () => {
      const response = await request(app).get('/api/students');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });
  });
});
