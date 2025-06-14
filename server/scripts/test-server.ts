import express from 'express';
import { PrismaClient } from '@prisma/client';

// Set up Express app
const app = express();
app.use(express.json());

import path from 'path';

// Set up Prisma client with explicit database URL
const dbPath = path.resolve(__dirname, '../../packages/database/prisma/test-db.sqlite');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: `file:${dbPath}`
    }
  }
});

console.log(`Using database at: ${dbPath}`);
console.log('Current working directory:', process.cwd());

// Test endpoint
app.get('/api/test', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.json({ success: true, subjects });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Server shut down');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
