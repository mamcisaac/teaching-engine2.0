/**
 * Simple Test Application for Integration Tests
 * Avoids import.meta.url and complex initialization issues
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

// Create Express app
export function createTestApp(prismaClient: any) {
  const app = express();

  // Basic middleware
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Auth routes
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const { email, password, name, role = 'teacher' } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }

      // Check if user exists
      const existingUser = await prismaClient.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prismaClient.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
        },
      });

      // Generate token
      const token = jwt.sign(
        { userId: user.id.toString(), email: user.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' },
      );

      // Set cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await prismaClient.user.findUnique({
        where: { email },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id.toString(), email: user.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' },
      );

      // Set cookie
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Auth middleware
  const authMiddleware = (req: Request, res: Response, next: any) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'test-secret') as any;
      (req as any).userId = payload.userId;
      (req as any).email = payload.email;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };

  // Protected routes
  app.get('/api/auth/me', authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const user = await prismaClient.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error: any) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Logout route
  app.post('/api/logout', (req: Request, res: Response) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logged out successfully' });
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
