import { AlertTriangle, RefreshCw } from 'lucide-react';
import React, { useState, useCallback, useEffect, useRef } from 'react';

import { Button } from '../ui/Button';

import { LoadingSkeleton } from './LoadingSkeleton';

interface LoadDataResult<T> {
  data: T[];
  hasMore: boolean;
  total?: number;
}

interface ProgressiveDataLoaderProps<T> {
  loadData: (offset: number, limit: number) => Promise<LoadDataResult<T>>;
  renderItem: (item: T, index: number) => React.ReactNode;
  batchSize?: number;
  infiniteScroll?: boolean;
  threshold?: number; // Pixels from bottom to trigger load more
  className?: string;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  errorState?: React.ReactNode;
  onLoadMore?: (currentCount: number) => void;
}

export function ProgressiveDataLoader<T>({
  loadData,
  renderItem,
  batchSize = 20,
  infiniteScroll = false,
  threshold = 100,
  className = '',
  emptyState,
  loadingState,
  errorState,
  onLoadMore,
}: ProgressiveDataLoaderProps<T>): React.ReactElement {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | undefined>();

  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await loadData(0, batchSize);
      setItems(result.data);
      setHasMore(result.hasMore);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [loadData, batchSize]);

  // Load initial data
  useEffect(() => {
    return (): void => { // Cleanup
    };

    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      void loadInitialData();
    }
  }, [loadInitialData]);

  const loadMoreData = useCallback(async () => {
    if (loadingMore || !hasMore) {
return;
}

    setLoadingMore(true);
    setError(null);

    try {
      const result = await loadData(items.length, batchSize);
      setItems((prev) => [...prev, ...result.data]);
      setHasMore(result.hasMore);
      setTotal(result.total);
      onLoadMore?.(items.length + result.data.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more data');
    } finally {
      setLoadingMore(false);
    }
  }, [loadData, items.length, batchSize, hasMore, loadingMore, onLoadMore]);

  // Infinite scroll handler
  const handleScroll = useCallback((): void => {
    if (!infiniteScroll || !containerRef.current) {
return;
}

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const remainingScroll = scrollHeight - scrollTop - clientHeight;

    if (remainingScroll <= threshold && hasMore && !loadingMore) {
      void loadMoreData();
    }
  }, [infiniteScroll, threshold, hasMore, loadingMore, loadMoreData]);

  // Attach scroll listener for infinite scroll
  useEffect(() => {
    return (): void => { // Cleanup
    };

    if (!infiniteScroll) {
return;
}

    const container = containerRef.current;
    if (!container) {
return;
}

    container!.addEventListener('scroll', handleScroll);
    return (): void => {
 container!.removeEventListener('scroll', handleScroll); 
};
  }, [handleScroll, infiniteScroll]);

  const handleRetry = (): void => {
    setItems([]);
    setError(null);
    setHasMore(true);
    isInitialLoad.current = true;
    void loadInitialData();
  };

  // Error state
  if (error !== null && error !== '' && items.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        {errorState ?? (
          <>
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <div className="text-red-600 mb-4">Failed to load data</div>
            <div className="text-gray-500 text-sm mb-4">{error}</div>
            <Button aria-label="Click button" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </>
        )}
      </div>
    );
  }

  // Loading state for initial load
  if (loading && items.length === 0) {
    return (
      <div className={className} data-testid="progressive-loader-container">
        {loadingState ?? (
          <div className="space-y-4">
            {Array.from({ length: Math.min(batchSize, 10) }).map((_, index) => (
              <LoadingSkeleton key={index} variant="card" />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Empty state
  if (items.length === 0 && !loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        {emptyState ?? (
          <>
            <div className="text-gray-500 text-lg mb-2">No items found</div>
            <div className="text-gray-400 text-sm">Try adjusting your search criteria</div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${className} ${infiniteScroll ? 'overflow-auto' : ''}`}
      data-testid="progressive-loader-container"
      style={infiniteScroll ? { maxHeight: '600px' } : undefined}
    >
      {/* Progress indicator */}
      {(total !== null && total !== undefined && !isNaN(total) && total > 0) && (
        <div className="mb-4 text-sm text-gray-500">
          Showing {items.length} of {total} items
          {items.length < total && ` (${((items.length / total) * 100).toFixed(1)}% loaded)`}
        </div>
      )}

      {/* Items */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index}>{renderItem(item, index)}</div>
        ))}
      </div>

      {/* Load more section */}
      {hasMore && (
        <div className="mt-6 text-center">
          {loadingMore ? (
            <div className="py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2" />
              <div className="text-sm text-gray-500">Loading...</div>
            </div>
          ) : !infiniteScroll ? (
            <Button
              className="min-w-[120px]"
              disabled={loadingMore}
              variant="outline"
              onClick={(): void => {
 void loadMoreData(); 
}}
            >
              Load More
            </Button>
          ) : (
            <div className="py-2 text-xs text-gray-400">Scroll down to load more items</div>
          )}
        </div>
      )}

      {/* End of results indicator */}
      {!hasMore && items.length > 0 && (
        <div className="mt-6 text-center">
          <div className="text-sm text-gray-500 py-4 border-t">
            {(total !== null && total !== undefined && !isNaN(total) && total > 0) ? `All ${total} items loaded` : 'All items loaded'}
          </div>
        </div>
      )}

      {/* Error state for load more */}
      {(error !== null && error !== '') && items.length > 0 && (
        <div className="mt-4 text-center">
          <div className="text-red-600 text-sm mb-2">Failed to load more items</div>
          <Button aria-label="Click button" onClick={() => {
 void loadMoreData(); 
}}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
