# Rate Limiting Migration Guide

## Overview

We've centralized all rate limiting configuration into a maintainable, configurable system that supports different environments, user tiers, and Redis for distributed rate limiting.

## New Structure

```
src/middleware/rateLimit/
├── config.ts     # Centralized configuration
├── factory.ts    # Rate limiter factory functions
├── index.ts      # Pre-configured limiters and exports
└── MIGRATION.md  # This file
```

## Key Improvements

1. **Centralized Configuration** - All rate limits defined in one place
2. **Environment Support** - Automatic adjustments for test/dev/prod
3. **User Tiers** - Dynamic limits based on user type (free/premium/admin)
4. **Redis Support** - Distributed rate limiting in production
5. **Better Monitoring** - Consistent logging and metrics
6. **Endpoint Overrides** - Custom limits for specific endpoints

## Migration Steps

### 1. Basic Usage (No Changes Needed)

If you're using the exported rate limiters, no changes are required:

```typescript
// Still works exactly the same
import { authRateLimiter, aiRateLimiter } from '../middleware/rateLimiter';

router.post('/auth/login', authRateLimiter, loginHandler);
router.post('/api/ai/generate', aiRateLimiter, generateHandler);
```

### 2. New Import Path (Recommended)

For better organization, update imports to use the new path:

```typescript
// Old
import { authRateLimiter } from '../middleware/rateLimiter';

// New (recommended)
import { authRateLimiter } from '../middleware/rateLimit';
```

### 3. Using Dynamic Rate Limiters

Take advantage of user tier-based limits:

```typescript
import { dynamicApiRateLimiter } from '../middleware/rateLimit';

// Automatically adjusts limits based on user tier
router.get('/api/data', 
  authenticate, 
  dynamicApiRateLimiter, 
  getDataHandler
);
```

### 4. Custom Rate Limiters

Create custom rate limiters using the factory:

```typescript
import { createRateLimiter, createEndpointRateLimiter } from '../middleware/rateLimit';

// From configuration
const customLimiter = createRateLimiter('ai', {
  max: 50, // Override max requests
});

// For specific endpoint
const loginLimiter = createEndpointRateLimiter('/api/auth/login');
```

### 5. Multiple Rate Limiters

Apply multiple limits using helpers:

```typescript
import { applyRateLimits, rateLimitMiddleware } from '../middleware/rateLimit';

// Using helper function
router.post('/api/batch-process',
  ...applyRateLimits(['batch', 'write']),
  batchHandler
);

// Using pre-defined groups
router.use('/api/ai', ...rateLimitMiddleware.ai);
```

## Configuration

### Viewing Current Configuration

```typescript
import { rateLimitConfigs, getRateLimitConfig } from '../middleware/rateLimit';

// View all configurations
console.log(rateLimitConfigs);

// Get config with user tier
const config = getRateLimitConfig('ai', 'premium');
console.log(`Premium AI limit: ${config.max} requests per ${config.windowMs}ms`);
```

### Environment Variables

```bash
# Enable Redis for distributed rate limiting
REDIS_URL=redis://localhost:6379

# Environment (affects limits)
NODE_ENV=production
```

### Customizing Limits

Edit `config.ts` to adjust limits:

```typescript
export const rateLimitConfigs = {
  ai: {
    windowMs: HOUR,
    max: 20,  // Change this
    message: 'AI request limit exceeded',
    keyGenerator: 'user',
  },
};
```

## Monitoring

### Logging

All rate limit violations are logged with context:

```json
{
  "level": "warn",
  "message": "Rate limit exceeded",
  "ip": "192.168.1.1",
  "path": "/api/ai/generate",
  "userId": 123,
  "userTier": "free",
  "rateLimitType": "ai"
}
```

### Getting Rate Limit Status

```typescript
import { getRateLimitStatus } from '../middleware/rateLimit';

// Check current status for a user
const status = await getRateLimitStatus('ai', 'user:123');
console.log(`Requests: ${status.count}, Resets: ${status.resetTime}`);
```

### Resetting Limits (Admin/Testing)

```typescript
import { resetRateLimit } from '../middleware/rateLimit';

// Reset for specific user
await resetRateLimit('ai', 'user:123');

// Reset for IP
await resetRateLimit('auth', '192.168.1.1');
```

## Testing

### Test Environment

Tests automatically get:
- 1000x shorter time windows
- 10x higher request limits
- Memory store (no Redis needed)

### Testing Rate Limits

```typescript
import { resetRateLimiterState } from '../middleware/rateLimit';

beforeEach(() => {
  // Reset all rate limiters
  resetRateLimiterState();
});

it('should rate limit requests', async () => {
  // Make requests up to limit
  for (let i = 0; i < 5; i++) {
    await request(app).post('/auth/login').send(credentials);
  }
  
  // Next request should be rate limited
  const res = await request(app).post('/auth/login').send(credentials);
  expect(res.status).toBe(429);
});
```

## Best Practices

1. **Use Appropriate Limiters** - Choose the right limiter for each endpoint
2. **Consider User Experience** - Don't make limits too restrictive
3. **Monitor Violations** - Watch logs for patterns of abuse
4. **Document Custom Limits** - Add comments explaining why limits differ
5. **Test Rate Limits** - Include rate limit tests in your test suite

## Common Patterns

### Public API with Strict Limits
```typescript
router.get('/api/public/search',
  publicRateLimiter,  // Strict IP-based limiting
  searchHandler
);
```

### Authenticated API with Tier-Based Limits
```typescript
router.post('/api/generate',
  authenticate,
  dynamicApiRateLimiter,  // Adjusts based on user tier
  generateHandler
);
```

### Expensive Operations
```typescript
router.post('/api/ai/complex-analysis',
  authenticate,
  aiRateLimiter,          // Strict limit
  generalRateLimiter,     // Additional general limit
  complexAnalysisHandler
);
```

### File Operations
```typescript
router.post('/api/upload',
  authenticate,
  ...rateLimitMiddleware.files,  // Upload + write limits
  uploadHandler
);
```

## Troubleshooting

### "Too Many Requests" in Development

Check if you have development overrides:
```typescript
// config.ts
export const developmentOverrides = isDevelopment ? {
  max: 10000,  // Very high limit
  windowMs: MINUTE,
} : {};
```

### Redis Connection Issues

Rate limiting falls back to memory store if Redis fails:
```
ERROR: Redis client error: Connection refused
WARN: Using memory store for rate limiting
```

### Limits Not Working

1. Check skip paths in config
2. Verify middleware order (auth before rate limit)
3. Check key generator (user vs IP)
4. Look for endpoint overrides

## Summary

The new centralized rate limiting system provides:

- ✅ Single source of truth for all limits
- ✅ Environment-aware configuration
- ✅ User tier support
- ✅ Redis support for scaling
- ✅ Better monitoring and debugging
- ✅ Backward compatibility
- ✅ Easier testing

No breaking changes - existing code continues to work while gaining new capabilities!