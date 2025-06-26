// Unit Plan Store with Offline Support

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { api } from '../api';
import { createOfflineSlice, createAutoSave, OfflineState, BaseActions } from './basePlanningStore';
import { offlineStorage, StoredData } from '../services/offlineStorage';

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
  lessons: Array<{
    id: string;
    title: string;
    date: string;
    duration: number;
    isSubFriendly?: boolean;
  }>;
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
            const response = await api.get('/api/unit-plans');
            return response.data;
          },
          saveToServer: async (data) => {
            // Save all modified plans
            const modifiedPlans = data.unitPlans.filter(
              (plan) => plan.updatedAt > (data.lastSyncedAt?.toISOString() || ''),
            );

            for (const plan of modifiedPlans) {
              if (plan.id.startsWith('temp-')) {
                // Create new plan
                await api.post('/api/unit-plans', plan);
              } else {
                // Update existing plan
                await api.put(`/api/unit-plans/${plan.id}`, plan);
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
          ...offlineSlice(set, get, undefined),

          // Actions
          loadUnitPlans: async () => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              // Try to load from server if online
              if (get().isOnline) {
                const response = await api.get('/api/unit-plans');
                const plans = response.data;

                set((state) => {
                  state.unitPlans = plans;
                  state.isLoading = false;
                });
                get().updateLastSynced();

                // Cache for offline use
                await offlineStorage.cacheData('unit-plans', plans, 60);
              } else {
                // Load from cache if offline
                const cachedPlans = await offlineStorage.getCachedData<UnitPlan[]>('unit-plans');

                if (cachedPlans) {
                  set((state) => {
                    state.unitPlans = cachedPlans;
                    state.isLoading = false;
                  });
                } else {
                  throw new Error('No cached data available offline');
                }
              }
            } catch (error) {
              console.error('Failed to load unit plans:', error);

              // Try to load from cache as fallback
              const cachedPlans = await offlineStorage.getCachedData<UnitPlan[]>('unit-plans');

              set((state) => {
                state.unitPlans = cachedPlans || [];
                state.error = error instanceof Error ? error.message : 'Failed to load plans';
                state.isLoading = false;
              });
            }
          },

          loadUnitPlan: async (id: string) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              if (get().isOnline) {
                const response = await api.get(`/api/unit-plans/${id}`);
                const plan = response.data;

                set((state) => {
                  state.currentPlan = plan;
                  state.isLoading = false;
                });

                // Cache individual plan
                await offlineStorage.cacheData(`unit-plan-${id}`, plan, 60);
              } else {
                // Load from cache if offline
                const cachedPlan = await offlineStorage.getCachedData<UnitPlan>(`unit-plan-${id}`);

                if (cachedPlan) {
                  set((state) => {
                    state.currentPlan = cachedPlan;
                    state.isLoading = false;
                  });
                } else {
                  // Try to find in the list
                  const plan = get().unitPlans.find((p) => p.id === id);
                  if (plan) {
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
              console.error('Failed to load unit plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load plan';
                state.isLoading = false;
              });
            }
          },

          createUnitPlan: async (planData: Partial<UnitPlan>) => {
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

              if (get().isOnline) {
                const response = await api.post('/api/unit-plans', planData);
                const createdPlan = response.data;

                set((state) => {
                  state.unitPlans.push(createdPlan);
                  state.currentPlan = createdPlan;
                  state.isSaving = false;
                });

                return createdPlan;
              } else {
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
              }
            } catch (error) {
              console.error('Failed to create unit plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to create plan';
                state.isSaving = false;
              });
              throw error;
            }
          },

          updateUnitPlan: async (id: string, updates: Partial<UnitPlan>) => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              const updatedPlan = {
                ...updates,
                updatedAt: new Date().toISOString(),
              };

              if (get().isOnline) {
                await api.put(`/api/unit-plans/${id}`, updatedPlan);

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
              console.error('Failed to update unit plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to update plan';
                state.isSaving = false;
              });
              throw error;
            }
          },

          deleteUnitPlan: async (id: string) => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              if (get().isOnline) {
                await api.delete(`/api/unit-plans/${id}`);

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
              console.error('Failed to delete unit plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to delete plan';
                state.isSaving = false;
              });
              throw error;
            }
          },

          setCurrentPlan: (plan: UnitPlan | null) =>
            set((state) => {
              state.currentPlan = plan;
            }),

          clearError: () =>
            set((state) => {
              state.error = null;
            }),
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
    if (state.hasOfflineChanges && state.isOnline) {
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
    if (hasChanges) {
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
