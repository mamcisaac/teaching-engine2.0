import { Server } from 'http';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';

const __dirname_testServer = path.dirname(fileURLToPath(import.meta.url));

/**
 * Test server manager for integration tests
 * Handles dynamic port allocation, server lifecycle, and graceful shutdown
 */
export class TestServer {
  private server: Server | null = null;
  private serverProcess: ChildProcess | null = null;
  private port: number = 0;
  private baseUrl: string = '';
  private isRunning: boolean = false;
  private startupTimeout: number = 30000; // 30 seconds
  private shutdownTimeout: number = 10000; // 10 seconds

  /**
   * Get an available port dynamically
   */
  private async getAvailablePort(): Promise<number> {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.listen(0, () => {
        const port = (server.address() as net.AddressInfo).port;
        server.close(() => resolve(port));
      });
      server.on('error', reject);
    });
  }

  /**
   * Wait for server to be ready by checking health endpoint
   */
  private async waitForServerReady(): Promise<void> {
    const maxAttempts = 60; // 30 seconds with 500ms intervals
    const interval = 500;

    // Dynamic import of node-fetch for ESM compatibility
    const fetch = (await import('node-fetch')).default;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/health`);
        if (response.ok) {
          const data = (await response.json()) as unknown;
          if (data.status === 'healthy') {
            return;
          }
        }
      } catch (error) {
        // Server not ready yet, continue waiting
      }

      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error('Server failed to start within timeout period');
  }

  /**
   * Start the test server
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Test server is already running');
      return;
    }

    try {
      // Get available port
      this.port = await this.getAvailablePort();
      this.baseUrl = `http://localhost:${this.port}`;

      // Set test environment variables
      process.env.PORT = String(this.port);
      process.env.NODE_ENV = 'test';
      process.env.JWT_SECRET = 'test-secret-key';
      process.env.LOG_LEVEL = 'error'; // Reduce noise during tests

      // Ensure test database URL is set
      if (!process.env.DATABASE_URL?.includes('test')) {
        const workerId = process.env.JEST_WORKER_ID || 'default';
        process.env.DATABASE_URL = `file:./test-${workerId}.db`;
      }

      console.log(`Starting test server on port ${this.port}...`);

      // Set START_SERVER flag to force server to start in test mode
      process.env.START_SERVER = 'true';

      // Import and start the server
      const serverModule = await import('../src/index.js');

      // The server should be available as a named export
      if (serverModule.server) {
        this.server = serverModule.server;
      } else {
        throw new Error('Server not exported from index.js');
      }

      // Wait for server to be ready
      await this.waitForServerReady();

      this.isRunning = true;
      console.log(`Test server started successfully on ${this.baseUrl}`);
    } catch (error) {
      console.error('Failed to start test server:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Start server in a separate process (alternative approach)
   */
  async startInProcess(): Promise<void> {
    if (this.isRunning) {
      console.log('Test server is already running');
      return;
    }

    try {
      // Get available port
      this.port = await this.getAvailablePort();
      this.baseUrl = `http://localhost:${this.port}`;

      // Prepare environment variables
      const env = {
        ...process.env,
        PORT: String(this.port),
        NODE_ENV: 'test',
        JWT_SECRET: 'test-secret-key',
        LOG_LEVEL: 'error',
      };

      // Ensure test database URL
      if (!env.DATABASE_URL?.includes('test')) {
        const workerId = process.env.JEST_WORKER_ID || 'default';
        env.DATABASE_URL = `file:./test-${workerId}.db`;
      }

      console.log(`Starting test server process on port ${this.port}...`);

      // Spawn server process
      this.serverProcess = spawn('tsx', ['src/index.ts'], {
        cwd: path.join(__dirname_testServer, '..'),
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      // Handle process output
      this.serverProcess.stdout?.on('data', (data) => {
        if (process.env.DEBUG_TEST_SERVER) {
          console.log(`[Test Server]: ${data.toString()}`);
        }
      });

      this.serverProcess.stderr?.on('data', (data) => {
        console.error(`[Test Server Error]: ${data.toString()}`);
      });

      // Wait for server to be ready
      await this.waitForServerReady();

      this.isRunning = true;
      console.log(`Test server process started successfully on ${this.baseUrl}`);
    } catch (error) {
      console.error('Failed to start test server process:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Stop the test server gracefully
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping test server...');

    try {
      // Stop in-process server
      if (this.server) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Server shutdown timeout'));
          }, this.shutdownTimeout);

          this.server!.close((err) => {
            clearTimeout(timeout);
            if (err) reject(err);
            else resolve();
          });
        });
        this.server = null;
      }

      // Stop subprocess
      if (this.serverProcess) {
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Force killing server process');
            this.serverProcess!.kill('SIGKILL');
            resolve();
          }, this.shutdownTimeout);

          this.serverProcess!.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });

          // Try graceful shutdown first
          this.serverProcess!.kill('SIGTERM');
        });
        this.serverProcess = null;
      }

      this.isRunning = false;
      console.log('Test server stopped successfully');
    } catch (error) {
      console.error('Error stopping test server:', error);
      // Force cleanup
      if (this.serverProcess) {
        this.serverProcess.kill('SIGKILL');
        this.serverProcess = null;
      }
      this.isRunning = false;
      throw error;
    }
  }

  /**
   * Get the base URL of the running server
   */
  getBaseUrl(): string {
    if (!this.isRunning) {
      throw new Error('Test server is not running');
    }
    return this.baseUrl;
  }

  /**
   * Get the port number of the running server
   */
  getPort(): number {
    if (!this.isRunning) {
      throw new Error('Test server is not running');
    }
    return this.port;
  }

  /**
   * Check if server is running
   */
  isServerRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Create authenticated request headers
   */
  getAuthHeaders(userId: number = 1): Record<string, string> {
    const jwt = this.createTestJWT(userId);
    return {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Create a test JWT token
   */
  private createTestJWT(userId: number): string {
    // Simple JWT for testing - in real tests, use jsonwebtoken
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ userId: String(userId) })).toString('base64url');
    const signature = 'test-signature'; // In real implementation, sign properly
    return `${header}.${payload}.${signature}`;
  }
}

// Singleton instance for global setup/teardown
let testServerInstance: TestServer | null = null;

export function getTestServer(): TestServer {
  if (!testServerInstance) {
    testServerInstance = new TestServer();
  }
  return testServerInstance;
}

// Helper function for tests to get server URL
export async function getTestServerUrl(): Promise<string> {
  const server = getTestServer();
  if (!server.isServerRunning()) {
    await server.start();
  }
  return server.getBaseUrl();
}
