import express from 'express';
import cors from 'cors';
import { auth } from '../src/middleware/auth';

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
  // Route doesn't exist - commenting out
  // import('../src/routes/materialList').then((module) => {
  //   app.use('/api/material-lists', auth, module.default);
  // });

  return app;
}

// Export a singleton instance for tests
export const testApp = createTestApp();
