/**
 * Puppeteer Configuration for E2E Testing
 * Teaching Engine 2.0 - Comprehensive UI Testing
 */

module.exports = {
  // Browser launch options
  browser: {
    headless: false, // Set to true for CI/CD
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  },

  // Test server configuration  
  server: {
    url: 'http://localhost:5173',
    apiUrl: 'http://localhost:3000'
  },

  // Screenshot settings
  screenshots: {
    enabled: true,
    path: './tests/e2e/screenshots',
    fullPage: true,
    type: 'png'
  },

  // Test timeouts
  timeouts: {
    navigation: 30000,
    test: 60000,
    element: 10000
  },

  // Test user credentials
  testUser: {
    email: 'test@teacher.com',
    password: 'TestPass123!',
    name: 'Test Teacher'
  },

  // Viewport sizes for responsive testing
  viewports: {
    desktop: { width: 1920, height: 1080 },
    laptop: { width: 1366, height: 768 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 812 }
  },

  // Retry configuration
  retry: {
    times: 3,
    delay: 1000
  }
};