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
export {
  // Composers
  compose,
  chain,
  conditional,
  parallel,
  withTimeout,
  asyncMiddleware,
  
  // Error handling
  errorHandlerMiddleware,
  errorLoggingMiddleware,
  notFoundHandler,
  catchAsync,
  
  // Logging
  requestLoggingMiddleware,
  auditMiddleware,
  AuditEventType,
  auditLog,
  
  // Security
  applySecurityMiddleware,
  inputSanitizationMiddleware,
  xssProtectionMiddleware,
  fileUploadSecurityMiddleware,
  
  // Validation
  validate,
  validateBody,
  validateQuery,
  validateParams,
  commonValidators,
  ValidatedRequest,
} from './core/index';

// Helper to apply middleware to Express app
import { Application } from 'express';
import { middleware } from './chains';

export const applyMiddleware = (app: Application): void => {
  // Apply security middleware
  applySecurityMiddleware(app);
  
  // Apply core middleware to all routes
  app.use(middleware.core);
  
  // Health check routes (before authentication)
  app.get('/health', middleware.health, (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  app.get('/api/health', middleware.health, (req, res) => {
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
      rateLimit: rateLimitKey || 'api',
    }),
  
  // Authenticated endpoints
  authenticated: (options?: {
    rateLimit?: keyof typeof rateLimiters;
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
      rateLimit: 'strict',
      audit: {
        event: AuditEventType.CONFIG_CHANGE,
        severity: 'critical',
        resource: auditResource,
      },
    }),
};