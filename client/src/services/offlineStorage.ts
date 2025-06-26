// Offline Storage Service using IndexedDB
// Provides persistent storage for planning data with conflict resolution

import { nanoid } from 'nanoid';

const DB_NAME = 'TeachingEngineOfflineDB';
const DB_VERSION = 1;

export interface OfflineChange {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'unit-plan' | 'lesson-plan' | 'daybook' | 'planner-state';
  entityId?: string;
  data: any;
  timestamp: number;
  synced: boolean;
  conflictResolution?: 'local' | 'remote' | 'merge';
}

export interface CachedData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

class OfflineStorageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for offline changes
        if (!db.objectStoreNames.contains('changes')) {
          const changesStore = db.createObjectStore('changes', { keyPath: 'id' });
          changesStore.createIndex('synced', 'synced', { unique: false });
          changesStore.createIndex('entity', 'entity', { unique: false });
          changesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store for cached data
        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
        }

        // Store for conflict resolution
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictsStore = db.createObjectStore('conflicts', { keyPath: 'id' });
          conflictsStore.createIndex('resolved', 'resolved', { unique: false });
        }
      };
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.init();
    }
    await this.initPromise;
  }

  // Save offline change
  async saveOfflineChange(change: Omit<OfflineChange, 'id' | 'timestamp' | 'synced'>): Promise<string> {
    await this.ensureInitialized();
    
    const fullChange: OfflineChange = {
      ...change,
      id: nanoid(),
      timestamp: Date.now(),
      synced: false
    };

    const transaction = this.db!.transaction(['changes'], 'readwrite');
    const store = transaction.objectStore('changes');
    
    return new Promise((resolve, reject) => {
      const request = store.add(fullChange);
      request.onsuccess = () => resolve(fullChange.id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all unsynced changes
  async getUnsyncedChanges(): Promise<OfflineChange[]> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['changes'], 'readonly');
    const store = transaction.objectStore('changes');
    const index = store.index('synced');

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(false));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Mark change as synced
  async markChangeSynced(changeId: string): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['changes'], 'readwrite');
    const store = transaction.objectStore('changes');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(changeId);
      
      getRequest.onsuccess = () => {
        const change = getRequest.result;
        if (change) {
          change.synced = true;
          const putRequest = store.put(change);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Cache data with optional expiration
  async cacheData(key: string, data: any, ttlMinutes?: number): Promise<void> {
    await this.ensureInitialized();

    const cachedData: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: ttlMinutes ? Date.now() + (ttlMinutes * 60 * 1000) : undefined
    };

    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');

    return new Promise((resolve, reject) => {
      const request = store.put(cachedData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Get cached data
  async getCachedData<T = any>(key: string): Promise<T | null> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (!result) {
          resolve(null);
          return;
        }

        // Check if expired
        if (result.expiresAt && result.expiresAt < Date.now()) {
          // Delete expired data
          this.deleteCachedData(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Delete cached data
  async deleteCachedData(key: string): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Clean up expired cache entries
  async cleanupExpiredCache(): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    const index = store.index('expiresAt');
    const now = Date.now();

    const range = IDBKeyRange.upperBound(now);
    const request = index.openCursor(range);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Save conflict for resolution
  async saveConflict(localData: any, remoteData: any, entity: string, entityId: string): Promise<string> {
    await this.ensureInitialized();

    const conflict = {
      id: nanoid(),
      entity,
      entityId,
      localData,
      remoteData,
      timestamp: Date.now(),
      resolved: false
    };

    const transaction = this.db!.transaction(['conflicts'], 'readwrite');
    const store = transaction.objectStore('conflicts');

    return new Promise((resolve, reject) => {
      const request = store.add(conflict);
      request.onsuccess = () => resolve(conflict.id);
      request.onerror = () => reject(request.error);
    });
  }

  // Get unresolved conflicts
  async getUnresolvedConflicts(): Promise<any[]> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['conflicts'], 'readonly');
    const store = transaction.objectStore('conflicts');
    const index = store.index('resolved');

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(false));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Resolve conflict
  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge', mergedData?: any): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['conflicts'], 'readwrite');
    const store = transaction.objectStore('conflicts');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(conflictId);
      
      getRequest.onsuccess = () => {
        const conflict = getRequest.result;
        if (conflict) {
          conflict.resolved = true;
          conflict.resolution = resolution;
          conflict.resolvedData = resolution === 'merge' ? mergedData : 
                                 resolution === 'local' ? conflict.localData : 
                                 conflict.remoteData;
          conflict.resolvedAt = Date.now();
          
          const putRequest = store.put(conflict);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Clear all offline data
  async clearAll(): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['changes', 'cache', 'conflicts'], 'readwrite');
    
    return new Promise((resolve, reject) => {
      transaction.objectStore('changes').clear();
      transaction.objectStore('cache').clear();
      transaction.objectStore('conflicts').clear();
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();

// Export types
export type { OfflineStorageService };