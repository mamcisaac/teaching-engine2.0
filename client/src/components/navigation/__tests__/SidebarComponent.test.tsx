import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { SidebarComponent } from '../SidebarComponent';
import { AuthContext } from '../../../contexts/AuthContext';
import { NavigationProvider } from '../NavigationProvider';

const mockLogout = vi.fn().mockResolvedValue(undefined);
const mockAuthContextValue = {
  user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'teacher' as const },
  login: vi.fn(),
  logout: mockLogout,
  isAuthenticated: true,
  isLoading: false,
  isInitialized: true,
  checkAuth: vi.fn(),
  getToken: () => 'token',
  refreshToken: vi.fn(),
  error: null,
  clearError: vi.fn(),
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <AuthContext.Provider value={mockAuthContextValue}>
      <NavigationProvider>
        {ui}
      </NavigationProvider>
    </AuthContext.Provider>
  );
};

describe('SidebarComponent', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar component', () => {
    renderWithProviders(<SidebarComponent />);
    
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
    expect(screen.getByTestId('main-sidebar')).toBeInTheDocument();
  });

  it('handles logout click without floating promise error', async () => {
    renderWithProviders(<SidebarComponent />);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    
    // Click logout button
    await user.click(logoutButton);
    
    // Verify logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1);
    
    // Ensure the promise is properly handled (no unhandled promise rejection)
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('handles logout errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockLogout.mockRejectedValueOnce(new Error('Logout failed'));
    
    renderWithProviders(<SidebarComponent />);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    
    // Click logout button
    await user.click(logoutButton);
    
    // Wait for the promise to settle
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
    
    // No error should be thrown to the user (error handled internally)
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    consoleErrorSpy.mockRestore();
  });

  it('does not block UI during logout', async () => {
    // Mock logout with a delay
    mockLogout.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderWithProviders(<SidebarComponent />);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    
    // Click logout button
    await user.click(logoutButton);
    
    // Button should still be clickable (not disabled)
    expect(logoutButton).not.toBeDisabled();
    
    // Wait for logout to complete
    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});