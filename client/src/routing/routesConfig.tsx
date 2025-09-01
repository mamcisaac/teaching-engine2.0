import { lazy } from 'react';
import type { ComponentType } from 'react';
import { Navigate } from 'react-router-dom';

import { ETFOLevel } from '../hooks/useWorkflowState';
import { withMainLayout } from '../components/withMainLayout';

// Lazy load pages - import based on actual export patterns
const LoginPage = lazy(() => import('../pages/LoginPage').then(module => ({ default: module.LoginPage }))); // named export
const SimpleLongRangePage = lazy(() => import('../pages/SimpleLongRangePage').then(module => ({ default: module.SimpleLongRangePage }))); // named export
const SimpleUnitPlansPage = lazy(() => import('../pages/SimpleUnitPlansPage').then(module => ({ default: module.SimpleUnitPlansPage }))); // named export
const SimpleLessonPlansPage = lazy(() => import('../pages/SimpleLessonPlansPage').then(module => ({ default: module.SimpleLessonPlansPage }))); // named export
const ETFOLessonPlanPage = lazy(() => import('../pages/ETFOLessonPlanPage').then(module => ({ default: module.ETFOLessonPlanPage }))); // named export
const QuickLessonPage = lazy(() => import('../pages/QuickLessonPage').then(module => ({ default: module.QuickLessonPage }))); // named export
const SimpleCurriculumPage = lazy(() => import('../pages/SimpleCurriculumPage').then(module => ({ default: module.SimpleCurriculumPage }))); // named export
const CurriculumImportPage = lazy(() => import('../pages/CurriculumImportPage').then(module => ({ default: module.CurriculumImportPage }))); // named export
const DaybookPage = lazy(() => import('../pages/DaybookPage').then(module => ({ default: module.DaybookPage }))); // named export
const TeachingDashboard = lazy(() => import('../pages/TeachingDashboard').then(module => ({ default: module.TeachingDashboard }))); // named export
const ShowcaseDashboard = lazy(() => import('../pages/ShowcaseDashboard').then(module => ({ default: module.ShowcaseDashboard }))); // named export
const ParentNewsletterPage = lazy(() => import('../pages/ParentNewsletterPage').then(module => ({ default: module.ParentNewsletterPage }))); // named export
const HelpPage = lazy(() => import('../pages/HelpPage').then(module => ({ default: module.HelpPage }))); // named export
const TemplatesPage = lazy(() => import('../pages/TemplatesPage').then(module => ({ default: module.TemplatesPage }))); // named export
const SimpleCalendarPage = lazy(() => import('../pages/SimpleCalendarPage').then(module => ({ default: module.SimpleCalendarPage }))); // named export
const SimpleTodayView = lazy(() => import('../pages/SimpleTodayView').then(module => ({ default: module.SimpleTodayView }))); // named export
const WeekViewPage = lazy(() => import('../pages/WeekViewPage').then(module => ({ default: module.WeekViewPage }))); // named export
const DayViewPage = lazy(() => import('../pages/DayViewPage').then(module => ({ default: module.DayViewPage }))); // named export
const LessonDetailPage = lazy(() => import('../pages/LessonDetailPage').then(module => ({ default: module.LessonDetailPage }))); // named export
const ScheduleEditor = lazy(() => import('../pages/ScheduleEditor').then(module => ({ default: module.ScheduleEditor }))); // named export

// Curriculum Coverage Pages
const CurriculumCoverageDashboard = lazy(() => import('../components/CurriculumCoverageDashboard').then(module => ({ default: module.CurriculumCoverageDashboard }))); // named export
const UncoveredExpectationsList = lazy(() => import('../components/UncoveredExpectationsList').then(module => ({ default: module.UncoveredExpectationsList }))); // named export

// Assessment System Pages - wrapped with MainLayout
const StudentsPage = lazy(() => import('../pages/StudentsPage').then(module => ({ 
  default: withMainLayout(module.StudentsPage) 
}))); 
const AssessmentPage = lazy(() => import('../pages/AssessmentPage').then(module => ({ 
  default: withMainLayout(module.AssessmentPage) 
})));
const ArtifactsPage = lazy(() => import('../pages/ArtifactsPage').then(module => ({ 
  default: withMainLayout(module.ArtifactsPage) 
})));
const AnalyticsPage = lazy(() => import('../pages/AnalyticsPage').then(module => ({ 
  default: withMainLayout(module.AnalyticsPage) 
})));
const ReportsPage = lazy(() => import('../pages/ReportsPage').then(module => ({ 
  default: withMainLayout(module.ReportsPage) 
})));

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
    element: <Navigate replace to="/planner/today" />,
  },
  {
    path: 'today',
    element: DayViewPage,
  },
  {
    path: 'day/:date',
    element: DayViewPage,
  },
  {
    path: 'week',
    element: WeekViewPage,
  },
  {
    path: 'year',
    element: <Navigate replace to="/planner/dashboard" />,
  },
  {
    path: 'long-range',
    element: SimpleLongRangePage,
    // Removed workflowLevel to bypass WorkflowGate for hardcoded component
  },
  {
    path: 'units',
    element: SimpleUnitPlansPage,
    // Removed workflowLevel to bypass WorkflowGate for hardcoded component
  },
  {
    path: 'long-range/:longRangePlanId/units',
    element: SimpleUnitPlansPage,
    // Removed workflowLevel to bypass WorkflowGate for hardcoded component
  },
  {
    path: 'units/:unitId',
    element: SimpleUnitPlansPage,
    // Removed workflowLevel to bypass WorkflowGate for hardcoded component
  },
  {
    path: 'units/:unitId/lessons',
    element: ETFOLessonPlanPage,
    // Use real ETFO component for Emily's perfect lessons
  },
  {
    path: 'lessons/:lessonId',
    element: LessonDetailPage,
    // Detailed view of individual lesson
  },
  {
    path: 'units/:unitId/lessons/:lessonId',
    element: ETFOLessonPlanPage,
    // Use real ETFO component for Emily's perfect lessons
  },
  {
    path: 'lessons/:lessonId',
    element: SimpleLessonPlansPage,
    // Removed workflowLevel to bypass WorkflowGate for hardcoded component
  },
  {
    path: 'quick-lesson',
    element: QuickLessonPage,
  },
  {
    path: 'daybook',
    element: DaybookPage,
    // Removed workflowLevel to bypass WorkflowGate for hardcoded component
  },
  {
    path: 'dashboard',
    element: <Navigate replace to="/dashboard" />,
  },
  {
    path: 'calendar',
    element: SimpleCalendarPage,
  },
  {
    path: 'schedule-editor',
    element: ScheduleEditor,
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
    element: <Navigate replace to="/dashboard" />,
  },
  {
    path: '/dashboard',
    element: ShowcaseDashboard,
  },
  {
    path: '/today',
    element: SimpleTodayView,
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
    element: SimpleCurriculumPage,
  },
  {
    path: '/curriculum-import',
    element: CurriculumImportPage,
  },
  {
    path: '/curriculum-coverage',
    element: CurriculumCoverageDashboard,
  },
  {
    path: '/curriculum-coverage/uncovered',
    element: UncoveredExpectationsList,
  },
  {
    path: '/outcomes',
    element: <Navigate replace to="/curriculum" />,
  },
  {
    path: '/coverage',
    element: <Navigate replace to="/curriculum-coverage" />,
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
  // ETFO Lesson Plans Routes
  {
    path: '/etfo-lesson-plans',
    element: ETFOLessonPlanPage,
  },
  {
    path: '/etfo-lesson-plans/:lessonId',
    element: ETFOLessonPlanPage,
  },
  // Assessment System Routes
  {
    path: '/students',
    element: StudentsPage,
  },
  {
    path: '/assessment',
    element: AssessmentPage,
  },
  {
    path: '/artifacts',
    element: ArtifactsPage,
  },
  {
    path: '/analytics',
    element: AnalyticsPage,
  },
  {
    path: '/reports',
    element: ReportsPage,
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
    path: '/parent-summaries',
    element: <Navigate replace to="/students" />,
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
