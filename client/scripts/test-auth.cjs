#!/usr/bin/env node

/**
 * Real authentication system test script
 * Tests actual user login flows and protected endpoint access
 */

const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
  email: 'teacher@example.com',
  password: 'Password123!'
};

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testLogin() {
  console.log('\n🔐 Testing User Login...');
  console.log(`   Email: ${TEST_USER.email}`);
  console.log(`   Password: ${TEST_USER.password}`);
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, TEST_USER);
    
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Login successful!');
      console.log(`   User ID: ${response.body.user.id}`);
      console.log(`   User Name: ${response.body.user.name}`);
      console.log(`   Token: ${response.body.accessToken.substring(0, 50)}...`);
      return response.body.accessToken;
    } else {
      console.log('   ❌ Login failed!');
      console.log(`   Error: ${JSON.stringify(response.body)}`);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Request failed!');
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

async function testProtectedEndpoint(token, endpoint, description) {
  console.log(`\n🛡️  Testing Protected Endpoint: ${description}`);
  console.log(`   Endpoint: ${endpoint}`);
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 200) {
      console.log('   ✅ Access granted!');
      if (response.body) {
        console.log(`   Response: ${JSON.stringify(response.body).substring(0, 100)}...`);
      }
      return true;
    } else {
      console.log('   ❌ Access denied!');
      console.log(`   Error: ${JSON.stringify(response.body)}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Request failed!');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testUnauthorizedAccess(endpoint, description) {
  console.log(`\n🚫 Testing Unauthorized Access: ${description}`);
  console.log(`   Endpoint: ${endpoint}`);
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 401 || response.statusCode === 403) {
      console.log('   ✅ Correctly denied access!');
      return true;
    } else {
      console.log('   ❌ Security issue - should have denied access!');
      console.log(`   Response: ${JSON.stringify(response.body)}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Request failed!');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testInvalidToken(endpoint, description) {
  console.log(`\n🔓 Testing Invalid Token: ${description}`);
  console.log(`   Endpoint: ${endpoint}`);
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: endpoint,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token-12345',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${response.statusCode}`);
    
    if (response.statusCode === 401) {
      console.log('   ✅ Correctly rejected invalid token!');
      return true;
    } else {
      console.log('   ❌ Security issue - should have rejected invalid token!');
      console.log(`   Response: ${JSON.stringify(response.body)}`);
      return false;
    }
  } catch (error) {
    console.log('   ❌ Request failed!');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

async function testCompleteWorkflow(token) {
  console.log('\n🔄 Testing Complete User Workflow...');
  
  try {
    // 1. Get user profile
    console.log('\n   1️⃣ Getting user profile...');
    const profileResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/user/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (profileResponse.statusCode !== 200) {
      console.log('   ❌ Failed to get profile!');
      return false;
    }
    console.log('   ✅ Profile retrieved successfully!');
    const userId = profileResponse.body.id;
    
    // 2. Get user's daybook entries
    console.log('\n   2️⃣ Getting daybook entries...');
    const daybookResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/daybook-entries',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (daybookResponse.statusCode !== 200) {
      console.log('   ❌ Failed to get daybook entries!');
      return false;
    }
    console.log('   ✅ Daybook entries retrieved successfully!');
    console.log(`   Found ${daybookResponse.body.length || 0} entries`);
    
    // 3. Get user's unit plans
    console.log('\n   3️⃣ Getting unit plans...');
    const unitsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/unit-plans',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (unitsResponse.statusCode !== 200) {
      console.log('   ❌ Failed to get unit plans!');
      return false;
    }
    console.log('   ✅ Unit plans retrieved successfully!');
    console.log(`   Found ${unitsResponse.body.length || 0} plans`);
    
    // 4. Try to access admin endpoint (should fail for regular user)
    console.log('\n   4️⃣ Testing role-based access control...');
    const adminResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (adminResponse.statusCode === 403 || adminResponse.statusCode === 404) {
      console.log('   ✅ Correctly denied admin access to regular user!');
    } else {
      console.log('   ⚠️  Unexpected response for admin endpoint');
    }
    
    console.log('\n   ✅ Complete workflow test passed!');
    return true;
    
  } catch (error) {
    console.log('   ❌ Workflow test failed!');
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Teaching Engine 2.0 - Real Authentication Test');
  console.log('================================================');
  console.log(`Testing against: ${API_BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  // Test 1: Login
  const token = await testLogin();
  if (token) {
    testsPassed++;
  } else {
    testsFailed++;
    console.log('\n❌ Cannot continue tests without valid token!');
    process.exit(1);
  }
  
  // Test 2: Unauthorized access (no token)
  const unauthorizedTest = await testUnauthorizedAccess('/api/user/profile', 'User Profile');
  if (unauthorizedTest) testsPassed++;
  else testsFailed++;
  
  // Test 3: Invalid token
  const invalidTokenTest = await testInvalidToken('/api/user/profile', 'User Profile');
  if (invalidTokenTest) testsPassed++;
  else testsFailed++;
  
  // Test 4: Protected endpoints with valid token
  const protectedEndpoints = [
    ['/api/user/profile', 'User Profile'],
    ['/api/daybook-entries', 'Daybook Entries'],
    ['/api/unit-plans', 'Unit Plans'],
    ['/api/templates', 'Templates']
  ];
  
  for (const [endpoint, description] of protectedEndpoints) {
    const result = await testProtectedEndpoint(token, endpoint, description);
    if (result) testsPassed++;
    else testsFailed++;
  }
  
  // Test 5: Complete workflow
  const workflowResult = await testCompleteWorkflow(token);
  if (workflowResult) testsPassed++;
  else testsFailed++;
  
  // Summary
  console.log('\n📊 Test Summary');
  console.log('==============');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Success Rate: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 All tests passed! Authentication system is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Please check the authentication system.');
    process.exit(1);
  }
}

// Check if server is running
async function checkServerRunning() {
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET'
    });
    
    if (response.statusCode === 200) {
      console.log('✅ Server is running on port 3000');
      return true;
    } else {
      console.log('❌ Server responded but health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Server is not running on port 3000');
    console.log('   Please start the server with: pnpm dev');
    return false;
  }
}

// Run the tests
(async () => {
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    process.exit(1);
  }
  
  console.log('');
  await runTests();
})();