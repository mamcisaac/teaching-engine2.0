// Window type extensions for memory leak prevention

interface Window {
  // Toast timeout tracking
  __toastTimeouts?: Map<string, NodeJS.Timeout>;
  
  // UI Store cleanup functions
  __uiStoreCleanup?: Array<() => void>;
  
  // Keyboard shortcuts cleanup
  __keyboardShortcutCleanup?: () => void;
  
  // Keyboard store cleanup functions
  __keyboardStoreCleanup?: Array<() => void>;
}