/**
 * Express Application Factory
 * Creates and configures the Express application
 */

import { PrismaClient } from '@teaching-engine/database';
import cors from 'cors';
import type { Express, Request, Response, NextFunction } from 'express';
import express from 'express';

import { errorHandler } from './middleware/errorHandler';
import { router as authEndpoints } from './routes/authEndpoints';
import { userRoutes } from './routes/user';

export function createApp(prisma: PrismaClient): Express {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
      credentials: true,
    }),
  );
  // JSON and URL-encoded parsing is now handled in index.ts to avoid conflicts
  // app.use(json());
  // app.use(urlencoded({ extended: true }));

  // Rate limiting is applied at route level, not here

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', authEndpoints);
  app.use('/api/user', userRoutes(prisma));

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}

export function createTestApp(prisma?: PrismaClient): Express {
  // Use provided prisma or create a mock
  const testPrisma = prisma ?? new PrismaClient();

  const app = createApp(testPrisma);

  // Add test-specific middleware
  if (process.env.NODE_ENV === 'test') {
    app.use((req: Request, _res: Response, next: NextFunction) => {
      // Mock authentication for testing
      if (req.headers.authorization === 'Bearer valid.jwt.token') {
        req.user = {
          id: 123,
          email: 'test@example.com',
          role: 'teacher',
        };
      } else if (req.headers.authorization === 'Bearer admin.token') {
        req.user = {
          id: 456,
          email: 'admin@example.com',
          role: 'admin',
        };
      }
      next();
    });
  }

  return app;
}
