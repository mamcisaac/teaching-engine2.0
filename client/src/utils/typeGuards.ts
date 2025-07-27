// Type guard utilities for safe type checking

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isAxiosError(error: unknown): error is { response?: { data?: unknown; status?: number } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as Record<string, unknown>).response === 'object'
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isArray<T = unknown>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, unknown> {
  return isRecord(obj) && key in obj;
}

export function safeJsonParse<T = unknown>(json: string | null, fallback: T): T {
  try {
    if (json === null || json === '') {
      return fallback;
    }
    const parsed: unknown = JSON.parse(json);
    // Type assertion is unavoidable here but caller should validate
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (isAxiosError(error) && error.response?.data !== undefined) {
    if (isRecord(error.response.data) && isString(error.response.data.message)) {
      return error.response.data.message;
    }
  }
  return String(error);
}
