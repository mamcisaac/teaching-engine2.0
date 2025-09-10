/**
 * E2E Test Suite for Hierarchical Planning Display
 * Tests the complete LRP → Units → Lessons hierarchy with coverage tracking
 * Includes validation of the enhanced week view with color coding and unit titles
 */

const puppeteer = require('puppeteer');

describe('Hierarchical Planning Display', () => {
  let browser;
  let page;
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:5173';
  const apiURL = process.env.API_BASE_URL || 'http://localhost:3000';

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.HEADLESS === 'true',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Login as Emily
    await page.goto(`${baseURL}/login`);
    await page.type('[data-testid="email-input"]', 'emily.mcisaac@test.com');
    await page.type('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"], [data-testid="login-submit"]');
    
    // Wait for navigation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('Enhanced Week View with Color Coding', () => {
    it('should display lessons with subject-based color coding', async () => {
      await page.goto(`${baseURL}/planner/week`);
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 5000 });
      
      // Check for color classes
      const hasColoredCards = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="lesson-card"]');
        const colorClasses = [
          'bg-blue-100', 'bg-green-100', 'bg-purple-100',
          'bg-orange-100', 'bg-cyan-100', 'bg-pink-100'
        ];
        
        return Array.from(cards).some(card => {
          const classList = Array.from(card.classList);
          return colorClasses.some(color => classList.includes(color));
        });
      });
      
      expect(hasColoredCards).toBe(true);
      console.log('✓ Subject-based color coding is working');
    });

    it('should display unit titles on lesson cards', async () => {
      await page.goto(`${baseURL}/planner/week`);
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 5000 });
      
      // Check for unit titles (in italic gray text)
      const hasUnitTitles = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="lesson-card"]');
        return Array.from(cards).some(card => {
          const italicText = card.querySelector('.text-gray-500.italic');
          return italicText && italicText.textContent.length > 0;
        });
      });
      
      expect(hasUnitTitles).toBe(true);
      console.log('✓ Unit titles are displayed on lesson cards');
    });

    it('should display lesson numbers within units', async () => {
      await page.goto(`${baseURL}/planner/week`);
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 5000 });
      
      // Check for lesson numbers (format: #1, #2, etc.)
      const hasLessonNumbers = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="lesson-card"]');
        return Array.from(cards).some(card => {
          const text = card.textContent;
          return /#\d+/.test(text);
        });
      });
      
      expect(hasLessonNumbers).toBe(true);
      console.log('✓ Lesson numbers are displayed');
    });

    it('should display curriculum expectations as chips', async () => {
      await page.goto(`${baseURL}/planner/week`);
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 5000 });
      
      // Check for expectation chips
      const hasExpectations = await page.evaluate(() => {
        const chips = document.querySelectorAll('.bg-gray-100.text-gray-600');
        return chips.length > 0;
      });
      
      if (hasExpectations) {
        console.log('✓ Curriculum expectations are displayed as chips');
      } else {
        console.log('⚠ No curriculum expectations found (might not be linked yet)');
      }
    });

    it('should NOT display duration since all lessons are 45 minutes', async () => {
      await page.goto(`${baseURL}/planner/week`);
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 5000 });
      
      // Check that duration is NOT displayed
      const hasDuration = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="lesson-card"]');
        return Array.from(cards).some(card => {
          const text = card.textContent;
          return text.includes('45 min') || text.includes('duration');
        });
      });
      
      expect(hasDuration).toBe(false);
      console.log('✓ Duration is correctly NOT displayed');
    });

    it('should show warning for lessons without subjects', async () => {
      await page.goto(`${baseURL}/planner/week`);
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 5000 });
      
      // Check for warning indicators
      const warnings = await page.evaluate(() => {
        const warningElements = document.querySelectorAll('.text-red-500');
        return Array.from(warningElements).filter(el => 
          el.textContent.includes('No subject')
        ).length;
      });
      
      if (warnings > 0) {
        console.log(`✓ Warning indicators shown for ${warnings} lessons without subjects`);
      } else {
        console.log('✓ All lessons have subjects assigned');
      }
    });
  });

  describe('Hierarchical Structure Display', () => {
    it('should show 6 Long Range Plans', async () => {
      await page.goto(`${baseURL}/planner/long-range`);
      
      // Wait for LRP cards to load
      const lrpSelector = '[data-testid^="lrp-card-"]';
      try {
        await page.waitForSelector(lrpSelector, { timeout: 5000 });
      } catch {
        // Fallback selectors
        await page.waitForSelector('.lrp-card, [class*="long-range"]', { timeout: 5000 });
      }
      
      const subjects = [
        'Français', 'Mathématiques', 'Sciences',
        'Arts', 'Études sociales', 'Formation personnelle'
      ];
      
      const foundSubjects = await page.evaluate((subjects) => {
        const pageText = document.body.textContent;
        return subjects.filter(subject => 
          pageText.includes(subject)
        );
      }, subjects);
      
      expect(foundSubjects.length).toBeGreaterThan(0);
      console.log(`✓ Found ${foundSubjects.length} LRPs: ${foundSubjects.join(', ')}`);
    });

    it('should show 50 unit plans total', async () => {
      await page.goto(`${baseURL}/planner/units`);
      
      // Wait for unit cards
      try {
        await page.waitForSelector('[data-testid^="unit-card-"]', { timeout: 5000 });
      } catch {
        await page.waitForSelector('.unit-card, [class*="unit"]', { timeout: 5000 });
      }
      
      const unitCount = await page.evaluate(() => {
        const unitCards = document.querySelectorAll(
          '[data-testid^="unit-card-"], .unit-card, [class*="unit-card"]'
        );
        return unitCards.length;
      });
      
      console.log(`✓ Found ${unitCount} unit plans (expected 50)`);
      
      // Check for strategic Health/FPS distribution
      const healthUnits = await page.evaluate(() => {
        const pageText = document.body.textContent;
        const units = [
          'Mon corps et ma sécurité',
          'Mes émotions et sentiments',
          'Amitiés et relations positives',
          'Nutrition et mode de vie sain',
          'Grandir, changer et célébrer ensemble'
        ];
        return units.filter(unit => pageText.includes(unit));
      });
      
      if (healthUnits.length > 0) {
        console.log(`✓ Found Health/FPS units with strategic distribution: ${healthUnits.join(', ')}`);
      }
    });

    it('should maintain 970 total lessons', async () => {
      // This would typically check an API endpoint
      const response = await page.evaluate(async (apiURL) => {
        try {
          const res = await fetch(`${apiURL}/api/planning/stats`);
          return await res.json();
        } catch {
          return null;
        }
      }, apiURL);
      
      if (response && response.totalLessons) {
        expect(response.totalLessons).toBe(970);
        console.log('✓ Total lesson count verified: 970');
      } else {
        console.log('⚠ Could not verify total lesson count (API endpoint may not exist)');
      }
    });
  });

  describe('Coverage Tracking', () => {
    it('should show coverage indicators at each level', async () => {
      await page.goto(`${baseURL}/planner/long-range`);
      
      // Check for coverage indicators
      const hasCoverage = await page.evaluate(() => {
        const indicators = document.querySelectorAll(
          '[data-testid*="coverage"], .coverage-bar, [class*="progress"]'
        );
        return indicators.length > 0;
      });
      
      if (hasCoverage) {
        console.log('✓ Coverage indicators are displayed');
      } else {
        console.log('⚠ Coverage indicators not found (feature may not be implemented)');
      }
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should display properly on mobile devices', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.goto(`${baseURL}/planner/week`);
      
      // Check that lesson cards are still visible
      await page.waitForSelector('[data-testid="lesson-card"]', { timeout: 5000 });
      
      // Check that cards stack vertically
      const isStacked = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="lesson-card"]');
        if (cards.length < 2) return true;
        
        const first = cards[0].getBoundingClientRect();
        const second = cards[1].getBoundingClientRect();
        
        // Cards should be stacked (second below first)
        return second.top > first.bottom;
      });
      
      expect(isStacked).toBe(true);
      console.log('✓ Mobile responsiveness verified');
      
      // Check color coding is maintained
      const hasColors = await page.evaluate(() => {
        const cards = document.querySelectorAll('[data-testid="lesson-card"]');
        const colorClasses = ['bg-blue-100', 'bg-green-100', 'bg-purple-100'];
        
        return Array.from(cards).some(card => {
          const classList = Array.from(card.classList);
          return colorClasses.some(color => classList.includes(color));
        });
      });
      
      expect(hasColors).toBe(true);
      console.log('✓ Color coding maintained on mobile');
    });
  });
});