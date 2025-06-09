import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Activity } from '../api';

interface Props {
  activity: Activity;
}

export default function DraggableActivity({ activity }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: activity.id,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="border p-2 bg-white cursor-grab"
    >
      {activity.title}
    </li>
  );
}
