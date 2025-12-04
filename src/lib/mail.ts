import nodemailer from 'nodemailer';
import { requireEnv } from '@/lib/env';

// Lazy initialization to avoid build-time environment variable validation
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    const SMTP_HOST = requireEnv('SMTP_HOST');
    const SMTP_PORT = Number(requireEnv('SMTP_PORT'));
    const SMTP_SECURE = (process.env.SMTP_SECURE || 'false') === 'true';
    const SMTP_USER = requireEnv('SMTP_USER');
    const SMTP_PASSWORD = requireEnv('SMTP_PASSWORD');

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const SMTP_FROM_EMAIL = requireEnv('SMTP_FROM_EMAIL');
  const NEXTAUTH_URL = requireEnv('NEXTAUTH_URL');
  const resetUrl = `${NEXTAUTH_URL}/reset-password?token=${token}`;

  try {
    await getTransporter().sendMail({
      from: SMTP_FROM_EMAIL,
      to: email,
      subject: 'Reset your password',
      html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
    });
  } catch (err) {
    console.error('Error sending password reset email', err);
    throw err;
  }
};
