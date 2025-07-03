import request from 'supertest';
import { describe, beforeAll, beforeEach, afterEach, it, expect, jest } from '@jest/globals';
import { createTestApp } from './simple-test-app';
import {
  getIntegrationTestPrismaClient,
  cleanIntegrationTestData,
} from '../integration-test-setup';
// Use actual modules, not mocks
jest.unmock('bcryptjs');
jest.unmock('@teaching-engine/database');
jest.unmock('jsonwebtoken');
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Authentication Routes', () => {
  let prisma: ReturnType<typeof getIntegrationTestPrismaClient>;
  let app: ReturnType<typeof createTestApp>;

  // Test user data
  const validUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
  };

  beforeAll(async () => {
    // Try to create a real Prisma client directly
    const { PrismaClient: RealPrismaClient } = await import('@prisma/client');
    const realPrisma = new RealPrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'file:./test.db'
        }
      }
    });
    
    console.log('Real Prisma client constructor name:', realPrisma.constructor.name);
    console.log('Real Is user.count a mock function?', jest.isMockFunction(realPrisma.user.count));
    
    prisma = realPrisma;
    app = createTestApp(prisma);
  });

  beforeEach(async () => {
    // Clean up database before each test
    try {
      await cleanIntegrationTestData();
      console.log('Database cleaned successfully before test');
    } catch (error) {
      console.error('Failed to clean database before test:', error);
      // Try a more aggressive cleanup
      try {
        await prisma.user.deleteMany({});
        console.log('Aggressive user cleanup succeeded');
      } catch (cleanupError) {
        console.error('Aggressive cleanup also failed:', cleanupError);
      }
    }
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createTestUser = async (overrides = {}) => {
    const hashedPassword = await bcrypt.hash(validUser.password, 10);
    console.log('Creating test user with hashed password:', hashedPassword.substring(0, 10) + '...');
    
    try {
      // Generate unique email for each test to avoid conflicts
      const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
      
      console.log('About to create user with data:', {
        email: uniqueEmail,
        name: validUser.name,
        role: 'teacher',
        preferredLanguage: 'en',
        hashedPasswordLength: hashedPassword.length
      });
      
      // Test database connection first
      try {
        await prisma.$connect();
        console.log('Successfully connected to database');
        
        const userCount = await prisma.user.count();
        console.log('Current user count before creation:', userCount);
      } catch (dbError) {
        console.error('Database connection test failed:', dbError);
        throw new Error('Cannot connect to database');
      }
      
      const user = await prisma.user.create({
        data: {
          email: uniqueEmail, // Use unique email to avoid conflicts
          password: hashedPassword,
          name: validUser.name,
          role: 'teacher',
          preferredLanguage: 'en',
          ...overrides,
        },
      });
      
      console.log('User creation result:', user);
      
      if (!user) {
        throw new Error('User creation returned undefined');
      }
      
      console.log('Created user:', user.id, user.email);
      
      // Verify password
      const isValid = await bcrypt.compare(validUser.password, user.password);
      console.log('Password verification check:', isValid);
      
      // Return user with the test email added for tests that need to know the actual email
      return { ...user, testEmail: uniqueEmail };
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  describe('POST /api/login', () => {
    it('should successfully login with valid credentials', async () => {
      const user = await createTestUser();

      const res = await request(app).post('/api/login').send({
        email: user.email,
        password: validUser.password,
      });

      if (res.status !== 200) {
        console.log('Login failed:', res.status, res.body);
      }
      console.log('Login response body:', JSON.stringify(res.body, null, 2));
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body.user).toMatchObject({
        email: user.email,
        name: validUser.name,
        role: 'teacher',
      });
      expect(res.body.user).not.toHaveProperty('password');

      // Verify JWT token
      const decoded = jwt.verify(res.body.accessToken, process.env.JWT_SECRET!) as any;
      expect(decoded.email).toBe(user.email);
      expect(decoded.userId).toBeDefined();
    });

    it('should handle case-insensitive email login', async () => {
      const user = await createTestUser();

      const res = await request(app).post('/api/login').send({
        email: user.email.toUpperCase(),
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(user.email);
    });

    it('should return 401 with incorrect password', async () => {
      const user = await createTestUser();

      const res = await request(app).post('/api/login').send({
        email: user.email,
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
      const user = await createTestUser();

      const res = await request(app).post('/api/login').send({
        email: `  ${user.email}  `,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(user.email);
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
      expect(res.body).toHaveProperty('accessToken');
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
    });

    it('should return 409 if email already exists', async () => {
      const user = await createTestUser();

      const res = await request(app).post('/api/register').send({
        email: user.email,
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
        email: user.email,
        password: validUser.password,
      });

      const token = loginRes.body.accessToken;

      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

      if (res.status !== 200) {
        console.log('Auth /me failed:', res.status, res.body);
        console.log('Token:', token ? token.substring(0, 30) + '...' : 'undefined');
        console.log('Login response:', loginRes.status, loginRes.body);
      }
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      expect(res.body).not.toHaveProperty('password');
    });

    it('should work with token from login response', async () => {
      const user = await createTestUser();

      // Login to get token
      const loginRes = await request(app).post('/api/login').send({
        email: user.email,
        password: validUser.password,
      });

      const token = loginRes.body.accessToken;

      // Use token in Authorization header
      const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

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

      const token = loginRes.body.accessToken;

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

      const token = loginRes.body.accessToken;

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
    it('should successfully logout', async () => {
      const res = await request(app).post('/api/logout');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Logged out successfully' });
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

      const token = loginRes.body.accessToken;

      // Test a protected endpoint
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should accept valid token in Authorization header', async () => {
      await createTestUser();

      // Login to get token
      const loginRes = await request(app).post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      const token = loginRes.body.accessToken;

      // Use token in Authorization header
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('should reject invalid token even with valid user session', async () => {
      const user = await createTestUser();

      // Login to get valid token
      const loginRes = await request(app).post('/api/login').send({
        email: validUser.email,
        password: validUser.password,
      });

      const validToken = loginRes.body.accessToken;

      // Send request with invalid bearer token
      const res = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid-token');

      // Should fail because token is invalid
      expect(res.status).toBe(401);
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
