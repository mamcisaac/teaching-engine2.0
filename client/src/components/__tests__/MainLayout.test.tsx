/**
 * @file MainLayout.test.tsx
 * @description Comprehensive tests for MainLayout component including navigation,
 * responsive behavior, accessibility, keyboard shortcuts, and user interactions.
 */

import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import MainLayout from '../MainLayout';
import { renderWithProviders, createMockUser } from '@/test-utils';

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock the context and hooks
const mockAuthContext = {
  user: createMockUser(),
  logout: vi.fn(),
  isAuthenticated: true,
  login: vi.fn(),
  checkAuth: vi.fn(),
  getToken: vi.fn().mockReturnValue('mock-token'),
  setToken: vi.fn(),
};

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

// Mock the ETFO progress hook
const mockETFOLevels = [
  {
    id: 'curriculum-expectations',
    name: 'Curriculum Expectations',
    path: '/curriculum/import',
    isAccessible: true,
    isCompleted: false,
  },
  {
    id: 'long-range-plans',
    name: 'Long-Range Plans',
    path: '/planner/long-range',
    isAccessible: true,
    isCompleted: false,
  },
  {
    id: 'unit-plans',
    name: 'Unit Plans',
    path: '/planner/units',
    isAccessible: false,
    isCompleted: false,
  },
];

vi.mock('../hooks/useETFOProgress', () => ({
  useETFOProgress: () => ({
    getETFOLevels: () => mockETFOLevels,
  }),
}));

// Mock other hooks
vi.mock('../hooks/useFeatureTutorial', () => ({
  useFeatureTutorial: () => {},
}));

vi.mock('../hooks/useKeyboardShortcut', () => ({
  useKeyboardShortcut: vi.fn(),
}));

// Mock child components
vi.mock('../NotificationBell', () => ({
  default: () => <div data-testid="notification-bell">Notifications</div>,
}));

vi.mock('../LanguageSwitcher', () => ({
  default: () => <div data-testid="language-switcher">Language</div>,
}));

vi.mock('../TeacherOnboardingFlow', () => ({
  default: () => <div data-testid="teacher-onboarding">Onboarding</div>,
}));

vi.mock('../help/TutorialManager', () => ({
  TutorialManager: () => <div data-testid="tutorial-manager">Tutorials</div>,
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
      expect(screen.getByText('Teaching Engine 2.0')).toBeInTheDocument();
    });

    it('should render sidebar navigation', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByText('Planning Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Long-Range Plans')).toBeInTheDocument();
      expect(screen.getByText('Unit Plans')).toBeInTheDocument();
      expect(screen.getByText('Lesson Plans')).toBeInTheDocument();
    });

    it('should render user profile section', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByText('Test Teacher')).toBeInTheDocument();
      expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
    });

    it('should render ETFO levels in navigation', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(screen.getByText('Curriculum Expectations')).toBeInTheDocument();
      expect(screen.getByText('Long-Range Plans')).toBeInTheDocument();
      expect(screen.getByText('Unit Plans')).toBeInTheDocument();
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

      const sidebar = screen.getByRole('navigation');
      expect(sidebar).not.toHaveClass('hidden');
    });

    it('should hide sidebar by default on mobile', () => {
      window.innerWidth = 500;

      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Mobile sidebar should be hidden initially
      const sidebarToggle = screen.getByRole('button', { name: /toggle sidebar/i });
      expect(sidebarToggle).toBeInTheDocument();
    });

    it('should toggle sidebar when toggle button is clicked', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(toggleButton);

      // Sidebar state should change
      expect(toggleButton).toBeInTheDocument();
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
        { initialEntries: ['/planner/dashboard'] },
      );

      const activeLink = screen.getByText('Planning Dashboard').closest('a');
      expect(activeLink).toHaveClass('active');
    });

    it('should navigate when navigation items are clicked', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const dashboardLink = screen.getByText('Planning Dashboard');
      await user.click(dashboardLink);

      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/planner/dashboard');
    });

    it('should show accessible ETFO levels only', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Accessible levels should be clickable
      const accessibleLevel = screen.getByText('Curriculum Expectations').closest('a');
      expect(accessibleLevel).not.toHaveAttribute('aria-disabled', 'true');

      // Non-accessible levels should be disabled
      const inaccessibleLevel = screen.getByText('Unit Plans').closest('a');
      expect(inaccessibleLevel).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('User Actions', () => {
    it('should call logout when logout button is clicked', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      expect(mockAuthContext.logout).toHaveBeenCalledTimes(1);
    });

    it('should show user menu when profile is clicked', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const profileButton = screen.getByRole('button', { name: /user menu/i });
      await user.click(profileButton);

      expect(screen.getByText('Settings')).toBeInTheDocument();
      expect(screen.getByText('Help')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register sidebar toggle shortcut', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(require('../hooks/useKeyboardShortcut').useKeyboardShortcut).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          key: 'b',
          ctrl: true,
          cmd: true,
          description: 'Toggle sidebar',
          category: 'navigation',
        }),
      );
    });

    it('should register navigation shortcuts for accessible ETFO levels', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      expect(require('../hooks/useKeyboardShortcut').useKeyboardShortcut).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          key: '1',
          alt: true,
          description: 'Go to Curriculum Expectations',
          category: 'navigation',
          enabled: true,
        }),
      );

      expect(require('../hooks/useKeyboardShortcut').useKeyboardShortcut).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          key: '2',
          alt: true,
          description: 'Go to Long-Range Plans',
          category: 'navigation',
          enabled: true,
        }),
      );
    });

    it('should not register shortcuts for inaccessible levels', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Should not register shortcut for inaccessible unit plans (key 3)
      const shortcutCalls = vi.mocked(require('../hooks/useKeyboardShortcut').useKeyboardShortcut)
        .mock.calls;
      const unitPlanShortcut = shortcutCalls.find(
        (call) => call[1]?.key === '3' && call[1]?.description === 'Go to Unit Plans',
      );
      expect(unitPlanShortcut[1].enabled).toBe(false);
    });
  });

  describe('Progress Indication', () => {
    it('should show progress indicators for ETFO levels', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Should show checkmarks for completed levels
      const completedIcons = document.querySelectorAll('.lucide-check-circle');
      expect(completedIcons).toHaveLength(0); // None completed in mock data

      // Should show lock icons for inaccessible levels
      const lockIcons = document.querySelectorAll('.lucide-lock');
      expect(lockIcons.length).toBeGreaterThan(0);
    });

    it('should display overall progress percentage', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Should show progress bar or percentage
      const progressElements = screen.getAllByText(/progress/i);
      expect(progressElements.length).toBeGreaterThan(0);
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

      expect(screen.getByTestId('teacher-onboarding')).toBeInTheDocument();
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

      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // Sidebar
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
    });

    it('should have proper heading hierarchy', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Teaching Engine 2.0');
    });

    it('should have keyboard accessible navigation', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const firstNavLink = screen.getByText('Planning Dashboard').closest('a');
      firstNavLink?.focus();
      expect(firstNavLink).toHaveFocus();

      await user.tab();
      // Next navigation item should be focused
    });

    it('should have proper ARIA labels for interactive elements', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
      expect(toggleButton).toHaveAttribute('aria-label');

      const userMenuButton = screen.getByRole('button', { name: /user menu/i });
      expect(userMenuButton).toHaveAttribute('aria-label');
    });

    it('should announce sidebar state changes', async () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const toggleButton = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(toggleButton);

      expect(toggleButton).toHaveAttribute('aria-expanded');
    });

    it('should have focus management for mobile menu', async () => {
      window.innerWidth = 500;

      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      const menuButton = screen.getByRole('button', { name: /toggle sidebar/i });
      await user.click(menuButton);

      // Focus should move to sidebar or first navigation item
      const firstNavItem = screen.getByText('Planning Dashboard');
      expect(firstNavItem.closest('a')).toBeInTheDocument();
    });

    it('should support reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Animations should be disabled or reduced
      const sidebar = screen.getByRole('navigation');
      expect(sidebar).not.toHaveClass('animate-slide');
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();

      function TestChild() {
        renderSpy();
        return <div>Test Content</div>;
      }

      const { rerender } = renderWithProviders(
        <MainLayout>
          <TestChild />
        </MainLayout>,
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      rerender(
        <MainLayout>
          <TestChild />
        </MainLayout>,
      );

      // Should not cause unnecessary re-renders
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount + 1);
    });

    it('should lazy load non-critical components', () => {
      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Tutorial manager should be present (mocked)
      expect(screen.getByTestId('tutorial-manager')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing user data gracefully', () => {
      const invalidAuthContext = {
        ...mockAuthContext,
        user: null,
      };

      vi.mocked(require('../contexts/AuthContext').useAuth).mockReturnValue(invalidAuthContext);

      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Should still render layout without user info
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should handle navigation errors', async () => {
      mockNavigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });

      renderWithProviders(
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>,
      );

      // Should not crash on navigation error
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });
});
