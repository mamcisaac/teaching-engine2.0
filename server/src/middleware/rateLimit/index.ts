/**
 * Rate Limiting Middleware
 * 
 * Provides pre-configured rate limiters for different use cases
 * All configuration is centralized in config.ts
 */

import { createRateLimiter, createDynamicRateLimiter } from './factory';
import { RateLimitRequestHandler } from 'express-rate-limit';

// Export configuration and utilities
export * from './config';
export * from './factory';

/**
 * Pre-configured rate limiters
 * These can be used directly in routes
 */

// Authentication endpoints
export const authRateLimiter = createRateLimiter('auth');

// General API endpoints
export const defaultRateLimiter = createRateLimiter('general');
export const generalRateLimiter = defaultRateLimiter; // Alias

// Read operations
export const readRateLimiter = createRateLimiter('read');

// Write operations (resource creation)
export const createResourceRateLimiter = createRateLimiter('write');
export const resourceCreationRateLimiter = createResourceRateLimiter; // Alias

// File uploads
export const uploadRateLimiter = createRateLimiter('upload');

// AI/LLM endpoints
export const aiRateLimiter = createRateLimiter('ai');

// Batch operations
export const batchRateLimiter = createRateLimiter('batch');

// Export operations
export const exportRateLimiter = createRateLimiter('export');

// Public endpoints
export const publicRateLimiter = createRateLimiter('public');

/**
 * Dynamic rate limiters (adjust based on user tier)
 */
export const dynamicApiRateLimiter = createDynamicRateLimiter('general');
export const dynamicAiRateLimiter = createDynamicRateLimiter('ai');
export const dynamicExportRateLimiter = createDynamicRateLimiter('export');

/**
 * Rate limiter collections for backward compatibility
 */
export const rateLimiters = {
  general: defaultRateLimiter,
  auth: authRateLimiter,
  resourceCreation: createResourceRateLimiter,
  upload: uploadRateLimiter,
  ai: aiRateLimiter,
  read: readRateLimiter,
  api: defaultRateLimiter,
  write: createResourceRateLimiter,
  batch: batchRateLimiter,
  export: exportRateLimiter,
  public: publicRateLimiter,
} as const;

/**
 * Rate limiter middleware for specific routes
 * Usage: router.use('/auth', rateLimitMiddleware.auth);
 */
export const rateLimitMiddleware = {
  // Authentication routes
  auth: [authRateLimiter],
  
  // Public API routes
  publicApi: [publicRateLimiter],
  
  // Authenticated API routes
  api: [defaultRateLimiter],
  
  // AI-powered features
  ai: [aiRateLimiter, defaultRateLimiter],
  
  // File operations
  files: [uploadRateLimiter, createResourceRateLimiter],
  
  // Data export
  export: [exportRateLimiter, readRateLimiter],
  
  // Batch operations
  batch: [batchRateLimiter, createResourceRateLimiter],
} as const;

/**
 * Helper to apply rate limiting to routes
 * 
 * @example
 * router.get('/api/users', 
 *   applyRateLimit('read'), 
 *   getUsersHandler
 * );
 */
export function applyRateLimit(
  type: keyof typeof rateLimiters
): RateLimitRequestHandler {
  return rateLimiters[type];
}

/**
 * Helper to apply multiple rate limits
 * 
 * @example
 * router.post('/api/ai/generate',
 *   applyRateLimits(['ai', 'write']),
 *   generateHandler
 * );
 */
export function applyRateLimits(
  types: Array<keyof typeof rateLimiters>
): RateLimitRequestHandler[] {
  return types.map(type => rateLimiters[type]);
}

// For testing purposes
export { resetRateLimiterState } from './config';

/**
 * Example usage in routes:
 * 
 * // Simple rate limiting
 * router.post('/auth/login', authRateLimiter, loginHandler);
 * 
 * // Multiple rate limits
 * router.post('/api/ai/generate', 
 *   aiRateLimiter, 
 *   generalRateLimiter, 
 *   generateHandler
 * );
 * 
 * // Dynamic rate limiting based on user tier
 * router.get('/api/data', dynamicApiRateLimiter, getDataHandler);
 * 
 * // Using middleware groups
 * router.use('/api/ai', ...rateLimitMiddleware.ai);
 * 
 * // Using helpers
 * router.get('/api/users', applyRateLimit('read'), getUsersHandler);
 * router.post('/api/resources', 
 *   ...applyRateLimits(['write', 'general']), 
 *   createResourceHandler
 * );
 */