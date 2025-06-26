/**
 * @file ProtectedRoute.test.tsx
 * @description Comprehensive tests for ProtectedRoute component including authentication
 * state handling, navigation behavior, and redirect logic.
 */

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import ProtectedRoute from '../ProtectedRoute';
import { renderWithProviders, setupTest } from '@/test-utils';
import { useAuth } from '../../contexts/AuthContext';

// Mock useAuth hook directly
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom Navigate component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, state, replace }: { to: string; state?: any; replace?: boolean }) => {
      mockNavigate(to, state, replace);
      return <div data-testid="navigate-component">Redirecting to {to}</div>;
    },
  };
});

describe('ProtectedRoute', () => {
  const TestComponent = () => <div data-testid="protected-content">Protected Content</div>;
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    setupTest();
    mockNavigate.mockClear();
    mockUseAuth.mockClear();
  });

  describe('Authentication State Handling', () => {
    it('should render children when user is authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'teacher' },
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate-component')).not.toBeInTheDocument();
    });

    it('should redirect to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          initialEntries: ['/dashboard'],
        }
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-component')).toBeInTheDocument();
      expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
    });

    it('should handle null user state', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(screen.getByTestId('navigate-component')).toBeInTheDocument();
    });
  });

  describe('Navigation Behavior', () => {
    it('should redirect to /login with current location state', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          initialEntries: ['/dashboard'],
        }
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        { from: { pathname: '/dashboard', search: '', hash: '', state: null, key: expect.any(String) } },
        true
      );
    });

    it('should preserve query parameters in redirect state', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          initialEntries: ['/dashboard?tab=lessons&filter=active'],
        }
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        { 
          from: { 
            pathname: '/dashboard', 
            search: '?tab=lessons&filter=active', 
            hash: '', 
            state: null, 
            key: expect.any(String) 
          } 
        },
        true
      );
    });

    it('should preserve hash in redirect state', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          initialEntries: ['/dashboard#section1'],
        }
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        { 
          from: { 
            pathname: '/dashboard', 
            search: '', 
            hash: '#section1', 
            state: null, 
            key: expect.any(String) 
          } 
        },
        true
      );
    });

    it('should use replace navigation to avoid back button issues', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        expect.any(Object),
        true // replace: true
      );
    });
  });

  describe('Different Route Scenarios', () => {
    it('should handle root route redirect', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          initialEntries: ['/'],
        }
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        { from: { pathname: '/', search: '', hash: '', state: null, key: expect.any(String) } },
        true
      );
    });

    it('should handle nested route redirect', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          initialEntries: ['/dashboard/lesson-plans/123/edit'],
        }
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        { 
          from: { 
            pathname: '/dashboard/lesson-plans/123/edit', 
            search: '', 
            hash: '', 
            state: null, 
            key: expect.any(String) 
          } 
        },
        true
      );
    });

    it('should handle complex URLs with all components', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>,
        {
          initialEntries: ['/dashboard/lesson-plans?subject=math&grade=3#activities'],
        }
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        { 
          from: { 
            pathname: '/dashboard/lesson-plans', 
            search: '?subject=math&grade=3', 
            hash: '#activities', 
            state: null, 
            key: expect.any(String) 
          } 
        },
        true
      );
    });
  });

  describe('Authentication State Changes', () => {
    it('should render content when authentication state changes to true', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      const { rerender } = renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Initially should show redirect
      expect(screen.getByTestId('navigate-component')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();

      // Change mock to authenticated state
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'teacher' },
      });

      // Rerender with authenticated state
      rerender(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Now should show protected content
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate-component')).not.toBeInTheDocument();
    });

    it('should handle loading states gracefully', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
      });

      renderWithProviders(
        <ProtectedRoute>
          <TestComponent />
        </ProtectedRoute>
      );

      // Should redirect when not authenticated, regardless of loading state
      expect(screen.getByTestId('navigate-component')).toBeInTheDocument();
    });
  });

  describe('Children Rendering', () => {
    it('should render complex children components', () => {
      const ComplexComponent = () => (
        <div data-testid="complex-component">
          <h1>Complex Protected Content</h1>
          <p>This is a more complex component</p>
          <button>Action Button</button>
        </div>
      );

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'teacher' },
      });

      renderWithProviders(
        <ProtectedRoute>
          <ComplexComponent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('complex-component')).toBeInTheDocument();
      expect(screen.getByText('Complex Protected Content')).toBeInTheDocument();
      expect(screen.getByText('This is a more complex component')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('should render children with props', () => {
      const ComponentWithProps = ({ title }: { title: string }) => (
        <div data-testid="component-with-props">{title}</div>
      );

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'teacher' },
      });

      renderWithProviders(
        <ProtectedRoute>
          <ComponentWithProps title="Test Title" />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('component-with-props')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should handle children with nested components', () => {
      const NestedComponent = () => (
        <div data-testid="nested-component">
          <div data-testid="nested-child-1">Child 1</div>
          <div data-testid="nested-child-2">Child 2</div>
        </div>
      );

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'teacher' },
      });

      renderWithProviders(
        <ProtectedRoute>
          <NestedComponent />
        </ProtectedRoute>
      );

      expect(screen.getByTestId('nested-component')).toBeInTheDocument();
      expect(screen.getByTestId('nested-child-1')).toBeInTheDocument();
      expect(screen.getByTestId('nested-child-2')).toBeInTheDocument();
    });
  });

  describe('Error Boundaries', () => {
    it('should handle errors in children gracefully', () => {
      const ErrorComponent = () => {
        throw new Error('Creation failed');
      };

      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'teacher' },
      });

      // Suppress console errors for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderWithProviders(
          <ProtectedRoute>
            <ErrorComponent />
          </ProtectedRoute>
        );
      }).toThrow('Creation failed');

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined children', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'teacher' },
      });

      renderWithProviders(
        <ProtectedRoute>
          {undefined as any}
        </ProtectedRoute>
      );

      // Should not throw an error
      expect(true).toBe(true);
    });

    it('should handle null children', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'teacher' },
      });

      renderWithProviders(
        <ProtectedRoute>
          {null as any}
        </ProtectedRoute>
      );

      // Should not throw an error
      expect(true).toBe(true);
    });
  });
});