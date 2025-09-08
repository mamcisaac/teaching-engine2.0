/**
 * Auth fixture using storageState from test login endpoint
 */

import { test as base } from './base';
import type { BrowserContext } from '@playwright/test';

const TEST_SECRET = process.env.TEST_SECRET || 'test-secret-token';

export const test = base.extend<{
  authenticatedContext: BrowserContext;
}>({
  authenticatedContext: async ({ browser }, use) => {
    // Create a new context for authentication
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Use test login endpoint to get auth cookie
    const response = await page.request.post('http://localhost:3000/__test__/login', {
      headers: { 
        'X-Test-Token': TEST_SECRET 
      }
    });
    
    if (!response.ok()) {
      throw new Error(`Failed to login: ${response.status()} ${response.statusText()}`);
    }
    
    // The cookie is automatically set by the response
    // Save the storage state
    const storageState = await context.storageState();
    
    // Create a new context with the auth state
    const authenticatedContext = await browser.newContext({ storageState });
    
    await use(authenticatedContext);
    
    await authenticatedContext.close();
    await context.close();
  },
  
  page: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    
    // Apply the same Date freeze and animation disable from base fixture
    await page.addInitScript(() => {
      const fixed = new Date('2025-09-08T09:00:00-03:00').valueOf();
      const _Date = Date;
      // @ts-ignore
      globalThis.Date = class extends _Date {
        constructor(...args: any[]) { 
          // @ts-ignore
          super(...(args.length ? args : [fixed])); 
        }
        static now() { return fixed; }
      } as any;
      
      // Disable animations
      const style = document.createElement('style');
      style.innerHTML = `
        *, *::before, *::after { 
          animation: none !important;
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    await use(page);
    await page.close();
  }
});

export { expect } from '@playwright/test';