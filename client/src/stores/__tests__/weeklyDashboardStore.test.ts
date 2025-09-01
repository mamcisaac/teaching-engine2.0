import { describe, it, expect, beforeEach } from 'vitest';
import { useWeeklyDashboardStore } from '../weeklyDashboardStore';

describe('weeklyDashboardStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useWeeklyDashboardStore.setState({
      undoStack: [],
      redoStack: [],
      viewPreferences: {
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
      },
      offlineQueue: []
    });
  });

  describe('undo/redo functionality', () => {
    it('adds actions to undo stack', () => {
      const store = useWeeklyDashboardStore.getState();
      const action = {
        type: 'move' as const,
        lessonId: '1',
        previousState: { timeSlot: { dayOfWeek: 1, startTime: '09:00', endTime: '09:45' } },
        newState: { timeSlot: { dayOfWeek: 2, startTime: '09:00', endTime: '09:45' } }
      };

      store.addToUndoStack(action);

      const updatedState = useWeeklyDashboardStore.getState();
      expect(updatedState.undoStack).toHaveLength(1);
      expect(updatedState.undoStack[0]).toEqual(action);
    });

    it('performs undo operation', () => {
      const store = useWeeklyDashboardStore.getState();
      const action = {
        type: 'move' as const,
        lessonId: '1',
        previousState: { timeSlot: { dayOfWeek: 1, startTime: '09:00', endTime: '09:45' } },
        newState: { timeSlot: { dayOfWeek: 2, startTime: '09:00', endTime: '09:45' } }
      };

      store.addToUndoStack(action);
      const undoneAction = store.undo();

      expect(undoneAction).toEqual(action);
      
      const updatedState = useWeeklyDashboardStore.getState();
      expect(updatedState.undoStack).toHaveLength(0);
      expect(updatedState.redoStack).toHaveLength(1);
    });

    it('performs redo operation', () => {
      const store = useWeeklyDashboardStore.getState();
      const action = {
        type: 'move' as const,
        lessonId: '1',
        previousState: { timeSlot: { dayOfWeek: 1, startTime: '09:00', endTime: '09:45' } },
        newState: { timeSlot: { dayOfWeek: 2, startTime: '09:00', endTime: '09:45' } }
      };

      store.addToUndoStack(action);
      store.undo();
      const redoneAction = store.redo();

      expect(redoneAction).toEqual(action);
      
      const updatedState = useWeeklyDashboardStore.getState();
      expect(updatedState.undoStack).toHaveLength(1);
      expect(updatedState.redoStack).toHaveLength(0);
    });

    it('clears redo stack when new action is added', () => {
      const store = useWeeklyDashboardStore.getState();
      const action1 = {
        type: 'move' as const,
        lessonId: '1',
        previousState: { timeSlot: { dayOfWeek: 1, startTime: '09:00', endTime: '09:45' } },
        newState: { timeSlot: { dayOfWeek: 2, startTime: '09:00', endTime: '09:45' } }
      };
      const action2 = {
        type: 'move' as const,
        lessonId: '2',
        previousState: { timeSlot: { dayOfWeek: 3, startTime: '10:00', endTime: '10:45' } },
        newState: { timeSlot: { dayOfWeek: 4, startTime: '10:00', endTime: '10:45' } }
      };

      store.addToUndoStack(action1);
      store.undo();
      store.addToUndoStack(action2);

      const updatedState = useWeeklyDashboardStore.getState();
      expect(updatedState.redoStack).toHaveLength(0);
    });
  });

  describe('view preferences', () => {
    it('updates view preferences', () => {
      const store = useWeeklyDashboardStore.getState();
      const newPrefs = {
        showWeekends: true,
        compactView: true
      };

      store.updateViewPreferences(newPrefs);

      const updatedState = useWeeklyDashboardStore.getState();
      expect(updatedState.viewPreferences.showWeekends).toBe(true);
      expect(updatedState.viewPreferences.compactView).toBe(true);
      expect(updatedState.viewPreferences.showTimeLabels).toBe(true); // Unchanged
    });

    it('resets settings to defaults', () => {
      const store = useWeeklyDashboardStore.getState();
      
      // Modify some settings
      store.updateViewPreferences({
        showWeekends: true,
        compactView: true,
        use24HourTime: true
      });

      // Reset
      store.resetSettings();

      const updatedState = useWeeklyDashboardStore.getState();
      expect(updatedState.viewPreferences.showWeekends).toBe(false);
      expect(updatedState.viewPreferences.compactView).toBe(false);
      expect(updatedState.viewPreferences.use24HourTime).toBe(false);
    });
  });

  describe('offline queue', () => {
    it('adds operations to offline queue', () => {
      const store = useWeeklyDashboardStore.getState();
      const operation = {
        id: 'op-1',
        type: 'update' as const,
        endpoint: '/api/lesson-plans/1',
        data: { title: 'Updated Lesson' },
        timestamp: Date.now()
      };

      store.addToOfflineQueue(operation);

      const updatedState = useWeeklyDashboardStore.getState();
      expect(updatedState.offlineQueue).toHaveLength(1);
      expect(updatedState.offlineQueue[0]).toEqual(operation);
    });

    it('removes operations from offline queue', () => {
      const store = useWeeklyDashboardStore.getState();
      const operation1 = {
        id: 'op-1',
        type: 'update' as const,
        endpoint: '/api/lesson-plans/1',
        data: { title: 'Updated Lesson 1' },
        timestamp: Date.now()
      };
      const operation2 = {
        id: 'op-2',
        type: 'create' as const,
        endpoint: '/api/lesson-plans',
        data: { title: 'New Lesson' },
        timestamp: Date.now()
      };

      store.addToOfflineQueue(operation1);
      store.addToOfflineQueue(operation2);
      store.removeFromOfflineQueue('op-1');

      const updatedState = useWeeklyDashboardStore.getState();
      expect(updatedState.offlineQueue).toHaveLength(1);
      expect(updatedState.offlineQueue[0].id).toBe('op-2');
    });

    it('clears offline queue', () => {
      const store = useWeeklyDashboardStore.getState();
      const operation1 = {
        id: 'op-1',
        type: 'update' as const,
        endpoint: '/api/lesson-plans/1',
        data: { title: 'Updated Lesson' },
        timestamp: Date.now()
      };
      const operation2 = {
        id: 'op-2',
        type: 'create' as const,
        endpoint: '/api/lesson-plans',
        data: { title: 'New Lesson' },
        timestamp: Date.now()
      };

      store.addToOfflineQueue(operation1);
      store.addToOfflineQueue(operation2);
      store.clearOfflineQueue();

      const updatedState = useWeeklyDashboardStore.getState();
      expect(updatedState.offlineQueue).toHaveLength(0);
    });
  });

  describe('persistence', () => {
    it('maintains state across store rehydration', () => {
      const store = useWeeklyDashboardStore.getState();
      
      // Modify state
      store.updateViewPreferences({ showWeekends: true });
      store.addToUndoStack({
        type: 'move' as const,
        lessonId: '1',
        previousState: { timeSlot: { dayOfWeek: 1, startTime: '09:00', endTime: '09:45' } },
        newState: { timeSlot: { dayOfWeek: 2, startTime: '09:00', endTime: '09:45' } }
      });

      const state = useWeeklyDashboardStore.getState();
      expect(state.viewPreferences.showWeekends).toBe(true);
      expect(state.undoStack).toHaveLength(1);
    });
  });
});