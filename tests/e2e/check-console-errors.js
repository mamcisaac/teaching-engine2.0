const puppeteer = require('puppeteer');

async function checkConsoleErrors() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true
  });
  
  const page = await browser.newPage();
  
  const errors = [];
  const warnings = [];
  const logs = [];
  
  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      errors.push(text);
      console.log('❌ ERROR:', text);
    } else if (type === 'warning') {
      warnings.push(text);
      console.log('⚠️  WARNING:', text);
    } else {
      logs.push(text);
      console.log('📝 LOG:', text);
    }
  });
  
  // Capture page errors
  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('💥 PAGE ERROR:', err.message);
  });
  
  console.log('Navigating to http://localhost:5173...\n');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  // Wait a bit for any async errors
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Logs: ${logs.length}`);
  
  if (errors.length > 0) {
    console.log('\n❌ ERRORS FOUND:');
    errors.forEach((err, i) => {
      console.log(`${i + 1}. ${err}`);
    });
  }
  
  // Keep browser open for inspection
  console.log('\nBrowser DevTools is open. Check the Console tab for more details.');
  console.log('Press Ctrl+C to close...');
  
  // Keep process alive
  await new Promise(() => {});
}

checkConsoleErrors().catch(console.error);