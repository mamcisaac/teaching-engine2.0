import { useState } from 'react';
import { useAddNote } from '../api';

export default function DailyNotesEditor({
  activityId,
  dailyPlanId,
}: {
  activityId?: number;
  dailyPlanId?: number;
}) {
  const [content, setContent] = useState('');
  const addNote = useAddNote();

  const handleSave = () => {
    addNote.mutate({ content, public: false, activityId, dailyPlanId });
    setContent('');
  };

  return (
    <div className="space-y-2">
      <textarea
        className="w-full border p-1"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add note"
      />
      <button
        className="px-2 py-1 bg-blue-600 text-white"
        onClick={handleSave}
        disabled={addNote.isPending}
      >
        Save Note
      </button>
    </div>
  );
}
