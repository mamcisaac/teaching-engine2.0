import { Outcome } from '../types';

interface Props {
  outcome: Outcome;
  size?: 'small' | 'normal';
  showTooltip?: boolean;
}

export default function OutcomeTag({ outcome, size = 'normal', showTooltip = true }: Props) {
  // Determine background color based on subject
  const getColorForSubject = (subject: string): string => {
    // Create a hash from the subject string for consistent colors
    const hash = subject.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Generate a hue from 0-360 degrees
    const hue = hash % 360;

    // Return HSL with lighter saturation and higher lightness for a pastel look
    return `hsl(${hue}, 70%, 85%)`;
  };

  const backgroundColor = getColorForSubject(outcome.subject);
  const textColor = 'text-gray-800'; // Dark text for all pastel backgrounds

  const tooltipContent = showTooltip
    ? `${outcome.description} (${outcome.subject} - Grade ${outcome.grade})`
    : undefined;

  return (
    <span
      className={`inline-flex items-center rounded-md font-mono ${
        size === 'small' ? 'px-1 py-0.5 text-xs' : 'px-2 py-1 text-sm'
      } ${textColor}`}
      style={{ backgroundColor }}
      title={tooltipContent}
    >
      {outcome.code}
    </span>
  );
}
