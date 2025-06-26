import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import App from './App';
import './index.css';
import * as serviceWorkerRegistration from './utils/serviceWorkerRegistration';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Enable offline caching
      networkMode: 'offlineFirst',
      retry: (failureCount, _error: unknown) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
    },
    mutations: {
      // Enable offline persistence for mutations
      networkMode: 'offlineFirst',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  </React.StrictMode>,
);

// Register service worker - TEMPORARILY DISABLED FOR DEBUGGING
// serviceWorkerRegistration.register({
//   onSuccess: (registration) => {
//     console.log('Service Worker registered successfully:', registration);
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
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
    }
  });
}
