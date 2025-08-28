#!/usr/bin/env node
/**
 * Comprehensive API Testing for Emily's ETFO Student Assessment System
 * Tests all endpoints with realistic Grade 1 French Immersion classroom data
 */

import { createReadStream } from 'fs';
// import { FormData } from 'undici'; // Commented out for now
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// import { createTestClassroom, cleanupTestClassroom } from './src/test-utils/comprehensive-test-data.ts';
// Commented out for now - will create test data inline

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    
    if (level === 'error') {
      console.error(logMessage);
    }
  }

  async makeRequest(method, endpoint, data = null, headers = {}, isFormData = false) {
    const startTime = Date.now();
    const url = `${BASE_URL}${endpoint}`;
    
    const requestHeaders = { ...TEST_HEADERS, ...headers };
    if (isFormData) {
      delete requestHeaders['Content-Type']; // Let FormData set the boundary
    }

    const options = {
      method,
      headers: requestHeaders,
      body: data
    };

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
      
      this.performanceMetrics.push({
        endpoint,
        method,
        duration,
        status: 0,
        success: false,
        error: error.message
      });

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

    const createResponse = await this.makeRequest('POST', '/students', JSON.stringify(newStudent));
    
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
        details: { contentType: templateResponse.headers.get('content-type') }
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
      this.log(`✅ Quota report: ${quotaResponse.data.summary.totalStudents} students, ${quotaResponse.data.summary.totalUsage} used`);
    } else {
      this.testResults.push({ 
        test: 'Quota Report', 
        status: 'FAIL', 
        details: quotaResponse
      });
      this.log('❌ Failed to get quota report', 'error');
    }
  }

  async testArtifactManagement() {
    this.log('=== Testing Artifact Management Endpoints ===');
    
    if (!this.classroom.students.length) {
      this.log('❌ No students available for artifact testing', 'error');
      return;
    }

    const testStudent = this.classroom.students[0];
    this.log(`Testing artifacts for student: ${testStudent.firstName} ${testStudent.lastName}`);

    // Test 1: Create test files for upload
    const testFiles = await this.createTestFiles();

    // Test 2: Upload photo artifact
    const photoFormData = new FormData();
    photoFormData.append('photo', testFiles.photo.buffer, testFiles.photo.filename);
    photoFormData.append('studentId', testStudent.id);
    photoFormData.append('title', 'Test Math Problem Solving');
    photoFormData.append('description', 'Student explaining addition strategy using manipulatives');
    
    const photoUploadResponse = await this.makeRequest(
      'POST', 
      '/artifacts/upload/photo', 
      photoFormData,
      {},
      true
    );

    if (photoUploadResponse.ok) {
      this.testResults.push({ 
        test: 'Photo Upload', 
        status: 'PASS', 
        details: photoUploadResponse.data
      });
      this.log('✅ Photo uploaded successfully');
    } else {
      this.testResults.push({ 
        test: 'Photo Upload', 
        status: 'FAIL', 
        details: photoUploadResponse
      });
      this.log('❌ Failed to upload photo', 'error');
    }

    // Test 3: Upload document artifact
    const docFormData = new FormData();
    docFormData.append('document', testFiles.document.buffer, testFiles.document.filename);
    docFormData.append('studentId', testStudent.id);
    docFormData.append('title', 'French Writing Sample');
    docFormData.append('description', 'Student\'s creative story about their pet');

    const docUploadResponse = await this.makeRequest(
      'POST', 
      '/artifacts/upload/document', 
      docFormData,
      {},
      true
    );

    if (docUploadResponse.ok) {
      this.testResults.push({ 
        test: 'Document Upload', 
        status: 'PASS', 
        details: docUploadResponse.data
      });
      this.log('✅ Document uploaded successfully');
    } else {
      this.testResults.push({ 
        test: 'Document Upload', 
        status: 'FAIL', 
        details: docUploadResponse
      });
      this.log('❌ Failed to upload document', 'error');
    }

    // Test 4: Get artifact details (if we have an artifact from the classroom)
    if (this.classroom.artifacts.length > 0) {
      const artifactId = this.classroom.artifacts[0].id;
      const artifactResponse = await this.makeRequest('GET', `/artifacts/${artifactId}`);
      
      if (artifactResponse.ok) {
        this.testResults.push({ 
          test: 'Get Artifact Details', 
          status: 'PASS', 
          details: { artifactId, type: artifactResponse.data.artifactType }
        });
        this.log(`✅ Retrieved artifact details: ${artifactResponse.data.title}`);
      } else {
        this.testResults.push({ 
          test: 'Get Artifact Details', 
          status: 'FAIL', 
          details: artifactResponse
        });
        this.log('❌ Failed to get artifact details', 'error');
      }
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

    // Test 1: Update student progress
    const progressUpdate = {
      studentId: testStudent.id,
      outcomeId: testOutcome.id,
      currentLevel: 'MEETING',
      areasForGrowth: 'Continue practicing number recognition beyond 20',
      strengths: 'Excellent understanding of basic number concepts',
      teacherNotes: 'Shows consistent mastery during math centres',
      strongestEvidence: {
        evidenceType: 'OBSERVATION',
        description: 'Successfully counted to 50 using hundreds chart'
      }
    };

    const updateResponse = await this.makeRequest(
      'POST', 
      '/mastery/update', 
      JSON.stringify(progressUpdate)
    );

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

    // Test 2: Get progress overview
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
  }

  async testReportsAndAnalytics() {
    this.log('=== Testing Reports and Analytics Endpoints ===');
    
    if (!this.classroom.students.length) {
      this.log('❌ No students available for reports testing', 'error');
      return;
    }

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
    const testStudent = this.classroom.students[0];
    const reportParams = new URLSearchParams({
      includeArtifacts: 'true',
      includeProgressChart: 'true',
      subject: 'Mathématiques',
      startDate: '2024-06-01',
      endDate: '2024-08-31'
    });

    const studentReportResponse = await this.makeRequest(
      'GET', 
      `/reports/student/${testStudent.id}?${reportParams}`
    );

    if (studentReportResponse.ok) {
      this.testResults.push({ 
        test: 'Generate Student Report', 
        status: 'PASS', 
        details: { 
          studentName: `${testStudent.firstName} ${testStudent.lastName}`,
          contentType: studentReportResponse.headers.get('content-type')
        }
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

    // Test 3: Generate class report
    const classReportParams = new URLSearchParams({
      subject: 'Français',
      startDate: '2024-06-01',
      endDate: '2024-08-31'
    });

    const classReportResponse = await this.makeRequest(
      'GET', 
      `/reports/class?${classReportParams}`
    );

    if (classReportResponse.ok) {
      this.testResults.push({ 
        test: 'Generate Class Report', 
        status: 'PASS', 
        details: { 
          contentType: classReportResponse.headers.get('content-type')
        }
      });
      this.log('✅ Generated class report for Français');
    } else {
      this.testResults.push({ 
        test: 'Generate Class Report', 
        status: 'FAIL', 
        details: classReportResponse
      });
      this.log('❌ Failed to generate class report', 'error');
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

    // Test 2: Invalid artifact upload (no file)
    const emptyFormData = new FormData();
    emptyFormData.append('studentId', 'some-id');
    emptyFormData.append('title', 'Test Title');

    const invalidUploadResponse = await this.makeRequest(
      'POST', 
      '/artifacts/upload/photo', 
      emptyFormData,
      {},
      true
    );

    if (invalidUploadResponse.status === 400) {
      this.testResults.push({ 
        test: 'Invalid Upload Handling', 
        status: 'PASS', 
        details: { status: invalidUploadResponse.status }
      });
      this.log('✅ Invalid upload properly rejected');
    } else {
      this.testResults.push({ 
        test: 'Invalid Upload Handling', 
        status: 'FAIL', 
        details: invalidUploadResponse
      });
      this.log('❌ Invalid upload not properly handled', 'error');
    }

    // Test 3: Invalid JSON payload
    const invalidJsonResponse = await this.makeRequest(
      'POST', 
      '/students', 
      '{"invalid": json}'
    );

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

  async createTestFiles() {
    // Create minimal test files for upload testing
    const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    const testDocument = Buffer.from('Test document content for Grade 1 French Immersion student work sample.');

    return {
      photo: {
        buffer: testImage,
        filename: 'test-student-work.jpg'
      },
      document: {
        buffer: testDocument,
        filename: 'test-writing-sample.txt'
      }
    };
  }

  generatePerformanceReport() {
    this.log('=== Performance Analysis ===');
    
    const totalRequests = this.performanceMetrics.length;
    const successfulRequests = this.performanceMetrics.filter(m => m.success).length;
    const successRate = (successfulRequests / totalRequests * 100).toFixed(2);
    
    const responseTimes = this.performanceMetrics.filter(m => m.success).map(m => m.duration);
    const avgResponseTime = responseTimes.length > 0 
      ? (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2)
      : 'N/A';
    
    const maxResponseTime = responseTimes.length > 0 ? Math.max(...responseTimes) : 'N/A';
    const minResponseTime = responseTimes.length > 0 ? Math.min(...responseTimes) : 'N/A';

    this.log(`📊 Total API calls: ${totalRequests}`);
    this.log(`✅ Success rate: ${successRate}%`);
    this.log(`⏱️  Average response time: ${avgResponseTime}ms`);
    this.log(`🔺 Max response time: ${maxResponseTime}ms`);
    this.log(`🔻 Min response time: ${minResponseTime}ms`);

    return {
      totalRequests,
      successfulRequests,
      successRate,
      avgResponseTime,
      maxResponseTime,
      minResponseTime,
      metrics: this.performanceMetrics
    };
  }

  generateFinalReport() {
    const passedTests = this.testResults.filter(t => t.status === 'PASS').length;
    const totalTests = this.testResults.length;
    const testSuccessRate = (passedTests / totalTests * 100).toFixed(2);
    
    const performanceReport = this.generatePerformanceReport();

    this.log('');
    this.log('🎯 === COMPREHENSIVE API TESTING REPORT ===');
    this.log('');
    this.log(`📝 Test Results: ${passedTests}/${totalTests} passed (${testSuccessRate}%)`);
    this.log('');
    
    // Group test results by category
    const categories = {};
    this.testResults.forEach(test => {
      const category = this.getCategoryFromTest(test.test);
      if (!categories[category]) categories[category] = [];
      categories[category].push(test);
    });

    Object.keys(categories).forEach(category => {
      this.log(`📂 ${category}:`);
      categories[category].forEach(test => {
        const status = test.status === 'PASS' ? '✅' : '❌';
        this.log(`   ${status} ${test.test}`);
      });
      this.log('');
    });

    this.log('📊 Performance Summary:');
    this.log(`   • Total API calls: ${performanceReport.totalRequests}`);
    this.log(`   • Success rate: ${performanceReport.successRate}%`);
    this.log(`   • Average response: ${performanceReport.avgResponseTime}ms`);
    this.log(`   • Max response: ${performanceReport.maxResponseTime}ms`);
    this.log('');

    // Create detailed report object
    const detailedReport = {
      summary: {
        testsRun: totalTests,
        testsPassed: passedTests,
        testSuccessRate,
        apiCallsTotal: performanceReport.totalRequests,
        apiSuccessRate: performanceReport.successRate,
        avgResponseTime: performanceReport.avgResponseTime
      },
      testResults: this.testResults,
      performanceMetrics: this.performanceMetrics,
      classroom: this.classroom ? {
        teacher: this.classroom.teacher.name,
        studentCount: this.classroom.students.length,
        artifactCount: this.classroom.artifacts.length,
        outcomeCount: this.classroom.outcomes.length
      } : null,
      timestamp: new Date().toISOString()
    };

    // Save detailed report to file
    const reportPath = path.join(__dirname, `api-test-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));
    this.log(`💾 Detailed report saved to: ${reportPath}`);

    return detailedReport;
  }

  getCategoryFromTest(testName) {
    if (testName.includes('Health')) return 'System Health';
    if (testName.includes('Data Creation')) return 'Test Setup';
    if (testName.includes('Student') || testName.includes('CSV') || testName.includes('Quota')) return 'Student Management';
    if (testName.includes('Upload') || testName.includes('Artifact')) return 'Artifact Management';
    if (testName.includes('Progress') || testName.includes('Mastery')) return 'Mastery Tracking';
    if (testName.includes('Report')) return 'Reports & Analytics';
    if (testName.includes('Invalid') || testName.includes('Error') || testName.includes('Handling')) return 'Error Handling';
    return 'Other';
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

      // Test 4: Artifact Management
      await this.testArtifactManagement();

      // Test 5: Mastery Tracking
      await this.testMasteryTracking();

      // Test 6: Reports and Analytics
      await this.testReportsAndAnalytics();

      // Test 7: Error Handling
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

// Run tests if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const tester = new ComprehensiveAPITester();
  tester.runAllTests().catch(console.error);
}

export default ComprehensiveAPITester;