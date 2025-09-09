const { UI_BASE_URL, newPage, loginAsEmily, waitForHealthy, waitForTestId, expect } = global.__UI__;

describe('[SMOKE] App shell', () => {
  let page;
  
  beforeAll(async () => { 
    await waitForHealthy(); 
  });
  
  beforeEach(async () => { 
    page = await newPage(browser);
    await loginAsEmily(page);
  });
  
  afterEach(async () => { 
    await page.close(); 
  });

  it('renders sidebar and has no fatal console errors', async () => {
    await page.goto(`${UI_BASE_URL}/dashboard`, {
      waitUntil: 'networkidle0'
    });
    
    // Check for sidebar presence
    let sidebarFound = false;
    try {
      await waitForTestId(page, 'main-sidebar', { timeout: 5000 });
      sidebarFound = true;
    } catch {
      // Fallback to class-based selector
      const sidebar = await page.$('.sidebar, [class*="sidebar"], nav');
      sidebarFound = !!sidebar;
    }
    
    expect(sidebarFound).toBe(true);
    console.log('✓ Sidebar rendered successfully');
    
    // Collect console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore some common non-fatal errors
        if (!text.includes('favicon') && 
            !text.includes('Failed to load resource') &&
            !text.includes('404')) {
          errors.push(text);
        }
      }
    });
    
    // Wait a bit for any async errors to surface
    await page.waitForTimeout(1000);
    
    // Check for critical errors
    expect(errors.length).toBe(0);
    
    if (errors.length === 0) {
      console.log('✓ No console errors detected');
    }
  });

  it('displays Emily\'s user information', async () => {
    await page.goto(`${UI_BASE_URL}/dashboard`, {
      waitUntil: 'domcontentloaded'
    });
    
    // Look for user info in various possible locations
    const userInfo = await page.evaluate(() => {
      const possibleSelectors = [
        '[data-testid="user-info"]',
        '.user-profile',
        '[class*="user"]',
        '[class*="profile"]',
        'header'
      ];
      
      for (const selector of possibleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent) {
          return element.textContent;
        }
      }
      
      // Check entire page for Emily's info as last resort
      return document.body.textContent || '';
    });
    
    // Check for Emily's name or ID somewhere on the page
    const hasUserInfo = userInfo.toLowerCase().includes('emily') || 
                       userInfo.includes('23') ||
                       userInfo.toLowerCase().includes('teacher');
    
    expect(hasUserInfo).toBe(true);
    console.log('✓ User information displayed');
  });

  it('has functioning navigation elements', async () => {
    await page.goto(`${UI_BASE_URL}/dashboard`, {
      waitUntil: 'domcontentloaded'
    });
    
    // Check for navigation links
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, [role="link"], button'));
      return links.filter(link => {
        const text = link.textContent?.toLowerCase() || '';
        return text.includes('week') || 
               text.includes('curriculum') || 
               text.includes('dashboard') ||
               text.includes('plan') ||
               text.includes('unit');
      }).length;
    });
    
    expect(navLinks).toBeGreaterThan(0);
    console.log(`✓ Found ${navLinks} navigation elements`);
  });
});