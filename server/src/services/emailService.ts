import nodemailer from 'nodemailer';

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

export async function sendEmail(to: string, subject: string, text: string) {
  if (!transporter) {
    console.log('Email:', { to, subject, text });
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to,
    subject,
    text,
  });
}
