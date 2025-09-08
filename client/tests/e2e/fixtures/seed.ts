/**
 * Data seeding fixture for deterministic test data
 */

import { test as base } from './auth';

const TEST_SECRET = process.env.TEST_SECRET || 'test-secret-token';

export const test = base.extend<{
  tier?: 'smoke' | 'full';
}>({
  tier: ['smoke', { option: true }], // Default to smoke for faster tests
  
  // Seed data once per worker
  // @ts-ignore - Playwright worker fixture
  seedData: [async ({ playwright, tier }, use) => {
    const seedTier = tier || 'smoke';
    
    // Seed the data
    const seedResponse = await playwright.request.newContext()
      .then(ctx => ctx.post(`http://localhost:3000/__test__/seed/${seedTier}`, {
        headers: { 'X-Test-Token': TEST_SECRET }
      }));
    
    if (!seedResponse.ok()) {
      throw new Error(`Failed to seed data: ${seedResponse.status()} ${seedResponse.statusText()}`);
    }
    
    const seedResult = await seedResponse.json();
    console.log(`✅ Seeded ${seedResult.lessons} lessons for ${seedTier} tier`);
    
    await use();
    
    // Reset after all tests in this worker
    const resetResponse = await playwright.request.newContext()
      .then(ctx => ctx.post('http://localhost:3000/__test__/reset', {
        headers: { 'X-Test-Token': TEST_SECRET }
      }));
    
    if (!resetResponse.ok()) {
      console.warn('Failed to reset data after tests');
    }
  }, { scope: 'worker' }]
});

export { expect } from '@playwright/test';