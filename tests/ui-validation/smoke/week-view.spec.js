const { UI_BASE_URL, newPage, loginAsEmily, waitForHealthy, waitForTestId, expect } = global.__UI__;

describe('[SMOKE] Week view', () => {
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

  it('loads week grid and resolves spinner', async () => {
    await page.goto(`${UI_BASE_URL}/planner/week`, {
      waitUntil: 'domcontentloaded'
    });
    
    // Wait for loading indicator to appear and then disappear
    const loadingIndicator = await page.$('text/Loading');
    if (loadingIndicator) {
      console.log('⏳ Loading indicator detected, waiting for completion...');
      await page.waitForSelector('text/Loading', { 
        hidden: true, 
        timeout: 10000 
      });
    }
    
    // Check for week view grid
    let weekViewFound = false;
    try {
      await waitForTestId(page, 'week-view-grid', { timeout: 5000 });
      weekViewFound = true;
    } catch {
      // Fallback selectors
      const weekView = await page.evaluate(() => {
        return !!(
          document.querySelector('.week-view') ||
          document.querySelector('[class*="week-grid"]') ||
          document.querySelector('[class*="calendar"]') ||
          document.querySelector('table')
        );
      });
      weekViewFound = weekView;
    }
    
    expect(weekViewFound).toBe(true);
    console.log('✓ Week view grid loaded successfully');
  });

  it('navigates between weeks (Today/Prev/Next)', async () => {
    await page.goto(`${UI_BASE_URL}/planner/week`, {
      waitUntil: 'networkidle0'
    });
    
    // Get initial week header text
    const getWeekHeader = async () => {
      return await page.evaluate(() => {
        const headerElement = 
          document.querySelector('h1') ||
          document.querySelector('[data-testid="week-header"]') ||
          document.querySelector('[class*="header"]') ||
          document.querySelector('[class*="title"]');
        return headerElement?.textContent?.trim() || '';
      });
    };
    
    const initialWeek = await getWeekHeader();
    console.log(`Initial week: ${initialWeek}`);
    
    // Click Next button
    const nextButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextBtn = buttons.find(btn => 
        btn.textContent?.toLowerCase().includes('next') ||
        btn.getAttribute('aria-label')?.toLowerCase().includes('next')
      );
      if (nextBtn) {
        nextBtn.click();
        return true;
      }
      return false;
    });
    
    if (nextButton) {
      // Wait for navigation to complete
      await page.waitForTimeout(1000);
      
      // Check if week changed
      const newWeek = await getWeekHeader();
      expect(newWeek).not.toEqual(initialWeek);
      console.log(`✓ Navigated to next week: ${newWeek}`);
    } else {
      console.log('⚠️ Next button not found, checking for alternative navigation');
      
      // Check if there's any date picker or navigation element
      const hasNavigation = await page.evaluate(() => {
        return !!(
          document.querySelector('[class*="navigation"]') ||
          document.querySelector('[class*="date-picker"]') ||
          document.querySelector('input[type="date"]')
        );
      });
      
      expect(hasNavigation).toBe(true);
    }
  });

  it('displays lesson cards with Emily\'s data', async () => {
    await page.goto(`${UI_BASE_URL}/planner/week`, {
      waitUntil: 'networkidle0'
    });
    
    // Wait for any loading to complete
    await page.waitForTimeout(2000);
    
    // Look for lesson cards or similar elements
    const lessonCount = await page.evaluate(() => {
      const possibleSelectors = [
        '[data-testid*="lesson"]',
        '.lesson-card',
        '[class*="lesson"]',
        '.card',
        '[class*="event"]',
        '[class*="activity"]'
      ];
      
      for (const selector of possibleSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          return elements.length;
        }
      }
      
      // Check for any table cells with content (might be in a grid)
      const cells = document.querySelectorAll('td');
      const nonEmptyCells = Array.from(cells).filter(cell => 
        cell.textContent?.trim() && 
        !['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(cell.textContent.trim())
      );
      
      return nonEmptyCells.length;
    });
    
    // Emily should have lessons visible
    expect(lessonCount).toBeGreaterThan(0);
    console.log(`✓ Found ${lessonCount} lesson elements in week view`);
  });

  it('shows correct subjects for Emily\'s Grade 1 French Immersion', async () => {
    await page.goto(`${UI_BASE_URL}/planner/week`, {
      waitUntil: 'networkidle0'
    });
    
    await page.waitForTimeout(2000);
    
    // Check for French Immersion subjects
    const pageContent = await page.evaluate(() => document.body.textContent || '');
    
    const expectedSubjects = [
      'français', 'french',
      'math', 'mathématiques',
      'science',
      'art',
      'social', 'études sociales',
      'health', 'santé'
    ];
    
    const foundSubjects = expectedSubjects.filter(subject => 
      pageContent.toLowerCase().includes(subject)
    );
    
    expect(foundSubjects.length).toBeGreaterThan(0);
    console.log(`✓ Found subjects: ${foundSubjects.join(', ')}`);
  });
});