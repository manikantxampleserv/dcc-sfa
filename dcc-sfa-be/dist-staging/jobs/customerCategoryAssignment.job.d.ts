export declare const runCustomerCategoryAssignment: () => Promise<{
    skipped: boolean;
} | {
    duration: number;
    totalProcessed: number;
    totalUpdated: number;
    totalUnchanged: number;
    totalFailed: number;
    skipped?: undefined;
} | undefined>;
export declare const scheduleCustomerCategoryAssignment: () => Promise<void>;
export declare function assignLowestCategoryToUncategorizedCustomers(): Promise<{
    updated: number;
    failed: number;
} | undefined>;
//# sourceMappingURL=customerCategoryAssignment.job.d.ts.map