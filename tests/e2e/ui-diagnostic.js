/**
 * UI Diagnostic Test
 * Investigates what elements are actually present in the UI
 */

const puppeteer = require('puppeteer');

async function diagnoseUI() {
  console.log('🔍 Starting UI Diagnostic Test\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Show browser to see what's happening
    slowMo: 100
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    // Navigate to app
    console.log('1. Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get page title
    const title = await page.title();
    console.log(`   Page Title: "${title}"\n`);
    
    // Check URL
    const url = page.url();
    console.log(`   Current URL: ${url}\n`);
    
    // Find all links
    console.log('2. Finding all links on the page:');
    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a');
      return Array.from(anchors).map(a => ({
        text: a.textContent.trim(),
        href: a.href,
        className: a.className
      }));
    });
    
    if (links.length > 0) {
      links.forEach(link => {
        console.log(`   - "${link.text}" -> ${link.href}`);
      });
    } else {
      console.log('   ❌ No links found!');
    }
    console.log('');
    
    // Find all buttons
    console.log('3. Finding all buttons on the page:');
    const buttons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      return Array.from(btns).map(b => ({
        text: b.textContent.trim(),
        className: b.className,
        id: b.id,
        type: b.type
      }));
    });
    
    if (buttons.length > 0) {
      buttons.forEach(btn => {
        console.log(`   - Button: "${btn.text}" (class: ${btn.className || 'none'})`);
      });
    } else {
      console.log('   ❌ No buttons found!');
    }
    console.log('');
    
    // Check for navigation elements
    console.log('4. Looking for navigation elements:');
    const navElements = await page.evaluate(() => {
      const results = {};
      
      // Check for nav tag
      results.navTag = document.querySelector('nav') ? 'Found' : 'Not found';
      
      // Check for header
      results.header = document.querySelector('header') ? 'Found' : 'Not found';
      
      // Check for sidebar
      results.sidebar = document.querySelector('[class*="sidebar"], aside') ? 'Found' : 'Not found';
      
      // Check for menu
      results.menu = document.querySelector('[class*="menu"], [role="menu"]') ? 'Found' : 'Not found';
      
      return results;
    });
    
    Object.entries(navElements).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });
    console.log('');
    
    // Check for main content areas
    console.log('5. Checking main content areas:');
    const contentAreas = await page.evaluate(() => {
      const results = {};
      
      // Check what's visible
      results.calendarView = document.querySelector('[class*="calendar"], [class*="week"]') ? 'Found' : 'Not found';
      results.dashboard = document.querySelector('[class*="dashboard"]') ? 'Found' : 'Not found';
      results.loading = document.querySelector('[class*="loading"]') ? 'Found' : 'Not found';
      results.subjectLegend = document.querySelector('[class*="legend"], [class*="subject"]') ? 'Found' : 'Not found';
      
      // Check for forms
      results.loginForm = document.querySelector('form[class*="login"], input[type="email"], input[type="password"]') ? 'Found' : 'Not found';
      results.lessonForm = document.querySelector('form[class*="lesson"]') ? 'Found' : 'Not found';
      
      return results;
    });
    
    Object.entries(contentAreas).forEach(([key, value]) => {
      const emoji = value === 'Found' ? '✅' : '❌';
      console.log(`   ${emoji} ${key}: ${value}`);
    });
    console.log('');
    
    // Get text content visible on page
    console.log('6. Visible text on page (first 10 text elements):');
    const visibleText = await page.evaluate(() => {
      const texts = [];
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            if (node.nodeValue.trim().length > 0) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        }
      );
      
      let node;
      while (node = walker.nextNode()) {
        const text = node.nodeValue.trim();
        if (text && !texts.includes(text)) {
          texts.push(text);
          if (texts.length >= 15) break;
        }
      }
      return texts;
    });
    
    visibleText.forEach(text => {
      console.log(`   - "${text}"`);
    });
    console.log('');
    
    // Check for specific elements we expect
    console.log('7. Checking for expected Teaching Engine elements:');
    const expectedElements = await page.evaluate(() => {
      const results = {};
      
      // Look for curriculum elements
      const curriculumLink = Array.from(document.querySelectorAll('a')).find(a => 
        a.textContent.toLowerCase().includes('curriculum')
      );
      results.curriculumLink = curriculumLink ? curriculumLink.textContent : 'Not found';
      
      // Look for planning elements
      const planningLink = Array.from(document.querySelectorAll('a')).find(a => 
        a.textContent.toLowerCase().includes('planning') || 
        a.textContent.toLowerCase().includes('lesson')
      );
      results.planningLink = planningLink ? planningLink.textContent : 'Not found';
      
      // Look for assessment
      const assessmentLink = Array.from(document.querySelectorAll('a')).find(a => 
        a.textContent.toLowerCase().includes('assessment') || 
        a.textContent.toLowerCase().includes('grade')
      );
      results.assessmentLink = assessmentLink ? assessmentLink.textContent : 'Not found';
      
      // Look for dashboard
      const dashboardElement = document.querySelector('[class*="dashboard"], a[href="/dashboard"], a[href="/"]');
      results.dashboardElement = dashboardElement ? 'Found' : 'Not found';
      
      return results;
    });
    
    Object.entries(expectedElements).forEach(([key, value]) => {
      const emoji = value !== 'Not found' ? '✅' : '❌';
      console.log(`   ${emoji} ${key}: ${value}`);
    });
    console.log('');
    
    // Get the HTML structure of the main area
    console.log('8. Main HTML structure:');
    const htmlStructure = await page.evaluate(() => {
      const main = document.querySelector('main, [role="main"], #root > div');
      if (main) {
        // Get simplified structure
        const getStructure = (element, depth = 0, maxDepth = 3) => {
          if (depth > maxDepth) return '';
          
          const indent = '  '.repeat(depth);
          let result = `${indent}<${element.tagName.toLowerCase()}`;
          
          if (element.className) {
            result += ` class="${element.className}"`;
          }
          if (element.id) {
            result += ` id="${element.id}"`;
          }
          result += '>\n';
          
          // Add text content if it's a leaf node
          if (element.children.length === 0 && element.textContent.trim()) {
            result += `${indent}  ${element.textContent.trim().substring(0, 50)}...\n`;
          }
          
          // Add children
          for (const child of element.children) {
            if (child.tagName && !['SCRIPT', 'STYLE'].includes(child.tagName)) {
              result += getStructure(child, depth + 1, maxDepth);
            }
          }
          
          result += `${indent}</${element.tagName.toLowerCase()}>\n`;
          return result;
        };
        
        return getStructure(main || document.body);
      }
      return 'Could not find main content area';
    });
    console.log(htmlStructure);
    
    // Take a screenshot
    await page.screenshot({ path: 'diagnostic-screenshot.png', fullPage: true });
    console.log('\n📸 Screenshot saved as diagnostic-screenshot.png');
    
    // Final diagnosis
    console.log('\n' + '='.repeat(50));
    console.log('DIAGNOSIS SUMMARY');
    console.log('='.repeat(50));
    
    if (links.length === 0 && buttons.length < 3) {
      console.log('⚠️  The UI appears to be missing navigation elements.');
      console.log('   This suggests the app may not be fully loaded or');
      console.log('   navigation is hidden/not implemented.');
    } else {
      console.log('✅ UI has interactive elements present.');
    }
    
    if (visibleText.some(t => t.toLowerCase().includes('loading'))) {
      console.log('⚠️  The app appears to still be loading content.');
    }
    
    if (!url.includes('login') && contentAreas.calendarView === 'Found') {
      console.log('✅ App appears to be logged in and showing main interface.');
    }
    
  } catch (error) {
    console.error('Error during diagnosis:', error);
  } finally {
    await browser.close();
  }
}

// Run the diagnostic
diagnoseUI().then(() => {
  console.log('\nDiagnostic complete!');
}).catch(console.error);