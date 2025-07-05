#!/usr/bin/env node

const http = require('http');

// Test the Teaching Engine 2.0 system
async function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testSystem() {
  console.log('🚀 Testing Teaching Engine 2.0 System\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const health = await makeRequest('GET', '/health');
    console.log(`   Status: ${health.status}, Response: ${JSON.stringify(health.data)}`);

    // Test 2: API Health
    console.log('\n2. Testing API Health...');
    const apiHealth = await makeRequest('GET', '/api/health');
    console.log(`   Status: ${apiHealth.status}, Response: ${JSON.stringify(apiHealth.data)}`);

    // Test 3: Authentication
    console.log('\n3. Testing Authentication...');
    const loginData = {
      email: 'teacher@example.com',
      password: 'Password123!'
    };
    
    const loginResponse = await makeRequest('POST', '/api/auth/login', loginData);
    console.log(`   Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      console.log(`   ✅ Login successful! Token: ${loginResponse.data.token.substring(0, 50)}...`);
      const token = loginResponse.data.token;

      // Test 4: Protected Endpoint - User Profile
      console.log('\n4. Testing User Profile (Protected)...');
      const profile = await makeRequest('GET', '/api/user/profile', null, token);
      console.log(`   Status: ${profile.status}`);
      if (profile.status === 200) {
        console.log(`   ✅ User: ${profile.data.user?.name || 'Unknown'}`);
      }

      // Test 5: ETFO Lesson Plans
      console.log('\n5. Testing ETFO Lesson Plans...');
      const etfoPlans = await makeRequest('GET', '/api/etfo-lesson-plans', null, token);
      console.log(`   Status: ${etfoPlans.status}`);
      if (etfoPlans.status === 200) {
        console.log(`   ✅ Found ${etfoPlans.data.data?.length || 0} lesson plans`);
      } else {
        console.log(`   ❌ Error: ${JSON.stringify(etfoPlans.data)}`);
      }

      // Test 6: Unit Plans
      console.log('\n6. Testing Unit Plans...');
      const unitPlans = await makeRequest('GET', '/api/unit-plans', null, token);
      console.log(`   Status: ${unitPlans.status}`);
      if (unitPlans.status === 200) {
        console.log(`   ✅ Found ${unitPlans.data.data?.length || 0} unit plans`);
      } else {
        console.log(`   ❌ Error: ${JSON.stringify(unitPlans.data)}`);
      }

      // Test 7: Templates
      console.log('\n7. Testing Templates...');
      const templates = await makeRequest('GET', '/api/templates', null, token);
      console.log(`   Status: ${templates.status}`);
      if (templates.status === 200) {
        console.log(`   ✅ Found ${templates.data.data?.length || 0} templates`);
      } else {
        console.log(`   ❌ Error: ${JSON.stringify(templates.data)}`);
      }

    } else {
      console.log(`   ❌ Login failed: ${JSON.stringify(loginResponse.data)}`);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🏁 System test complete!');
}

// Wait a moment then run tests
setTimeout(testSystem, 2000);