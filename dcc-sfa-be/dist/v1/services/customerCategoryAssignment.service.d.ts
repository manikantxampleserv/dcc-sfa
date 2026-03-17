export declare class CustomerCategoryAssignmentService {
    private calculateCustomerSales;
    private getCategoryLevels;
    private determineCategory;
    assignCustomerCategories(): Promise<{
        totalProcessed: number;
        totalUpdated: number;
        totalUnchanged: number;
        totalFailed: number;
        details: any[];
    }>;
    assignSingleCustomerCategory(customerId: number): Promise<any>;
}
declare const _default: CustomerCategoryAssignmentService;
export default _default;
//# sourceMappingURL=customerCategoryAssignment.service.d.ts.map