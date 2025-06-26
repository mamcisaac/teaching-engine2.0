import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className={className}
      >
        {children || <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />}
      </div>
      {isVisible && (
        <div className="absolute z-10 px-3 py-2 text-sm font-normal text-white bg-gray-900 rounded-lg shadow-sm tooltip dark:bg-gray-700 -top-2 -translate-y-full left-1/2 -translate-x-1/2 max-w-xs">
          {content}
          <div className="tooltip-arrow absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45"></div>
          </div>
        </div>
      )}
    </div>
  );
}

interface InfoTooltipProps {
  content: string;
  className?: string;
}

export function InfoTooltip({ content, className = '' }: InfoTooltipProps) {
  return (
    <Tooltip content={content} className={`inline-flex items-center ml-1 ${className}`}>
      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
    </Tooltip>
  );
}