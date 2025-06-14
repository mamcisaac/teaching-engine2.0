import { useState } from 'react';
import type { Outcome } from '../api';

interface Props {
  outcome: Outcome;
}

export default function OutcomeDetail({ outcome }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Generate a color based on the outcome's subject
  const getSubjectColor = (subject: string): string => {
    // Simple hash function to generate consistent colors for subjects
    const hash = subject.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Generate a hue from 0-360 degrees
    const hue = hash % 360;

    // Return HSL color with lighter shade for the background
    return `hsl(${hue}, 70%, 90%)`;
  };

  const subjectColor = getSubjectColor(outcome.subject);

  return (
    <div
      className="border rounded-md mb-2 overflow-hidden"
      style={{ borderLeftWidth: '4px', borderLeftColor: subjectColor }}
    >
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={toggleExpanded}
        style={{ backgroundColor: subjectColor }}
      >
        <div className="flex items-center">
          <span className="font-mono font-medium mr-3">{outcome.code}</span>
          <span className="text-sm truncate max-w-xs">{outcome.description}</span>
        </div>
        <div className="flex items-center">
          <span className="text-xs bg-white bg-opacity-60 rounded-full px-2 py-0.5 mr-2">
            Grade {outcome.grade}
          </span>
          <span className="transform transition-transform">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {expanded && (
        <div className="p-3 bg-white">
          <p className="mb-2">{outcome.description}</p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-semibold">Subject:</span> {outcome.subject}
            </div>
            {outcome.domain && (
              <div>
                <span className="font-semibold">Domain:</span> {outcome.domain}
              </div>
            )}
            <div>
              <span className="font-semibold">Grade:</span> {outcome.grade}
            </div>
            <div>
              <span className="font-semibold">Code:</span> {outcome.code}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
