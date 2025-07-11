import type { ReactNode } from 'react';
import React from 'react';

import { useFeatureTutorial } from '../hooks/useFeatureTutorial';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

import { TutorialManager } from './help/TutorialManager';
import { NavigationProvider, useNavigation } from './navigation/NavigationProvider';
import { SidebarComponent } from './navigation/SidebarComponent';
import { TopNavigationBar } from './navigation/TopNavigationBar';
import TeacherOnboardingFlow from './TeacherOnboardingFlow';

interface MainLayoutProps {
  children: ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { isSidebarOpen, toggleSidebar, isMobile } = useNavigation();

  // Enable feature tutorials
  useFeatureTutorial();

  // Keyboard shortcut to toggle sidebar (Ctrl/Cmd + B)
  useKeyboardShortcut(() => {
 toggleSidebar(); 
}, {
    key: 'b',
    ctrl: true,
    cmd: true,
    description: 'Toggle sidebar',
    category: 'navigation',
  });

  return (
    <TutorialManager>
      <div className="flex h-screen bg-gray-100">
        {/* Mobile backdrop */}
        {isMobile && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => {
 toggleSidebar(); 
}}
          />
        )}

        {/* Sidebar */}
        <SidebarComponent />

        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-300 ease-in-out ${
            isMobile ? 'ml-0' : isSidebarOpen ? 'ml-64' : 'ml-16'
          }`}
        >
          {/* Top navigation bar */}
          <TopNavigationBar />

          {/* Main content area */}
          <main className="p-3 md:p-6 h-[calc(100vh-64px)] overflow-y-auto" role="main">
            <div className="max-w-full">{children}</div>
          </main>
        </div>

        {/* Onboarding Flow */}
        <TeacherOnboardingFlow />
      </div>
    </TutorialManager>
  );
}

export default function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  return (
    <NavigationProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </NavigationProvider>
  );
}
