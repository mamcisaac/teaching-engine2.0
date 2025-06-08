import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendEmail(to: string, subject: string, text: string) {
  if (!resend) return;
  await resend.emails.send({
    from: 'alerts@teachingengine.app',
    to,
    subject,
    text,
  });
}
