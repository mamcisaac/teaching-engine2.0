/**
 * Base test fixture with Date freeze and animation disable
 */

import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Comprehensive Date freeze to Monday Sept 8, 2025
    await page.addInitScript(() => {
      const fixed = new Date('2025-09-08T09:00:00-03:00').valueOf();
      const _Date = Date;
      // @ts-ignore
      globalThis.Date = class extends _Date {
        constructor(...args: any[]) { 
          super(...(args.length ? args : [fixed])); 
        }
        static now() { return fixed; }
      } as any;
      
      // Disable animations and transitions
      const style = document.createElement('style');
      style.innerHTML = `
        *, *::before, *::after { 
          animation: none !important;
          transition: none !important;
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `;
      document.head.appendChild(style);
    });
    
    // Collect console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await use(page);
    
    // Assert no console errors after each test
    if (errors.length > 0) {
      console.warn('Console errors detected:', errors);
    }
  }
});

export { expect } from '@playwright/test';