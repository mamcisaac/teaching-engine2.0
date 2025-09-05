// Fixed main.tsx using dynamic imports
console.log('[main-fixed.tsx] Starting Teaching Engine 2.0...');

// Dynamic imports to avoid static import issues
async function initializeApp() {
  try {
    console.log('[main-fixed.tsx] Loading React modules...');
    
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

    console.log('[main-fixed.tsx] All modules loaded successfully');

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
    console.log('[main-fixed.tsx] Root element found:', !!rootElement);

    if (rootElement) {
      console.log('[main-fixed.tsx] Creating React root and rendering app...');
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
      
      console.log('[main-fixed.tsx] App rendered successfully');
    } else {
      console.error('[main-fixed.tsx] Root element not found!');
    }

  } catch (error) {
    console.error('[main-fixed.tsx] Failed to initialize app:', error);
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `<div style="color: red; padding: 20px;">Error initializing app: ${error}</div>`;
    }
  }
}

// Start the app
void initializeApp();

export {};