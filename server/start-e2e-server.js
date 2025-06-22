#!/usr/bin/env node
/* eslint-env node */

// Simple E2E server startup script that forces server to start
process.env.NODE_ENV = 'test';
process.env.E2E_TEST = 'true';
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test-assessment-e2e.db';

// Import and start the server
import('./src/index.js');
