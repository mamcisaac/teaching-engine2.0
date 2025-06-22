/**
 * Server entry point for E2E tests
 *
 * This file ensures the server starts properly in test environments
 * where import.meta.url might not match process.argv[1]
 */

import { app } from './index.js';
import { initializeServices, shutdownServices } from './services/initializeServices.js';
import logger from './logger.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Always start the server when this file is imported
async function startServer() {
  try {
    logger.info('Initializing services for E2E tests...');
    await initializeServices();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      logger.info('Server started successfully for E2E tests');
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await shutdownServices();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await shutdownServices();
  process.exit(0);
});

// Start the server
startServer();
