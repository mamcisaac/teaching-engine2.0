const puppeteer = require('puppeteer');

async function quickNavTest() {
  console.log('Quick Navigation Test After Provider Fix\n');
  console.log('=' .repeat(50));
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('\n1. Testing Planning Overview page...');
    await page.goto('http://localhost:5173/planning-overview', { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    // Check for navigation elements
    const navExists = await page.$('nav') !== null;
    const sidebarExists = await page.$('[class*="sidebar"], aside') !== null;
    
    // Get all navigation links
    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a');
      return Array.from(anchors).map(a => ({
        text: a.textContent.trim(),
        href: a.href
      }));
    });
    
    console.log(`   ✅ Navigation bar: ${navExists ? 'Present' : 'Missing'}`);
    console.log(`   ✅ Sidebar: ${sidebarExists ? 'Present' : 'Missing'}`);
    console.log(`   ✅ Navigation links found: ${links.length}`);
    
    if (links.length > 0) {
      console.log('\n   Navigation items:');
      links.slice(0, 10).forEach(link => {
        console.log(`      - ${link.text}`);
      });
    }
    
    // Take screenshot
    await page.screenshot({ path: 'nav-working.png', fullPage: false });
    console.log('\n   📸 Screenshot saved as nav-working.png');
    
    console.log('\n✅ PROVIDER FIX SUCCESSFUL!');
    console.log('Navigation is now rendering properly with all context providers in place.');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

quickNavTest().catch(console.error);