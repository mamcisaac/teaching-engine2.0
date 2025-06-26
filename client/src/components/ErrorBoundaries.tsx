import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  errorTitle?: string;
  errorDescription?: string;
  showDetails?: boolean;
  allowRetry?: boolean;
  allowHome?: boolean;
  supportEmail?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

// Base Error Boundary with customizable options
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service (e.g., Sentry)
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: this.state.retryCount + 1 
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { 
        errorTitle = 'Something went wrong', 
        errorDescription = 'An unexpected error occurred. Please try again.',
        showDetails = process.env.NODE_ENV === 'development',
        allowRetry = true,
        allowHome = true,
        supportEmail
      } = this.props;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle>{errorTitle}</CardTitle>
              </div>
              <CardDescription>{errorDescription}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {this.state.retryCount > 2 && (
                <Alert variant="destructive">
                  <AlertTitle>Multiple Errors</AlertTitle>
                  <AlertDescription>
                    This error has occurred multiple times. Please refresh the page or contact support.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-wrap gap-2">
                {allowRetry && (
                  <Button onClick={this.handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                {allowHome && (
                  <Button onClick={() => window.location.href = '/'} variant="outline">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                )}
                
                {supportEmail && (
                  <Button 
                    onClick={() => window.location.href = `mailto:${supportEmail}?subject=Error Report`} 
                    variant="outline"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                )}
              </div>

              {showDetails && this.state.error && (
                <details className="mt-4 bg-gray-100 p-4 rounded-md">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                    {this.state.errorInfo && '\n\nComponent Stack:\n' + this.state.errorInfo.componentStack}
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

// Feature-specific error boundaries
export const PlanningErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    errorTitle="Planning Error"
    errorDescription="There was an issue with the planning feature. Your data is safe."
    allowRetry={true}
    allowHome={true}
  >
    {children}
  </ErrorBoundary>
);

export const FormErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    errorTitle="Form Error"
    errorDescription="There was an issue with the form. Your data has not been lost."
    allowRetry={true}
    showDetails={true}
  >
    {children}
  </ErrorBoundary>
);

export const AIErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    errorTitle="AI Assistant Error"
    errorDescription="The AI assistant encountered an issue. You can continue without AI suggestions."
    allowRetry={true}
    fallback={
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>AI Temporarily Unavailable</AlertTitle>
        <AlertDescription>
          The AI assistant is temporarily unavailable. You can continue creating your plans manually.
        </AlertDescription>
      </Alert>
    }
  >
    {children}
  </ErrorBoundary>
);

// Global error boundary wrapper
export const GlobalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    errorTitle="Application Error"
    errorDescription="Something went wrong with the application. Don't worry, your data is safe."
    allowRetry={true}
    allowHome={true}
    supportEmail="support@teachingengine.com"
    onError={(error, errorInfo) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Global Error:', error);
        console.error('Error Info:', errorInfo);
      }
    }}
  >
    {children}
  </ErrorBoundary>
);