import { randomBytes } from 'crypto';

export interface TestEmailProvider {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  getEmails(): Promise<EmailMessage[]>;
  clearEmails(): Promise<void>;
  waitForEmail(to: string, timeout?: number): Promise<EmailMessage>;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
  createdAt: Date;
}

export class MailHogTestProvider implements TestEmailProvider {
  host = 'localhost';
  port = 1025; // SMTP port
  private httpPort = 8025; // HTTP API port

  async getEmails(): Promise<EmailMessage[]> {
    try {
      const response = await fetch(`http://localhost:${this.httpPort}/api/v2/messages`);
      if (!response.ok) {
        throw new Error(`MailHog API responded with ${response.status}`);
      }
      
      const data = await response.json();
      return data.items?.map(this.parseMailHogMessage) || [];
    } catch (error) {
      if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
        throw new Error('MailHog server not running. Start with: docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog');
      }
      throw error;
    }
  }

  async clearEmails(): Promise<void> {
    try {
      const response = await fetch(`http://localhost:${this.httpPort}/api/v1/messages`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Failed to clear emails: ${response.status}`);
      }
    } catch (error) {
      console.warn('Failed to clear MailHog emails:', error);
    }
  }

  async waitForEmail(to: string, timeout = 10000): Promise<EmailMessage> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const emails = await this.getEmails();
      const targetEmail = emails.find(email => 
        email.to.some(recipient => recipient.toLowerCase() === to.toLowerCase())
      );
      
      if (targetEmail) {
        return targetEmail;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    throw new Error(`No email received for ${to} within ${timeout}ms`);
  }

  private parseMailHogMessage(msg: { ID: string; Content: { Headers: Record<string, string[]>; Body: string; MIME?: { Parts: unknown[] } }; Created: string }): EmailMessage {
    const content = msg.Content;
    const headers = content.Headers;
    
    return {
      id: msg.ID,
      from: this.parseEmailAddress(headers.From?.[0] || ''),
      to: (headers.To || []).map(this.parseEmailAddress),
      subject: headers.Subject?.[0] || '',
      text: content.Body || '',
      html: content.MIME?.Parts?.find((part: unknown) => (part as { Headers: Record<string, string[]> }).Headers['Content-Type']?.[0]?.includes('text/html'))?.Body,
      attachments: this.parseAttachments(content.MIME?.Parts || []),
      createdAt: new Date(msg.Created),
    };
  }

  private parseEmailAddress(addr: string): string {
    // Extract email from "Name <email@domain.com>" format
    const match = addr.match(/<([^>]+)>/);
    return match ? match[1] : addr;
  }

  private parseAttachments(parts: { Headers: Record<string, string[]>; Body: string }[]): EmailMessage['attachments'] {
    return parts
      .filter(part => part.Headers['Content-Disposition']?.[0]?.includes('attachment'))
      .map(part => ({
        filename: this.extractFilename(part.Headers['Content-Disposition'][0]),
        content: Buffer.from(part.Body, 'base64'),
        contentType: part.Headers['Content-Type']?.[0] || 'application/octet-stream',
      }));
  }

  private extractFilename(contentDisposition: string): string {
    const match = contentDisposition.match(/filename="([^"]+)"/);
    return match ? match[1] : 'attachment';
  }
}

// In-memory test provider for CI environments
export class InMemoryTestProvider implements TestEmailProvider {
  host = 'localhost';
  port = 587;
  private emails: EmailMessage[] = [];

  async getEmails(): Promise<EmailMessage[]> {
    return [...this.emails];
  }

  async clearEmails(): Promise<void> {
    this.emails = [];
  }

  async waitForEmail(to: string, timeout = 5000): Promise<EmailMessage> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const targetEmail = this.emails.find(email => 
        email.to.some(recipient => recipient.toLowerCase() === to.toLowerCase())
      );
      
      if (targetEmail) {
        return targetEmail;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error(`No email received for ${to} within ${timeout}ms`);
  }

  // This method would be called by a mock email service
  addEmail(email: Omit<EmailMessage, 'id' | 'createdAt'>): void {
    this.emails.push({
      ...email,
      id: randomBytes(8).toString('hex'),
      createdAt: new Date(),
    });
  }
}

// Factory function to create appropriate test provider
export function createEmailTestProvider(): TestEmailProvider {
  // Always use in-memory provider for tests
  if (process.env.NODE_ENV === 'test') {
    return new InMemoryTestProvider();
  }
  // Use MailHog only in development when explicitly enabled
  if (process.env.USE_MAILHOG === 'true') {
    return new MailHogTestProvider();
  }
  return new InMemoryTestProvider();
}

// Utility functions for email testing
export function generateTestEmail(domain = 'test.example.com'): string {
  const id = randomBytes(4).toString('hex');
  return `test-${id}@${domain}`;
}

export function expectEmailContent(email: EmailMessage, expectedContent: Partial<EmailMessage>): void {
  if (expectedContent.subject) {
    expect(email.subject).toContain(expectedContent.subject);
  }
  if (expectedContent.text) {
    expect(email.text).toContain(expectedContent.text);
  }
  if (expectedContent.html) {
    expect(email.html).toContain(expectedContent.html);
  }
  if (expectedContent.from) {
    expect(email.from).toBe(expectedContent.from);
  }
  if (expectedContent.to) {
    expectedContent.to.forEach(recipient => {
      expect(email.to).toContain(recipient);
    });
  }
}