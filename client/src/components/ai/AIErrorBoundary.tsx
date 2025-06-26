import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, FileText, Wifi, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/alert';
import { cn } from '../../lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  enableManualFallback?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

// Common AI-related error types
export enum AIErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  UNKNOWN = 'UNKNOWN',
}

interface AIError extends Error {
  type?: AIErrorType;
  statusCode?: number;
  retryable?: boolean;
  suggestedAction?: string;
}

export class AIErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log AI-specific errors with context
    console.error('=== AI ERROR BOUNDARY ===');
    console.error('Error:', error.name, '-', error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Retry Count:', this.state.retryCount);
    console.error('========================');

    // Report to monitoring service if available
    if (window.gtag) {
      window.gtag('event', 'ai_error', {
        event_category: 'AI Integration',
        event_label: error.message,
        value: this.state.retryCount,
      });
    }
  }

  private classifyError(error: Error): AIError {
    const message = error.message.toLowerCase();
    let type = AIErrorType.UNKNOWN;
    let retryable = false;
    let suggestedAction = 'Something unexpected happened with the AI assistant. You can try again or continue creating your lesson manually. Your work is automatically saved.';

    if (message.includes('api key') || message.includes('unauthorized')) {
      type = AIErrorType.API_KEY_MISSING;
      suggestedAction = 'AI features need setup. Ask your school\'s IT admin to configure AI settings, or continue creating your lesson manually. Your work will be saved automatically.';
    } else if (message.includes('rate limit') || message.includes('too many requests')) {
      type = AIErrorType.API_RATE_LIMIT;
      retryable = true;
      suggestedAction = 'AI is busy right now. Try again in a few minutes, or continue working manually. Your progress is saved automatically.';
    } else if (message.includes('timeout') || message.includes('timed out')) {
      type = AIErrorType.TIMEOUT;
      retryable = true;
      suggestedAction = 'AI is taking longer than usual. Check your internet connection and try again, or continue creating your lesson manually.';
    } else if (message.includes('network') || message.includes('fetch')) {
      type = AIErrorType.NETWORK_ERROR;
      retryable = true;
      suggestedAction = 'Connection issue detected. Check your internet connection and try again. You can continue working manually while we resolve this.';
    } else if (message.includes('quota') || message.includes('billing')) {
      type = AIErrorType.QUOTA_EXCEEDED;
      suggestedAction = 'AI usage limit reached for this month. Contact your school\'s IT admin about increasing the limit, or continue creating lessons manually.';
    } else if (message.includes('unavailable') || message.includes('service')) {
      type = AIErrorType.API_UNAVAILABLE;
      retryable = true;
      suggestedAction = 'AI assistant is temporarily down for maintenance. Try again in a few minutes or continue working manually. Your content will be saved.';
    } else if (message.includes('invalid') || message.includes('malformed')) {
      type = AIErrorType.INVALID_RESPONSE;
      suggestedAction = 'AI generated an unexpected response. Please try again or continue creating your lesson manually. Your work is automatically saved.';
    }

    return {
      ...error,
      type,
      retryable,
      suggestedAction,
    } as AIError;
  }

  private handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }));

    // Call external retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }

    // Auto-retry with exponential backoff for retryable errors
    const aiError = this.classifyError(this.state.error!);
    if (aiError.retryable) {
      const delay = Math.pow(2, this.state.retryCount) * 1000; // 1s, 2s, 4s
      this.retryTimeout = setTimeout(() => {
        // Force re-render to trigger retry
        this.forceUpdate();
      }, delay);
    }
  };

  private handleManualFallback = () => {
    // Switch to manual mode - hide AI features
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
    });

    // Store preference to disable AI for this session
    sessionStorage.setItem('ai_disabled', 'true');
    
    // Reload the page to apply changes
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  private getErrorIcon(type: AIErrorType) {
    switch (type) {
      case AIErrorType.API_KEY_MISSING:
        return <Settings className="h-6 w-6" />;
      case AIErrorType.NETWORK_ERROR:
      case AIErrorType.API_UNAVAILABLE:
        return <Wifi className="h-6 w-6" />;
      case AIErrorType.QUOTA_EXCEEDED:
      case AIErrorType.API_RATE_LIMIT:
        return <AlertTriangle className="h-6 w-6" />;
      default:
        return <AlertTriangle className="h-6 w-6" />;
    }
  }

  private getErrorSeverity(type: AIErrorType): 'error' | 'warning' | 'info' {
    switch (type) {
      case AIErrorType.API_KEY_MISSING:
      case AIErrorType.QUOTA_EXCEEDED:
        return 'error';
      case AIErrorType.API_RATE_LIMIT:
      case AIErrorType.TIMEOUT:
        return 'warning';
      default:
        return 'error';
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const aiError = this.classifyError(this.state.error);
      const canRetry = this.state.retryCount < this.maxRetries;
      const severity = this.getErrorSeverity(aiError.type!);

      return (
        <div className="min-h-[200px] flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <Alert className={cn({
              'border-red-200 bg-red-50': severity === 'error',
              'border-yellow-200 bg-yellow-50': severity === 'warning',
              'border-blue-200 bg-blue-50': severity === 'info',
            })}>
              <div className={cn('flex items-start gap-3', {
                'text-red-600': severity === 'error',
                'text-yellow-600': severity === 'warning',
                'text-blue-600': severity === 'info',
              })}>
                {this.getErrorIcon(aiError.type!)}
                <div className="flex-1">
                  <h3 
                    id="ai-error-title"
                    className="font-semibold mb-2"
                  >
                    AI Assistant Unavailable
                  </h3>
                  <AlertDescription 
                    className="mb-4"
                    id="ai-error-description"
                    role="alert"
                    aria-live="polite"
                  >
                    {aiError.suggestedAction}
                  </AlertDescription>

                  {/* Retry Information */}
                  {this.state.retryCount > 0 && (
                    <p className="text-sm text-gray-600 mb-3">
                      Retry attempt {this.state.retryCount} of {this.maxRetries}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div 
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-labelledby="ai-error-title"
                    aria-describedby="ai-error-description"
                  >
                    {canRetry && aiError.retryable && (
                      <Button
                        onClick={this.handleRetry}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        aria-label="Retry AI generation"
                      >
                        <RefreshCw className="h-4 w-4" aria-hidden="true" />
                        Retry
                      </Button>
                    )}

                    {this.props.enableManualFallback && (
                      <Button
                        onClick={this.handleManualFallback}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        aria-label="Continue creating content manually without AI assistance"
                      >
                        <FileText className="h-4 w-4" aria-hidden="true" />
                        Continue Manually
                      </Button>
                    )}

                    {aiError.type === AIErrorType.API_KEY_MISSING && (
                      <Button
                        onClick={() => window.open('/settings', '_blank')}
                        size="sm"
                        className="gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Open Settings
                      </Button>
                    )}
                  </div>

                  {/* Technical Details (Development) */}
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium">
                        Technical Details
                      </summary>
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                        <div><strong>Type:</strong> {aiError.type}</div>
                        <div><strong>Message:</strong> {this.state.error.message}</div>
                        {aiError.statusCode && (
                          <div><strong>Status:</strong> {aiError.statusCode}</div>
                        )}
                        <div><strong>Retryable:</strong> {aiError.retryable ? 'Yes' : 'No'}</div>
                        {this.state.errorInfo && (
                          <details className="mt-2">
                            <summary>Component Stack</summary>
                            <pre className="whitespace-pre-wrap text-xs mt-1">
                              {this.state.errorInfo.componentStack}
                            </pre>
                          </details>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling AI errors in functional components
export function useAIErrorHandler() {
  const handleAIError = (error: unknown, context?: string) => {
    console.error(`AI Error${context ? ` in ${context}` : ''}:`, error);
    
    // Report to monitoring
    if (window.gtag) {
      window.gtag('event', 'ai_error', {
        event_category: 'AI Integration',
        event_label: context || 'Unknown',
        value: 1,
      });
    }
  };

  return { handleAIError };
}

// Utility function to check if an error is AI-related
export function isAIError(error: unknown): error is AIError {
  if (!(error instanceof Error)) return false;
  
  const message = error.message.toLowerCase();
  return (
    message.includes('openai') ||
    message.includes('api key') ||
    message.includes('gpt') ||
    message.includes('ai') ||
    message.includes('model') ||
    message.includes('completion')
  );
}

// Component wrapper for automatic AI error handling
interface WithAIErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  enableManualFallback?: boolean;
}

export function WithAIErrorBoundary({
  children,
  onRetry,
  enableManualFallback = true,
}: WithAIErrorBoundaryProps) {
  return (
    <AIErrorBoundary onRetry={onRetry} enableManualFallback={enableManualFallback}>
      {children}
    </AIErrorBoundary>
  );
}