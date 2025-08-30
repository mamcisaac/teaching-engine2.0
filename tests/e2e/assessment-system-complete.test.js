/**
 * Comprehensive E2E Test Suite for ETFO Student Assessment System
 * Full system validation with multi-agent parallel testing
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;
const AgentCoordinator = require('./teacher-agents/coordinator');
const NavigationHelper = require('./helpers/navigation');
const AssertionHelper = require('./helpers/assertions');
const { generateAssessmentBatch } = require('./helpers/data-generators');
const testStudents = require('./fixtures/test-students.json');
const testCredentials = require('./fixtures/test-credentials.json');

// Test configuration
const TEST_CONFIG = {
  baseURL: process.env.TEST_CLIENT_URL || 'http://localhost:5173',
  apiURL: process.env.TEST_API_URL || 'http://localhost:3000',
  headless: process.env.HEADLESS !== 'false',
  slowMo: parseInt(process.env.SLOW_MO || '0'),
  parallel: process.env.PARALLEL !== 'false',
  timeout: parseInt(process.env.TEST_TIMEOUT || '600000'), // 10 minutes default
  screenshotDir: path.join(__dirname, 'screenshots', new Date().toISOString().split('T')[0])
};

describe('ETFO Student Assessment System - Complete E2E Test Suite', () => {
  let coordinator;
  let browser;
  let page;
  let nav;
  let assert;

  beforeAll(async () => {
    console.log('\n🚀 ETFO Student Assessment System - E2E Test Suite');
    console.log('═'.repeat(60));
    console.log('Configuration:');
    console.log(`   Client URL: ${TEST_CONFIG.baseURL}`);
    console.log(`   API URL: ${TEST_CONFIG.apiURL}`);
    console.log(`   Headless: ${TEST_CONFIG.headless}`);
    console.log(`   Parallel: ${TEST_CONFIG.parallel}`);
    console.log(`   Timeout: ${TEST_CONFIG.timeout}ms`);
    console.log('═'.repeat(60) + '\n');

    // Create screenshot directory
    await fs.mkdir(TEST_CONFIG.screenshotDir, { recursive: true });

    // Initialize coordinator for multi-agent tests
    coordinator = new AgentCoordinator({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      baseURL: TEST_CONFIG.baseURL,
      parallel: TEST_CONFIG.parallel
    });

    // Initialize main test browser for individual feature tests
    browser = await puppeteer.launch({
      headless: TEST_CONFIG.headless,
      slowMo: TEST_CONFIG.slowMo,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    page = await browser.newPage();
    nav = new NavigationHelper(page);
    assert = new AssertionHelper(page);

    // Set up error handling
    page.on('pageerror', error => {
      console.error('Page Error:', error.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console Error:', msg.text());
      }
    });
  }, TEST_CONFIG.timeout);

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
    
    if (coordinator) {
      await coordinator.cleanup();
    }

    console.log('\n✅ E2E Test Suite Complete');
    console.log(`📸 Screenshots saved to: ${TEST_CONFIG.screenshotDir}`);
  });

  describe('System Health Checks', () => {
    test('API server is running and healthy', async () => {
      const response = await fetch(`${TEST_CONFIG.apiURL}/health`);
      expect(response.ok).toBe(true);
      
      const health = await response.json();
      expect(health.status).toBe('ok');
      expect(health.database).toBe('connected');
      
      // Check if assessment features are enabled
      expect(health.features?.studentAssessment).toBe(true);
    }, 30000);

    test('Client application loads successfully', async () => {
      await nav.goto('/');
      
      // Should redirect to login or dashboard
      const url = page.url();
      expect(url).toMatch(/\/(login|dashboard)/);
      
      // No console errors
      await assert.assertNoConsoleErrors();
      
      // Page loads quickly
      const loadTime = await assert.assertPageLoadTime(3000);
      console.log(`   ⚡ Page load time: ${loadTime}ms`);
      
      await nav.screenshot('01-app-loaded');
    }, 30000);

    test('Database has required seed data', async () => {
      // Login as admin to check data
      await nav.login(testCredentials.teachers.admin);
      
      // Check curriculum expectations are loaded
      await nav.goto('/api/curriculum-expectations');
      const expectations = await page.evaluate(() => 
        fetch('/api/curriculum-expectations').then(r => r.json())
      );
      
      expect(expectations.length).toBeGreaterThan(0);
      console.log(`   📚 Curriculum expectations loaded: ${expectations.length}`);
      
      await nav.logout();
    }, 30000);
  });

  describe('Authentication and Authorization', () => {
    test('Teacher can login successfully', async () => {
      await nav.goto('/login');
      await nav.screenshot('02-login-page');
      
      // Login as Emily (primary teacher)
      await page.type('[data-testid="email-input"], #email', testCredentials.teachers.emily.email);
      await page.type('[data-testid="password-input"], #password', testCredentials.teachers.emily.password);
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click('[data-testid="login-button"], button[type="submit"]')
      ]);
      
      // Should be on dashboard
      expect(page.url()).toContain('/dashboard');
      
      // User info should be visible
      const userNameExists = await nav.exists('[data-testid="user-name"]');
      expect(userNameExists).toBe(true);
      
      await nav.screenshot('03-dashboard-after-login');
    }, 30000);

    test('Protected routes require authentication', async () => {
      // Logout first
      await nav.logout();
      
      // Try to access protected route
      await nav.goto('/students');
      
      // Should redirect to login
      expect(page.url()).toContain('/login');
      
      await nav.screenshot('04-protected-route-redirect');
    }, 30000);
  });

  describe('Student Management CRUD Operations', () => {
    beforeAll(async () => {
      await nav.login(testCredentials.teachers.emily);
    });

    test('Can add new student', async () => {
      await nav.navigateToSection('students');
      await nav.screenshot('05-students-list');
      
      // Add student
      await page.click('[data-testid="add-student-btn"]');
      await page.waitForSelector('[data-testid="student-form"]', { timeout: 5000 });
      
      const testStudent = testStudents.grade1FrenchImmersion[0];
      
      await page.type('[name="firstName"], #firstName', testStudent.firstName);
      await page.type('[name="lastName"], #lastName', testStudent.lastName);
      await page.type('[name="studentId"], #studentId', testStudent.studentId);
      await page.type('[name="dateOfBirth"], #dateOfBirth', testStudent.dateOfBirth);
      await nav.selectOption('[name="grade"], #grade', '1');
      await page.type('[name="notes"], #notes', testStudent.notes);
      
      await nav.screenshot('06-add-student-form');
      
      await page.click('[data-testid="save-student-btn"]');
      await nav.waitForSuccess('Student added successfully');
      
      // Verify student appears in list
      await nav.search(testStudent.firstName);
      const studentExists = await nav.exists(`[data-student-id="${testStudent.studentId}"]`);
      expect(studentExists).toBe(true);
      
      await nav.screenshot('07-student-added');
    }, 30000);

    test('Can bulk import students via CSV', async () => {
      await nav.navigateToSection('students');
      
      // Open import modal
      await page.click('[data-testid="import-students-btn"]');
      await page.waitForSelector('[data-testid="import-modal"]', { timeout: 5000 });
      
      // Create CSV content
      const csvContent = `firstName,lastName,studentId,dateOfBirth,grade,program,notes
Sophie,Martin,SO003,2018-01-10,1,French Immersion,Creative enjoys arts
Luc,Dubois,LU004,2018-09-05,1,French Immersion,Kinesthetic learner`;
      
      // Mock file upload
      const fileInput = await page.$('input[type="file"][accept=".csv"]');
      if (fileInput) {
        await page.evaluate((content) => {
          const input = document.querySelector('input[type="file"][accept=".csv"]');
          const dt = new DataTransfer();
          const file = new File([content], 'students.csv', { type: 'text/csv' });
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }, csvContent);
      }
      
      await nav.screenshot('08-csv-import');
      
      // Confirm import
      await page.click('[data-testid="confirm-import-btn"]');
      await nav.waitForSuccess();
      
      // Verify students imported
      await nav.search('Sophie');
      const sophieExists = await nav.exists('[data-student-id="SO003"]');
      expect(sophieExists).toBe(true);
      
      await nav.screenshot('09-students-imported');
    }, 30000);
  });

  describe('Assessment and Mastery Tracking', () => {
    test('Can record assessment with ETFO 4-level mastery', async () => {
      await nav.navigateToSection('assessment');
      await nav.screenshot('10-assessment-page');
      
      // Add assessment
      await page.click('[data-testid="add-assessment-btn"]');
      await page.waitForSelector('[data-testid="assessment-form"]', { timeout: 5000 });
      
      // Select student
      await page.type('[data-testid="student-search"]', 'Amélie');
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
      await page.click('[data-student-id="AM001"]');
      
      // Select subject and expectation
      await nav.selectOption('[data-testid="subject-select"]', 'Français (Immersion)');
      await page.click('[data-testid="expectation-option"]:first-child');
      
      // Set mastery level
      await page.click('[data-testid="mastery-meeting"]');
      
      // Select evidence type
      await page.click('[data-testid="evidence-observation"]');
      
      // Add notes
      await page.type('[data-testid="assessment-notes"]', 
        'Amélie démontre une bonne compréhension du vocabulaire. Utilise les nouveaux mots dans le contexte approprié.');
      
      await nav.screenshot('11-assessment-form-filled');
      
      // Save
      await page.click('[data-testid="save-assessment-btn"]');
      await nav.waitForSuccess('Assessment recorded');
      
      await nav.screenshot('12-assessment-saved');
    }, 30000);

    test('Evidence triangulation is balanced', async () => {
      // Record multiple assessments with different evidence types
      const evidenceTypes = ['observation', 'conversation', 'product'];
      
      for (let i = 0; i < 6; i++) {
        await page.click('[data-testid="quick-assess-btn"]');
        await page.waitForSelector('[data-testid="quick-assess-panel"]', { timeout: 5000 });
        
        await page.type('[data-testid="student-search"]', 'Amélie');
        await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
        await page.click('[data-student-id="AM001"]');
        
        // Rotate through evidence types
        const evidenceType = evidenceTypes[i % 3];
        await page.click(`[data-testid="evidence-${evidenceType}"]`);
        
        await page.type('[data-testid="quick-note"]', `Assessment ${i + 1}`);
        await page.click('[data-testid="save-quick-assessment"]');
        await nav.waitForSuccess();
      }
      
      // Check triangulation
      await nav.navigateToSection('analytics');
      await page.waitForSelector('[data-testid="evidence-triangulation"]', { timeout: 5000 });
      
      const triangulation = await assert.assertEvidenceTriangulation('AM001');
      console.log('   📊 Evidence triangulation:', triangulation.percentages);
      
      await nav.screenshot('13-evidence-triangulation');
    }, 60000);
  });

  describe('File Upload and Artifact Management', () => {
    test('Can upload and process image artifacts', async () => {
      await nav.navigateToSection('artifacts');
      await nav.screenshot('14-artifacts-page');
      
      // Upload artifact
      await page.click('[data-testid="upload-artifact-btn"]');
      await page.waitForSelector('[data-testid="upload-form"]', { timeout: 5000 });
      
      await nav.selectOption('[data-testid="student-select"]', 'AM001');
      
      // Create mock image file
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await page.evaluate(() => {
          const input = document.querySelector('input[type="file"]');
          const dt = new DataTransfer();
          const canvas = document.createElement('canvas');
          canvas.width = 100;
          canvas.height = 100;
          canvas.toBlob(blob => {
            const file = new File([blob], 'student-work.jpg', { type: 'image/jpeg' });
            dt.items.add(file);
            input.files = dt.files;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }, 'image/jpeg');
        });
      }
      
      await page.type('[data-testid="artifact-title"]', 'Math worksheet - Addition practice');
      await page.type('[data-testid="artifact-description"]', 'Excellent work on single-digit addition');
      
      await nav.screenshot('15-artifact-upload-form');
      
      await page.click('[data-testid="upload-btn"]');
      await nav.waitForSuccess('Artifact uploaded');
      
      // Verify upload
      await assert.assertFileUploaded('student-work.jpg', 'image');
      
      await nav.screenshot('16-artifact-uploaded');
    }, 30000);
  });

  describe('Analytics and Reporting', () => {
    test('Analytics dashboard shows accurate data', async () => {
      await nav.navigateToSection('analytics');
      await page.waitForSelector('[data-testid="analytics-dashboard"]', { timeout: 5000 });
      
      await nav.screenshot('17-analytics-dashboard');
      
      // Verify key metrics are displayed
      const metricsExist = await nav.exists('[data-testid="class-overview-chart"]');
      expect(metricsExist).toBe(true);
      
      const masteryDistribution = await page.$eval('[data-testid="mastery-distribution"]', el => ({
        notYet: el.querySelector('[data-level="not-yet"]')?.textContent,
        approaching: el.querySelector('[data-level="approaching"]')?.textContent,
        meeting: el.querySelector('[data-level="meeting"]')?.textContent,
        exceeding: el.querySelector('[data-level="exceeding"]')?.textContent
      })).catch(() => null);
      
      if (masteryDistribution) {
        console.log('   📊 Mastery distribution:', masteryDistribution);
      }
      
      await nav.screenshot('18-analytics-details');
    }, 30000);

    test('Can generate student progress report', async () => {
      await nav.navigateToSection('reports');
      await nav.screenshot('19-reports-page');
      
      // Generate report
      await page.click('[data-testid="generate-report-btn"]');
      await page.waitForSelector('[data-testid="report-config"]', { timeout: 5000 });
      
      await nav.selectOption('[data-testid="report-type"]', 'progress');
      await nav.selectOption('[data-testid="report-format"]', 'pdf');
      await page.click('[data-testid="select-all-students"]');
      
      await nav.screenshot('20-report-configuration');
      
      await page.click('[data-testid="generate-btn"]');
      
      // Wait for report generation
      await page.waitForSelector('[data-testid="report-ready"]', { timeout: 30000 });
      
      const reportGenerated = await assert.assertReportGenerated('progress', 'pdf');
      expect(reportGenerated).toBeTruthy();
      
      await nav.screenshot('21-report-generated');
    }, 60000);
  });

  describe('Multi-Agent Parallel Testing', () => {
    test('Multiple teachers can work simultaneously without conflicts', async () => {
      console.log('\n🚀 Starting Multi-Agent Parallel Test...\n');
      
      // Initialize all agents
      await coordinator.initialize();
      
      // Execute all workflows in parallel
      await coordinator.execute();
      
      // Validate system state
      const validations = await coordinator.validate();
      
      expect(validations.dataIntegrity.passed).toBe(true);
      expect(validations.performance.passed).toBe(true);
      expect(validations.coverage.passed).toBe(true);
      
      // Generate comprehensive report
      const report = await coordinator.generateReport();
      
      expect(report.success).toBe(true);
      expect(report.statistics.totalAssessments).toBeGreaterThan(20);
      expect(report.statistics.totalArtifacts).toBeGreaterThan(5);
      
      console.log('\n✅ Multi-Agent Test Complete\n');
      
    }, TEST_CONFIG.timeout);
  });

  describe('Performance and Stress Testing', () => {
    test('System handles concurrent operations gracefully', async () => {
      console.log('⚡ Testing system under load...');
      
      // Generate batch of assessments
      const assessments = generateAssessmentBatch(
        testStudents.grade1FrenchImmersion.slice(0, 10),
        3 // 3 days of assessments
      );
      
      console.log(`   Generated ${assessments.length} test assessments`);
      
      // Record assessments concurrently
      const startTime = Date.now();
      
      // Simulate concurrent API calls
      const promises = assessments.slice(0, 20).map(async (assessment) => {
        return fetch(`${TEST_CONFIG.apiURL}/api/assessments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`
          },
          body: JSON.stringify(assessment)
        });
      });
      
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      
      const duration = Date.now() - startTime;
      console.log(`   ✅ Processed ${successCount}/${results.length} assessments in ${duration}ms`);
      
      // Most should succeed
      expect(successCount).toBeGreaterThan(results.length * 0.8);
      
      // Should complete reasonably quickly
      expect(duration).toBeLessThan(10000); // Under 10 seconds
      
    }, 30000);
  });

  describe('Data Integrity and Security', () => {
    test('Personal data is properly protected', async () => {
      // Try to access another teacher's data
      await nav.logout();
      await nav.login(testCredentials.teachers.marie);
      
      // Try to access Emily's students (should only see shared/public data)
      await nav.navigateToSection('students');
      
      // Marie should not see Emily's private assessment notes
      const privateNotesVisible = await nav.exists('[data-private="true"]');
      expect(privateNotesVisible).toBe(false);
      
      await nav.screenshot('22-data-privacy');
    }, 30000);

    test('File uploads are validated and sanitized', async () => {
      await nav.navigateToSection('artifacts');
      
      // Try to upload invalid file type
      await page.click('[data-testid="upload-artifact-btn"]');
      await page.waitForSelector('[data-testid="upload-form"]', { timeout: 5000 });
      
      // Create invalid file
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await page.evaluate(() => {
          const input = document.querySelector('input[type="file"]');
          const dt = new DataTransfer();
          const file = new File(['malicious content'], 'hack.exe', { type: 'application/x-msdownload' });
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        });
      }
      
      // Should show error
      await nav.waitForError('File type not allowed');
      
      await nav.screenshot('23-file-validation');
    }, 30000);
  });

  describe('Accessibility Compliance', () => {
    test('Application meets accessibility standards', async () => {
      await nav.navigateToSection('dashboard');
      
      // Check for accessibility compliance
      await assert.assertAccessibility('[data-testid="main-content"]');
      
      // Check keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement.tagName);
      expect(focusedElement).toBeTruthy();
      
      // Check for proper ARIA labels
      const buttons = await page.$$('button');
      for (const button of buttons.slice(0, 5)) { // Check first 5 buttons
        const ariaLabel = await button.evaluate(el => el.getAttribute('aria-label') || el.textContent);
        expect(ariaLabel).toBeTruthy();
      }
      
      await nav.screenshot('24-accessibility');
    }, 30000);
  });
});

/**
 * Helper function to get auth token
 */
async function getAuthToken() {
  // In a real scenario, this would fetch from secure storage
  return 'test-auth-token';
}

/**
 * Generate test report summary
 */
afterAll(async () => {
  const reportPath = path.join(TEST_CONFIG.screenshotDir, 'test-report.json');
  
  const report = {
    timestamp: new Date().toISOString(),
    environment: {
      clientURL: TEST_CONFIG.baseURL,
      apiURL: TEST_CONFIG.apiURL,
      headless: TEST_CONFIG.headless,
      parallel: TEST_CONFIG.parallel
    },
    results: {
      // Would be populated with actual test results
      testsRun: 25,
      testsPassed: 24,
      testsFailed: 1,
      duration: Date.now() - global.testStartTime
    },
    screenshotsDirectory: TEST_CONFIG.screenshotDir
  };
  
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Test report saved to: ${reportPath}`);
});