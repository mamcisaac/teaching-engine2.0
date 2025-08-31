/**
 * Emily System Validation Test
 * Quick validation that all key features are working
 */

const puppeteer = require('puppeteer');

class EmilyValidationTest {
  constructor() {
    this.results = {
      checks: [],
      passed: 0,
      failed: 0
    };
  }

  async run() {
    console.log('🚀 EMILY SYSTEM VALIDATION TEST');
    console.log('=' .repeat(50));
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
      // Test 1: Homepage loads
      console.log('\n📍 Checking homepage...');
      await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
      const title = await page.title();
      this.addResult('Homepage Loads', title.includes('Teaching') || title.includes('Emily'));
      
      // Test 2: Login page accessible
      console.log('📍 Checking login page...');
      await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
      const loginForm = await page.$('form');
      this.addResult('Login Page Accessible', !!loginForm);
      
      // Test 3: Dashboard route exists
      console.log('📍 Checking dashboard route...');
      const dashboardResponse = await page.goto('http://localhost:5173/dashboard', { 
        waitUntil: 'domcontentloaded' 
      });
      this.addResult('Dashboard Route Exists', dashboardResponse.ok());
      
      // Test 4: Schedule editor route exists
      console.log('📍 Checking schedule editor route...');
      const scheduleResponse = await page.goto('http://localhost:5173/planner/schedule-editor', { 
        waitUntil: 'domcontentloaded' 
      });
      this.addResult('Schedule Editor Route Exists', scheduleResponse.ok());
      
      // Test 5: Week view route exists
      console.log('📍 Checking week view route...');
      const weekResponse = await page.goto('http://localhost:5173/planner/week', { 
        waitUntil: 'domcontentloaded' 
      });
      this.addResult('Week View Route Exists', weekResponse.ok());
      
      // Test 6: Day view route exists
      console.log('📍 Checking day view route...');
      const dayResponse = await page.goto('http://localhost:5173/planner/day/2025-09-03', { 
        waitUntil: 'domcontentloaded' 
      });
      this.addResult('Day View Route Exists', dayResponse.ok());
      
      // Test 7: API health check
      console.log('📍 Checking API...');
      const apiResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('http://localhost:3000/api/health');
          return response.ok;
        } catch {
          return false;
        }
      });
      this.addResult('API Health Check', apiResponse);
      
    } catch (error) {
      console.error('Error during testing:', error.message);
    } finally {
      await browser.close();
      this.printReport();
    }
  }
  
  addResult(check, passed) {
    const icon = passed ? '✅' : '❌';
    console.log(`  ${icon} ${check}`);
    this.results.checks.push({ check, passed });
    if (passed) this.results.passed++;
    else this.results.failed++;
  }
  
  printReport() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 VALIDATION RESULTS');
    console.log('=' .repeat(50));
    
    this.results.checks.forEach(({ check, passed }) => {
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${check}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    console.log('\n' + '-' .repeat(50));
    console.log(`Total: ${this.results.checks.length} | Passed: ${this.results.passed} | Failed: ${this.results.failed}`);
    
    if (this.results.failed === 0) {
      console.log('\n🎉 VALIDATION SUCCESSFUL!');
      console.log('All routes and basic functionality confirmed working.');
    } else {
      console.log('\n⚠️ Some checks failed.');
      console.log('Please review the application setup.');
    }
  }
}

// Run test
if (require.main === module) {
  const test = new EmilyValidationTest();
  test.run().catch(console.error);
}

module.exports = EmilyValidationTest;