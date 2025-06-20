# Agent Coordination Guide for Parallel Development

This guide ensures that all 6 agents can work in parallel without creating merge conflicts. Each agent has been assigned tasks that modify distinct areas of the codebase.

## Agent Assignments and Boundaries

### 1. Agent-Atlas (Database & Core Models)

**Focus:** Creates foundational database models and core services
**Owns:**

- `/packages/database/prisma/schema.prisma` - New model additions only
- `/packages/database/prisma/migrations/` - New migration files
- `/server/src/models/` - Core model types
- `/server/src/services/core/` - Core services

**Key Models Created:**

- TeacherCollaboration, CollaborationItem
- TeacherReflection
- CognatePair
- OutcomeDependency
- MediaResource, Artifact
- SPTExportLog

**Restrictions:**

- Must NOT modify existing models without coordination
- Must use sequential migration naming
- Must document all new models in schema comments

### 2. Agent-Scholar (Student Features)

**Focus:** Student profiles, goals, and timeline features
**Owns:**

- `/client/src/components/students/` - All student-related components
- `/client/src/pages/StudentsPage.tsx` - Main students page
- `/server/src/routes/student.ts` - Student API routes
- `/server/src/services/student/` - Student services

**Key Components Created:**

- StudentProfileDashboard
- StudentGoals, GoalTracker
- StudentTimeline
- StudentVoicePortfolio
- LearningArtifactGallery

**Restrictions:**

- Must NOT modify WeeklyPlanner components
- Must NOT modify assessment components directly
- Coordinate with Agent-Atlas for new database models

### 3. Agent-Evaluator (Assessment & Evidence)

**Focus:** Assessment, evidence collection, and grading
**Owns:**

- `/client/src/components/assessment/` - Assessment components
- `/client/src/components/evidence/` - Evidence collection UI
- `/server/src/routes/assessment.ts` - Assessment routes
- `/server/src/routes/evidence.ts` - Evidence routes
- `/server/src/services/assessment/` - Assessment services

**Key Components Created:**

- LanguageSensitiveAssessmentBuilder
- EvidenceQuickEntry
- MiniLessonLogger
- OutcomeReflectionsJournal
- InterventionFeedback

**Restrictions:**

- Must NOT modify student profile components
- Must NOT modify planning components
- Coordinate with Agent-Scholar for student-related integrations

### 4. Agent-Planner (Planning & Curriculum)

**Focus:** Weekly/term planning and curriculum management
**Owns:**

- `/client/src/components/planning/` - Planning components
- `/client/src/pages/WeeklyPlannerPage.tsx` - Weekly planner page
- `/server/src/routes/planning.ts` - Planning routes
- `/server/src/routes/curriculum.ts` - Curriculum routes
- `/server/src/services/planning/` - Planning services

**Key Components Created:**

- ActivitySuggestionEngine
- PlanningAssistant
- GuidedPlanningCopilot
- WeeklyPlanningScorecard
- TermPlanningAssistant

**Restrictions:**

- Must NOT modify student components
- Must NOT modify parent communication components
- Coordinate with Agent-Messenger for WeeklyPlanner integrations

### 5. Agent-Insight (Analytics & Dashboards)

**Focus:** Dashboards, visualizations, and analytics
**Owns:**

- `/client/src/components/analytics/` - Analytics components
- `/client/src/components/dashboards/` - Dashboard components
- `/server/src/routes/analytics.ts` - Analytics routes
- `/server/src/services/analytics/` - Analytics services

**Key Components Created:**

- ThemeAnalyticsDashboard
- CurriculumHeatmap
- DomainStrengthRadar
- VocabularyGrowthDashboard

**Restrictions:**

- Read-only access to other components' data
- Must NOT modify data models
- Must use existing APIs for data access

### 6. Agent-Messenger (Communication & Export)

**Focus:** Parent communication, reports, and exports
**Owns:**

- `/client/src/components/communication/` - Communication components
- `/client/src/components/reports/` - Report components
- `/client/src/pages/ParentCommunicationPage.tsx` - Parent comm page
- `/server/src/routes/communication.ts` - Communication routes
- `/server/src/routes/reports.ts` - Report routes
- `/server/src/services/communication/` - Communication services

**Key Components Created:**

- ParentCommunicationCenter
- FamilyPortal
- ReportCommentGenerator
- NarrativeReportGenerator
- DynamicReportCard

**Restrictions:**

- Must coordinate with Agent-Planner for WeeklyPlanner integration
- Must NOT modify student profile components
- Must use existing APIs for data access

## Conflict Prevention Rules

### 1. File Ownership

- Each agent owns specific directories as listed above
- Agents must NOT modify files outside their ownership without coordination
- Shared files require explicit coordination through this guide

### 2. Database Migrations

- Only Agent-Atlas creates new models in schema.prisma
- Other agents request models through Agent-Atlas
- Migrations must be numbered sequentially
- Run `pnpm --filter @teaching-engine/database db:generate` after schema changes

### 3. Shared Components

- `/client/src/components/ui/` - Read-only for all agents
- `/client/src/utils/` - Create new utils, don't modify existing
- `/client/src/hooks/` - Create agent-specific hooks
- `/client/src/types/` - Coordinate type additions through comments

### 4. API Routes

- Each agent owns their designated route files
- New routes must follow naming convention: `/api/{agent-area}/...`
- Shared services must be created in `/server/src/services/shared/`

### 5. Import/Export Rules

- Import shared components, don't copy
- Export new components for other agents to use
- Document exported interfaces clearly
- Use TypeScript interfaces for cross-agent contracts

## Coordination Protocol

### When Coordination is Required:

1. Modifying any file outside your ownership
2. Adding fields to existing database models
3. Changing shared TypeScript interfaces
4. Modifying existing API endpoints
5. Integrating with another agent's components

### How to Coordinate:

1. Add a comment in the file: `// TODO: Coordinate with Agent-X for Y`
2. Document the required change in this guide
3. Create an interface/contract for the integration
4. Use feature flags for gradual integration

## Integration Points

### Critical Integration Areas:

1. **WeeklyPlanner Integration**

   - Agent-Planner owns the base component
   - Agent-Messenger adds parent communication features
   - Coordinate through props and callbacks

2. **Student Dashboard Integration**

   - Agent-Scholar owns the main dashboard
   - Agent-Evaluator adds assessment widgets
   - Agent-Insight adds analytics widgets

3. **Outcome Management**
   - Agent-Planner manages curriculum outcomes
   - Agent-Evaluator tracks outcome evidence
   - Agent-Insight visualizes outcome coverage

### Safe Practices:

1. Create new files rather than modifying existing ones
2. Use composition over modification
3. Extend interfaces rather than changing them
4. Add optional props rather than required ones
5. Use event emitters for loose coupling

## Development Workflow

### Each Agent Should:

1. Read their assigned tasks in their folder
2. Check this guide before starting work
3. Create feature branches: `agent-{name}/{feature}`
4. Run tests before committing
5. Document API changes
6. Update this guide if coordination rules change

### Testing Requirements:

- Unit tests for all new components
- Integration tests for API endpoints
- E2E tests for critical user flows
- No breaking existing tests

## Merge Strategy

### Order of Implementation:

1. Agent-Atlas completes database models first
2. Other agents work in parallel
3. Integration features done last
4. Review coordination points before merging

### Pre-merge Checklist:

- [ ] All tests pass
- [ ] No conflicts with other agents' code
- [ ] Documentation updated
- [ ] Types exported for other agents
- [ ] Migration files sequential
- [ ] Feature flags for partial features

Remember: When in doubt, create new files rather than modifying existing ones!
