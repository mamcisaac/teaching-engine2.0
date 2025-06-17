import { execSync, spawn, ChildProcess } from 'child_process';
import { createEmailTestProvider } from './helpers/emailTestHelper';

// Global process reference for cleanup
let mailhogProcess: ChildProcess | null = null;

export async function setupEmailTesting(): Promise<void> {
  console.log('Setting up email testing environment...');
  
  // Check if we're in CI environment
  if (process.env.CI) {
    console.log('CI environment detected, using in-memory email provider');
    return;
  }

  // Check if MailHog is already running
  try {
    await fetch('http://localhost:8025/api/v1/messages');
    console.log('MailHog already running on localhost:8025');
    return;
  } catch (error) {
    // MailHog not running, try to start it
  }

  // Try to start MailHog via Docker Compose
  try {
    console.log('Starting MailHog via Docker Compose...');
    execSync('docker-compose -f docker-compose.test.yml up -d mailhog', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    
    // Wait for MailHog to be ready
    await waitForMailHog();
    console.log('MailHog started successfully');
    return;
  } catch (error) {
    console.warn('Failed to start MailHog via Docker Compose:', error);
  }

  // Try to start MailHog directly if Docker isn't available
  try {
    console.log('Attempting to start MailHog directly...');
    mailhogProcess = spawn('mailhog', [], {
      stdio: 'pipe',
      detached: false,
    });

    if (mailhogProcess.pid) {
      console.log(`MailHog process started with PID: ${mailhogProcess.pid}`);
      
      // Wait for MailHog to be ready
      await waitForMailHog();
      console.log('MailHog started successfully');
      return;
    }
  } catch (error) {
    console.warn('Failed to start MailHog directly:', error);
  }

  // If all methods fail, warn but continue with in-memory provider
  console.warn('Could not start MailHog. Email tests will use in-memory provider.');
  console.warn('To use MailHog for testing:');
  console.warn('1. Install Docker and run: docker-compose -f docker-compose.test.yml up -d mailhog');
  console.warn('2. Or install MailHog: go install github.com/mailhog/MailHog@latest');
}

async function waitForMailHog(maxAttempts = 30): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch('http://localhost:8025/api/v1/messages');
      if (response.ok) {
        return;
      }
    } catch (error) {
      // Continue waiting
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error('MailHog failed to start within timeout period');
}

export async function teardownEmailTesting(): Promise<void> {
  console.log('Tearing down email testing environment...');
  
  // Clear any emails from MailHog
  try {
    const provider = createEmailTestProvider();
    await provider.clearEmails();
  } catch (error) {
    console.warn('Failed to clear emails:', error);
  }

  // Stop MailHog process if we started it
  if (mailhogProcess && !mailhogProcess.killed) {
    console.log('Stopping MailHog process...');
    mailhogProcess.kill('SIGTERM');
    mailhogProcess = null;
  }

  // Stop Docker Compose services if they're running
  try {
    execSync('docker-compose -f docker-compose.test.yml down', {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    console.log('Docker Compose services stopped');
  } catch (error) {
    // Ignore errors if Docker Compose isn't running
  }
}

// Setup global test hooks
export function setupGlobalEmailTestHooks(): void {
  // Setup before all tests
  beforeAll(async () => {
    await setupEmailTesting();
  }, 60000); // 60 second timeout for setup

  // Cleanup after all tests
  afterAll(async () => {
    await teardownEmailTesting();
  }, 30000); // 30 second timeout for teardown

  // Handle process exit
  process.on('exit', () => {
    if (mailhogProcess && !mailhogProcess.killed) {
      mailhogProcess.kill('SIGKILL');
    }
  });

  process.on('SIGINT', async () => {
    await teardownEmailTesting();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await teardownEmailTesting();
    process.exit(0);
  });
}

// Utility function to check if MailHog is available
export async function isMailHogAvailable(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:8025/api/v1/messages');
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Export test environment info
export function getEmailTestEnvironment() {
  return {
    isCI: !!process.env.CI,
    mailhogUrl: 'http://localhost:8025',
    smtpPort: 1025,
    httpPort: 8025,
  };
}