import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    // Initial value should be returned immediately
    expect(result.current).toBe('initial');

    // Change the value
    rerender({ value: 'updated', delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time by 250ms (half the delay)
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Value should still be the initial value
    expect(result.current).toBe('initial');

    // Fast-forward time by another 250ms (total 500ms)
    act(() => {
      vi.advanceTimersByTime(250);
    });

    // Now the value should be updated
    expect(result.current).toBe('updated');
  });

  it('should cancel previous timer when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    );

    // Change value multiple times rapidly
    rerender({ value: 'update1', delay: 500 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'update2', delay: 500 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: 'update3', delay: 500 });

    // Advance time by 500ms from the last update
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should only have the last value
    expect(result.current).toBe('update3');
  });

  it('should handle different data types', () => {
    // Test with number
    const { result: numberResult } = renderHook(() => useDebounce(42, 100));
    expect(numberResult.current).toBe(42);

    // Test with object
    const testObj = { foo: 'bar' };
    const { result: objectResult } = renderHook(() => useDebounce(testObj, 100));
    expect(objectResult.current).toBe(testObj);

    // Test with array
    const testArr = [1, 2, 3];
    const { result: arrayResult } = renderHook(() => useDebounce(testArr, 100));
    expect(arrayResult.current).toBe(testArr);

    // Test with null
    const { result: nullResult } = renderHook(() => useDebounce(null, 100));
    expect(nullResult.current).toBe(null);

    // Test with undefined
    const { result: undefinedResult } = renderHook(() => useDebounce(undefined, 100));
    expect(undefinedResult.current).toBe(undefined);
  });

  it('should update when delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 }
      }
    );

    // Change the value
    rerender({ value: 'updated', delay: 1000 });

    // Advance time by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Change the delay to a shorter time
    rerender({ value: 'updated', delay: 300 });

    // The effect should re-run with new delay
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Value should now be updated
    expect(result.current).toBe('updated');
  });

  it('should cleanup timer on unmount', () => {
    const { result, unmount } = renderHook(() => useDebounce('test', 500));

    // Verify initial value
    expect(result.current).toBe('test');

    // Unmount the hook
    unmount();

    // Advance timers - should not throw any errors
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });
});