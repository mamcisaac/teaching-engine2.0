import { getTestServer } from './test-server';
import type { AuthRequest } from '../src/middleware/auth';
import type { Response } from 'express';
import jwt from 'jsonwebtoken';

/**
 * Helper functions for integration tests
 */

/**
 * Get the base URL of the test server
 */
export function getServerUrl(): string {
  return process.env.TEST_SERVER_URL || getTestServer().getBaseUrl();
}

/**
 * Create authenticated headers for test requests
 */
export function getAuthHeaders(userId: number = 1): Record<string, string> {
  const token = createTestJWT(userId);
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Create a test JWT token
 */
export function createTestJWT(userId: number): string {
  const secret = process.env.JWT_SECRET || 'test-secret-key';
  return jwt.sign({ userId: String(userId) }, secret, { expiresIn: '1h' });
}

/**
 * Make an authenticated GET request
 */
export async function authenticatedGet(path: string, userId: number = 1): Promise<Response> {
  const response = await fetch(`${getServerUrl()}${path}`, {
    method: 'GET',
    headers: getAuthHeaders(userId),
  });
  return response;
}

/**
 * Make an authenticated POST request
 */
export async function authenticatedPost(
  path: string,
  body: any,
  userId: number = 1
): Promise<Response> {
  const response = await fetch(`${getServerUrl()}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(body),
  });
  return response;
}

/**
 * Make an authenticated PUT request
 */
export async function authenticatedPut(
  path: string,
  body: any,
  userId: number = 1
): Promise<Response> {
  const response = await fetch(`${getServerUrl()}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(userId),
    body: JSON.stringify(body),
  });
  return response;
}

/**
 * Make an authenticated DELETE request
 */
export async function authenticatedDelete(path: string, userId: number = 1): Promise<Response> {
  const response = await fetch(`${getServerUrl()}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(userId),
  });
  return response;
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options: { timeout?: number; interval?: number } = {}
): Promise<void> {
  const { timeout = 5000, interval = 100 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
}

/**
 * Create a mock Express request object for unit tests
 */
export function createMockRequest(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    headers: {},
    body: {},
    params: {},
    query: {},
    ...overrides,
  } as AuthRequest;
}

/**
 * Create a mock Express response object for unit tests
 */
export function createMockResponse(): Response {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res;
}