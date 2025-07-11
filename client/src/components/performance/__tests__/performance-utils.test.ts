import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { 
  useDebounced, 
  useThrottled, 
  useIntersectionObserver,
  useRenderPerformance,
  useOptimisticState,
  useVirtualizedList,
  PerformanceMonitor,
  MemoUtils,
  ImageUtils
} from '../performance-utils';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
});
window.IntersectionObserver = mockIntersectionObserver as any;

// Mock performance API
const mockPerformance = {
  now: vi.fn(),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByName: vi.fn(() => [{ duration: 100 }])
};
Object.defineProperty(globalThis, 'performance', {
  writable: true,
  configurable: true,
  value: mockPerformance
});

// Mock logger
vi.mock('../../../utils/logger', () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('performance-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebounced', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounced('initial', 500));
      expect(result.current).toBe('initial');
    });

    it('should debounce value updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounced(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      expect(result.current).toBe('initial');

      // Update value
      rerender({ value: 'updated', delay: 500 });
      expect(result.current).toBe('initial'); // Still initial

      // Fast forward time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current).toBe('updated');
    });

    it('should cancel previous timer on rapid updates', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounced(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      // Multiple rapid updates
      rerender({ value: 'update1', delay: 500 });
      act(() => vi.advanceTimersByTime(200));
      
      rerender({ value: 'update2', delay: 500 });
      act(() => vi.advanceTimersByTime(200));
      
      rerender({ value: 'update3', delay: 500 });
      act(() => vi.advanceTimersByTime(500));

      // Only the last update should apply
      expect(result.current).toBe('update3');
    });

    it('should handle delay changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounced(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'updated', delay: 200 });
      
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(result.current).toBe('updated');
    });
  });

  describe('useThrottled', () => {
    it('should throttle function calls', () => {
      const mockCallback = vi.fn();
      const { result } = renderHook(() => useThrottled(mockCallback, 500));

      // Call multiple times
      act(() => {
        result.current('first');
        result.current('second');
        result.current('third');
      });

      // Only first call should execute immediately
      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith('first');

      // Advance time
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Now another call can go through
      act(() => {
        result.current('fourth');
      });

      expect(mockCallback).toHaveBeenCalledTimes(2);
      expect(mockCallback).toHaveBeenCalledWith('fourth');
    });

    it('should cancel throttle on unmount', () => {
      const mockCallback = vi.fn();
      const { result, unmount } = renderHook(() => useThrottled(mockCallback, 500));

      act(() => {
        result.current('test');
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);

      unmount();

      // After unmount, advancing timers should not cause additional calls
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe('useIntersectionObserver', () => {
    it('should return ref and initial visibility state', () => {
      const { result } = renderHook(() => useIntersectionObserver());
      const [ref, isVisible] = result.current;

      expect(ref.current).toBeNull();
      expect(isVisible).toBe(false);
    });

    it('should observe element when ref is set', () => {
      const { result } = renderHook(() => useIntersectionObserver({ threshold: 0.5 }));
      const [ref] = result.current;

      const element = document.createElement('div');
      Object.defineProperty(ref, 'current', {
        writable: true,
        value: element
      });

      // Re-render to trigger effect
      const { rerender } = renderHook(() => useIntersectionObserver({ threshold: 0.5 }));
      rerender();

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold: 0.5 })
      );
    });

    it('should update visibility when intersection changes', () => {
      let observerCallback: (entries: any[]) => void = () => {};
      mockIntersectionObserver.mockImplementation((callback) => {
        observerCallback = callback;
        return {
          observe: vi.fn(),
          unobserve: vi.fn(),
          disconnect: vi.fn()
        };
      });

      const { result } = renderHook(() => useIntersectionObserver());
      const [ref] = result.current;
      
      // Set a mock element
      const element = document.createElement('div');
      Object.defineProperty(ref, 'current', {
        writable: true,
        value: element
      });

      // Re-render to trigger effect with element
      const { rerender } = renderHook(() => useIntersectionObserver());
      rerender();
      
      // Simulate intersection
      act(() => {
        observerCallback([{ isIntersecting: true }]);
      });

      expect(result.current[1]).toBe(true);

      // Simulate leaving viewport
      act(() => {
        observerCallback([{ isIntersecting: false }]);
      });

      expect(result.current[1]).toBe(false);
    });
  });

  describe('useRenderPerformance', () => {
    it('should track render count', () => {
      const { result, rerender } = renderHook(() => useRenderPerformance('TestComponent'));

      expect(result.current.renderCount).toBe(1);

      rerender();
      expect(result.current.renderCount).toBe(2);

      rerender();
      expect(result.current.renderCount).toBe(3);
    });

    it('should provide logRender function', () => {
      const { result } = renderHook(() => useRenderPerformance('TestComponent'));

      expect(typeof result.current.logRender).toBe('function');
      
      // Should not throw
      expect(() => result.current.logRender('test operation')).not.toThrow();
    });
  });

  describe('useOptimisticState', () => {
    it('should handle optimistic updates', async () => {
      const mockAsyncUpdate = vi.fn().mockResolvedValue('server-value');
      const { result } = renderHook(() => 
        useOptimisticState('initial', mockAsyncUpdate)
      );

      expect(result.current.value).toBe('initial');
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.error).toBeNull();

      // Perform optimistic update
      await act(async () => {
        await result.current.updateValue('optimistic');
      });

      expect(mockAsyncUpdate).toHaveBeenCalledWith('optimistic');
      expect(result.current.value).toBe('server-value');
      expect(result.current.isUpdating).toBe(false);
    });

    it('should rollback on error', async () => {
      const mockError = new Error('Update failed');
      const mockAsyncUpdate = vi.fn().mockRejectedValue(mockError);
      const { result } = renderHook(() => 
        useOptimisticState('initial', mockAsyncUpdate)
      );

      // Perform update that will fail
      await act(async () => {
        await result.current.updateValue('optimistic');
      });

      expect(result.current.value).toBe('initial'); // Rolled back
      expect(result.current.error).toBe(mockError);
      expect(result.current.isUpdating).toBe(false);
    });

    it('should handle non-Error rejections', async () => {
      const mockAsyncUpdate = vi.fn().mockRejectedValue('string error');
      const { result } = renderHook(() => 
        useOptimisticState('initial', mockAsyncUpdate)
      );

      await act(async () => {
        await result.current.updateValue('optimistic');
      });

      expect(result.current.value).toBe('initial');
      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Update failed');
    });
  });

  describe('useVirtualizedList', () => {
    it('should calculate visible range correctly', () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      const { result } = renderHook(() => 
        useVirtualizedList(items, 50, 300, 2)
      );

      expect(result.current.visibleRange).toEqual({
        start: 0,
        end: 7 // (300/50) + 2 overscan = 8, but 0-indexed so 7
      });
      expect(result.current.totalHeight).toBe(5000); // 100 * 50
    });

    it('should update visible range on scroll', () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      const { result } = renderHook(() => 
        useVirtualizedList(items, 50, 300, 2)
      );

      act(() => {
        result.current.setScrollTop(500);
      });

      expect(result.current.scrollTop).toBe(500);
      expect(result.current.visibleRange.start).toBe(8); // (500/50) - 2 overscan
      expect(result.current.visibleRange.end).toBe(17); // (500+300)/50 + 2 overscan
    });

    it('should handle edge cases at list boundaries', () => {
      const items = Array.from({ length: 10 }, (_, i) => i);
      const { result } = renderHook(() => 
        useVirtualizedList(items, 50, 300, 5)
      );

      // Scroll to bottom
      act(() => {
        result.current.setScrollTop(400);
      });

      expect(result.current.visibleRange.start).toBe(3); // Math.max(0, 8-5)
      expect(result.current.visibleRange.end).toBe(9); // Math.min(9, list length - 1)
    });
  });

  describe('PerformanceMonitor', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should measure render time', async () => {
      const mockRenderFn = vi.fn();
      mockPerformance.now
        .mockReturnValueOnce(1000)
        .mockReturnValueOnce(1010);

      PerformanceMonitor.measureRender('TestComponent', mockRenderFn);

      expect(mockRenderFn).toHaveBeenCalled();
      const logger = await import('../../../utils/logger');
      expect(logger.default.debug)
        .toHaveBeenCalledWith('TestComponent rendered in 10.00ms');
    });

    it('should measure async operations', async () => {
      const mockAsyncFn = vi.fn().mockResolvedValue('result');
      mockPerformance.now
        .mockReturnValueOnce(2000)
        .mockReturnValueOnce(2050);

      const result = await PerformanceMonitor.measureAsync('Test Operation', mockAsyncFn);

      expect(result).toBe('result');
      const logger = await import('../../../utils/logger');
      expect(logger.default.debug)
        .toHaveBeenCalledWith('Test Operation completed in 50.00ms');
    });

    it('should handle async operation errors', async () => {
      const mockError = new Error('Async failed');
      const mockAsyncFn = vi.fn().mockRejectedValue(mockError);
      mockPerformance.now
        .mockReturnValueOnce(3000)
        .mockReturnValueOnce(3100);

      await expect(PerformanceMonitor.measureAsync('Failed Operation', mockAsyncFn))
        .rejects.toThrow('Async failed');

      const logger = await import('../../../utils/logger');
      expect(logger.default.error)
        .toHaveBeenCalledWith('Failed Operation failed after 100.00ms:', mockError);
    });

    it('should create performance marks', () => {
      PerformanceMonitor.mark('test-mark');
      expect(mockPerformance.mark).toHaveBeenCalledWith('test-mark');
    });

    it('should measure between marks', () => {
      const duration = PerformanceMonitor.measure('test-measure', 'start', 'end');
      
      expect(mockPerformance.measure).toHaveBeenCalledWith('test-measure', 'start', 'end');
      expect(duration).toBe(100);
    });

    it('should handle measurement errors gracefully', async () => {
      mockPerformance.measure.mockImplementationOnce(() => {
        throw new Error('Measurement failed');
      });

      const duration = PerformanceMonitor.measure('failed-measure', 'start', 'end');
      
      expect(duration).toBe(0);
      const logger = await import('../../../utils/logger');
      expect(logger.default.warn)
        .toHaveBeenCalledWith('Performance measurement failed:', expect.any(Error));
    });
  });

  describe('MemoUtils', () => {
    describe('deepEqual', () => {
      it('should handle primitive values', () => {
        expect(MemoUtils.deepEqual(1, 1)).toBe(true);
        expect(MemoUtils.deepEqual('a', 'a')).toBe(true);
        expect(MemoUtils.deepEqual(true, true)).toBe(true);
        expect(MemoUtils.deepEqual(null, null)).toBe(true);
        expect(MemoUtils.deepEqual(undefined, undefined)).toBe(true);
        
        expect(MemoUtils.deepEqual(1, 2)).toBe(false);
        expect(MemoUtils.deepEqual('a', 'b')).toBe(false);
        expect(MemoUtils.deepEqual(true, false)).toBe(false);
        expect(MemoUtils.deepEqual(null, undefined)).toBe(false);
      });

      it('should handle objects', () => {
        expect(MemoUtils.deepEqual({ a: 1 }, { a: 1 })).toBe(true);
        expect(MemoUtils.deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
        expect(MemoUtils.deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
        
        expect(MemoUtils.deepEqual({ a: 1 }, { a: 2 })).toBe(false);
        expect(MemoUtils.deepEqual({ a: 1 }, { b: 1 })).toBe(false);
        expect(MemoUtils.deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      });

      it('should handle arrays', () => {
        expect(MemoUtils.deepEqual([1, 2, 3], [1, 2, 3])).toBe(true);
        expect(MemoUtils.deepEqual([[1, 2], [3, 4]], [[1, 2], [3, 4]])).toBe(true);
        
        expect(MemoUtils.deepEqual([1, 2], [1, 2, 3])).toBe(false);
        expect(MemoUtils.deepEqual([1, 2], [2, 1])).toBe(false);
      });

      it('should handle type differences', () => {
        expect(MemoUtils.deepEqual(1, '1')).toBe(false);
        expect(MemoUtils.deepEqual({}, [])).toBe(false);
        expect(MemoUtils.deepEqual(null, {})).toBe(false);
      });
    });

    describe('shallowEqual', () => {
      it('should perform shallow comparison', () => {
        const obj1 = { a: 1, b: 2 };
        const obj2 = { a: 1, b: 2 };
        const obj3 = { a: 1, b: 3 };
        const obj4 = { a: 1 };
        
        expect(MemoUtils.shallowEqual(obj1, obj2)).toBe(true);
        expect(MemoUtils.shallowEqual(obj1, obj3)).toBe(false);
        expect(MemoUtils.shallowEqual(obj1, obj4)).toBe(false);
      });

      it('should not perform deep comparison', () => {
        const obj1 = { a: { b: 1 } };
        const obj2 = { a: { b: 1 } };
        
        expect(MemoUtils.shallowEqual(obj1, obj2)).toBe(false); // Different object references
      });
    });

    describe('createSelector', () => {
      it('should memoize selector results', () => {
        const selector = vi.fn((state: { value: number }) => state.value * 2);
        const memoizedSelector = MemoUtils.createSelector(selector);

        const state1 = { value: 5 };
        const result1 = memoizedSelector(state1);
        expect(result1).toBe(10);
        expect(selector).toHaveBeenCalledTimes(1);

        // Same state, should not recalculate
        const result2 = memoizedSelector(state1);
        expect(result2).toBe(10);
        expect(selector).toHaveBeenCalledTimes(1);

        // Different state
        const state2 = { value: 7 };
        const result3 = memoizedSelector(state2);
        expect(result3).toBe(14);
        expect(selector).toHaveBeenCalledTimes(2);
      });

      it('should use custom equality function', () => {
        const selector = vi.fn((state: { data: number[] }) => state.data.reduce((a, b) => a + b, 0));
        const arrayEqual = (a: number, b: number) => a === b;
        const memoizedSelector = MemoUtils.createSelector(selector, arrayEqual);

        const state1 = { data: [1, 2, 3] };
        const result1 = memoizedSelector(state1);
        expect(result1).toBe(6);
        expect(selector).toHaveBeenCalledTimes(1);

        // Different object but same sum
        const state2 = { data: [2, 2, 2] };
        const result2 = memoizedSelector(state2);
        expect(result2).toBe(6);
        expect(selector).toHaveBeenCalledTimes(2); // Called again but result is same
      });
    });
  });

  describe('Strict Boolean Expression Tests', () => {
    describe('useThrottled', () => {
      it('should handle initial throttle state correctly', () => {
        const mockCallback = vi.fn();
        const { result } = renderHook(() => useThrottled(mockCallback, 100));

        // First call should go through
        act(() => {
          result.current('first');
        });
        expect(mockCallback).toHaveBeenCalledTimes(1);

        // Second immediate call should be throttled
        act(() => {
          result.current('second');
        });
        expect(mockCallback).toHaveBeenCalledTimes(1); // Still 1

        // After throttle period, next call should go through
        act(() => {
          vi.advanceTimersByTime(100);
          result.current('third');
        });
        expect(mockCallback).toHaveBeenCalledTimes(2);
      });
    });

    describe('PerformanceMonitor', () => {
      it('should handle performance API availability correctly', () => {
        const originalPerformance = globalThis.performance;
        
        // Test when performance is undefined
        Object.defineProperty(globalThis, 'performance', {
          writable: true,
          configurable: true,
          value: undefined
        });

        // Should not throw when performance is undefined
        expect(() => PerformanceMonitor.mark('test')).not.toThrow();
        expect(PerformanceMonitor.measure('test', 'start', 'end')).toBe(0);

        // Restore performance
        Object.defineProperty(globalThis, 'performance', {
          writable: true,
          configurable: true,
          value: originalPerformance
        });
      });
    });

    describe('MemoUtils.createSelector', () => {
      it('should handle initial state without result', () => {
        const selector = vi.fn((state: { value: number }) => state.value * 2);
        const memoizedSelector = MemoUtils.createSelector(selector);

        // First call - no previous result
        const result1 = memoizedSelector({ value: 5 });
        expect(result1).toBe(10);
        expect(selector).toHaveBeenCalledTimes(1);
      });

      it('should handle boolean hasResult flag correctly', () => {
        const selector = vi.fn((state: { value: number }) => state.value);
        const memoizedSelector = MemoUtils.createSelector(selector);

        // First call - hasResult is false
        const state1 = { value: 0 }; // falsy value
        const result1 = memoizedSelector(state1);
        expect(result1).toBe(0);
        expect(selector).toHaveBeenCalledTimes(1);

        // Same state - should use cached result
        const result2 = memoizedSelector(state1);
        expect(result2).toBe(0);
        expect(selector).toHaveBeenCalledTimes(1);
      });
    });

    describe('ImageUtils.useLazyImage', () => {
      it('should handle isLoaded boolean flag correctly', () => {
        const { result } = renderHook(() => 
          ImageUtils.useLazyImage('http://example.com/image.jpg')
        );

        // Initial state - not loaded
        expect(result.current.isLoaded).toBe(false);
        expect(result.current.imageSrc).toBe('');
      });

      it('should not reload if already loaded', async () => {
        let observerCallback: (entries: any[]) => void = () => {};
        mockIntersectionObserver.mockImplementation((callback) => {
          observerCallback = callback;
          return {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
          };
        });

        const mockImage = {
          onload: null as any,
          src: ''
        };
        const ImageConstructor = vi.fn(() => mockImage);
        (global as any).Image = ImageConstructor;

        const { result } = renderHook(() => 
          ImageUtils.useLazyImage('http://example.com/image.jpg')
        );

        // First intersection
        act(() => {
          observerCallback([{ isIntersecting: true }]);
        });

        await waitFor(() => {
          expect(ImageConstructor).toHaveBeenCalledTimes(1);
        });

        // Simulate load
        act(() => {
          if (mockImage.onload) mockImage.onload();
        });

        // Verify loaded state
        expect(result.current.isLoaded).toBe(true);

        // Clear mock to track new calls
        ImageConstructor.mockClear();

        // Second intersection when already loaded
        act(() => {
          observerCallback([{ isIntersecting: false }]);
          observerCallback([{ isIntersecting: true }]);
        });

        // Should not create new Image when already loaded
        expect(ImageConstructor).not.toHaveBeenCalled();
      });
    });
  });

  describe('ImageUtils', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { origin: 'http://localhost:3000' },
        writable: true
      });
    });

    describe('optimizeImageUrl', () => {
      it('should handle empty url', () => {
        expect(ImageUtils.optimizeImageUrl('')).toBe('');
        expect(ImageUtils.optimizeImageUrl('', 100, 100)).toBe('');
      });

      it('should add size parameters', () => {
        const url = ImageUtils.optimizeImageUrl('http://example.com/image.jpg', 200, 300, 85);
        expect(url).toContain('w=200');
        expect(url).toContain('h=300');
        expect(url).toContain('q=85');
      });

      it('should handle relative URLs', () => {
        const url = ImageUtils.optimizeImageUrl('/images/test.jpg', 100);
        expect(url).toContain('http://localhost:3000');
        expect(url).toContain('w=100');
      });

      it('should handle optional parameters', () => {
        const url1 = ImageUtils.optimizeImageUrl('http://example.com/image.jpg', 200);
        expect(url1).toContain('w=200');
        expect(url1).not.toContain('h=');
        expect(url1).not.toContain('q=');

        const url2 = ImageUtils.optimizeImageUrl('http://example.com/image.jpg', undefined, 300);
        expect(url2).not.toContain('w=');
        expect(url2).toContain('h=300');
      });
    });

    describe('createSrcSet', () => {
      it('should create srcset string', () => {
        const srcSet = ImageUtils.createSrcSet('http://example.com/image.jpg', [100, 200, 400]);
        expect(srcSet).toBe(
          'http://example.com/image.jpg?w=100 100w, ' +
          'http://example.com/image.jpg?w=200 200w, ' +
          'http://example.com/image.jpg?w=400 400w'
        );
      });

      it('should handle empty sizes array', () => {
        const srcSet = ImageUtils.createSrcSet('http://example.com/image.jpg', []);
        expect(srcSet).toBe('');
      });
    });

    describe('useLazyImage', () => {
      it('should start with placeholder', () => {
        const { result } = renderHook(() => 
          ImageUtils.useLazyImage('http://example.com/image.jpg', 'placeholder.jpg')
        );

        expect(result.current.imageSrc).toBe('placeholder.jpg');
        expect(result.current.isLoaded).toBe(false);
      });

      it('should load image when visible', async () => {
        let observerCallback: (entries: any[]) => void = () => {};
        mockIntersectionObserver.mockImplementation((callback) => {
          observerCallback = callback;
          return {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
          };
        });

        // Mock Image constructor
        const mockImage = {
          onload: null as any,
          src: ''
        };
        (global as any).Image = vi.fn(() => mockImage);

        const { result } = renderHook(() => 
          ImageUtils.useLazyImage('http://example.com/image.jpg')
        );

        // Simulate intersection
        act(() => {
          observerCallback([{ isIntersecting: true }]);
        });

        // Wait for effect
        await waitFor(() => {
          expect(mockImage.src).toBe('http://example.com/image.jpg');
        });

        // Simulate image load
        act(() => {
          if (mockImage.onload) mockImage.onload();
        });

        expect(result.current.imageSrc).toBe('http://example.com/image.jpg');
        expect(result.current.isLoaded).toBe(true);
      });

      it('should not load if not visible', () => {
        const mockImage = {
          onload: null as any,
          src: ''
        };
        (global as any).Image = vi.fn(() => mockImage);

        renderHook(() => 
          ImageUtils.useLazyImage('http://example.com/image.jpg')
        );

        expect(mockImage.src).toBe('');
      });

      it('should only load once', async () => {
        let observerCallback: (entries: any[]) => void = () => {};
        mockIntersectionObserver.mockImplementation((callback) => {
          observerCallback = callback;
          return {
            observe: vi.fn(),
            unobserve: vi.fn(),
            disconnect: vi.fn()
          };
        });

        const mockImage = {
          onload: null as any,
          src: ''
        };
        const ImageConstructor = vi.fn(() => mockImage);
        (global as any).Image = ImageConstructor;

        const { result } = renderHook(() => 
          ImageUtils.useLazyImage('http://example.com/image.jpg')
        );

        // First intersection
        act(() => {
          observerCallback([{ isIntersecting: true }]);
        });

        await waitFor(() => {
          expect(ImageConstructor).toHaveBeenCalledTimes(1);
        });

        // Simulate load
        act(() => {
          if (mockImage.onload) mockImage.onload();
        });

        // Second intersection should not create another Image
        act(() => {
          observerCallback([{ isIntersecting: false }]);
          observerCallback([{ isIntersecting: true }]);
        });

        expect(ImageConstructor).toHaveBeenCalledTimes(1); // Still only called once
      });
    });
  });
});