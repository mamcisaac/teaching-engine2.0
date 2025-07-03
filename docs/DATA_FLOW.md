# DATA_FLOW.md - Teaching Engine 2.0 System Architecture

> **Last Updated**: 2025-07-03  
> **Version**: 2.0  
> **Architecture**: ETFO-Aligned Educational Planning Platform

---

## 🏗️ System Overview

Teaching Engine 2.0 is a monorepo-based educational planning platform that follows Ontario's ETFO (Elementary Teachers' Federation of Ontario) planning methodology. The system implements a traditional 3-tier architecture with a React frontend, Express.js backend, and SQLite database, designed specifically for K-6 educators in Ontario.

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │   SQLite DB     │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│  via Prisma    │
│   Port: 5173    │    │   Port: 3000    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
    ┌────▼────┐              ┌───▼───┐              ┌────▼────┐
    │ Vite    │              │ Prisma│              │ Dev.db  │
    │ TanStack│              │  ORM  │              │ Migrations│
    │ React   │              │ JWT   │              │ Seed Data│
    └─────────┘              └───────┘              └─────────┘
```

---

## 📁 Project Structure

### Actual Monorepo Organization

```
teaching-engine2.0/
├── client/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # UI components (shadcn/ui)
│   │   ├── pages/            # ETFO-aligned pages
│   │   ├── hooks/            # Custom React hooks
│   │   ├── contexts/         # React contexts (Auth, Language, etc.)
│   │   ├── services/         # API service layer
│   │   ├── stores/           # Zustand state management
│   │   └── types/            # TypeScript definitions
│   ├── package.json          # Frontend dependencies
│   └── vite.config.ts        # Vite configuration
├── server/                   # Express.js backend
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic services
│   │   ├── middleware/       # Express middleware (auth, security)
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript type definitions
│   └── package.json          # Backend dependencies
├── packages/
│   └── database/             # Shared database package
│       ├── prisma/
│       │   ├── schema.prisma # Complete database schema
│       │   ├── migrations/   # Database migrations
│       │   └── seed.ts       # Database seeding
│       └── package.json      # Database package config
├── scripts/                  # Build and development scripts
├── docs/                     # Documentation
└── package.json              # Root workspace configuration
```

---

## 🔄 ETFO Planning Hierarchy Data Flow

### Core Educational Data Model

The system implements Ontario's ETFO 5-level planning structure as the central data flow:

```
CurriculumExpectation (Provincial Standards)
         ↓ (many-to-many)
LongRangePlan (Yearly/Term Overview)
         ↓ (one-to-many)
UnitPlan (Multi-week Themes)
         ↓ (one-to-many)
ETFOLessonPlan (Daily Lessons)
         ↓ (one-to-one)
DaybookEntry (Reflection & Assessment)
```

#### Actual Database Schema Relationships

```typescript
// From packages/database/prisma/schema.prisma

model CurriculumExpectation {
  id              String   @id @default(cuid())
  code            String   @unique // e.g., "A1.2", "B2.3"
  description     String
  strand          String   // Major curriculum category
  substrand       String?  // Subcategory if applicable
  grade           Int
  subject         String

  // Bilingual support
  descriptionFr   String?
  strandFr        String?
  substrandFr     String?

  // ETFO Planning Relationships
  longRangePlans  LongRangePlanExpectation[]
  unitPlans       UnitPlanExpectation[]
  lessonPlans     ETFOLessonPlanExpectation[]
  daybookEntries  DaybookEntryExpectation[]
}

model LongRangePlan {
  id            String   @id @default(cuid())
  userId        Int
  title         String
  academicYear  String   // e.g., "2024-2025"
  term          String?  // "Full Year", "Term 1", "Term 2"
  grade         Int
  subject       String

  // ETFO-specific fields
  overarchingQuestions  String?
  assessmentOverview    String?
  resourceNeeds         String?
  professionalGoals     String?

  // Relationships
  expectations  LongRangePlanExpectation[]
  unitPlans     UnitPlan[]
}

model UnitPlan {
  id              String   @id @default(cuid())
  title           String
  longRangePlanId String
  startDate       DateTime
  endDate         DateTime

  // ETFO planning fields
  bigIdeas        String?
  essentialQuestions Json?
  crossCurricularConnections String?
  learningSkills  Json?
  culminatingTask String?

  // Relationships
  longRangePlan   LongRangePlan @relation(fields: [longRangePlanId], references: [id])
  expectations    UnitPlanExpectation[]
  lessonPlans     ETFOLessonPlan[]
}

model ETFOLessonPlan {
  id         String   @id @default(cuid())
  title      String
  date       DateTime
  duration   Int      // in minutes

  // Three-part lesson structure (ETFO standard)
  mindsOn    String?  // Introduction/hook
  action     String?  // Main learning activities
  consolidation String? // Closure/assessment

  // Relationships
  unitPlan     UnitPlan @relation(fields: [unitPlanId], references: [id])
  expectations ETFOLessonPlanExpectation[]
  daybookEntry DaybookEntry?
}

model DaybookEntry {
  id           String         @id @default(cuid())
  date         DateTime
  lessonPlanId String?        @unique

  // Reflection prompts
  whatWorked   String?        // What went well?
  whatDidntWork String?       // What could be improved?
  nextSteps    String?        // What to do differently next time?

  // Student observations
  studentEngagement String?
  studentChallenges String?
  studentSuccesses  String?

  // Relationships
  lessonPlan   ETFOLessonPlan? @relation(fields: [lessonPlanId], references: [id])
  expectations DaybookEntryExpectation[]
}
```

---

## 🔌 Frontend Architecture & Data Flow

### React Component Architecture

```
App (Root Component)
├── AuthProvider (Authentication Context)
├── LanguageProvider (Bilingual Support)
├── NotificationProvider (Toast Notifications)
├── HelpProvider (Context-Sensitive Help)
├── OnboardingProvider (Teacher Onboarding)
├── KeyboardShortcutsProvider (Accessibility)
└── Router (React Router)
    ├── LoginPage
    └── ProtectedRoute
        └── MainLayout
            ├── PlanningDashboard
            ├── LongRangePlanPage
            ├── UnitPlansPage
            ├── ETFOLessonPlanPage
            ├── DaybookPage
            ├── CurriculumExpectationsPage
            ├── ParentNewsletterPage
            ├── CalendarPlanningPage
            └── HelpPage
```

### State Management Patterns

#### TanStack Query for Server State

```typescript
// From client/src/api.ts - Actual implementation

// Curriculum expectations with ETFO alignment
export const useCurriculumExpectations = (filters?: {
  subject?: string;
  grade?: string | number;
  search?: string;
}) => {
  return useQuery<
    Array<{
      id: string;
      code: string;
      description: string;
      strand: string;
      substrand?: string;
      subject: string;
      grade: number;
    }>
  >({
    queryKey: ['curriculum-expectations', filters],
    queryFn: async () => {
      const response = await api.get('/api/curriculum-expectations', { params: filters });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ETFO lesson plans
export const useLessonPlan = (weekStart: string) => {
  return useQuery<{
    id: string;
    weekStart: string;
    activities: Array<{
      id: number;
      title: string;
      description: string;
      duration: number;
      subjectId: number;
    }>;
  }>({
    queryKey: ['lesson-plan', weekStart],
    queryFn: async () => {
      try {
        return (await api.get(`/api/lesson-plans/${weekStart}`)).data;
      } catch (error) {
        if (error.response?.status === 404) {
          const response = await api.post('/api/lesson-plans/generate', {
            weekStart,
            preserveBuffer: true,
            pacingStrategy: 'relaxed',
          });
          return response.data;
        }
        throw error;
      }
    },
    retry: false,
  });
};
```

#### React Context for Global State

```typescript
// From client/src/contexts/AuthContext.tsx - Actual implementation

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Language context for bilingual support
interface LanguageContextType {
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  t: (key: string, params?: Record<string, string>) => string;
}
```

---

## 🗄️ Backend Architecture & Data Flow

### Express.js Route Structure

```typescript
// From server/src/index.ts - Actual implementation

// ETFO-aligned Planning Routes
app.use(
  '/api/curriculum-expectations',
  authenticate,
  rateLimiters.read,
  curriculumExpectationRoutes,
);
app.use('/api/long-range-plans', authenticate, rateLimiters.write, longRangePlanRoutes);
app.use('/api/unit-plans', authenticate, rateLimiters.write, unitPlanRoutes);
app.use('/api/etfo-lesson-plans', authenticate, rateLimiters.write, etfoLessonPlanRoutes);
app.use('/api/daybook-entries', authenticate, rateLimiters.write, daybookEntryRoutes);

// State Management Routes
app.use('/api/planner', authenticate, rateLimiters.api, plannerStateRoutes);
app.use('/api/workflow', authenticate, rateLimiters.api, workflowStateRoutes);

// AI-Powered Features
app.use('/api/ai-planning', authenticate, rateLimiters.ai, aiPlanningRoutes);
app.use('/api/newsletters', authenticate, rateLimiters.write, newsletterRoutes);
app.use('/api/parent-summary', authenticate, rateLimiters.write, parentSummaryRoutes);

// Template System
app.use('/api/templates', authenticate, rateLimiters.api, templateRoutes);

// Collaboration Features
app.use('/api/teams', authenticate, rateLimiters.api, teamRoutes);
app.use('/api/sharing', authenticate, rateLimiters.api, sharingRoutes);
app.use('/api/comments', authenticate, rateLimiters.api, commentRoutes);
```

### Service Layer Architecture

```typescript
// From server/src/services/ - Actual implementation pattern

// Authentication Service
export async function authenticate(
  email: string,
  password: string,
  prisma: PrismaClient,
): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  const token = await generateAuthToken(user.id.toString(), user.email);
  return { user: { ...user, id: user.id.toString() }, token };
}

// Newsletter Service with AI integration
export class NewsletterService {
  async generateNewsletter(data: {
    studentIds: number[];
    dateFrom: string;
    dateTo: string;
    tone: string;
  }): Promise<Newsletter> {
    // AI-powered newsletter generation
    const aiContent = await this.aiService.generateNewsletterContent(data);
    return await this.prisma.newsletter.create({
      data: {
        ...data,
        sections: aiContent.sections,
        isDraft: true,
      },
    });
  }
}
```

---

## 🔐 Security & Authentication Flow

### JWT-Based Authentication

```typescript
// From server/src/services/authService.ts

export async function generateAuthToken(
  userId: string,
  email: string,
  expiresIn: string = '7d',
): Promise<string> {
  const secret = process.env.JWT_SECRET;
  const payload = { userId, email };
  return jwt.sign(payload, secret, { expiresIn });
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');

    const decoded = await verifyToken(token);
    req.user = { id: parseInt(decoded.userId), email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

### Security Middleware Stack

```typescript
// From server/src/middleware/security.ts

export function applySecurityMiddleware(app: Express) {
  // Helmet for security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    }),
  );

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    }),
  );

  // Rate limiting
  app.use('/api/auth/', authRateLimitMiddleware);
  app.use('/api/', rateLimiters.api);
}
```

---

## 📊 Database Interaction Patterns

For complete database schema documentation, see [Database Schema Documentation](./SCHEMAS.md).

### Prisma ORM Integration

```typescript
// From packages/database/src/index.ts

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  },
});

// Complex queries with ETFO relationships
const getLessonPlanWithETFODetails = async (id: string) => {
  return await prisma.etfoLessonPlan.findUnique({
    where: { id },
    include: {
      unitPlan: {
        include: {
          longRangePlan: true,
          expectations: {
            include: {
              expectation: true,
            },
          },
        },
      },
      expectations: {
        include: {
          expectation: true,
        },
      },
      daybookEntry: true,
      resources: true,
    },
  });
};
```

### Database Schema Highlights

```prisma
// Key models from packages/database/prisma/schema.prisma

model User {
  id                Int      @id @default(autoincrement())
  email             String   @unique
  password          String
  name              String
  role              String   @default("teacher")
  preferredLanguage String   @default("en")

  // ETFO planning relationships
  longRangePlans    LongRangePlan[]
  unitPlans         UnitPlan[]
  etfoLessonPlans   ETFOLessonPlan[]
  daybookEntries    DaybookEntry[]
  newsletters       Newsletter[]
  students          Student[]
}

model Newsletter {
  id          String    @id @default(cuid())
  title       String
  titleFr     String
  studentIds  Json      // Array of student IDs
  dateFrom    DateTime
  dateTo      DateTime
  tone        String    // "friendly" | "formal" | "informative"
  sections    Json      // AI-generated newsletter sections
  isDraft     Boolean   @default(true)
}
```

---

## 🚀 Performance & Optimization

### Frontend Optimizations

```typescript
// From client/src/App.tsx - Code splitting implementation

// Lazy loading for ETFO pages
const LongRangePlanPage = lazy(() => import('./pages/LongRangePlanPage'));
const UnitPlansPage = lazy(() => import('./pages/UnitPlansPage'));
const ETFOLessonPlanPage = lazy(() => import('./pages/ETFOLessonPlanPage'));
const DaybookPage = lazy(() => import('./pages/DaybookPage'));

// React Query configuration for offline support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      retry: (failureCount, _error) => {
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
    },
  },
});
```

### Backend Performance Monitoring

```typescript
// From server/src/middleware/performanceMonitoring.ts

export const performanceMonitoring = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    performanceMonitor.recordRequest({
      method: req.method,
      route: req.route?.path || 'unknown',
      duration,
      status: res.statusCode,
    });
  });

  next();
};
```

---

## 🤖 AI Integration Patterns

### Service Layer AI Integration

```typescript
// From server/src/services/aiParentSummaryService.ts

export class AIParentSummaryService {
  async generateParentSummary(request: {
    studentId: number;
    dateFrom: string;
    dateTo: string;
    focus?: string[];
  }): Promise<{
    contentFr: string;
    contentEn: string;
    confidence: number;
  }> {
    // Gather student data and reflections
    const studentData = await this.gatherStudentData(request);

    // Generate bilingual content using AI
    const aiResponse = await this.llmService.generateBilingualSummary({
      studentData,
      focus: request.focus,
      template: 'parent_summary',
    });

    return {
      contentFr: aiResponse.french,
      contentEn: aiResponse.english,
      confidence: aiResponse.confidence,
    };
  }
}
```

### AI-Powered Newsletter Generation

```typescript
// From server/src/services/newsletterService.ts

export class NewsletterService {
  async generateNewsletterSections(data: {
    studentIds: number[];
    dateRange: { from: string; to: string };
    tone: 'friendly' | 'formal' | 'informative';
  }): Promise<NewsletterSection[]> {
    // Aggregate classroom activities and achievements
    const classroomData = await this.aggregateClassroomData(data);

    // Generate contextual newsletter sections
    return await this.aiService.generateNewsletterSections({
      classroomData,
      tone: data.tone,
      language: 'bilingual',
    });
  }
}
```

---

## 🔗 Technology Stack Summary

### Frontend Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query + React Context
- **UI Library**: shadcn/ui + Tailwind CSS
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios with interceptors

### Backend Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: JWT with bcrypt
- **Security**: Helmet, CORS, Rate limiting
- **AI Integration**: OpenAI API

### Database & Infrastructure

- **Development DB**: SQLite (`packages/database/prisma/dev.db`)
- **Schema Management**: Prisma migrations
- **Seeding**: TypeScript seed scripts
- **File Storage**: Local filesystem (development)

---

## 📈 Request Flow Examples

### Creating an ETFO Lesson Plan

```typescript
// 1. Frontend API call
const createLessonPlan = async (lessonData: ETFOLessonPlanInput) => {
  const response = await api.post('/api/etfo-lesson-plans', lessonData);
  return response.data;
};

// 2. Backend route handler
app.post('/api/etfo-lesson-plans', authenticate, rateLimiters.write, async (req, res) => {
  try {
    const lessonPlan = await etfoLessonPlanService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: lessonPlan });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. Service layer implementation
const etfoLessonPlanService = {
  async create(data: ETFOLessonPlanInput, userId: number) {
    return await prisma.etfoLessonPlan.create({
      data: {
        ...data,
        userId,
        expectations: {
          connect: data.expectationIds?.map((id) => ({ id })) || [],
        },
      },
      include: {
        expectations: { include: { expectation: true } },
        unitPlan: true,
        resources: true,
      },
    });
  },
};
```

---

## 📊 Monitoring & Analytics

### Performance Metrics Collection

```typescript
// From server/src/middleware/performanceMonitoring.ts

export class PerformanceMonitor {
  getHealthStatus() {
    return {
      healthy: this.averageResponseTime < 1000,
      averageResponseTime: this.averageResponseTime,
      requestCount: this.requestCount,
      errorRate: this.errorCount / this.requestCount,
    };
  }

  getSlowestEndpoints() {
    return this.endpointMetrics.sort((a, b) => b.averageTime - a.averageTime).slice(0, 10);
  }
}
```

---

_This data flow documentation accurately reflects the Teaching Engine 2.0 implementation as of July 2025, focusing on the ETFO-aligned educational planning features and the actual technology choices made in the codebase._
