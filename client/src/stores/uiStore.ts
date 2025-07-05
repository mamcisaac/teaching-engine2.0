import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface UIState {
  // Theme
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';
  
  // Layout
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  mainLayoutPadding: number;
  
  // Modals and overlays
  activeModals: string[];
  activeToasts: Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>;
  
  // Loading states
  globalLoading: boolean;
  loadingOverlay: string | null;
  
  // Navigation
  activeNavSection: string | null;
  breadcrumbs: Array<{ label: string; href?: string }>;
  
  // Preferences
  showTips: boolean;
  autoSave: boolean;
  compactMode: boolean;
  animations: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleTheme: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  closeAllModals: () => void;
  isModalOpen: (modalId: string) => boolean;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info', duration?: number) => void;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
  setGlobalLoading: (loading: boolean) => void;
  setLoadingOverlay: (message: string | null) => void;
  setActiveNavSection: (section: string | null) => void;
  setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => void;
  updatePreferences: (prefs: Partial<{
    showTips: boolean;
    autoSave: boolean;
    compactMode: boolean;
    animations: boolean;
  }>) => void;
}

// Helper function to detect system theme preference
const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper function to calculate effective theme
const calculateEffectiveTheme = (theme: 'light' | 'dark' | 'system'): 'light' | 'dark' => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

export const useUIStore = create<UIState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      theme: 'system',
      effectiveTheme: getSystemTheme(),
      sidebarCollapsed: false,
      sidebarWidth: 280,
      mainLayoutPadding: 24,
      activeModals: [],
      activeToasts: [],
      globalLoading: false,
      loadingOverlay: null,
      activeNavSection: null,
      breadcrumbs: [],
      showTips: true,
      autoSave: true,
      compactMode: false,
      animations: true,
      
      // Actions
      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set((state) => {
          state.theme = theme;
          state.effectiveTheme = calculateEffectiveTheme(theme);
        });
        
        // Apply theme to document
        const effectiveTheme = calculateEffectiveTheme(theme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(effectiveTheme);
      },
      
      toggleTheme: () => {
        const currentTheme = get().theme;
        let newTheme: 'light' | 'dark' | 'system';
        
        if (currentTheme === 'light') {
          newTheme = 'dark';
        } else if (currentTheme === 'dark') {
          newTheme = 'system';
        } else {
          newTheme = 'light';
        }
        
        get().setTheme(newTheme);
      },
      
      setSidebarCollapsed: (collapsed: boolean) => {
        set((state) => {
          state.sidebarCollapsed = collapsed;
        });
      },
      
      toggleSidebar: () => {
        const currentCollapsed = get().sidebarCollapsed;
        get().setSidebarCollapsed(!currentCollapsed);
      },
      
      setSidebarWidth: (width: number) => {
        set((state) => {
          state.sidebarWidth = Math.max(200, Math.min(400, width)); // Clamp between 200-400px
        });
      },
      
      openModal: (modalId: string) => {
        set((state) => {
          if (!state.activeModals.includes(modalId)) {
            state.activeModals.push(modalId);
          }
        });
      },
      
      closeModal: (modalId: string) => {
        set((state) => {
          state.activeModals = state.activeModals.filter(id => id !== modalId);
        });
      },
      
      closeAllModals: () => {
        set((state) => {
          state.activeModals = [];
        });
      },
      
      isModalOpen: (modalId: string) => {
        return get().activeModals.includes(modalId);
      },
      
      showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 5000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        set((state) => {
          state.activeToasts.push({ id, message, type, duration });
        });
        
        // Auto-hide toast after duration
        if (duration > 0) {
          setTimeout(() => {
            get().hideToast(id);
          }, duration);
        }
      },
      
      hideToast: (id: string) => {
        set((state) => {
          state.activeToasts = state.activeToasts.filter(toast => toast.id !== id);
        });
      },
      
      clearAllToasts: () => {
        set((state) => {
          state.activeToasts = [];
        });
      },
      
      setGlobalLoading: (loading: boolean) => {
        set((state) => {
          state.globalLoading = loading;
        });
      },
      
      setLoadingOverlay: (message: string | null) => {
        set((state) => {
          state.loadingOverlay = message;
        });
      },
      
      setActiveNavSection: (section: string | null) => {
        set((state) => {
          state.activeNavSection = section;
        });
      },
      
      setBreadcrumbs: (breadcrumbs: Array<{ label: string; href?: string }>) => {
        set((state) => {
          state.breadcrumbs = breadcrumbs;
        });
      },
      
      updatePreferences: (prefs: Partial<{
        showTips: boolean;
        autoSave: boolean;
        compactMode: boolean;
        animations: boolean;
      }>) => {
        set((state) => {
          Object.assign(state, prefs);
        });
      },
    })),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        sidebarWidth: state.sidebarWidth,
        showTips: state.showTips,
        autoSave: state.autoSave,
        compactMode: state.compactMode,
        animations: state.animations,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on rehydration
          const effectiveTheme = calculateEffectiveTheme(state.theme);
          state.effectiveTheme = effectiveTheme;
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(effectiveTheme);
        }
      },
    }
  )
);

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const state = useUIStore.getState();
    if (state.theme === 'system') {
      const newEffectiveTheme = getSystemTheme();
      useUIStore.setState({ effectiveTheme: newEffectiveTheme });
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newEffectiveTheme);
    }
  });
}

// Selector hooks for performance
export const useTheme = () => useUIStore(state => ({ 
  theme: state.theme, 
  effectiveTheme: state.effectiveTheme,
  setTheme: state.setTheme,
  toggleTheme: state.toggleTheme
}));

export const useSidebar = () => useUIStore(state => ({
  collapsed: state.sidebarCollapsed,
  width: state.sidebarWidth,
  setCollapsed: state.setSidebarCollapsed,
  toggle: state.toggleSidebar,
  setWidth: state.setSidebarWidth
}));

export const useModals = () => useUIStore(state => ({
  activeModals: state.activeModals,
  openModal: state.openModal,
  closeModal: state.closeModal,
  closeAllModals: state.closeAllModals,
  isModalOpen: state.isModalOpen
}));

export const useToasts = () => useUIStore(state => ({
  toasts: state.activeToasts,
  showToast: state.showToast,
  hideToast: state.hideToast,
  clearAllToasts: state.clearAllToasts
}));

export const useLoading = () => useUIStore(state => ({
  globalLoading: state.globalLoading,
  loadingOverlay: state.loadingOverlay,
  setGlobalLoading: state.setGlobalLoading,
  setLoadingOverlay: state.setLoadingOverlay
}));

export const useNavigation = () => useUIStore(state => ({
  activeSection: state.activeNavSection,
  breadcrumbs: state.breadcrumbs,
  setActiveSection: state.setActiveNavSection,
  setBreadcrumbs: state.setBreadcrumbs
}));

export const useUIPreferences = () => useUIStore(state => ({
  showTips: state.showTips,
  autoSave: state.autoSave,
  compactMode: state.compactMode,
  animations: state.animations,
  updatePreferences: state.updatePreferences
}));