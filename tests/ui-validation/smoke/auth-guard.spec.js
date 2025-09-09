const { UI_BASE_URL, newPage, loginAsEmily, waitForHealthy, expect } = global.__UI__;

describe('[SMOKE] Auth guard', () => {
  let page;
  
  beforeAll(async () => { 
    await waitForHealthy(); 
  });
  
  beforeEach(async () => { 
    page = await newPage(browser); 
  });
  
  afterEach(async () => { 
    await page.close(); 
  });

  it('redirects unauthenticated users to login, then loads after authentication', async () => {
    // Try to access a protected route without authentication
    await page.goto(`${UI_BASE_URL}/planner/week`, { 
      waitUntil: 'domcontentloaded' 
    });
    
    // Should be redirected to login page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(login|signin|auth)/i);
    console.log('✓ Unauthenticated access redirected to login');
    
    // Now login as Emily
    await loginAsEmily(page);
    
    // Navigate to the protected route again
    await page.goto(`${UI_BASE_URL}/planner/week`, {
      waitUntil: 'networkidle0'
    });
    
    // Should now be on the week planner page
    const authenticatedUrl = page.url();
    expect(authenticatedUrl).toContain('/planner/week');
    
    // Wait for the week view grid to load (confirms we're authenticated and page loaded)
    try {
      await page.waitForSelector('[data-testid="week-view-grid"]', { 
        timeout: 5000 
      });
      console.log('✓ Authenticated access successful - week view loaded');
    } catch (error) {
      // If data-testid not found, try alternative selectors
      const weekViewExists = await page.evaluate(() => {
        return !!(
          document.querySelector('.week-view') ||
          document.querySelector('[class*="week"]') ||
          document.querySelector('h1')?.textContent?.toLowerCase().includes('week')
        );
      });
      
      expect(weekViewExists).toBe(true);
      console.log('✓ Authenticated access successful - week view detected');
    }
  });

  it('maintains authentication across page navigations', async () => {
    // Login first
    await loginAsEmily(page);
    
    // Navigate to dashboard
    await page.goto(`${UI_BASE_URL}/dashboard`, {
      waitUntil: 'domcontentloaded'
    });
    
    let url = page.url();
    expect(url).toContain('/dashboard');
    
    // Navigate to another protected route
    await page.goto(`${UI_BASE_URL}/curriculum`, {
      waitUntil: 'domcontentloaded'
    });
    
    url = page.url();
    expect(url).toContain('/curriculum');
    
    // Should not be redirected to login
    expect(url).not.toMatch(/\/(login|signin|auth)/i);
    
    console.log('✓ Authentication persists across navigation');
  });
});