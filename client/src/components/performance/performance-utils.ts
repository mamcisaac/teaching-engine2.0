import { useCallback, useEffect, useRef, useState } from 'react';
// Simple debounce and throttle implementations
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
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
export function useThrottled<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useRef(throttle(callback, delay)).current;

  useEffect(() => {
    return () => {
      throttledCallback.cancel();
    };
  }, [throttledCallback]);

  return throttledCallback as T;
}

/**
 * Hook for detecting when an element enters viewport (for lazy loading)
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<Element>, boolean] {
  const elementRef = useRef<Element>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options.threshold, options.rootMargin]);

  return [elementRef, isVisible];
}

/**
 * Hook for measuring render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderStart = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStart.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
  });

  return {
    renderCount: renderCount.current,
    logRender: (operation: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} ${operation} at render #${renderCount.current}`);
      }
    },
  };
}

/**
 * Hook for managing component state with optimistic updates
 */
export function useOptimisticState<T>(
  initialValue: T,
  asyncUpdate: (value: T) => Promise<T>
) {
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
    [value, asyncUpdate]
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
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useCallback(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );

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
  measureRender: (componentName: string, renderFn: () => void) => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered in ${(end - start).toFixed(2)}ms`);
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
        console.log(`${operation} completed in ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    } catch (error) {
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`${operation} failed after ${(end - start).toFixed(2)}ms:`, error);
      }
      
      throw error;
    }
  },

  /**
   * Create a performance mark for complex operations
   */
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  /**
   * Measure time between two marks
   */
  measure: (name: string, startMark: string, endMark: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measures = performance.getEntriesByName(name, 'measure');
        const duration = measures[measures.length - 1]?.duration;
        
        if (process.env.NODE_ENV === 'development' && duration) {
          console.log(`${name}: ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      } catch (error) {
        console.warn('Performance measurement failed:', error);
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
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      return keysA.every(key => 
        MemoUtils.deepEqual((a as any)[key], (b as any)[key])
      );
    }

    return false;
  },

  /**
   * Shallow comparison for most memo scenarios
   */
  shallowEqual: <T extends Record<string, any>>(a: T, b: T): boolean => {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => a[key] === b[key]);
  },

  /**
   * Create a memoized selector for complex state
   */
  createSelector: <TState, TResult>(
    selector: (state: TState) => TResult,
    equalityFn: (a: TResult, b: TResult) => boolean = Object.is
  ) => {
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
    if (!url) return '';
    
    const urlObj = new URL(url, window.location.origin);
    
    if (width) urlObj.searchParams.set('w', width.toString());
    if (height) urlObj.searchParams.set('h', height.toString());
    if (quality) urlObj.searchParams.set('q', quality.toString());
    
    return urlObj.toString();
  },

  /**
   * Create srcSet for responsive images
   */
  createSrcSet: (baseUrl: string, sizes: number[]): string => {
    return sizes
      .map(size => `${ImageUtils.optimizeImageUrl(baseUrl, size)} ${size}w`)
      .join(', ');
  },

  /**
   * Lazy load images with intersection observer
   */
  useLazyImage: (src: string, placeholder?: string) => {
    const [imageSrc, setImageSrc] = useState(placeholder || '');
    const [isLoaded, setIsLoaded] = useState(false);
    const [elementRef, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    useEffect(() => {
      if (isVisible && src && !isLoaded) {
        const img = new Image();
        img.onload = () => {
          setImageSrc(src);
          setIsLoaded(true);
        };
        img.src = src;
      }
    }, [isVisible, src, isLoaded]);

    return { elementRef, imageSrc, isLoaded };
  },
};