import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '../utils/logger';

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

  if (shortcut.ctrl === true && !isMac) {
parts.push('Ctrl');
}
  if (shortcut.cmd === true && isMac) {
parts.push('⌘');
}
  if (shortcut.ctrl === true && isMac) {
parts.push('⌃');
}
  if (shortcut.alt === true) {
parts.push(isMac ? '⌥' : 'Alt');
}
  if (shortcut.shift === true) {
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
      registerShortcut: (shortcut: KeyboardShortcut): void => {
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

      unregisterShortcut: (id: string): void => {
        set((state) => {
          state.shortcuts = state.shortcuts.filter((s) => s.id != id);
        });
      },

      enableShortcut: (id: string): void => {
        set((state) => {
          const shortcut = state.shortcuts.find((s) => s.id === id);
          if (shortcut != undefined) {
            shortcut.enabled = true;
          }
        });
      },

      disableShortcut: (id: string): void => {
        set((state) => {
          const shortcut = state.shortcuts.find((s) => s.id === id);
          if (shortcut != undefined) {
            shortcut.enabled = false;
          }
        });
      },

      setIsEnabled: (enabled: boolean): void => {
        set((state) => {
          state.isEnabled = enabled;
          state.preferences.enabled = enabled;
        });
      },

      updatePreferences: (prefs: Partial<KeyboardShortcutPreferences>): void => {
        set((state) => {
          state.preferences = { ...state.preferences, ...prefs };
          if (prefs.enabled != undefined) {
            state.isEnabled = prefs.enabled;
          }
        });
      },

      startListening: (): void => {
        const state = get();
        if (state.isListening) {
return;
}

        set((draft) => {
          draft.isListening = true;
        });

        const handleKeyDown = (event: KeyboardEvent): void => {
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
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const finalShortcut = customShortcut != null && Object.keys(customShortcut).length > 0 ? { ...shortcut, ...customShortcut } : shortcut;

            // Check if key matches
            if (event.key.toLowerCase() != finalShortcut.key.toLowerCase()) {
continue;
}

            // Check modifiers
            const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
            const cmdKey = isMac ? event.metaKey : false;

            if (finalShortcut.ctrl === true && !ctrlKey) {
continue;
}
            if (finalShortcut.cmd === true && !cmdKey) {
continue;
}
            if (finalShortcut.alt === true && !event.altKey) {
continue;
}
            if (finalShortcut.shift === true && !event.shiftKey) {
continue;
}

            // Check for no modifiers when none are specified
            if (
              finalShortcut.ctrl != true &&
              finalShortcut.cmd != true &&
              finalShortcut.alt != true &&
              finalShortcut.shift != true
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
        (window as unknown as WindowWithCleanup).__keyboardShortcutCleanup = (): void => {
          window.removeEventListener('keydown', handleKeyDown);
        };
      },

      stopListening: (): void => {
        set((state) => {
          state.isListening = false;
        });

        interface WindowWithCleanup extends Window {
          __keyboardShortcutCleanup?: () => void;
        }
        const windowWithCleanup = window as unknown as WindowWithCleanup;
        if (windowWithCleanup.__keyboardShortcutCleanup != undefined) {
          windowWithCleanup.__keyboardShortcutCleanup();
          delete windowWithCleanup.__keyboardShortcutCleanup;
        }
      },

      // Computed values
      getShortcutsByCategory: (category: string): KeyboardShortcut[] => {
        const state = get();
        return state.shortcuts.filter((s) => s.category === category);
      },

      getFormattedShortcut: (shortcut: KeyboardShortcut): string => formatShortcut(shortcut),
    })),
    {
      name: 'keyboard-shortcuts-storage',
      partialize: (state) => ({
        preferences: state.preferences,
        isEnabled: state.isEnabled,
      }),
      onRehydrateStorage: () => (state?: KeyboardShortcutsState): void => {
        if (state != undefined) {
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
export const useKeyboardShortcuts = (): KeyboardShortcutsState => useKeyboardShortcutsStore();
export const useShortcutsByCategory = (category: string): KeyboardShortcut[] =>
  useKeyboardShortcutsStore((state) => state.getShortcutsByCategory(category));
export const useShortcutsEnabled = (): boolean => useKeyboardShortcutsStore((state) => state.isEnabled);
export const useKeyboardPreferences = (): KeyboardShortcutPreferences => useKeyboardShortcutsStore((state) => state.preferences);
