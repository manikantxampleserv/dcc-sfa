/**
 * @fileoverview Product Sub Categories Seeder
 * @description Creates product sub categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockProductSubCategory {
    sub_category_name: string;
    category_name: string;
    description?: string;
    is_active: string;
}
declare const mockProductSubCategories: MockProductSubCategory[];
/**
 * Seed Product Sub Categories with mock data
 */
export declare function seedProductSubCategories(): Promise<void>;
/**
 * Clear Product Sub Categories data
 */
export declare function clearProductSubCategories(): Promise<void>;
export { mockProductSubCategories };
//# sourceMappingURL=productSubCategories.seeder.d.ts.map