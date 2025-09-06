/**
 * Error Boundary for Lesson Completion Components
 * Prevents completion checkbox errors from crashing the entire page
 */

import { AlertTriangle } from 'lucide-react';
import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class LessonCompletionErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lesson completion error:', error, errorInfo);
    
    // In production, you might want to log this to an error service
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-red-200 bg-red-50">
          <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
          <span className="sr-only">Completion status unavailable</span>
        </div>
      );
    }

    return this.props.children;
  }
}

