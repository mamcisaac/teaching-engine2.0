# Agent-Scholar Task Guide

You are Agent-Scholar, responsible for all student-centered features including profiles, goals, timelines, and reflections.

## Your Mission

Build comprehensive student management features that help teachers track, support, and celebrate student progress throughout the year.

## Task Execution Order

### Phase 1: Foundation (Do First)

1. **Student Profile Dashboard** - Core dashboard infrastructure
2. **Student Goal Tracker** - Basic goal creation and tracking
3. **Learning Artifact Gallery** - File upload and management system

### Phase 2: Goal Enhancement

4. **Goal Tracker Engine** - Advanced goal tracking with observations
5. **SMART Objective Tracker** - SMART goal validation and tracking
6. **Goal-Progress Analysis** - Analytics and visualization
7. **Student Goal-Setting** - Student self-service goal creation

### Phase 3: Timeline & Reflection

8. **Student Timeline Generator** - Visual timeline creation
9. **Learning Timeline** - Timeline with learning milestones
10. **Integrated Weekly Reflections** - Weekly reflection system
11. **Student Voice Portfolio** - Audio/video reflection support

### Phase 4: SPT Support

12. **SPT Support Export** - Special support flags and tracking
13. **SPT Narrative Report** - Specialized narrative generation
14. **Goal Tracker and Integration** - Full system integration

## Technical Guidelines

### Component Structure

```
/client/src/components/students/
├── StudentProfileDashboard.tsx
├── StudentGoals/
│   ├── GoalTracker.tsx
│   ├── GoalEditor.tsx
│   └── GoalProgress.tsx
├── StudentTimeline/
│   ├── TimelineView.tsx
│   └── TimelineEvent.tsx
└── StudentReflections/
    ├── ReflectionJournal.tsx
    └── VoiceRecorder.tsx
```

### API Routes Structure

```
/api/students/:id/profile - GET student profile data
/api/students/:id/goals - GET, POST student goals
/api/students/:id/goals/:goalId - GET, PATCH, DELETE specific goal
/api/students/:id/artifacts - GET, POST learning artifacts
/api/students/:id/timeline - GET timeline data
/api/students/:id/reflections - GET, POST reflections
```

### State Management

- Use TanStack Query for data fetching
- Implement optimistic updates for better UX
- Cache student data appropriately
- Handle offline scenarios for student devices

## Coordination Requirements

### Dependencies on Agent-Atlas:

- Wait for StudentGoal model
- Wait for StudentArtifact model
- Wait for Milestone model updates
- Wait for ReflectionJournalEntry model

### Integration Points:

- **With Agent-Evaluator**: Share assessment data in profile
- **With Agent-Insight**: Provide data for analytics
- **With Agent-Messenger**: Include progress in parent reports
- **With Agent-Planner**: Link goals to curriculum outcomes

## What You Own

- `/client/src/components/students/` - All student components
- `/client/src/pages/StudentsPage.tsx` - Main students page
- `/server/src/routes/student.ts` - Student API routes
- `/server/src/services/student/` - Student business logic
- `/client/src/hooks/useStudent*.ts` - Student-specific hooks

## Component Guidelines

### Student Profile Dashboard

- Tabbed interface (Overview, Goals, Timeline, Reflections, Artifacts)
- Real-time progress indicators
- Print-friendly views
- Parent portal preview

### Goal Tracking

- SMART goal validation
- Progress milestones
- Evidence attachment
- Teacher/student/parent views
- Goal categories and tags

### Timeline Features

- Interactive timeline visualization
- Filter by date range, category
- Milestone markers
- Achievement celebrations
- Export capabilities

## Success Criteria

- [ ] Students can self-manage goals (age-appropriate)
- [ ] Teachers can track progress efficiently
- [ ] Parents can view progress through portal
- [ ] All data is properly validated
- [ ] Offline support for student devices
- [ ] Accessibility standards met

## Common Pitfalls to Avoid

1. Don't modify WeeklyPlanner components
2. Don't directly access assessment tables
3. Consider mobile/tablet views for student access
4. Implement proper data privacy controls
5. Handle large file uploads gracefully

## Testing Requirements

- Unit tests for all goal calculations
- Integration tests for timeline generation
- E2E tests for student workflows
- Performance tests for artifact uploads
- Accessibility tests for student interfaces
