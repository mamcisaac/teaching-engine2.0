
import * as Sentry from '@sentry/react';
import { Replay } from '@sentry/replay';
import type { ErrorInfo } from 'react';

import { logger } from '../utils/logger';
import { safeJsonParse } from '../utils/typeGuards';

interface UserContext {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  organizationId?: string;
}

interface ErrorCategory {
  category: string;
  severity: Sentry.SeverityLevel;
  tags: Record<string, string>;
}

interface BreadcrumbData {
  message: string;
  category?: string;
  level?: Sentry.SeverityLevel;
  data?: Record<string, unknown>;
}

// Type guard for unknown error types
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Type guard for objects
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value != null;
}

export class ErrorReportingService {
  private enabled = false;
  private mockMode = false;
  private sensitiveFields = [
    'password',
    'token',
    'apiKey',
    'api_key',
    'secret',
    'authorization',
    'creditCard',
    'credit_card',
    'ssn',
    'socialSecurityNumber',
    'bankAccount',
    'bank_account',
    'pin',
    'cvv',
    'cvc',
    'securityCode',
    'security_code',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'privateKey',
    'private_key',
    'sessionId',
    'session_id',
    'cookie',
    'phone',
    'phoneNumber',
    'phone_number',
    'address',
    'streetAddress',
    'street_address',
    'zipCode',
    'zip_code',
    'postalCode',
    'postal_code',
  ];

  private piiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // Credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone number
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g, // Bearer tokens
  ];

  constructor() {
    this.mockMode = import.meta.env.VITE_SENTRY_MOCK === 'true';
  }

  init(): void {
    if (this.mockMode) {
      logger.info('Using mock error reporting service');
      this.enabled = true;
      return;
    }

    if (import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test') {
      logger.info('Error reporting disabled in development');
      return;
    }

    const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
    if (dsn === undefined || dsn === '') {
      logger.warn('VITE_SENTRY_DSN not configured, error reporting disabled');
      return;
    }

    try {
      Sentry.init({
        dsn,
        environment: (import.meta.env.MODE as string | undefined) ?? 'production',
        integrations: [
          Sentry.browserTracingIntegration(),
          new Replay({
            // Mask all text and inputs for privacy
            maskAllText: true,
            maskAllInputs: true,
            // Block certain CSS classes from replay
            blockClass: 'sentry-block',
            // Ignore certain interactions
            ignoreClass: 'sentry-ignore',
            // Sample rates
            sessionSampleRate: 0.1,
            errorSampleRate: 1.0,
          }),
        ],
        tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend: (event, hint): Sentry.ErrorEvent | null => this.beforeSend(event, hint),
        beforeBreadcrumb: (breadcrumb, hint): Sentry.Breadcrumb | null => this.beforeBreadcrumb(breadcrumb, hint),
        // Ignore specific errors
        ignoreErrors: [
          'ResizeObserver loop limit exceeded',
          'ResizeObserver loop completed with undelivered notifications',
          'Non-Error promise rejection captured',
          /^No mounted component/,
          /^Script error/,
        ],
        // Filter transactions
        beforeSendTransaction: (transaction) => {
          // Don't send transactions for static assets
          if (transaction.transaction != null && (transaction.transaction.includes('/static/') || transaction.transaction.includes('/assets/'))) {
            return null;
          }
          return transaction;
        },
      });

      this.enabled = true;
      logger.info('Error reporting service initialized');
    } catch (error) {
      logger.error('Failed to initialize error reporting:', error);
    }
  }

  captureError(
    error: unknown,
    context?: Record<string, unknown>,
    errorInfo?: ErrorInfo,
  ): void {
    if (!this.enabled) {
      logger.debug('Error reporting disabled, skipping:', { error, context });
      return;
    }

    if (this.mockMode) {
      logger.info('[MOCK] Would capture error:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        context: this.sanitizeData(context ?? {}),
        errorInfo: errorInfo?.componentStack,
      });
      return;
    }

    const errorCategory = this.categorizeError(error);
    const sanitizedContext = this.sanitizeData(context ?? {});

    Sentry.withScope((scope) => {
      // Set error category and severity
      scope.setLevel(errorCategory.severity);
      scope.setTags(errorCategory.tags);
      scope.setContext('category', { type: errorCategory.category });

      // Add custom context
      if (isObject(sanitizedContext) && Object.keys(sanitizedContext).length > 0) {
        scope.setContext('custom', sanitizedContext);
      }

      // Add React error info if available
      if (errorInfo != undefined) {
        scope.setContext('react', {
          componentStack: errorInfo.componentStack,
        });
      }

      // Capture the exception
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.enabled) {
      return;
    }

    if (this.mockMode) {
      logger.info('[MOCK] Would capture message:', { message, level });
      return;
    }

    Sentry.captureMessage(message, level);
  }

  setUserContext(user: UserContext | null): void {
    if (!this.enabled) {
      return;
    }

    if (this.mockMode) {
      logger.info('[MOCK] Would set user context:', user);
      return;
    }

    if (user === null) {
      Sentry.setUser(null);
      return;
    }

    const sanitizedUser = {
      id: String(user.id),
      email: user.email != null && user.email != '' ? this.maskEmail(user.email) : undefined,
      username: user.name,
      role: user.role,
      organizationId: user.organizationId != undefined && user.organizationId != null ? String(user.organizationId) : undefined,
    };

    Sentry.setUser(sanitizedUser);
  }

  addBreadcrumb(breadcrumb: BreadcrumbData): void {
    if (!this.enabled) {
      return;
    }

    if (this.mockMode) {
      logger.info('[MOCK] Would add breadcrumb:', breadcrumb);
      return;
    }

    const sanitizedData = this.sanitizeData(breadcrumb.data ?? {});

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category,
      level: breadcrumb.level ?? 'info',
      data: sanitizedData as Record<string, unknown> | undefined,
      timestamp: Date.now() / 1000,
    });
  }

  setErrorContext(key: string, context: Record<string, unknown>): void {
    if (!this.enabled) {
      return;
    }

    if (this.mockMode) {
      logger.info('[MOCK] Would set error context:', { key, context });
      return;
    }

    const sanitizedContext = this.sanitizeData(context);
    Sentry.setContext(key, sanitizedContext as Record<string, unknown> | null);
  }

  categorizeError(error: unknown): ErrorCategory {
    // Default category
    const category: ErrorCategory = {
      category: 'unknown',
      severity: 'error',
      tags: {},
    };

    if (error instanceof Error) {
      category.tags = {
        error_type: error.constructor.name,
      };

      const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
      const stack = error.stack?.toLowerCase() ?? '';

      // Network errors
      if (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('failed to fetch') ||
        message.includes('networkerror') ||
        message.includes('timeout')
      ) {
        category.category = 'network';
        category.severity = 'warning';
      }
      // Authentication errors
      else if (
        message.includes('unauthorized') ||
        message.includes('401') ||
        message.includes('forbidden') ||
        message.includes('403') ||
        message.includes('auth')
      ) {
        category.category = 'authentication';
        category.severity = 'warning';
      }
      // Validation errors
      else if (
        message.includes('validation') ||
        message.includes('invalid') ||
        message.includes('required')
      ) {
        category.category = 'validation';
        category.severity = 'warning';
      }
      // React errors
      else if (
        error.name === 'ChunkLoadError' ||
        message.includes('loading chunk') ||
        message.includes('dynamic import')
      ) {
        category.category = 'chunk_load';
        category.severity = 'warning';
      } else if (
        stack.includes('react') ||
        message.includes('component') ||
        message.includes('render') ||
        error.name === 'TypeError' ||
        error.name === 'ReferenceError'
      ) {
        category.category = 'react';
        category.severity = 'error';
      }
      // API errors
      else if (
        message.includes('api') ||
        message.includes('endpoint') ||
        message.includes('request failed')
      ) {
        category.category = 'api';
        category.severity = 'error';
      }
    }

    return category;
  }

  disable(): void {
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }

  private beforeSend(event: Sentry.ErrorEvent, hint: Sentry.EventHint): Sentry.ErrorEvent | null {
    // Filter out non-actionable errors
    if (hint.originalException != undefined) {
      const error = hint.originalException;
      const errorMessage = isError(error) ? error.message : String(error);

      // Ignore ResizeObserver errors (browser quirk)
      if (errorMessage.includes('ResizeObserver')) {
        return null;
      }

      // Ignore generic script errors (usually from extensions)
      if (errorMessage === 'Script error.' || errorMessage === 'Script error') {
        return null;
      }
    }

    // Sanitize the entire event
    return this.sanitizeEvent(event);
  }

  private beforeBreadcrumb(
    breadcrumb: Sentry.Breadcrumb,
    _hint?: Sentry.BreadcrumbHint,
  ): Sentry.Breadcrumb | null {
    // Filter out noisy breadcrumbs
    if (breadcrumb.category === 'console' && breadcrumb.level === 'warning') {
      // Filter out React development warnings
      const {message} = breadcrumb;
      if (message != null && (message.includes('DevTools') || message.includes('React Hook') || message.includes('StrictMode'))) {
        return null;
      }

      // Filter out console messages with sensitive data
      if (this.containsSensitiveData(message ?? '')) {
        return null;
      }
    }

    // Sanitize breadcrumb
    if (breadcrumb.message != undefined) {
      breadcrumb.message = this.sanitizeString(breadcrumb.message);
    }

    if (breadcrumb.data != undefined) {
      breadcrumb.data = this.sanitizeData(breadcrumb.data) as Record<string, unknown> | undefined;
    }

    return breadcrumb;
  }

  private sanitizeEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent {
    // Deep clone to avoid modifying original
    const sanitized = safeJsonParse(JSON.stringify(event), event);

    // Sanitize message
    if (sanitized.message != undefined) {
      sanitized.message = this.sanitizeString(sanitized.message);
    }

    // Sanitize extra data
    if (sanitized.extra != undefined) {
      const sanitizedExtra = this.sanitizeData(sanitized.extra);
      sanitized.extra = this.isValidExtras(sanitizedExtra) ? sanitizedExtra : undefined;
    }

    // Sanitize request data
    if (sanitized.request != undefined) {
      if (sanitized.request.headers != undefined) {
        sanitized.request.headers = this.sanitizeHeaders(sanitized.request.headers);
      }
      if (sanitized.request.data != undefined) {
        sanitized.request.data = this.sanitizeData(sanitized.request.data);
      }
      if (sanitized.request.query_string != undefined) {
        if (typeof sanitized.request.query_string === 'string') {
          sanitized.request.query_string = this.sanitizeString(sanitized.request.query_string);
        } else {
          // Handle array case for QueryParams
          sanitized.request.query_string = '';
        }
      }
      if (sanitized.request.cookies != undefined) {
        sanitized.request.cookies = {} as Record<string, string>;
      }
    }

    // Sanitize user data
    if (typeof sanitized.user === 'object' && 'email' in sanitized.user) {
      const email = sanitized.user.email;
      if (email != '' && typeof email === 'string') {
        sanitized.user.email = this.maskEmail(email);
      }
    }

    // Sanitize contexts
    if (sanitized.contexts != undefined) {
      for (const key in sanitized.contexts) {
        sanitized.contexts[key] = this.sanitizeData(sanitized.contexts[key]) as Sentry.Context | undefined;
      }
    }

    // Sanitize tags
    if (sanitized.tags != undefined) {
      sanitized.tags = this.sanitizeData(sanitized.tags) as Record<string, string> | undefined;
    }

    return sanitized;
  }

  private isValidExtras(data: unknown): data is Record<string, unknown> {
    return data != null && data != undefined && typeof data === 'object' && !Array.isArray(data);
  }

  private sanitizeData(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized: Record<string, unknown> = {};
      const dataObj = data as Record<string, unknown>;

      for (const key in dataObj) {
        const lowerKey = key.toLowerCase();

        // Check if field should be redacted
        if (this.sensitiveFields.some((field) => lowerKey.includes(field))) {
          sanitized[key] = '[REDACTED]';
        } else if (key === 'email' && dataObj[key] != undefined && dataObj[key] != null) {
          sanitized[key] = this.maskEmail(String(dataObj[key]));
        } else if ((key === 'ip' || key === 'ipAddress' || key === 'ip_address') && dataObj[key] != undefined && dataObj[key] != null) {
          sanitized[key] = this.maskIP(String(dataObj[key]));
        } else {
          sanitized[key] = this.sanitizeData(dataObj[key]);
        }
      }

      return sanitized;
    }

    return data;
  }

  private sanitizeString(str: string): string {
    let sanitized = str;

    // Remove PII patterns
    for (const pattern of this.piiPatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    // Remove sensitive keywords with their values
    const sensitivePattern = new RegExp(
      `(${this.sensitiveFields.join('|')})\\s*[:=]\\s*[^\\s,;}]+`,
      'gi',
    );
    sanitized = sanitized.replace(sensitivePattern, '$1=[REDACTED]');

    return sanitized;
  }

  private sanitizeHeaders(headers: Record<string, unknown>): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const key in headers) {
      const lowerKey = key.toLowerCase();

      if (
        lowerKey.includes('authorization') ||
        lowerKey.includes('x-api-key') ||
        lowerKey.includes('x-auth-token') ||
        lowerKey.includes('cookie') ||
        lowerKey.includes('x-csrf-token')
      ) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = String(headers[key]);
      }
    }

    return sanitized;
  }

  private containsSensitiveData(str: string): boolean {
    const lowerStr = str.toLowerCase();

    // Check for sensitive field names
    if (this.sensitiveFields.some((field) => lowerStr.includes(field))) {
      return true;
    }

    // Check for PII patterns
    for (const pattern of this.piiPatterns) {
      if (pattern.test(str)) {
        return true;
      }
    }

    return false;
  }

  private maskEmail(email: string): string {
    if (email === '' || typeof email != 'string') {
      return '[INVALID_EMAIL]';
    }

    const parts = email.split('@');
    if (parts.length != 2) {
      return '[INVALID_EMAIL]';
    }

    const [local, domain] = parts;
    const maskedLocal = local.length > 3 ? `${local.substring(0, 3)}***` : '***';

    return `${maskedLocal}@${domain}`;
  }

  private maskIP(ip: string): string {
    if (!ip || typeof ip != 'string') {
      return 'xxx.xxx.xxx.xxx';
    }

    const parts = ip.split('.');
    if (parts.length === 4) {
      // Keep first two octets for general location info
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }

    // IPv6 or invalid format
    return 'xxx.xxx.xxx.xxx';
  }
}

// Export singleton instance
export const errorReportingService = new ErrorReportingService();
