// Error type definitions and type guards

export interface ApiError {
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
  };
  message?: string;
  code?: string;
}

export interface LoggerResponse {
  status: unknown;
  statusText?: unknown;
  data?: unknown;
}

export interface WindowWithErrorReporter extends Window {
  errorReporter?: {
    report: (entry: unknown) => void;
  };
}

// Type guards
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error != null &&
    'response' in error &&
    typeof (error as ApiError).response === 'object'
  );
}

export function hasResponseStatus(error: unknown): error is { response: { status: number } } {
  return (
    isApiError(error) &&
    error.response != undefined &&
    typeof error.response.status === 'number'
  );
}

export function isErrorWithMessage(error: unknown): error is Error {
  return (
    error instanceof Error ||
    (typeof error === 'object' &&
      error != null &&
      'message' in error &&
      typeof (error as Error).message === 'string')
  );
}

export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

export function getApiErrorStatus(error: unknown): number | undefined {
  if (hasResponseStatus(error)) {
    return error.response.status;
  }
  return undefined;
}