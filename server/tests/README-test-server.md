# Test Server Management

This directory contains the test infrastructure for running integration tests with a dynamically managed test server.

## Overview

The test server management system provides:
- Dynamic port allocation to avoid conflicts
- Graceful server startup and shutdown
- Test database isolation
- Health check endpoints
- Authentication helpers

## Key Components

### 1. Test Server Manager (`test-server.ts`)
- Manages server lifecycle
- Finds available ports dynamically
- Provides health check monitoring
- Handles graceful shutdown

### 2. Test Helpers (`test-helpers.ts`)
- Authentication utilities
- Request helper functions
- Mock object creators

### 3. Server Setup
- Modified `src/index.ts` to support test mode
- Health check endpoint at `/health`
- Conditional server startup based on `NODE_ENV`
- Graceful shutdown handling

## Usage

### Basic Integration Test

```typescript
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Server } from 'http';

describe('API Integration Tests', () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    process.env.START_SERVER = 'true';
    process.env.PORT = '0'; // Dynamic port

    // Import and start server
    const { server: serverInstance } = await import('../src/index');
    server = serverInstance;
    
    // Get actual port
    const address = server.address();
    const port = typeof address === 'object' ? address.port : 3000;
    baseUrl = `http://localhost:${port}`;
  });

  afterAll(async () => {
    // Graceful shutdown
    await new Promise((resolve) => server.close(resolve));
  });

  it('should respond to health check', async () => {
    const response = await fetch(`${baseUrl}/health`);
    expect(response.status).toBe(200);
  });
});
```

### Using Test Helpers

```typescript
import { getAuthHeaders, authenticatedGet } from '../test-helpers';

it('should accept authenticated requests', async () => {
  const headers = getAuthHeaders(userId);
  const response = await fetch(`${baseUrl}/api/endpoint`, { headers });
  expect(response.status).toBe(200);
});
```

## Environment Variables

- `NODE_ENV=test` - Enables test mode
- `JWT_SECRET` - Secret for JWT tokens
- `PORT=0` - Use 0 for dynamic port allocation
- `START_SERVER=true` - Force server to start in test mode
- `LOG_LEVEL=error` - Reduce logging noise

## Features

### Dynamic Port Allocation
The test server automatically finds an available port, preventing conflicts when running tests in parallel or on CI/CD systems.

### Health Check Endpoint
The `/health` endpoint provides server status information:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "environment": "test",
  "port": 3001
}
```

### Graceful Shutdown
The server handles SIGTERM and SIGINT signals for graceful shutdown, ensuring all connections are properly closed.

### Test Database Isolation
Each test worker gets its own database instance, preventing test interference.

## Best Practices

1. **Always clean up**: Use `afterAll` to ensure server shutdown
2. **Wait for server ready**: Check health endpoint before running tests
3. **Use dynamic ports**: Set `PORT=0` to avoid conflicts
4. **Handle timeouts**: Increase Jest timeout for server startup if needed
5. **Isolate tests**: Each test suite should manage its own server instance

## Troubleshooting

### Server fails to start
- Check if port is already in use
- Verify database connection
- Check for missing environment variables

### Tests timeout
- Increase Jest timeout: `jest.setTimeout(60000)`
- Check server startup logs
- Verify health check endpoint

### Authentication failures
- Ensure JWT_SECRET is set
- Check token expiration
- Verify auth middleware setup