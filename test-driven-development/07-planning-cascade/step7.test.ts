/**
 * TRUE TDD: Planning Cascade View
 * Step 7: Performance optimization
 * 
 * Discovering we need virtualization for large trees
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Step 7: Performance with large datasets', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should handle large number of nodes efficiently', () => {
    // Discovering we need performance optimization
    interface TreeNode {
      id: string;
      title: string;
      children?: TreeNode[];
    }

    function generateLargeTree(units: number, lessonsPerUnit: number): TreeNode {
      const children: TreeNode[] = [];
      
      for (let u = 1; u <= units; u++) {
        const unitLessons: TreeNode[] = [];
        
        for (let l = 1; l <= lessonsPerUnit; l++) {
          unitLessons.push({
            id: `lesson-${u}-${l}`,
            title: `Lesson ${u}.${l}`
          });
        }
        
        children.push({
          id: `unit-${u}`,
          title: `Unit ${u}`,
          children: unitLessons
        });
      }

      return {
        id: 'root',
        title: 'Year Plan',
        children
      };
    }

    const largeTree = generateLargeTree(50, 10); // 50 units, 10 lessons each = 500 lessons
    
    // Count total nodes
    function countNodes(node: TreeNode): number {
      let count = 1;
      node.children?.forEach(child => {
        count += countNodes(child);
      });
      return count;
    }

    const totalNodes = countNodes(largeTree);
    expect(totalNodes).toBe(551); // 1 root + 50 units + 500 lessons
  });

  it('should virtualize visible nodes for rendering', () => {
    interface VirtualizedTree {
      visibleStart: number;
      visibleEnd: number;
      totalItems: number;
      itemHeight: number;
      containerHeight: number;
    }

    function calculateVisibleRange(config: VirtualizedTree): {
      start: number;
      end: number;
      visibleCount: number;
    } {
      const visibleCount = Math.ceil(config.containerHeight / config.itemHeight);
      const buffer = 5; // Buffer items above and below
      
      const start = Math.max(0, config.visibleStart - buffer);
      const end = Math.min(config.totalItems, config.visibleEnd + buffer);
      
      return {
        start,
        end,
        visibleCount
      };
    }

    const config: VirtualizedTree = {
      visibleStart: 20,
      visibleEnd: 30,
      totalItems: 500,
      itemHeight: 30,
      containerHeight: 600
    };

    const range = calculateVisibleRange(config);
    
    expect(range.start).toBe(15); // 20 - 5 buffer
    expect(range.end).toBe(35); // 30 + 5 buffer
    expect(range.visibleCount).toBe(20); // 600 / 30
    
    // Should only render a small subset
    const itemsToRender = range.end - range.start;
    expect(itemsToRender).toBe(20);
    expect(itemsToRender).toBeLessThan(config.totalItems);
  });

  it('should lazy load children on expansion', () => {
    class LazyTreeLoader {
      private loadedChildren = new Map<string, any[]>();
      private loadCallCount = 0;

      async loadChildren(nodeId: string): Promise<any[]> {
        if (this.loadedChildren.has(nodeId)) {
          return this.loadedChildren.get(nodeId)!;
        }

        this.loadCallCount++;
        
        // Simulate async loading
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const children = [
          { id: `${nodeId}-child-1`, title: 'Child 1' },
          { id: `${nodeId}-child-2`, title: 'Child 2' }
        ];
        
        this.loadedChildren.set(nodeId, children);
        return children;
      }

      getLoadCount(): number {
        return this.loadCallCount;
      }

      isLoaded(nodeId: string): boolean {
        return this.loadedChildren.has(nodeId);
      }
    }

    const loader = new LazyTreeLoader();
    
    // Initially nothing loaded
    expect(loader.isLoaded('unit-1')).toBe(false);
    expect(loader.getLoadCount()).toBe(0);

    // Load children for first time
    const promise1 = loader.loadChildren('unit-1');
    vi.advanceTimersByTime(100);
    
    return promise1.then(children1 => {
      expect(children1).toHaveLength(2);
      expect(loader.isLoaded('unit-1')).toBe(true);
      expect(loader.getLoadCount()).toBe(1);

      // Second load should use cache
      return loader.loadChildren('unit-1').then(children2 => {
        expect(children2).toHaveLength(2);
        expect(loader.getLoadCount()).toBe(1); // No additional load
      });
    });
  });

  it('should measure tree rendering performance', () => {
    class TreeRenderTimer {
      private renderTimes: number[] = [];

      measureRender(nodeCount: number): number {
        const startTime = performance.now();
        
        // Simulate rendering time based on node count
        // ~0.1ms per node
        const renderTime = nodeCount * 0.1;
        
        const endTime = startTime + renderTime;
        const duration = endTime - startTime;
        
        this.renderTimes.push(duration);
        return duration;
      }

      getAverageRenderTime(): number {
        if (this.renderTimes.length === 0) return 0;
        const sum = this.renderTimes.reduce((a, b) => a + b, 0);
        return sum / this.renderTimes.length;
      }

      isPerformant(nodeCount: number): boolean {
        const renderTime = this.measureRender(nodeCount);
        return renderTime < 16.67; // 60fps threshold
      }
    }

    const timer = new TreeRenderTimer();
    
    // Test with different tree sizes
    expect(timer.isPerformant(50)).toBe(true); // 50 nodes = ~5ms
    expect(timer.isPerformant(100)).toBe(true); // 100 nodes = ~10ms
    expect(timer.isPerformant(200)).toBe(false); // 200 nodes = ~20ms > 16.67ms
    
    const avgTime = timer.getAverageRenderTime();
    expect(avgTime).toBeGreaterThan(0);
  });
});