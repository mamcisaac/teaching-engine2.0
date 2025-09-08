const puppeteer = require('puppeteer');

async function debugPlanning() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  console.log('Testing Planning Cascade at /planning/overview...');
  await page.goto('http://localhost:5173/planning/overview', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Check current URL
  console.log('Current URL:', page.url());
  
  // Check for planning cascade element
  const planningCascade = await page.$('.planning-cascade-view');
  console.log('Has .planning-cascade-view:', planningCascade !== null);
  
  // Check for the component with data-testid
  const testId = await page.$('[data-testid="planning-cascade-view"]');
  console.log('Has data-testid="planning-cascade-view":', testId !== null);
  
  // Check what's actually on the page
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('Page content:', bodyText.substring(0, 500));
  
  // Get all elements with role="tree"
  const trees = await page.$$('[role="tree"]');
  console.log('Elements with role="tree":', trees.length);
  
  // Get all divs with classes
  const divClasses = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    return divs.slice(0, 10).map(d => d.className).filter(c => c);
  });
  console.log('First 10 div classes:', divClasses);
  
  await page.screenshot({ path: 'planning-debug.png' });
  console.log('Screenshot saved as planning-debug.png');
  
  await browser.close();
}

debugPlanning().catch(console.error);