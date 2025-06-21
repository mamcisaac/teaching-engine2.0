import express from 'express';
import cors from 'cors';
import { authenticateToken } from '../src/middleware/auth';

// Create a test app instance
export function createTestApp() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Mock login endpoint for tests
  app.post('/api/login', async (req, res) => {
    const { email } = req.body;
    // Return a mock JWT for testing
    res.json({
      token: 'test-jwt-token',
      user: { id: 1, email },
    });
  });

  // Import routes that are being tested
  import('../src/routes/materialList').then((module) => {
    app.use('/api/material-lists', authenticateToken, module.default);
  });

  return app;
}

// Export a singleton instance for tests
export const testApp = createTestApp();
