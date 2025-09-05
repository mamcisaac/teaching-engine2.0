import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'

import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AppRouter } from './routing/AppRouter'
import { errorReportingService } from './services/errorReportingService'
import { logger } from './utils/logger';
import './index.css'

logger.info('Teaching Engine 2.0 - Direct Restoration')

logger.info('Starting Teaching Engine 2.0...')

// Initialize error reporting
errorReportingService.init()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'online',
      retry: (failureCount, error: unknown): boolean => {
        if (!navigator.onLine) return false
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 401) return false
        return failureCount < 3
      },
    },
    mutations: {
      networkMode: 'online',
      retry: (failureCount, error: unknown): boolean => {
        const err = error as { response?: { status?: number } }
        if (err.response?.status === 401) return false
        return failureCount < 3
      },
    },
  },
})

const rootElement = document.getElementById('root')
logger.info('Root element found', { hasRootElement: !!rootElement })

if (rootElement) {
  logger.info('Creating React root and rendering Teaching Engine app...')
  try {
    const root = createRoot(rootElement)
    root.render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <LanguageProvider>
                <AppRouter />
              </LanguageProvider>
            </AuthProvider>
            <Toaster closeButton richColors position="top-right" />
          </BrowserRouter>
        </QueryClientProvider>
      </StrictMode>
    )
    logger.info('Teaching Engine 2.0 rendered successfully!')
  } catch (error) {
    logger.error('Failed to render Teaching Engine', error)
    rootElement.innerHTML = `<div style="color: red; padding: 20px;">Render Error: ${error}</div>`
  }
} else {
  logger.error('Root element not found!')
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
