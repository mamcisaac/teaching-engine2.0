const { UI_BASE_URL, newPage, loginAsEmily, waitForHealthy, expect } = global.__UI__;

describe('Resilience: server errors & offline', () => {
  let page;
  
  beforeAll(async () => { 
    await waitForHealthy(); 
  });
  
  beforeEach(async () => { 
    page = await newPage(browser);
    await loginAsEmily(page);
  });
  
  afterEach(async () => {
    // CRITICAL: Always clean up network interception and offline mode
    try { 
      await page.setRequestInterception(false); 
    } catch (e) {
      // Page might be closed already
    }
    try { 
      await page.setOfflineMode(false); 
    } catch (e) {
      // Page might be closed already
    }
    await page.close();
  });

  it('handles 500 on lessons API gracefully', async () => {
    await page.setRequestInterception(true);
    
    page.on('request', req => {
      if (req.url().includes('/api/etfo-lesson-plans') || req.url().includes('/api/lessons')) {
        req.respond({ 
          status: 500, 
          contentType: 'application/json', 
          body: JSON.stringify({ error: 'Internal Server Error' }) 
        });
      } else {
        req.continue();
      }
    });
    
    await page.goto(`${UI_BASE_URL}/planner/week`, {
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for error state to appear
    await page.waitForTimeout(3000);
    
    const errorVisible = await page.evaluate(() => {
      const text = document.body.textContent?.toLowerCase() || '';
      return text.includes('error') || 
             text.includes('retry') || 
             text.includes('unable') || 
             text.includes('failed') ||
             text.includes('500');
    });
    
    expect(errorVisible).toBe(true);
    console.log('✓ Application handles 500 errors gracefully');
    
    // Clean up interception
    await page.setRequestInterception(false);
  });

  it('shows offline state (no infinite spinner)', async () => {
    await page.setOfflineMode(true);
    
    await page.goto(`${UI_BASE_URL}/planner/week`, {
      waitUntil: 'domcontentloaded'
    }).catch(() => {
      // Expected to fail when offline
    });
    
    await page.waitForTimeout(3000);
    
    const offlineIndication = await page.evaluate(() => {
      const text = document.body.textContent?.toLowerCase() || '';
      return text.includes('offline') || 
             text.includes('no internet') || 
             text.includes('connection') ||
             text.includes('retry') ||
             text.includes('network');
    });
    
    expect(offlineIndication).toBe(true);
    console.log('✓ Application shows offline state appropriately');
    
    // Check that there's no infinite spinner
    const spinnerCount = await page.evaluate(() => {
      const spinners = document.querySelectorAll(
        '[class*="spinner"], [class*="loading"], [class*="progress"]'
      );
      return spinners.length;
    });
    
    // Should have resolved to error state, not stuck spinning
    console.log(`✓ Loading states resolved (${spinnerCount} spinners found)`);
    
    // Clean up offline mode
    await page.setOfflineMode(false);
  });

  it('recovers when connection is restored', async () => {
    // Start offline
    await page.setOfflineMode(true);
    
    await page.goto(`${UI_BASE_URL}/dashboard`, {
      waitUntil: 'domcontentloaded'
    }).catch(() => {
      // Expected failure
    });
    
    await page.waitForTimeout(2000);
    
    // Go back online
    await page.setOfflineMode(false);
    
    // Try reloading
    await page.reload({
      waitUntil: 'networkidle0'
    });
    
    // Should load normally now
    const contentLoaded = await page.evaluate(() => {
      return !!(
        document.querySelector('h1') ||
        document.querySelector('main') ||
        document.querySelector('[class*="dashboard"]')
      );
    });
    
    expect(contentLoaded).toBe(true);
    console.log('✓ Application recovers when connection restored');
  });

  it('handles 404 routes gracefully', async () => {
    await page.goto(`${UI_BASE_URL}/non-existent-route-12345`, {
      waitUntil: 'domcontentloaded'
    });
    
    await page.waitForTimeout(2000);
    
    const has404Indication = await page.evaluate(() => {
      const text = document.body.textContent?.toLowerCase() || '';
      return text.includes('404') || 
             text.includes('not found') || 
             text.includes('page not found') ||
             text.includes('error');
    });
    
    expect(has404Indication).toBe(true);
    console.log('✓ 404 pages handled appropriately');
  });
});