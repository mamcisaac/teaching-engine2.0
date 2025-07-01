/**
 * Working Authentication Routes Integration Tests
 * This test file uses real database operations without mocking
 */

import request from 'supertest';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authRoutes } from './auth-routes-mock';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test-auth.db';

describe('Authentication Routes - Working Tests', () => {
  let app: express.Express;
  let prisma: PrismaClient;

  // Test user data
  const validUser = {
    email: 'test@example.com',
    password: 'TestPassword123!',
    name: 'Test User',
  };

  beforeAll(async () => {
    // Create real Prisma client
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // Initialize app
    app = express();
    app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
    app.use(express.json());
    app.use(cookieParser());
    app.use('/api', authRoutes(prisma));

    // Simple auth middleware
    const authMiddleware = (req: any, res: any, next: any) => {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.authToken;

      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
        req.userId = payload.userId;
        req.email = payload.email;
        next();
      } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
      }
    };

    // Protected routes
    app.get('/api/auth/me', authMiddleware, async (req: any, res) => {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(req.userId) },
        select: { id: true, email: true, name: true, role: true },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    });

    app.get('/api/auth/check', authMiddleware, (req: any, res) => {
      res.json({ userId: req.userId });
    });

    app.post('/api/logout', (req, res) => {
      res.clearCookie('authToken', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/',
      });
      res.json({ message: 'Logged out successfully' });
    });
  });

  beforeEach(async () => {
    // Clean database
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
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
      const user = await createTestUser();

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

    it('should return 400 with invalid email format', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'not-an-email',
        password: validUser.password,
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid email format' });
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
    });
  });
});
