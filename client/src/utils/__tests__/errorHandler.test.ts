/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * @file errorHandler.test.ts
 * @description Comprehensive tests for error handling utilities including API errors,
 * toast notifications, retry logic, and optimistic updates.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import {
  handleApiError,
  createErrorHandler,
  retryOperation,
  optimisticUpdate,
  ClientError,
} from '../errorHandler';

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

const mockToast = vi.mocked(toast);

describe('ClientError', () => {
  it('should create error with message, code, and details', () => {
    const details = { field: 'email', value: 'invalid' };
    const error = new ClientError('Invalid input', 'VALIDATION_ERROR', details);

    expect((error instanceof Error ? error.message : String(error))).toBe('Invalid input');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toBe(details);
    expect(error.name).toBe('ClientError');
    expect(error instanceof Error).toBe(true);
  });

  it('should create error without details', () => {
    const error = new ClientError('Something went wrong', 'UNKNOWN_ERROR');

    expect((error instanceof Error ? error.message : String(error))).toBe('Something went wrong');
    expect(error.code).toBe('UNKNOWN_ERROR');
    expect(error.details).toBeUndefined();
  });
});

describe('handleApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('AxiosError handling', () => {
    it('should handle 401 errors', () => {
      const axiosError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith('Session expired. Please login again.');
    });

    it('should handle 403 errors with custom message', () => {
      const axiosError = {
        response: {
          status: 403,
          data: { error: 'Forbidden' },
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError, 'Custom forbidden message');

      expect(mockToast.error).toHaveBeenCalledWith('Custom forbidden message');
    });

    it('should handle 404 errors with API message', () => {
      const axiosError = {
        response: {
          status: 404,
          data: { message: 'User not found' },
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith('User not found');
    });

    it('should handle 409 errors (conflicts)', () => {
      const axiosError = {
        response: {
          status: 409,
          data: { message: 'Email already exists' },
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith('Email already exists');
    });

    it('should handle 422 validation errors with details', () => {
      const axiosError = {
        response: {
          status: 422,
          data: {
            message: 'Validation failed',
            details: [
              { field: 'email', message: 'Invalid email format' },
              { field: 'password', message: 'Password too short' },
            ],
          },
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledTimes(2);
      expect(mockToast.error).toHaveBeenCalledWith('email: Invalid email format');
      expect(mockToast.error).toHaveBeenCalledWith('password: Password too short');
    });

    it('should handle 400 errors without details', () => {
      const axiosError = {
        response: {
          status: 400,
          data: { message: 'Bad request' },
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith('Bad request');
    });

    it('should handle 429 rate limit errors with retry-after header', () => {
      const axiosError = {
        response: {
          status: 429,
          statusText: 'Too Many Requests',
          headers: { 'retry-after': '60' },
          data: { error: 'Too many requests' },
          config: {} as unknown,
        },
        isAxiosError: true,
        name: 'AxiosError',
        message: 'Request failed with status code 429',
        toJSON: () => ({}),
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Too many requests. Please try again in 60 seconds.',
      );
    });

    it('should handle 429 errors without retry-after header', () => {
      const axiosError = {
        response: {
          status: 429,
          data: { error: 'Too many requests' },
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith('Too many requests. Please try again later.');
    });

    it('should handle server errors (5xx)', () => {
      const serverErrors = [500, 502, 503, 504];

      serverErrors.forEach((status) => {
        mockToast.error.mockClear();

        const axiosError = {
          response: {
            status,
            data: { error: 'Server error' },
          },
          isAxiosError: true,
        } as AxiosError;

        handleApiError(axiosError);

        expect(mockToast.error).toHaveBeenCalledWith('Server error. Please try again later.');
      });
    });

    it('should handle unknown status codes', () => {
      const axiosError = {
        response: {
          status: 418, // I'm a teapot
          data: { error: 'Unknown error' },
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith('Unknown error');
    });

    it('should use custom message when provided', () => {
      const axiosError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError, 'Custom server error message');

      expect(mockToast.error).toHaveBeenCalledWith('Custom server error message');
    });
  });

  describe('Network and generic errors', () => {
    it('should handle network errors', () => {
      const networkError = new Error('Network Error');

      handleApiError(networkError);

      expect(mockToast.error).toHaveBeenCalledWith(
        'Network error. Please check your internet connection.',
      );
    });

    it('should handle generic errors', () => {
      const genericError = new Error('Something went wrong');

      handleApiError(genericError);

      expect(mockToast.error).toHaveBeenCalledWith('Something went wrong');
    });

    it('should handle non-Error objects', () => {
      const unknownError = 'String error';

      handleApiError(unknownError);

      expect(mockToast.error).toHaveBeenCalledWith('An unexpected error occurred.');
    });

    it('should use custom message for generic errors', () => {
      const genericError = new Error('Original message');

      handleApiError(genericError, 'Custom error message');

      expect(mockToast.error).toHaveBeenCalledWith('Custom error message');
    });
  });

  describe('Edge cases', () => {
    it('should handle AxiosError without response', () => {
      const axiosError = {
        message: 'Request failed',
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith('An unexpected error occurred.');
    });

    it('should handle missing error data', () => {
      const axiosError = {
        response: {
          status: 400,
        },
        isAxiosError: true,
      } as AxiosError;

      handleApiError(axiosError);

      expect(mockToast.error).toHaveBeenCalledWith('Invalid request. Please check your input.');
    });

    it('should handle null/undefined errors', () => {
      handleApiError(null);
      expect(mockToast.error).toHaveBeenCalledWith('An unexpected error occurred.');

      handleApiError(undefined);
      expect(mockToast.error).toHaveBeenCalledWith('An unexpected error occurred.');
    });
  });
});

describe('createErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create error handler with default message', () => {
    const handler = createErrorHandler('Default error message');
    const error = new Error('Test error');

    handler(error);

    expect(mockToast.error).toHaveBeenCalledWith('Default error message');
  });

  it('should create error handler without default message', () => {
    const handler = createErrorHandler();
    const error = new Error('Test error');

    handler(error);

    expect(mockToast.error).toHaveBeenCalledWith('Test error');
  });

  it('should handle different error types', () => {
    const handler = createErrorHandler('Fallback message');

    const axiosError = {
      response: {
        status: 404,
        data: { message: 'Not found' },
      },
      isAxiosError: true,
    } as AxiosError;

    handler(axiosError);

    expect(mockToast.error).toHaveBeenCalledWith('Not found');
  });
});

describe('retryOperation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should succeed on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');

    const result = await retryOperation(operation);

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry and eventually succeed', async () => {
    const operation = vi
      .fn()
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockRejectedValueOnce(new Error('Fail 2'))
      .mockResolvedValue('success');

    const promise = retryOperation(operation, 3);

    // Fast-forward through retry delays
    await vi.runAllTimersAsync();

    const result = await promise;

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should fail after max retries', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

    const promise = retryOperation(operation, 3);

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Always fails');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should not retry on 400 errors', async () => {
    const axiosError = {
      response: { status: 400 },
      isAxiosError: true,
    } as AxiosError;

    const operation = vi.fn().mockRejectedValue(axiosError);

    await expect(retryOperation(operation)).rejects.toBe(axiosError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should not retry on client errors (4xx)', async () => {
    const clientErrors = [401, 403, 404, 422];

    for (const status of clientErrors) {
      const axiosError = {
        response: { status },
        isAxiosError: true,
      } as AxiosError;

      const operation = vi.fn().mockRejectedValue(axiosError);

      await expect(retryOperation(operation, 3)).rejects.toBe(axiosError);
      expect(operation).toHaveBeenCalledTimes(1);
    }
  });

  it('should retry on server errors (5xx)', async () => {
    const axiosError = {
      response: { status: 500 },
      isAxiosError: true,
    } as AxiosError;

    const operation = vi.fn().mockRejectedValue(axiosError);

    const promise = retryOperation(operation, 2);

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toBe(axiosError);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should use exponential backoff', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Fail'));

    const promise = retryOperation(operation, 3, 1000, 2);

    // Check delay intervals
    let totalTime = 0;

    // First failure - no delay before first attempt
    expect(operation).toHaveBeenCalledTimes(1);

    // Wait for first retry (1000ms delay)
    await vi.advanceTimersByTimeAsync(1000);
    totalTime += 1000;
    expect(operation).toHaveBeenCalledTimes(2);

    // Wait for second retry (2000ms delay)
    await vi.advanceTimersByTimeAsync(2000);
    totalTime += 2000;
    expect(operation).toHaveBeenCalledTimes(3);

    await expect(promise).rejects.toThrow('Fail');
  });

  it('should handle custom parameters', async () => {
    const operation = vi.fn().mockRejectedValue(new Error('Fail'));

    const promise = retryOperation(operation, 2, 500, 3);

    await vi.runAllTimersAsync();

    await expect(promise).rejects.toThrow('Fail');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});

describe('optimisticUpdate', () => {
  it('should return optimistic value and revert function', () => {
    const currentValue = { count: 1 };
    const getCurrent = vi.fn().mockReturnValue(currentValue);
    const update = vi.fn().mockReturnValue({ count: 2 });
    const operation = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();

    const { optimistic, revert } = optimisticUpdate(getCurrent, update, operation, onError);

    expect(getCurrent).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(currentValue);
    expect(optimistic).toEqual({ count: 2 });
    expect(revert).toEqual(currentValue);
    expect(operation).toHaveBeenCalled();
  });

  it('should call onError when operation fails', async () => {
    const currentValue = { count: 1 };
    const getCurrent = vi.fn().mockReturnValue(currentValue);
    const update = vi.fn().mockReturnValue({ count: 2 });
    const error = new Error('Operation failed');
    const operation = vi.fn().mockRejectedValue(error);
    const onError = vi.fn();

    optimisticUpdate(getCurrent, update, operation, onError);

    // Wait for operation to fail
    await vi.waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });

  it('should not call onError when operation succeeds', async () => {
    const currentValue = { count: 1 };
    const getCurrent = vi.fn().mockReturnValue(currentValue);
    const update = vi.fn().mockReturnValue({ count: 2 });
    const operation = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();

    optimisticUpdate(getCurrent, update, operation, onError);

    // Wait a bit to ensure operation completes
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle complex data structures', () => {
    const currentValue = {
      user: { id: 1, name: 'John' },
      posts: [{ id: 1, title: 'Post 1' }],
    };

    const getCurrent = vi.fn().mockReturnValue(currentValue);
    const update = vi.fn().mockImplementation((current: any) => ({
      ...current,
      posts: [...current.posts, { id: 2, title: 'New Post' }],
    }));
    const operation = vi.fn().mockResolvedValue(undefined);
    const onError = vi.fn();

    const { optimistic, revert } = optimisticUpdate(getCurrent, update, operation, onError);

    expect((optimistic as any).posts).toHaveLength(2);
    expect((optimistic as any).posts[1]).toEqual({ id: 2, title: 'New Post' });
    expect(revert).toBe(currentValue);
  });

  it('should handle async operation timing', async () => {
    const currentValue = { status: 'idle' };
    const getCurrent = vi.fn().mockReturnValue(currentValue);
    const update = vi.fn().mockReturnValue({ status: 'loading' });
    const operation = vi
      .fn()
      .mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
    const onError = vi.fn();

    const { optimistic } = optimisticUpdate(getCurrent, update, operation, onError);

    expect(optimistic).toEqual({ status: 'loading' });

    // Operation should still be running
    expect(onError).not.toHaveBeenCalled();

    // Wait for operation to complete
    await new Promise((resolve) => setTimeout(resolve, 150));

    expect(onError).not.toHaveBeenCalled();
  });
});

describe('Error handling integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complex error scenarios', () => {
    const complexAxiosError = {
      response: {
        status: 422,
        data: {
          message: 'Validation failed',
          details: [
            { field: 'title', message: 'Title is required' },
            { field: 'date', message: 'Invalid date format' },
          ],
        },
      },
      isAxiosError: true,
    } as AxiosError;

    const handler = createErrorHandler('Form submission failed');
    handler(complexAxiosError);

    expect(mockToast.error).toHaveBeenCalledTimes(2);
    expect(mockToast.error).toHaveBeenCalledWith('title: Title is required');
    expect(mockToast.error).toHaveBeenCalledWith('date: Invalid date format');
  });

  it('should work with retry operation and error handling', async () => {
    const axiosError = {
      response: { status: 500 },
      isAxiosError: true,
    } as AxiosError;

    const operation = vi.fn().mockRejectedValue(axiosError);
    const handler = createErrorHandler('Operation failed after retries');

    try {
      await retryOperation(operation, 2);
    } catch (error) {
      handler(error);
    }

    expect(operation).toHaveBeenCalledTimes(2);
    expect(mockToast.error).toHaveBeenCalledWith('Operation failed after retries');
  });

  it('should handle optimistic update errors with proper error handling', async () => {
    const error = new Error('Update failed');
    const operation = vi.fn().mockRejectedValue(error);
    const onError = createErrorHandler('Optimistic update failed');

    optimisticUpdate(
      () => ({ count: 1 }),
      (current) => ({ count: current.count + 1 }),
      operation,
      onError,
    );

    await vi.waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Optimistic update failed');
    });
  });
});
