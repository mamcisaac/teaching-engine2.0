# DATA_FLOW.md - Teaching Engine 2.0 System Architecture

> **Last Updated**: 2025-07-03  
> **Version**: 1.0  
> **Architecture**: Monorepo with Frontend/Backend/Database Separation

---

## 🏗️ System Overview

Teaching Engine 2.0 follows a traditional 3-tier architecture with a React frontend, Express.js backend, and SQLite/PostgreSQL database. The system is containerized with Docker and uses a monorepo structure for code organization.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   Database      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│ SQLite/Postgres │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐              ┌───▼───┐              ┌────▼────┐
    │ Tailwind│              │ Prisma│              │ Schemas │
    │ shadcn  │              │  ORM  │              │ Migrations│
    └─────────┘              └───────┘              └─────────┘
```

---

## 📁 Project Structure

### Monorepo Organization

```
teaching-engine2.0/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Route-based page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utility functions and configs
│   │   └── types/            # TypeScript type definitions
│   ├── public/               # Static assets
│   └── dist/                 # Built frontend assets
├── server/                   # Express.js backend
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── services/         # Business logic services
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript types
│   └── dist/                 # Built server code
├── packages/
│   └── database/             # Prisma database package
│       ├── prisma/
│       │   ├── schema.prisma # Database schema definition
│       │   ├── migrations/   # Database migration files
│       │   └── seed.ts       # Database seeding script
│       └── src/              # Database client exports
├── docs/                     # Documentation
└── docker/                   # Docker configuration
```

---

## 🔄 Data Flow Patterns

### 1. ETFO Planning Hierarchy Flow

The core data model follows Ontario's ETFO 5-level planning structure:

```
Curriculum Expectations (Province)
         ↓
Long-Range Plans (Year)
         ↓
Unit Plans (Multi-week)
         ↓
Lesson Plans (Daily)
         ↓
Daybook Entries (Real-time)
```

#### Data Relationships

```typescript
CurriculumExpectation {
  id: number
  code: string (e.g., "FLA1.1")
  description: string
  subject: string
  grade: string
  strand: string
}
  ↓ (many-to-many)
LongRangePlan {
  id: number
  title: string
  academicYear: string
  expectations: CurriculumExpectation[]
}
  ↓ (one-to-many)
UnitPlan {
  id: number
  title: string
  longRangePlanId: number
  startDate: Date
  endDate: Date
  expectations: CurriculumExpectation[]
}
  ↓ (one-to-many)
LessonPlan {
  id: number
  title: string
  unitPlanId: number
  date: Date
  activities: Activity[]
  expectations: CurriculumExpectation[]
}
  ↓ (one-to-one)
DaybookEntry {
  id: number
  date: Date
  lessonPlanId: number
  reflectionNotes: string
  completionStatus: enum
  nextSteps: string
}
```

### 2. Request-Response Flow

#### Frontend to Backend Communication

```
┌─────────────────┐
│ User Interaction│
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    HTTP Request     ┌─────────────────┐
│ React Component │───────────────────►│ Express Route   │
└─────────────────┘                    └─────────┬───────┘
          ▲                                      │
          │                                      ▼
          │            HTTP Response    ┌─────────────────┐
          └─────────────────────────────│ Service Layer   │
                                       └─────────┬───────┘
                                                 │
                                                 ▼
                                       ┌─────────────────┐
                                       │ Prisma ORM      │
                                       └─────────┬───────┘
                                                 │
                                                 ▼
                                       ┌─────────────────┐
                                       │ Database        │
                                       └─────────────────┘
```

#### Typical API Flow Example

```javascript
// 1. Frontend Action (React)
const createLessonPlan = async (lessonData) => {
  const response = await fetch('/api/planning/lessons', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lessonData),
  });
  return response.json();
};

// 2. Backend Route (Express)
app.post('/api/planning/lessons', authenticateToken, async (req, res) => {
  try {
    const lessonPlan = await lessonService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: lessonPlan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. Service Layer (Business Logic)
const lessonService = {
  async create(data, userId) {
    const lesson = await prisma.lessonPlan.create({
      data: {
        ...data,
        createdBy: userId,
        expectations: {
          connect: data.expectationIds.map((id) => ({ id })),
        },
      },
      include: {
        expectations: true,
        unitPlan: true,
        activities: true,
      },
    });
    return lesson;
  },
};
```

---

## 🔌 Component Interactions

### Frontend Component Architecture

```
App (Root)
├── AuthProvider (Context)
├── Router
│   ├── DashboardPage
│   │   ├── ProgressOverview
│   │   ├── RecentActivities
│   │   └── QuickActions
│   ├── PlanningPage
│   │   ├── PlanningNavigation
│   │   ├── LongRangePlans
│   │   ├── UnitPlans
│   │   ├── LessonPlans
│   │   └── DaybookEntries
│   ├── CurriculumPage
│   │   ├── ExpectationsList
│   │   ├── ProgressTracking
│   │   └── CoverageAnalytics
│   └── CommunicationPage
│       ├── MessageComposer
│       ├── MessageHistory
│       └── DeliveryAnalytics
└── GlobalComponents
    ├── Navigation
    ├── Notifications
    └── LoadingStates
```

### State Management Patterns

#### React Query for Server State

```typescript
// Custom hook for lesson plans
const useLessonPlans = (unitId: number) => {
  return useQuery({
    queryKey: ['lessonPlans', unitId],
    queryFn: () => lessonPlanService.getByUnit(unitId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutation for creating lessons
const useCreateLessonPlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: lessonPlanService.create,
    onSuccess: (newLesson) => {
      // Invalidate and refetch lesson plans
      queryClient.invalidateQueries(['lessonPlans']);
      // Optimistically update cache
      queryClient.setQueryData(['lessonPlans', newLesson.unitPlanId], (old) => [
        ...(old || []),
        newLesson,
      ]);
    },
  });
};
```

#### Context for Global State

```typescript
// Authentication context
const AuthContext = createContext<{
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}>({});

// Settings context
const SettingsContext = createContext<{
  theme: 'light' | 'dark';
  language: 'en' | 'fr';
  notifications: NotificationSettings;
  updateSettings: (settings: Partial<Settings>) => void;
}>({});
```

---

## 🗄️ Database Interaction Patterns

### Prisma ORM Integration

#### Schema Relationships

```prisma
model CurriculumExpectation {
  id          Int    @id @default(autoincrement())
  code        String @unique
  description String
  subject     String
  grade       String
  strand      String

  // Relationships
  longRangePlans LongRangePlanExpectation[]
  unitPlans      UnitPlanExpectation[]
  lessonPlans    LessonPlanExpectation[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model LessonPlan {
  id          Int      @id @default(autoincrement())
  title       String
  date        DateTime
  duration    Int      // minutes
  objective   String?
  materials   String[] // JSON array
  assessment  String?

  // Foreign keys
  unitPlanId  Int
  createdBy   Int

  // Relationships
  unitPlan      UnitPlan @relation(fields: [unitPlanId], references: [id])
  createdByUser User     @relation(fields: [createdBy], references: [id])
  expectations  LessonPlanExpectation[]
  activities    Activity[]
  daybookEntry  DaybookEntry?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Common Query Patterns

```typescript
// Complex query with nested relationships
const getLessonPlanWithDetails = async (id: number) => {
  return await prisma.lessonPlan.findUnique({
    where: { id },
    include: {
      unitPlan: {
        include: {
          longRangePlan: true,
        },
      },
      expectations: {
        include: {
          expectation: true,
        },
      },
      activities: true,
      daybookEntry: true,
      createdByUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

// Aggregation query for progress tracking
const getCurriculumProgress = async (userId: number) => {
  const totalExpectations = await prisma.curriculumExpectation.count();

  const coveredExpectations = await prisma.curriculumExpectation.count({
    where: {
      lessonPlans: {
        some: {
          lessonPlan: {
            createdBy: userId,
            daybookEntry: {
              completionStatus: 'COMPLETED',
            },
          },
        },
      },
    },
  });

  return {
    total: totalExpectations,
    covered: coveredExpectations,
    percentage: (coveredExpectations / totalExpectations) * 100,
  };
};
```

---

## 🚀 Performance Optimizations

### Frontend Performance

#### Code Splitting

```typescript
// Lazy loading for route components
const PlanningPage = lazy(() => import('../pages/PlanningPage'));
const CurriculumPage = lazy(() => import('../pages/CurriculumPage'));

// Component lazy loading
const ExpensiveChart = lazy(() => import('../components/ExpensiveChart'));
```

#### Memoization

```typescript
// Expensive calculations
const curriculumProgress = useMemo(() => {
  return calculateProgress(lessonPlans, expectations);
}, [lessonPlans, expectations]);

// Component memoization
const LessonPlanItem = memo(({ lessonPlan, onEdit, onDelete }) => {
  return (
    <div className="lesson-plan-item">
      {/* Component content */}
    </div>
  );
});
```

### Backend Performance

#### Database Optimization

```typescript
// Efficient pagination
const getLessonPlansPage = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [lessonPlans, total] = await Promise.all([
    prisma.lessonPlan.findMany({
      skip,
      take: limit,
      include: {
        expectations: {
          include: {
            expectation: {
              select: {
                id: true,
                code: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    }),
    prisma.lessonPlan.count(),
  ]);

  return {
    data: lessonPlans,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
```

#### Caching Strategy

```typescript
// Redis cache for frequently accessed data
const cache = new Redis(process.env.REDIS_URL);

const getCachedCurriculumExpectations = async () => {
  const cached = await cache.get('curriculum:expectations');
  if (cached) {
    return JSON.parse(cached);
  }

  const expectations = await prisma.curriculumExpectation.findMany();
  await cache.setex('curriculum:expectations', 3600, JSON.stringify(expectations));

  return expectations;
};
```

---

## 🔐 Security Data Flow

### Authentication Flow

```
1. User Login Request
   ├── Validate Credentials (bcrypt)
   ├── Generate JWT Token
   └── Return Token + User Data

2. Authenticated Requests
   ├── Extract JWT from Header
   ├── Verify Token Signature
   ├── Extract User ID from Payload
   └── Attach User to Request Context

3. Authorization Check
   ├── Check User Role
   ├── Verify Resource Ownership
   └── Allow/Deny Access
```

### Data Validation Pipeline

```typescript
// Input validation with Zod
const lessonPlanSchema = z.object({
  title: z.string().min(1).max(255),
  date: z.string().datetime(),
  duration: z.number().min(1).max(480),
  unitPlanId: z.number().positive(),
  expectationIds: z.array(z.number()).optional(),
});

// Middleware validation
const validateLessonPlan = (req, res, next) => {
  try {
    req.body = lessonPlanSchema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.issues,
    });
  }
};
```

---

## 📊 Data Processing Workflows

### AI-Powered Features Flow

#### Activity Generation

```
1. User Request
   ├── Extract Requirements (expectations, duration, etc.)
   ├── Context Gathering (previous activities, student data)
   └── Send to AI Service

2. AI Processing
   ├── Analyze Curriculum Expectations
   ├── Generate Activity Suggestions
   ├── Rank by Relevance and Quality
   └── Return Structured Results

3. Result Processing
   ├── Validate Generated Content
   ├── Format for Frontend Display
   ├── Store in Cache for Performance
   └── Return to User
```

#### Content Translation

```
1. Translation Request
   ├── Detect Source Language
   ├── Extract Context (newsletter, report, etc.)
   └── Send to Translation Service

2. Translation Processing
   ├── Apply Educational Context
   ├── Generate Multiple Options
   ├── Confidence Scoring
   └── Return Best Translation

3. Result Enhancement
   ├── Grammar Check
   ├── Educational Terminology Validation
   └── Return with Alternatives
```

---

## 🔄 Real-time Updates

### WebSocket Integration (Future)

```typescript
// Real-time collaboration on lesson plans
const lessonPlanSocket = io('/lesson-plans');

lessonPlanSocket.on('lesson-updated', (update) => {
  // Update local state
  queryClient.setQueryData(['lessonPlan', update.id], update);

  // Show notification to user
  showNotification(`Lesson plan "${update.title}" was updated`);
});

// Broadcasting updates
const updateLessonPlan = async (id, data) => {
  const updated = await prisma.lessonPlan.update({
    where: { id },
    data,
  });

  // Broadcast to all connected clients
  io.to(`lesson-${id}`).emit('lesson-updated', updated);

  return updated;
};
```

---

## 📱 Progressive Web App Features

### Offline Capability

```typescript
// Service worker for offline functionality
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/planning/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }),
    );
  }
});

// Background sync for lesson plan updates
const syncLessonPlans = async () => {
  const offlineUpdates = await getOfflineUpdates();

  for (const update of offlineUpdates) {
    try {
      await fetch('/api/planning/lessons/' + update.id, {
        method: 'PATCH',
        body: JSON.stringify(update.data),
      });
      await markAsSynced(update.id);
    } catch (error) {
      // Retry later
      console.error('Sync failed:', error);
    }
  }
};
```

---

## 📈 Monitoring and Analytics

### Application Metrics

```typescript
// Performance monitoring
const trackApiPerformance = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.histogram('api_request_duration', duration, {
      method: req.method,
      route: req.route?.path || 'unknown',
      status: res.statusCode,
    });
  });

  next();
};

// User behavior analytics
const trackUserAction = (action, metadata) => {
  analytics.track({
    event: action,
    userId: req.user?.id,
    properties: {
      ...metadata,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
    },
  });
};
```

---

## 🔗 External Integrations

### Third-Party Service Integration

```typescript
// Email service integration
const emailService = {
  async sendNewsletter(message, recipients) {
    const response = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipients,
        subject: message.title,
        html: message.contentEn,
        attachments: message.attachments,
      }),
    });

    return response.json();
  },
};

// Calendar integration
const calendarService = {
  async syncLessonPlans(lessonPlans) {
    const events = lessonPlans.map((lesson) => ({
      title: lesson.title,
      start: lesson.date,
      duration: lesson.duration,
      description: lesson.objective,
    }));

    await calendar.events.batchCreate(events);
  },
};
```

---

_This data flow documentation provides a comprehensive overview of how data moves through Teaching Engine 2.0, from user interactions to database persistence and external service integrations. For specific implementation details, refer to the codebase and individual component documentation._
