// Request Batching Service
// Batches multiple API requests to reduce network overhead

import { apiClient } from '../api/core/client';
import { logger } from '../utils/logger';
interface BatchRequest {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  data?: unknown;
  headers?: Record<string, string>;
}

interface BatchResponse {
  id: string;
  status: number;
  data: unknown;
  error?: string;
}

interface PendingRequest {
  request: BatchRequest;
  resolve: (response: unknown) => void;
  reject: (error: unknown) => void;
}

// Type guard for API responses
interface ApiResponse {
  data: unknown;
}

function hasData(response: unknown): response is ApiResponse {
  return typeof response === 'object' && response !== null && 'data' in response;
}

class RequestBatcher {
  private pendingRequests = new Map<string, PendingRequest>();
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelay = 50; // ms to wait before sending batch
  private maxBatchSize = 10;

  // Add request to batch
  async addRequest(request: Omit<BatchRequest, 'id'>): Promise<unknown> {
    const id = `${request.method}-${request.url}-${Date.now()}-${Math.random()}`;
    const batchRequest: BatchRequest = { ...request, id };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        request: batchRequest,
        resolve,
        reject,
      });

      // Schedule batch processing
      this.scheduleBatch();
    });
  }

  // Schedule batch processing
  private scheduleBatch(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // If we've reached max batch size, process immediately
    if (this.pendingRequests.size >= this.maxBatchSize) {
      void this.processBatch().catch((error: unknown) => {
        logger.error('Error processing batch:', error);
      });
      return;
    }

    // Otherwise, wait for more requests
    this.batchTimeout = setTimeout(() => {
      void this.processBatch().catch((error: unknown) => {
        logger.error('Error processing batch timeout:', error);
      });
    }, this.batchDelay);
  }

  // Process pending batch
  private async processBatch(): Promise<void> {
    if (this.pendingRequests.size === 0) {
      return;
    }

    // Get all pending requests
    const requests = Array.from(this.pendingRequests.values());
    this.pendingRequests.clear();

    // Group by similar endpoints for more efficient batching
    const grouped = this.groupRequests(requests);

    // Process each group
    for (const group of grouped) {
      if (group.length === 1) {
        // Single request, send normally
        await this.processSingleRequest(group[0]);
      } else {
        // Multiple requests, batch them
        await this.processBatchedRequests(group);
      }
    }
  }

  // Group requests by endpoint pattern
  private groupRequests(requests: PendingRequest[]): PendingRequest[][] {
    const groups = new Map<string, PendingRequest[]>();

    for (const req of requests) {
      const key = this.getGroupKey(req.request);
      const group = groups.get(key) ?? [];
      group.push(req);
      groups.set(key, group);
    }

    return Array.from(groups.values());
  }

  // Get group key for request
  private getGroupKey(request: BatchRequest): string {
    // Group by base endpoint and method
    const urlParts = request.url.split('?')[0].split('/');
    const baseEndpoint = urlParts.slice(0, 3).join('/');
    return `${request.method}-${baseEndpoint}`;
  }

  // Process single request
  private async processSingleRequest(pending: PendingRequest): Promise<void> {
    try {
      let response;
      const { method, url, data, headers } = pending.request;

      switch (method) {
        case 'GET':
          response = await apiClient.get(url, { headers });
          break;
        case 'POST':
          response = await apiClient.post(url, data, { headers });
          break;
        case 'PUT':
          response = await apiClient.put(url, data, { headers });
          break;
        case 'DELETE':
          response = await apiClient.delete(url, { headers });
          break;
      }

      if (hasData(response)) {
        pending.resolve(response.data);
      } else {
        pending.resolve(response);
      }
    } catch (error) {
      pending.reject(error);
    }
  }

  // Process batched requests
  private async processBatchedRequests(requests: PendingRequest[]): Promise<void> {
    try {
      // Send batch request to server
      const batchData = {
        requests: requests.map((r) => ({
          id: r.request.id,
          method: r.request.method,
          url: r.request.url,
          data: r.request.data,
          headers: r.request.headers,
        })),
      };

      const response = await apiClient.post<{ responses: BatchResponse[] }>('/api/batch', batchData);
      const { responses } = response.data as { responses: BatchResponse[] };

      // Map responses back to promises
      const responseMap = new Map<string, BatchResponse>((responses).map((r): [string, BatchResponse] => [r.id, r]));

      for (const pending of requests) {
        const batchResponse = responseMap.get(pending.request.id);

        if (batchResponse) {
          if ('error' in batchResponse && batchResponse.error) {
            pending.reject(new Error(batchResponse.error));
          } else {
            pending.resolve(batchResponse.data);
          }
        } else {
          pending.reject(new Error('No response received for request'));
        }
      }
    } catch (error) {
      // If batch fails, fall back to individual requests
      logger.warn('Batch request failed, falling back to individual requests:', error);

      for (const pending of requests) {
        await this.processSingleRequest(pending);
      }
    }
  }

  // Configure batching parameters
  configure(options: { delay?: number; maxSize?: number }): void {
    if (options.delay !== undefined) {
      this.batchDelay = options.delay;
    }
    if (options.maxSize !== undefined) {
      this.maxBatchSize = options.maxSize;
    }
  }

  // Clear pending requests
  clear(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    // Reject all pending requests
    for (const pending of this.pendingRequests.values()) {
      pending.reject(new Error('Request cancelled'));
    }

    this.pendingRequests.clear();
  }
}

// Export singleton instance
export const requestBatcher = new RequestBatcher();

// Convenience methods for common operations
export const batchedApi = {
  get: (url: string, headers?: Record<string, string>): Promise<unknown> =>
    requestBatcher.addRequest({ method: 'GET', url, headers }),

  post: (url: string, data?: unknown, headers?: Record<string, string>): Promise<unknown> =>
    requestBatcher.addRequest({ method: 'POST', url, data, headers }),

  put: (url: string, data?: unknown, headers?: Record<string, string>): Promise<unknown> =>
    requestBatcher.addRequest({ method: 'PUT', url, data, headers }),

  delete: (url: string, headers?: Record<string, string>): Promise<unknown> =>
    requestBatcher.addRequest({ method: 'DELETE', url, headers }),
};

// Debounced request helper
export function createDebouncedRequest<
  TArgs extends unknown[],
  TReturn,
>(fn: (...args: TArgs) => Promise<TReturn>, delay = 300): ((...args: TArgs) => Promise<TReturn>) & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: TArgs | null = null;
  let lastPromise: Promise<TReturn> | null = null;

  const debounced = (...args: TArgs): Promise<TReturn> => {
    lastArgs = args;

    if (timeout) {
      clearTimeout(timeout);
    }

    if (!lastPromise) {
      lastPromise = new Promise<TReturn>((resolve, reject) => {
        timeout = setTimeout((): void => {
          void (async (): Promise<void> => {
            try {
              if (!lastArgs) {
                throw new Error('No arguments available');
              }
              const result = await fn(...lastArgs);
              resolve(result);
            } catch (error) {
              reject(error);
            } finally {
              timeout = null;
              lastPromise = null;
              lastArgs = null;
            }
          })();
        }, delay);
      });
    }

    return lastPromise;
  };

  debounced.cancel = (): void => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastPromise = null;
    lastArgs = null;
  };

  return debounced;
}
