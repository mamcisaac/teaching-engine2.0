import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
// Type-safe debounce implementation with cancel
interface DebounceFunction<T extends unknown[]> {
  (...args: T): void;
  cancel(): void;
}

const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  wait: number,
): DebounceFunction<T> => {
  let timeout: ReturnType<typeof setTimeout>;

  const debounced = (...args: T): void => {
    clearTimeout(timeout);
    timeout = setTimeout((): void => {
 func(...args); 
}, wait);
  };

  debounced.cancel = (): void => {
    clearTimeout(timeout);
  };

  return debounced;
};

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  renderItem: (props: { item: T; index: number; style: React.CSSProperties }) => React.ReactNode;
  onScrollEnd?: (scrollTop: number) => void;
  overscan?: number;
  className?: string;
  estimatedItemHeight?: number;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  renderItem,
  onScrollEnd,
  overscan = 5,
  className = '',
  estimatedItemHeight,
}: VirtualizedListProps<T>): JSX.Element {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const containerHeight = height;
    const itemCount = items.length;

    if (itemCount === 0) {
      return { start: 0, end: 0 };
    }

    const effectiveItemHeight = estimatedItemHeight ?? itemHeight;
    const startIndex = Math.floor(scrollTop / effectiveItemHeight);
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / effectiveItemHeight),
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: Math.min(itemCount - 1, endIndex + overscan),
    };
  }, [scrollTop, height, items.length, itemHeight, estimatedItemHeight, overscan]);

  // Visible items
  const visibleItems = useMemo(() => {
    const result: { index: number; item: T }[] = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (i < items.length) {
        result.push({
          index: i,
          item: items[i],
        });
      }
    }
    return result;
  }, [items, visibleRange.start, visibleRange.end]);

  // Total height for scrollbar
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  // Debounced scroll end handler
  const debouncedScrollEnd = useMemo(
    () =>
      debounce<[number]>((scrollTop: number) => {
        onScrollEnd?.(scrollTop);
      }, 150),
    [onScrollEnd],
  );

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      debouncedScrollEnd(newScrollTop);
    },
    [debouncedScrollEnd],
  );

  // Cleanup debounced function
  useEffect((): (() => void) => () => {
      debouncedScrollEnd.cancel();
    }, [debouncedScrollEnd]);

  // Scroll to position (useful for external control)
  const _scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      if (!containerRef.current) {
return;
}

      let scrollTop = index * itemHeight;

      if (align === 'center') {
        scrollTop -= height / 2 - itemHeight / 2;
      } else if (align === 'end') {
        scrollTop -= height - itemHeight;
      }

      containerRef.current.scrollTop = Math.max(0, scrollTop);
    },
    [itemHeight, height],
  );

  // Note: For external scroll methods, use the returned containerRef.current.scrollTop directly
  // and call scrollToIndex from the component instance

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      data-testid="virtualized-list-container"
      style={{ height }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        {visibleItems.map(({ item, index }) => {
          const style: React.CSSProperties = {
            position: 'absolute',
            top: index * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          };

          return (
            <div key={index} style={style}>
              {renderItem({ item, index, style })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// HOC for memoizing items
export function withVirtualizedMemo<T>(
  Component: React.ComponentType<{ item: T; index: number; style: React.CSSProperties }>,
): React.ComponentType<{ item: T; index: number; style: React.CSSProperties }> {
  return React.memo(Component, (prevProps, nextProps) => (
      prevProps.index === nextProps.index &&
      prevProps.item === nextProps.item &&
      prevProps.style.top === nextProps.style.top &&
      prevProps.style.height === nextProps.style.height
    ));
}
