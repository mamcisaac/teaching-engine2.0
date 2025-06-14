import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { api } from './api';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/MainLayout';

// Lazy load pages
const SubjectsPage = lazy(() => import('./pages/SubjectsPage'));
const SubjectDetailPage = lazy(() => import('./pages/SubjectDetailPage'));
const MilestoneDetailPage = lazy(() => import('./pages/MilestoneDetailPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const NewsletterDraftViewer = lazy(() => import('./pages/NewsletterDraftViewer'));
const DailyPlanPage = lazy(() => import('./pages/DailyPlanPage'));
const TimetablePage = lazy(() => import('./pages/TimetablePage'));
const YearAtAGlancePage = lazy(() => import('./pages/YearAtAGlancePage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const ReflectionsPage = lazy(() => import('./pages/ReflectionsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const WeeklyPlannerPage = lazy(() => import('./pages/WeeklyPlannerPage'));
const NewsletterEditor = lazy(() => import('./pages/NewsletterEditor'));
const OutcomesPage = lazy(() => import('./pages/OutcomesPage'));
const CoveragePage = lazy(() => import('./pages/CoveragePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

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
          await api.get('/auth/me');
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
        {/* Dashboard */}
        <Route
          path="/"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <DashboardPage />
            </Suspense>
          }
        />

        {/* Planner routes */}
        <Route path="/planner">
          <Route
            path="year"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <YearAtAGlancePage />
              </Suspense>
            }
          />
          <Route
            path="unit/:id"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <SubjectDetailPage />
              </Suspense>
            }
          />
          <Route
            path="week/:weekId"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <WeeklyPlannerPage />
              </Suspense>
            }
          />
          <Route
            path="week"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <WeeklyPlannerPage />
              </Suspense>
            }
          />
          <Route
            path="day/:date"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <DailyPlanPage />
              </Suspense>
            }
          />
          <Route
            path="day"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <DailyPlanPage />
              </Suspense>
            }
          />
        </Route>

        {/* Subject routes */}
        <Route
          path="/subjects"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <SubjectsPage />
            </Suspense>
          }
        />
        <Route
          path="/subjects/:id"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <SubjectDetailPage />
            </Suspense>
          }
        />

        {/* Milestones */}
        <Route
          path="/milestones/:id"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <MilestoneDetailPage />
            </Suspense>
          }
        />

        {/* Curriculum outcomes and coverage */}
        <Route
          path="/outcomes"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <OutcomesPage />
            </Suspense>
          }
        />
        <Route
          path="/coverage"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <CoveragePage />
            </Suspense>
          }
        />

        {/* Resources */}
        <Route
          path="/notes"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <NotesPage />
            </Suspense>
          }
        />
        <Route
          path="/reflections"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <ReflectionsPage />
            </Suspense>
          }
        />
        <Route
          path="/timetable"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <TimetablePage />
            </Suspense>
          }
        />

        {/* Newsletters */}
        <Route
          path="/newsletters/new"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <NewsletterEditor />
            </Suspense>
          }
        />
        <Route
          path="/newsletters/draft"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <NewsletterDraftViewer />
            </Suspense>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <NotificationsPage />
            </Suspense>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <Suspense fallback={<SuspenseFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />
      </Route>

      {/* Redirect any unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  );
}
