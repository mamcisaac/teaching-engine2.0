import React from 'react';

interface ActivityEditorProps {
  activityId?: string;
  onSave?: (activity: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function ActivityEditor({ activityId, onSave, onCancel }: ActivityEditorProps) {
  return (
    <div className="activity-editor">
      <h2>Activity Editor</h2>
      <p>Activity ID: {activityId || 'New Activity'}</p>
      <div className="flex gap-2 mt-4">
        <button onClick={() => onSave?.({})}>Save</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default ActivityEditor;
