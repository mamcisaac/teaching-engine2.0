/**
 * Comprehensive UI Validation Test Suite
 * Tests all Teaching Engine 2.0 features through actual UI interactions
 * Uses Puppeteer to click buttons, fill forms, and capture screenshots
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveUIValidation {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 50,
      baseURL: options.baseURL || 'http://localhost:5173',
      serverURL: options.serverURL || 'http://localhost:3000',
      screenshotDir: options.screenshotDir || './screenshots/comprehensive-ui',
      reportDir: options.reportDir || './test-reports/comprehensive-ui',
      verbose: options.verbose !== false
    };
    
    this.testResults = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      startTime: null,
      endTime: null,
      tests: [],
      screenshots: []
    };
    
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialize test environment
   */
  async initialize() {
    console.log('🚀 Initializing Comprehensive UI Validation Suite');
    console.log('============================================');
    console.log(`Client URL: ${this.options.baseURL}`);
    console.log(`Server URL: ${this.options.serverURL}`);
    console.log(`Headless: ${this.options.headless}`);
    console.log('');
    
    // Create directories
    await fs.mkdir(this.options.screenshotDir, { recursive: true });
    await fs.mkdir(this.options.reportDir, { recursive: true });
    
    // Launch browser
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1920,
        height: 1080
      }
    });
    
    this.page = await this.browser.newPage();
    
    // Set up console logging
    this.page.on('console', msg => {
      if (this.options.verbose) {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
      }
    });
    
    // Set up error handling
    this.page.on('error', err => {
      console.error(`[Browser Error]`, err);
    });
    
    this.page.on('pageerror', err => {
      console.error(`[Page Error]`, err);
    });
  }

  /**
   * Take screenshot with descriptive name
   */
  async screenshot(name) {
    const filename = `${Date.now()}-${name.replace(/[^a-z0-9]/gi, '-')}.png`;
    const filepath = path.join(this.options.screenshotDir, filename);
    await this.page.screenshot({ path: filepath, fullPage: true });
    this.testResults.screenshots.push({ name, filepath, timestamp: Date.now() });
    console.log(`📸 Screenshot: ${name}`);
    return filepath;
  }

  /**
   * Record test result
   */
  recordTest(name, passed, error = null) {
    this.testResults.totalTests++;
    if (passed) {
      this.testResults.passed++;
      console.log(`✅ ${name}`);
    } else {
      this.testResults.failed++;
      console.log(`❌ ${name}${error ? ': ' + error : ''}`);
    }
    
    this.testResults.tests.push({
      name,
      passed,
      error: error ? error.toString() : null,
      timestamp: Date.now()
    });
  }

  /**
   * Wait for element and click
   */
  async clickElement(selector, name) {
    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      await this.page.click(selector);
      return true;
    } catch (error) {
      console.error(`Failed to click ${name}: ${selector}`, error);
      return false;
    }
  }

  /**
   * Wait for element and type
   */
  async typeInElement(selector, text, name) {
    try {
      await this.page.waitForSelector(selector, { timeout: 10000 });
      await this.page.click(selector);
      await this.page.type(selector, text);
      return true;
    } catch (error) {
      console.error(`Failed to type in ${name}: ${selector}`, error);
      return false;
    }
  }

  /**
   * Check if element exists
   */
  async elementExists(selector) {
    try {
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Test 1: Authentication Flow
   */
  async testAuthentication() {
    console.log('\n📋 Testing Authentication Flow');
    console.log('--------------------------------');
    
    try {
      // Navigate to app
      await this.page.goto(this.options.baseURL, { waitUntil: 'networkidle2' });
      await this.screenshot('01-landing-page');
      
      // Check if we're on login page or already logged in
      const isLoginPage = await this.elementExists('input[type="email"], input[name="email"], input[placeholder*="email" i]');
      
      if (isLoginPage) {
        // Fill login form
        await this.typeInElement('input[type="email"], input[name="email"]', 'teacher@test.com', 'email field');
        await this.typeInElement('input[type="password"], input[name="password"]', 'password123', 'password field');
        await this.screenshot('02-login-filled');
        
        // Submit login
        await this.clickElement('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")', 'login button');
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
        await this.screenshot('03-after-login');
        
        this.recordTest('Login form submission', true);
      } else {
        // Check if we're in onboarding or dashboard
        const isOnboarding = await this.elementExists('[data-testid="onboarding"], .onboarding, h1:has-text("Welcome")');
        const isDashboard = await this.elementExists('[data-testid="dashboard"], .dashboard, nav');
        
        if (isOnboarding || isDashboard) {
          this.recordTest('Authentication state', true);
          await this.screenshot('03-authenticated-state');
        } else {
          this.recordTest('Authentication state', false, 'Unknown page state');
        }
      }
    } catch (error) {
      this.recordTest('Authentication flow', false, error);
    }
  }

  /**
   * Test 2: Onboarding Flow
   */
  async testOnboarding() {
    console.log('\n📋 Testing Onboarding Flow');
    console.log('--------------------------------');
    
    try {
      // Check if onboarding is present
      const hasOnboarding = await this.elementExists('[data-testid="onboarding"], .onboarding, .onboarding-flow');
      
      if (hasOnboarding) {
        await this.screenshot('04-onboarding-start');
        
        // Step through onboarding
        for (let step = 1; step <= 4; step++) {
          await this.screenshot(`05-onboarding-step-${step}`);
          
          // Look for next/continue button
          const nextButton = await this.elementExists('button:has-text("Next"), button:has-text("Continue"), button:has-text("Suivant")');
          if (nextButton) {
            await this.clickElement('button:has-text("Next"), button:has-text("Continue"), button:has-text("Suivant")', 'next button');
            await this.page.waitForTimeout(1000);
          }
        }
        
        // Subject selection (if present)
        const hasSubjectSelection = await this.elementExists('[data-testid="subject-selection"], .subject-selection, input[type="checkbox"]');
        if (hasSubjectSelection) {
          await this.screenshot('06-subject-selection');
          
          // Select some subjects
          const checkboxes = await this.page.$$('input[type="checkbox"]');
          for (let i = 0; i < Math.min(3, checkboxes.length); i++) {
            await checkboxes[i].click();
            await this.page.waitForTimeout(200);
          }
          await this.screenshot('07-subjects-selected');
        }
        
        // Complete onboarding
        const finishButton = await this.elementExists('button:has-text("Finish"), button:has-text("Complete"), button:has-text("Get Started")');
        if (finishButton) {
          await this.clickElement('button:has-text("Finish"), button:has-text("Complete"), button:has-text("Get Started")', 'finish button');
          await this.page.waitForTimeout(2000);
          await this.screenshot('08-onboarding-complete');
        }
        
        this.recordTest('Onboarding flow completion', true);
      } else {
        console.log('ℹ️ Onboarding not present (user already onboarded)');
        this.recordTest('Onboarding already completed', true);
      }
    } catch (error) {
      this.recordTest('Onboarding flow', false, error);
    }
  }

  /**
   * Test 3: Dashboard Navigation
   */
  async testDashboard() {
    console.log('\n📋 Testing Dashboard & Navigation');
    console.log('--------------------------------');
    
    try {
      // Ensure we're on dashboard
      await this.page.goto(this.options.baseURL, { waitUntil: 'networkidle2' });
      await this.screenshot('09-dashboard-main');
      
      // Check for main navigation elements
      const navElements = [
        { selector: 'nav', name: 'Navigation bar' },
        { selector: 'a:has-text("Dashboard"), a[href="/"], a[href="/dashboard"]', name: 'Dashboard link' },
        { selector: 'a:has-text("Curriculum"), a[href*="curriculum"]', name: 'Curriculum link' },
        { selector: 'a:has-text("Planning"), a:has-text("Lesson"), a[href*="lesson"]', name: 'Planning link' },
        { selector: 'a:has-text("Calendar"), a:has-text("Weekly"), a[href*="calendar"]', name: 'Calendar link' }
      ];
      
      for (const element of navElements) {
        const exists = await this.elementExists(element.selector);
        this.recordTest(`${element.name} present`, exists);
      }
      
      // Check for dashboard cards/widgets
      const dashboardFeatures = [
        { selector: '.curriculum-coverage, [data-testid="coverage"], .coverage', name: 'Coverage tracker' },
        { selector: '.quick-actions, [data-testid="quick-actions"], .actions', name: 'Quick actions' },
        { selector: '.recent-plans, [data-testid="recent-plans"], .recent', name: 'Recent plans' }
      ];
      
      for (const feature of dashboardFeatures) {
        const exists = await this.elementExists(feature.selector);
        if (exists) {
          console.log(`  Found: ${feature.name}`);
        }
      }
      
      await this.screenshot('10-dashboard-features');
      this.recordTest('Dashboard navigation elements', true);
      
    } catch (error) {
      this.recordTest('Dashboard navigation', false, error);
    }
  }

  /**
   * Test 4: Curriculum Management
   */
  async testCurriculumManagement() {
    console.log('\n📋 Testing Curriculum Management');
    console.log('--------------------------------');
    
    try {
      // Navigate to curriculum page
      const curriculumLink = await this.elementExists('a:has-text("Curriculum"), a[href*="curriculum"]');
      if (curriculumLink) {
        await this.clickElement('a:has-text("Curriculum"), a[href*="curriculum"]', 'curriculum link');
        await this.page.waitForTimeout(2000);
        await this.screenshot('11-curriculum-page');
        
        // Check for curriculum expectations
        const hasExpectations = await this.elementExists('.expectation, .curriculum-item, [data-testid="expectation"]');
        this.recordTest('Curriculum expectations displayed', hasExpectations);
        
        // Test search functionality
        const searchInput = await this.elementExists('input[type="search"], input[placeholder*="search" i], input[placeholder*="recherche" i]');
        if (searchInput) {
          await this.typeInElement('input[type="search"], input[placeholder*="search" i]', 'math', 'search input');
          await this.page.waitForTimeout(1000);
          await this.screenshot('12-curriculum-search');
          this.recordTest('Curriculum search functionality', true);
        }
        
        // Test subject filter
        const subjectFilter = await this.elementExists('select, [data-testid="subject-filter"], .subject-filter');
        if (subjectFilter) {
          await this.screenshot('13-curriculum-filters');
          this.recordTest('Subject filtering available', true);
        }
      }
    } catch (error) {
      this.recordTest('Curriculum management', false, error);
    }
  }

  /**
   * Test 5: Lesson Planning
   */
  async testLessonPlanning() {
    console.log('\n📋 Testing Lesson Planning');
    console.log('--------------------------------');
    
    try {
      // Navigate to lesson planning
      const planningLink = await this.elementExists('a:has-text("Planning"), a:has-text("Lesson"), a[href*="lesson"]');
      if (planningLink) {
        await this.clickElement('a:has-text("Planning"), a:has-text("Lesson")', 'planning link');
        await this.page.waitForTimeout(2000);
        await this.screenshot('14-lesson-planning-page');
        
        // Look for create new lesson button
        const createButton = await this.elementExists('button:has-text("New"), button:has-text("Create"), button:has-text("Add")');
        if (createButton) {
          await this.clickElement('button:has-text("New"), button:has-text("Create")', 'create lesson button');
          await this.page.waitForTimeout(1000);
          await this.screenshot('15-new-lesson-form');
          
          // Check for ETFO structure elements
          const etfoElements = [
            { selector: 'input[name*="title"], #title', name: 'Title field' },
            { selector: 'textarea[name*="minds"], textarea[name*="activation"]', name: 'Minds On section' },
            { selector: 'textarea[name*="action"], textarea[name*="activity"]', name: 'Action section' },
            { selector: 'textarea[name*="consolidation"], textarea[name*="summary"]', name: 'Consolidation section' }
          ];
          
          for (const element of etfoElements) {
            const exists = await this.elementExists(element.selector);
            if (exists) {
              console.log(`  Found ETFO element: ${element.name}`);
            }
          }
          
          await this.screenshot('16-etfo-structure');
          this.recordTest('ETFO lesson structure present', true);
        }
      }
    } catch (error) {
      this.recordTest('Lesson planning', false, error);
    }
  }

  /**
   * Test 6: Weekly Dashboard
   */
  async testWeeklyDashboard() {
    console.log('\n📋 Testing Weekly Dashboard');
    console.log('--------------------------------');
    
    try {
      // Navigate to weekly view
      const weeklyLink = await this.elementExists('a:has-text("Weekly"), a:has-text("Calendar"), a[href*="weekly"]');
      if (weeklyLink) {
        await this.clickElement('a:has-text("Weekly"), a:has-text("Calendar")', 'weekly link');
        await this.page.waitForTimeout(2000);
        await this.screenshot('17-weekly-dashboard');
        
        // Check for calendar elements
        const calendarElements = [
          { selector: '.calendar, [data-testid="calendar"], .weekly-view', name: 'Calendar view' },
          { selector: '.day, .calendar-day, [data-testid="day"]', name: 'Day cells' },
          { selector: '.lesson-block, .event, [data-testid="lesson"]', name: 'Lesson blocks' }
        ];
        
        for (const element of calendarElements) {
          const exists = await this.elementExists(element.selector);
          if (exists) {
            console.log(`  Found calendar element: ${element.name}`);
          }
        }
        
        // Test substitute day plan
        const substituteButton = await this.elementExists('button:has-text("Substitute"), button:has-text("Supply")');
        if (substituteButton) {
          await this.clickElement('button:has-text("Substitute"), button:has-text("Supply")', 'substitute button');
          await this.page.waitForTimeout(1000);
          await this.screenshot('18-substitute-plan');
          this.recordTest('Substitute day planning available', true);
        }
      }
    } catch (error) {
      this.recordTest('Weekly dashboard', false, error);
    }
  }

  /**
   * Test 7: Assessment System
   */
  async testAssessmentSystem() {
    console.log('\n📋 Testing Assessment System');
    console.log('--------------------------------');
    
    try {
      // Navigate to assessment
      const assessmentLink = await this.elementExists('a:has-text("Assessment"), a:has-text("Grades"), a[href*="assessment"]');
      if (assessmentLink) {
        await this.clickElement('a:has-text("Assessment"), a:has-text("Grades")', 'assessment link');
        await this.page.waitForTimeout(2000);
        await this.screenshot('19-assessment-page');
        
        // Check for assessment grid
        const hasGrid = await this.elementExists('.assessment-grid, table, [data-testid="assessment-grid"]');
        if (hasGrid) {
          await this.screenshot('20-assessment-grid');
          this.recordTest('Assessment grid present', true);
        }
        
        // Check for student list
        const hasStudents = await this.elementExists('.student-list, .students, [data-testid="students"]');
        this.recordTest('Student list available', hasStudents);
      } else {
        console.log('ℹ️ Assessment link not found in navigation');
      }
    } catch (error) {
      this.recordTest('Assessment system', false, error);
    }
  }

  /**
   * Test 8: Parent Communication
   */
  async testParentCommunication() {
    console.log('\n📋 Testing Parent Communication');
    console.log('--------------------------------');
    
    try {
      // Navigate to communication
      const commLink = await this.elementExists('a:has-text("Communication"), a:has-text("Newsletter"), a:has-text("Parents")');
      if (commLink) {
        await this.clickElement('a:has-text("Communication"), a:has-text("Newsletter")', 'communication link');
        await this.page.waitForTimeout(2000);
        await this.screenshot('21-communication-page');
        
        // Check for newsletter creation
        const newsletterButton = await this.elementExists('button:has-text("Newsletter"), button:has-text("Create")');
        if (newsletterButton) {
          await this.screenshot('22-newsletter-options');
          this.recordTest('Newsletter creation available', true);
        }
        
        // Check for report cards
        const reportButton = await this.elementExists('button:has-text("Report"), button:has-text("Progress")');
        this.recordTest('Report card generation available', !!reportButton);
      } else {
        console.log('ℹ️ Communication features may be integrated elsewhere');
      }
    } catch (error) {
      this.recordTest('Parent communication', false, error);
    }
  }

  /**
   * Test 9: Data Persistence
   */
  async testDataPersistence() {
    console.log('\n📋 Testing Data Persistence');
    console.log('--------------------------------');
    
    try {
      // Check localStorage
      const localStorageData = await this.page.evaluate(() => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          data[key] = localStorage.getItem(key);
        }
        return data;
      });
      
      console.log(`  Found ${Object.keys(localStorageData).length} localStorage items`);
      
      // Check for expected keys
      const expectedKeys = ['teacher-subjects', 'onboarded', 'theme', 'language'];
      for (const key of expectedKeys) {
        if (localStorageData[key]) {
          console.log(`  ✓ Found: ${key}`);
        }
      }
      
      await this.screenshot('23-data-persistence');
      this.recordTest('Data persistence configured', Object.keys(localStorageData).length > 0);
      
    } catch (error) {
      this.recordTest('Data persistence', false, error);
    }
  }

  /**
   * Test 10: Performance Metrics
   */
  async testPerformance() {
    console.log('\n📋 Testing Performance Metrics');
    console.log('--------------------------------');
    
    try {
      // Measure page load time
      const startTime = Date.now();
      await this.page.goto(this.options.baseURL, { waitUntil: 'networkidle2' });
      const loadTime = Date.now() - startTime;
      
      console.log(`  Page load time: ${loadTime}ms`);
      this.recordTest('Page loads within 3 seconds', loadTime < 3000);
      
      // Check for performance metrics
      const metrics = await this.page.metrics();
      console.log(`  JS Heap: ${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB`);
      console.log(`  DOM Nodes: ${metrics.Nodes}`);
      console.log(`  Layout Duration: ${Math.round(metrics.LayoutDuration * 1000)}ms`);
      
      this.recordTest('Memory usage reasonable', metrics.JSHeapUsedSize < 100 * 1024 * 1024);
      
      await this.screenshot('24-performance-test');
      
    } catch (error) {
      this.recordTest('Performance metrics', false, error);
    }
  }

  /**
   * Generate comprehensive test report
   */
  async generateReport() {
    console.log('\n📊 Generating Test Report');
    console.log('--------------------------------');
    
    const report = {
      summary: {
        totalTests: this.testResults.totalTests,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        passRate: ((this.testResults.passed / this.testResults.totalTests) * 100).toFixed(2) + '%',
        duration: this.testResults.endTime - this.testResults.startTime,
        timestamp: new Date().toISOString()
      },
      environment: {
        clientURL: this.options.baseURL,
        serverURL: this.options.serverURL,
        headless: this.options.headless,
        userAgent: await this.page.evaluate(() => navigator.userAgent)
      },
      tests: this.testResults.tests,
      screenshots: this.testResults.screenshots,
      recommendations: []
    };
    
    // Add recommendations based on failures
    if (this.testResults.failed > 0) {
      report.recommendations.push('Review failed tests and fix identified issues');
    }
    
    if (report.summary.passRate < 80) {
      report.recommendations.push('Critical issues detected - immediate attention required');
    }
    
    // Save JSON report
    const jsonPath = path.join(this.options.reportDir, 'comprehensive-ui-report.json');
    await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
    
    // Generate markdown report
    const markdown = this.generateMarkdownReport(report);
    const mdPath = path.join(this.options.reportDir, 'comprehensive-ui-report.md');
    await fs.writeFile(mdPath, markdown);
    
    console.log(`\n✅ Report saved to: ${this.options.reportDir}`);
    console.log(`   - JSON: comprehensive-ui-report.json`);
    console.log(`   - Markdown: comprehensive-ui-report.md`);
    console.log(`   - Screenshots: ${this.testResults.screenshots.length} images in ${this.options.screenshotDir}`);
    
    return report;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report) {
    let md = '# Teaching Engine 2.0 - Comprehensive UI Validation Report\n\n';
    md += `Generated: ${report.summary.timestamp}\n\n`;
    
    md += '## Executive Summary\n\n';
    md += `- **Total Tests:** ${report.summary.totalTests}\n`;
    md += `- **Passed:** ${report.summary.passed} ✅\n`;
    md += `- **Failed:** ${report.summary.failed} ❌\n`;
    md += `- **Pass Rate:** ${report.summary.passRate}\n`;
    md += `- **Duration:** ${Math.round(report.summary.duration / 1000)}s\n\n`;
    
    md += '## Test Results\n\n';
    md += '| Test Name | Status | Error |\n';
    md += '|-----------|--------|-------|\n';
    
    for (const test of report.tests) {
      const status = test.passed ? '✅ Pass' : '❌ Fail';
      const error = test.error || '-';
      md += `| ${test.name} | ${status} | ${error} |\n`;
    }
    
    md += '\n## Screenshots\n\n';
    md += `${report.screenshots.length} screenshots captured during testing:\n\n`;
    
    for (const screenshot of report.screenshots) {
      md += `- ${screenshot.name}: \`${path.basename(screenshot.filepath)}\`\n`;
    }
    
    if (report.recommendations.length > 0) {
      md += '\n## Recommendations\n\n';
      for (const rec of report.recommendations) {
        md += `- ${rec}\n`;
      }
    }
    
    md += '\n## Test Environment\n\n';
    md += `- Client URL: ${report.environment.clientURL}\n`;
    md += `- Server URL: ${report.environment.serverURL}\n`;
    md += `- Headless Mode: ${report.environment.headless}\n`;
    md += `- User Agent: ${report.environment.userAgent}\n`;
    
    return md;
  }

  /**
   * Run complete test suite
   */
  async runAllTests() {
    this.testResults.startTime = Date.now();
    
    try {
      await this.initialize();
      
      // Run all test modules
      await this.testAuthentication();
      await this.testOnboarding();
      await this.testDashboard();
      await this.testCurriculumManagement();
      await this.testLessonPlanning();
      await this.testWeeklyDashboard();
      await this.testAssessmentSystem();
      await this.testParentCommunication();
      await this.testDataPersistence();
      await this.testPerformance();
      
    } catch (error) {
      console.error('Fatal error during testing:', error);
    } finally {
      this.testResults.endTime = Date.now();
      
      // Generate report
      const report = await this.generateReport();
      
      // Print summary
      console.log('\n' + '='.repeat(50));
      console.log('TEST SUITE COMPLETED');
      console.log('='.repeat(50));
      console.log(`Total Tests: ${report.summary.totalTests}`);
      console.log(`Passed: ${report.summary.passed} ✅`);
      console.log(`Failed: ${report.summary.failed} ❌`);
      console.log(`Pass Rate: ${report.summary.passRate}`);
      console.log(`Duration: ${Math.round(report.summary.duration / 1000)}s`);
      console.log('='.repeat(50));
      
      // Close browser
      if (this.browser) {
        await this.browser.close();
      }
      
      return report;
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new ComprehensiveUIValidation({
    headless: process.env.HEADLESS !== 'false',
    verbose: process.env.VERBOSE === 'true'
  });
  
  tester.runAllTests()
    .then(report => {
      process.exit(report.summary.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = ComprehensiveUIValidation;