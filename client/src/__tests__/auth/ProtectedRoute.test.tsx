import { screen } from '@testing-library/react';
import { vi } from 'vitest';
import ProtectedRoute from '../../components/ProtectedRoute';
import { renderWithAuth, renderWithoutAuth } from '../../test-utils';

// Mock Navigate component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, state, replace }: { to: string; state?: any; replace?: boolean }) => {
      mockNavigate(to, state, replace);
      return <div data-testid="navigate">Redirecting to {to}</div>;
    },
    useLocation: () => ({
      pathname: '/protected-page',
      search: '',
      hash: '',
      state: null,
    }),
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders children when user is authenticated', () => {
    renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to login when user is not authenticated', () => {
    renderWithoutAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
    
    expect(mockNavigate).toHaveBeenCalledWith(
      '/login',
      { from: { pathname: '/protected-page', search: '', hash: '', state: null } },
      true
    );
  });

  it('preserves the current location for post-login redirect', async () => {
    // Mock a different location
    const mockUseLocation = vi.fn(() => ({
      pathname: '/dashboard/analytics',
      search: '?tab=overview',
      hash: '#section-1',
      state: { fromApp: true },
    }));

    vi.doMock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        Navigate: ({ to, state, replace }: { to: string; state?: any; replace?: boolean }) => {
          mockNavigate(to, state, replace);
          return <div data-testid="navigate">Redirecting to {to}</div>;
        },
        useLocation: mockUseLocation,
      };
    });

    // Re-import the component to get the new mock
    const { default: ProtectedRouteWithNewMock } = await import('../../components/ProtectedRoute');

    renderWithoutAuth(
      <ProtectedRouteWithNewMock>
        <div>Protected Content</div>
      </ProtectedRouteWithNewMock>
    );

    expect(mockNavigate).toHaveBeenCalledWith(
      '/login',
      { 
        from: { 
          pathname: '/dashboard/analytics',
          search: '?tab=overview',
          hash: '#section-1',
          state: { fromApp: true },
        } 
      },
      true
    );
  });

  it('renders different child components correctly when authenticated', () => {
    const ComplexChild = () => (
      <div>
        <h1>Dashboard</h1>
        <button>Action Button</button>
        <input placeholder="Search..." />
      </div>
    );

    renderWithAuth(
      <ProtectedRoute>
        <ComplexChild />
      </ProtectedRoute>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('handles component switching between authenticated and unauthenticated states', () => {
    // Start authenticated
    const { rerender } = renderWithAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();

    // Switch to unauthenticated
    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // In a real app, the auth context would change, but for testing we'd need
    // to render with different auth state
    renderWithoutAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });

  it('passes through JSX element as children prop correctly', () => {
    const TestComponent = ({ title }: { title: string }) => <div>{title}</div>;

    renderWithAuth(
      <ProtectedRoute>
        <TestComponent title="Test Title" />
      </ProtectedRoute>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('uses replace navigation to avoid back button issues', () => {
    renderWithoutAuth(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    // The third parameter should be true for replace
    expect(mockNavigate).toHaveBeenCalledWith(
      '/login',
      expect.any(Object),
      true
    );
  });
});