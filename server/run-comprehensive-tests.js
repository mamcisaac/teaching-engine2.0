#!/usr/bin/env node
/**
 * Comprehensive API Testing for Emily's ETFO Student Assessment System
 * Tests all endpoints with realistic Grade 1 French Immersion classroom data
 */

import { createTestClassroom, cleanupTestClassroom } from './src/test-utils/comprehensive-test-data.ts';

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const TEST_HEADERS = {
  'X-Bypass-Auth': 'true',
  'X-User-ID': '1',
  'Content-Type': 'application/json'
};

class ComprehensiveAPITester {
  constructor() {
    this.testResults = [];
    this.performanceMetrics = [];
    this.classroom = null;
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    console.log(logMessage);
  }

  async makeRequest(method, endpoint, data = null, headers = {}) {
    const startTime = Date.now();
    const url = `${BASE_URL}${endpoint}`;
    
    const requestHeaders = { ...TEST_HEADERS, ...headers };

    const options = {
      method,
      headers: requestHeaders
    };

    if (data && method !== 'GET') {
      options.body = typeof data === 'string' ? data : JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      let responseData;
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }

      this.performanceMetrics.push({
        endpoint,
        method,
        duration,
        status: response.status,
        success: response.ok
      });

      this.log(`${method} ${endpoint} - ${response.status} (${duration}ms)`);
      
      return {
        ok: response.ok,
        status: response.status,
        data: responseData,
        headers: response.headers,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`${method} ${endpoint} - ERROR: ${error.message}`, 'error');
      
      return {
        ok: false,
        status: 0,
        error: error.message,
        duration
      };
    }
  }

  async testSystemHealth() {
    this.log('=== Testing System Health ===');
    
    const response = await this.makeRequest('GET', '/health');
    
    if (response.ok && response.data.status === 'healthy') {
      this.testResults.push({ test: 'System Health Check', status: 'PASS', details: response.data });
      this.log('✅ System health check passed');
      return true;
    } else {
      this.testResults.push({ test: 'System Health Check', status: 'FAIL', details: response });
      this.log('❌ System health check failed', 'error');
      return false;
    }
  }

  async createRealisticTestData() {
    this.log('=== Creating Emily\'s Grade 1 French Immersion Classroom ===');
    
    try {
      this.classroom = await createTestClassroom('Emily McIsaac');
      
      this.log(`✅ Created classroom with:`);
      this.log(`   - Teacher: ${this.classroom.teacher.name}`);
      this.log(`   - Students: ${this.classroom.students.length}`);
      this.log(`   - Artifacts: ${this.classroom.artifacts.length}`);
      this.log(`   - Outcomes: ${this.classroom.outcomes.length}`);
      
      this.testResults.push({ 
        test: 'Test Data Creation', 
        status: 'PASS', 
        details: {
          studentsCreated: this.classroom.students.length,
          artifactsCreated: this.classroom.artifacts.length,
          outcomesCreated: this.classroom.outcomes.length
        }
      });
      
      return true;
    } catch (error) {
      this.log(`❌ Failed to create test data: ${error.message}`, 'error');
      this.testResults.push({ 
        test: 'Test Data Creation', 
        status: 'FAIL', 
        details: { error: error.message }
      });
      return false;
    }
  }

  async testStudentManagement() {
    this.log('=== Testing Student Management Endpoints ===');
    
    // Test 1: List all students
    const listResponse = await this.makeRequest('GET', '/students');
    
    if (listResponse.ok && listResponse.data.students) {
      this.testResults.push({ 
        test: 'List Students', 
        status: 'PASS', 
        details: { count: listResponse.data.students.length }
      });
      this.log(`✅ Listed ${listResponse.data.students.length} students`);
    } else {
      this.testResults.push({ 
        test: 'List Students', 
        status: 'FAIL', 
        details: listResponse
      });
      this.log('❌ Failed to list students', 'error');
    }

    // Test 2: Create new student
    const newStudent = {
      firstName: 'Alexandre',
      lastName: 'Boudreau',
      studentNumber: 'FI1026',
      grade: 1,
      notes: 'New student transferred from Charlottetown'
    };

    const createResponse = await this.makeRequest('POST', '/students', newStudent);
    
    if (createResponse.ok) {
      this.testResults.push({ 
        test: 'Create Student', 
        status: 'PASS', 
        details: createResponse.data
      });
      this.log(`✅ Created new student: ${newStudent.firstName} ${newStudent.lastName}`);
    } else {
      this.testResults.push({ 
        test: 'Create Student', 
        status: 'FAIL', 
        details: createResponse
      });
      this.log('❌ Failed to create new student', 'error');
    }

    // Test 3: Get CSV template
    const templateResponse = await this.makeRequest('GET', '/students/template/csv');
    
    if (templateResponse.ok) {
      this.testResults.push({ 
        test: 'CSV Template Download', 
        status: 'PASS', 
        details: { status: templateResponse.status }
      });
      this.log('✅ CSV template download successful');
    } else {
      this.testResults.push({ 
        test: 'CSV Template Download', 
        status: 'FAIL', 
        details: templateResponse
      });
      this.log('❌ Failed to download CSV template', 'error');
    }

    // Test 4: Test quota report
    const quotaResponse = await this.makeRequest('GET', '/students/quota/report');
    
    if (quotaResponse.ok && quotaResponse.data.summary) {
      this.testResults.push({ 
        test: 'Quota Report', 
        status: 'PASS', 
        details: quotaResponse.data.summary
      });
      this.log(`✅ Quota report: ${quotaResponse.data.summary.totalStudents} students`);
    } else {
      this.testResults.push({ 
        test: 'Quota Report', 
        status: 'FAIL', 
        details: quotaResponse
      });
      this.log('❌ Failed to get quota report', 'error');
    }
  }

  async testMasteryTracking() {
    this.log('=== Testing Mastery Tracking Endpoints ===');
    
    if (!this.classroom.students.length || !this.classroom.outcomes.length) {
      this.log('❌ No students or outcomes available for mastery testing', 'error');
      return;
    }

    const testStudent = this.classroom.students[0];
    const testOutcome = this.classroom.outcomes[0];

    // Test 1: Get progress overview
    const overviewResponse = await this.makeRequest('GET', `/mastery/student/${testStudent.id}?subject=Mathématiques`);

    if (overviewResponse.ok && overviewResponse.data.progress) {
      this.testResults.push({ 
        test: 'Get Progress Overview', 
        status: 'PASS', 
        details: { 
          studentName: overviewResponse.data.student.name,
          outcomeCount: overviewResponse.data.progress.length,
          summary: overviewResponse.data.summary
        }
      });
      this.log(`✅ Retrieved progress overview: ${overviewResponse.data.progress.length} outcomes tracked`);
    } else {
      this.testResults.push({ 
        test: 'Get Progress Overview', 
        status: 'FAIL', 
        details: overviewResponse
      });
      this.log('❌ Failed to get progress overview', 'error');
    }

    // Test 2: Update student progress
    const progressUpdate = {
      studentId: testStudent.id,
      outcomeId: testOutcome.id,
      currentLevel: 'MEETING',
      areasForGrowth: 'Continue practicing number recognition beyond 20',
      strengths: 'Excellent understanding of basic number concepts',
      teacherNotes: 'Shows consistent mastery during math centres'
    };

    const updateResponse = await this.makeRequest('POST', '/mastery/update', progressUpdate);

    if (updateResponse.ok) {
      this.testResults.push({ 
        test: 'Update Student Progress', 
        status: 'PASS', 
        details: updateResponse.data
      });
      this.log(`✅ Updated progress for ${testStudent.firstName} on ${testOutcome.code}`);
    } else {
      this.testResults.push({ 
        test: 'Update Student Progress', 
        status: 'FAIL', 
        details: updateResponse
      });
      this.log('❌ Failed to update student progress', 'error');
    }
  }

  async testReports() {
    this.log('=== Testing Reports Endpoints ===');
    
    // Test 1: Available reports
    const availableResponse = await this.makeRequest('GET', '/reports/available');

    if (availableResponse.ok && availableResponse.data.reportTypes) {
      this.testResults.push({ 
        test: 'Available Reports', 
        status: 'PASS', 
        details: { reportCount: availableResponse.data.reportTypes.length }
      });
      this.log(`✅ Found ${availableResponse.data.reportTypes.length} available report types`);
    } else {
      this.testResults.push({ 
        test: 'Available Reports', 
        status: 'FAIL', 
        details: availableResponse
      });
      this.log('❌ Failed to get available reports', 'error');
    }

    // Test 2: Generate student report
    if (this.classroom.students.length > 0) {
      const testStudent = this.classroom.students[0];
      const reportParams = new URLSearchParams({
        includeArtifacts: 'true',
        includeProgressChart: 'true',
        subject: 'Mathématiques',
        startDate: '2024-06-01',
        endDate: '2024-08-31'
      });

      const studentReportResponse = await this.makeRequest('GET', `/reports/student/${testStudent.id}?${reportParams}`);

      if (studentReportResponse.ok) {
        this.testResults.push({ 
          test: 'Generate Student Report', 
          status: 'PASS', 
          details: { studentName: `${testStudent.firstName} ${testStudent.lastName}` }
        });
        this.log(`✅ Generated student report for ${testStudent.firstName} ${testStudent.lastName}`);
      } else {
        this.testResults.push({ 
          test: 'Generate Student Report', 
          status: 'FAIL', 
          details: studentReportResponse
        });
        this.log('❌ Failed to generate student report', 'error');
      }
    }
  }

  async testErrorHandling() {
    this.log('=== Testing Error Handling and Edge Cases ===');
    
    // Test 1: Invalid student ID
    const invalidStudentResponse = await this.makeRequest('GET', '/mastery/student/invalid-student-id');
    
    if (invalidStudentResponse.status === 404 || invalidStudentResponse.status === 400) {
      this.testResults.push({ 
        test: 'Invalid Student ID Handling', 
        status: 'PASS', 
        details: { status: invalidStudentResponse.status }
      });
      this.log('✅ Invalid student ID properly rejected');
    } else {
      this.testResults.push({ 
        test: 'Invalid Student ID Handling', 
        status: 'FAIL', 
        details: invalidStudentResponse
      });
      this.log('❌ Invalid student ID not properly handled', 'error');
    }

    // Test 2: Invalid JSON payload
    const invalidJsonResponse = await this.makeRequest('POST', '/students', '{"invalid": "json"');

    if (invalidJsonResponse.status === 400) {
      this.testResults.push({ 
        test: 'Invalid JSON Handling', 
        status: 'PASS', 
        details: { status: invalidJsonResponse.status }
      });
      this.log('✅ Invalid JSON properly rejected');
    } else {
      this.testResults.push({ 
        test: 'Invalid JSON Handling', 
        status: 'FAIL', 
        details: invalidJsonResponse
      });
      this.log('❌ Invalid JSON not properly handled', 'error');
    }
  }

  generateFinalReport() {
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const totalTests = this.testResults.length;
    const testSuccessRate = (passedTests / totalTests * 100).toFixed(2);
    
    const totalRequests = this.performanceMetrics.length;
    const successfulRequests = this.performanceMetrics.filter(m => m.success).length;
    const apiSuccessRate = (successfulRequests / totalRequests * 100).toFixed(2);
    
    const responseTimes = this.performanceMetrics.filter(m => m.success).map(m => m.duration);
    const avgResponseTime = responseTimes.length > 0 
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)
      : 'N/A';

    this.log('');
    this.log('🎯 === COMPREHENSIVE API TESTING REPORT ===');
    this.log('');
    this.log(`📝 Test Results: ${passedTests}/${totalTests} passed (${testSuccessRate}%)`);
    this.log(`📊 API Calls: ${successfulRequests}/${totalRequests} successful (${apiSuccessRate}%)`);
    this.log(`⏱️  Average Response Time: ${avgResponseTime}ms`);
    this.log('');
    
    // Show individual test results
    this.log('📂 Individual Test Results:');
    this.testResults.forEach(test => {
      const status = test.status === 'PASS' ? '✅' : '❌';
      this.log(`   ${status} ${test.test}`);
    });
    this.log('');

    return {
      summary: {
        testsRun: totalTests,
        testsPassed: passedTests,
        testSuccessRate,
        apiCallsTotal: totalRequests,
        apiSuccessRate,
        avgResponseTime
      },
      testResults: this.testResults,
      performanceMetrics: this.performanceMetrics,
      classroom: this.classroom ? {
        teacher: this.classroom.teacher.name,
        studentCount: this.classroom.students.length,
        artifactCount: this.classroom.artifacts.length,
        outcomeCount: this.classroom.outcomes.length
      } : null
    };
  }

  async cleanup() {
    if (this.classroom && this.classroom.teacher) {
      this.log('🧹 Cleaning up test data...');
      try {
        await cleanupTestClassroom(this.classroom.teacher.id);
        this.log('✅ Test data cleanup completed');
      } catch (error) {
        this.log(`❌ Cleanup error: ${error.message}`, 'error');
      }
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive API Testing for Emily\'s Student Assessment System');
    this.log('🏫 Testing Grade 1 French Immersion classroom scenarios');
    this.log('');

    const startTime = Date.now();

    try {
      // Test 1: System Health
      const healthOk = await this.testSystemHealth();
      if (!healthOk) {
        this.log('❌ System health check failed. Aborting tests.', 'error');
        return;
      }

      // Test 2: Create realistic test data
      const dataCreated = await this.createRealisticTestData();
      if (!dataCreated) {
        this.log('❌ Test data creation failed. Aborting tests.', 'error');
        return;
      }

      // Test 3: Student Management
      await this.testStudentManagement();

      // Test 4: Mastery Tracking
      await this.testMasteryTracking();

      // Test 5: Reports
      await this.testReports();

      // Test 6: Error Handling
      await this.testErrorHandling();

    } catch (error) {
      this.log(`❌ Unexpected error during testing: ${error.message}`, 'error');
    } finally {
      // Generate final report
      const totalTime = Date.now() - startTime;
      this.log('');
      this.log(`⏱️  Total testing time: ${(totalTime / 1000).toFixed(2)} seconds`);
      
      const report = this.generateFinalReport();
      
      // Cleanup
      await this.cleanup();
      
      this.log('');
      this.log('🎉 Comprehensive API testing completed!');
      
      return report;
    }
  }
}

// Run tests
const tester = new ComprehensiveAPITester();
tester.runAllTests().catch(console.error);