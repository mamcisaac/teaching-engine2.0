/**
 * Puppeteer Test Helpers
 * Common utilities for E2E testing
 */

const fs = require('fs').promises;
const path = require('path');
const config = require('../puppeteer.config');

/**
 * Wait for a specific amount of time
 */
async function waitForTimeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Launch browser with configuration
 */
async function launchBrowser(puppeteer) {
  return await puppeteer.launch(config.browser);
}

/**
 * Navigate to a page and wait for it to load
 */
async function navigateTo(page, path = '') {
  const url = `${config.server.url}${path}`;
  await page.goto(url, {
    waitUntil: 'networkidle2',
    timeout: config.timeouts.navigation
  });
}

/**
 * Take a screenshot with automatic naming
 */
async function takeScreenshot(page, name, suite = 'general') {
  if (!config.screenshots.enabled) return;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${suite}/${name}_${timestamp}.png`;
  const filepath = path.join(config.screenshots.path, filename);
  
  // Ensure directory exists
  await fs.mkdir(path.dirname(filepath), { recursive: true });
  
  await page.screenshot({
    path: filepath,
    fullPage: config.screenshots.fullPage,
    type: config.screenshots.type
  });
  
  console.log(`📸 Screenshot saved: ${filename}`);
  return filepath;
}

/**
 * Wait for element and click
 */
async function clickElement(page, selector) {
  await page.waitForSelector(selector, { 
    timeout: config.timeouts.element 
  });
  await page.click(selector);
}

/**
 * Wait for element and type text
 */
async function typeText(page, selector, text) {
  await page.waitForSelector(selector, {
    timeout: config.timeouts.element
  });
  await page.type(selector, text);
}

/**
 * Clear input and type new text
 */
async function clearAndType(page, selector, text) {
  await page.waitForSelector(selector, {
    timeout: config.timeouts.element
  });
  await page.click(selector, { clickCount: 3 }); // Select all
  await page.type(selector, text);
}

/**
 * Wait for text to appear on page
 */
async function waitForText(page, text, timeout = config.timeouts.element) {
  await page.waitForFunction(
    (text) => document.body.innerText.includes(text),
    { timeout },
    text
  );
}

/**
 * Check if element exists
 */
async function elementExists(page, selector) {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get text content of element
 */
async function getElementText(page, selector) {
  await page.waitForSelector(selector, {
    timeout: config.timeouts.element
  });
  return await page.$eval(selector, el => el.textContent);
}

/**
 * Login helper for authenticated routes
 */
async function login(page, email = config.testUser.email, password = config.testUser.password) {
  // Check if already logged in
  const loggedIn = await elementExists(page, '[data-testid="user-menu"]');
  if (loggedIn) return;
  
  await navigateTo(page, '/login');
  await typeText(page, 'input[type="email"]', email);
  await typeText(page, 'input[type="password"]', password);
  await clickElement(page, 'button[type="submit"]');
  
  // Wait for redirect after login
  await page.waitForNavigation({
    waitUntil: 'networkidle2'
  });
}

/**
 * Set viewport size
 */
async function setViewport(page, size = 'desktop') {
  const viewport = config.viewports[size];
  if (viewport) {
    await page.setViewport(viewport);
  }
}

/**
 * Wait and retry helper
 */
async function retry(fn, retries = config.retry.times, delay = config.retry.delay) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Measure page load performance
 */
async function measurePerformance(page) {
  const metrics = await page.evaluate(() => {
    const timing = performance.timing;
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0
    };
  });
  return metrics;
}

/**
 * Check for console errors
 */
function captureConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

/**
 * Generate test report
 */
async function generateReport(results) {
  const reportPath = path.join(config.screenshots.path, 'test-report.html');
  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Teaching Engine 2.0 - E2E Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .suite { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    .passed { background-color: #d4edda; }
    .failed { background-color: #f8d7da; }
    .screenshot { max-width: 300px; margin: 10px; border: 1px solid #ddd; }
    .metrics { background: #f8f9fa; padding: 10px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>Teaching Engine 2.0 - E2E Test Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  
  ${results.map(suite => `
    <div class="suite ${suite.passed ? 'passed' : 'failed'}">
      <h2>${suite.name}</h2>
      <p>Status: ${suite.passed ? '✅ PASSED' : '❌ FAILED'}</p>
      <p>Duration: ${suite.duration}ms</p>
      
      ${suite.screenshots ? `
        <h3>Screenshots:</h3>
        ${suite.screenshots.map(screenshot => `
          <img class="screenshot" src="${screenshot}" alt="${suite.name}" />
        `).join('')}
      ` : ''}
      
      ${suite.errors && suite.errors.length > 0 ? `
        <h3>Errors:</h3>
        <ul>
          ${suite.errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${suite.metrics ? `
        <div class="metrics">
          <h3>Performance Metrics:</h3>
          <p>DOM Content Loaded: ${suite.metrics.domContentLoaded}ms</p>
          <p>Page Load Complete: ${suite.metrics.loadComplete}ms</p>
          <p>First Paint: ${suite.metrics.firstPaint}ms</p>
        </div>
      ` : ''}
    </div>
  `).join('')}
  
  <h2>Summary</h2>
  <p>Total Suites: ${results.length}</p>
  <p>Passed: ${results.filter(r => r.passed).length}</p>
  <p>Failed: ${results.filter(r => !r.passed).length}</p>
</body>
</html>
  `;
  
  await fs.writeFile(reportPath, html);
  console.log(`📊 Test report generated: ${reportPath}`);
  return reportPath;
}

module.exports = {
  waitForTimeout,
  launchBrowser,
  navigateTo,
  takeScreenshot,
  clickElement,
  typeText,
  clearAndType,
  waitForText,
  elementExists,
  getElementText,
  login,
  setViewport,
  retry,
  measurePerformance,
  captureConsoleErrors,
  generateReport
};