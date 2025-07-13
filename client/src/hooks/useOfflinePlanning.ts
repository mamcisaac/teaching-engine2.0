// Hook for using offline-capable planning stores
// Example of how to integrate offline functionality into components

import React, { useEffect, useState } from 'react';

import { lazyLoader } from '../services/lazyLoader';
import type { StoredData } from '../services/offlineStorage';
import { offlineStorage } from '../services/offlineStorage';
import { batchedApi } from '../services/requestBatcher';
import { useDaybookStore } from '../stores/daybookStore';
import { useLessonPlanStore } from '../stores/lessonPlanStore';
import { useUnitPlanStore } from '../stores/unitPlanStore';
import { useWeeklyPlannerStore } from '../stores/weeklyPlannerStore';
import logger from '../utils/logger';
// Combined offline planning hook
export function useOfflinePlanning() {
  const unitPlanStore = useUnitPlanStore();
  const lessonPlanStore = useLessonPlanStore();
  const daybookStore = useDaybookStore();
  const weeklyPlannerStore = useWeeklyPlannerStore();

  const [conflicts, setConflicts] = useState<{ id: string; [key: string]: unknown }[]>([]);

  // Check for conflicts on mount
  useEffect(() => {
    return () => { // Cleanup
    };

    const checkConflicts = async () => {
      const unresolvedConflicts = await offlineStorage.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts);
    };
    checkConflicts();
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync all stores when coming online
  useEffect(() => {
    return () => { // Cleanup
    };

    const handleOnline = () => {
      // Sync all stores
      if (unitPlanStore.hasOfflineChanges) {
        unitPlanStore.loadUnitPlans();
      }
      if (lessonPlanStore.hasOfflineChanges) {
        lessonPlanStore.loadLessonPlans();
      }
      if (daybookStore.hasOfflineChanges) {
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        daybookStore.loadEntries(startDate, endDate);
      }
      if (weeklyPlannerStore.hasOfflineChanges) {
        weeklyPlannerStore.syncWithServer();
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
  ) => {
    await offlineStorage.resolveConflict(conflictId, resolution, mergedData as StoredData | undefined);
    setConflicts(conflicts.filter(c => c.id !== conflictId));
  };

  // Preload curriculum documents for offline use
  const preloadCurriculum = async (documentIds: string[]) => {
    await lazyLoader.preloadDocuments(documentIds, (current, total) => {
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
  const getTotalPendingChanges = () => (
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

// Example usage in a component:
export function useUnitPlanWithOffline(unitPlanId?: string) {
  const { unitPlanStore } = useOfflinePlanning();
  const [loading, setLoading] = useState(false);

  // Load unit plan with offline support
  useEffect(() => {
    return () => { // Cleanup
    };

    if (!unitPlanId) {
return;
}

    const loadPlan = async () => {
      setLoading(true);
      try {
        await unitPlanStore.loadUnitPlan(unitPlanId);
      } catch (_error) {
        logger.error('Failed to load unit plan:', _error);
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [unitPlanId, unitPlanStore]);

  // Create debounced update function with proper typing
  const debouncedUpdate = React.useMemo(() => {
    let timeout: NodeJS.Timeout | null = null;
    
    const debounced = (updates: unknown) => {
      if (timeout) {
clearTimeout(timeout);
}
      
      return new Promise<void>((resolve) => {
        timeout = setTimeout(() => {
          void (async () => {
            if (unitPlanStore.currentPlan) {
              await unitPlanStore.updateUnitPlan(unitPlanStore.currentPlan.id, updates as Record<string, unknown>);
            }
            resolve();
          })();
        }, 1000);
      });
    };
    
    return debounced;
  }, [unitPlanStore]);

  return {
    unitPlan: unitPlanStore.currentPlan,
    loading: loading || unitPlanStore.isLoading,
    saving: unitPlanStore.isSaving,
    error: unitPlanStore.error,
    isOnline: unitPlanStore.isOnline,
    hasOfflineChanges: unitPlanStore.hasOfflineChanges,
    updateUnitPlan: debouncedUpdate,
    deleteUnitPlan: unitPlanStore.deleteUnitPlan,
  };
}

// Hook for batched API requests
export function useBatchedRequests() {
  const [loading, setLoading] = useState(false);

  const fetchMultipleResources = async (urls: string[]) => {
    setLoading(true);
    try {
      // Use batched API for multiple requests
      const promises = urls.map(url => batchedApi.get(url));
      const results = await Promise.all(promises);
      return results.map((r: unknown) => (r as { data: unknown }).data);
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