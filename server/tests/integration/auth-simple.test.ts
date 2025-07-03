/**
 * Simple Authentication Integration Test
 * Using integration test setup
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createTestApp } from './simple-test-app';
import {
  getIntegrationTestPrismaClient,
  cleanIntegrationTestData,
} from '../integration-test-setup';

// Set up environment
process.env.JWT_SECRET = 'test-secret-key';

let prisma: any;
let app: any;

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Initialize test database and app
    prisma = getIntegrationTestPrismaClient();
    app = createTestApp(prisma);
  });

  beforeEach(async () => {
    await cleanIntegrationTestData();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register a new user', async () => {
    const res = await request(app).post('/api/register').send({
      email: 'test@example.com',
      password: 'TestPassword123!',
      name: 'Test User',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.user.name).toBe('Test User');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('should login with valid credentials', async () => {
    // First create a user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });

    const res = await request(app).post('/api/login').send({
      email: 'test@example.com',
      password: 'TestPassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('test@example.com');

    // Verify JWT
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET!) as any;
    expect(decoded.email).toBe('test@example.com');

    // Check cookie
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/authToken=/);
    expect(cookies[0]).toMatch(/HttpOnly/);
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'nonexistent@example.com',
      password: 'WrongPassword',
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid credentials' });
  });

  it('should get user info with valid token', async () => {
    // Create user and login
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        role: 'teacher',
        preferredLanguage: 'en',
      },
    });

    const loginRes = await request(app).post('/api/login').send({
      email: 'test@example.com',
      password: 'TestPassword123!',
    });

    const token = loginRes.body.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: user.id,
      email: 'test@example.com',
      name: 'Test User',
      role: 'teacher',
    });
  });

  it('should reject requests without authentication', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Authentication required' });
  });

  it('should logout successfully', async () => {
    const res = await request(app).post('/api/logout');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logged out successfully' });

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toMatch(/authToken=;/);
  });
});
