import nodemailer from 'nodemailer';
import prisma from '../configs/prisma.client';

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
  const port = parseInt(process.env.SMTP_PORT || '587');

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USERNAME,
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

    console.log('  SMTP Host:', process.env.SMTP_HOST);
    console.log('  SMTP Port:', process.env.SMTP_PORT);
    console.log('  SMTP User:', process.env.SMTP_USERNAME);
    await transporter.verify();
    console.log(' SMTP connection verified');

    const info = await transporter.sendMail({
      from: `"SFA System" <${process.env.SMTP_USERNAME}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
      bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
      subject,
      html,
      attachments,
    });

    console.log(' Email sent successfully');
    console.log('  Message ID:', info.messageId);
    console.log('  To:', to);
    console.log('  Subject:', subject);

    return true;
  } catch (error: any) {
    console.error(' Email sending failed:', error.message);
    console.error('  Full error:', error);
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

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(
    ` Bulk email sending complete: ${success} sent, ${failed} failed`
  );

  return { success, failed };
};

export default sendEmail;
