// Hook for using offline-capable planning stores
// Example of how to integrate offline functionality into components

import React, { useEffect, useState } from 'react';
import { useUnitPlanStore } from '../stores/unitPlanStore';
import { useLessonPlanStore } from '../stores/lessonPlanStore';
import { useDaybookStore } from '../stores/daybookStore';
import { useWeeklyPlannerStore } from '../stores/weeklyPlannerStore';
import { offlineStorage, StoredData } from '../services/offlineStorage';
import { lazyLoader } from '../services/lazyLoader';
import { batchedApi } from '../services/requestBatcher';

// Combined offline planning hook
export function useOfflinePlanning() {
  const unitPlanStore = useUnitPlanStore();
  const lessonPlanStore = useLessonPlanStore();
  const daybookStore = useDaybookStore();
  const weeklyPlannerStore = useWeeklyPlannerStore();

  const [conflicts, setConflicts] = useState<Array<{ id: string; [key: string]: unknown }>>([]);

  // Check for conflicts on mount
  useEffect(() => {
    const checkConflicts = async () => {
      const unresolvedConflicts = await offlineStorage.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts);
    };
    checkConflicts();
  }, []);

  // Sync all stores when coming online
  useEffect(() => {
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
    return () => window.removeEventListener('online', handleOnline);
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
      console.log(`Preloading curriculum: ${current}/${total}`);
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

    if (statuses.includes('error')) return 'error';
    if (statuses.includes('syncing')) return 'syncing';
    return 'idle';
  };

  // Get total pending changes
  const getTotalPendingChanges = () => {
    return (
      unitPlanStore.pendingChanges +
      lessonPlanStore.pendingChanges +
      daybookStore.pendingChanges +
      (weeklyPlannerStore.hasOfflineChanges ? 1 : 0)
    );
  };

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
    if (!unitPlanId) return;

    const loadPlan = async () => {
      setLoading(true);
      try {
        await unitPlanStore.loadUnitPlan(unitPlanId);
      } catch (error) {
        console.error('Failed to load unit plan:', error);
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
      if (timeout) clearTimeout(timeout);
      
      return new Promise<void>((resolve) => {
        timeout = setTimeout(async () => {
          if (unitPlanStore.currentPlan) {
            await unitPlanStore.updateUnitPlan(unitPlanStore.currentPlan.id, updates as Record<string, unknown>);
          }
          resolve();
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
    } catch (error) {
      console.error('Batch request failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchMultipleResources,
    loading
  };
}