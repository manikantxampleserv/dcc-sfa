/**
 * @fileoverview Warehouses Seeder
 * @description Creates 11 sample warehouses for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockWarehouse {
    name: string;
    type?: string;
    location?: string;
    is_active: string;
}
declare const mockWarehouses: MockWarehouse[];
/**
 * Seed Warehouses with mock data
 */
export declare function seedWarehouses(): Promise<void>;
/**
 * Clear Warehouses data
 */
export declare function clearWarehouses(): Promise<void>;
export { mockWarehouses };
//# sourceMappingURL=warehouses.seeder.d.ts.map