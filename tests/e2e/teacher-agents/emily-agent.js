/**
 * Emily Agent - Primary Grade 1 French Immersion Teacher
 * Performs daily assessment routines and classroom management
 */

const puppeteer = require('puppeteer');
const NavigationHelper = require('../helpers/navigation');
const SimpleAssertionHelper = require('../helpers/simple-assertions');
const { 
  generateAssessment, 
  generateArtifact,
  generateAssessmentNote,
  randomChoice,
  randomInt
} = require('../helpers/data-generators');

class EmilyAgent {
  constructor(credentials, students, options = {}) {
    this.credentials = credentials;
    this.students = students;
    this.options = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 0,
      baseURL: options.baseURL || 'http://localhost:5173',
      screenshotOnError: options.screenshotOnError !== false
    };
    
    this.browser = null;
    this.page = null;
    this.nav = null;
    this.assert = null;
    this.assessmentsRecorded = 0;
    this.artifactsUploaded = 0;
  }

  async initialize() {
    console.log('🧑‍🏫 Emily Agent: Initializing...');
    
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo,
      defaultViewport: { width: 1920, height: 1080 },
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });

    this.page = await this.browser.newPage();
    this.nav = new NavigationHelper(this.page);
    this.assert = new SimpleAssertionHelper(this.page);

    // Set up error handling
    this.page.on('pageerror', error => {
      console.error('❌ Emily Agent - Page Error:', error.message);
      if (this.options.screenshotOnError) {
        this.nav.screenshot('emily-error');
      }
    });

    // Login
    await this.nav.login(this.credentials);
    console.log('✅ Emily Agent: Logged in successfully');
  }

  /**
   * Perform complete daily teaching routine
   */
  async performDailyRoutine() {
    console.log('📅 Emily Agent: Starting daily routine...');
    
    try {
      // Morning: Check dashboard and alerts
      await this.checkMorningDashboard();
      
      // First Period: French Language Arts
      await this.conductLesson('Français (Immersion)', 8);
      
      // Second Period: Mathematics
      await this.conductLesson('Mathématiques', 6);
      
      // Upload morning work samples
      await this.uploadStudentWork(5);
      
      // Third Period: Science
      await this.conductLesson('Sciences de la nature', 5);
      
      // Lunch break - Review morning assessments
      await this.reviewAssessments();
      
      // Afternoon: Arts and Social Studies
      await this.conductLesson('Arts visuels', 4);
      await this.conductLesson('Sciences humaines', 4);
      
      // End of day: Documentation and parent notes
      await this.endOfDayDocumentation();
      
      console.log(`✅ Emily Agent: Daily routine complete!`);
      console.log(`   📊 Assessments recorded: ${this.assessmentsRecorded}`);
      console.log(`   📁 Artifacts uploaded: ${this.artifactsUploaded}`);
      
      return {
        success: true,
        assessmentsRecorded: this.assessmentsRecorded,
        artifactsUploaded: this.artifactsUploaded
      };
      
    } catch (error) {
      console.error('❌ Emily Agent - Routine Error:', error);
      await this.nav.screenshot('emily-routine-error');
      throw error;
    }
  }

  /**
   * Check morning dashboard for alerts and overview
   */
  async checkMorningDashboard() {
    console.log('🌅 Emily: Checking morning dashboard...');
    
    await this.nav.goto('/dashboard');
    await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

    // Check for students needing attention
    const alerts = await this.page.$$('[data-testid="student-alert"]');
    console.log(`   📍 ${alerts.length} students need attention today`);

    // Review class overview
    const statsExists = await this.nav.exists('[data-testid="class-stats"]');
    if (statsExists) {
      const stats = await this.page.$eval('[data-testid="class-stats"]', el => ({
        totalStudents: el.querySelector('[data-stat="total"]')?.textContent,
        assessedYesterday: el.querySelector('[data-stat="assessed"]')?.textContent,
        pendingReview: el.querySelector('[data-stat="pending"]')?.textContent
      }));
      console.log(`   📊 Class stats:`, stats);
    }

    await this.nav.screenshot('emily-morning-dashboard');
  }

  /**
   * Conduct a lesson and record assessments
   */
  async conductLesson(subject, numAssessments) {
    console.log(`📚 Emily: Teaching ${subject} - Recording ${numAssessments} assessments`);
    
    await this.nav.navigateToSection('assessment');
    
    // Select random students for assessment
    const studentsToAssess = this.selectRandomStudents(numAssessments);
    
    for (const student of studentsToAssess) {
      await this.recordStudentAssessment(student, subject);
      await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500))); // Brief pause between assessments
    }
  }

  /**
   * Record individual student assessment
   */
  async recordStudentAssessment(student, subject) {
    try {
      // Open quick assessment modal
      await this.page.click('[data-testid="quick-assess-btn"], [data-testid="add-assessment-btn"]');
      await this.page.waitForSelector('[data-testid="assessment-form"]', { timeout: 5000 });

      // Search and select student
      await this.page.type('[data-testid="student-search"], #studentSearch', student.firstName);
      await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));
      await this.page.click(`[data-student-id="${student.studentId}"]`);

      // Select subject
      await this.nav.selectOption('[data-testid="subject-select"], #subject', subject);

      // Select random expectation for this subject
      const expectations = await this.page.$$('[data-testid="expectation-option"]');
      if (expectations.length > 0) {
        const randomExpectation = expectations[randomInt(0, expectations.length - 1)];
        await randomExpectation.click();
      }

      // Set mastery level (realistic distribution)
      const masteryLevel = this.selectRealisticMasteryLevel(student);
      await this.page.click(`[data-testid="mastery-${masteryLevel.toLowerCase()}"]`);

      // Select evidence type (rotate through types)
      const evidenceTypes = ['observation', 'conversation', 'product'];
      const evidenceType = evidenceTypes[this.assessmentsRecorded % 3];
      await this.page.click(`[data-testid="evidence-${evidenceType}"]`);

      // Add professional notes
      const notes = generateAssessmentNote();
      await this.page.type('[data-testid="assessment-notes"], #notes, textarea[name="notes"]', notes);

      // Save assessment
      await this.page.click('[data-testid="save-assessment-btn"]');
      await this.nav.waitForSuccess();
      
      this.assessmentsRecorded++;
      console.log(`   ✅ Assessed ${student.firstName} in ${subject}: ${masteryLevel}`);

    } catch (error) {
      console.error(`   ❌ Failed to assess ${student.firstName}:`, error.message);
      // Continue with next student
    }
  }

  /**
   * Upload student work samples
   */
  async uploadStudentWork(numArtifacts) {
    console.log(`📸 Emily: Uploading ${numArtifacts} student work samples`);
    
    await this.nav.navigateToSection('artifacts');
    
    for (let i = 0; i < numArtifacts; i++) {
      const student = randomChoice(this.students);
      const artifactType = randomChoice(['photo', 'document']);
      
      try {
        await this.uploadArtifact(student, artifactType);
        await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1000)));
      } catch (error) {
        console.error(`   ❌ Failed to upload artifact:`, error.message);
      }
    }
  }

  /**
   * Upload individual artifact
   */
  async uploadArtifact(student, type) {
    // Click upload button
    await this.page.click('[data-testid="upload-artifact-btn"]');
    await this.page.waitForSelector('[data-testid="upload-form"]', { timeout: 5000 });

    // Select student
    await this.nav.selectOption('[data-testid="student-select"]', student.studentId);

    // Create mock file based on type
    const artifact = generateArtifact(student.studentId, type);
    
    // Simulate file selection (in real scenario, would use actual files)
    const fileInput = await this.page.$('input[type="file"]');
    if (fileInput) {
      // For testing, we'll create a data URL file
      await this.page.evaluate((fileName, mimeType) => {
        const input = document.querySelector('input[type="file"]');
        const dt = new DataTransfer();
        const file = new File(['test content'], fileName, { type: mimeType });
        dt.items.add(file);
        input.files = dt.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }, artifact.fileName, artifact.mimeType);
    }

    // Add title and description
    await this.page.type('[data-testid="artifact-title"], #title', artifact.title);
    await this.page.type('[data-testid="artifact-description"], #description', artifact.description);

    // Tag with learning outcomes
    const outcomeCheckboxes = await this.page.$$('[data-testid="outcome-checkbox"]');
    if (outcomeCheckboxes.length > 0) {
      const numToSelect = randomInt(1, Math.min(3, outcomeCheckboxes.length));
      for (let i = 0; i < numToSelect; i++) {
        await outcomeCheckboxes[i].click();
      }
    }

    // Upload
    await this.page.click('[data-testid="upload-btn"]');
    await this.nav.waitForSuccess();
    
    this.artifactsUploaded++;
    console.log(`   ✅ Uploaded ${type} for ${student.firstName}`);
  }

  /**
   * Review assessments at lunch
   */
  async reviewAssessments() {
    console.log('🍎 Emily: Reviewing morning assessments...');
    
    await this.nav.navigateToSection('analytics');
    await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));

    // Check evidence balance
    const triangulationExists = await this.nav.exists('[data-testid="evidence-triangulation"]');
    if (triangulationExists) {
      console.log('   📊 Checking evidence triangulation balance...');
      // Would normally analyze and adjust afternoon assessments based on gaps
    }

    // Review students needing support
    const needsSupportList = await this.page.$$('[data-testid="needs-support-student"]');
    console.log(`   🎯 ${needsSupportList.length} students identified for afternoon support`);
    
    await this.nav.screenshot('emily-lunch-review');
  }

  /**
   * End of day documentation
   */
  async endOfDayDocumentation() {
    console.log('🌇 Emily: Completing end-of-day documentation...');
    
    // Generate daily summary
    await this.nav.navigateToSection('reports');
    
    try {
      // Create daily class summary
      await this.page.click('[data-testid="generate-daily-summary"]');
      await this.page.waitForSelector('[data-testid="summary-form"]', { timeout: 5000 });
      
      // Add reflection notes
      const reflection = `Journée productive avec de bons progrès en ${randomChoice(['mathématiques', 'français', 'sciences'])}. ` +
                        `Les élèves ont démontré ${randomChoice(['une excellente collaboration', 'une créativité remarquable', 'une persévérance admirable'])}. ` +
                        `À continuer demain: ${randomChoice(['projet d\'art collectif', 'exploration scientifique', 'atelier d\'écriture créative'])}.`;
      
      await this.page.type('[data-testid="daily-reflection"], #reflection', reflection);
      
      // Save summary
      await this.page.click('[data-testid="save-summary-btn"]');
      await this.nav.waitForSuccess();
      
      console.log('   ✅ Daily summary completed');
    } catch (error) {
      console.error('   ⚠️ Could not complete daily summary:', error.message);
    }

    // Final analytics check
    await this.nav.navigateToSection('analytics');
    await this.page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2000)));
    
    const dailyStats = await this.page.$eval('[data-testid="daily-stats"]', el => ({
      assessmentsToday: el.querySelector('[data-stat="assessments-today"]')?.textContent || '0',
      artifactsToday: el.querySelector('[data-stat="artifacts-today"]')?.textContent || '0',
      studentsAssessed: el.querySelector('[data-stat="students-assessed"]')?.textContent || '0'
    })).catch(() => ({ assessmentsToday: '0', artifactsToday: '0', studentsAssessed: '0' }));
    
    console.log('   📊 Daily statistics:', dailyStats);
    await this.nav.screenshot('emily-end-of-day');
  }

  /**
   * Helper: Select random students
   */
  selectRandomStudents(count) {
    const shuffled = [...this.students].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Helper: Select realistic mastery level
   */
  selectRealisticMasteryLevel(student) {
    // Simulate realistic distribution based on student notes
    const notes = student.notes?.toLowerCase() || '';
    
    if (notes.includes('excels') || notes.includes('advanced')) {
      return randomChoice(['MEETING', 'EXCEEDING', 'EXCEEDING']);
    } else if (notes.includes('iep') || notes.includes('support')) {
      return randomChoice(['NOT_YET', 'APPROACHING', 'APPROACHING']);
    } else {
      // Most students are meeting expectations
      const levels = ['APPROACHING', 'MEETING', 'MEETING', 'MEETING', 'EXCEEDING'];
      return randomChoice(levels);
    }
  }

  /**
   * Cleanup
   */
  async cleanup() {
    console.log('🧹 Emily Agent: Cleaning up...');
    
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = EmilyAgent;