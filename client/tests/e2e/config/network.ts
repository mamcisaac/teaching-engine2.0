import { Page } from '@playwright/test';

export async function failOn5xx(page: Page) {
  page.on('response', async (res) => {
    const url = res.url();
    const status = res.status();
    if (url.includes('/api/') && status >= 500) {
      const body = await res.text().catch(() => '');
      throw new Error(`5xx from ${url} → ${status}\n${body.slice(0, 500)}`);
    }
  });
}