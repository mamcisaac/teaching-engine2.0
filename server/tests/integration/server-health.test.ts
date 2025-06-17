import { describe, it, expect } from '@jest/globals';
import { getServerUrl } from '../test-helpers';

describe('Server Health Check', () => {
  it('should respond to health check endpoint', async () => {
    const response = await fetch(`${getServerUrl()}/health`);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toMatchObject({
      status: 'healthy',
      environment: 'test',
    });
    expect(data.timestamp).toBeDefined();
    expect(data.port).toBeDefined();
  });

  it('should handle 404 for non-existent endpoints', async () => {
    const response = await fetch(`${getServerUrl()}/api/non-existent-endpoint`);
    
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toEqual({ error: 'Not Found' });
  });

  it('should require authentication for protected endpoints', async () => {
    const response = await fetch(`${getServerUrl()}/api/activities`);
    
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data).toEqual({ error: 'Unauthorized' });
  });

  it('should accept authenticated requests', async () => {
    // Import after server is started
    const { getAuthHeaders } = await import('../test-helpers');
    
    const response = await fetch(`${getServerUrl()}/api/subjects`, {
      headers: getAuthHeaders(1),
    });
    
    // Should either return 200 with data or 200 with empty array
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});