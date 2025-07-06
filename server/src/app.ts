/**
 * Express Application Factory
 * Creates and configures the Express application
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@teaching-engine/database';

import { errorHandler } from './middleware/errorHandler';
import authEndpoints from './routes/authEndpoints';
import { userRoutes } from './routes/user';

export function createApp(prisma: PrismaClient): Express {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

export async function createTestApp(prisma?: PrismaClient): Promise<Express> {
  // Use provided prisma or create a mock
  const testPrisma = prisma || new PrismaClient();

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
