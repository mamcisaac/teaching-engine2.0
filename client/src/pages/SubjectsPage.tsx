import { Link } from 'react-router-dom';
import SubjectList from '../components/SubjectList';
import { useSubjects } from '../api';

export default function SubjectsPage() {
  const { data = [], isLoading } = useSubjects();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <Link to="/notifications" className="underline">
        View Notifications
      </Link>
      <h1>Subjects</h1>
      <SubjectList subjects={data} />
    </div>
  );
}
