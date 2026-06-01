/**
 * @fileoverview Customer Category Seeder
 * @description Creates customer categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockCustomerCategory {
    category_name: string;
    category_code: string;
    is_active: string;
}
declare const mockCustomerCategories: MockCustomerCategory[];
export declare function seedCustomerCategory(): Promise<void>;
export declare function clearCustomerCategory(): Promise<void>;
export { mockCustomerCategories };
//# sourceMappingURL=customerCategory.seeder.d.ts.map