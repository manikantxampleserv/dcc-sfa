export interface CategoryCondition {
    id: number;
    condition_type: string;
    condition_operator: string;
    threshold_value: number;
    min_threshold_value?: number | null;
    max_threshold_value?: number | null;
    product_category_id?: number | null;
}
export interface CategoryLevel {
    id: number;
    categoryName: string;
    level: number;
    logical_condition: string;
    conditions: CategoryCondition[];
}
export interface CustomerMetrics {
    totalSales: number;
    orderCount: number;
    averageOrderValue: number;
    categorySales?: Map<number, number>;
}
export declare function evaluateConditionRule(actualValue: number, condition: CategoryCondition): boolean;
export declare function matchesCategory(category: CategoryLevel, metrics: CustomerMetrics): boolean;
export declare class CustomerCategoryAssignmentService {
    calculateCustomerMetrics(customerId: number): Promise<CustomerMetrics>;
    getCategoryLevels(): Promise<CategoryLevel[]>;
    determineCategory(metrics: CustomerMetrics, categoryLevels: CategoryLevel[]): CategoryLevel | null;
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