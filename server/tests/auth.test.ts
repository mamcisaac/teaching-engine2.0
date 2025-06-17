import request from 'supertest';
import { describe, beforeEach, it, expect } from '@jest/globals';
import { app } from '../src/index';
import { getTestPrismaClient } from './jest.setup';
import bcrypt from 'bcryptjs';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123',
};

describe('Authentication API', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(async () => {
    prisma = getTestPrismaClient();

    // Hash the password before creating the user
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);

    // Ensure the test user exists
    await prisma.user.upsert({
      where: { email: TEST_USER.email },
      update: {},
      create: {
        email: TEST_USER.email,
        password: hashedPassword,
        name: 'Test User',
        role: 'teacher',
      },
    });
  });

  describe('POST /api/login', () => {
    it('should log in with valid credentials', async () => {
      const res = await request(app).post('/api/login').send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(TEST_USER.email);
    });

    it('should return 401 with invalid credentials', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeEach(async () => {
      // Log in to get a token
      const res = await request(app).post('/api/login').send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      authToken = res.body.token;
    });

    it('should return user data with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', TEST_USER.email);
    });

    it('should return 401 without valid token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });
});
