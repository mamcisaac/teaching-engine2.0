import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

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

interface KeyboardShortcutsContextType {
  shortcuts: KeyboardShortcut[];
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (id: string) => void;
  enableShortcut: (id: string) => void;
  disableShortcut: (id: string) => void;
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  preferences: KeyboardShortcutPreferences;
  updatePreferences: (prefs: Partial<KeyboardShortcutPreferences>) => void;
}

interface KeyboardShortcutPreferences {
  enabled: boolean;
  showHints: boolean;
  customShortcuts: Record<string, Partial<KeyboardShortcut>>;
}

const defaultPreferences: KeyboardShortcutPreferences = {
  enabled: true,
  showHints: true,
  customShortcuts: {}
};

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
};

const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrl && !isMac) parts.push('Ctrl');
  if (shortcut.cmd && isMac) parts.push('⌘');
  if (shortcut.ctrl && isMac) parts.push('⌃');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(isMac ? '' : '+');
};

export const KeyboardShortcutsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [preferences, setPreferences] = useState<KeyboardShortcutPreferences>(defaultPreferences);
  const shortcutsRef = useRef<KeyboardShortcut[]>([]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('keyboard-shortcuts-preferences');
    if (savedPrefs) {
      try {
        const parsed = JSON.parse(savedPrefs);
        setPreferences({ ...defaultPreferences, ...parsed });
        setIsEnabled(parsed.enabled ?? true);
      } catch (e) {
        console.error('Failed to parse keyboard shortcuts preferences:', e);
      }
    }
  }, []);

  // Save preferences to localStorage
  const updatePreferences = useCallback((prefs: Partial<KeyboardShortcutPreferences>) => {
    const newPrefs = { ...preferences, ...prefs };
    setPreferences(newPrefs);
    localStorage.setItem('keyboard-shortcuts-preferences', JSON.stringify(newPrefs));
    
    if (prefs.enabled !== undefined) {
      setIsEnabled(prefs.enabled);
    }
  }, [preferences]);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prev => {
      // Check if shortcut already exists
      const exists = prev.some(s => s.id === shortcut.id);
      if (exists) {
        // Update existing shortcut
        return prev.map(s => s.id === shortcut.id ? shortcut : s);
      }
      // Add new shortcut
      return [...prev, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.filter(s => s.id !== id));
  }, []);

  const enableShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: true } : s
    ));
  }, []);

  const disableShortcut = useCallback((id: string) => {
    setShortcuts(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: false } : s
    ));
  }, []);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  // Global keyboard event handler
  useEffect(() => {
    if (!isEnabled || !preferences.enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || 
          target.tagName === 'TEXTAREA' || 
          target.tagName === 'SELECT' ||
          target.contentEditable === 'true') {
        // Allow some global shortcuts even in input fields
        const allowedInInputs = ['Escape', 'F1'];
        if (!allowedInInputs.includes(event.key)) {
          return;
        }
      }

      // Check each registered shortcut
      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        // Apply custom shortcuts from preferences
        const customShortcut = preferences.customShortcuts[shortcut.id];
        const finalShortcut = customShortcut ? { ...shortcut, ...customShortcut } : shortcut;

        // Check if key matches
        if (event.key.toLowerCase() !== finalShortcut.key.toLowerCase()) continue;

        // Check modifiers
        const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
        const cmdKey = isMac ? event.metaKey : false;

        if (finalShortcut.ctrl && !ctrlKey) continue;
        if (finalShortcut.cmd && !cmdKey) continue;
        if (finalShortcut.alt && !event.altKey) continue;
        if (finalShortcut.shift && !event.shiftKey) continue;

        // Check for no modifiers when none are specified
        if (!finalShortcut.ctrl && !finalShortcut.cmd && !finalShortcut.alt && !finalShortcut.shift) {
          if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) continue;
        }

        // Prevent default and run handler
        event.preventDefault();
        event.stopPropagation();
        finalShortcut.handler(event);
        break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, preferences]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        shortcuts,
        registerShortcut,
        unregisterShortcut,
        enableShortcut,
        disableShortcut,
        isEnabled,
        setIsEnabled,
        preferences,
        updatePreferences
      }}
    >
      {children}
    </KeyboardShortcutsContext.Provider>
  );
};