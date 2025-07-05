# Error Reporting Integration Guide

## Overview

Teaching Engine 2.0 now includes comprehensive error reporting integration with Sentry, providing privacy-safe error tracking for both client and server applications.

## Features

### 1. Privacy-First Design
- Automatic sanitization of sensitive data (passwords, tokens, API keys, SSNs, credit cards)
- Email masking (shows only first 3 characters)
- IP address masking (shows only first two octets)
- PII pattern detection and redaction
- Filtering of sensitive console messages

### 2. Error Categorization
Errors are automatically categorized to help with debugging:
- **Network errors**: Connection failures, timeouts
- **Authentication errors**: 401/403 responses, auth failures
- **Validation errors**: Input validation failures
- **React errors**: Component errors, TypeErrors, ReferenceErrors
- **API errors**: Backend API failures
- **System errors**: Uncaught exceptions, database errors

### 3. User Context Tracking
- Automatically tracks authenticated user context
- Clears context on logout
- Associates errors with user sessions

### 4. Mock Mode
- Development and testing mode that logs errors instead of sending to Sentry
- Enable with `SENTRY_MOCK=true` or `VITE_SENTRY_MOCK=true`

## Configuration

### Server Configuration

Add to your `.env` file:
```env
# Error Reporting (Sentry)
SENTRY_DSN=your-sentry-dsn-here
SENTRY_MOCK=false  # Set to true for testing

# OpenTelemetry (optional)
OTEL_ENABLED=false
OTEL_SERVICE_NAME=teaching-engine-api
OTEL_ENDPOINT=http://localhost:4318
```

### Client Configuration

Add to your `.env` file:
```env
# Error Reporting (Sentry)
VITE_SENTRY_DSN=your-sentry-dsn-here
VITE_SENTRY_MOCK=false  # Set to true for testing
```

## Installation

Install the required dependencies:

```bash
# Server dependencies
cd server
npm install @sentry/node @sentry/profiling-node

# Client dependencies
cd ../client
npm install @sentry/react @sentry/tracing @sentry/replay
```

## Implementation Details

### Server-Side

1. **Error Reporting Service** (`server/src/services/monitoring/errorReportingService.ts`)
   - Singleton service for error capture
   - Automatic PII sanitization
   - Error categorization
   - Integration with OpenTelemetry

2. **Error Middleware** (`server/src/middleware/core/error.ts`)
   - Captures all unhandled errors
   - Reports server errors (5xx) and unexpected client errors
   - Excludes expected errors (404, 401)

3. **Error Context Middleware** (`server/src/middleware/errorContext.ts`)
   - Adds request context to errors
   - Tracks request duration
   - Sets user context for authenticated requests

### Client-Side

1. **Error Reporting Service** (`client/src/services/errorReportingService.ts`)
   - Browser-specific error capture
   - Session replay on errors
   - Network and chunk load error handling
   - React Router integration

2. **Error Boundaries**
   - `GlobalErrorBoundary`: Catches all unhandled React errors
   - `AuthErrorBoundary`: Specialized handling for auth errors
   - `PlanningErrorBoundary`: Planning feature specific errors
   - `FormErrorBoundary`: Form submission errors
   - `AIErrorBoundary`: AI feature errors with graceful fallback

3. **Auth Context Integration**
   - Automatically sets user context on login
   - Clears context on logout

## Usage Examples

### Manual Error Capture

```typescript
// Server-side
import { errorReportingService } from './services/monitoring/errorReportingService';

try {
  // Your code
} catch (error) {
  errorReportingService.captureError(error, {
    operation: 'curriculum-import',
    fileType: 'pdf',
    userId: req.user?.id
  });
}

// Client-side
import { errorReportingService } from './services/errorReportingService';

try {
  // Your code
} catch (error) {
  errorReportingService.captureError(error, {
    component: 'LessonPlanner',
    action: 'save-draft'
  });
}
```

### Adding Breadcrumbs

```typescript
// Track user actions
errorReportingService.addBreadcrumb({
  message: 'User clicked save',
  category: 'user-action',
  level: 'info',
  data: {
    component: 'LessonPlanner',
    planId: '123'
  }
});
```

### Capturing Messages

```typescript
// Log important events
errorReportingService.captureMessage(
  'AI quota exceeded for user',
  'warning'
);
```

## Testing

### Mock Mode Testing

Set `SENTRY_MOCK=true` to test error reporting without sending to Sentry:

```typescript
// Errors will be logged to console instead of Sentry
[MOCK] Would capture error: {
  error: "Test error",
  stack: "Error: Test error\n    at ...",
  context: { /* sanitized context */ }
}
```

### Unit Tests

Both client and server include comprehensive test suites:
- `server/src/services/monitoring/__tests__/errorReportingService.unit.test.ts`
- `client/src/services/__tests__/errorReportingService.test.ts`

## Security Considerations

1. **No Student Data**: The app doesn't store student data, reducing privacy concerns
2. **Automatic Sanitization**: All sensitive fields are automatically redacted
3. **Configurable**: Can be completely disabled by not setting SENTRY_DSN
4. **GDPR Compliant**: User identifiers are hashed, emails are masked

## Monitoring Dashboard

When Sentry is configured, you'll have access to:
- Real-time error tracking
- Error trends and patterns
- User impact analysis
- Performance monitoring
- Session replays (client-side)
- Release tracking

## Best Practices

1. **Always provide context** when capturing errors manually
2. **Use appropriate severity levels** for messages
3. **Add breadcrumbs** for complex user workflows
4. **Test with mock mode** before deploying
5. **Review Sentry dashboards** regularly
6. **Set up alerts** for critical errors

## Troubleshooting

### Errors not appearing in Sentry
1. Check that SENTRY_DSN is correctly set
2. Verify you're not in development mode
3. Check that SENTRY_MOCK is false
4. Look for initialization errors in logs

### Too many errors being reported
1. Review error categorization
2. Adjust sampling rates in production
3. Filter out non-actionable errors
4. Use ignoreErrors configuration

### Performance impact
1. Reduce tracesSampleRate in production (currently 0.1)
2. Disable session replay if not needed
3. Use selective error capture for high-frequency operations