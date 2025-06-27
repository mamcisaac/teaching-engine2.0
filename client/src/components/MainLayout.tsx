import React, { ReactNode, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useETFOProgress } from '../hooks/useETFOProgress';
import { useFeatureTutorial } from '../hooks/useFeatureTutorial';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import NotificationBell from './NotificationBell';
import LanguageSwitcher from './LanguageSwitcher';
import TeacherOnboardingFlow from './TeacherOnboardingFlow';
import { TutorialManager } from './help/TutorialManager';
// import { formatShortcut } from '../contexts/KeyboardShortcutsContext';

// Navigation item interface
interface NavItem {
  path: string;
  label: string;
  icon: JSX.Element;
}

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  // Mobile-first responsive sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { getETFOLevels } = useETFOProgress();

  // Enable feature tutorials
  useFeatureTutorial();

  // Keyboard shortcut to toggle sidebar (Ctrl/Cmd + B)
  useKeyboardShortcut(() => setIsSidebarOpen((prev) => !prev), {
    key: 'b',
    ctrl: true,
    cmd: true,
    description: 'Toggle sidebar',
    category: 'navigation',
  });

  // Quick navigation with number keys (1-5 for ETFO levels)
  const etfoLevels = getETFOLevels();
  etfoLevels.forEach((level, index) => {
    if (index < 9) {
      // Limit to 1-9 keys
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useKeyboardShortcut(
        () => {
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

  // Handle responsive sidebar behavior
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On desktop, keep sidebar open by default; on mobile, keep closed
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      } else if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Secondary navigation items
  const secondaryNavItems: NavItem[] = [
    {
      path: '/planner/dashboard',
      label: 'Planning Dashboard',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      path: '/planner/calendar',
      label: 'Calendar View',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      path: '/templates',
      label: 'Plan Templates',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    // Legacy navigation items removed - functionality available through ETFO workflow
    {
      path: '/newsletters',
      label: 'Parent Newsletters',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      ),
    },
    {
      path: '/help',
      label: 'Help & Documentation',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      path: '/teams',
      label: 'Teams',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.50 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <TutorialManager>
      <div className="flex h-screen bg-gray-100">
        {/* Mobile backdrop */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div
          className={`bg-indigo-800 text-white transition-all duration-300 ease-in-out ${
            isMobile
              ? `fixed h-full z-30 ${isSidebarOpen ? 'w-64' : '-translate-x-full w-64'}`
              : `fixed h-full z-10 ${isSidebarOpen ? 'w-64' : 'w-16'}`
          }`}
          data-testid="main-sidebar"
        >
          <div className="flex items-center justify-between p-4 border-b border-indigo-700">
            <h1 className={`font-bold text-xl ${!isSidebarOpen && !isMobile && 'hidden'}`}>
              {isMobile ? 'Teaching Engine' : 'Teacher Planner'}
            </h1>
            <button
              onClick={toggleSidebar}
              className="text-white focus:outline-none p-1 rounded-lg hover:bg-indigo-700 transition-colors"
              aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isSidebarOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Main navigation - ETFO Planning Levels */}
          <div className="py-4">
            <div className="px-4 py-2 text-xs uppercase text-indigo-300 font-semibold">
              {isSidebarOpen ? 'ETFO Planning Workflow' : ''}
            </div>
            {etfoLevels.map((level, index) => {
              const isAccessible = level.isAccessible;
              const isComplete = level.isComplete;
              const progress = level.progress;

              return (
                <div key={level.id} className="relative">
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
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        <span>{Math.round(progress)}%</span>
                      </div>
                    </div>
                  )}
                  <NavLink
                    to={isAccessible ? level.path : '#'}
                    data-testid={level.id === 2 ? 'long-range-nav' : undefined}
                    className={({ isActive }) => {
                      const baseClasses = `flex items-center py-2 px-4 ${!isSidebarOpen && 'justify-center'}`;

                      if (!isAccessible) {
                        return `${baseClasses} text-indigo-400 cursor-not-allowed opacity-50`;
                      }

                      if (isActive) {
                        return `${baseClasses} bg-indigo-900 text-white`;
                      }

                      return `${baseClasses} text-indigo-100 hover:bg-indigo-700`;
                    }}
                    onClick={(e) => {
                      if (!isAccessible) {
                        e.preventDefault();
                        // Could add a toast notification here
                      }
                    }}
                  >
                    <span className="mr-3 relative">
                      {level.icon}
                      {isComplete && isSidebarOpen && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-400 rounded-full"></div>
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
                            ></div>
                          </div>
                        )}
                      </div>
                    )}
                  </NavLink>
                </div>
              );
            })}

            <div className="mt-6 px-4 py-2 text-xs uppercase text-indigo-300 font-semibold">
              {isSidebarOpen ? 'Resources' : ''}
            </div>
            {secondaryNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center py-2 px-4 ${
                    isActive ? 'bg-indigo-900 text-white' : 'text-indigo-100 hover:bg-indigo-700'
                  } ${!isSidebarOpen && 'justify-center'}`
                }
              >
                <span className="mr-3">{item.icon}</span>
                {isSidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
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
        </div>

        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-16'
          }`}
        >
          {/* Top navigation bar */}
          <div className="bg-white shadow-sm p-4 flex justify-between items-center">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <div className="text-lg md:text-xl font-semibold flex-1 text-center md:text-left">
              {/* Current page title based on route */}
              {(() => {
                // Check ETFO levels first
                const etfoMatch = etfoLevels.find((level) =>
                  location.pathname.startsWith(level.path),
                );
                if (etfoMatch) return etfoMatch.name;

                // Check for exact analytics match
                if (location.pathname === '/analytics') {
                  return 'Analytics';
                }

                // Check secondary nav items
                const secondaryMatch = secondaryNavItems.find((item) =>
                  location.pathname.startsWith(item.path),
                );
                if (secondaryMatch) return secondaryMatch.label;

                // Default
                return 'Teaching Engine 2.0';
              })()}
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              <NotificationBell />
              <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <span className="font-semibold text-sm">TP</span>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="p-3 md:p-6 h-[calc(100vh-64px)] overflow-y-auto">
            <div className="max-w-full">{children}</div>
          </div>
        </div>

        {/* Onboarding Flow */}
        <TeacherOnboardingFlow />
      </div>
    </TutorialManager>
  );
}
