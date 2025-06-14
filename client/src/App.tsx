import { Route, Routes, Navigate } from 'react-router-dom';
import { Suspense, lazy, useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { api } from './api';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" replace /> : <LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/subjects"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <SubjectsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/subjects/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <SubjectDetailPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/milestones/:id"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <MilestoneDetailPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/planner"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <WeeklyPlannerPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/timetable"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <TimetablePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/year"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <YearAtAGlancePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/daily"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <DailyPlanPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <NotesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <NotificationsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/reflections"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <ReflectionsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/newsletters/new"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <NewsletterEditor />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/newsletters/draft"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <NewsletterDraftViewer />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/outcomes"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <OutcomesPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/coverage"
        element={
          <ProtectedRoute>
            <Suspense fallback={<div>Loading...</div>}>
              <CoveragePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

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
