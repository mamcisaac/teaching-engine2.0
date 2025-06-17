import * as nodemailer from 'nodemailer';
import { EmailAttachment } from '../../src/services/emailService';
import { createEmailTestProvider, TestEmailProvider, InMemoryTestProvider } from './emailTestHelper';

export class TestEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private testProvider: TestEmailProvider;

  constructor() {
    this.testProvider = createEmailTestProvider();
    this.setupTransporter();
  }

  private setupTransporter() {
    if (this.testProvider instanceof InMemoryTestProvider) {
      // For in-memory provider, we'll intercept the send calls
      this.transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true,
      });
    } else {
      // For MailHog, use real SMTP
      this.transporter = nodemailer.createTransport({
        host: this.testProvider.host,
        port: this.testProvider.port,
        secure: false,
        auth: this.testProvider.user ? {
          user: this.testProvider.user,
          pass: this.testProvider.pass,
        } : undefined,
      });
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachment?: EmailAttachment
  ): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email transporter not configured');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      throw new Error(`Invalid email address: ${to}`);
    }

    if (this.testProvider instanceof InMemoryTestProvider) {
      // For in-memory testing, add directly to provider
      this.testProvider.addEmail({
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
        to: [to],
        subject,
        text,
        html,
        attachments: attachment ? [{
          filename: attachment.filename,
          content: attachment.content,
          contentType: 'application/pdf',
        }] : undefined,
      });
    } else {
      // For MailHog, send via SMTP
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'no-reply@example.com',
        to,
        subject,
        text,
        html,
        attachments: attachment ? [attachment] : undefined,
      });
    }
  }

  async sendBulkEmails(
    recipients: string[],
    subject: string,
    text: string,
    attachment?: EmailAttachment
  ): Promise<{ sent: number; failed: string[] }> {
    const failed: string[] = [];
    let sent = 0;

    for (const recipient of recipients) {
      try {
        await this.sendEmail(recipient, subject, text, undefined, attachment);
        sent++;
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        failed.push(recipient);
      }
    }

    return { sent, failed };
  }

  async sendEmailWithRetry(
    to: string,
    subject: string,
    text: string,
    attachment?: EmailAttachment,
    maxRetries = 3,
    retryDelay = 1000
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.sendEmail(to, subject, text, undefined, attachment);
        return; // Success
      } catch (error) {
        lastError = error as Error;
        console.warn(`Email send attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError?.message}`);
  }

  // Test helper methods
  async getTestProvider(): Promise<TestEmailProvider> {
    return this.testProvider;
  }

  async clearEmails(): Promise<void> {
    await this.testProvider.clearEmails();
  }

  async waitForEmail(to: string, timeout?: number) {
    return this.testProvider.waitForEmail(to, timeout);
  }

  async getEmails() {
    return this.testProvider.getEmails();
  }

  async close(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
    }
  }
}

// Global instance for tests
let testEmailService: TestEmailService | null = null;

export function getTestEmailService(): TestEmailService {
  if (!testEmailService) {
    testEmailService = new TestEmailService();
  }
  return testEmailService;
}

export async function resetTestEmailService(): Promise<void> {
  if (testEmailService) {
    await testEmailService.clearEmails();
    await testEmailService.close();
    testEmailService = null;
  }
}