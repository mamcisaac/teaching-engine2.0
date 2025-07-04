# Middleware Migration Guide

## Overview

The middleware architecture has been streamlined from 14+ separate files into a composable, modular system organized in the `middleware/core` directory with pre-built chains for common use cases.

## Key Changes

### 1. Consolidated Error Handling
**Before:** Separate `errorHandler.ts` and `standardErrorHandler.ts`  
**After:** Single `core/error.ts` with unified error handling

### 2. Unified Logging System
**Before:** Three separate logging systems (`auditLog.ts`, `auditLogger.ts`, `requestLogger.ts`)  
**After:** Single `core/logging.ts` with comprehensive logging and audit capabilities

### 3. Composable Middleware Chains
**Before:** Manual middleware composition in routes  
**After:** Pre-built chains with `compose()` and `chain()` utilities

## Migration Examples

### Basic Route Migration

**Before:**
```typescript
import { authenticate } from '../middleware/authenticate';
import { rateLimiters } from '../middleware/rateLimiter';
import { requestLogger } from '../middleware/requestLogger';
import { errorHandler } from '../middleware/errorHandler';

router.get('/api/users',
  requestLogger,
  rateLimiters.api,
  authenticate,
  async (req, res) => {
    // handler
  }
);
```

**After:**
```typescript
import { middleware } from '../middleware';

router.get('/api/users',
  middleware.authenticated, // Includes logging, rate limiting, and auth
  async (req, res) => {
    // handler
  }
);
```

### Custom Middleware Chains

**Before:**
```typescript
router.post('/api/data',
  requestLogger,
  authenticate,
  rateLimiters.write,
  validateRequest(schema),
  auditLog,
  cacheMiddleware,
  async (req, res) => {
    // handler
  }
);
```

**After:**
```typescript
import { middleware, validate } from '../middleware';

router.post('/api/data',
  middleware.write, // Includes logging, auth, rate limiting, and audit
  validate(schema),
  middleware.cached('api'),
  async (req, res) => {
    // handler
  }
);
```

### Creating Custom Chains

```typescript
import { chain, middleware } from '../middleware';

// Option 1: Using chain builder
const customChain = chain()
  .add(middleware.core)
  .addIf(isProduction, rateLimiter)
  .add(authenticate)
  .addWithTimeout(slowMiddleware, 5000)
  .build();

// Option 2: Using custom helper
const customChain = middleware.custom({
  authenticate: true,
  rateLimit: 'strict',
  cache: true,
  audit: {
    event: AuditEventType.DATA_CREATE,
    severity: 'high'
  }
});
```

## Pre-built Middleware Chains

### Core Chains
- `middleware.core` - Basic security, logging, sanitization
- `middleware.api` - Core + rate limiting + performance logging
- `middleware.authenticated` - API + authentication
- `middleware.public` - API + stricter rate limiting for public endpoints

### Operation Chains
- `middleware.read` - For GET operations with caching support
- `middleware.write` - For POST/PUT/DELETE with audit logging
- `middleware.upload()` - For file uploads with security checks

### Feature Chains
- `middleware.auth` - For authentication endpoints
- `middleware.admin` - For admin-only operations
- `middleware.planning` - For planning operations with user cache
- `middleware.ai` - For AI operations with performance tracking

## Validation Migration

**Before:**
```typescript
import { validateRequest } from '../middleware/validateRequest';

router.post('/api/users',
  validateRequest(userSchema),
  // ...
);
```

**After:**
```typescript
import { validateBody } from '../middleware';

router.post('/api/users',
  validateBody(userSchema),
  // ...
);

// Or validate multiple sources
import { validate } from '../middleware';

router.post('/api/users/:id',
  validate(schema, { source: ['body', 'params'] }),
  // ...
);
```

## Error Handling Migration

**Before:**
```typescript
// At the end of routes
app.use(errorHandler);
app.use(standardErrorHandler);
```

**After:**
```typescript
// At the end of routes
app.use(middleware.errorHandling); // Includes logging and handling
```

## Logging and Audit Migration

**Before:**
```typescript
import { auditLog } from '../middleware/auditLog';

router.post('/api/sensitive',
  authenticate,
  (req, res, next) => {
    auditLog(req, 'SENSITIVE_OPERATION');
    next();
  },
  // ...
);
```

**After:**
```typescript
import { auditMiddleware, AuditEventType } from '../middleware';

router.post('/api/sensitive',
  middleware.authenticated,
  auditMiddleware(AuditEventType.DATA_UPDATE, {
    severity: 'high',
    targetResource: 'sensitive_data'
  }),
  // ...
);
```

## Quick Reference

### Import Changes
```typescript
// Before
import { authenticate } from '../middleware/authenticate';
import { rateLimiters } from '../middleware/rateLimiter';
import { validateRequest } from '../middleware/validateRequest';
import { errorHandler } from '../middleware/errorHandler';

// After
import { 
  middleware, 
  validate, 
  validateBody,
  AuditEventType 
} from '../middleware';
```

### Common Patterns

```typescript
// Public endpoint
router.get('/api/public/data', 
  middleware.public,
  handler
);

// Authenticated read
router.get('/api/plans',
  middleware.read,
  handler
);

// Authenticated write with validation
router.post('/api/plans',
  middleware.write,
  validateBody(planSchema),
  handler
);

// File upload
router.post('/api/upload',
  middleware.upload(['image/jpeg', 'image/png']),
  handler
);

// Admin operation
router.delete('/api/users/:id',
  middleware.admin,
  handler
);

// AI operation
router.post('/api/ai/generate',
  middleware.ai,
  validateBody(generateSchema),
  handler
);
```

## Benefits

1. **Reduced Duplication**: Common patterns are pre-composed
2. **Consistent Error Handling**: All errors flow through unified handlers
3. **Better Performance**: Optimized middleware ordering and conditional execution
4. **Easier Testing**: Middleware chains can be tested as units
5. **Type Safety**: Full TypeScript support with proper types
6. **Flexibility**: Easy to create custom chains for specific needs

## Troubleshooting

### Issue: Missing middleware functionality
**Solution**: Check if it's available in a pre-built chain or create a custom chain

### Issue: Middleware executing in wrong order
**Solution**: Use the compose() function to control exact ordering

### Issue: Validation not working
**Solution**: Ensure you're using the correct validation function (validateBody, validateQuery, etc.)

### Issue: Audit logs not appearing
**Solution**: Check that you're using a chain that includes audit middleware or add it explicitly

## Next Steps

1. Update all route files to use new middleware chains
2. Remove old middleware imports
3. Delete deprecated middleware files
4. Update tests to use new middleware structure
5. Monitor performance improvements