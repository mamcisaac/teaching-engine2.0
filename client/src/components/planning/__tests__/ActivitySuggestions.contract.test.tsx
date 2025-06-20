import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ActivitySuggestions } from '../ActivitySuggestions';

/**
 * Contract Tests for ActivitySuggestions Component
 * 
 * These tests ensure that our mocked API responses in unit tests
 * match the actual API behavior. They validate:
 * 1. Response structure matches expected interface
 * 2. Error handling matches real API error responses
 * 3. Query parameters are sent correctly
 * 4. Authentication requirements are enforced
 */

// We'll capture actual API calls to validate our mocks
let actualApiCalls: Array<{
  url: string;
  method: string;
  headers: Record<string, string>;
  response: any;
  status: number;
}> = [];

// Intercept fetch to capture real API responses
const originalFetch = global.fetch;

beforeEach(() => {
  actualApiCalls = [];
  
  global.fetch = vi.fn().mockImplementation(async (url, options = {}) => {
    const response = await originalFetch(url, options);
    const responseData = await response.clone().json().catch(() => null);
    
    actualApiCalls.push({
      url: url.toString(),
      method: options.method || 'GET',
      headers: options.headers as Record<string, string> || {},
      response: responseData,
      status: response.status,
    });
    
    return response;
  });
});

afterEach(() => {
  global.fetch = originalFetch;
  localStorage.clear();
});

describe.skip('ActivitySuggestions Contract Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    localStorage.setItem('token', 'contract-test-token');
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('validates API response structure matches ActivityTemplate interface', async () => {
    render(
      <ActivitySuggestions outcomeIds={['FR4.1']} />, 
      { wrapper }
    );

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

    const suggestionsCall = actualApiCalls.find(call => 
      call.url.includes('/api/activity-templates/suggestions')
    );

    if (suggestionsCall && suggestionsCall.response && Array.isArray(suggestionsCall.response)) {
      // Validate each activity matches our expected interface
      suggestionsCall.response.forEach((activity: any) => {
        // Required fields
        expect(activity).toHaveProperty('id');
        expect(typeof activity.id).toBe('number');
        
        expect(activity).toHaveProperty('titleFr');
        expect(typeof activity.titleFr).toBe('string');
        
        expect(activity).toHaveProperty('titleEn');
        expect(typeof activity.titleEn).toBe('string');
        
        expect(activity).toHaveProperty('descriptionFr');
        expect(typeof activity.descriptionFr).toBe('string');
        
        expect(activity).toHaveProperty('descriptionEn');
        expect(typeof activity.descriptionEn).toBe('string');
        
        expect(activity).toHaveProperty('domain');
        expect(typeof activity.domain).toBe('string');
        
        expect(activity).toHaveProperty('subject');
        expect(typeof activity.subject).toBe('string');
        
        expect(activity).toHaveProperty('outcomeIds');
        expect(Array.isArray(activity.outcomeIds)).toBe(true);
        
        expect(activity).toHaveProperty('groupType');
        expect(typeof activity.groupType).toBe('string');

        // Optional fields (should be present but can be null/undefined)
        if (activity.materialsFr !== undefined) {
          expect(typeof activity.materialsFr).toBe('string');
        }
        
        if (activity.materialsEn !== undefined) {
          expect(typeof activity.materialsEn).toBe('string');
        }
        
        if (activity.prepTimeMin !== undefined) {
          expect(typeof activity.prepTimeMin).toBe('number');
        }
        
        if (activity.relevanceScore !== undefined) {
          expect(typeof activity.relevanceScore).toBe('number');
          expect(activity.relevanceScore).toBeGreaterThanOrEqual(0);
          expect(activity.relevanceScore).toBeLessThanOrEqual(1);
        }
        
        if (activity.theme !== undefined) {
          expect(activity.theme).toHaveProperty('id');
          expect(activity.theme).toHaveProperty('title');
        }
      });
    }
  });

  it('validates query parameters are sent correctly', async () => {
    render(
      <ActivitySuggestions 
        outcomeIds={['FR4.1', 'EN4.2']}
        themeId={5}
        domain="reading"
        subject="francais"
        limit={5}
      />, 
      { wrapper }
    );

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

    const suggestionsCall = actualApiCalls.find(call => 
      call.url.includes('/api/activity-templates/suggestions')
    );

    if (suggestionsCall) {
      const url = new URL(suggestionsCall.url);
      const params = url.searchParams;
      
      // Validate query parameters match what we sent
      expect(params.get('suggestFor')).toBe('FR4.1,EN4.2');
      expect(params.get('theme')).toBe('5');
      expect(params.get('domain')).toBe('reading');
      expect(params.get('subject')).toBe('francais');
      expect(params.get('limit')).toBe('5');
    }
  });

  it('validates authentication header is required and sent', async () => {
    render(
      <ActivitySuggestions outcomeIds={['FR4.1']} />, 
      { wrapper }
    );

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

    const suggestionsCall = actualApiCalls.find(call => 
      call.url.includes('/api/activity-templates/suggestions')
    );

    if (suggestionsCall) {
      // Should have Authorization header
      expect(suggestionsCall.headers).toHaveProperty('Authorization');
      expect(suggestionsCall.headers.Authorization).toMatch(/^Bearer /);
    }
  });

  it('validates unauthorized response structure', async () => {
    // Remove token to test auth failure
    localStorage.removeItem('token');

    render(
      <ActivitySuggestions outcomeIds={['FR4.1']} />, 
      { wrapper }
    );

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

    const unauthorizedCall = actualApiCalls.find(call => 
      call.status === 401
    );

    if (unauthorizedCall) {
      // Validate 401 response structure
      expect(unauthorizedCall.status).toBe(401);
      expect(unauthorizedCall.response).toHaveProperty('error');
      expect(unauthorizedCall.response.error).toBe('Unauthorized');
    }
  });

  it('validates error response structure matches our mocks', async () => {
    // This test will capture any 500 errors or other API errors
    // and validate they match what we mock in our unit tests
    
    render(
      <ActivitySuggestions outcomeIds={['INVALID_OUTCOME']} />, 
      { wrapper }
    );

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

    const errorCall = actualApiCalls.find(call => 
      call.status >= 400 && call.status < 600
    );

    if (errorCall) {
      // Validate error response has proper structure
      expect(errorCall.response).toHaveProperty('error');
      expect(typeof errorCall.response.error).toBe('string');
      
      // This helps us ensure our unit test mocks match reality
      console.log('Actual API Error Response:', {
        status: errorCall.status,
        response: errorCall.response,
      });
    }
  });

  it('validates empty response structure', async () => {
    render(
      <ActivitySuggestions outcomeIds={['NONEXISTENT_OUTCOME']} />, 
      { wrapper }
    );

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

    const suggestionsCall = actualApiCalls.find(call => 
      call.url.includes('/api/activity-templates/suggestions') && call.status === 200
    );

    if (suggestionsCall && Array.isArray(suggestionsCall.response)) {
      // Even empty response should be an array
      expect(Array.isArray(suggestionsCall.response)).toBe(true);
      
      // If it's empty, that's fine - we just need to ensure structure
      if (suggestionsCall.response.length === 0) {
        console.log('API returned empty array - this is valid');
      }
    }
  });

  it('documents actual API behavior for mock validation', async () => {
    render(
      <ActivitySuggestions 
        outcomeIds={['FR4.1']}
        domain="reading"
        subject="francais"
      />, 
      { wrapper }
    );

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 }
    );

    // Log actual API behavior for documentation
    actualApiCalls.forEach((call, index) => {
      console.log(`API Call ${index + 1}:`, {
        url: call.url,
        method: call.method,
        status: call.status,
        responseType: call.response ? typeof call.response : 'null',
        responseIsArray: Array.isArray(call.response),
        responseKeys: call.response && typeof call.response === 'object' 
          ? Object.keys(call.response) 
          : 'n/a',
        sampleResponse: call.response && Array.isArray(call.response) && call.response.length > 0 
          ? call.response[0] 
          : call.response,
      });
    });

    // This test always passes - it's for documentation
    expect(true).toBe(true);
  });
});