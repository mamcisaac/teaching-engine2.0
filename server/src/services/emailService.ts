import nodemailer from 'nodemailer';
import logger from '../logger';
import { prisma } from '../prisma';

let transporter: nodemailer.Transporter | null = null;

if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export interface BulkEmailRecipient {
  email: string;
  name: string;
}

export interface EmailDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ParentEmailData {
  parentMessageId?: number;
  parentSummaryId?: number;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  language: string;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

// Allow overriding email handler for testing
type EmailHandler = (
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachment?: EmailAttachment,
) => Promise<void>;

let customEmailHandler: EmailHandler | null = null;

export function setEmailHandler(handler: EmailHandler) {
  customEmailHandler = handler;
}

export function clearEmailHandler() {
  customEmailHandler = null;
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  htmlOrAttachment?: string | EmailAttachment,
  attachment?: EmailAttachment,
) {
  // Handle overloaded parameters
  let html: string | undefined;
  let actualAttachment: EmailAttachment | undefined;

  if (typeof htmlOrAttachment === 'string') {
    html = htmlOrAttachment;
    actualAttachment = attachment;
  } else {
    actualAttachment = htmlOrAttachment;
  }

  // Use custom handler if set (for testing)
  if (customEmailHandler) {
    await customEmailHandler(to, subject, text, html, actualAttachment);
    return;
  }

  if (process.env.SENDGRID_API_KEY) {
    const content = [{ type: 'text/plain', value: text }];
    if (html) {
      content.push({ type: 'text/html', value: html });
    }

    const body: Record<string, unknown> = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.EMAIL_FROM || 'no-reply@example.com' },
      subject,
      content,
    };
    if (actualAttachment) {
      body.attachments = [
        {
          content: actualAttachment.content.toString('base64'),
          filename: actualAttachment.filename,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ];
    }
    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    return;
  }
  if (!transporter) {
    logger.info({ to, subject, text, html, attachment: !!actualAttachment }, 'Email');
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    html,
    attachments: actualAttachment ? [actualAttachment] : undefined,
  });
}

export async function sendBulkEmails(
  recipients: BulkEmailRecipient[],
  subject: string,
  htmlContent: string,
  textContent?: string,
): Promise<EmailDeliveryResult[]> {
  const results: EmailDeliveryResult[] = [];
  
  if (process.env.SENDGRID_API_KEY) {
    // Use SendGrid bulk send
    const personalizations = recipients.map(recipient => ({
      to: [{ email: recipient.email, name: recipient.name }],
    }));

    const content = [{ type: 'text/plain', value: textContent || stripHtml(htmlContent) }];
    if (htmlContent) {
      content.push({ type: 'text/html', value: htmlContent });
    }

    const body = {
      personalizations,
      from: { email: process.env.EMAIL_FROM || 'no-reply@teachingengine.ca' },
      subject,
      content,
    };

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const messageId = response.headers.get('x-message-id');
        recipients.forEach(() => {
          results.push({
            success: true,
            messageId: messageId || `sg-${Date.now()}`,
          });
        });
      } else {
        const errorText = await response.text();
        recipients.forEach(() => {
          results.push({
            success: false,
            error: `SendGrid error: ${response.status} - ${errorText}`,
          });
        });
      }
    } catch (error: unknown) {
      recipients.forEach(() => {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Network error',
        });
      });
    }
  } else {
    // Fallback to individual sends or mock
    for (const recipient of recipients) {
      try {
        await sendEmail(recipient.email, subject, textContent || stripHtml(htmlContent), htmlContent);
        results.push({
          success: true,
          messageId: `mock-${Date.now()}-${Math.random()}`,
        });
      } catch (error: unknown) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Send failed',
        });
      }
    }
  }

  return results;
}

export async function sendParentMessage(
  parentMessageId: number,
  recipients: BulkEmailRecipient[],
  language: 'en' | 'fr' = 'en',
): Promise<void> {
  try {
    // Get the parent message
    const parentMessage = await prisma.parentMessage.findUnique({
      where: { id: parentMessageId },
    });

    if (!parentMessage) {
      throw new Error('Parent message not found');
    }

    const content = language === 'fr' ? parentMessage.contentFr : parentMessage.contentEn;
    const subject = `${parentMessage.title} - ${parentMessage.timeframe}`;

    // Send bulk emails
    const results = await sendBulkEmails(recipients, subject, content);

    // Record delivery attempts
    const deliveryRecords = recipients.map((recipient, index) => ({
      parentMessageId,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      subject,
      content,
      language,
      status: results[index].success ? 'sent' : 'failed',
      providerId: results[index].messageId,
      sentAt: results[index].success ? new Date() : null,
      failureReason: results[index].error,
    }));

    await prisma.emailDelivery.createMany({
      data: deliveryRecords,
    });

    logger.info(`📧 Sent parent message ${parentMessageId} to ${recipients.length} recipients`);
  } catch (error: unknown) {
    logger.error(`❌ Failed to send parent message ${parentMessageId}:`, error);
    throw error;
  }
}

export async function sendParentSummary(
  parentSummaryId: number,
  recipients: BulkEmailRecipient[],
  language: 'en' | 'fr' = 'en',
): Promise<void> {
  try {
    // Get the parent summary
    const parentSummary = await prisma.parentSummary.findUnique({
      where: { id: parentSummaryId },
      include: {
        student: true,
      },
    });

    if (!parentSummary) {
      throw new Error('Parent summary not found');
    }

    const content = language === 'fr' ? parentSummary.contentFr : parentSummary.contentEn;
    const subject = `Student Progress Summary - ${parentSummary.student.firstName} ${parentSummary.student.lastName}`;

    // Send bulk emails
    const results = await sendBulkEmails(recipients, subject, content);

    // Record delivery attempts
    const deliveryRecords = recipients.map((recipient, index) => ({
      parentSummaryId,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
      subject,
      content,
      language,
      status: results[index].success ? 'sent' : 'failed',
      providerId: results[index].messageId,
      sentAt: results[index].success ? new Date() : null,
      failureReason: results[index].error,
    }));

    await prisma.emailDelivery.createMany({
      data: deliveryRecords,
    });

    logger.info(`📧 Sent parent summary ${parentSummaryId} to ${recipients.length} recipients`);
  } catch (error: unknown) {
    logger.error(`❌ Failed to send parent summary ${parentSummaryId}:`, error);
    throw error;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}