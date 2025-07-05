/**
 * Real Backend Test Setup
 * Utilities for connecting client tests to the real backend server
 */

import { spawn, ChildProcess } from 'child_process';
import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

// Test server configuration
export const TEST_CONFIG = {
  serverPort: 3001, // Different from dev port to avoid conflicts
  clientPort: 5174, // Different from dev client port
  baseUrl: 'http://localhost:3001',
  apiUrl: 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds for server startup
  maxRetries: 30,
  retryInterval: 1000,
} as const;

let testServer: ChildProcess | null = null;
let serverReady = false;

/**
 * Start the test backend server
 */
export async function startTestServer(): Promise<void> {
  if (serverReady && testServer) {
    return; // Server already running
  }

  console.log('Starting test backend server...');

  return new Promise((resolve, reject) => {
    // Set test environment variables
    const env = {
      ...process.env,
      NODE_ENV: 'test',
      PORT: TEST_CONFIG.serverPort.toString(),
      DATABASE_URL: process.env.TEST_DATABASE_URL || 'file:./test.db',
      JWT_SECRET: 'test-jwt-secret-for-testing-only',
      DISABLE_AUTH_RATE_LIMIT: 'true',
      LOG_LEVEL: 'error', // Reduce log noise in tests
    };

    testServer = spawn('pnpm', ['--filter', 'server', 'dev'], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });

    let serverOutput = '';
    let startupTimeout: NodeJS.Timeout;

    const cleanup = () => {
      if (startupTimeout) clearTimeout(startupTimeout);
    };

    // Set startup timeout
    startupTimeout = setTimeout(() => {
      cleanup();
      reject(new Error(`Test server failed to start within ${TEST_CONFIG.timeout}ms. Output: ${serverOutput}`));
    }, TEST_CONFIG.timeout);

    testServer.stdout?.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      
      // Look for server ready indication
      if (output.includes(`Server running on port ${TEST_CONFIG.serverPort}`) || 
          output.includes('Server started') ||
          output.includes('listening on')) {
        cleanup();
        serverReady = true;
        resolve();
      }
    });

    testServer.stderr?.on('data', (data) => {
      const output = data.toString();
      serverOutput += output;
      console.error('Test server error:', output);
    });

    testServer.on('error', (error) => {
      cleanup();
      reject(new Error(`Failed to start test server: ${error.message}`));
    });

    testServer.on('exit', (code) => {
      serverReady = false;
      if (code !== 0) {
        cleanup();
        reject(new Error(`Test server exited with code ${code}. Output: ${serverOutput}`));
      }
    });
  });
}

/**
 * Stop the test backend server
 */
export async function stopTestServer(): Promise<void> {
  if (!testServer) return;

  console.log('Stopping test backend server...');

  return new Promise((resolve) => {
    if (!testServer) {
      resolve();
      return;
    }

    testServer.on('exit', () => {
      testServer = null;
      serverReady = false;
      resolve();
    });

    // Send SIGTERM to gracefully shutdown
    testServer.kill('SIGTERM');

    // Force kill after 5 seconds if not stopped
    setTimeout(() => {
      if (testServer) {
        testServer.kill('SIGKILL');
        testServer = null;
        serverReady = false;
        resolve();
      }
    }, 5000);
  });
}

/**
 * Wait for the test server to be ready
 */
export async function waitForTestServer(): Promise<void> {
  if (serverReady) return;

  console.log('Waiting for test server to be ready...');
  
  for (let i = 0; i < TEST_CONFIG.maxRetries; i++) {
    try {
      const response = await axios.get(`${TEST_CONFIG.baseUrl}/health`, {
        timeout: 2000,
      });
      
      if (response.status === 200) {
        serverReady = true;
        console.log('Test server is ready!');
        return;
      }
    } catch (error) {
      // Server not ready yet, continue waiting
    }

    await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.retryInterval));
  }

  throw new Error('Test server failed to become ready within timeout period');
}

/**
 * Reset test database to clean state
 */
export async function resetTestDatabase(): Promise<void> {
  try {
    await axios.post(`${TEST_CONFIG.apiUrl}/test/reset-db`, {}, {
      timeout: 10000,
    });
  } catch (error) {
    console.warn('Failed to reset test database:', error);
    // Don't throw - some tests might not need database reset
  }
}

/**
 * Create a test-specific query client
 */
export function createRealTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Don't retry failed requests in tests
        gcTime: 0, // Don't cache data between tests
        staleTime: 0, // Always refetch
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Setup test environment for real backend integration
 */
export async function setupRealBackendTest(): Promise<{
  queryClient: QueryClient;
  cleanup: () => Promise<void>;
}> {
  // Start server if not already running
  if (!serverReady) {
    await startTestServer();
    await waitForTestServer();
  }

  // Reset database to clean state
  await resetTestDatabase();

  const queryClient = createRealTestQueryClient();

  const cleanup = async () => {
    // Clear any cached data
    queryClient.clear();
    
    // Reset database for next test
    await resetTestDatabase();
  };

  return { queryClient, cleanup };
}

/**
 * Check if test server is running
 */
export async function isTestServerRunning(): Promise<boolean> {
  try {
    const response = await axios.get(`${TEST_CONFIG.baseUrl}/health`, {
      timeout: 2000,
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Configure axios for test environment
 */
export function configureTestAxios(): void {
  // Set base URL for all requests
  axios.defaults.baseURL = TEST_CONFIG.baseUrl;
  
  // Set reasonable timeouts for tests
  axios.defaults.timeout = 10000;
  
  // Add request interceptor for authentication if needed
  axios.interceptors.request.use((config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

/**
 * Global test setup for real backend tests
 */
export async function globalRealBackendSetup(): Promise<void> {
  console.log('Setting up real backend test environment...');
  
  configureTestAxios();
  await startTestServer();
  await waitForTestServer();
  
  console.log('Real backend test environment ready!');
}

/**
 * Global test teardown for real backend tests
 */
export async function globalRealBackendTeardown(): Promise<void> {
  console.log('Tearing down real backend test environment...');
  await stopTestServer();
  console.log('Real backend test environment cleaned up!');
}

// Test helper for API calls
export const testAPI = {
  async get(endpoint: string, options?: Record<string, unknown>) {
    const response = await axios.get(`${TEST_CONFIG.apiUrl}${endpoint}`, options);
    return response.data;
  },

  async post(endpoint: string, data?: unknown, options?: Record<string, unknown>) {
    const response = await axios.post(`${TEST_CONFIG.apiUrl}${endpoint}`, data, options);
    return response.data;
  },

  async put(endpoint: string, data?: unknown, options?: Record<string, unknown>) {
    const response = await axios.put(`${TEST_CONFIG.apiUrl}${endpoint}`, data, options);
    return response.data;
  },

  async delete(endpoint: string, options?: Record<string, unknown>) {
    const response = await axios.delete(`${TEST_CONFIG.apiUrl}${endpoint}`, options);
    return response.data;
  },
};

// Export for external test utilities
export { testServer, serverReady };