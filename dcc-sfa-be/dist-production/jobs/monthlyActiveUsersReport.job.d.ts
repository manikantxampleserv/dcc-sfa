export declare const HARDCODED_REPORT_TO = "ashok.kumar@ampleserv.com";
export declare const HARDCODED_REPORT_CC = "anil.kumar@ampleserv.com, shivrawat2002@gmail.com";
export declare const ensureTemplateExists: () => Promise<void>;
export declare const isLastDayOfMonth: (date?: Date) => boolean;
export declare const buildUsersTableHtml: (users: any[]) => string;
export declare const generateUsersExcelBuffer: (users: any[], companyName: string, monthYear: string) => Promise<Buffer>;
export declare const generateUsersPdfBuffer: (users: any[], companyName: string, monthYear: string, stats?: {
    totalActive?: number;
    loggedInThisMonth?: number;
}) => Promise<Buffer>;
export declare const sendMonthlyActiveUsersEmail: (targetCompanyId?: number, options?: {
    targetEmail?: string;
    onlyLoggedInThisMonth?: boolean;
}) => Promise<{
    success: number;
    failed: number;
}>;
export declare const scheduleMonthlyActiveUsersReport: () => void;
//# sourceMappingURL=monthlyActiveUsersReport.job.d.ts.map