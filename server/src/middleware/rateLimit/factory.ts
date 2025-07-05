/* eslint-disable @typescript-eslint/no-var-requires */
import { Request, Response } from 'express';
// import '../../types/express';
import rateLimit, { RateLimitRequestHandler, Options } from 'express-rate-limit';
// Optional Redis support
let RedisStore: unknown;
let createClient: unknown;

// Load Redis modules lazily
async function loadRedisModules() {
  if (!RedisStore) {
    try {
      RedisStore = await import('rate-limit-redis');
      createClient = (await import('redis')).createClient;
    } catch (_e) {
      // Redis not available
    }
  }
}
import logger from '../../logger.js';
import { 
  rateLimitConfigs, 
  rateLimitTiers,
  skipRateLimitPaths,
  storeConfig,
  endpointOverrides,
  getRateLimitConfig,
  shouldBypassRateLimit
} from './config';

// Redis client for rate limiting (if configured)
let redisClient: unknown = null;
let redisInitialized = false;

// Initialize Redis on first use
async function _initializeRedis() {
  if (redisInitialized) return;
  redisInitialized = true;
  
  if (storeConfig.useRedis && process.env.REDIS_URL) {
    await loadRedisModules();
    
    if (createClient) {
      try {
        redisClient = (createClient as (config: { url: string }) => unknown)({
          url: process.env.REDIS_URL,
        });
        
        (redisClient as { on: (event: string, callback: (err: unknown) => void) => void }).on('error', (err: unknown) => {
          logger.error({ error: err }, 'Redis client error');
        });
        
        await (redisClient as { connect: () => Promise<void> }).connect();
      } catch (err) {
        logger.error({ error: err }, 'Failed to connect to Redis');
        redisClient = null;
      }
    }
  }
}

/**
 * Create a rate limiter from configuration
 */
export function createRateLimiter(
  configName: keyof typeof rateLimitConfigs,
  customOptions?: Partial<Options>
): RateLimitRequestHandler {
  const config = rateLimitConfigs[configName];
  if (!config) {
    throw new Error(`Unknown rate limit config: ${configName}`);
  }

  const options: Partial<Options> = {
    windowMs: config.windowMs,
    limit: config.max,
    message: config.message,
    standardHeaders: true,
    legacyHeaders: false,
    
    // Use Redis store in production (if available)
    ...(redisClient && storeConfig.useRedis && RedisStore ? {
      store: new (RedisStore as { default: new (config: { client: unknown; prefix: string }) => unknown }).default({
        client: redisClient,
        prefix: `${storeConfig.keyPrefix}${configName}:`,
      }) as unknown as Options['store'],
    } : {}),
    
    // Key generator based on config
    keyGenerator: (req: Request) => {
      if (config.keyGenerator === 'user' && req.user?.id) {
        return `user:${req.user.id}`;
      }
      return req.ip || 'unknown';
    },
    
    // Skip successful requests if configured
    skipSuccessfulRequests: config.skipSuccessful || false,
    
    // Skip rate limiting for certain paths or in development
    skip: (req: Request) => {
      return skipRateLimitPaths.includes(req.path) || shouldBypassRateLimit(req);
    },
    
    // Custom handler for rate limit exceeded
    handler: (req: Request, res: Response) => {
      logger.warn({
        ip: req.ip,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        rateLimitType: configName,
      }, 'Rate limit exceeded');

      res.status(429).json({
        error: 'Too Many Requests',
        message: config.message || 'Rate limit exceeded. Please try again later.',
        retryAfter: req.rateLimit?.resetTime,
        limit: config.max,
        windowMs: config.windowMs,
      });
    },
    
    // Apply custom options
    ...customOptions,
  };

  return rateLimit(options);
}

/**
 * Create a dynamic rate limiter based on user tier
 */
export function createDynamicRateLimiter(
  configName: keyof typeof rateLimitConfigs,
  customOptions?: Partial<Options>
): RateLimitRequestHandler {
  return rateLimit({
    windowMs: rateLimitConfigs[configName].windowMs,
    standardHeaders: true,
    legacyHeaders: false,
    
    // Dynamic max based on user tier
    max: (req: Request) => {
      const userTier = getUserTier(req);
      const config = getRateLimitConfig(configName, userTier);
      return config.max;
    },
    
    // Use Redis store if available
    ...(redisClient && storeConfig.useRedis && RedisStore ? {
      store: new (RedisStore as { default: new (config: { client: unknown; prefix: string }) => unknown }).default({
        client: redisClient,
        prefix: `${storeConfig.keyPrefix}${configName}:`,
      }) as unknown as Options['store'],
    } : {}),
    
    // Key generator
    keyGenerator: (req: Request) => {
      const config = rateLimitConfigs[configName];
      if (config.keyGenerator === 'user' && req.user?.id) {
        return `user:${req.user.id}`;
      }
      return req.ip || 'unknown';
    },
    
    // Skip rate limiting for certain paths or in development
    skip: (req: Request) => {
      return skipRateLimitPaths.includes(req.path) || shouldBypassRateLimit(req);
    },
    
    // Custom handler
    handler: (req: Request, res: Response) => {
      const userTier = getUserTier(req);
      const config = getRateLimitConfig(configName, userTier);
      
      logger.warn({
        ip: req.ip,
        path: req.path,
        userId: req.user?.id,
        userTier,
        rateLimitType: configName,
      }, 'Rate limit exceeded');

      res.status(429).json({
        error: 'Too Many Requests',
        message: config.message || 'Rate limit exceeded. Please try again later.',
        retryAfter: req.rateLimit?.resetTime,
        limit: config.max,
        windowMs: config.windowMs,
        userTier,
      });
    },
    
    ...customOptions,
  });
}

/**
 * Create a rate limiter for a specific endpoint
 */
export function createEndpointRateLimiter(
  endpoint: string,
  baseConfig: keyof typeof rateLimitConfigs = 'general'
): RateLimitRequestHandler {
  const overrides = endpointOverrides[endpoint] || {};
  const config = { ...rateLimitConfigs[baseConfig], ...overrides };
  
  return createRateLimiter(baseConfig, {
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
  });
}

/**
 * Apply multiple rate limiters to a route
 */
export function applyRateLimitGroup(
  groupName: string,
  limiters: RateLimitRequestHandler[]
): RateLimitRequestHandler[] {
  return limiters.map(limiter => {
    // Add group name to logger context
    const originalHandler = (limiter as RateLimitRequestHandler & { handler?: (req: Request, res: Response) => void }).handler;
    (limiter as RateLimitRequestHandler & { handler?: (req: Request, res: Response) => void }).handler = (req: Request, res: Response) => {
      logger.warn({
        rateLimitGroup: groupName,
        ip: req.ip,
        path: req.path,
      }, 'Rate limit exceeded in group');
      
      if (originalHandler) {
        originalHandler(req, res);
      } else {
        res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          group: groupName,
        });
      }
    };
    
    return limiter;
  });
}

/**
 * Get user tier from request
 */
function getUserTier(req: Request): keyof typeof rateLimitTiers | undefined {
  if (!req.user) return undefined;
  
  // Check user role
  if (req.user.role === 'ADMIN') return 'admin';
  if (req.user.role === 'PREMIUM') return 'premium';
  
  // Check for API token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    return 'api';
  }
  
  return 'free';
}

/**
 * Reset rate limit for a specific key (testing/admin use)
 */
export async function resetRateLimit(
  configName: string,
  key: string
): Promise<void> {
  if (!redisClient) {
    logger.warn('Cannot reset rate limit - Redis not configured');
    return;
  }
  
  const fullKey = `${storeConfig.keyPrefix}${configName}:${key}`;
  try {
    await (redisClient as { del: (key: string) => Promise<void> }).del(fullKey);
    logger.info(`Reset rate limit for ${fullKey}`);
  } catch (error) {
    logger.error('Failed to reset rate limit:', error);
  }
}

/**
 * Get current rate limit status for a key
 */
export async function getRateLimitStatus(
  configName: string,
  key: string
): Promise<{ count: number; resetTime: Date } | null> {
  if (!redisClient) {
    return null;
  }
  
  const fullKey = `${storeConfig.keyPrefix}${configName}:${key}`;
  try {
    const count = await (redisClient as { get: (key: string) => Promise<string | null> }).get(fullKey);
    const ttl = await (redisClient as { ttl: (key: string) => Promise<number> }).ttl(fullKey);
    
    if (count && ttl > 0) {
      return {
        count: parseInt(count),
        resetTime: new Date(Date.now() + ttl * 1000),
      };
    }
  } catch (error) {
    logger.error('Failed to get rate limit status:', error);
  }
  
  return null;
}

/**
 * Cleanup function for graceful shutdown
 */
export async function cleanupRateLimiters(): Promise<void> {
  if (redisClient) {
    await (redisClient as { quit: () => Promise<void> }).quit();
    logger.info('Redis client disconnected');
  }
}