#!/usr/bin/env node

// Test script to verify authentication and lesson fetching
// Run with: node test-auth-flow.js

const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Store cookies from login response
let authCookie = '';

apiClient.interceptors.request.use((config) => {
  if (authCookie) {
    config.headers['Cookie'] = authCookie;
  }
  return config;
});

apiClient.interceptors.response.use((response) => {
  // Capture Set-Cookie header from login
  const setCookie = response.headers['set-cookie'];
  if (setCookie) {
    authCookie = setCookie[0];
    console.log('✅ Cookie captured:', authCookie.split(';')[0]);
  }
  return response;
});

async function testAuthFlow() {
  console.log('\n🔐 Testing Authentication Flow\n');
  console.log('================================\n');
  
  try {
    // Step 1: Login
    console.log('1. Attempting login...');
    const loginResponse = await apiClient.post('/api/auth/login', {
      email: 'emily@etfo.ca',
      password: 'etfo2024!Demo'
    });
    
    console.log('✅ Login successful!');
    console.log('   User:', loginResponse.data.user.email);
    console.log('   ID:', loginResponse.data.user.id);
    
    // Step 2: Get lessons for current week
    console.log('\n2. Fetching lessons for current week...');
    const startDate = new Date('2025-09-08T03:00:00.000Z');
    const endDate = new Date('2025-09-12T03:00:00.000Z');
    
    const lessonsResponse = await apiClient.get('/api/etfo-lesson-plans', {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    
    console.log('✅ Lessons fetched successfully!');
    console.log('   Count:', lessonsResponse.data.length);
    
    if (lessonsResponse.data.length > 0) {
      const firstLesson = lessonsResponse.data[0];
      console.log('\n3. Testing lesson detail fetch...');
      console.log('   Lesson ID:', firstLesson.id);
      console.log('   Title:', firstLesson.title);
      
      // Step 3: Fetch specific lesson detail
      const lessonDetailResponse = await apiClient.get(`/api/lessons/${firstLesson.id}`);
      
      console.log('✅ Lesson detail fetched successfully!');
      console.log('   Subject:', lessonDetailResponse.data.subject);
      console.log('   Date:', lessonDetailResponse.data.date);
      console.log('   Duration:', lessonDetailResponse.data.duration, 'minutes');
      
      // Step 4: Test assessment context endpoint
      console.log('\n4. Testing assessment context fetch...');
      try {
        const contextResponse = await apiClient.get(`/api/lessons/${firstLesson.id}/assessment-context`);
        console.log('✅ Assessment context fetched!');
        console.log('   Expectations:', contextResponse.data.expectations.length);
      } catch (err) {
        console.log('⚠️  Assessment context not available (this is okay)');
      }
    }
    
    console.log('\n================================');
    console.log('✅ All authentication tests passed!');
    console.log('✅ apiClient configuration is working correctly!');
    console.log('================================\n');
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.response?.status || error.message);
    console.error('Details:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('\n⚠️  Authentication issue detected!');
      console.error('The apiClient is not properly handling cookies.');
    }
  }
}

testAuthFlow();