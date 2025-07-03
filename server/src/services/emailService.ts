import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import logger from '../logger';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

interface SMTPConfig {
  host: string;
  port: number;
  auth?: {
    user: string;
    pass: string;
  };
}

interface SendGridEmailBody {
  personalizations: [{ to: [{ email: string }] }];
  from: { email: string };
  subject: string;
  content: Array<{ type: string; value: string }>;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

interface SMTPMailOptions {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
}

// Custom email handler for testing
let customEmailHandler:
  | ((
      to: string,
      subject: string,
      text: string,
      html?: string,
      attachment?: EmailAttachment,
    ) => Promise<void>)
  | null = null;

// SMTP transporter instance
let transporter: Transporter | null = null;

// Initialize SMTP transporter if configured
function initializeTransporter() {
  if (process.env.SMTP_HOST) {
    const transporterConfig: SMTPConfig = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
    };

    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporterConfig.auth = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      };
    }

    transporter = nodemailer.createTransport(transporterConfig);
  } else {
    transporter = null;
  }
}

// Initialize on module load
initializeTransporter();

export function setEmailHandler(
  handler: (
    to: string,
    subject: string,
    text: string,
    html?: string,
    attachment?: EmailAttachment,
  ) => Promise<void>,
) {
  customEmailHandler = handler;
}

export function clearEmailHandler() {
  customEmailHandler = null;
}

// Function to reinitialize transporter (useful for tests)
export function reinitializeTransporter() {
  initializeTransporter();
}

// Function to get current transporter (useful for tests)
export function getTransporter(): Transporter | null {
  return transporter;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachment?: EmailAttachment,
): Promise<void> {
  // Use custom handler if set (for testing)
  if (customEmailHandler) {
    return customEmailHandler(to, subject, text, html, attachment);
  }

  const from = process.env.EMAIL_FROM || 'no-reply@example.com';

  // SendGrid implementation
  if (process.env.SENDGRID_API_KEY) {
    try {
      const body: SendGridEmailBody = {
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: 'text/plain', value: text }],
      };

      if (html) {
        body.content.push({ type: 'text/html', value: html });
      }

      if (attachment) {
        body.attachments = [
          {
            content: attachment.content.toString('base64'),
            filename: attachment.filename,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ];
      }

      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`SendGrid API error: ${response.status}`);
      }

      logger.info(`Email sent via SendGrid to ${to}`);
      return;
    } catch (error) {
      logger.error('SendGrid email error:', error);
      throw error;
    }
  }

  // SMTP implementation
  if (transporter) {
    try {
      const mailOptions: SMTPMailOptions = {
        from,
        to,
        subject,
        text,
      };

      if (html) {
        mailOptions.html = html;
      }

      if (attachment) {
        mailOptions.attachments = [attachment];
      }

      await transporter.sendMail(mailOptions);
      logger.info(`Email sent via SMTP to ${to}`);
      return;
    } catch (error) {
      logger.error('SMTP email error:', error);
      throw error;
    }
  }

  // Fallback: just log the email
  logger.info(`Email service not configured. Would send email to ${to}`);
  logger.info(`Subject: ${subject}`);
  logger.info(`Text: ${text}`);
  if (html) {
    logger.info(`HTML content provided`);
  }
  if (attachment) {
    logger.info(`Attachment: ${attachment.filename}`);
  }
}

export class EmailService {
  async sendEmail(to: string, subject: string, body: string, html?: string): Promise<void> {
    await sendEmail(to, subject, body, html);
  }

  async sendBulkEmails(
    recipients: string[],
    subject: string,
    body: string,
    html?: string,
  ): Promise<void> {
    // Send emails in parallel with rate limiting
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      await Promise.all(batch.map((to) => sendEmail(to, subject, body, html)));

      // Small delay between batches to avoid rate limits
      if (i + batchSize < recipients.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
