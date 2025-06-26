// Lazy Loading Service for Large Documents
// Provides efficient loading of curriculum documents with caching

import React from 'react';
import { offlineStorage } from './offlineStorage';
import { api } from '../lib/api';

interface LoadOptions {
  cache?: boolean;
  cacheTime?: number; // minutes
  priority?: 'high' | 'normal' | 'low';
  onProgress?: (progress: number) => void;
}

interface ChunkedDocument {
  id: string;
  totalChunks: number;
  chunks: Map<number, unknown>;
  metadata: {
    title: string;
    size: number;
    type: string;
    lastModified: string;
  };
}

class LazyLoader {
  private loadingQueue: Map<string, Promise<unknown>> = new Map();
  private documentCache: Map<string, ChunkedDocument> = new Map();
  private intersectionObserver: IntersectionObserver | null = null;

  constructor() {
    // Set up intersection observer for lazy loading
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              const documentId = element.dataset.lazyDocumentId;
              if (documentId) {
                this.loadDocument(documentId);
              }
            }
          });
        },
        {
          rootMargin: '50px' // Start loading 50px before element is visible
        }
      );
    }
  }

  // Load document with caching and progress tracking
  async loadDocument(
    documentId: string, 
    options: LoadOptions = {}
  ): Promise<unknown> {
    const {
      cache = true,
      cacheTime = 60,
      priority = 'normal',
      onProgress
    } = options;

    // Check if already loading
    const existingLoad = this.loadingQueue.get(documentId);
    if (existingLoad) {
      return existingLoad;
    }

    // Check memory cache
    const cached = this.documentCache.get(documentId);
    if (cached && this.isDocumentComplete(cached)) {
      return this.assembleDocument(cached);
    }

    // Check offline storage cache
    if (cache) {
      const storedDoc = await offlineStorage.getCachedData(`document-${documentId}`);
      if (storedDoc) {
        return storedDoc;
      }
    }

    // Load document
    const loadPromise = this.performLoad(documentId, { onProgress, priority });
    this.loadingQueue.set(documentId, loadPromise);

    try {
      const document = await loadPromise;
      
      // Cache if requested
      if (cache) {
        await offlineStorage.cacheData(`document-${documentId}`, document, cacheTime);
      }
      
      return document;
    } finally {
      this.loadingQueue.delete(documentId);
    }
  }

  // Perform the actual document load
  private async performLoad(
    documentId: string,
    options: { onProgress?: (progress: number) => void; priority: string }
  ): Promise<unknown> {
    try {
      // Get document metadata first
      const metaResponse = await api.get(`/api/documents/${documentId}/metadata`);
      const metadata = metaResponse.data;

      // For small documents, load in one request
      if (metadata.size < 1024 * 1024) { // Less than 1MB
        const response = await api.get(`/api/documents/${documentId}`);
        options.onProgress?.(100);
        return response.data;
      }

      // For large documents, load in chunks
      const chunkSize = 256 * 1024; // 256KB chunks
      const totalChunks = Math.ceil(metadata.size / chunkSize);
      
      const chunkedDoc: ChunkedDocument = {
        id: documentId,
        totalChunks,
        chunks: new Map(),
        metadata
      };

      // Load chunks with priority queue
      const chunkPromises = [];
      for (let i = 0; i < totalChunks; i++) {
        const chunkPromise = this.loadChunk(documentId, i, totalChunks);
        chunkPromises.push(chunkPromise);
        
        // Update progress
        chunkPromise.then(() => {
          const progress = ((i + 1) / totalChunks) * 100;
          options.onProgress?.(progress);
        });
      }

      // Wait for all chunks
      const chunks = await Promise.all(chunkPromises);
      
      // Store chunks
      chunks.forEach((chunk, index) => {
        chunkedDoc.chunks.set(index, chunk);
      });

      // Cache in memory
      this.documentCache.set(documentId, chunkedDoc);

      // Assemble and return
      return this.assembleDocument(chunkedDoc);

    } catch (error) {
      console.error('Failed to load document:', error);
      throw error;
    }
  }

  // Load individual chunk
  private async loadChunk(
    documentId: string, 
    chunkIndex: number, 
    totalChunks: number
  ): Promise<unknown> {
    const response = await api.get(
      `/api/documents/${documentId}/chunk/${chunkIndex}`,
      {
        headers: {
          'X-Total-Chunks': totalChunks.toString()
        }
      }
    );
    return response.data;
  }

  // Check if all chunks are loaded
  private isDocumentComplete(doc: ChunkedDocument): boolean {
    return doc.chunks.size === doc.totalChunks;
  }

  // Assemble chunks into complete document
  private assembleDocument(doc: ChunkedDocument): unknown {
    const chunks = [];
    for (let i = 0; i < doc.totalChunks; i++) {
      const chunk = doc.chunks.get(i);
      if (!chunk) {
        throw new Error(`Missing chunk ${i} for document ${doc.id}`);
      }
      chunks.push(chunk);
    }

    // Combine chunks based on document type
    if (doc.metadata.type === 'json') {
      return JSON.parse(chunks.join(''));
    } else if (doc.metadata.type === 'text') {
      return chunks.join('');
    } else {
      // Binary data
      return new Blob(chunks);
    }
  }

  // Observe element for lazy loading
  observeElement(element: HTMLElement, documentId: string) {
    if (this.intersectionObserver) {
      element.dataset.lazyDocumentId = documentId;
      this.intersectionObserver.observe(element);
    }
  }

  // Stop observing element
  unobserveElement(element: HTMLElement) {
    if (this.intersectionObserver) {
      this.intersectionObserver.unobserve(element);
    }
  }

  // Preload documents for offline use
  async preloadDocuments(documentIds: string[], onProgress?: (current: number, total: number) => void) {
    let completed = 0;
    const total = documentIds.length;

    const promises = documentIds.map(async (id) => {
      try {
        await this.loadDocument(id, { cache: true });
        completed++;
        onProgress?.(completed, total);
      } catch (error) {
        console.error(`Failed to preload document ${id}:`, error);
      }
    });

    await Promise.all(promises);
  }

  // Clear caches
  clearCache(documentId?: string) {
    if (documentId) {
      this.documentCache.delete(documentId);
      offlineStorage.deleteCachedData(`document-${documentId}`);
    } else {
      this.documentCache.clear();
      // Clear all document caches from storage
      // This would need to be implemented in offlineStorage
    }
  }

  // Get cache status
  getCacheStatus(): { memoryCache: number; loading: number } {
    return {
      memoryCache: this.documentCache.size,
      loading: this.loadingQueue.size
    };
  }
}

// Export singleton instance
export const lazyLoader = new LazyLoader();

// React hook for lazy loading
export function useLazyDocument(documentId: string | null, options?: LoadOptions) {
  const [document, setDocument] = React.useState<unknown>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!documentId) return;

    let cancelled = false;

    const loadDocument = async () => {
      setLoading(true);
      setError(null);
      setProgress(0);

      try {
        const doc = await lazyLoader.loadDocument(documentId, {
          ...options,
          onProgress: (p) => {
            if (!cancelled) {
              setProgress(p);
              options?.onProgress?.(p);
            }
          }
        });

        if (!cancelled) {
          setDocument(doc);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to load document'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [documentId, options]);

  return { document, loading, error, progress };
}

// React component for lazy loaded content
interface LazyDocumentProps {
  documentId: string;
  render: (document: unknown) => React.ReactNode;
  placeholder?: React.ReactNode;
  onError?: (error: Error) => void;
}

export function LazyDocument({ 
  documentId, 
  render, 
  placeholder,
  onError 
}: LazyDocumentProps) {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const { document, loading, error } = useLazyDocument(documentId);

  React.useEffect(() => {
    const element = elementRef.current;
    if (element) {
      lazyLoader.observeElement(element, documentId);
    }

    return () => {
      if (element) {
        lazyLoader.unobserveElement(element);
      }
    };
  }, [documentId]);

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  return (
    <div ref={elementRef}>
      {loading && (placeholder || <div>Loading...</div>)}
      {error && <div>Error loading document: {error.message}</div>}
      {document && render(document)}
    </div>
  );
}