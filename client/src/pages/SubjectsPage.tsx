import { useState } from 'react';
import SubjectList from '../components/SubjectList';
import { useCreateSubject, useSubjects } from '../api';

export default function SubjectsPage() {
  const { data = [], isLoading } = useSubjects();
  const create = useCreateSubject();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    create.mutate({ name });
    setName('');
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Subjects</h1>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New subject" />
        <button type="submit">Add</button>
      </form>
      <SubjectList subjects={data} />
    </div>
  );
}
