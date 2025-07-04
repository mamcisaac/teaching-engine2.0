/**
 * Centralized Rate Limit Configuration
 * Defines all rate limiting rules in one place for easy management
 */

export interface RateLimitConfig {
  windowMs: number;     // Time window in milliseconds
  max: number;          // Maximum number of requests
  message?: string;     // Custom error message
  skipSuccessful?: boolean; // Skip counting successful requests
  keyGenerator?: 'ip' | 'user' | 'custom'; // How to identify clients
}

export interface RateLimitTier {
  name: string;
  config: RateLimitConfig;
  description: string;
}

// Environment-specific multipliers
const isTest = process.env.NODE_ENV === 'test';
const isDevelopment = process.env.NODE_ENV === 'development';

// Time constants
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Test environment adjustments
const testMultiplier = isTest ? 0.001 : 1; // Make windows 1000x shorter in tests
const testLimitMultiplier = isTest ? 10 : 1; // Make limits 10x higher in tests

/**
 * Centralized rate limit configurations
 * All rate limits are defined here for consistency
 */
export const rateLimitConfigs: Record<string, RateLimitConfig> = {
  // Authentication endpoints - Very strict
  auth: {
    windowMs: 15 * MINUTE * testMultiplier,
    max: 5 * testLimitMultiplier,
    message: 'Too many authentication attempts. Please try again later.',
    skipSuccessful: true,
    keyGenerator: 'ip',
  },

  // Password reset - Even stricter
  passwordReset: {
    windowMs: HOUR * testMultiplier,
    max: 3 * testLimitMultiplier,
    message: 'Too many password reset attempts. Please try again later.',
    skipSuccessful: false,
    keyGenerator: 'ip',
  },

  // General API endpoints - Moderate
  general: {
    windowMs: 15 * MINUTE * testMultiplier,
    max: 100 * testLimitMultiplier,
    message: 'Too many requests. Please try again later.',
    keyGenerator: 'user',
  },

  // Read operations - Lenient
  read: {
    windowMs: 15 * MINUTE * testMultiplier,
    max: 500 * testLimitMultiplier,
    message: 'Too many read requests. Please try again later.',
    keyGenerator: 'user',
  },

  // Write operations - Moderate
  write: {
    windowMs: HOUR * testMultiplier,
    max: 30 * testLimitMultiplier,
    message: 'Too many write operations. Please try again later.',
    keyGenerator: 'user',
  },

  // File uploads - Strict
  upload: {
    windowMs: HOUR * testMultiplier,
    max: 10 * testLimitMultiplier,
    message: 'Too many file uploads. Please try again later.',
    keyGenerator: 'user',
  },

  // AI/LLM operations - Very strict (expensive)
  ai: {
    windowMs: HOUR * testMultiplier,
    max: 20 * testLimitMultiplier,
    message: 'AI request limit exceeded. Please try again later.',
    keyGenerator: 'user',
  },

  // Batch operations - Very strict
  batch: {
    windowMs: HOUR * testMultiplier,
    max: 5 * testLimitMultiplier,
    message: 'Too many batch operations. Please try again later.',
    keyGenerator: 'user',
  },

  // Export operations - Moderate
  export: {
    windowMs: HOUR * testMultiplier,
    max: 20 * testLimitMultiplier,
    message: 'Too many export requests. Please try again later.',
    keyGenerator: 'user',
  },

  // Public endpoints (no auth) - Strict
  public: {
    windowMs: 15 * MINUTE * testMultiplier,
    max: 30 * testLimitMultiplier,
    message: 'Too many requests from this IP. Please try again later.',
    keyGenerator: 'ip',
  },
};

/**
 * Rate limit tiers for different user types
 */
export const rateLimitTiers = {
  free: {
    multiplier: 1,
    description: 'Standard rate limits for free users',
  },
  premium: {
    multiplier: 5,
    description: '5x higher limits for premium users',
  },
  admin: {
    multiplier: 10,
    description: '10x higher limits for administrators',
  },
  api: {
    multiplier: 3,
    description: '3x higher limits for API token access',
  },
};

/**
 * Endpoints that should skip rate limiting
 */
export const skipRateLimitPaths = [
  '/health',
  '/api/health',
  '/metrics',
  '/api/metrics',
];

/**
 * Development mode overrides
 */
export const developmentOverrides: Partial<RateLimitConfig> = isDevelopment ? {
  max: 10000, // Very high limit in development
  windowMs: MINUTE, // Short window for easier testing
} : {};

/**
 * Get rate limit config with user tier multiplier
 */
export function getRateLimitConfig(
  configName: keyof typeof rateLimitConfigs,
  userTier?: keyof typeof rateLimitTiers
): RateLimitConfig {
  const baseConfig = rateLimitConfigs[configName];
  if (!baseConfig) {
    throw new Error(`Unknown rate limit config: ${configName}`);
  }

  // Apply development overrides
  const config = { ...baseConfig, ...developmentOverrides };

  // Apply user tier multiplier
  if (userTier && rateLimitTiers[userTier]) {
    config.max = Math.floor(config.max * rateLimitTiers[userTier].multiplier);
  }

  return config;
}

/**
 * Rate limit groups for applying multiple limits
 */
export const rateLimitGroups = {
  // Standard API protection
  api: ['general', 'read'],
  
  // Authenticated routes
  authenticated: ['general', 'write'],
  
  // AI-powered features
  aiFeatures: ['ai', 'general'],
  
  // File handling
  fileOperations: ['upload', 'write'],
  
  // Authentication flow
  authFlow: ['auth', 'public'],
  
  // Data export
  dataExport: ['export', 'read'],
};

/**
 * Custom rate limit rules for specific endpoints
 */
export const endpointOverrides: Record<string, Partial<RateLimitConfig>> = {
  '/api/auth/login': {
    max: 5,
    windowMs: 15 * MINUTE,
  },
  '/api/auth/register': {
    max: 3,
    windowMs: HOUR,
  },
  '/api/ai/generate-lesson': {
    max: 10,
    windowMs: HOUR,
  },
  '/api/export/full-backup': {
    max: 2,
    windowMs: 24 * HOUR,
  },
};

/**
 * Rate limit store configuration
 */
export const storeConfig = {
  // Use Redis in production for distributed rate limiting
  useRedis: process.env.NODE_ENV === 'production' && !!process.env.REDIS_URL,
  
  // Redis key prefix
  keyPrefix: 'rl:',
  
  // How long to keep rate limit records
  resetExpiryOnChange: true,
  
  // Clean up old entries
  clearExpiredByTimeout: true,
};