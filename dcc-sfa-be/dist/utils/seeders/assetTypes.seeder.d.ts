/**
 * @fileoverview Asset Types Seeder
 * @description Creates 11 sample asset types for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockAssetType {
    name: string;
    description?: string;
    category?: string;
    brand?: string;
    is_active: string;
}
declare const mockAssetTypes: MockAssetType[];
/**
 * Seed Asset Types with mock data
 */
export declare function seedAssetTypes(): Promise<void>;
/**
 * Clear Asset Types data
 */
export declare function clearAssetTypes(): Promise<void>;
export { mockAssetTypes };
//# sourceMappingURL=assetTypes.seeder.d.ts.map