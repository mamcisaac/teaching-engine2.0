// State Management Exports
// Following the standardized state management patterns for Teaching Engine 2.0

// Zustand Stores (Global State)
export * from './lessonPlanStore';
export * from './unitPlanStore';
export * from './daybookStore';
export * from './weeklyPlannerStore';
export * from './basePlanningStore';

// New Standardized Stores
export * from './onboardingStore';
export * from './helpStore';
export * from './keyboardShortcutsStore';
export * from './languageStore';
export * from './uiStore';

// Re-export commonly used types and utilities
export type { OnboardingStep, OnboardingFlow } from './onboardingStore';
export type { KeyboardShortcut } from './keyboardShortcutsStore';
export type { LessonPlan } from './lessonPlanStore';

// Store initialization utilities
export const initializeStores = (): void => {
  // Auto-start keyboard shortcuts if enabled
  if (typeof window !== 'undefined') {
    void import('./keyboardShortcutsStore').then(({ useKeyboardShortcutsStore }) => {
      const keyboardStore = useKeyboardShortcutsStore.getState();
      if (keyboardStore.isEnabled && keyboardStore.preferences.enabled) {
        keyboardStore.startListening();
      }
    }).catch((error: unknown) => {
      console.error('Error loading keyboard shortcuts store:', error);
    });
  }
};
