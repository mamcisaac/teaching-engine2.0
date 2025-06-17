import nodemailer from 'nodemailer';
import logger from '../logger';

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
