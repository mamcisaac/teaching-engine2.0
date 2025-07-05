const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:5173';

async function quickTest() {
  console.log('🚀 Starting Quick ETFO UI Test');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 }
  });
  
  const page = await browser.newPage();
  
  try {
    // Test 1: Navigate to home
    console.log('1️⃣ Testing homepage...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'test-1-homepage.png' });
    
    // Test 2: Navigate to login
    console.log('2️⃣ Testing login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'test-2-login.png' });
    
    // Test 3: Try to login
    console.log('3️⃣ Testing login process...');
    await page.type('input[type="email"]', 'test@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.screenshot({ path: 'test-3-login-filled.png' });
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]')
    ]);
    
    await page.screenshot({ path: 'test-4-after-login.png' });
    
    // Test 4: Check main navigation
    console.log('4️⃣ Testing navigation...');
    const navLinks = await page.$$eval('nav a, [role="navigation"] a', links => 
      links.map(link => ({ text: link.textContent, href: link.href }))
    );
    console.log('Navigation links found:', navLinks);
    
    // Test 5: Navigate to ETFO sections
    const etfoSections = [
      '/etfo/long-range',
      '/etfo/unit-plans', 
      '/etfo/lesson-plans',
      '/etfo/daybook'
    ];
    
    for (let i = 0; i < etfoSections.length; i++) {
      const section = etfoSections[i];
      console.log(`5️⃣.${i + 1} Testing ${section}...`);
      await page.goto(`${BASE_URL}${section}`, { waitUntil: 'networkidle0' });
      await page.screenshot({ path: `test-5-${i + 1}-${section.split('/').pop()}.png` });
    }
    
    // Test 6: Test notifications API
    console.log('6️⃣ Testing notifications...');
    const notificationsResponse = await page.evaluate(async () => {
      try {
        const res = await fetch('/api/notifications');
        return { status: res.status, ok: res.ok };
      } catch (err) {
        return { error: err.message };
      }
    });
    console.log('Notifications API response:', notificationsResponse);
    
    console.log('✅ Quick test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    await browser.close();
  }
}

quickTest();