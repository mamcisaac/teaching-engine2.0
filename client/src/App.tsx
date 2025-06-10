import { Route, Routes } from 'react-router-dom';
import SubjectsPage from './pages/SubjectsPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import MilestoneDetailPage from './pages/MilestoneDetailPage';
import WeeklyPlannerPage from './pages/WeeklyPlannerPage';
import NotificationsPage from './pages/NotificationsPage';
import NewsletterEditor from './pages/NewsletterEditor';
import NewsletterDraftViewer from './pages/NewsletterDraftViewer';
import DailyPlanPage from './pages/DailyPlanPage';
import TimetablePage from './pages/TimetablePage';
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:id" element={<SubjectDetailPage />} />
        <Route path="/milestones/:id" element={<MilestoneDetailPage />} />
        <Route path="/planner" element={<WeeklyPlannerPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/daily" element={<DailyPlanPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/newsletters/new" element={<NewsletterEditor />} />
        <Route path="/newsletters/draft" element={<NewsletterDraftViewer />} />
      </Routes>
    </NotificationProvider>
  );
}
