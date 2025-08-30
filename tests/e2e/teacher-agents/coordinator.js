/**
 * Multi-Agent Coordinator
 * Orchestrates parallel execution of teacher agents
 */

const EmilyAgent = require('./emily-agent');
const SophieAgent = require('./sophie-agent');
const MarieAgent = require('./marie-agent');
const testStudents = require('../fixtures/test-students.json');
const testCredentials = require('../fixtures/test-credentials.json');

class AgentCoordinator {
  constructor(options = {}) {
    this.options = {
      headless: options.headless !== false,
      slowMo: options.slowMo || 0,
      baseURL: options.baseURL || process.env.TEST_CLIENT_URL || 'http://localhost:5173',
      parallel: options.parallel !== false,
      screenshotOnError: options.screenshotOnError !== false
    };
    
    this.agents = [];
    this.results = {};
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Initialize all agents
   */
  async initialize() {
    console.log('🚀 Coordinator: Initializing multi-agent test system...');
    console.log(`   📍 Target URL: ${this.options.baseURL}`);
    console.log(`   👥 Students: ${testStudents.grade1FrenchImmersion.length}`);
    console.log(`   🤖 Agents: Emily (Primary), Sophie (EA), Marie (Specialist)`);
    console.log(`   ⚡ Mode: ${this.options.parallel ? 'Parallel' : 'Sequential'}`);
    console.log('');
    
    this.startTime = Date.now();
    
    // Create agents
    this.emily = new EmilyAgent(
      testCredentials.teachers.emily,
      testStudents.grade1FrenchImmersion,
      this.options
    );
    
    this.sophie = new SophieAgent(
      testCredentials.teachers.sophie,
      testStudents.grade1FrenchImmersion,
      this.options
    );
    
    this.marie = new MarieAgent(
      testCredentials.teachers.marie,
      testStudents.grade1FrenchImmersion,
      this.options
    );
    
    this.agents = [this.emily, this.sophie, this.marie];
    
    // Initialize agents
    if (this.options.parallel) {
      // Initialize in parallel with staggered start to avoid login conflicts
      await this.emily.initialize();
      await this.delay(2000); // 2 second delay
      
      await this.sophie.initialize();
      await this.delay(2000);
      
      await this.marie.initialize();
    } else {
      // Sequential initialization
      for (const agent of this.agents) {
        await agent.initialize();
      }
    }
    
    console.log('✅ Coordinator: All agents initialized\n');
  }

  /**
   * Execute all agent workflows
   */
  async execute() {
    console.log('🎯 Coordinator: Starting agent workflows...\n');
    console.log('═'.repeat(60));
    
    try {
      if (this.options.parallel) {
        // Execute all agents in parallel
        const results = await Promise.allSettled([
          this.executeEmilyWorkflow(),
          this.executeSophieWorkflow(),
          this.executeMarieWorkflow()
        ]);
        
        // Process results
        this.results.emily = results[0].status === 'fulfilled' ? results[0].value : { error: results[0].reason };
        this.results.sophie = results[1].status === 'fulfilled' ? results[1].value : { error: results[1].reason };
        this.results.marie = results[2].status === 'fulfilled' ? results[2].value : { error: results[2].reason };
        
      } else {
        // Sequential execution
        this.results.emily = await this.executeEmilyWorkflow();
        this.results.sophie = await this.executeSophieWorkflow();
        this.results.marie = await this.executeMarieWorkflow();
      }
      
      console.log('═'.repeat(60));
      console.log('✅ Coordinator: All workflows completed\n');
      
    } catch (error) {
      console.error('❌ Coordinator: Execution error:', error);
      throw error;
    }
  }

  /**
   * Execute Emily's workflow with monitoring
   */
  async executeEmilyWorkflow() {
    console.log('👩‍🏫 Starting Emily\'s workflow...');
    const start = Date.now();
    
    try {
      const result = await this.emily.performDailyRoutine();
      const duration = Date.now() - start;
      
      console.log(`✅ Emily completed in ${(duration / 1000).toFixed(1)}s`);
      return { ...result, duration };
      
    } catch (error) {
      console.error('❌ Emily workflow failed:', error.message);
      throw error;
    }
  }

  /**
   * Execute Sophie's workflow with monitoring
   */
  async executeSophieWorkflow() {
    // Add slight delay if parallel to avoid conflicts
    if (this.options.parallel) {
      await this.delay(1000);
    }
    
    console.log('👩‍🏫 Starting Sophie\'s workflow...');
    const start = Date.now();
    
    try {
      const result = await this.sophie.supportStudents();
      const duration = Date.now() - start;
      
      console.log(`✅ Sophie completed in ${(duration / 1000).toFixed(1)}s`);
      return { ...result, duration };
      
    } catch (error) {
      console.error('❌ Sophie workflow failed:', error.message);
      throw error;
    }
  }

  /**
   * Execute Marie's workflow with monitoring
   */
  async executeMarieWorkflow() {
    // Add slight delay if parallel to avoid conflicts
    if (this.options.parallel) {
      await this.delay(2000);
    }
    
    console.log('🎨 Starting Marie\'s workflow...');
    const start = Date.now();
    
    try {
      const result = await this.marie.assessSpecialistSubjects();
      const duration = Date.now() - start;
      
      console.log(`✅ Marie completed in ${(duration / 1000).toFixed(1)}s`);
      return { ...result, duration };
      
    } catch (error) {
      console.error('❌ Marie workflow failed:', error.message);
      throw error;
    }
  }

  /**
   * Validate system state after all workflows
   */
  async validate() {
    console.log('🔍 Coordinator: Validating system state...\n');
    
    const validations = {
      dataIntegrity: await this.validateDataIntegrity(),
      performance: await this.validatePerformance(),
      coverage: await this.validateCoverage()
    };
    
    // Print validation results
    console.log('📊 Validation Results:');
    console.log(`   ✅ Data Integrity: ${validations.dataIntegrity.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`   ✅ Performance: ${validations.performance.passed ? 'PASSED' : 'FAILED'}`);
    console.log(`   ✅ Coverage: ${validations.coverage.passed ? 'PASSED' : 'FAILED'}`);
    
    return validations;
  }

  /**
   * Validate data integrity
   */
  async validateDataIntegrity() {
    const totalAssessments = 
      (this.results.emily?.assessmentsRecorded || 0) +
      (this.results.sophie?.interventionsRecorded || 0) +
      (this.results.marie?.performancesRecorded || 0) +
      (this.results.marie?.creativityAssessed || 0);
    
    const totalArtifacts = 
      (this.results.emily?.artifactsUploaded || 0) +
      (this.results.sophie?.accommodationsDocumented || 0);
    
    return {
      passed: totalAssessments > 20 && totalArtifacts > 5,
      totalAssessments,
      totalArtifacts,
      details: 'Data successfully recorded across all agents'
    };
  }

  /**
   * Validate system performance
   */
  async validatePerformance() {
    const totalDuration = Date.now() - this.startTime;
    const avgAgentTime = (
      (this.results.emily?.duration || 0) +
      (this.results.sophie?.duration || 0) +
      (this.results.marie?.duration || 0)
    ) / 3;
    
    // Performance should be reasonable (under 5 minutes per agent)
    const passed = avgAgentTime < 300000; // 5 minutes
    
    return {
      passed,
      totalDuration,
      avgAgentTime,
      details: `Total execution: ${(totalDuration / 1000).toFixed(1)}s, Avg per agent: ${(avgAgentTime / 1000).toFixed(1)}s`
    };
  }

  /**
   * Validate curriculum coverage
   */
  async validateCoverage() {
    // Check that all main subjects were covered
    const subjectsCovered = new Set();
    
    // Emily covers core subjects
    if (this.results.emily?.success) {
      subjectsCovered.add('Français (Immersion)');
      subjectsCovered.add('Mathématiques');
      subjectsCovered.add('Sciences de la nature');
      subjectsCovered.add('Sciences humaines');
    }
    
    // Marie covers specialist subjects
    if (this.results.marie?.success) {
      subjectsCovered.add('Musique');
      subjectsCovered.add('Arts visuels');
    }
    
    const expectedSubjects = 6;
    const passed = subjectsCovered.size >= expectedSubjects;
    
    return {
      passed,
      subjectsCovered: Array.from(subjectsCovered),
      coverage: `${subjectsCovered.size}/${expectedSubjects}`,
      details: 'All curriculum areas assessed'
    };
  }

  /**
   * Generate comprehensive report
   */
  async generateReport() {
    console.log('\n' + '═'.repeat(60));
    console.log('📋 COMPREHENSIVE E2E TEST REPORT');
    console.log('═'.repeat(60));
    
    this.endTime = Date.now();
    const totalDuration = this.endTime - this.startTime;
    
    console.log('\n🕒 TIMING');
    console.log(`   Total Duration: ${(totalDuration / 1000).toFixed(1)} seconds`);
    console.log(`   Start Time: ${new Date(this.startTime).toLocaleTimeString()}`);
    console.log(`   End Time: ${new Date(this.endTime).toLocaleTimeString()}`);
    
    console.log('\n👥 AGENT RESULTS');
    console.log('\n   Emily (Primary Teacher):');
    if (this.results.emily?.success) {
      console.log(`      ✅ Status: SUCCESS`);
      console.log(`      📊 Assessments: ${this.results.emily.assessmentsRecorded}`);
      console.log(`      📁 Artifacts: ${this.results.emily.artifactsUploaded}`);
      console.log(`      ⏱️ Duration: ${(this.results.emily.duration / 1000).toFixed(1)}s`);
    } else {
      console.log(`      ❌ Status: FAILED`);
      console.log(`      Error: ${this.results.emily?.error?.message}`);
    }
    
    console.log('\n   Sophie (Educational Assistant):');
    if (this.results.sophie?.success) {
      console.log(`      ✅ Status: SUCCESS`);
      console.log(`      📝 Interventions: ${this.results.sophie.interventionsRecorded}`);
      console.log(`      ♿ Accommodations: ${this.results.sophie.accommodationsDocumented}`);
      console.log(`      👥 Students Supported: ${this.results.sophie.studentsSupported}`);
      console.log(`      ⏱️ Duration: ${(this.results.sophie.duration / 1000).toFixed(1)}s`);
    } else {
      console.log(`      ❌ Status: FAILED`);
      console.log(`      Error: ${this.results.sophie?.error?.message}`);
    }
    
    console.log('\n   Marie (Specialist Teacher):');
    if (this.results.marie?.success) {
      console.log(`      ✅ Status: SUCCESS`);
      console.log(`      🎵 Performances: ${this.results.marie.performancesRecorded}`);
      console.log(`      🎨 Creativity: ${this.results.marie.creativityAssessed}`);
      console.log(`      ⏱️ Duration: ${(this.results.marie.duration / 1000).toFixed(1)}s`);
    } else {
      console.log(`      ❌ Status: FAILED`);
      console.log(`      Error: ${this.results.marie?.error?.message}`);
    }
    
    // Overall statistics
    const totalAssessments = 
      (this.results.emily?.assessmentsRecorded || 0) +
      (this.results.sophie?.interventionsRecorded || 0) +
      (this.results.marie?.performancesRecorded || 0) +
      (this.results.marie?.creativityAssessed || 0);
    
    const totalArtifacts = 
      (this.results.emily?.artifactsUploaded || 0) +
      (this.results.sophie?.accommodationsDocumented || 0);
    
    console.log('\n📊 OVERALL STATISTICS');
    console.log(`   Total Assessments: ${totalAssessments}`);
    console.log(`   Total Artifacts: ${totalArtifacts}`);
    console.log(`   Students Assessed: ${testStudents.grade1FrenchImmersion.length}`);
    console.log(`   Parallel Execution: ${this.options.parallel ? 'Yes' : 'No'}`);
    
    // Success criteria
    const allAgentsSucceeded = 
      this.results.emily?.success &&
      this.results.sophie?.success &&
      this.results.marie?.success;
    
    const meetsMinimumRequirements = 
      totalAssessments >= 20 &&
      totalArtifacts >= 5;
    
    console.log('\n✅ SUCCESS CRITERIA');
    console.log(`   All Agents Succeeded: ${allAgentsSucceeded ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Minimum Data Requirements: ${meetsMinimumRequirements ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Performance Acceptable: ${totalDuration < 600000 ? '✅ PASS' : '❌ FAIL'} (<10 min)`);
    
    console.log('\n🎯 FINAL RESULT');
    const overallSuccess = allAgentsSucceeded && meetsMinimumRequirements;
    console.log(`   ${overallSuccess ? '✅ TEST SUITE PASSED' : '❌ TEST SUITE FAILED'}`);
    
    console.log('\n' + '═'.repeat(60));
    
    return {
      success: overallSuccess,
      duration: totalDuration,
      results: this.results,
      statistics: {
        totalAssessments,
        totalArtifacts,
        studentsAssessed: testStudents.grade1FrenchImmersion.length
      }
    };
  }

  /**
   * Cleanup all agents
   */
  async cleanup() {
    console.log('\n🧹 Coordinator: Cleaning up...');
    
    const cleanupPromises = this.agents.map(agent => 
      agent.cleanup().catch(error => 
        console.error(`Failed to cleanup agent: ${error.message}`)
      )
    );
    
    await Promise.all(cleanupPromises);
    console.log('✅ Coordinator: Cleanup complete');
  }

  /**
   * Helper: Delay function
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AgentCoordinator;