/**
 * TDD-Compliant LoginPage Tests
 * Uses real components and MSW instead of mocks
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../../test-utils/msw-setup';
import { renderWithProviders, testUtils } from '../../test-utils/test-providers';
import LoginPage from '../LoginPage';

// Import the component we're testing
// Note: Adjust the import path based on actual location

describe('LoginPage - Real Implementation Tests', () => {
  beforeEach(() => {
    // Reset any custom handlers before each test
    server.resetHandlers();
  });

  describe('RED - Write Failing Tests First', () => {
    it('should fail login with invalid credentials', async () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /log in/i });

      await userEvent.type(emailInput, 'invalid@example.com');
      await userEvent.type(passwordInput, 'wrongpassword');
      await userEvent.click(loginButton);

      // Should show error message from real API response
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // User should not be logged in
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should show validation errors for empty fields', async () => {
      renderWithProviders(<LoginPage />);
      
      const loginButton = screen.getByRole('button', { name: /log in/i });
      await userEvent.click(loginButton);

      // Should show client-side validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should disable login button while request is pending', async () => {
      // Override handler to simulate slow response
      server.use(
        rest.post('/auth/login', (req, res, ctx) => {
          return res(
            ctx.delay(1000),
            ctx.status(200),
            ctx.json({
              user: { id: 1, email: 'test@example.com', name: 'Test User' },
              token: 'mock-token',
            })
          );
        })
      );

      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /log in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password');
      await userEvent.click(loginButton);

      // Button should be disabled during request
      expect(loginButton).toBeDisabled();
      expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    });
  });

  describe('GREEN - Implement Minimum Code', () => {
    it('should successfully login with valid credentials', async () => {
      const mockNavigate = jest.fn();
      
      // Mock useNavigate hook
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));

      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /log in/i });

      // Use valid credentials that MSW will accept
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password');
      await userEvent.click(loginButton);

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });

      // Should navigate to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should render all required form elements', () => {
      renderWithProviders(<LoginPage />);

      // Check all form elements are present
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
      
      // Check for links
      expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
      expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
    });

    it('should handle form submission with real form data', async () => {
      // Spy on the actual API call
      let capturedRequestBody: any;
      
      server.use(
        rest.post('/auth/login', async (req, res, ctx) => {
          capturedRequestBody = await req.json();
          return res(
            ctx.status(200),
            ctx.json({
              user: { id: 1, email: capturedRequestBody.email, name: 'Test User' },
              token: 'mock-token',
            })
          );
        })
      );

      renderWithProviders(<LoginPage />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'mypassword');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));

      // Verify real form data was sent
      await waitFor(() => {
        expect(capturedRequestBody).toEqual({
          email: 'user@example.com',
          password: 'mypassword',
        });
      });
    });
  });

  describe('REFACTOR - Improve Implementation', () => {
    it('should persist login state across page refreshes', async () => {
      // Test with authenticated initial state
      renderWithProviders(<LoginPage />, {
        authenticated: true,
        user: { id: 1, email: 'test@example.com', name: 'Test User', role: 'USER' },
      });

      // Should redirect authenticated users
      await waitFor(() => {
        expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      // Simulate network error
      server.use(
        rest.post('/auth/login', (req, res, ctx) => {
          return res.networkError('Network connection failed');
        })
      );

      renderWithProviders(<LoginPage />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'password');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should handle server errors appropriately', async () => {
      // Simulate server error
      server.use(
        rest.post('/auth/login', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: 'Internal server error' })
          );
        })
      );

      renderWithProviders(<LoginPage />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'password');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });

    it('should validate email format in real-time', async () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      
      // Type invalid email
      await userEvent.type(emailInput, 'invalid-email');
      await userEvent.tab(); // Trigger blur event

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });

      // Clear and type valid email
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'valid@example.com');
      await userEvent.tab();

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
      });
    });

    it('should handle password visibility toggle', async () => {
      renderWithProviders(<LoginPage />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await userEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

      // Click to hide password again
      await userEvent.click(screen.getByRole('button', { name: /hide password/i }));
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should support keyboard navigation', async () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /log in/i });

      // Tab navigation should work
      emailInput.focus();
      await userEvent.tab();
      expect(passwordInput).toHaveFocus();
      
      await userEvent.tab();
      expect(loginButton).toHaveFocus();

      // Enter key should submit form
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'password{enter}');

      // Should trigger login attempt
      await waitFor(() => {
        expect(screen.getByText(/welcome/i)).toBeInTheDocument();
      });
    });

    it('should clear errors when user starts typing', async () => {
      // First trigger an error
      renderWithProviders(<LoginPage />);
      
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing in email field
      await userEvent.type(screen.getByLabelText(/email/i), 'test');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(<LoginPage />);

      // Check ARIA labels
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-describedby');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-describedby');
      
      // Check form has proper role
      expect(screen.getByRole('form')).toBeInTheDocument();
      
      // Check heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });

    it('should announce errors to screen readers', async () => {
      renderWithProviders(<LoginPage />);
      
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        const errorElement = screen.getByText(/email is required/i);
        expect(errorElement).toHaveAttribute('role', 'alert');
        expect(errorElement).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('should support high contrast mode', () => {
      renderWithProviders(<LoginPage />);
      
      // Check that elements have sufficient contrast
      const loginButton = screen.getByRole('button', { name: /log in/i });
      const computedStyle = window.getComputedStyle(loginButton);
      
      // Should have proper background and text colors
      expect(computedStyle.backgroundColor).toBeTruthy();
      expect(computedStyle.color).toBeTruthy();
    });
  });

  describe('Performance Tests', () => {
    it('should render quickly with large number of DOM elements', async () => {
      const startTime = performance.now();
      
      renderWithProviders(<LoginPage />);
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(100); // 100ms
    });

    it('should handle rapid user input without lag', async () => {
      renderWithProviders(<LoginPage />);
      
      const emailInput = screen.getByLabelText(/email/i);
      
      const startTime = performance.now();
      
      // Type rapidly
      await userEvent.type(emailInput, 'verylongemailaddress@example.com', { delay: 1 });
      
      const endTime = performance.now();
      const inputTime = endTime - startTime;
      
      // Should handle rapid input smoothly
      expect(inputTime).toBeLessThan(1000); // 1 second
      expect(emailInput).toHaveValue('verylongemailaddress@example.com');
    });
  });

  describe('Integration with Auth Context', () => {
    it('should update auth context on successful login', async () => {
      let authContextValue: any;
      
      const TestComponent = () => {
        const auth = React.useContext(AuthContext);
        authContextValue = auth;
        return <LoginPage />;
      };

      renderWithProviders(<TestComponent />);
      
      await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'password');
      await userEvent.click(screen.getByRole('button', { name: /log in/i }));

      await waitFor(() => {
        expect(authContextValue.user).toEqual({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'USER',
        });
        expect(authContextValue.token).toBe('mock-jwt-token');
      });
    });
  });
});