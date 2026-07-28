/**
 * @fileoverview Product Categories Seeder
 * @description Creates product categories for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockProductCategory {
    category_name: string;
    description?: string;
    is_active: string;
}
declare const mockProductCategories: MockProductCategory[];
/**
 * Seed Product Categories with mock data
 */
export declare function seedProductCategories(): Promise<void>;
/**
 * Clear Product Categories data
 */
export declare function clearProductCategories(): Promise<void>;
export { mockProductCategories };
//# sourceMappingURL=productCategories.seeder.d.ts.map