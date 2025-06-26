/**
 * Express Application Factory
 * Creates and configures the Express application
 */

import express, { Express } from 'express';
import cors from 'cors';
import { PrismaClient } from '@teaching-engine/database';
import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiters } from '@/middleware/rateLimiter';
import { authRoutes } from '@/routes/auth';
import { userRoutes } from '@/routes/user';

export function createApp(prisma: PrismaClient): Express {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  app.use('/api/auth', rateLimiters.auth);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', authRoutes(prisma));
  app.use('/api/user', userRoutes(prisma));

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}

export async function createTestApp(prisma?: PrismaClient): Promise<Express> {
  // Use provided prisma or create a mock
  const testPrisma = prisma || new PrismaClient();
  
  const app = createApp(testPrisma);
  
  // Add test-specific middleware
  if (process.env.NODE_ENV === 'test') {
    app.use((req, res, next) => {
      // Mock authentication for testing
      if (req.headers.authorization === 'Bearer valid.jwt.token') {
        (req as express.Request & { user?: { userId: string } }).user = { userId: '123' };
      } else if (req.headers.authorization === 'Bearer admin.token') {
        (req as express.Request & { user?: { userId: string } }).user = { userId: '456' };
      }
      next();
    });
  }
  
  return app;
}