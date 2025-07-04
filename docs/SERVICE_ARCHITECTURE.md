# Service Architecture

**Last Updated**: 2025-07-04
**Version**: 2.0

## Service Layer Overview

The Teaching Engine 2.0 service layer follows a modular, extensible architecture designed for maintainability and scalability. The architecture has been significantly enhanced with the addition of standardized route handlers and optimized database operations.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Route Layer   │    │  Service Layer  │    │  Database Layer │
│                 │    │                 │    │                 │
│ BaseRouteHandler│───▶│   BaseService   │───▶│     Prisma      │
│                 │    │                 │    │   PostgreSQL    │
│  - CRUD Ops     │    │  - Business     │    │  - Optimized    │
│  - Auth         │    │    Logic        │    │    Queries      │
│  - Validation   │    │  - Data Access  │    │  - Performance  │
│  - Error Handle │    │  - Metrics      │    │    Monitoring   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Core Services

### BaseService

All services extend the `BaseService` abstract class, which provides:

```typescript
abstract class BaseService {
  // Lifecycle hooks
  protected abstract initialize(): Promise<void>;
  protected abstract checkDependencies(): Record<string, boolean>;
  
  // Metrics and monitoring
  protected async executeWithMetrics<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T>;
  
  // Health checks
  async healthCheck(): Promise<HealthCheckResult>;
  
  // Graceful shutdown
  async shutdown(): Promise<void>;
}
```

### Directory Structure

```
/server/src/
├── routes/
│   ├── base/                   # Route handler foundation
│   │   ├── BaseRouteHandler.ts # Abstract base class for all routes
│   │   ├── middleware.ts       # Common middleware functions
│   │   └── validation.ts       # Shared validation utilities
│   ├── optimizations/
│   │   └── queryOptimizations.ts # Database query optimization utilities
│   ├── DaybookEntriesRouteHandler.ts    # Daybook entries (12 lines)
│   ├── UnitPlansRouteHandler.ts         # Unit plans (12 lines)
│   ├── ETFOLessonPlansRouteHandler.ts   # Lesson plans (12 lines)
│   ├── TemplatesRouteHandler.ts         # Templates (12 lines)
│   ├── SubstitutePlansRouteHandler.ts   # Substitute plans (12 lines)
│   ├── ai-activity-generation.ts        # AI activity generation
│   ├── ai-planning.ts                   # AI planning assistance
│   ├── curriculumImport.ts              # Curriculum import
│   └── user.ts                          # User management
├── services/
│   ├── base/
│   │   └── BaseService.ts      # Abstract base class
│   ├── refactored/             # Production services
│   │   ├── authService.ts      # Authentication & authorization
│   │   ├── curriculumImportService.ts  # Curriculum import
│   │   ├── templateService.ts  # Template management
│   │   ├── newsletterService.ts # Newsletter generation
│   │   ├── substitutePlanService.ts # Substitute plans
│   │   ├── aiActivityGeneratorService.ts # AI activities
│   │   ├── aiDraftService.ts   # AI draft generation
│   │   ├── aiPlanningAssistant.ts # AI planning
│   │   ├── aiPromptTemplateService.ts # AI prompts
│   │   ├── llmService.ts       # LLM integration
│   │   └── embeddingService.ts # Text embeddings
│   ├── curriculum/             # Curriculum modules
│   ├── templates/              # Template modules
│   └── index.ts               # Service exports
└── middleware/
    ├── auth/                  # Authentication middleware
    ├── rateLimit/             # Rate limiting configuration
    └── rateLimiter.ts         # Legacy rate limiter
```

## Route Handler Architecture

### BaseRouteHandler Pattern

The new route architecture uses a standardized `BaseRouteHandler` abstract class that provides:

```typescript
export abstract class BaseRouteHandler<T = any> {
  protected router: Router;
  protected logger: winston.Logger;
  protected routeName: string;

  // Abstract methods - must be implemented
  protected abstract getService(): BaseService;
  protected abstract getValidationSchemas(): ValidationSchemas;
  protected abstract getCrudOperations(): CrudOperations<T>;

  // Optional override points
  protected setupCustomRoutes?(): void;
  protected handleList?(): Promise<void>;
  protected handleGet?(): Promise<void>;
  protected handleCreate?(): Promise<void>;
  protected handleUpdate?(): Promise<void>;
  protected handleDelete?(): Promise<void>;
}
```

### Code Reduction Achievement

| Route Handler | Original Lines | New Lines | Reduction |
|---------------|----------------|-----------|-----------|
| Templates | 715 | 12 | 98.3% |
| Daybook Entries | 701 | 12 | 98.3% |
| Unit Plans | 639 | 12 | 98.1% |
| ETFO Lesson Plans | 610 | 12 | 98.0% |
| Substitute Plans | 559 | 12 | 97.9% |
| **Total** | **2,665** | **48** | **98.2%** |

### Database Query Optimization

All route handlers now use centralized query optimization:

```typescript
// Performance monitoring
const result = await queryPerformance.monitorQuery(
  'queryName',
  () => optimizedQueries.paginatedQuery(model, where, options)
);

// Optimized includes to prevent N+1 queries
include: optimizedIncludes.resourceType

// Safe search with field validation
where: optimizedQueries.createSearchWhere(search, ['title', 'description'])

// Validated sorting to prevent SQL injection
orderBy: queryPerformance.createOptimizedSort(sortBy, sortOrder, allowedFields)
```

### Shared Utilities

#### Middleware (`/routes/base/middleware.ts`)
- `requireAuth`: Standardized authentication
- `asyncHandler`: Error handling wrapper
- `validateRequest`: Request validation with Zod

#### Validation (`/routes/base/validation.ts`)
- `commonValidations`: Reusable validation patterns
- `createValidationSchema`: Schema builders for pagination, sorting

#### Query Optimization (`/routes/optimizations/queryOptimizations.ts`)
- `optimizedQueries`: Centralized query patterns
- `optimizedIncludes`: Relationship loading patterns
- `queryPerformance`: Performance monitoring utilities

## Service Patterns

### Singleton Services

Services that maintain state or expensive resources use the singleton pattern:

```typescript
export class AuthService extends BaseService {
  private static instance: AuthService;
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
}
```

### Service Initialization

Services follow a consistent initialization pattern:

1. Constructor sets up basic properties
2. `initialize()` performs async setup (database connections, etc.)
3. `checkDependencies()` validates required resources
4. Service methods use `executeWithMetrics()` for monitoring

### Error Handling

All services use consistent error handling:

```typescript
async someMethod() {
  return this.executeWithMetrics(async () => {
    try {
      // Operation logic
    } catch (error) {
      this.logger.error('Operation failed', { error });
      throw new ServiceError('Operation failed', error);
    }
  }, 'someMethod');
}
```

## Module Architecture

### Curriculum Module

The curriculum module handles importing and processing curriculum data:

#### Parsers
- `CurriculumParser` - Abstract base class
- `CSVParser` - Handles CSV files
- `ExcelParser` - Handles Excel files
- `PDFParser` - Handles PDF files
- `JSONParser` - Handles JSON files
- `ParserFactory` - Creates appropriate parser

#### Validators
- `CurriculumValidator` - Validates parsed curriculum data
- Configurable validation rules
- Generates detailed validation reports

#### Transformers
- `CurriculumTransformer` - Transforms data for database storage
- Handles data normalization
- Manages relationships

### Template Module

The template module manages document templates and rendering:

#### Providers
- `TemplateProvider` - Abstract base class
- `LessonTemplateProvider` - Lesson plan templates
- `NewsletterTemplateProvider` - Newsletter templates
- `ReportTemplateProvider` - Report card templates

#### Engines
- `RenderEngine` - Abstract base class
- `HandlebarsEngine` - Handlebars template rendering
- `PDFEngine` - PDF generation using Puppeteer

#### Data
- `TemplateFetcher` - Retrieves template data
- Supports database and file system storage

## Service Communication

### Direct Dependencies

Services can depend on other services:

```typescript
class NewsletterService extends BaseService {
  constructor(
    private templateService: TemplateService,
    private aiService: AIService
  ) {
    super('NewsletterService');
  }
}
```

### Event-Based Communication

For loose coupling, services can communicate via events:

```typescript
// Publisher
this.eventEmitter.emit('curriculum.imported', { 
  userId, 
  expectationCount 
});

// Subscriber
this.eventEmitter.on('curriculum.imported', async (data) => {
  await this.updateUserStats(data);
});
```

## Performance Considerations

### Metrics Collection

All service operations are automatically monitored:

```typescript
{
  totalRequests: 1000,
  successfulRequests: 950,
  failedRequests: 50,
  operations: {
    'importCurriculum': {
      count: 100,
      totalDuration: 50000,
      averageDuration: 500
    }
  }
}
```

### Caching Strategy

Services implement caching where appropriate:

```typescript
class TemplateService extends BaseService {
  private cache = new Map<string, CachedTemplate>();
  
  async getTemplate(id: string) {
    if (this.cache.has(id)) {
      return this.cache.get(id);
    }
    // Fetch and cache
  }
}
```

### Resource Management

Services manage resources efficiently:

- Connection pooling for databases
- Reusable HTTP clients
- Proper cleanup in `shutdown()`

## Testing Strategy

### Unit Tests

Each service has comprehensive unit tests:

```typescript
describe('CurriculumImportService', () => {
  let service: CurriculumImportService;
  
  beforeEach(() => {
    service = new CurriculumImportService();
  });
  
  it('should parse CSV files', async () => {
    const result = await service.parseFile(csvBuffer, 'test.csv');
    expect(result.expectations).toHaveLength(10);
  });
});
```

### Integration Tests

Services are tested with real dependencies:

```typescript
describe('NewsletterService Integration', () => {
  it('should generate newsletter with real template', async () => {
    const newsletter = await service.generateNewsletter({
      userId: 1,
      weekOf: new Date()
    });
    expect(newsletter.content).toContain('Weekly Newsletter');
  });
});
```

## Security Considerations

### Authentication

All service methods that access user data verify permissions:

```typescript
async getUserData(userId: number, requesterId: number) {
  if (!this.canAccessUser(requesterId, userId)) {
    throw new UnauthorizedError();
  }
  // Proceed with operation
}
```

### Input Validation

Services validate all inputs:

```typescript
async importCurriculum(options: ImportOptions) {
  const validated = ImportOptionsSchema.parse(options);
  // Use validated options
}
```

### Rate Limiting

Services respect rate limits:

```typescript
@RateLimit({ requests: 10, window: '1m' })
async generateWithAI(prompt: string) {
  // AI generation logic
}
```

## Deployment Considerations

### Environment Configuration

Services use environment variables:

```typescript
class AIService extends BaseService {
  private apiKey = process.env.OPENAI_API_KEY;
  
  protected checkDependencies() {
    return {
      ...super.checkDependencies(),
      apiKey: !!this.apiKey
    };
  }
}
```

### Health Monitoring

Services expose health endpoints:

```json
{
  "status": "healthy",
  "service": "CurriculumImportService",
  "dependencies": {
    "logger": true,
    "database": true,
    "fileSystem": true
  },
  "lastCheck": "2025-07-03T10:00:00Z"
}
```

### Graceful Shutdown

Services handle shutdown signals:

```typescript
process.on('SIGTERM', async () => {
  await Promise.all(
    services.map(service => service.shutdown())
  );
  process.exit(0);
});
```