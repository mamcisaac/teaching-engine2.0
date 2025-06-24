// Stub for EmailService to fix missing import
export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

let customEmailHandler:
  | ((
      to: string,
      subject: string,
      text: string,
      html?: string,
      attachment?: EmailAttachment,
    ) => Promise<void>)
  | null = null;

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

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string,
  attachment?: EmailAttachment,
): Promise<void> {
  if (customEmailHandler) {
    return customEmailHandler(to, subject, text, html, attachment);
  }

  // Stub implementation
  console.log(`Email stub: Would send email to ${to} with subject: ${subject}`);
}

export class EmailService {
  constructor() {}

  async sendEmail(to: string, _subject: string, _body: string): Promise<void> {
    // Stub implementation
    console.log(`Email stub: Would send email to ${to} with subject: ${_subject}`);
  }

  async sendBulkEmails(recipients: string[], _subject: string, _body: string): Promise<void> {
    // Stub implementation
    console.log(`Email stub: Would send bulk emails to ${recipients.length} recipients`);
  }
}

// Export singleton instance
export const emailService = new EmailService();
