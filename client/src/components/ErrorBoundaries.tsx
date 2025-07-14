import { AlertCircle, RefreshCw, Home, Mail } from 'lucide-react';
import type { ReactNode, ErrorInfo } from 'react';
import React, { Component } from 'react';

import { errorReportingService } from '../services/errorReportingService';
import { logger } from '../utils/logger';

import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError !== undefined) {
      this.props.onError(error, errorInfo);
    }
    
    // Send to error reporting service
    errorReportingService.captureError(error, {
      component: 'ErrorBoundary',
      errorBoundaryProps: {
        errorTitle: this.props.errorTitle,
        errorDescription: this.props.errorDescription,
      },
      retryCount: this.state.retryCount,
    }, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: this.state.retryCount + 1 
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
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
              {this.state.retryCount > 2 ? (
                <Alert variant="destructive">
                  <AlertTitle>Multiple Errors</AlertTitle>
                  <AlertDescription>
                    This error has occurred multiple times. Please refresh the page or contact support.
                  </AlertDescription>
                </Alert>
              ) : null}
              
              <div className="flex flex-wrap gap-2">
                {allowRetry ? (
                  <Button aria-label="Click button" onClick={this.handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                ) : null}
                
                {allowHome ? (
                  <Button aria-label="Click button" onClick={(): void => {
                    window.location.href = '/';
                  }}>
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                ) : null}
                
                {supportEmail !== undefined && supportEmail !== '' ? (
                  <Button 
                    variant="outline"
                    onClick={(): void => {
                      window.location.href = `mailto:${supportEmail}?subject=Error Report`;
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                ) : null}
              </div>

              {showDetails && this.state.error !== undefined ? (
                <details className="mt-4 bg-gray-100 p-4 rounded-md">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2">
                    <div className="text-xs text-gray-600">
                      {this.state.error instanceof Error ? this.state.error.message : String(this.state.error)}
                    </div>
                    {this.state.error instanceof Error && this.state.error.stack !== undefined && this.state.error.stack !== '' ? (
                      <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    ) : null}
                    {this.state.errorInfo !== undefined && this.state.errorInfo.componentStack !== undefined && this.state.errorInfo.componentStack !== '' ? (
                      <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                        Component Stack:
{this.state.errorInfo.componentStack}
                      </pre>
                    ) : null}
                  </div>
                </details>
              ) : null}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Feature-specific error boundaries
export const PlanningErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }): React.ReactElement => (
  <ErrorBoundary
    allowHome
    allowRetry
    errorDescription="There was an issue with the planning feature. Your data is safe."
    errorTitle="Planning Error"
  >
    {children}
  </ErrorBoundary>
);

export const FormErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }): React.ReactElement => (
  <ErrorBoundary
    allowRetry
    showDetails
    errorDescription="There was an issue with the form. Your data has not been lost."
    errorTitle="Form Error"
  >
    {children}
  </ErrorBoundary>
);

export const AIErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }): React.ReactElement => (
  <ErrorBoundary
    allowRetry
    errorDescription="The AI assistant encountered an issue. You can continue without AI suggestions."
    errorTitle="AI Assistant Error"
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
export const GlobalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }): React.ReactElement => (
  <ErrorBoundary
    allowHome
    allowRetry
    errorDescription="Something went wrong with the application. Don't worry, your data is safe."
    errorTitle="Application Error"
    onError={(error, errorInfo): void => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        logger.error('Global Error:', error);
        logger.error('Error Info:', errorInfo);
      }
      
      // Report global errors with additional context
      errorReportingService.captureError(error, {
        component: 'GlobalErrorBoundary',
        global: true,
      }, errorInfo);
    }}
  >
    {children}
  </ErrorBoundary>
);

// Create alias for backward compatibility
const ErrorBoundaries = ErrorBoundary;

// Named exports for all error boundaries
export { ErrorBoundary, ErrorBoundaries };