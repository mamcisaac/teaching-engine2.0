/**
 * Navigation Helper Functions for E2E Tests
 * Provides common UI navigation patterns
 */

class NavigationHelper {
  constructor(page) {
    this.page = page;
    this.baseURL = process.env.TEST_CLIENT_URL || 'http://localhost:5173';
  }

  /**
   * Navigate to a specific route and wait for it to load
   */
  async goto(path, options = {}) {
    const url = `${this.baseURL}${path}`;
    await this.page.goto(url, {
      waitUntil: options.waitUntil || 'networkidle0',
      timeout: options.timeout || 30000
    });
    
    // Wait for any loading indicators to disappear
    await this.waitForLoadingComplete();
  }

  /**
   * Wait for loading indicators to disappear
   */
  async waitForLoadingComplete() {
    try {
      await this.page.waitForSelector('[data-testid="loading-spinner"]', {
        state: 'hidden',
        timeout: 5000
      });
    } catch (e) {
      // Loading spinner might not exist, continue
    }
  }

  /**
   * Login as a specific user
   */
  async login(credentials) {
    await this.goto('/login');
    
    // Check if already logged in
    const currentUrl = this.page.url();
    if (!currentUrl.includes('/login')) {
      return; // Already authenticated
    }

    // Fill login form (support both email and username)
    const email = credentials.email || credentials.username;
    await this.page.type('[data-testid="email-input"]', email);
    await this.page.type('[data-testid="password-input"]', credentials.password);
    
    // Submit form
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle0' }),
      this.page.click('[data-testid="login-submit"]')
    ]);

    // Verify successful login
    await this.page.waitForSelector('[data-testid="dashboard"], [data-testid="main-content"]', {
      timeout: 10000
    });
  }

  /**
   * Logout current user
   */
  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.waitForSelector('[data-testid="profile-dropdown"]', { timeout: 2000 });
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForSelector('[data-testid="login-form"], form', { timeout: 5000 });
  }

  /**
   * Navigate using sidebar
   */
  async navigateToSection(sectionName) {
    const selectorMap = {
      'dashboard': '[data-testid="nav-dashboard"]',
      'students': '[data-testid="nav-students"]',
      'assessment': '[data-testid="nav-assessment"]',
      'artifacts': '[data-testid="nav-artifacts"]',
      'analytics': '[data-testid="nav-analytics"]',
      'reports': '[data-testid="nav-reports"]'
    };

    const selector = selectorMap[sectionName.toLowerCase()] || 
                    `[data-testid="nav-${sectionName.toLowerCase()}"]`;
    
    await this.page.click(selector);
    await this.waitForLoadingComplete();
  }

  /**
   * Open modal by trigger button
   */
  async openModal(triggerSelector) {
    await this.page.click(triggerSelector);
    await this.page.waitForSelector('[role="dialog"], [data-testid="modal"]', {
      timeout: 5000
    });
  }

  /**
   * Close current modal
   */
  async closeModal() {
    // Try multiple close methods
    const closeSelectors = [
      '[data-testid="modal-close"]',
      '[aria-label="Close"]',
      'button:has-text("Cancel")',
      '.modal-close'
    ];

    for (const selector of closeSelectors) {
      try {
        await this.page.click(selector);
        await this.page.waitForSelector('[role="dialog"]', {
          state: 'hidden',
          timeout: 2000
        });
        return;
      } catch (e) {
        // Try next selector
      }
    }

    // If no close button works, try ESC key
    await this.page.keyboard.press('Escape');
  }

  /**
   * Wait for success notification
   */
  async waitForSuccess(message) {
    const selectors = [
      '[data-testid="success-message"]',
      '[data-testid="success-toast"]',
      '.toast-success',
      '[role="alert"].success'
    ];

    for (const selector of selectors) {
      try {
        const element = await this.page.waitForSelector(selector, {
          timeout: 5000
        });
        
        if (message) {
          const text = await element.textContent();
          expect(text).toContain(message);
        }
        
        return element;
      } catch (e) {
        // Try next selector
      }
    }

    throw new Error('Success notification not found');
  }

  /**
   * Wait for error notification
   */
  async waitForError(expectedError) {
    const selectors = [
      '[data-testid="error-message"]',
      '[data-testid="error-toast"]',
      '.toast-error',
      '[role="alert"].error'
    ];

    for (const selector of selectors) {
      try {
        const element = await this.page.waitForSelector(selector, {
          timeout: 5000
        });
        
        if (expectedError) {
          const text = await element.textContent();
          expect(text).toContain(expectedError);
        }
        
        return element;
      } catch (e) {
        // Try next selector
      }
    }

    throw new Error('Error notification not found');
  }

  /**
   * Search for items
   */
  async search(query) {
    const searchSelectors = [
      '[data-testid="search-input"]',
      'input[type="search"]',
      'input[placeholder*="Search"]',
      'input[placeholder*="Rechercher"]'
    ];

    for (const selector of searchSelectors) {
      try {
        await this.page.fill(selector, query);
        // Trigger search (might auto-search or need Enter)
        await this.page.keyboard.press('Enter');
        await this.waitForLoadingComplete();
        return;
      } catch (e) {
        // Try next selector
      }
    }

    throw new Error('Search input not found');
  }

  /**
   * Select from dropdown
   */
  async selectOption(selector, value) {
    // Handle native select
    try {
      await this.page.selectOption(selector, value);
      return;
    } catch (e) {
      // Not a native select, try custom dropdown
    }

    // Handle custom dropdown
    await this.page.click(selector);
    await this.page.click(`[data-value="${value}"], option:has-text("${value}")`);
  }

  /**
   * Upload file
   */
  async uploadFile(filePath) {
    const fileInput = await this.page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found');
    }
    
    await fileInput.setInputFiles(filePath);
    await this.waitForLoadingComplete();
  }

  /**
   * Take screenshot with naming convention
   */
  async screenshot(name = 'screenshot') {
    const fs = require('fs');
    const pathModule = require('path');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dir = pathModule.join(process.cwd(), 'tests/e2e/screenshots');
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const path = pathModule.join(dir, `${name}-${timestamp}.png`);
    
    await this.page.screenshot({
      path,
      fullPage: true
    });
    
    return path;
  }

  /**
   * Check if element exists
   */
  async exists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 1000 });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get text content of element
   */
  async getText(selector) {
    const element = await this.page.waitForSelector(selector);
    return await element.textContent();
  }

  /**
   * Count elements matching selector
   */
  async count(selector) {
    await this.page.waitForSelector(selector, { timeout: 5000 });
    return await this.page.$$eval(selector, elements => elements.length);
  }

  /**
   * Wait for specific text to appear
   */
  async waitForText(text, options = {}) {
    await this.page.waitForFunction(
      text => document.body.textContent.includes(text),
      text,
      { timeout: options.timeout || 5000 }
    );
  }
}

module.exports = NavigationHelper;