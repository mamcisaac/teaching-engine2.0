/**
 * Error Boundary for Planning Cascade
 * Graceful error handling with fallback UI
 */

import { AlertTriangle, RefreshCw } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class PlanningErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Planning Cascade Error:', error, errorInfo);
    
    // In production, report to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { contexts: { errorInfo } });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4 text-red-600">
              <AlertTriangle className="w-8 h-8 mr-3" />
              <h1 className="text-xl font-semibold">Planning System Error</h1>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Something went wrong with the planning cascade view. This shouldn&apos;t happen during your teaching day!
              </p>
              
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium text-gray-800">Quick solutions:</p>
                <ul className="mt-1 text-gray-600 space-y-1">
                  <li>• Try refreshing the page</li>
                  <li>• Check your internet connection</li>
                  <li>• Clear your browser cache</li>
                </ul>
              </div>
            </div>

            {this.state.error && (
              <details className="mb-4">
                <summary className="cursor-pointer text-sm text-gray-600">
                  Technical details (for IT support)
                </summary>
                <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                  {this.state.error.message}
                </div>
              </details>
            )}

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}