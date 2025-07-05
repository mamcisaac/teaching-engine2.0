const axios = require('axios');

async function testETFOEndpoints() {
  const baseURL = 'http://localhost:3000/api';
  
  // First, let's register and login a test user
  try {
    await axios.post(`${baseURL}/auth/register`, {
      email: 'etfo.test@example.com',
      password: 'test123',
      name: 'Test Teacher'
    });
  } catch (e) {
    // User might already exist
  }
  
  const loginResponse = await axios.post(`${baseURL}/auth/login`, {
    email: 'etfo.test@example.com',
    password: 'test123'
  });
  
  const token = loginResponse.data.token;
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  console.log('✅ Login successful');
  
  // Test 1: GET /api/etfo-lesson-plans
  try {
    const lessonPlansResponse = await axios.get(`${baseURL}/etfo-lesson-plans`, config);
    console.log('✅ GET /api/etfo-lesson-plans - Success');
    console.log('   Response has lessonPlans:', \!\!lessonPlansResponse.data.lessonPlans);
    console.log('   Response has pagination:', \!\!lessonPlansResponse.data.pagination);
    if (lessonPlansResponse.data.lessonPlans.length > 0) {
      const firstLesson = lessonPlansResponse.data.lessonPlans[0];
      console.log('   Lesson has expectations (not expectationCoverage):', \!\!firstLesson.expectations);
    }
  } catch (error) {
    console.error('❌ GET /api/etfo-lesson-plans - Failed:', error.response?.data || error.message);
  }
  
  // Test 2: GET /api/unit-plans
  try {
    const unitPlansResponse = await axios.get(`${baseURL}/unit-plans`, config);
    console.log('✅ GET /api/unit-plans - Success');
    console.log('   Response has unitPlans:', \!\!unitPlansResponse.data.unitPlans);
    if (unitPlansResponse.data.unitPlans.length > 0) {
      const firstUnit = unitPlansResponse.data.unitPlans[0];
      console.log('   Unit has expectations:', \!\!firstUnit.expectations);
    }
  } catch (error) {
    console.error('❌ GET /api/unit-plans - Failed:', error.response?.data || error.message);
  }
  
  // Test 3: GET /api/templates
  try {
    const templatesResponse = await axios.get(`${baseURL}/templates`, config);
    console.log('✅ GET /api/templates - Success');
    console.log('   Response has templates:', \!\!templatesResponse.data.templates);
    console.log('   Response has pagination:', \!\!templatesResponse.data.pagination);
  } catch (error) {
    console.error('❌ GET /api/templates - Failed:', error.response?.data || error.message);
  }
  
  // Test 4: GET /api/daybook-entries
  try {
    const daybookResponse = await axios.get(`${baseURL}/daybook-entries`, config);
    console.log('✅ GET /api/daybook-entries - Success');
    console.log('   Response has entries:', \!\!daybookResponse.data.entries);
    if (daybookResponse.data.entries.length > 0) {
      const firstEntry = daybookResponse.data.entries[0];
      console.log('   Entry has expectations (not expectationCoverage):', \!\!firstEntry.expectations);
    }
  } catch (error) {
    console.error('❌ GET /api/daybook-entries - Failed:', error.response?.data || error.message);
  }
  
  console.log('\n🎯 All critical endpoints tested\!');
}

testETFOEndpoints().catch(console.error);
