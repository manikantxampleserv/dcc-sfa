export declare const ensureTemplateExists: () => Promise<void>;
/**
 * Checks whether today is the last day of the current calendar month.
 */
export declare const isLastDayOfMonth: (date?: Date) => boolean;
/**
 * Builds HTML table for active users to embed into email body.
 */
export declare const buildUsersTableHtml: (users: any[]) => string;
/**
 * Generates an Excel workbook buffer listing active users.
 */
export declare const generateUsersExcelBuffer: (users: any[], companyName: string, monthYear: string) => Promise<Buffer>;
/**
 * Core function to send active users summary to client/companies.
 * Can be run for all companies or an individual company.
 */
export declare const sendMonthlyActiveUsersEmail: (targetCompanyId?: number) => Promise<{
    success: number;
    failed: number;
}>;
/**
 * Initializes the cron task for month-end dispatch.
 * Checks at 23:50 on days 28-31 of every month, executing on the final day.
 */
export declare const scheduleMonthlyActiveUsersReport: () => void;
//# sourceMappingURL=monthlyActiveUsersReport.job.d.ts.map