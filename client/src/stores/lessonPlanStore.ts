// Lesson Plan Store with Offline Support

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { api } from '../api';
import { createOfflineSlice, createAutoSave, OfflineState, BaseActions } from './basePlanningStore';
import { offlineStorage, StoredData } from '../services/offlineStorage';

export interface LessonPlan {
  id: string;
  title: string;
  date: string;
  grade: string;
  subject: string;
  duration: number;
  expectations: string[];
  learningGoals: string[];
  successCriteria: string[];
  materials: string[];
  openingActivity: string;
  mainActivity: string;
  closingActivity: string;
  assessment: string;
  differentiation: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonPlanState extends OfflineState, Record<string, unknown> {
  lessonPlans: LessonPlan[];
  currentLesson: LessonPlan | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadLessonPlans: (startDate?: string, endDate?: string) => Promise<void>;
  loadLessonPlan: (id: string) => Promise<void>;
  createLessonPlan: (plan: Partial<LessonPlan>) => Promise<LessonPlan>;
  updateLessonPlan: (id: string, updates: Partial<LessonPlan>) => Promise<void>;
  deleteLessonPlan: (id: string) => Promise<void>;
  duplicateLessonPlan: (id: string, newDate: string) => Promise<LessonPlan>;
  setCurrentLesson: (lesson: LessonPlan | null) => void;
  clearError: () => void;
}

export const useLessonPlanStore = create<LessonPlanState & BaseActions>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => {
        // Create offline slice
        const offlineSlice = createOfflineSlice<LessonPlanState>({
          entityType: 'lesson-plan',
          fetchFromServer: async () => {
            const response = await api.get('/api/etfo-lesson-plans');
            return response.data;
          },
          saveToServer: async (data) => {
            // Save all modified lesson plans
            const modifiedPlans = data.lessonPlans.filter(
              (plan) => plan.updatedAt > (data.lastSyncedAt?.toISOString() || ''),
            );

            for (const plan of modifiedPlans) {
              if (plan.id.startsWith('temp-')) {
                // Create new plan
                await api.post('/api/etfo-lesson-plans', plan);
              } else {
                // Update existing plan
                await api.put(`/api/etfo-lesson-plans/${plan.id}`, plan);
              }
            }
          },
          getCacheKey: () => 'lesson-plans-cache',
          mergingStrategy: 'merge',
        });

        return {
          // State
          lessonPlans: [],
          currentLesson: null,
          isLoading: false,
          isSaving: false,
          error: null,

          // Offline state and actions
          ...offlineSlice(set, get, {} as never),

          // Actions
          loadLessonPlans: async (startDate?: string, endDate?: string) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              if (get().isOnline) {
                let url = '/api/etfo-lesson-plans';
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate);
                if (endDate) params.append('endDate', endDate);
                if (params.toString()) url += `?${params.toString()}`;

                const response = await api.get(url);
                const plans = response.data;

                set((state) => {
                  state.lessonPlans = plans;
                  state.isLoading = false;
                });
                get().updateLastSynced();

                // Cache for offline use
                const cacheKey = `lesson-plans-${startDate || 'all'}-${endDate || 'all'}`;
                await offlineStorage.cacheData(cacheKey, plans, 60);
              } else {
                // Load from cache if offline
                const cacheKey = `lesson-plans-${startDate || 'all'}-${endDate || 'all'}`;
                const cachedPlans = await offlineStorage.getCachedData<LessonPlan[]>(cacheKey);

                if (cachedPlans) {
                  set((state) => {
                    state.lessonPlans = cachedPlans;
                    state.isLoading = false;
                  });
                } else {
                  // Try generic cache
                  const allPlans =
                    await offlineStorage.getCachedData<LessonPlan[]>('lesson-plans-all-all');
                  set((state) => {
                    state.lessonPlans = allPlans || [];
                    state.isLoading = false;
                  });
                }
              }
            } catch (error) {
              console.error('Failed to load lesson plans:', error);

              // Try to load from cache as fallback
              const cachedPlans =
                await offlineStorage.getCachedData<LessonPlan[]>('lesson-plans-all-all');

              set((state) => {
                state.lessonPlans = cachedPlans || [];
                state.error = error instanceof Error ? error.message : 'Failed to load plans';
                state.isLoading = false;
              });
            }
          },

          loadLessonPlan: async (id: string) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              if (get().isOnline) {
                const response = await api.get(`/api/etfo-lesson-plans/${id}`);
                const lesson = response.data;

                set((state) => {
                  state.currentLesson = lesson;
                  state.isLoading = false;
                });

                // Cache individual lesson
                await offlineStorage.cacheData(`lesson-plan-${id}`, lesson, 60);
              } else {
                // Load from cache if offline
                const cachedLesson = await offlineStorage.getCachedData<LessonPlan>(
                  `lesson-plan-${id}`,
                );

                if (cachedLesson) {
                  set((state) => {
                    state.currentLesson = cachedLesson;
                    state.isLoading = false;
                  });
                } else {
                  // Try to find in the list
                  const lesson = get().lessonPlans.find((p) => p.id === id);
                  if (lesson) {
                    set((state) => {
                      state.currentLesson = lesson;
                      state.isLoading = false;
                    });
                  } else {
                    throw new Error('Lesson not found in offline cache');
                  }
                }
              }
            } catch (error) {
              console.error('Failed to load lesson plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load lesson';
                state.isLoading = false;
              });
            }
          },

          createLessonPlan: async (planData: Partial<LessonPlan>) => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              const tempId = `temp-${Date.now()}`;
              const newLesson: LessonPlan = {
                ...planData,
                id: tempId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as LessonPlan;

              if (get().isOnline) {
                const response = await api.post('/api/etfo-lesson-plans', planData);
                const createdLesson = response.data;

                set((state) => {
                  state.lessonPlans.push(createdLesson);
                  state.currentLesson = createdLesson;
                  state.isSaving = false;
                });

                return createdLesson;
              } else {
                // Save offline
                set((state) => {
                  state.lessonPlans.push(newLesson);
                  state.currentLesson = newLesson;
                  state.isSaving = false;
                  state.markOfflineChange();
                });

                // Save to offline storage
                await offlineStorage.saveOfflineChange({
                  type: 'CREATE',
                  entity: 'lesson-plan',
                  data: newLesson as unknown as StoredData,
                });

                return newLesson;
              }
            } catch (error) {
              console.error('Failed to create lesson plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to create lesson';
                state.isSaving = false;
              });
              throw error;
            }
          },

          updateLessonPlan: async (id: string, updates: Partial<LessonPlan>) => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              const updatedLesson = {
                ...updates,
                updatedAt: new Date().toISOString(),
              };

              if (get().isOnline) {
                await api.put(`/api/etfo-lesson-plans/${id}`, updatedLesson);

                set((state) => {
                  const index = state.lessonPlans.findIndex((p) => p.id === id);
                  if (index !== -1) {
                    state.lessonPlans[index] = { ...state.lessonPlans[index], ...updatedLesson };
                  }
                  if (state.currentLesson?.id === id) {
                    state.currentLesson = { ...state.currentLesson, ...updatedLesson };
                  }
                  state.isSaving = false;
                });
              } else {
                // Update offline
                set((state) => {
                  const index = state.lessonPlans.findIndex((p) => p.id === id);
                  if (index !== -1) {
                    state.lessonPlans[index] = { ...state.lessonPlans[index], ...updatedLesson };
                  }
                  if (state.currentLesson?.id === id) {
                    state.currentLesson = { ...state.currentLesson, ...updatedLesson };
                  }
                  state.isSaving = false;
                  state.markOfflineChange();
                });

                // Save to offline storage
                await offlineStorage.saveOfflineChange({
                  type: 'UPDATE',
                  entity: 'lesson-plan',
                  entityId: id,
                  data: updatedLesson,
                });
              }
            } catch (error) {
              console.error('Failed to update lesson plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to update lesson';
                state.isSaving = false;
              });
              throw error;
            }
          },

          deleteLessonPlan: async (id: string) => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              if (get().isOnline) {
                await api.delete(`/api/etfo-lesson-plans/${id}`);

                set((state) => {
                  state.lessonPlans = state.lessonPlans.filter((p) => p.id !== id);
                  if (state.currentLesson?.id === id) {
                    state.currentLesson = null;
                  }
                  state.isSaving = false;
                });
              } else {
                // Delete offline
                set((state) => {
                  state.lessonPlans = state.lessonPlans.filter((p) => p.id !== id);
                  if (state.currentLesson?.id === id) {
                    state.currentLesson = null;
                  }
                  state.isSaving = false;
                  state.markOfflineChange();
                });

                // Save to offline storage
                await offlineStorage.saveOfflineChange({
                  type: 'DELETE',
                  entity: 'lesson-plan',
                  entityId: id,
                  data: { id },
                });
              }
            } catch (error) {
              console.error('Failed to delete lesson plan:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to delete lesson';
                state.isSaving = false;
              });
              throw error;
            }
          },

          duplicateLessonPlan: async (id: string, newDate: string) => {
            const originalLesson = get().lessonPlans.find((p) => p.id === id);
            if (!originalLesson) {
              throw new Error('Lesson not found');
            }

            const duplicatedData = {
              ...originalLesson,
              id: undefined,
              date: newDate,
              title: `${originalLesson.title} (Copy)`,
            };

            return get().createLessonPlan(duplicatedData);
          },

          setCurrentLesson: (lesson: LessonPlan | null) =>
            set((state) => {
              state.currentLesson = lesson;
            }),

          clearError: () =>
            set((state) => {
              state.error = null;
            }),
        };
      }),
      {
        name: 'lesson-plan-storage',
        partialize: (state) => ({
          lessonPlans: state.lessonPlans,
          currentLesson: state.currentLesson,
          hasOfflineChanges: state.hasOfflineChanges,
          lastSyncedAt: state.lastSyncedAt,
        }),
      },
    ),
  ),
);

// Set up auto-save
const autoSave = createAutoSave(
  useLessonPlanStore,
  async () => {
    const state = useLessonPlanStore.getState();
    if (state.hasOfflineChanges && state.isOnline) {
      // Sync with server
      await state.loadLessonPlans();
    }
  },
  30000, // 30 seconds
);

// Subscribe to changes
useLessonPlanStore.subscribe(
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
    useLessonPlanStore.getState().setOnlineStatus(event.detail.isOnline);
  }) as EventListener);
}
