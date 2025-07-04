import path from 'path';

// Pact configuration for V3
export const pactConfig = {
  consumer: 'TeachingEngineClient',
  provider: 'TeachingEngineServer',
  port: 9393,
  log: path.resolve(process.cwd(), 'pact-logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  logLevel: 'warn' as const,
  spec: 3, // Using Pact Specification V3
  cors: true,
  host: '127.0.0.1',
};

// Helper function to create interaction URL
export function createInteractionUrl(path: string): string {
  return `http://${pactConfig.host}:${pactConfig.port}${path}`;
}