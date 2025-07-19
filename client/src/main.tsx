import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';

import { App } from './App';
import './index.css';
// import logger from './utils/logger';
import { errorReportingService } from './services/errorReportingService';

// Initialize error reporting service
errorReportingService.init();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enable offline caching
      networkMode: 'offlineFirst',
      retry: (failureCount, error: unknown): boolean => {
        // Don't retry if offline
        if (navigator.onLine === false) {
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  </StrictMode>,
);

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
  void navigator.serviceWorker.getRegistrations().then((registrations): void => {
    for(const registration of registrations) {
      void registration.unregister();
    }
  });
}
