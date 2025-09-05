// Fixed main.tsx using dynamic imports
import { logger } from './utils/logger';

logger.info('Starting Teaching Engine 2.0...');

// Dynamic imports to avoid static import issues
async function initializeApp() {
  try {
    logger.info('Loading React modules...');
    
    // Load React modules dynamically
    const [
      { QueryClient, QueryClientProvider },
      { StrictMode, createElement },
      { createRoot },
      { BrowserRouter },
      { Toaster },
      { App },
      { errorReportingService },
      { logger }
    ] = await Promise.all([
      import('@tanstack/react-query'),
      import('react'),
      import('react-dom/client'),
      import('react-router-dom'),
      import('sonner'),
      import('./App'),
      import('./services/errorReportingService'),
      import('./utils/logger')
    ]);

    logger.info('All modules loaded successfully');

    // Import CSS
    await import('./index.css');

    // Initialize error reporting service
    errorReportingService.init();
    
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          networkMode: 'offlineFirst',
          retry: (failureCount, error: unknown): boolean => {
            if (!navigator.onLine) return false;
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 401) return false;
            return failureCount < 3;
          },
        },
        mutations: {
          networkMode: 'offlineFirst',
          retry: (failureCount, error: unknown): boolean => {
            const err = error as { response?: { status?: number } };
            if (err.response?.status === 401) return false;
            return failureCount < 3;
          },
        },
      },
    });

    const rootElement = document.getElementById('root');
    logger.info('Root element found', { hasRootElement: !!rootElement });

    if (rootElement) {
      logger.info('Creating React root and rendering app...');
      const root = createRoot(rootElement);
      
      root.render(
        createElement(StrictMode, null,
          createElement(QueryClientProvider, { client: queryClient },
            createElement(BrowserRouter, null,
              createElement(App),
              createElement(Toaster, { closeButton: true, richColors: true, position: 'top-right' })
            )
          )
        )
      );
      
      logger.info('App rendered successfully');
    } else {
      logger.error('Root element not found!');
    }

  } catch (error) {
    logger.error('Failed to initialize app', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `<div style="color: red; padding: 20px;">Error initializing app: ${error}</div>`;
    }
  }
}

// Start the app
void initializeApp();

export {};