"use strict";
// import nodemailer from 'nodemailer';
// import prisma from '../configs/prisma.client';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkEmails = exports.sendEmail = void 0;
// interface EmailData {
//   to: string | string[];
//   subject: string;
//   html: string;
//   cc?: string | string[];
//   bcc?: string | string[];
//   attachments?: Array<{
//     filename: string;
//     path?: string;
//     content?: Buffer | string;
//   }>;
//   createdby?: number;
//   log_inst?: number;
// }
// const createTransporter = () => {
//   const port = parseInt(process.env.SMTP_PORT || '587');
//   return nodemailer.createTransport({
//     host: process.env.SMTP_HOST || 'smtp.gmail.com',
//     port: port,
//     secure: port === 465,
//     auth: {
//       user: process.env.SMTP_USERNAME,
//       pass: process.env.SMTP_PASSWORD,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });
// };
// export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
//   const { to, subject, html, cc, bcc, attachments, createdby, log_inst } =
//     emailData;
//   try {
//     const transporter = createTransporter();
//     console.log('  SMTP Host:', process.env.SMTP_HOST);
//     console.log('  SMTP Port:', process.env.SMTP_PORT);
//     console.log('  SMTP User:', process.env.SMTP_USERNAME);
//     await transporter.verify();
//     console.log(' SMTP connection verified');
//     const info = await transporter.sendMail({
//       from: `"SFA System" <${process.env.SMTP_USERNAME}>`,
//       to: Array.isArray(to) ? to.join(', ') : to,
//       cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
//       bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
//       subject,
//       html,
//       attachments,
//     });
//     console.log(' Email sent successfully');
//     console.log('  Message ID:', info.messageId);
//     console.log('  To:', to);
//     console.log('  Subject:', subject);
//     return true;
//   } catch (error: any) {
//     console.error(' Email sending failed:', error.message);
//     console.error('  Full error:', error);
//     return false;
//   }
// };
// export const sendBulkEmails = async (
//   emails: EmailData[]
// ): Promise<{ success: number; failed: number }> => {
//   let success = 0;
//   let failed = 0;
//   for (const email of emails) {
//     const result = await sendEmail(email);
//     if (result) {
//       success++;
//     } else {
//       failed++;
//     }
//     await new Promise(resolve => setTimeout(resolve, 2000));
//   }
//   console.log(
//     ` Bulk email sending complete: ${success} sent, ${failed} failed`
//   );
//   return { success, failed };
// };
// export default sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const createTransporter = () => {
    const port = parseInt(process.env.MAIL_PORT || '587');
    return nodemailer_1.default.createTransport({
        host: process.env.MAIL_HOST || 'smtp-relay.sendinblue.com',
        port: port,
        secure: port === 465,
        auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
};
const sendEmail = async (emailData) => {
    const { to, subject, html, cc, bcc, attachments, createdby, log_inst } = emailData;
    try {
        const transporter = createTransporter();
        console.log(' SMTP Host:', process.env.MAIL_HOST);
        console.log(' SMTP Port:', process.env.MAIL_PORT);
        console.log(' SMTP User:', process.env.MAIL_USERNAME);
        console.log(' FROM Address:', process.env.MAIL_FROM_ADDRESS);
        await transporter.verify();
        console.log(' SMTP connection verified');
        const info = await transporter.sendMail({
            from: `"${process.env.MAIL_FROM_NAME || 'DCC SFA System'}" <${process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
            bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
            subject,
            html,
            attachments,
        });
        console.log(' Email sent successfully');
        console.log('  Message ID:', info.messageId);
        console.log('  From:', `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`);
        console.log('  To:', to);
        console.log('  Subject:', subject);
        return true;
    }
    catch (error) {
        console.error(' Email sending failed:', error.message);
        console.error('  Full error:', error);
        return false;
    }
};
exports.sendEmail = sendEmail;
const sendBulkEmails = async (emails) => {
    let success = 0;
    let failed = 0;
    for (const email of emails) {
        const result = await (0, exports.sendEmail)(email);
        if (result) {
            success++;
        }
        else {
            failed++;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log(` Bulk email sending complete: ${success} sent, ${failed} failed`);
    return { success, failed };
};
exports.sendBulkEmails = sendBulkEmails;
exports.default = exports.sendEmail;
//# sourceMappingURL=mailer.js.map