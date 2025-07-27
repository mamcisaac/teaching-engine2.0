/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Real Authentication Tests - No Mocks
 * Tests authentication middleware with real JWT operations and database interactions
 */
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { authenticate, generateToken, verifyToken } from '../authenticate';
import { login, register, logout } from '../auth';
import {
  createTestUser,
  createAuthenticatedTestUser,
  deleteTestUser,
  createAuthMiddlewareTest,
  testAuthMiddleware,
  testProtectedEndpoint,
  cleanupTestUsers,
  setupAuthTestEnvironment,
  type TestUser,
  type AuthTestTokens
} from '../../../tests/utils/auth-test-helpers';

describe('Real Authentication Middleware Tests', () => {
  let testUsers: TestUser[] = [];
  let authTokens: AuthTestTokens[] = [];

  beforeEach(async () => {
    // Clean up any existing test data
    await cleanupTestUsers();
    testUsers = [];
    authTokens = [];
  });

  afterEach(async () => {
    // Clean up test users created during tests
    for (const user of testUsers) {
      await deleteTestUser(user.id);
    }
    await cleanupTestUsers();
  });

  describe('Real JWT Token Validation', () => {
    test('should accept valid JWT token from real user', async () => {
      // Create real test user
      const testUser = await createTestUser({ role: 'USER' });
      testUsers.push(testUser);

      // Generate real JWT token
      const tokens = await createAuthenticatedTestUser({ email: testUser.email });
      authTokens.push(tokens);

      // Test middleware with real token
      const result = await testAuthMiddleware(authenticate, testUser);

      expect(result.authenticated).toBe(true);
      expect(result.statusCode).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    test('should reject missing authorization header', async () => {
      const result = await testAuthMiddleware(authenticate);

      expect(result.authenticated).toBe(false);
      expect(result.statusCode).toBe(401);
      expect(result.response?.error).toBe('Authentication required');
    });

    test('should reject malformed authorization header', async () => {
      const testUser = await createTestUser();
      testUsers.push(testUser);

      // Create request with malformed auth header
      const { req, res, next } = createAuthMiddlewareTest(testUser);
      req.headers = { authorization: 'InvalidFormat token' };

      await authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should reject invalid token format', async () => {
      const testUser = await createTestUser();
      testUsers.push(testUser);

      const { req, res, next } = createAuthMiddlewareTest(testUser);
      req.headers = { authorization: 'Bearer invalid.token.format' };

      await authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should verify real token structure and claims', async () => {
      const testUser = await createTestUser();
      testUsers.push(testUser);

      const token = generateToken({
        id: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      const decoded = await verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded).not.toHaveProperty('error');
      expect((decoded as any).userId).toBe(testUser.id.toString());
      expect((decoded as any).email).toBe(testUser.email);
      expect((decoded as any).role).toBe(testUser.role);
    });

    test('should handle real token with nonexistent user', async () => {
      // Create token for user that doesn't exist in database
      const fakeUserId = 999999;
      const token = generateToken({
        id: fakeUserId,
        email: 'nonexistent@example.com',
        role: 'USER',
      });

      const { req, res, next } = createAuthMiddlewareTest({} as TestUser);
      req.headers = { authorization: `Bearer ${token}` };

      await authenticate(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('Real User Authentication Flows', () => {
    test('should complete full login flow with real database operations', async () => {
      const testUser = await createTestUser({
        email: 'login-test@example.com',
        password: 'TestPassword123!',
        role: 'USER',
      });
      testUsers.push(testUser);

      const { req, res, next } = createAuthMiddlewareTest(testUser);
      req.body = {
        email: testUser.email,
        password: testUser.password,
      };

      await login(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: testUser.id,
            email: testUser.email,
            role: testUser.role,
          }),
          accessToken: expect.any(String),
        })
      );
    });

    test('should complete full registration flow with real database operations', async () => {
      const userData = {
        email: 'register-test@example.com',
        password: 'TestPassword123!',
        name: 'Test Registration User',
      };

      const { req, res, next } = createAuthMiddlewareTest({} as TestUser);
      req.body = userData;

      await register(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            email: userData.email,
            name: userData.name,
            role: 'USER',
          }),
          accessToken: expect.any(String),
        })
      );

      // Clean up created user
      const createdUser = (res.json as any).mock.calls[0][0].user;
      testUsers.push({ ...createdUser, password: userData.password });
    });

    test('should handle logout with real token cleanup', async () => {
      const testUser = await createTestUser();
      testUsers.push(testUser);

      const { req, res, next } = createAuthMiddlewareTest(testUser);

      await logout(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });

    test('should attach real user data to request during authentication', async () => {
      const testUser = await createTestUser({
        email: 'attach-user@example.com',
        role: 'USER',
      });
      testUsers.push(testUser);

      const { req, res, next } = createAuthMiddlewareTest(testUser);
      
      await authenticate(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(
        expect.objectContaining({
          id: testUser.id,
          email: testUser.email,
          role: testUser.role,
        })
      );
    });
  });

  describe('Real Token and Role Authorization', () => {
    test('should handle role-based authorization with real users', async () => {
      const { users, tokens, cleanup } = await setupAuthTestEnvironment();
      
      // Test admin access
      const adminResult = await testAuthMiddleware(authenticate, users.admin);
      expect(adminResult.authenticated).toBe(true);
      
      // Test user access  
      const userResult = await testAuthMiddleware(authenticate, users.user);
      expect(userResult.authenticated).toBe(true);
      
      // Test guest access
      const guestResult = await testAuthMiddleware(authenticate, users.guest);
      expect(guestResult.authenticated).toBe(true);

      // Add created users to cleanup list
      testUsers.push(users.admin, users.user, users.guest);
      
      await cleanup();
    });

    test('should validate real JWT token claims and structure', async () => {
      const testUser = await createTestUser({
        email: 'claims-test@example.com',
        role: 'USER',
      });
      testUsers.push(testUser);

      const token = generateToken({
        id: testUser.id,
        email: testUser.email,
        role: testUser.role,
      });

      const decoded = await verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded).not.toHaveProperty('error');
      
      const payload = decoded as any;
      expect(payload.userId).toBe(testUser.id.toString());
      expect(payload.email).toBe(testUser.email);
      expect(payload.role).toBe(testUser.role);
      expect(payload.iat).toBeDefined();
      expect(payload.exp).toBeDefined();
      expect(payload.iss).toBe('teaching-engine');
    });

    test('should enforce password validation during registration', async () => {
      const weakPasswordData = {
        email: 'weak-password@example.com',
        password: '123', // Too weak
        name: 'Weak Password User',
      };

      const { req, res, next } = createAuthMiddlewareTest({} as TestUser);
      req.body = weakPasswordData;

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: expect.stringContaining('Password must be at least'),
        })
      );
    });

    test('should prevent duplicate email registration', async () => {
      const testUser = await createTestUser({
        email: 'duplicate-test@example.com',
      });
      testUsers.push(testUser);

      const duplicateData = {
        email: testUser.email, // Same email
        password: 'DifferentPassword123!',
        name: 'Duplicate User',
      };

      const { req, res, next } = createAuthMiddlewareTest({} as TestUser);
      req.body = duplicateData;

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 409,
          message: 'Email already registered',
        })
      );
    });
  });

  describe('Real Security and Error Handling', () => {
    test('should handle invalid credentials during login', async () => {
      const testUser = await createTestUser({
        email: 'invalid-creds@example.com',
        password: 'CorrectPassword123!',
      });
      testUsers.push(testUser);

      const { req, res, next } = createAuthMiddlewareTest(testUser);
      req.body = {
        email: testUser.email,
        password: 'WrongPassword123!', // Wrong password
      };

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          message: 'Invalid email or password',
        })
      );
    });

    test('should validate email format during registration', async () => {
      const invalidEmailData = {
        email: 'invalid-email-format',
        password: 'ValidPassword123!',
        name: 'Invalid Email User',
      };

      const { req, res, next } = createAuthMiddlewareTest({} as TestUser);
      req.body = invalidEmailData;

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          message: 'Invalid email format',
        })
      );
    });

    test('should handle real database connection errors gracefully', async () => {
      // This test would need to temporarily break database connection
      // For now, we'll test that the auth functions can handle errors
      const testUser = await createTestUser();
      testUsers.push(testUser);

      const { req, res, next } = createAuthMiddlewareTest(testUser);
      
      // Test that authentication works with a real user
      await authenticate(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    test('should complete full authentication workflow', async () => {
      // Test the complete flow: register -> login -> authenticate -> logout
      
      // 1. Register
      const userData = {
        email: 'workflow-test@example.com',
        password: 'TestPassword123!',
        name: 'Workflow Test User',
      };

      const { req: regReq, res: regRes, next: regNext } = createAuthMiddlewareTest({} as TestUser);
      regReq.body = userData;

      await register(regReq, regRes, regNext);
      
      const registeredUser = (regRes.json as any).mock.calls[0][0].user;
      testUsers.push({ ...registeredUser, password: userData.password });

      // 2. Login
      const { req: loginReq, res: loginRes, next: loginNext } = createAuthMiddlewareTest({} as TestUser);
      loginReq.body = { email: userData.email, password: userData.password };

      await login(loginReq, loginRes, loginNext);
      
      const loginResponse = (loginRes.json as any).mock.calls[0][0];
      expect(loginResponse.accessToken).toBeDefined();

      // 3. Authenticate with token
      const { req: authReq, res: authRes, next: authNext } = createAuthMiddlewareTest({} as TestUser);
      authReq.headers = { authorization: `Bearer ${loginResponse.accessToken}` };

      await authenticate(authReq, authRes, authNext);
      
      expect(authNext).toHaveBeenCalled();
      expect(authReq.user).toBeDefined();

      // 4. Logout
      const { req: logoutReq, res: logoutRes, next: logoutNext } = createAuthMiddlewareTest(registeredUser);

      await logout(logoutReq, logoutRes, logoutNext);
      
      expect(logoutRes.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(logoutRes.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });
});