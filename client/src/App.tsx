import { Route, Routes } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import SubjectsPage from './pages/SubjectsPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import MilestoneDetailPage from './pages/MilestoneDetailPage';
import NotificationsPage from './pages/NotificationsPage';
import NewsletterDraftViewer from './pages/NewsletterDraftViewer';
import DailyPlanPage from './pages/DailyPlanPage';
import TimetablePage from './pages/TimetablePage';
import YearAtAGlancePage from './pages/YearAtAGlancePage';
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import ReflectionsPage from './pages/ReflectionsPage';
import SettingsPage from './pages/SettingsPage';

const WeeklyPlannerPage = lazy(() => import('./pages/WeeklyPlannerPage'));
const NewsletterEditor = lazy(() => import('./pages/NewsletterEditor'));
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:id" element={<SubjectDetailPage />} />
        <Route path="/milestones/:id" element={<MilestoneDetailPage />} />
        <Route
          path="/planner"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <WeeklyPlannerPage />
            </Suspense>
          }
        />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/year" element={<YearAtAGlancePage />} />
        <Route path="/daily" element={<DailyPlanPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reflections" element={<ReflectionsPage />} />
        <Route
          path="/newsletters/new"
          element={
            <Suspense fallback={<div>Loading...</div>}>
              <NewsletterEditor />
            </Suspense>
          }
        />
        <Route path="/newsletters/draft" element={<NewsletterDraftViewer />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </NotificationProvider>
  );
}
