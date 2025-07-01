/**
 * Test Application Setup for Integration Tests
 *
 * This provides a clean Express app instance for integration tests without
 * the import.meta.url issues from the main index.ts file
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRoutes } from './auth-routes-mock';
import { userRoutes } from '../../src/routes/users';
import { validationMiddleware } from '../../src/middleware/validation';
import { errorHandler } from '../../src/middleware/errorHandler';
import { getIntegrationTestPrismaClient } from '../integration-test-setup';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Create Express app
export const app = express();

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

// Get test database client
const prisma = getIntegrationTestPrismaClient();

// Custom auth middleware for tests
function authMiddleware(prismaClient: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check for token in Authorization header
    let token = req.headers.authorization?.replace('Bearer ', '');

    // If no Authorization header, check cookie
    if (!token && req.cookies?.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Handle long tokens
    if (token.length > 1000) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ error: 'Server configuration error' });
      }

      const payload = jwt.verify(token, secret) as any;

      // Validate payload structure
      if (!payload.userId || !payload.iat) {
        return res.status(403).json({ error: 'Invalid token payload' });
      }

      // Set user info on request
      (req as any).userId = payload.userId;
      (req as any).email = payload.email;

      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return res.status(403).json({ error: 'Token expired' });
      }
      return res.status(403).json({ error: 'Invalid token' });
    }
  };
}

// Auth routes (no authentication required)
app.use('/api', authRoutes(prisma));

// Protected routes
app.use('/api/auth', authMiddleware(prisma));
app.get('/api/auth/me', async (req, res) => {
  const userId = (req as any).userId;
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      preferredLanguage: true,
    },
  });

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json(user);
});

app.get('/api/auth/check', authMiddleware(prisma), (req, res) => {
  res.json({ userId: (req as any).userId });
});

// User routes
app.use('/api/user', authMiddleware(prisma), userRoutes(prisma));

// Logout route
app.post('/api/logout', (req, res) => {
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out successfully' });
});

// Error handling
app.use(errorHandler);
