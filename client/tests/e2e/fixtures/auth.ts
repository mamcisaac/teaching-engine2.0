/**
 * Auth fixture using storageState from global setup
 */

import { test as base } from './base';
import type { BrowserContext } from '@playwright/test';
import * as path from 'path';

export const test = base.extend<{
  authenticatedContext: BrowserContext;
}>({
  authenticatedContext: async ({ browser }, use) => {
    // Use storageState from global setup (Emily's authentication)
    const storageStatePath = path.join(__dirname, '..', 'auth.json');
    
    try {
      // Create authenticated context using storageState from global setup
      const authenticatedContext = await browser.newContext({ 
        storageState: storageStatePath 
      });
      
      await use(authenticatedContext);
      await authenticatedContext.close();
    } catch (error) {
      // Fallback: if auth.json doesn't exist, global setup failed
      throw new Error(
        `Authentication failed: storageState file not found at ${storageStatePath}. ` +
        'This indicates global setup did not complete successfully. ' +
        'Ensure the backend is running and global setup can authenticate.'
      );
    }
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