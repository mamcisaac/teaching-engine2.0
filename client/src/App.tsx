import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { api } from './api';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import WorkflowGate from './components/WorkflowGate';
import { ETFOLevel } from './hooks/useWorkflowState';

// Lazy load pages - ETFO-aligned pages only
const LoginPage = lazy(() => import('./pages/LoginPage'));
const LongRangePlanPage = lazy(() => import('./pages/LongRangePlanPage'));
const UnitPlansPage = lazy(() => import('./pages/UnitPlansPage'));
const CurriculumExpectationsPage = lazy(() => import('./pages/CurriculumExpectationsPage'));
const CurriculumImportPage = lazy(() => import('./pages/CurriculumImportPage'));
const DaybookPage = lazy(() => import('./pages/DaybookPage'));
const PlanningDashboard = lazy(() => import('./pages/PlanningDashboard'));

// Common suspense fallback
const SuspenseFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function AppRoutes() {
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (token) {
          // Only validate token with the server if we have one
          await api.get('/api/auth/me');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        // Always set loading to false after checking auth
        setIsLoading(false);
      }
    };

    // Only run auth check if we have a token
    if (token) {
      checkAuth();
    } else {
      // If no token, we're not authenticated
      setIsLoading(false);
    }
  }, [token]);

  if (isLoading) {
    return <SuspenseFallback />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />

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
            element={<Navigate to="/planner/dashboard" replace />}
          />
          <Route
            path="lessons"
            element={<Navigate to="/planner/dashboard" replace />}
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

        {/* Legacy newsletters - redirect to dashboard */}
        <Route path="/newsletters/new" element={<Navigate to="/" replace />} />
        <Route path="/newsletters/draft" element={<Navigate to="/" replace />} />

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
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
