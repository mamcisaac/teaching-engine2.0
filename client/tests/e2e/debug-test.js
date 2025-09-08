const puppeteer = require('puppeteer');

async function debugTest() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Wait a bit for any JS to load
  await new Promise(r => setTimeout(r, 3000));
  
  // Get the page title
  const title = await page.title();
  console.log('Page title:', title);
  
  // Get the page URL (in case of redirect)
  const url = page.url();
  console.log('Current URL:', url);
  
  // Get all text content
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Page content preview:', bodyText.substring(0, 500));
  
  // Check for specific elements
  const hasOnboarding = await page.$('.onboarding-modal, [role="dialog"]') !== null;
  console.log('Has onboarding modal:', hasOnboarding);
  
  // Check for planning cascade
  const hasPlanningCascade = await page.$('.planning-cascade-view') !== null;
  console.log('Has planning cascade:', hasPlanningCascade);
  
  // Get all classNames on body
  const bodyClasses = await page.evaluate(() => document.body.className);
  console.log('Body classes:', bodyClasses);
  
  // Get the main app element
  const appElement = await page.$('#root, #app, .app');
  if (appElement) {
    const appHTML = await page.evaluate(el => el.innerHTML.substring(0, 1000), appElement);
    console.log('App HTML preview:', appHTML);
  }
  
  // Take screenshot
  await page.screenshot({ path: 'debug-screenshot.png' });
  console.log('Screenshot saved as debug-screenshot.png');
  
  // Check for any error messages
  const errors = await page.$$('.error, .alert, [role="alert"]');
  console.log('Error elements found:', errors.length);
  
  await browser.close();
}

debugTest().catch(console.error);