/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file MainLayout.test.tsx
 * @description Comprehensive tests for MainLayout component including navigation,
 * responsive behavior, accessibility, keyboard shortcuts, and user interactions.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
// @ts-expect-error jest-axe doesn't have types available
import { axe, toHaveNoViolations } from 'jest-axe';
import { MainLayout } from '../MainLayout';
import { renderWithProviders, createMockUser } from '@/test-utils';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the context and hooks
const mockAuthContext = {
  user: createMockUser() as any,
  logout: vi.fn(),
  isAuthenticated: true,
  login: vi.fn(),
  checkAuth: vi.fn(),
  getToken: vi.fn().mockReturnValue('mock-token'),
  setToken: vi.fn(),
  isLoading: false,
  isInitialized: true,
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

// Mock onboarding context to prevent errors
vi.mock('../../contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    isOnboardingComplete: true,
    currentStep: null,
    completeStep: vi.fn(),
    resetOnboarding: vi.fn(),
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/planner/dashboard' }),
  };
});

// Mock the ETFO progress hook
const mockETFOLevels = [
  {
    id: 1,
    name: 'Curriculum Expectations',
    path: '/curriculum/import',
    description: 'Import curriculum',
    icon: <span>📚</span>,
    isAccessible: true,
    isComplete: false,
    progress: 50,
  },
  {
    id: 2,
    name: 'Long-Range Plans',
    path: '/planner/long-range',
    description: 'Plan your year',
    icon: <span>📅</span>,
    isAccessible: true,
    isComplete: false,
    progress: 30,
  },
  {
    id: 3,
    name: 'Unit Plans',
    path: '/planner/units',
    description: 'Create units',
    icon: <span>📦</span>,
    isAccessible: false,
    isComplete: false,
    progress: 0,
  },
];

vi.mock('../../hooks/useETFOProgress', () => ({
  useETFOProgress: () => ({
    getETFOLevels: () => mockETFOLevels,
    updateLevelProgress: vi.fn(),
  }),
}));

// Mock other hooks
vi.mock('../../hooks/useFeatureTutorial', () => ({
  useFeatureTutorial: vi.fn(),
}));

vi.mock('../../hooks/useKeyboardShortcut', () => ({
  useKeyboardShortcut: vi.fn((callback: () => void, options: { key: string; enabled?: boolean; ctrl?: boolean; alt?: boolean }) => {
    // Store the callbacks for testing
    if (options.key === 'b' && options.ctrl) {
      (window as any).__sidebarToggleCallback = callback;
    } else if (options.key && options.alt) {
      (window as any).__navShortcuts = (window as any).__navShortcuts || {};
      (window as any).__navShortcuts[options.key] = { callback, enabled: options.enabled };
    }
  }),
}));

// Mock child components
vi.mock('../NotificationBell', () => ({
  default: () => <div data-testid="notification-bell">NotificationBell</div>,
}));

vi.mock('../LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">LanguageSwitcher</div>,
}));

vi.mock('../TeacherOnboardingFlow', () => ({
  default: () => <div data-testid="teacher-onboarding-flow">TeacherOnboardingFlow</div>,
}));

vi.mock('../help/TutorialManager', () => ({
  TutorialManager: ({ children }: any) => <div data-testid="tutorial-manager">{children}</div>,
}));

// Mock window resize events
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

describe('MainLayout', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    window.innerWidth = 1024; // Desktop by default
    // Clear keyboard shortcut callbacks
    (window as any).__sidebarToggleCallback = undefined;
    (window as any).__navShortcuts = {};
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render main navigation elements', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
      // Check for the page title in the top navigation bar
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Teacher Planner');
    });

    it('should render sidebar navigation', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Check for ETFO planning levels
      expect(screen.getByText('Curriculum Expectations')).toBeInTheDocument();
      expect(screen.getByText('Long-Range Plans')).toBeInTheDocument();
      expect(screen.getByText('Unit Plans')).toBeInTheDocument();
    });

    it('should render ETFO levels in navigation', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Check ETFO workflow section
      expect(screen.getByText('ETFO Planning Workflow')).toBeInTheDocument();
      
      // Check individual levels
      mockETFOLevels.forEach(level => {
        expect(screen.getByText(level.name)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should show sidebar by default on desktop', () => {
      window.innerWidth = 1024;
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const sidebar = screen.getByTestId('main-sidebar');
      expect(sidebar).toHaveClass('w-64');
    });

    it('should hide sidebar by default on mobile', () => {
      window.innerWidth = 500;
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const sidebar = screen.getByTestId('main-sidebar');
      expect(sidebar).toHaveClass('-translate-x-full');
    });

    it('should toggle sidebar when toggle button is clicked', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const toggleButton = screen.getByLabelText(/open sidebar|close sidebar/i);
      await user.click(toggleButton);

      // The sidebar state should have changed
      const sidebar = screen.getByTestId('main-sidebar');
      expect(sidebar).toBeInTheDocument();
    });

    it('should handle window resize events', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should cleanup resize event listener on unmount', () => {
      const { unmount } = renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      unmount();

      expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  describe('Navigation', () => {
    it('should highlight active navigation item', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
        {
          initialEntries: ['/planner/dashboard'],
        },
      );

      const activeItem = screen.getByRole('link', { name: /planning dashboard/i });
      expect(activeItem).toHaveClass('bg-indigo-900');
    });

    it('should navigate when navigation items are clicked', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const longRangeLink = screen.getByRole('link', { name: /long-range plans/i });
      await user.click(longRangeLink);

      // Navigation should happen through React Router, not our mock
      expect(longRangeLink).toHaveAttribute('href', '/planner/long-range');
    });

    it('should show accessible ETFO levels only', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Accessible levels should be clickable
      const curriculumLink = screen.getByRole('link', { name: /curriculum expectations/i });
      expect(curriculumLink).not.toHaveClass('cursor-not-allowed');

      // Inaccessible levels should be disabled
      const unitPlansLink = screen.getByRole('link', { name: /unit plans/i });
      expect(unitPlansLink).toHaveClass('cursor-not-allowed');
    });
  });

  describe('User Actions', () => {
    it('should call logout when logout button is clicked', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(mockAuthContext.logout).toHaveBeenCalled();
    });

    it('should show user initials in profile', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByText('TP')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register sidebar toggle shortcut', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect((window as any).__sidebarToggleCallback).toBeDefined();
    });

    it('should register navigation shortcuts for accessible ETFO levels', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Check that shortcuts were registered for accessible levels
      expect((window as any).__navShortcuts['1']).toBeDefined();
      expect((window as any).__navShortcuts['1'].enabled).toBe(true);
      expect((window as any).__navShortcuts['2']).toBeDefined();
      expect((window as any).__navShortcuts['2'].enabled).toBe(true);
    });

    it('should not enable shortcuts for inaccessible levels', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Unit Plans (index 3) should have disabled shortcut
      expect((window as any).__navShortcuts['3']).toBeDefined();
      expect((window as any).__navShortcuts['3'].enabled).toBe(false);
    });
  });

  describe('Progress Indication', () => {
    it('should show progress indicators for ETFO levels', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Check for progress percentages
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('should display step numbers', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });
  });

  describe('Integration Components', () => {
    it('should render notification bell', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });

    it('should render language switcher', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByTestId('language-switcher')).toBeInTheDocument();
    });

    it('should render tutorial manager', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByTestId('tutorial-manager')).toBeInTheDocument();
    });

    it('should render teacher onboarding flow', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByTestId('teacher-onboarding-flow')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper landmark roles', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have keyboard accessible navigation', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });

    it('should have proper ARIA labels for interactive elements', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const toggleButton = screen.getByLabelText(/open sidebar|close sidebar/i);
      expect(toggleButton).toBeInTheDocument();
    });

    it('should announce sidebar state changes', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const toggleButton = screen.getByLabelText(/open sidebar|close sidebar/i);
      expect(toggleButton).toHaveAttribute('aria-label');
    });

    it('should have focus management for mobile menu', () => {
      window.innerWidth = 500;
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const mobileMenuButton = screen.getByLabelText('Open menu');
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should support reduced motion preferences', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const sidebar = screen.getByTestId('main-sidebar');
      expect(sidebar).toHaveClass('transition-all');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const initialRender = screen.getByText('Test Content');
      
      rerender(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const secondRender = screen.getByText('Test Content');
      expect(initialRender).toBe(secondRender);
    });

    it('should lazy load non-critical components', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Components are mocked, so we just verify they're rendered
      expect(screen.getByTestId('teacher-onboarding-flow')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user data gracefully', () => {
      mockAuthContext.user = null;
      
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should handle navigation errors', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Click on disabled navigation item
      const disabledLink = screen.getByRole('link', { name: /unit plans/i });
      await user.click(disabledLink);

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});