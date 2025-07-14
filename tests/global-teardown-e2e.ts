/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/**
 * Global teardown for E2E tests
 */
export default async function globalTeardown(): Promise<void> {
  console.log('\n🧹 Starting E2E global teardown...\n');

  try {
    // Clean up test data if server is available
    if (global.__TEST_SERVER_URL__ && global.__E2E_TEST_USER__) {
      console.log('🗑️  Cleaning up test data...');

      try {
        // Delete test user via API
        const response = await fetch(
          `${global.__TEST_SERVER_URL__}/api/test/users/${global.__E2E_TEST_USER__.email}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${global.__E2E_TEST_USER__.token}`,
            },
          },
        );

        if (response.ok) {
          console.log('✅ Test user cleaned up');
        } else {
          console.warn('Failed to clean up test user:', response.statusText);
        }
      } catch (_error) {
        console.warn('Error cleaning up test data:', error);
      }
    }

    // Clear global references
    delete global.__TEST_SERVER_URL__;
    delete global.__E2E_TEST_USER__;

    console.log('\n✅ E2E global teardown complete\n');
  } catch (_error) {
    console.error('❌ Error during E2E global teardown:', error);
    // Don't throw - we want cleanup to be best effort
  }
}
