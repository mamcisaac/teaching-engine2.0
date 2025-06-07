import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useCreateActivity, useMilestone } from '../api';
import ActivityList from '../components/ActivityList';

export default function MilestoneDetailPage() {
  const { id } = useParams();
  const milestoneId = Number(id);
  const { data, isLoading } = useMilestone(milestoneId);
  const create = useCreateActivity();
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title, milestoneId });
    setTitle('');
  };

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.title}</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New activity"
        />
        <button type="submit">Add</button>
      </form>
      <ActivityList activities={data.activities} />
    </div>
  );
}
