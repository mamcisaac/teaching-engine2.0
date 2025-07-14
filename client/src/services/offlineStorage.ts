// Offline Storage Service using IndexedDB
// Provides persistent storage for planning data with conflict resolution

import { nanoid } from 'nanoid';

import { logger } from '../utils/logger';

// Generic data type for stored entities
export type StoredData = Record<string, unknown>;

const DB_NAME = 'TeachingEngineOfflineDB';
const DB_VERSION = 1;

export interface OfflineChange {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'unit-plan' | 'lesson-plan' | 'daybook' | 'planner-state';
  entityId?: string;
  data: StoredData;
  timestamp: number;
  synced: boolean;
  conflictResolution?: 'local' | 'remote' | 'merge';
}

export interface CachedData {
  key: string;
  data: StoredData;
  timestamp: number;
  expiresAt?: number;
}

export interface ConflictData {
  id: string;
  localData: StoredData;
  remoteData: StoredData;
  timestamp: number;
  resolved?: boolean;
  resolution?: 'local' | 'remote' | 'merge';
  resolvedData?: StoredData;
  resolvedAt?: number;
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

      request.onerror = (): void => {
        logger.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = (): void => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event): void => {
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
    if (this.initPromise === null) {
      this.initPromise = this.init();
    }
    await this.initPromise;
  }

  // Save offline change
  async saveOfflineChange(
    change: Omit<OfflineChange, 'id' | 'timestamp' | 'synced'>,
  ): Promise<string> {
    await this.ensureInitialized();

    const fullChange: OfflineChange = {
      ...change,
      id: nanoid(),
      timestamp: Date.now(),
      synced: false,
    };

    const transaction = this.db!.transaction(['changes'], 'readwrite');
    const store = transaction.objectStore('changes');

    return new Promise((resolve, reject) => {
      const request = store.add(fullChange);
      request.onsuccess = (): void => {
 resolve(fullChange.id); 
};
      request.onerror = (): void => {
 reject(request.error); 
};
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
      request.onsuccess = (): void => {
 resolve(request.result); 
};
      request.onerror = (): void => {
 reject(request.error); 
};
    });
  }

  // Mark change as synced
  async markChangeSynced(changeId: string): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['changes'], 'readwrite');
    const store = transaction.objectStore('changes');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(changeId);

      getRequest.onsuccess = (): void => {
        const change = getRequest.result as OfflineChange | undefined;
        if (change !== undefined) {
          change.synced = true;
          const putRequest = store.put(change);
          putRequest.onsuccess = (): void => {
 resolve(); 
};
          putRequest.onerror = (): void => {
 reject(putRequest.error); 
};
        } else {
          resolve();
        }
      };

      getRequest.onerror = (): void => {
 reject(getRequest.error); 
};
    });
  }

  // Cache data with optional expiration
  async cacheData(key: string, data: StoredData, ttlMinutes?: number): Promise<void> {
    await this.ensureInitialized();

    const cachedData: CachedData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: ttlMinutes !== undefined ? Date.now() + ttlMinutes * 60 * 1000 : undefined,
    };

    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');

    return new Promise((resolve, reject) => {
      const request = store.put(cachedData);
      request.onsuccess = (): void => {
 resolve(); 
};
      request.onerror = (): void => {
 reject(request.error); 
};
    });
  }

  // Get cached data
  async getCachedData<T = StoredData>(key: string): Promise<T | null> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['cache'], 'readonly');
    const store = transaction.objectStore('cache');

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = (): void => {
        const result = request.result as CachedData | undefined;
        if (result === undefined) {
          resolve(null);
          return;
        }

        // Check if expired
        if (result.expiresAt !== undefined && result.expiresAt < Date.now()) {
          // Delete expired data
          void this.deleteCachedData(key).catch((error: unknown) => {
            logger.error('Error deleting expired data:', error);
          });
          resolve(null);
          return;
        }

        resolve(result.data as T | null);
      };

      request.onerror = (): void => {
 reject(request.error); 
};
    });
  }

  // Delete cached data
  async deleteCachedData(key: string): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = (): void => {
 resolve(); 
};
      request.onerror = (): void => {
 reject(request.error); 
};
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
      request.onsuccess = (): void => {
        const cursor = request.result;
        if (cursor !== null) {
          store.delete(cursor.primaryKey);
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = (): void => {
 reject(request.error); 
};
    });
  }

  // Save conflict for resolution
  async saveConflict(
    localData: StoredData,
    remoteData: StoredData,
    entity: string,
    entityId: string,
  ): Promise<string> {
    await this.ensureInitialized();

    const conflict = {
      id: nanoid(),
      entity,
      entityId,
      localData,
      remoteData,
      timestamp: Date.now(),
      resolved: false,
    };

    const transaction = this.db!.transaction(['conflicts'], 'readwrite');
    const store = transaction.objectStore('conflicts');

    return new Promise((resolve, reject) => {
      const request = store.add(conflict);
      request.onsuccess = (): void => {
 resolve(conflict.id); 
};
      request.onerror = (): void => {
 reject(request.error); 
};
    });
  }

  // Get unresolved conflicts
  async getUnresolvedConflicts(): Promise<
    {
      id: string;
      entity: string;
      entityId: string;
      localData: StoredData;
      remoteData: StoredData;
      timestamp: number;
      resolved: boolean;
    }[]
  > {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['conflicts'], 'readonly');
    const store = transaction.objectStore('conflicts');
    const index = store.index('resolved');

    return new Promise((resolve, reject) => {
      const request = index.getAll(IDBKeyRange.only(false));
      request.onsuccess = (): void => {
 resolve(request.result); 
};
      request.onerror = (): void => {
 reject(request.error); 
};
    });
  }

  // Resolve conflict
  async resolveConflict(
    conflictId: string,
    resolution: 'local' | 'remote' | 'merge',
    mergedData?: StoredData,
  ): Promise<void> {
    await this.ensureInitialized();

    const transaction = this.db!.transaction(['conflicts'], 'readwrite');
    const store = transaction.objectStore('conflicts');

    return new Promise((resolve, reject) => {
      const getRequest = store.get(conflictId);

      getRequest.onsuccess = (): void => {
        const conflict = getRequest.result as ConflictData | undefined;
        if (conflict !== undefined) {
          conflict.resolved = true;
          conflict.resolution = resolution;
          conflict.resolvedData =
            resolution === 'merge'
              ? mergedData
              : resolution === 'local'
                ? conflict.localData
                : conflict.remoteData;
          conflict.resolvedAt = Date.now();

          const putRequest = store.put(conflict);
          putRequest.onsuccess = (): void => {
 resolve(); 
};
          putRequest.onerror = (): void => {
 reject(putRequest.error); 
};
        } else {
          resolve();
        }
      };

      getRequest.onerror = (): void => {
 reject(getRequest.error); 
};
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

      transaction.oncomplete = (): void => {
 resolve(); 
};
      transaction.onerror = (): void => {
 reject(transaction.error); 
};
    });
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageService();

// Export types
export type { OfflineStorageService };
