import nodemailer from 'nodemailer';
import { requireEnv } from '@/lib/env';
import { prisma } from '@/lib/prisma';

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const NEXTAUTH_URL = requireEnv('NEXTAUTH_URL');
  const resetUrl = `${NEXTAUTH_URL}/reset-password?token=${token}`;

  const settings = await prisma.settings.findFirst();

  if (!settings || !settings.smtpHost) {
    console.error('SMTP settings not configured');
    throw new Error('SMTP settings not configured');
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpSecure,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: settings.smtpFromEmail || settings.smtpUser,
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
