import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring service
    console.error('Planning Cascade View error:', error, errorInfo);
    
    // Clear potentially corrupt localStorage on memory errors
    if (error.message?.toLowerCase().includes('memory') || 
        error.message?.toLowerCase().includes('maximum call stack')) {
      try {
        localStorage.removeItem('cascade-expanded');
      } catch (e) {
        // Ignore localStorage errors
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      const { error } = this.state;
      
      return (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Something went wrong</p>
              <p className="text-sm mb-3">
                {error?.message || 'An unexpected error occurred'}
              </p>
              
              <Button
                size="sm"
                variant="outline"
                onClick={this.handleReset}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Try Again
              </Button>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="text-xs cursor-pointer text-gray-600">
                    Error Stack
                  </summary>
                  <pre className="text-xs mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-40">
                    {error?.stack}
                  </pre>
                </details>
              )}
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}