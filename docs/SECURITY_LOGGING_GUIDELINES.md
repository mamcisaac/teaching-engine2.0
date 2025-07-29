# Security Logging Guidelines

## Overview

This document outlines the security-critical logging practices for the Teaching Engine 2.0 codebase to prevent sensitive data exposure in production environments.

## Current Status

- **Total console statements found**: 3,726 across 385 files
- **Critical files reviewed**: All authentication, payment, and user data handling files
- **Result**: Critical server-side files are already using proper structured logging

## Logging Infrastructure

### Server-Side Logging
- **Service**: `server/src/utils/structuredLogger.ts`
- **Features**:
  - Structured JSON logging with winston
  - Correlation IDs for request tracing
  - Automatic sanitization of sensitive fields (passwords, tokens, API keys)
  - Performance monitoring
  - Different log levels based on environment

### Client-Side Logging  
- **Service**: `client/src/utils/logger.ts`
- **Features**:
  - Environment-aware logging (dev vs production)
  - Log history management
  - Error reporting integration
  - Performance logging

## Security Measures

### 1. No Console Statements in Production Code

Console statements can leak sensitive information in production. Use proper logging services instead:

```typescript
// ❌ BAD - Don't use console
console.log('User logged in:', user);
console.error('Payment failed:', paymentDetails);

// ✅ GOOD - Use structured logging
// Server-side
structuredLogger.info('User logged in', { userId: user.id });
structuredLogger.error('Payment failed', error, { orderId: order.id });

// Client-side
logger.info('User action: login', { userId: user.id });
logger.error('Payment processing failed', error);
```

### 2. Sensitive Data Sanitization

The structured logger automatically sanitizes sensitive fields:
- passwords
- tokens
- secrets
- apiKeys
- creditCard information
- authorization headers
- cookies

### 3. ESLint Rules

Three ESLint configurations are available:

1. **Standard** (`.eslintrc.json`): Allows console.warn and console.error
2. **Strict** (`.eslintrc.strict.json`): No console statements allowed
3. **Security** (`.eslintrc.security.json`): Enhanced security rules for sensitive files

To run security linting:
```bash
npm run lint -- --config .eslintrc.security.json
```

## Migration Tool

A migration script is available to automatically replace console statements with logger calls.

### Usage

```bash
# Migrate a specific directory
node scripts/migrate-console-to-logger.js ./client/src/components

# Migrate a specific file
node scripts/migrate-console-to-logger.js ./client/src/services/apiService.ts

# Migrate entire source (be careful!)
node scripts/migrate-console-to-logger.js ./src
```

### Features
- Automatically adds logger imports
- Preserves error objects in error logging
- Creates backups before modifying files
- Skips test files and logger implementations
- Provides detailed migration report

### Post-Migration Steps
1. Review changes in your code editor
2. Run tests to ensure functionality
3. Delete backup files when satisfied:
   ```bash
   find . -name "*.console-backup" -delete
   ```

## Best Practices

### 1. Use Appropriate Log Levels

```typescript
// Debug - Detailed information for debugging
logger.debug('Cache hit for user preferences', { userId, cacheKey });

// Info - General informational messages
logger.info('User registration completed', { userId, email: user.email });

// Warn - Warning messages
logger.warn('API rate limit approaching', { remaining: 10, userId });

// Error - Error messages with error objects
logger.error('Database connection failed', error, { retryCount: 3 });
```

### 2. Never Log Sensitive Data

```typescript
// ❌ BAD
logger.info('User login', { 
  email: user.email, 
  password: user.password,  // NEVER log passwords!
  creditCard: user.creditCard  // NEVER log payment details!
});

// ✅ GOOD
logger.info('User login', { 
  userId: user.id,
  email: user.email,
  loginMethod: 'email'
});
```

### 3. Use Structured Data

```typescript
// ❌ BAD - String concatenation
logger.info(`User ${userId} performed ${action} on ${resource}`);

// ✅ GOOD - Structured data
logger.info('User action', {
  userId,
  action,
  resource,
  timestamp: Date.now()
});
```

### 4. Include Correlation IDs

The server-side logger automatically includes correlation IDs. For client-side, include them manually:

```typescript
logger.info('API request', {
  endpoint: '/api/users',
  method: 'GET',
  correlationId: getCorrelationId()
});
```

## Environment Variables

### Server-Side
- `LOG_LEVEL`: Set logging level (error, warn, info, debug, trace)
- `NODE_ENV`: Production mode disables console output

### Client-Side
- `VITE_ENABLE_LOGGING`: Enable logging in production
- `NODE_ENV` / `import.meta.env.DEV`: Development mode detection

## Monitoring and Alerts

In production:
1. Logs are written to files (server-side)
2. Error logs are sent to error reporting service
3. Structured format enables easy parsing and alerting
4. Performance warnings for slow operations

## Compliance

This logging approach helps comply with:
- GDPR - No personal data in logs without proper handling
- PCI DSS - No payment card data in logs
- Security best practices - No sensitive credentials exposed

## Regular Audits

Run these commands regularly to check for console statements:

```bash
# Count console statements
grep -r "console\." ./src --include="*.ts" --include="*.tsx" | wc -l

# Find files with console statements (excluding tests)
grep -r "console\." ./src --include="*.ts" --include="*.tsx" -l | grep -v test

# Run security linting
npm run lint -- --config .eslintrc.security.json
```

## Questions or Concerns?

If you need to log something sensitive for debugging:
1. Use the appropriate log level (debug/trace)
2. Ensure it's disabled in production
3. Consider using feature flags
4. Document why it's necessary

Remember: **When in doubt, don't log it!**