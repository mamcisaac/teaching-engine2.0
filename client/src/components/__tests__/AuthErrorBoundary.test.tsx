import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthErrorBoundary, AppAuthErrorBoundary } from '../AuthErrorBoundary';
import { authService } from '../../services/authService';
import { errorReportingService } from '../../services/errorReportingService';
import logger from '../../utils/logger';

// Mock dependencies
jest.mock('../../services/authService');
jest.mock('../../services/errorReportingService');
jest.mock('../../utils/logger');

// Component that throws an error
const ThrowError: React.FC<{ error: Error }> = ({ error }) => {
  throw error;
};

// Component that renders normally
const NormalComponent: React.FC = () => <div>Normal content</div>;

describe('AuthErrorBoundary', () => {
  const mockError = new Error('Test error');
  const mockAuthError = new Error('Authentication failed');
  const mockNetworkError = new Error('Network error occurred');
  const mockTimeoutError = new Error('Connection timeout');
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    // Mock authService
    (authService.verifyAuth as jest.Mock).mockResolvedValue({ id: '1', name: 'Test User' });
    (authService.clearTokens as jest.Mock).mockImplementation(() => {});
    
    // Mock window.location
    delete (window as Window & { location: Location }).location;
    window.location = { href: '', reload: jest.fn() } as unknown as Location;
    
    // Mock logger
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Error Handling', () => {
    it('should render children when there is no error', () => {
      render(
        <AuthErrorBoundary>
          <NormalComponent />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('should catch and display error when child component throws', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockError} />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      expect(logger.error).toHaveBeenCalledWith('AuthErrorBoundary caught an error:', mockError, expect.any(Object));
      
      consoleSpy.mockRestore();
    });

    it('should display custom fallback when provided', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const fallback = <div>Custom error UI</div>;
      
      render(
        <AuthErrorBoundary fallback={fallback}>
          <ThrowError error={mockError} />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Custom error UI')).toBeInTheDocument();
      expect(screen.queryByText('Application Error')).not.toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should call onAuthError callback when error occurs', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const onAuthError = jest.fn();
      
      render(
        <AuthErrorBoundary onAuthError={onAuthError}>
          <ThrowError error={mockError} />
        </AuthErrorBoundary>
      );
      
      expect(onAuthError).toHaveBeenCalledWith(mockError, expect.any(Object));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error Type Detection', () => {
    it('should display auth-specific UI for authentication errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockAuthError} />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Authentication Issue')).toBeInTheDocument();
      expect(screen.getByText('There was an issue with your authentication. You may need to log in again.')).toBeInTheDocument();
      expect(screen.getByText('Log In Again')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should display network-specific UI for network errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockNetworkError} />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      expect(screen.getByText('Unable to connect to the server. Please check your internet connection.')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should detect various auth-related error messages', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const authErrors = [
        new Error('token expired'),
        new Error('unauthorized access'),
        new Error('401 Unauthorized'),
        new Error('Auth check failed')
      ];

      authErrors.forEach(error => {
        const { unmount } = render(
          <AuthErrorBoundary>
            <ThrowError error={error} />
          </AuthErrorBoundary>
        );
        
        expect(screen.getByText('Authentication Issue')).toBeInTheDocument();
        unmount();
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('Offline/Online Handling', () => {
    it('should display offline UI when navigator.onLine is false', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockNetworkError} />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Connection Lost')).toBeInTheDocument();
      expect(screen.getByText('Your device is offline. Please check your internet connection.')).toBeInTheDocument();
      expect(screen.getByText('Offline Mode')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should handle online event and retry for network errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockNetworkError} />
        </AuthErrorBoundary>
      );
      
      // Simulate going back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });
      window.dispatchEvent(new Event('online'));
      
      await waitFor(() => {
        expect(authService.verifyAuth).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle offline event', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { rerender } = render(
        <AuthErrorBoundary>
          <NormalComponent />
        </AuthErrorBoundary>
      );
      
      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });
      window.dispatchEvent(new Event('offline'));
      
      // Trigger an error while offline
      rerender(
        <AuthErrorBoundary>
          <ThrowError error={mockNetworkError} />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Connection Lost')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Retry Mechanism', () => {
    it('should auto-retry for retryable errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockTimeoutError} />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      
      // Fast-forward timer to trigger auto-retry
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(authService.verifyAuth).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });

    it('should show retry progress', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (authService.verifyAuth as jest.Mock).mockRejectedValueOnce(new Error('Still failing'));
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockTimeoutError} />
        </AuthErrorBoundary>
      );
      
      // Fast-forward to trigger retry
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
      });
      
      consoleSpy.mockRestore();
    });

    it('should limit retry attempts to 3', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (authService.verifyAuth as jest.Mock).mockRejectedValue(new Error('Persistent failure'));
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockTimeoutError} />
        </AuthErrorBoundary>
      );
      
      // Trigger multiple retries
      for (let i = 0; i < 4; i++) {
        jest.advanceTimersByTime(10000);
        await waitFor(() => {});
      }
      
      expect(authService.verifyAuth).toHaveBeenCalledTimes(3);
      
      consoleSpy.mockRestore();
    });

    it('should successfully recover on retry', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const { rerender } = render(
        <AuthErrorBoundary>
          <ThrowError error={mockTimeoutError} />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Connection Problem')).toBeInTheDocument();
      
      // Fast-forward to trigger retry
      jest.advanceTimersByTime(1000);
      
      await waitFor(() => {
        expect(authService.verifyAuth).toHaveBeenCalled();
      });
      
      // After successful retry, error boundary should reset
      rerender(
        <AuthErrorBoundary>
          <NormalComponent />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Normal content')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Manual Actions', () => {
    it('should handle manual retry', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockTimeoutError} />
        </AuthErrorBoundary>
      );
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Retrying...')).toBeInTheDocument();
        expect(authService.verifyAuth).toHaveBeenCalled();
      });
      
      consoleSpy.mockRestore();
    });

    it('should handle login redirect', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockAuthError} />
        </AuthErrorBoundary>
      );
      
      const loginButton = screen.getByText('Log In Again');
      fireEvent.click(loginButton);
      
      expect(authService.clearTokens).toHaveBeenCalled();
      expect(window.location.href).toBe('/login');
      
      consoleSpy.mockRestore();
    });

    it('should handle page refresh', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockError} />
        </AuthErrorBoundary>
      );
      
      const refreshButton = screen.getByText('Refresh Page');
      fireEvent.click(refreshButton);
      
      expect(window.location.reload).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Development Mode', () => {
    it('should show error details in development mode', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const errorWithStack = new Error('Test error with stack');
      errorWithStack.stack = 'Error: Test error with stack\n    at TestComponent';
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={errorWithStack} />
        </AuthErrorBoundary>
      );
      
      expect(screen.getByText('Error Details (Development)')).toBeInTheDocument();
      
      // Click to expand details
      const summary = screen.getByText('Error Details (Development)');
      fireEvent.click(summary);
      
      expect(screen.getByText(/Test error with stack/)).toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });

    it('should not show error details in production mode', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      render(
        <AuthErrorBoundary>
          <ThrowError error={mockError} />
        </AuthErrorBoundary>
      );
      
      expect(screen.queryByText('Error Details (Development)')).not.toBeInTheDocument();
      
      process.env.NODE_ENV = originalEnv;
      consoleSpy.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should cleanup timers and event listeners on unmount', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(
        <AuthErrorBoundary>
          <ThrowError error={mockTimeoutError} />
        </AuthErrorBoundary>
      );
      
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function));
      
      consoleSpy.mockRestore();
    });
  });

  describe('AppAuthErrorBoundary', () => {
    it('should wrap children with AuthErrorBoundary and report app-level errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AppAuthErrorBoundary>
          <ThrowError error={mockError} />
        </AppAuthErrorBoundary>
      );
      
      expect(errorReportingService.captureError).toHaveBeenCalledWith(
        mockError,
        expect.objectContaining({
          component: 'AppAuthErrorBoundary',
          appLevel: true
        }),
        expect.any(Object)
      );
      
      consoleSpy.mockRestore();
    });
  });
});