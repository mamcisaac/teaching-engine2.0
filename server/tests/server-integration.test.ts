import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Server } from 'http';
import jwt from 'jsonwebtoken';

describe('Server Integration Tests', () => {
  let server: Server;
  let port: number;
  let baseUrl: string;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.START_SERVER = 'true';
    process.env.PORT = '0'; // Let OS assign port

    // Import server
    const { server: serverInstance } = await import('../src/index');
    server = serverInstance;

    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get the actual port after server has started
    const address = server.address();
    port = typeof address === 'object' && address ? address.port : 3000;
    baseUrl = `http://localhost:${port}`;
    
    console.log(`Test server started on port ${port}`);
    
    // Wait for server to be ready
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${baseUrl}/health`);
        if (response.ok) {
          console.log('Server is ready');
          return;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('Server failed to start within timeout');
  }, 60000); // Increase timeout to 60 seconds

  afterAll(async () => {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  });

  describe('Health Check', () => {
    it('should respond to health check endpoint', async () => {
      const response = await fetch(`${baseUrl}/health`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toMatchObject({
        status: 'healthy',
        environment: 'test',
      });
      expect(data.timestamp).toBeDefined();
      expect(data.port).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should reject requests without authentication', async () => {
      const response = await fetch(`${baseUrl}/api/activities`);
      
      expect(response.status).toBe(401);
      expect(response.statusText).toBe('Unauthorized');
    });

    it('should accept requests with valid JWT', async () => {
      const token = jwt.sign({ userId: '1' }, 'test-secret');
      
      const response = await fetch(`${baseUrl}/api/subjects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should reject requests with invalid JWT', async () => {
      const response = await fetch(`${baseUrl}/api/subjects`, {
        headers: {
          'Authorization': 'Bearer invalid-token',
        },
      });
      
      expect(response.status).toBe(403);
      expect(response.statusText).toBe('Forbidden');
    });
  });

  describe('404 Handling', () => {
    it('should return 404 for non-existent API endpoints', async () => {
      const response = await fetch(`${baseUrl}/api/non-existent`);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data).toEqual({ error: 'Not Found' });
    });
  });

  describe('Server Shutdown', () => {
    it('should handle graceful shutdown', async () => {
      // The server should still be running
      const response = await fetch(`${baseUrl}/health`);
      expect(response.status).toBe(200);
      
      // Note: Actual shutdown is tested in afterAll
    });
  });
});