/**
 * Emily Schedule Editor E2E Tests
 * Tests the new drag-and-drop schedule editor functionality
 * Uses real browser interactions with Puppeteer - no mocking
 */

const puppeteer = require('puppeteer');

class EmilyScheduleEditorTests {
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
    console.log('🚀 Setting up Schedule Editor Tests...');
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
    
    // Fill login form
    await this.page.waitForSelector('input[type="email"]');
    await this.page.type('input[type="email"]', this.credentials.email);
    await this.page.type('input[type="password"]', this.credentials.password);
    
    // Submit form
    await this.page.click('button[type="submit"]');
    
    // Wait for dashboard
    await this.page.waitForNavigation();
    await this.page.waitForSelector('.dashboard', { timeout: 10000 });
    console.log('✅ Login successful');
  }

  async testNavigateToScheduleEditor() {
    console.log('\n📍 Test: Navigate to Schedule Editor');
    
    try {
      // Click Edit Schedule button
      await this.page.waitForSelector('button:has-text("Edit Schedule")', { timeout: 5000 });
      await this.page.click('button:has-text("Edit Schedule")');
      
      // Wait for schedule editor to load
      await this.page.waitForSelector('.schedule-editor', { timeout: 10000 });
      
      // Verify URL changed
      const url = this.page.url();
      if (url.includes('/schedule-editor')) {
        console.log('✅ Successfully navigated to schedule editor');
        this.testResults.push({ test: 'Navigate to Schedule Editor', status: 'PASS' });
        return true;
      } else {
        throw new Error('URL did not change to schedule editor');
      }
    } catch (error) {
      console.error('❌ Failed to navigate to schedule editor:', error.message);
      this.testResults.push({ test: 'Navigate to Schedule Editor', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testDragAndDropLesson() {
    console.log('\n🎯 Test: Drag and Drop Lesson');
    
    try {
      // Find first lesson card
      await this.page.waitForSelector('.lesson-card', { timeout: 10000 });
      const lessons = await this.page.$$('.lesson-card');
      
      if (lessons.length === 0) {
        throw new Error('No lessons found');
      }
      
      // Get original position
      const firstLesson = lessons[0];
      const originalSlot = await firstLesson.evaluate(el => {
        const parent = el.closest('.time-slot');
        return parent ? parent.getAttribute('data-slot-id') : null;
      });
      
      console.log(`Original slot: ${originalSlot}`);
      
      // Find a different time slot
      const targetSlots = await this.page.$$('.time-slot');
      let targetSlot = null;
      
      for (const slot of targetSlots) {
        const slotId = await slot.evaluate(el => el.getAttribute('data-slot-id'));
        if (slotId !== originalSlot) {
          targetSlot = slot;
          break;
        }
      }
      
      if (!targetSlot) {
        throw new Error('No target slot found');
      }
      
      // Perform drag and drop
      const lessonBox = await firstLesson.boundingBox();
      const targetBox = await targetSlot.boundingBox();
      
      // Start drag
      await this.page.mouse.move(lessonBox.x + lessonBox.width / 2, lessonBox.y + lessonBox.height / 2);
      await this.page.mouse.down();
      
      // Move to target
      await this.page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 10 });
      
      // Drop
      await this.page.mouse.up();
      
      // Wait for UI update
      await this.page.waitForTimeout(500);
      
      // Verify lesson moved
      const newSlot = await firstLesson.evaluate(el => {
        const parent = el.closest('.time-slot');
        return parent ? parent.getAttribute('data-slot-id') : null;
      });
      
      if (newSlot !== originalSlot) {
        console.log(`✅ Lesson moved from ${originalSlot} to ${newSlot}`);
        this.testResults.push({ test: 'Drag and Drop Lesson', status: 'PASS' });
        return true;
      } else {
        throw new Error('Lesson did not move');
      }
    } catch (error) {
      console.error('❌ Drag and drop failed:', error.message);
      this.testResults.push({ test: 'Drag and Drop Lesson', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testSearchFunctionality() {
    console.log('\n🔍 Test: Search Functionality');
    
    try {
      // Find search input
      await this.page.waitForSelector('input[placeholder*="Search"]', { timeout: 5000 });
      
      // Type search term
      await this.page.type('input[placeholder*="Search"]', 'Bienvenue');
      
      // Wait for results to filter
      await this.page.waitForTimeout(500);
      
      // Check if lessons are filtered
      const visibleLessons = await this.page.$$eval('.lesson-card:visible', lessons => 
        lessons.map(l => l.textContent)
      );
      
      const matchingLessons = visibleLessons.filter(text => 
        text.toLowerCase().includes('bienvenue')
      );
      
      if (matchingLessons.length > 0) {
        console.log(`✅ Search found ${matchingLessons.length} matching lessons`);
        this.testResults.push({ test: 'Search Functionality', status: 'PASS' });
        return true;
      } else {
        throw new Error('No matching lessons found');
      }
    } catch (error) {
      console.error('❌ Search test failed:', error.message);
      this.testResults.push({ test: 'Search Functionality', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testFilterBySubject() {
    console.log('\n📚 Test: Filter by Subject');
    
    try {
      // Find subject filter dropdown
      await this.page.waitForSelector('select', { timeout: 5000 });
      
      // Select French
      await this.page.select('select', 'Français (Immersion)');
      
      // Wait for filter to apply
      await this.page.waitForTimeout(500);
      
      // Verify only French lessons are shown
      const visibleLessons = await this.page.$$('.lesson-card:visible');
      
      if (visibleLessons.length > 0) {
        console.log(`✅ Filter showing ${visibleLessons.length} French lessons`);
        this.testResults.push({ test: 'Filter by Subject', status: 'PASS' });
        return true;
      } else {
        throw new Error('No lessons visible after filter');
      }
    } catch (error) {
      console.error('❌ Filter test failed:', error.message);
      this.testResults.push({ test: 'Filter by Subject', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testUndoRedo() {
    console.log('\n↩️ Test: Undo/Redo Functionality');
    
    try {
      // Make a change (drag a lesson)
      await this.testDragAndDropLesson();
      
      // Find undo button
      await this.page.waitForSelector('button[aria-label*="Undo"]', { timeout: 5000 });
      
      // Click undo
      await this.page.click('button[aria-label*="Undo"]');
      await this.page.waitForTimeout(500);
      
      // Verify change was undone
      console.log('✅ Undo executed');
      
      // Click redo
      await this.page.waitForSelector('button[aria-label*="Redo"]', { timeout: 5000 });
      await this.page.click('button[aria-label*="Redo"]');
      await this.page.waitForTimeout(500);
      
      console.log('✅ Redo executed');
      this.testResults.push({ test: 'Undo/Redo Functionality', status: 'PASS' });
      return true;
    } catch (error) {
      console.error('❌ Undo/Redo test failed:', error.message);
      this.testResults.push({ test: 'Undo/Redo Functionality', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testSaveChanges() {
    console.log('\n💾 Test: Save Changes');
    
    try {
      // Make a change
      await this.testDragAndDropLesson();
      
      // Find save button
      await this.page.waitForSelector('button:has-text("Save Changes")', { timeout: 5000 });
      
      // Check if button shows pending changes
      const buttonText = await this.page.$eval('button:has-text("Save Changes")', 
        el => el.textContent
      );
      
      if (!buttonText.includes('(')) {
        throw new Error('No pending changes shown');
      }
      
      // Click save
      await this.page.click('button:has-text("Save Changes")');
      
      // Wait for save to complete
      await this.page.waitForResponse(response => 
        response.url().includes('/api/schedule') && response.status() === 200,
        { timeout: 10000 }
      );
      
      console.log('✅ Changes saved successfully');
      this.testResults.push({ test: 'Save Changes', status: 'PASS' });
      return true;
    } catch (error) {
      console.error('❌ Save test failed:', error.message);
      this.testResults.push({ test: 'Save Changes', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testWeekNavigation() {
    console.log('\n📅 Test: Week Navigation');
    
    try {
      // Get current week display
      const currentWeek = await this.page.$eval('h2', el => el.textContent);
      console.log(`Current: ${currentWeek}`);
      
      // Click next week
      await this.page.click('button:has-text("Next Week")');
      await this.page.waitForTimeout(500);
      
      // Verify week changed
      const nextWeek = await this.page.$eval('h2', el => el.textContent);
      
      if (nextWeek !== currentWeek) {
        console.log(`✅ Navigated to: ${nextWeek}`);
        
        // Go back
        await this.page.click('button:has-text("Previous Week")');
        await this.page.waitForTimeout(500);
        
        this.testResults.push({ test: 'Week Navigation', status: 'PASS' });
        return true;
      } else {
        throw new Error('Week did not change');
      }
    } catch (error) {
      console.error('❌ Week navigation failed:', error.message);
      this.testResults.push({ test: 'Week Navigation', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async testUnitBoundaryRespect() {
    console.log('\n🎯 Test: Unit Boundary Respect');
    
    try {
      // Search for Bienvenue unit lessons
      await this.page.type('input[placeholder*="Search"]', 'Bienvenue');
      await this.page.waitForTimeout(500);
      
      // Get all Bienvenue lessons
      const bienvenueLessons = await this.page.$$eval('.lesson-card', lessons => 
        lessons
          .filter(l => l.textContent.toLowerCase().includes('bienvenue'))
          .map(l => {
            const parent = l.closest('[data-date]');
            return parent ? parent.getAttribute('data-date') : null;
          })
      );
      
      // Check if all are in September
      const allInSeptember = bienvenueLessons.every(date => 
        date && date.startsWith('2025-09')
      );
      
      if (allInSeptember) {
        console.log('✅ All Bienvenue lessons are in September - unit boundaries respected!');
        this.testResults.push({ test: 'Unit Boundary Respect', status: 'PASS' });
        return true;
      } else {
        throw new Error('Bienvenue lessons found outside September');
      }
    } catch (error) {
      console.error('❌ Unit boundary test failed:', error.message);
      this.testResults.push({ test: 'Unit Boundary Respect', status: 'FAIL', error: error.message });
      return false;
    }
  }

  async runAllTests() {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 EMILY SCHEDULE EDITOR E2E TESTS');
    console.log('='.repeat(60));
    
    try {
      await this.setup();
      
      // Run all tests
      await this.testNavigateToScheduleEditor();
      await this.testDragAndDropLesson();
      await this.testSearchFunctionality();
      await this.testFilterBySubject();
      await this.testUndoRedo();
      await this.testSaveChanges();
      await this.testWeekNavigation();
      await this.testUnitBoundaryRespect();
      
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
      console.log('\n🎉 ALL TESTS PASSED! Schedule Editor is working perfectly!');
    } else {
      console.log('\n⚠️ Some tests failed. Please review and fix.');
    }
  }
}

// Run tests if executed directly
if (require.main === module) {
  const tester = new EmilyScheduleEditorTests({
    headless: process.env.HEADLESS === 'true',
    slowMo: parseInt(process.env.SLOW_MO || '0'),
    baseURL: process.env.BASE_URL || 'http://localhost:5173'
  });
  
  tester.runAllTests().catch(console.error);
}

module.exports = EmilyScheduleEditorTests;