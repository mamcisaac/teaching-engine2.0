/**
 * Real backend setup utilities for integration tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

// Base URL for real backend
export const REAL_BACKEND_URL = process.env.VITE_API_URL || 'http://localhost:3000';

// Test database URL for integration tests
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/teaching_engine_test';

/**
 * Configuration for real backend tests
 */
export interface RealBackendConfig {
  baseURL?: string;
  timeout?: number;
  withAuth?: boolean;
  setupDatabase?: boolean;
}

/**
 * Real backend test context
 */
export interface RealBackendTestContext {
  baseURL: string;
  isAvailable: boolean;
  queryClient?: any;
  cleanup?: () => Promise<void>;
}

/**
 * Test server instance
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _testServerInstance: any = null;

/**
 * Check if the real backend is available
 */
export async function isRealBackendAvailable(url = REAL_BACKEND_URL): Promise<boolean> {
  try {
    const response = await axios.get(`${url}/api/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Wait for the backend to be ready
 */
export async function waitForBackend(url = REAL_BACKEND_URL, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    if (await isRealBackendAvailable(url)) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error('Backend did not start within timeout');
}

/**
 * Setup real backend for tests
 */
export async function setupRealBackend(config: RealBackendConfig = {}): Promise<RealBackendTestContext> {
  const {
    baseURL = REAL_BACKEND_URL,
    timeout = 30000,
    setupDatabase = true
  } = config;

  // Set axios defaults
  axios.defaults.baseURL = baseURL;
  axios.defaults.timeout = timeout;

  // Check if backend is available
  const backendAvailable = await isRealBackendAvailable(baseURL);
  
  if (!backendAvailable) {
    throw new Error(`Real backend is not available at ${baseURL}. Please start the backend server.`);
  }

  // Setup test database if requested
  if (setupDatabase) {
    await setupTestDatabase();
  }

  return {
    baseURL,
    isAvailable: true,
    cleanup: async () => {
      await teardownRealBackend();
    }
  };
}

/**
 * Teardown real backend after tests
 */
export async function teardownRealBackend() {
  // Clean up test data
  await cleanupTestDatabase();
  
  // Reset axios defaults
  delete axios.defaults.baseURL;
  delete axios.defaults.timeout;
}

/**
 * Setup test database
 */
export async function setupTestDatabase() {
  try {
    // Run database setup endpoint if available
    await axios.post(`${REAL_BACKEND_URL}/api/test/setup-database`, {
      testRun: true
    });
  } catch (error) {
    console.warn('Could not setup test database:', error);
  }
}

/**
 * Cleanup test database
 */
export async function cleanupTestDatabase() {
  try {
    // Run database cleanup endpoint if available
    await axios.post(`${REAL_BACKEND_URL}/api/test/cleanup-database`, {
      testRun: true
    });
  } catch (error) {
    console.warn('Could not cleanup test database:', error);
  }
}

/**
 * Create a test user in the real backend
 */
export async function createTestUser(userData?: Partial<any>) {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!',
    name: 'Test User',
    role: 'teacher',
    boardId: 'test-board',
    boardName: 'Test Board',
    boardRegion: 'Test Region'
  };

  const user = { ...defaultUser, ...userData };

  try {
    const response = await axios.post('/api/auth/register', user);
    return response.data;
  } catch (error) {
    console.error('Failed to create test user:', error);
    throw error;
  }
}

/**
 * Login with test user
 */
export async function loginTestUser(email: string, password: string) {
  try {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Set auth header for subsequent requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return { token, user };
  } catch (error) {
    console.error('Failed to login test user:', error);
    throw error;
  }
}

/**
 * Logout test user
 */
export function logoutTestUser() {
  delete axios.defaults.headers.common['Authorization'];
}

/**
 * Real backend test suite setup
 */
export function setupRealBackendTestSuite(config?: RealBackendConfig) {
  beforeAll(async () => {
    await setupRealBackend(config);
  });

  afterAll(async () => {
    await teardownRealBackend();
  });

  beforeEach(async () => {
    // Clear any existing auth
    logoutTestUser();
  });

  afterEach(async () => {
    // Cleanup after each test
    logoutTestUser();
  });
}

/**
 * Create a real test query client
 */
export function createRealTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Setup real backend test with query client
 */
export async function setupRealBackendTest(config?: RealBackendConfig): Promise<{
  queryClient: QueryClient;
  cleanup: () => Promise<void>;
}> {
  const context = await setupRealBackend(config);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
  
  return {
    queryClient,
    cleanup: async () => {
      queryClient.clear();
      if (context.cleanup) {
        await context.cleanup();
      }
    }
  };
}

/**
 * Create a real backend client for API calls
 */
export function createRealBackendClient() {
  return axios.create({
    baseURL: REAL_BACKEND_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Skip test if real backend is not available
 */
export function skipIfNoRealBackend(testFn: () => void | Promise<void>) {
  return async () => {
    const isAvailable = await isRealBackendAvailable();
    if (!isAvailable) {
      console.warn('Skipping test - real backend not available');
      return;
    }
    return testFn();
  };
}


/**
 * Aliases for backward compatibility
 */
export const resetTestDatabase = cleanupTestDatabase;