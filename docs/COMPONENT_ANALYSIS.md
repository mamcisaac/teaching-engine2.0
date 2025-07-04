# Component Analysis for TDD Testing

This document provides a comprehensive analysis of three React components to facilitate writing TDD tests with React Testing Library.

## 1. CalendarViewComponent

### Location
`client/src/components/CalendarViewComponent.tsx`

### Purpose
Displays a calendar grid view for a given month with events, allowing users to view and potentially add calendar events.

### Props Interface
```typescript
interface Props {
  month: Date;              // The month to display
  events?: CalendarEvent[]; // Optional pre-loaded events (bypasses API call)
}
```

### Key Features
1. **Date Calculations**: Uses `date-fns` to calculate month boundaries and generate day array
2. **Event Fetching**: Uses `useCalendarEvents` hook to fetch events from API (unless events prop provided)
3. **Event Grouping**: Groups events by date for efficient rendering
4. **Add Event Modal**: Shows "Add Event" button when no events prop provided
5. **Performance Optimizations**: 
   - Component is memoized with `React.memo`
   - Uses `useMemo` for expensive calculations (date ranges, event grouping)

### Behavior Details
- Renders a 7-column grid (one for each day of week)
- Each cell shows the day number and associated events
- Events are displayed as small cards with title
- Error handling: Logs errors to console but doesn't show error UI
- Conditional rendering: Shows "Add Event" button only when events prop is not provided
- Modal integration: Opens EventEditorModal when "Add Event" clicked

### Data Flow
1. If `events` prop provided: Uses those events directly
2. If no `events` prop: Fetches from API using date range
3. Groups events by date (YYYY-MM-DD format)
4. Renders grid with grouped events

### Test Considerations
- Mock `useCalendarEvents` hook for API testing
- Test with both provided events and API-fetched events
- Test date calculations and event grouping logic
- Test modal opening/closing behavior
- Test error scenarios

## 2. RecentPlans Component

### Location
`client/src/components/planning/RecentPlans.tsx`

### Purpose
Displays a card showing recently accessed planning documents with navigation links and status indicators.

### Props Interface
```typescript
interface RecentPlansProps {
  plans: RecentPlan[];    // Array of recent plan objects
  isLoading?: boolean;    // Loading state
  className?: string;     // Additional CSS classes
}
```

### RecentPlan Type
```typescript
interface RecentPlan {
  id: string;
  type: 'long-range' | 'unit' | 'lesson' | 'daybook';
  title: string;
  subject?: string;
  grade?: number;
  lastAccessed: Date;
  progress?: number;        // Progress percentage (0-100)
  status?: 'draft' | 'in-progress' | 'completed';
  parentTitle?: string;     // For hierarchy (e.g., unit name for lesson)
}
```

### Key Features
1. **Plan Type Configuration**: Maps plan types to icons, colors, routes, and labels
2. **Loading State**: Shows skeleton loader with 3 animated items
3. **Empty State**: Shows friendly message when no plans available
4. **Status Badges**: Displays completion status or progress bars
5. **Navigation**: Each plan is a clickable link to its detail page
6. **Responsive Design**: Uses Tailwind classes for mobile-friendly layout
7. **Performance**: Memoized with `React.memo` and uses `useMemo` for date formatting

### Visual Elements
- **Icons**: Different icons for each plan type (Calendar, BookOpen, GraduationCap, FileText)
- **Colors**: Type-specific color schemes (purple, blue, green, orange)
- **Progress Indicators**: 
  - "Completed" badge (green)
  - "Draft" badge (gray)
  - Progress bar with percentage
- **Metadata**: Shows plan type, subject, grade, parent context
- **Time Display**: "X time ago" format using `formatDistanceToNow`

### Behavior Details
- Links navigate to type-specific routes with plan ID
- "View all" link goes to `/planner`
- Shows "View planning history" link when 5+ plans
- Hover effects on plan items
- Chevron icons indicate clickable elements

### Test Considerations
- Test all three states: loading, empty, with data
- Test link generation for different plan types
- Test status badge rendering logic
- Test metadata display variations
- Test hover interactions
- Test responsive behavior

## 3. UnitPlanCard Component

### Location
`client/src/components/unitPlans/UnitPlanCard.tsx`

### Purpose
Displays a card representation of a unit plan with key information and action buttons.

### Props Interface
```typescript
interface UnitPlanCardProps {
  unit: UnitPlan;                    // Unit plan data
  onEdit: (unit: UnitPlan) => void;  // Edit callback function
}
```

### UnitPlan Type (Key Fields)
```typescript
interface UnitPlan {
  id: string;
  title: string;
  bigIdeas?: string;
  startDate: string;
  endDate: string;
  estimatedHours?: number;
  _count?: {
    lessonPlans?: number;
    expectations?: number;
  };
  progress?: {
    percentage: number;
  };
}
```

### Key Features
1. **Date Formatting**: Formats start/end dates as readable strings
2. **Big Ideas Display**: Shows truncated big ideas with line-clamp
3. **Metrics Display**: Shows hours, lesson count, expectation count
4. **Progress Tracking**: Optional progress percentage display
5. **Action Buttons**: "View Details" link and "Edit" button
6. **Performance**: Memoized component with `useMemo` for calculations

### Visual Layout
- **Header**: Title with hours badge
- **Content**: Big ideas (2-line clamp), date range
- **Footer**: Lesson/expectation counts, progress indicator
- **Actions**: Two buttons (View Details as primary, Edit as secondary)

### Behavior Details
- "View Details" navigates to `/planner/units/{id}`
- "Edit" button calls `onEdit` callback with unit data
- Hover effects on card (shadow transition)
- Responsive button layout

### Styling Details
- Card: White background, rounded corners, shadow on hover
- Badge: Indigo color scheme for hours
- Text hierarchy: Different sizes and colors for emphasis
- Button styles: Primary (indigo) and secondary (gray)

### Test Considerations
- Test date formatting logic
- Test conditional rendering (big ideas, progress)
- Test click handlers for both buttons
- Test navigation link generation
- Test count calculations with fallbacks
- Test hover effects

## Testing Strategy Recommendations

### Common Testing Patterns
1. **Render Testing**: Verify components render without errors
2. **Props Testing**: Test all prop variations
3. **State Testing**: Test loading, empty, and data states
4. **Interaction Testing**: Test clicks, hovers, and other user interactions
5. **Accessibility Testing**: Verify ARIA labels and keyboard navigation
6. **Responsive Testing**: Test mobile and desktop layouts

### Mock Requirements
1. **API Hooks**: Mock `useCalendarEvents` and related hooks
2. **Router**: Mock `Link` components and navigation
3. **Date Functions**: Consider mocking `date-fns` for consistent tests
4. **External Components**: Mock EventEditorModal, Card components

### Performance Testing
1. Test memoization effectiveness
2. Verify re-render behavior with different props
3. Test with large datasets (many events/plans)

### Edge Cases
1. Invalid dates
2. Missing required data
3. Very long text content
4. Network errors
5. Timezone differences