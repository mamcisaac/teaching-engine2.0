// Daybook Store with Offline Support

import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { api } from '../api';
import { createOfflineSlice, createAutoSave, OfflineState, BaseActions } from './basePlanningStore';
import { offlineStorage } from '../services/offlineStorage';

export interface DaybookEntry {
  id: string;
  date: string;
  grade: string;
  subject: string;
  activities: Array<{
    time: string;
    activity: string;
    materials?: string[];
    notes?: string;
  }>;
  reflections: string;
  attendance?: Array<{
    studentId: string;
    present: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DaybookState extends OfflineState, Record<string, unknown> {
  entries: DaybookEntry[];
  currentEntry: DaybookEntry | null;
  selectedDate: string;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  loadEntries: (startDate: string, endDate: string) => Promise<void>;
  loadEntry: (date: string) => Promise<void>;
  createEntry: (entry: Partial<DaybookEntry>) => Promise<DaybookEntry>;
  updateEntry: (id: string, updates: Partial<DaybookEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  setSelectedDate: (date: string) => void;
  setCurrentEntry: (entry: DaybookEntry | null) => void;
  clearError: () => void;
}

export const useDaybookStore = create<DaybookState & BaseActions>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => {
        // Create offline slice
        const offlineSlice = createOfflineSlice<DaybookState>({
          entityType: 'daybook',
          fetchFromServer: async () => {
            const response = await api.get('/api/daybook');
            return response.data;
          },
          saveToServer: async (data) => {
            // Save all modified entries
            const modifiedEntries = data.entries.filter(entry => 
              entry.updatedAt > (data.lastSyncedAt?.toISOString() || '')
            );
            
            for (const entry of modifiedEntries) {
              if (entry.id.startsWith('temp-')) {
                // Create new entry
                await api.post('/api/daybook', entry);
              } else {
                // Update existing entry
                await api.put(`/api/daybook/${entry.id}`, entry);
              }
            }
          },
          getCacheKey: () => 'daybook-cache',
          mergingStrategy: 'merge'
        });

        return {
          // State
          entries: [],
          currentEntry: null,
          selectedDate: new Date().toISOString().split('T')[0],
          isLoading: false,
          isSaving: false,
          error: null,

          // Offline state and actions
          ...offlineSlice(set, get, undefined as any),

          // Actions
          loadEntries: async (startDate: string, endDate: string) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              if (get().isOnline) {
                const params = new URLSearchParams({ startDate, endDate });
                const response = await api.get(`/api/daybook?${params.toString()}`);
                const entries = response.data;
                
                set((state) => {
                  state.entries = entries;
                  state.isLoading = false;
                });
                get().updateLastSynced();

                // Cache for offline use
                const cacheKey = `daybook-${startDate}-${endDate}`;
                await offlineStorage.cacheData(cacheKey, entries, 60);
              } else {
                // Load from cache if offline
                const cacheKey = `daybook-${startDate}-${endDate}`;
                const cachedEntries = await offlineStorage.getCachedData<DaybookEntry[]>(cacheKey);
                
                if (cachedEntries) {
                  set((state) => {
                    state.entries = cachedEntries;
                    state.isLoading = false;
                  });
                } else {
                  // Try to load any cached data
                  const allEntries = await offlineStorage.getCachedData<DaybookEntry[]>('daybook-cache');
                  if (allEntries) {
                    // Filter by date range
                    const filtered = allEntries.filter(entry => 
                      entry.date >= startDate && entry.date <= endDate
                    );
                    set((state) => {
                      state.entries = filtered;
                      state.isLoading = false;
                    });
                  } else {
                    set((state) => {
                      state.entries = [];
                      state.isLoading = false;
                    });
                  }
                }
              }
            } catch (error) {
              console.error('Failed to load daybook entries:', error);
              
              // Try to load from cache as fallback
              const cachedEntries = await offlineStorage.getCachedData<DaybookEntry[]>('daybook-cache');
              
              set((state) => {
                state.entries = cachedEntries || [];
                state.error = error instanceof Error ? error.message : 'Failed to load entries';
                state.isLoading = false;
              });
            }
          },

          loadEntry: async (date: string) => {
            set((state) => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              // First check local entries
              const localEntry = get().entries.find(e => e.date === date);
              
              if (localEntry) {
                set((state) => {
                  state.currentEntry = localEntry;
                  state.isLoading = false;
                });
                return;
              }

              if (get().isOnline) {
                const response = await api.get(`/api/daybook/date/${date}`);
                const entry = response.data;
                
                set((state) => {
                  state.currentEntry = entry;
                  if (entry && !state.entries.find(e => e.id === entry.id)) {
                    state.entries.push(entry);
                  }
                  state.isLoading = false;
                });

                // Cache individual entry
                if (entry) {
                  await offlineStorage.cacheData(`daybook-entry-${date}`, entry, 60);
                }
              } else {
                // Load from cache if offline
                const cachedEntry = await offlineStorage.getCachedData<DaybookEntry>(`daybook-entry-${date}`);
                
                set((state) => {
                  state.currentEntry = cachedEntry;
                  state.isLoading = false;
                });
              }
            } catch (error) {
              console.error('Failed to load daybook entry:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to load entry';
                state.isLoading = false;
              });
            }
          },

          createEntry: async (entryData: Partial<DaybookEntry>) => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              const tempId = `temp-${Date.now()}`;
              const newEntry: DaybookEntry = {
                ...entryData,
                id: tempId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as DaybookEntry;

              if (get().isOnline) {
                const response = await api.post('/api/daybook', entryData);
                const createdEntry = response.data;
                
                set((state) => {
                  // Replace or add entry
                  const existingIndex = state.entries.findIndex(e => e.date === createdEntry.date);
                  if (existingIndex !== -1) {
                    state.entries[existingIndex] = createdEntry;
                  } else {
                    state.entries.push(createdEntry);
                  }
                  state.currentEntry = createdEntry;
                  state.isSaving = false;
                });

                return createdEntry;
              } else {
                // Save offline
                set((state) => {
                  // Replace or add entry
                  const existingIndex = state.entries.findIndex(e => e.date === newEntry.date);
                  if (existingIndex !== -1) {
                    state.entries[existingIndex] = newEntry;
                  } else {
                    state.entries.push(newEntry);
                  }
                  state.currentEntry = newEntry;
                  state.isSaving = false;
                  state.markOfflineChange();
                });

                // Save to offline storage
                await offlineStorage.saveOfflineChange({
                  type: 'CREATE',
                  entity: 'daybook',
                  data: newEntry
                });

                return newEntry;
              }
            } catch (error) {
              console.error('Failed to create daybook entry:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to create entry';
                state.isSaving = false;
              });
              throw error;
            }
          },

          updateEntry: async (id: string, updates: Partial<DaybookEntry>) => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              const updatedEntry = {
                ...updates,
                updatedAt: new Date().toISOString()
              };

              if (get().isOnline) {
                await api.put(`/api/daybook/${id}`, updatedEntry);
                
                set((state) => {
                  const index = state.entries.findIndex(e => e.id === id);
                  if (index !== -1) {
                    state.entries[index] = { ...state.entries[index], ...updatedEntry };
                  }
                  if (state.currentEntry?.id === id) {
                    state.currentEntry = { ...state.currentEntry, ...updatedEntry };
                  }
                  state.isSaving = false;
                });
              } else {
                // Update offline
                set((state) => {
                  const index = state.entries.findIndex(e => e.id === id);
                  if (index !== -1) {
                    state.entries[index] = { ...state.entries[index], ...updatedEntry };
                  }
                  if (state.currentEntry?.id === id) {
                    state.currentEntry = { ...state.currentEntry, ...updatedEntry };
                  }
                  state.isSaving = false;
                  state.markOfflineChange();
                });

                // Save to offline storage
                await offlineStorage.saveOfflineChange({
                  type: 'UPDATE',
                  entity: 'daybook',
                  entityId: id,
                  data: updatedEntry
                });
              }
            } catch (error) {
              console.error('Failed to update daybook entry:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to update entry';
                state.isSaving = false;
              });
              throw error;
            }
          },

          deleteEntry: async (id: string) => {
            set((state) => {
              state.isSaving = true;
              state.error = null;
            });

            try {
              if (get().isOnline) {
                await api.delete(`/api/daybook/${id}`);
                
                set((state) => {
                  state.entries = state.entries.filter(e => e.id !== id);
                  if (state.currentEntry?.id === id) {
                    state.currentEntry = null;
                  }
                  state.isSaving = false;
                });
              } else {
                // Delete offline
                set((state) => {
                  state.entries = state.entries.filter(e => e.id !== id);
                  if (state.currentEntry?.id === id) {
                    state.currentEntry = null;
                  }
                  state.isSaving = false;
                  state.markOfflineChange();
                });

                // Save to offline storage
                await offlineStorage.saveOfflineChange({
                  type: 'DELETE',
                  entity: 'daybook',
                  entityId: id,
                  data: { id }
                });
              }
            } catch (error) {
              console.error('Failed to delete daybook entry:', error);
              set((state) => {
                state.error = error instanceof Error ? error.message : 'Failed to delete entry';
                state.isSaving = false;
              });
              throw error;
            }
          },

          setSelectedDate: (date: string) => set((state) => {
            state.selectedDate = date;
          }),

          setCurrentEntry: (entry: DaybookEntry | null) => set((state) => {
            state.currentEntry = entry;
          }),

          clearError: () => set((state) => {
            state.error = null;
          }),
        };
      }),
      {
        name: 'daybook-storage',
        partialize: (state) => ({
          entries: state.entries,
          currentEntry: state.currentEntry,
          selectedDate: state.selectedDate,
          hasOfflineChanges: state.hasOfflineChanges,
          lastSyncedAt: state.lastSyncedAt
        })
      }
    )
  )
);

// Set up auto-save
const autoSave = createAutoSave(
  useDaybookStore,
  async () => {
    const state = useDaybookStore.getState();
    if (state.hasOfflineChanges && state.isOnline) {
      // Get date range for current entries
      const dates = state.entries.map(e => e.date).sort();
      if (dates.length > 0) {
        await state.loadEntries(dates[0], dates[dates.length - 1]);
      }
    }
  },
  15000 // 15 seconds (more frequent for daybook)
);

// Subscribe to changes
useDaybookStore.subscribe(
  (state) => state.hasOfflineChanges,
  (hasChanges) => {
    if (hasChanges) {
      autoSave();
    }
  }
);

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online-status-change', (event: any) => {
    useDaybookStore.getState().setOnlineStatus(event.detail.isOnline);
  });
}