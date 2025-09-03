import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  usePerformanceMonitor, 
  getDeviceType, 
  getPerformanceWarning,
  PERFORMANCE_THRESHOLDS 
} from '../usePerformanceMonitor';

describe('usePerformanceMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('tracks node counts', () => {
    const { result } = renderHook(() => 
      usePerformanceMonitor(100, 50)
    );
    
    expect(result.current.nodeCount).toBe(100);
    expect(result.current.visibleNodeCount).toBe(50);
  });

  it('measures render time', () => {
    const { result, rerender } = renderHook(
      ({ nodeCount, visibleNodeCount }) => 
        usePerformanceMonitor(nodeCount, visibleNodeCount),
      {
        initialProps: { nodeCount: 10, visibleNodeCount: 5 }
      }
    );
    
    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    rerender({ nodeCount: 20, visibleNodeCount: 10 });
    
    expect(result.current.renderTime).toBeGreaterThan(0);
  });

  it('calculates FPS', () => {
    const { result } = renderHook(() => 
      usePerformanceMonitor(10, 5)
    );
    
    // Initial FPS should be 60
    expect(result.current.fps).toBe(60);
    
    // Simulate animation frames for 1 second
    act(() => {
      for (let i = 0; i < 30; i++) {
        vi.advanceTimersByTime(33); // ~30 FPS
      }
    });
    
    // FPS should update after 1 second
    act(() => {
      vi.advanceTimersByTime(100);
    });
  });
});

describe('getDeviceType', () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
  });

  it('detects mobile device', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });
    
    expect(getDeviceType()).toBe('mobile');
  });

  it('detects tablet device', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 800
    });
    
    expect(getDeviceType()).toBe('tablet');
  });

  it('detects desktop device', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1400
    });
    
    expect(getDeviceType()).toBe('desktop');
  });
});

describe('getPerformanceWarning', () => {
  it('warns about high node count on mobile', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400
    });
    
    const metrics = {
      renderTime: 50,
      fps: 60,
      memoryUsed: 100,
      nodeCount: 350,
      visibleNodeCount: 350
    };
    
    const warning = getPerformanceWarning(metrics);
    expect(warning).toContain('High node count');
  });

  it('blocks at maximum nodes', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 400
    });
    
    const metrics = {
      renderTime: 50,
      fps: 60,
      memoryUsed: 100,
      nodeCount: 600,
      visibleNodeCount: 600
    };
    
    const warning = getPerformanceWarning(metrics);
    expect(warning).toContain('Maximum');
    expect(warning).toContain('500');
  });

  it('warns about low FPS', () => {
    const metrics = {
      renderTime: 50,
      fps: 20,
      memoryUsed: 100,
      nodeCount: 100,
      visibleNodeCount: 100
    };
    
    const warning = getPerformanceWarning(metrics);
    expect(warning).toContain('Low frame rate');
    expect(warning).toContain('20 FPS');
  });

  it('warns about slow rendering', () => {
    const metrics = {
      renderTime: 150,
      fps: 60,
      memoryUsed: 100,
      nodeCount: 100,
      visibleNodeCount: 100
    };
    
    const warning = getPerformanceWarning(metrics);
    expect(warning).toContain('Slow rendering');
    expect(warning).toContain('150ms');
  });

  it('warns about high memory usage', () => {
    const metrics = {
      renderTime: 50,
      fps: 60,
      memoryUsed: 350,
      nodeCount: 100,
      visibleNodeCount: 100
    };
    
    const warning = getPerformanceWarning(metrics);
    expect(warning).toContain('High memory usage');
    expect(warning).toContain('350MB');
  });

  it('returns null when performance is good', () => {
    const metrics = {
      renderTime: 50,
      fps: 60,
      memoryUsed: 100,
      nodeCount: 100,
      visibleNodeCount: 100
    };
    
    expect(getPerformanceWarning(metrics)).toBeNull();
  });
});