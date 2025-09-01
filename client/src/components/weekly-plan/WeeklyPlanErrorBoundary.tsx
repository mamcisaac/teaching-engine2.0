import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Alert, AlertDescription } from '../ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
  lastErrorTime: number | null;
}

export class WeeklyPlanErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
      lastErrorTime: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const now = Date.now();
    return {
      hasError: true,
      error,
      lastErrorTime: now
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to error reporting service
    console.error('WeeklyPlanErrorBoundary caught error:', error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Update error count
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Store error details in sessionStorage for debugging
    try {
      sessionStorage.setItem('weekly-plan-last-error', JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      // Ignore storage errors
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleDownloadErrorReport = () => {
    const errorReport = {
      error: {
        message: this.state.error?.message,
        stack: this.state.error?.stack
      },
      errorInfo: this.state.errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorCount: this.state.errorCount
    };
    
    const blob = new Blob([JSON.stringify(errorReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-report-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    if (this.state.hasError) {
      // Check if too many errors in short time (possible infinite loop)
      const isErrorLoop = this.state.errorCount > 3 && 
        this.state.lastErrorTime && 
        (Date.now() - this.state.lastErrorTime < 5000);
      
      if (isErrorLoop) {
        // Minimal fallback for error loops
        return (
          <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
            <Card className="max-w-md w-full border-red-200">
              <CardHeader className="bg-red-100">
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Critical Error
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-700 mb-4">
                  The application encountered multiple errors and needs to be reloaded.
                </p>
                <Button 
                  onClick={this.handleReload}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      }
      
      // Custom fallback if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }
      
      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="max-w-2xl w-full">
            <CardHeader className="bg-orange-50">
              <CardTitle className="text-orange-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  The Weekly Day Plan dashboard encountered an unexpected error. 
                  Your data is safe, and you can try refreshing the page.
                </AlertDescription>
              </Alert>
              
              {/* Error details in development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                    Error Details (Development Only)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono overflow-auto">
                    <p className="font-semibold text-red-600 mb-2">{this.state.error.message}</p>
                    <pre className="whitespace-pre-wrap text-gray-600">
                      {this.state.error.stack}
                    </pre>
                    {this.state.errorInfo && (
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="font-semibold mb-2">Component Stack:</p>
                        <pre className="whitespace-pre-wrap text-gray-600">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
              
              {/* Recovery actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  onClick={this.handleReset}
                  variant="primary"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
              
              {/* Download error report for support */}
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  If this problem persists, please download the error report and contact support.
                </p>
                <Button 
                  onClick={this.handleDownloadErrorReport}
                  variant="ghost"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Error Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}