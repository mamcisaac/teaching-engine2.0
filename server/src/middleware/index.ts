// Centralized middleware exports

// Import dependencies first
import type { Application, Request, Response } from 'express';

// Core middleware modules
export * from './core/composer';
export * from './core/error';
export {
  requestLoggingMiddleware,
  auditLog,
  auditMiddleware,
  performanceLoggingMiddleware,
  developmentLoggingMiddleware,
  type AuditEvent
} from './core/logging';
export * from './core/security';
export * from './core/validation';

// Pre-composed middleware chains
export * from './chains';

// Existing middleware (for backward compatibility)
export { authenticate } from './authenticate';
export * from './cache';

// Auth subdirectory exports - but not authenticate which is exported above
export * from './auth/jwt';
export {
  ForbiddenError,
  authorize,
  optionalAuthenticate,
  requireOrganization
} from './auth/middleware';
export * from './auth/password';
// Note: session.ts doesn't exist, removed export
export * from './auth/strategies';
export * from './auth/types';

// Rate limit subdirectory exports
export * from './rateLimit';

// Import and re-export AuditEventType only once
import { AuditEventType } from './auditLogger';
import { middleware } from './chains';
import { errorLoggingMiddleware, errorHandlerMiddleware, notFoundHandler } from './core/error';
import { applySecurityMiddleware } from './core/security';
import type { rateLimiters } from './rateLimit';

export { AuditEventType };

export const applyMiddleware = (app: Application): void => {
  // Apply security middleware
  applySecurityMiddleware(app);

  // Apply core middleware to all routes
  app.use(middleware.core);

  // Health check routes (before authentication)
  app.get('/health', middleware.health, (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/api/health', middleware.health, (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
};

// Export middleware groups for easy access
export const middlewareGroups = {
  // Basic groups
  public: middleware.public,
  authenticated: middleware.authenticated,
  admin: middleware.admin,

  // Operation groups
  read: middleware.read,
  write: middleware.write,
  upload: middleware.upload,

  // Feature groups
  planning: middleware.planning,
  ai: middleware.ai,

  // Caching groups
  cached: {
    api: middleware.cached('api'),
    curriculum: middleware.cached('curriculum'),
    static: middleware.cached('static'),
    user: middleware.cached('user'),
  },

  // Error handling (always use last)
  errors: {
    logging: errorLoggingMiddleware,
    handler: errorHandlerMiddleware,
    notFound: notFoundHandler,
  },
};

// Quick middleware setup for routes
export const setup = {
  // Public endpoints
  public: (rateLimitKey?: keyof typeof rateLimiters) =>
    middleware.custom({
      rateLimit: rateLimitKey ?? 'api',
    }),

  // Authenticated endpoints
  authenticated: (options?: {
    rateLimit?: keyof typeof rateLimiters;
    cache?: boolean;
    audit?: { event: AuditEventType; severity?: 'low' | 'medium' | 'high' | 'critical' };
  }) =>
    middleware.custom({
      authenticate: true,
      rateLimit: options?.rateLimit ?? 'api',
      cache: options?.cache,
      audit: options?.audit,
    }),

  // Admin endpoints
  admin: (auditResource?: string) =>
    middleware.custom({
      authenticate: true,
      rateLimit: 'auth',
      audit: {
        event: AuditEventType.SYSTEM_CONFIG_CHANGE,
        severity: 'critical',
        resource: auditResource,
      },
    }),
};
