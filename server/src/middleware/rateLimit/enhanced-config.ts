/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Enhanced Rate Limiting Configuration
 * Supports Redis, user tiers, and dynamic limits
 */

import { Request } from 'express';
import Redis from 'ioredis';
import {
  RateLimiterRedis,
  RateLimiterMemory,
  IRateLimiterOptions,
  IRateLimiterRedisOptions,
} from 'rate-limiter-flexible';
import logger from '../../logger';
export enum UserTier {
  FREE = 'FREE',
  PREMIUM = 'PREMIUM',
  ADMIN = 'ADMIN',
}

export interface RateLimitConfig {
  windowMs: number;
  max: number | ((req: Request) => number);
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  skip?: (req: Request) => boolean;
  handler?: (req: Request, res: unknown, next: unknown, options: unknown) => void;
  store?: Redis | 'memory';
}

export interface TierLimits {
  [UserTier.FREE]: number;
  [UserTier.PREMIUM]: number;
  [UserTier.ADMIN]: number;
}

/**
 * Rate limit configurations by endpoint type
 */
export const rateLimitConfigs = {
  // General API endpoints
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    tierLimits: {
      [UserTier.FREE]: 100,
      [UserTier.PREMIUM]: 1000,
      [UserTier.ADMIN]: 10000,
    },
  },

  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    tierLimits: {
      [UserTier.FREE]: 5,
      [UserTier.PREMIUM]: 10,
      [UserTier.ADMIN]: 50,
    },
  },

  // AI generation endpoints
  ai: {
    windowMs: 60 * 60 * 1000, // 1 hour
    tierLimits: {
      [UserTier.FREE]: 10,
      [UserTier.PREMIUM]: 100,
      [UserTier.ADMIN]: 1000,
    },
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    tierLimits: {
      [UserTier.FREE]: 10,
      [UserTier.PREMIUM]: 50,
      [UserTier.ADMIN]: 500,
    },
  },

  // Read-heavy endpoints
  read: {
    windowMs: 60 * 1000, // 1 minute
    tierLimits: {
      [UserTier.FREE]: 100,
      [UserTier.PREMIUM]: 500,
      [UserTier.ADMIN]: 5000,
    },
  },

  // Write endpoints
  write: {
    windowMs: 60 * 1000, // 1 minute
    tierLimits: {
      [UserTier.FREE]: 50,
      [UserTier.PREMIUM]: 200,
      [UserTier.ADMIN]: 2000,
    },
  },
};

/**
 * Get user tier from request
 */
export function getUserTier(req: Request): UserTier {
  const user = (req as any)?.user;
  if (!user) return UserTier.FREE;

  switch (user.role) {
    case 'ADMIN':
      return UserTier.ADMIN;
    case 'PREMIUM':
      return UserTier.PREMIUM;
    default:
      return UserTier.FREE;
  }
}

/**
 * Create rate limiter with Redis support
 */
export async function createEnhancedRateLimiter(
  type: keyof typeof rateLimitConfigs,
  customConfig?: Partial<RateLimitConfig>,
): Promise<unknown> {
  const config = rateLimitConfigs[type];
  const redis = await getRedisClient();

  const baseOptions = {
    points: config.tierLimits[UserTier.FREE], // Default to free tier
    duration: Math.floor(config.windowMs / 1000), // Convert to seconds
    blockDuration: Math.floor(config.windowMs / 1000),
    ...customConfig,
  };

  const options: IRateLimiterRedisOptions | IRateLimiterOptions = redis
    ? {
        ...baseOptions,
        storeClient: redis,
        keyPrefix: `rate_limit_${type}_`,
      }
    : baseOptions;

  // Create rate limiter instance
  const rateLimiter = redis
    ? new RateLimiterRedis(options as IRateLimiterRedisOptions)
    : new RateLimiterMemory(options as IRateLimiterOptions);

  // Return Express middleware
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user tier and corresponding limit
      const tier = getUserTier(req);
      const limit = config.tierLimits[tier];

      // Generate key
      const key = customConfig?.keyGenerator
        ? customConfig.keyGenerator(req)
        : (req as any)?.user?.userId || req.ip;

      // Check if should skip
      if (customConfig?.skip?.(req)) {
        return next();
      }

      // Consume points
      const rateLimiterRes = await rateLimiter.consume(key, 1);

      // Set headers
      (res as any).setHeader('X-RateLimit-Limit', limit);
      (res as any).setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints);
      (res as any).setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + rateLimiterRes.msBeforeNext).toISOString(),
      );
      (res as any).setHeader('X-RateLimit-Tier', tier);

      next();
    } catch (rejRes: any) {
      // Rate limit exceeded
      const retryAfter = Math.floor((rejRes?.msBeforeNext || config.windowMs) / 1000);

      (res as any).setHeader('Retry-After', retryAfter);
      (res as any).setHeader('X-RateLimit-Limit', config.tierLimits[getUserTier(req)]);
      (res as any).setHeader('X-RateLimit-Remaining', 0);
      (res as any).setHeader(
        'X-RateLimit-Reset',
        new Date(Date.now() + (rejRes?.msBeforeNext || config.windowMs)).toISOString(),
      );

      (res as any).status(429).json({
        error: customConfig?.message || 'Too many requests, please try again later.',
        retryAfter,
        tier: getUserTier(req),
      });
    }
  };
}

/**
 * Get Redis client for rate limiting
 */
let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis | null> {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL ?? process.env.RATE_LIMIT_REDIS_URL;
  if (!redisUrl) return null;

  try {
    redisClient = new Redis(redisUrl, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 100, 3000);
      },
    });

    await redisClient.ping();
    logger.info('Redis connected for rate limiting');

    return redisClient;
  } catch (_error) {
    logger.info('Redis connection failed, using in-memory rate limiting', _error);
    return null;
  }
}

/**
 * Pre-configured rate limiters with tier support
 */
export const enhancedRateLimiters = {
  api: () => createEnhancedRateLimiter('api'),
  auth: () => createEnhancedRateLimiter('auth'),
  ai: () => createEnhancedRateLimiter('ai'),
  upload: () => createEnhancedRateLimiter('upload'),
  read: () => createEnhancedRateLimiter('read'),
  write: () => createEnhancedRateLimiter('write'),

  // Custom limiter for specific needs
  custom: (config: RateLimitConfig) => createEnhancedRateLimiter('api', config),
};

/**
 * Apply multiple rate limits to a route
 */
export function applyRateLimits(types: Array<keyof typeof rateLimitConfigs>) {
  return types.map((type) => enhancedRateLimiters[type]());
}

/**
 * Dynamic rate limiter based on request properties
 */
export function dynamicRateLimiter() {
  return async (req: Request, res: unknown, next: unknown) => {
    // Determine rate limit type based on request
    let type: keyof typeof rateLimitConfigs = 'api';

    if (req.path.includes('/auth/')) {
      type = 'auth';
    } else if (req.path.includes('/ai/') || req.path.includes('/generate')) {
      type = 'ai';
    } else if (req.path.includes('/upload')) {
      type = 'upload';
    } else if (req.method === 'GET') {
      type = 'read';
    } else if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
      type = 'write';
    }

    const limiter = await enhancedRateLimiters[type]();
    return (limiter as any)(req, res, next);
  };
}

/**
 * Cleanup function for tests
 */
export async function cleanupRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
