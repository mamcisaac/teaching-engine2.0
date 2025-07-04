# Common Patterns and Code Duplication Analysis

## Executive Summary

After analyzing the server/src directory, I've identified several patterns and duplicated code that could be extracted into shared utilities. These patterns fall into 8 main categories with specific opportunities for consolidation.

## 1. Error Handling Patterns

### Current State
- **69 files** use try-catch blocks with similar patterns
- Inconsistent error logging and response formatting
- Repetitive error status codes and messages

### Common Pattern Found:
```typescript
try {
  // ... business logic
} catch (error) {
  log('Error in operation:', error);
  res.status(500).json({
    error: 'Failed to perform operation',
    message: error instanceof Error ? error.message : 'Unknown error'
  });
}
```

### Recommendation: Create Unified Error Handler
```typescript
// utils/errorHandling.ts
export const asyncHandler = (fn: Function) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const standardErrorResponse = (res: Response, error: unknown, defaultMessage: string) => {
  const message = error instanceof Error ? error.message : defaultMessage;
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  
  logger.error(defaultMessage, error);
  res.status(statusCode).json({
    success: false,
    error: defaultMessage,
    message
  });
};
```

## 2. Validation Schemas and Logic

### Current State
- **29 files** use Zod validation with `.safeParse()` or `.parse()`
- Duplicated validation patterns for common fields
- Inconsistent error formatting for validation failures

### Common Patterns:
- Title validation (max 255 chars, no HTML)
- Date range validation
- Grade validation (1-12)
- Pagination parameters
- Bilingual field validation

### Recommendation: Expand Existing Validation Module
The `routes/base/validation.ts` already provides good patterns. Recommend:
1. Move to `utils/validation/` directory
2. Add more reusable schemas
3. Create validation middleware factory

## 3. Date/Time Manipulation

### Current State
- **74 files** use date operations
- Common patterns: `new Date()`, `Date.now()`, `.toISOString()`
- Repeated date range calculations (e.g., "two weeks ago")

### Common Patterns:
```typescript
// Repeated pattern for date ranges
const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
const oneMonthAgo = new Date();
oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
```

### Recommendation: Create Date Utilities
```typescript
// utils/dateHelpers.ts
export const dateHelpers = {
  daysAgo: (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000),
  weeksAgo: (weeks: number) => dateHelpers.daysAgo(weeks * 7),
  monthsAgo: (months: number) => {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    return date;
  },
  formatDateRange: (start: Date, end: Date) => 
    `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
  isWithinRange: (date: Date, start: Date, end: Date) =>
    date >= start && date <= end
};
```

## 4. Performance Measurement

### Current State
- **23 files** use performance measurement
- Good existing pattern in `middleware/metrics.ts`
- Duplicated timing logic in various route handlers

### Recommendation: Promote Existing Patterns
The `middleware/metrics.ts` provides excellent patterns:
- `withMetrics` decorator
- `recordDatabaseQuery` wrapper
- Performance percentile calculations

Recommend creating a simpler wrapper for common cases:
```typescript
// utils/performance.ts
export const measureAsync = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    metricsStore.observeHistogram('operation_duration_ms', duration, { operation });
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    metricsStore.observeHistogram('operation_duration_ms', duration, { 
      operation, 
      error: 'true' 
    });
    throw error;
  }
};
```

## 5. Common Response Patterns

### Current State
- **46 files** use similar response patterns
- Inconsistent success/error response structures
- Repeated status code and JSON formatting

### Common Patterns:
```typescript
// Success responses
res.json({ success: true, data: result });
res.status(201).json(result);

// Error responses
res.status(400).json({ error: 'Invalid input', details: validation.error.errors });
res.status(404).json({ error: 'Resource not found' });
res.status(500).json({ error: 'Internal server error' });
```

### Recommendation: Create Response Helpers
```typescript
// utils/responseHelpers.ts
export const apiResponse = {
  success: (res: Response, data: any, statusCode = 200) => {
    res.status(statusCode).json({ success: true, data });
  },
  
  error: (res: Response, message: string, statusCode = 500, details?: any) => {
    res.status(statusCode).json({ 
      success: false, 
      error: message,
      ...(details && { details })
    });
  },
  
  notFound: (res: Response, resource: string) => {
    apiResponse.error(res, `${resource} not found`, 404);
  },
  
  validationError: (res: Response, errors: any) => {
    apiResponse.error(res, 'Validation failed', 400, errors);
  }
};
```

## 6. Database Query Patterns

### Current State
- **43 files** use Prisma queries
- Repeated patterns for user-scoped queries
- Common include/select patterns

### Common Patterns:
```typescript
// User-scoped queries
await prisma.model.findMany({
  where: { userId, ...otherFilters },
  orderBy: { createdAt: 'desc' },
  take: limit,
  skip: offset
});

// Common includes
include: {
  user: { select: { id: true, name: true, email: true } },
  _count: { select: { children: true } }
}
```

### Recommendation: Create Query Builders
```typescript
// utils/queryBuilders.ts
export const userScopedQuery = (userId: string, filters?: any) => ({
  where: { userId, ...filters }
});

export const paginatedQuery = (limit: number, offset: number, orderBy?: any) => ({
  take: limit,
  skip: offset,
  orderBy: orderBy || { createdAt: 'desc' }
});

export const withUserInfo = () => ({
  include: {
    user: { select: { id: true, name: true, email: true } }
  }
});
```

## 7. Transformation Patterns

### Current State
- **71 files** use array transformations
- Repeated mapping/filtering/reducing patterns
- Common data sanitization logic

### Common Patterns:
```typescript
// Sanitizing arrays
.map(str => str.trim())
.filter(str => str.length > 0)

// Transforming to options
.map(item => ({ value: item.id, label: item.name }))

// Grouping by property
.reduce((acc, item) => {
  const key = item.category;
  if (!acc[key]) acc[key] = [];
  acc[key].push(item);
  return acc;
}, {})
```

### Recommendation: Create Transform Utilities
```typescript
// utils/transformers.ts
export const transformers = {
  sanitizeStringArray: (arr: string[]) => 
    arr.map(s => s.trim()).filter(s => s.length > 0),
  
  toOptions: <T>(items: T[], valueFn: (item: T) => any, labelFn: (item: T) => string) =>
    items.map(item => ({ value: valueFn(item), label: labelFn(item) })),
  
  groupBy: <T>(items: T[], keyFn: (item: T) => string) =>
    items.reduce((acc, item) => {
      const key = keyFn(item);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {} as Record<string, T[]>),
  
  unique: <T>(items: T[], keyFn?: (item: T) => any) => {
    if (!keyFn) return [...new Set(items)];
    const seen = new Set();
    return items.filter(item => {
      const key = keyFn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
};
```

## 8. Logging Patterns

### Current State
- Inconsistent use of debug vs console.log
- Repeated logger initialization
- Similar log formatting patterns

### Recommendation: Standardize on Existing Logger
The existing `logger.ts` provides good patterns. Recommend:
1. Create logger factory for module-specific loggers
2. Add structured logging helpers
3. Remove all console.log usage

## Implementation Priority

1. **High Priority** (Most impact, easiest to implement):
   - Error handling utilities
   - Response helpers
   - Date/time utilities

2. **Medium Priority** (Good value, moderate effort):
   - Validation schema consolidation
   - Transform utilities
   - Query builders

3. **Low Priority** (Already have good patterns):
   - Performance measurement (existing metrics.ts is good)
   - Logging (existing logger.ts is sufficient)

## Next Steps

1. Create a `server/src/utils/common/` directory
2. Implement utilities in order of priority
3. Create migration guide for existing code
4. Add tests for all new utilities
5. Gradually refactor existing code to use utilities

## Estimated Impact

- **Code Reduction**: ~20-30% in route handlers
- **Consistency**: Standardized error handling and responses
- **Maintainability**: Single source of truth for common patterns
- **Testing**: Easier to test isolated utilities
- **Performance**: Potential for optimized implementations