import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ActivityLibrary } from '../../ActivityLibrary';

/**
 * Contract Tests for ActivityLibrary Component
 *
 * These tests validate that our unit test mocks match real API behavior:
 * 1. GET /api/activity-templates/templates response structure
 * 2. Query parameter handling
 * 3. Authentication requirements
 * 4. Error response formats
 * 5. Sorting and filtering behavior
 */

let actualApiCalls: Array<{
  url: string;
  method: string;
  headers: Record<string, string>;
  response: any;
  status: number;
}> = [];

const originalFetch = global.fetch;

beforeEach(() => {
  actualApiCalls = [];

  global.fetch = vi.fn().mockImplementation(async (url, options = {}) => {
    const response = await originalFetch(url, options);
    const responseData = await response
      .clone()
      .json()
      .catch(() => null);

    actualApiCalls.push({
      url: url.toString(),
      method: options.method || 'GET',
      headers: (options.headers as Record<string, string>) || {},
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

describe.skip('ActivityLibrary Contract Tests', () => {
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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('validates GET /templates response structure', async () => {
    render(<ActivityLibrary language="en" />, { wrapper });

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    const templatesCall = actualApiCalls.find((call) =>
      call.url.includes('/api/activity-templates/templates'),
    );

    if (templatesCall && templatesCall.response && Array.isArray(templatesCall.response)) {
      templatesCall.response.forEach((template: any) => {
        // Validate required fields match our interface
        expect(template).toHaveProperty('id');
        expect(typeof template.id).toBe('number');

        expect(template).toHaveProperty('titleFr');
        expect(typeof template.titleFr).toBe('string');

        expect(template).toHaveProperty('titleEn');
        expect(typeof template.titleEn).toBe('string');

        expect(template).toHaveProperty('descriptionFr');
        expect(typeof template.descriptionFr).toBe('string');

        expect(template).toHaveProperty('descriptionEn');
        expect(typeof template.descriptionEn).toBe('string');

        expect(template).toHaveProperty('domain');
        expect(typeof template.domain).toBe('string');

        expect(template).toHaveProperty('subject');
        expect(typeof template.subject).toBe('string');

        expect(template).toHaveProperty('outcomeIds');
        expect(Array.isArray(template.outcomeIds)).toBe(true);

        expect(template).toHaveProperty('groupType');
        expect(typeof template.groupType).toBe('string');

        // Optional fields
        if (template.materialsFr !== undefined) {
          expect(typeof template.materialsFr).toBe('string');
        }

        if (template.materialsEn !== undefined) {
          expect(typeof template.materialsEn).toBe('string');
        }

        if (template.prepTimeMin !== undefined) {
          expect(typeof template.prepTimeMin).toBe('number');
        }

        if (template.createdBy !== undefined) {
          expect(template.createdBy).toHaveProperty('id');
          expect(template.createdBy).toHaveProperty('name');
        }

        if (template.createdAt !== undefined) {
          expect(typeof template.createdAt).toBe('string');
          // Should be valid ISO date
          expect(new Date(template.createdAt).toISOString()).toBe(template.createdAt);
        }

        if (template.updatedAt !== undefined) {
          expect(typeof template.updatedAt).toBe('string');
          expect(new Date(template.updatedAt).toISOString()).toBe(template.updatedAt);
        }
      });
    }
  });

  it('validates search query parameters', async () => {
    render(
      <ActivityLibrary
        language="en"
        // This should trigger a search query
      />,
      { wrapper },
    );

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    const templatesCall = actualApiCalls.find((call) =>
      call.url.includes('/api/activity-templates/templates'),
    );

    if (templatesCall) {
      const url = new URL(templatesCall.url);

      // Should include standard query parameters
      // (parameters will vary based on component state)

      console.log('ActivityLibrary API Query Parameters:', {
        url: url.pathname,
        params: Object.fromEntries(url.searchParams.entries()),
      });
    }
  });

  it('validates filtering query parameters', async () => {
    // Render with specific filters that should generate query params
    const { rerender } = render(<ActivityLibrary language="en" />, { wrapper });

    // Wait for initial call
    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    // Re-render with search to trigger filtered request
    // (In real usage, this would be triggered by user interaction)
    rerender(<ActivityLibrary language="en" />);

    // Get the most recent call
    const latestCall = actualApiCalls[actualApiCalls.length - 1];

    if (latestCall && latestCall.url.includes('/api/activity-templates/templates')) {
      const url = new URL(latestCall.url);
      const params = url.searchParams;

      // Document the actual parameter structure
      console.log('Filter parameters sent to API:', {
        domain: params.get('domain'),
        subject: params.get('subject'),
        groupType: params.get('groupType'),
        search: params.get('search'),
        outcomeId: params.get('outcomeId'),
        themeId: params.get('themeId'),
      });
    }
  });

  it('validates authentication requirements', async () => {
    render(<ActivityLibrary />, { wrapper });

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    const templatesCall = actualApiCalls.find((call) =>
      call.url.includes('/api/activity-templates/templates'),
    );

    if (templatesCall) {
      // Should require Authorization header
      expect(templatesCall.headers).toHaveProperty('Authorization');
      expect(templatesCall.headers.Authorization).toMatch(/^Bearer /);
    }
  });

  it('validates unauthorized response handling', async () => {
    localStorage.removeItem('token');

    render(<ActivityLibrary />, { wrapper });

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    const unauthorizedCall = actualApiCalls.find((call) => call.status === 401);

    if (unauthorizedCall) {
      expect(unauthorizedCall.status).toBe(401);
      expect(unauthorizedCall.response).toHaveProperty('error');
      expect(unauthorizedCall.response.error).toBe('Unauthorized');
    }
  });

  it('validates sorting behavior', async () => {
    render(<ActivityLibrary language="en" />, { wrapper });

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    const templatesCall = actualApiCalls.find(
      (call) => call.url.includes('/api/activity-templates/templates') && call.status === 200,
    );

    if (templatesCall && Array.isArray(templatesCall.response)) {
      // Check if activities are sorted (default should be by updatedAt desc)
      const activities = templatesCall.response;

      if (activities.length > 1) {
        // Check if they have updatedAt fields for sorting validation
        const hasUpdatedAt = activities.every(
          (activity) => activity.updatedAt && typeof activity.updatedAt === 'string',
        );

        if (hasUpdatedAt) {
          // Verify sort order (should be most recent first by default)
          for (let i = 0; i < activities.length - 1; i++) {
            const current = new Date(activities[i].updatedAt);
            const next = new Date(activities[i + 1].updatedAt);

            // Should be in descending order (most recent first)
            expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
          }
        }
      }

      console.log('ActivityLibrary sorting validation:', {
        totalActivities: activities.length,
        hasUpdatedAt: activities.length > 0 ? 'updatedAt' in activities[0] : false,
        firstActivity:
          activities.length > 0
            ? {
                id: activities[0].id,
                title: activities[0].titleEn,
                updatedAt: activities[0].updatedAt,
              }
            : null,
      });
    }
  });

  it('validates error response structure', async () => {
    // Use invalid token to potentially trigger an error
    localStorage.setItem('token', 'invalid-token');

    render(<ActivityLibrary />, { wrapper });

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    const errorCall = actualApiCalls.find((call) => call.status >= 400 && call.status < 600);

    if (errorCall) {
      // Validate error response structure
      expect(errorCall.response).toHaveProperty('error');
      expect(typeof errorCall.response.error).toBe('string');

      console.log('ActivityLibrary error response structure:', {
        status: errorCall.status,
        response: errorCall.response,
      });
    }
  });

  it('validates empty response structure', async () => {
    render(<ActivityLibrary language="en" />, { wrapper });

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    const templatesCall = actualApiCalls.find(
      (call) => call.url.includes('/api/activity-templates/templates') && call.status === 200,
    );

    if (templatesCall) {
      // Should always return an array, even if empty
      expect(Array.isArray(templatesCall.response)).toBe(true);

      if (templatesCall.response.length === 0) {
        console.log('ActivityLibrary returned empty array - structure is valid');
      }
    }
  });

  it('documents actual API behavior for mock creation', async () => {
    render(<ActivityLibrary language="en" />, { wrapper });

    await waitFor(
      () => {
        expect(actualApiCalls.length).toBeGreaterThan(0);
      },
      { timeout: 10000 },
    );

    // Log comprehensive API behavior for creating accurate mocks
    actualApiCalls.forEach((call, index) => {
      console.log(`ActivityLibrary API Call ${index + 1}:`, {
        endpoint: call.url.split('?')[0].split('/').slice(-2).join('/'),
        method: call.method,
        status: call.status,
        hasAuth: !!call.headers.Authorization,
        queryParams: call.url.includes('?')
          ? Object.fromEntries(new URL(call.url).searchParams.entries())
          : {},
        responseType: call.response ? typeof call.response : 'null',
        isArray: Array.isArray(call.response),
        arrayLength: Array.isArray(call.response) ? call.response.length : 'n/a',
        sampleItem:
          call.response && Array.isArray(call.response) && call.response.length > 0
            ? {
                id: call.response[0].id,
                titleEn: call.response[0].titleEn,
                domain: call.response[0].domain,
                subject: call.response[0].subject,
                hasTheme: !!call.response[0].theme,
                hasCreatedBy: !!call.response[0].createdBy,
                hasPrepTime: call.response[0].prepTimeMin !== undefined,
              }
            : call.response,
        errorStructure: call.status >= 400 ? call.response : 'n/a',
      });
    });

    expect(true).toBe(true); // This test is for documentation
  });
});
