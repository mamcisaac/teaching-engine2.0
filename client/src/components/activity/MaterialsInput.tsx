import { useState } from 'react';
import { api } from '../../api';

interface Props {
  activityId: number;
  initial?: string | null;
}

export default function MaterialsInput({ activityId, initial }: Props) {
  const [value, setValue] = useState(initial ?? '');

  const save = async () => {
    try {
      await api.patch(`/api/activities/${activityId}`, {
        materialsText: value.trim() || null,
      });
    } catch (err) {
      // ignore errors for now
    }
  };

  return (
    <textarea
      className="border p-1 w-full"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      placeholder="Materials (comma separated)"
    />
  );
}
