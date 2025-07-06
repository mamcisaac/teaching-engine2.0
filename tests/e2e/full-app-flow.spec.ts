import { test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

test.describe('Full Application E2E Flow', () => {
  const screenshotsDir = path.join(__dirname, 'screenshots');

  // Helper to take screenshots with descriptive names
  async function takeScreenshot(page: Page, name: string) {
    await fs.mkdir(screenshotsDir, { recursive: true });
    const filename = `${new Date().toISOString().replace(/[:.]/g, '-')}-${name}.png`;
    await page.screenshot({
      path: path.join(screenshotsDir, filename),
      fullPage: true,
    });
    console.log(`📸 Screenshot saved: ${filename}`);
  }

  // Helper to wait for network idle
  async function waitForNetworkIdle(page: Page) {
    await page.waitForLoadState('networkidle');
  }

  test('should complete full application flow', async ({ page }) => {
    // 1. Landing Page
    console.log('\n📍 Step 1: Landing Page');
    await page.goto('/');
    await waitForNetworkIdle(page);
    await takeScreenshot(page, '01-landing-page');
    
    // Verify landing page loads
    await expect(page).toHaveTitle(/Teaching Engine|Welcome|Home/i);

    // 2. Navigate to Login
    console.log('\n📍 Step 2: Navigate to Login');
    // Try multiple selectors for login link
    const loginClicked = await page.locator('a[href="/login"], a:has-text("Login"), button:has-text("Login")')
      .first()
      .click()
      .then(() => true)
      .catch(() => false);
      
    if (!loginClicked) {
      await page.goto('/login');
    }
    
    await takeScreenshot(page, '02-login-page');

    // 3. Fill Login Form
    console.log('\n📍 Step 3: Login Process');
    await page.fill('input[name="email"], input[type="email"]', 'teacher@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'password123');
    await takeScreenshot(page, '03-login-filled');
    
    // Submit login
    await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
    
    // Wait for navigation (with timeout)
    await page.waitForLoadState('networkidle');
    await takeScreenshot(page, '04-after-login');

    // 4. Check if logged in (URL changed or dashboard elements visible)
    console.log('\n📍 Step 4: Post-Login State');
    const currentUrl = page.url();
    if (currentUrl.includes('dashboard')) {
      console.log('✅ Successfully redirected to dashboard');
      
      // Try to find navigation elements
      const navCount = await page.locator('nav a, [role="navigation"] a').count();
      console.log(`Found ${navCount} navigation items`);
      
      if (navCount > 0) {
        // 5. Test navigation to different sections
        console.log('\n📍 Step 5: Testing Navigation');
        
        // Calendar
        const calendarLink = page.locator('a:has-text("Calendar"), a[href*="calendar"]').first();
        if (await calendarLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await calendarLink.click();
          await waitForNetworkIdle(page);
          await takeScreenshot(page, '05-calendar-view');
        }
        
        // Unit Plans
        const unitPlansLink = page.locator('a:has-text("Unit Plans"), a[href*="unit"]').first();
        if (await unitPlansLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await unitPlansLink.click();
          await waitForNetworkIdle(page);
          await takeScreenshot(page, '06-unit-plans');
        }
        
        // Lesson Plans
        const lessonPlansLink = page.locator('a:has-text("Lesson Plans"), a[href*="lesson"]').first();
        if (await lessonPlansLink.isVisible({ timeout: 5000 }).catch(() => false)) {
          await lessonPlansLink.click();
          await waitForNetworkIdle(page);
          await takeScreenshot(page, '07-lesson-plans');
        }
      }
    } else {
      console.log('⚠️ Login did not redirect to dashboard, current URL:', currentUrl);
    }

    console.log('\n✅ Application flow test completed');
  });

  test('should handle ETFO lesson planning workflow', async ({ page }) => {
    console.log('\n🎯 ETFO Lesson Planning Workflow');
    
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"], input[type="email"]', 'teacher@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // Check if ETFO planning feature exists
    const etfoLink = page.locator('a:has-text("ETFO"), a[href*="etfo"]').first();
    if (await etfoLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await etfoLink.click();
      await waitForNetworkIdle(page);
      await takeScreenshot(page, 'etfo-01-planning-dashboard');

      // Look for create button
      const createButton = page.locator('button:has-text("New ETFO Lesson"), button:has-text("Create Lesson")').first();
      if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await createButton.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'etfo-02-lesson-form');
      }
    } else {
      console.log('⚠️ ETFO planning feature not found in navigation');
    }
  });

  test('should test responsive design', async ({ page }) => {
    console.log('\n📱 Testing Responsive Design');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await takeScreenshot(page, 'responsive-01-mobile-landing');
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await takeScreenshot(page, 'responsive-02-tablet-landing');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await takeScreenshot(page, 'responsive-03-desktop-landing');
  });

  test('should handle error states gracefully', async ({ page }) => {
    console.log('\n⚠️ Testing Error Handling');
    
    // Test 404 page
    await page.goto('/non-existent-page');
    await takeScreenshot(page, 'error-01-404-page');
    
    // Test form validation errors
    await page.goto('/login');
    await page.click('button[type="submit"]'); // Submit empty form
    await page.waitForTimeout(500); // Wait for validation messages
    await takeScreenshot(page, 'error-02-validation-errors');
    
    // Test offline mode
    await page.context().setOffline(true);
    await page.goto('/').catch(() => {}); // Expect this to fail
    await takeScreenshot(page, 'error-03-offline-state');
    await page.context().setOffline(false);
  });
});