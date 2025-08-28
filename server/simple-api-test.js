#!/usr/bin/env node
/**
 * Simple API Test for Emily's ETFO Student Assessment System
 * Quick validation of key endpoints
 */

const BASE_URL = 'http://localhost:3000/api';
const TEST_HEADERS = {
  'X-Bypass-Auth': 'true',
  'X-User-ID': '1',
  'Content-Type': 'application/json'
};

async function makeRequest(method, endpoint, data = null) {
  const url = `${BASE_URL}${endpoint}`;
  
  const options = {
    method,
    headers: TEST_HEADERS,
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    let responseData;
    
    // For CSV responses, don't try to parse as JSON
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/csv')) {
      responseData = 'CSV data received'; // Don't read the actual CSV to avoid body consumption issues
    } else {
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }
    }

    return {
      ok: response.ok,
      status: response.status,
      data: responseData,
      url
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
      url
    };
  }
}

async function runTests() {
  console.log('🚀 Starting Simple API Test Suite for Emily\'s Assessment System');
  console.log('=' .repeat(60));

  const tests = [
    // Health checks
    { method: 'GET', endpoint: '/health', name: 'Health Check' },
    
    // Student management
    { method: 'GET', endpoint: '/students', name: 'List Students' },
    { method: 'GET', endpoint: '/students/quota/report', name: 'Storage Quota Report' },
    
    // Analytics
    { method: 'GET', endpoint: '/analytics/class-overview', name: 'Class Analytics Overview' },
    { method: 'GET', endpoint: '/analytics/evidence-triangulation', name: 'Evidence Triangulation' },
    { method: 'GET', endpoint: '/analytics/progress-trends', name: 'Progress Trends' },
    
    // Mastery tracking (with known student ID)
    { method: 'GET', endpoint: '/mastery/student/cmeul4tci0005vjvx6gqtseya', name: 'Mastery Overview (student endpoint)' },
    { method: 'GET', endpoint: '/mastery/overview/cmeul4tci0005vjvx6gqtseya', name: 'Mastery Overview (alias endpoint)' },
    { method: 'GET', endpoint: '/mastery/analytics', name: 'Mastery Analytics' },
    
    // Reports
    { method: 'GET', endpoint: '/reports/available', name: 'Available Reports' },
    
    // Artifacts
    { method: 'GET', endpoint: '/artifacts', name: 'List Artifacts' },
    
    // Analytics export test
    { 
      method: 'POST', 
      endpoint: '/analytics/export', 
      name: 'Analytics Export (CSV)',
      data: {
        type: 'class-overview',
        format: 'csv',
        data: { test: 'data' }
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    process.stdout.write(`Testing ${test.name}... `);
    
    const result = await makeRequest(test.method, test.endpoint, test.data);
    
    if (result.ok) {
      console.log(`✅ PASS (${result.status})`);
      passed++;
    } else {
      console.log(`❌ FAIL (${result.status}) - ${result.error || 'Unknown error'}`);
      if (result.data && typeof result.data === 'object') {
        console.log(`   Error details: ${JSON.stringify(result.data).substring(0, 100)}...`);
      }
      failed++;
    }
  }

  console.log('=' .repeat(60));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All API endpoints are working perfectly!');
    console.log('🔥 Emily\'s Assessment System is ready for production!');
  } else {
    console.log(`⚠️  ${failed} endpoint(s) need attention`);
  }
  
  console.log('=' .repeat(60));
}

// Run the tests
runTests().catch(console.error);