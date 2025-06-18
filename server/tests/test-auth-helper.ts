import request from 'supertest';
import type { Application } from 'express';
import bcrypt from 'bcryptjs';
import { getTestPrismaClient } from './jest.setup.js';

/**
 * Helper to create a test user and get authentication token
 */
export async function getAuthToken(app: Application): Promise<{ token: string; userId: number }> {
  const prisma = getTestPrismaClient();

  // First check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
  });

  if (existingUser) {
    // If user exists, just return login
    const loginResponse = await request(app).post('/api/login').send({
      email: 'test@example.com',
      password: 'testpassword',
    });

    if (loginResponse.status !== 200) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.text}`);
    }

    return { token: loginResponse.body.token, userId: existingUser.id };
  }

  // Create a test user with hashed password
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'teacher',
    },
  });

  // Login to get token
  const loginResponse = await request(app).post('/api/login').send({
    email: 'test@example.com',
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
