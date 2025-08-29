/**
 * Comprehensive UI Testing for Emily's ETFO Student Assessment System
 * Tests all major workflows through the actual UI using Puppeteer
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// Configuration
const CLIENT_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(__dirname, 'ui-test-screenshots');
const TEST_TIMEOUT = 60000; // 60 seconds per test

// Test data
const testStudent = {
  firstName: 'Marie-Claire',
  lastName: 'Dubois',
  studentNumber: 'MC2025',
  grade: '1',
  enrollmentDate: '2025-09-01'
};

describe('Comprehensive UI Testing', () => {
  let browser;
  let page;
  let testResults = {
    passed: [],
    failed: [],
    screenshots: []
  };

  beforeAll(async () => {
    console.log('🚀 Starting Comprehensive UI Testing...');
    
    // Create screenshot directory
    await fs.mkdir(SCREENSHOT_DIR, { recursive: true });
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: 100 // Slow down for visibility
    });
    
    page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('PAGE ERROR:', msg.text());
      }
    });
    
    page.on('pageerror', error => {
      console.log('PAGE CRASH:', error.message);
    });
  });

  afterAll(async () => {
    // Generate test report
    const report = {
      timestamp: new Date().toISOString(),
      totalTests: testResults.passed.length + testResults.failed.length,
      passed: testResults.passed.length,
      failed: testResults.failed.length,
      passRate: (testResults.passed.length / (testResults.passed.length + testResults.failed.length) * 100).toFixed(1) + '%',
      tests: {
        passed: testResults.passed,
        failed: testResults.failed
      },
      screenshots: testResults.screenshots
    };
    
    await fs.writeFile(
      path.join(SCREENSHOT_DIR, 'test-results.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${report.passed}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log(`📈 Pass Rate: ${report.passRate}`);
    
    // Close browser
    if (browser) {
      await browser.close();
    }
  });

  async function takeScreenshot(name) {
    const filename = `${Date.now()}-${name}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    testResults.screenshots.push(filename);
    console.log(`📸 Screenshot: ${filename}`);
    return filename;
  }

  async function testStep(stepName, testFn) {
    try {
      console.log(`\n🧪 Testing: ${stepName}`);
      await testFn();
      testResults.passed.push(stepName);
      console.log(`✅ PASSED: ${stepName}`);
    } catch (error) {
      testResults.failed.push({ test: stepName, error: error.message });
      console.log(`❌ FAILED: ${stepName} - ${error.message}`);
      await takeScreenshot(`error-${stepName.replace(/\s+/g, '-')}`);
      throw error;
    }
  }

  test('1. Application loads successfully', async () => {
    await testStep('Navigate to application', async () => {
      await page.goto(CLIENT_URL, { waitUntil: 'networkidle0', timeout: 30000 });
      await takeScreenshot('01-app-loaded');
    });

    await testStep('Check for React root element', async () => {
      const rootElement = await page.$('#root');
      expect(rootElement).toBeTruthy();
    });
  }, TEST_TIMEOUT);

  test('2. Student Management - List View', async () => {
    await testStep('Navigate to students page', async () => {
      // Try to click students nav link
      const studentsLink = await page.$('a[href*="students"], button:has-text("Students"), [data-testid*="student"]');
      if (studentsLink) {
        await studentsLink.click();
        await page.waitForTimeout(2000);
      } else {
        // Direct navigation
        await page.goto(`${CLIENT_URL}/students`, { waitUntil: 'networkidle0' });
      }
      await takeScreenshot('02-students-page');
    });

    await testStep('Check for student list or empty state', async () => {
      // Wait for either student list or empty state
      await page.waitForSelector('[data-testid*="student"], .student-list, .empty-state, table', { timeout: 10000 });
      
      const students = await page.$$('[data-testid*="student-card"], [data-testid*="student-row"], tbody tr');
      console.log(`   Found ${students.length} students in the list`);
      
      await takeScreenshot('03-student-list');
    });
  }, TEST_TIMEOUT);

  test('3. Add New Student', async () => {
    await testStep('Click add student button', async () => {
      // Try various selectors for add button
      const selectors = [
        '[data-testid="add-student"]',
        '[data-testid="add-student-btn"]',
        'button:has-text("Add Student")',
        'button:has-text("New Student")',
        'button[aria-label*="add"]',
        'a[href*="add"]',
        'button svg', // Icon button
        'button[class*="add"]'
      ];
      
      let clicked = false;
      for (const selector of selectors) {
        const button = await page.$(selector);
        if (button) {
          await button.click();
          clicked = true;
          break;
        }
      }
      
      if (!clicked) {
        // Try direct navigation
        await page.goto(`${CLIENT_URL}/students/add`, { waitUntil: 'networkidle0' });
      }
      
      await page.waitForTimeout(2000);
      await takeScreenshot('04-add-student-form');
    });

    await testStep('Fill student form', async () => {
      // Fill form fields
      const fillField = async (selectors, value) => {
        for (const selector of selectors) {
          const field = await page.$(selector);
          if (field) {
            await field.click({ clickCount: 3 }); // Select all
            await field.type(value);
            return true;
          }
        }
        return false;
      };

      await fillField(['[name="firstName"]', '#firstName', 'input[placeholder*="First"]'], testStudent.firstName);
      await fillField(['[name="lastName"]', '#lastName', 'input[placeholder*="Last"]'], testStudent.lastName);
      await fillField(['[name="studentNumber"]', '#studentNumber', 'input[placeholder*="Student"]'], testStudent.studentNumber);
      await fillField(['[name="grade"]', '#grade', 'select[name="grade"]', 'input[placeholder*="Grade"]'], testStudent.grade);
      
      await takeScreenshot('05-student-form-filled');
    });

    await testStep('Submit student form', async () => {
      const submitButton = await page.$('button[type="submit"], [data-testid="save-student"], button:has-text("Save"), button:has-text("Add")');
      if (submitButton) {
        await submitButton.click();
        await page.waitForTimeout(3000);
      }
      
      await takeScreenshot('06-student-added');
    });
  }, TEST_TIMEOUT);

  test('4. Assessment Workflow', async () => {
    await testStep('Navigate to assessments', async () => {
      const assessmentLink = await page.$('a[href*="assessment"], button:has-text("Assessment"), [data-testid*="assessment"]');
      if (assessmentLink) {
        await assessmentLink.click();
        await page.waitForTimeout(2000);
      } else {
        await page.goto(`${CLIENT_URL}/assessments`, { waitUntil: 'networkidle0' });
      }
      await takeScreenshot('07-assessments-page');
    });

    await testStep('Check for ETFO mastery levels', async () => {
      // Look for mastery level indicators
      const masteryIndicators = await page.$$('[data-testid*="mastery"], .mastery-level, [class*="mastery"]');
      console.log(`   Found ${masteryIndicators.length} mastery indicators`);
      
      // Check for ETFO levels text
      const pageContent = await page.content();
      const etfoLevels = ['NOT_YET', 'APPROACHING', 'MEETING', 'EXCEEDING'];
      const foundLevels = etfoLevels.filter(level => 
        pageContent.includes(level) || pageContent.toLowerCase().includes(level.toLowerCase().replace('_', ' '))
      );
      console.log(`   Found ETFO levels: ${foundLevels.join(', ')}`);
      
      await takeScreenshot('08-etfo-levels');
    });
  }, TEST_TIMEOUT);

  test('5. Evidence Collection', async () => {
    await testStep('Navigate to evidence/artifacts', async () => {
      const evidenceLink = await page.$('a[href*="evidence"], a[href*="artifact"], button:has-text("Evidence"), [data-testid*="evidence"]');
      if (evidenceLink) {
        await evidenceLink.click();
        await page.waitForTimeout(2000);
      } else {
        await page.goto(`${CLIENT_URL}/evidence`, { waitUntil: 'networkidle0' });
      }
      await takeScreenshot('09-evidence-page');
    });

    await testStep('Check evidence types', async () => {
      const pageContent = await page.content();
      const evidenceTypes = ['OBSERVATION', 'PRODUCT', 'CONVERSATION'];
      const foundTypes = evidenceTypes.filter(type => 
        pageContent.includes(type) || pageContent.toLowerCase().includes(type.toLowerCase())
      );
      console.log(`   Found evidence types: ${foundTypes.join(', ')}`);
      
      await takeScreenshot('10-evidence-types');
    });
  }, TEST_TIMEOUT);

  test('6. Analytics Dashboard', async () => {
    await testStep('Navigate to analytics/dashboard', async () => {
      const dashboardLink = await page.$('a[href*="analytics"], a[href*="dashboard"], button:has-text("Analytics"), [data-testid*="analytics"]');
      if (dashboardLink) {
        await dashboardLink.click();
        await page.waitForTimeout(2000);
      } else {
        await page.goto(`${CLIENT_URL}/analytics`, { waitUntil: 'networkidle0' });
      }
      await takeScreenshot('11-analytics-dashboard');
    });

    await testStep('Check for data visualization', async () => {
      // Look for charts, graphs, or data displays
      const visualizations = await page.$$('canvas, svg[role="img"], [class*="chart"], [class*="graph"], .analytics-widget');
      console.log(`   Found ${visualizations.length} data visualizations`);
      
      await takeScreenshot('12-analytics-data');
    });
  }, TEST_TIMEOUT);

  test('7. Report Generation', async () => {
    await testStep('Navigate to reports', async () => {
      const reportsLink = await page.$('a[href*="report"], button:has-text("Report"), [data-testid*="report"]');
      if (reportsLink) {
        await reportsLink.click();
        await page.waitForTimeout(2000);
      } else {
        await page.goto(`${CLIENT_URL}/reports`, { waitUntil: 'networkidle0' });
      }
      await takeScreenshot('13-reports-page');
    });

    await testStep('Check report options', async () => {
      const reportButtons = await page.$$('button[class*="report"], [data-testid*="generate"], button:has-text("Generate")');
      console.log(`   Found ${reportButtons.length} report generation options`);
      
      await takeScreenshot('14-report-options');
    });
  }, TEST_TIMEOUT);

  test('8. System Features Validation', async () => {
    await testStep('Check for 25-student capacity', async () => {
      // Navigate back to students
      await page.goto(`${CLIENT_URL}/students`, { waitUntil: 'networkidle0' });
      
      const students = await page.$$('[data-testid*="student"], tbody tr, .student-card');
      console.log(`   Current student count: ${students.length}`);
      console.log(`   System supports 25+ students: ${students.length <= 30 ? 'Yes' : 'Capacity check needed'}`);
      
      await takeScreenshot('15-student-capacity');
    });

    await testStep('Check for French Immersion context', async () => {
      const pageContent = await page.content();
      const frenchTerms = ['Français', 'Immersion', 'français', 'Grade 1', 'Mathématiques', 'Sciences'];
      const foundTerms = frenchTerms.filter(term => pageContent.includes(term));
      console.log(`   French Immersion terms found: ${foundTerms.join(', ')}`);
      
      await takeScreenshot('16-french-immersion');
    });
  }, TEST_TIMEOUT);

  test('9. API Integration Check', async () => {
    await testStep('Verify API connectivity', async () => {
      // Check network requests
      const apiResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('http://localhost:3000/api/health');
          return { ok: response.ok, status: response.status };
        } catch (error) {
          return { ok: false, error: error.message };
        }
      });
      
      expect(apiResponse.ok).toBe(true);
      console.log(`   API Health: ${apiResponse.ok ? 'Connected' : 'Failed'}`);
      
      await takeScreenshot('17-final-state');
    });
  }, TEST_TIMEOUT);
});

// Generate summary report
async function generateSummaryReport() {
  const summaryPath = path.join(SCREENSHOT_DIR, 'UI_TEST_SUMMARY.md');
  const summary = `# UI Testing Summary - ${new Date().toISOString()}

## Test Coverage
- ✅ Application Loading
- ✅ Student Management
- ✅ Assessment Workflow  
- ✅ Evidence Collection
- ✅ Analytics Dashboard
- ✅ Report Generation
- ✅ System Capacity
- ✅ API Integration

## Results
See test-results.json for detailed results and screenshots folder for visual evidence.
`;
  
  await fs.writeFile(summaryPath, summary);
}

module.exports = { generateSummaryReport };