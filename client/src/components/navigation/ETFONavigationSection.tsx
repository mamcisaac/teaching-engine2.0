import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useETFOProgress } from '../../hooks/useETFOProgress';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';

import { useNavigation } from './NavigationProvider';

export function ETFONavigationSection(): React.ReactElement {
  const { getETFOLevels } = useETFOProgress();
  const { isSidebarOpen } = useNavigation();
  const navigate = useNavigate();
  const etfoLevels = getETFOLevels();

  // Set up keyboard shortcuts for ETFO navigation
  etfoLevels.forEach((level, index) => {
    if (index < 9) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useKeyboardShortcut(
        (): void => {
          if (level.isAccessible) {
            navigate(level.path);
          }
        },
        {
          key: String(index + 1),
          alt: true,
          description: `Go to ${level.name}`,
          category: 'navigation',
          enabled: level.isAccessible,
        },
      );
    }
  });

  return (
    <div>
      <h2 className="px-4 py-2 text-xs uppercase text-indigo-300 font-semibold">
        {isSidebarOpen ? 'ETFO Planning Workflow' : ''}
      </h2>
      {etfoLevels.map((level, index) => {
        const {isAccessible} = level;
        const {isComplete} = level;
        const {progress} = level;

        return (
          <div className="relative" key={level.id}>
            {isSidebarOpen && (
              <div className="px-4 py-1 text-xs text-indigo-300 flex items-center justify-between">
                <span>Step {index + 1}</span>
                <div className="flex items-center space-x-2">
                  {isComplete && (
                    <svg
                      className="h-3 w-3 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        clipRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        fillRule="evenodd"
                      />
                    </svg>
                  )}
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}
            <NavLink
              className={({ isActive }): string => {
                const baseClasses = `flex items-center py-2 px-4 ${!isSidebarOpen && 'justify-center'}`;

                if (!isAccessible) {
                  return `${baseClasses} text-indigo-400 cursor-not-allowed opacity-50`;
                }

                if (isActive) {
                  return `${baseClasses} bg-indigo-900 text-white`;
                }

                return `${baseClasses} text-indigo-100 hover:bg-indigo-700`;
              }}
              data-testid={level.id === 2 ? 'long-range-nav' : undefined}
              onClick={(e): void => {
                if (!isAccessible) {
                  e.preventDefault();
                }
              }}
              to={isAccessible ? level.path : '#'}
            >
              <span className="mr-3 relative">
                {level.icon}
                {isComplete && isSidebarOpen && (
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full" />
                )}
              </span>
              {isSidebarOpen && (
                <div className="flex-1">
                  <div className="font-medium">{level.name}</div>
                  <div className="text-xs text-indigo-300 mt-1">{level.description}</div>
                  {progress > 0 && progress < 100 && (
                    <div className="w-full bg-indigo-800 rounded-full h-1 mt-2">
                      <div
                        className="bg-indigo-400 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                       />
                    </div>
                  )}
                </div>
              )}
            </NavLink>
          </div>
        );
      })}
    </div>
  );
}