import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { ErrorBoundaries } from '../ErrorBoundaries';

// Mock console.error to avoid noise in test output
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

// Store original NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundaries', () => {
  afterEach(() => {
    consoleSpy.mockClear();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('strict boolean expression handling', () => {
    it('should handle error state with proper boolean checks', () => {
      render(
        <ErrorBoundaries>
          <ThrowError shouldThrow={true} />
        </ErrorBoundaries>
      );

      // Should show error UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should handle non-error state', () => {
      render(
        <ErrorBoundaries>
          <ThrowError shouldThrow={false} />
        </ErrorBoundaries>
      );

      // Should show normal content
      expect(screen.getByText('No error')).toBeInTheDocument();
      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    });

    it('should handle undefined error details', () => {
      // Create a custom error without message
      const CustomError = () => {
        const error: any = {};
        throw error;
      };

      render(
        <ErrorBoundaries>
          <CustomError />
        </ErrorBoundaries>
      );

      // Should still show error UI even with undefined message
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should handle null error message', () => {
      const NullMessageError = () => {
        const error = new Error();
        error.message = null as any;
        throw error;
      };

      render(
        <ErrorBoundaries>
          <NullMessageError />
        </ErrorBoundaries>
      );

      // Should handle null message gracefully
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should handle empty string error message', () => {
      const EmptyMessageError = () => {
        throw new Error('');
      };

      render(
        <ErrorBoundaries>
          <EmptyMessageError />
        </ErrorBoundaries>
      );

      // Should show error UI even with empty message
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should show error details when error has message', () => {
      // Set NODE_ENV to development to show details
      process.env.NODE_ENV = 'development';
      
      const DetailedError = () => {
        throw new Error('Detailed error message');
      };

      render(
        <ErrorBoundaries>
          <DetailedError />
        </ErrorBoundaries>
      );

      // Should show the error message
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      
      // Click on the details summary to expand
      const detailsSummary = screen.getByText('Error Details (Development)');
      detailsSummary.click();
      
      // Now the error message should be visible
      expect(screen.getByText('Detailed error message')).toBeInTheDocument();
      
      // Reset NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should handle error info with componentStack', () => {
      // componentDidCatch provides errorInfo with componentStack
      const ErrorWithStack = () => {
        throw new Error('Stack error');
      };

      render(
        <ErrorBoundaries>
          <ErrorWithStack />
        </ErrorBoundaries>
      );

      // Should display error
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should have functional retry button', () => {
      // Component that always throws
      const AlwaysThrows = () => {
        throw new Error('Always fails');
      };

      render(
        <ErrorBoundaries>
          <AlwaysThrows />
        </ErrorBoundaries>
      );

      // Should show error initially
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      
      // Should have retry button with correct text content
      const buttons = screen.getAllByRole('button');
      const retryButton = buttons.find(button => button.textContent?.includes('Try Again'));
      expect(retryButton).toBeDefined();
      expect(retryButton).toBeInTheDocument();
      
      // Verify it's a button element
      expect(retryButton?.tagName).toBe('BUTTON');
    });

    it('should handle undefined children', () => {
      render(
        <ErrorBoundaries>
          {undefined}
        </ErrorBoundaries>
      );

      // Should not crash with undefined children
      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    });

    it('should handle null children', () => {
      render(
        <ErrorBoundaries>
          {null}
        </ErrorBoundaries>
      );

      // Should not crash with null children
      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    });
  });

  describe('error boundary lifecycle', () => {
    it('should catch errors during render', () => {
      render(
        <ErrorBoundaries>
          <ThrowError shouldThrow={true} />
        </ErrorBoundaries>
      );

      expect(consoleSpy).toHaveBeenCalled();
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });

    it('should not interfere with normal rendering', () => {
      render(
        <ErrorBoundaries>
          <div data-testid="normal-content">Normal content</div>
        </ErrorBoundaries>
      );

      expect(screen.getByTestId('normal-content')).toBeInTheDocument();
      expect(screen.queryByText(/Something went wrong/i)).not.toBeInTheDocument();
    });

    it('should handle multiple children with one erroring', () => {
      render(
        <ErrorBoundaries>
          <div>First child</div>
          <ThrowError shouldThrow={true} />
          <div>Third child</div>
        </ErrorBoundaries>
      );

      // Error boundary should catch the error and show error UI
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
      // Other children should not be rendered
      expect(screen.queryByText('First child')).not.toBeInTheDocument();
      expect(screen.queryByText('Third child')).not.toBeInTheDocument();
    });
  });
});