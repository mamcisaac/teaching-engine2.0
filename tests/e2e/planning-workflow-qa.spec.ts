import { test, expect, Page, BrowserContext } from '@playwright/test';
import { loginAsTestUser, createTestUser, cleanupTestData } from './helpers/auth';

interface PlanningTestData {
  userId: number;
  longRangePlanId: string;
  unitPlanId: string;
  lessonPlanId: string;
  curriculumExpectationId: string;
}

class PlanningWorkflowPage {
  constructor(private page: Page) {}

  // Navigation helpers
  async navigateToPlanningDashboard() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToLongRangePlans() {
    await this.page.click('text=Long-Range Plans');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToUnitPlans() {
    await this.page.click('text=Create Unit Plan');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToLessonPlans() {
    await this.page.click('text=Lesson Templates');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToDaybook() {
    await this.page.click('text=Daily Reflections');
    await this.page.waitForLoadState('networkidle');
  }

  // State management helpers
  async openPlannerSettings() {
    await this.page.click('[title="Planner Settings"]');
    await this.page.waitForSelector('text=Planner Preferences');
  }

  async saveSettings() {
    await this.page.click('text=Save Preferences');
    await this.page.waitForLoadState('networkidle');
  }

  async performUndo() {
    await this.page.click('[title="Undo (Ctrl+Z)"]');
    await this.page.waitForTimeout(500);
  }

  async performRedo() {
    await this.page.click('[title="Redo (Ctrl+Y)"]');
    await this.page.waitForTimeout(500);
  }

  async manualSave() {
    await this.page.click('[title="Save (Ctrl+S)"]');
    await this.page.waitForLoadState('networkidle');
  }

  // Planning workflow helpers
  async createLongRangePlan(title: string, academicYear: string = '2024-2025') {
    await this.page.fill('[data-testid="long-range-plan-title"]', title);
    await this.page.fill('[data-testid="academic-year"]', academicYear);
    await this.page.selectOption('[data-testid="grade-select"]', '1');
    await this.page.selectOption('[data-testid="subject-select"]', 'Mathematics');
    await this.page.click('[data-testid="create-long-range-plan"]');
    await this.page.waitForLoadState('networkidle');
  }

  async createUnitPlan(title: string, description: string) {
    await this.page.fill('[data-testid="unit-plan-title"]', title);
    await this.page.fill('[data-testid="unit-plan-description"]', description);
    await this.page.fill('[data-testid="start-date"]', '2024-02-01');
    await this.page.fill('[data-testid="end-date"]', '2024-02-28');
    await this.page.click('[data-testid="create-unit-plan"]');
    await this.page.waitForLoadState('networkidle');
  }

  async createLessonPlan(title: string) {
    await this.page.fill('[data-testid="lesson-plan-title"]', title);
    await this.page.fill('[data-testid="lesson-date"]', '2024-02-15');
    await this.page.fill('[data-testid="lesson-duration"]', '60');
    await this.page.fill('[data-testid="minds-on"]', 'Introduction activity');
    await this.page.fill('[data-testid="action"]', 'Main learning activity');
    await this.page.fill('[data-testid="consolidation"]', 'Wrap-up and assessment');
    await this.page.click('[data-testid="create-lesson-plan"]');
    await this.page.waitForLoadState('networkidle');
  }

  async addDaybookReflection(reflection: string) {
    await this.page.fill('[data-testid="daybook-reflection"]', reflection);
    await this.page.click('[data-testid="save-reflection"]');
    await this.page.waitForLoadState('networkidle');
  }

  // Validation helpers
  async validateProgressTracking() {
    const progressCards = await this.page.locator('[data-testid="progress-card"]').count();
    expect(progressCards).toBeGreaterThan(0);
    
    const workflowProgress = await this.page.textContent('[data-testid="workflow-progress"]');
    expect(workflowProgress).toMatch(/\d+%/);
  }

  async validateCurriculumCoverage() {
    await this.page.click('text=Curriculum Coverage');
    await this.page.waitForSelector('[data-testid="curriculum-coverage-chart"]');
    
    const coveragePercentage = await this.page.textContent('[data-testid="coverage-percentage"]');
    expect(coveragePercentage).toMatch(/\d+%/);
  }

  async validateStateRestoration() {
    const currentView = await this.page.getAttribute('[data-testid="current-view"]', 'data-view');
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    
    const restoredView = await this.page.getAttribute('[data-testid="current-view"]', 'data-view');
    expect(restoredView).toBe(currentView);
  }
}

test.describe('Planning Workflow QA Suite', () => {
  let planningPage: PlanningWorkflowPage;
  let testData: PlanningTestData;

  test.beforeEach(async ({ page }) => {
    planningPage = new PlanningWorkflowPage(page);
    await loginAsTestUser(page);
  });

  test.afterEach(async ({ page }) => {
    if (testData?.userId) {
      await cleanupTestData(page, testData.userId);
    }
  });

  test.describe('Complete Planning Workflow', () => {
    test('should complete end-to-end planning workflow from dashboard to daybook', async ({ page }) => {
      await test.step('Navigate to planning dashboard', async () => {
        await planningPage.navigateToPlanningDashboard();
        await expect(page.locator('h1')).toHaveText('Planning Dashboard');
      });

      await test.step('Create long-range plan', async () => {
        await planningPage.navigateToLongRangePlans();
        await planningPage.createLongRangePlan('Grade 1 Mathematics Year Plan');
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      });

      await test.step('Create unit plan', async () => {
        await planningPage.navigateToUnitPlans();
        await planningPage.createUnitPlan('Number Sense Unit', 'Introduction to numbers 1-20');
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      });

      await test.step('Create lesson plan', async () => {
        await planningPage.navigateToLessonPlans();
        await planningPage.createLessonPlan('Counting to 10');
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      });

      await test.step('Add daybook reflection', async () => {
        await planningPage.navigateToDaybook();
        await planningPage.addDaybookReflection('Students engaged well with counting manipulatives');
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
      });

      await test.step('Validate progress tracking', async () => {
        await planningPage.navigateToPlanningDashboard();
        await planningPage.validateProgressTracking();
      });
    });
  });

  test.describe('State Management & Persistence', () => {
    test('should persist planner state across sessions', async ({ page, context }) => {
      await test.step('Configure planner preferences', async () => {
        await planningPage.navigateToPlanningDashboard();
        await planningPage.openPlannerSettings();
        
        // Change default view
        await page.selectOption('[data-testid="default-view"]', 'month');
        await page.check('[data-testid="show-weekends"]');
        await page.selectOption('[data-testid="theme"]', 'dark');
        
        await planningPage.saveSettings();
      });

      await test.step('Verify state persistence after reload', async () => {
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        await planningPage.openPlannerSettings();
        
        const defaultView = await page.inputValue('[data-testid="default-view"]');
        const showWeekends = await page.isChecked('[data-testid="show-weekends"]');
        const theme = await page.inputValue('[data-testid="theme"]');
        
        expect(defaultView).toBe('month');
        expect(showWeekends).toBe(true);
        expect(theme).toBe('dark');
      });

      await test.step('Verify state persistence across new session', async () => {
        await context.clearCookies();
        await loginAsTestUser(page);
        await planningPage.navigateToPlanningDashboard();
        
        await planningPage.openPlannerSettings();
        
        const defaultView = await page.inputValue('[data-testid="default-view"]');
        expect(defaultView).toBe('month');
      });
    });

    test('should handle undo/redo operations', async ({ page }) => {
      await planningPage.navigateToPlanningDashboard();
      
      await test.step('Perform actions and undo', async () => {
        await planningPage.openPlannerSettings();
        await page.selectOption('[data-testid="default-view"]', 'agenda');
        await planningPage.saveSettings();
        
        await planningPage.performUndo();
        
        await planningPage.openPlannerSettings();
        const defaultView = await page.inputValue('[data-testid="default-view"]');
        expect(defaultView).toBe('week'); // Should be back to default
      });

      await test.step('Perform redo operation', async () => {
        await planningPage.performRedo();
        
        await planningPage.openPlannerSettings();
        const defaultView = await page.inputValue('[data-testid="default-view"]');
        expect(defaultView).toBe('agenda'); // Should be restored
      });
    });

    test('should handle auto-save functionality', async ({ page }) => {
      await planningPage.navigateToPlanningDashboard();
      
      await test.step('Configure auto-save', async () => {
        await planningPage.openPlannerSettings();
        await page.check('[data-testid="auto-save"]');
        await page.fill('[data-testid="auto-save-interval"]', '5'); // 5 seconds
        await planningPage.saveSettings();
      });

      await test.step('Make changes and verify auto-save', async () => {
        await planningPage.openPlannerSettings();
        await page.selectOption('[data-testid="time-slot-duration"]', '60');
        
        // Wait for auto-save
        await expect(page.locator('[data-testid="auto-save-indicator"]')).toBeVisible();
        await page.waitForTimeout(6000); // Wait for auto-save interval
        
        // Verify auto-save completed
        await expect(page.locator('[data-testid="auto-save-indicator"][data-status="saved"]')).toBeVisible();
      });
    });
  });

  test.describe('Curriculum Coverage & Tracking', () => {
    test('should track curriculum expectation coverage', async ({ page }) => {
      await planningPage.navigateToPlanningDashboard();
      
      await test.step('Validate initial coverage state', async () => {
        await planningPage.validateCurriculumCoverage();
      });

      await test.step('Create planning content and verify coverage updates', async () => {
        // Create plans with curriculum expectations
        await planningPage.navigateToLongRangePlans();
        await planningPage.createLongRangePlan('Coverage Test Plan');
        
        // Return to dashboard and check updated coverage
        await planningPage.navigateToPlanningDashboard();
        await planningPage.validateCurriculumCoverage();
      });
    });

    test('should identify uncovered curriculum expectations', async ({ page }) => {
      await planningPage.navigateToPlanningDashboard();
      
      await page.click('text=Curriculum Coverage');
      await expect(page.locator('[data-testid="uncovered-expectations"]')).toBeVisible();
      
      const uncoveredCount = await page.textContent('[data-testid="uncovered-count"]');
      expect(uncoveredCount).toMatch(/\d+/);
    });
  });

  test.describe('Error Handling & Recovery', () => {
    test('should handle network failures gracefully', async ({ page, context }) => {
      await planningPage.navigateToPlanningDashboard();
      
      await test.step('Simulate network failure', async () => {
        await context.setOffline(true);
        
        await planningPage.openPlannerSettings();
        await page.selectOption('[data-testid="default-view"]', 'month');
        await planningPage.saveSettings();
        
        // Should show offline indicator
        await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
      });

      await test.step('Restore network and sync', async () => {
        await context.setOffline(false);
        await page.click('[title="Sync offline changes"]');
        
        // Should sync successfully
        await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
      });
    });

    test('should recover from server errors', async ({ page }) => {
      await planningPage.navigateToPlanningDashboard();
      
      // Mock server error
      await page.route('**/api/planner/state', route => {
        route.fulfill({ status: 500, body: 'Server Error' });
      });

      await planningPage.openPlannerSettings();
      await planningPage.saveSettings();
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
      
      // Should allow retry
      await page.click('[data-testid="retry-button"]');
    });
  });

  test.describe('User Journey Validation', () => {
    test('should guide new teacher through onboarding', async ({ page }) => {
      // Test the complete onboarding flow
      await test.step('Start onboarding', async () => {
        await page.goto('/onboarding');
        await expect(page.locator('h1')).toHaveText('Welcome to Teaching Engine 2.0');
      });

      await test.step('Complete curriculum setup', async () => {
        await page.click('text=Set Up Curriculum');
        await page.selectOption('[data-testid="grade-level"]', '1');
        await page.selectOption('[data-testid="subject-area"]', 'Mathematics');
        await page.click('text=Continue');
      });

      await test.step('Configure planner preferences', async () => {
        await page.selectOption('[data-testid="default-view"]', 'week');
        await page.check('[data-testid="auto-save"]');
        await page.click('text=Complete Setup');
      });

      await test.step('Verify dashboard access', async () => {
        await expect(page.locator('h1')).toHaveText('Planning Dashboard');
        await planningPage.validateProgressTracking();
      });
    });

    test('should support daily teacher workflow', async ({ page }) => {
      await planningPage.navigateToPlanningDashboard();
      
      await test.step('Check daily schedule', async () => {
        await expect(page.locator('[data-testid="todays-lessons"]')).toBeVisible();
      });

      await test.step('Access quick actions', async () => {
        await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
        
        const quickActions = [
          'Create Lesson Plan',
          'Add Reflection',
          'View Progress',
          'Generate Report'
        ];
        
        for (const action of quickActions) {
          await expect(page.locator(`text=${action}`)).toBeVisible();
        }
      });

      await test.step('Navigate between planning levels', async () => {
        const planningLevels = [
          { name: 'Long-Range Plans', route: '/planner/long-range' },
          { name: 'Unit Plans', route: '/planner/units' },
          { name: 'Lesson Plans', route: '/planner/etfo-lessons' },
          { name: 'Daily Reflections', route: '/planner/daybook' }
        ];

        for (const level of planningLevels) {
          await page.click(`text=${level.name}`);
          await page.waitForURL(`**${level.route}`);
          await expect(page).toHaveURL(new RegExp(level.route));
        }
      });
    });
  });

  test.describe('Performance & Accessibility', () => {
    test('should meet performance benchmarks', async ({ page }) => {
      await test.step('Measure page load time', async () => {
        const startTime = Date.now();
        await planningPage.navigateToPlanningDashboard();
        const loadTime = Date.now() - startTime;
        
        expect(loadTime).toBeLessThan(3000); // 3 second load time
      });

      await test.step('Measure state operation performance', async () => {
        const startTime = Date.now();
        await planningPage.openPlannerSettings();
        await planningPage.saveSettings();
        const operationTime = Date.now() - startTime;
        
        expect(operationTime).toBeLessThan(1000); // 1 second for state operations
      });
    });

    test('should be accessible to screen readers', async ({ page }) => {
      await planningPage.navigateToPlanningDashboard();
      
      // Check for proper ARIA labels and roles
      const dashboardHeading = page.locator('h1');
      await expect(dashboardHeading).toHaveAttribute('role', 'heading');
      
      const navigationButtons = page.locator('button[aria-label]');
      const buttonCount = await navigationButtons.count();
      expect(buttonCount).toBeGreaterThan(0);
      
      // Check for keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(['BUTTON', 'A', 'INPUT']).toContain(focusedElement);
    });
  });
});

test.describe('Cross-Browser Compatibility', () => {
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`should work correctly in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
      test.skip(currentBrowser !== browserName, `Skipping ${browserName} test in ${currentBrowser}`);
      
      const planningPage = new PlanningWorkflowPage(page);
      await loginAsTestUser(page);
      
      await planningPage.navigateToPlanningDashboard();
      await expect(page.locator('h1')).toHaveText('Planning Dashboard');
      
      // Test core functionality
      await planningPage.openPlannerSettings();
      await page.selectOption('[data-testid="default-view"]', 'month');
      await planningPage.saveSettings();
      
      // Verify state persistence
      await page.reload();
      await planningPage.openPlannerSettings();
      const defaultView = await page.inputValue('[data-testid="default-view"]');
      expect(defaultView).toBe('month');
    });
  });
});

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    const planningPage = new PlanningWorkflowPage(page);
    await loginAsTestUser(page);
    
    await planningPage.navigateToPlanningDashboard();
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test touch interactions
    await page.click('[data-testid="mobile-menu"]');
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();
    
    // Test swipe gestures (if supported)
    await page.touchscreen.tap(200, 300);
    await page.touchscreen.tap(100, 300);
  });
});

// Utility for running performance benchmarks
async function measurePerformance(page: Page, operation: () => Promise<void>): Promise<number> {
  const startTime = Date.now();
  await operation();
  return Date.now() - startTime;
}