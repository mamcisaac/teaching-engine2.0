# Out-of-Scope Analytics Fixes Documentation

This document details the analytics-related fixes that are outside Agent-Insight's scope and require coordination with other agents to complete the analytics testing and implementation.

## 🎯 Purpose

These fixes were identified during Agent-Insight's comprehensive testing implementation but require database schema changes, cross-agent data models, or shared infrastructure modifications that fall outside Agent-Insight's defined ownership boundaries.

## 📋 Required Fixes by Responsible Agent

### 🗄️ Agent-Atlas (Database Schema & Core Models)

#### 1. Vocabulary Tracking Schema (Critical Priority)

**Issue**: Vocabulary analytics tests fail because there's no database schema for tracking student vocabulary acquisition.

**Required Changes**:

```prisma
// Add to packages/database/prisma/schema.prisma

model VocabularyEntry {
  id          Int      @id @default(autoincrement())
  studentId   Int
  teacherId   Int
  word        String
  language    String   // 'en' | 'fr' | 'other'
  domain      String   // 'reading' | 'writing' | 'oral' | 'math' | 'science'
  difficulty  String   // 'basic' | 'intermediate' | 'advanced'
  dateAcquired DateTime @default(now())
  context     String?  // Where/how the word was learned
  reinforced  Int      @default(0) // Number of times practiced
  mastered    Boolean  @default(false)

  // Relations
  student     Student  @relation(fields: [studentId], references: [id])
  teacher     Teacher  @relation(fields: [teacherId], references: [id])

  @@unique([studentId, word, language])
  @@map("vocabulary_entries")
}

model CognateConnection {
  id          Int      @id @default(autoincrement())
  enWord      String
  frWord      String
  domain      String
  similarity  Float    // 0-100 similarity score
  verified    Boolean  @default(false)

  @@unique([enWord, frWord])
  @@map("cognate_connections")
}
```

**Files to Update**:

- `packages/database/prisma/schema.prisma`
- `packages/database/src/generated/client/index.ts` (auto-generated)
- `server/src/services/analytics/vocabularyAnalytics.ts` (replace mock data service)

**Testing Impact**: Fixes 9 failing vocabulary analytics tests

#### 2. Theme Usage Tracking Schema (High Priority)

**Issue**: Theme analytics require tracking of theme usage across different educational contexts.

**Required Changes**:

```prisma
// Add to packages/database/prisma/schema.prisma

model ThemeUsage {
  id          Int      @id @default(autoincrement())
  themeId     Int
  teacherId   Int
  subjectId   Int?
  activityId  Int?
  outcomeId   Int?
  usageType   String   // 'planner' | 'reflection' | 'artifact' | 'assessment'
  usageDate   DateTime @default(now())

  // Relations
  theme       Theme    @relation(fields: [themeId], references: [id])
  teacher     Teacher  @relation(fields: [teacherId], references: [id])
  subject     Subject? @relation(fields: [subjectId], references: [id])

  @@map("theme_usage")
}

model Theme {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  category    String   // 'science' | 'language' | 'math' | 'social' | 'technology'
  description String?
  active      Boolean  @default(true)

  // Relations
  usage       ThemeUsage[]

  @@map("themes")
}
```

**Files to Update**:

- `packages/database/prisma/schema.prisma`
- `server/src/services/analytics/themeAnalytics.ts` (create real implementation)

#### 3. Domain Analytics Data Model (Medium Priority)

**Issue**: Domain strength radar requires student progress data across learning domains.

**Required Changes**:

```prisma
// Add to packages/database/prisma/schema.prisma

model DomainProgress {
  id              Int      @id @default(autoincrement())
  studentId       Int
  domain          String   // 'reading' | 'writing' | 'oral' | 'math' | 'science'
  currentLevel    Float    // 0-100 score
  targetLevel     Float    // 0-100 target
  trajectory      String   // 'improving' | 'stable' | 'declining'
  outcomesCompleted Int    @default(0)
  outcomesTotal   Int
  reflectionCount Int      @default(0)
  lastUpdated     DateTime @default(now())
  term            String

  // Relations
  student         Student  @relation(fields: [studentId], references: [id])

  @@unique([studentId, domain, term])
  @@map("domain_progress")
}
```

**Files to Update**:

- `packages/database/prisma/schema.prisma`
- `server/src/services/analytics/domainAnalytics.ts` (create real implementation)

### 🎓 Agent-Scholar (Student Data & Progress Tracking)

#### 1. Student Progress Data Population (Critical Priority)

**Issue**: Analytics require actual student progress data to replace mock data services.

**Required Implementation**:

- Integrate student goal tracking with domain progress
- Link vocabulary acquisition to learning activities
- Connect assessment results to domain analytics

**Coordination Required**:

```typescript
// Interface that Agent-Scholar should implement
interface StudentProgressProvider {
  getStudentDomainProgress(studentId: number, term?: string): Promise<DomainProgress[]>;
  getStudentVocabularyEntries(
    studentId: number,
    options?: VocabOptions,
  ): Promise<VocabularyEntry[]>;
  getClassProgressSummary(teacherId: number, term?: string): Promise<ClassProgress>;
}
```

**Files to Update**:

- `server/src/services/analytics/vocabularyAnalytics.ts`
- `server/src/services/analytics/domainAnalytics.ts`

#### 2. Student-Teacher-Class Relationships (Medium Priority)

**Issue**: Analytics need proper student-teacher associations for class-level analytics.

**Required Changes**:

- Ensure student enrollment data is properly tracked
- Implement class roster management
- Connect students to terms/semesters appropriately

### 🧮 Agent-Evaluator (Assessment Data Integration)

#### 1. Assessment Results for Domain Analytics (High Priority)

**Issue**: Domain strength calculations need assessment outcome data.

**Required Integration**:

```typescript
// Interface that Agent-Evaluator should provide
interface AssessmentProvider {
  getStudentAssessmentResults(studentId: number, domain?: string): Promise<AssessmentResult[]>;
  getDomainAssessmentSummary(teacherId: number, domain: string): Promise<DomainAssessment>;
}
```

**Files to Update**:

- `server/src/services/analytics/domainAnalytics.ts`
- Link domain progress calculations to actual assessment data

### 📚 Agent-Planner (Activity & Outcome Data)

#### 1. Theme Usage Data Collection (Medium Priority)

**Issue**: Theme analytics need actual usage data from planning activities.

**Required Integration**:

- Track theme selection in weekly planners
- Record theme usage in activity planning
- Connect themes to learning outcomes

**Required Changes**:

- Modify planner components to record theme usage
- Ensure theme data flows to analytics services

## 🔄 Integration Workflow

### Step 1: Database Schema Updates (Agent-Atlas)

1. Add vocabulary, theme, and domain progress schemas
2. Run migrations: `pnpm --filter @teaching-engine/database db:migrate`
3. Regenerate Prisma client: `pnpm --filter @teaching-engine/database db:generate`

### Step 2: Data Population (Agent-Scholar)

1. Implement student progress tracking services
2. Populate vocabulary entries from learning activities
3. Create domain progress calculation logic

### Step 3: Assessment Integration (Agent-Evaluator)

1. Provide assessment result interfaces
2. Connect domain analytics to assessment outcomes
3. Ensure assessment data flows to analytics

### Step 4: Activity Data Collection (Agent-Planner)

1. Add theme usage tracking to planner
2. Record outcome coverage data
3. Connect planning data to analytics

### Step 5: Analytics Service Updates (Agent-Insight)

1. Replace mock data services with real database queries
2. Update service implementations to use Prisma models
3. Ensure test coverage for integrated services

## 📊 Testing Impact

### Current Test Status

- **Passing Tests**: 44 (analytics cache, API integration, some component tests)
- **Failing Tests**: 42 (vocabulary analytics, theme analytics, domain analytics)
- **Blocked by Dependencies**: 38 tests

### Post-Integration Expected Results

- **Expected Passing Tests**: 82+ (95%+ coverage)
- **Remaining Work**: Performance and accessibility tests

## 🚨 Coordination Warnings

### Database Migration Conflicts

- **Risk**: Multiple agents modifying schema simultaneously
- **Mitigation**: Coordinate database changes through Agent-Atlas
- **Process**: Create migration branches, review together, merge sequentially

### API Contract Changes

- **Risk**: Analytics API changes breaking other agent integrations
- **Mitigation**: Maintain backward compatibility during transition
- **Process**: Use versioned APIs during migration period

### Mock Data Transition

- **Risk**: Removing mock services before real data is available
- **Mitigation**: Keep mock services until full integration complete
- **Process**: Feature flags to switch between mock and real data

## 📝 Implementation Priority

### Phase 1: Core Schema (Weeks 1-2)

1. Agent-Atlas: Add vocabulary and theme schemas
2. Agent-Atlas: Run migrations and update Prisma client
3. Agent-Insight: Update services to use new schemas

### Phase 2: Data Population (Weeks 3-4)

1. Agent-Scholar: Implement student progress tracking
2. Agent-Evaluator: Connect assessment data
3. Agent-Planner: Add theme usage tracking

### Phase 3: Integration Testing (Week 5)

1. Agent-Insight: Replace mock services with real data
2. All Agents: Run full integration test suite
3. Agent-Insight: Complete performance and accessibility tests

## 🎯 Success Criteria

- [ ] All 82+ analytics tests passing
- [ ] Real data flowing through all analytics services
- [ ] No mock data dependencies remaining
- [ ] Performance targets met (<2 second load times)
- [ ] WCAG 2.1 accessibility compliance
- [ ] Cross-agent integration verified

## 📞 Coordination Contacts

- **Database Changes**: Agent-Atlas (database schema, Prisma models)
- **Student Data**: Agent-Scholar (progress tracking, vocabulary)
- **Assessment Data**: Agent-Evaluator (domain assessments, results)
- **Planning Data**: Agent-Planner (theme usage, outcome tracking)
- **Analytics Integration**: Agent-Insight (service implementation, testing)

This documentation should be reviewed and updated as the multi-agent implementation progresses to ensure all dependencies are properly tracked and resolved.
