/**
 * @file LoginPage.test.tsx
 * @description Comprehensive tests for LoginPage component including form validation,
 * submission handling, error states, and loading states.
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import LoginPage from '../LoginPage';
import { renderWithProviders, createMockUser, setupTest } from '@/test-utils';
import * as api from '@/api';

// Mock the API module
vi.mock('@/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    setupTest();
    mockNavigate.mockClear();
    vi.mocked(api.api.post).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form with all required elements', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByRole('heading', { name: /sign in to your account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should have proper form attributes', () => {
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });

    it('should not show error message initially', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    it('should update email input value', async () => {
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password input value', async () => {
      renderWithProviders(<LoginPage />);

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should handle clearing and retyping inputs', async () => {
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      
      await user.type(emailInput, 'test@example.com');
      expect(emailInput).toHaveValue('test@example.com');

      await user.clear(emailInput);
      expect(emailInput).toHaveValue('');

      await user.type(emailInput, 'new@example.com');
      expect(emailInput).toHaveValue('new@example.com');
    });
  });

  describe('Form Submission', () => {
    it('should submit form with correct data on successful login', async () => {
      const mockUser = createMockUser();
      const mockAuthContext = {
        login: vi.fn(),
        user: null,
        logout: vi.fn(),
        isAuthenticated: false,
        checkAuth: vi.fn(),
        getToken: vi.fn(),
        setToken: vi.fn(),
      };

      vi.mocked(api.api.post).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      renderWithProviders(<LoginPage />, {
        initialAuthState: mockAuthContext,
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(api.api.post).toHaveBeenCalledWith('/api/login', {
        email: 'test@example.com',
        password: 'password123',
      });

      await waitFor(() => {
        expect(mockAuthContext.login).toHaveBeenCalledWith(mockUser);
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle form submission with Enter key', async () => {
      const mockUser = createMockUser();
      const mockAuthContext = {
        login: vi.fn(),
        user: null,
        logout: vi.fn(),
        isAuthenticated: false,
        checkAuth: vi.fn(),
        getToken: vi.fn(),
        setToken: vi.fn(),
      };

      vi.mocked(api.api.post).mockResolvedValueOnce({
        data: { user: mockUser },
      });

      renderWithProviders(<LoginPage />, {
        initialAuthState: mockAuthContext,
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.keyboard('{Enter}');

      expect(api.api.post).toHaveBeenCalledWith('/api/login', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should prevent empty form submission', async () => {
      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      expect(api.api.post).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should show loading state during form submission', async () => {
      let resolveApiCall: (value: any) => void;
      const apiPromise = new Promise(resolve => {
        resolveApiCall = resolve;
      });

      vi.mocked(api.api.post).mockReturnValueOnce(apiPromise);

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText(/signing in\.\.\./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in\.\.\./i })).toBeDisabled();
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();

      // Resolve the API call
      resolveApiCall!({ data: { user: createMockUser() } });

      await waitFor(() => {
        expect(screen.queryByText(/signing in\.\.\./i)).not.toBeInTheDocument();
      });
    });

    it('should prevent multiple submissions during loading', async () => {
      let resolveApiCall: (value: any) => void;
      const apiPromise = new Promise(resolve => {
        resolveApiCall = resolve;
      });

      vi.mocked(api.api.post).mockReturnValueOnce(apiPromise);

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      // Click multiple times rapidly
      await user.click(submitButton);
      await user.click(submitButton);
      await user.click(submitButton);

      // Should only make one API call
      expect(api.api.post).toHaveBeenCalledTimes(1);

      // Resolve the API call
      resolveApiCall!({ data: { user: createMockUser() } });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on login failure', async () => {
      const errorMessage = 'Invalid credentials';
      vi.mocked(api.api.post).mockRejectedValueOnce({
        response: { data: { error: errorMessage } },
      });

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Error should appear in both locations
      const errorElements = screen.getAllByText(errorMessage);
      expect(errorElements).toHaveLength(2);
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error');
      vi.mocked(api.api.post).mockRejectedValueOnce(networkError);

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      });
    });

    it('should handle server error without error message', async () => {
      vi.mocked(api.api.post).mockRejectedValueOnce({
        response: { status: 500 },
      });

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('should handle invalid server response', async () => {
      vi.mocked(api.api.post).mockResolvedValueOnce({
        data: {}, // Missing user property
      });

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid response from server')).toBeInTheDocument();
      });
    });

    it('should clear error message after 5 seconds', async () => {
      vi.useFakeTimers();

      const errorMessage = 'Invalid credentials';
      vi.mocked(api.api.post).mockRejectedValueOnce({
        response: { data: { error: errorMessage } },
      });

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Fast forward 5 seconds
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('should clear previous error on new submission', async () => {
      const firstError = 'First error';
      const secondError = 'Second error';

      vi.mocked(api.api.post)
        .mockRejectedValueOnce({
          response: { data: { error: firstError } },
        })
        .mockRejectedValueOnce({
          response: { data: { error: secondError } },
        });

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(firstError)).toBeInTheDocument();
      });

      // Submit again
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(firstError)).not.toBeInTheDocument();
        expect(screen.getByText(secondError)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
    });

    it('should be keyboard navigable', async () => {
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Tab navigation
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Console Error Handling', () => {
    it('should log errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');

      vi.mocked(api.api.post).mockRejectedValueOnce(error);

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Login error:', error);
      });

      consoleSpy.mockRestore();
    });
  });
});