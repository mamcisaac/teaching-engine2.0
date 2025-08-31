/**
 * Emily Assessment Integration E2E Tests
 * Tests the new assessment tools integrated into lesson views
 * Uses real browser interactions with Puppeteer - no mocking
 */

const puppeteer = require('puppeteer');

class EmilyAssessmentIntegrationTests {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.baseURL = options.baseURL || 'http://localhost:5173';
    this.headless = options.headless !== false;
    this.slowMo = options.slowMo || 0;
    
    this.credentials = {
      email: 'emily.mcisaac@teachingengine.test',
      password: 'TeachingGrade1!'
    };
    
    this.testResults = [];
  }

  async setup() {
    console.log('🚀 Setting up Assessment Integration Tests...');
    this.browser = await puppeteer.launch({
      headless: this.headless,
      slowMo: this.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 }
    });
    
    this.page = await this.browser.newPage();
    
    // Set up console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Browser Error:', msg.text());
      }
    });
    
    await this.login();
  }

  async login() {
    console.log('📝 Logging in as Emily...');
    await this.page.goto(`${this.baseURL}/login`);
    
    await this.page.waitForSelector('input[type="email"]');
    await this.page.type('input[type="email"]', this.credentials.email);
    await this.page.type('input[type="password"]', this.credentials.password);
    
    await this.page.click('button[type="submit"]');
    
    await this.page.waitForNavigation();
    await this.page.waitForSelector('.dashboard', { timeout: 10000 });
    console.log('✅ Login successful');
  }

  async testAssessButtonOnDashboard() {
    console.log('\n📍 Test: Assess Students Button on Dashboard');
    
    try {
      // Look for Assess Students quick action
      await this.page.waitForSelector('button:has-text("Assess Students")', { timeout: 5000 });
      
      // Click it
      await this.page.click('button:has-text("Assess Students")');
      
      // Wait for navigation
      await this.page.waitForNavigation();
      
      // Verify we're on assessment page
      const url = this.page.url();
      if (url.includes('/assessment')) {
        console.log('✅ Successfully navigated to assessment from dashboard');
        this.testResults.push({ test: 'Assess Button on Dashboard', status: 'PASS' });
        return true;
      } else {
        throw new Error('Did not navigate to assessment page');
      }
    } catch (error) {
      console.error('❌ Dashboard assess button failed:', error.message);
      this.testResults.push({ test: 'Assess Button on Dashboard', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testAssessFromLessonDetail() {
    console.log('\n📚 Test: Assess Students from Lesson Detail');
    
    try {
      // Navigate to a lesson
      await this.page.goto(`${this.baseURL}/planner/today`);
      await this.page.waitForSelector('.lesson-card', { timeout: 10000 });
      
      // Click first lesson
      await this.page.click('.lesson-card:first-child');
      await this.page.waitForNavigation();
      
      // Wait for lesson detail page
      await this.page.waitForSelector('.lesson-detail', { timeout: 10000 });
      
      // Find Assess Students button
      await this.page.waitForSelector('button:has-text("Assess Students")', { timeout: 5000 });
      
      // Click it
      await this.page.click('button:has-text("Assess Students")');
      
      // Wait for navigation
      await this.page.waitForNavigation();
      
      // Verify we're on assessment page with lesson context
      const url = this.page.url();
      if (url.includes('/assessment') && url.includes('lessonId=')) {
        console.log('✅ Successfully navigated to assessment with lesson context');
        this.testResults.push({ test: 'Assess from Lesson Detail', status: 'PASS' });
        return true;
      } else {
        throw new Error('Assessment page did not include lesson context');
      }
    } catch (error) {
      console.error('❌ Lesson detail assess button failed:', error.message);
      this.testResults.push({ test: 'Assess from Lesson Detail', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testViewProgressFromLesson() {
    console.log('\n📊 Test: View Progress from Lesson');
    
    try {
      // Navigate to a lesson
      await this.page.goto(`${this.baseURL}/planner/lessons`);
      await this.page.waitForSelector('.lesson-card', { timeout: 10000 });
      
      // Click first lesson
      await this.page.click('.lesson-card:first-child');
      await this.page.waitForNavigation();
      
      // Find View Progress button
      await this.page.waitForSelector('button:has-text("View Progress")', { timeout: 5000 });
      
      // Click it
      await this.page.click('button:has-text("View Progress")');
      
      // Wait for navigation
      await this.page.waitForNavigation();
      
      // Verify we're on analytics page
      const url = this.page.url();
      if (url.includes('/analytics')) {
        console.log('✅ Successfully navigated to progress analytics');
        this.testResults.push({ test: 'View Progress from Lesson', status: 'PASS' });
        return true;
      } else {
        throw new Error('Did not navigate to analytics page');
      }
    } catch (error) {
      console.error('❌ View progress button failed:', error.message);
      this.testResults.push({ test: 'View Progress from Lesson', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testAssessExpectations() {
    console.log('\n🎯 Test: Assess Curriculum Expectations');
    
    try {
      // Navigate to a lesson with expectations
      await this.page.goto(`${this.baseURL}/planner/lessons`);
      await this.page.waitForSelector('.lesson-card', { timeout: 10000 });
      
      // Click a lesson
      await this.page.click('.lesson-card:first-child');
      await this.page.waitForNavigation();
      
      // Wait for expectations section
      await this.page.waitForSelector('.curriculum-expectations', { timeout: 10000 });
      
      // Find "Assess These Expectations" button
      await this.page.waitForSelector('button:has-text("Assess These Expectations")', { timeout: 5000 });
      
      // Click it
      await this.page.click('button:has-text("Assess These Expectations")');
      
      // Wait for navigation
      await this.page.waitForNavigation();
      
      // Verify we're on assessment page with expectations context
      const url = this.page.url();
      if (url.includes('/assessment') && url.includes('expectations=')) {
        console.log('✅ Successfully navigated to assessment with expectations context');
        this.testResults.push({ test: 'Assess Curriculum Expectations', status: 'PASS' });
        return true;
      } else {
        throw new Error('Assessment page did not include expectations context');
      }
    } catch (error) {
      console.error('❌ Assess expectations failed:', error.message);
      this.testResults.push({ test: 'Assess Curriculum Expectations', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testIndividualExpectationAssessment() {
    console.log('\n🎯 Test: Individual Expectation Assessment');
    
    try {
      // Navigate to a lesson
      await this.page.goto(`${this.baseURL}/planner/lessons`);
      await this.page.waitForSelector('.lesson-card', { timeout: 10000 });
      
      // Click a lesson
      await this.page.click('.lesson-card:first-child');
      await this.page.waitForNavigation();
      
      // Wait for expectations list
      await this.page.waitForSelector('.expectation-item', { timeout: 10000 });
      
      // Find individual expectation assess button
      await this.page.waitForSelector('.expectation-item button[aria-label*="Assess"]', { timeout: 5000 });
      
      // Click first one
      await this.page.click('.expectation-item button[aria-label*="Assess"]:first-child');
      
      // Wait for navigation
      await this.page.waitForNavigation();
      
      // Verify we're on assessment page with single expectation
      const url = this.page.url();
      if (url.includes('/assessment') && url.includes('expectationId=')) {
        console.log('✅ Successfully navigated to assess individual expectation');
        this.testResults.push({ test: 'Individual Expectation Assessment', status: 'PASS' });
        return true;
      } else {
        throw new Error('Assessment page did not include expectation ID');
      }
    } catch (error) {
      console.error('❌ Individual expectation assessment failed:', error.message);
      this.testResults.push({ test: 'Individual Expectation Assessment', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testAssessmentContextPreservation() {
    console.log('\n🔄 Test: Assessment Context Preservation');
    
    try {
      // Navigate to lesson
      await this.page.goto(`${this.baseURL}/planner/lessons`);
      await this.page.waitForSelector('.lesson-card', { timeout: 10000 });
      
      // Get lesson title
      const lessonTitle = await this.page.$eval('.lesson-card:first-child .lesson-title', 
        el => el.textContent
      );
      
      // Click lesson
      await this.page.click('.lesson-card:first-child');
      await this.page.waitForNavigation();
      
      // Click Assess Students
      await this.page.click('button:has-text("Assess Students")');
      await this.page.waitForNavigation();
      
      // Check if lesson context is shown on assessment page
      await this.page.waitForSelector('.assessment-context', { timeout: 5000 });
      
      const contextText = await this.page.$eval('.assessment-context', el => el.textContent);
      
      if (contextText.includes(lessonTitle)) {
        console.log('✅ Lesson context preserved in assessment view');
        this.testResults.push({ test: 'Assessment Context Preservation', status: 'PASS' });
        return true;
      } else {
        throw new Error('Lesson context not preserved');
      }
    } catch (error) {
      console.error('❌ Context preservation failed:', error.message);
      this.testResults.push({ test: 'Assessment Context Preservation', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testQuickAssessmentFlow() {
    console.log('\n⚡ Test: Quick Assessment Flow');
    
    try {
      // Start from dashboard
      await this.page.goto(`${this.baseURL}/dashboard`);
      
      // Click today's lesson
      await this.page.waitForSelector('.current-lesson', { timeout: 5000 });
      await this.page.click('.current-lesson');
      await this.page.waitForNavigation();
      
      // Quick assess button
      await this.page.click('button:has-text("Assess Students")');
      await this.page.waitForNavigation();
      
      // Select a student
      await this.page.waitForSelector('.student-list .student-item', { timeout: 5000 });
      await this.page.click('.student-list .student-item:first-child');
      
      // Select mastery level
      await this.page.waitForSelector('.mastery-level-selector', { timeout: 5000 });
      await this.page.click('button[data-level="proficient"]');
      
      // Add note
      await this.page.type('textarea[name="notes"]', 'Excellent participation in French discussion');
      
      // Save
      await this.page.click('button:has-text("Save Assessment")');
      
      // Wait for save confirmation
      await this.page.waitForSelector('.toast-success', { timeout: 5000 });
      
      console.log('✅ Quick assessment flow completed successfully');
      this.testResults.push({ test: 'Quick Assessment Flow', status: 'PASS' });
      return true;
    } catch (error) {
      console.error('❌ Quick assessment flow failed:', error.message);
      this.testResults.push({ test: 'Quick Assessment Flow', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testMultipleStudentAssessment() {
    console.log('\n👥 Test: Multiple Student Assessment');
    
    try {
      // Navigate to assessment from lesson
      await this.page.goto(`${this.baseURL}/planner/lessons`);
      await this.page.click('.lesson-card:first-child');
      await this.page.waitForNavigation();
      await this.page.click('button:has-text("Assess Students")');
      await this.page.waitForNavigation();
      
      // Select multiple students
      await this.page.waitForSelector('.student-list', { timeout: 5000 });
      
      // Click first 3 students
      for (let i = 0; i < 3; i++) {
        await this.page.click(`.student-item:nth-child(${i + 1}) input[type="checkbox"]`);
      }
      
      // Set group assessment
      await this.page.click('button[data-level="developing"]');
      await this.page.type('textarea[name="group-notes"]', 'Group work on counting activity');
      
      // Save all
      await this.page.click('button:has-text("Save All Assessments")');
      
      // Wait for confirmation
      await this.page.waitForSelector('.toast-success', { timeout: 5000 });
      
      const toastText = await this.page.$eval('.toast-success', el => el.textContent);
      if (toastText.includes('3')) {
        console.log('✅ Multiple student assessment saved successfully');
        this.testResults.push({ test: 'Multiple Student Assessment', status: 'PASS' });
        return true;
      } else {
        throw new Error('Multiple assessments not saved correctly');
      }
    } catch (error) {
      console.error('❌ Multiple student assessment failed:', error.message);
      this.testResults.push({ test: 'Multiple Student Assessment', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 EMILY ASSESSMENT INTEGRATION E2E TESTS');
    console.log('='.repeat(60));
    
    try {
      await this.setup();
      
      // Run all tests
      await this.testAssessButtonOnDashboard();
      await this.testAssessFromLessonDetail();
      await this.testViewProgressFromLesson();
      await this.testAssessExpectations();
      await this.testIndividualExpectationAssessment();
      await this.testAssessmentContextPreservation();
      await this.testQuickAssessmentFlow();
      await this.testMultipleStudentAssessment();
      
    } catch (error) {
      console.error('Fatal error:', error);
    } finally {
      await this.cleanup();
      this.printResults();
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    
    this.testResults.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log(`Total: ${this.testResults.length} | Passed: ${passed} | Failed: ${failed}`);
    console.log(`Success Rate: ${Math.round((passed / this.testResults.length) * 100)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Assessment integration is perfect!');
    } else {
      console.log('\n⚠️ Some tests failed. Please review and fix.');
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new EmilyAssessmentIntegrationTests({
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO || '0'),
    baseURL: process.env.BASE_URL || 'http://localhost:5173'
  });
  
  tester.runAllTests().catch(console.error);
}

module.exports = EmilyAssessmentIntegrationTests;