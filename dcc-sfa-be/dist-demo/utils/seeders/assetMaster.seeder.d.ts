/**
 * @fileoverview Asset Master Seeder
 * @description Creates 11 sample assets for testing and development
 * @author DCC-SFA Team
 * @version 1.0.0
 */
interface MockAsset {
    asset_type_name: string;
    serial_number: string;
    purchase_date?: Date;
    warranty_expiry?: Date;
    current_location?: string;
    current_status?: string;
    assigned_to?: string;
    is_active: string;
}
declare const mockAssets: MockAsset[];
/**
 * Seed Asset Master with mock data
 */
export declare function seedAssetMaster(): Promise<void>;
/**
 * Clear Asset Master data
 */
export declare function clearAssetMaster(): Promise<void>;
export { mockAssets };
//# sourceMappingURL=assetMaster.seeder.d.ts.map