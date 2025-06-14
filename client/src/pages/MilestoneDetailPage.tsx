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
      {data.description && <p className="italic mb-2">{data.description}</p>}
      {data.outcomes && data.outcomes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {data.outcomes.map((o) => (
            <span key={o.outcome.id} className="bg-gray-200 px-1 text-xs" title={o.outcome.description}>
              {o.outcome.code}
            </span>
          ))}
        </div>
      )}
      <ActivityList
        activities={data.activities}
        milestoneId={milestoneId}
        subjectId={data.subjectId}
      />
    </div>
  );
}
