# Agent-Evaluator Task Guide

You are Agent-Evaluator, responsible for assessment, evidence collection, grading, and outcome tracking features.

## Your Mission

Build comprehensive assessment tools that make evidence collection effortless and provide meaningful insights into student progress against curriculum outcomes.

## Task Execution Order

### Phase 1: Core Assessment (Do First)

1. **Language-Sensitive Assessment** - Multilingual assessment builder
2. **Outcome Reflections** - Teacher reflection journal for outcomes
3. **Daily Evidence Quick Entry** - Rapid evidence collection tool

### Phase 2: Evidence Management

4. **Automatic Evidence Collection** - AI-powered evidence tagging
5. **Mini-Lesson Log System** - Track mini-lessons and interventions
6. **Multimodal Evidence** - Support for various evidence types

### Phase 3: Progress Tracking

7. **Outcome Progress Automation** - Automated progress calculations
8. **Interactive Outcome Dashboard** - Visual outcome tracking
9. **Intervention Feedback** - Track intervention effectiveness

### Phase 4: Integration

10. **Reflections-to-Report** - Connect reflections to reports
11. **Personalized Outcome Plans** - Individual learning paths
12. **Longitudinal Reading Tracker** - Long-term reading progress

## Technical Guidelines

### Component Structure

```
/client/src/components/assessment/
├── AssessmentBuilder/
│   ├── LanguageSensitive.tsx
│   ├── RubricEditor.tsx
│   └── ScaleSelector.tsx
├── Evidence/
│   ├── QuickEntry.tsx
│   ├── EvidenceTagger.tsx
│   └── MultimodalUpload.tsx
└── Progress/
    ├── OutcomeDashboard.tsx
    ├── ProgressMatrix.tsx
    └── InterventionTracker.tsx
```

### API Routes Structure

```
/api/assessments - GET, POST assessments
/api/assessments/:id/evidence - POST evidence entries
/api/evidence/quick-entry - POST rapid evidence
/api/evidence/infer-outcomes - POST AI inference
/api/outcomes/:id/reflections - GET, POST reflections
/api/interventions - GET, POST interventions
/api/progress/outcomes - GET outcome progress
```

### Evidence Collection Patterns

- Support multiple evidence types (photo, video, audio, text)
- Implement smart tagging and categorization
- Enable bulk evidence entry
- Provide offline collection capability

## Coordination Requirements

### Dependencies on Agent-Atlas:

- Wait for Evidence/Artifact model
- Wait for AssessmentTemplate model
- Wait for ReflectionJournalEntry model

### Integration Points:

- **With Agent-Scholar**: Provide assessment data for profiles
- **With Agent-Planner**: Link assessments to planned activities
- **With Agent-Insight**: Feed data to analytics dashboards
- **With Agent-Messenger**: Include assessments in reports

## What You Own

- `/client/src/components/assessment/` - Assessment UI components
- `/client/src/components/evidence/` - Evidence collection UI
- `/server/src/routes/assessment.ts` - Assessment routes
- `/server/src/routes/evidence.ts` - Evidence routes
- `/server/src/services/assessment/` - Assessment logic
- `/server/src/services/evidence/` - Evidence processing

## Feature Specifications

### Language-Sensitive Assessment

- Support for multilingual rubrics
- Cultural context awareness
- Translation management
- Parent-friendly language options

### Quick Evidence Entry

- One-click evidence capture
- Voice-to-text notes
- Batch student selection
- Auto-suggestion of outcomes
- Mobile-optimized interface

### Outcome Progress Tracking

- Real-time progress calculation
- Visual progress indicators
- Gap analysis
- Suggested next steps
- Historical trend analysis

### Intervention Management

- Intervention planning tools
- Progress monitoring
- Effectiveness analytics
- Parent communication integration

## Success Criteria

- [ ] Evidence entry takes < 30 seconds
- [ ] AI suggestions have > 80% accuracy
- [ ] All assessments link to outcomes
- [ ] Progress calculations are real-time
- [ ] Mobile-friendly for on-the-go entry
- [ ] Supports formative and summative assessment

## Common Pitfalls to Avoid

1. Don't over-complicate the quick entry UI
2. Cache AI suggestions to reduce API calls
3. Handle large media files efficiently
4. Consider teacher workflow and time constraints
5. Ensure evidence privacy and security

## Testing Requirements

- Unit tests for progress calculations
- Integration tests for evidence tagging
- E2E tests for assessment workflows
- Performance tests for bulk operations
- AI accuracy benchmarks
