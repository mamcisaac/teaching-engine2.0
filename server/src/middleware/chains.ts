import type { Request, Response, NextFunction, RequestHandler } from 'express';

import { logger } from '../logger';

type Middleware = RequestHandler;

import { authenticate } from './authenticate';
import { apiCache, curriculumCache, staticCache, userCache } from './cache';
import { compose, chain, conditional, timed } from './core/composer';
import { errorLoggingMiddleware, errorHandlerMiddleware, notFoundHandler } from './core/error';
import {
  requestLoggingMiddleware,
  auditMiddleware,
  AuditEventType,
  performanceLoggingMiddleware,
  developmentLoggingMiddleware,
} from './core/logging';
import {
  inputSanitizationMiddleware,
  xssProtectionMiddleware,
  sqlInjectionProtectionMiddleware,
  fileUploadSecurityMiddleware,
  securityMonitoringMiddleware,
} from './core/security';
import { rateLimiters } from './rateLimit';
// Environment checks
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Core middleware chain - applied to all requests
export const coreMiddleware = chain()
  .add(timed('requestLogging', requestLoggingMiddleware))
  .add(securityMonitoringMiddleware)
  .addIf(isDevelopment, developmentLoggingMiddleware)
  .add(inputSanitizationMiddleware)
  .add(xssProtectionMiddleware)
  .addIf(isProduction, sqlInjectionProtectionMiddleware)
  .build();

// API middleware chain - for all API routes
export const apiMiddleware = compose(
  coreMiddleware,
  rateLimiters.api as unknown as any,
  performanceLoggingMiddleware,
);

// Authenticated API chain
export const authenticatedApiMiddleware = compose(apiMiddleware, authenticate);

// Public API chain (no auth required)
export const publicApiMiddleware = compose(
  apiMiddleware,
  conditional(isProduction, rateLimiters.auth as unknown as any),
);

// Write operation chain (POST, PUT, DELETE)
export const writeOperationMiddleware = compose(
  authenticatedApiMiddleware,
  rateLimiters.write as unknown as any,
  auditMiddleware(AuditEventType.PLAN_MODIFICATION, { severity: 'medium' }),
);

// Read operation chain (GET)
export const readOperationMiddleware = compose(
  authenticatedApiMiddleware,
  rateLimiters.read as unknown as any,
  conditional((req): boolean => req.path.includes('/api/curriculum'), curriculumCache),
);

// File upload chain
export const fileUploadMiddleware = (allowedTypes?: string[]) =>
  compose(
    authenticatedApiMiddleware,
    rateLimiters.upload as unknown as any,
    fileUploadSecurityMiddleware(allowedTypes),
    auditMiddleware(AuditEventType.DATA_IMPORT, {
      severity: 'high',
      targetResource: 'file_upload',
    }),
  );

// Auth endpoint chain
export const authEndpointMiddleware = compose(
  coreMiddleware,
  rateLimiters.auth as unknown as any,
  auditMiddleware(AuditEventType.LOGIN_SUCCESS, { severity: 'high' }),
);

// Admin operation chain
export const adminOperationMiddleware = compose(
  authenticatedApiMiddleware,
  (req: Request, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  },
  auditMiddleware(AuditEventType.SYSTEM_CONFIG_CHANGE, { severity: 'critical' }),
);

// Cached read chain
export const cachedReadMiddleware = (
  cacheType: 'api' | 'curriculum' | 'static' | 'user' = 'api',
) => {
  const cacheMiddleware = {
    api: apiCache,
    curriculum: curriculumCache,
    static: staticCache,
    user: userCache,
  }[cacheType];

  return compose(readOperationMiddleware, cacheMiddleware);
};

// Error handling chain - should be last
export const errorHandlingMiddleware = compose(errorLoggingMiddleware, errorHandlerMiddleware);

// Specific feature chains
export const planningOperationsMiddleware = compose(
  authenticatedApiMiddleware,
  rateLimiters.write as unknown as any,
  userCache,
  auditMiddleware(AuditEventType.PLAN_CREATION, {
    severity: 'low',
    targetResource: 'planning',
  }),
);

export const aiOperationsMiddleware = compose(
  authenticatedApiMiddleware,
  rateLimiters.ai as unknown as any,
  performanceLoggingMiddleware,
  auditMiddleware(AuditEventType.AI_GENERATION, {
    severity: 'medium',
    targetResource: 'ai_generation',
  }),
);

export const exportOperationsMiddleware = compose(
  authenticatedApiMiddleware,
  rateLimiters.read as unknown as any,
  auditMiddleware(AuditEventType.DATA_EXPORT, {
    severity: 'high',
    targetResource: 'data_export',
  }),
);

// Development-only chains
export const developmentMiddleware = conditional(
  isDevelopment,
  compose((_req: Request, _res: Response, next: NextFunction) => {
    logger.info(`[DEV] ${_req.method} ${_req.path}`);
    next();
  }, performanceLoggingMiddleware),
);

// Health check chain (minimal processing)
export const healthCheckMiddleware = compose(
  rateLimiters.public as unknown as any,
  (_req: Request, res: Response, next: NextFunction) => {
    res.locals.skipLogging = true;
    next();
  },
);

// Helper to create custom chains
export const createCustomChain = (options: {
  authenticate?: boolean;
  rateLimit?: keyof typeof rateLimiters;
  cache?: boolean;
  audit?: {
    event: AuditEventType;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    resource?: string;
  };
  validators?: ((req: Request, res: Response, next: NextFunction) => void)[];
}) => {
  const chainBuilder = chain().add(coreMiddleware);

  if (options.rateLimit) {
    chainBuilder.add(rateLimiters[options.rateLimit] as unknown as Middleware);
  }

  if (options.authenticate) {
    chainBuilder.add(authenticate);
  }

  if (options.cache) {
    chainBuilder.add(apiCache);
  }

  if (options.audit) {
    chainBuilder.add(
      auditMiddleware(options.audit.event, {
        severity: options.audit.severity,
        targetResource: options.audit.resource,
      }),
    );
  }

  if (options.validators) {
    options.validators.forEach((validator) => chainBuilder.add(validator));
  }

  return chainBuilder.build();
};

// Export commonly used combinations
export const middleware = {
  // Core chains
  core: coreMiddleware,
  api: apiMiddleware,
  authenticated: authenticatedApiMiddleware,
  public: publicApiMiddleware,

  // Operation chains
  read: readOperationMiddleware,
  write: writeOperationMiddleware,
  upload: fileUploadMiddleware,

  // Feature chains
  auth: authEndpointMiddleware,
  admin: adminOperationMiddleware,
  planning: planningOperationsMiddleware,
  ai: aiOperationsMiddleware,
  export: exportOperationsMiddleware,

  // Utility chains
  cached: cachedReadMiddleware,
  health: healthCheckMiddleware,
  development: developmentMiddleware,

  // Error handling (use last)
  errorHandling: errorHandlingMiddleware,
  notFound: notFoundHandler,

  // Chain builder
  custom: createCustomChain,
};
