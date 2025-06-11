import { useState } from 'react';
import { Activity, useCompleteActivity } from '../api';
import NoteModal from './NoteModal';

export default function CompleteActivityButton({
  activity,
  milestoneId,
}: {
  activity: Activity;
  milestoneId: number;
}) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const complete = useCompleteActivity();

  const handleClick = () => {
    complete.mutate(
      { id: activity.id, completed: !activity.completedAt, milestoneId, interactive: true },
      {
        onSuccess: (res) => {
          if (res.showNotePrompt) setShowNoteModal(true);
        },
      },
    );
  };

  return (
    <>
      <button
        className="px-1 text-sm bg-green-600 text-white"
        onClick={handleClick}
        disabled={complete.isPending}
      >
        {activity.completedAt ? 'Undo Complete' : 'Mark Complete'}
      </button>
      {showNoteModal && (
        <NoteModal
          activityId={activity.id}
          milestoneId={milestoneId}
          onClose={() => setShowNoteModal(false)}
        />
      )}
    </>
  );
}
