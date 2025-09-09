const { expect } = require('expect');

// Require environment variables for proper configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const UI_BASE_URL = process.env.UI_BASE_URL || 'http://localhost:5173';

if (!process.env.API_BASE_URL || !process.env.UI_BASE_URL) {
  console.warn('⚠️  API_BASE_URL and UI_BASE_URL should be set explicitly. Using defaults.');
  console.warn(`   API_BASE_URL=${API_BASE_URL}`);
  console.warn(`   UI_BASE_URL=${UI_BASE_URL}`);
}

const TEST_USER_ID = Number(process.env.TEST_USER_ID || 23); // Emily
const TEST_TOKEN = process.env.TEST_SECRET || 'test-secret-token';

// Inject time-freeze & disable animations on every page
async function hardenPage(page) {
  await page.evaluateOnNewDocument(() => {
    // Freeze time to a fixed date
    const fixed = new Date('2025-09-08T09:00:00-03:00').valueOf();
    const _Date = Date;
    // eslint-disable-next-line no-undef
    globalThis.Date = class extends _Date {
      constructor(...args) { 
        super(...(args.length ? args : [fixed])); 
      }
      static now() { 
        return fixed; 
      }
    };
    
    // Disable all animations and transitions
    const style = document.createElement('style');
    style.innerHTML = `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
  });
}

async function newPage(browser) {
  const page = await browser.newPage();
  await hardenPage(page);
  page.setDefaultTimeout(8000);
  
  // Set viewport for consistency
  await page.setViewport({ width: 1280, height: 720 });
  
  return page;
}

async function waitForHealthy() {
  // Use native fetch if available (Node 18+), otherwise skip health check
  const fetchImpl = typeof fetch !== 'undefined' ? fetch : null;
  
  if (!fetchImpl) {
    console.log('⚠️  Skipping health check (fetch not available)');
    return;
  }
  
  const maxRetries = 40;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetchImpl(`${API_BASE_URL}/readyz`, { 
        headers: {
          'X-Test-Token': TEST_TOKEN
        }
      });
      
      if (res.ok) {
        console.log('✓ Backend is ready');
        return;
      }
    } catch (err) {
      // Expected during startup
    }
    
    if (i === 0) {
      console.log('Waiting for backend to be ready...');
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  throw new Error('Backend never became ready after 20 seconds');
}

// Programmatic login as Emily (sets auth cookie only)
async function loginAsEmily(page) {
  // Navigate to the app first to establish cookie domain
  await page.goto(UI_BASE_URL, { waitUntil: 'domcontentloaded' });
  
  // Call the test login endpoint (cookies are automatically handled by browser)
  const res = await page.evaluate(async (api, uid, token) => {
    const resp = await fetch(`${api}/__test__/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Test-Token': token
      },
      credentials: 'include', // This ensures cookies are set
      body: JSON.stringify({ userId: uid })
    });
    
    const text = await resp.text();
    
    try {
      return { 
        ok: resp.ok, 
        status: resp.status,
        body: JSON.parse(text)
      };
    } catch {
      return { 
        ok: resp.ok, 
        status: resp.status,
        body: text 
      };
    }
  }, API_BASE_URL, TEST_USER_ID, TEST_TOKEN);

  if (!res.ok) {
    throw new Error(`Login failed (${res.status}): ${JSON.stringify(res.body)}`);
  }
  
  console.log(`✓ Logged in as Emily (userId: ${TEST_USER_ID}) - cookie set`);
  
  // Reload page to apply auth cookie
  await page.reload({ waitUntil: 'domcontentloaded' });
}

// Helper to wait for selector with better error messages
async function waitForTestId(page, testId, options = {}) {
  const selector = `[data-testid="${testId}"]`;
  try {
    return await page.waitForSelector(selector, options);
  } catch (err) {
    throw new Error(`Failed to find element with data-testid="${testId}"`);
  }
}

// Export all helpers as a global object
global.__UI__ = {
  UI_BASE_URL,
  API_BASE_URL,
  TEST_USER_ID,
  TEST_TOKEN,
  newPage,
  loginAsEmily,
  waitForHealthy,
  waitForTestId,
  expect
};

// Clean up browser on process exit
if (typeof afterAll !== 'undefined') {
  afterAll(async () => {
    if (global.browser) {
      await global.browser.close();
    }
  });
}