# Elementary Teacher Curriculum Planning System - UI Implementation Guide

## 🎯 Overview

This guide provides detailed instructions for implementing the UI of the Elementary Teacher Curriculum Planning System. Follow each section sequentially, checking off items as completed.

---

## 📋 Pre-Implementation Checklist

### Environment Setup

- [ ] Verify Node.js 18+ is installed
- [ ] Verify pnpm is installed globally
- [ ] Clone the repository
- [ ] Run `pnpm install` in root directory
- [ ] Verify SQLite database is initialized with Prisma
- [ ] Run `pnpm run dev` to ensure basic setup works

### Tech Stack Verification

- [ ] React 18 with Vite configured
- [ ] TypeScript properly configured
- [ ] Tailwind CSS installed and configured
- [ ] TanStack Query (React Query) installed
- [ ] Express server running on backend
- [ ] Prisma ORM connected to SQLite

---

## 🏗️ Phase 1: Core Layout Structure

### 1.1 App Shell Component

**File:** `src/components/AppShell.tsx`

#### Implementation Checklist:

- [ ] Create main layout wrapper component
- [ ] Implement responsive grid/flex layout
- [ ] Add sidebar navigation component
- [ ] Add main content area with routing outlet
- [ ] Implement mobile-responsive hamburger menu
- [ ] Add header with app title and user info area

#### Component Structure:

```typescript
// Required props and state
interface AppShellProps {
  children: React.ReactNode
}

// State requirements
- sidebarOpen: boolean (for mobile toggle)
- currentRoute: string (for active nav highlighting)
```

#### Styling Requirements:

- [ ] Minimum 14px font size for body text
- [ ] Touch targets minimum 44px × 44px
- [ ] High contrast colors (WCAG AA compliance)
- [ ] Smooth transitions for sidebar toggle

### 1.2 Navigation Component

**File:** `src/components/Navigation.tsx`

#### Implementation Checklist:

- [ ] Create vertical navigation menu
- [ ] Add navigation items with icons and labels:
  - [ ] 📚 Curriculum
  - [ ] 📅 Weekly Plan
  - [ ] 📎 Resources
  - [ ] 📊 Progress
  - [ ] 💬 Communication
  - [ ] 📝 Notes
- [ ] Add prominent Emergency Plans button (🚨)
- [ ] Implement active state highlighting
- [ ] Add keyboard navigation support
- [ ] Ensure proper ARIA labels

#### Icon Implementation:

- [ ] Use lucide-react or heroicons for consistency
- [ ] Ensure icons are 24px × 24px minimum
- [ ] Add proper aria-labels for screen readers

---

## 🎨 Phase 2: Design System Setup

### 2.1 Theme Configuration

**File:** `src/styles/theme.ts`

#### Color Palette Setup:

- [ ] Primary: Blue (#3B82F6) - main actions
- [ ] Secondary: Green (#10B981) - success states
- [ ] Accent: Orange (#F59E0B) - important actions
- [ ] Background: Gray scale (#F9FAFB, #F3F4F6, #E5E7EB)
- [ ] Error: Red (#EF4444)
- [ ] Warning: Yellow (#F59E0B)

#### Typography Setup:

- [ ] Base font: Inter or system font stack
- [ ] Font sizes: 14px (base), 16px (large), 18px (xl), 24px (2xl)
- [ ] Line heights: 1.5 (body), 1.2 (headings)
- [ ] Font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### 2.2 Reusable Components

**Directory:** `src/components/ui/`

#### Button Component (`Button.tsx`):

- [ ] Create base button with variants (primary, secondary, danger)
- [ ] Add size options (sm, md, lg)
- [ ] Implement loading state with spinner
- [ ] Add disabled state styling
- [ ] Ensure keyboard focus indicators

#### Card Component (`Card.tsx`):

- [ ] Create container with consistent padding/shadows
- [ ] Add header, body, footer sections
- [ ] Implement hover states for interactive cards
- [ ] Add drag handle for draggable cards

#### Form Components:

- [ ] Input field with label and error states
- [ ] Textarea with character counter
- [ ] Select dropdown with search capability
- [ ] Checkbox and radio button groups
- [ ] Date picker component

---

## 📱 Phase 3: Feature Screen Implementation

### 3.1 Curriculum Planner Screen

**File:** `src/pages/Curriculum/CurriculumPlanner.tsx`

#### Layout Requirements:

- [ ] Split view: subjects sidebar (left) + content area (right)
- [ ] Responsive: Stack on mobile, side-by-side on desktop

#### Subject List Component:

- [ ] Display all subjects as clickable list items
- [ ] Show subject icon and name
- [ ] Highlight selected subject
- [ ] "Add Subject" button at bottom
- [ ] Implement subject CRUD operations

#### Milestone Cards Component:

- [ ] Display milestone cards in grid/list layout
- [ ] Each card shows:
  - [ ] Title (editable)
  - [ ] Target date
  - [ ] Progress bar (0-100%)
  - [ ] Estimated hours
  - [ ] Edit/Delete actions
- [ ] "Add Milestone" floating action button
- [ ] Drag-to-reorder functionality

#### Activity List Component:

- [ ] Nested under each milestone
- [ ] Show activity type icon
- [ ] Display duration
- [ ] Quick add/edit/delete actions
- [ ] Drag between milestones

#### API Integration:

- [ ] GET /api/subjects
- [ ] POST /api/subjects
- [ ] GET /api/milestones?subjectId=X
- [ ] POST/PUT/DELETE /api/milestones
- [ ] GET /api/activities?milestoneId=X
- [ ] POST/PUT/DELETE /api/activities

### 3.2 Weekly Planner Screen

**File:** `src/pages/WeeklyPlan/WeeklyPlanner.tsx`

#### Layout Requirements:

- [ ] Split pane: activity suggestions (left) + week calendar (right)
- [ ] Responsive: Stack on mobile

#### Activity Suggestion Panel:

- [ ] Filter controls at top:
  - [ ] Subject checkboxes
  - [ ] Activity type dropdown
  - [ ] Duration range slider
- [ ] Scrollable list of suggested activities
- [ ] Each activity shows:
  - [ ] Title and subject
  - [ ] Duration badge
  - [ ] Resources indicator
  - [ ] "Add to week" button
- [ ] Implement drag source for drag-drop

#### Week Calendar Component:

- [ ] 7-day grid view (Mon-Sun)
- [ ] Time slots for each day
- [ ] Drop zones for activities
- [ ] Visual feedback during drag
- [ ] Activity cards show:
  - [ ] Title (truncated if needed)
  - [ ] Time and duration
  - [ ] Subject color coding
- [ ] "Auto-fill week" button
- [ ] "Finalize week" action

#### Drag and Drop Implementation:

- [ ] Use @dnd-kit/sortable for accessibility
- [ ] Implement drag preview
- [ ] Handle drop validation
- [ ] Update state optimistically
- [ ] Sync with backend on drop

### 3.3 Progress Dashboard

**File:** `src/pages/Progress/ProgressDashboard.tsx`

#### Components:

- [ ] Subject progress cards in grid
- [ ] Each card shows:
  - [ ] Subject name and icon
  - [ ] Overall progress percentage
  - [ ] Milestone breakdown list
  - [ ] Visual progress bar
- [ ] Timeline view toggle
- [ ] Filters for date range

#### Visualizations:

- [ ] Use Recharts or Chart.js
- [ ] Progress over time line chart
- [ ] Subject distribution pie chart
- [ ] Milestone completion heatmap

### 3.4 Newsletter Editor

**File:** `src/pages/Communication/NewsletterEditor.tsx`

#### Rich Text Editor:

- [ ] Use TipTap or Lexical for rich text
- [ ] Toolbar with formatting options:
  - [ ] Bold, italic, underline
  - [ ] Headers (H2, H3)
  - [ ] Lists (ordered, unordered)
  - [ ] Link insertion
  - [ ] Image upload
- [ ] Auto-save functionality

#### Features:

- [ ] Date range selector
- [ ] "Auto-generate" button
- [ ] Subject section templates
- [ ] Photo gallery modal
- [ ] Export options (PDF, DOCX)
- [ ] Preview mode

---

## 🔄 Phase 4: State Management

### 4.1 Global State Setup

**File:** `src/store/`

#### TanStack Query Configuration:

- [ ] Set up QueryClient with defaults
- [ ] Configure cache time (5 minutes)
- [ ] Set up refetch on window focus
- [ ] Implement optimistic updates

#### Custom Hooks:

- [ ] `useSubjects()` - fetch and cache subjects
- [ ] `useMilestones(subjectId)` - fetch milestones
- [ ] `useActivities(milestoneId)` - fetch activities
- [ ] `useWeekPlan(weekStart)` - fetch week data
- [ ] Mutation hooks for CRUD operations

### 4.2 Local State Management

- [ ] Use React Context for UI state (sidebar, modals)
- [ ] Implement form state with react-hook-form
- [ ] Handle drag-drop state locally
- [ ] Sync with backend after user actions

---

## 🧪 Phase 5: Testing & Optimization

### 5.1 Accessibility Testing

- [ ] Run axe-core accessibility audit
- [ ] Test keyboard navigation flow
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios
- [ ] Test with browser zoom 200%

### 5.2 Performance Optimization

- [ ] Implement React.lazy for route splitting
- [ ] Add loading skeletons for all data fetches
- [ ] Optimize images with lazy loading
- [ ] Minimize bundle size (< 300KB initial)
- [ ] Test on low-end devices

### 5.3 Cross-Browser Testing

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] iOS Safari (tablet)
- [ ] Chrome Android (tablet)

---

## 🚀 Phase 6: Deployment Preparation

### 6.1 Build Optimization

- [ ] Configure production builds
- [ ] Enable gzip compression
- [ ] Set up proper caching headers
- [ ] Minimize all assets

### 6.2 Error Handling

- [ ] Global error boundary component
- [ ] Network error recovery
- [ ] Offline mode detection
- [ ] User-friendly error messages

### 6.3 Documentation

- [ ] Component usage examples
- [ ] API integration guide
- [ ] Deployment instructions
- [ ] User manual draft

---

## 📝 Implementation Notes

### Priority Order:

1. App Shell and Navigation
2. Curriculum Planner (core feature)
3. Weekly Planner
4. Progress Dashboard
5. Communication features

### Key Libraries to Use:

- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit/sortable
- **Rich Text**: TipTap
- **Charts**: Recharts
- **Date Handling**: date-fns
- **Icons**: lucide-react
- **Animations**: Framer Motion (optional)

### API Patterns:

```typescript
// Standard API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Standard error handling
const handleApiError = (error: unknown) => {
  // Show toast notification
  // Log to error tracking
  // Update UI state
};
```

### Component File Structure:

```
ComponentName/
├── ComponentName.tsx      // Main component
├── ComponentName.test.tsx // Tests
├── ComponentName.module.css // Styles (if not using Tailwind)
├── types.ts              // TypeScript interfaces
└── hooks.ts              // Custom hooks
```

---

## ✅ Final Checklist

### Before Marking Complete:

- [ ] All CRUD operations working
- [ ] Responsive design verified on tablet/desktop
- [ ] Loading states for all async operations
- [ ] Error states handled gracefully
- [ ] Keyboard navigation functional
- [ ] Performance metrics acceptable (< 3s initial load)
- [ ] Accessibility audit passed
- [ ] Basic user testing completed

### Success Criteria:

- Teacher can create subjects and milestones
- Weekly planning with drag-drop works smoothly
- Progress tracking updates automatically
- UI is intuitive without training
- System works offline for viewing
