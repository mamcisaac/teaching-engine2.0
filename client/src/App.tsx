import { Navigate, Route, Routes } from 'react-router-dom';
import SubjectsPage from './pages/SubjectsPage';
import SubjectDetailPage from './pages/SubjectDetailPage';
import MilestoneDetailPage from './pages/MilestoneDetailPage';
import NewsletterEditor from './pages/NewsletterEditor';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/subjects" replace />} />
      <Route path="/subjects" element={<SubjectsPage />} />
      <Route path="/subjects/:id" element={<SubjectDetailPage />} />
      <Route path="/milestones/:id" element={<MilestoneDetailPage />} />
      <Route path="/newsletter" element={<NewsletterEditor />} />
    </Routes>
  );
}
