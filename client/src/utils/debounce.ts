/**
 * Creates a debounced function that delays invoking func until after delay milliseconds
 * have elapsed since the last time the debounced function was invoked.
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;
  
  return function debounced(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Creates a throttled function that only invokes func at most once per 
 * every wait milliseconds.
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  let lastArgs: Parameters<T> | null = null;
  
  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, wait);
    } else {
      lastArgs = args;
    }
  };
}

/**
 * Manages concurrent requests with unique IDs to handle race conditions
 */
export class RequestManager {
  private currentRequestId: string | null = null;
  
  generateRequestId(): string {
    const id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.currentRequestId = id;
    return id;
  }
  
  isCurrentRequest(requestId: string): boolean {
    return this.currentRequestId === requestId;
  }
  
  clearRequest(requestId: string): void {
    if (this.currentRequestId === requestId) {
      this.currentRequestId = null;
    }
  }
}