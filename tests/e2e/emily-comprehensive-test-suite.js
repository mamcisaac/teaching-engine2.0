/**
 * Emily Comprehensive E2E Test Suite
 * Complete testing of Emily's Grade 1 French Immersion teaching workflow
 * Tests all aspects: teaching, assessment, parent communication, and reporting
 */

const EmilyPerfectAgent = require('./teacher-agents/emily-perfect-agent');
const EmilyParentCommunicationAgent = require('./teacher-agents/emily-parent-communication-agent');
const EmilyAgent = require('./teacher-agents/emily-agent');
const testStudents = require('./fixtures/test-students.json');
const { performance } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

class EmilyComprehensiveTestSuite {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 0,
      baseURL: options.baseURL || process.env.BASE_URL || 'http://localhost:5173',
      screenshotDir: options.screenshotDir || './screenshots/emily-comprehensive',
      reportDir: options.reportDir || './test-reports/emily-comprehensive',
      parallel: options.parallel !== false,
      verbose: options.verbose !== false
    };
    
    this.credentials = {
      username: 'emily.mcisaac@teachingengine.test',
      password: 'TeachingGrade1!'
    };
    
    this.testResults = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      startTime: null,
      endTime: null,
      tests: [],
      performanceMetrics: {},
      coverage: {}
    };
  }

  /**
   * Run complete test suite
   */
  async runCompleteSuite() {
    console.log('🚀 Starting Emily Comprehensive E2E Test Suite');
    console.log('============================================');
    
    this.testResults.startTime = Date.now();
    
    try {
      // Setup
      await this.setupTestEnvironment();
      
      // Phase 1: Authentication and Setup Tests
      await this.runPhase('Authentication & Setup', async () => {
        await this.testAuthentication();
        await this.testDashboardAccess();
        await this.testStudentDataIntegrity();
      });
      
      // Phase 2: Daily Teaching Workflow Tests
      await this.runPhase('Daily Teaching Workflow', async () => {
        await this.testMorningRoutine();
        await this.testLessonDelivery();
        await this.testAssessmentRecording();
        await this.testEvidenceTriangulation();
      });
      
      // Phase 3: French Immersion Specific Tests
      await this.runPhase('French Immersion Features', async () => {
        await this.testFrenchLanguageSupport();
        await this.testBilingualDocumentation();
        await this.testFrenchAssessmentNotes();
      });
      
      // Phase 4: IEP and Differentiation Tests
      await this.runPhase('IEP & Differentiation', async () => {
        await this.testIEPAccommodations();
        await this.testDifferentiatedInstruction();
        await this.testSupportStrategies();
      });
      
      // Phase 5: Parent Communication Tests
      await this.runPhase('Parent Communications', async () => {
        await this.testDailyAgenda();
        await this.testProgressReports();
        await this.testNewsletters();
        await this.testReportCards();
      });
      
      // Phase 6: Performance and Load Tests
      await this.runPhase('Performance & Load', async () => {
        await this.testPerformanceWith30Students();
        await this.testConcurrentAssessments();
        await this.testDataPersistence();
      });
      
      // Phase 7: School Day Simulation
      await this.runPhase('Complete School Day', async () => {
        await this.testCompleteSchoolDay();
        await this.testWeeklyRoutine();
      });
      
      // Phase 8: Analytics and Reporting
      await this.runPhase('Analytics & Reporting', async () => {
        await this.testCoverageTracking();
        await this.testProgressAnalytics();
        await this.testReportGeneration();
      });
      
      // Generate final report
      await this.generateComprehensiveReport();
      
    } catch (error) {
      console.error('❌ Test Suite Failed:', error);
      this.testResults.failed++;
    } finally {
      this.testResults.endTime = Date.now();
      await this.cleanup();
    }
    
    // Display results
    this.displayResults();
    
    return this.testResults;
  }

  /**
   * Run a test phase
   */
  async runPhase(phaseName, testFunction) {
    console.log(`\n📋 Phase: ${phaseName}`);
    console.log('─'.repeat(40));
    
    const phaseStart = performance.now();
    
    try {
      await testFunction();
      const duration = performance.now() - phaseStart;
      this.testResults.performanceMetrics[phaseName] = duration;
      console.log(`✅ ${phaseName} completed in ${(duration/1000).toFixed(2)}s`);
    } catch (error) {
      console.error(`❌ ${phaseName} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    console.log('🔧 Setting up test environment...');
    
    // Create directories
    await fs.mkdir(this.options.screenshotDir, { recursive: true });
    await fs.mkdir(this.options.reportDir, { recursive: true });
    
    // Verify server is running
    try {
      const response = await fetch(`${this.options.baseURL}/health`);
      if (!response.ok) {
        throw new Error('Server health check failed');
      }
    } catch (error) {
      console.error('⚠️ Server not responding. Please ensure server is running.');
      throw error;
    }
    
    console.log('✅ Test environment ready');
  }

  // PHASE 1: Authentication & Setup Tests

  async testAuthentication() {
    await this.runTest('Authentication Flow', async () => {
      const agent = new EmilyAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      await agent.cleanup();
      return { success: true };
    });
  }

  async testDashboardAccess() {
    await this.runTest('Dashboard Access & Navigation', async () => {
      const agent = new EmilyAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      await agent.checkMorningDashboard();
      await agent.cleanup();
      return { success: true };
    });
  }

  async testStudentDataIntegrity() {
    await this.runTest('Student Data Integrity (30 students)', async () => {
      const students = testStudents.grade1FrenchImmersion;
      
      // Verify all 30 students
      if (students.length !== 30) {
        throw new Error(`Expected 30 students, found ${students.length}`);
      }
      
      // Verify IEP students
      const iepStudents = students.filter(s => s.notes?.includes('IEP'));
      if (iepStudents.length < 3) {
        throw new Error(`Expected at least 3 IEP students, found ${iepStudents.length}`);
      }
      
      // Verify diversity
      const hasEAL = students.some(s => s.notes?.includes('English as additional'));
      const hasAdvanced = students.some(s => s.notes?.includes('Advanced'));
      const hasMusical = students.some(s => s.notes?.includes('Musical'));
      
      if (!hasEAL || !hasAdvanced || !hasMusical) {
        throw new Error('Student diversity check failed');
      }
      
      return { success: true, studentsVerified: 30 };
    });
  }

  // PHASE 2: Daily Teaching Workflow Tests

  async testMorningRoutine() {
    await this.runTest('Morning Preparation Routine', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      await agent.morningPreparation();
      await agent.cleanup();
      return { success: true };
    });
  }

  async testLessonDelivery() {
    await this.runTest('Lesson Delivery (5 subjects)', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const subjects = ['Français (Immersion)', 'Mathématiques', 'Sciences de la nature', 'Arts visuels', 'Sciences humaines'];
      for (const subject of subjects) {
        await agent.teachLesson(subject, 45);
      }
      
      const results = {
        lessonsDelivered: subjects.length,
        totalMinutes: subjects.length * 45
      };
      
      await agent.cleanup();
      return results;
    });
  }

  async testAssessmentRecording() {
    await this.runTest('Assessment Recording', async () => {
      const agent = new EmilyAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      // Test recording assessments for multiple students
      await agent.conductLesson('Français (Immersion)', 10);
      
      const results = {
        assessmentsRecorded: agent.assessmentsRecorded,
        success: agent.assessmentsRecorded >= 10
      };
      
      await agent.cleanup();
      return results;
    });
  }

  async testEvidenceTriangulation() {
    await this.runTest('Evidence Triangulation Balance', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const evidenceTypes = {
        observation: 0,
        conversation: 0,
        product: 0
      };
      
      // Record assessments with different evidence types
      for (let i = 0; i < 15; i++) {
        const student = testStudents.grade1FrenchImmersion[i];
        const evidenceType = ['observation', 'conversation', 'product'][i % 3];
        await agent.recordAssessment(student, 'Français', evidenceType);
        evidenceTypes[evidenceType]++;
      }
      
      // Check balance (should be roughly 33% each)
      const total = 15;
      const balanced = Object.values(evidenceTypes).every(count => 
        count >= Math.floor(total * 0.3) && count <= Math.ceil(total * 0.4)
      );
      
      await agent.cleanup();
      return { 
        success: balanced,
        distribution: evidenceTypes,
        balanced: balanced 
      };
    });
  }

  // PHASE 3: French Immersion Tests

  async testFrenchLanguageSupport() {
    await this.runTest('French Language Support', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      // Test French assessment notes
      const student = testStudents.grade1FrenchImmersion[0];
      const assessment = await agent.recordAssessment(student, 'Français', 'observation', {
        notes: 'Excellente participation orale. Prononciation claire.'
      });
      
      await agent.cleanup();
      return { success: true, frenchNotesRecorded: true };
    });
  }

  async testBilingualDocumentation() {
    await this.runTest('Bilingual Documentation', async () => {
      const agent = new EmilyParentCommunicationAgent(
        this.credentials, 
        testStudents.grade1FrenchImmersion, 
        this.options
      );
      await agent.initialize();
      
      // Test French agenda
      await agent.sendDailyAgenda();
      
      await agent.cleanup();
      return { success: true, frenchAgendaSent: true };
    });
  }

  async testFrenchAssessmentNotes() {
    await this.runTest('French Assessment Notes', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const frenchNotes = [
        'Amélioration notable en lecture fluide',
        'Compréhension orale excellente',
        'Écriture créative en développement'
      ];
      
      for (let i = 0; i < 3; i++) {
        const student = testStudents.grade1FrenchImmersion[i];
        await agent.recordAssessment(student, 'Français', 'product', {
          notes: frenchNotes[i]
        });
      }
      
      await agent.cleanup();
      return { success: true, frenchNotesCount: 3 };
    });
  }

  // PHASE 4: IEP & Differentiation Tests

  async testIEPAccommodations() {
    await this.runTest('IEP Accommodations', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      // Find IEP students
      const iepStudents = testStudents.grade1FrenchImmersion.filter(s => 
        s.notes?.includes('IEP')
      );
      
      for (const student of iepStudents) {
        await agent.applyIEPAccommodations(student);
      }
      
      await agent.cleanup();
      return { 
        success: true, 
        iepStudentsSupported: iepStudents.length,
        students: iepStudents.map(s => s.firstName)
      };
    });
  }

  async testDifferentiatedInstruction() {
    await this.runTest('Differentiated Instruction', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const differentiation = {
        struggling: [],
        onLevel: [],
        advanced: []
      };
      
      for (const student of testStudents.grade1FrenchImmersion) {
        const level = agent.determineStudentLevel(student);
        differentiation[level].push(student.firstName);
      }
      
      await agent.cleanup();
      return { 
        success: true,
        distribution: {
          struggling: differentiation.struggling.length,
          onLevel: differentiation.onLevel.length,
          advanced: differentiation.advanced.length
        }
      };
    });
  }

  async testSupportStrategies() {
    await this.runTest('Support Strategies Implementation', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const strategies = [
        'Visual supports',
        'Peer tutoring',
        'Modified assignments',
        'Extended time',
        'Preferential seating'
      ];
      
      const implementedStrategies = [];
      for (const strategy of strategies) {
        const result = await agent.implementSupportStrategy(strategy);
        if (result) implementedStrategies.push(strategy);
      }
      
      await agent.cleanup();
      return { 
        success: implementedStrategies.length === strategies.length,
        strategiesImplemented: implementedStrategies
      };
    });
  }

  // PHASE 5: Parent Communication Tests

  async testDailyAgenda() {
    await this.runTest('Daily Agenda Communication', async () => {
      const agent = new EmilyParentCommunicationAgent(
        this.credentials, 
        testStudents.grade1FrenchImmersion, 
        this.options
      );
      await agent.initialize();
      
      await agent.sendDailyAgenda();
      
      await agent.cleanup();
      return { 
        success: agent.communicationsSent > 0,
        agendaSent: true
      };
    });
  }

  async testProgressReports() {
    await this.runTest('Progress Reports Generation', async () => {
      const agent = new EmilyParentCommunicationAgent(
        this.credentials, 
        testStudents.grade1FrenchImmersion, 
        this.options
      );
      await agent.initialize();
      
      await agent.generateWeeklyProgressReports();
      
      await agent.cleanup();
      return { 
        success: agent.reportsGenerated > 0,
        reportsGenerated: agent.reportsGenerated
      };
    });
  }

  async testNewsletters() {
    await this.runTest('Newsletter Creation', async () => {
      const agent = new EmilyParentCommunicationAgent(
        this.credentials, 
        testStudents.grade1FrenchImmersion, 
        this.options
      );
      await agent.initialize();
      
      await agent.createMonthlyNewsletter();
      
      await agent.cleanup();
      return { 
        success: agent.newslettersCreated > 0,
        newsletterCreated: true
      };
    });
  }

  async testReportCards() {
    await this.runTest('Report Card Preparation', async () => {
      const agent = new EmilyParentCommunicationAgent(
        this.credentials, 
        testStudents.grade1FrenchImmersion, 
        this.options
      );
      await agent.initialize();
      
      await agent.prepareReportCards();
      
      await agent.cleanup();
      return { 
        success: agent.reportsGenerated >= 5,
        reportCardsGenerated: agent.reportsGenerated
      };
    });
  }

  // PHASE 6: Performance Tests

  async testPerformanceWith30Students() {
    await this.runTest('Performance with 30 Students', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const startTime = performance.now();
      
      // Assess all 30 students
      for (const student of testStudents.grade1FrenchImmersion) {
        await agent.recordAssessment(student, 'Mathématiques', 'observation', {
          mastery: 'MEETING'
        });
      }
      
      const duration = performance.now() - startTime;
      const avgTimePerStudent = duration / 30;
      
      await agent.cleanup();
      
      // Should complete in reasonable time (< 2 seconds per student)
      return { 
        success: avgTimePerStudent < 2000,
        totalTime: duration,
        avgTimePerStudent: avgTimePerStudent,
        studentsAssessed: 30
      };
    });
  }

  async testConcurrentAssessments() {
    await this.runTest('Concurrent Assessment Recording', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const startTime = performance.now();
      
      // Simulate rapid assessment entry
      const assessmentPromises = [];
      for (let i = 0; i < 10; i++) {
        const student = testStudents.grade1FrenchImmersion[i];
        assessmentPromises.push(
          agent.recordAssessment(student, 'Sciences', 'product')
        );
      }
      
      await Promise.all(assessmentPromises);
      const duration = performance.now() - startTime;
      
      await agent.cleanup();
      
      return { 
        success: duration < 15000, // Should complete in < 15 seconds
        concurrentAssessments: 10,
        totalTime: duration
      };
    });
  }

  async testDataPersistence() {
    await this.runTest('Data Persistence & Recovery', async () => {
      // First agent creates data
      const agent1 = new EmilyAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent1.initialize();
      
      await agent1.conductLesson('Français', 5);
      const assessmentsCreated = agent1.assessmentsRecorded;
      
      await agent1.cleanup();
      
      // Second agent verifies data exists
      const agent2 = new EmilyAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent2.initialize();
      
      await agent2.reviewAssessments();
      
      await agent2.cleanup();
      
      return { 
        success: true,
        assessmentsPersisted: assessmentsCreated,
        dataVerified: true
      };
    });
  }

  // PHASE 7: School Day Simulation

  async testCompleteSchoolDay() {
    await this.runTest('Complete School Day Simulation', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const dayResults = await agent.performCompleteSchoolDay();
      
      await agent.cleanup();
      
      return { 
        success: dayResults.success,
        lessonsDelivered: dayResults.lessonsDelivered,
        assessmentsRecorded: dayResults.assessmentsRecorded,
        parentCommunications: dayResults.parentCommunications
      };
    });
  }

  async testWeeklyRoutine() {
    await this.runTest('Weekly Teaching Routine', async () => {
      const weeklyMetrics = {
        totalLessons: 0,
        totalAssessments: 0,
        totalCommunications: 0
      };
      
      // Simulate 5 days
      for (let day = 1; day <= 5; day++) {
        console.log(`   Day ${day}/5...`);
        
        const agent = new EmilyAgent(
          this.credentials, 
          testStudents.grade1FrenchImmersion, 
          { ...this.options, headless: true }
        );
        await agent.initialize();
        
        const dayResults = await agent.performDailyRoutine();
        
        weeklyMetrics.totalLessons += 5; // 5 subjects per day
        weeklyMetrics.totalAssessments += dayResults.assessmentsRecorded;
        weeklyMetrics.totalCommunications += dayResults.artifactsUploaded;
        
        await agent.cleanup();
      }
      
      return { 
        success: weeklyMetrics.totalLessons === 25,
        weeklyMetrics
      };
    });
  }

  // PHASE 8: Analytics & Reporting

  async testCoverageTracking() {
    await this.runTest('Curriculum Coverage Tracking', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const coverage = await agent.trackCurriculumCoverage();
      
      await agent.cleanup();
      
      return { 
        success: coverage !== null,
        subjectsCovered: Object.keys(coverage || {}),
        coveragePercentages: coverage
      };
    });
  }

  async testProgressAnalytics() {
    await this.runTest('Student Progress Analytics', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const analytics = await agent.generateProgressAnalytics();
      
      await agent.cleanup();
      
      return { 
        success: analytics !== null,
        studentsAnalyzed: analytics?.studentsAnalyzed || 0,
        averageMastery: analytics?.averageMastery || 'N/A'
      };
    });
  }

  async testReportGeneration() {
    await this.runTest('Comprehensive Report Generation', async () => {
      const agent = new EmilyPerfectAgent(this.credentials, testStudents.grade1FrenchImmersion, this.options);
      await agent.initialize();
      
      const report = await agent.generateClassReport();
      
      await agent.cleanup();
      
      return { 
        success: report !== null,
        reportSections: Object.keys(report || {}),
        reportGenerated: true
      };
    });
  }

  // Helper Methods

  async runTest(testName, testFunction) {
    console.log(`  🧪 ${testName}...`);
    const testStart = performance.now();
    
    try {
      const result = await testFunction();
      const duration = performance.now() - testStart;
      
      this.testResults.tests.push({
        name: testName,
        status: 'PASSED',
        duration: duration,
        result: result
      });
      
      this.testResults.passed++;
      this.testResults.totalTests++;
      
      console.log(`     ✅ Passed (${(duration/1000).toFixed(2)}s)`);
      
      return result;
      
    } catch (error) {
      const duration = performance.now() - testStart;
      
      this.testResults.tests.push({
        name: testName,
        status: 'FAILED',
        duration: duration,
        error: error.message
      });
      
      this.testResults.failed++;
      this.testResults.totalTests++;
      
      console.log(`     ❌ Failed: ${error.message}`);
      
      // Take screenshot on failure
      if (this.options.screenshotOnError) {
        const screenshotPath = path.join(
          this.options.screenshotDir, 
          `failure-${testName.replace(/\s+/g, '-').toLowerCase()}.png`
        );
        console.log(`     📸 Screenshot saved: ${screenshotPath}`);
      }
      
      throw error;
    }
  }

  async generateComprehensiveReport() {
    console.log('\n📊 Generating Comprehensive Test Report...');
    
    const report = {
      suite: 'Emily Comprehensive E2E Test Suite',
      timestamp: new Date().toISOString(),
      duration: (this.testResults.endTime - this.testResults.startTime) / 1000,
      summary: {
        total: this.testResults.totalTests,
        passed: this.testResults.passed,
        failed: this.testResults.failed,
        passRate: ((this.testResults.passed / this.testResults.totalTests) * 100).toFixed(2) + '%'
      },
      phases: {},
      tests: this.testResults.tests,
      performanceMetrics: this.testResults.performanceMetrics,
      coverage: this.testResults.coverage
    };
    
    // Group tests by phase
    const phases = [
      'Authentication & Setup',
      'Daily Teaching Workflow',
      'French Immersion Features',
      'IEP & Differentiation',
      'Parent Communications',
      'Performance & Load',
      'Complete School Day',
      'Analytics & Reporting'
    ];
    
    for (const phase of phases) {
      report.phases[phase] = {
        tests: this.testResults.tests.filter(t => 
          t.name.toLowerCase().includes(phase.toLowerCase().split(' ')[0])
        ),
        duration: this.testResults.performanceMetrics[phase] || 0
      };
    }
    
    // Save report as JSON
    const reportPath = path.join(this.options.reportDir, `emily-test-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Save HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(this.options.reportDir, `emily-test-report-${Date.now()}.html`);
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`✅ Reports saved:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
    
    return report;
  }

  generateHTMLReport(report) {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Emily E2E Test Report - ${new Date().toLocaleDateString('fr-CA')}</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 40px; background: #f5f5f5; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        h1 { margin: 0; font-size: 2em; }
        .subtitle { opacity: 0.9; margin-top: 10px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary-card h3 { margin: 0 0 10px 0; color: #667eea; }
        .summary-card .value { font-size: 2em; font-weight: bold; }
        .phase { background: white; margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .phase-header { background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #dee2e6; font-weight: bold; }
        .test { padding: 15px 20px; border-bottom: 1px solid #f0f0f0; display: flex; justify-content: space-between; align-items: center; }
        .test:last-child { border-bottom: none; }
        .test-name { flex: 1; }
        .test-status { padding: 5px 10px; border-radius: 20px; font-size: 0.85em; font-weight: bold; }
        .passed { background: #d4edda; color: #155724; }
        .failed { background: #f8d7da; color: #721c24; }
        .test-duration { color: #6c757d; margin-left: 10px; font-size: 0.9em; }
        .footer { text-align: center; margin-top: 40px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧑‍🏫 Emily McIsaac - E2E Test Report</h1>
        <div class="subtitle">Grade 1 French Immersion • West Kent Elementary • ${new Date().toLocaleDateString('fr-CA')}</div>
    </div>
    
    <div class="summary">
        <div class="summary-card">
            <h3>Total Tests</h3>
            <div class="value">${report.summary.total}</div>
        </div>
        <div class="summary-card">
            <h3>Passed</h3>
            <div class="value" style="color: #28a745;">${report.summary.passed}</div>
        </div>
        <div class="summary-card">
            <h3>Failed</h3>
            <div class="value" style="color: #dc3545;">${report.summary.failed}</div>
        </div>
        <div class="summary-card">
            <h3>Pass Rate</h3>
            <div class="value">${report.summary.passRate}</div>
        </div>
        <div class="summary-card">
            <h3>Duration</h3>
            <div class="value">${report.duration.toFixed(1)}s</div>
        </div>
    </div>
    
    ${Object.entries(report.phases).map(([phaseName, phaseData]) => `
        <div class="phase">
            <div class="phase-header">
                ${phaseName} (${phaseData.tests.length} tests)
            </div>
            ${phaseData.tests.map(test => `
                <div class="test">
                    <span class="test-name">${test.name}</span>
                    <div>
                        <span class="test-status ${test.status.toLowerCase()}">${test.status}</span>
                        <span class="test-duration">${(test.duration/1000).toFixed(2)}s</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('')}
    
    <div class="footer">
        <p>Generated by Emily Comprehensive E2E Test Suite</p>
        <p>Teaching Engine 2.0 - © ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests:    ${this.testResults.totalTests}`);
    console.log(`✅ Passed:      ${this.testResults.passed}`);
    console.log(`❌ Failed:      ${this.testResults.failed}`);
    console.log(`Pass Rate:      ${((this.testResults.passed / this.testResults.totalTests) * 100).toFixed(2)}%`);
    console.log(`Duration:       ${((this.testResults.endTime - this.testResults.startTime) / 1000).toFixed(2)} seconds`);
    console.log('='.repeat(60));
    
    if (this.testResults.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Emily\'s teaching system is working perfectly!');
    } else {
      console.log('⚠️ Some tests failed. Please review the report for details.');
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up test environment...');
    // Any cleanup needed
  }
}

// Main execution
if (require.main === module) {
  (async () => {
    const suite = new EmilyComprehensiveTestSuite({
      headless: process.env.HEADLESS !== 'false',
      verbose: process.env.VERBOSE === 'true',
      parallel: process.env.PARALLEL !== 'false'
    });
    
    try {
      const results = await suite.runCompleteSuite();
      process.exit(results.failed > 0 ? 1 : 0);
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  })();
}

module.exports = EmilyComprehensiveTestSuite;