const { spawn } = require('child_process');
const net = require('net');

/**
 * Test server manager for E2E tests (CommonJS version)
 */
class TestServer {
  constructor() {
    this.serverProcess = null;
    this.port = 0;
    this.baseUrl = '';
    this.isRunning = false;
    this.startupTimeout = 30000;
    this.shutdownTimeout = 10000;
  }

  /**
   * Get an available port dynamically
   */
  async getAvailablePort() {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.listen(0, () => {
        const port = server.address().port;
        server.close(() => resolve(port));
      });
      server.on('error', reject);
    });
  }

  /**
   * Wait for server to be ready by checking health endpoint
   */
  async waitForServerReady() {
    const maxAttempts = 60; // 30 seconds with 500ms intervals
    const interval = 500;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/health`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'healthy') {
            return;
          }
        }
      } catch (error) {
        // Server not ready yet, continue waiting
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error('Server failed to start within timeout period');
  }

  /**
   * Start the test server in a separate process
   */
  async start() {
    if (this.isRunning) {
      console.log('Test server is already running');
      return;
    }

    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Starting test server (attempt ${attempt}/${maxRetries})...`);
        
        // Get available port with retry logic
        let portAttempts = 0;
        while (portAttempts < 5) {
          try {
            this.port = await this.getAvailablePort();
            break;
          } catch (portError) {
            portAttempts++;
            if (portAttempts >= 5) throw portError;
            console.log(`Port allocation failed, retrying... (${portAttempts}/5)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        this.baseUrl = `http://localhost:${this.port}`;
        
        // Prepare environment variables
        const env = {
          ...process.env,
          PORT: String(this.port),
          NODE_ENV: 'test',
          JWT_SECRET: 'test-secret-key',
          LOG_LEVEL: 'error',
          START_SERVER: 'true',
        };

        // Ensure test database URL
        env.DATABASE_URL = process.env.DATABASE_URL || 'file:./test-e2e.db';

        console.log(`Starting test server process on port ${this.port}...`);

        // Spawn server process using tsx
        this.serverProcess = spawn('pnpm', ['--filter', 'server', 'start'], {
          env,
          stdio: ['ignore', 'pipe', 'pipe'],
          detached: false,
        });

        // Handle process errors
        this.serverProcess.on('error', (error) => {
          console.error('Failed to spawn server process:', error);
          throw error;
        });

        // Handle process output
        let serverOutput = '';
        this.serverProcess.stdout?.on('data', (data) => {
          serverOutput += data.toString();
          if (process.env.DEBUG_TEST_SERVER || attempt > 1) {
            console.log(`[Test Server]: ${data.toString()}`);
          }
        });

        this.serverProcess.stderr?.on('data', (data) => {
          const errorMsg = data.toString();
          serverOutput += errorMsg;
          console.error(`[Test Server Error]: ${errorMsg}`);
        });

        // Handle early process exit
        const exitPromise = new Promise((_, reject) => {
          this.serverProcess.on('exit', (code, signal) => {
            if (!this.isRunning) {
              reject(new Error(`Server process exited early with code ${code} and signal ${signal}. Output: ${serverOutput}`));
            }
          });
        });

        // Wait for server to be ready or process to exit
        await Promise.race([
          this.waitForServerReady(),
          exitPromise
        ]);
        
        this.isRunning = true;
        console.log(`✅ Test server process started successfully on ${this.baseUrl}`);
        return; // Success, exit the retry loop
      } catch (error) {
        console.error(`Failed to start test server on attempt ${attempt}:`, error);
        lastError = error;
        
        // Clean up before retry
        await this.stop();
        
        if (attempt < maxRetries) {
          console.log(`Waiting before retry...`);
          await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
        }
      }
    }
    
    // All retries failed
    throw new Error(`Failed to start test server after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Stop the test server gracefully
   */
  async stop() {
    if (!this.isRunning && !this.serverProcess) {
      return;
    }

    console.log('Stopping test server...');

    try {
      // Stop subprocess
      if (this.serverProcess) {
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn('Force killing server process');
            this.serverProcess.kill('SIGKILL');
            resolve();
          }, this.shutdownTimeout);

          this.serverProcess.on('exit', () => {
            clearTimeout(timeout);
            resolve();
          });

          // Try graceful shutdown first
          this.serverProcess.kill('SIGTERM');
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
  getBaseUrl() {
    if (!this.isRunning) {
      throw new Error('Test server is not running');
    }
    return this.baseUrl;
  }

  /**
   * Get the port number of the running server
   */
  getPort() {
    if (!this.isRunning) {
      throw new Error('Test server is not running');
    }
    return this.port;
  }

  /**
   * Check if server is running
   */
  isServerRunning() {
    return this.isRunning;
  }
}

module.exports = { TestServer };