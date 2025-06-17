import { jest } from '@jest/globals';
import { getTestPrismaClient } from './jest.setup';
import { sendUnreadNotifications } from '../src/jobs/unreadNotificationEmail';

// Mock the email service
const mockSendEmail = jest.fn().mockResolvedValue(undefined);
jest.unstable_mockModule('../src/services/emailService', () => ({
  sendEmail: mockSendEmail,
}));

describe('Unread Notifications', () => {
  let prisma: ReturnType<typeof getTestPrismaClient>;

  beforeEach(() => {
    prisma = getTestPrismaClient();
    jest.clearAllMocks();
  });

  test('emails unread notifications older than 48h', async () => {
    // Create old notification (older than 48 hours)
    await prisma.notification.create({
      data: {
        message: 'Old note',
        createdAt: new Date(Date.now() - 3 * 86400000), // 3 days ago
        read: false,
      },
    });

    await sendUnreadNotifications();
    expect(mockSendEmail).toHaveBeenCalled();
    expect(mockSendEmail).toHaveBeenCalledWith(
      'teacher@example.com',
      'Unread Notification',
      'Old note',
    );
  });
});
