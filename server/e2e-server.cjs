#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

// Write to file to verify script is running
const fs = require('fs');
const path = require('path');
fs.writeFileSync(path.join(__dirname, 'e2e-server.log'), `E2E server started at ${new Date().toISOString()}\n`);

// Flush stdout immediately
process.stdout.write('E2E server starting - this should appear in logs\n');
process.stderr.write('E2E server stderr test\n');

// Simple server without any imports
const http = require('http');
const PORT = 3000;

// Create server immediately
const server = http.createServer((req, res) => {
  process.stdout.write(`Request received: ${req.method} ${req.url}\n`);

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Try to start server with error handling
server.listen(PORT, '0.0.0.0', () => {
  process.stdout.write(`Simple E2E server listening on port ${PORT}\n`);
  // Force flush
  if (process.stdout.isTTY) {
    process.stdout.write('');
  }
});

server.on('error', (err) => {
  process.stderr.write(`Server error: ${err}\n`);
  if (err.code === 'EADDRINUSE') {
    process.stderr.write(`Port ${PORT} is already in use. This might be because:\n`);
    process.stderr.write('1. Another server instance is running\n');
    process.stderr.write('2. Playwright started multiple webServer processes\n');
    process.stderr.write('3. A previous test run did not clean up properly\n');
    
    // Try a different port
    const altPort = PORT + 1;
    process.stderr.write(`Trying alternative port ${altPort}...\n`);
    server.listen(altPort, '0.0.0.0', () => {
      process.stdout.write(`Simple E2E server listening on alternative port ${altPort}\n`);
    });
  } else {
    process.exit(1);
  }
});
