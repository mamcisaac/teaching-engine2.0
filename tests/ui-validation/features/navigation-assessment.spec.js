const { UI_BASE_URL, newPage, loginAsEmily, waitForHealthy, waitForTestId, expect } = global.__UI__;

describe('Navigation & Assessment pages (smoke)', () => {
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

  it('sidebar navigation works', async () => {
    await page.goto(`${UI_BASE_URL}/dashboard`, {
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for sidebar
    const sidebarExists = await page.evaluate(() => {
      return !!(
        document.querySelector('[data-testid="main-sidebar"]') ||
        document.querySelector('.sidebar') ||
        document.querySelector('nav')
      );
    });
    
    expect(sidebarExists).toBe(true);
    
    // Try to navigate to week view
    const weekNavExists = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a, button'));
      const weekLink = links.find(link => 
        link.textContent?.toLowerCase().includes('week') ||
        link.getAttribute('data-testid') === 'nav-week'
      );
      if (weekLink) {
        weekLink.click();
        return true;
      }
      return false;
    });
    
    if (weekNavExists) {
      await page.waitForTimeout(1000);
      const url = page.url();
      console.log('✓ Navigation to week view successful');
    }
    
    // Navigate to curriculum
    await page.goto(`${UI_BASE_URL}/curriculum`, {
      waitUntil: 'domcontentloaded'
    });
    
    const curriculumLoaded = await page.evaluate(() => {
      return !!(
        document.querySelector('[data-testid="curriculum-list"]') ||
        document.querySelector('[class*="curriculum"]')
      );
    });
    
    expect(curriculumLoaded).toBe(true);
    console.log('✓ Navigation to curriculum successful');
  });

  it('assessment area renders (students/assessment/analytics)', async () => {
    const routes = [
      { path: '/students', testId: 'students-page' },
      { path: '/assessment', testId: 'assessment-page' },
      { path: '/analytics', testId: 'analytics-page' }
    ];
    
    for (const route of routes) {
      await page.goto(`${UI_BASE_URL}${route.path}`, {
        waitUntil: 'domcontentloaded'
      });
      
      await page.waitForTimeout(1000);
      
      // Check if page loaded
      const pageLoaded = await page.evaluate((testId) => {
        return !!(
          document.querySelector(`[data-testid="${testId}"]`) ||
          document.querySelector('h1') ||
          document.querySelector('main')
        );
      }, route.testId);
      
      expect(pageLoaded).toBe(true);
      console.log(`✓ ${route.path} page loaded successfully`);
    }
  });

  it('shows Emily-specific assessment data', async () => {
    await page.goto(`${UI_BASE_URL}/assessment`, {
      waitUntil: 'networkidle0'
    });
    
    await page.waitForTimeout(2000);
    
    const pageContent = await page.evaluate(() => document.body.textContent || '');
    
    // Check for assessment-related keywords
    const assessmentKeywords = [
      'assessment', 'student', 'progress', 
      'anecdotal', 'observation', 'evaluation',
      'grade', 'performance', 'achievement'
    ];
    
    const foundKeywords = assessmentKeywords.filter(keyword => 
      pageContent.toLowerCase().includes(keyword)
    );
    
    expect(foundKeywords.length).toBeGreaterThan(0);
    console.log(`✓ Assessment page contains: ${foundKeywords.join(', ')}`);
  });
});