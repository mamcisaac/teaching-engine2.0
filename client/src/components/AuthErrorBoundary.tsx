import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, LogIn, Wifi, WifiOff } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { authService } from '../services/authService';

interface AuthErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onAuthError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRetrying: boolean;
  retryCount: number;
  connectionStatus: 'online' | 'offline' | 'checking';
}

/**
 * Enhanced error boundary specifically for authentication-related errors
 * Provides intelligent retry mechanisms and user-friendly error messages
 */
export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, AuthErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private connectionCheckInterval: NodeJS.Timeout | null = null;

  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      isRetrying: false,
      retryCount: 0,
      connectionStatus: navigator.onLine ? 'online' : 'offline',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AuthErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onAuthError) {
      this.props.onAuthError(error, errorInfo);
    }

    // Start monitoring connection status
    this.startConnectionMonitoring();

    // Auto-retry for certain types of errors
    if (this.isRetryableError(error)) {
      this.scheduleRetry();
    }
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    // Cleanup
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    if (this.connectionCheckInterval) {
      clearInterval(this.connectionCheckInterval);
    }

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  private handleOnline = () => {
    this.setState({ connectionStatus: 'online' });

    // If we were offline and now we're online, try to recover
    if (this.state.hasError && this.isNetworkError(this.state.error)) {
      this.handleRetryAuth();
    }
  };

  private handleOffline = () => {
    this.setState({ connectionStatus: 'offline' });
  };

  private startConnectionMonitoring() {
    this.connectionCheckInterval = setInterval(() => {
      this.setState({
        connectionStatus: navigator.onLine ? 'online' : 'offline',
      });
    }, 5000);
  }

  private isRetryableError(error?: Error): boolean {
    if (!error) return false;

    const message = error.message.toLowerCase();
    const retryableMessages = [
      'network error',
      'fetch',
      'connection',
      'timeout',
      'auth check failed',
      'token refresh failed',
    ];

    return retryableMessages.some((msg) => message.includes(msg));
  }

  private isNetworkError(error?: Error): boolean {
    if (!error) return false;

    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection') ||
      message.includes('timeout')
    );
  }

  private isAuthError(error?: Error): boolean {
    if (!error) return false;

    const message = error.message.toLowerCase();
    return (
      message.includes('auth') ||
      message.includes('token') ||
      message.includes('unauthorized') ||
      message.includes('401')
    );
  }

  private scheduleRetry() {
    if (this.state.retryCount >= 3) return;

    const delay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);

    this.retryTimeout = setTimeout(() => {
      this.handleRetryAuth();
    }, delay);
  }

  private handleRetryAuth = async () => {
    this.setState({ isRetrying: true });

    try {
      // Try to refresh the auth state
      const userData = await authService.verifyAuth();

      if (userData) {
        // Success! Reset the error state
        this.setState({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          isRetrying: false,
          retryCount: 0,
        });
      } else {
        throw new Error('Authentication verification failed');
      }
    } catch (error) {
      console.error('Auth retry failed:', error);

      this.setState({
        isRetrying: false,
        retryCount: this.state.retryCount + 1,
      });

      // Schedule another retry if we haven't exceeded the limit
      if (this.state.retryCount < 2) {
        this.scheduleRetry();
      }
    }
  };

  private handleManualRetry = () => {
    this.setState({ retryCount: 0 });
    this.handleRetryAuth();
  };

  private handleLoginRedirect = () => {
    // Clear any stored auth data and redirect to login
    authService.clearTokens();
    window.location.href = '/login';
  };

  private getErrorTitle(): string {
    if (this.state.connectionStatus === 'offline') {
      return 'Connection Lost';
    }

    if (this.isAuthError(this.state.error)) {
      return 'Authentication Issue';
    }

    if (this.isNetworkError(this.state.error)) {
      return 'Connection Problem';
    }

    return 'Application Error';
  }

  private getErrorDescription(): string {
    if (this.state.connectionStatus === 'offline') {
      return 'Your device is offline. Please check your internet connection.';
    }

    if (this.isAuthError(this.state.error)) {
      return 'There was an issue with your authentication. You may need to log in again.';
    }

    if (this.isNetworkError(this.state.error)) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    return 'An unexpected error occurred. Please try again.';
  }

  private getErrorIcon() {
    if (this.state.connectionStatus === 'offline') {
      return <WifiOff className="h-5 w-5 text-red-500" />;
    }

    if (this.state.connectionStatus === 'checking') {
      return <Wifi className="h-5 w-5 text-yellow-500 animate-pulse" />;
    }

    return <AlertCircle className="h-5 w-5 text-red-500" />;
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const showRetryButton = this.isRetryableError(this.state.error) && this.state.retryCount < 3;
      const showLoginButton = this.isAuthError(this.state.error) || this.state.retryCount >= 3;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                {this.getErrorIcon()}
                <CardTitle>{this.getErrorTitle()}</CardTitle>
              </div>
              <CardDescription>{this.getErrorDescription()}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.connectionStatus === 'offline' && (
                <Alert>
                  <WifiOff className="h-4 w-4" />
                  <AlertTitle>Offline Mode</AlertTitle>
                  <AlertDescription>
                    Some features may not be available while offline. Connection will be restored
                    automatically when back online.
                  </AlertDescription>
                </Alert>
              )}

              {this.state.isRetrying && (
                <Alert>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <AlertTitle>Reconnecting...</AlertTitle>
                  <AlertDescription>
                    Attempting to restore your session. Please wait.
                  </AlertDescription>
                </Alert>
              )}

              {this.state.retryCount > 0 && this.state.retryCount < 3 && (
                <Alert variant="destructive">
                  <AlertTitle>Retry Attempt {this.state.retryCount}</AlertTitle>
                  <AlertDescription>Previous attempts failed. Trying again...</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-2">
                {showRetryButton && (
                  <Button onClick={this.handleManualRetry} disabled={this.state.isRetrying}>
                    <RefreshCw
                      className={`h-4 w-4 mr-2 ${this.state.isRetrying ? 'animate-spin' : ''}`}
                    />
                    {this.state.isRetrying ? 'Retrying...' : 'Try Again'}
                  </Button>
                )}

                {showLoginButton && (
                  <Button onClick={this.handleLoginRedirect} variant="outline">
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In Again
                  </Button>
                )}

                <Button onClick={() => window.location.reload()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 bg-gray-100 p-4 rounded-md">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                    {this.state.errorInfo &&
                      '\n\nComponent Stack:\n' + this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenient wrapper for app-level auth error handling
export const AppAuthErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AuthErrorBoundary
    onAuthError={(error, errorInfo) => {
      // Log to error reporting service in production
      if (process.env.NODE_ENV === 'production') {
        console.error('App-level auth error:', error, errorInfo);
        // TODO: Send to error reporting service
      }
    }}
  >
    {children}
  </AuthErrorBoundary>
);

export default AuthErrorBoundary;
