/**
 * Tests for routing configuration
 * Verifying Week View as default dashboard
 */

import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { protectedRoutes } from '../routesConfig';

// Mock components
vi.mock('../../pages/WeekViewPage', () => ({
  WeekViewPage: () => <div>Week View Page</div>
}));

vi.mock('../../pages/ShowcaseDashboard', () => ({
  default: () => <div>Old Dashboard</div>
}));

describe('Routes Configuration - Week View as Default', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRoute = (initialPath: string) => {
    // Build routes from configuration
    const routeElements = protectedRoutes.map((route) => {
      if (typeof route.element === 'function') {
        const Component = route.element;
        return <Route key={route.path} path={route.path} element={<Component />} />;
      }
      return <Route key={route.path} path={route.path} element={route.element} />;
    });

    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          {routeElements}
          <Route path="/planner/week" element={<div>Week View Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  describe('Root Path Redirect', () => {
    it('should redirect from / to /planner/week', () => {
      // Act
      renderRoute('/');

      // Assert - Should see Week View content
      expect(screen.getByText('Week View Page')).toBeInTheDocument();
      expect(screen.queryByText('Old Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Dashboard Path Redirect', () => {
    it('should redirect from /dashboard to /planner/week', () => {
      // Act
      renderRoute('/dashboard');

      // Assert
      expect(screen.getByText('Week View Page')).toBeInTheDocument();
      expect(screen.queryByText('Old Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Configuration Verification', () => {
    it('should have Navigate elements for root and dashboard paths', () => {
      // Find the route configurations
      const rootRoute = protectedRoutes.find(r => r.path === '/');
      const dashboardRoute = protectedRoutes.find(r => r.path === '/dashboard');

      // Assert they exist and are Navigate components
      expect(rootRoute).toBeDefined();
      expect(dashboardRoute).toBeDefined();
      
      // Check that they are Navigate components with correct props
      if (rootRoute && typeof rootRoute.element === 'object') {
        expect(rootRoute.element.type?.name).toContain('Navigate');
        expect(rootRoute.element.props?.to).toBe('/planner/week');
        expect(rootRoute.element.props?.replace).toBe(true);
      }

      if (dashboardRoute && typeof dashboardRoute.element === 'object') {
        expect(dashboardRoute.element.type?.name).toContain('Navigate');
        expect(dashboardRoute.element.props?.to).toBe('/planner/week');
        expect(dashboardRoute.element.props?.replace).toBe(true);
      }
    });
  });
});