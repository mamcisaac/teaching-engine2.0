import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigation } from './NavigationProvider';

interface SidebarNavItemProps {
  path: string;
  label: string;
  icon: JSX.Element;
  isActive?: (match: { pathname: string } | null, location: { pathname: string }) => boolean;
  testId?: string;
}

export function SidebarNavItem({ path, label, icon, testId }: SidebarNavItemProps) {
  const { isSidebarOpen } = useNavigation();

  return (
    <NavLink
      to={path}
      data-testid={testId}
      className={({ isActive: active }) =>
        `flex items-center py-2 px-4 ${
          active ? 'bg-indigo-900 text-white' : 'text-indigo-100 hover:bg-indigo-700'
        } ${!isSidebarOpen && 'justify-center'}`
      }
    >
      <span className="mr-3">{icon}</span>
      {isSidebarOpen && <span>{label}</span>}
    </NavLink>
  );
}