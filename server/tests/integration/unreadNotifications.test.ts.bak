/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { jest } from '@jest/globals';
import { getTestPrismaClient } from '../jest.setup';

// Email service removed - app only creates newsletter drafts, doesn't send emails

// Import after mock is set up
// NOTE: This function doesn't exist yet - test is disabled
const sendUnreadNotifications = async () => {
  throw new Error('sendUnreadNotifications not implemented');
};

/**
 * @todo This test uses mocked email service and should be converted to integration test
 * @mocked emailService - prevents testing actual email notification flow
 * @not-fully-implemented - should use real email service with test configuration
 */
// DISABLED: sendUnreadNotifications function not implemented
describe.skip('Unread Notifications - DISABLED (function not implemented)', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(() => {
    prisma = getTestPrismaClient();
    jest.clearAllMocks();
  });

  test.skip('emails unread notifications older than 48h - DISABLED (function not implemented)', async () => {
    // Create old notification (older than 48 hours)
    await prisma.notification.create({
      data: {
        message: 'Old note',
        createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
        read: false,
      },
    });

    await sendUnreadNotifications();
    // Email service removed - app only creates newsletter drafts, doesn't send emails
  });
});
