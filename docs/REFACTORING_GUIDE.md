# Refactoring Guide

**Last Updated**: 2025-07-03
**Version**: 1.0

## Overview

This document describes the comprehensive refactoring performed on the Teaching Engine 2.0 codebase to improve maintainability, scalability, and code organization.

## Architecture Improvements

### 1. API Consolidation

The monolithic `api.ts` file (2,202 lines) has been broken down into domain-specific modules:

- **Authentication**: `/routes/authEndpoints.ts`
- **User Management**: `/routes/user.ts`
- **Curriculum**: `/routes/curriculum-expectations.ts`, `/routes/curriculumImport.ts`
- **Planning**: `/routes/long-range-plans.ts`, `/routes/unit-plans.ts`, `/routes/etfo-lesson-plans.ts`
- **Calendar**: `/routes/calendar-events.ts`
- **Daybook**: `/routes/daybook-entries.ts`
- **Templates**: `/routes/templates.ts`
- **AI Features**: `/routes/ai-planning.ts`, `/routes/ai-activity-generation.ts`
- **Teacher Features**: `/routes/newsletters.ts`, `/routes/substitute-plans.ts`

### 2. Service Layer Refactoring

#### BaseService Pattern

All services now extend `BaseService` which provides:
- Lifecycle management (initialization, shutdown)
- Health checks and dependency tracking
- Performance metrics collection
- Consistent error handling
- Logging integration

```typescript
export abstract class BaseService {
  protected abstract initialize(): Promise<void>;
  protected abstract checkDependencies(): Record<string, boolean>;
  protected async executeWithMetrics<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T>;
}
```

#### Refactored Services

All services have been migrated to the `/services/refactored/` directory:
- `authService.ts` - Authentication and authorization
- `curriculumImportService.ts` - Curriculum import handling
- `templateService.ts` - Template management
- `newsletterService.ts` - Newsletter generation
- `substitutePlanService.ts` - Substitute plan creation
- `aiActivityGeneratorService.ts` - AI activity generation
- `aiDraftService.ts` - AI draft generation
- `aiPlanningAssistant.ts` - AI planning assistance
- `aiPromptTemplateService.ts` - AI prompt management
- `llmService.ts` - LLM integration
- `embeddingService.ts` - Text embeddings

### 3. Modular Architecture

#### Curriculum Import Module

The curriculum import service has been broken down into:

```
/services/curriculum/
├── parsers/
│   ├── CurriculumParser.ts (base)
│   ├── CSVParser.ts
│   ├── ExcelParser.ts
│   ├── PDFParser.ts
│   ├── JSONParser.ts
│   └── ParserFactory.ts
├── validators/
│   └── CurriculumValidator.ts
└── transformers/
    └── CurriculumTransformer.ts
```

#### Template Module

The template service has been modularized into:

```
/services/templates/
├── providers/
│   ├── TemplateProvider.ts (base)
│   ├── LessonTemplateProvider.ts
│   ├── NewsletterTemplateProvider.ts
│   └── ReportTemplateProvider.ts
├── engines/
│   ├── RenderEngine.ts (base)
│   ├── HandlebarsEngine.ts
│   └── PDFEngine.ts
└── data/
    └── TemplateFetcher.ts
```

### 4. Rate Limiting Consolidation

Rate limiting configuration has been centralized in `/middleware/rateLimiter.ts`:

```typescript
export const rateLimiters = {
  api: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }),
  auth: createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }),
  ai: createRateLimiter({ windowMs: 60 * 1000, max: 10 }),
  upload: createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 }),
  read: createRateLimiter({ windowMs: 60 * 1000, max: 100 }),
  write: createRateLimiter({ windowMs: 60 * 1000, max: 50 })
};
```

## Design Patterns Used

### 1. Singleton Pattern
- Services that should have only one instance (e.g., AuthService)
- Ensures consistent state across the application

### 2. Factory Pattern
- `ParserFactory` for creating appropriate parsers based on file type
- `RateLimiterFactory` for creating rate limiters with different configurations

### 3. Strategy Pattern
- Template providers implement different strategies for template selection
- Authentication strategies for different auth methods

### 4. Decorator Pattern
- BaseService decorates service methods with metrics collection
- Middleware decorates routes with authentication and rate limiting

## Migration Guide

### Updating Imports

Old imports:
```typescript
import { curriculumImportService } from '../services/curriculumImportService';
import { templateService } from '../services/templateService';
```

New imports:
```typescript
import { curriculumImportService } from '../services/refactored/curriculumImportService';
import { templateService } from '../services/refactored/templateService';
```

### Using the New Service Pattern

```typescript
// Old service
export class MyService {
  async doSomething() {
    // Direct implementation
  }
}

// New service
export class MyService extends BaseService {
  protected async initialize(): Promise<void> {
    // Initialization logic
  }

  protected checkDependencies(): Record<string, boolean> {
    return {
      ...super.checkDependencies(),
      database: !!prisma,
    };
  }

  async doSomething() {
    return this.executeWithMetrics(async () => {
      // Implementation with automatic metrics
    }, 'doSomething');
  }
}
```

## Testing

Comprehensive test suites have been created for all refactored modules:

- `BaseService.test.ts` - Tests lifecycle, metrics, health checks
- `CSVParser.test.ts` - Tests CSV parsing with various formats
- `CurriculumValidator.test.ts` - Tests validation logic
- `LessonTemplateProvider.test.ts` - Tests template selection
- `HandlebarsEngine.test.ts` - Tests template rendering

Run tests with:
```bash
pnpm test
```

## Benefits

1. **Improved Maintainability**: Smaller, focused modules are easier to understand and modify
2. **Better Testability**: Modular design allows for comprehensive unit testing
3. **Performance Monitoring**: Built-in metrics collection for all service operations
4. **Consistent Error Handling**: Centralized error handling through BaseService
5. **Scalability**: Easy to add new parsers, providers, or services
6. **Type Safety**: Full TypeScript coverage with proper interfaces

## Future Improvements

1. **Caching Layer**: Add Redis caching to BaseService
2. **Event System**: Implement event-driven architecture for service communication
3. **API Versioning**: Support multiple API versions
4. **GraphQL**: Consider GraphQL for more flexible API queries
5. **Microservices**: Services are ready to be extracted into microservices if needed