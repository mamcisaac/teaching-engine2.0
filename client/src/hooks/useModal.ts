import { useState, useCallback } from 'react';

export interface UseModalOptions<T = any> {
  defaultOpen?: boolean;
  onOpen?: (data?: T) => void;
  onClose?: () => void;
}

export function useModal<T = any>(options: UseModalOptions<T> = {}) {
  const { defaultOpen = false, onOpen, onClose } = options;
  
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data, setData] = useState<T | undefined>();

  const open = useCallback((modalData?: T) => {
    setData(modalData);
    setIsOpen(true);
    onOpen?.(modalData);
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
    // Clear data after animation completes
    setTimeout(() => setData(undefined), 300);
  }, [onClose]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}

// Multiple modals manager
export interface ModalState<T = any> {
  isOpen: boolean;
  data?: T;
}

export interface UseModalsReturn {
  modals: Record<string, ModalState>;
  openModal: (name: string, data?: any) => void;
  closeModal: (name: string) => void;
  toggleModal: (name: string, data?: any) => void;
  closeAllModals: () => void;
  isModalOpen: (name: string) => boolean;
  getModalData: <T = any>(name: string) => T | undefined;
}

export function useModals(initialModals: string[] = []): UseModalsReturn {
  const [modals, setModals] = useState<Record<string, ModalState>>(() => {
    const initial: Record<string, ModalState> = {};
    initialModals.forEach(name => {
      initial[name] = { isOpen: false };
    });
    return initial;
  });

  const openModal = useCallback((name: string, data?: any) => {
    setModals(prev => ({
      ...prev,
      [name]: { isOpen: true, data }
    }));
  }, []);

  const closeModal = useCallback((name: string) => {
    setModals(prev => ({
      ...prev,
      [name]: { ...prev[name], isOpen: false }
    }));
    
    // Clear data after animation
    setTimeout(() => {
      setModals(prev => ({
        ...prev,
        [name]: { isOpen: false, data: undefined }
      }));
    }, 300);
  }, []);

  const toggleModal = useCallback((name: string, data?: any) => {
    setModals(prev => {
      const modal = prev[name] || { isOpen: false };
      return {
        ...prev,
        [name]: modal.isOpen 
          ? { ...modal, isOpen: false }
          : { isOpen: true, data }
      };
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(prev => {
      const newState: Record<string, ModalState> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = { ...prev[key], isOpen: false };
      });
      return newState;
    });
    
    // Clear all data after animation
    setTimeout(() => {
      setModals(prev => {
        const newState: Record<string, ModalState> = {};
        Object.keys(prev).forEach(key => {
          newState[key] = { isOpen: false };
        });
        return newState;
      });
    }, 300);
  }, []);

  const isModalOpen = useCallback((name: string) => {
    return modals[name]?.isOpen || false;
  }, [modals]);

  const getModalData = useCallback(<T = any>(name: string): T | undefined => {
    return modals[name]?.data as T;
  }, [modals]);

  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    closeAllModals,
    isModalOpen,
    getModalData,
  };
}