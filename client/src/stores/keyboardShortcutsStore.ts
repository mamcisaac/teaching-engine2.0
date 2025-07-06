import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import logger from '../utils/logger';

export interface KeyboardShortcut {
  id: string;
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  category: 'global' | 'navigation' | 'planning' | 'editing' | 'other';
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean;
  visible?: boolean;
}

interface KeyboardShortcutPreferences {
  enabled: boolean;
  showHints: boolean;
  customShortcuts: Record<string, Partial<KeyboardShortcut>>;
}

interface KeyboardShortcutsState {
  shortcuts: KeyboardShortcut[];
  isEnabled: boolean;
  preferences: KeyboardShortcutPreferences;
  isListening: boolean;

  // Actions
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  enableShortcut: (id: string) => void;
  disableShortcut: (id: string) => void;
  setIsEnabled: (enabled: boolean) => void;
  updatePreferences: (prefs: Partial<KeyboardShortcutPreferences>) => void;
  startListening: () => void;
  stopListening: () => void;

  // Computed values
  getShortcutsByCategory: (category: string) => KeyboardShortcut[];
  getFormattedShortcut: (shortcut: KeyboardShortcut) => string;
}

const defaultPreferences: KeyboardShortcutPreferences = {
  enabled: true,
  showHints: true,
  customShortcuts: {},
};

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');

export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];

  if (shortcut.ctrl && !isMac) {
parts.push('Ctrl');
}
  if (shortcut.cmd && isMac) {
parts.push('⌘');
}
  if (shortcut.ctrl && isMac) {
parts.push('⌃');
}
  if (shortcut.alt) {
parts.push(isMac ? '⌥' : 'Alt');
}
  if (shortcut.shift) {
parts.push(isMac ? '⇧' : 'Shift');
}

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
};

export const useKeyboardShortcutsStore = create<KeyboardShortcutsState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      shortcuts: [],
      isEnabled: true,
      preferences: defaultPreferences,
      isListening: false,

      // Actions
      registerShortcut: (shortcut: KeyboardShortcut) => {
        set((state) => {
          const existingIndex = state.shortcuts.findIndex((s) => s.id === shortcut.id);
          if (existingIndex >= 0) {
            // Update existing shortcut
            state.shortcuts[existingIndex] = shortcut;
          } else {
            // Add new shortcut
            state.shortcuts.push(shortcut);
          }
        });
      },

      unregisterShortcut: (id: string) => {
        set((state) => {
          state.shortcuts = state.shortcuts.filter((s) => s.id !== id);
        });
      },

      enableShortcut: (id: string) => {
        set((state) => {
          const shortcut = state.shortcuts.find((s) => s.id === id);
          if (shortcut) {
            shortcut.enabled = true;
          }
        });
      },

      disableShortcut: (id: string) => {
        set((state) => {
          const shortcut = state.shortcuts.find((s) => s.id === id);
          if (shortcut) {
            shortcut.enabled = false;
          }
        });
      },

      setIsEnabled: (enabled: boolean) => {
        set((state) => {
          state.isEnabled = enabled;
          state.preferences.enabled = enabled;
        });
      },

      updatePreferences: (prefs: Partial<KeyboardShortcutPreferences>) => {
        set((state) => {
          state.preferences = { ...state.preferences, ...prefs };
          if (prefs.enabled !== undefined) {
            state.isEnabled = prefs.enabled;
          }
        });
      },

      startListening: () => {
        const state = get();
        if (state.isListening) {
return;
}

        set((draft) => {
          draft.isListening = true;
        });

        const handleKeyDown = (event: KeyboardEvent) => {
          const currentState = get();
          if (!currentState.isEnabled || !currentState.preferences.enabled) {
return;
}

          // Don't trigger shortcuts when typing in input fields
          const target = event.target as HTMLElement;
          if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.tagName === 'SELECT' ||
            target.contentEditable === 'true'
          ) {
            // Allow some global shortcuts even in input fields
            const allowedInInputs = ['Escape', 'F1'];
            if (!allowedInInputs.includes(event.key)) {
              return;
            }
          }

          // Check each registered shortcut
          for (const shortcut of currentState.shortcuts) {
            if (shortcut.enabled === false) {
continue;
}

            // Apply custom shortcuts from preferences
            const customShortcut = currentState.preferences.customShortcuts[shortcut.id];
            const finalShortcut = customShortcut ? { ...shortcut, ...customShortcut } : shortcut;

            // Check if key matches
            if (event.key.toLowerCase() !== finalShortcut.key.toLowerCase()) {
continue;
}

            // Check modifiers
            const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
            const cmdKey = isMac ? event.metaKey : false;

            if (finalShortcut.ctrl && !ctrlKey) {
continue;
}
            if (finalShortcut.cmd && !cmdKey) {
continue;
}
            if (finalShortcut.alt && !event.altKey) {
continue;
}
            if (finalShortcut.shift && !event.shiftKey) {
continue;
}

            // Check for no modifiers when none are specified
            if (
              !finalShortcut.ctrl &&
              !finalShortcut.cmd &&
              !finalShortcut.alt &&
              !finalShortcut.shift
            ) {
              if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
continue;
}
            }

            // Prevent default and run handler
            event.preventDefault();
            event.stopPropagation();
            finalShortcut.handler(event);
            break;
          }
        };

        window.addEventListener('keydown', handleKeyDown);

        // Store cleanup function
        interface WindowWithCleanup extends Window {
          __keyboardShortcutCleanup?: () => void;
        }
        (window as unknown as WindowWithCleanup).__keyboardShortcutCleanup = () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      },

      stopListening: () => {
        set((state) => {
          state.isListening = false;
        });

        interface WindowWithCleanup extends Window {
          __keyboardShortcutCleanup?: () => void;
        }
        const windowWithCleanup = window as unknown as WindowWithCleanup;
        if (windowWithCleanup.__keyboardShortcutCleanup) {
          windowWithCleanup.__keyboardShortcutCleanup();
          delete windowWithCleanup.__keyboardShortcutCleanup;
        }
      },

      // Computed values
      getShortcutsByCategory: (category: string) => {
        const state = get();
        return state.shortcuts.filter((s) => s.category === category);
      },

      getFormattedShortcut: (shortcut: KeyboardShortcut) => formatShortcut(shortcut),
    })),
    {
      name: 'keyboard-shortcuts-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        isEnabled: state.isEnabled,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          try {
            // Auto-start listening when rehydrated if enabled
            if (state.isEnabled && state.preferences.enabled) {
              state.startListening();
            }
          } catch (error) {
            logger.warn('Failed to initialize keyboard shortcuts:', error);
          }
        }
      },
    },
  ),
);

// Cleanup function for when the store is no longer needed
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const state = useKeyboardShortcutsStore.getState();
    state.stopListening();
  });
}

// Selector hooks for performance
export const useKeyboardShortcuts = (): UseQueryResult<unknown> => useKeyboardShortcutsStore();
export const useShortcutsByCategory = (category: string) =>
  useKeyboardShortcutsStore((state) => state.getShortcutsByCategory(category));
export const useShortcutsEnabled = (): UseQueryResult<unknown> => useKeyboardShortcutsStore((state) => state.isEnabled);
export const useKeyboardPreferences = (): UseQueryResult<unknown> => useKeyboardShortcutsStore((state) => state.preferences);
