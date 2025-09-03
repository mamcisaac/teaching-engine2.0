import { useEffect, useRef, useState, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  fps: number;
  memoryUsed: number | null;
  nodeCount: number;
  visibleNodeCount: number;
}

export function usePerformanceMonitor(
  nodeCount: number,
  visibleNodeCount: number
): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    fps: 60,
    memoryUsed: null,
    nodeCount: 0,
    visibleNodeCount: 0
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderStartRef = useRef(performance.now());
  
  // Track render time
  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    renderStartRef.current = performance.now();
    
    setMetrics(prev => ({
      ...prev,
      renderTime,
      nodeCount,
      visibleNodeCount
    }));
  }, [nodeCount, visibleNodeCount]);
  
  // Track FPS
  useEffect(() => {
    let animationId: number;
    
    const measureFPS = () => {
      frameCountRef.current++;
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      
      // Update FPS every second
      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
        
        setMetrics(prev => ({ ...prev, fps }));
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    animationId = requestAnimationFrame(measureFPS);
    
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  // Track memory usage (if available)
  useEffect(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryUsed = Math.round(memory.usedJSHeapSize / 1048576); // Convert to MB
      
      setMetrics(prev => ({ ...prev, memoryUsed }));
    }
  }, [nodeCount]); // Update when node count changes
  
  return metrics;
}

// Conservative performance thresholds
// Note: These are estimates - actual performance varies by device
export const PERFORMANCE_THRESHOLDS = {
  maxNodes: {
    mobile: 500,     // Conservative limit for mobile
    tablet: 1000,    // Medium devices
    desktop: 2000    // Desktop browsers
  },
  warningNodes: {
    mobile: 300,
    tablet: 700,
    desktop: 1500
  },
  minFPS: 30,
  maxRenderTime: 100, // ms
  maxMemory: 300 // MB
};

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function getPerformanceWarning(metrics: PerformanceMetrics): string | null {
  const device = getDeviceType();
  const thresholds = PERFORMANCE_THRESHOLDS;
  
  // Check node count
  if (metrics.nodeCount >= thresholds.maxNodes[device]) {
    return `Maximum nodes (${thresholds.maxNodes[device]}) reached for ${device}. Performance will degrade.`;
  }
  
  if (metrics.nodeCount >= thresholds.warningNodes[device]) {
    return `High node count (${metrics.nodeCount}). Consider collapsing some branches.`;
  }
  
  // Check FPS
  if (metrics.fps < thresholds.minFPS) {
    return `Low frame rate detected (${metrics.fps} FPS). Try collapsing some nodes.`;
  }
  
  // Check render time
  if (metrics.renderTime > thresholds.maxRenderTime) {
    return `Slow rendering detected (${Math.round(metrics.renderTime)}ms).`;
  }
  
  // Check memory
  if (metrics.memoryUsed && metrics.memoryUsed > thresholds.maxMemory) {
    return `High memory usage (${metrics.memoryUsed}MB). Consider refreshing the page.`;
  }
  
  return null;
}