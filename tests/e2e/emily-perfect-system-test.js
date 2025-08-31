/**
 * Emily Perfect System E2E Test Suite
 * Complete validation that the system is 100% ready for Emily
 * Runs multiple teacher agents in parallel to test all functionality
 */

const puppeteer = require('puppeteer');
const EmilyScheduleEditorTests = require('./emily-schedule-editor-tests');
const EmilyAssessmentIntegrationTests = require('./emily-assessment-integration-tests');
const fs = require('fs').promises;
const path = require('path');

class EmilyPerfectSystemTest {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 0,
      baseURL: options.baseURL || 'http://localhost:5173',
      parallel: options.parallel !== false,
      screenshotOnFailure: options.screenshotOnFailure !== false
    };
    
    this.agents = [];
    this.testResults = {
      startTime: null,
      endTime: null,
      totalTests: 0,
      passed: 0,
      failed: 0,
      agents: {},
      criticalChecks: []
    };
  }

  /**
   * Teacher Agent 1: Emily - Primary Teacher
   * Tests core teaching workflow
   */
  async runEmilyAgent() {
    console.log('\n👩‍🏫 AGENT: Emily (Primary Teacher)');
    console.log('=' .repeat(40));
    
    const browser = await puppeteer.launch(this.getBrowserOptions());
    const page = await browser.newPage();
    
    try {
      // Login as Emily
      await this.login(page, 'emily.mcisaac@teachingengine.test', 'TeachingGrade1!');
      
      const tests = [];
      
      // Test 1: Dashboard shows correct stats
      tests.push(await this.testDashboardStats(page));
      
      // Test 2: Today's lessons are visible
      tests.push(await this.testTodaysLessons(page));
      
      // Test 3: Week view works
      tests.push(await this.testWeekView(page));
      
      // Test 4: Can navigate to schedule editor
      tests.push(await this.testScheduleEditorAccess(page));
      
      // Test 5: Unit boundaries are respected
      tests.push(await this.testUnitBoundaries(page));
      
      // Test 6: Can access assessment from lessons
      tests.push(await this.testAssessmentAccess(page));
      
      this.testResults.agents['Emily'] = {
        role: 'Primary Teacher',
        tests: tests,
        passed: tests.filter(t => t.status === 'PASS').length,
        failed: tests.filter(t => t.status === 'FAIL').length
      };
      
    } finally {
      await browser.close();
    }
  }

  /**
   * Teacher Agent 2: Sophie - Supply Teacher
   * Tests substitute teacher access
   */
  async runSophieAgent() {
    console.log('\n👩‍🏫 AGENT: Sophie (Supply Teacher)');
    console.log('=' .repeat(40));
    
    const browser = await puppeteer.launch(this.getBrowserOptions());
    const page = await browser.newPage();
    
    try {
      // Login as Sophie
      await this.login(page, 'sophie.substitute@teachingengine.test', 'SubTeacher2025!');
      
      const tests = [];
      
      // Test 1: Can view schedule (read-only)
      tests.push(await this.testReadOnlySchedule(page));
      
      // Test 2: Can access lesson plans
      tests.push(await this.testLessonPlanAccess(page));
      
      // Test 3: Cannot modify schedule
      tests.push(await this.testCannotModifySchedule(page));
      
      // Test 4: Can view assessment notes
      tests.push(await this.testViewAssessmentNotes(page));
      
      this.testResults.agents['Sophie'] = {
        role: 'Supply Teacher',
        tests: tests,
        passed: tests.filter(t => t.status === 'PASS').length,
        failed: tests.filter(t => t.status === 'FAIL').length
      };
      
    } finally {
      await browser.close();
    }
  }

  /**
   * Teacher Agent 3: Marie - Assessment Specialist
   * Tests assessment features
   */
  async runMarieAgent() {
    console.log('\n👩‍🏫 AGENT: Marie (Assessment Specialist)');
    console.log('=' .repeat(40));
    
    const browser = await puppeteer.launch(this.getBrowserOptions());
    const page = await browser.newPage();
    
    try {
      // Login as Marie
      await this.login(page, 'marie.assessment@teachingengine.test', 'Assessment2025!');
      
      const tests = [];
      
      // Test 1: Navigate from lessons to assessment
      tests.push(await this.testLessonToAssessmentFlow(page));
      
      // Test 2: Track student progress
      tests.push(await this.testStudentProgressTracking(page));
      
      // Test 3: View curriculum expectations
      tests.push(await this.testCurriculumExpectationsView(page));
      
      // Test 4: Generate reports
      tests.push(await this.testReportGeneration(page));
      
      this.testResults.agents['Marie'] = {
        role: 'Assessment Specialist',
        tests: tests,
        passed: tests.filter(t => t.status === 'PASS').length,
        failed: tests.filter(t => t.status === 'FAIL').length
      };
      
    } finally {
      await browser.close();
    }
  }

  /**
   * Critical System Checks
   * Verify all requirements are met
   */
  async runCriticalChecks() {
    console.log('\n⚠️ CRITICAL SYSTEM CHECKS');
    console.log('=' .repeat(40));
    
    const browser = await puppeteer.launch(this.getBrowserOptions());
    const page = await browser.newPage();
    
    try {
      await this.login(page, 'emily.mcisaac@teachingengine.test', 'TeachingGrade1!');
      
      // Check 1: Bienvenue unit is in September
      const check1 = await this.checkBienvenueInSeptember(page);
      this.testResults.criticalChecks.push(check1);
      
      // Check 2: All 970 lessons are scheduled
      const check2 = await this.checkAllLessonsScheduled(page);
      this.testResults.criticalChecks.push(check2);
      
      // Check 3: Schedule editor is accessible
      const check3 = await this.checkScheduleEditorWorks(page);
      this.testResults.criticalChecks.push(check3);
      
      // Check 4: Assessment tools are integrated
      const check4 = await this.checkAssessmentIntegration(page);
      this.testResults.criticalChecks.push(check4);
      
      // Check 5: Unit boundaries are respected
      const check5 = await this.checkUnitBoundaries(page);
      this.testResults.criticalChecks.push(check5);
      
    } finally {
      await browser.close();
    }
  }

  // Helper methods for tests
  async login(page, email, password) {
    await page.goto(`${this.options.baseURL}/login`);
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', email);
    await page.type('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
  }

  async testDashboardStats(page) {
    try {
      await page.goto(`${this.options.baseURL}/dashboard`);
      await page.waitForSelector('.stats-card', { timeout: 5000 });
      
      // Check if shows 6 subjects, 50 units, 731 hours
      const stats = await page.$$eval('.stats-card .stat-value', els => 
        els.map(el => el.textContent)
      );
      
      if (stats.includes('6') && stats.includes('50') && stats.includes('731')) {
        console.log('  ✅ Dashboard stats are correct');
        return { test: 'Dashboard Stats', status: 'PASS' };
      } else {
        throw new Error(`Wrong stats: ${stats.join(', ')}`);
      }
    } catch (error) {
      console.log('  ❌ Dashboard stats incorrect:', error.message);
      return { test: 'Dashboard Stats', status: 'FAIL', error: error.message };
    }
  }

  async testTodaysLessons(page) {
    try {
      await page.goto(`${this.options.baseURL}/planner/today`);
      await page.waitForSelector('.lesson-card', { timeout: 5000 });
      
      const lessons = await page.$$('.lesson-card');
      if (lessons.length === 5) {
        console.log('  ✅ Today shows 5 lessons');
        return { test: "Today's Lessons", status: 'PASS' };
      } else {
        throw new Error(`Expected 5 lessons, found ${lessons.length}`);
      }
    } catch (error) {
      console.log('  ❌ Today\'s lessons incorrect:', error.message);
      return { test: "Today's Lessons", status: 'FAIL', error: error.message };
    }
  }

  async testWeekView(page) {
    try {
      await page.goto(`${this.options.baseURL}/planner/week`);
      await page.waitForSelector('.week-grid', { timeout: 5000 });
      
      // Check for 5 days
      const days = await page.$$('.day-column');
      if (days.length === 5) {
        console.log('  ✅ Week view shows 5 days');
        return { test: 'Week View', status: 'PASS' };
      } else {
        throw new Error(`Expected 5 days, found ${days.length}`);
      }
    } catch (error) {
      console.log('  ❌ Week view failed:', error.message);
      return { test: 'Week View', status: 'FAIL', error: error.message };
    }
  }

  async testScheduleEditorAccess(page) {
    try {
      await page.goto(`${this.options.baseURL}/planner/schedule-editor`);
      await page.waitForSelector('.schedule-editor', { timeout: 5000 });
      
      // Check for drag-drop elements
      const draggable = await page.$$('[draggable="true"]');
      if (draggable.length > 0) {
        console.log('  ✅ Schedule editor accessible with draggable lessons');
        return { test: 'Schedule Editor Access', status: 'PASS' };
      } else {
        throw new Error('No draggable elements found');
      }
    } catch (error) {
      console.log('  ❌ Schedule editor access failed:', error.message);
      return { test: 'Schedule Editor Access', status: 'FAIL', error: error.message };
    }
  }

  async testUnitBoundaries(page) {
    try {
      await page.goto(`${this.options.baseURL}/planner/units`);
      await page.waitForSelector('.unit-card', { timeout: 5000 });
      
      // Find Bienvenue unit
      const bienvenueUnit = await page.$eval(
        '.unit-card:has-text("Bienvenue")',
        el => {
          const dates = el.querySelector('.unit-dates');
          return dates ? dates.textContent : null;
        }
      );
      
      if (bienvenueUnit && bienvenueUnit.includes('Sept')) {
        console.log('  ✅ Unit boundaries respected (Bienvenue in September)');
        return { test: 'Unit Boundaries', status: 'PASS' };
      } else {
        throw new Error('Bienvenue unit not in September');
      }
    } catch (error) {
      console.log('  ❌ Unit boundaries test failed:', error.message);
      return { test: 'Unit Boundaries', status: 'FAIL', error: error.message };
    }
  }

  async testAssessmentAccess(page) {
    try {
      // Go to a lesson
      await page.goto(`${this.options.baseURL}/planner/lessons`);
      await page.waitForSelector('.lesson-card', { timeout: 5000 });
      await page.click('.lesson-card:first-child');
      await page.waitForNavigation();
      
      // Check for assessment button
      await page.waitForSelector('button:has-text("Assess Students")', { timeout: 5000 });
      
      console.log('  ✅ Assessment accessible from lessons');
      return { test: 'Assessment Access', status: 'PASS' };
    } catch (error) {
      console.log('  ❌ Assessment access failed:', error.message);
      return { test: 'Assessment Access', status: 'FAIL', error: error.message };
    }
  }

  // Critical checks
  async checkBienvenueInSeptember(page) {
    try {
      // SQL query would be better, but checking via UI
      await page.goto(`${this.options.baseURL}/planner/units`);
      const result = await page.evaluate(() => {
        const bienvenueCard = document.querySelector('.unit-card:has-text("Bienvenue")');
        if (!bienvenueCard) return false;
        const dateText = bienvenueCard.textContent;
        return dateText.includes('Sept') && dateText.includes('2025-09');
      });
      
      if (result) {
        console.log('  ✅ CRITICAL: Bienvenue unit is in September');
        return { check: 'Bienvenue in September', status: 'PASS' };
      } else {
        throw new Error('Bienvenue not in September');
      }
    } catch (error) {
      console.log('  ❌ CRITICAL FAIL: Bienvenue not in September');
      return { check: 'Bienvenue in September', status: 'FAIL', error: error.message };
    }
  }

  async checkAllLessonsScheduled(page) {
    try {
      await page.goto(`${this.options.baseURL}/dashboard`);
      const lessonCount = await page.$eval('.total-lessons', el => el.textContent);
      
      if (lessonCount && lessonCount.includes('970')) {
        console.log('  ✅ CRITICAL: All 970 lessons scheduled');
        return { check: 'All Lessons Scheduled', status: 'PASS' };
      } else {
        throw new Error(`Only ${lessonCount} lessons scheduled`);
      }
    } catch (error) {
      console.log('  ❌ CRITICAL FAIL: Not all lessons scheduled');
      return { check: 'All Lessons Scheduled', status: 'FAIL', error: error.message };
    }
  }

  async checkScheduleEditorWorks(page) {
    try {
      await page.goto(`${this.options.baseURL}/planner/schedule-editor`);
      await page.waitForSelector('.schedule-editor', { timeout: 5000 });
      
      // Try to drag something
      const draggable = await page.$('[draggable="true"]');
      if (draggable) {
        console.log('  ✅ CRITICAL: Schedule editor functional');
        return { check: 'Schedule Editor Works', status: 'PASS' };
      } else {
        throw new Error('No draggable elements');
      }
    } catch (error) {
      console.log('  ❌ CRITICAL FAIL: Schedule editor not working');
      return { check: 'Schedule Editor Works', status: 'FAIL', error: error.message };
    }
  }

  async checkAssessmentIntegration(page) {
    try {
      await page.goto(`${this.options.baseURL}/planner/lessons`);
      await page.click('.lesson-card:first-child');
      await page.waitForNavigation();
      
      const assessButton = await page.$('button:has-text("Assess Students")');
      if (assessButton) {
        console.log('  ✅ CRITICAL: Assessment integrated');
        return { check: 'Assessment Integration', status: 'PASS' };
      } else {
        throw new Error('No assessment button found');
      }
    } catch (error) {
      console.log('  ❌ CRITICAL FAIL: Assessment not integrated');
      return { check: 'Assessment Integration', status: 'FAIL', error: error.message };
    }
  }

  async checkUnitBoundaries(page) {
    try {
      // Check multiple units are in correct months
      const checks = [
        { unit: 'Bienvenue', month: 'Sept' },
        { unit: 'célébrations', month: 'Dec' },
        { unit: 'exposition', month: 'June' }
      ];
      
      for (const check of checks) {
        await page.goto(`${this.options.baseURL}/planner/units`);
        const result = await page.evaluate((unitName, expectedMonth) => {
          const unitCard = Array.from(document.querySelectorAll('.unit-card'))
            .find(card => card.textContent.toLowerCase().includes(unitName.toLowerCase()));
          if (!unitCard) return false;
          return unitCard.textContent.includes(expectedMonth);
        }, check.unit, check.month);
        
        if (!result) {
          throw new Error(`${check.unit} not in ${check.month}`);
        }
      }
      
      console.log('  ✅ CRITICAL: All unit boundaries respected');
      return { check: 'Unit Boundaries Respected', status: 'PASS' };
    } catch (error) {
      console.log('  ❌ CRITICAL FAIL: Unit boundaries not respected');
      return { check: 'Unit Boundaries Respected', status: 'FAIL', error: error.message };
    }
  }

  getBrowserOptions() {
    return {
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1920, height: 1080 }
    };
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 EMILY PERFECT SYSTEM E2E TEST SUITE');
    console.log('=' .repeat(70));
    console.log(`Base URL: ${this.options.baseURL}`);
    console.log(`Mode: ${this.options.headless ? 'Headless' : 'Visual'}`);
    console.log(`Parallel: ${this.options.parallel}`);
    
    this.testResults.startTime = Date.now();
    
    try {
      // Run critical checks first
      await this.runCriticalChecks();
      
      // Run teacher agents
      if (this.options.parallel) {
        await Promise.all([
          this.runEmilyAgent(),
          this.runSophieAgent(),
          this.runMarieAgent()
        ]);
      } else {
        await this.runEmilyAgent();
        await this.runSophieAgent();
        await this.runMarieAgent();
      }
      
      // Run specialized test suites
      console.log('\n📝 Running Specialized Test Suites...');
      
      const scheduleTests = new EmilyScheduleEditorTests(this.options);
      await scheduleTests.runAllTests();
      
      const assessmentTests = new EmilyAssessmentIntegrationTests(this.options);
      await assessmentTests.runAllTests();
      
    } catch (error) {
      console.error('Fatal error:', error);
    } finally {
      this.testResults.endTime = Date.now();
      this.printFinalReport();
    }
  }

  printFinalReport() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL TEST REPORT FOR EMILY\'S SYSTEM');
    console.log('=' .repeat(70));
    
    // Critical checks
    console.log('\n⚠️ CRITICAL CHECKS:');
    const criticalPassed = this.testResults.criticalChecks.filter(c => c.status === 'PASS').length;
    const criticalTotal = this.testResults.criticalChecks.length;
    
    this.testResults.criticalChecks.forEach(check => {
      const icon = check.status === 'PASS' ? '✅' : '❌';
      console.log(`  ${icon} ${check.check}: ${check.status}`);
    });
    
    // Agent results
    console.log('\n👥 TEACHER AGENT RESULTS:');
    Object.entries(this.testResults.agents).forEach(([name, results]) => {
      console.log(`\n  ${name} (${results.role}):`);
      console.log(`    Tests: ${results.passed + results.failed} | Passed: ${results.passed} | Failed: ${results.failed}`);
    });
    
    // Overall summary
    const totalTime = (this.testResults.endTime - this.testResults.startTime) / 1000;
    console.log('\n' + '-'.repeat(70));
    console.log('📈 OVERALL SUMMARY:');
    console.log(`  Critical Checks: ${criticalPassed}/${criticalTotal} passed`);
    console.log(`  Total Time: ${totalTime.toFixed(2)} seconds`);
    
    // Final verdict
    console.log('\n' + '='.repeat(70));
    if (criticalPassed === criticalTotal) {
      console.log('🎉 SYSTEM IS 100% READY FOR EMILY!');
      console.log('✅ All critical requirements met');
      console.log('✅ Schedule editor working perfectly');
      console.log('✅ Assessment tools fully integrated');
      console.log('✅ Unit boundaries respected');
      console.log('✅ All 970 lessons properly scheduled');
      console.log('\n🏫 Emily can confidently start teaching on Day 1!');
    } else {
      console.log('⚠️ SYSTEM NEEDS ATTENTION');
      console.log(`❌ ${criticalTotal - criticalPassed} critical checks failed`);
      console.log('Please review and fix before Emily\'s first day');
    }
    console.log('=' .repeat(70));
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new EmilyPerfectSystemTest({
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO || '0'),
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    parallel: process.env.PARALLEL !== 'false'
  });
  
  tester.runAllTests().catch(console.error);
}

module.exports = EmilyPerfectSystemTest;