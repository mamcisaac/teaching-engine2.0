#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

console.log('E2E server starting - this should appear in logs');
console.error('E2E server stderr test');

// Simple server without any imports
const http = require('http');
const PORT = 3000;

// First, try to kill any existing process on the port
const { exec } = require('child_process');
exec(`lsof -ti:${PORT} | xargs kill -9 2>/dev/null || true`, (err) => {
  if (err) {
    console.log('No existing process to kill on port', PORT);
  } else {
    console.log('Killed existing process on port', PORT);
  }

  // Wait a moment for port to be released
  setTimeout(() => {
    const server = http.createServer((req, res) => {
      console.log(`Request received: ${req.method} ${req.url}`);

      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Simple E2E server listening on port ${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. This might be because:`);
        console.error('1. Another server instance is running');
        console.error('2. Playwright started multiple webServer processes');
        console.error('3. A previous test run did not clean up properly');
      }
      process.exit(1);
    });
  }, 1000);
});
