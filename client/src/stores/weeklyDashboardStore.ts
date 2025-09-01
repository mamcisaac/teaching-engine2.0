import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types for the weekly dashboard
export interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UndoableAction {
  type: 'move' | 'add' | 'delete' | 'update';
  lessonId: string;
  previousState: any;
  newState: any;
}

export interface ViewPreferences {
  showWeekends: boolean;
  showTimeLabels: boolean;
  compactView: boolean;
  groupBySubject: boolean;
  showCompletedLessons: boolean;
  use24HourTime: boolean;
  dayStartTime: string;
  dayEndTime: string;
  theme: 'light' | 'dark' | 'system';
  colorblindMode: boolean;
  highContrast: boolean;
  enableKeyboardShortcuts: boolean;
  enableReminders: boolean;
  reminderMinutesBefore: number;
  autoRefresh: boolean;
  refreshInterval: number;
  enableOfflineMode: boolean;
  fontSize?: number;
  showFocusIndicators?: boolean;
  enableAnnouncements?: boolean;
  verboseDescriptions?: boolean;
  reduceMotion?: boolean;
  disableAutoScroll?: boolean;
  autoSave?: boolean;
}

export interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  timeSlots: TimeSlot[];
  isDefault: boolean;
}

interface WeeklyDashboardState {
  // Undo/Redo functionality
  undoStack: UndoableAction[];
  redoStack: UndoableAction[];
  
  // View preferences
  viewPreferences: ViewPreferences;
  
  // Offline queue
  offlineQueue: OfflineOperation[];
}

interface WeeklyDashboardActions {
  // Undo/Redo
  addToUndoStack: (action: UndoableAction) => void;
  undo: () => UndoableAction | null;
  redo: () => UndoableAction | null;
  
  // View preferences
  updateViewPreferences: (prefs: Partial<ViewPreferences>) => void;
  resetSettings: () => void;
  
  // Offline queue
  addToOfflineQueue: (operation: OfflineOperation) => void;
  removeFromOfflineQueue: (operationId: string) => void;
  clearOfflineQueue: () => void;
}

const defaultViewPreferences: ViewPreferences = {
  showWeekends: false,
  showTimeLabels: true,
  compactView: false,
  groupBySubject: false,
  showCompletedLessons: true,
  use24HourTime: false,
  dayStartTime: '08:00',
  dayEndTime: '16:00',
  theme: 'light',
  colorblindMode: false,
  highContrast: false,
  enableKeyboardShortcuts: true,
  enableReminders: false,
  reminderMinutesBefore: 5,
  autoRefresh: false,
  refreshInterval: 30,
  enableOfflineMode: false
};

export const useWeeklyDashboardStore = create<WeeklyDashboardState & WeeklyDashboardActions>()(
  persist(
    immer((set, get) => ({
      // Initial state
      undoStack: [],
      redoStack: [],
      viewPreferences: defaultViewPreferences,
      offlineQueue: [],
      
      // Undo/Redo actions
      addToUndoStack: (action) => set((state) => {
        state.undoStack.push(action);
        // Limit stack size to prevent memory issues
        if (state.undoStack.length > 50) {
          state.undoStack.shift();
        }
        // Clear redo stack when new action is added
        state.redoStack = [];
      }),
      
      undo: () => {
        const state = get();
        if (state.undoStack.length === 0) return null;
        
        const action = state.undoStack[state.undoStack.length - 1];
        set((draft) => {
          const undoneAction = draft.undoStack.pop();
          if (undoneAction) {
            draft.redoStack.push(undoneAction);
          }
        });
        return action;
      },
      
      redo: () => {
        const state = get();
        if (state.redoStack.length === 0) return null;
        
        const action = state.redoStack[state.redoStack.length - 1];
        set((draft) => {
          const redoneAction = draft.redoStack.pop();
          if (redoneAction) {
            draft.undoStack.push(redoneAction);
          }
        });
        return action;
      },
      
      // View preferences
      updateViewPreferences: (prefs) => set((state) => {
        state.viewPreferences = { ...state.viewPreferences, ...prefs };
      }),
      
      resetSettings: () => set((state) => {
        state.viewPreferences = defaultViewPreferences;
        state.undoStack = [];
        state.redoStack = [];
        state.offlineQueue = [];
      }),
      
      // Offline queue
      addToOfflineQueue: (operation) => set((state) => {
        state.offlineQueue.push(operation);
      }),
      
      removeFromOfflineQueue: (operationId) => set((state) => {
        state.offlineQueue = state.offlineQueue.filter(op => op.id !== operationId);
      }),
      
      clearOfflineQueue: () => set((state) => {
        state.offlineQueue = [];
      })
    })),
    {
      name: 'weekly-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        viewPreferences: state.viewPreferences,
        offlineQueue: state.offlineQueue
      })
    }
  )
);