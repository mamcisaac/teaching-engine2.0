import { Navigate, Route, Routes } from 'react-router-dom';
import SubjectsPage from './pages/SubjectsPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import MilestoneDetailPage from './pages/MilestoneDetailPage';
import WeeklyPlannerPage from './pages/WeeklyPlannerPage';
import NotificationsPage from './pages/NotificationsPage';
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/subjects" replace />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:id" element={<SubjectDetailPage />} />
        <Route path="/milestones/:id" element={<MilestoneDetailPage />} />
        <Route path="/planner" element={<WeeklyPlannerPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Routes>
    </NotificationProvider>
  );
}
