/**
 * Real Test Providers for Backend Integration Testing
 * Replaces mock-based test providers with real backend integration
 */

import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { createAuthenticatedTestUser, clearAuthState, type TestUser, type AuthTestContext } from './auth-test-utils';
import { createRealTestQueryClient, setupRealBackendTest } from './real-backend-setup';

// Real test providers wrapper
interface RealTestProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  initialRoute?: string;
  authenticated?: boolean;
  authContext?: AuthTestContext;
}

export function RealTestProviders({
  children,
  queryClient,
  initialRoute = '/',
  authenticated = false,
  authContext,
}: RealTestProvidersProps) {
  const [testQueryClient] = React.useState(() => queryClient || createRealTestQueryClient());

  React.useEffect(() => {
    if (initialRoute !== '/') {
      window.history.pushState({}, '', initialRoute);
    }
  }, [initialRoute]);

  // Set up authentication context if provided
  React.useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (authContext) {
        authContext.cleanup();
      }
    };
  }, [authContext]);

  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// Custom render function with real backend providers
interface RealRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  authenticated?: boolean;
  initialRoute?: string;
  authContext?: AuthTestContext;
  withBackendSetup?: boolean;
}

export async function renderWithRealBackend(
  ui: React.ReactElement,
  {
    queryClient,
    authenticated = false,
    initialRoute = '/',
    authContext,
    withBackendSetup = true,
    ...renderOptions
  }: RealRenderOptions = {}
) {
  // Setup backend if requested
  let backendCleanup: (() => Promise<void>) | undefined;
  let testQueryClient = queryClient;

  if (withBackendSetup) {
    const setup = await setupRealBackendTest();
    testQueryClient = setup.queryClient;
    backendCleanup = setup.cleanup;
  }

  // Setup authentication if needed
  let testAuthContext = authContext;
  if (authenticated && !authContext) {
    testAuthContext = await createAuthenticatedTestUser();
  }

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <RealTestProviders
        queryClient={testQueryClient}
        initialRoute={initialRoute}
        authenticated={authenticated}
        authContext={testAuthContext}
      >
        {children}
      </RealTestProviders>
    );
  };

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...result,
    queryClient: testQueryClient,
    authContext: testAuthContext,
    cleanup: async () => {
      if (testAuthContext) {
        await testAuthContext.cleanup();
      }
      if (backendCleanup) {
        await backendCleanup();
      }
    },
  };
}

// Helper to render authenticated components with real backend
export async function renderAuthenticatedWithRealBackend(
  ui: React.ReactElement,
  options: Omit<RealRenderOptions, 'authenticated'> & {
    createUser?: boolean;
    testUser?: TestUser;
  } = {}
) {
  const { createUser = true, testUser, ...renderOptions } = options;
  let authContext: AuthTestContext | undefined;

  if (createUser && !testUser) {
    authContext = await createAuthenticatedTestUser();
  } else if (testUser) {
    const { createAuthenticatedTestUser: createAuthContext } = await import('./auth-test-utils');
    authContext = await createAuthContext({ email: testUser.email });
  }

  const result = await renderWithRealBackend(ui, {
    ...renderOptions,
    authenticated: true,
    authContext,
  });

  return {
    ...result,
    authContext,
  };
}

// Test utilities for different scenarios
export const realTestUtils = {
  // Render with real backend and authentication
  renderAuthenticated: async (ui: React.ReactElement, options?: RealRenderOptions) =>
    await renderAuthenticatedWithRealBackend(ui, options),

  // Render with specific route and real backend
  renderWithRoute: async (ui: React.ReactElement, route: string, options?: RealRenderOptions) =>
    await renderWithRealBackend(ui, { ...options, initialRoute: route }),

  // Render with real backend only (no auth)
  renderWithBackend: async (ui: React.ReactElement, options?: RealRenderOptions) =>
    await renderWithRealBackend(ui, options),

  // Create query client for real backend testing
  createQueryClient: createRealTestQueryClient,

  // Clear all auth state for clean tests
  clearAuth: clearAuthState,

  // Setup backend for test
  setupBackend: setupRealBackendTest,
};

// Hooks for real backend testing
export function useRealTestSetup() {
  const [setup, setSetup] = React.useState<{
    queryClient: QueryClient;
    cleanup: () => Promise<void>;
  } | null>(null);

  React.useEffect(() => {
    setupRealBackendTest().then(setSetup);
    
    return () => {
      if (setup) {
        setup.cleanup();
      }
    };
  }, []);

  return setup;
}

// Hook for authenticated test setup
export function useAuthenticatedTestSetup() {
  const [authSetup, setAuthSetup] = React.useState<{
    authContext: AuthTestContext;
    queryClient: QueryClient;
    cleanup: () => Promise<void>;
  } | null>(null);

  React.useEffect(() => {
    async function setup() {
      const backendSetup = await setupRealBackendTest();
      const authContext = await createAuthenticatedTestUser();
      
      setAuthSetup({
        authContext,
        queryClient: backendSetup.queryClient,
        cleanup: async () => {
          await authContext.cleanup();
          await backendSetup.cleanup();
        },
      });
    }

    setup();

    return () => {
      if (authSetup) {
        authSetup.cleanup();
      }
    };
  }, []);

  return authSetup;
}

// Test component wrapper for easy backend testing
interface TestWrapperProps {
  children: ReactNode;
  authenticated?: boolean;
  route?: string;
}

export function TestWrapper({ children, authenticated = false, route = '/' }: TestWrapperProps) {
  const setup = useRealTestSetup();
  const authSetup = useAuthenticatedTestSetup();

  if (authenticated && !authSetup) {
    return <div data-testid="loading">Setting up authenticated test...</div>;
  }

  if (!setup) {
    return <div data-testid="loading">Setting up test backend...</div>;
  }

  const queryClient = authenticated ? authSetup!.queryClient : setup.queryClient;
  const authContext = authenticated ? authSetup!.authContext : undefined;

  return (
    <RealTestProviders
      queryClient={queryClient}
      initialRoute={route}
      authenticated={authenticated}
      authContext={authContext}
    >
      {children}
    </RealTestProviders>
  );
}

// Helper for waiting for real API calls to complete
export async function waitForRealApiCall(
  queryClient: QueryClient,
  queryKey: string[],
  timeout: number = 5000
) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const query = queryClient.getQueryCache().find({ queryKey });
    
    if (query && query.state.status === 'success') {
      return query.state.data;
    }

    if (query && query.state.status === 'error') {
      throw query.state.error;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  throw new Error(`API call for ${queryKey.join('.')} did not complete within ${timeout}ms`);
}

// Helper for testing form submissions with real backend
export async function submitFormWithRealBackend(
  form: HTMLFormElement,
  queryClient: QueryClient,
  expectedMutationKey?: string[]
) {
  const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
  form.dispatchEvent(submitEvent);

  if (expectedMutationKey) {
    // Wait for mutation to complete
    const startTime = Date.now();
    const timeout = 5000;

    while (Date.now() - startTime < timeout) {
      const mutations = queryClient.getMutationCache().getAll();
      const targetMutation = mutations.find(m => 
        JSON.stringify(m.options.mutationKey) === JSON.stringify(expectedMutationKey)
      );

      if (targetMutation) {
        if (targetMutation.state.status === 'success') {
          return targetMutation.state.data;
        }
        if (targetMutation.state.status === 'error') {
          throw targetMutation.state.error;
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Form submission did not complete within ${timeout}ms`);
  }
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { renderWithRealBackend as render };