import React, { useState, useRef } from 'react';
import type { Outcome } from '../api';

interface Props {
  outcome: Outcome;
  children: React.ReactNode;
}

export default function OutcomeTooltip({ outcome, children }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          ref={tooltipRef}
          className="absolute z-10 p-3 bg-gray-800 text-white text-sm rounded shadow-lg max-w-xs"
          style={{
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-5px)',
            minWidth: '250px',
          }}
        >
          <div className="font-bold mb-1">
            {outcome.code} - Grade {outcome.grade}
          </div>
          <div className="mb-1">{outcome.description}</div>
          {outcome.domain && <div className="text-gray-300 text-xs">Domain: {outcome.domain}</div>}
          <div className="text-gray-300 text-xs">Subject: {outcome.subject}</div>
          {/* Triangle pointer */}
          <div
            className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-solid border-l-transparent border-r-transparent border-t-gray-800"
            style={{
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      )}
    </div>
  );
}
