import { chromium } from '@playwright/test';
import * as fs from 'fs/promises';
import * as path from 'path';

export default async function globalSetupCI() {
  console.log('Running CI-specific global setup...');
  
  // Create a minimal auth.json for CI tests
  const authState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:5173',
        localStorage: [
          {
            name: 'token',
            value: 'ci-test-token'
          },
          {
            name: 'auth-token', 
            value: 'ci-test-token'
          },
          {
            name: 'onboarded',
            value: 'true'
          },
          {
            name: 'user',
            value: JSON.stringify({
              id: 2,
              email: 'teacher@example.com',
              name: 'Test Teacher',
              role: 'TEACHER'
            })
          }
        ]
      }
    ]
  };

  // Ensure the storage directory exists
  await fs.mkdir(path.join(process.cwd(), 'tests/storage'), { recursive: true });
  
  // Write the auth state
  await fs.writeFile(
    path.join(process.cwd(), 'tests/storage/auth.json'),
    JSON.stringify(authState, null, 2)
  );
  
  console.log('CI auth state created');
}