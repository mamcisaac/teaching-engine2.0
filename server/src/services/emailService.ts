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

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  attachment?: EmailAttachment,
) {
  if (process.env.SENDGRID_API_KEY) {
    const body: Record<string, unknown> = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: process.env.EMAIL_FROM || 'no-reply@example.com' },
      subject,
      content: [{ type: 'text/plain', value: text }],
    };
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
    logger.info({ to, subject, text, attachment: !!attachment }, 'Email');
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
    attachments: attachment ? [attachment] : undefined,
  });
}
