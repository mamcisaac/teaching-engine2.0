// Unit Plan Store with Offline Support

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { apiClient } from '../api/core/client';
import type { StoredData } from '../services/offlineStorage';
import { offlineStorage } from '../services/offlineStorage';
import logger from '../utils/logger';

import { createOfflineSlice, createAutoSave } from './basePlanningStore';
import type { OfflineState, BaseActions } from './basePlanningStore';
export interface UnitPlan {
  id: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  duration: string;
  expectations: string[];
  resources: string[];
  assessments: string[];
  lessons: {
    id: string;
    title: string;
    date: string;
    duration: number;
    isSubFriendly?: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface UnitPlanState extends OfflineState, Record<string, unknown> {
  unitPlans: UnitPlan[];
  currentPlan: UnitPlan | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadUnitPlans: () => Promise<void>;
  loadUnitPlan: (id: string) => Promise<void>;
  createUnitPlan: (plan: Partial<UnitPlan>) => Promise<UnitPlan>;
  updateUnitPlan: (id: string, updates: Partial<UnitPlan>) => Promise<void>;
  deleteUnitPlan: (id: string) => Promise<void>;
  setCurrentPlan: (plan: UnitPlan | null) => void;
  clearError: () => void;
}

export const useUnitPlanStore = create<UnitPlanState & BaseActions>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => {
        // Create offline slice
        const offlineSlice = createOfflineSlice<UnitPlanState>({
          entityType: 'unit-plan',
          fetchFromServer: async () => {
            const response = await apiClient.get('/api/unit-plans');
            return response.data;
          },
          saveToServer: async (data) => {
            // Save all modified plans
            const modifiedPlans = data.unitPlans.filter(
              (plan) => plan.updatedAt > (data.lastSyncedAt?.toISOString() ?? ''),
            );

            for (const plan of modifiedPlans) {
              if (plan.id.startsWith('temp-')) {
                // Create new plan
                await apiClient.post('/api/unit-plans', plan);
              } else {
                // Update existing plan
                await apiClient.put(`/api/unit-plans/${plan.id}`, plan);
              }
            }
          },
          getCacheKey: () => 'unit-plans-cache',
          mergingStrategy: 'merge',
        });

        return {
          // State
          unitPlans: [],
          currentPlan: null,
          isLoading: false,
          isSaving: false,
          error: null,

          // Offline state and actions
          ...offlineSlice(set, get, {} as never),

          // Actions
          loadUnitPlans: async (): Promise<void> => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              // Try to load from server if online
              if (get().isOnline === true) {
                const response = await apiClient.get('/api/unit-plans');
                const plans = response.data as UnitPlan[];

                set((state) => {
                  state.unitPlans = plans;
                  state.isLoading = false;
                });
                get().updateLastSynced();

                // Cache for offline use
                await offlineStorage.cacheData('unit-plans', plans as unknown as StoredData, 60);
              } else {
                // Load from cache if offline
                const cachedPlans = await offlineStorage.getCachedData<UnitPlan[]>('unit-plans');

                if (cachedPlans !== null && cachedPlans !== undefined) {
                  set((state) => {
                    state.unitPlans = cachedPlans;
                    state.isLoading = false;
                  });
                } else {
                  throw new Error('No cached data available offline');
                }
              }
            } catch (error) {
              logger.error('Failed to load unit plans:', error);

              // Try to load from cache as fallback
              const cachedPlans = await offlineStorage.getCachedData<UnitPlan[]>('unit-plans');

              set((state) => {
                state.unitPlans = cachedPlans ?? [];
                state.error = error instanceof Error ? error.message : 'Failed to load plans';
                state.isLoading = false;
              });
            }
          },

          loadUnitPlan: async (id: string): Promise<void> => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              if (get().isOnline === true) {
                const response = await apiClient.get(`/api/unit-plans/${id}`);
                const plan = response.data as UnitPlan;

                set((state) => {
                  state.currentPlan = plan;
                  state.isLoading = false;
                });

                // Cache individual plan
                await offlineStorage.cacheData(`unit-plan-${id}`, plan as unknown as StoredData, 60);
              } else {
                // Load from cache if offline
                const cachedPlan = await offlineStorage.getCachedData<UnitPlan>(`unit-plan-${id}`);

                if (cachedPlan !== null && cachedPlan !== undefined) {
                  set((state) => {
                    state.currentPlan = cachedPlan;
                    state.isLoading = false;
                  });
                } else {
                  // Try to find in the list
                  const plan = get().unitPlans.find((p) => p.id === id);
                  if (plan !== null && plan !== undefined) {
                    set((state) => {
                      state.currentPlan = plan;
                      state.isLoading = false;
                    });
                  } else {
                    throw new Error('Plan not found in offline cache');
                  }
                }
              }
            } catch (error) {
              logger.error('Failed to load unit plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load plan';
                state.isLoading = false;
              });
            }
          },

          createUnitPlan: async (planData: Partial<UnitPlan>): Promise<UnitPlan> => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              const tempId = `temp-${Date.now()}`;
              const newPlan: UnitPlan = {
                ...planData,
                id: tempId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as UnitPlan;

              if (get().isOnline === true) {
                const response = await apiClient.post('/api/unit-plans', planData);
                const createdPlan = response.data as UnitPlan;

                set((state) => {
                  state.unitPlans.push(createdPlan);
                  state.currentPlan = createdPlan;
                  state.isSaving = false;
                });

                return createdPlan;
              } 
                // Save offline
                set((state) => {
                  state.unitPlans.push(newPlan);
                  state.currentPlan = newPlan;
                  state.isSaving = false;
                  state.markOfflineChange();
                });

                // Save to offline storage
                await offlineStorage.saveOfflineChange({
                  type: 'CREATE',
                  entity: 'unit-plan',
                  data: newPlan as unknown as StoredData,
                });

                return newPlan;
              
            } catch (error) {
              logger.error('Failed to create unit plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to create plan';
                state.isSaving = false;
              });
              throw error;
            }
          },

          updateUnitPlan: async (id: string, updates: Partial<UnitPlan>): Promise<void> => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              const updatedPlan = {
                ...updates,
                updatedAt: new Date().toISOString(),
              };

              if (get().isOnline === true) {
                await apiClient.put(`/api/unit-plans/${id}`, updatedPlan);

                set((state) => {
                  const index = state.unitPlans.findIndex((p) => p.id === id);
                  if (index !== -1) {
                    state.unitPlans[index] = { ...state.unitPlans[index], ...updatedPlan };
                  }
                  if (state.currentPlan?.id === id) {
                    state.currentPlan = { ...state.currentPlan, ...updatedPlan };
                  }
                  state.isSaving = false;
                });
              } else {
                // Update offline
                set((state) => {
                  const index = state.unitPlans.findIndex((p) => p.id === id);
                  if (index !== -1) {
                    state.unitPlans[index] = { ...state.unitPlans[index], ...updatedPlan };
                  }
                  if (state.currentPlan?.id === id) {
                    state.currentPlan = { ...state.currentPlan, ...updatedPlan };
                  }
                  state.isSaving = false;
                  state.markOfflineChange();
                });

                // Save to offline storage
                await offlineStorage.saveOfflineChange({
                  type: 'UPDATE',
                  entity: 'unit-plan',
                  entityId: id,
                  data: updatedPlan,
                });
              }
            } catch (error) {
              logger.error('Failed to update unit plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to update plan';
                state.isSaving = false;
              });
              throw error;
            }
          },

          deleteUnitPlan: async (id: string): Promise<void> => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              if (get().isOnline === true) {
                await apiClient.delete(`/api/unit-plans/${id}`);

                set((state) => {
                  state.unitPlans = state.unitPlans.filter((p) => p.id !== id);
                  if (state.currentPlan?.id === id) {
                    state.currentPlan = null;
                  }
                  state.isSaving = false;
                });
              } else {
                // Delete offline
                set((state) => {
                  state.unitPlans = state.unitPlans.filter((p) => p.id !== id);
                  if (state.currentPlan?.id === id) {
                    state.currentPlan = null;
                  }
                  state.isSaving = false;
                  state.markOfflineChange();
                });

                // Save to offline storage
                await offlineStorage.saveOfflineChange({
                  type: 'DELETE',
                  entity: 'unit-plan',
                  entityId: id,
                  data: { id },
                });
              }
            } catch (error) {
              logger.error('Failed to delete unit plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to delete plan';
                state.isSaving = false;
              });
              throw error;
            }
          },

          setCurrentPlan: (plan: UnitPlan | null): void => {
            set((state) => {
              state.currentPlan = plan;
            });
          },

          clearError: (): void => {
            set((state) => {
              state.error = null;
            });
          },
        };
      }),
      {
        name: 'unit-plan-storage',
        partialize: (state) => ({
          unitPlans: state.unitPlans,
          currentPlan: state.currentPlan,
          hasOfflineChanges: state.hasOfflineChanges,
          lastSyncedAt: state.lastSyncedAt,
        }),
      },
    ),
  ),
);

// Set up auto-save
const autoSave = createAutoSave(
  useUnitPlanStore,
  async () => {
    const state = useUnitPlanStore.getState();
    if (state.hasOfflineChanges === true && state.isOnline === true) {
      // Sync with server
      await state.loadUnitPlans();
    }
  },
  30000, // 30 seconds
);

// Subscribe to changes
useUnitPlanStore.subscribe(
  (state) => state.hasOfflineChanges,
  (hasChanges) => {
    if (hasChanges === true) {
      autoSave();
    }
  },
);

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online-status-change', ((event: CustomEvent<{ isOnline: boolean }>) => {
    useUnitPlanStore.getState().setOnlineStatus(event.detail.isOnline);
  }) as EventListener);
}
