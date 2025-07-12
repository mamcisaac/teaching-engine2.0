import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

const toastListeners: ((toast: Toast) => void)[] = [];

export function useToast(): { toasts: Toast[]; toast: (options: ToastOptions) => void; dismiss: (toastId: string) => void } {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return () => { // Cleanup
    };

    const listener = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 5000);
    };

    toastListeners.push(listener);
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toast = (options: ToastOptions): void => {
    const newToast: Toast = {
      id: Date.now().toString(),
      ...options,
    };

    toastListeners.forEach((listener) => {
 listener(newToast); 
});
  };

  const dismiss = (toastId: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  return { toasts, toast, dismiss };
}
