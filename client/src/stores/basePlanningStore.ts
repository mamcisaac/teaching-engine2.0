// Base Planning Store with Offline Support
// Provides common offline functionality for all planning stores

import { StateCreator } from 'zustand';
import { offlineStorage, OfflineChange } from '../services/offlineStorage';
import { isOnline } from '../utils/serviceWorkerRegistration';

export interface OfflineState {
  isOnline: boolean;
  lastSyncedAt: Date | null;
  hasOfflineChanges: boolean;
  pendingChanges: number;
  syncStatus: 'idle' | 'syncing' | 'error';
  syncError: string | null;
}

export interface BaseActions {
  setOnlineStatus: (isOnline: boolean) => void;
  markOfflineChange: () => void;
  clearOfflineChanges: () => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error', error?: string) => void;
  updateLastSynced: () => void;
}

export interface SyncConfig<T> {
  entityType: 'unit-plan' | 'lesson-plan' | 'daybook' | 'planner-state';
  fetchFromServer: () => Promise<T>;
  saveToServer: (data: T) => Promise<void>;
  getCacheKey: () => string;
  mergingStrategy?: 'local-wins' | 'remote-wins' | 'merge';
}

// Create base store slice for offline functionality
export const createOfflineSlice = <T extends Record<string, unknown>>(
  config: SyncConfig<T>
): StateCreator<
  T & OfflineState & BaseActions,
  [],
  [],
  OfflineState & BaseActions
> => (set, get) => ({
  // Offline state
  isOnline: isOnline(),
  lastSyncedAt: null,
  hasOfflineChanges: false,
  pendingChanges: 0,
  syncStatus: 'idle',
  syncError: null,

  // Base actions
  setOnlineStatus: (isOnline) => set((state) => ({
    ...state,
    isOnline,
    ...(isOnline && state.hasOfflineChanges && (() => {
      // Trigger sync when coming back online
      setTimeout(() => {
        const currentState = get();
        if (currentState.syncStatus === 'idle') {
          syncWithServer(config, set, get);
        }
      }, 1000);
      return {};
    })())
  })),

  markOfflineChange: () => set((state) => ({
    ...state,
    hasOfflineChanges: true,
    pendingChanges: state.pendingChanges + 1
  })),

  clearOfflineChanges: () => set((state) => ({
    ...state,
    hasOfflineChanges: false,
    pendingChanges: 0
  })),

  setSyncStatus: (status, error) => set((state) => ({
    ...state,
    syncStatus: status,
    syncError: error || null
  })),

  updateLastSynced: () => set((state) => ({
    ...state,
    lastSyncedAt: new Date()
  })),
});

// Sync with server function
async function syncWithServer<T extends Record<string, unknown>>(
  config: SyncConfig<T>,
  set: (updater: (state: T & OfflineState & BaseActions) => T & OfflineState & BaseActions) => void,
  get: () => T & OfflineState & BaseActions
): Promise<void> {
  const state = get();
  
  // Don't sync if already syncing or offline
  if (state.syncStatus === 'syncing' || !state.isOnline) {
    return;
  }

  set((s) => ({
    ...s,
    syncStatus: 'syncing',
    syncError: null
  }));

  try {
    // Get pending offline changes
    const pendingChanges = await offlineStorage.getUnsyncedChanges();
    const relevantChanges = pendingChanges.filter(
      change => change.entity === config.entityType
    );

    if (relevantChanges.length > 0) {
      // Handle conflict resolution
      const serverData = await config.fetchFromServer();
      const conflictChanges: ChangeRecord[] = relevantChanges.map(change => ({
        id: change.id,
        entity: change.entity,
        data: change.data,
        timestamp: new Date(change.timestamp).toISOString()
      }));
      const conflicts = await detectConflicts(state, serverData, conflictChanges);

      if (conflicts.length > 0) {
        // Resolve conflicts based on strategy
        const resolvedData = await resolveConflicts(
          conflicts,
          state,
          serverData,
          config.mergingStrategy || 'local-wins'
        );
        
        // Save resolved data
        await config.saveToServer(resolvedData);
      } else {
        // No conflicts, save local changes
        await config.saveToServer(state);
      }

      // Mark changes as synced
      for (const change of relevantChanges) {
        await offlineStorage.markChangeSynced(change.id);
      }
    } else {
      // No offline changes, just fetch latest from server
      const serverData = await config.fetchFromServer();
      set((s) => ({ ...s, ...serverData }));
    }

    // Update sync status
    set((s) => ({
      ...s,
      lastSyncedAt: new Date(),
      hasOfflineChanges: false,
      pendingChanges: 0,
      syncStatus: 'idle'
    }));

    // Cache the latest data
    await offlineStorage.cacheData(config.getCacheKey(), state, 60); // Cache for 1 hour

  } catch (error) {
    console.error('Sync failed:', error);
    set((s) => ({
      ...s,
      syncStatus: 'error',
      syncError: error instanceof Error ? error.message : 'Sync failed'
    }));
  }
}

// Detect conflicts between local and server data
interface ConflictData {
  type: string;
  localData: unknown;
  serverData: unknown;
  changes: unknown[];
}

interface ChangeRecord {
  id: string;
  entity: string;
  data: unknown;
  timestamp: string;
}

async function detectConflicts(
  localData: Record<string, unknown>,
  serverData: Record<string, unknown>,
  changes: ChangeRecord[]
): Promise<ConflictData[]> {
  const conflicts = [];
  
  // Simple conflict detection based on timestamps
  const localTimestamp = localData.lastModified || localData.updatedAt;
  const serverTimestamp = serverData.lastModified || serverData.updatedAt;
  
  if (localTimestamp && serverTimestamp) {
    const localTime = new Date(localTimestamp as string | number | Date).getTime();
    const serverTime = new Date(serverTimestamp as string | number | Date).getTime();
    
    // If server has newer changes than our last sync
    if (serverTime > localTime) {
      conflicts.push({
        type: 'concurrent-edit',
        localData,
        serverData,
        changes
      });
    }
  }
  
  return conflicts;
}

// Resolve conflicts based on strategy
async function resolveConflicts(
  conflicts: ConflictData[],
  localData: Record<string, unknown>,
  serverData: Record<string, unknown>,
  strategy: 'local-wins' | 'remote-wins' | 'merge'
): Promise<Record<string, unknown>> {
  if (conflicts.length === 0) return localData;
  
  switch (strategy) {
    case 'local-wins':
      return localData;
      
    case 'remote-wins':
      return serverData;
      
    case 'merge': {
      // Simple merge strategy - combine arrays, prefer local for scalar values
      const merged = { ...serverData };
      
      for (const key in localData) {
        if (Array.isArray(localData[key]) && Array.isArray(serverData[key])) {
          // Merge arrays by combining unique items
          const combined = [...localData[key], ...serverData[key]];
          merged[key] = Array.from(new Set(combined.map(item => 
            typeof item === 'object' ? JSON.stringify(item) : item
          ))).map(item => 
            typeof item === 'string' && item.startsWith('{') ? JSON.parse(item) : item
          );
        } else if (localData[key] !== serverData[key]) {
          // For scalar values, prefer local
          merged[key] = localData[key];
        }
      }
      
      // Save conflict for user review
      await offlineStorage.saveConflict(
        localData,
        serverData,
        'planning-data',
(merged.id as string) || 'unknown'
      );
      
      return merged;
    }
      
    default:
      return localData;
  }
}

// Create debounced auto-save functionality
interface AutoSaveStore {
  getState: () => { hasOfflineChanges: boolean; isSaving?: boolean };
}

export function createAutoSave(
  store: AutoSaveStore,
  saveFunction: () => Promise<void>,
  debounceMs: number = 5000
): () => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return () => {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(async () => {
      const state = store.getState();
      
      if (state.hasOfflineChanges && !state.isSaving) {
        try {
          await saveFunction();
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, debounceMs);
  };
}

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    // Notify all stores about online status
    window.dispatchEvent(new CustomEvent('online-status-change', { 
      detail: { isOnline: true } 
    }));
  });
  
  window.addEventListener('offline', () => {
    // Notify all stores about offline status
    window.dispatchEvent(new CustomEvent('online-status-change', { 
      detail: { isOnline: false } 
    }));
  });
}