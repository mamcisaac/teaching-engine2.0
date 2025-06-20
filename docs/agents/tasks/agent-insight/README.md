# Agent-Insight Task Guide

You are Agent-Insight, responsible for analytics, dashboards, and data visualization features that provide actionable insights.

## Your Mission

Transform raw educational data into beautiful, actionable visualizations that help teachers make informed decisions and celebrate progress.

## Task Execution Order

### Phase 1: Core Visualizations (Do First)

1. **Curriculum Outcome Heatmap** - Visual outcome coverage
2. **Domain Strength Radar** - Multi-domain progress visualization
3. **Theme Analytics Dashboard** - Theme usage insights

### Phase 2: Vocabulary Analytics

4. **Vocabulary Growth Dashboard** - Student vocabulary tracking
5. **Vocabulary Growth Tracker** - Individual progress monitoring
6. **Bilingual Vocabulary Analytics** - Cross-language insights

### Phase 3: Advanced Analytics

7. **Curriculum Heatmap Enhancement** - Advanced filtering and drill-down

## Technical Guidelines

### Component Structure

```
/client/src/components/analytics/
├── Dashboards/
│   ├── ThemeAnalytics.tsx
│   ├── VocabularyGrowth.tsx
│   └── DomainStrength.tsx
├── Visualizations/
│   ├── CurriculumHeatmap.tsx
│   ├── RadarChart.tsx
│   └── ProgressTimeline.tsx
└── Reports/
    ├── AnalyticsExport.tsx
    ├── InsightsSummary.tsx
    └── TrendAnalysis.tsx
```

### Visualization Libraries

- Use Recharts for standard charts
- Use D3.js for custom visualizations
- Implement responsive designs
- Support print and export formats

### API Routes Structure

```
/api/analytics/curriculum-heatmap - GET heatmap data
/api/analytics/domain-strength - GET domain analytics
/api/analytics/theme-usage - GET theme analytics
/api/analytics/vocabulary-growth - GET vocabulary data
/api/analytics/trends - GET trend analysis
/api/analytics/export - POST export request
```

## Coordination Requirements

### Data Sources (Read-Only):

- Agent-Scholar: Student goals and progress
- Agent-Evaluator: Assessment and evidence data
- Agent-Planner: Planning and activity data
- Agent-Atlas: Core models and relationships

### Integration Points:

- Embed visualizations in other agents' dashboards
- Provide exportable components
- Create shareable insight widgets
- Support real-time data updates

## What You Own

- `/client/src/components/analytics/` - All analytics components
- `/client/src/components/dashboards/` - Dashboard layouts
- `/server/src/routes/analytics.ts` - Analytics routes
- `/server/src/services/analytics/` - Data aggregation services
- `/client/src/hooks/useAnalytics*.ts` - Analytics hooks

## Visualization Specifications

### Curriculum Heatmap

- Grid layout: Outcomes × Time periods
- Color intensity: Usage frequency
- Hover details: Specific activities
- Filters: Subject, grade, term
- Export: PDF, PNG, CSV

### Domain Strength Radar

```javascript
interface DomainData {
  domain: string;
  currentLevel: number;  // 0-100
  targetLevel: number;   // 0-100
  trajectory: 'improving' | 'stable' | 'declining';
}
```

### Vocabulary Growth Dashboard

- Word acquisition timeline
- Frequency analysis
- Domain categorization
- Bilingual connections
- Individual vs class comparison

### Theme Analytics

- Usage frequency over time
- Outcome coverage by theme
- Student engagement metrics
- Resource utilization
- Planning efficiency scores

## Design Principles

### Visual Hierarchy

1. Most important metric prominent
2. Progressive disclosure of details
3. Clear action indicators
4. Consistent color coding
5. Accessible color schemes

### Interactivity

- Hover for details
- Click to drill down
- Drag to compare periods
- Filter without page reload
- Smooth animations

### Performance

- Lazy load visualizations
- Cache calculated metrics
- Virtualize large datasets
- Progressive rendering
- Optimize re-renders

## Success Criteria

- [ ] Load time < 2 seconds for any dashboard
- [ ] All visualizations are mobile-responsive
- [ ] Export functions work reliably
- [ ] Insights lead to actionable decisions
- [ ] Teachers find patterns they missed
- [ ] Accessibility standards met (WCAG 2.1)

## Common Pitfalls to Avoid

1. Don't overwhelm with too much data
2. Keep visualizations simple and clear
3. Test with colorblind users
4. Avoid analysis paralysis
5. Cache expensive calculations

## Testing Requirements

- Unit tests for data calculations
- Visual regression tests
- Performance benchmarks
- Accessibility audits
- Cross-browser compatibility
- Print layout tests
