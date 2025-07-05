import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { ETFOLevel } from '../hooks/useWorkflowState';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/LoginPage'));
const LongRangePlanPage = lazy(() => import('../pages/LongRangePlanPage'));
const UnitPlansPage = lazy(() => import('../pages/UnitPlansPage'));
const ETFOLessonPlanPage = lazy(() => import('../pages/ETFOLessonPlanPage'));
const QuickLessonPage = lazy(() => import('../pages/QuickLessonPage'));
const CurriculumExpectationsPage = lazy(() => import('../pages/CurriculumExpectationsPage'));
const CurriculumImportPage = lazy(() => import('../pages/CurriculumImportPage'));
const DaybookPage = lazy(() => import('../pages/DaybookPage'));
const PlanningDashboard = lazy(() => import('../pages/PlanningDashboard'));
const ParentNewsletterPage = lazy(() => import('../pages/ParentNewsletterPage'));
const HelpPage = lazy(() => import('../pages/HelpPage'));
const TemplatesPage = lazy(() => import('../pages/TemplatesPage'));
const CalendarPlanningPage = lazy(() => import('../pages/planning/CalendarPlanningPage'));

export interface RouteConfig {
  path?: string;
  element?: React.ComponentType<any> | JSX.Element;
  workflowLevel?: ETFOLevel;
  children?: RouteConfig[];
  index?: boolean;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: '/login',
    element: LoginPage,
  },
];

export const plannerRoutes: RouteConfig[] = [
  {
    path: '',
    index: true,
    element: <Navigate to="/planner/dashboard" replace />,
  },
  {
    path: 'year',
    element: <Navigate to="/planner/dashboard" replace />,
  },
  {
    path: 'long-range',
    element: LongRangePlanPage,
    workflowLevel: ETFOLevel.LONG_RANGE_PLANS,
  },
  {
    path: 'units',
    element: UnitPlansPage,
    workflowLevel: ETFOLevel.UNIT_PLANS,
  },
  {
    path: 'long-range/:longRangePlanId/units',
    element: UnitPlansPage,
    workflowLevel: ETFOLevel.UNIT_PLANS,
  },
  {
    path: 'units/:unitId',
    element: UnitPlansPage,
    workflowLevel: ETFOLevel.UNIT_PLANS,
  },
  {
    path: 'units/:unitId/lessons',
    element: ETFOLessonPlanPage,
    workflowLevel: ETFOLevel.LESSON_PLANS,
  },
  {
    path: 'lessons/:lessonId',
    element: ETFOLessonPlanPage,
    workflowLevel: ETFOLevel.LESSON_PLANS,
  },
  {
    path: 'quick-lesson',
    element: QuickLessonPage,
  },
  {
    path: 'daybook',
    element: DaybookPage,
    workflowLevel: ETFOLevel.DAYBOOK_ENTRIES,
  },
  {
    path: 'dashboard',
    element: PlanningDashboard,
  },
  {
    path: 'calendar',
    element: CalendarPlanningPage,
  },
  // Legacy redirects
  {
    path: 'unit/:id',
    element: <Navigate to="/planner/units" replace />,
  },
  {
    path: 'week/:weekId',
    element: <Navigate to="/planner/dashboard" replace />,
  },
  {
    path: 'week',
    element: <Navigate to="/planner/dashboard" replace />,
  },
  {
    path: 'day/:date',
    element: <Navigate to="/planner/daybook" replace />,
  },
  {
    path: 'day',
    element: <Navigate to="/planner/daybook" replace />,
  },
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate to="/planner/dashboard" replace />,
  },
  {
    path: '/planner',
    element: <Navigate to="/planner/dashboard" replace />,
    children: plannerRoutes,
  },
  // Legacy redirects
  {
    path: '/subjects',
    element: <Navigate to="/curriculum" replace />,
  },
  {
    path: '/subjects/:id',
    element: <Navigate to="/curriculum" replace />,
  },
  {
    path: '/milestones/:id',
    element: <Navigate to="/curriculum" replace />,
  },
  // Curriculum routes
  {
    path: '/curriculum',
    element: CurriculumExpectationsPage,
  },
  {
    path: '/curriculum-import',
    element: CurriculumImportPage,
  },
  {
    path: '/outcomes',
    element: <Navigate to="/curriculum" replace />,
  },
  {
    path: '/coverage',
    element: <Navigate to="/curriculum" replace />,
  },
  {
    path: '/curriculum-audit',
    element: <Navigate to="/curriculum/expectations" replace />,
  },
  // Legacy resources redirects
  {
    path: '/notes',
    element: <Navigate to="/planner/dashboard" replace />,
  },
  {
    path: '/reflections',
    element: <Navigate to="/students" replace />,
  },
  {
    path: '/timetable',
    element: <Navigate to="/planner/dashboard" replace />,
  },
  {
    path: '/activity-library',
    element: <Navigate to="/planner/dashboard" replace />,
  },
  // Parent Newsletters
  {
    path: '/newsletters',
    element: ParentNewsletterPage,
  },
  {
    path: '/newsletters/:id',
    element: ParentNewsletterPage,
  },
  {
    path: '/newsletters/new',
    element: <Navigate to="/newsletters" replace />,
  },
  {
    path: '/newsletters/draft',
    element: <Navigate to="/newsletters" replace />,
  },
  // Templates
  {
    path: '/templates',
    element: TemplatesPage,
  },
  {
    path: '/templates/:templateId',
    element: TemplatesPage,
  },
  // Help
  {
    path: '/help',
    element: HelpPage,
  },
  {
    path: '/help/:section',
    element: HelpPage,
  },
  // Legacy redirects
  {
    path: '/parent-messages',
    element: <Navigate to="/students" replace />,
  },
  {
    path: '/parent-contacts',
    element: <Navigate to="/students" replace />,
  },
  {
    path: '/students',
    element: <Navigate to="/planner/dashboard" replace />,
  },
  {
    path: '/parent-summaries',
    element: <Navigate to="/students" replace />,
  },
  {
    path: '/analytics',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/notifications',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/settings',
    element: <Navigate to="/planner/dashboard" replace />,
  },
  // Catch all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
];