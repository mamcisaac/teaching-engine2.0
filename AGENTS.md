# Agent Implementation Guide - Teaching Engine 2.0

## 🤖 Overview for Autonomous Agents

This guide provides comprehensive instructions for AI coding agents implementing phases 4 and 5 of the Teaching Engine 2.0 project. The system is a curriculum planning tool for elementary teachers that needs to evolve from its current MVP state (phases 0-3 complete) into a fully-featured planning assistant.

## 🎯 Project Context

### What This System Does
Teaching Engine 2.0 is a "digital teaching assistant" that consolidates all aspects of elementary curriculum planning:
- **Curriculum Mapping**: Organize yearly teaching goals into subjects, milestones, and activities
- **Weekly Planning**: Intelligent scheduling of activities based on timetable and pacing
- **Progress Tracking**: Real-time monitoring of curriculum coverage with adaptive suggestions
- **Resource Management**: Centralized storage and preparation lists for teaching materials
- **Parent Communication**: Automated newsletter generation from completed activities
- **Emergency Preparedness**: Quick substitute teacher plan generation

### Current State (Phases 0-3 Complete)
- ✅ Full CRUD API for Subjects, Milestones, and Activities
- ✅ React UI with forms, lists, and progress visualization
- ✅ SQLite database with Prisma ORM
- ✅ Docker deployment ready
- ✅ Comprehensive test suite (Jest, Vitest, Playwright)
- ✅ CI/CD pipeline with GitHub Actions

## 🛠️ Development Workflow

### 1. Environment Setup
```bash
# Clone and setup
git clone https://github.com/mamcisaac/teaching-engine2.0.git
cd teaching-engine2.0
pnpm install

# For Codex/AI agents
bash scripts/codex-setup.sh

# Start development
pnpm run dev
```

### 2. Branch Strategy
```bash
# Phase 4 features
git checkout -b feat/4a-weekly-planner
git checkout -b feat/4b-resource-upload
git checkout -b feat/4c-progress-alerts

# Phase 5 features
git checkout -b feat/5-curriculum-intelligence
```

### 3. Development Process
1. **Write failing test first** (TDD approach)
2. **Implement feature** following existing patterns
3. **Ensure all tests pass**: `pnpm test && pnpm lint && pnpm build`
4. **Commit atomically** with conventional commits
5. **Open PR** with checklist template

### 4. Code Standards
- **TypeScript**: Strict mode, explicit types, no `any`
- **React**: Functional components with hooks
- **Styling**: Tailwind utilities only (no custom CSS)
- **State**: TanStack Query for server state, useState for UI state
- **Testing**: 90%+ coverage for new features

## 📋 Phase 4 Implementation Details

### 4.1 Weekly Planner Automation

**Goal**: Intelligent activity suggestions based on curriculum pacing and teacher preferences.

**Database Schema Changes**:
```prisma
model LessonPlan {
  id         Int        @id @default(autoincrement())
  weekStart  DateTime
  activities Activity[]
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

model TeacherPreferences {
  id              Int    @id @default(autoincrement())
  teachingStyles  String // JSON array
  pacePreference  String // "aggressive" | "balanced" | "relaxed"
  prepTime        Int    // minutes per week available
}
```

**API Endpoints**:
- `POST /api/lesson-plans/generate` - Create weekly suggestions
- `GET /api/lesson-plans/:weekStart` - Retrieve plan for specific week
- `PUT /api/lesson-plans/:id` - Update/finalize plan
- `POST /api/preferences` - Save teacher preferences

**Frontend Components**:
- `WeeklyPlannerPage.tsx` - Main planner interface
- `ActivitySuggestionList.tsx` - Draggable activity cards
- `WeekCalendarGrid.tsx` - Drop zones for scheduling
- `AutoFillButton.tsx` - One-click optimal scheduling

**Algorithm Requirements**:
1. Consider milestone deadlines and current progress
2. Balance subjects according to timetable
3. Respect teaching style preferences
4. Account for activity dependencies
5. Leave buffer time for assessments

### 4.2 Resource Management

**Goal**: Centralized file storage and material preparation tracking.

**Infrastructure**:
- Local file storage: `server/uploads/` directory
- S3 integration: AWS SDK with presigned URLs
- File metadata in database

**Database Schema**:
```prisma
model Resource {
  id         Int      @id @default(autoincrement())
  filename   String
  url        String
  type       String   // "document" | "image" | "video"
  size       Int
  activityId Int?
  activity   Activity? @relation(fields: [activityId], references: [id])
  createdAt  DateTime @default(now())
}

model MaterialList {
  id         Int      @id @default(autoincrement())
  weekStart  DateTime
  items      String   // JSON array
  prepared   Boolean  @default(false)
}
```

**Features**:
- Drag-and-drop file upload with progress
- Automatic PDF generation for printables
- Material checklist generation from activities
- Bulk download for weekly resources

### 4.3 Progress Alerts

**Goal**: Proactive notifications when curriculum pacing is off-track.

**Implementation**:
- Cron job: Daily progress check at 6 AM
- Email service: Resend or SendGrid integration
- In-app notifications: Toast messages

**Alert Triggers**:
- Milestone deadline approaching (1 week) with <80% completion
- Subject significantly behind yearly pace (>2 weeks)
- No activities marked complete in 5+ days
- Upcoming milestone with no scheduled activities

### 4.4 Newsletter Generator

**Goal**: Auto-draft parent communications from activity data.

**Features**:
- Template system with placeholders
- Activity summaries by subject
- Photo integration from resources
- Multiple export formats (PDF, DOCX, HTML)

**API**: `POST /api/newsletters/generate`
```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "template": "monthly",
  "includePhotos": true
}
```

### 4.5 Emergency Sub Plans

**Goal**: One-click detailed plans for substitute teachers.

**Components**:
- Current day's detailed schedule
- Student roster with special needs notes
- Classroom procedures document
- Next 3 days overview
- Emergency contacts

**Storage**: Generated PDFs cached for 24 hours

## 🧠 Phase 5 Implementation Details

### 5.1 Curriculum Intelligence Overview

**Goal**: AI-powered curriculum mapping from official PEI standards.

**Data Sources**:
- PEI curriculum PDFs (Math, Science, Language Arts, etc.)
- Provincial learning outcomes database
- School calendar API for holidays

### 5.2 ETL Pipeline

```typescript
// Extract
const extractOutcomes = async (pdfPath: string): Promise<Outcome[]> => {
  const data = await pdfParse(pdfPath);
  return parseOutcomes(data.text);
};

// Transform with embeddings
const clusterOutcomes = async (outcomes: Outcome[]): Promise<Milestone[]> => {
  const embeddings = await openai.createEmbedding({
    model: "text-embedding-3-small",
    input: outcomes.map(o => o.text)
  });
  return kMeansClustering(embeddings, 8); // 8 milestones per subject
};

// Load
const generateCurriculum = async (clustered: Milestone[]): Promise<void> => {
  await prisma.subject.create({
    data: {
      name: "Mathematics Grade 1",
      milestones: {
        create: clustered
      }
    }
  });
};
```

### 5.3 Setup Wizard UI

**Flow**:
1. Select grade level
2. Choose subjects to import
3. Configure pacing preferences
4. Review generated curriculum
5. Customize before saving

**Components**:
- `CurriculumWizard.tsx` - Multi-step form
- `OutcomeTree.tsx` - Hierarchical outcome display
- `MilestoneEditor.tsx` - Adjust generated groupings
- `SchedulePreview.tsx` - Year-at-a-glance

### 5.4 Security & Performance

- Admin token required for curriculum import
- Rate limiting on OpenAI calls (5 concurrent max)
- Caching of embeddings for reuse
- Progress indication during long operations

## 🧪 Testing Requirements

### Unit Tests
- Minimum 85% coverage for new code
- Mock external services (S3, OpenAI, email)
- Test edge cases and error handling

### Integration Tests
- API endpoint testing with supertest
- Database transaction testing
- File upload/download flows

### E2E Tests
- Complete user workflows
- Cross-browser compatibility
- Mobile responsiveness

## 🚀 Deployment Considerations

### Environment Variables
```bash
# Phase 4
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_BUCKET_NAME=teaching-engine-resources
RESEND_API_KEY=xxx

# Phase 5
OPENAI_API_KEY=xxx
WIZARD_TOKEN=xxx
PEI_CALENDAR_API=https://www.princeedwardisland.ca/api/holidays
```

### Database Migrations
Always create migrations for schema changes:
```bash
pnpm --filter server prisma migrate dev --name feature_name
```

### Performance Optimization
- Implement pagination for large lists
- Use database indexes for common queries
- Cache expensive calculations
- Lazy load frontend routes

## 📊 Success Metrics

### Phase 4
- Weekly planner reduces planning time by 60%
- 95% of suggested activities align with teacher goals
- Resource prep time cut by 50%
- Parent satisfaction with newsletters increases 40%

### Phase 5
- Full curriculum import in <2 minutes
- 90% accuracy in outcome clustering
- Standards coverage tracking 100% complete
- Setup time for new teachers <30 minutes

## 🤝 Collaboration Notes

### For AI Agents
1. Study existing code patterns in `server/src/routes/` and `client/src/components/`
2. Maintain consistent naming conventions
3. Add JSDoc comments for complex functions
4. Update this guide with implementation decisions

### Code Review Checklist
- [ ] Tests pass locally and in CI
- [ ] TypeScript strict mode compliance
- [ ] No console.log statements
- [ ] API responses follow existing format
- [ ] UI components are accessible
- [ ] Documentation updated

## 🆘 Common Issues & Solutions

### Issue: Prisma client out of sync
```bash
pnpm --filter server prisma generate
```

### Issue: Port already in use
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Issue: Test failures in CI but not local
- Check Node version matches CI (18 or 20)
- Ensure DATABASE_URL uses test database
- Clear test database between runs

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [React Query Patterns](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [PEI Curriculum](https://www.princeedwardisland.ca/en/topic/curriculum)

---

Remember: The goal is to build a tool that genuinely helps teachers. Every feature should reduce workload, not add to it. When in doubt, prioritize simplicity and reliability over complexity.
