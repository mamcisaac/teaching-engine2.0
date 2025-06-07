import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useCreateMilestone, useSubject } from '../api';
import MilestoneList from '../components/MilestoneList';

export default function SubjectDetailPage() {
  const { id } = useParams();
  const subjectId = Number(id);
  const { data, isLoading } = useSubject(subjectId);
  const create = useCreateMilestone();
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title, subjectId });
    setTitle('');
  };

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New milestone"
        />
        <button type="submit">Add</button>
      </form>
      <MilestoneList milestones={data.milestones} />
    </div>
  );
}
