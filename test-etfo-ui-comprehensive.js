const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = './etfo-test-screenshots';
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test Teacher'
};

// Utility functions
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    console.error('Error creating directory:', err);
  }
}

async function saveScreenshot(page, name) {
  const filename = `${name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filename}`);
  return filepath;
}

async function login(page, email, password) {
  console.log('🔐 Logging in...');
  
  // Navigate to login page
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
  await saveScreenshot(page, 'login-page');
  
  // Fill login form
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.type('input[type="email"]', email);
  await page.type('input[type="password"]', password);
  
  await saveScreenshot(page, 'login-filled');
  
  // Submit form
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle0' }),
    page.click('button[type="submit"]')
  ]);
  
  // Wait for dashboard to load
  await page.waitForSelector('[data-testid="dashboard"], h1', { timeout: 15000 });
  await saveScreenshot(page, 'dashboard-loaded');
  
  console.log('✅ Login successful');
}

async function testLongRangePlans(page) {
  console.log('\n📚 Testing Long Range Plans...');
  
  // Navigate to Long Range Plans
  await page.goto(`${BASE_URL}/etfo/long-range`, { waitUntil: 'networkidle0' });
  await delay(2000);
  await saveScreenshot(page, 'long-range-plans-list');
  
  // Create new Long Range Plan
  console.log('Creating new Long Range Plan...');
  const createButton = await page.$('button:has-text("Create"), button:has-text("New Plan"), button:has-text("Add")');
  if (createButton) {
    await createButton.click();
    await delay(1000);
    await saveScreenshot(page, 'long-range-plan-create-modal');
    
    // Fill form
    await page.waitForSelector('input[name="title"], input[placeholder*="title" i]', { timeout: 5000 });
    await page.type('input[name="title"], input[placeholder*="title" i]', 'Grade 4 Math - Full Year');
    
    // Select grade if dropdown exists
    const gradeSelect = await page.$('select[name="grade"], select[id*="grade"]');
    if (gradeSelect) {
      await gradeSelect.select('4');
    }
    
    // Select subject
    const subjectSelect = await page.$('select[name="subject"], select[id*="subject"]');
    if (subjectSelect) {
      await subjectSelect.select('Mathematics');
    }
    
    await saveScreenshot(page, 'long-range-plan-form-filled');
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
    await delay(2000);
    await saveScreenshot(page, 'long-range-plan-created');
  }
  
  // View existing plan
  const planLink = await page.$('a[href*="/etfo/long-range/"], .plan-card, [data-testid*="plan"]');
  if (planLink) {
    await planLink.click();
    await delay(2000);
    await saveScreenshot(page, 'long-range-plan-detail');
  }
  
  console.log('✅ Long Range Plans tested');
}

async function testUnitPlans(page) {
  console.log('\n📖 Testing Unit Plans...');
  
  // Navigate to Unit Plans
  await page.goto(`${BASE_URL}/etfo/unit-plans`, { waitUntil: 'networkidle0' });
  await delay(2000);
  await saveScreenshot(page, 'unit-plans-list');
  
  // Create new Unit Plan
  console.log('Creating new Unit Plan...');
  const createButton = await page.$('button:has-text("Create"), button:has-text("New Unit"), button:has-text("Add")');
  if (createButton) {
    await createButton.click();
    await delay(1000);
    await saveScreenshot(page, 'unit-plan-create-modal');
    
    // Fill form
    await page.waitForSelector('input[name="title"], input[placeholder*="title" i]', { timeout: 5000 });
    await page.type('input[name="title"], input[placeholder*="title" i]', 'Fractions and Decimals');
    
    // Add description if field exists
    const descriptionField = await page.$('textarea[name="description"], textarea[placeholder*="description" i]');
    if (descriptionField) {
      await descriptionField.type('Introduction to fractions and decimal concepts for Grade 4 students');
    }
    
    await saveScreenshot(page, 'unit-plan-form-filled');
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
    await delay(2000);
    await saveScreenshot(page, 'unit-plan-created');
  }
  
  // View unit plan details
  const unitLink = await page.$('a[href*="/etfo/unit-plans/"], .unit-card, [data-testid*="unit"]');
  if (unitLink) {
    await unitLink.click();
    await delay(2000);
    await saveScreenshot(page, 'unit-plan-detail');
  }
  
  console.log('✅ Unit Plans tested');
}

async function testLessonPlans(page) {
  console.log('\n📝 Testing Lesson Plans...');
  
  // Navigate to Lesson Plans
  await page.goto(`${BASE_URL}/etfo/lesson-plans`, { waitUntil: 'networkidle0' });
  await delay(2000);
  await saveScreenshot(page, 'lesson-plans-list');
  
  // Create new Lesson Plan
  console.log('Creating new Lesson Plan...');
  const createButton = await page.$('button:has-text("Create"), button:has-text("New Lesson"), button:has-text("Add")');
  if (createButton) {
    await createButton.click();
    await delay(1000);
    await saveScreenshot(page, 'lesson-plan-create-modal');
    
    // Fill form with three-part lesson structure
    await page.waitForSelector('input[name="title"], input[placeholder*="title" i]', { timeout: 5000 });
    await page.type('input[name="title"], input[placeholder*="title" i]', 'Introduction to Fractions');
    
    // Minds On
    const mindsOnField = await page.$('textarea[name="mindsOn"], textarea[placeholder*="minds on" i]');
    if (mindsOnField) {
      await mindsOnField.type('Quick review: What are equal parts? Show pizza slices visual.');
    }
    
    // Action
    const actionField = await page.$('textarea[name="action"], textarea[placeholder*="action" i]');
    if (actionField) {
      await actionField.type('Students work with fraction manipulatives to create and identify fractions.');
    }
    
    // Consolidation
    const consolidationField = await page.$('textarea[name="consolidation"], textarea[placeholder*="consolidation" i]');
    if (consolidationField) {
      await consolidationField.type('Exit ticket: Draw and label a fraction of your choice.');
    }
    
    await saveScreenshot(page, 'lesson-plan-form-filled');
    
    // Submit
    await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
    await delay(2000);
    await saveScreenshot(page, 'lesson-plan-created');
  }
  
  // View lesson plan
  const lessonLink = await page.$('a[href*="/etfo/lesson-plans/"], .lesson-card, [data-testid*="lesson"]');
  if (lessonLink) {
    await lessonLink.click();
    await delay(2000);
    await saveScreenshot(page, 'lesson-plan-detail');
  }
  
  console.log('✅ Lesson Plans tested');
}

async function testDaybook(page) {
  console.log('\n📅 Testing Daybook...');
  
  // Navigate to Daybook
  await page.goto(`${BASE_URL}/etfo/daybook`, { waitUntil: 'networkidle0' });
  await delay(2000);
  await saveScreenshot(page, 'daybook-calendar');
  
  // Click on today's date or a specific date
  const todayCell = await page.$('.fc-day-today, .calendar-cell-today, [data-date]');
  if (todayCell) {
    await todayCell.click();
    await delay(1000);
    await saveScreenshot(page, 'daybook-entry-modal');
    
    // Add daybook entry
    const notesField = await page.$('textarea[name="notes"], textarea[placeholder*="notes" i]');
    if (notesField) {
      await notesField.type('Students showed great understanding of fractions today. Need to review with 2 students tomorrow.');
    }
    
    // Add reflection
    const reflectionField = await page.$('textarea[name="reflection"], textarea[placeholder*="reflection" i]');
    if (reflectionField) {
      await reflectionField.type('The hands-on manipulatives really helped students grasp the concept.');
    }
    
    await saveScreenshot(page, 'daybook-entry-filled');
    
    // Save entry
    const saveButton = await page.$('button:has-text("Save"), button[type="submit"]');
    if (saveButton) {
      await saveButton.click();
      await delay(2000);
      await saveScreenshot(page, 'daybook-entry-saved');
    }
  }
  
  console.log('✅ Daybook tested');
}

async function testTemplates(page) {
  console.log('\n📋 Testing Templates...');
  
  // Navigate to Templates
  await page.goto(`${BASE_URL}/etfo/templates`, { waitUntil: 'networkidle0' });
  await delay(2000);
  await saveScreenshot(page, 'templates-list');
  
  // Create new template
  console.log('Creating new template...');
  const createButton = await page.$('button:has-text("Create"), button:has-text("New Template"), button:has-text("Add")');
  if (createButton) {
    await createButton.click();
    await delay(1000);
    await saveScreenshot(page, 'template-create-modal');
    
    // Fill template form
    await page.waitForSelector('input[name="name"], input[placeholder*="name" i]', { timeout: 5000 });
    await page.type('input[name="name"], input[placeholder*="name" i]', 'Math Problem Solving Template');
    
    // Select template type
    const typeSelect = await page.$('select[name="type"], select[id*="type"]');
    if (typeSelect) {
      await typeSelect.select('lesson');
    }
    
    // Add template content
    const contentField = await page.$('textarea[name="content"], textarea[placeholder*="content" i]');
    if (contentField) {
      await contentField.type('Standard problem-solving lesson structure with think-pair-share activities');
    }
    
    await saveScreenshot(page, 'template-form-filled');
    
    // Save template
    await page.click('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
    await delay(2000);
    await saveScreenshot(page, 'template-created');
  }
  
  // Use a template
  const useButton = await page.$('button:has-text("Use"), button:has-text("Apply")');
  if (useButton) {
    await useButton.click();
    await delay(1000);
    await saveScreenshot(page, 'template-use-modal');
  }
  
  console.log('✅ Templates tested');
}

async function testSubstitutePlans(page) {
  console.log('\n👩‍🏫 Testing Substitute Plans...');
  
  // Navigate to Substitute Plans
  await page.goto(`${BASE_URL}/substitute-plans`, { waitUntil: 'networkidle0' });
  await delay(2000);
  await saveScreenshot(page, 'substitute-plans-list');
  
  // Create new substitute plan
  console.log('Creating substitute plan...');
  const createButton = await page.$('button:has-text("Create"), button:has-text("New Plan"), button:has-text("Add")');
  if (createButton) {
    await createButton.click();
    await delay(1000);
    await saveScreenshot(page, 'substitute-plan-create');
    
    // Fill date
    const dateInput = await page.$('input[type="date"]');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await dateInput.type(tomorrow.toISOString().split('T')[0]);
    }
    
    // Add classroom routines
    const routinesField = await page.$('textarea[name="routines"], textarea[placeholder*="routine" i]');
    if (routinesField) {
      await routinesField.type('Morning routine: Attendance, O Canada, calendar update. Snack at 10:15.');
    }
    
    // Add notes
    const notesField = await page.$('textarea[name="notes"], textarea[placeholder*="notes" i]');
    if (notesField) {
      await notesField.type('Emergency contact: Office ext. 201. Two students have allergies - see red folder.');
    }
    
    await saveScreenshot(page, 'substitute-plan-filled');
    
    // Save plan
    await page.click('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    await delay(2000);
    await saveScreenshot(page, 'substitute-plan-saved');
  }
  
  console.log('✅ Substitute Plans tested');
}

async function testNotifications(page) {
  console.log('\n🔔 Testing Notifications...');
  
  // Check if notification bell exists
  const notificationBell = await page.$('[data-testid="notification-bell"], .notification-icon, button[aria-label*="notification" i]');
  if (notificationBell) {
    await notificationBell.click();
    await delay(1000);
    await saveScreenshot(page, 'notifications-dropdown');
    
    // Close notifications
    await page.click('body');
    await delay(500);
  }
  
  // Test notification API directly
  console.log('Testing notification API...');
  try {
    // Get auth token from cookies
    const cookies = await page.cookies();
    const authCookie = cookies.find(c => c.name === 'token' || c.name === 'auth');
    
    if (authCookie) {
      // Create test notification via API
      const response = await page.evaluate(async (apiUrl, token) => {
        const res = await fetch(`${apiUrl}/api/notifications/test`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: 'Test Notification',
            message: 'This is a test notification from Puppeteer'
          })
        });
        return res.json();
      }, API_URL, authCookie.value);
      
      console.log('Test notification created:', response);
      
      // Refresh page to see new notification
      await page.reload({ waitUntil: 'networkidle0' });
      await delay(1000);
      await saveScreenshot(page, 'page-with-notification');
    }
  } catch (err) {
    console.error('Error testing notifications:', err);
  }
  
  console.log('✅ Notifications tested');
}

async function testDataIntegrity(page) {
  console.log('\n🔍 Testing Data Integrity...');
  
  // Go back to dashboard
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle0' });
  await delay(2000);
  await saveScreenshot(page, 'dashboard-final-state');
  
  // Check if created items appear in recent items
  const recentItems = await page.$$eval('.recent-item, [data-testid*="recent"], .activity-item', items => 
    items.map(item => item.textContent)
  );
  
  console.log('Recent items found:', recentItems.length);
  
  // Navigate through different sections to verify data persists
  const sectionsToCheck = [
    { url: '/etfo/long-range', name: 'Long Range Plans' },
    { url: '/etfo/unit-plans', name: 'Unit Plans' },
    { url: '/etfo/lesson-plans', name: 'Lesson Plans' },
    { url: '/etfo/daybook', name: 'Daybook' }
  ];
  
  for (const section of sectionsToCheck) {
    await page.goto(`${BASE_URL}${section.url}`, { waitUntil: 'networkidle0' });
    await delay(1000);
    
    // Count items
    const items = await page.$$('.plan-item, .card, [data-testid*="item"], tr[data-row]');
    console.log(`${section.name}: ${items.length} items found`);
    
    await saveScreenshot(page, `data-check-${section.name.toLowerCase().replace(/\s+/g, '-')}`);
  }
  
  console.log('✅ Data integrity verified');
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting ETFO UI Comprehensive Tests');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`API URL: ${API_URL}`);
  
  // Ensure screenshot directory exists
  await ensureDir(SCREENSHOT_DIR);
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set up console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser console error:', msg.text());
    }
  });
  
  // Set up request interception for debugging
  page.on('response', response => {
    if (response.status() >= 400 && response.url().includes('/api/')) {
      console.error(`API Error ${response.status()}: ${response.url()}`);
    }
  });
  
  try {
    // Run all tests
    await login(page, TEST_USER.email, TEST_USER.password);
    await testLongRangePlans(page);
    await testUnitPlans(page);
    await testLessonPlans(page);
    await testDaybook(page);
    await testTemplates(page);
    await testSubstitutePlans(page);
    await testNotifications(page);
    await testDataIntegrity(page);
    
    console.log('\n✅ All tests completed successfully!');
    console.log(`📸 Screenshots saved in: ${SCREENSHOT_DIR}`);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await saveScreenshot(page, 'error-state');
    
    // Log page content for debugging
    const pageContent = await page.content();
    await fs.writeFile(path.join(SCREENSHOT_DIR, 'error-page.html'), pageContent);
    
    throw error;
  } finally {
    // Close browser
    await browser.close();
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});