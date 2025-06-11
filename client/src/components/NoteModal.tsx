import { useState } from 'react';
import Dialog from './Dialog';
import { useAddNote } from '../api';

export default function NoteModal({
  activityId,
  milestoneId,
  onClose,
}: {
  activityId: number;
  milestoneId?: number;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'private' | 'public'>('private');
  const [content, setContent] = useState('');
  const addNote = useAddNote();

  const handleSave = () => {
    addNote.mutate({ activityId, milestoneId, content, type: tab }, { onSuccess: onClose });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            className={`px-2 py-1 ${tab === 'private' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTab('private')}
          >
            Private
          </button>
          <button
            className={`px-2 py-1 ${tab === 'public' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTab('public')}
          >
            Public
          </button>
        </div>
        <textarea
          className="border p-2 w-full"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          className="px-2 py-1 bg-blue-600 text-white"
          onClick={handleSave}
          disabled={addNote.isPending}
        >
          Save
        </button>
      </div>
    </Dialog>
  );
}
