import request from 'supertest';
import { describe, beforeAll, beforeEach, it, expect } from '@jest/globals';
import { app } from '../../src/index';
import { getTestPrismaClient } from '../jest.setup';
import bcrypt from 'bcryptjs';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123',
};

describe('Authentication API', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeAll(async () => {
    prisma = getTestPrismaClient();
  });

  const createTestUser = async (email?: string) => {
    const testEmail = email || `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
    
    // Hash the password before creating the user
    const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);

    // Create the test user
    return await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: 'Test User',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });
  };

  describe('POST /api/login', () => {
    it('should log in with valid credentials', async () => {
      const testUser = await createTestUser();
      
      const res = await request(app).post('/api/login').send({
        email: testUser.email,
        password: TEST_USER.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
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
    it('should return user data with valid token', async () => {
      const testUser = await createTestUser();
      
      // Log in to get a token
      const loginRes = await request(app).post('/api/login').send({
        email: testUser.email,
        password: TEST_USER.password,
      });

      const authToken = loginRes.body.token;
      
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('email', testUser.email);
    });

    it('should return 401 without valid token', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
    });
  });
});
