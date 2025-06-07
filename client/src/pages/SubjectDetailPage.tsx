import { useParams } from 'react-router-dom';
import { useSubject } from '../api';
import MilestoneList from '../components/MilestoneList';

export default function SubjectDetailPage() {
  const { id } = useParams();
  const subjectId = Number(id);
  const { data, isLoading } = useSubject(subjectId);

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <MilestoneList milestones={data.milestones} subjectId={subjectId} />
    </div>
  );
}
