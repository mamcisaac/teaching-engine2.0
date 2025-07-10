/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Client-side logger utility for Teaching Engine 2.0
 * 
 * This logger provides a consistent interface for logging in the browser
 * with different log levels and environment-aware behavior.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  context?: Record<string, unknown>;
}

class ClientLogger {
  private isDevelopment: boolean;
  private isEnabled: boolean;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 1000;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.isEnabled = this.isDevelopment || import.meta.env.VITE_ENABLE_LOGGING === 'true';
  }

  private createLogEntry(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        environment: import.meta.env.MODE
      }
    };
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isEnabled) {
return false;
}
    
    // In production, only log errors and warnings
    if (!this.isDevelopment && (level === 'debug' || level === 'trace' || level === 'info')) {
      return false;
    }
    
    return true;
  }

  error(message: string, error?: Error | any, data?: any): void {
    const entry = this.createLogEntry('error', message, { error: error?.stack || error, ...data });
    this.addToHistory(entry);
    
    if (this.shouldLog('error')) {
      // In development, use console.error for better stack traces
      if (this.isDevelopment && error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error(`[ERROR] ${message}`, error, data);
      }
    }
    
    // Send to error reporting service in production
    if (!this.isDevelopment && typeof window !== 'undefined' && (window as any).errorReporter) {
      (window as any).errorReporter.report(entry);
    }
  }

  warn(message: string, data?: any): void {
    const entry = this.createLogEntry('warn', message, data);
    this.addToHistory(entry);
    
    if (this.shouldLog('warn') && this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(`[WARN] ${message}`, data);
    }
  }

  info(message: string, data?: any): void {
    const entry = this.createLogEntry('info', message, data);
    this.addToHistory(entry);
    
    if (this.shouldLog('info') && this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(`[INFO] ${message}`, data);
    }
  }

  debug(message: string, data?: any): void {
    const entry = this.createLogEntry('debug', message, data);
    this.addToHistory(entry);
    
    if (this.shouldLog('debug') && this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  trace(message: string, data?: any): void {
    const entry = this.createLogEntry('trace', message, data);
    this.addToHistory(entry);
    
    if (this.shouldLog('trace') && this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(`[TRACE] ${message}`, data);
    }
  }

  // Performance logging
  time(label: string): void {
    if (this.shouldLog('debug')) {
      performance.mark(`logger-${label}-start`);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog('debug')) {
      performance.mark(`logger-${label}-end`);
      try {
        performance.measure(
          `logger-${label}`,
          `logger-${label}-start`,
          `logger-${label}-end`
        );
        const measure = performance.getEntriesByName(`logger-${label}`)[0];
        this.debug(`Performance: ${label}`, { duration: `${measure.duration.toFixed(2)}ms` });
        
        // Clean up
        performance.clearMarks(`logger-${label}-start`);
        performance.clearMarks(`logger-${label}-end`);
        performance.clearMeasures(`logger-${label}`);
      } catch (error) {
        this.warn(`Failed to measure performance for: ${label}`, error);
      }
    }
  }

  // API logging
  api(method: string, url: string, data?: any, response?: any): void {
    this.info(`API ${method} ${url}`, {
      request: data,
      response: response?.status ? {
        status: response.status,
        statusText: response.statusText,
        data: response.data
      } : response
    });
  }

  // User action logging
  userAction(action: string, details?: any): void {
    this.info(`User Action: ${action}`, details);
  }

  // Get log history for debugging
  getHistory(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter(entry => entry.level === level);
    }
    return [...this.logHistory];
  }

  // Clear log history
  clearHistory(): void {
    this.logHistory = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  // Download logs as file
  downloadLogs(): void {
    const data = this.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teaching-engine-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const logger = new ClientLogger();

// Export for use throughout the application
export default logger;
export { logger, ClientLogger };
export type { LogLevel, LogEntry };