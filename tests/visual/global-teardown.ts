/**
 * Global teardown for visual regression tests
 * Cleans up test environment and generates reports
 */

import { FullConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up visual test environment...');

  // Generate visual regression report if failures exist
  const resultsDir = path.join(config.rootDir, 'visual-test-results');
  const reportPath = path.join(resultsDir, 'visual-report.json');

  try {
    const reportExists = await fs
      .access(reportPath)
      .then(() => true)
      .catch(() => false);

    if (reportExists) {
      const report = JSON.parse(await fs.readFile(reportPath, 'utf-8'));
      const failedTests = report.tests?.filter((t: any) => t.status === 'failed') || [];

      if (failedTests.length > 0) {
        console.log(`\n⚠️  ${failedTests.length} visual regression tests failed:`);
        failedTests.forEach((test: any) => {
          console.log(`   - ${test.title} (${test.project})`);
        });
        console.log(`\n📸 Review screenshots in: ${resultsDir}/artifacts`);
      }
    }
  } catch (error) {
    // Report may not exist if all tests passed
  }

  console.log('✅ Visual test cleanup complete');
}

export default globalTeardown;
