import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { AIErrorBoundary, AIErrorType, isAIError, useAIErrorHandler, WithAIErrorBoundary } from '../AIErrorBoundary';
import { logger } from '../../../utils/logger';

// Mock gtag
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, parameters: any) => void;
  }
}

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: {
    error: vi.fn(),
  },
}));

// Test component that can throw errors on demand
const ThrowError: React.FC<{ shouldThrow?: boolean; error?: Error }> = ({ shouldThrow = false, error = new Error('Test error') }) => {
  if (shouldThrow ) {
    throw error;
  }
  return <div>No error</div>;
};

describe('AIErrorBoundary', () => {
  let mockGtag: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGtag = vi.fn();
    window.gtag = mockGtag;
    // Clear sessionStorage
    sessionStorage.clear();
  });

  afterEach(() => {
    delete window.gtag;
  });

  describe('Strict Boolean Expression Tests', () => {
    it('should handle hasError and error state combinations correctly', () => {
      // Test when hasError is false
      const { rerender } = render(
        <AIErrorBoundary>
          <div>Normal content</div>
        </AIErrorBoundary>
      );
      expect(screen.getByText('Normal content')).toBeInTheDocument();

      // Test when hasError is true but error is undefined
      const errorBoundary = new AIErrorBoundary({ children: null });
      errorBoundary.state = { hasError: true, error: undefined, retryCount: 0 };
      expect(errorBoundary.render()).toEqual(null);

      // Test when hasError is true but error is undefined  
      errorBoundary.state = { hasError: true, error: undefined, retryCount: 0 };
      expect(errorBoundary.render()).toEqual(null);
    });

    it('should handle context parameter in useAIErrorHandler correctly', () => {
      const handler = useAIErrorHandler();
      
      // Test with null context
      handler.handleAIError(new Error('Test error'), null as any);
      expect(logger.error).toHaveBeenCalledWith('AI Error:', new Error('Test error'));
      
      // Test with undefined context
      handler.handleAIError(new Error('Test error'), undefined);
      expect(logger.error).toHaveBeenCalledWith('AI Error:', new Error('Test error'));
      
      // Test with empty string context
      handler.handleAIError(new Error('Test error'), '');
      expect(logger.error).toHaveBeenCalledWith('AI Error:', new Error('Test error'));
      
      // Test with valid context
      handler.handleAIError(new Error('Test error'), 'TestComponent');
      expect(logger.error).toHaveBeenCalledWith('AI Error in TestComponent:', new Error('Test error'));
    });

    it('should handle gtag event_label with null/undefined/empty context', () => {
      const handler = useAIErrorHandler();
      
      // Test with null context
      handler.handleAIError(new Error('Test error'), null as any);
      expect(mockGtag).toHaveBeenCalledWith('event', 'ai_error', {
        event_category: 'AI Integration',
        event_label: 'Unknown',
        value: 1,
      });
      
      // Test with undefined context
      mockGtag.mockClear();
      handler.handleAIError(new Error('Test error'), undefined);
      expect(mockGtag).toHaveBeenCalledWith('event', 'ai_error', {
        event_category: 'AI Integration',
        event_label: 'Unknown',
        value: 1,
      });
      
      // Test with empty string context
      mockGtag.mockClear();
      handler.handleAIError(new Error('Test error'), '');
      expect(mockGtag).toHaveBeenCalledWith('event', 'ai_error', {
        event_category: 'AI Integration',
        event_label: 'Unknown',
        value: 1,
      });
    });
    it('should handle window.gtag being undefined', () => {
      delete window.gtag;
      
      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      // Should render error UI without crashing
      expect(screen.getByText('AI Assistant Unavailable')).toBeInTheDocument();
      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('should handle window.gtag being null', () => {
      window.gtag = null as any;
      
      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      // Should render error UI without crashing
      expect(screen.getByText('AI Assistant Unavailable')).toBeInTheDocument();
    });

    it('should handle onRetry prop being undefined', () => {
      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} error={new Error('rate limit')} />
        </AIErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Should not crash when onRetry is undefined
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('should handle onRetry prop being null', () => {
      render(
        <AIErrorBoundary onRetry={null as any}>
          <ThrowError shouldThrow={true} error={new Error('rate limit')} />
        </AIErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      // Should not crash when onRetry is null
      expect(screen.queryByText('No error')).not.toBeInTheDocument();
    });

    it('should handle fallback prop being undefined', () => {
      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      // Should render default error UI when fallback is undefined
      expect(screen.getByText('AI Assistant Unavailable')).toBeInTheDocument();
    });

    it('should handle fallback prop being null', () => {
      render(
        <AIErrorBoundary fallback={null}>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      // Should render default error UI when fallback is null
      expect(screen.getByText('AI Assistant Unavailable')).toBeInTheDocument();
    });

    it('should handle enableManualFallback being false', () => {
      render(
        <AIErrorBoundary enableManualFallback={false}>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      // Should not render manual fallback button
      expect(screen.queryByRole('button', { name: /continue manually/i })).not.toBeInTheDocument();
    });

    it('should handle enableManualFallback being undefined', () => {
      render(
        <AIErrorBoundary enableManualFallback={undefined}>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      // Should not render manual fallback button when undefined
      expect(screen.queryByRole('button', { name: /continue manually/i })).not.toBeInTheDocument();
    });

    it('should handle enableManualFallback being true', () => {
      render(
        <AIErrorBoundary enableManualFallback={true}>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      // Should render manual fallback button when true
      expect(screen.getByRole('button', { name: /continue manually/i })).toBeInTheDocument();
    });

    it('should handle retryable being false', () => {
      const error = new Error('api key missing');
      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} error={error} />
        </AIErrorBoundary>
      );

      // Should not show retry button for non-retryable errors
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should handle retryable being true', () => {
      const error = new Error('rate limit exceeded');
      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} error={error} />
        </AIErrorBoundary>
      );

      // Should show retry button for retryable errors
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should handle retryable being undefined', () => {
      const error = new Error('unknown error');
      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} error={error} />
        </AIErrorBoundary>
      );

      // Should not show retry button when retryable is undefined
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should handle statusCode being undefined', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });

      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      const details = screen.getByText('Technical Details');
      fireEvent.click(details);

      // Should not render status code when undefined
      expect(screen.queryByText(/Status:/)).not.toBeInTheDocument();

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        configurable: true,
      });
    });

    it('should handle errorInfo being undefined', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });

      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      const details = screen.getByText('Technical Details');
      fireEvent.click(details);

      // Should not render component stack when errorInfo is undefined
      expect(screen.queryByText('Component Stack')).not.toBeInTheDocument();

      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        configurable: true,
      });
    });
  });

  describe('Error Classification', () => {
    const testCases = [
      { message: 'API key is missing', expectedType: AIErrorType.API_KEY_MISSING, retryable: false },
      { message: 'Unauthorized access', expectedType: AIErrorType.API_KEY_MISSING, retryable: false },
      { message: 'Rate limit exceeded', expectedType: AIErrorType.API_RATE_LIMIT, retryable: true },
      { message: 'Too many requests', expectedType: AIErrorType.API_RATE_LIMIT, retryable: true },
      { message: 'Request timeout', expectedType: AIErrorType.TIMEOUT, retryable: true },
      { message: 'Operation timed out', expectedType: AIErrorType.TIMEOUT, retryable: true },
      { message: 'Network error occurred', expectedType: AIErrorType.NETWORK_ERROR, retryable: true },
      { message: 'Failed to fetch', expectedType: AIErrorType.NETWORK_ERROR, retryable: true },
      { message: 'Quota exceeded', expectedType: AIErrorType.QUOTA_EXCEEDED, retryable: false },
      { message: 'Billing limit reached', expectedType: AIErrorType.QUOTA_EXCEEDED, retryable: false },
      { message: 'Service unavailable', expectedType: AIErrorType.API_UNAVAILABLE, retryable: true },
      { message: 'Invalid response format', expectedType: AIErrorType.INVALID_RESPONSE, retryable: false },
      { message: 'Unknown error', expectedType: AIErrorType.UNKNOWN, retryable: false },
    ];

    testCases.forEach(({ message, expectedType, retryable }) => {
      it(`should classify "${message}" as ${expectedType} with retryable=${retryable}`, () => {
        render(
          <AIErrorBoundary>
            <ThrowError shouldThrow={true} error={new Error(message)} />
          </AIErrorBoundary>
        );

        if (retryable ) {
          expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
        } else {
          expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('Retry Functionality', () => {
    it('should limit retries to maxRetries', () => {
      const onRetry = vi.fn();
      const { rerender } = render(
        <AIErrorBoundary onRetry={onRetry}>
          <ThrowError shouldThrow={true} error={new Error('rate limit')} />
        </AIErrorBoundary>
      );

      // First retry
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(1);

      // Rerender with error again
      rerender(
        <AIErrorBoundary onRetry={onRetry}>
          <ThrowError shouldThrow={true} error={new Error('rate limit')} />
        </AIErrorBoundary>
      );

      // Second retry
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(2);

      // Third retry
      rerender(
        <AIErrorBoundary onRetry={onRetry}>
          <ThrowError shouldThrow={true} error={new Error('rate limit')} />
        </AIErrorBoundary>
      );
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalledTimes(3);

      // Fourth attempt - should not show retry button
      rerender(
        <AIErrorBoundary onRetry={onRetry}>
          <ThrowError shouldThrow={true} error={new Error('rate limit')} />
        </AIErrorBoundary>
      );
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('Manual Fallback', () => {
    it('should set ai_disabled in sessionStorage and reload page', () => {
      const mockReload = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: mockReload },
        writable: true,
      });

      render(
        <AIErrorBoundary enableManualFallback={true}>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /continue manually/i }));

      expect(sessionStorage.getItem('ai_disabled')).toBe('true');
      expect(mockReload).toHaveBeenCalled();
    });
  });

  describe('isAIError utility', () => {
    it('should return false for non-Error objects', () => {
      expect(isAIError('string error')).toBe(false);
      expect(isAIError(null)).toBe(false);
      expect(isAIError(undefined)).toBe(false);
      expect(isAIError(123)).toBe(false);
      expect(isAIError({})).toBe(false);
    });

    it('should return true for AI-related errors', () => {
      expect(isAIError(new Error('OpenAI API error'))).toBe(true);
      expect(isAIError(new Error('API key missing'))).toBe(true);
      expect(isAIError(new Error('GPT-4 error'))).toBe(true);
      expect(isAIError(new Error('AI service down'))).toBe(true);
      expect(isAIError(new Error('Model not found'))).toBe(true);
      expect(isAIError(new Error('Completion failed'))).toBe(true);
    });

    it('should return false for non-AI errors', () => {
      expect(isAIError(new Error('Database connection failed'))).toBe(false);
      expect(isAIError(new Error('Invalid input'))).toBe(false);
      expect(isAIError(new Error('Network timeout'))).toBe(false);
    });
  });

  describe('useAIErrorHandler hook', () => {
    it('should log errors with context', () => {
      const handler = useAIErrorHandler();
      
      handler.handleAIError(new Error('Test error'), 'TestComponent');
      
      expect(logger.error).toHaveBeenCalledWith('AI Error in TestComponent:', new Error('Test error'));
    });

    it('should report to gtag when available', () => {
      const handler = useAIErrorHandler();
      
      handler.handleAIError(new Error('Test error'), 'TestComponent');
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'ai_error', {
        event_category: 'AI Integration',
        event_label: 'TestComponent',
        value: 1,
      });
    });

    it('should handle missing gtag gracefully', () => {
      delete window.gtag;
      const handler = useAIErrorHandler();
      
      // Should not throw when gtag is undefined
      expect(() => {
        handler.handleAIError(new Error('Test error'));
      }).not.toThrow();
    });
  });

  describe('WithAIErrorBoundary wrapper', () => {
    it('should wrap children with AIErrorBoundary', () => {
      render(
        <WithAIErrorBoundary>
          <div>Test content</div>
        </WithAIErrorBoundary>
      );

      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('should pass through props correctly', () => {
      const onRetry = vi.fn();
      render(
        <WithAIErrorBoundary onRetry={onRetry} enableManualFallback={false}>
          <ThrowError shouldThrow={true} error={new Error('rate limit')} />
        </WithAIErrorBoundary>
      );

      // Should not show manual fallback when disabled
      expect(screen.queryByRole('button', { name: /continue manually/i })).not.toBeInTheDocument();
      
      // Should call onRetry when retry is clicked
      fireEvent.click(screen.getByRole('button', { name: /retry/i }));
      expect(onRetry).toHaveBeenCalled();
    });

    it('should default enableManualFallback to true', () => {
      render(
        <WithAIErrorBoundary>
          <ThrowError shouldThrow={true} />
        </WithAIErrorBoundary>
      );

      // Should show manual fallback by default
      expect(screen.getByRole('button', { name: /continue manually/i })).toBeInTheDocument();
    });
  });

  describe('Development Mode Features', () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: originalEnv,
        configurable: true,
      });
    });

    it('should show technical details in development mode', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'development',
        configurable: true,
      });

      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} error={new Error('Test error')} />
        </AIErrorBoundary>
      );

      expect(screen.getByText('Technical Details')).toBeInTheDocument();
    });

    it('should hide technical details in production mode', () => {
      Object.defineProperty(process.env, 'NODE_ENV', {
        value: 'production',
        configurable: true,
      });

      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} error={new Error('Test error')} />
        </AIErrorBoundary>
      );

      expect(screen.queryByText('Technical Details')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <AIErrorBoundary>
          <ThrowError shouldThrow={true} />
        </AIErrorBoundary>
      );

      // Check for proper ARIA roles and labels
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByLabelText('AI Assistant Unavailable')).toBeInTheDocument();
      expect(screen.getByRole('group')).toHaveAttribute('aria-describedby', 'ai-error-description');
      expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', 'ai-error-title');
    });

    it('should have descriptive button labels', () => {
      render(
        <AIErrorBoundary enableManualFallback={true}>
          <ThrowError shouldThrow={true} error={new Error('rate limit')} />
        </AIErrorBoundary>
      );

      expect(screen.getByLabelText('Retry AI generation')).toBeInTheDocument();
      expect(screen.getByLabelText('Continue creating content manually without AI assistance')).toBeInTheDocument();
    });
  });
});

// Additional test for renderHook
function renderHook<Result>(renderCallback: () => Result) {
  let result: Result;
  
  function TestComponent() {
    result = renderCallback();
    return null;
  }
  
  render(<TestComponent />);
  
  return { result: result! };
}