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
      {data.description && <p className="mb-2">{data.description}</p>}
      {data.standardCodes.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2 text-sm">
          {data.standardCodes.map((c) => (
            <span key={c} className="px-1 bg-gray-200 rounded">
              {c}
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
