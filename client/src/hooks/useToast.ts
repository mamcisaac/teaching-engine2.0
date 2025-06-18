import { toast as sonnerToast } from 'sonner';

export interface ToastOptions {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  description?: string;
  duration?: number;
}

export function useToast() {
  const toast = ({ type, message, description, duration = 4000 }: ToastOptions) => {
    const options = {
      description,
      duration,
    };

    switch (type) {
      case 'success':
        sonnerToast.success(message, options);
        break;
      case 'error':
        sonnerToast.error(message, options);
        break;
      case 'info':
        sonnerToast.info(message, options);
        break;
      case 'warning':
        sonnerToast.warning(message, options);
        break;
      default:
        sonnerToast(message, options);
    }
  };

  return { toast };
}