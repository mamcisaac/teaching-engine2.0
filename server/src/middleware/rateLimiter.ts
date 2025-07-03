import { Request, Response } from 'express';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import logger from '../logger.js';

// Extend Express Request to include rate limit info
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      rateLimit?: {
        resetTime?: Date;
        remaining?: number;
        totalHits?: number;
      };
    }
  }
}

/**
 * Rate limiting middleware configuration
 * Implements different rate limits for different types of operations
 */

// Default rate limiter for general API endpoints
export const defaultRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
        method: req.method,
      },
      'Rate limit exceeded',
    );

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/health' || req.path === '/api/health';
  },
});

// Strict rate limiter for authentication endpoints
export const authRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: process.env.NODE_ENV === 'test' ? 5000 : 15 * 60 * 1000, // 5 seconds for tests, 15 minutes for production
  max: process.env.NODE_ENV === 'test' ? 20 : 5, // Higher limit for tests, same limit for production
  message: 'Too many authentication attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful auth requests
  handler: (req: Request, res: Response) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
        userAgent: req.headers['user-agent'],
      },
      'Authentication rate limit exceeded',
    );

    res.status(429).json({
      error: 'Too Many Authentication Attempts',
      message: 'Please wait before trying again.',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
  skip: (req: Request) => {
    // Only skip rate limiting for specific test paths that need to bypass it
    return process.env.NODE_ENV === 'test' && req.path.includes('/health');
  },
});

// Moderate rate limiter for resource creation endpoints
export const createResourceRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit each IP to 30 resource creation requests per hour
  message: 'Too many resources created from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
        method: req.method,
      },
      'Resource creation rate limit exceeded',
    );

    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Resource creation limit exceeded. Please try again later.',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// Lenient rate limiter for read operations
export const readRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 read requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for file uploads
export const uploadRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 file uploads per hour
  message: 'Too many file uploads from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
      },
      'File upload rate limit exceeded',
    );

    res.status(429).json({
      error: 'Too Many Uploads',
      message: 'File upload limit exceeded. Please try again later.',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// Rate limiter for AI/LLM endpoints (more restrictive due to cost)
export const aiRateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 AI requests per hour
  message: 'Too many AI requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(
      {
        ip: req.ip,
        path: req.path,
        userId: (req as { user?: { id: number } }).user?.id,
      },
      'AI rate limit exceeded',
    );

    res.status(429).json({
      error: 'Too Many AI Requests',
      message: 'AI request limit exceeded. Please try again later.',
      retryAfter: req.rateLimit?.resetTime,
    });
  },
});

// Dynamic rate limiter based on user role
export function createUserBasedRateLimiter(
  freeLimit: number = 50,
  premiumLimit: number = 200,
  windowMs: number = 15 * 60 * 1000,
): RateLimitRequestHandler {
  return rateLimit({
    windowMs,
    max: (req: Request) => {
      // Check if user is authenticated and has premium access
      if (req.user?.role === 'premium' || req.user?.role === 'admin') {
        return premiumLimit;
      }
      return freeLimit;
    },
    keyGenerator: (req: Request) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user?.id || req.ip || 'unknown';
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

// Export as rateLimiters object for backward compatibility
export const rateLimiters = {
  general: defaultRateLimiter,
  auth: authRateLimiter,
  resourceCreation: createResourceRateLimiter,
  upload: uploadRateLimiter,
  ai: aiRateLimiter,
  read: readRateLimiter,
  api: defaultRateLimiter, // Alias for general API endpoints
  write: createResourceRateLimiter, // Alias for write operations
};

// Individual limiters are already exported above with their declarations

// Export aliases for expected names
export const generalRateLimiter = defaultRateLimiter;
export const resourceCreationRateLimiter = createResourceRateLimiter;

// Reset rate limiter state for testing
export function resetRateLimiterState(): void {
  // Rate limiters use memory store by default, which doesn't expose a reset method
  // For testing, we rely on the windowMs to expire naturally or use mock time
  // In production, you might want to use Redis store which has better control
  logger.debug('Rate limiter state reset requested');
}
