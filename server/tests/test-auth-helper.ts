import request from 'supertest';
import type { Application } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getTestPrismaClient } from './jest.setup.js';

/**
 * Helper to create a test user and get authentication token
 */
export async function getAuthToken(
  app: Application,
  email?: string,
): Promise<{ token: string; userId: number }> {
  const prisma = getTestPrismaClient();

  // Generate unique email if not provided
  const userEmail =
    email || `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

  // Create a test user with hashed password
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  const user = await prisma.user.create({
    data: {
      email: userEmail,
      name: 'Test User',
      password: hashedPassword,
      role: 'teacher',
    },
  });

  // Login to get token
  const loginResponse = await request(app).post('/api/login').send({
    email: userEmail,
    password: 'testpassword',
  });

  if (loginResponse.status !== 200) {
    throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.text}`);
  }

  return { token: loginResponse.body.token, userId: user.id };
}

/**
 * Helper to make authenticated requests
 */
export function authRequest(app: Application) {
  let token: string | null = null;
  let userId: number | null = null;

  return {
    async setup(): Promise<void> {
      const authData = await getAuthToken(app);
      token = authData.token;
      userId = authData.userId;
    },
    get userId() {
      return userId;
    },
    get(url: string) {
      return request(app).get(url).set('Authorization', `Bearer ${token}`);
    },
    post(url: string) {
      return request(app).post(url).set('Authorization', `Bearer ${token}`);
    },
    put(url: string) {
      return request(app).put(url).set('Authorization', `Bearer ${token}`);
    },
    delete(url: string) {
      return request(app).delete(url).set('Authorization', `Bearer ${token}`);
    },
    patch(url: string) {
      return request(app).patch(url).set('Authorization', `Bearer ${token}`);
    },
  };
}

/**
 * Create a test user without going through HTTP
 */
export async function createTestUser(email?: string) {
  const prisma = getTestPrismaClient();

  // Generate unique email if not provided
  const userEmail =
    email || `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;

  const hashedPassword = await bcrypt.hash('testpassword', 10);
  return await prisma.user.create({
    data: {
      email: userEmail,
      name: 'Test User',
      password: hashedPassword,
      role: 'teacher',
    },
  });
}

/**
 * Create an auth token for a user ID
 */
export function createAuthToken(userId: number, email: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required for testing');
  }
  return jwt.sign({ userId: userId.toString(), email }, secret, { expiresIn: '24h' });
}
