import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface NavigationContextValue {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  isMobile: boolean;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function useNavigation(): NavigationContextValue {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps): React.ReactElement {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleSidebar = useCallback((): void => {
    setIsSidebarOpen(prev => !prev);
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setSidebarOpen = useCallback((isOpen: boolean): void => {
    setIsSidebarOpen(isOpen);
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect((): (() => void) => {
    const handleResize = (): void => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Auto-adjust sidebar based on screen size
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      } else if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return (): void => {
 window.removeEventListener('resize', handleResize); 
};
  }, [isSidebarOpen]);

  const value: NavigationContextValue = {
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    isMobile,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}