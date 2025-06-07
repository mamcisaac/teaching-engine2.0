import { useParams } from 'react-router-dom';
import { useMilestone } from '../api';
import ActivityList from '../components/ActivityList';

export default function MilestoneDetailPage() {
  const { id } = useParams();
  const milestoneId = Number(id);
  const { data, isLoading } = useMilestone(milestoneId);

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.title}</h1>
      <ActivityList
        activities={data.activities}
        milestoneId={milestoneId}
        subjectId={data.subjectId}
      />
    </div>
  );
}
