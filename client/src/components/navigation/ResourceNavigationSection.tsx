import React from 'react';

import { secondaryNavItems } from './navigationConfig';
import { useNavigation } from './NavigationProvider';
import { SidebarNavItem } from './SidebarNavItem';

export function ResourceNavigationSection() {
  const { isSidebarOpen } = useNavigation();

  return (
    <div className="mt-6">
      <h2 className="px-4 py-2 text-xs uppercase text-indigo-300 font-semibold">
        {isSidebarOpen ? 'Resources' : ''}
      </h2>
      {secondaryNavItems.map((item) => (
        <SidebarNavItem
          key={item.path}
          icon={item.icon}
          label={item.label}
          path={item.path}
        />
      ))}
    </div>
  );
}