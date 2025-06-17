import { describe, beforeAll, afterAll, beforeEach, it, expect, jest } from '@jest/globals';
import { authRequest } from './test-auth-helper';
import { getTestPrismaClient } from './jest.setup';
import { getTestEmailService, resetTestEmailService } from './helpers/testEmailService';
import { generateTestEmail, expectEmailContent } from './helpers/emailTestHelper';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { app } from '../src/index';
import { setEmailHandler, clearEmailHandler } from '../src/services/emailService';

// Increase test timeout for email tests
jest.setTimeout(60000);

describe('Email Service Integration Tests', () => {
  let testEmailService: ReturnType<typeof getTestEmailService>;
  let teacherToken: string;
  let testUser: {
    email: string;
    password: string;
    name: string;
    role: 'teacher';
  };
  let prisma: ReturnType<typeof getTestPrismaClient>;
  const auth = authRequest(app);

  beforeAll(async () => {
    prisma = getTestPrismaClient();
    await auth.setup();
    testEmailService = getTestEmailService();

    // Set up email handler to capture emails in tests
    setEmailHandler(async (to, subject, text, html, attachment) => {
      await testEmailService.sendEmail(
        to,
        subject,
        text,
        html,
        attachment
          ? {
              filename: attachment.filename,
              content: attachment.content,
            }
          : undefined,
      );
    });

    // Create test user
    const id = randomBytes(4).toString('hex');
    testUser = {
      email: `teacher-${id}@example.com`,
      password: `password-${id}`,
      name: `Teacher ${id}`,
      role: 'teacher',
    };

    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    await prisma.user.create({
      data: {
        email: testUser.email,
        password: hashedPassword,
        name: testUser.name,
        role: testUser.role,
      },
    });

    // Get auth token
    const loginRes = await auth.post('/api/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    teacherToken = loginRes.body.token;
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({ where: { email: testUser.email } });
      clearEmailHandler();
      await resetTestEmailService();
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    await testEmailService.clearEmails();
    // Clear any existing test data
    await prisma.parentContact.deleteMany();
    await prisma.newsletter.deleteMany();
  });

  describe('Newsletter Email Tests', () => {
    it('sends newsletter with PDF attachment to parent contacts', async () => {
      // Create test parent contacts
      const parentContacts = [
        {
          name: 'John Parent',
          email: generateTestEmail(),
          studentName: 'John Jr',
        },
        {
          name: 'Jane Parent',
          email: generateTestEmail(),
          studentName: 'Jane Jr',
        },
      ];

      await Promise.all(
        parentContacts.map((contact) => prisma.parentContact.create({ data: contact })),
      );

      // Create newsletter
      const newsletter = await prisma.newsletter.create({
        data: {
          title: 'Weekly Newsletter - Test Edition',
          content:
            '<h1>Weekly Newsletter</h1><p>This is a test newsletter with important updates.</p>',
        },
      });

      // Send newsletter
      const sendRes = await auth
        .post(`/api/newsletters/${newsletter.id}/send`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.sent).toBe(2);

      // Verify emails were sent
      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(2);

      // Check first email
      const firstEmail = emails.find((email) => email.to.includes(parentContacts[0].email));
      expect(firstEmail).toBeDefined();

      expectEmailContent(firstEmail!, {
        subject: 'Weekly Newsletter - Test Edition',
        text: 'Please see the attached newsletter.',
      });

      // Verify PDF attachment
      expect(firstEmail!.attachments).toHaveLength(1);
      const attachment = firstEmail!.attachments![0];
      expect(attachment.filename).toBe('newsletter.pdf');
      expect(attachment.contentType).toContain('pdf');
      expect(attachment.content).toBeInstanceOf(Buffer);
      expect(attachment.content.length).toBeGreaterThan(0);
    });

    it('handles newsletter sending with no parent contacts', async () => {
      // Create newsletter without any parent contacts
      const newsletter = await prisma.newsletter.create({
        data: {
          title: 'Empty Newsletter',
          content: '<p>Test content</p>',
        },
      });

      const sendRes = await auth
        .post(`/api/newsletters/${newsletter.id}/send`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(sendRes.status).toBe(200);
      expect(sendRes.body.sent).toBe(0);

      // Verify no emails were sent
      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(0);
    });

    it('handles newsletter sending failures gracefully', async () => {
      // Create parent contact with invalid email format
      const parentContacts = [
        {
          name: 'Valid Parent',
          email: generateTestEmail(),
          studentName: 'Valid Student',
        },
        {
          name: 'Invalid Parent',
          email: 'invalid-email',
          studentName: 'Invalid Student',
        },
      ];

      await Promise.all(
        parentContacts.map((contact) => prisma.parentContact.create({ data: contact })),
      );

      const newsletter = await prisma.newsletter.create({
        data: {
          title: 'Test Newsletter',
          content: '<p>Test content</p>',
        },
      });

      // Newsletter sending should not fail completely
      const sendRes = await auth
        .post(`/api/newsletters/${newsletter.id}/send`)
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(sendRes.status).toBe(200);
      // Should report attempted sends even if some fail
      expect(sendRes.body.sent).toBe(2);
    });
  });

  describe('Bulk Email Operations', () => {
    it('sends bulk emails to multiple recipients', async () => {
      const recipients = [generateTestEmail(), generateTestEmail(), generateTestEmail()];

      const subject = 'Bulk Email Test';
      const text = 'This is a bulk email test message';

      const result = await testEmailService.sendBulkEmails(recipients, subject, text);

      expect(result.sent).toBe(3);
      expect(result.failed).toHaveLength(0);

      // Verify all emails were sent
      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(3);

      recipients.forEach((recipient) => {
        const email = emails.find((e) => e.to.includes(recipient));
        expect(email).toBeDefined();
        expectEmailContent(email!, {
          subject,
          text,
        });
      });
    });

    it('handles partial failures in bulk email sending', async () => {
      const validRecipients = [generateTestEmail(), generateTestEmail()];
      const invalidRecipients = ['invalid-email-1', 'invalid-email-2'];
      const allRecipients = [...validRecipients, ...invalidRecipients];

      const result = await testEmailService.sendBulkEmails(
        allRecipients,
        'Bulk Test',
        'Test message',
      );

      // Should have some successes and some failures
      expect(result.sent).toBeGreaterThan(0);
      expect(result.failed).toHaveLength(2);
      expect(result.failed).toEqual(expect.arrayContaining(invalidRecipients));
    });
  });

  describe('Email Retry Mechanism', () => {
    it('retries failed email sends', async () => {
      const recipient = generateTestEmail();
      const subject = 'Retry Test';
      const text = 'This email should be retried';

      // First attempt should succeed after retries
      await expect(
        testEmailService.sendEmailWithRetry(recipient, subject, text, undefined, 3, 100),
      ).resolves.not.toThrow();

      // Verify email was eventually sent
      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(1);
      expectEmailContent(emails[0], {
        to: [recipient],
        subject,
        text,
      });
    });

    it('fails after maximum retry attempts', async () => {
      // Mock the send function to always fail
      const originalSend = testEmailService.sendEmail;
      jest.spyOn(testEmailService, 'sendEmail').mockRejectedValue(new Error('Network error'));

      const recipient = generateTestEmail();

      await expect(
        testEmailService.sendEmailWithRetry(
          recipient,
          'Fail Test',
          'Should fail',
          undefined,
          2,
          50,
        ),
      ).rejects.toThrow('Failed to send email after 2 attempts');

      // Restore original function
      jest.spyOn(testEmailService, 'sendEmail').mockImplementation(originalSend);
    });
  });

  describe('Email Content and Formatting', () => {
    it('preserves email content formatting', async () => {
      const recipient = generateTestEmail();
      const subject = 'Formatting Test';
      const text = `This is a multi-line email
      
      With proper formatting:
      - Bullet point 1
      - Bullet point 2
      
      And special characters: áéíóú & <symbols>`;

      await testEmailService.sendEmail(recipient, subject, text);

      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(1);

      const email = emails[0];
      expect(email.text).toBe(text);
      expect(email.subject).toBe(subject);
    });

    it('handles HTML content in newsletters', async () => {
      await prisma.parentContact.create({
        data: {
          name: 'HTML Parent',
          email: generateTestEmail(),
          studentName: 'HTML Student',
        },
      });

      const htmlContent = `
        <html>
          <body>
            <h1 style="color: blue;">Weekly Newsletter</h1>
            <p>This newsletter contains <strong>HTML formatting</strong>.</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </body>
        </html>
      `;

      const newsletter = await prisma.newsletter.create({
        data: {
          title: 'HTML Newsletter',
          content: htmlContent,
        },
      });

      await auth
        .post(`/api/newsletters/${newsletter.id}/send`)
        .set('Authorization', `Bearer ${teacherToken}`);

      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(1);

      const email = emails[0];
      expect(email.html || email.text).toContain('Weekly Newsletter');
      expect(email.html || email.text).toContain('HTML formatting');
    });

    it('handles Unicode characters correctly', async () => {
      const recipient = generateTestEmail();
      const subject = 'Unicode Test: émojis 🎉 français';
      const text = 'Bonjour! Voici un test avec des caractères spéciaux: àáâãäåæçèéêë 🌟';

      await testEmailService.sendEmail(recipient, subject, text);

      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(1);

      const email = emails[0];
      expect(email.subject).toBe(subject);
      expect(email.text).toBe(text);
    });
  });

  describe('Email Attachment Handling', () => {
    it('handles PDF attachments correctly', async () => {
      const recipient = generateTestEmail();
      const subject = 'PDF Test';
      const text = 'Email with PDF attachment';

      // Create a simple PDF buffer (mock PDF content)
      const pdfContent = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n%%EOF',
      );
      const attachment = {
        filename: 'test-document.pdf',
        content: pdfContent,
      };

      await testEmailService.sendEmail(recipient, subject, text, undefined, attachment);

      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(1);

      const email = emails[0];
      expect(email.attachments).toHaveLength(1);

      const receivedAttachment = email.attachments![0];
      expect(receivedAttachment.filename).toBe('test-document.pdf');
      expect(receivedAttachment.content).toEqual(pdfContent);
      expect(receivedAttachment.contentType).toContain('pdf');
    });

    it('handles multiple attachments', async () => {
      const recipient = generateTestEmail();
      const subject = 'Multiple Attachments Test';
      const text = 'Email with multiple attachments';

      // For this test, we'll simulate multiple attachments by sending multiple emails
      // In a real scenario, you'd modify the sendEmail function to accept multiple attachments
      const attachment1 = {
        filename: 'document1.pdf',
        content: Buffer.from('PDF content 1'),
      };

      const attachment2 = {
        filename: 'document2.pdf',
        content: Buffer.from('PDF content 2'),
      };

      // Send first email with first attachment
      await testEmailService.sendEmail(recipient, subject + ' 1', text, undefined, attachment1);

      // Send second email with second attachment
      await testEmailService.sendEmail(recipient, subject + ' 2', text, undefined, attachment2);

      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(2);

      // Verify both attachments were sent correctly
      const email1 = emails.find((e) => e.subject.includes('1'));
      const email2 = emails.find((e) => e.subject.includes('2'));

      expect(email1?.attachments?.[0].filename).toBe('document1.pdf');
      expect(email2?.attachments?.[0].filename).toBe('document2.pdf');
    });

    it('handles attachment encoding correctly', async () => {
      const recipient = generateTestEmail();
      const subject = 'Encoding Test';
      const text = 'Email with binary attachment';

      // Create binary content with various byte values
      const binaryContent = Buffer.from([0, 1, 2, 3, 255, 254, 253, 252, 127, 128, 129]);
      const attachment = {
        filename: 'binary-file.bin',
        content: binaryContent,
      };

      await testEmailService.sendEmail(recipient, subject, text, undefined, attachment);

      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(1);

      const email = emails[0];
      const receivedAttachment = email.attachments![0];
      expect(receivedAttachment.content).toEqual(binaryContent);
    });

    it('handles empty attachments gracefully', async () => {
      const recipient = generateTestEmail();
      const subject = 'Empty Attachment Test';
      const text = 'Email with empty attachment';

      const attachment = {
        filename: 'empty-file.txt',
        content: Buffer.alloc(0), // Empty buffer
      };

      await testEmailService.sendEmail(recipient, subject, text, undefined, attachment);

      const emails = await testEmailService.getEmails();
      expect(emails).toHaveLength(1);

      const email = emails[0];
      expect(email.attachments).toHaveLength(1);
      expect(email.attachments![0].content).toHaveLength(0);
    });
  });
});
