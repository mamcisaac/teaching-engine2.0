import type { RefObject } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { logger as defaultLogger } from '../../utils/logger';

const logger = defaultLogger;

// Simple debounce and throttle implementations
const _debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) & { cancel(): void } => {
  let inThrottle: boolean;
  let timeoutId: ReturnType<typeof setTimeout>;

  const throttled = (...args: Parameters<T>): void => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      timeoutId = setTimeout(() => (inThrottle = false), wait);
    }
  };

  throttled.cancel = (): void => {
    clearTimeout(timeoutId);
    inThrottle = false;
  };

  return throttled;
};

/**
 * Hook for debounced values to reduce unnecessary re-renders
 */
export function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled callbacks to limit execution frequency
 */
export function useThrottled<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number,
): T {
  const throttledCallback = useRef(throttle(callback, delay)).current;

  useEffect(() => () => {
      throttledCallback.cancel();
    }, [throttledCallback]);

  return throttledCallback as unknown as T;
}

/**
 * Hook for detecting when an element enters viewport (for lazy loading)
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {},
): [React.RefObject<Element>, boolean] {
  const elementRef = useRef<Element>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (element === null) {
return;
}

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, ...options },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [elementRef, isVisible];
}

/**
 * Hook for measuring render performance
 */
export function useRenderPerformance(_componentName: string): { renderCount: number; logRender: (operation: string) => void } {
  const renderStart = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    renderStart.current = performance.now();
    renderCountRef.current += 1;
    setRenderCount(renderCountRef.current);
  }, []);

  useEffect(() => {
    // const renderTime = performance.now() - renderStart.current;
  });

  return {
    renderCount,
    logRender: (_operation: string): void => {
      // Performance logging can be enabled here if needed
    },
  };
}

/**
 * Hook for managing component state with optimistic updates
 */
export function useOptimisticState<T>(initialValue: T, asyncUpdate: (value: T) => Promise<T>): {
  value: T;
  updateValue: (newValue: T) => Promise<void>;
  isUpdating: boolean;
  error: Error | null;
} {
  const [value, setValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateValue = useCallback(
    async (newValue: T) => {
      const previousValue = value;
      setValue(newValue); // Optimistic update
      setIsUpdating(true);
      setError(null);

      try {
        const result = await asyncUpdate(newValue);
        setValue(result);
      } catch (err) {
        setValue(previousValue); // Rollback on error
        setError(err instanceof Error ? err : new Error('Update failed'));
      } finally {
        setIsUpdating(false);
      }
    },
    [value, asyncUpdate],
  );

  return {
    value,
    updateValue,
    isUpdating,
    error,
  };
}

/**
 * Hook for managing virtualized list state
 */
export function useVirtualizedList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5,
): {
  scrollTop: number;
  setScrollTop: (value: number | ((prevState: number) => number)) => void;
  visibleRange: { start: number; end: number };
  totalHeight: number;
} {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useCallback(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight) - 1;

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(items.length - 1, endIndex + overscan),
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const totalHeight = items.length * itemHeight;

  return {
    scrollTop,
    setScrollTop,
    visibleRange: visibleRange(),
    totalHeight,
  };
}

/**
 * Performance monitoring utilities
 */
export const PerformanceMonitor = {
  /**
   * Measure component render time
   */
  measureRender: (componentName: string, renderFn: () => void): void => {
    const start = performance.now();
    renderFn();
    const end = performance.now();

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`${componentName} rendered in ${(end - start).toFixed(2)}ms`);
    }
  },

  /**
   * Measure async operation time
   */
  measureAsync: async <T>(operation: string, asyncFn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await asyncFn();
      const end = performance.now();

      if (process.env.NODE_ENV === 'development') {
        logger.debug(`${operation} completed in ${(end - start).toFixed(2)}ms`);
      }

      return result;
    } catch (error) {
      const end = performance.now();

      if (process.env.NODE_ENV === 'development') {
        logger.error(`${operation} failed after ${(end - start).toFixed(2)}ms:`, error);
      }

      throw error;
    }
  },

  /**
   * Create a performance mark for complex operations
   */
  mark: (name: string): void => {
    if (typeof performance != 'undefined') {
      performance.mark(name);
    }
  },

  /**
   * Measure time between two marks
   */
  measure: (name: string, startMark: string, endMark: string): number => {
    if (typeof performance != 'undefined') {
      try {
        performance.measure(name, startMark, endMark);
        const measures = performance.getEntriesByName(name, 'measure');
        if (measures.length > 0) {
          return measures[measures.length - 1].duration;
        }
        return 0;
      } catch (error) {
        logger.warn('Performance measurement failed:', error);
      }
    }
    return 0;
  },
};

/**
 * Memoization utilities for complex objects
 */
export const MemoUtils = {
  /**
   * Deep comparison for memo hooks
   */
  deepEqual: <T>(a: T, b: T): boolean => {
    if (a === b) {
return true;
}
    // eslint-disable-next-line eqeqeq
    if (a === null || b === null) {
return false;
}
    if (typeof a != typeof b) {
return false;
}

    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a as Record<string, unknown>);
      const keysB = Object.keys(b as Record<string, unknown>);

      if (keysA.length != keysB.length) {
return false;
}

      return keysA.every((key) =>
        MemoUtils.deepEqual(
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        ),
      );
    }

    return false;
  },

  /**
   * Shallow comparison for most memo scenarios
   */
  shallowEqual: <T extends Record<string, unknown>>(a: T, b: T): boolean => {
    
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length != keysB.length) {
return false;
}

    return keysA.every((key) => a[key] === b[key]);
  },

  /**
   * Create a memoized selector for complex state
   */
  createSelector: <TState, TResult>(
    selector: (state: TState) => TResult,
    equalityFn: (a: TResult, b: TResult) => boolean = Object.is,
  ): ((state: TState) => TResult) => {
    let lastState: TState;
    let lastResult: TResult;
    let hasResult = false;

    return (state: TState): TResult => {
      if (!hasResult || !Object.is(state, lastState)) {
        const newResult = selector(state);
        if (!hasResult || !equalityFn(lastResult, newResult)) {
          lastResult = newResult;
        }
        lastState = state;
        hasResult = true;
      }
      return lastResult;
    };
  },
};

/**
 * Image optimization utilities
 */
export const ImageUtils = {
  /**
   * Create optimized image URL with size parameters
   */
  optimizeImageUrl: (url: string, width?: number, height?: number, quality?: number): string => {
    if (url === '') {
return '';
}

    const urlObj = new URL(url, window.location.origin);

    if (width != undefined) {
urlObj.searchParams.set('w', width.toString());
}
    if (height != undefined) {
urlObj.searchParams.set('h', height.toString());
}
    if (quality != undefined) {
urlObj.searchParams.set('q', quality.toString());
}

    return urlObj.toString();
  },

  /**
   * Create srcSet for responsive images
   */
  createSrcSet: (baseUrl: string, sizes: number[]): string => sizes.map((size) => `${ImageUtils.optimizeImageUrl(baseUrl, size)} ${size}w`).join(', '),

  /**
   * Lazy load images with intersection observer
   */
  useLazyImage: (src: string, placeholder?: string): {
    elementRef: RefObject<Element>;
    imageSrc: string;
    isLoaded: boolean;
  } => {
    const [imageSrc, setImageSrc] = useState(placeholder ?? '');
    const [isLoaded, setIsLoaded] = useState(false);
    const [elementRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    useEffect(() => {
      if (isVisible && src != '' && !isLoaded) {
        const img = new Image();
        img.onload = (): void => {
          setImageSrc(src);
          setIsLoaded(true);
        };
        img.src = src;
      }
    }, [isVisible, src, isLoaded]);

    return { elementRef, imageSrc, isLoaded };
  },
};
