import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { api } from '../lib/api';

export interface WorkingHours {
  start: string;
  end: string;
}

export interface UndoRedoState {
  timestamp: number;
  description: string;
  state: Partial<WeeklyPlannerState>;
}

export interface WeeklyPlannerState {
  // View preferences
  defaultView: 'week' | 'month' | 'agenda';
  timeSlotDuration: 15 | 30 | 60;
  showWeekends: boolean;
  startOfWeek: 0 | 1; // 0=Sunday, 1=Monday
  workingHours: WorkingHours;
  
  // UI preferences
  sidebarExpanded: boolean;
  showMiniCalendar: boolean;
  showResourcePanel: boolean;
  compactMode: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Planning preferences
  autoSave: boolean;
  autoSaveInterval: number;
  showUncoveredOutcomes: boolean;
  defaultLessonDuration: number;
  
  // Current state
  currentWeekStart: Date;
  lastActiveView?: string;
  draftChanges?: Record<string, unknown>;
  
  // Advanced features
  undoHistory: UndoRedoState[];
  redoHistory: UndoRedoState[];
  maxHistorySize: number;
  
  // Offline support
  lastSyncedAt: Date;
  hasOfflineChanges: boolean;
  offlineData?: Record<string, unknown>;
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  
  // Actions
  setDefaultView: (view: 'week' | 'month' | 'agenda') => void;
  setTimeSlotDuration: (duration: 15 | 30 | 60) => void;
  setShowWeekends: (show: boolean) => void;
  setStartOfWeek: (day: 0 | 1) => void;
  setWorkingHours: (hours: WorkingHours) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setShowMiniCalendar: (show: boolean) => void;
  setShowResourcePanel: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setAutoSave: (autoSave: boolean) => void;
  setAutoSaveInterval: (interval: number) => void;
  setShowUncoveredOutcomes: (show: boolean) => void;
  setDefaultLessonDuration: (duration: number) => void;
  setCurrentWeekStart: (date: Date) => void;
  setLastActiveView: (view?: string) => void;
  setDraftChanges: (changes?: Record<string, unknown>) => void;
  
  // History management
  saveToHistory: (description: string) => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  
  // Persistence
  loadFromServer: () => Promise<void>;
  saveToServer: () => Promise<void>;
  markOfflineChanges: (hasChanges: boolean) => void;
  syncWithServer: () => Promise<void>;
  
  // Reset
  resetToDefaults: () => void;
}

const defaultState: Omit<WeeklyPlannerState, 'isLoading' | 'isSaving' | keyof WeeklyPlannerActions> = {
  // View preferences
  defaultView: 'week',
  timeSlotDuration: 30,
  showWeekends: false,
  startOfWeek: 1,
  workingHours: { start: '08:00', end: '16:00' },
  
  // UI preferences
  sidebarExpanded: true,
  showMiniCalendar: true,
  showResourcePanel: true,
  compactMode: false,
  theme: 'light',
  
  // Planning preferences
  autoSave: true,
  autoSaveInterval: 30,
  showUncoveredOutcomes: true,
  defaultLessonDuration: 60,
  
  // Current state
  currentWeekStart: new Date(),
  lastActiveView: undefined,
  draftChanges: undefined,
  
  // Advanced features
  undoHistory: [],
  redoHistory: [],
  maxHistorySize: 50,
  
  // Offline support
  lastSyncedAt: new Date(),
  hasOfflineChanges: false,
  offlineData: undefined,
};

type WeeklyPlannerActions = Pick<WeeklyPlannerState, 
  | 'setDefaultView' | 'setTimeSlotDuration' | 'setShowWeekends' | 'setStartOfWeek' | 'setWorkingHours'
  | 'setSidebarExpanded' | 'setShowMiniCalendar' | 'setShowResourcePanel' | 'setCompactMode' | 'setTheme'
  | 'setAutoSave' | 'setAutoSaveInterval' | 'setShowUncoveredOutcomes' | 'setDefaultLessonDuration'
  | 'setCurrentWeekStart' | 'setLastActiveView' | 'setDraftChanges'
  | 'saveToHistory' | 'undo' | 'redo' | 'clearHistory'
  | 'loadFromServer' | 'saveToServer' | 'markOfflineChanges' | 'syncWithServer'
  | 'resetToDefaults'
>;

export const useWeeklyPlannerStore = create<WeeklyPlannerState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        ...defaultState,
        isLoading: false,
        isSaving: false,
        
        // View preference setters
        setDefaultView: (view) => set((state) => {
          state.defaultView = view;
          state.lastSyncedAt = new Date();
        }),
        
        setTimeSlotDuration: (duration) => set((state) => {
          state.timeSlotDuration = duration;
          state.lastSyncedAt = new Date();
        }),
        
        setShowWeekends: (show) => set((state) => {
          state.showWeekends = show;
          state.lastSyncedAt = new Date();
        }),
        
        setStartOfWeek: (day) => set((state) => {
          state.startOfWeek = day;
          state.lastSyncedAt = new Date();
        }),
        
        setWorkingHours: (hours) => set((state) => {
          state.workingHours = hours;
          state.lastSyncedAt = new Date();
        }),
        
        // UI preference setters
        setSidebarExpanded: (expanded) => set((state) => {
          state.sidebarExpanded = expanded;
        }),
        
        setShowMiniCalendar: (show) => set((state) => {
          state.showMiniCalendar = show;
        }),
        
        setShowResourcePanel: (show) => set((state) => {
          state.showResourcePanel = show;
        }),
        
        setCompactMode: (compact) => set((state) => {
          state.compactMode = compact;
        }),
        
        setTheme: (theme) => set((state) => {
          state.theme = theme;
        }),
        
        // Planning preference setters
        setAutoSave: (autoSave) => set((state) => {
          state.autoSave = autoSave;
        }),
        
        setAutoSaveInterval: (interval) => set((state) => {
          state.autoSaveInterval = interval;
        }),
        
        setShowUncoveredOutcomes: (show) => set((state) => {
          state.showUncoveredOutcomes = show;
        }),
        
        setDefaultLessonDuration: (duration) => set((state) => {
          state.defaultLessonDuration = duration;
        }),
        
        // Current state setters
        setCurrentWeekStart: (date) => set((state) => {
          state.currentWeekStart = date;
        }),
        
        setLastActiveView: (view) => set((state) => {
          state.lastActiveView = view;
        }),
        
        setDraftChanges: (changes) => set((state) => {
          state.draftChanges = changes;
          state.hasOfflineChanges = !!changes;
        }),
        
        // History management with memory optimization
        saveToHistory: (description) => set((state) => {
          // Only save minimal state to prevent memory leaks
          const stateSnapshot = {
            defaultView: state.defaultView,
            timeSlotDuration: state.timeSlotDuration,
            showWeekends: state.showWeekends,
            startOfWeek: state.startOfWeek,
            workingHours: { ...state.workingHours },
            currentWeekStart: state.currentWeekStart,
            draftChanges: state.draftChanges ? { ...state.draftChanges } : undefined
          };
          
          const historyEntry: UndoRedoState = {
            timestamp: Date.now(),
            description,
            state: stateSnapshot
          };
          
          // Efficiently manage history size
          if (state.undoHistory.length >= state.maxHistorySize) {
            state.undoHistory.shift(); // Remove oldest entry
          }
          
          state.undoHistory.push(historyEntry);
          state.redoHistory = []; // Clear redo history when new action is performed
          
          // Periodic cleanup every 25 operations
          if (state.undoHistory.length % 25 === 0) {
            state.undoHistory = state.undoHistory.slice(-Math.floor(state.maxHistorySize * 0.8));
          }
        }),
        
        undo: () => set((state) => {
          if (state.undoHistory.length === 0) return;
          
          const lastState = state.undoHistory.pop()!;
          
          // Save current state for redo with minimal footprint
          const currentSnapshot = {
            defaultView: state.defaultView,
            timeSlotDuration: state.timeSlotDuration,
            showWeekends: state.showWeekends,
            startOfWeek: state.startOfWeek,
            workingHours: { ...state.workingHours },
            currentWeekStart: state.currentWeekStart,
            draftChanges: state.draftChanges ? { ...state.draftChanges } : undefined
          };
          
          // Limit redo history size
          if (state.redoHistory.length >= state.maxHistorySize) {
            state.redoHistory.shift();
          }
          
          state.redoHistory.push({
            timestamp: Date.now(),
            description: `Redo ${lastState.description}`,
            state: currentSnapshot
          });
          
          // Apply previous state safely
          Object.assign(state, lastState.state);
          // Preserve system state
          state.isLoading = false;
          state.isSaving = false;
          state.lastSyncedAt = new Date();
        }),
        
        redo: () => set((state) => {
          if (state.redoHistory.length === 0) return;
          
          const nextState = state.redoHistory.pop()!;
          
          // Save current state for undo with minimal footprint
          const currentSnapshot = {
            defaultView: state.defaultView,
            timeSlotDuration: state.timeSlotDuration,
            showWeekends: state.showWeekends,
            startOfWeek: state.startOfWeek,
            workingHours: { ...state.workingHours },
            currentWeekStart: state.currentWeekStart,
            draftChanges: state.draftChanges ? { ...state.draftChanges } : undefined
          };
          
          state.undoHistory.push({
            timestamp: Date.now(),
            description: `Undo ${nextState.description}`,
            state: currentSnapshot
          });
          
          // Apply next state safely
          Object.assign(state, nextState.state);
          // Preserve system state
          state.isLoading = false;
          state.isSaving = false;
          state.lastSyncedAt = new Date();
        }),
        
        clearHistory: () => set((state) => {
          state.undoHistory = [];
          state.redoHistory = [];
        }),
        
        // Server persistence
        loadFromServer: async () => {
          set((state) => {
            state.isLoading = true;
          });
          
          try {
            const response = await api.get('/api/planner/state');
            const serverState = response.data;
            
            set((state) => {
              Object.assign(state, {
                ...serverState,
                currentWeekStart: new Date(serverState.currentWeekStart),
                lastSyncedAt: new Date(serverState.lastSyncedAt),
                isLoading: false,
                hasOfflineChanges: false
              });
            });
          } catch (error) {
            console.error('Failed to load planner state from server:', error);
            set((state) => {
              state.isLoading = false;
            });
          }
        },
        
        saveToServer: async () => {
          const state = get();
          if (state.isSaving) return; // Prevent concurrent saves
          
          set((s) => {
            s.isSaving = true;
          });
          
          try {
            const stateToSave = {
              ...state,
              undoHistory: [], // Don't sync history to server
              redoHistory: [],
              isLoading: false,
              isSaving: false
            };
            
            await api.put('/api/planner/state', stateToSave);
            
            set((s) => {
              s.lastSyncedAt = new Date();
              s.hasOfflineChanges = false;
              s.isSaving = false;
            });
          } catch (error) {
            console.error('Failed to save planner state to server:', error);
            set((s) => {
              s.isSaving = false;
              s.hasOfflineChanges = true;
            });
          }
        },
        
        markOfflineChanges: (hasChanges) => set((state) => {
          state.hasOfflineChanges = hasChanges;
        }),
        
        syncWithServer: async () => {
          const { loadFromServer, saveToServer, hasOfflineChanges } = get();
          
          if (hasOfflineChanges) {
            await saveToServer();
          } else {
            await loadFromServer();
          }
        },
        
        // Reset to defaults
        resetToDefaults: () => set((state) => {
          Object.assign(state, defaultState);
          state.lastSyncedAt = new Date();
          state.undoHistory = [];
          state.redoHistory = [];
        })
      })),
      {
        name: 'weekly-planner-storage',
        partialize: (state) => ({
          // Only persist essential UI preferences locally
          sidebarExpanded: state.sidebarExpanded,
          showMiniCalendar: state.showMiniCalendar,
          showResourcePanel: state.showResourcePanel,
          compactMode: state.compactMode,
          theme: state.theme,
          currentWeekStart: state.currentWeekStart,
          lastActiveView: state.lastActiveView,
          draftChanges: state.draftChanges,
          hasOfflineChanges: state.hasOfflineChanges
        })
      }
    )
  )
);

// Auto-save functionality with debouncing and concurrency control
let autoSaveTimeout: NodeJS.Timeout | null = null;
let lastAutoSaveAttempt = 0;
const MIN_SAVE_INTERVAL = 5000; // Minimum 5 seconds between saves

const debouncedAutoSave = () => {
  const now = Date.now();
  const timeSinceLastSave = now - lastAutoSaveAttempt;
  
  if (timeSinceLastSave < MIN_SAVE_INTERVAL) {
    // Too soon, reschedule
    if (autoSaveTimeout) clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(debouncedAutoSave, MIN_SAVE_INTERVAL - timeSinceLastSave);
    return;
  }
  
  const state = useWeeklyPlannerStore.getState();
  if (!state.isSaving && state.hasOfflineChanges) {
    lastAutoSaveAttempt = now;
    state.saveToServer().catch(error => {
      console.warn('Auto-save failed:', error);
    });
  }
};

useWeeklyPlannerStore.subscribe(
  (state) => ({
    autoSave: state.autoSave,
    autoSaveInterval: state.autoSaveInterval,
    hasOfflineChanges: state.hasOfflineChanges,
    isSaving: state.isSaving
  }),
  ({ autoSave, autoSaveInterval, hasOfflineChanges, isSaving }) => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      autoSaveTimeout = null;
    }
    
    if (autoSave && hasOfflineChanges && !isSaving) {
      autoSaveTimeout = setTimeout(debouncedAutoSave, Math.max(autoSaveInterval * 1000, MIN_SAVE_INTERVAL));
    }
  }
);

// Load initial state from server on app start
if (typeof window !== 'undefined') {
  useWeeklyPlannerStore.getState().loadFromServer();
}