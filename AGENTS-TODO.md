# Teaching Engine 2.0 - Agent TODO List (All Phases)

> 🎯 **Current Status**: Phases 0-3 should be complete. Use this checklist to verify before proceeding to Phase 4.
>
> 📋 **Instructions**: Verify all items in Phases 0-3 are checked. Then work through Phase 4 & 5 tasks sequentially.

---

## ✅ Phase 0 - Repository Scaffolding & Docs (COMPLETED)

### Initial Setup

- [x] **Initialize repository**

  ```bash
  # Task 0.1: Git initialization
  git init
  git add .
  git commit -m "Initial commit"
  ```

- [x] **Create .gitignore**
  ```
  # Task 0.2: Root .gitignore with:
  node_modules/
  .env
  .env.local
  dist/
  build/
  *.log
  .DS_Store
  coverage/
  .idea/
  .vscode/
  ```

### Monorepo Structure

- [x] **Configure pnpm workspaces**

  ```yaml
  # Task 0.3: pnpm-workspace.yaml
  packages:
    - 'client'
    - 'server'
  ```

- [x] **Create package.json files**
  ```json
  // Task 0.4: Root package.json
  {
    "name": "teaching-engine2.0",
    "private": true,
    "scripts": {
      "dev": "pnpm run --parallel dev",
      "build": "pnpm run --recursive build",
      "test": "pnpm run --recursive test",
      "lint": "pnpm run --recursive lint"
    }
  }
  ```

### Project Structure

- [x] **Create directory structure**
  ```
  # Task 0.5: Directory setup
  teaching-engine2.0/
  ├── .github/
  │   └── workflows/
  │       └── ci.yml
  ├── client/
  ├── server/
  ├── prisma/
  ├── scripts/
  ├── tests/
  └── docs/
  ```

### Development Tools

- [x] **ESLint configuration**

  ```json
  // Task 0.6: .eslintrc.json
  {
    "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    "parser": "@typescript-eslint/parser",
    "parserOptions": { "ecmaVersion": 2022 }
  }
  ```

- [x] **Prettier configuration**

  ```json
  // Task 0.7: .prettierrc
  {
    "semi": true,
    "singleQuote": true,
    "tabWidth": 2,
    "trailingComma": "es5"
  }
  ```

- [x] **TypeScript base config**
  ```json
  // Task 0.8: tsconfig.base.json
  {
    "compilerOptions": {
      "target": "ES2022",
      "module": "commonjs",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true
    }
  }
  ```

### CI/CD Pipeline

- [x] **GitHub Actions workflow**
  ```yaml
  # Task 0.9: .github/workflows/ci.yml
  name: CI
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      strategy:
        matrix:
          node-version: [18, 20]
  ```

### Documentation

- [x] **Create README.md** with project overview
- [x] **Create LICENSE** file (MIT)
- [x] **Create CONTRIBUTING.md** guidelines
- [x] **Node version specification** (.nvmrc with "18")

### Scripts

- [x] **Codex setup script**
  ```bash
  # Task 0.10: scripts/codex-setup.sh
  #!/bin/bash
  echo "Setting up Codex environment..."
  pnpm install
  pnpm run build
  ```

---

## ✅ Phase 1 - Backend API (COMPLETED)

### Server Setup

- [x] **Initialize Express server**

  ```typescript
  // Task 1.1: server/src/app.ts
  import express from 'express';
  import cors from 'cors';
  const app = express();
  app.use(cors());
  app.use(express.json());
  ```

- [x] **Environment configuration**
  ```
  # Task 1.2: server/.env.example
  DATABASE_URL="file:./dev.db"
  PORT=3000
  NODE_ENV=development
  ```

### Database Setup

- [x] **Initialize Prisma**

  ```bash
  # Task 1.3: Prisma setup
  cd server
  pnpm add -D prisma @prisma/client
  npx prisma init --datasource-provider sqlite
  ```

- [x] **Create database schema**

  ```prisma
  // Task 1.4: prisma/schema.prisma
  model Subject {
    id         Int         @id @default(autoincrement())
    name       String
    milestones Milestone[]
    createdAt  DateTime    @default(now())
    updatedAt  DateTime    @updatedAt
  }

  model Milestone {
    id         Int        @id @default(autoincrement())
    title      String
    targetDate DateTime
    subject    Subject    @relation(fields: [subjectId], references: [id])
    subjectId  Int
    activities Activity[]
    createdAt  DateTime   @default(now())
    updatedAt  DateTime   @updatedAt
  }

  model Activity {
    id          Int       @id @default(autoincrement())
    title       String
    duration    Int       // in minutes
    milestone   Milestone @relation(fields: [milestoneId], references: [id])
    milestoneId Int
    completedAt DateTime?
    createdAt   DateTime  @default(now())
    updatedAt   DateTime  @updatedAt
  }
  ```

- [x] **Run initial migration**
  ```bash
  # Task 1.5: Create database
  pnpm prisma migrate dev --name init
  pnpm prisma generate
  ```

### API Routes - Subjects

- [x] **GET /api/subjects** - List all subjects
- [x] **GET /api/subjects/:id** - Get subject with milestones
- [x] **POST /api/subjects** - Create new subject
- [x] **PUT /api/subjects/:id** - Update subject
- [x] **DELETE /api/subjects/:id** - Delete subject

### API Routes - Milestones

- [x] **GET /api/milestones** - List all milestones
- [x] **GET /api/milestones/:id** - Get milestone with activities
- [x] **POST /api/milestones** - Create new milestone
- [x] **PUT /api/milestones/:id** - Update milestone
- [x] **DELETE /api/milestones/:id** - Delete milestone

### API Routes - Activities

- [x] **GET /api/activities** - List all activities
- [x] **GET /api/activities/:id** - Get single activity
- [x] **POST /api/activities** - Create new activity
- [x] **PUT /api/activities/:id** - Update activity
- [x] **DELETE /api/activities/:id** - Delete activity

### Testing

- [x] **Jest configuration**

  ```javascript
  // Task 1.6: server/jest.config.js
  module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src', '<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    collectCoverageFrom: ['src/**/*.ts'],
    globalSetup: './tests/jest.setup.ts',
  };
  ```

- [x] **API route tests**
  - [x] Subject CRUD tests
  - [x] Milestone CRUD tests
  - [x] Activity CRUD tests
  - [x] Error handling tests (404, 400, 500)

### Middleware

- [x] **Error handling middleware**
- [x] **Request logging middleware**
- [x] **Validation middleware** (express-validator)

---

## ✅ Phase 2 - Frontend UI (COMPLETED)

### React Setup

- [x] **Create Vite React app**

  ```bash
  # Task 2.1: Initialize client
  pnpm create vite client --template react-ts
  cd client
  pnpm install
  ```

- [x] **Install dependencies**
  ```bash
  # Task 2.2: Core dependencies
  pnpm add axios @tanstack/react-query
  pnpm add -D @types/react @types/react-dom
  ```

### Tailwind CSS Setup

- [x] **Install Tailwind**

  ```bash
  # Task 2.3: Tailwind setup
  pnpm add -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p
  ```

- [x] **Configure Tailwind**
  ```javascript
  // Task 2.4: tailwind.config.js
  module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: { extend: {} },
    plugins: [],
  };
  ```

### API Client

- [x] **Create API instance**
  ```typescript
  // Task 2.5: client/src/api.ts
  import axios from 'axios';
  const api = axios.create({
    baseURL: 'http://localhost:3000/api',
  });
  ```

### Components - Cards

- [x] **SubjectCard component**

  - [x] Display subject name
  - [x] Show milestone count
  - [x] Progress indicator
  - [x] Edit/Delete buttons

- [x] **MilestoneCard component**

  - [x] Display title and target date
  - [x] Progress bar (% complete)
  - [x] Activity count
  - [x] Edit/Delete buttons

- [x] **ActivityRow component**
  - [x] Activity title
  - [x] Duration display
  - [x] Completion checkbox
  - [x] Edit/Delete buttons

### Components - Forms

- [x] **Subject form modal** (using shadcn/ui Dialog)
- [x] **Milestone form modal** with date picker
- [x] **Activity form modal** with duration input

### Components - Layout

- [x] **App layout with navigation**
- [x] **Toast notifications** (shadcn/ui Sonner)
- [x] **Loading states**
- [x] **Error boundaries**

### State Management

- [x] **TanStack Query setup**

  ```typescript
  // Task 2.6: Query client configuration
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { staleTime: 5 * 60 * 1000 },
    },
  });
  ```

- [x] **Custom hooks**
  - [x] useSubjects()
  - [x] useMilestones()
  - [x] useActivities()
  - [x] Mutation hooks for CRUD

### Testing

- [x] **Vitest configuration**
- [x] **React Testing Library setup**
- [x] **Component tests**
  - [x] SubjectCard tests
  - [x] MilestoneCard tests
  - [x] ActivityRow tests
  - [x] Form validation tests

### E2E Testing

- [x] **Playwright setup**

  ```javascript
  // Task 2.7: playwright.config.ts
  export default {
    testDir: './tests/e2e',
    use: {
      baseURL: 'http://localhost:5173',
    },
  };
  ```

- [x] **E2E test flows**
  - [x] Create subject → milestone → activity
  - [x] Mark activity complete
  - [x] Verify progress updates
  - [x] Delete cascade testing

---

## ✅ Phase 3 - MVP Polish & Distribution (COMPLETED)

### Progress Tracking

- [x] **Add completedAt field to Activity model**

  ```bash
  # Task 3.1: Database migration
  pnpm prisma migrate dev --name add_activity_completion
  ```

- [x] **Progress calculation logic**

  ```typescript
  // Task 3.2: Progress service
  // Calculate % complete for milestones and subjects
  // Based on completed vs total activities
  ```

- [x] **Auto-update progress bars**
  - [x] Real-time UI updates
  - [x] Optimistic updates
  - [x] Cache invalidation

### Docker Setup

- [x] **Create Dockerfile**

  ```dockerfile
  # Task 3.3: Multi-stage Dockerfile
  FROM node:18-alpine AS builder
  WORKDIR /app
  COPY . .
  RUN pnpm install --frozen-lockfile
  RUN pnpm run build

  FROM node:18-alpine
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  EXPOSE 3000
  CMD ["node", "dist/server/index.js"]
  ```

- [x] **Docker Compose configuration**

  ```yaml
  # Task 3.4: docker-compose.yml
  version: '3.8'
  services:
    web:
      build: .
      ports:
        - '3000:3000'
      environment:
        - NODE_ENV=production
  ```

- [x] **Docker ignore file**
  ```
  # Task 3.5: .dockerignore
  node_modules
  .git
  .env
  coverage
  .vscode
  ```

### Release Automation

- [x] **GitHub Actions release workflow**
  ```yaml
  # Task 3.6: .github/workflows/release.yml
  name: Release
  on:
    push:
      tags: ['v*']
  jobs:
    docker:
      runs-on: ubuntu-latest
      steps:
        - uses: docker/build-push-action@v2
  ```

### Production Optimizations

- [x] **Build optimization**

  - [x] Tree shaking
  - [x] Code splitting
  - [x] Asset compression

- [x] **Performance monitoring**
  - [x] Lighthouse CI integration
  - [x] Bundle size tracking

### Documentation Updates

- [x] **API documentation**
- [x] **Deployment guide**
- [x] **User manual draft**

---

## 📦 Phase 4 - Post-MVP Enhancements (TO DO)

### 4.1 Weekly Planner Automation ⏰

- [ ] **Database Schema Updates**

  ```bash
  # Task 4.1.1: Create new Prisma models
  # File: prisma/schema.prisma
  # Add: LessonPlan, TeacherPreferences, WeeklySchedule models
  # Run: pnpm --filter server prisma migrate dev --name add_lesson_planning
  ```

- [ ] **API Development**

  ```typescript
  // Task 4.1.2: Create lesson plan routes
  // File: server/src/routes/lessonPlans.ts
  // Endpoints:
  // - POST /api/lesson-plans/generate
  // - GET /api/lesson-plans/:weekStart
  // - PUT /api/lesson-plans/:id
  // - DELETE /api/lesson-plans/:id
  ```

- [x] **Planning Algorithm**

  ```typescript
  // Task 4.1.3: Implement activity suggestion engine
  // File: server/src/services/planningEngine.ts
  // Features:
  // - Balance subjects by weekly hours
  // - Prioritize behind-schedule milestones
  // - Respect activity dependencies
  // - Consider teacher preferences
  ```

- [ ] **Frontend Components**

  ```typescript
  // Task 4.1.4: Build weekly planner UI
  // Files:
  // - client/src/pages/WeeklyPlanner.tsx
  // - client/src/components/ActivitySuggestionList.tsx
  // - client/src/components/WeekCalendarGrid.tsx
  // - client/src/components/DraggableActivity.tsx
  ```

- [ ] **Drag-and-Drop Implementation**

  ```typescript
  // Task 4.1.5: Add @dnd-kit/sortable
  // Enable dragging activities from suggestions to calendar slots
  // Handle collision detection and slot validation
  ```

- [ ] **Tests**
  ```typescript
  // Task 4.1.6: Test coverage
  // - server/tests/lessonPlans.test.ts (API routes)
  // - server/tests/planningEngine.test.ts (algorithm)
  // - client/tests/WeeklyPlanner.test.tsx (UI)
  // - tests/e2e/weekly-planning.spec.ts (Playwright)
  ```

### 4.2 Resource Management System 📁

- [ ] **File Storage Setup**

  ```bash
  # Task 4.2.1: Configure file storage
  # Create: server/uploads/ directory
  # Add to .gitignore: /server/uploads/*
  # Install: npm install multer @types/multer
  ```

- [ ] **Database Models**

  ```prisma
  // Task 4.2.2: Add Resource model
  // File: prisma/schema.prisma
  model Resource {
    id         Int      @id @default(autoincrement())
    filename   String
    originalName String
    mimeType   String
    size       Int
    url        String
    activityId Int?
    uploadedAt DateTime @default(now())
  }
  ```

- [ ] **Upload API**

  ```typescript
  // Task 4.2.3: Create upload endpoints
  // File: server/src/routes/resources.ts
  // - POST /api/resources/upload (multipart/form-data)
  // - GET /api/resources/:id
  // - DELETE /api/resources/:id
  // - GET /api/resources/activity/:activityId
  ```

- [ ] **S3 Integration (Optional)**

  ```typescript
  // Task 4.2.4: Add cloud storage
  // File: server/src/services/s3Storage.ts
  // Install: npm install @aws-sdk/client-s3
  // Features: Presigned URLs, bucket policies
  ```

- [x] **Material Lists**

  ```typescript
  // Task 4.2.5: Generate prep lists
  // File: server/src/services/materialGenerator.ts
  // - Extract materials from activity descriptions
  // - Group by week/day
  // - Track prepared status
  ```

- [x] **Frontend Upload Component**
  ```typescript
  // Task 4.2.6: Build file upload UI
  // Files:
  // - client/src/components/FileUpload.tsx (drag-drop)
  // - client/src/components/ResourceList.tsx
  // - client/src/components/MaterialChecklist.tsx
  // Use: react-dropzone or similar
  ```

### 4.3 Progress Tracking & Alerts 📊

- [ ] **Progress Analytics Service**

  ```typescript
  // Task 4.3.1: Create progress analyzer
  // File: server/src/services/progressAnalytics.ts
  // Calculate:
  // - Milestone completion rates
  // - Subject pacing vs. targets
  // - Days since last activity
  // - Projected completion dates
  ```

- [ ] **Alert Configuration**

  ```typescript
  // Task 4.3.2: Define alert rules
  // File: server/src/models/alerts.ts
  interface AlertRule {
    type: 'BEHIND_SCHEDULE' | 'NO_ACTIVITY' | 'MILESTONE_DUE';
    threshold: number;
    severity: 'info' | 'warning' | 'critical';
  }
  ```

- [ ] **Cron Job Setup**

  ```typescript
  // Task 4.3.3: Daily progress check
  // File: server/src/jobs/progressCheck.ts
  // Use: node-cron or GitHub Actions
  // Schedule: Daily at 6 AM
  ```

- [ ] **Email Service**

  ```typescript
  // Task 4.3.4: Configure email sending
  // File: server/src/services/emailService.ts
  // Options: Resend, SendGrid, or SMTP
  // Templates: Progress alerts, weekly summaries
  ```

- [ ] **In-App Notifications**
  ```typescript
  // Task 4.3.5: Build notification system
  // Files:
  // - client/src/contexts/NotificationContext.tsx
  // - client/src/components/NotificationCenter.tsx
  // Features: Toast messages, badge counts
  ```

### 4.4 Newsletter Generator 📰

- [ ] **Template System**

  ```typescript
  // Task 4.4.1: Create newsletter templates
  // File: server/src/templates/newsletters/
  // - monthly.hbs
  // - weekly.hbs
  // - custom.hbs
  // Use: Handlebars or similar
  ```

- [x] **Content Aggregation**

  ```typescript
  // Task 4.4.2: Build content collector
  // File: server/src/services/newsletterGenerator.ts
  // Gather:
  // - Completed activities by subject
  // - Upcoming events
  // - Student achievements
  // - Photos from resources
  ```

- [ ] **Export Formats**

  ```typescript
  // Task 4.4.3: Multi-format export
  // Install: puppeteer (PDF), docx (Word)
  // Endpoints:
  // - POST /api/newsletters/generate
  // - GET /api/newsletters/:id/pdf
  // - GET /api/newsletters/:id/docx
  ```

- [ ] **Newsletter Editor UI**
  ```typescript
  // Task 4.4.4: Build editor component
  // Files:
  // - client/src/pages/NewsletterEditor.tsx
  // - client/src/components/RichTextEditor.tsx
  // Features: Preview, photo insertion, templates
  ```

### 4.5 Emergency Sub Plans 🚨

- [x] **Sub Plan Generator**

  ```typescript
  // Task 4.5.1: Create sub plan service
  // File: server/src/services/subPlanGenerator.ts
  // Include:
  // - Current day detailed schedule
  // - Next 3 days overview
  // - Classroom procedures
  // - Student notes
  // - Emergency contacts
  ```

- [x] **Quick Access UI**
  ```typescript
  // Task 4.5.2: Emergency button component
  // File: client/src/components/EmergencyPlanButton.tsx
  // Features:
  // - One-click generation
  // - Auto-include today + 3 days
  // - PDF download ready
  ```

### 4.6 Authentication & Multi-User 🔐

- [ ] **Auth Setup**

  ```typescript
  // Task 4.6.1: Implement authentication
  // Options: NextAuth, Auth0, or custom JWT
  // Files:
  // - server/src/middleware/auth.ts
  // - client/src/contexts/AuthContext.tsx
  ```

- [ ] **User Model**

  ```prisma
  // Task 4.6.2: Add User model
  model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    password  String
    name      String
    role      String   @default("teacher")
    subjects  Subject[]
  }
  ```

- [ ] **Data Isolation**
  ```typescript
  // Task 4.6.3: Implement data scoping
  // All queries must include userId filter
  // Add userId to all relevant models
  ```

### 4.7 Cloud Backup Integration ☁️

- [ ] **Backup Service**
  ```typescript
  // Task 4.7.1: Implement backup system
  // File: server/src/services/backupService.ts
  // Options: AWS S3, Google Drive, Dropbox
  // Features: Scheduled backups, restore
  ```

---

## 🧠 Phase 5 - Curriculum Intelligence (TO DO)

### 5.1 Data Extraction Pipeline 📚

- [ ] **PDF Parser Setup**

  ```typescript
  // Task 5.1.1: Configure PDF extraction
  // Install: pdf-parse
  // File: server/src/services/curriculumExtractor.ts
  // Parse PEI curriculum documents
  ```

- [ ] **Outcome Parser**
  ```typescript
  // Task 5.1.2: Extract learning outcomes
  // Pattern matching for:
  // - Outcome codes (e.g., "M1.2.3")
  // - Descriptions
  // - Grade levels
  // - Subject areas
  ```

### 5.2 AI Integration 🤖

- [ ] **OpenAI Setup**

  ```typescript
  // Task 5.2.1: Configure OpenAI client
  // File: server/src/services/openaiService.ts
  // Model: text-embedding-3-small
  // Rate limiting: 5 concurrent requests
  ```

- [ ] **Embedding Generation**

  ```typescript
  // Task 5.2.2: Create embeddings for outcomes
  // Cache embeddings in database
  // Batch process for efficiency
  ```

- [ ] **Clustering Algorithm**
  ```typescript
  // Task 5.2.3: Implement outcome clustering
  // File: server/src/services/outcomeClustering.ts
  // Methods:
  // - K-means clustering
  // - Semantic similarity grouping
  // - Target: 6-10 milestones per subject
  ```

### 5.3 Curriculum Wizard UI 🧙

- [ ] **Multi-Step Form**

  ```typescript
  // Task 5.3.1: Build setup wizard
  // Files:
  // - client/src/pages/CurriculumWizard.tsx
  // - client/src/components/WizardStep.tsx
  // Steps: Grade → Subjects → Preview → Customize
  ```

- [ ] **Outcome Visualization**
  ```typescript
  // Task 5.3.2: Create outcome tree view
  // File: client/src/components/OutcomeTree.tsx
  // Features:
  // - Hierarchical display
  // - Drag to reorganize
  // - Merge/split clusters
  ```

### 5.4 Schedule Generation 📅

- [ ] **Holiday Integration**

  ```typescript
  // Task 5.4.1: Fetch school calendar
  // API: https://www.princeedwardisland.ca/api/holidays
  // Cache holiday dates
  // Block scheduling on holidays
  ```

- [ ] **Pacing Algorithm**
  ```typescript
  // Task 5.4.2: Distribute milestones across year
  // Consider:
  // - Teaching days available
  // - Subject time allocations
  // - Assessment periods
  // - Buffer time
  ```

### 5.5 Security & Admin Features 🔒

- [ ] **Admin Token Gate**

  ```typescript
  // Task 5.5.1: Protect curriculum import
  // Middleware: requireAdminToken
  // Environment: WIZARD_TOKEN
  ```

- [ ] **Usage Analytics**
  ```typescript
  // Task 5.5.2: Track feature usage
  // Metrics:
  // - Import success rate
  // - Generation time
  // - User satisfaction
  ```

---

## ✅ Definition of Done Checklists

### Phase 0 Checklist (VERIFY COMPLETE)

- [x] Repository initialized with git
- [x] .gitignore includes all necessary patterns
- [x] pnpm workspaces configured
- [x] All package.json files created
- [x] Directory structure matches specification
- [x] ESLint and Prettier configured
- [x] TypeScript base configuration
- [x] CI/CD pipeline passing on Node 18 & 20
- [x] All documentation files present
- [x] Codex setup script executable

### Phase 1 Checklist (VERIFY COMPLETE)

- [x] Express server starts on port 3000
- [x] CORS enabled for frontend
- [x] Prisma schema includes all three models
- [x] Database migrations run successfully
- [x] All CRUD endpoints return correct status codes
- [x] Request validation on all POST/PUT endpoints
- [x] Error handling returns appropriate messages
- [x] Jest tests achieve >80% coverage
- [x] No TypeScript errors
- [x] API responds to health check endpoint

### Phase 2 Checklist (VERIFY COMPLETE)

- [x] Vite dev server runs without errors
- [x] Tailwind styles apply correctly
- [x] All component files created
- [x] Forms validate user input
- [x] Toast notifications show on actions
- [x] Progress bars calculate correctly
- [x] React Query caches API responses
- [x] No console errors in browser
- [x] Components are keyboard accessible
- [x] E2E tests pass in Playwright

### Phase 3 Checklist (VERIFY COMPLETE)

- [x] Activities can be marked complete
- [x] Progress updates automatically
- [x] Docker image builds successfully
- [x] Container runs with docker-compose
- [x] Application accessible on port 3000
- [x] Database persists between restarts
- [x] Production build is optimized
- [x] Release workflow triggers on tags
- [x] No development dependencies in production
- [x] README includes all setup instructions

### Phase 4 Checklist (TO COMPLETE)

- [x] All features implemented and tested
- [ ] 90%+ test coverage on new code
- [ ] API documentation updated
- [ ] Frontend responsive on mobile
- [ ] Performance: <200ms API response times
- [ ] No console errors or warnings
- [ ] Docker build successful
- [ ] CI/CD pipeline passing

### Phase 5 Checklist (TO COMPLETE)

- [ ] Curriculum import working for Math, Science, Language Arts
- [ ] 90%+ accuracy in outcome clustering
- [ ] Full year schedule generated in <30 seconds
- [ ] Admin features properly secured
- [ ] Embedding caching implemented
- [ ] Setup wizard user-tested
- [ ] Documentation includes examples

---

## 🚀 Deployment Steps

1. **Environment Variables**

   ```bash
   # Add to server/.env
   AWS_ACCESS_KEY_ID=
   AWS_SECRET_ACCESS_KEY=
   RESEND_API_KEY=
   OPENAI_API_KEY=
   WIZARD_TOKEN=
   ```

2. **Database Migrations**

   ```bash
   pnpm --filter server prisma migrate deploy
   ```

3. **Build & Test**

   ```bash
   pnpm run build
   pnpm run test:all
   ```

4. **Docker Deployment**
   ```bash
   docker build -t teaching-engine:latest .
   docker compose up -d
   ```

---

## 📊 Success Metrics

Track these metrics after each phase:

- **Planning Time Reduction**: Target 60% less time on weekly planning
- **User Satisfaction**: Survey teachers monthly
- **System Adoption**: Track daily active users
- **Bug Reports**: Maintain <5 critical bugs
- **Performance**: Page load <1s, API response <200ms

---

## 🆘 Need Help?

- Check existing implementation in phases 0-3
- Review `AGENTS.md` for detailed guidance
- Look for patterns in `server/src/routes/` and `client/src/components/`
- Run tests frequently: `pnpm test`
- Keep commits atomic and well-documented

---

**Remember**: Every feature should make a teacher's life easier. If it doesn't reduce workload or improve outcomes, reconsider the implementation.
