import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ApiError {
  error: string;
  message?: string;
  code?: string;
  details?: unknown;
}

export class ClientError extends Error {
  code: string;
  details?: unknown;

  constructor(message: string, code: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ClientError';
  }
}

export function handleApiError(error: unknown, customMessage?: string): void {
  console.error('API Error:', error);

  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;

    // Handle specific error codes
    switch (error.response?.status) {
      case 401:
        toast.error('Session expired. Please login again.');
        // Redirect to login will be handled by axios interceptor
        break;

      case 403:
        toast.error(customMessage || 'You do not have permission to perform this action.');
        break;

      case 404:
        toast.error(customMessage || apiError?.message || 'Resource not found.');
        break;

      case 409:
        toast.error(customMessage || apiError?.message || 'This item already exists.');
        break;

      case 422:
      case 400:
        if (apiError?.details && Array.isArray(apiError.details)) {
          // Show validation errors
          apiError.details.forEach((detail: { field: string; message: string }) => {
            toast.error(`${detail.field}: ${detail.message}`);
          });
        } else {
          toast.error(
            customMessage || apiError?.message || 'Invalid request. Please check your input.',
          );
        }
        break;

      case 429: {
        const retryAfter = error.response?.headers['retry-after'];
        toast.error(
          `Too many requests. Please try again ${retryAfter ? `in ${retryAfter} seconds` : 'later'}.`,
        );
        break;
      }

      case 500:
      case 502:
      case 503:
      case 504:
        toast.error(customMessage || 'Server error. Please try again later.');
        break;

      default:
        toast.error(customMessage || apiError?.error || 'An unexpected error occurred.');
    }
  } else if (error instanceof Error) {
    // Handle network errors
    if (error.message === 'Network Error') {
      toast.error('Network error. Please check your internet connection.');
    } else {
      toast.error(customMessage || error.message);
    }
  } else {
    toast.error(customMessage || 'An unexpected error occurred.');
  }
}

export function createErrorHandler(defaultMessage?: string) {
  return (error: unknown) => handleApiError(error, defaultMessage);
}

// Retry logic for transient failures
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoff: number = 2,
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status && [400, 401, 403, 404, 422].includes(status)) {
          throw error;
        }
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(backoff, i)));
      }
    }
  }

  throw lastError;
}

// Optimistic update helper
export function optimisticUpdate<T>(
  getCurrent: () => T,
  update: (current: T) => T,
  operation: () => Promise<void>,
  onError: (error: unknown) => void,
): { optimistic: T; revert: () => void } {
  const current = getCurrent();
  const optimistic = update(current);

  operation().catch((error) => {
    onError(error);
  });

  return {
    optimistic,
    revert: () => current,
  };
}
