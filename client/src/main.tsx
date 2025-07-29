import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import { App } from './App';
// import { TestApp as App } from './TestApp';
import './index.css';
import { errorReportingService } from './services/errorReportingService';
import { logger } from './utils/logger';

// Initialize error reporting service
errorReportingService.init();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enable offline caching
      networkMode: 'offlineFirst',
      retry: (failureCount, error: unknown): boolean => {
        // Don't retry if offline
        if (!navigator.onLine) {
return false;
}
        // Don't retry on 401 errors
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 401) {
return false;
}
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
    mutations: {
      // Enable offline persistence for mutations
      networkMode: 'offlineFirst',
      retry: (failureCount, error: unknown): boolean => {
        // Don't retry on 401 errors
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 401) {
return false;
}
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
  },
});

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <Toaster closeButton richColors position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
}

// Register service worker - TEMPORARILY DISABLED FOR DEBUGGING
// serviceWorkerRegistration.register({
//   onSuccess: (registration) => {
//     logger.info('Service Worker registered successfully:', registration);
//   },
//   onUpdate: (registration) => {
//     toast.info('New version available! Refresh to update.', {
//       action: {
//         label: 'Refresh',
//         onClick: () => {
//           if (registration.waiting) {
//             registration.waiting.postMessage({ type: 'SKIP_WAITING' });
//             window.location.reload();
//           }
//         },
//       },
//       duration: Infinity,
//     });
//   },
//   onOffline: () => {
//     toast.warning('You are offline. Changes will sync when you reconnect.');
//   },
//   onOnline: () => {
//     toast.success('Back online! Syncing your changes...');
//   },
// });

// Unregister any existing service workers
if ('serviceWorker' in navigator) {
  void (async (): Promise<void> => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for(const registration of registrations) {
        await registration.unregister();
      }
    } catch (error) {
      logger.warn('Failed to unregister service workers', { error });
    }
  })();
}
