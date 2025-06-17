import { jest } from '@jest/globals';
import {
  sendEmail,
  setEmailHandler,
  clearEmailHandler,
  EmailAttachment,
} from '../services/emailService.js';

// Mock dependencies
jest.mock('nodemailer');
const mockNodemailer = jest.mocked(await import('nodemailer'));

// Mock logger
jest.mock('../logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock transporter
const mockTransporter = {
  sendMail: jest.fn(),
};

describe('EmailService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    clearEmailHandler();
    mockNodemailer.createTransport.mockReturnValue(mockTransporter as ReturnType<typeof mockNodemailer.createTransport>);
  });

  afterEach(() => {
    process.env = originalEnv;
    clearEmailHandler();
  });

  describe('sendEmail with custom handler', () => {
    it('should use custom email handler when set', async () => {
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      setEmailHandler(mockHandler);

      await sendEmail('test@example.com', 'Test Subject', 'Test text', '<p>Test HTML</p>');

      expect(mockHandler).toHaveBeenCalledWith(
        'test@example.com',
        'Test Subject',
        'Test text',
        '<p>Test HTML</p>',
        undefined
      );
    });

    it('should pass attachment to custom handler', async () => {
      const mockHandler = jest.fn().mockResolvedValue(undefined);
      setEmailHandler(mockHandler);

      const attachment: EmailAttachment = {
        filename: 'test.pdf',
        content: Buffer.from('test-content'),
      };

      await sendEmail('test@example.com', 'Test Subject', 'Test text', undefined, attachment);

      expect(mockHandler).toHaveBeenCalledWith(
        'test@example.com',
        'Test Subject',
        'Test text',
        undefined,
        attachment
      );
    });

    it('should handle custom handler errors', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('Handler error'));
      setEmailHandler(mockHandler);

      await expect(
        sendEmail('test@example.com', 'Test Subject', 'Test text')
      ).rejects.toThrow('Handler error');
    });
  });

  describe('sendEmail with SendGrid', () => {
    beforeEach(() => {
      process.env.SENDGRID_API_KEY = 'test-api-key';
      process.env.EMAIL_FROM = 'sender@example.com';
      mockFetch.mockResolvedValue({
        ok: true,
        status: 202,
      } as Response);
    });

    it('should send email via SendGrid API', async () => {
      await sendEmail('test@example.com', 'Test Subject', 'Test text', '<p>Test HTML</p>');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.sendgrid.com/v3/mail/send',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer test-api-key',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: 'test@example.com' }] }],
            from: { email: 'sender@example.com' },
            subject: 'Test Subject',
            content: [
              { type: 'text/plain', value: 'Test text' },
              { type: 'text/html', value: '<p>Test HTML</p>' },
            ],
          }),
        }
      );
    });

    it('should send text-only email via SendGrid', async () => {
      await sendEmail('test@example.com', 'Test Subject', 'Test text');

      const expectedBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(expectedBody.content).toEqual([
        { type: 'text/plain', value: 'Test text' },
      ]);
    });

    it('should include attachment in SendGrid email', async () => {
      const attachment: EmailAttachment = {
        filename: 'test.pdf',
        content: Buffer.from('test-content'),
      };

      await sendEmail('test@example.com', 'Test Subject', 'Test text', undefined, attachment);

      const expectedBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(expectedBody.attachments).toEqual([
        {
          content: Buffer.from('test-content').toString('base64'),
          filename: 'test.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ]);
    });

    it('should use default email from when not configured', async () => {
      delete process.env.EMAIL_FROM;

      await sendEmail('test@example.com', 'Test Subject', 'Test text');

      const expectedBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(expectedBody.from).toEqual({ email: 'no-reply@example.com' });
    });

    it('should handle SendGrid API errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        sendEmail('test@example.com', 'Test Subject', 'Test text')
      ).rejects.toThrow('Network error');
    });
  });

  describe('sendEmail with SMTP', () => {
    beforeEach(() => {
      delete process.env.SENDGRID_API_KEY;
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '587';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';
      process.env.EMAIL_FROM = 'sender@example.com';
      mockTransporter.sendMail.mockResolvedValue({ messageId: 'test-id' });
    });

    it('should send email via SMTP transporter', async () => {
      await sendEmail('test@example.com', 'Test Subject', 'Test text', '<p>Test HTML</p>');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'sender@example.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test text',
        html: '<p>Test HTML</p>',
        attachments: undefined,
      });
    });

    it('should include attachment in SMTP email', async () => {
      const attachment: EmailAttachment = {
        filename: 'test.pdf',
        content: Buffer.from('test-content'),
      };

      await sendEmail('test@example.com', 'Test Subject', 'Test text', undefined, attachment);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: 'sender@example.com',
        to: 'test@example.com',
        subject: 'Test Subject',
        text: 'Test text',
        html: undefined,
        attachments: [attachment],
      });
    });

    it('should use default email from when not configured', async () => {
      delete process.env.EMAIL_FROM;

      await sendEmail('test@example.com', 'Test Subject', 'Test text');

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'no-reply@example.com',
        })
      );
    });

    it('should handle SMTP errors', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        sendEmail('test@example.com', 'Test Subject', 'Test text')
      ).rejects.toThrow('SMTP error');
    });
  });

  describe('sendEmail with no provider configured', () => {
    beforeEach(() => {
      delete process.env.SENDGRID_API_KEY;
      delete process.env.SMTP_HOST;
    });

    it('should log email when no provider is configured', async () => {
      const mockLogger = jest.mocked(await import('../logger')).default;

      await sendEmail('test@example.com', 'Test Subject', 'Test text');

      expect(mockLogger.info).toHaveBeenCalledWith(
        {
          to: 'test@example.com',
          subject: 'Test Subject',
          text: 'Test text',
          attachment: false,
        },
        'Email'
      );
    });

    it('should log attachment presence', async () => {
      const mockLogger = jest.mocked(await import('../logger')).default;
      const attachment: EmailAttachment = {
        filename: 'test.pdf',
        content: Buffer.from('test-content'),
      };

      await sendEmail('test@example.com', 'Test Subject', 'Test text', undefined, attachment);

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          attachment: true,
        }),
        'Email'
      );
    });
  });

  describe('SMTP configuration', () => {
    it('should create transporter with authentication', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      process.env.SMTP_PORT = '465';
      process.env.SMTP_USER = 'user@example.com';
      process.env.SMTP_PASS = 'password';

      // Re-import to trigger transporter creation
      jest.resetModules();

      expect(mockNodemailer.createTransporter).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 465,
        auth: {
          user: 'user@example.com',
          pass: 'password',
        },
      });
    });

    it('should create transporter without authentication', () => {
      process.env.SMTP_HOST = 'smtp.example.com';
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      // Re-import to trigger transporter creation
      jest.resetModules();

      expect(mockNodemailer.createTransporter).toHaveBeenCalledWith({
        host: 'smtp.example.com',
        port: 587, // default port
        auth: undefined,
      });
    });

    it('should not create transporter when SMTP_HOST not set', () => {
      delete process.env.SMTP_HOST;

      // Re-import to trigger transporter creation
      jest.resetModules();

      expect(mockNodemailer.createTransporter).not.toHaveBeenCalled();
    });
  });

  describe('email handler management', () => {
    it('should clear custom email handler', () => {
      const mockHandler = jest.fn();
      setEmailHandler(mockHandler);
      clearEmailHandler();

      // Since no providers are configured, it should log instead of using handler
      sendEmail('test@example.com', 'Test Subject', 'Test text');

      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});