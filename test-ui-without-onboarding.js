const puppeteer = require('puppeteer');

(async () => {
  console.log('🚀 Testing Teaching Engine UI without onboarding...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Wait for servers to be ready
    console.log('⏳ Waiting for servers to start...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Navigate to the app
    console.log('📱 Navigating to app...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    // Check if on login page
    const isLoginPage = await page.$('input[type="email"]') !== null;
    console.log(`📄 On login page: ${isLoginPage}`);
    
    if (isLoginPage) {
      // Login with test credentials
      console.log('🔐 Logging in...');
      await page.type('input[type="email"]', 'teacher@example.com');
      await page.type('input[type="password"]', 'Password123!');
      await page.click('button[type="submit"]');
      
      // Wait for navigation
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
    }
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Check for onboarding modal
    const hasOnboardingModal = await page.$('.fixed.inset-0.bg-black') !== null;
    console.log(`🎭 Onboarding modal present: ${hasOnboardingModal}`);
    
    // Check for main navigation
    const hasSidebar = await page.$('[data-testid="main-sidebar"]') !== null;
    console.log(`📊 Sidebar present: ${hasSidebar}`);
    
    // Take screenshot
    await page.screenshot({ path: 'ui-state.png', fullPage: true });
    console.log('📸 Screenshot saved as ui-state.png');
    
    // Try to navigate to different pages
    const routes = [
      '/planner/dashboard',
      '/planner/long-range',
      '/planner/units',
      '/curriculum'
    ];
    
    for (const route of routes) {
      console.log(`\n🔍 Testing route: ${route}`);
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0' });
      const finalUrl = page.url();
      console.log(`  Final URL: ${finalUrl}`);
      
      // Check page title or main content
      const pageTitle = await page.title();
      console.log(`  Page title: ${pageTitle}`);
    }
    
    console.log('\n✅ UI test completed!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
})();