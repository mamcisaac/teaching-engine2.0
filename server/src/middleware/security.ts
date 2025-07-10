import * as cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import Redis from 'ioredis';
import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';

import logger from '../logger.js';

// Security configuration
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',');
const UPLOAD_SIZE_LIMIT = parseInt(process.env.UPLOAD_SIZE_LIMIT ?? '10485760'); // 10MB default
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

/**
 * Configure CORS with strict settings
 */
export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

/**
 * Configure security headers with Helmet
 */
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts for development
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", ...ALLOWED_ORIGINS],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      workerSrc: ["'self'", 'blob:'],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

/**
 * Create rate limiter instance
 */
// @ts-expect-error TS6133
function _createRateLimiter() {
  // Use Redis in production for distributed rate limiting
  if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    const redis = new Redis(process.env.REDIS_URL);
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'rl:',
      points: 100, // Number of requests
      duration: 900, // Per 15 minutes
      blockDuration: 900, // Block for 15 minutes
    });
  }

  // Use memory storage for development/testing
  return new RateLimiterMemory({
    points: process.env.NODE_ENV === 'test' ? 10000 : 100, // Higher limit for tests
    duration: 900, // Per 15 minutes
    blockDuration: process.env.NODE_ENV === 'test' ? 0 : 900, // No blocking in tests
  });
}

// Rate limiter instances - kept for future use
// const _generalLimiter = _createRateLimiter();
// const _authLimiter = new RateLimiterMemory({
//   points: process.env.NODE_ENV === 'test' ? 20 : 5, // Higher limit for tests to allow multiple test registrations
//   duration: process.env.NODE_ENV === 'test' ? 5 : 900, // 5 seconds for tests, 15 minutes for production
//   blockDuration: process.env.NODE_ENV === 'test' ? 1 : 1800, // 1 second for tests, 30 minutes for production
// });

/**
 * General rate limiting middleware
 */
export async function rateLimitMiddleware(_req: Request, _res: Response, next: NextFunction) {
  // SINGLE USER APP - Skip all rate limiting
  next();
}

/**
 * Strict rate limiting for authentication endpoints
 */
export async function authRateLimitMiddleware(_req: Request, _res: Response, next: NextFunction) {
  // SINGLE USER APP - Skip all rate limiting
  next();
}

/**
 * File upload validation middleware
 */
export function validateFileUpload(allowedTypes: string[] = ALLOWED_FILE_TYPES) {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    if (!req.file && !req.files) {
      next(); 
      return;
    }

    const files = req.file ? [req.file] : Object.values(req.files || {}).flat();

    for (const file of files as Express.Multer.File[]) {
      // Check file size
      if (file.size > UPLOAD_SIZE_LIMIT) {
        return res.status(400).json({
          error: 'File Too Large',
          message: `File size exceeds maximum allowed size of ${UPLOAD_SIZE_LIMIT / 1024 / 1024}MB`,
        });
      }

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Invalid File Type',
          message: `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        });
      }

      // Additional security checks
      if (
        file.originalname.includes('..') ||
        file.originalname.includes('/') ||
        file.originalname.includes('\\')
      ) {
        return res.status(400).json({
          error: 'Invalid Filename',
          message: 'Filename contains invalid characters',
        });
      }
    }

    next();
  };
}

/**
 * Security headers middleware for enhanced protection
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  // Set additional security headers not covered by Helmet
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  // Set secure cookie policy
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Set-Cookie', 'SameSite=Strict; Secure; HttpOnly');
  }

  next();
}

/**
 * Input sanitization middleware
 */
export function sanitizeInput(req: Request, _res: Response, next: NextFunction) {
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }

  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }

  next();
}

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (typeof obj[key] === 'string') {
        // Remove null bytes
        obj[key] = (obj[key]).replace(/\0/g, '');

        // Trim whitespace
        obj[key] = (obj[key] as string).trim();

        // Remove script tags
        obj[key] = (obj[key] as string).replace(
          /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
          '',
        );

        // Remove event handlers
        obj[key] = (obj[key] as string).replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key] as Record<string, unknown>);
      }
    }
  }
}

/**
 * CSRF protection middleware
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): Response | void {
  // Skip CSRF for GET requests and API endpoints that use JWT
  if (req.method === 'GET' || req.path.startsWith('/api/')) {
    next(); 
    return;
  }

  const token = req.headers['x-csrf-token'] || req.body?._csrf;
  const sessionToken = (req as { session?: { csrfToken?: string } }).session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid CSRF token',
    });
  }

  next();
}

/**
 * Generate CSRF token for session
 */
export function generateCSRFToken(): string {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('crypto').randomBytes(32).toString('hex');
}

/**
 * Apply all security middleware
 */
export function applySecurityMiddleware(app: { use: (middleware: unknown) => void }) {
  // Apply Helmet for security headers
  app.use(helmetConfig);

  // Apply CORS
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use(cors.default ? cors.default(corsOptions) : (cors as any)(corsOptions));

  // Apply custom security headers
  app.use(securityHeaders);

  // Apply input sanitization
  app.use(sanitizeInput);

  // Apply general rate limiting
  // DISABLED FOR SINGLE USER APP - Using new rate limit system instead
  // app.use(rateLimitMiddleware);

  // Log security middleware applied
  logger.info('Security middleware applied successfully');
}

/**
 * Cookie security options
 */
export const secureCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/',
};

/**
 * Refresh token cookie options (longer expiry)
 */
export const refreshTokenCookieOptions = {
  ...secureCookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
