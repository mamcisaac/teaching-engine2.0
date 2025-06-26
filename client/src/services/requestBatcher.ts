// Request Batching Service
// Batches multiple API requests to reduce network overhead

import { api } from '../lib/api';

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

class RequestBatcher {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelay: number = 50; // ms to wait before sending batch
  private maxBatchSize: number = 10;

  // Add request to batch
  async addRequest(request: Omit<BatchRequest, 'id'>): Promise<unknown> {
    const id = `${request.method}-${request.url}-${Date.now()}-${Math.random()}`;
    const batchRequest: BatchRequest = { ...request, id };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        request: batchRequest,
        resolve,
        reject
      });

      // Schedule batch processing
      this.scheduleBatch();
    });
  }

  // Schedule batch processing
  private scheduleBatch() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // If we've reached max batch size, process immediately
    if (this.pendingRequests.size >= this.maxBatchSize) {
      this.processBatch();
      return;
    }

    // Otherwise, wait for more requests
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.batchDelay);
  }

  // Process pending batch
  private async processBatch() {
    if (this.pendingRequests.size === 0) return;

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
      const group = groups.get(key) || [];
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
  private async processSingleRequest(pending: PendingRequest) {
    try {
      let response;
      const { method, url, data, headers } = pending.request;

      switch (method) {
        case 'GET':
          response = await api.get(url, { headers });
          break;
        case 'POST':
          response = await api.post(url, data, { headers });
          break;
        case 'PUT':
          response = await api.put(url, data, { headers });
          break;
        case 'DELETE':
          response = await api.delete(url, { headers });
          break;
      }

      pending.resolve(response.data);
    } catch (error) {
      pending.reject(error);
    }
  }

  // Process batched requests
  private async processBatchedRequests(requests: PendingRequest[]) {
    try {
      // Send batch request to server
      const batchData = {
        requests: requests.map(r => ({
          id: r.request.id,
          method: r.request.method,
          url: r.request.url,
          data: r.request.data,
          headers: r.request.headers
        }))
      };

      const response = await api.post('/api/batch', batchData);
      const responses: BatchResponse[] = response.data.responses;

      // Map responses back to promises
      const responseMap = new Map(responses.map(r => [r.id, r]));

      for (const pending of requests) {
        const batchResponse = responseMap.get(pending.request.id);
        
        if (batchResponse) {
          if (batchResponse.error) {
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
      console.warn('Batch request failed, falling back to individual requests:', error);
      
      for (const pending of requests) {
        await this.processSingleRequest(pending);
      }
    }
  }

  // Configure batching parameters
  configure(options: { delay?: number; maxSize?: number }) {
    if (options.delay !== undefined) {
      this.batchDelay = options.delay;
    }
    if (options.maxSize !== undefined) {
      this.maxBatchSize = options.maxSize;
    }
  }

  // Clear pending requests
  clear() {
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
  get: (url: string, headers?: Record<string, string>) => 
    requestBatcher.addRequest({ method: 'GET', url, headers }),
  
  post: (url: string, data?: unknown, headers?: Record<string, string>) => 
    requestBatcher.addRequest({ method: 'POST', url, data, headers }),
  
  put: (url: string, data?: unknown, headers?: Record<string, string>) => 
    requestBatcher.addRequest({ method: 'PUT', url, data, headers }),
  
  delete: (url: string, headers?: Record<string, string>) => 
    requestBatcher.addRequest({ method: 'DELETE', url, headers })
};

// Debounced request helper
export function createDebouncedRequest<T extends (...args: Parameters<T>) => Promise<ReturnType<T>>>(
  fn: T,
  delay: number = 300
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastPromise: Promise<ReturnType<T>> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;

    if (timeout) {
      clearTimeout(timeout);
    }

    if (!lastPromise) {
      lastPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(async () => {
          try {
            const result = await fn(...(lastArgs as Parameters<T>));
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            timeout = null;
            lastPromise = null;
            lastArgs = null;
          }
        }, delay);
      });
    }

    return lastPromise;
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    lastPromise = null;
    lastArgs = null;
  };

  return debounced as T & { cancel: () => void };
}