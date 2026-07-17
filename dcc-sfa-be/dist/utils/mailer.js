"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkEmails = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const prisma_client_1 = __importDefault(require("../configs/prisma.client"));
const getSMTPConfig = async (log_inst) => {
    try {
        let company = null;
        if (log_inst) {
            company = await prisma_client_1.default.companies.findFirst({
                where: {
                    log_inst: log_inst,
                    is_active: 'Y',
                },
                select: {
                    smtp_host: true,
                    smtp_port: true,
                    smtp_username: true,
                    smtp_password: true,
                    smtp_mail_from_address: true,
                    smtp_mail_from_name: true,
                },
            });
        }
        if (!company) {
            company = await prisma_client_1.default.companies.findFirst({
                where: { is_active: 'Y' },
                select: {
                    smtp_host: true,
                    smtp_port: true,
                    smtp_username: true,
                    smtp_password: true,
                    smtp_mail_from_address: true,
                    smtp_mail_from_name: true,
                },
                orderBy: { id: 'asc' },
            });
        }
        if (company?.smtp_host &&
            company?.smtp_port &&
            company?.smtp_username &&
            company?.smtp_password) {
            console.log('Using SMTP configuration from company table');
            return {
                host: company.smtp_host,
                port: company.smtp_port,
                username: company.smtp_username,
                password: company.smtp_password,
                fromAddress: company.smtp_mail_from_address ||
                    process.env.MAIL_FROM_ADDRESS ||
                    company.smtp_username,
                fromName: company.smtp_mail_from_name ||
                    process.env.MAIL_FROM_NAME ||
                    'DCC SFA System',
            };
        }
        console.log(' Using SMTP configuration from environment variables (company config incomplete)');
        return {
            host: process.env.MAIL_HOST || 'smtp-relay.sendinblue.com',
            port: parseInt(process.env.MAIL_PORT || '587'),
            username: process.env.MAIL_USERNAME || '',
            password: process.env.MAIL_PASSWORD || '',
            fromAddress: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || '',
            fromName: process.env.MAIL_FROM_NAME || 'DCC SFA System',
        };
    }
    catch (error) {
        console.error('Error fetching SMTP config from database, using env:', error);
        return {
            host: process.env.MAIL_HOST || 'smtp-relay.sendinblue.com',
            port: parseInt(process.env.MAIL_PORT || '587'),
            username: process.env.MAIL_USERNAME || '',
            password: process.env.MAIL_PASSWORD || '',
            fromAddress: process.env.MAIL_FROM_ADDRESS || process.env.MAIL_USERNAME || '',
            fromName: process.env.MAIL_FROM_NAME || 'DCC SFA System',
        };
    }
};
const createTransporter = async (log_inst) => {
    const config = await getSMTPConfig(log_inst);
    return nodemailer_1.default.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: {
            user: config.username,
            pass: config.password,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
};
const sendEmail = async (emailData) => {
    const { to, subject, html, cc, bcc, attachments, createdby, log_inst } = emailData;
    if (subject === '__SKIP_EMAIL__' || html === '__SKIP_EMAIL__') {
        console.log('Skipping email send as template was not found.');
        return false;
    }
    try {
        const config = await getSMTPConfig(log_inst);
        const transporter = await createTransporter(log_inst);
        console.log(' SMTP Configuration:');
        console.log('   SMTP Host:', config.host);
        console.log('   SMTP Port:', config.port);
        console.log('   SMTP User:', config.username);
        console.log('   FROM Address:', config.fromAddress);
        await transporter.verify();
        console.log('smtp connection verified');
        const info = await transporter.sendMail({
            from: `"${config.fromName}" <${config.fromAddress}>`,
            to: Array.isArray(to) ? to.join(', ') : to,
            cc: cc ? (Array.isArray(cc) ? cc.join(', ') : cc) : undefined,
            bcc: bcc ? (Array.isArray(bcc) ? bcc.join(', ') : bcc) : undefined,
            subject,
            html,
            attachments,
        });
        console.log(' Email sent successfully');
        console.log('  Message ID:', info.messageId);
        console.log('  From:', `"${config.fromName}" <${config.fromAddress}>`);
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