import React from 'react';
import { format } from 'date-fns';

interface CurrentTimeIndicatorProps {
  position: number; // Percentage from top (0-100)
}

export function CurrentTimeIndicator({ position }: CurrentTimeIndicatorProps): React.ReactElement {
  const currentTime = format(new Date(), 'h:mm a');
  
  return (
    <div 
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top: `${position}%` }}
    >
      <div className="relative">
        {/* Time label */}
        <div className="absolute left-20 -top-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-lg">
          NOW • {currentTime}
        </div>
        
        {/* Line */}
        <div className="h-0.5 bg-red-500 shadow-md">
          {/* Animated pulse dot */}
          <div className="absolute left-16 top-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              <div className="absolute inset-0 h-3 w-3 bg-red-400 rounded-full animate-ping"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}