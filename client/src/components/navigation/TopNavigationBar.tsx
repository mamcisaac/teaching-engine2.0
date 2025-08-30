import React from 'react';
import { useLocation } from 'react-router-dom';

import { useETFOProgress } from '../../hooks/useETFOProgress';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { NotificationBell } from '../NotificationBell';

import { secondaryNavItems } from './navigationConfig';
import { useNavigation } from './NavigationProvider';
import { UserProfileDropdown } from './UserProfileDropdown';

export function TopNavigationBar(): React.ReactElement {
  const location = useLocation();
  const { getETFOLevels } = useETFOProgress();
  const { toggleSidebar, isMobile } = useNavigation();
  const etfoLevels = getETFOLevels();

  const getCurrentPageTitle = (): string => {
    // Check ETFO levels first
    const etfoMatch = etfoLevels.find((level) =>
      location.pathname.startsWith(level.path),
    );
    if (etfoMatch) {
return etfoMatch.name;
}

    // Check for exact analytics match
    if (location.pathname === '/analytics') {
      return 'Analytics';
    }

    // Check secondary nav items
    const secondaryMatch = secondaryNavItems.find((item) =>
      location.pathname.startsWith(item.path),
    );
    if (secondaryMatch) {
return secondaryMatch.label;
}

    // Default
    return 'Teaching Engine 2.0';
  };

  return (
    <div className="bg-white shadow-sm p-4 flex justify-between items-center">
      {/* Mobile menu button */}
      {isMobile && (
        <button
          aria-label="Open menu"
          className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          onClick={toggleSidebar}
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </button>
      )}
      <div className="text-lg md:text-xl font-semibold flex-1 text-center md:text-left">
        {getCurrentPageTitle()}
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <NotificationBell />
        <UserProfileDropdown />
      </div>
    </div>
  );
}