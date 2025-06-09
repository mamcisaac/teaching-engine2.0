import { useState } from 'react';
import { useNotes } from '../api';

export default function NotesSearchView() {
  const [query, setQuery] = useState('');
  const { data } = useNotes();

  const filtered = data?.filter((n) => n.content.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notes"
        className="border p-1 w-full"
      />
      <ul className="list-disc pl-5">{filtered?.map((n) => <li key={n.id}>{n.content}</li>)}</ul>
    </div>
  );
}
