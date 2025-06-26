import React from 'react';
import { HelpTooltip } from './HelpTooltip';
import { clsx } from 'clsx';

interface HelpButtonProps {
  content: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'text' | 'floating';
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  onClick?: () => void;
}

export const HelpButton: React.FC<HelpButtonProps> = ({
  content,
  size = 'md',
  variant = 'icon',
  position = 'top',
  className,
  onClick
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const buttonSizes = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  const renderButton = () => {
    const baseClasses = clsx(
      'inline-flex items-center justify-center rounded-full transition-colors',
      'text-gray-400 hover:text-blue-600 focus:text-blue-600',
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      buttonSizes[size],
      className
    );

    const iconClasses = sizes[size];

    if (variant === 'floating') {
      return (
        <button
          className={clsx(
            baseClasses,
            'fixed bottom-6 right-6 bg-blue-600 text-white shadow-lg hover:bg-blue-700',
            'z-40 h-12 w-12'
          )}
          onClick={onClick}
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      );
    }

    if (variant === 'text') {
      return (
        <button
          className={clsx(
            'inline-flex items-center text-sm text-blue-600 hover:text-blue-700',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded',
            className
          )}
          onClick={onClick}
        >
          <svg className={clsx(iconClasses, 'mr-1')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Help
        </button>
      );
    }

    // Default icon variant
    return (
      <button className={baseClasses} onClick={onClick}>
        <svg className={iconClasses} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>
    );
  };

  if (variant === 'floating') {
    // Floating buttons don't need tooltips as they're meant to be clicked
    return renderButton();
  }

  return (
    <HelpTooltip content={content} position={position}>
      {renderButton()}
    </HelpTooltip>
  );
};