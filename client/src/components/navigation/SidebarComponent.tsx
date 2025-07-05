import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from './NavigationProvider';
import { SidebarHeader } from './SidebarHeader';
import { ETFONavigationSection } from './ETFONavigationSection';
import { ResourceNavigationSection } from './ResourceNavigationSection';

export function SidebarComponent() {
  const { logout } = useAuth();
  const { isSidebarOpen, isMobile } = useNavigation();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav
      className={`bg-indigo-800 text-white transition-all duration-300 ease-in-out ${
        isMobile
          ? `fixed h-full z-30 ${isSidebarOpen ? 'w-64' : '-translate-x-full w-64'}`
          : `fixed h-full z-10 ${isSidebarOpen ? 'w-64' : 'w-16'}`
      }`}
      data-testid="main-sidebar"
      role="navigation"
      aria-label="Main navigation"
    >
      <SidebarHeader />
      
      <div className="py-4 h-[calc(100%-8rem)] overflow-y-auto">
        <ETFONavigationSection />
        <ResourceNavigationSection />
      </div>

      {/* Logout button at bottom */}
      <div className="absolute bottom-0 w-full border-t border-indigo-700 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center text-indigo-100 hover:text-white w-full"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );
}