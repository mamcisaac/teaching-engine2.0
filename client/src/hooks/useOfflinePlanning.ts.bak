// Hook for using offline-capable planning stores
// Example of how to integrate offline functionality into components

import { useEffect, useMemo, useState } from 'react';

import { lazyLoader } from '../services/lazyLoader';
import type { StoredData } from '../services/offlineStorage';
import { offlineStorage } from '../services/offlineStorage';
import { batchedApi } from '../services/requestBatcher';
import { useDaybookStore } from '../stores/daybookStore';
import { useLessonPlanStore } from '../stores/lessonPlanStore';
import { useUnitPlanStore } from '../stores/unitPlanStore';
import { useWeeklyPlannerStore } from '../stores/weeklyPlannerStore';
import { logger } from '../utils/logger';

// Type guards
interface HasId {
  id: string;
}

interface ApiResponse {
  data: unknown;
}

function isApiResponse(value: unknown): value is ApiResponse {
  return typeof value === 'object' && value !== null && 'data' in value;
}

function hasId(value: unknown): value is HasId {
  return typeof value === 'object' && value !== null && 'id' in value && typeof (value as { id: unknown }).id === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Store interfaces with proper typing
interface UnitPlanStoreActions {
  loadUnitPlan: (id: string) => Promise<void>;
  updateUnitPlan: (id: string, updates: Record<string, unknown>) => Promise<void>;
  deleteUnitPlan: (id: string) => Promise<void>;
}

interface UnitPlanStoreState {
  currentPlan: HasId | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  isOnline: boolean;
  hasOfflineChanges: boolean;
  pendingChanges: number;
  syncStatus: 'idle' | 'syncing' | 'error';
}

type UnitPlanStoreType = UnitPlanStoreActions & UnitPlanStoreState;
// Combined offline planning hook
export function useOfflinePlanning(): {
  unitPlanStore: ReturnType<typeof useUnitPlanStore>;
  lessonPlanStore: ReturnType<typeof useLessonPlanStore>;
  daybookStore: ReturnType<typeof useDaybookStore>;
  weeklyPlannerStore: ReturnType<typeof useWeeklyPlannerStore>;
  conflicts: { id: string; [key: string]: unknown }[];
  resolveConflict: (conflictId: string, resolution: 'local' | 'remote' | 'merge', mergedData?: unknown) => Promise<void>;
  preloadCurriculum: (documentIds: string[]) => Promise<void>;
  isOnline: boolean;
  syncStatus: 'error' | 'syncing' | 'idle';
  totalPendingChanges: number;
} {
  const unitPlanStore = useUnitPlanStore();
  const lessonPlanStore = useLessonPlanStore();
  const daybookStore = useDaybookStore();
  const weeklyPlannerStore = useWeeklyPlannerStore();

  const [conflicts, setConflicts] = useState<{ id: string; [key: string]: unknown }[]>([]);

  // Check for conflicts on mount
  useEffect(() => {
    return () => { // Cleanup
    };

    const checkConflicts = async (): Promise<void> => {
      const unresolvedConflicts = await offlineStorage.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts);
    };
    void checkConflicts();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync all stores when coming online
  useEffect(() => {
    return () => { // Cleanup
    };

    const handleOnline = (): void => {
      // Sync all stores
      if (unitPlanStore.hasOfflineChanges) {
        void unitPlanStore.loadUnitPlans();
      }
      if (lessonPlanStore.hasOfflineChanges) {
        void lessonPlanStore.loadLessonPlans();
      }
      if (daybookStore.hasOfflineChanges) {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        void daybookStore.loadEntries(startDate, endDate);
      }
      if (weeklyPlannerStore.hasOfflineChanges) {
        void weeklyPlannerStore.syncWithServer();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => {
 window.removeEventListener('online', handleOnline); 
};
  }, [unitPlanStore, lessonPlanStore, daybookStore, weeklyPlannerStore]);

  // Resolve conflict
  const resolveConflict = async (
    conflictId: string, 
    resolution: 'local' | 'remote' | 'merge', 
    mergedData?: unknown
  ): Promise<void> => {
    await offlineStorage.resolveConflict(conflictId, resolution, mergedData as StoredData | undefined);
    setConflicts(conflicts.filter(c => c.id !== conflictId));
  };

  // Preload curriculum documents for offline use
  const preloadCurriculum = async (documentIds: string[]): Promise<void> => {
    await lazyLoader.preloadDocuments(documentIds, (current, total): void => {
      logger.info(`Preloading curriculum: ${current}/${total}`);
    });
  };

  // Get combined sync status
  const getSyncStatus = (): 'error' | 'syncing' | 'idle' => {
    const statuses: ('error' | 'syncing' | 'idle')[] = [
      unitPlanStore.syncStatus,
      lessonPlanStore.syncStatus,
      daybookStore.syncStatus
    ];

    // Check weeklyPlannerStore separately since it doesn't have syncStatus
    if (weeklyPlannerStore.isSaving) {
      statuses.push('syncing');
    }

    if (statuses.includes('error')) {
return 'error';
}
    if (statuses.includes('syncing')) {
return 'syncing';
}
    return 'idle';
  };

  // Get total pending changes
  const getTotalPendingChanges = (): number => (
      unitPlanStore.pendingChanges +
      lessonPlanStore.pendingChanges +
      daybookStore.pendingChanges +
      (weeklyPlannerStore.hasOfflineChanges ? 1 : 0)
    );

  return {
    // Store instances
    unitPlanStore,
    lessonPlanStore,
    daybookStore,
    weeklyPlannerStore,

    // Conflict management
    conflicts,
    resolveConflict,

    // Offline helpers
    preloadCurriculum,
    
    // Status
    isOnline: unitPlanStore.isOnline,
    syncStatus: getSyncStatus(),
    totalPendingChanges: getTotalPendingChanges(),
  };
}

interface UnitPlan {
  id: string;
  [key: string]: unknown;
}

interface _UnitPlanStore {
  currentPlan: UnitPlan | null;
  isLoading: boolean;
  isSaving: boolean;
  error: Error | null;
  isOnline: boolean;
  hasOfflineChanges: boolean;
  loadUnitPlan: (id: string) => Promise<void>;
  updateUnitPlan: (id: string, updates: Record<string, unknown>) => Promise<void>;
  deleteUnitPlan: (id: string) => Promise<void>;
}

// Example usage in a component:
export function useUnitPlanWithOffline(unitPlanId?: string): {
  unitPlan: UnitPlan | null;
  loading: boolean;
  saving: boolean;
  error: Error | null;
  isOnline: boolean;
  hasOfflineChanges: boolean;
  updateUnitPlan: (updates: unknown) => Promise<void>;
  deleteUnitPlan: (id: string) => Promise<void>;
} {
  const offlinePlanning = useOfflinePlanning();
  const {unitPlanStore} = offlinePlanning;
  const [loading, setLoading] = useState(false);

  // Load unit plan with offline support
  useEffect(() => {
    if (unitPlanId === undefined || unitPlanId === '') {
      return;
    }

    const loadPlan = async (): Promise<void> => {
      setLoading(true);
      try {
        const typedStore = unitPlanStore as UnitPlanStoreType;
        await typedStore.loadUnitPlan(unitPlanId);
      } catch (_error) {
        logger.error('Failed to load unit plan:', _error);
      } finally {
        setLoading(false);
      }
    };

    void loadPlan();

    return () => { // Cleanup
    };
  }, [unitPlanId, unitPlanStore]);

  // Create debounced update function with proper typing
  const debouncedUpdate = useMemo(() => {
    let timeout: NodeJS.Timeout | null = null;
    
    const debounced = (updates: unknown): Promise<void> => {
      if (timeout) {
clearTimeout(timeout);
}
      
      return new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          void (async (): Promise<void> => {
            const typedStore = unitPlanStore as UnitPlanStoreType;
            if (typedStore.currentPlan && hasId(typedStore.currentPlan) && isRecord(updates)) {
              await typedStore.updateUnitPlan(typedStore.currentPlan.id, updates);
            }
            resolve();
          })();
        }, 1000);
      });
    };
    
    return debounced;
  }, [unitPlanStore]);

  const typedStore = unitPlanStore as UnitPlanStoreType;
  return {
    unitPlan: typedStore.currentPlan as UnitPlan | null,
    loading: loading || typedStore.isLoading,
    saving: typedStore.isSaving,
    error: typedStore.error,
    isOnline: typedStore.isOnline,
    hasOfflineChanges: typedStore.hasOfflineChanges,
    updateUnitPlan: debouncedUpdate,
    deleteUnitPlan: typedStore.deleteUnitPlan,
  };
}

// Hook for batched API requests
export function useBatchedRequests(): {
  fetchMultipleResources: (urls: string[]) => Promise<unknown[]>;
  loading: boolean;
} {
  const [loading, setLoading] = useState(false);

  const fetchMultipleResources = async (urls: string[]): Promise<unknown[]> => {
    setLoading(true);
    try {
      // Use batched API for multiple requests
      const promises = urls.map(url => batchedApi.get(url));
      const results = await Promise.all(promises);
      return results.map((r: unknown) => {
        if (isApiResponse(r)) {
          return r.data;
        }
        return r;
      });
    } catch (_error) {
      logger.error('Batch request failed:', _error);
      throw _error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchMultipleResources,
    loading
  };
}