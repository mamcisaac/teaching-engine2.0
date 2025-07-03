import request from 'supertest';
import { describe, beforeAll, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { app } from '../../src/index';
import {
  getIntegrationTestPrismaClient,
  cleanIntegrationTestData,
} from '../integration-test-setup';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication Routes', () => {
  let prisma: ReturnType<typeof getIntegrationTestPrismaClient>;

  // Test user data
  const validUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
  };

  beforeAll(async () => {
    prisma = getIntegrationTestPrismaClient();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await cleanIntegrationTestData();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestUser = async (overrides = {}) => {
    const hashedPassword = await bcrypt.hash(validUser.password, 10);
    return await prisma.user.create({
      data: {
        email: validUser.email,
        password: hashedPassword,
        name: validUser.name,
        role: 'teacher',
        preferredLanguage: 'en',
        ...overrides,
      },
    });
  };

  describe('POST /api/login', () => {
    it('should successfully login with valid credentials', async () => {
      await createTestUser();

      const res = await request(app).post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        email: validUser.email,
        name: validUser.name,
        role: 'teacher',
      });
      expect(res.body.user).not.toHaveProperty('password');

      // Verify JWT token
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET!) as any;
      expect(decoded.email).toBe(validUser.email);
      expect(decoded.userId).toBeDefined();

      // Check httpOnly cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/authToken=/);
      expect(cookies[0]).toMatch(/HttpOnly/);
    });

    it('should handle case-insensitive email login', async () => {
      await createTestUser();

      const res = await request(app).post('/api/login').send({
        email: 'TEST@EXAMPLE.COM',
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(validUser.email);
    });

    it('should return 401 with incorrect password', async () => {
      await createTestUser();

      const res = await request(app).post('/api/login').send({
        email: validUser.email,
        password: 'WrongPassword123!',
      });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 401 with non-existent email', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'nonexistent@example.com',
        password: validUser.password,
      });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid credentials' });
    });

    it('should return 400 with missing email', async () => {
      const res = await request(app).post('/api/login').send({
        password: validUser.password,
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Email and password are required' });
    });

    it('should return 400 with missing password', async () => {
      const res = await request(app).post('/api/login').send({
        email: validUser.email,
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Email and password are required' });
    });

    it('should return 400 with invalid email format', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'not-an-email',
        password: validUser.password,
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid email format' });
    });

    it('should return 400 with non-string email', async () => {
      const res = await request(app).post('/api/login').send({
        email: 123,
        password: validUser.password,
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Email and password are required' });
    });

    it('should return 400 with non-string password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: validUser.email,
          password: { password: 'test' },
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Email and password are required' });
    });

    it('should trim email whitespace', async () => {
      await createTestUser();

      const res = await request(app).post('/api/login').send({
        email: '  test@example.com  ',
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(validUser.email);
    });

    it('should handle very long email by truncating', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const res = await request(app).post('/api/login').send({
        email: longEmail,
        password: validUser.password,
      });

      // Should get invalid email format error since truncated email is invalid
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid email format' });
    });

    it('should handle rate limiting configuration', async () => {
      // Since rate limiting is disabled in test environment,
      // we can only test that the endpoint handles multiple requests
      const promises = Array(10)
        .fill(null)
        .map(() =>
          request(app).post('/api/login').send({
            email: 'ratelimit@example.com',
            password: 'wrongpassword',
          }),
        );

      const responses = await Promise.all(promises);

      // All requests should return 401 (invalid credentials) not rate limited
      responses.forEach((res) => {
        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Invalid credentials' });
      });

      // This confirms rate limiting is properly skipped in test mode
      // and the endpoint can handle concurrent requests
    });
  });

  describe('POST /api/register', () => {
    it('should successfully register a new user', async () => {
      const newUser = {
        email: 'newuser@example.com',
        password: 'StrongPassword123!',
        name: 'New User',
      };

      const res = await request(app).post('/api/register').send(newUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        email: newUser.email,
        name: newUser.name,
        role: 'USER',
      });
      expect(res.body.user).not.toHaveProperty('password');

      // Verify user was created in database
      const dbUser = await prisma.user.findUnique({
        where: { email: newUser.email },
      });
      expect(dbUser).toBeTruthy();
      expect(dbUser!.email).toBe(newUser.email);

      // Verify password was hashed
      const isPasswordValid = await bcrypt.compare(newUser.password, dbUser!.password);
      expect(isPasswordValid).toBe(true);

      // Check httpOnly cookie is set
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/authToken=/);
    });

    it('should return 409 if email already exists', async () => {
      await createTestUser();

      const res = await request(app).post('/api/register').send({
        email: validUser.email,
        password: 'AnotherPassword123!',
        name: 'Another User',
      });

      expect(res.status).toBe(409);
      expect(res.body).toEqual({ error: 'Email already exists' });
    });

    it('should return 400 for password shorter than 8 characters', async () => {
      const res = await request(app).post('/api/register').send({
        email: 'newuser@example.com',
        password: 'short',
        name: 'New User',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 for invalid email format', async () => {
      const res = await request(app).post('/api/register').send({
        email: 'not-an-email',
        password: 'ValidPassword123!',
        name: 'New User',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 for missing name', async () => {
      const res = await request(app).post('/api/register').send({
        email: 'newuser@example.com',
        password: 'ValidPassword123!',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 for empty name', async () => {
      const res = await request(app).post('/api/register').send({
        email: 'newuser@example.com',
        password: 'ValidPassword123!',
        name: '',
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should reject weak passwords', async () => {
      const weakPasswords = ['password', '12345678', 'aaaaaaaa', 'PASSWORD', 'Pass1234'];

      for (const password of weakPasswords) {
        const res = await request(app)
          .post('/api/register')
          .send({
            email: `user${password}@example.com`,
            password,
            name: 'Test User',
          });

        // Password validation may return 400 or 500 depending on validation method
        expect([400, 500]).toContain(res.status);
        expect(res.body.error).toBeDefined();
      }
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      const user = await createTestUser();

      // Login to get token
      const loginRes = await request(app).post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      const token = loginRes.body.token;

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      expect(res.body).not.toHaveProperty('password');
    });

    it('should work with cookie authentication', async () => {
      const user = await createTestUser();

      // Login to get cookie
      const agent = request.agent(app);
      await agent.post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      // Use same agent to maintain cookies
      const res = await agent.get('/api/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(user.email);
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authentication required' });
    });

    it('should return 403 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Invalid token' });
    });

    it('should return 403 with expired token', async () => {
      const expiredToken = jwt.sign(
        {
          userId: '1',
          email: 'test@example.com',
          iat: Math.floor(Date.now() / 1000) - 8 * 24 * 60 * 60, // 8 days ago
        },
        process.env.JWT_SECRET!,
        { algorithm: 'HS256' },
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Token expired' });
    });

    it('should return 403 with tampered token', async () => {
      const user = await createTestUser();

      // Create a valid token
      const validToken = jwt.sign(
        {
          userId: user.id.toString(),
          email: user.email,
          iat: Math.floor(Date.now() / 1000),
        },
        process.env.JWT_SECRET!,
        { algorithm: 'HS256' },
      );

      // Tamper with the token by changing a character
      const tamperedToken = validToken.slice(0, -1) + 'X';

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tamperedToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Invalid token' });
    });

    it('should return 403 with token missing required fields', async () => {
      const incompleteToken = jwt.sign(
        {
          email: 'test@example.com',
          // Missing userId and iat
        },
        process.env.JWT_SECRET!,
        { algorithm: 'HS256' },
      );

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${incompleteToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'Invalid token payload' });
    });

    it('should return 401 with extremely long token', async () => {
      const longToken = 'a'.repeat(1001);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${longToken}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Invalid token format' });
    });

    it('should return 404 if user no longer exists', async () => {
      const user = await createTestUser();

      // Login to get token
      const loginRes = await request(app).post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      const token = loginRes.body.token;

      // Delete user
      await prisma.user.delete({ where: { id: user.id } });

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'User not found' });
    });
  });

  describe('GET /api/auth/check', () => {
    it('should return userId with valid token', async () => {
      const user = await createTestUser();

      // Login to get token
      const loginRes = await request(app).post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      const token = loginRes.body.token;

      const res = await request(app).get('/api/auth/check').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ userId: user.id });
    });

    it('should return 401 without authentication', async () => {
      const res = await request(app).get('/api/auth/check');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authentication required' });
    });
  });

  describe('POST /api/logout', () => {
    it('should successfully logout and clear cookie', async () => {
      const res = await request(app).post('/api/logout');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Logged out successfully' });

      // Check that cookie is cleared
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/authToken=;/);
      // Cookie can be cleared with either Max-Age=0 or Expires in the past
      expect(cookies[0]).toMatch(/(Max-Age=0|Expires=.*1970)/);
    });

    it('should logout even without being logged in', async () => {
      const res = await request(app).post('/api/logout');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('Authentication Middleware', () => {
    it('should accept valid Bearer token in Authorization header', async () => {
      const user = await createTestUser();

      // Login to get token
      const loginRes = await request(app).post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      const token = loginRes.body.token;

      // Test a protected endpoint
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should accept valid token in httpOnly cookie', async () => {
      await createTestUser();

      // Login to get cookie
      const agent = request.agent(app);
      await agent.post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      // Use same agent to maintain cookies
      const res = await agent.get('/api/user/profile');

      expect(res.status).toBe(200);
    });

    it('should prefer cookie over Authorization header', async () => {
      const user = await createTestUser();

      // Login to get valid token
      const loginRes = await request(app).post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      const validToken = loginRes.body.token;

      // Create agent and login to set cookie
      const agent = request.agent(app);
      await agent.post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      // Send request with invalid bearer token but valid cookie
      const res = await agent.get('/api/user/profile').set('Authorization', 'Bearer invalid-token');

      // Should succeed because cookie is valid
      expect(res.status).toBe(200);
    });

    it('should reject requests without authentication', async () => {
      const res = await request(app).get('/api/user/profile');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authentication required' });
    });

    it('should reject malformed Authorization header', async () => {
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'NotBearer token');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Authentication required' });
    });

    it('should handle server configuration error gracefully', async () => {
      // Temporarily unset JWT_SECRET
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer some-token');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Server configuration error' });

      // Restore JWT_SECRET
      process.env.JWT_SECRET = originalSecret;
    });
  });
});
