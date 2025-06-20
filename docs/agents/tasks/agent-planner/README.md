# Agent-Planner Task Guide

You are Agent-Planner, responsible for weekly/term planning, curriculum management, and activity organization features.

## Your Mission

Build intelligent planning tools that reduce teacher workload by 60% while ensuring comprehensive curriculum coverage and engaging activities.

## Task Execution Order

### Phase 1: Core Planning (Do First)

1. **Activity Suggestion Engine** - AI-powered activity recommendations
2. **Weekly Planning Quality Scorecard** - Planning diagnostics
3. **Outcome-Aware Activities** - Link activities to outcomes

### Phase 2: Planning Enhancement

4. **Planning Assistant** - Intelligent planning suggestions
5. **Guided Planning Copilot** - Step-by-step planning guide
6. **Outcome-Aware Resources** - Smart resource recommendations
7. **Milestone Alert System** - Important date tracking

### Phase 3: Curriculum Management

8. **Curriculum Alignment Audit** - Coverage analysis
9. **Curriculum Search Assistant** - Enhanced outcome search
10. **Cross-Term Outcome Tracking** - Year-long progression
11. **Outcome Coverage Statistics** - Real-time coverage data

### Phase 4: Advanced Features

12. **Term Planning Assistant** - Long-term planning tools
13. **Theme-to-Outcome Planning** - Thematic unit planning
14. **Daily Oral Language Routines** - Routine template system

### Phase 5: Next-Tier AI Planning Features (HIGH PRIORITY)

15. **A1: AI Activity Generator** - Smart activity creation aligned with curriculum outcomes

    - AI-powered activity generation based on outcomes and constraints
    - Bilingual activity creation and labeling
    - Integration with existing activity library
    - **Dependency**: E1 Curriculum Embeddings (Agent-Atlas)

16. **A2: AI Weekly Planner Agent** - Conversational planning assistance

    - Natural language planning interface ("Plan week 6 to review science outcomes")
    - Context-aware plan generation using term/goal context
    - Full structured week plans with domain mix
    - **Dependency**: E1 Curriculum Embeddings, A1 Activity Generator

17. **A4: AI Prompt Generator** - Dynamic prompt creation for planning

    - Context-aware prompt generation for AI interactions
    - Planning scenario templates
    - Optimization of AI planning conversations
    - **Dependency**: E1, A1, A2

18. **E2: GPT Planning Agent** - Natural language planning interface
    - GPT-powered conversational planning assistant
    - Smart suggestions with source references
    - Teacher can regenerate, refine, accept, or reject suggestions
    - **Dependency**: E1 Curriculum Embeddings

## Technical Guidelines

### Component Structure

```
/client/src/components/planning/
├── WeeklyPlanner/
│   ├── PlannerGrid.tsx
│   ├── ActivitySelector.tsx
│   └── QualityScorecard.tsx
├── Activities/
│   ├── ActivitySuggestions.tsx
│   ├── ActivityLibrary.tsx
│   └── OutcomeMapper.tsx
├── Curriculum/
│   ├── CurriculumAudit.tsx
│   ├── OutcomeSearch.tsx
│   └── CoverageHeatmap.tsx
└── Assistant/
    ├── PlanningCopilot.tsx
    ├── ResourceRecommender.tsx
    └── MilestoneAlerts.tsx
```

### API Routes Structure

```
/api/planning/weekly/:weekNumber - GET, POST, PATCH weekly plans
/api/planning/suggestions - POST AI suggestions
/api/planning/quality-score - GET planning diagnostics
/api/activities/suggest - POST activity suggestions
/api/activities/templates - GET, POST activity templates
/api/curriculum/audit - GET coverage analysis
/api/curriculum/search - GET enhanced search
```

### Planning Intelligence

- Context-aware suggestions based on time of year
- Outcome coverage tracking
- Resource availability checking
- Special event consideration
- Student needs integration

## Coordination Requirements

### Dependencies on Agent-Atlas:

- Wait for ActivityTemplate model
- Wait for enhanced Theme model
- Wait for MilestoneDefinition model

### Integration Points:

- **With Agent-Scholar**: Consider student goals in planning
- **With Agent-Evaluator**: Plan assessments strategically
- **With Agent-Messenger**: Mark communicable activities
- **With Agent-Insight**: Provide planning data for analytics

### Special Coordination:

- You own WeeklyPlanner base component
- Agent-Messenger will add communication features via props
- Define clear prop interfaces for extensions

## What You Own

- `/client/src/components/planning/` - All planning components
- `/client/src/pages/WeeklyPlannerPage.tsx` - Main planner page
- `/server/src/routes/planning.ts` - Planning routes
- `/server/src/routes/curriculum.ts` - Curriculum routes
- `/server/src/services/planning/` - Planning logic
- `/server/src/services/activitySuggestionEngine.ts` - AI engine

## Feature Specifications

### Activity Suggestion Engine

- Context-aware recommendations
- Outcome alignment scoring
- Resource requirement checking
- Time allocation optimization
- Differentiation suggestions

### Planning Quality Scorecard

```javascript
interface QualityMetrics {
  outcomesCoverage: number;      // 0-100%
  assessmentBalance: number;     // 0-100%
  engagementVariety: number;     // 0-100%
  differentiationScore: number;  // 0-100%
  timeEfficiency: number;        // 0-100%
}
```

### Curriculum Audit Features

- Visual coverage heatmaps
- Gap identification
- Overemphasis warnings
- Term projection
- Historical comparisons

### Milestone Alerts

- Important date tracking
- Automatic reminders
- Planning adjustments
- Parent communication triggers
- Report card deadlines

## Success Criteria

- [ ] Planning time reduced by 60%
- [ ] 100% curriculum coverage achieved
- [ ] AI suggestions have high acceptance rate
- [ ] Quality scores improve over time
- [ ] Teachers report feeling more confident
- [ ] Students more engaged with activities

## Common Pitfalls to Avoid

1. Don't over-automate - keep teacher control
2. Consider prep time in suggestions
3. Balance screen time in activities
4. Account for resource availability
5. Respect teacher planning style preferences

## Testing Requirements

- Unit tests for suggestion algorithms
- Integration tests for planning workflows
- E2E tests for full planning cycles
- Performance tests for AI suggestions
- Curriculum coverage validation tests
