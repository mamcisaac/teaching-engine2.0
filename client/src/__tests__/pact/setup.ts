import path from 'path';
import { afterAll } from 'vitest';

// Pact configuration
export const pactConfig = {
  consumer: 'TeachingEngineClient',
  provider: 'TeachingEngineServer',
  port: 9393,
  log: path.resolve(process.cwd(), 'pact-logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn' as const,
  spec: 2,
  cors: true,
  host: '127.0.0.1',
};

// Clean up any hanging Pact mock servers after all tests
afterAll(() => {
  // This ensures all Pact mock servers are shut down
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
});

// Helper function to create interaction URL
export function createInteractionUrl(path: string): string {
  return `http://${pactConfig.host}:${pactConfig.port}${path}`;
}