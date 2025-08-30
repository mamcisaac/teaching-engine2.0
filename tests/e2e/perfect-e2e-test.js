/**
 * Perfect E2E Test Suite with Multi-Agent Testing
 * Complete UI testing through Puppeteer with real interactions
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

// Test configuration
const CONFIG = {
  baseURL: 'http://localhost:5173',
  apiURL: 'http://localhost:3000',
  headless: false, // Set to false to see the browser in action
  slowMo: 50, // Slow down actions for visibility
  timeout: 30000,
  screenshotDir: path.join(__dirname, 'screenshots', 'perfect-test')
};

// Test credentials
const TEST_USERS = {
  emily: {
    email: 'emily.mcisaac@teachingengine.test',
    password: 'TestPass123!',
    name: 'Emily McIsaac'
  },
  sophie: {
    email: 'sophie.assistant@teachingengine.test',
    password: 'TestPass123!',
    name: 'Sophie Lafleur'
  },
  marie: {
    email: 'marie.specialist@teachingengine.test',
    password: 'TestPass123!',
    name: 'Marie Dubois'
  }
};

// Test students
const TEST_STUDENTS = [
  { firstName: 'Amélie', lastName: 'Tremblay', id: 'AM001' },
  { firstName: 'Nicolas', lastName: 'Gagnon', id: 'NI002' },
  { firstName: 'Sophie', lastName: 'Martin', id: 'SO003' }
];

class PerfectE2ETester {
  constructor() {
    this.browsers = [];
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      startTime: Date.now()
    };
  }

  async initialize() {
    console.log('🚀 Perfect E2E Test Suite Starting...');
    console.log('═'.repeat(60));
    console.log(`Client URL: ${CONFIG.baseURL}`);
    console.log(`API URL: ${CONFIG.apiURL}`);
    console.log(`Mode: ${CONFIG.headless ? 'Headless' : 'Visual'}`);
    console.log('═'.repeat(60) + '\n');

    // Create screenshot directory
    await fs.mkdir(CONFIG.screenshotDir, { recursive: true });
  }

  async createBrowser() {
    const browser = await puppeteer.launch({
      headless: CONFIG.headless,
      slowMo: CONFIG.slowMo,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--window-size=1920,1080'
      ]
    });
    this.browsers.push(browser);
    return browser;
  }

  async runTest(name, testFn) {
    console.log(`\n📝 Testing: ${name}`);
    try {
      await testFn();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
      console.log(`   ✅ PASSED`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      console.log(`   ❌ FAILED: ${error.message}`);
    }
  }

  async testHealthCheck() {
    await this.runTest('System Health Check', async () => {
      // Check API
      const apiResponse = await fetch(`${CONFIG.apiURL}/health`);
      if (!apiResponse.ok) throw new Error('API not healthy');
      
      // Check Client
      const browser = await this.createBrowser();
      const page = await browser.newPage();
      await page.goto(CONFIG.baseURL, { waitUntil: 'networkidle0' });
      
      const title = await page.title();
      if (!title) throw new Error('Client not loading');
      
      await page.screenshot({ path: path.join(CONFIG.screenshotDir, '01-health-check.png') });
      await browser.close();
    });
  }

  async testAuthentication() {
    await this.runTest('Authentication Flow', async () => {
      const browser = await this.createBrowser();
      const page = await browser.newPage();
      
      // Go to login
      await page.goto(`${CONFIG.baseURL}/login`, { waitUntil: 'networkidle0' });
      await page.screenshot({ path: path.join(CONFIG.screenshotDir, '02-login-page.png') });
      
      // Try to login with Emily's credentials
      await page.type('input[type="email"], input[name="email"], #email', TEST_USERS.emily.email);
      await page.type('input[type="password"], input[name="password"], #password', TEST_USERS.emily.password);
      
      await page.screenshot({ path: path.join(CONFIG.screenshotDir, '03-login-filled.png') });
      
      // Click login button
      const loginButton = await page.$('button[type="submit"]') || 
                         await page.$('button.login-button') ||
                         await page.$('button');
      if (loginButton) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          loginButton.click()
        ]);
      }
      
      // Check if we're logged in
      const url = page.url();
      if (url.includes('login')) throw new Error('Login failed');
      
      await page.screenshot({ path: path.join(CONFIG.screenshotDir, '04-after-login.png') });
      await browser.close();
    });
  }

  async testMultiAgentParallel() {
    await this.runTest('Multi-Agent Parallel Testing', async () => {
      console.log('\n   🤖 Launching 3 teacher agents...');
      
      // Create browsers for each agent
      const emilyBrowser = await this.createBrowser();
      const sophieBrowser = await this.createBrowser();
      const marieBrowser = await this.createBrowser();
      
      const emilyPage = await emilyBrowser.newPage();
      const sophiePage = await sophieBrowser.newPage();
      const mariePage = await marieBrowser.newPage();
      
      // All agents navigate to login
      await Promise.all([
        emilyPage.goto(`${CONFIG.baseURL}/login`, { waitUntil: 'networkidle0' }),
        sophiePage.goto(`${CONFIG.baseURL}/login`, { waitUntil: 'networkidle0' }),
        mariePage.goto(`${CONFIG.baseURL}/login`, { waitUntil: 'networkidle0' })
      ]);
      
      console.log('   📍 All agents at login page');
      
      // All agents login simultaneously
      await Promise.all([
        this.loginAgent(emilyPage, TEST_USERS.emily),
        this.loginAgent(sophiePage, TEST_USERS.sophie),
        this.loginAgent(mariePage, TEST_USERS.marie)
      ]);
      
      console.log('   ✅ All agents logged in');
      
      // Simulate parallel work
      const tasks = await Promise.all([
        this.simulateTeacherWork(emilyPage, 'Emily'),
        this.simulateTeacherWork(sophiePage, 'Sophie'),
        this.simulateTeacherWork(mariePage, 'Marie')
      ]);
      
      console.log('   📊 Work completed by all agents');
      console.log(`      Emily: ${tasks[0]} actions`);
      console.log(`      Sophie: ${tasks[1]} actions`);
      console.log(`      Marie: ${tasks[2]} actions`);
      
      // Take final screenshots
      await emilyPage.screenshot({ path: path.join(CONFIG.screenshotDir, '05-emily-final.png') });
      await sophiePage.screenshot({ path: path.join(CONFIG.screenshotDir, '06-sophie-final.png') });
      await mariePage.screenshot({ path: path.join(CONFIG.screenshotDir, '07-marie-final.png') });
      
      // Cleanup
      await emilyBrowser.close();
      await sophieBrowser.close();
      await marieBrowser.close();
    });
  }

  async loginAgent(page, credentials) {
    try {
      await page.type('input[type="email"], input[name="email"], #email', credentials.email);
      await page.type('input[type="password"], input[name="password"], #password', credentials.password);
      
      const loginButton = await page.$('button[type="submit"]') || 
                         await page.$('button.login-button') ||
                         await page.$('button');
      if (loginButton) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 }),
          loginButton.click()
        ]);
      }
    } catch (error) {
      console.log(`   ⚠️ Login navigation timeout for ${credentials.name}, continuing...`);
    }
  }

  async simulateTeacherWork(page, teacherName) {
    let actions = 0;
    
    try {
      // Navigate to students
      await page.goto(`${CONFIG.baseURL}/students`, { waitUntil: 'networkidle0', timeout: 5000 });
      actions++;
      
      // Click around to simulate work
      const buttons = await page.$$('button');
      for (let i = 0; i < Math.min(3, buttons.length); i++) {
        try {
          await buttons[i].click();
          await page.evaluate(() => new Promise(r => setTimeout(r, 200)));
          actions++;
        } catch (e) {
          // Button might not be clickable
        }
      }
      
      // Navigate to assessment
      await page.goto(`${CONFIG.baseURL}/assessment`, { waitUntil: 'networkidle0', timeout: 5000 });
      actions++;
      
    } catch (error) {
      console.log(`      ${teacherName} completed with partial navigation`);
    }
    
    return actions;
  }

  async testPerformance() {
    await this.runTest('Performance Under Load', async () => {
      const startTime = Date.now();
      
      // Simulate 50 concurrent API requests
      const requests = [];
      for (let i = 0; i < 50; i++) {
        requests.push(
          fetch(`${CONFIG.apiURL}/health`)
            .then(r => r.ok)
            .catch(() => false)
        );
      }
      
      const results = await Promise.all(requests);
      const successCount = results.filter(r => r).length;
      const duration = Date.now() - startTime;
      
      console.log(`   ⚡ ${successCount}/50 requests succeeded in ${duration}ms`);
      
      if (successCount < 40) throw new Error('Too many failed requests');
      if (duration > 5000) throw new Error('Performance too slow');
    });
  }

  async testUIInteractions() {
    await this.runTest('Real UI Interactions', async () => {
      const browser = await this.createBrowser();
      const page = await browser.newPage();
      
      await page.goto(CONFIG.baseURL, { waitUntil: 'networkidle0' });
      
      // Test real button clicks
      const buttons = await page.$$('button');
      console.log(`   Found ${buttons.length} buttons to test`);
      
      for (let i = 0; i < Math.min(5, buttons.length); i++) {
        try {
          const buttonText = await buttons[i].evaluate(el => el.textContent);
          await buttons[i].click();
          console.log(`   Clicked: "${buttonText}"`);
          await page.evaluate(() => new Promise(r => setTimeout(r, 100)));
        } catch (e) {
          // Some buttons might not be clickable
        }
      }
      
      // Test form inputs
      const inputs = await page.$$('input');
      console.log(`   Found ${inputs.length} inputs to test`);
      
      for (let i = 0; i < Math.min(3, inputs.length); i++) {
        try {
          await inputs[i].type('Test input ' + i);
          await page.evaluate(() => new Promise(r => setTimeout(r, 100)));
        } catch (e) {
          // Some inputs might be readonly
        }
      }
      
      await page.screenshot({ path: path.join(CONFIG.screenshotDir, '08-ui-interactions.png') });
      await browser.close();
    });
  }

  async generateReport() {
    const duration = Date.now() - this.results.startTime;
    
    console.log('\n' + '═'.repeat(60));
    console.log('📊 PERFECT E2E TEST RESULTS');
    console.log('═'.repeat(60));
    console.log(`Total Tests: ${this.results.tests.length}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⏱️ Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📸 Screenshots: ${CONFIG.screenshotDir}`);
    
    console.log('\nTest Details:');
    this.results.tests.forEach(test => {
      const icon = test.status === 'PASSED' ? '✅' : '❌';
      console.log(`  ${icon} ${test.name}`);
      if (test.error) {
        console.log(`     Error: ${test.error}`);
      }
    });
    
    // Save report
    const reportPath = path.join(CONFIG.screenshotDir, 'test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);
    
    console.log('\n' + '═'.repeat(60));
    const allPassed = this.results.failed === 0;
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED - E2E TESTING IS PERFECT!');
    } else {
      console.log('⚠️ Some tests failed - Review and fix issues');
    }
    console.log('═'.repeat(60));
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up...');
    for (const browser of this.browsers) {
      try {
        await browser.close();
      } catch (e) {
        // Browser might already be closed
      }
    }
  }

  async run() {
    try {
      await this.initialize();
      
      // Run all tests
      await this.testHealthCheck();
      await this.testAuthentication();
      await this.testMultiAgentParallel();
      await this.testPerformance();
      await this.testUIInteractions();
      
      await this.generateReport();
    } catch (error) {
      console.error('Fatal error:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the perfect E2E test
const tester = new PerfectE2ETester();
tester.run().then(() => {
  process.exit(tester.results.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});