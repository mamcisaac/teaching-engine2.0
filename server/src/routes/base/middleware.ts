/**
 * Shared middleware for routes
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { ParsedQs } from 'qs';
import logger from '../../logger';
import { formatValidationError } from './validation.js';

export interface AuthenticatedRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
    role: string;
    name?: string;
    organizationId?: number;
    permissions?: string[];
  };
}

/**
 * Authentication middleware
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.userId = userId;
  next();
};

/**
 * Optional authentication middleware
 */
export const optionalAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void => {
  const userId = req.user?.id;
  if (userId) {
    req.userId = userId;
  }
  next();
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;
    if (!userRole || userRole !== requiredRole) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }
    next();
  };
};

/**
 * Validation middleware factory
 */
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (_error) {
      if (_error instanceof z.ZodError) {
        const formattedError = formatValidationError(_error);
        res.status(400).json(formattedError);
      } else {
        logger.error({ error: _error }, 'Validation error');
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
};

/**
 * Query parameter validation middleware
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validatedQuery = schema.parse(req.query);
      req.query = validatedQuery;
      next();
    } catch (_error) {
      if (_error instanceof z.ZodError) {
        const formattedError = formatValidationError(_error);
        res.status(400).json(formattedError);
      } else {
        logger.error({ error: _error }, 'Query validation error');
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
};

/**
 * Async error handler wrapper
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Request logging middleware
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (body) {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      },
      'Request completed',
    );
    return originalSend.call(this, body);
  };

  next();
};

/**
 * Rate limiting middleware factory
 */
export const createRateLimit = (options: { windowMs: number; max: number; message?: string }) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Clean up old entries
    for (const [ip, data] of requests.entries()) {
      if (data.resetTime < windowStart) {
        requests.delete(ip);
      }
    }

    // Get or create entry for this IP
    let entry = requests.get(key);
    if (!entry || entry.resetTime < windowStart) {
      entry = { count: 0, resetTime: now + options.windowMs };
      requests.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= options.max) {
      res.status(429).json({
        error: options.message || 'Too many requests',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
      return;
    }

    // Increment count
    entry.count++;
    next();
  };
};

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitizeValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      // Remove HTML tags, including content within script tags, and normalize whitespace
      return value
        .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags and their content
        .replace(/<[^>]*>/g, '') // Remove all other HTML tags
        .trim()
        .replace(/\s+/g, ' ');
    }
    if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    }
    if (value && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    req.query = sanitizeValue(req.query) as ParsedQs;
  }

  next();
};

/**
 * Error handling middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
    },
    'Route error',
  );

  // Handle specific error types
  if (err instanceof z.ZodError) {
    const formattedError = formatValidationError(err);
    res.status(400).json(formattedError);
    return;
  }

  // Handle Prisma errors
  if (err.message.includes('Unique constraint')) {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  if (err.message.includes('Foreign key constraint')) {
    res.status(400).json({ error: 'Invalid reference to related resource' });
    return;
  }

  // Default error response
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      details: err.message,
      stack: err.stack,
    }),
  });
};

/**
 * CORS middleware for specific origins
 */
export const corsMiddleware = (allowedOrigins: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  };
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};
