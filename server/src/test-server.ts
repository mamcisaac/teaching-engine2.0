/**
 * Test server entry point for E2E tests
 *
 * This bypasses the import.meta.url check entirely for E2E tests
 */

console.log('Starting E2E test server...');

// Set up environment
process.env.NODE_ENV = 'test';
process.env.E2E_TEST = 'true';

// Ensure we have required environment variables
if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'test-api-key';
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./test-assessment-e2e.db';
}

console.log('Environment configured:', {
  NODE_ENV: process.env.NODE_ENV,
  E2E_TEST: process.env.E2E_TEST,
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'set' : 'not set',
});

// Import the app and services
import { app } from './index.js';
import { initializeServices, shutdownServices } from './services/initializeServices.js';
import logger from './logger.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Start the server
async function startServer() {
  try {
    console.log('Initializing services...');
    await initializeServices();

    console.log(`Starting server on port ${PORT}...`);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      logger.info('E2E test server started successfully');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    logger.error('Failed to start E2E test server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await shutdownServices();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await shutdownServices();
  process.exit(0);
});

// Start immediately
startServer();
