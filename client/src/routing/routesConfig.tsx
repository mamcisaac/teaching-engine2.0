import type { ComponentType } from 'react';
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
  element?: ComponentType<Record<string, never>> | JSX.Element;
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
    element: <Navigate replace to="/planner/dashboard" />,
  },
  {
    path: 'year',
    element: <Navigate replace to="/planner/dashboard" />,
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
    element: <Navigate replace to="/planner/units" />,
  },
  {
    path: 'week/:weekId',
    element: <Navigate replace to="/planner/dashboard" />,
  },
  {
    path: 'week',
    element: <Navigate replace to="/planner/dashboard" />,
  },
  {
    path: 'day/:date',
    element: <Navigate replace to="/planner/daybook" />,
  },
  {
    path: 'day',
    element: <Navigate replace to="/planner/daybook" />,
  },
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/',
    element: <Navigate replace to="/planner/dashboard" />,
  },
  {
    path: '/planner',
    children: plannerRoutes,
  },
  // Legacy redirects
  {
    path: '/subjects',
    element: <Navigate replace to="/curriculum" />,
  },
  {
    path: '/subjects/:id',
    element: <Navigate replace to="/curriculum" />,
  },
  {
    path: '/milestones/:id',
    element: <Navigate replace to="/curriculum" />,
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
    element: <Navigate replace to="/curriculum" />,
  },
  {
    path: '/coverage',
    element: <Navigate replace to="/curriculum" />,
  },
  {
    path: '/curriculum-audit',
    element: <Navigate replace to="/curriculum/expectations" />,
  },
  // Legacy resources redirects
  {
    path: '/notes',
    element: <Navigate replace to="/planner/dashboard" />,
  },
  {
    path: '/reflections',
    element: <Navigate replace to="/students" />,
  },
  {
    path: '/timetable',
    element: <Navigate replace to="/planner/dashboard" />,
  },
  {
    path: '/activity-library',
    element: <Navigate replace to="/planner/dashboard" />,
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
    element: <Navigate replace to="/newsletters" />,
  },
  {
    path: '/newsletters/draft',
    element: <Navigate replace to="/newsletters" />,
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
    element: <Navigate replace to="/students" />,
  },
  {
    path: '/parent-contacts',
    element: <Navigate replace to="/students" />,
  },
  {
    path: '/students',
    element: <Navigate replace to="/planner/dashboard" />,
  },
  {
    path: '/parent-summaries',
    element: <Navigate replace to="/students" />,
  },
  {
    path: '/analytics',
    element: <Navigate replace to="/" />,
  },
  {
    path: '/notifications',
    element: <Navigate replace to="/" />,
  },
  {
    path: '/settings',
    element: <Navigate replace to="/planner/dashboard" />,
  },
  // Catch all
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
];
