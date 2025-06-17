import { APIRequestContext } from '@playwright/test';

export async function createTestData(request: APIRequestContext) {
  // Get token from the auth state that was set up in global-setup
  const authState = {
    token: process.env.TEST_AUTH_TOKEN || '',
  };

  // Create test subject if needed
  try {
    const subjectsResponse = await request.get('/api/subjects', {
      headers: {
        Authorization: `Bearer ${authState.token}`,
      },
    });

    const subjects = await subjectsResponse.json();

    // Check if test subject already exists
    if (!subjects.some((s: { name: string }) => s.name === 'Test Subject')) {
      await request.post('/api/subjects', {
        headers: {
          Authorization: `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
        data: {
          name: 'Test Subject',
        },
      });
    }
  } catch (error) {
    console.error('Error creating test data:', error);
  }
}
