# Analytics Integration Guide for Agents

This guide shows how other agents can integrate Agent-Insight's analytics components into their dashboards and interfaces.

## 🎯 Quick Start

### Basic Widget Integration

```tsx
import { AnalyticsWidget } from '@/components/analytics/AnalyticsWidget';

// Simple curriculum coverage widget
<AnalyticsWidget
  type="curriculum-heatmap"
  teacherId={123}
  subject="Mathematics"
  size="medium"
/>

// Student domain analysis
<AnalyticsWidget
  type="domain-radar"
  studentId={456}
  size="large"
  showExport={true}
/>
```

### Dashboard Layout

```tsx
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsWidget';

const widgets = [
  {
    type: 'mini-curriculum-summary',
    teacherId: 123,
    size: 'small',
  },
  {
    type: 'mini-vocabulary-stats',
    studentId: 456,
    size: 'small',
  },
  {
    type: 'domain-radar',
    studentId: 456,
    size: 'large',
  },
];

<AnalyticsDashboard widgets={widgets} columns={3} gap="gap-6" />;
```

## 📊 Available Widget Types

### Full Components

#### `curriculum-heatmap`

- **Purpose**: Visualizes outcome coverage across time periods
- **Best for**: Teacher dashboards, planning interfaces
- **Props**: `teacherId`, `subject`, `domain`, `startWeek`, `endWeek`
- **Size recommendations**: `medium` to `large`

```tsx
<AnalyticsWidget
  type="curriculum-heatmap"
  teacherId={123}
  subject="Science"
  startWeek={1}
  endWeek={20}
  size="large"
  title="Q1 Science Coverage"
/>
```

#### `domain-radar`

- **Purpose**: Shows student strengths across learning domains
- **Best for**: Student profiles, parent dashboards, progress reviews
- **Props**: `studentId`, `term`, `compareTo`
- **Size recommendations**: `medium` to `large`

```tsx
<AnalyticsWidget
  type="domain-radar"
  studentId={456}
  term="Term 1"
  size="medium"
  showExport={true}
/>
```

#### `theme-analytics`

- **Purpose**: Analyzes theme usage and balance across curriculum
- **Best for**: Curriculum planning, theme coordination
- **Props**: `teacherId`, `subject`, `startDate`, `endDate`
- **Size recommendations**: `large` to `full`

```tsx
<AnalyticsWidget type="theme-analytics" teacherId={123} size="full" title="Theme Usage Analysis" />
```

#### `vocabulary-growth`

- **Purpose**: Tracks vocabulary acquisition and bilingual development
- **Best for**: Language learning dashboards, progress monitoring
- **Props**: `studentId`, `term`, `weekCount`
- **Size recommendations**: `large` to `full`

```tsx
<AnalyticsWidget type="vocabulary-growth" studentId={456} weekCount={12} size="large" />
```

### Mini Widgets (for Dashboard Cards)

#### `mini-curriculum-summary`

- **Purpose**: Quick curriculum coverage overview
- **Size**: Always `small`
- **Props**: `teacherId`, `subject`

#### `mini-domain-overview`

- **Purpose**: Student performance at a glance
- **Size**: Always `small`
- **Props**: `studentId`

#### `mini-vocabulary-stats`

- **Purpose**: Vocabulary progress summary
- **Size**: Always `small`
- **Props**: `studentId`

## 🎨 Styling and Layout

### Size Options

- `small`: 256px × 192px (cards, sidebar widgets)
- `medium`: 384px × 256px (dashboard sections)
- `large`: Full width × 384px (main content areas)
- `full`: Full width × Full height (dedicated pages)

### Custom Styling

```tsx
<AnalyticsWidget
  type="domain-radar"
  studentId={456}
  className="border-2 border-blue-200 rounded-xl shadow-lg"
  size="medium"
/>
```

### Responsive Layouts

```tsx
<AnalyticsDashboard
  widgets={widgets}
  layout="grid"
  columns={3}
  gap="gap-4"
  className="lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1"
/>
```

## 🔧 Agent-Specific Integration Examples

### Agent-Planner Integration

```tsx
// Weekly planner with curriculum insights
const PlannerDashboard = ({ teacherId }) => (
  <div className="grid grid-cols-3 gap-6">
    <div className="col-span-2">
      {/* Planner content */}
      <WeeklyPlanner teacherId={teacherId} />
    </div>
    <div className="space-y-4">
      <AnalyticsWidget type="mini-curriculum-summary" teacherId={teacherId} size="small" />
      <AnalyticsWidget
        type="curriculum-heatmap"
        teacherId={teacherId}
        size="medium"
        startWeek={getCurrentWeek()}
        endWeek={getCurrentWeek() + 4}
        title="Upcoming Coverage"
      />
    </div>
  </div>
);
```

### Agent-Scholar Integration

```tsx
// Student goal dashboard with analytics
const StudentGoalDashboard = ({ studentId }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-4 gap-4">
      <AnalyticsWidget type="mini-domain-overview" studentId={studentId} size="small" />
      <AnalyticsWidget type="mini-vocabulary-stats" studentId={studentId} size="small" />
      {/* Other goal widgets */}
    </div>

    <AnalyticsWidget
      type="domain-radar"
      studentId={studentId}
      size="large"
      title="Current Progress"
    />
  </div>
);
```

### Agent-Evaluator Integration

```tsx
// Assessment results with domain analysis
const AssessmentResults = ({ studentId, assessmentId }) => (
  <div className="grid grid-cols-2 gap-6">
    <div>
      {/* Assessment details */}
      <AssessmentSummary assessmentId={assessmentId} />
    </div>
    <div>
      <AnalyticsWidget
        type="domain-radar"
        studentId={studentId}
        size="medium"
        title="Domain Performance"
      />
    </div>
  </div>
);
```

### Agent-Atlas Integration

```tsx
// System overview dashboard
const SystemDashboard = ({ teacherId }) => {
  const dashboardWidgets = [
    { type: 'mini-curriculum-summary', teacherId, size: 'small' },
    { type: 'curriculum-heatmap', teacherId, size: 'large' },
    { type: 'theme-analytics', teacherId, size: 'large' },
  ];

  return (
    <div>
      <h1>Teaching Engine Overview</h1>
      <AnalyticsDashboard widgets={dashboardWidgets} layout="grid" columns={3} />
    </div>
  );
};
```

## 🚀 Advanced Usage

### Custom Widget Configurations

```tsx
// Widget with custom error handling
const CustomAnalyticsSection = () => {
  const [error, setError] = useState(null);

  return (
    <div>
      <AnalyticsWidget
        type="curriculum-heatmap"
        teacherId={123}
        size="large"
        onError={setError}
        fallback={<CustomErrorComponent error={error} />}
      />
    </div>
  );
};
```

### Performance Optimization

```tsx
// Lazy load analytics for better performance
const LazyAnalyticsDashboard = React.lazy(() =>
  import('@/components/analytics/AnalyticsWidget').then((module) => ({
    default: module.AnalyticsDashboard,
  })),
);

// Use with Suspense
<Suspense fallback={<DashboardSkeleton />}>
  <LazyAnalyticsDashboard widgets={widgets} />
</Suspense>;
```

### Hook-based Integration

```tsx
import { useAnalyticsWidget } from '@/components/analytics/AnalyticsWidget';

const MyComponent = ({ studentId }) => {
  const domainWidget = useAnalyticsWidget({
    type: 'domain-radar',
    studentId,
    size: 'medium',
  });

  return (
    <div>
      <h2>Student Progress</h2>
      {domainWidget}
    </div>
  );
};
```

## 📋 Integration Checklist

### For Each Agent Integration:

- [ ] **Identify Use Cases**: Determine which analytics would benefit your users
- [ ] **Choose Widget Types**: Select appropriate full components vs mini widgets
- [ ] **Plan Layout**: Design widget placement in your existing UI
- [ ] **Configure Props**: Ensure you're passing the correct data (teacherId, studentId, etc.)
- [ ] **Test Performance**: Verify analytics don't slow down your interface
- [ ] **Handle Errors**: Implement fallbacks for widget failures
- [ ] **Test Responsive**: Ensure widgets work on mobile devices
- [ ] **Document Usage**: Update your agent documentation with analytics features

### Performance Guidelines:

- Use mini widgets for frequently updated dashboards
- Implement lazy loading for large analytics components
- Cache widget configurations when possible
- Limit concurrent widget API calls

### Error Handling:

```tsx
// Graceful degradation
<AnalyticsWidget
  type="domain-radar"
  studentId={studentId}
  fallback={<div className="p-4 text-gray-500 text-center">Analytics temporarily unavailable</div>}
/>
```

## 🔌 API Integration Notes

### Data Requirements:

- **Teacher ID**: Required for curriculum and theme analytics
- **Student ID**: Required for domain and vocabulary analytics
- **Term/Date Range**: Optional but recommended for time-based analytics

### Caching Behavior:

- Widget data is cached for 5-10 minutes
- Each widget has its own query client to avoid conflicts
- Cache keys include all relevant parameters

### Rate Limiting:

- Analytics APIs are optimized for dashboard usage
- Batch widget requests when possible
- Use mini widgets to reduce API load

## 🆘 Troubleshooting

### Common Issues:

1. **Widget Not Loading**: Check if required props (studentId, teacherId) are provided
2. **Performance Issues**: Consider using mini widgets or lazy loading
3. **Data Conflicts**: Ensure each widget has unique query keys
4. **Layout Problems**: Verify size and className configurations

### Debug Mode:

```tsx
<AnalyticsWidget
  type="domain-radar"
  studentId={456}
  debug={true} // Enables console logging
/>
```

### Support:

For integration help, refer to:

- `OUT_OF_SCOPE_ANALYTICS_FIXES.md` for coordination requirements
- Agent-Insight task documentation in `docs/agents/tasks/agent-insight/`
- Example implementations in this guide

## 📈 Roadmap

### Coming Soon:

- Real-time data updates via WebSocket
- Custom widget themes and branding
- Advanced filtering and drill-down capabilities
- Export functionality for all widget types
- Mobile-optimized mini widget layouts

### Performance Improvements:

- Server-side rendering for critical widgets
- Progressive loading for large datasets
- Enhanced caching strategies
- Background data prefetching

This integration system enables seamless collaboration between agents while maintaining performance and user experience standards.
