import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
  }>;
  createdby?: number;
  log_inst?: number;
}

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  const { to, subject, html, cc, bcc, attachments, createdby, log_inst } =
    emailData;

  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('SMTP connection verified');

    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'SFA System'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
      subject,
      html,
      attachments,
    });

    console.log('Email sent successfully');
    console.log('Message ID:', info.messageId);
    console.log('To:', to);
    console.log('Subject:', subject);

    return true;
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return false;
  }
};

export const sendBulkEmails = async (
  emails: EmailData[]
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const email of emails) {
    const result = await sendEmail(email);
    if (result) {
      success++;
    } else {
      failed++;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`Bulk email sending complete: ${success} sent, ${failed} failed`);

  return { success, failed };
};

export default sendEmail;
