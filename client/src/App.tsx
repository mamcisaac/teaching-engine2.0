import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { HelpProvider } from './contexts/HelpContext';
import { OnboardingProvider } from './contexts/OnboardingContext';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import { GlobalErrorBoundary } from './components/ErrorBoundaries';
import WorkflowGate from './components/WorkflowGate';
import { ETFOLevel } from './hooks/useWorkflowState';
import { OfflineNotification } from './components/OfflineNotification';
import { OnboardingFlow, WelcomeModal } from './components/onboarding';
import { GlobalKeyboardShortcuts } from './components/GlobalKeyboardShortcuts';

// Lazy load pages - ETFO-aligned pages only
const LoginPage = lazy(() => import('./pages/LoginPage'));
const LongRangePlanPage = lazy(() => import('./pages/LongRangePlanPage'));
const UnitPlansPage = lazy(() => import('./pages/UnitPlansPage'));
const ETFOLessonPlanPage = lazy(() => import('./pages/ETFOLessonPlanPage'));
const QuickLessonPage = lazy(() => import('./pages/QuickLessonPage'));
const CurriculumExpectationsPage = lazy(() => import('./pages/CurriculumExpectationsPage'));
const CurriculumImportPage = lazy(() => import('./pages/CurriculumImportPage'));
const DaybookPage = lazy(() => import('./pages/DaybookPage'));
const PlanningDashboard = lazy(() => import('./pages/PlanningDashboard'));
const ParentNewsletterPage = lazy(() => import('./pages/ParentNewsletterPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const CalendarPlanningPage = lazy(() => import('./pages/planning/CalendarPlanningPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));

// Common suspense fallback
const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function AppRoutes() {
  const { isAuthenticated: _isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <SuspenseFallback />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout>
              <Outlet />
            </MainLayout>
          </ProtectedRoute>
        }
      >
        {/* Dashboard - redirects to planning dashboard */}
        <Route path="/" element={<Navigate to="/planner/dashboard" replace />} />

        {/* Planner routes */}
        <Route path="/planner">
          {/* Default planner route redirects to modern planning dashboard */}
          <Route index element={<Navigate to="/planner/dashboard" replace />} />
          {/* Legacy year at a glance - redirect to planning dashboard */}
          <Route path="year" element={<Navigate to="/planner/dashboard" replace />} />
          <Route
            path="long-range"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <WorkflowGate level={ETFOLevel.LONG_RANGE_PLANS}>
                  <LongRangePlanPage />
                </WorkflowGate>
              </Suspense>
            }
          />
          <Route
            path="units"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <WorkflowGate level={ETFOLevel.UNIT_PLANS}>
                  <UnitPlansPage />
                </WorkflowGate>
              </Suspense>
            }
          />
          <Route
            path="long-range/:longRangePlanId/units"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <WorkflowGate level={ETFOLevel.UNIT_PLANS}>
                  <UnitPlansPage />
                </WorkflowGate>
              </Suspense>
            }
          />
          <Route
            path="units/:unitId"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <WorkflowGate level={ETFOLevel.UNIT_PLANS}>
                  <UnitPlansPage />
                </WorkflowGate>
              </Suspense>
            }
          />
          <Route
            path="units/:unitId/lessons"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <WorkflowGate level={ETFOLevel.LESSON_PLANS}>
                  <ETFOLessonPlanPage />
                </WorkflowGate>
              </Suspense>
            }
          />
          <Route
            path="lessons/:lessonId"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <WorkflowGate level={ETFOLevel.LESSON_PLANS}>
                  <ETFOLessonPlanPage />
                </WorkflowGate>
              </Suspense>
            }
          />
          <Route
            path="quick-lesson"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <QuickLessonPage />
              </Suspense>
            }
          />
          <Route
            path="daybook"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <WorkflowGate level={ETFOLevel.DAYBOOK_ENTRIES}>
                  <DaybookPage />
                </WorkflowGate>
              </Suspense>
            }
          />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <PlanningDashboard />
              </Suspense>
            }
          />
          <Route
            path="calendar"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <CalendarPlanningPage />
              </Suspense>
            }
          />
          {/* Legacy unit planner - redirect to modern unit plans */}
          <Route path="unit/:id" element={<Navigate to="/planner/units" replace />} />
          {/* Legacy weekly planner routes - redirect to modern planning dashboard */}
          <Route path="week/:weekId" element={<Navigate to="/planner/dashboard" replace />} />
          <Route path="week" element={<Navigate to="/planner/dashboard" replace />} />
          {/* Legacy daily planner - redirect to daybook */}
          <Route path="day/:date" element={<Navigate to="/planner/daybook" replace />} />
          <Route path="day" element={<Navigate to="/planner/daybook" replace />} />
        </Route>

        {/* Legacy subject routes - redirect to curriculum */}
        <Route path="/subjects" element={<Navigate to="/curriculum" replace />} />
        <Route path="/subjects/:id" element={<Navigate to="/curriculum" replace />} />

        <Route path="/milestones/:id" element={<Navigate to="/curriculum" replace />} />

        {/* Curriculum outcomes and coverage */}
        <Route
          path="/curriculum"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <CurriculumExpectationsPage />
            </Suspense>
          }
        />
        <Route
          path="/curriculum-import"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <CurriculumImportPage />
            </Suspense>
          }
        />
        {/* Legacy outcomes and coverage - redirect to curriculum expectations */}
        <Route path="/outcomes" element={<Navigate to="/curriculum" replace />} />
        <Route path="/coverage" element={<Navigate to="/curriculum" replace />} />
        <Route path="/curriculum-audit" element={<Navigate to="/curriculum/expectations" replace />} />

        {/* Legacy resources - redirect to ETFO planning */}
        <Route path="/notes" element={<Navigate to="/planner/dashboard" replace />} />
        <Route path="/reflections" element={<Navigate to="/students" replace />} />
        <Route path="/timetable" element={<Navigate to="/planner/dashboard" replace />} />
        <Route path="/activity-library" element={<Navigate to="/planner/dashboard" replace />} />

        {/* Parent Newsletters */}
        <Route
          path="/newsletters"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <ParentNewsletterPage />
            </Suspense>
          }
        />
        <Route
          path="/newsletters/:id"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <ParentNewsletterPage />
            </Suspense>
          }
        />
        {/* Legacy newsletter routes - redirect to new newsletters */}
        <Route path="/newsletters/new" element={<Navigate to="/newsletters" replace />} />
        <Route path="/newsletters/draft" element={<Navigate to="/newsletters" replace />} />

        {/* Templates */}
        <Route
          path="/templates"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <TemplatesPage />
            </Suspense>
          }
        />
        <Route
          path="/templates/:templateId"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <TemplatesPage />
            </Suspense>
          }
        />

        {/* Teams and Collaboration */}
        <Route
          path="/teams"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <TeamsPage />
            </Suspense>
          }
        />
        <Route
          path="/teams/:teamId"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <TeamsPage />
            </Suspense>
          }
        />

        {/* Help & Documentation */}
        <Route
          path="/help"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <HelpPage />
            </Suspense>
          }
        />
        <Route
          path="/help/:section"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <HelpPage />
            </Suspense>
          }
        />

        {/* Legacy parent communications - redirect to students */}
        <Route path="/parent-messages" element={<Navigate to="/students" replace />} />
        <Route path="/parent-contacts" element={<Navigate to="/students" replace />} />

        {/* Students - legacy functionality removed */}
        <Route path="/students" element={<Navigate to="/planner/dashboard" replace />} />
        {/* Legacy parent summaries - redirect to students */}
        <Route path="/parent-summaries" element={<Navigate to="/students" replace />} />
        <Route path="/curriculum-audit" element={<Navigate to="/curriculum/expectations" replace />} />

        {/* Legacy analytics - redirect to dashboard */}
        <Route path="/analytics" element={<Navigate to="/" replace />} />

        {/* Legacy notifications - redirect to dashboard */}
        <Route path="/notifications" element={<Navigate to="/" replace />} />

        {/* Settings - legacy functionality removed */}
        <Route path="/settings" element={<Navigate to="/planner/dashboard" replace />} />
      </Route>

      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <HelpProvider>
              <OnboardingProvider>
                <KeyboardShortcutsProvider>
                  <AppRoutes />
                  <GlobalKeyboardShortcuts />
                  <OfflineNotification />
                  <WelcomeModal />
                  <OnboardingFlow />
                </KeyboardShortcutsProvider>
              </OnboardingProvider>
            </HelpProvider>
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </GlobalErrorBoundary>
  );
}
