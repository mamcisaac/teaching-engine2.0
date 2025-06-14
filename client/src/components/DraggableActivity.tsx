import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Activity } from '../api';
import OutcomeTag from './OutcomeTag';

interface Props {
  activity: Activity;
}

export default function DraggableActivity({ activity }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: activity.id,
  });

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;

  // Determine subject color if there are outcomes
  const getBorderColor = () => {
    if (!activity.outcomes || activity.outcomes.length === 0) {
      return 'border-gray-200';
    }

    // Use the subject of the first outcome for the border color
    const subject = activity.outcomes[0].outcome.subject;
    const hash = subject.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue = hash % 360;
    return `border-l-4 border-l-[hsl(${hue},70%,60%)]`;
  };

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`p-2 bg-white cursor-grab border ${getBorderColor()}`}
    >
      <div>{activity.title}</div>

      {activity.outcomes && activity.outcomes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {activity.outcomes.map(({ outcome }) => (
            <OutcomeTag key={outcome.id} outcome={outcome} size="small" />
          ))}
        </div>
      )}
    </li>
  );
}
