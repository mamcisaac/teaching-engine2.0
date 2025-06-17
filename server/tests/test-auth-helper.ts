import request from 'supertest';
import type { Application } from 'express';
import bcrypt from 'bcryptjs';
import { getTestPrismaClient } from './jest.setup';

/**
 * Helper to create a test user and get authentication token
 */
export async function getAuthToken(app: Application): Promise<string> {
  const prisma = getTestPrismaClient();

  // Create a test user with hashed password
  const hashedPassword = await bcrypt.hash('testpassword', 10);
  await prisma.user.create({
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

  return loginResponse.body.token;
}

/**
 * Helper to make authenticated requests
 */
export function authRequest(app: Application) {
  let token: string;

  return {
    async setup(): Promise<void> {
      token = await getAuthToken(app);
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
