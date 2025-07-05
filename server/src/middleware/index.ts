// Centralized middleware exports

// Core middleware modules
export * from './core/composer';
export * from './core/error';
export * from './core/logging';
export * from './core/security';
export * from './core/validation';

// Pre-composed middleware chains
export * from './chains';

// Existing middleware (for backward compatibility)
export { authenticate } from './authenticate';
export { rateLimiters } from './rateLimit';
export * from './cache';

// Auth subdirectory exports
export * from './auth';

// Rate limit subdirectory exports
export * from './rateLimit';

// Commonly used middleware combinations
export { middleware } from './chains';

// Re-export frequently used items
// Import from core modules
import { applySecurityMiddleware } from './core/security';
import { errorLoggingMiddleware, errorHandlerMiddleware, notFoundHandler } from './core/error';
import { AuditEventType } from './auditLogger';
import { rateLimiters as rateLimitersCore } from './rateLimit';

// Re-export for convenience
export { applySecurityMiddleware, errorLoggingMiddleware, errorHandlerMiddleware, notFoundHandler, AuditEventType, rateLimitersCore as rateLimitersInternal };

// Helper to apply middleware to Express app
import { Application, Request, Response } from 'express';
import { middleware } from './chains';

export const applyMiddleware = (app: Application): void => {
  // Apply security middleware
  applySecurityMiddleware(app);
  
  // Apply core middleware to all routes
  app.use(middleware.core);
  
  // Health check routes (before authentication)
  app.get('/health', middleware.health, (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });
  
  app.get('/api/health', middleware.health, (req: Request, res: Response) => {
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
  public: (rateLimitKey?: keyof typeof rateLimitersCore) => 
    middleware.custom({
      rateLimit: rateLimitKey || 'api',
    }),
  
  // Authenticated endpoints
  authenticated: (options?: {
    rateLimit?: keyof typeof rateLimitersCore;
    cache?: boolean;
    audit?: { event: AuditEventType; severity?: 'low' | 'medium' | 'high' | 'critical' };
  }) => 
    middleware.custom({
      authenticate: true,
      rateLimit: options?.rateLimit || 'api',
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