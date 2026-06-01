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
export declare const sendEmail: (emailData: EmailData) => Promise<boolean>;
export declare const sendBulkEmails: (emails: EmailData[]) => Promise<{
    success: number;
    failed: number;
}>;
export default sendEmail;
//# sourceMappingURL=mailer.d.ts.map