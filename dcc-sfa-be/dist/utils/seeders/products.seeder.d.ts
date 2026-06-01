/**
 * @fileoverview Products Seeder
 * @description Creates products for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockProduct {
    code: string;
    name: string;
    product_type: string | null;
    vat_percentage: number | null;
    weight_in_grams: number | null;
    volume_in_liters: number | null;
    category_name: string | null;
    flavour_name: string | null;
    volume_name: string | null;
    brand_name: string | null;
    shelf_life_name: string | null;
    sub_category_name: string | null;
    target_group_name: string | null;
    web_order_group_name: string | null;
    is_active: string;
}
declare const mockProducts: MockProduct[];
/**
 * Seed Products with mock data
 */
export declare function seedProducts(): Promise<void>;
/**
 * Clear Products data
 */
export declare function clearProducts(): Promise<void>;
export { mockProducts };
//# sourceMappingURL=products.seeder.d.ts.map