/**
 * @fileoverview Brands Seeder
 * @description Creates brands for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockBrand {
    name: string;
    code: string;
    description?: string;
    logo?: string;
    is_active: string;
}
declare const mockBrands: MockBrand[];
/**
 * Seed Brands with mock data
 */
export declare function seedBrands(): Promise<void>;
/**
 * Clear Brands data
 */
export declare function clearBrands(): Promise<void>;
export { mockBrands };
//# sourceMappingURL=brands.seeder.d.ts.map