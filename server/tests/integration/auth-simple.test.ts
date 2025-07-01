/**
 * Simple Authentication Integration Test
 * Direct test without complex setup
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { PrismaClient as TeachingEnginePrismaClient } from '@teaching-engine/database';

// Set up environment
process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'file:../packages/database/test-auth-integration.db';

// Create Prisma client
const prisma = new TeachingEnginePrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Create Express app
const app = express();
app.use(express.json());
app.use(cookieParser());

// Simple login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id.toString(), email: user.email },
      process.env.JWT_SECRET!,
    );

    const { password: _, ...userWithoutPassword } = user;

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple register route
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
        preferredLanguage: 'en',
      },
    });

    const token = jwt.sign(
      { userId: user.id.toString(), email: user.email },
      process.env.JWT_SECRET!,
    );

    const { password: _, ...userWithoutPassword } = user;

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware
function authMiddleware(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Protected route
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

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully' });
});

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Connect to the database
    await prisma.$connect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({});
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
        role: 'USER',
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
        role: 'USER',
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
      role: 'USER',
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
