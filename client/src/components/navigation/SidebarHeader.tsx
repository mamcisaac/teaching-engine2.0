import React from 'react';

import { useNavigation } from './NavigationProvider';

export function SidebarHeader() {
  const { isSidebarOpen, toggleSidebar, isMobile } = useNavigation();

  return (
    <div className="flex items-center justify-between p-4 border-b border-indigo-700">
      <h1 className={`font-bold text-xl ${!isSidebarOpen && !isMobile && 'hidden'}`}>
        {isMobile ? 'Teaching Engine' : 'Teacher Planner'}
      </h1>
      <button
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        className="text-white focus:outline-none p-1 rounded-lg hover:bg-indigo-700 transition-colors"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        ) : (
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        )}
      </button>
    </div>
  );
}